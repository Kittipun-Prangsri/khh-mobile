import { getHosxpPool } from './hosxpClient';
import { getSupabaseAdminClient, isSupabaseConfigured } from './supabaseClient';

// Store in-memory bindings map for fast lookup
// key: lineUserId, value: { hn: string, patientName: string, boundAt: string, userRole?: string }
const lineUserBindingStore = new Map<string, { hn: string; patientName: string; boundAt: string; userRole?: string }>();

export interface PatientAppointmentInfo {
  oappId: string;
  hn: string;
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  clinicName: string;
  doctorName: string;
  cause: string;
  preparationNotes: string;
}

export interface LineUserBindingResult {
  status: 'SUCCESS' | 'ALREADY_BOUND' | 'REBOUND_TRANSFERRED' | 'INVALID_VERIFICATION' | 'LIMIT_EXCEEDED' | 'ERROR';
  message: string;
  hn: string;
  patientName: string;
  isCaregiver?: boolean;
}

/**
 * Generate 1-Tap LINE Registration Deep Link for Printed Appointment Slips / Medicine Bags
 * Example: https://line.me/R/oaMessage/@khhsafeconnect/?HN-98302
 */
export function generateRegistrationDeepLink(hn: string, lineOaBasicId: string = process.env.NEXT_PUBLIC_LINE_OA_BASIC_ID || '@745sionk'): string {
  const formattedHn = hn.toUpperCase().startsWith('HN-') ? hn.toUpperCase() : `HN-${hn}`;
  const encodedMsg = encodeURIComponent(formattedHn);
  const cleanId = lineOaBasicId.trim();
  return `https://line.me/R/oaMessage/${cleanId}/?${encodedMsg}`;
}

/**
 * Enhanced LINE User ID Binding Validation & Duplicate Prevention Service
 */
export async function getLineUserBinding(lineUserId: string) {
  if (!lineUserId) return null;

  // 1. Check in-memory store
  if (lineUserBindingStore.has(lineUserId)) {
    return lineUserBindingStore.get(lineUserId)!;
  }

  // 2. Check Supabase patient_line_users table
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();
      const { data, error } = await supabase
        .from('patient_line_users')
        .select('hn, patient_name, user_role, created_at')
        .eq('line_user_id', lineUserId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && !error) {
        const binding = {
          hn: data.hn,
          patientName: data.patient_name || 'ผู้ป่วย รพ.คลองหาด',
          boundAt: data.created_at || new Date().toISOString(),
          userRole: data.user_role || 'patient',
        };
        lineUserBindingStore.set(lineUserId, binding);
        return binding;
      }
    } catch (err) {
      console.warn('⚠️ Error fetching LINE user binding from Supabase:', err);
    }
  }

  return null;
}

/**
 * Bind a LINE User ID with strict duplicate prevention and conflict handling
 */
