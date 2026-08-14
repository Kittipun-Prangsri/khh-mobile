/**
 * Authentication, Registration & PDPA PIN Prompt LINE Flex Message Templates
 * Hospital: Khlong Hat Hospital (โรงพยาบาลคลองหาด)
 */

import { KHH_CONTACTS, KHH_COLORS } from './flexConstants';

/**
 * Generate Role Selection Flex Message (Separating Patient vs Admin/Staff)
 */
export function createRoleSelectionFlexMessage() {
  return {
    type: 'flex',
    altText: `🏥 ยินดีต้อนรับสู่ KHH Safe-Connect โปรดเลือกประเภทผู้ใช้งานเพื่อลงทะเบียน`,
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
            text: '🏥 KHH SAFE-CONNECT',
            color: '#13A89E',
            size: 'xs',
            weight: 'bold',
          },
          {
            type: 'text',
            text: 'ยินดีต้อนรับสู่ระบบบริการสุขภาพ',
            color: '#FFFFFF',
            size: 'md',
            weight: 'bold',
            margin: 'xs',
          },
          {
            type: 'text',
            text: KHH_CONTACTS.HOSPITAL_SHORT,
            color: '#E2E8F0',
            size: 'xs',
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
            text: 'โปรดเลือกสถานะผู้ใช้งาน เพื่อลงทะเบียนรับการแจ้งเตือนและข้อมูลเฉพาะบุคคล:',
            size: 'xs',
            color: '#475569',
            wrap: true,
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: 'lg',
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: KHH_COLORS.PRIMARY_TEAL,
            height: 'md',
            action: {
              type: 'message',
              label: '🟢 ผู้ป่วย / ญาติผู้ดูแล',
              text: 'ลงทะเบียนผู้ป่วย',
            },
          },
          {
            type: 'button',
            style: 'secondary',
            height: 'md',
            action: {
              type: 'message',
              label: '🔵 เจ้าหน้าที่ / พยาบาล / แพทย์',
              text: 'ลงทะเบียนเจ้าหน้าที่',
            },
          },
        ],
      },
    },
  };
}

/**
 * Generate Patient Registration Instructions
 */
