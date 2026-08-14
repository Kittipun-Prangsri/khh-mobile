/**
 * HOSxP to Supabase Daily Sync & Offline Fallback Service
 * Supports automatic daily data syncing from HOSxP MySQL to Supabase PostgreSQL,
 * with Superadmin configurable schedule and automatic fallback when HOSxP LAN is unreachable.
 */

import { getHosxpPool } from './hosxpClient';
import { getSupabaseAdminClient, isSupabaseConfigured } from './supabaseClient';
import { getHosxpCacheDirect, setHosxpCache } from './hosxpCache';

export interface SyncConfig {
  daily_sync_time: string; // e.g. "02:00"
  auto_sync_enabled: boolean;
  last_synced_at: string | null;
  synced_count: number;
  status: 'idle' | 'syncing' | 'success' | 'error';
  error_message?: string;
}

const DEFAULT_SYNC_CONFIG: SyncConfig = {
  daily_sync_time: '02:00',
  auto_sync_enabled: true,
  last_synced_at: null,
  synced_count: 0,
  status: 'idle',
};

// In-memory config fallback
let memorySyncConfig: SyncConfig = { ...DEFAULT_SYNC_CONFIG };

/**
 * Get Current Superadmin Sync Configuration
 */
export async function getSyncConfig(): Promise<SyncConfig> {
  if (!isSupabaseConfigured()) return memorySyncConfig;

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('hosxp_sync_config')
      .select('value')
      .eq('key', 'daily_sync_schedule')
      .single();

    if (error || !data) return memorySyncConfig;
    return data.value as SyncConfig;
  } catch (err) {
    console.warn('⚠️ Error fetching sync config from Supabase:', err);
    return memorySyncConfig;
  }
}

/**
 * Update Superadmin Sync Configuration (Daily Sync Time, Auto-Sync Switch)
 */
export async function updateSyncConfig(updates: Partial<SyncConfig>): Promise<SyncConfig> {
  const current = await getSyncConfig();
  const updated: SyncConfig = { ...current, ...updates };
  memorySyncConfig = updated;

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();
      await supabase.from('hosxp_sync_config').upsert({
        key: 'daily_sync_schedule',
        value: updated,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('❌ Error updating sync config in Supabase:', err);
    }
  }
  return updated;
}

/**
 * Execute Full Data Sync: HOSxP Direct MySQL ➔ Supabase Cache Tables
 */