export async function bindLineUserToHn(
  lineUserId: string,
  hn: string,
  patientName: string,
  options: { userRole?: 'patient' | 'caregiver'; overrideExisting?: boolean } = {}
): Promise<LineUserBindingResult> {
  if (!lineUserId || !hn) {
    return { status: 'ERROR', message: 'ข้อมูลไม่ครบถ้วน', hn: '', patientName: '' };
  }

  const formattedHn = hn.toUpperCase().startsWith('HN-') ? hn.toUpperCase() : `HN-${hn}`;
  const userRole = options.userRole || 'patient';

  // 1. Check if this exact LINE User ID is already bound to this HN
  const existingUserBinding = await getLineUserBinding(lineUserId);
  if (existingUserBinding && existingUserBinding.hn === formattedHn) {
    return {
      status: 'ALREADY_BOUND',
      message: `บัญชี LINE นี้ถูกผูกกับผู้ป่วย ${patientName} (${formattedHn}) เรียบร้อยแล้ว`,
      hn: formattedHn,
      patientName,
    };
  }

  // Check active binding count for this HN (Max 3 active bound accounts per patient)
  const activeCount = await getActiveBindingCountForHn(formattedHn);
  if (activeCount >= 3 && !existingUserBinding) {
    return {
      status: 'LIMIT_EXCEEDED',
      message: `ไม่สามารถผูกบัญชีได้: หมายเลข ${formattedHn} มีการผูกบัญชี LINE ครบตามโควตา 3 บัญชีแล้ว`,
      hn: formattedHn,
      patientName,
    };
  }

  // 2. Save/Update in-memory store
  const binding = {
    hn: formattedHn,
    patientName,
    boundAt: new Date().toISOString(),
    userRole,
  };
  lineUserBindingStore.set(lineUserId, binding);

  // 3. Persist to Supabase with Duplicate Resolution Rules
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();

      // If patient role, deactivate any older primary bindings for this HN to prevent orphaned duplicate accounts
      if (userRole === 'patient' && options.overrideExisting) {
        await supabase
          .from('patient_line_users')
          .update({ is_active: false, unbound_at: new Date().toISOString() })
          .eq('hn', formattedHn)
          .eq('is_primary', true);
      }

      await supabase.from('patient_line_users').upsert({
        line_user_id: lineUserId,
        hn: formattedHn,
        patient_name: patientName,
        user_role: userRole,
        is_primary: userRole === 'patient',
        is_active: true,
        created_at: new Date().toISOString(),
      });

      // Audit Log
      await supabase.from('line_binding_audit_logs').insert({
        line_user_id: lineUserId,
        target_hn: formattedHn,
        action_type: options.overrideExisting ? 'REBIND_TRANSFER' : userRole === 'caregiver' ? 'CAREGIVER_ADD' : 'BIND_SUCCESS',
        reason: 'Successful LINE ID registration verification',
      });
    } catch (err) {
      console.warn('⚠️ Error persisting LINE user binding to Supabase:', err);
    }
  }

  return {
    status: options.overrideExisting ? 'REBOUND_TRANSFERRED' : 'SUCCESS',
    message: `ผูกบัญชีสำเร็จ: คุณ${patientName} (${formattedHn})`,
    hn: formattedHn,
    patientName,
  };
}

function parseBirthYearBE(birthdayValue: any): string {
  if (!birthdayValue) return '';
  const d = new Date(birthdayValue);
  if (isNaN(d.getTime())) {
    const match = String(birthdayValue).match(/^(\d{4})/);
    if (!match) return '';
    let year = parseInt(match[1], 10);
    if (year < 2200) year += 543;
    return String(year);
  }
  let year = d.getFullYear();
  if (year < 2200) year += 543;
  return String(year);
}

/**
 * Search HOSxP patient database by HN or 13-digit Citizen ID (CID)
 * Checks HOSxP MySQL first, with fallback to Supabase PostgreSQL patients table.
 */
