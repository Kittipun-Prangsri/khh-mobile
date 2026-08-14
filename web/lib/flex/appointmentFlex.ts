/**
 * Appointment Management LINE Flex Message Templates
 * Hospital: Khlong Hat Hospital (โรงพยาบาลคลองหาด)
 */

import { KHH_CONTACTS, KHH_COLORS } from './flexConstants';

export interface AppointmentNotificationData {
  hn: string;
  patientName: string;
  appointmentDate: string; // e.g. "1 สิงหาคม 2026"
  appointmentTime: string; // e.g. "09:00 น."
  clinicName: string;      // e.g. "คลินิกเบาหวาน"
  doctorName?: string;     // e.g. "พญ. วรรณภา จิตดี"
  preparationNotes?: string; // e.g. "งดน้ำและอาหารหลัง 20:00 น."
  location?: string;       // e.g. "อาคารผู้ป่วยนอก ชั้น 2"
}

/**
 * Generate Hospital Standard Flex Message for Appointment Reminders (with Self Check-in QR & 1-Click Family Share)
 */
export function createAppointmentFlexMessage(data: AppointmentNotificationData) {
  const qrData = encodeURIComponent(`KHH-CHECKIN:${data.hn}:${data.appointmentDate}`);
  const rawShareText = `🗓️ใบนัดตรวจ รพ.คลองหาด\nคุณ${data.patientName.slice(0, 30)} (${data.hn})\n📅 ${data.appointmentDate.slice(0, 40)}\n⏰ ${data.appointmentTime}\n🏥 ${data.clinicName.slice(0, 30)}`;
  const shareUri = `https://line.me/R/msg/text/?${encodeURIComponent(rawShareText)}`;

  return {
    type: 'flex',
    altText: `🗓️ แจ้งเตือนนัดหมายตรวจติดตามอาการ: คุณ${data.patientName} (${data.appointmentDate})`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: KHH_COLORS.DARK_TEAL,
        paddingAll: 'lg',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: 'KHH SAFE-CONNECT',
                color: '#13A89E',
                size: 'xs',
                weight: 'bold',
                flex: 1,
              },
              {
                type: 'text',
                text: 'แจ้งเตือนวันนัดหมาย',
                color: '#FFFFFF',
                size: 'xs',
                align: 'end',
                weight: 'bold',
              },
            ],
          },
          {
            type: 'text',
            text: KHH_CONTACTS.HOSPITAL_SHORT,
            color: '#FFFFFF',
            size: 'md',
            weight: 'bold',
            margin: 'xs',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: 'lg',
        spacing: 'md',
        contents: [
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: KHH_COLORS.LIGHT_TEAL_BG,
            cornerRadius: 'md',
            paddingAll: 'md',
            borderColor: KHH_COLORS.LIGHT_TEAL_BORDER,
            borderWidth: '1px',
            contents: [
              {
                type: 'text',
                text: '👤 ข้อมูลผู้ป่วย',
                size: 'xs',
                color: '#0F766E',
                weight: 'bold',
              },
              {
                type: 'text',
                text: `${data.patientName}`,
                size: 'lg',
                color: KHH_COLORS.TEXT_MAIN,
                weight: 'bold',
                margin: 'xs',
              },
              {
                type: 'text',
                text: `HN: ${data.hn}`,
                size: 'xs',
                color: KHH_COLORS.DARK_TEAL,
                weight: 'bold',
              },
            ],
          },
          {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: '📅 วันนัดตรวจ:',
                    size: 'xs',
                    color: KHH_COLORS.TEXT_MUTED,
                    flex: 2,
                  },
                  {
                    type: 'text',
                    text: `${data.appointmentDate}`,
                    size: 'xs',
                    color: KHH_COLORS.TEXT_MAIN,
                    weight: 'bold',
                    flex: 3,
                  },
                ],
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: '⏰ เวลา:',
                    size: 'xs',
                    color: KHH_COLORS.TEXT_MUTED,
                    flex: 2,
                  },
                  {
                    type: 'text',
                    text: `${data.appointmentTime}`,
                    size: 'xs',
                    color: KHH_COLORS.PRIMARY_TEAL,
                    weight: 'bold',
                    flex: 3,
                  },
                ],
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: '🏥 คลินิก:',
                    size: 'xs',
                    color: KHH_COLORS.TEXT_MUTED,
                    flex: 2,
                  },
                  {
                    type: 'text',
                    text: `${data.clinicName}`,
                    size: 'xs',
                    color: KHH_COLORS.TEXT_MAIN,
                    weight: 'bold',
                    flex: 3,
                  },
                ],
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: '👨‍⚕️ แพทย์:',
                    size: 'xs',
                    color: KHH_COLORS.TEXT_MUTED,
                    flex: 2,
                  },
                  {
                    type: 'text',
                    text: `${data.doctorName || 'แพทย์ประจำคลินิก'}`,
                    size: 'xs',
                    color: KHH_COLORS.TEXT_MAIN,
                    flex: 3,
                  },
                ],
              },
            ],
          },

          // Self Check-in Kiosk QR Code Innovation
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#FFFFFF',
            cornerRadius: 'md',
            paddingAll: 'md',
            borderColor: '#CCFBF1',
            borderWidth: '1px',
            alignItems: 'center',
            contents: [
              {
                type: 'text',
                text: '📲 สแกน QR Code รับคิวอัตโนมัติ (KHH Self Check-in)',
                size: 'xs',
                color: KHH_COLORS.PRIMARY_TEAL,
                weight: 'bold',
                align: 'center',
                wrap: true,
              },
              {
                type: 'image',
                url: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrData}`,
                size: 'sm',
                aspectRatio: '1:1',
                margin: 'sm',
              },
              {
                type: 'text',
                text: 'สแกน QR Code หน้าจอนี้ที่ตู้คิวอัตโนมัติหน้าคลินิก NCDs เพื่อรับคิวตรวจได้ทันที',
                size: 'xs',
                color: KHH_COLORS.TEXT_MUTED,
                align: 'center',
                margin: 'xs',
                wrap: true,
              },
            ],
          },

          {
            type: 'separator',
            color: '#E2E8F0',
          },
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: KHH_COLORS.BG_LIGHT_AMBER,
            cornerRadius: 'md',
            paddingAll: 'sm',
            contents: [
              {
                type: 'text',
                text: '💡 ข้อแนะนำการเตรียมตัว:',
                size: 'xs',
                color: '#B45309',
                weight: 'bold',
              },
              {
                type: 'text',
                text: `${data.preparationNotes || 'โปรดนำบัตรประชาชนและยาที่รับประทานประจำมาด้วยทุกครั้ง'}`,
                size: 'xs',
                color: '#78350F',
                wrap: true,
                margin: 'xs',
              },
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        paddingAll: 'md',
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: KHH_COLORS.PRIMARY_TEAL,
            height: 'sm',
            action: {
              type: 'message',
              label: '🟢 ยืนยันมาตามนัด',
              text: `ยืนยันนัด`,
            },
          },
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'message',
              label: '🟡 ขอเลื่อนวันนัด',
              text: `ขอเลื่อนนัด`,
            },
          },
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'uri',
              label: '📤 แชร์ใบนัดให้ลูกหลานช่วยจำ',
              uri: shareUri,
            },
          },
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'uri',
              label: KHH_CONTACTS.MAPS_LABEL,
              uri: KHH_CONTACTS.MAPS_LOCATION_URI,
            },
          },
        ],
      },
    },
  };
}

/**
 * 1. Tile 1: "นัดหมายของฉัน"
 */
export function createMyAppointmentsFlex(
  patientName: string = 'ผู้ป่วย NCDs',
  hn: string = 'HN-00000',
  appointments?: Array<{
    appointmentDate: string;
    appointmentTime: string;
    clinicName: string;
    doctorName?: string;
    cause?: string;
    preparationNotes?: string;
  }>
) {
  // If NO active appointments exist in database for this patient, render 'No Appointments Found' Flex Card
  if (!appointments || appointments.length === 0) {
    return {
      type: 'flex',
      altText: `🗓️ รายการนัดหมาย: คุณ${patientName} (${hn}) - ยังไม่มีรายการนัดหมาย`,
      contents: {
        type: 'bubble',
        size: 'mega',
        header: {
          type: 'box',
          layout: 'vertical',
          backgroundColor: '#0F766E',
          paddingAll: 'lg',
          contents: [
            {
              type: 'text',
              text: '🗓️ รายการนัดหมายตรวจติดตาม',
              color: '#FFFFFF',
              size: 'md',
              weight: 'bold',
            },
            {
              type: 'text',
              text: `คุณ${patientName} (${hn})`,
              color: '#99F6E4',
              size: 'xs',
              weight: 'bold',
              margin: 'xs',
            },
          ],
        },
        body: {
          type: 'box',
          layout: 'vertical',
          paddingAll: 'lg',
          spacing: 'md',
          contents: [
            {
              type: 'box',
              layout: 'vertical',
              backgroundColor: '#F8FAFC',
              cornerRadius: 'md',
              paddingAll: 'lg',
              borderColor: '#E2E8F0',
              borderWidth: '1px',
              alignItems: 'center',
              contents: [
                {
                  type: 'text',
                  text: 'ℹ️ ไม่พบรายการนัดหมายถัดไป',
                  size: 'sm',
                  color: '#475569',
                  weight: 'bold',
                },
                {
                  type: 'text',
                  text: `ขณะนี้ท่านยังไม่มีรายการนัดหมายตรวจติดตามในระบบ HOSxP ของโรงพยาบาลคลองหาดค่ะ`,
                  size: 'xs',
                  color: KHH_COLORS.TEXT_MUTED,
                  margin: 'md',
                  wrap: true,
                  align: 'center',
                },
                {
                  type: 'text',
                  text: `หากต้องการขอเลื่อนนัด หรือนัดหมายเพิ่มเติม สามารถกดปุ่ม [ติดต่อเจ้าหน้าที่] ด้านล่างได้เลยค่ะ`,
                  size: 'xs',
                  color: '#0F766E',
                  margin: 'sm',
                  wrap: true,
                  align: 'center',
                },
              ],
            },
          ],
        },
        footer: {
          type: 'box',
          layout: 'horizontal',
          spacing: 'sm',
          paddingAll: 'md',
          contents: [
            {
              type: 'button',
              style: 'primary',
              color: KHH_COLORS.PRIMARY_TEAL,
              height: 'sm',
              action: {
                type: 'message',
                label: '💬 ติดต่อเจ้าหน้าที่',
                text: 'ติดต่อเจ้าหน้าที่',
              },
            },
          ],
        },
      },
    };
  }

  // Active appointment exists -> Render real appointment card with Queue QR Code & Family Share
  const mainApp = appointments[0];
  const qrData = encodeURIComponent(`KHH-CHECKIN:${hn}:${mainApp.appointmentDate}`);
  const rawShareText = `🗓️ใบนัดตรวจ รพ.คลองหาด\nคุณ${patientName.slice(0, 30)} (${hn})\n📅 ${mainApp.appointmentDate.slice(0, 40)}\n⏰ ${mainApp.appointmentTime}\n🏥 ${mainApp.clinicName.slice(0, 30)}`;
  const shareUri = `https://line.me/R/msg/text/?${encodeURIComponent(rawShareText)}`;

  return {
    type: 'flex',
    altText: `🗓️ รายการนัดหมายของฉัน: คุณ${patientName} (${hn}) - รพ.คลองหาด`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: KHH_COLORS.DARK_TEAL,
        paddingAll: 'lg',
        contents: [
          {
            type: 'text',
            text: '🗓️ รายการนัดหมายตรวจติดตาม',
            color: '#FFFFFF',
            size: 'md',
            weight: 'bold',
          },
          {
            type: 'text',
            text: `คุณ${patientName} (${hn})`,
            color: '#13A89E',
            size: 'xs',
            weight: 'bold',
            margin: 'xs',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: 'lg',
        spacing: 'md',
        contents: [
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: KHH_COLORS.LIGHT_TEAL_BG,
            cornerRadius: 'md',
            paddingAll: 'md',
            borderColor: KHH_COLORS.LIGHT_TEAL_BORDER,
            borderWidth: '1px',
            contents: [
              {
                type: 'text',
                text: '📌 นัดหมายถัดไป (ข้อมูลสด HOSxP)',
                size: 'xs',
                color: '#0F766E',
                weight: 'bold',
              },
              {
                type: 'text',
                text: `${mainApp.appointmentDate}`,
                size: 'md',
                color: '#17324D',
                weight: 'bold',
                margin: 'xs',
              },
              {
                type: 'text',
                text: `เวลา ${mainApp.appointmentTime} | ${mainApp.clinicName}`,
                size: 'xs',
                color: KHH_COLORS.DARK_TEAL,
                weight: 'bold',
              },
              {
                type: 'text',
                text: `แพทย์ผู้ตรวจ: ${mainApp.doctorName || 'แพทย์ประจำคลินิก'}`,
                size: 'xs',
                color: KHH_COLORS.TEXT_MUTED,
                margin: 'xs',
              },
              {
                type: 'text',
                text: `สาเหตุการนัด: ${mainApp.cause || 'ตรวจติดตามอาการประจำปี'}`,
                size: 'xs',
                color: '#475569',
                margin: 'xs',
              },
            ],
          },

          // Self Check-in Kiosk QR Code
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#FFFFFF',
            cornerRadius: 'md',
            paddingAll: 'md',
            borderColor: '#CCFBF1',
            borderWidth: '1px',
            alignItems: 'center',
            contents: [
              {
                type: 'text',
                text: '📲 สแกน QR Code รับคิวอัตโนมัติ',
                size: 'xs',
                color: KHH_COLORS.PRIMARY_TEAL,
                weight: 'bold',
                align: 'center',
              },
              {
                type: 'image',
                url: `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${qrData}`,
                size: 'xs',
                aspectRatio: '1:1',
                margin: 'xs',
              },
            ],
          },

          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: KHH_COLORS.BG_LIGHT_AMBER,
            cornerRadius: 'md',
            paddingAll: 'md',
            borderColor: '#FDE68A',
            borderWidth: '1px',
            contents: [
              {
                type: 'text',
                text: '📝 ข้อปฏิบัติตัวก่อนมาพบแพทย์',
                size: 'xs',
                color: '#92400E',
                weight: 'bold',
              },
              {
                type: 'text',
                text: `${mainApp.preparationNotes || 'โปรดนำบัตรประชาชนและยาประจำตัวมาด้วยทุกครั้ง'}`,
                size: 'xs',
                color: '#78350F',
                wrap: true,
                margin: 'xs',
              },
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        paddingAll: 'md',
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: KHH_COLORS.PRIMARY_TEAL,
            height: 'sm',
            action: {
              type: 'message',
              label: '🟢 ยืนยันนัด',
              text: 'ยืนยันนัด',
            },
          },
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'message',
              label: 'ขอเลื่อนนัด',
              text: 'ขอเลื่อนนัด',
            },
          },
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'uri',
              label: '📤 แชร์ใบนัดให้ลูกหลานช่วยจำ',
              uri: shareUri,
            },
          },
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'uri',
              label: KHH_CONTACTS.MAPS_LABEL,
              uri: KHH_CONTACTS.MAPS_LOCATION_URI,
            },
          },
        ],
      },
    },
  };
}

