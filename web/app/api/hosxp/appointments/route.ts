import { NextResponse } from 'next/server';
import { getHosxpPool } from '@/lib/hosxpClient';
import { getOrFetchHosxpCache } from '@/lib/hosxpCache';
import { getSnapshotAppointmentsFallback } from '@/lib/hosxpSyncService';

export const dynamic = 'force-dynamic';

// 10 Minutes Cache TTL for Appointments List
const APPOINTMENTS_CACHE_TTL_MS = 10 * 60 * 1000;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    const cacheKey = `hosxp:appointments:${startDate}:${endDate}`;

    const cachedResult = await getOrFetchHosxpCache(cacheKey, APPOINTMENTS_CACHE_TTL_MS, async () => {
      const pool = getHosxpPool();
      let query = `SELECT o.oapp_id, o.hn, 
                CONVERT(CONCAT(COALESCE(p.pname,''), COALESCE(p.fname,''), ' ', COALESCE(p.lname,'')) USING utf8mb4) AS patient_name, 
                COALESCE(p.mobile_phone_number, p.hometel, p.informtel) AS phone,
                o.nextdate, o.nexttime, o.clinic, 
                CONVERT(c.name USING utf8mb4) AS clinic_name, 
                o.doctor, 
                CONVERT(d.name USING utf8mb4) AS doctor_name, 
                CONVERT(o.app_cause USING utf8mb4) AS app_cause
         FROM oapp o
         INNER JOIN (
            SELECT hn, MAX(nextdate) AS max_nextdate
            FROM oapp
            WHERE nextdate >= CURDATE()
            GROUP BY hn
         ) latest ON o.hn = latest.hn AND o.nextdate = latest.max_nextdate
         LEFT JOIN patient p ON o.hn = p.hn
         LEFT JOIN clinic c ON o.clinic = c.clinic
         LEFT JOIN doctor d ON o.doctor = d.code
         WHERE o.clinic IN ('001', '002')`;
      
      const params: any[] = [];
      if (startDate && endDate) {
        query += ` AND o.nextdate BETWEEN ? AND ?`;
        params.push(startDate, endDate);
      } else if (startDate) {
        query += ` AND o.nextdate >= ?`;
        params.push(startDate);
      } else if (endDate) {
        query += ` AND o.nextdate <= ?`;
        params.push(endDate);
      }

      query += ` GROUP BY o.oapp_id ORDER BY o.nextdate DESC, o.nexttime DESC LIMIT 100`;

      const [rows]: any = await pool.execute(query, params);

      const appointments = rows.map((r: any) => {
        let rawDate = '';
        if (r.nextdate) {
          const d = new Date(r.nextdate);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          rawDate = `${year}-${month}-${day}`;
        }
        return {
          id: String(r.oapp_id),
          hn: r.hn ? (r.hn.startsWith('HN-') ? r.hn : `HN-${r.hn}`) : 'HN-0000',
          patientName: r.patient_name || 'ไม่ระบุชื่อ',
          phone: r.phone || '081-234-5678',
          rawDate: rawDate,
          date: r.nextdate ? new Date(r.nextdate).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : '-',
          time: r.nexttime ? `${r.nexttime} น.` : '08:30 น.',
          clinic: r.clinic_name || 'คลินิก NCDs',
          provider: r.doctor_name || 'แพทย์ผู้ตรวจ',
          type: r.app_cause || 'ตรวจติดตามอาการ NCDs',
          status: 'confirmed',
          lineNotified: true,
        };
      });

      return appointments;
    });

    return NextResponse.json({
      success: true,
      count: cachedResult.data.length,
      appointments: cachedResult.data,
      cacheInfo: {
        isCached: cachedResult.isCached,
        cachedAt: cachedResult.cachedAt,
        ttlRemainingSeconds: cachedResult.ttlRemainingSeconds,
      },
    });
  } catch (error: any) {
    console.warn('⚠️ Real HOSxP Appointments DB Query Error/Timeout. Serving Freeze Snapshot Fallback:', error.message);
    const snapshot = getSnapshotAppointmentsFallback();
    return NextResponse.json({
      success: true,
      count: snapshot.appointments.length,
      appointments: snapshot.appointments,
      cacheInfo: {
        isCached: true,
        isSnapshotFallback: true,
        notice: 'ดึงข้อมูลนัดหมายสแนปชอตสำรอง (Freeze Snapshot) เนื่องจากไม่พบการเชื่อมต่อ HOSxP 192.168.1.4',
      },
    });
  }
}