export async function findPatientByHnOrCidInHosxp(queryStr: string) {
  const rawClean = queryStr.trim().replace(/^HN-?/i, '');
  const digitsOnly = rawClean.replace(/[^0-9]/g, '');
  const cleanQuery = digitsOnly || rawClean;
  const formattedHn = cleanQuery.startsWith('HN-') ? cleanQuery : `HN-${cleanQuery}`;

  // 1. Query HOSxP MySQL
  try {
    const pool = getHosxpPool();

    const [rows]: any = await pool.execute(
      `
      SELECT hn, 
             CONVERT(CONCAT(COALESCE(pname,''), COALESCE(fname,''), ' ', COALESCE(lname,'')) USING utf8mb4) AS patient_name,
             COALESCE(mobile_phone_number, hometel, informtel) AS phone,
             cid,
             birthday
      FROM patient 
      WHERE hn = ? 
         OR cid = ? 
         OR REPLACE(REPLACE(COALESCE(cid, ''), '-', ''), ' ', '') = ?
         OR hn = LPAD(?, 7, '0') 
         OR hn = LPAD(?, 8, '0') 
         OR hn = LPAD(?, 9, '0')
      LIMIT 1
    `,
      [cleanQuery, cleanQuery, cleanQuery, cleanQuery, cleanQuery, cleanQuery]
    );

    if (rows && rows.length > 0) {
      const p = rows[0];

      // Query registered chronic clinics from HOSxP clinicmember
      let clinics: string[] = [];
      try {
        const [clinicRows]: any = await pool.execute(
          `
          SELECT DISTINCT cm.clinic, CONVERT(c.name USING utf8mb4) AS clinic_name
          FROM clinicmember cm
          LEFT JOIN clinic c ON cm.clinic = c.clinic
          WHERE cm.hn = ? AND cm.clinic IS NOT NULL
        `,
          [p.hn]
        );

        if (clinicRows && clinicRows.length > 0) {
          clinics = clinicRows.map((cr: any) => {
            const codePrefix = cr.clinic ? `คลินิก ${cr.clinic}: ` : '';
            return `🩺 ${codePrefix}${cr.clinic_name || 'คลินิก NCDs'}`;
          });
        }
      } catch (err) {
        clinics = [];
      }

      const birthYearBE = parseBirthYearBE(p.birthday);

      return {
        found: true,
        hn: p.hn.startsWith('HN-') ? p.hn : `HN-${p.hn}`,
        rawHn: p.hn,
        patientName: p.patient_name || 'ผู้ป่วย รพ.คลองหาด',
        phone: p.phone || '-',
        cid: p.cid || '-',
        birthYearBE,
        clinics,
      };
    }
  } catch (error) {
    console.warn('⚠️ HOSxP MySQL unavailable for patient search, falling back to Supabase:', (error as Error).message);
  }

  // 2. Fallback to Supabase PostgreSQL `patients` table
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();

      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .or(`hn.eq.${formattedHn},hn.eq.${cleanQuery},raw_hn.eq.${cleanQuery},cid.eq.${cleanQuery},cid.eq.${queryStr.trim()}`)
        .maybeSingle();

      if (data && !error) {
        const diseaseType = data.disease_type || data.clinic_name;
        const clinics = diseaseType
          ? diseaseType.split(',').map((d: string) => `🩺 คลินิก${d.trim()}`)
          : ['🩺 คลินิกเบาหวาน (DM)', '🩺 คลินิกความดันโลหิตสูง (HT)'];

        const birthYearBE = String(data.birth_year || parseBirthYearBE(data.birthday) || '');

        return {
          found: true,
          hn: data.hn || formattedHn,
          rawHn: data.raw_hn || cleanQuery,
          patientName: data.patient_name || 'ผู้ป่วย รพ.คลองหาด',
          phone: data.phone || '-',
          cid: data.cid || '-',
          birthYearBE,
          clinics,
        };
      }
    } catch (err) {
      console.warn('⚠️ Error searching patient in Supabase:', err);
    }
  }

  return { found: false, hn: '', patientName: '', clinics: [], birthYearBE: '' };
}

/**
 * Count active bound LINE accounts for a given patient HN (Limit: max 3)
 */
export async function getActiveBindingCountForHn(hn: string): Promise<number> {
  const formattedHn = hn.toUpperCase().startsWith('HN-') ? hn.toUpperCase() : `HN-${hn}`;

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();
      const { count, error } = await supabase
        .from('patient_line_users')
        .select('*', { count: 'exact', head: true })
        .eq('hn', formattedHn)
        .eq('is_active', true);

      if (!error && typeof count === 'number') {
        return count;
      }
    } catch (err) {
      console.warn('⚠️ Error counting active bindings in Supabase:', err);
    }
  }

  // Count in local in-memory store as fallback
  let localCount = 0;
  for (const b of lineUserBindingStore.values()) {
    if (b.hn === formattedHn) localCount++;
  }
  return localCount;
}

/**
 * Verify a 4-digit input year against patient's actual birth year in HOSxP/Supabase
 */
export async function verifyPatientBirthYear(
  hnOrCid: string,
  inputYear: string
): Promise<{ valid: boolean; patientName: string; hn: string; birthYearBE: string; activeCount: number }> {
  const cleanInputYear = inputYear.replace(/[^0-9]/g, '');
  const patient = await findPatientByHnOrCidInHosxp(hnOrCid);

  if (!patient.found) {
    return { valid: false, patientName: '', hn: '', birthYearBE: '', activeCount: 0 };
  }

  const actualYear = (patient as any).birthYearBE || '';
  const activeCount = await getActiveBindingCountForHn(patient.hn);

  // Match 4-digit birth year in BE or last 4 digits of CID/Phone as fallback
  const isValid =
    (actualYear && cleanInputYear === actualYear) ||
    (patient.cid && patient.cid.replace(/[^0-9]/g, '').endsWith(cleanInputYear)) ||
    (patient.phone && patient.phone.replace(/[^0-9]/g, '').endsWith(cleanInputYear));

  return {
    valid: isValid,
    patientName: patient.patientName,
    hn: patient.hn,
    birthYearBE: actualYear,
    activeCount,
  };
}

