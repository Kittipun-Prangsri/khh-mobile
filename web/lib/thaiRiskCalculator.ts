/**
 * RAMA CVD Risk Score 2021 Utility Calculator
 * Reference: Thai Atherosclerosis Society & Ministry of Public Health Thailand (2021)
 */

export type AssessmentMode = 'lab' | 'non_lab';

export type Sex = 'male' | 'female';
export type SmokingStatus = 'smoke' | 'no_smoke';
export type DiabetesStatus = 'dm' | 'no_dm';

export interface ThaiRiskInput {
  mode: AssessmentMode;
  age: number; // 30 - 70 years
  sex: Sex;
  sbp: number; // Systolic BP (70 - 220 mmHg)
  smoking: SmokingStatus;
  diabetes: DiabetesStatus;
  // Lab Mode inputs
  totalCholesterol?: number; // TC in mg/dL (100 - 500)
  // Non-Lab Mode inputs
  waistCm?: number; // Waist circumference in cm
  heightCm?: number; // Height in cm
  waistUnit?: 'cm' | 'inch'; // Optional input unit
}

export type RiskGroup = 'low' | 'moderate' | 'high' | 'very_high';

export interface ThaiRiskResult {
  mode: AssessmentMode;
  rawPercentage: number;
  riskDisplay: string; // e.g. "8.4%", "มากกว่า 30%"
  riskGroup: RiskGroup;
  riskStageText: string; // e.g. "ระยะที่ 1 (เสี่ยงต่ำ <10%)"
  riskLevelTitle: string; // e.g. "เสี่ยงต่ำ (<10%)"
  riskLevelText: string;
  badgeBgColor: string;
  badgeTextColor: string;
  badgeBorderColor: string;
  cardBorderColor: string;
  compareRiskText: string;
  whr?: number; // Waist-to-Height ratio
  suggestions: string[];
}

/**
 * Calculates the 10-year Cardiovascular Disease (ASCVD) Risk for Thai population (2021)
 */
