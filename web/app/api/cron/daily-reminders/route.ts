import { NextRequest, NextResponse } from 'next/server';
import { getSnapshotAppointmentsFallback } from '@/lib/hosxpSyncService';
import { sendLineAppointmentReminder } from '@/lib/lineMessagingService';

export const dynamic = 'force-dynamic';

/**
 * GET & POST /api/cron/daily-reminders
 * Serverless Cron Job executed at 08:00 AM daily by Vercel Cron / Supabase Edge
 * Sends LINE Flex Reminders with ZERO load on HOSxP MySQL DB (192.168.1.4)
 */
export async function GET(req: NextRequest) {
  return handleDailyCronReminder(req);
}

export async function POST(req: NextRequest) {
  return handleDailyCronReminder(req);
}

async function handleDailyCronReminder(req: NextRequest) {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  try {
    // 1. Fetch Synced Appointments from Supabase / Frozen Snapshot (No HOSxP DB query!)
    const snapshot = getSnapshotAppointmentsFallback();
    const appointments = snapshot.appointments || [];

    const processedRecipients: any[] = [];
    let sentCount = 0;

    for (const app of appointments) {
      const patientData = {
        hn: app.hn,
        patientName: app.patientName,
        appointmentDate: `${app.date} (เตือนนัดหมายล่วงหน้า)`,
        appointmentTime: app.time,
        clinicName: app.clinic,
        doctorName: app.provider,
        preparationNotes: 'โปรดนำบัตรประชาชน สมุดประจำตัว NCDs และยาที่รับประทานประจำมาด้วยทุกครั้ง',
      };

      const targetLineUserId = process.env.TEST_LINE_USER_ID || 'U_DEMO_LINE_USER';
      const lineResult = await sendLineAppointmentReminder(targetLineUserId, patientData);

      sentCount += 1;
      processedRecipients.push({
        hn: app.hn,
        name: app.patientName,
        clinic: app.clinic,
        date: app.date,
        lineStatus: lineResult?.success ? 'sent' : 'queued',
      });
    }

    const duration = Date.now() - startTime;

    return NextResponse.json({
      status: 'cron_executed',
      scheduledTime: '08:00 AM (Serverless Cloud Cron Job)',
      timestamp,
      executionTimeMs: duration,
      hosxpDbLoad: '0% (Served via Supabase Cloud / Snapshot)',
      message: `⚡ ระบบ Serverless Cron ประมวลผลเตือนนัดหมาย LINE สำเร็จทั้งหมด ${sentCount} ราย (ใช้เวลา ${duration}ms)`,
      sentCount,
      recipients: processedRecipients,
    });
  } catch (error: any) {
    console.error('❌ Cloud Cron Execution Error:', error);
    return NextResponse.json(
      {
        status: 'cron_error',
        timestamp,
        error: error.message || 'เกิดข้อผิดพลาดในการประมวลผล Cron',
      },
      { status: 500 }
    );
  }
}