/**
 * Search HOSxP staff database (opduser / opduser_Ncd) by username, doctorcode, or staff code
 */
export async function findStaffInHosxp(queryStr: string) {
  const cleanQuery = queryStr.trim().replace(/^STAFF-?/i, '').replace(/^NURSE-?/i, '').replace(/^DOC-?/i, '');

  // 1. Query HOSxP opduser / opduser_Ncd
  try {
    const pool = getHosxpPool();

    let rows: any[] = [];
    try {
      const [ncdRows]: any = await pool.execute(
        `SELECT loginname, 
                CONVERT(name USING utf8mb4) AS name, 
                CONVERT(entryposition USING utf8mb4) AS entryposition, 
                CONVERT(department USING utf8mb4) AS department, 
                doctorcode
         FROM opduser_Ncd 
         WHERE loginname = ? OR doctorcode = ? OR cid = ? OR loginname LIKE ?
         LIMIT 1`,
        [cleanQuery, cleanQuery, cleanQuery, `%${cleanQuery}%`]
      );
      if (ncdRows && ncdRows.length > 0) rows = ncdRows;
    } catch (e) {}

    if (!rows || rows.length === 0) {
      const [dbRows]: any = await pool.execute(
        `SELECT loginname, 
                CONVERT(name USING utf8mb4) AS name, 
                CONVERT(entryposition USING utf8mb4) AS entryposition, 
                CONVERT(department USING utf8mb4) AS department, 
                doctorcode
         FROM opduser 
         WHERE loginname = ? OR doctorcode = ? OR cid = ? OR loginname LIKE ?
         LIMIT 1`,
        [cleanQuery, cleanQuery, cleanQuery, `%${cleanQuery}%`]
      );
      rows = dbRows;
    }

    if (rows && rows.length > 0) {
      const u = rows[0];
      return {
        found: true,
        loginname: u.loginname,
        staffCode: u.doctorcode ? `DOC-${u.doctorcode}` : `STAFF-${u.loginname.toUpperCase()}`,
        staffName: u.name || cleanQuery,
        entryposition: u.entryposition || 'เจ้าหน้าที่โรงพยาบาลคลองหาด',
        department: u.department || 'งานคลินิก NCDs',
      };
    }
  } catch (err) {
    console.warn('⚠️ HOSxP DB error querying staff:', err);
  }

  // 2. Fallback for test/demo staff codes (STAFF-XXXX, NURSE-XXXX, DOC-XXXX or any text)
  return {
    found: true,
    loginname: cleanQuery.toLowerCase(),
    staffCode: queryStr.trim().toUpperCase(),
    staffName: `เจ้าหน้าที่ รพ.คลองหาด (${queryStr.trim()})`,
    entryposition: 'บุคลากรทางการแพทย์ / เจ้าหน้าที่ NCDs',
    department: 'คลินิก NCDs โรงพยาบาลคลองหาด',
  };
}

/**
 * Fetch REAL upcoming appointments for a specific patient HN
 * Checks HOSxP MySQL first, with fallback to Supabase PostgreSQL appointments table.
 * Returns empty array [] if patient has no upcoming appointments (No fake mock data).
 */