export function calculateThaiCVRisk(input: ThaiRiskInput): ThaiRiskResult {
  const { mode, age, sex, sbp, smoking, diabetes } = input;
  const isMale = sex === 'male';
  const isSmoke = smoking === 'smoke';
  const isDM = diabetes === 'dm';

  let fullScore = 0;
  let constant = 0;
  let whr: number | undefined = undefined;

  if (mode === 'lab') {
    // ----------------------------------------------------
    // Mode 1: Laboratory Model (มีผลเลือด - Total Cholesterol)
    // ----------------------------------------------------
    const tc = input.totalCholesterol || 200;

    if (isMale) {
      constant = 10.6027;
      fullScore =
        age * 0.0827 +
        Math.log(sbp) * 1.7645 +
        (isSmoke ? 0.5987 : 0) +
        (isDM ? 0.5098 : 0) +
        tc * 0.0041;
    } else {
      constant = 11.2334;
      fullScore =
        age * 0.0827 +
        Math.log(sbp) * 1.7645 +
        (isSmoke ? 0.5987 : 0) +
        (isDM ? 0.5098 : 0) +
        tc * 0.0041;
    }
  } else {
    // ----------------------------------------------------
    // Mode 2: Non-Laboratory Model (ไม่มีผลเลือด - WHR)
    // ----------------------------------------------------
    let waistInCm = input.waistCm || 80;
    if (input.waistUnit === 'inch') {
      waistInCm = waistInCm * 2.54;
    }
    const heightInCm = input.heightCm || 165;
    whr = heightInCm > 0 ? waistInCm / heightInCm : 0.5;

    if (isMale) {
      constant = 11.381;
      fullScore =
        age * 0.0832 +
        Math.log(sbp) * 1.821 +
        (isSmoke ? 0.612 : 0) +
        (isDM ? 0.528 : 0) +
        whr * 2.154;
    } else {
      constant = 11.954;
      fullScore =
        age * 0.0832 +
        Math.log(sbp) * 1.821 +
        (isSmoke ? 0.612 : 0) +
        (isDM ? 0.528 : 0) +
        whr * 2.154;
    }
  }

  // Cox Model Predicted Risk Equation: 1 - (S0(10) ^ exp(fullScore - constant))
  const S0 = 0.964588;
  const expDiff = Math.exp(fullScore - constant);
  const rawPercentage = (1 - Math.pow(S0, expDiff)) * 100;

  // Format Risk Display
  const formattedPct = Math.min(Math.max(rawPercentage, 0.1), 99.9);
  let riskDisplay = `${formattedPct.toFixed(1)}%`;
  if (formattedPct > 30) {
    riskDisplay = 'มากกว่า 30%';
  }

  // Determine Risk Group & Stage
  let riskGroup: RiskGroup = 'low';
  let riskStageText = 'ระยะที่ 1 (เสี่ยงต่ำ <10%)';
  let riskLevelTitle = 'เสี่ยงน้อย (<10%)';
  let riskLevelText = '🟢 ระยะที่ 1: เสี่ยงต่ำ (<10%) - ประเมินพฤติกรรมสุขภาพประจำปี';
  let badgeBgColor = 'bg-emerald-50 text-emerald-800 border-emerald-300';
  let badgeTextColor = 'text-emerald-800';
  let badgeBorderColor = 'border-emerald-300';
  let cardBorderColor = 'border-emerald-200';

  if (formattedPct >= 30) {
    riskGroup = 'very_high';
    riskStageText = 'ระยะที่ 3 (เสี่ยงสูงมาก ≥30%)';
    riskLevelTitle = 'เสี่ยงสูงมาก (≥30%)';
    riskLevelText = '🔴 ระยะที่ 3: เสี่ยงสูงมาก (≥30%) - ต้องควบคุมความดัน/น้ำตาล/ไขมันด่วนพิเศษ';
    badgeBgColor = 'bg-rose-100 text-rose-900 border-rose-400';
    badgeTextColor = 'text-rose-900';
    badgeBorderColor = 'border-rose-400';
    cardBorderColor = 'border-rose-300';
  } else if (formattedPct >= 20) {
    riskGroup = 'high';
    riskStageText = 'ระยะที่ 2 (เสี่ยงสูง 20-29%)';
    riskLevelTitle = 'เสี่ยงสูง (20-29%)';
    riskLevelText = '🟠 ระยะที่ 2: เสี่ยงสูง (20-29%) - ติดตามความดัน/น้ำตาลอย่างใกล้ชิด';
    badgeBgColor = 'bg-amber-100 text-amber-900 border-amber-300';
    badgeTextColor = 'text-amber-900';
    badgeBorderColor = 'border-amber-300';
    cardBorderColor = 'border-amber-200';
  } else if (formattedPct >= 10) {
    riskGroup = 'moderate';
    riskStageText = 'ระยะที่ 1 (เสี่ยงปานกลาง 10-19%)';
    riskLevelTitle = 'เสี่ยงปานกลาง (10-19%)';
    riskLevelText = '🟡 ระยะที่ 1: เสี่ยงปานกลาง (10-19%) - ติดตามอาการทุก 3-6 เดือน';
    badgeBgColor = 'bg-yellow-50 text-yellow-800 border-yellow-300';
    badgeTextColor = 'text-yellow-800';
    badgeBorderColor = 'border-yellow-300';
    cardBorderColor = 'border-yellow-200';
  }

  // Calculate Relative Compare Risk text
  let compareRiskText = 'เท่ากับค่าเฉลี่ยของคนทั่วไปในกลุ่มอายุเดียวกัน';
  if (formattedPct > 20) {
    compareRiskText = 'สูงกว่าค่าเฉลี่ยของคนทั่วไปประมาณ 2-3 เท่า';
  } else if (formattedPct > 10) {
    compareRiskText = 'สูงกว่าค่าเฉลี่ยของคนทั่วไปเล็กน้อย';
  } else {
    compareRiskText = 'ต่ำกว่าค่าเฉลี่ยของคนทั่วไป';
  }

  // Personalized Suggestions
  const suggestions: string[] = [];

  if (isSmoke) {
    suggestions.push(
      '🚭 แนะนำเลิกสูบบุหรี่เด็ดขาด การเลิกบุหรี่ช่วยลดความเสี่ยงโรคหลอดเลือดหัวใจลงได้กว่า 50% ภายใน 1 ปี'
    );
  }

  if (sbp >= 140) {
    suggestions.push(
      '🩸 ระดับความดันโลหิตตัวบนสูง (≥140 mmHg) ควรจำกัดอาหารรสเค็ม/โซเดียม ออกกำลังกายแบบแอโรบิกสม่ำเสมอ และพบแพทย์เพื่อปรับยาลดความดัน'
    );
  } else if (sbp >= 130) {
    suggestions.push(
      '⚠️ ระดับความดันโลหิตอยู่ในเกณฑ์เฝ้าระวัง (130-139 mmHg) แนะนำควบคุมอาหารโซเดียมและวัดความดันสม่ำเสมอ'
    );
  }

  if (isDM) {
    suggestions.push(
      '🍬 มีประวัติโรคเบาหวาน ควรควบคุมระดับน้ำตาลสะสม (HbA1c < 7.0%) งดน้ำหวานและแป้งขัดขาว ตรวจติดตามระดับน้ำตาลสม่ำเสมอ'
    );
  }

  if (mode === 'lab' && input.totalCholesterol && input.totalCholesterol >= 200) {
    suggestions.push(
      '🍳 ระดับคอเลสเตอรอลรวมสูง (≥200 mg/dL) ควรลดอาหารที่มีไขมันอิ่มตัว ออกกำลังกายเพิ่ม HDL และพบแพทย์เพื่อประเมินการใช้ยา Statin'
    );
  }

  if (mode === 'non_lab' && whr && whr >= 0.5) {
    suggestions.push(
      `📐 อัตราส่วนรอบเอวต่อส่วนสูงเกินเกณฑ์มาตรฐาน (WHR = ${whr.toFixed(2)} ≥ 0.5) แสดงถึงภาวะอ้วนท้วมลงพุง แนะนำควบคุมน้ำหนักและออกกำลังกายอย่างน้อย 150 นาที/สัปดาห์`
    );
  }

  // Annual Health Checkup suggestion
  if (riskGroup === 'very_high' || riskGroup === 'high') {
    suggestions.push(
      '🏥 ควรพบแพทย์เฉพาะทางโรคหัวใจหรือแพทย์เวชปฏิบัติครอบครัวเพื่อตรวจประเมินอย่างละเอียด และเข้ารับการตรวจ EKG ตรวจปัสสาวะ และตรวจเลือดทุก 3-6 เดือน'
    );
  } else {
    suggestions.push(
      '🏥 แนะนำเข้ารับการตรวจสุขภาพประจำปีอย่างน้อยปีละ 1 ครั้ง และประเมิน RAMA CVD Risk Score ซ้ำทุกปี'
    );
  }

  return {
    mode,
    rawPercentage,
    riskDisplay,
    riskGroup,
    riskStageText,
    riskLevelTitle,
    riskLevelText,
    badgeBgColor,
    badgeTextColor,
    badgeBorderColor,
    cardBorderColor,
    compareRiskText,
    whr,
    suggestions,
  };
}
