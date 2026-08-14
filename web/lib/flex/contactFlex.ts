/**
 * Staff, Pharmacist, Mental Health & Emergency Contact LINE Flex Message Templates
 * Hospital: Khlong Hat Hospital (โรงพยาบาลคลองหาด)
 */

import { KHH_CONTACTS, KHH_COLORS } from './flexConstants';

/**
 * Generate LINE Native Location Message Payload for Khlong Hat Hospital (0% Server CPU/RAM Load)
 */
export function createHospitalNativeLocationMessage() {
  return {
    type: 'location',
    title: KHH_CONTACTS.HOSPITAL_NAME,
    address: 'หมู่ 1 ตำบลคลองหาด อำเภอคลองหาด จังหวัดสระแก้ว 27260',
    latitude: 13.4478,
    longitude: 102.3081,
  };
}

/**
 * 4. Tile 4: "ติดต่อเจ้าหน้าที่"
 */
export function createContactStaffFlex() {
  return {
    type: 'flex',
    altText: '🎧 ติดต่อเจ้าหน้าที่ / พยาบาล NCDs',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#084C61',
        paddingAll: 'lg',
        contents: [
          {
            type: 'text',
            text: '🎧 ติดต่อเจ้าหน้าที่ / พยาบาล',
            color: '#FFFFFF',
            size: 'md',
            weight: 'bold',
          },
          {
            type: 'text',
            text: KHH_CONTACTS.NCD_CLINIC_NAME,
            color: '#13A89E',
            size: 'xs',
            margin: 'xs',
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
            text: 'ท่านสามารถพิมพ์ข้อความ คำถาม หรือแจ้งเรื่องผิดปกติส่งในแชทนี้ได้ทันที',
            size: 'xs',
            color: '#334155',
            wrap: true,
            weight: 'bold',
          },
          {
            type: 'text',
            text: 'ข้อความของท่านถูกส่งตรงถึงพยาบาลผู้ดูแลระบบเรียบร้อยแล้วค่ะ',
            size: 'xs',
            color: KHH_COLORS.PRIMARY_TEAL,
            margin: 'sm',
          },
          {
            type: 'text',
            text: `📞 เบอร์โทรศัพท์: ${KHH_CONTACTS.NCD_CLINIC_PHONE_DISPLAY} \n (${KHH_CONTACTS.NCD_HOURS_DISPLAY})`,
            size: 'xs',
            color: KHH_COLORS.TEXT_MUTED,
            align: 'center',
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
            style: 'primary',
            color: KHH_COLORS.PRIMARY_TEAL,
            height: 'sm',
            action: {
              type: 'uri',
              label: `📞 โทรหาคลินิก NCDs`,
              uri: KHH_CONTACTS.NCD_CLINIC_PHONE_URI,
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
 * 6.2.2 Flex Message: "ติดต่อเจ้าหน้าที่/เภสัชกร" (Contact Pharmacist / Pharmacy Flex)
 */
export function createContactPharmacistFlex() {
  return {
    type: 'flex',
    altText: '💊 ติดต่อเจ้าหน้าที่/เภสัชกร - รพ.คลองหาด',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#808B3D',
        paddingAll: 'lg',
        contents: [
          {
            type: 'text',
            text: '💊 ติดต่อเจ้าหน้าที่/เภสัชกร',
            color: '#FFFFFF',
            size: 'md',
            weight: 'bold',
          },
          {
            type: 'text',
            text: 'งานเภสัชกรรม โรงพยาบาลคลองหาด',
            color: '#ECF3CF',
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
            text: 'ท่านสามารถโทรติดต่อสอบถาม หรือปรึกษาเรื่องยากับเภสัชกรได้ตามข้อมูลด้านล่างนี้ค่ะ',
            size: 'xs',
            color: '#334155',
            wrap: true,
          },
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#F5F7EA',
            cornerRadius: 'md',
            paddingAll: 'md',
            borderColor: '#CFD89D',
            borderWidth: '1px',
            contents: [
              {
                type: 'text',
                text: '📞 เบอร์โทรศัพท์: 098-256-2900',
                size: 'sm',
                color: '#596424',
                weight: 'bold',
                align: 'center',
              },
              {
                type: 'text',
                text: '(ในเวลาราชการ 08:00-16:00 น.)',
                size: 'xs',
                color: KHH_COLORS.TEXT_MUTED,
                align: 'center',
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
            color: '#808B3D',
            height: 'sm',
            action: {
              type: 'uri',
              label: '📞 โทรหาห้องยา',
              uri: 'tel:0982562900',
            },
          },
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'message',
              label: '⬅️ กลับเมนูคำแนะนำสุขภาพ',
              text: 'คำแนะนำสุขภาพ',
            },
          },
        ],
      },
    },
  };
}

/**
 * Generate Pharmacist Consultation Patient Info Form Prompt Flex Card
 */
export function createPharmacistFormPromptFlex() {
  return {
    type: 'flex',
    altText: '📋 แบบฟอร์มข้อมูลคนไข้สำหรับประกอบการปรึกษากับเภสัชกร',
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
            text: '📋 แบบฟอร์มข้อมูลปรึกษาเภสัชกร',
            color: '#FFFFFF',
            size: 'md',
            weight: 'bold',
          },
          {
            type: 'text',
            text: 'งานเภสัชกรรม โรงพยาบาลคลองหาด',
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
            type: 'text',
            text: 'โปรดพิมพ์ระบุรายละเอียดข้อมูลดังต่อไปนี้ส่งกลับมาในแชทนี้ได้ทันทีค่ะ:',
            size: 'xs',
            color: '#334155',
            weight: 'bold',
            wrap: true,
          },
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
                text: '1. รายการยาประจำตัว หรือยาที่กำลังรับประทานอยู่',
                size: 'xs',
                color: '#0369A1',
                weight: 'bold',
              },
              {
                type: 'text',
                text: '2. อาการผิดปกติ ปัญหา หรือคำถามเรื่องยาที่ต้องการปรึกษา',
                size: 'xs',
                color: '#0369A1',
                weight: 'bold',
                margin: 'sm',
              },
              {
                type: 'text',
                text: '3. ประวัติการแพ้ยา หรือผลข้างเคียงที่เคยพบ (ถ้ามี)',
                size: 'xs',
                color: '#0369A1',
                weight: 'bold',
                margin: 'sm',
              },
            ],
          },
          {
            type: 'text',
            text: '💡 ข้อความของท่านจะถูกส่งตรงถึงเภสัชกรประจำคลินิก และจะทำการตอบกลับผ่าน LINE นี้โดยเร็วที่สุดค่ะ',
            size: 'xs',
            color: KHH_COLORS.MEDICATION_BLUE,
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
            color: KHH_COLORS.MEDICATION_BLUE,
            height: 'sm',
            action: {
              type: 'uri',
              label: '📋 กรอกแบบฟอร์ม Google Form',
              uri: 'https://docs.google.com/forms/d/e/1FAIpQLScj3L97ewiNHY8-lYZG3Bjse4UotPa65nxDGCQSYAVc6CL_fA/viewform?pli=1',
            },
          },
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'message',
              label: '💬 พิมพ์ข้อความถึงเภสัชกร',
              text: 'คุยกับเภสัชกร',
            },
          },
        ],
      },
    },
  };
}