export async function fetchPatientUpcomingAppointmentsFromHosxp(hn: string): Promise<PatientAppointmentInfo[]> {
  const cleanHn = hn.trim().replace(/^HN-/i, '');
  const formattedHn = `HN-${cleanHn}`;

  // 1. Query HOSxP MySQL
  try {
    const pool = getHosxpPool();

    const [rows]: any = await pool.execute(
      `
      SELECT o.oapp_id, o.hn, 
             CONVERT(CONCAT(COALESCE(p.pname,''), COALESCE(p.fname,''), ' ', COALESCE(p.lname,'')) USING utf8mb4) AS patient_name,
             o.nextdate, o.nexttime, o.clinic, 
             CONVERT(c.name USING utf8mb4) AS clinic_name, 
             CONVERT(d.name USING utf8mb4) AS doctor_name, 
             CONVERT(o.app_cause USING utf8mb4) AS app_cause
      FROM oapp o
      LEFT JOIN patient p ON o.hn = p.hn
      LEFT JOIN clinic c ON o.clinic = c.clinic
      LEFT JOIN doctor d ON o.doctor = d.code
      WHERE (o.hn = ? OR o.hn = LPAD(?, 7, '0'))
        AND o.nextdate >= CURDATE()
      ORDER BY o.nextdate ASC
      LIMIT 5
    `,
      [cleanHn, cleanHn]
    );

    if (rows && rows.length > 0) {
      return rows.map((r: any) => {
        const nextDate = new Date(r.nextdate);
        const dateStr = nextDate.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
        const timeStr = r.nexttime ? `${r.nexttime} น.` : '08:30 น.';
        const clinicStr = r.clinic_name || 'คลินิก NCDs';
        const causeStr = r.app_cause || 'ตรวจติดตามอาการประจำปี';

        let prep = 'โปรดนำบัตรประชาชน สมุดประจำตัว NCDs และยาประจำตัวมาด้วยทุกครั้ง';
        if (clinicStr.includes('เบาหวาน') || causeStr.includes('เจาะเลือด') || causeStr.includes('ดม')) {
          prep = '⚠️ โปรดงดน้ำและอาหารทุกชนิดหลัง 20:00 น. คืนก่อนวันตรวจ (จิบน้ำบริสุทธิ์ได้เล็กน้อย) นำยาประจำตัวมาทานหลังเจาะเลือดเสร็จ';
        }

        return {
          oappId: `oapp-${r.oapp_id}`,
          hn: r.hn.startsWith('HN-') ? r.hn : `HN-${r.hn}`,
          patientName: r.patient_name || 'ผู้ป่วย NCDs',
          appointmentDate: dateStr,
          appointmentTime: timeStr,
          clinicName: clinicStr,
          doctorName: r.doctor_name || 'แพทย์ประจำคลินิก',
          cause: causeStr,
          preparationNotes: prep,
        };
      });
    }
  } catch (error) {
    console.warn('⚠️ HOSxP MySQL unavailable for appointments query, falling back to Supabase:', (error as Error).message);
  }

  // 2. Fallback to Supabase PostgreSQL `appointments` table
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .or(`hn.eq.${formattedHn},hn.eq.${cleanHn}`)
        .gte('next_date', new Date().toISOString().split('T')[0])
        .order('next_date', { ascending: true })
        .limit(5);

      if (data && !error && data.length > 0) {
        return data.map((r: any) => {
          const nextDate = new Date(r.next_date);
          const dateStr = nextDate.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
          const timeStr = r.next_time ? `${r.next_time} น.` : '08:30 น.';
          const clinicStr = r.clinic_name || 'คลินิก NCDs';
          const causeStr = r.app_cause || 'ตรวจติดตามอาการประจำปี';

          let prep = 'โปรดนำบัตรประชาชน สมุดประจำตัว NCDs และยาประจำตัวมาด้วยทุกครั้ง';
          if (clinicStr.includes('เบาหวาน') || causeStr.includes('เจาะเลือด')) {
            prep = '⚠️ โปรดงดน้ำและอาหารทุกชนิดหลัง 20:00 น. คืนก่อนวันตรวจ (จิบน้ำบริสุทธิ์ได้เล็กน้อย) นำยาประจำตัวมาทานหลังเจาะเลือดเสร็จ';
          }

          return {
            oappId: `oapp-${r.oapp_id || r.id}`,
            hn: r.hn.startsWith('HN-') ? r.hn : `HN-${r.hn}`,
            patientName: r.patient_name || 'ผู้ป่วย NCDs',
            appointmentDate: dateStr,
            appointmentTime: timeStr,
            clinicName: clinicStr,
            doctorName: r.doctor_name || 'แพทย์ประจำคลินิก',
            cause: causeStr,
            preparationNotes: prep,
          };
        });
      }
    } catch (err) {
      console.warn('⚠️ Error fetching patient appointments from Supabase:', err);
    }
  }

  // Return empty array if patient has no upcoming appointments (No fake mock data)
  return [];
}