export function createPatientRegistrationPromptFlex() {
  return {
    type: 'flex',
    altText: '📌 ลงทะเบียนผู้ป่วย: พิมพ์หมายเลข HN ในแชต หรือ สแกนบาร์โค้ดใบนัด',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: KHH_COLORS.PRIMARY_TEAL,
        paddingAll: 'md',
        contents: [
          {
            type: 'text',
            text: '🟢 ลงทะเบียนผู้ป่วย NCDs',
            color: '#FFFFFF',
            size: 'sm',
            weight: 'bold',
          },
          {
            type: 'text',
            text: 'โรงพยาบาลคลองหาด (KHH Safe-Connect)',
            color: '#CCFBF1',
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
            backgroundColor: KHH_COLORS.LIGHT_TEAL_BG,
            cornerRadius: 'md',
            paddingAll: 'md',
            borderColor: KHH_COLORS.LIGHT_TEAL_BORDER,
            borderWidth: '1px',
            contents: [
              {
                type: 'text',
                text: '✍️ วิธีที่ 1: พิมพ์เลขบัตรประชาชน 13 หลัก',
                size: 'xs',
                color: '#0F766E',
                weight: 'bold',
              },
              {
                type: 'text',
                text: 'พิมพ์เลขบัตรประชาชน 13 หลักของผู้ป่วย (เฉพาะตัวเลข) ส่งมาในแชทนี้ได้ทันทีค่ะ',
                size: 'xs',
                color: '#334155',
                wrap: true,
                margin: 'xs',
              },
              {
                type: 'text',
                text: '💡 ตัวอย่าง: 1234567890123 หรือ พิมพ์ HN เช่น 000059754',
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
            contents: [
              {
                type: 'text',
                text: '📷 วิธีที่ 2: สแกนบาร์โค้ดใบนัด HOSxP',
                size: 'xs',
                color: '#1E293B',
                weight: 'bold',
              },
              {
                type: 'text',
                text: 'กดปุ่มด้านล่างเพื่อเปิดกล้องส่องบาร์โค้ดมุมใบนัด โดยไม่ต้องพิมพ์ตัวเลข',
                size: 'xs',
                color: KHH_COLORS.TEXT_MUTED,
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
            color: '#2563EB',
            height: 'sm',
            action: {
              type: 'uri',
              label: '✍️ กดเพื่อพิมพ์เลขบัตรประชาชน 13 หลัก',
              uri: `https://line.me/R/oaMessage/${(process.env.NEXT_PUBLIC_LINE_OA_BASIC_ID || '@745sionk').trim()}/?`,
            },
          },
          {
            type: 'button',
            style: 'primary',
            color: KHH_COLORS.PRIMARY_TEAL,
            height: 'sm',
            action: {
              type: 'uri',
              label: '📷 เปิดกล้องสแกนบาร์โค้ดใบนัด HOSxP',
              uri: `${process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://khhncd.khostime.site'}/scan-hn`,
            },
          },
        ],
      },
    },
  };
}

/**
 * Generate Interactive Role Confirmation Flex Card (Self vs. Caregiver)
 */
export function createRoleConfirmationFlex(
  hn: string,
  patientName: string,
  maskedCid: string
) {
  return {
    type: 'flex',
    altText: `📋 ยืนยันสถานะการลงทะเบียน: คุณ${patientName} (${hn})`,
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
            text: '📋 เลือกสถานะการลงทะเบียน',
            color: '#FFFFFF',
            size: 'md',
            weight: 'bold',
          },
          {
            type: 'text',
            text: 'โรงพยาบาลคลองหาด (HOSxP Verified)',
            color: '#CCFBF1',
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
            type: 'text',
            text: 'พบข้อมูลผู้ป่วยในระบบ HOSxP เรียบร้อยแล้วค่ะ โปรดเลือกสถานะการลงทะเบียนของท่าน:',
            size: 'xs',
            color: '#334155',
            wrap: true,
          },
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
                text: `คุณ${patientName}`,
                size: 'sm',
                color: '#0F766E',
                weight: 'bold',
              },
              {
                type: 'text',
                text: `${hn} | เลขบัตร: ${maskedCid}`,
                size: 'xs',
                color: KHH_COLORS.TEXT_MUTED,
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
              label: '👤 ฉันคือผู้ป่วย (ลงทะเบียนเอง)',
              text: `REGISTER_SELF:${hn}`,
            },
          },
          {
            type: 'button',
            style: 'primary',
            color: '#2563EB',
            height: 'sm',
            action: {
              type: 'message',
              label: '👥 ฉันคือ ญาติ/ผู้ดูแล (ลงทะเบียนแทน)',
              text: `REGISTER_CAREGIVER:${hn}`,
            },
          },
        ],
      },
    },
  };
}

/**
 * Generate Staff Registration Instructions
 */
export function createStaffRegistrationPromptFlex() {
  return {
    type: 'flex',
    altText: '📌 ลงทะเบียนเจ้าหน้าที่: โปรดพิมพ์รหัสพนักงาน/รหัสเจ้าหน้าที่',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#1E40AF',
        paddingAll: 'md',
        contents: [
          {
            type: 'text',
            text: '🔵 ลงทะเบียนเจ้าหน้าที่ รพ.คลองหาด',
            color: '#FFFFFF',
            size: 'sm',
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
            text: 'โปรดพิมพ์ Username (ชื่อผู้ใช้งาน HOSxP) หรือรหัสประจำตัวเจ้าหน้าที่ส่งกลับมาในแชตนี้ค่ะ',
            size: 'xs',
            color: '#334155',
            wrap: true,
            weight: 'bold',
          },
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: KHH_COLORS.BG_LIGHT_BLUE,
            cornerRadius: 'md',
            paddingAll: 'md',
            borderColor: '#BFDBFE',
            borderWidth: '1px',
            margin: 'sm',
            contents: [
              {
                type: 'text',
                text: '💡 ตัวอย่างการพิมพ์:',
                size: 'xs',
                color: '#1E40AF',
                weight: 'bold',
              },
              {
                type: 'text',
                text: '• พิมพ์ Username HOSxP เช่น kitti หรือ nurse_ncd\n• พิมพ์รหัสพนักงาน เช่น STAFF-1001 หรือ NURSE-001',
                size: 'xs',
                color: '#475569',
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
            color: '#1E40AF',
            height: 'sm',
            action: {
              type: 'uri',
              label: '✍️ กดเพื่อพิมพ์รหัสเจ้าหน้าที่ (STAFF-)',
              uri: `https://line.me/R/oaMessage/${(process.env.NEXT_PUBLIC_LINE_OA_BASIC_ID || '@745sionk').trim()}/?STAFF-`,
            },
          },
        ],
      },
    },
  };
}

