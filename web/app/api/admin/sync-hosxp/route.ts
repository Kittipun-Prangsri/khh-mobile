import { NextResponse } from 'next/server';
import { getSyncConfig, updateSyncConfig, syncHosxpToSupabase } from '@/lib/hosxpSyncService';

export const dynamic = 'force-dynamic';

/**
 * GET: Fetch Superadmin Sync Configuration Status
 */
export async function GET() {
  try {
    const config = await getSyncConfig();
    return NextResponse.json({
      success: true,
      config,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST: Trigger Immediate HOSxP ➔ Supabase Sync (Sync Now Button)
 */
export async function POST() {
  try {
    const result = await syncHosxpToSupabase();
    const config = await getSyncConfig();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `✅ ซิงก์ข้อมูลจาก HOSxP เข้าสู่ Supabase เรียบร้อยแล้ว (${result.syncedPatientsCount} ผู้ป่วย, ${result.syncedAppointmentsCount} นัดหมาย)`,
        result,
        config,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'เกิดข้อผิดพลาดในการเชื่อมต่อเพื่อซิงก์ข้อมูล',
          config,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * PUT: Update Superadmin Daily Sync Schedule (e.g. daily_sync_time = "02:00", auto_sync_enabled = true)
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { daily_sync_time, auto_sync_enabled } = body;

    const updatedConfig = await updateSyncConfig({
      daily_sync_time: daily_sync_time || '02:00',
      auto_sync_enabled: typeof auto_sync_enabled === 'boolean' ? auto_sync_enabled : true,
    });

    return NextResponse.json({
      success: true,
      message: `💾 บันทึกการตั้งค่าเวลาซิงก์ข้อมูลประจำวัน (${updatedConfig.daily_sync_time} น.) เรียบร้อยแล้ว`,
      config: updatedConfig,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