/**
 * 2. Tile 2: "ยืนยันนัด"
 */
export function createConfirmSuccessFlex(patientName: string = 'สมชาย ดีเลิศ', date: string = '1 สิงหาคม 2026') {
  return {
    type: 'flex',
    altText: '✅ ยืนยันการมาตามนัดเรียบร้อยแล้ว',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: KHH_COLORS.PRIMARY_TEAL,
        paddingAll: 'lg',
        contents: [
          {
            type: 'text',
            text: '✅ ยืนยันการมาตามนัดสำเร็จ',
            color: '#FFFFFF',
            size: 'md',
            weight: 'bold',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: 'lg',
        spacing: 'sm',
        contents: [
          {
            type: 'text',
            text: `ขอบคุณครับ คุณ${patientName}`,
            size: 'sm',
            weight: 'bold',
            color: KHH_COLORS.TEXT_MAIN,
          },
          {
            type: 'text',
            text: `ระบบบันทึกการยืนยันนัดวันที่ ${date} (เวลา 09:00 น.) เข้าสู่ระบบโรงพยาบาลเรียบร้อยแล้ว`,
            size: 'xs',
            color: '#475569',
            wrap: true,
          },
          {
            type: 'text',
            text: '💡 ข้อแนะนำ: โปรดงดน้ำและอาหารหลัง 20:00 น. คืนก่อนวันตรวจ และนำบัตรประชาชนมาด้วยทุกครั้ง',
            size: 'xs',
            color: '#B45309',
            wrap: true,
            margin: 'md',
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        paddingAll: 'md',
        contents: [
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'uri',
              label: KHH_CONTACTS.MAPS_LABEL,
              uri: KHH_CONTACTS.MAPS_LOCATION_URI,
            },
          },
        ],
      },
    },
  };
}

