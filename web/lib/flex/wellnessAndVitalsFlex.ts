/**
 * Patient Lab Results, Vitals, Preparation Guide, Wellness & Gamification Badges
 * Hospital: Khlong Hat Hospital (โรงพยาบาลคลองหาด)
 */

import { KHH_CONTACTS, KHH_COLORS } from './flexConstants';

/**
 * Helper to build visual health progress gauge bar for Flex Message
 */
function createGaugeBar(percentage: number, fillColor: string) {
  const boundedPct = Math.min(Math.max(percentage, 5), 100);
  return {
    type: 'box',
    layout: 'horizontal',
    backgroundColor: '#E2E8F0',
    height: '8px',
    cornerRadius: 'md',
    margin: 'xs',
    contents: [
      {
        type: 'box',
        layout: 'vertical',
        backgroundColor: fillColor,
        width: `${boundedPct}%`,
        cornerRadius: 'md',
      },
    ],
  };
}

/**
 * 5. Tile 5: "การเตรียมตัวก่อนพบแพทย์"
 */
export function createPreparationGuideFlex() {
  return {
    type: 'flex',
    altText: '📋 ข้อแนะนำการเตรียมตัวก่อนพบแพทย์',
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
            text: '📋 การเตรียมตัวก่อนพบแพทย์',
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
            text: '1. การเจาะเลือดตรวจน้ำตาล/ไขมัน:',
            size: 'xs',
            color: '#0369A1',
            weight: 'bold',
          },
          {
            type: 'text',
            text: '• งดน้ำและอาหารทุกชนิดอย่างน้อย 8-12 ชั่วโมง (จิบน้ำบริสุทธิ์ได้เล็กน้อย)',
            size: 'xs',
            color: '#475569',
            wrap: true,
          },
          {
            type: 'text',
            text: '2. ยาประจำตัว:',
            size: 'xs',
            color: '#0369A1',
            weight: 'bold',
            margin: 'sm',
          },
          {
            type: 'text',
            text: '• นำยาที่รับประทานประจำและฉีดประจำมาแสดงต่อเจ้าหน้าที่ทุกครั้ง (ยาทานหลังอาหารมื้อเช้าให้งดไว้ก่อน แล้วทานหลังเจาะเลือดเสร็จ)',
            size: 'xs',
            color: '#475569',
            wrap: true,
          },
          {
            type: 'text',
            text: '3. เอกสาร:',
            size: 'xs',
            color: '#0369A1',
            weight: 'bold',
            margin: 'sm',
          },
          {
            type: 'text',
            text: '• บัตรประชาชน และใบนัดหมายเดิม',
            size: 'xs',
            color: '#475569',
            wrap: true,
          },
        ],
      },
    },
  };
}

/**
 * Generate Full Patient Vitals & Lab Results Flex Card with Visual Progress Gauges
 */
