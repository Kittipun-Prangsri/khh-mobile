/**
 * NCDs Health Education LINE Flex Message Templates
 * Hospital: Khlong Hat Hospital (โรงพยาบาลคลองหาด)
 */

import { KHH_CONTACTS, KHH_COLORS } from './flexConstants';
import { createContactPhysicalTherapyFlex } from './contactFlex';

/**
 * 6. Tile 6: "คำแนะนำสุขภาพ"
 */
export function createHealthEducationMenuFlex() {
  return {
    type: 'flex',
    altText: '💚 คำแนะนำสุขภาพสำหรับผู้ป่วย NCDs',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: KHH_COLORS.SUCCESS_GREEN,
        paddingAll: 'lg',
        contents: [
          {
            type: 'text',
            text: '💚 คำแนะนำสุขภาพ NCDs Care',
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
            text: 'เลือกหมวดคำแนะนำทางการแพทย์ที่ต้องการอ่านเพิ่มเติม:',
            size: 'xs',
            color: '#334155',
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
            color: KHH_COLORS.DIET_GREEN,
            height: 'sm',
            action: {
              type: 'message',
              label: '🥗 1. การรับประทานอาหาร',
              text: 'คำแนะนำการรับประทานอาหาร',
            },
          },
          {
            type: 'button',
            style: 'primary',
            color: KHH_COLORS.THAI_MEDICINE_GREEN,
            height: 'sm',
            action: {
              type: 'message',
              label: '🌿 2. แพทย์แผนไทย',
              text: 'คำแนะนำแพทย์แผนไทย',
            },
          },
          {
            type: 'button',
            style: 'primary',
            color: KHH_COLORS.MEDICATION_BLUE,
            height: 'sm',
            action: {
              type: 'message',
              label: '💊 3. การใช้ยาและข้อควรระวัง',
              text: 'คำแนะนำการใช้ยา',
            },
          },
          {
            type: 'button',
            style: 'primary',
            color: KHH_COLORS.EXERCISE_ORANGE,
            height: 'sm',
            action: {
              type: 'message',
              label: '🏃 4. การออกกำลังกายส่งเสริมสุขภาพ',
              text: 'คำแนะนำการออกกำลังกาย',
            },
          },
          {
            type: 'button',
            style: 'primary',
            color: KHH_COLORS.MENTAL_PURPLE,
            height: 'sm',
            action: {
              type: 'message',
              label: '🧠 5. ประเมินสุขภาพจิต',
              text: 'คำแนะนำประเมินสุขภาพจิต',
            },
          },
        ],
      },
    },
  };
}

/**
 * 6.1 Sub-Tile: "คำแนะนำการรับประทานอาหาร" (Diet & Nutrition Education Flex)
 */