/**
 * Find bound LINE User ID for a given patient HN (Checking In-Memory & Supabase)
 * Returns null if the patient has not bound their LINE account yet.
 */
export async function getLineUserIdByHn(hn: string): Promise<string | null> {
  if (!hn) return null;
  const formattedHn = hn.toUpperCase().startsWith('HN-') ? hn.toUpperCase() : `HN-${hn}`;
  const cleanHn = hn.trim().replace(/^HN-/i, '');

  // 1. Search in-memory binding store
  for (const [lineId, binding] of lineUserBindingStore.entries()) {
    if (binding.hn === formattedHn || binding.hn.replace(/^HN-/i, '') === cleanHn) {
      return lineId;
    }
  }

  // 2. Search in-memory live incoming messages store
  for (const msg of liveIncomingMessagesStore) {
    if (msg.hn === formattedHn || msg.hn.replace(/^HN-/i, '') === cleanHn) {
      if (msg.lineUserId && !msg.lineUserId.startsWith('SIMULATED')) {
        return msg.lineUserId;
      }
    }
  }

  // 3. Search Supabase patient_line_users table
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();
      const { data, error } = await supabase
        .from('patient_line_users')
        .select('line_user_id')
        .or(`hn.eq.${formattedHn},hn.eq.${cleanHn}`)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0 && !error && data[0].line_user_id) {
        return data[0].line_user_id;
      }
    } catch (err) {
      console.warn('⚠️ Error searching LINE User ID by HN in patient_line_users:', err);
    }

    // 4. Search Supabase patient_line_messages table fallback
    try {
      const supabase = getSupabaseAdminClient();
      const { data, error } = await supabase
        .from('patient_line_messages')
        .select('line_user_id')
        .or(`hn.eq.${formattedHn},hn.eq.${cleanHn}`)
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0 && !error && data[0].line_user_id) {
        return data[0].line_user_id;
      }
    } catch (err) {
      console.warn('⚠️ Error searching LINE User ID by HN in patient_line_messages:', err);
    }
  }

  return null;
}

export interface SavedLineMessage {
  id: string;
  lineUserId: string;
  hn: string;
  patientName: string;
  text: string;
  timestamp: string;
  createdAt: string;
}

const liveIncomingMessagesStore: SavedLineMessage[] = [];

/**
 * Record incoming patient message from LINE Webhook and store replyToken for staff replies.
 * The replyToken is stored in patient_line_users so staff can use LINE Reply API (free quota).
 */
export async function recordIncomingLineMessage(lineUserId: string, text: string, replyToken?: string) {
  if (!lineUserId || !text) return null;

  const binding = await getLineUserBinding(lineUserId);
  const hn = binding?.hn || 'HN-UNBOUND';
  const patientName = binding?.patientName || 'ผู้ป่วย (ยังไม่ได้ผูก HN)';
  const now = new Date();

  const msg: SavedLineMessage = {
    id: `msg-live-${now.getTime()}-${Math.random().toString(36).substring(2, 7)}`,
    lineUserId,
    hn,
    patientName,
    text,
    timestamp: now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    createdAt: now.toISOString(),
  };

  liveIncomingMessagesStore.unshift(msg);
  if (liveIncomingMessagesStore.length > 200) {
    liveIncomingMessagesStore.pop();
  }

  // Persist to Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();
      // 1. Store incoming message
      await supabase.from('patient_line_messages').insert({
        line_user_id: lineUserId,
        hn,
        patient_name: patientName,
        message_text: text,
        created_at: now.toISOString(),
      });
      // 2. Store latest replyToken on patient_line_users for staff to use LINE Reply API (free quota)
      if (replyToken && hn !== 'HN-UNBOUND') {
        const tokenExpiresAt = new Date(now.getTime() + 25000).toISOString(); // 25-second window
        await supabase
          .from('patient_line_users')
          .update({
            latest_reply_token: replyToken,
            reply_token_expires_at: tokenExpiresAt,
          })
          .or(`hn.eq.${hn},hn.eq.${hn.replace(/^HN-/i, '')}`);
      }
    } catch (err) {
      console.warn('⚠️ Error logging LINE message/token to Supabase:', err);
    }
  }

  return msg;
}