export async function syncHosxpToSupabase(): Promise<{ success: boolean; syncedPatientsCount: number; syncedAppointmentsCount: number; error?: string }> {
  console.log('🔄 Starting HOSxP -> Supabase Data Sync process...');
  await updateSyncConfig({ status: 'syncing', error_message: undefined });

  try {
    const pool = getHosxpPool();

    // 1. Fetch NCD Registry Patients & Vitals from HOSxP MySQL
    const [patientRows]: any = await pool.execute(`
      SELECT DISTINCT 
             p.hn,
             CONVERT(CONCAT(COALESCE(p.pname,''), COALESCE(p.fname,''), ' ', COALESCE(p.lname,'')) USING utf8mb4) AS patient_name,
             p.cid, p.birthday, p.sex,
             COALESCE(p.mobile_phone_number, p.hometel, p.informtel) AS phone,
             CONVERT(p.informaddr USING utf8mb4) AS informaddr,
             cm.clinic,
             CONVERT(c.name USING utf8mb4) AS clinic_name,
             cm.regdate,
             s.vstdate AS last_vstdate, s.bps, s.bpd, s.fbs, s.bw, s.height, s.bmi, s.pulse, v.pdx,
             app.nextdate, app.nexttime
      FROM patient p
      INNER JOIN clinicmember cm ON p.hn = cm.hn
      LEFT JOIN clinic c ON cm.clinic = c.clinic
      LEFT JOIN (
        SELECT s1.hn, s1.vstdate, s1.bps, s1.bpd, s1.fbs, s1.bw, s1.height, s1.bmi, s1.pulse
        FROM opdscreen s1
        INNER JOIN (SELECT hn, MAX(vstdate) AS max_vst FROM opdscreen GROUP BY hn) s_latest ON s1.hn = s_latest.hn AND s1.vstdate = s_latest.max_vst
      ) s ON p.hn = s.hn
      LEFT JOIN (
        SELECT v1.hn, v1.vstdate, v1.pdx
        FROM vn_stat v1
        INNER JOIN (SELECT hn, MAX(vstdate) AS max_vst FROM vn_stat GROUP BY hn) v_latest ON v1.hn = v_latest.hn AND v1.vstdate = v_latest.max_vst
      ) v ON p.hn = v.hn
      LEFT JOIN (
        SELECT o1.hn, o1.nextdate, o1.nexttime
        FROM oapp o1
        INNER JOIN (SELECT hn, MAX(nextdate) AS max_nextdate FROM oapp WHERE nextdate >= CURDATE() GROUP BY hn) o_latest ON o1.hn = o_latest.hn AND o1.nextdate = o_latest.max_nextdate
      ) app ON p.hn = app.hn
      WHERE cm.clinic IN ('001', '002', '030')
      LIMIT 500
    `);

    // 2. Fetch Upcoming Appointments from HOSxP MySQL
    const [appointmentRows]: any = await pool.execute(`
      SELECT o.oapp_id, o.hn, 
             CONVERT(CONCAT(COALESCE(p.pname,''), COALESCE(p.fname,''), ' ', COALESCE(p.lname,'')) USING utf8mb4) AS patient_name, 
             COALESCE(p.mobile_phone_number, p.hometel, p.informtel) AS phone, p.cid,
             o.vstdate, o.nextdate, o.nexttime, o.clinic, 
             CONVERT(c.name USING utf8mb4) AS clinic_name, o.doctor, 
             CONVERT(d.name USING utf8mb4) AS doctor_name, 
             CONVERT(o.app_cause USING utf8mb4) AS app_cause
      FROM oapp o
      LEFT JOIN patient p ON o.hn = p.hn
      LEFT JOIN clinic c ON o.clinic = c.clinic
      LEFT JOIN doctor d ON o.doctor = d.code
      WHERE o.nextdate >= CURDATE() AND o.clinic IN ('001', '002', '030')
      ORDER BY o.nextdate ASC
      LIMIT 500
    `);

    // Format & Prepare Patients Cache Records
    const formattedPatients = patientRows.map((r: any) => {
      const bps = Number(r.bps) || null;
      const bpd = Number(r.bpd) || null;
      const fbs = Number(r.fbs) || null;

      let diseaseType = 'NCDs';
      if (r.clinic === '001') diseaseType = 'เบาหวาน (DM)';
      else if (r.clinic === '002') diseaseType = 'ความดันโลหิตสูง (HT)';
      else if (r.clinic === '030') diseaseType = 'โรคไตเรื้อรัง (CKD)';

      let isControlled = false;
      let controlStatusCode = 'unknown';
      let controlStatusText = 'รอตรวจ';

      if (r.clinic === '001' && fbs) {
        isControlled = fbs < 130;
        controlStatusCode = isControlled ? 'controlled' : 'uncontrolled';
        controlStatusText = isControlled ? `🟢 ควบคุมได้ดี (FBS ${fbs} mg/dL)` : `🔴 ควบคุมได้ไม่ดี (FBS ${fbs} mg/dL)`;
      } else if (bps && bpd) {
        isControlled = bps < 140 && bpd < 90;
        controlStatusCode = isControlled ? 'controlled' : 'uncontrolled';
        controlStatusText = isControlled ? `🟢 ควบคุมได้ดี (BP ${bps}/${bpd})` : `🔴 ควบคุมได้ไม่ดี (BP ${bps}/${bpd})`;
      }

      return {
        hn: r.hn ? (r.hn.startsWith('HN-') ? r.hn : `HN-${r.hn}`) : `HN-${r.hn}`,
        raw_hn: r.hn,
        patient_name: r.patient_name || 'ไม่ระบุชื่อ',
        cid: r.cid || null,
        birthday: r.birthday || null,
        sex: r.sex === '1' ? 'ชาย' : 'หญิง',
        phone: r.phone || '-',
        address: r.informaddr || 'ต.คลองหาด อ.คลองหาด จ.สระแก้ว',
        clinic_code: r.clinic,
        clinic_name: r.clinic_name || diseaseType,
        disease_type: diseaseType,
        reg_date: r.regdate || null,
        last_vst_date: r.last_vstdate || null,
        bps, bpd, fbs,
        bw: r.bw || null,
        bmi: r.bmi || null,
        pulse: r.pulse || null,
        pdx: r.pdx || 'ไม่ระบุ',
        control_status_code: controlStatusCode,
        control_status_text: controlStatusText,
        is_controlled: isControlled,
        next_date: r.nextdate || null,
        next_time: r.nexttime || null,
        synced_at: new Date().toISOString(),
      };
    });

    // Format & Prepare Appointments Cache Records
    const formattedAppointments = appointmentRows.map((r: any) => ({
      id: String(r.oapp_id),
      oapp_id: r.oapp_id,
      hn: r.hn ? (r.hn.startsWith('HN-') ? r.hn : `HN-${r.hn}`) : 'HN-0000',
      patient_name: r.patient_name || 'ไม่ระบุชื่อ',
      phone: r.phone || '-',
      cid: r.cid || '-',
      vst_date: r.vstdate || null,
      next_date: r.nextdate || null,
      next_time: r.nexttime || '08:30 น.',
      clinic_code: r.clinic,
      clinic_name: r.clinic_name || 'คลินิก NCDs',
      doctor_code: r.doctor,
      doctor_name: r.doctor_name || 'แพทย์ผู้ตรวจ',
      app_cause: r.app_cause || 'ตรวจติดตามอาการ NCDs',
      status: 'confirmed',
      synced_at: new Date().toISOString(),
    }));

    // Save to Local In-Memory Cache (Immediate staging)
    setHosxpCache('snapshot:patients', formattedPatients, 86400000);
    setHosxpCache('snapshot:appointments', formattedAppointments, 86400000);

    // Upsert to Supabase PostgreSQL Tables
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdminClient();
      if (formattedPatients.length > 0) {
        await supabase.from('hosxp_patients_cache').upsert(formattedPatients, { onConflict: 'hn' });
      }
      if (formattedAppointments.length > 0) {
        await supabase.from('hosxp_appointments_cache').upsert(formattedAppointments, { onConflict: 'id' });
      }
    }

    const totalSynced = formattedPatients.length + formattedAppointments.length;
    const nowIso = new Date().toISOString();
    await updateSyncConfig({
      status: 'success',
      last_synced_at: nowIso,
      synced_count: totalSynced,
    });

    console.log(`✅ HOSxP -> Supabase Sync Complete! Synced ${formattedPatients.length} Patients & ${formattedAppointments.length} Appointments.`);
    return {
      success: true,
      syncedPatientsCount: formattedPatients.length,
      syncedAppointmentsCount: formattedAppointments.length,
    };
  } catch (error: any) {
    let friendlyError = error.message;
    if (error.code === 'ETIMEDOUT' || error.message.includes('ETIMEDOUT')) {
      friendlyError = '⚠️ ไม่สามารถเชื่อมต่อกับเครื่องเซิร์ฟเวอร์ HOSxP LAN (192.168.1.4:3306) ได้เนื่องจาก Connection Timeout กรุณาตรวจสอบว่าคอมพิวเตอร์อยู่ในเครือข่าย LAN โรงพยาบาล หรือเครื่อง HOSxP เปิดอยู่';
    } else if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
      friendlyError = '⚠️ พอร์ต 3306 ของเครื่องเซิร์ฟเวอร์ HOSxP LAN (192.168.1.4) ปิดอยู่ หรือถูกปฏิเสธการเชื่อมต่อ (ECONNREFUSED)';
    }

    console.error('❌ HOSxP -> Supabase Sync Error:', friendlyError);
    await updateSyncConfig({ status: 'error', error_message: friendlyError });
    return { success: false, syncedPatientsCount: 0, syncedAppointmentsCount: 0, error: friendlyError };
  }
}

