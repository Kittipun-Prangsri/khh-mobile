import { NextResponse } from 'next/server';
import { getHosxpPool } from '@/lib/hosxpClient';
import { getOrFetchHosxpCache } from '@/lib/hosxpCache';

export const dynamic = 'force-dynamic';

const STATS_CACHE_TTL_MS = 5 * 60 * 1000;

export async function GET() {
  try {
    const cachedResult = await getOrFetchHosxpCache('hosxp:registry:stats', STATS_CACHE_TTL_MS, async () => {
      const pool = getHosxpPool();

      const [dmCount]: any = await pool.execute("SELECT COUNT(DISTINCT hn) as total FROM clinicmember WHERE clinic = '001'");
      const [htCount]: any = await pool.execute("SELECT COUNT(DISTINCT hn) as total FROM clinicmember WHERE clinic = '002'");
      const [ckdCount]: any = await pool.execute("SELECT COUNT(DISTINCT hn) as total FROM clinicmember WHERE clinic = '030'");

      return {
        dmTotal: dmCount[0]?.total || 0,
        htTotal: htCount[0]?.total || 0,
        ckdTotal: ckdCount[0]?.total || 0,
        dmControlRate: 78,
        htControlRate: 82,
        uncontrolledCount: 14,
        overOneYearCount: 8,
        pendingScreeningCount: 19,
      };
    });

    return NextResponse.json({
      success: true,
      stats: cachedResult.data,
      cacheInfo: {
        isCached: cachedResult.isCached,
        cachedAt: cachedResult.cachedAt,
        ttlRemainingSeconds: cachedResult.ttlRemainingSeconds,
      },
    });
  } catch (error: any) {
    console.error('❌ Registry Stats API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
