import { sendLinePushTextMessage } from './lineMessagingService';

export interface PatientIncomingMessageNotificationParams {
  lineUserId: string;
  hn: string;
  patientName: string;
  text: string;
  category?: string;
}

/**
 * Send Instant Staff Notification when a patient sends a LINE message or submits a request.
 * Can broadcast to Staff Group LINE ID, Staff LINE User ID, or LINE Notify webhook token.
 */
export async function notifyStaffOnIncomingPatientMessage(params: PatientIncomingMessageNotificationParams) {
  const { lineUserId, hn, patientName, text, category } = params;
  if (!text || text.trim() === '') return;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://khhncd.khostime.site';
  const cleanHn = hn ? hn.toUpperCase() : 'HN-UNBOUND';
  const nowStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

  const alertCategory = category || '💬 ข้อความสอบถามทั่วไป';
  const chatPortalLink = `${appUrl}/reply?hn=${encodeURIComponent(cleanHn)}`;

  const alertText = `🔔 [KHH Safe-Connect] มีข้อความใหม่จากคนไข้!\n\n👤 คุณ${patientName} (${cleanHn})\n📌 หมวดหมู่: ${alertCategory}\n💬 ข้อความ: "${text.length > 80 ? text.slice(0, 80) + '...' : text}"\n⏰ เวลา: ${nowStr} น.\n\n👉 กดอ่านและตอบกลับได้ที่:\n${chatPortalLink}`;

  console.log(`🔔 Instant Staff Alert Triggered for ${patientName} (${cleanHn})`);

  // 1. Send via LINE Notify Token if configured (LINE Notify API)
  const lineNotifyToken = process.env.LINE_NOTIFY_TOKEN || process.env.STAFF_LINE_NOTIFY_TOKEN;
  if (lineNotifyToken) {
    try {
      await fetch('https://notify-api.line.me/api/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${lineNotifyToken}`,
        },
        body: new URLSearchParams({ message: alertText }).toString(),
      });
    } catch (err) {
      console.warn('⚠️ Error sending LINE Notify to staff group:', err);
    }
  }

  // 2. Send via LINE Push API to Staff LINE Group ID / Target Staff User ID if configured
  const staffTargetId = process.env.STAFF_LINE_GROUP_ID || process.env.STAFF_LINE_USER_ID;
  if (staffTargetId) {
    try {
      await sendLinePushTextMessage(staffTargetId, alertText, cleanHn);
    } catch (err) {
      console.warn('⚠️ Error pushing staff alert via LINE Push API:', err);
    }
  }

  return { success: true, alertText, chatPortalLink };
}
