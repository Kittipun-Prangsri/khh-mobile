import { NextRequest, NextResponse } from 'next/server';
import { unbindLineUserFromHn, getLineBindingsForHn } from '@/lib/lineUserService';

export const dynamic = 'force-dynamic';

/**
 * GET /api/line/binding?hn=HN-XXXXX
 * Fetch bound LINE accounts for a specific HN
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const hn = searchParams.get('hn');

  if (!hn) {
    return NextResponse.json({ success: false, message: 'กรุณาระบุ HN' }, { status: 400 });
  }

  const bindings = await getLineBindingsForHn(hn);
  return NextResponse.json({
    success: true,
    hn,
    bindings,
  });
}

/**
 * POST /api/line/binding
 * Unbind LINE account or update role (Staff Action via Web Dashboard)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { hn, lineUserId, reason } = body;

    if (!hn) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุ HN' }, { status: 400 });
    }

    const result = await unbindLineUserFromHn(
      hn,
      lineUserId || undefined,
      reason || 'Staff requested unbind from Web Dashboard'
    );

    return NextResponse.json({
      success: result.success,
      message: result.message,
      unboundCount: result.unboundCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'เกิดข้อผิดพลาดในการปลดการผูกบัญชี LINE' },
      { status: 500 }
    );
  }
}