/**
 * Generate Registration Success Card
 */
export function createRegistrationSuccessFlex(
  role: 'patient' | 'staff',
  name: string,
  idCode: string,
  lineUserId: string
) {
  const isPatient = role === 'patient';

  return {
    type: 'flex',
    altText: `✅ ลงทะเบียนสำเร็จ: คุณ${name}`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: isPatient ? KHH_COLORS.PRIMARY_TEAL : '#1E40AF',
        paddingAll: 'lg',
        contents: [
          {
            type: 'text',
            text: isPatient ? '🟢 ผูกบัญชีผู้ป่วยสำเร็จ' : '🔵 ผูกบัญชีเจ้าหน้าที่สำเร็จ',
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
            text: `ยินดีต้อนรับ คุณ${name}`,
            size: 'md',
            weight: 'bold',
            color: KHH_COLORS.TEXT_MAIN,
          },
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#F8FAFC',
            cornerRadius: 'md',
            paddingAll: 'md',
            borderColor: '#E2E8F0',
            borderWidth: '1px',
            contents: [
              {
                type: 'text',
                text: `${isPatient ? 'HN' : 'รหัสพนักงาน'}: ${idCode}`,
                size: 'xs',
                color: '#475569',
                weight: 'bold',
              },
              {
                type: 'text',
                text: `LINE User ID: ${lineUserId}`,
                size: 'xs',
                color: '#94A3B8',
                margin: 'xs',
              },
            ],
          },
          {
            type: 'text',
            text: isPatient
              ? 'ระบบจะส่งแจ้งเตือนวันนัดหมายและคำแนะนำสุขภาพมายัง LINE นี้โดยอัตโนมัติ'
              : 'ท่านจะได้รับการแจ้งเตือนเคสผู้ป่วยขาดนัด และข้อความ Reply เร่งด่วนผ่าน LINE นี้',
            size: 'xs',
            color: KHH_COLORS.TEXT_MUTED,
            wrap: true,
          },
        ],
      },
    },
  };
}

/**
 * Generate Patient Info Verification Flex Card (Full Name, HN, CID, Registered Clinics)
 */