export function createPatientVitalsFlex(
  patientName: string = 'สมชาย ดีเลิศ',
  hn: string = 'HN-98302',
  vitals?: {
    weight?: string;
    height?: string;
    bmi?: string;
    bps?: string;
    bpd?: string;
    fbs?: string;
    hba1c?: string;
    egfr?: string;
    cholesterol?: string;
    checkDate?: string;
  }
) {
  const v = {
    weight: vitals?.weight || '62.5',
    height: vitals?.height || '165',
    bmi: vitals?.bmi || '22.9',
    bps: vitals?.bps || '124',
    bpd: vitals?.bpd || '82',
    fbs: vitals?.fbs || '112',
    hba1c: vitals?.hba1c || '6.5',
    egfr: vitals?.egfr || '88',
    cholesterol: vitals?.cholesterol || '185',
    checkDate: vitals?.checkDate || 'ล่าสุดสดจาก HOSxP',
  };

  // Calculations for Visual Gauge Bars
  const bmiVal = parseFloat(v.bmi) || 22.9;
  const bmiStatusLabel = bmiVal < 18.5 ? '🔴 น้ำหนักน้อยกว่าเกณฑ์' : bmiVal <= 22.9 ? '🟢 น้ำหนักอยู่ในเกณฑ์ปกติ' : bmiVal <= 24.9 ? '🟡 น้ำหนักเกิน (ท้วม)' : '🔴 ภาวะอ้วน (เสี่ยง NCDs)';
  const bmiBg = bmiVal <= 22.9 && bmiVal >= 18.5 ? '#DCFCE7' : bmiVal <= 24.9 ? '#FEF3C7' : '#FEE2E2';
  const bmiColor = bmiVal <= 22.9 && bmiVal >= 18.5 ? '#15803D' : bmiVal <= 24.9 ? '#B45309' : '#B91C1C';
  const bmiGaugePct = Math.min((bmiVal / 35) * 100, 100);

  const bpsVal = parseInt(v.bps) || 124;
  const bpStatusLabel = bpsVal < 120 ? '🟢 ความดันโลหิตปกติ (<120/80)' : bpsVal <= 139 ? '🟡 ความดันเริ่มสูง (120-139)' : '🔴 ความดันสูงกว่าเกณฑ์ (≥140)';
  const bpBg = bpsVal < 120 ? '#DCFCE7' : bpsVal <= 139 ? '#FEF3C7' : '#FEE2E2';
  const bpColor = bpsVal < 120 ? '#15803D' : bpsVal <= 139 ? '#B45309' : '#B91C1C';
  const bpGaugePct = Math.min((bpsVal / 180) * 100, 100);

  const fbsVal = parseFloat(v.fbs) || 112;
  const fbsGaugePct = Math.min((fbsVal / 200) * 100, 100);
  const fbsColor = fbsVal < 100 ? '#15803D' : fbsVal <= 125 ? '#B45309' : '#B91C1C';

  const hba1cVal = parseFloat(v.hba1c) || 6.5;
  const hba1cGaugePct = Math.min((hba1cVal / 12) * 100, 100);
  const hba1cColor = hba1cVal < 6.5 ? '#15803D' : hba1cVal <= 7.0 ? '#B45309' : '#B91C1C';

  const egfrVal = parseFloat(v.egfr) || 88;
  const egfrGaugePct = Math.min((egfrVal / 120) * 100, 100);
  const egfrColor = egfrVal >= 60 ? '#15803D' : egfrVal >= 30 ? '#B45309' : '#B91C1C';

  return {
    type: 'flex',
    altText: `📊 สรุปผลตรวจสุขภาพ & สัญญาณชีพ: คุณ${patientName} (${hn})`,
    contents: {
      type: 'bubble',
      size: 'giga',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#0F766E',
        paddingAll: 'lg',
        contents: [
          {
            type: 'text',
            text: '📊 สรุปผลตรวจสุขภาพ & สัญญาณชีพ',
            color: '#FFFFFF',
            size: 'lg',
            weight: 'bold',
            wrap: true,
          },
          {
            type: 'text',
            text: `โรงพยาบาลคลองหาด (${v.checkDate})`,
            color: '#CCFBF1',
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
        spacing: 'lg',
        contents: [
          // Patient Identity Box
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: KHH_COLORS.LIGHT_TEAL_BG,
            cornerRadius: 'md',
            paddingAll: 'md',
            borderColor: '#99F6E4',
            borderWidth: '1px',
            contents: [
              {
                type: 'text',
                text: '👤 ผู้ป่วยลงทะเบียน:',
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
                text: `หมายเลข HN: ${hn}`,
                size: 'xs',
                color: KHH_COLORS.TEXT_MUTED,
                margin: 'xs',
              },
            ],
          },

          // Section 1: Body Measurements & Visual BMI Gauge
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#F8FAFC',
            cornerRadius: 'md',
            paddingAll: 'md',
            borderColor: '#E2E8F0',
            borderWidth: '1px',
            spacing: 'sm',
            contents: [
              {
                type: 'text',
                text: '⚖️ ร่างกาย & ดัชนีมวลกาย (BMI)',
                size: 'sm',
                color: '#334155',
                weight: 'bold',
                wrap: true,
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: `น้ำหนัก: ${v.weight} kg`,
                    size: 'xs',
                    color: KHH_COLORS.TEXT_MAIN,
                    flex: 1,
                  },
                  {
                    type: 'text',
                    text: `ส่วนสูง: ${v.height} cm`,
                    size: 'xs',
                    color: KHH_COLORS.TEXT_MAIN,
                    flex: 1,
                  },
                  {
                    type: 'text',
                    text: `BMI: ${v.bmi}`,
                    size: 'xs',
                    color: KHH_COLORS.TEXT_MAIN,
                    weight: 'bold',
                    flex: 1,
                  },
                ],
              },
              createGaugeBar(bmiGaugePct, bmiColor),
              {
                type: 'box',
                layout: 'vertical',
                backgroundColor: bmiBg,
                cornerRadius: 'sm',
                paddingAll: 'sm',
                margin: 'xs',
                contents: [
                  {
                    type: 'text',
                    text: `ประเมิน: ${bmiStatusLabel}`,
                    size: 'xs',
                    color: bmiColor,
                    weight: 'bold',
                    wrap: true,
                  },
                ],
              },
            ],
          },

          // Section 2: Blood Pressure & Visual BP Gauge
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#F0FDF4',
            cornerRadius: 'md',
            paddingAll: 'md',
            borderColor: '#BBF7D0',
            borderWidth: '1px',
            spacing: 'sm',
            contents: [
              {
                type: 'text',
                text: '🩺 ความดันโลหิต (Blood Pressure)',
                size: 'sm',
                color: '#166534',
                weight: 'bold',
                wrap: true,
              },
              {
                type: 'box',
                layout: 'horizontal',
                spacing: 'md',
                margin: 'xs',
                contents: [
                  {
                    type: 'text',
                    text: `${v.bps} / ${v.bpd}`,
                    size: 'xl',
                    color: KHH_COLORS.SUCCESS_GREEN,
                    weight: 'bold',
                    flex: 0,
                  },
                  {
                    type: 'text',
                    text: 'mmHg',
                    size: 'xs',
                    color: KHH_COLORS.TEXT_MUTED,
                    align: 'start',
                    gravity: 'bottom',
                    flex: 1,
                  },
                ],
              },
              createGaugeBar(bpGaugePct, bpColor),
              {
                type: 'box',
                layout: 'vertical',
                backgroundColor: bpBg,
                cornerRadius: 'sm',
                paddingAll: 'sm',
                margin: 'xs',
                contents: [
                  {
                    type: 'text',
                    text: `ประเมิน: ${bpStatusLabel}`,
                    size: 'xs',
                    color: bpColor,
                    weight: 'bold',
                    wrap: true,
                  },
                ],
              },
            ],
          },

          // Section 3: Laboratory Results (FBS, HbA1c, eGFR, Cholesterol) with Visual Gauges
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: KHH_COLORS.BG_LIGHT_BLUE,
            cornerRadius: 'md',
            paddingAll: 'md',
            borderColor: '#BFDBFE',
            borderWidth: '1px',
            spacing: 'sm',
            contents: [
              {
                type: 'text',
                text: '🧪 ผลแล็บห้องปฏิบัติการ (Lab Results Gauges)',
                size: 'sm',
                color: '#1E40AF',
                weight: 'bold',
                wrap: true,
              },

              // Item 1: FBS
              {
                type: 'box',
                layout: 'vertical',
                backgroundColor: '#FFFFFF',
                cornerRadius: 'sm',
                paddingAll: 'sm',
                borderColor: '#DBEAFE',
                borderWidth: '1px',
                contents: [
                  {
                    type: 'text',
                    text: '🍬 น้ำตาลก่อนอาหาร (FBS):',
                    size: 'xs',
                    color: '#334155',
                    weight: 'bold',
                  },
                  {
                    type: 'text',
                    text: `${v.fbs} mg/dL  (เกณฑ์ปกติ 70-99 mg/dL)`,
                    size: 'xs',
                    color: KHH_COLORS.TEXT_MAIN,
                    margin: 'xs',
                    wrap: true,
                  },
                  createGaugeBar(fbsGaugePct, fbsColor),
                ],
              },

              // Item 2: HbA1c
              {
                type: 'box',
                layout: 'vertical',
                backgroundColor: '#FFFFFF',
                cornerRadius: 'sm',
                paddingAll: 'sm',
                borderColor: '#DBEAFE',
                borderWidth: '1px',
                contents: [
                  {
                    type: 'text',
                    text: '🩸 น้ำตาลสะสม (HbA1c):',
                    size: 'xs',
                    color: '#334155',
                    weight: 'bold',
                  },
                  {
                    type: 'text',
                    text: `${v.hba1c} %  (เกณฑ์คุมดี < 6.5%)`,
                    size: 'xs',
                    color: hba1cColor,
                    weight: 'bold',
                    margin: 'xs',
                    wrap: true,
                  },
                  createGaugeBar(hba1cGaugePct, hba1cColor),
                ],
              },

              // Item 3: eGFR
              {
                type: 'box',
                layout: 'vertical',
                backgroundColor: '#FFFFFF',
                cornerRadius: 'sm',
                paddingAll: 'sm',
                borderColor: '#DBEAFE',
                borderWidth: '1px',
                contents: [
                  {
                    type: 'text',
                    text: '🫘 ค่าการทำงานของไต (eGFR):',
                    size: 'xs',
                    color: '#334155',
                    weight: 'bold',
                  },
                  {
                    type: 'text',
                    text: `${v.egfr} mL/min/1.73m²  (เกณฑ์ปกติ ≥ 60)`,
                    size: 'xs',
                    color: egfrColor,
                    weight: 'bold',
                    margin: 'xs',
                    wrap: true,
                  },
                  createGaugeBar(egfrGaugePct, egfrColor),
                ],
              },

              // Item 4: Cholesterol
              {
                type: 'box',
                layout: 'vertical',
                backgroundColor: '#FFFFFF',
                cornerRadius: 'sm',
                paddingAll: 'sm',
                borderColor: '#DBEAFE',
                borderWidth: '1px',
                contents: [
                  {
                    type: 'text',
                    text: '🥑 ไขมันรวม (Cholesterol):',
                    size: 'xs',
                    color: '#334155',
                    weight: 'bold',
                  },
                  {
                    type: 'text',
                    text: `${v.cholesterol} mg/dL  (เกณฑ์ปกติ < 200 mg/dL)`,
                    size: 'xs',
                    color: KHH_COLORS.SUCCESS_GREEN,
                    weight: 'bold',
                    margin: 'xs',
                    wrap: true,
                  },
                ],
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
            color: '#0F766E',
            height: 'sm',
            action: {
              type: 'uri',
              label: `📞 สอบถามพยาบาลคลินิก NCDs (${KHH_CONTACTS.NCD_CLINIC_PHONE_DISPLAY})`,
              uri: KHH_CONTACTS.NCD_CLINIC_PHONE_URI,
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
        ],
      },
    },
  };
}

