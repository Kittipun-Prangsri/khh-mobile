import { NextResponse } from 'next/server';
import { getHosxpPool } from '@/lib/hosxpClient';
import { getOrFetchHosxpCache } from '@/lib/hosxpCache';
import { getSnapshotStatsFallback, getSupabaseFallbackAppointments } from '@/lib/hosxpSyncService';

export const dynamic = 'force-dynamic';

// 5 Minutes Cache TTL for Dashboard Stats
const STATS_CACHE_TTL_MS = 5 * 60 * 1000;

export async function GET() {
  try {
    const cachedResult = await getOrFetchHosxpCache('hosxp:stats', STATS_CACHE_TTL_MS, async () => {
      const pool = getHosxpPool();

      // 1. Total Patients in Clinic Member (001, 002)
      const [patientCount]: any = await pool.execute("SELECT COUNT(DISTINCT hn) as total FROM clinicmember WHERE clinic IN ('001', '002')");

      // 2. Appointments Today
      const [todayCount]: any = await pool.execute("SELECT COUNT(*) as total FROM oapp WHERE nextdate = CURDATE() AND clinic IN ('001', '002')");

      // 3. Upcoming Appointments
      const [upcomingCount]: any = await pool.execute("SELECT COUNT(*) as total FROM oapp WHERE nextdate > CURDATE() AND clinic IN ('001', '002')");

      // 4. Missed Appointments (Follow-ups needed in past 30 days)
      const [missedCount]: any = await pool.execute(
        "SELECT COUNT(*) as total FROM oapp WHERE nextdate < CURDATE() AND nextdate >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) AND clinic IN ('001', '002')"
      );

      // 5. Recent Appointments List (Convert TIS-620 Thai strings to utf8mb4)
      const [recentApps]: any = await pool.execute(`
        SELECT o.oapp_id, o.hn, 
               CONVERT(CONCAT(COALESCE(p.pname,''), COALESCE(p.fname,''), ' ', COALESCE(p.lname,'')) USING utf8mb4) AS patient_name,
               o.nextdate, o.nexttime, 
               CONVERT(c.name USING utf8mb4) AS clinic_name, 
               CONVERT(d.name USING utf8mb4) AS doctor_name, 
               CONVERT(o.app_cause USING utf8mb4) AS app_cause
        FROM oapp o
        LEFT JOIN patient p ON o.hn = p.hn
        LEFT JOIN clinic c ON o.clinic = c.clinic
        LEFT JOIN doctor d ON o.doctor = d.code
        WHERE o.nextdate >= CURDATE() AND o.clinic IN ('001', '002')
        ORDER BY o.nextdate ASC, o.nexttime ASC
        LIMIT 6
      `);

      const formattedRecent = recentApps.map((r: any) => ({
        id: String(r.oapp_id),
        hn: r.hn ? (r.hn.startsWith('HN-') ? r.hn : `HN-${r.hn}`) : 'HN-0000',
        patientName: r.patient_name || 'ไม่ระบุชื่อ',
        date: r.nextdate ? new Date(r.nextdate).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : '-',
        time: r.nexttime ? `${r.nexttime} น.` : '08:30 น.',
        clinic: r.clinic_name || 'คลินิก NCDs',
        doctor: r.doctor_name || 'แพทย์ผู้ตรวจ',
        status: 'confirmed',
      }));

      return {
        stats: {
          totalPatients: patientCount[0].total,
          appointmentsToday: todayCount[0].total,
          upcomingAppointments: upcomingCount[0].total,
          missedFollowUps: missedCount[0].total,
        },
        recentAppointments: formattedRecent,
      };
    });

    return NextResponse.json({
      success: true,
      ...cachedResult.data,
      cacheInfo: {
        isCached: cachedResult.isCached,
        cachedAt: cachedResult.cachedAt,
        ttlRemainingSeconds: cachedResult.ttlRemainingSeconds,
      },
    });
  } catch (error: any) {
    console.warn('⚠️ Real HOSxP Stats DB Query Error/Timeout. Serving Supabase Offline Fallback:', error.message);
    const supabaseFallback = await getSupabaseFallbackAppointments();
    const snapshot = getSnapshotStatsFallback();

    return NextResponse.json({
      success: true,
      stats: snapshot.stats,
      recentAppointments: supabaseFallback.appointments.slice(0, 6),
      cacheInfo: {
        isCached: true,
        isSupabaseFallback: true,
        notice: '📡 อ่านข้อมูลสำรองจาก Supabase PostgreSQL เนื่องจากไม่สามารถเชื่อมต่อเครื่องเซิร์ฟเวอร์ HOSxP LAN (192.168.1.4)',
      },
    });
  }
}