/**
 * 4.1 Sub-Tile: "ติดต่อเจ้าหน้าที่งานสุขภาพจิตและยาเสพติด" (Mental Health & Addiction Unit Contact Flex)
 */
export function createContactMentalHealthStaffFlex() {
  return {
    type: 'flex',
    altText: '🧠 ช่องทางติดต่อเจ้าหน้าที่งานสุขภาพจิตและยาเสพติด รพ.คลองหาด',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: KHH_COLORS.MENTAL_DARK_PURPLE,
        paddingAll: 'lg',
        contents: [
          {
            type: 'text',
            text: '🧠 งานสุขภาพจิตและยาเสพติด',
            color: '#FFFFFF',
            size: 'md',
            weight: 'bold',
            wrap: true,
          },
          {
            type: 'text',
            text: `${KHH_CONTACTS.HOSPITAL_NAME} (ติดต่อเจ้าหน้าที่)`,
            color: '#DDD6FE',
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
            backgroundColor: KHH_COLORS.BG_LIGHT_PURPLE,
            cornerRadius: 'md',
            paddingAll: 'md',
            borderColor: '#DDD6FE',
            borderWidth: '1px',
            contents: [
              {
                type: 'text',
                text: '📞 เบอร์โทรศัพท์แผนก:',
                size: 'xs',
                color: '#5B21B6',
                weight: 'bold',
              },
              {
                type: 'text',
                text: KHH_CONTACTS.MENTAL_HEALTH_PHONE_DISPLAY,
                size: 'md',
                color: KHH_COLORS.MENTAL_DARK_PURPLE,
                weight: 'bold',
                margin: 'xs',
              },
              {
                type: 'text',
                text: `💬 LINE ID: ${KHH_CONTACTS.MENTAL_HEALTH_LINE_ID}`,
                size: 'xs',
                color: '#4C1D95',
                margin: 'sm',
                weight: 'bold',
              },
              {
                type: 'text',
                text: `⏰ เวลาทำการ: \n ${KHH_CONTACTS.MENTAL_HEALTH_HOURS_DISPLAY}`,
                align: 'center',
                size: 'xs',
                color: KHH_COLORS.TEXT_MUTED,
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
            color: KHH_COLORS.MENTAL_DARK_PURPLE,
            height: 'sm',
            action: {
              type: 'uri',
              label: `📞 โทร ${KHH_CONTACTS.MENTAL_HEALTH_PHONE_DISPLAY}`,
              uri: KHH_CONTACTS.MENTAL_HEALTH_PHONE_URI,
            },
          },
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'message',
              label: '⬅️ กลับเมนูคำแนะนำสุขภาพ',
              text: 'คำแนะนำสุขภาพ',
            },
          },
        ],
      },
    },
  };
}

