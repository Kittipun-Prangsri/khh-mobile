import { NextResponse } from 'next/server';
import { getRecentLoginActivity } from '@/lib/loginActivityLog';

export const dynamic = 'force-dynamic';

/**
 * Who's been logging in. Restricted to super_admin — middleware already
 * requires a valid session for this path, this adds the role check on top.
 */
export async function GET(request: Request) {
  const role = request.headers.get('x-khh-user-role');
  if (role !== 'super_admin') {
    return NextResponse.json(
      { success: false, message: 'เฉพาะผู้ดูแลระบบ (Super Admin) เท่านั้นที่ดูประวัติการเข้าใช้งานได้' },
      { status: 403 }
    );
  }

  const logs = await getRecentLoginActivity(200);
  return NextResponse.json({ success: true, logs });
}