/**
 * Fallback Function: Query Patient Registry from Supabase when HOSxP LAN is Unreachable
 */
export async function getSupabaseFallbackPatients() {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();
      const { data, error } = await supabase
        .from('hosxp_patients_cache')
        .select('*')
        .order('hn', { ascending: false })
        .limit(50);

      if (!error && data && data.length > 0) {
        const patients = data.map((p: any) => ({
          hn: p.hn,
          rawHn: p.raw_hn,
          patientName: p.patient_name,
          phone: p.phone,
          address: p.address,
          cid: p.cid,
          birthday: p.birthday,
          sex: p.sex,
          clinicCode: p.clinic_code,
          clinicName: p.clinic_name,
          diseaseType: p.disease_type,
          regDateFormatted: p.reg_date ? new Date(p.reg_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : '-',
          vitals: {
            bp: p.bps && p.bpd ? `${p.bps}/${p.bpd} mmHg` : '-',
            bps: p.bps, bpd: p.bpd,
            fbs: p.fbs ? `${p.fbs} mg/dL` : '-',
            rawFbs: p.fbs,
            bw: p.bw ? `${p.bw} kg` : '-',
            bmi: p.bmi || '-',
            pulse: p.pulse ? `${p.pulse} bpm` : '-',
            pdx: p.pdx || 'ไม่ระบุ',
          },
          controlStatusCode: p.control_status_code || 'unknown',
          controlStatusText: p.control_status_text || 'รอตรวจ',
          isControlled: p.is_controlled,
          nextDateFormatted: p.next_date ? new Date(p.next_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : 'ยังไม่มีวันนัด',
        }));

        return {
          patients,
          isSupabaseFallback: true,
          notice: '📡 อ่านข้อมูลสำรองจาก Supabase PostgreSQL (กรณีเซิร์ฟเวอร์ HOSxP ออฟไลน์)',
        };
      }
    } catch (e) {
      console.warn('⚠️ Supabase Patients Fallback Query Error:', e);
    }
  }

  // Fallback to local memory cache if Supabase not configured
  const cached = getHosxpCacheDirect<any>('snapshot:patients');
  return {
    patients: cached?.data || [],
    isSupabaseFallback: true,
    isMockFallback: true,
  };
}

