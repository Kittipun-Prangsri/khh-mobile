import { NextRequest, NextResponse } from 'next/server';
import { getCacheStats, clearHosxpCache } from '@/lib/hosxpCache';

export const dynamic = 'force-dynamic';

/**
 * GET /api/hosxp/cache
 * Inspect current HOSxP Cache memory status, cached keys, hits, and TTL
 */
export async function GET() {
  const stats = getCacheStats();
  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    system: 'HOSxP In-Memory Cache Engine',
    stats,
  });
}

/**
 * DELETE /api/hosxp/cache
 * Manually flush or invalidate HOSxP cache
 */
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pattern = searchParams.get('pattern') || undefined;

  const clearedCount = clearHosxpCache(pattern);

  return NextResponse.json({
    success: true,
    message: pattern
      ? `⚡ เคลียร์ Cache สำเร็จ สำหรับคีย์ '${pattern}' (${clearedCount} รายการ)`
      : `⚡ เคลียร์ Cache ทั้งหมดสำเร็จ (${clearedCount} รายการ)`,
    clearedCount,
  });
}

/**
 * POST /api/hosxp/cache
 * Trigger manual re-sync/refresh
 */
export async function POST(req: NextRequest) {
  const clearedCount = clearHosxpCache();
  return NextResponse.json({
    success: true,
    message: `⚡ รีเฟรชและล้าง Cache สำเร็จ (${clearedCount} รายการ) ข้อมูลคำร้องขอถัดไปจะดึงสดจาก HOSxP ใหม่`,
    clearedCount,
  });
}