/**
 * Generate Confirmation Flex Card when Staff Approves/Changes Rescheduled Appointment Date
 */
export function createRescheduleSuccessFlex(params: {
  patientName: string;
  hn: string;
  newDate: string;
  newTime?: string;
  doctor?: string;
  clinic?: string;
}) {
  const {
    patientName,
    hn,
    newDate,
    newTime = '08:00 - 12:00 น.',
    doctor = 'พญ. วรรณภา จิตดี (แพทย์ประจำคลินิก NCDs)',
    clinic = 'คลินิก NCDs โรงพยาบาลคลองหาด',
  } = params;

  // Build Google Calendar Event URL (Guaranteed valid & < 1000 chars for LINE API limit)
  const calTitle = encodeURIComponent(`นัดตรวจ NCDs คุณ${patientName.slice(0, 20)}`);
  const calDetails = encodeURIComponent(
    `ใบนัดตรวจ NCDs รพ.คลองหาด\nคุณ${patientName.slice(0, 20)} (${hn})\nวันนัดใหม่: ${newDate.slice(0, 30)} (${newTime})`
  );
  const calLocation = encodeURIComponent(KHH_CONTACTS.HOSPITAL_NAME);
  const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${calTitle}&details=${calDetails}&location=${calLocation}`;

  return {
    type: 'flex',
    altText: `📅 ยืนยันการเปลี่ยนวันนัดหมายสำเร็จ: คุณ${patientName} (นัดใหม่ ${newDate})`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: KHH_COLORS.MEDICATION_BLUE,
        paddingAll: 'lg',
        contents: [
          {
            type: 'text',
            text: '📅 ยืนยันการเปลี่ยนวันนัดหมายสำเร็จ',
            color: '#FFFFFF',
            size: 'md',
            weight: 'bold',
          },
          {
            type: 'text',
            text: 'เจ้าหน้าที่อนุมัติวันนัดหมายใหม่เรียบร้อยแล้ว',
            color: '#E0F2FE',
            size: 'xs',
            margin: 'xs',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: 'lg',
        spacing: 'md',
        contents: [
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#F0F9FF',
            cornerRadius: 'md',
            paddingAll: 'md',
            borderColor: '#BAE6FD',
            borderWidth: '1px',
            contents: [
              {
                type: 'text',
                text: '👤 ผู้ป่วยลงทะเบียน:',
                size: 'xs',
                color: '#0369A1',
                weight: 'bold',
              },
              {
                type: 'text',
                text: `คุณ${patientName}`,
                size: 'sm',
                color: KHH_COLORS.TEXT_MAIN,
                weight: 'bold',
                margin: 'xs',
              },
              {
                type: 'text',
                text: `หมายเลข HN: ${hn}`,
                size: 'xs',
                color: KHH_COLORS.TEXT_MUTED,
                margin: 'xs',
              },
            ],
          },
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#F8FAFC',
            cornerRadius: 'md',
            paddingAll: 'md',
            borderColor: '#E2E8F0',
            borderWidth: '1px',
            spacing: 'xs',
            contents: [
              {
                type: 'text',
                text: '🗓️ กำหนดวันนัดหมายใหม่:',
                size: 'xs',
                color: '#475569',
                weight: 'bold',
              },
              {
                type: 'text',
                text: newDate,
                size: 'lg',
                color: KHH_COLORS.MEDICATION_BLUE,
                weight: 'bold',
                margin: 'xs',
              },
              {
                type: 'separator',
                color: '#E2E8F0',
                margin: 'sm',
              },
              {
                type: 'text',
                text: `⏰ เวลาตรวจ: ${newTime}`,
                size: 'xs',
                color: '#334155',
                margin: 'sm',
              },
              {
                type: 'text',
                text: `🩺 แพทย์ผู้ตรวจ: ${doctor}`,
                size: 'xs',
                color: '#334155',
              },
              {
                type: 'text',
                text: `🏥 สถานที่/คลินิก: ${clinic}`,
                size: 'xs',
                color: '#334155',
              },
            ],
          },
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#FEF3C7',
            cornerRadius: 'md',
            paddingAll: 'sm',
            contents: [
              {
                type: 'text',
                text: '💡 ข้อแนะนำ: โปรดนำบัตรประชาชนและยาประจำตัวมาด้วยทุกครั้งก่อนมาตามนัดใหม่ค่ะ',
                size: 'xs',
                color: '#92400E',
                wrap: true,
              },
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        paddingAll: 'md',
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: KHH_COLORS.MEDICATION_BLUE,
            height: 'sm',
            action: {
              type: 'uri',
              label: '📅 บันทึกลงปฏิทิน Google Calendar',
              uri: googleCalUrl,
            },
          },
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'uri',
              label: `📞 ติดต่อคลินิก NCDs (${KHH_CONTACTS.NCD_CLINIC_PHONE_DISPLAY})`,
              uri: KHH_CONTACTS.NCD_CLINIC_PHONE_URI,
            },
          },
        ],
      },
    },
  };
}

/**
 * 3. Tile 3: "ขอเลื่อนนัด"
 */
export function createRescheduleRequestFlex() {
  return {
    type: 'flex',
    altText: '🟡 แจ้งขอเลื่อนวันนัดหมาย',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: KHH_COLORS.WARNING_AMBER,
        paddingAll: 'lg',
        contents: [
          {
            type: 'text',
            text: '🟡 แจ้งขอเลื่อนวันนัดหมาย',
            color: '#FFFFFF',
            size: 'md',
            weight: 'bold',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: 'lg',
        spacing: 'md',
        contents: [
          {
            type: 'text',
            text: 'ท่านต้องการขอเลื่อนวันนัดตรวจเป็นช่วงใดคะ?',
            size: 'xs',
            color: '#334155',
            weight: 'bold',
            wrap: true,
          },
          {
            type: 'text',
            text: 'โปรดพิมพ์ระบุวัน/เวลา หรือสัปดาห์ที่สะดวกส่งกลับมาในแชทนี้ เจ้าหน้าที่จะทำการปรับวันนัดและแจ้งยืนยันกลับโดยเร็วที่สุดค่ะ',
            size: 'xs',
            color: KHH_COLORS.TEXT_MUTED,
            wrap: true,
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        paddingAll: 'md',
        contents: [
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'message',
              label: '🎧 พิมพ์คุยกับพยาบาล',
              text: 'ติดต่อเจ้าหน้าที่',
            },
          },
        ],
      },
    },
  };
}