export function createDietAdviceFlex() {
  return {
    type: 'flex',
    altText: '🥗 คำแนะนำการรับประทานอาหารสำหรับผู้ป่วย NCDs - รพ.คลองหาด',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: KHH_COLORS.DIET_GREEN,
        paddingAll: 'lg',
        contents: [
          {
            type: 'text',
            text: '🥗 คำแนะนำการรับประทานอาหาร',
            color: '#FFFFFF',
            size: 'md',
            weight: 'bold',
          },
          {
            type: 'text',
            text: 'สำหรับผู้ป่วยกลุ่มโรค NCDs (รพ.คลองหาด)',
            color: '#DCFCE7',
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
            backgroundColor: '#F0FDF4',
            cornerRadius: 'md',
            paddingAll: 'md',
            borderColor: '#BBF7D0',
            borderWidth: '1px',
            contents: [
              {
                type: 'text',
                text: '🍽️ สูตรจัดจานอาหาร 2 : 1 : 1',
                size: 'xs',
                color: KHH_COLORS.SUCCESS_GREEN,
                weight: 'bold',
              },
              {
                type: 'text',
                text: '• ผัก 2 ส่วน: ผักใบเขียว ผักต้ม (กากใยสูง ช่วยคุมน้ำตาล)',
                size: 'xs',
                color: '#334155',
                margin: 'xs',
                wrap: true,
              },
              {
                type: 'text',
                text: '• แป้ง 1 ส่วน: ข้าวกล้อง ข้าวซ้อมมือ ขนมปังโฮลวีต',
                size: 'xs',
                color: '#334155',
                margin: 'xs',
                wrap: true,
              },
              {
                type: 'text',
                text: '• เนื้อสัตว์ 1 ส่วน: ปลา อกไก่ เต้าหู้ ไข่ขาว ไขมันต่ำ',
                size: 'xs',
                color: '#334155',
                margin: 'xs',
                wrap: true,
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
                text: '⚠️ อาหารที่ควรหลีกเลี่ยง (ลด หวาน-มัน-เค็ม)',
                size: 'xs',
                color: '#B91C1C',
                weight: 'bold',
              },
              {
                type: 'text',
                text: '• งดเครื่องดื่มชงหวาน ชานม น้ำอัดลม ขนมหวาน',
                size: 'xs',
                color: '#475569',
                margin: 'xs',
                wrap: true,
              },
              {
                type: 'text',
                text: '• ลดอาหารรสเค็มจัด ผงชูรส อาหารแปรรูป/หมักดอง',
                size: 'xs',
                color: '#475569',
                margin: 'xs',
                wrap: true,
              },
              {
                type: 'text',
                text: '• เลี่ยงของทอด กะทิ ขนมอบที่มีไขมันทรานส์',
                size: 'xs',
                color: '#475569',
                margin: 'xs',
                wrap: true,
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
                text: '💡 ข้อแนะนำเพิ่มเติมจากทีมพยาบาล',
                size: 'xs',
                color: '#92400E',
                weight: 'bold',
              },
              {
                type: 'text',
                text: 'ดื่มน้ำสะอาดวันละ 8-10 แก้ว และเคี้ยวอาหารช้าๆ อย่างน้อย 20 ครั้งต่อคำ เพื่อช่วยการย่อยและการดูดซึมน้ำตาลที่ดีขึ้น',
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
              label: '🥗 คุยกับนักโภชนาการ',
              text: 'คุยกับนักโภชนาการ',
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
 * 6.2 Sub-Tile: "คำแนะนำการใช้ยาและข้อควรระวัง" (Medication Advice Flex)
 */
export function createMedicationAdviceFlex() {
  return {
    type: 'flex',
    altText: '💊 คำแนะนำการใช้ยาและข้อควรระวังสำหรับผู้ป่วย NCDs - รพ.คลองหาด',
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
            text: '💊 คำแนะนำการใช้ยาและข้อควรระวัง',
            color: '#FFFFFF',
            size: 'md',
            weight: 'bold',
          },
          {
            type: 'text',
            text: 'สำหรับผู้ป่วยกลุ่มโรค NCDs (รพ.คลองหาด)',
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
                text: '💊 การรับประทานยาอย่างถูกวิธี',
                size: 'xs',
                color: '#0369A1',
                weight: 'bold',
              },
              {
                type: 'text',
                text: '• ทานยาตามแพทย์สั่งอย่างเคร่งครัด ห้ามหยุดยาหรือปรับขนาดยาเอง',
                size: 'xs',
                color: '#334155',
                margin: 'xs',
                wrap: true,
              },
              {
                type: 'text',
                text: '• ยาหลังอาหาร: ทานยาหลังอาหารทันทีหรือไม่เกิน 15-30 นาที',
                size: 'xs',
                color: '#334155',
                margin: 'xs',
                wrap: true,
              },
              {
                type: 'text',
                text: '• ยาก่อนอาหาร: ทานก่อนอาหาร30นาทีขึ้นไป (ยาเบาหวานต้องทานอาหารตามทันที)',
                size: 'xs',
                color: '#334155',
                margin: 'xs',
                wrap: true,
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
                text: '⚠️ ข้อควรระวังและข้อปฏิบัติตัว',
                size: 'xs',
                color: '#92400E',
                weight: 'bold',
              },
              {
                type: 'text',
                text: '• หากลืมทานยา: ให้ทานทันทีที่นึกได้ แต่ถ้าใกล้เวลาอาหารมื้อถัดไปให้ข้ามมื้อที่ลืม (ห้ามเพิ่มยาเป็น 2 เท่าเด็ดขาด)',
                size: 'xs',
                color: '#78350F',
                margin: 'xs',
                wrap: true,
              },
              {
                type: 'text',
                text: '• สังเกตอาการแพ้ยา: ผื่นคัน ปากบวม ตาบวม หายใจลำบาก ให้หยุดยาแล้วมาพบแพทย์ทันที',
                size: 'xs',
                color: '#78350F',
                margin: 'xs',
                wrap: true,
              },
            ],
          },
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#F3F4F6',
            cornerRadius: 'md',
            paddingAll: 'md',
            contents: [
              {
                type: 'text',
                text: '💡 การเก็บรักษายาอย่างถูกวิธี:',
                size: 'xs',
                color: '#374151',
                weight: 'bold',
              },
              {
                type: 'text',
                text: '• เก็บยาในที่แห้ง ไม่โดนแสงแดดและความร้อนโดยตรง (ยาฉีดอินซูลินที่ยังไม่เปิดใช้ให้เก็บในตู้เย็นช่องปกติ 2-8°C ห้ามแช่ช่องฟรีซ)',
                size: 'xs',
                color: '#4B5563',
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
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: KHH_COLORS.MEDICATION_BLUE,
            height: 'sm',
            action: {
              type: 'message',
              label: '💊 คุยกับเภสัชกร / สอบถามการใช้ยา',
              text: 'คุยกับเภสัชกร',
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
 * 6.4 Sub-Tile: "การออกกำลังกายส่งเสริมสุขภาพ" (Exercise Advice Flex)
 */
export function createExerciseAdviceFlex() {
  return {
    type: 'flex',
    altText: '🏃 คำแนะนำการออกกำลังกายสำหรับผู้ป่วย NCDs - รพ.คลองหาด',
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
            text: '🏃 การออกกำลังกายส่งเสริมสุขภาพ',
            color: '#FFFFFF',
            size: 'md',
            weight: 'bold',
            wrap: true,
          },
          {
            type: 'text',
            text: 'คำแนะนำสำหรับผู้ป่วย NCDs โรงพยาบาลคลองหาด',
            color: '#FED7AA',
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
            layout: 'horizontal',
            backgroundColor: '#FFF7ED',
            cornerRadius: 'md',
            paddingAll: 'md',
            contents: [
              {
                type: 'text',
                text: '⏱️',
                size: 'xl',
                flex: 0,
              },
              {
                type: 'box',
                layout: 'vertical',
                margin: 'md',
                contents: [
                  {
                    type: 'text',
                    text: 'เป้าหมายการออกกำลังกาย',
                    size: 'sm',
                    weight: 'bold',
                    color: KHH_COLORS.EXERCISE_ORANGE,
                  },
                  {
                    type: 'text',
                    text: 'อย่างน้อย 150 นาที/สัปดาห์ หรือ 30 นาที/วัน 5 วัน/สัปดาห์',
                    size: 'xs',
                    color: '#374151',
                    wrap: true,
                    margin: 'xs',
                  },
                ],
              },
            ],
          },
          {
            type: 'separator',
          },
          {
            type: 'text',
            text: '✅ กิจกรรมที่แนะนำสำหรับผู้ป่วย NCDs',
            size: 'sm',
            weight: 'bold',
            color: '#1F2937',
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
                  { type: 'text', text: '🚶', size: 'sm', flex: 0 },
                  {
                    type: 'text',
                    text: 'เดินเร็ว — ง่าย เหมาะกับทุกวัย ลดความดันโลหิตได้ดี',
                    size: 'xs',
                    color: '#374151',
                    wrap: true,
                    margin: 'md',
                  },
                ],
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  { type: 'text', text: '🏊', size: 'sm', flex: 0 },
                  {
                    type: 'text',
                    text: 'ว่ายน้ำ — ไม่กระแทกข้อ เหมาะกับผู้ที่มีน้ำหนักมาก',
                    size: 'xs',
                    color: '#374151',
                    wrap: true,
                    margin: 'md',
                  },
                ],
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  { type: 'text', text: '🚴', size: 'sm', flex: 0 },
                  {
                    type: 'text',
                    text: 'ปั่นจักรยาน — เพิ่มการทำงานของหัวใจและปอด',
                    size: 'xs',
                    color: '#374151',
                    wrap: true,
                    margin: 'md',
                  },
                ],
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  { type: 'text', text: '🧘', size: 'sm', flex: 0 },
                  {
                    type: 'text',
                    text: 'โยคะ / ไทชิ — ลดความเครียด เพิ่มความยืดหยุ่น',
                    size: 'xs',
                    color: '#374151',
                    wrap: true,
                    margin: 'md',
                  },
                ],
              },
            ],
          },
          {
            type: 'separator',
          },
          {
            type: 'text',
            text: '⚠️ ข้อควรระวังก่อนออกกำลังกาย',
            size: 'sm',
            weight: 'bold',
            color: KHH_COLORS.EMERGENCY_RED,
          },
          {
            type: 'text',
            text: '• หยุดทันทีหากมีอาการเจ็บหน้าอก หอบเหนื่อย หรือหน้ามืด\n• ควรอบอุ่นร่างกาย 5-10 นาทีก่อนเริ่ม\n• ตรวจน้ำตาลในเลือดก่อนออกกำลังกาย (ผู้ป่วยเบาหวาน)\n• ดื่มน้ำให้เพียงพอตลอดการออกกำลังกาย',
            size: 'xs',
            color: '#374151',
            wrap: true,
          },
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#F0FDF4',
            cornerRadius: 'md',
            paddingAll: 'md',
            contents: [
              {
                type: 'text',
                text: '💡 เคล็ดลับ: เริ่มต้นจากระยะสั้น แล้วค่อยๆ เพิ่มความเข้มข้น อย่าหักโหมในวันแรก',
                size: 'xs',
                color: KHH_COLORS.SUCCESS_GREEN,
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
            height: 'md',
            action: {
              type: 'message',
              label: '📅 นัดหมายกายภาพบำบัด',
              text: 'ขอนัดหมายกายภาพบำบัด',
            },
          },
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'message',
              label: '🔙 กลับเมนูคำแนะนำสุขภาพ',
              text: 'คำแนะนำสุขภาพ',
            },
          },
        ],
      },
    },
  };
}