/**
 * 4.2 Sub-Tile: "ติดต่อเจ้าหน้าที่งานกายภาพบำบัด" (Contact Physical Therapy Unit Flex)
 */
export function createContactPhysicalTherapyFlex() {
  return {
    type: 'flex',
    altText: '📅 ช่องทางติดต่อเจ้าหน้าที่งานกายภาพบำบัด รพ.คลองหาด',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: KHH_COLORS.EXERCISE_ORANGE,
        paddingAll: 'lg',
        contents: [
          {
            type: 'text',
            text: '📅 งานกายภาพบำบัด',
            color: '#FFFFFF',
            size: 'md',
            weight: 'bold',
          },
          {
            type: 'text',
            text: `${KHH_CONTACTS.HOSPITAL_NAME} (ติดต่อเจ้าหน้าที่)`,
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
            type: 'text',
            text: 'ทีมเจ้าหน้าที่ได้รับคำขอของคุณแล้วค่ะ จะติดต่อกลับเพื่อนัดหมายกายภาพบำบัดให้โดยเร็วที่สุด',
            size: 'xs',
            color: '#334155',
            wrap: true,
            weight: 'bold',
          },
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#FFF7ED',
            cornerRadius: 'md',
            paddingAll: 'md',
            borderColor: '#FED7AA',
            borderWidth: '1px',
            spacing: 'xs',
            contents: [
              {
                type: 'text',
                text: '📞 เบอร์โทรศัพท์แผนก:',
                size: 'xs',
                color: '#C2410C',
                weight: 'bold',
              },
              {
                type: 'text',
                text: '037-445099 ต่อ 116',
                size: 'md',
                color: '#9A3412',
                weight: 'bold',
                margin: 'xs',
              },
              {
                type: 'text',
                text: '⏰ เวลาทำการ: ในเวลาราชการ (08:00 - 16:00 น.)',
                size: 'xs',
                color: KHH_COLORS.TEXT_MUTED,
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
            color: KHH_COLORS.EXERCISE_ORANGE,
            height: 'sm',
            action: {
              type: 'uri',
              label: '📞 โทร 037-445099 ต่อ 116',
              uri: 'tel:037445099,116',
            },
          },
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'message',
              label: '💬 พิมพ์ข้อความถึงนักกายภาพ',
              text: 'พิมพ์ข้อความถึงนักกายภาพบำบัด',
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
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'message',
              label: '⬅️ กลับเมนูคำแนะนำสุขภาพ',
              text: 'คำแนะนำสุขภาพ',
            },
          },
        ],
      },
    },
  };
}

/**
 * Emergency Symptoms Flex — อาการฉุกเฉินที่ต้องพบแพทย์ทันที
 * ใช้งาน: ผู้ป่วยกดปุ่ม "อาการฉุกเฉิน" หรือพิมพ์ "ฉุกเฉิน / อาการที่ต้องพบแพทย์"
 */
