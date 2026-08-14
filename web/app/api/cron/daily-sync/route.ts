import { NextResponse } from 'next/server';
import { getSyncConfig, syncHosxpToSupabase } from '@/lib/hosxpSyncService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const config = await getSyncConfig();

    if (!config.auto_sync_enabled) {
      return NextResponse.json({
        success: true,
        skipped: true,
        message: '⏸️ ข้ามการรัน Daily Sync เนื่องจาก Superadmin ปิดใช้งาน Auto-Sync',
        config,
      });
    }

    console.log('⏰ Automated Cron Trigger: Executing Daily Sync HOSxP -> Supabase...');
    const result = await syncHosxpToSupabase();

    return NextResponse.json({
      success: result.success,
      timestamp: new Date().toISOString(),
      result,
    });
  } catch (error: any) {
    console.error('❌ Daily Cron Sync Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
