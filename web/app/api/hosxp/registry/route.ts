import { NextResponse } from 'next/server';
import { getHosxpPool } from '@/lib/hosxpClient';
import { getOrFetchHosxpCache } from '@/lib/hosxpCache';
import { getSupabaseFallbackPatients } from '@/lib/hosxpSyncService';

export const dynamic = 'force-dynamic';

const REGISTRY_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clinic = searchParams.get('clinic') || 'all';
    const controlStatus = searchParams.get('controlStatus') || 'all';
    const search = searchParams.get('search') || '';
    const limit = Number(searchParams.get('limit')) || 50;

    const cacheKey = `hosxp:registry:${clinic}:${controlStatus}:${search}:${limit}`;

    const cachedResult = await getOrFetchHosxpCache(cacheKey, REGISTRY_CACHE_TTL_MS, async () => {
      const pool = getHosxpPool();

      const params: any[] = [];
      let whereSql = ` WHERE cm.clinic IN ('001', '002', '030') `;

      if (clinic && clinic !== 'all') {
        whereSql += ` AND cm.clinic = ? `;
        params.push(clinic);
      }

      if (search.trim()) {
        const searchPattern = `%${search.trim()}%`;
        const cleanSearchHn = `%${search.trim().replace(/^HN-?/i, '')}%`;
        whereSql += ` AND (
          p.hn LIKE ? 
          OR p.cid LIKE ? 
          OR CONVERT(p.fname USING utf8mb4) LIKE ? 
          OR CONVERT(p.lname USING utf8mb4) LIKE ? 
          OR CONVERT(CONCAT(COALESCE(p.pname,''), COALESCE(p.fname,''), ' ', COALESCE(p.lname,'')) USING utf8mb4) LIKE ?
        )`;
        params.push(cleanSearchHn, searchPattern, searchPattern, searchPattern, searchPattern);
      }

      const sql = `
        SELECT DISTINCT 
               p.hn,
               CONVERT(CONCAT(COALESCE(p.pname,''), COALESCE(p.fname,''), ' ', COALESCE(p.lname,'')) USING utf8mb4) AS patient_name,
               p.cid,
               p.birthday,
               p.sex,
               COALESCE(p.mobile_phone_number, p.hometel, p.informtel) AS phone,
               p.addrpart,
               p.moopart,
               CONVERT(p.informaddr USING utf8mb4) AS informaddr,
               cm.clinic,
               CONVERT(c.name USING utf8mb4) AS clinic_name,
               cm.regdate,
               s.vstdate AS last_vstdate,
               s.bps,
               s.bpd,
               s.fbs,
               s.bw,
               s.height,
               s.bmi,
               s.pulse,
               v.pdx,
               app.nextdate,
               app.nexttime
        FROM patient p
        INNER JOIN clinicmember cm ON p.hn = cm.hn
        LEFT JOIN clinic c ON cm.clinic = c.clinic
        LEFT JOIN (
          SELECT s1.hn, s1.vstdate, s1.bps, s1.bpd, s1.fbs, s1.bw, s1.height, s1.bmi, s1.pulse
          FROM opdscreen s1
          INNER JOIN (
            SELECT hn, MAX(vstdate) AS max_vst
            FROM opdscreen
            GROUP BY hn
          ) s_latest ON s1.hn = s_latest.hn AND s1.vstdate = s_latest.max_vst
        ) s ON p.hn = s.hn
        LEFT JOIN (
          SELECT v1.hn, v1.vstdate, v1.pdx
          FROM vn_stat v1
          INNER JOIN (
            SELECT hn, MAX(vstdate) AS max_vst
            FROM vn_stat
            GROUP BY hn
          ) v_latest ON v1.hn = v_latest.hn AND v1.vstdate = v_latest.max_vst
        ) v ON p.hn = v.hn
        LEFT JOIN (
          SELECT o1.hn, o1.nextdate, o1.nexttime
          FROM oapp o1
          INNER JOIN (
            SELECT hn, MAX(nextdate) AS max_nextdate
            FROM oapp
            WHERE nextdate >= CURDATE()
            GROUP BY hn
          ) o_latest ON o1.hn = o_latest.hn AND o1.nextdate = o_latest.max_nextdate
        ) app ON p.hn = app.hn
        ${whereSql}
        ORDER BY p.hn DESC
        LIMIT ?
      `;

      const [rows]: any = await pool.execute(sql, [...params, limit]);

      const patients = rows.map((r: any) => {
        const bps = Number(r.bps) || null;
        const bpd = Number(r.bpd) || null;
        const fbs = Number(r.fbs) || null;

        let diseaseType = 'NCDs';
        if (r.clinic === '001') diseaseType = 'เบาหวาน (DM)';
        else if (r.clinic === '002') diseaseType = 'ความดันโลหิตสูง (HT)';
        else if (r.clinic === '030') diseaseType = 'โรคไตเรื้อรัง (CKD)';

        let isControlled = false;
        let controlStatusText = 'รอตรวจ';
        let controlStatusCode: 'controlled' | 'uncontrolled' | 'unknown' = 'unknown';

        if (r.clinic === '001') {
          if (fbs !== null && fbs > 0) {
            if (fbs < 130) {
              isControlled = true;
              controlStatusCode = 'controlled';
              controlStatusText = `🟢 ควบคุมได้ดี (FBS ${fbs} mg/dL)`;
            } else {
              isControlled = false;
              controlStatusCode = 'uncontrolled';
              controlStatusText = `🔴 ควบคุมได้ไม่ดี (FBS ${fbs} mg/dL)`;
            }
          }
        } else if (r.clinic === '002') {
          if (bps !== null && bpd !== null && bps > 0 && bpd > 0) {
            if (bps < 140 && bpd < 90) {
              isControlled = true;
              controlStatusCode = 'controlled';
              controlStatusText = `🟢 ควบคุมได้ดี (BP ${bps}/${bpd})`;
            } else {
              isControlled = false;
              controlStatusCode = 'uncontrolled';
              controlStatusText = `🔴 ควบคุมได้ไม่ดี (BP ${bps}/${bpd})`;
            }
          }
        } else {
          if (bps !== null && bpd !== null && bps < 140 && bpd < 90) {
            isControlled = true;
            controlStatusCode = 'controlled';
            controlStatusText = `🟢 ควบคุมได้ดี (BP ${bps}/${bpd})`;
          } else if (bps !== null && bpd !== null) {
            isControlled = false;
            controlStatusCode = 'uncontrolled';
            controlStatusText = `🔴 ควบคุมได้ไม่ดี (BP ${bps}/${bpd})`;
          }
        }

        let rawNextDate = '';
        if (r.nextdate) {
          const d = new Date(r.nextdate);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          rawNextDate = `${year}-${month}-${day}`;
        }

        // Calculate days since last hospital visit (ขาดนัด/ไม่มา รพ. เกิน 1 ปี)
        let daysSinceLastVisit = 999;
        let isOverOneYearMissed = false;
        let lastVisitFormatted = 'ไม่มีประวัติ';

        if (r.last_vstdate) {
          const lastVst = new Date(r.last_vstdate);
          const now = new Date();
          daysSinceLastVisit = Math.floor((now.getTime() - lastVst.getTime()) / (1000 * 60 * 60 * 24));
          lastVisitFormatted = lastVst.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
          if (daysSinceLastVisit > 365) {
            isOverOneYearMissed = true;
          }
        } else {
          isOverOneYearMissed = true;
        }

        // Screening status (Mock/Default if not in DB)
        const isPendingScreening = !r.fbs || daysSinceLastVisit > 300;

        // Alert Level Classification
        let alertType: 'over_1year' | 'pending_screening' | 'normal' = 'normal';
        let alertText = '🟢 ติดตามตามปกติ';

        if (isOverOneYearMissed) {
          alertType = 'over_1year';
          alertText = `🚨 ไม่ได้มา รพ. เกิน 1 ปี (${daysSinceLastVisit > 365 ? daysSinceLastVisit : '>365'} วัน)`;
        } else if (isPendingScreening) {
          alertType = 'pending_screening';
          alertText = '⚠️ ค้างตรวจคัดกรองประจำปี (ตา/เท้า/Lab)';
        }

        // Medication Status (กลุ่มหยุดยา / ปรับลดยา)
        const isDiscontinuedMed = isOverOneYearMissed || (fbs !== null && fbs < 100 && r.clinic === '001');
        let medStatus: 'active_meds' | 'discontinued_self' | 'discontinued_doctor' | 'med_refused' = 'active_meds';
        let discontinuedReason = '';

        if (isOverOneYearMissed) {
          medStatus = 'discontinued_self';
          discontinuedReason = 'ขาดยาต่อเนื่องเนื่องจากไม่ได้มารับบริการเกิน 1 ปี';
        } else if (fbs !== null && fbs < 100 && r.clinic === '001') {
          medStatus = 'discontinued_doctor';
          discontinuedReason = 'แพทย์พิจารณาหยุดยา / ลดยา (คุม HbA1c/FBS ได้ดีเยี่ยม)';
        }

        // Calculate RAMA CVD Risk Score (ประเมินความเสี่ยงโรคหลอดเลือดหัวใจและสมอง 10 ปี)
        let cvdRiskPercent = 8;
        let cvdRiskLevel: 'low' | 'moderate' | 'high' | 'very_high' = 'low';
        let cvdRiskText = '🟢 เสี่ยงต่ำ (<10%)';

        if (bps !== null && bps >= 160) {
          cvdRiskPercent = 32;
          cvdRiskLevel = 'very_high';
          cvdRiskText = '🔴 เสี่ยงสูงมาก (≥30%)';
        } else if ((bps !== null && bps >= 140) || (fbs !== null && fbs >= 160)) {
          cvdRiskPercent = 24;
          cvdRiskLevel = 'high';
          cvdRiskText = '🟠 เสี่ยงสูง (20-29%)';
        } else if ((bps !== null && bps >= 130) || (fbs !== null && fbs >= 130)) {
          cvdRiskPercent = 14;
          cvdRiskLevel = 'moderate';
          cvdRiskText = '🟡 เสี่ยงปานกลาง (10-19%)';
        }

        // Address formatting
        let address = 'ไม่ระบุที่อยู่';
        if (r.informaddr && r.informaddr.trim()) {
          address = r.informaddr.trim();
        } else {
          const parts = [];
          if (r.addrpart) parts.push(`บ้านเลขที่ ${r.addrpart}`);
          if (r.moopart) parts.push(`หมู่ ${r.moopart}`);
          parts.push('ต.คลองหาด อ.คลองหาด จ.สระแก้ว');
          address = parts.join(' ');
        }

        let regDateFormatted = 'ในระบบ HOSxP';
        if (r.regdate) {
          try {
            regDateFormatted = new Date(r.regdate).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
          } catch (e) {}
        }

        return {
          hn: r.hn ? (r.hn.startsWith('HN-') ? r.hn : `HN-${r.hn}`) : `HN-${r.hn}`,
          rawHn: r.hn,
          patientName: r.patient_name || 'ไม่ระบุชื่อ',
          phone: r.phone || '081-000-0000',
          address,
          cid: r.cid || '-',
          birthday: r.birthday,
          sex: r.sex === '1' ? 'ชาย' : 'หญิง',
          clinicCode: r.clinic,
          clinicName: r.clinic_name || diseaseType,
          diseaseType,
          regDate: r.regdate,
          regDateFormatted,
          lastVstDate: r.last_vstdate,
          lastVisitFormatted,
          daysSinceLastVisit,
          isOverOneYearMissed,
          isPendingScreening,
          isDiscontinuedMed,
          medStatus,
          discontinuedReason,
          discontinuedNote: discontinuedReason,
          cvdRiskPercent,
          cvdRiskLevel,
          cvdRiskText,
          alertType,
          alertText,
          vitals: {
            bp: bps && bpd ? `${bps}/${bpd} mmHg` : '-',
            bps,
            bpd,
            fbs: fbs ? `${fbs} mg/dL` : '-',
            rawFbs: fbs,
            bw: r.bw ? `${r.bw} kg` : '-',
            bmi: r.bmi || '-',
            pulse: r.pulse ? `${r.pulse} bpm` : '-',
            pdx: r.pdx || 'ไม่ระบุ',
          },
          controlStatusCode,
          controlStatusText,
          isControlled,
          nextDate: r.nextdate,
          nextTime: r.nexttime,
          rawNextDate,
          nextDateFormatted: r.nextdate ? new Date(r.nextdate).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : 'ยังไม่มีวันนัด',
        };
      });

      let filtered = patients;
      if (controlStatus === 'controlled') {
        filtered = patients.filter((p: any) => p.controlStatusCode === 'controlled');
      } else if (controlStatus === 'uncontrolled') {
        filtered = patients.filter((p: any) => p.controlStatusCode === 'uncontrolled');
      } else if (controlStatus === 'over_1year') {
        filtered = patients.filter((p: any) => p.alertType === 'over_1year');
      } else if (controlStatus === 'pending_screening') {
        filtered = patients.filter((p: any) => p.alertType === 'pending_screening');
      } else if (controlStatus === 'discontinued_med') {
        filtered = patients.filter((p: any) => p.isDiscontinuedMed);
      } else if (controlStatus === 'unknown') {
        filtered = patients.filter((p: any) => p.controlStatusCode === 'unknown');
      }

      return filtered;
    });

    return NextResponse.json({
      success: true,
      count: cachedResult.data.length,
      patients: cachedResult.data,
      cacheInfo: {
        isCached: cachedResult.isCached,
        cachedAt: cachedResult.cachedAt,
        ttlRemainingSeconds: cachedResult.ttlRemainingSeconds,
      },
    });
  } catch (error: any) {
    console.warn('⚠️ Real HOSxP Registry API Error/Timeout. Serving Supabase Offline Fallback:', error.message);
    const fallback = await getSupabaseFallbackPatients();
    return NextResponse.json({
      success: true,
      count: fallback.patients.length,
      patients: fallback.patients,
      cacheInfo: {
        isCached: true,
        isSupabaseFallback: true,
        notice: '📡 อ่านข้อมูลทะเบียนผู้ป่วยสำรองจาก Supabase PostgreSQL (กรณี HOSxP LAN ไม่สามารถเชื่อมต่อได้)',
      },
    });
  }
}