/**
 * Fallback Function: Query Upcoming Appointments from Supabase when HOSxP LAN is Unreachable
 */
export async function getSupabaseFallbackAppointments() {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();
      const { data, error } = await supabase
        .from('hosxp_appointments_cache')
        .select('*')
        .order('next_date', { ascending: true })
        .limit(50);

      if (!error && data && data.length > 0) {
        const appointments = data.map((r: any) => ({
          id: String(r.id),
          hn: r.hn,
          patientName: r.patient_name,
          phone: r.phone,
          cid: r.cid,
          dateFormatted: r.next_date ? new Date(r.next_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : '-',
          timeFormatted: r.next_time || '08:30 น.',
          clinicName: r.clinic_name,
          doctorName: r.doctor_name,
          appCause: r.app_cause,
          status: r.status,
        }));

        return {
          appointments,
          isSupabaseFallback: true,
          notice: '📡 อ่านรายการนัดหมายสำรองจาก Supabase PostgreSQL',
        };
      }
    } catch (e) {
      console.warn('⚠️ Supabase Appointments Fallback Error:', e);
    }
  }

  const cached = getHosxpCacheDirect<any>('snapshot:appointments');
  return {
    appointments: cached?.data || [],
    isSupabaseFallback: true,
    isMockFallback: true,
  };
}

/**
 * Legacy Snapshot Fallbacks for Compatibility
 */
export function getSnapshotStatsFallback() {
  const cached = getHosxpCacheDirect<any>('hosxp:stats');
  if (cached) {
    return { ...cached.data, isSnapshot: true, snapshotAgeMinutes: Math.round(cached.ageMs / 60000) };
  }
  return {
    stats: { totalPatients: 1420, appointmentsToday: 18, upcomingAppointments: 142, missedFollowUps: 24 },
    recentAppointments: [],
    isSnapshot: true,
    isMockFallback: true,
  };
}

export function getSnapshotAppointmentsFallback() {
  const cached = getHosxpCacheDirect<any>('hosxp:appointments');
  if (cached) {
    return { appointments: cached.data, isSnapshot: true, snapshotAgeMinutes: Math.round(cached.ageMs / 60000) };
  }
  return {
    appointments: [],
    isSnapshot: true,
    isMockFallback: true,
  };
}

export function getSnapshotFollowUpsFallback() {
  const cached = getHosxpCacheDirect<any>('hosxp:follow-ups');
  if (cached) {
    return { tasks: cached.data, isSnapshot: true, snapshotAgeMinutes: Math.round(cached.ageMs / 60000) };
  }
  return {
    tasks: [],
    isSnapshot: true,
    isMockFallback: true,
  };
}

export function freezeHosxpSnapshot(key: string, data: any, ttlMs = 86400000) {
  setHosxpCache(`snapshot:${key}`, data, ttlMs);
}