/**
 * 6.5 Sub-Tile: "คำแนะนำการบริการแพทย์แผนไทย" (Thai Traditional Medicine Advice Flex)
 */
export function createThaiMedicineAdviceFlex() {
  return {
    type: 'flex',
    altText: '🌿 คำแนะนำการบริการแพทย์แผนไทย - รพ.คลองหาด',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: KHH_COLORS.THAI_MEDICINE_GREEN,
        paddingAll: 'lg',
        contents: [
          {
            type: 'text',
            text: '🌿 การบริการแพทย์แผนไทย',
            color: '#FFFFFF',
            size: 'md',
            weight: 'bold',
            wrap: true,
          },
          {
            type: 'text',
            text: KHH_CONTACTS.THAI_MEDICINE_DEPT,
            color: '#D1FAE5',
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
            backgroundColor: '#ECFDF5',
            cornerRadius: 'md',
            paddingAll: 'md',
            borderColor: '#A7F3D0',
            borderWidth: '1px',
            contents: [
              {
                type: 'text',
                text: '💆‍♂️ บริการหัตถการไทยเพื่อสุขภาพ',
                size: 'xs',
                color: KHH_COLORS.THAI_MEDICINE_GREEN,
                weight: 'bold',
              },
              {
                type: 'text',
                text: '• นวดรักษาและประคบสมุนไพร: บรรเทาปวดเมื่อยกล้ามเนื้อ ข้อต่อ บรรเทาอาการออฟฟิศซินโดรม',
                size: 'xs',
                color: '#334155',
                margin: 'xs',
                wrap: true,
              },
              {
                type: 'text',
                text: '• อบสมุนไพรสด: ช่วยขยายหลอดเลือด กระตุ้นการไหลเวียนโลหิต ผ่อนคลายความเครียด',
                size: 'xs',
                color: '#334155',
                margin: 'xs',
                wrap: true,
              },
              {
                type: 'text',
                text: '• ทับหม้อเกลือ: สำหรับมารดาหลังคลอด ช่วยให้มดลูกเข้าอู่และฟื้นฟูร่างกาย',
                size: 'xs',
                color: '#334155',
                margin: 'xs',
                wrap: true,
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
                text: '🌱 ยาสมุนไพรและการดูแลสุขภาพผู้ป่วย NCDs',
                size: 'xs',
                color: '#B45309',
                weight: 'bold',
              },
              {
                type: 'text',
                text: '• จ่ายยาสมุนไพรในบัญชียาหลักแห่งชาติ (เช่น ขมิ้นชัน มะขามป้อม ยาน้ำมันไพล) ร่วมกับการตรวจประเมินโดยแพทย์แผนไทย',
                size: 'xs',
                color: '#78350F',
                margin: 'xs',
                wrap: true,
              },
              {
                type: 'text',
                text: '• ให้คำแนะนำการปรับธาตุตามเจ้าเรือนและการใช้สมุนไพรอย่างปลอดภัยในผู้ป่วยโรคเรื้อรัง',
                size: 'xs',
                color: '#78350F',
                margin: 'xs',
                wrap: true,
              },
            ],
          },
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#F3F4F6',
            cornerRadius: 'md',
            paddingAll: 'md',
            contents: [
              {
                type: 'text',
                text: '💡 ข้อควรระวังก่อนรับบริการหัตถการ:',
                size: 'xs',
                color: '#374151',
                weight: 'bold',
              },
              {
                type: 'text',
                text: '• งดรับบริการนวดอบประคบขณะมีไข้สูง (>38.5°C) หรือความดันโลหิตสูงจัด (>160/100 mmHg)\n• โปรดแจ้งโรคประจำตัวและภาวะตั้งครรภ์ให้เจ้าหน้าที่ทราบก่อนทุกครั้ง',
                size: 'xs',
                color: '#4B5563',
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
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: KHH_COLORS.THAI_MEDICINE_GREEN,
            height: 'sm',
            action: {
              type: 'message',
              label: '🌿 ติดต่อ/คุยกับแพทย์แผนไทย',
              text: 'คุยกับแพทย์แผนไทย',
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
 * 6.3 Sub-Tile: "คำแนะนำการจัดการความเครียดและการนอนหลับ" (Stress & Sleep Advice Flex)
 */
export function createStressAndSleepAdviceFlex() {
  return {
    type: 'flex',
    altText: '🧠 คำแนะนำการประเมินสุขภาพจิตและความเครียด - รพ.คลองหาด',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: KHH_COLORS.MENTAL_PURPLE,
        paddingAll: 'lg',
        contents: [
          {
            type: 'text',
            text: '🧠 การประเมินสุขภาพจิตและความเครียด',
            color: '#FFFFFF',
            size: 'md',
            weight: 'bold',
            wrap: true,
          },
          {
            type: 'text',
            text: `ข้อแนะนำสำคัญก่อนเริ่มประเมิน (${KHH_CONTACTS.HOSPITAL_SHORT})`,
            color: '#EDE9FE',
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
            backgroundColor: KHH_COLORS.BG_LIGHT_BLUE,
            cornerRadius: 'md',
            paddingAll: 'md',
            borderColor: '#BFDBFE',
            borderWidth: '1px',
            contents: [
              {
                type: 'text',
                text: '📌 คำแนะนำสำคัญก่อนเริ่มประเมิน',
                size: 'xs',
                color: '#1E40AF',
                weight: 'bold',
              },
              {
                type: 'text',
                text: '• เกณฑ์ 2 สัปดาห์: \nย้อนนึกถึงความรู้สึกใน 14 วันที่ผ่านมาเท่านั้น ไม่ใช่แค่ความรู้สึกชั่ววูบวันนี้',
                size: 'xs',
                color: '#1E3A8A',
                margin: 'xs',
                wrap: true,
              },
              {
                type: 'text',
                text: '• ตอบตามความจริง: \nซื่อสัตย์กับตนเอง ห้ามลดหรือเพิ่มระดับอาการ',
                size: 'xs',
                color: '#1E3A8A',
                margin: 'xs',
                wrap: true,
              },
              {
                type: 'text',
                text: '• เลือกเวลาที่พร้อม: \nทำขณะสมองโปร่ง หลีกเลี่ยงทำหลังเผชิญเหตุสะเทือนใจสดๆ',
                size: 'xs',
                color: '#1E3A8A',
                margin: 'xs',
                wrap: true,
              },
              {
                type: 'text',
                text: '• ความถี่: \nไม่มีเลย | บางวัน | มีบ่อย | มีเกือบทุกวัน',
                size: 'xs',
                color: '#1E3A8A',
                margin: 'xs',
                wrap: true,
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
                text: '⚠️ ข้อควรระวังที่ต้องตระหนัก',
                size: 'xs',
                color: '#B91C1C',
                weight: 'bold',
              },
              {
                type: 'text',
                text: '• ไม่ใช่การวินิจฉัยโรค: \nเป็นการคัดกรองเบื้องต้น ไม่สามารถระบุว่าเป็นโรคซึมเศร้า',
                size: 'xs',
                color: '#991B1B',
                margin: 'xs',
                wrap: true,
              },
              {
                type: 'text',
                text: '• อาการจากโรคทางกาย: \nอ่อนเพลีย/นอนไม่หลับ อาจเกิดจากไทรอยด์ต่ำ หรือผลข้างเคียงยา',
                size: 'xs',
                color: '#991B1B',
                margin: 'xs',
                wrap: true,
              },
              {
                type: 'text',
                text: '• อารมณ์เศร้าตามธรรมชาติ: \nความโศกเศร้าจากการสูญเสียทำให้คะแนนสูงชั่วคราวได้',
                size: 'xs',
                color: '#991B1B',
                margin: 'xs',
                wrap: true,
              },
              {
                type: 'text',
                text: '🚨 คิดทำร้ายตนเอง: \nหากมีข้อถามถึงความคิดอยากตาย แล้วตอบว่า "มี" ควรรีบขอความช่วยเหลือทันที!',
                size: 'xs',
                color: KHH_COLORS.EMERGENCY_RED,
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
            color: KHH_COLORS.MENTAL_PURPLE,
            height: 'sm',
            action: {
              type: 'uri',
              label: '📋 แบบประเมินสุขภาพจิต (Google Form)',
              uri: 'https://docs.google.com/forms/d/e/1FAIpQLSddhwdT8RDyYBQ1AaTJfUVQXhJfXhyyJUASIfSSLk2z-JwVzg/viewform',
            },
          },
          {
            type: 'button',
            style: 'primary',
            color: KHH_COLORS.PRIMARY_TEAL,
            height: 'sm',
            action: {
              type: 'uri',
              label: '📊 ประเมินความเครียด DMH Check-in',
              uri: 'https://checkin.dmh.go.th/main/index.php?type=1',
            },
          },
          {
            type: 'button',
            style: 'primary',
            color: KHH_COLORS.EMERGENCY_RED,
            height: 'sm',
            action: {
              type: 'uri',
              label: '🚨 สายด่วนสุขภาพจิต 1323',
              uri: KHH_CONTACTS.HOTLINE_1323_URI,
            },
          },
          {
            type: 'button',
            style: 'primary',
            color: KHH_COLORS.MENTAL_DARK_PURPLE,
            height: 'sm',
            action: {
              type: 'message',
              label: '📞 ติดต่อเจ้าหน้าที่สุขภาพจิต',
              text: 'ติดต่อเจ้าหน้าที่สุขภาพจิต',
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

export function createMentalHealthAndStressAdviceFlex() {
  return createStressAndSleepAdviceFlex();
}

/**
 * 6.4.1 Sub-Tile: "รับคำขอนัดหมายกายภาพบำบัด" (Physical Therapy Request Flex Card)
 */
export function createPhysicalTherapyRequestFlex() {
  return createContactPhysicalTherapyFlex();
}