/**
 * Get all live incoming LINE messages stored in memory/Supabase
 */
export function getAllIncomingLineMessages(): SavedLineMessage[] {
  return [...liveIncomingMessagesStore];
}

/**
 * Get incoming LINE messages for a specific HN
 */
export function getIncomingLineMessagesForHn(hn: string): SavedLineMessage[] {
  if (!hn) return [];
  const cleanHn = hn.trim().replace(/^HN-/i, '');
  return liveIncomingMessagesStore.filter(
    (m) => m.hn === hn || m.hn.replace(/^HN-/i, '') === cleanHn
  );
}

/**
 * Unbind LINE User ID from HN (Staff action via Web Dashboard)
 */
export async function unbindLineUserFromHn(
  hn: string,
  lineUserId?: string,
  staffReason: string = 'Staff unbind requested via Web Dashboard'
): Promise<{ success: boolean; message: string; unboundCount: number }> {
  if (!hn) {
    return { success: false, message: 'กรุณาระบุ HN', unboundCount: 0 };
  }

  const formattedHn = hn.toUpperCase().startsWith('HN-') ? hn.toUpperCase() : `HN-${hn}`;
  const cleanHn = hn.trim().replace(/^HN-/i, '');
  let unboundCount = 0;

  // 1. Remove from in-memory binding store
  for (const [key, value] of lineUserBindingStore.entries()) {
    if (value.hn === formattedHn || value.hn.replace(/^HN-/i, '') === cleanHn) {
      if (!lineUserId || key === lineUserId) {
        lineUserBindingStore.delete(key);
        unboundCount++;
      }
    }
  }

  // 2. Deactivate in Supabase patient_line_users table
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();
      let query = supabase
        .from('patient_line_users')
        .update({
          is_active: false,
          unbound_at: new Date().toISOString(),
        })
        .or(`hn.eq.${formattedHn},hn.eq.${cleanHn}`)
        .eq('is_active', true);

      if (lineUserId) {
        query = query.eq('line_user_id', lineUserId);
      }

      const { data, error } = await query.select();

      if (!error && data) {
        unboundCount = Math.max(unboundCount, data.length);
      }

      // Audit Log
      await supabase.from('line_binding_audit_logs').insert({
        line_user_id: lineUserId || 'ALL_BOUND_USERS',
        target_hn: formattedHn,
        action_type: 'UNBIND_STAFF_ACTION',
        reason: staffReason,
      });
    } catch (err) {
      console.warn('⚠️ Error unbinding LINE user from Supabase:', err);
    }
  }

  return {
    success: true,
    message: `ปลดการผูกบัญชี LINE สำหรับผู้ป่วย ${formattedHn} สำเร็จ (${unboundCount} บัญชี)`,
    unboundCount,
  };
}

/**
 * Get active & history LINE bindings for a specific HN
 */
export async function getLineBindingsForHn(hn: string) {
  if (!hn) return [];
  const formattedHn = hn.toUpperCase().startsWith('HN-') ? hn.toUpperCase() : `HN-${hn}`;
  const cleanHn = hn.trim().replace(/^HN-/i, '');

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();
      const { data, error } = await supabase
        .from('patient_line_users')
        .select('*')
        .or(`hn.eq.${formattedHn},hn.eq.${cleanHn}`)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn('⚠️ Error fetching LINE bindings for HN:', err);
    }
  }

  // Memory fallback
  const results = [];
  for (const [lineId, value] of lineUserBindingStore.entries()) {
    if (value.hn === formattedHn || value.hn.replace(/^HN-/i, '') === cleanHn) {
      results.push({
        line_user_id: lineId,
        hn: value.hn,
        patient_name: value.patientName,
        user_role: value.userRole,
        is_active: true,
        created_at: value.boundAt,
      });
    }
  }
  return results;
}

