import { NextResponse } from 'next/server';
import { getHosxpPool } from '@/lib/hosxpClient';
import { getSupabaseFallbackPatients } from '@/lib/hosxpSyncService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = Number(searchParams.get('limit')) || 50;

    const pool = getHosxpPool();
    let sql = `SELECT DISTINCT p.hn, 
                      CONVERT(p.pname USING utf8mb4) as pname, 
                      CONVERT(p.fname USING utf8mb4) as fname, 
                      CONVERT(p.lname USING utf8mb4) as lname, 
                      p.birthday, p.sex, p.cid, p.mobile_phone_number, p.hometel, p.informtel 
               FROM patient p
               INNER JOIN clinicmember cm ON p.hn = cm.hn
               WHERE cm.clinic IN ('001', '002')`;
    const params: any[] = [];

    if (search.trim()) {
      const cleanHn = `%${search.trim().replace(/^HN-?/i, '')}%`;
      const searchPattern = `%${search.trim()}%`;
      sql += ` AND (p.hn LIKE ? 
                  OR p.cid LIKE ? 
                  OR CONVERT(p.fname USING utf8mb4) LIKE ? 
                  OR CONVERT(p.lname USING utf8mb4) LIKE ? 
                  OR CONVERT(CONCAT(COALESCE(p.pname,''), COALESCE(p.fname,''), ' ', COALESCE(p.lname,'')) USING utf8mb4) LIKE ?)`;
      params.push(cleanHn, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    sql += ` ORDER BY p.hn DESC LIMIT ?`;
    params.push(limit);

    const [rows]: any = await pool.execute(sql, params);

    const patients = rows.map((p: any) => ({
      id: p.hn,
      hn: p.hn.startsWith('HN-') ? p.hn : `HN-${p.hn}`,
      rawHn: p.hn,
      name: `${p.pname || ''}${p.fname || ''} ${p.lname || ''}`.trim() || 'ไม่ระบุชื่อ',
      cid: p.cid || '-',
      birthday: p.birthday,
      sex: p.sex === '1' ? 'ชาย' : 'หญิง',
      phone: p.mobile_phone_number || p.hometel || p.informtel || '081-000-0000',
      diseases: ['NCDs', 'DM/HT'],
      status: 'active',
    }));

    return NextResponse.json({ success: true, count: patients.length, patients });
  } catch (error: any) {
    console.warn('⚠️ Real HOSxP Patients API Error/Timeout. Serving Supabase Offline Fallback:', error.message);
    const fallback = await getSupabaseFallbackPatients();
    return NextResponse.json({
      success: true,
      count: fallback.patients.length,
      patients: fallback.patients,
      cacheInfo: {
        isCached: true,
        isSupabaseFallback: true,
        notice: '📡 อ่านข้อมูลผู้ป่วยสำรองจาก Supabase PostgreSQL (กรณี HOSxP LAN ไม่สามารถเชื่อมต่อได้)',
      },
    });
  }
}