export function createEmergencySymptomsFlex() {
  return {
    type: 'flex',
    altText: '🚨 อาการเตือนฉุกเฉิน (สโตรก & หัวใจขาดเลือด) — โทร 1669',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#B91C1C',
        paddingAll: 'lg',
        contents: [
          {
            type: 'text',
            text: '🚨 อาการเตือนฉุกเฉิน',
            color: '#FFFFFF',
            size: 'xl',
            weight: 'bold',
          },
          {
            type: 'text',
            text: 'โปรดเช็กอาการก่อนกดปุ่มโทร 1669 พบแพทย์ทันที',
            color: '#FECACA',
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
                text: '🧠 โรคหลอดเลือดสมอง/สโตรก(STROKE)',
                size: 'sm',
                weight: 'bold',
                color: '#C2410C',
              },
              {
                type: 'text',
                text: 'อาการเตือนตามหลัก B.E.F.A.S.T:',
                size: 'xs',
                color: '#9A3412',
                weight: 'bold',
                margin: 'xs',
              },
              {
                type: 'text',
                text: '1. Balance - เดินเซ ทรงตัวไม่ได้\n2. Eyes - ตามัวเฉียบพลัน\n3. Face - ปากเบี้ยว หน้าเบี้ยว ข้างเดียว\n4. Arm - แขน ขา อ่อนแรง ข้างเดียว\n5. Speech - พูดไม่ชัด พูดลำบาก\n6. Time - โทรสายด่วน 1669 ทันที ( ไม่เกิน 4.5 ชั่วโมง )',
                size: 'xs',
                color: '#374151',
                wrap: true,
                margin: 'xs',
              },
              {
                type: 'box',
                layout: 'vertical',
                backgroundColor: '#FFEDD5',
                cornerRadius: 'sm',
                paddingAll: 'sm',
                margin: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: '💡 จดจำง่าย: “พูดลำบาก ปากตก ยกไม่ขึ้น”\n… รู้ เร็ว รอด …',
                    size: 'xs',
                    color: '#9A3412',
                    weight: 'bold',
                    align: 'center',
                    wrap: true,
                  },
                ],
              },
            ],
          },
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: KHH_COLORS.BG_LIGHT_RED,
            cornerRadius: 'md',
            paddingAll: 'md',
            borderColor: '#FECACA',
            borderWidth: '1px',
            contents: [
              {
                type: 'text',
                text: '🫀 อาการกล้ามเนื้อหัวใจขาดเลือดเฉียบพลัน',
                size: 'sm',
                weight: 'bold',
                color: '#B91C1C',
              },
              {
                type: 'text',
                text: '• เจ็บแน่นหน้าอกร้าวไปที่แขนซ้าย คอ หรือกราม\n• หน้ามืด เป็นลม ร่วมกับเวียนศีรษะ\n• เจ็บหน้าอกรุนแรงเกิดขึ้นทันทีทันใด นานกว่า 20 นาที\n• อาการอื่นๆ ร่วมด้วย เช่น เหงื่อออก ตัวเย็น ใจสั่น',
                size: 'xs',
                color: '#374151',
                wrap: true,
                margin: 'xs',
              },
            ],
          },
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#FEFCE8',
            cornerRadius: 'md',
            paddingAll: 'md',
            borderColor: '#FEF08A',
            borderWidth: '1px',
            contents: [
              {
                type: 'text',
                text: '📞 เจ็บป่วยฉุกเฉิน โทร 1669 (โปรดแจ้งข้อมูลดังนี้)',
                size: 'xs',
                weight: 'bold',
                color: '#A16207',
              },
              {
                type: 'text',
                text: '1. อาการบาดเจ็บ / เจ็บป่วย\n2. จำนวนผู้บาดเจ็บ / ผู้ป่วย\n3. สถานที่เกิดเหตุ หรือจุดใกล้เคียงสังเกตง่าย\n4. ชื่อและเบอร์โทรศัพท์ผู้แจ้ง',
                size: 'xs',
                color: '#4B5563',
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
            color: KHH_COLORS.EMERGENCY_RED,
            height: 'md',
            action: {
              type: 'uri',
              label: KHH_CONTACTS.EMERGENCY_1669_DISPLAY,
              uri: KHH_CONTACTS.EMERGENCY_1669_URI,
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