export function createPatientInfoVerificationFlex(
  patientName: string = 'สมชาย ดีเลิศ',
  hn: string = 'HN-98302',
  cid: string = '1-2345-XXXXX-12-3',
  registeredClinics: string[] = ['🩺 คลินิกเบาหวาน (DM)', '🩺 คลินิกความดันโลหิตสูง (HT)'],
  vitals?: {
    weight?: string;
    height?: string;
    bmi?: string;
    bps?: string;
    bpd?: string;
  }
) {
  const hasClinics = registeredClinics && registeredClinics.length > 0;

  const clinicContents = hasClinics
    ? registeredClinics.map((c) => ({
        type: 'box',
        layout: 'horizontal',
        margin: 'xs',
        contents: [
          {
            type: 'text',
            text: '•',
            size: 'xs',
            color: '#0F766E',
            flex: 0,
          },
          {
            type: 'text',
            text: c,
            size: 'xs',
            color: KHH_COLORS.TEXT_MAIN,
            weight: 'bold',
            margin: 'xs',
            flex: 1,
          },
        ],
      }))
    : [
        {
          type: 'box',
          layout: 'horizontal',
          margin: 'xs',
          contents: [
            {
              type: 'text',
              text: '⚠️ คุณไม่ได้เป็นคนไข้ของคลินิก',
              size: 'xs',
              color: KHH_COLORS.EMERGENCY_RED,
              weight: 'bold',
              margin: 'xs',
              wrap: true,
            },
          ],
        },
      ];

  return {
    type: 'flex',
    altText: `✅ ยืนยันข้อมูลผู้ป่วยสำเร็จ: คุณ${patientName} (${hn})`,
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
            text: '✅ ยืนยันข้อมูลผู้ป่วยสำเร็จ',
            color: '#FFFFFF',
            size: 'md',
            weight: 'bold',
          },
          {
            type: 'text',
            text: 'โรงพยาบาลคลองหาด (HOSxP Verified)',
            color: '#CCFBF1',
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
            backgroundColor: KHH_COLORS.LIGHT_TEAL_BG,
            cornerRadius: 'md',
            paddingAll: 'md',
            borderColor: KHH_COLORS.LIGHT_TEAL_BORDER,
            borderWidth: '1px',
            contents: [
              {
                type: 'text',
                text: '👤 ข้อมูลผู้ป่วยลงทะเบียน',
                size: 'xs',
                color: '#0F766E',
                weight: 'bold',
              },
              {
                type: 'text',
                text: `คุณ${patientName}`,
                size: 'md',
                color: KHH_COLORS.TEXT_MAIN,
                weight: 'bold',
                margin: 'xs',
              },
              {
                type: 'text',
                text: `${hn} | เลขบัตร: ${cid}`,
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
            contents: [
              {
                type: 'text',
                text: '🏥 คลินิกประจำที่ลงทะเบียนไว้:',
                size: 'xs',
                color: '#334155',
                weight: 'bold',
              },
              ...clinicContents,
            ],
          },
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#F1F5F9',
            cornerRadius: 'md',
            paddingAll: 'md',
            borderColor: '#CBD5E1',
            borderWidth: '1px',
            contents: [
              {
                type: 'text',
                text: '🩺 ผลคัดกรองสัญญาณชีพล่าสุด (HOSxP):',
                size: 'xs',
                color: '#334155',
                weight: 'bold',
                wrap: true,
              },
              {
                type: 'text',
                text: `⚖️ น้ำหนัก: ${vitals?.weight || '62.5'} kg | ส่วนสูง: ${vitals?.height || '165'} cm | BMI: ${vitals?.bmi || '22.9'} (ปกติ)`,
                size: 'xs',
                color: '#1E293B',
                margin: 'xs',
                wrap: true,
              },
              {
                type: 'text',
                text: `🩺 ความดันโลหิต (BP): ${vitals?.bps || '124'}/${vitals?.bpd || '82'} mmHg 🟢 ปกติ`,
                size: 'xs',
                color: '#059669',
                weight: 'bold',
                margin: 'xs',
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
        contents: hasClinics
          ? [
              {
                type: 'button',
                style: 'primary',
                color: KHH_COLORS.PRIMARY_TEAL,
                height: 'sm',
                action: {
                  type: 'message',
                  label: '🔒 ดูผลตรวจสุขภาพ & สัญญาณชีพ (คุ้มครอง PDPA)',
                  text: 'ผลตรวจสุขภาพ',
                },
              },
              {
                type: 'button',
                style: 'secondary',
                height: 'sm',
                action: {
                  type: 'message',
                  label: '🌿 อ่านคู่มือการดูแลสุขภาพดี',
                  text: 'ข้อมูลสุขภาพดี',
                },
              },
            ]
          : [
              {
                type: 'button',
                style: 'primary',
                color: '#059669',
                height: 'sm',
                action: {
                  type: 'message',
                  label: '🌿 ดูคู่มือดูแลสุขภาพดี & ป้องกันโรค NCDs',
                  text: 'ข้อมูลสุขภาพดี',
                },
              },
            ],
      },
    },
  };
}

/**
 * Generate PDPA Protection PIN Prompt Flex Card
 */
export function createPdpaPinPromptFlex(patientName: string = 'ผู้ป่วย', hn: string = 'HN-XXXXX') {
  return {
    type: 'flex',
    altText: '🔒 โปรดยืนยันรหัสผ่านเพื่อเปิดดูผลตรวจสุขภาพ (PDPA Protected)',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#475569',
        paddingAll: 'lg',
        contents: [
          {
            type: 'text',
            text: '🔒 ยืนยันรหัสผ่านเปิดดูผลตรวจสุขภาพ',
            color: '#FFFFFF',
            size: 'md',
            weight: 'bold',
            wrap: true,
          },
          {
            type: 'text',
            text: 'ข้อมูลสุขภาพส่วนบุคคลได้รับการคุ้มครองตาม พ.ร.บ. PDPA',
            color: '#E2E8F0',
            size: 'xs',
            margin: 'xs',
            wrap: true,
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
            paddingAll: 'md',
            borderColor: '#E2E8F0',
            borderWidth: '1px',
            contents: [
              {
                type: 'text',
                text: '👤 บัญชีผู้ป่วย:',
                size: 'xs',
                color: KHH_COLORS.TEXT_MUTED,
                weight: 'bold',
              },
              {
                type: 'text',
                text: `คุณ${patientName} (${hn})`,
                size: 'sm',
                color: KHH_COLORS.TEXT_MAIN,
                weight: 'bold',
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
                text: '🔑 วิธีการปลดล็อกดูผลตรวจ:',
                size: 'xs',
                color: '#92400E',
                weight: 'bold',
              },
              {
                type: 'text',
                text: 'โปรดส่งรหัสผ่านโดยพิมพ์ PIN- ตามด้วยเลข 4 หลักสุดท้ายของบัตรประชาชนผู้ป่วย',
                size: 'xs',
                color: '#78350F',
                margin: 'xs',
                wrap: true,
              },
              {
                type: 'text',
                text: '💡 ตัวอย่าง: เลขบัตรลงด้วย 1234 ให้พิมพ์ PIN-1234 หรือ 1234',
                size: 'xs',
                color: '#B45309',
                weight: 'bold',
                margin: 'sm',
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
            color: '#475569',
            height: 'sm',
            action: {
              type: 'uri',
              label: '🔑 กดเพื่อพิมพ์รหัส PIN 4 หลัก',
              uri: `https://line.me/R/oaMessage/${(process.env.NEXT_PUBLIC_LINE_OA_BASIC_ID || '@745sionk').trim()}/?PIN-`,
            },
          },
        ],
      },
    },
  };
}

/**
 * Generate 2-Step Birth Year Verification Prompt Flex Card (ปี พ.ศ. เกิด 4 หลัก)
 */
export function createBirthYearVerificationPromptFlex(
  patientName: string,
  hn: string,
  targetRole: 'patient' | 'caregiver' = 'patient'
) {
  const roleText = targetRole === 'caregiver' ? '👥 ญาติ / ผู้ดูแล' : '👤 ผู้ป่วยหลัก';

  return {
    type: 'flex',
    altText: `🔒 ยืนยันปี พ.ศ. เกิด 4 หลัก: คุณ${patientName} (${hn})`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#0D9488',
        paddingAll: 'lg',
        contents: [
          {
            type: 'text',
            text: '🔒 ยืนยันตัวตนก่อนผูกบัญชี LINE',
            color: '#FFFFFF',
            size: 'md',
            weight: 'bold',
          },
          {
            type: 'text',
            text: 'เพื่อคุ้มครองข้อมูลการแพทย์ส่วนบุคคลตาม พ.ร.บ. PDPA',
            color: '#CCFBF1',
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
            backgroundColor: KHH_COLORS.LIGHT_TEAL_BG,
            cornerRadius: 'md',
            paddingAll: 'md',
            borderColor: KHH_COLORS.LIGHT_TEAL_BORDER,
            borderWidth: '1px',
            contents: [
              {
                type: 'text',
                text: `${roleText} | ${hn}`,
                size: 'xs',
                color: '#0F766E',
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
                text: '🎂 โปรดพิมพ์ ปี พ.ศ. เกิด 4 หลัก ของผู้ป่วย',
                size: 'xs',
                color: '#92400E',
                weight: 'bold',
              },
              {
                type: 'text',
                text: 'กรุณาตรวจสอบปี พ.ศ. เกิด จากบัตรประชาชนของผู้ป่วย แล้วพิมพ์เลข 4 หลัก ส่งในแชทนี้ค่ะ',
                size: 'xs',
                color: '#78350F',
                margin: 'xs',
                wrap: true,
              },
              {
                type: 'text',
                text: '💡 ตัวอย่าง: เกิด พ.ศ. 2495 ให้พิมพ์ Y2495 หรือ 2495',
                size: 'xs',
                color: '#B45309',
                weight: 'bold',
                margin: 'sm',
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
            color: '#0D9488',
            height: 'sm',
            action: {
              type: 'uri',
              label: '🔑 พิมพ์ปี พ.ศ. เกิด (เช่น Y2495)',
              uri: `https://line.me/R/oaMessage/${(process.env.NEXT_PUBLIC_LINE_OA_BASIC_ID || '@745sionk').trim()}/?Y`,
            },
          },
        ],
      },
    },
  };
}

/**
 * Generate Max 3 LINE Accounts Quota Reached Warning Flex Card
 */
export function createMaxBindingReachedFlex(patientName: string, hn: string, activeCount: number = 3) {
  return {
    type: 'flex',
    altText: `⚠️ ผูกบัญชีครบโควตา 3 บัญชีแล้ว: คุณ${patientName} (${hn})`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#C2410C',
        paddingAll: 'lg',
        contents: [
          {
            type: 'text',
            text: '⚠️ ผูกบัญชีครบโควตา 3 บัญชีแล้ว',
            color: '#FFFFFF',
            size: 'md',
            weight: 'bold',
          },
          {
            type: 'text',
            text: 'มาตรการความปลอดภัยและคุ้มครองข้อมูลส่วนบุคคล (PDPA)',
            color: '#FFEDD5',
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
            backgroundColor: '#FFF7ED',
            cornerRadius: 'md',
            paddingAll: 'md',
            borderColor: '#FED7AA',
            borderWidth: '1px',
            contents: [
              {
                type: 'text',
                text: `คุณ${patientName} (${hn})`,
                size: 'sm',
                color: '#C2410C',
                weight: 'bold',
              },
              {
                type: 'text',
                text: `มีการผูกบัญชี LINE ใช้งานอยู่แล้ว ${activeCount} บัญชี (สิทธิ์สูงสุด 3 บัญชีต่อคนไข้ 1 คน)`,
                size: 'xs',
                color: '#9A3412',
                margin: 'xs',
                wrap: true,
              },
            ],
          },
          {
            type: 'text',
            text: 'หากต้องการยกเลิกการผูกบัญชีเดิม หรือเปลี่ยนเครื่องมือถือใหม่ โปรดติดต่อพยาบาล/เจ้าหน้าที่ รพ.คลองหาด เพื่อปลดล็อกให้ค่ะ',
            size: 'xs',
            color: '#475569',
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
            style: 'primary',
            color: '#C2410C',
            height: 'sm',
            action: {
              type: 'message',
              label: '🎧 ติดต่อเจ้าหน้าที่เพื่อปลดล็อก',
              text: 'ติดต่อเจ้าหน้าที่',
            },
          },
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'uri',
              label: '📞 โทร 037-445099 ต่อ 116',
              uri: 'tel:037445099,116',
            },
          },
        ],
      },
    },
  };
}