/**
 * Generate Health Gamification & Digital Badge Flex Card
 */
export function createHealthGamificationBadgeFlex(params: {
  patientName: string;
  hn: string;
  badgeTitle: string;        // e.g. "🥇 ผู้ป่วย NCDs ดีเด่น"
  badgeSubtitle: string;     // e.g. "มาตรงนัดหมายตรวจติดตามติดต่อกัน 3 ครั้ง"
  badgeCategory: 'appointment' | 'hba1c' | 'bp' | 'general';
}) {
  const { patientName, hn, badgeTitle, badgeSubtitle, badgeCategory } = params;

  let badgeIcon = '🏆';
  let badgeColor = KHH_COLORS.GOLD_BADGE;
  let badgeBg = '#FEF3C7';

  if (badgeCategory === 'hba1c') {
    badgeIcon = '🌟';
    badgeColor = KHH_COLORS.SUCCESS_GREEN;
    badgeBg = '#DCFCE7';
  } else if (badgeCategory === 'bp') {
    badgeIcon = '🩺';
    badgeColor = KHH_COLORS.MEDICATION_BLUE;
    badgeBg = '#E0F2FE';
  }

  return {
    type: 'flex',
    altText: `🏆 ขอแสดงความยินดี! คุณ${patientName} ได้รับตราสัญลักษณ์ ${badgeTitle}`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: badgeColor,
        paddingAll: 'lg',
        alignItems: 'center',
        contents: [
          {
            type: 'text',
            text: badgeIcon,
            size: '3xl',
            align: 'center',
          },
          {
            type: 'text',
            text: 'เกียรติบัตรสุขภาพดี รพ.คลองหาด',
            color: '#FFFFFF',
            size: 'xs',
            weight: 'bold',
            margin: 'sm',
          },
          {
            type: 'text',
            text: badgeTitle,
            color: '#FFFFFF',
            size: 'lg',
            weight: 'bold',
            align: 'center',
            wrap: true,
            margin: 'xs',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: 'lg',
        spacing: 'md',
        alignItems: 'center',
        contents: [
          {
            type: 'text',
            text: `ขอแสดงความยินดีกับ คุณ${patientName}`,
            size: 'md',
            weight: 'bold',
            color: KHH_COLORS.TEXT_MAIN,
            align: 'center',
          },
          {
            type: 'text',
            text: `หมายเลข HN: ${hn}`,
            size: 'xs',
            color: KHH_COLORS.TEXT_MUTED,
            align: 'center',
          },
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: badgeBg,
            cornerRadius: 'md',
            paddingAll: 'md',
            borderColor: badgeColor,
            borderWidth: '1px',
            alignItems: 'center',
            contents: [
              {
                type: 'text',
                text: badgeSubtitle,
                size: 'xs',
                color: KHH_COLORS.TEXT_MAIN,
                weight: 'bold',
                align: 'center',
                wrap: true,
              },
              {
                type: 'text',
                text: 'ทีมแพทย์และพยาบาลขอชื่นชมและเป็นกำลังใจในการดูแลสุขภาพอย่างยั่งยืนค่ะ 💚',
                size: 'xs',
                color: KHH_COLORS.TEXT_MUTED,
                align: 'center',
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
            color: badgeColor,
            height: 'sm',
            action: {
              type: 'message',
              label: '💚 อ่านคู่มือดูแลสุขภาพดีต่อเนื่อง',
              text: 'คำแนะนำสุขภาพ',
            },
          },
        ],
      },
    },
  };
}

/**
 * Generate General Wellness & Prevention Flex Card for Non-chronic Patients
 */
export function createGeneralWellnessFlexMessage() {
  return {
    type: 'flex',
    altText: '🌿 ข้อมูลสุขภาพดี & การป้องกันโรค NCDs - รพ.คลองหาด',
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
            text: '🌿 คู่มือดูแลสุขภาพดี & ป้องกันโรค NCDs',
            color: '#FFFFFF',
            size: 'md',
            weight: 'bold',
          },
          {
            type: 'text',
            text: 'คำแนะนำการส่งเสริมสุขภาพสำหรับประชาชน - รพ.คลองหาด',
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
            type: 'text',
            text: 'ยินดีด้วยค่ะ! ท่านไม่มีประวัติป่วยด้วยโรคเรื้อรัง (NCDs) มาร่วมรักษาสุขภาพให้แข็งแรง เพื่อป้องกันโรคในระยะยาวด้วยหลัก 4 อ. ดังนี้ค่ะ:',
            size: 'xs',
            color: '#334155',
            wrap: true,
            weight: 'bold',
          },
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#F0FDF4',
            cornerRadius: 'md',
            paddingAll: 'md',
            borderColor: '#BBF7D0',
            borderWidth: '1px',
            spacing: 'sm',
            contents: [
              {
                type: 'text',
                text: '🥗 1. อาหาร 2:1:1 (ลดหวาน มัน เค็ม)',
                size: 'xs',
                color: '#166534',
                weight: 'bold',
              },
              {
                type: 'text',
                text: 'เน้นผัก 2 ส่วน, ข้าวแป้ง 1 ส่วน, โปรตีน 1 ส่วน เลี่ยงน้ำหวานและอาหารแปรรูป',
                size: 'xs',
                color: '#475569',
                wrap: true,
              },
              {
                type: 'separator',
                color: '#DCFCE7',
                margin: 'xs',
              },
              {
                type: 'text',
                text: '🏃 2. ออกกำลังกายสม่ำเสมอ',
                size: 'xs',
                color: '#166534',
                weight: 'bold',
              },
              {
                type: 'text',
                text: 'ขยับร่างกายอย่างน้อย 150 นาที/สัปดาห์ (วันละ 30 นาที 5 วัน)',
                size: 'xs',
                color: '#475569',
                wrap: true,
              },
              {
                type: 'separator',
                color: '#DCFCE7',
                margin: 'xs',
              },
              {
                type: 'text',
                text: '😴 3. อารมณ์และการนอนหลับ',
                size: 'xs',
                color: '#166534',
                weight: 'bold',
              },
              {
                type: 'text',
                text: 'นอนหลับ 7-8 ชม./คืน ผ่อนคลายความเครียดสะสม',
                size: 'xs',
                color: '#475569',
                wrap: true,
              },
              {
                type: 'separator',
                color: '#DCFCE7',
                margin: 'xs',
              },
              {
                type: 'text',
                text: '🚭 4. อนามัยสิ่งแวดล้อม (งดบุหรี่/สุรา)',
                size: 'xs',
                color: '#166534',
                weight: 'bold',
              },
              {
                type: 'text',
                text: 'งดสูบบุหรี่ บุหรี่ไฟฟ้า และดื่มสุรา เพื่อหลอดเลือดและหัวใจที่แข็งแรง',
                size: 'xs',
                color: '#475569',
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
              label: '🥗 อ่านคำแนะนำโภชนาการสุขภาพดี',
              text: 'คำแนะนำการรับประทานอาหาร',
            },
          },
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'message',
              label: '🏃 คำแนะนำการออกกำลังกาย',
              text: 'คำแนะนำการออกกำลังกาย',
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
 * Generate Automatic Risk & Interactive Menu Flex Card
 */
export function createRiskAssessmentAndMenuFlex() {
  return {
    type: 'flex',
    altText: '⚡ เมนูบริการสุขภาพและความเสี่ยง (Risk Menu) - รพ.คลองหาด',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#0F172A',
        paddingAll: 'lg',
        contents: [
          {
            type: 'text',
            text: '⚡ เมนูบริการและประเมินความเสี่ยง',
            color: '#FFFFFF',
            size: 'md',
            weight: 'bold',
          },
          {
            type: 'text',
            text: 'โปรดเลือกรายการบริการที่ต้องการตรวจสอบ:',
            color: '#94A3B8',
            size: 'xs',
            margin: 'xs',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: 'md',
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: KHH_COLORS.PRIMARY_TEAL,
            height: 'sm',
            action: {
              type: 'message',
              label: '🗓️ เช็ควันนัดหมายตรวจติดตาม',
              text: 'นัดหมายของฉัน',
            },
          },
          {
            type: 'button',
            style: 'primary',
            color: '#E11D48',
            height: 'sm',
            action: {
              type: 'message',
              label: '❤️ ประเมินความเสี่ยง CVD Risk',
              text: 'ประเมินความเสี่ยง',
            },
          },
          {
            type: 'button',
            style: 'primary',
            color: KHH_COLORS.DIET_GREEN,
            height: 'sm',
            action: {
              type: 'message',
              label: '🥗 คำแนะนำอาหารและโภชนาการ',
              text: 'คำแนะนำการรับประทานอาหาร',
            },
          },
          {
            type: 'button',
            style: 'primary',
            color: KHH_COLORS.MEDICATION_BLUE,
            height: 'sm',
            action: {
              type: 'message',
              label: '💊 คำแนะนำการใช้ยาและข้อควรระวัง',
              text: 'คำแนะนำการใช้ยา',
            },
          },
          {
            type: 'button',
            style: 'primary',
            color: KHH_COLORS.EMERGENCY_RED,
            height: 'sm',
            action: {
              type: 'message',
              label: '🚨 อาการฉุกเฉินที่ต้องพบแพทย์',
              text: 'อาการฉุกเฉิน',
            },
          },
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'message',
              label: '🎧 ติดต่อเจ้าหน้าที่ / พยาบาล NCDs',
              text: 'ติดต่อเจ้าหน้าที่',
            },
          },
        ],
      },
    },
  };
}
