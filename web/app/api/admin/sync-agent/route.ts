import { NextRequest, NextResponse } from 'next/server';
import { runSilentDeltaPush, getSilentPushAgentLastResult } from '@/lib/silentPushAgent';
import { getSilentPushDaemonStatus, startSilentPushDaemon, stopSilentPushDaemon } from '@/lib/silentAgentRunner';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/sync-agent
 * Inspect Silent Push Agent status, last run result, and daemon info
 */
export async function GET() {
  const daemonStatus = getSilentPushDaemonStatus();
  const lastResult = getSilentPushAgentLastResult();

  return NextResponse.json({
    success: true,
    system: 'Silent Background Push Agent & Daemon',
    daemonStatus,
    lastResult: lastResult || { message: 'ยังไม่มีการรัน Agent ในเซสชันปัจจุบัน' },
  });
}

/**
 * POST /api/admin/sync-agent
 * Trigger manual background delta push or control daemon (start/stop)
 */
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    if (action === 'start') {
      const res = startSilentPushDaemon();
      return NextResponse.json({ success: true, ...res });
    }

    if (action === 'stop') {
      const res = stopSilentPushDaemon();
      return NextResponse.json({ success: true, ...res });
    }

    // Default: Trigger manual silent delta push
    const result = await runSilentDeltaPush();
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'เกิดข้อผิดพลาดในการรัน Silent Push Agent' },
      { status: 500 }
    );
  }
}