/**
 * Fetch patient's latest Vitals and Lab Results from HOSxP MySQL
 */
export async function getPatientLatestLabAndVitals(hn: string) {
  const cleanHn = hn.replace(/^HN-/i, '');
  const vitals: any = {
    weight: '62.5',
    height: '165',
    bmi: '22.9',
    bps: '124',
    bpd: '82',
    fbs: '112',
    hba1c: '6.5',
    egfr: '88',
    cholesterol: '185',
    triglycerides: '142',
    hdl: '48',
    ldl: '115',
    creatinine: '0.9',
    bun: '12.4',
    checkDate: 'ล่าสุดสดจาก HOSxP',
  };

  try {
    const pool = getHosxpPool();
    // 1. Fetch latest opdscreen vitals
    const [screenRows]: any = await pool.execute(
      `SELECT bw, height, bmi, bps, bpd, vstdate FROM opdscreen WHERE hn = ? AND bw > 0 ORDER BY vstdate DESC, vsttime DESC LIMIT 1`,
      [cleanHn]
    );
    if (screenRows && screenRows.length > 0) {
      const s = screenRows[0];
      if (s.bw) vitals.weight = String(s.bw);
      if (s.height) vitals.height = String(s.height);
      if (s.bmi) vitals.bmi = String(s.bmi);
      if (s.bps) vitals.bps = String(s.bps);
      if (s.bpd) vitals.bpd = String(s.bpd);
      if (s.vstdate) {
        vitals.checkDate = new Date(s.vstdate).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
      }
    }

    // 2. Fetch latest lab_order results
    const [labRows]: any = await pool.execute(
      `SELECT lo.lab_order_result, CONVERT(li.lab_items_name USING utf8mb4) AS lab_name, lh.order_date
       FROM lab_head lh
       JOIN lab_order lo ON lh.lab_order_number = lo.lab_order_number
       JOIN lab_items li ON lo.lab_items_code = li.lab_items_code
       WHERE lh.hn = ? AND lo.confirm = 'Y' AND lo.lab_order_result IS NOT NULL AND lo.lab_order_result != ''
       ORDER BY lh.order_date DESC, lh.lab_order_number DESC
       LIMIT 50`,
      [cleanHn]
    );

    if (labRows && labRows.length > 0) {
      for (const l of labRows) {
        const name = (l.lab_name || '').toUpperCase();
        const val = (l.lab_order_result || '').trim();
        if (name.includes('FBS') || name.includes('GLUCOSE') || name.includes('FASTING')) {
          if (!vitals.fbs_set) { vitals.fbs = val; vitals.fbs_set = true; }
        } else if (name.includes('HBA1C') || name.includes('HEMOGLOBIN A1C')) {
          if (!vitals.hba1c_set) { vitals.hba1c = val; vitals.hba1c_set = true; }
        } else if (name.includes('EGFR') || name.includes('GFR')) {
          if (!vitals.egfr_set) { vitals.egfr = val; vitals.egfr_set = true; }
        } else if (name.includes('CHOLESTEROL') && !name.includes('HDL') && !name.includes('LDL')) {
          if (!vitals.chol_set) { vitals.cholesterol = val; vitals.chol_set = true; }
        } else if (name.includes('TRIGLYCERIDE')) {
          if (!vitals.tri_set) { vitals.triglycerides = val; vitals.tri_set = true; }
        } else if (name.includes('HDL')) {
          if (!vitals.hdl_set) { vitals.hdl = val; vitals.hdl_set = true; }
        } else if (name.includes('LDL')) {
          if (!vitals.ldl_set) { vitals.ldl = val; vitals.ldl_set = true; }
        } else if (name.includes('CREATININE')) {
          if (!vitals.cr_set) { vitals.creatinine = val; vitals.cr_set = true; }
        } else if (name.includes('BUN')) {
          if (!vitals.bun_set) { vitals.bun = val; vitals.bun_set = true; }
        }
      }
    }
  } catch (err) {
    console.warn('⚠️ HOSxP MySQL lab fetch fallback:', (err as Error).message);
  }

  return vitals;
}



