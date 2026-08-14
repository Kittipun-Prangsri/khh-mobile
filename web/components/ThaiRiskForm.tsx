


'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Heart,
  Activity,
  Calculator,
  FlaskConical,
  Ruler,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Info,
  ShieldCheck,
  FileText,
  ChevronRight,
  ChevronLeft,
  User,
  Cigarette,
  Stethoscope,
  Layers,
  LayoutGrid,
} from 'lucide-react';
import {
  calculateThaiCVRisk,
  ThaiRiskInput,
  ThaiRiskResult,
  AssessmentMode,
} from '@/lib/thaiRiskCalculator';

// Zod Validation Schema
const riskFormSchema = z
  .object({
    mode: z.enum(['lab', 'non_lab']),
    age: z
      .number({ invalid_type_error: 'กรุณาระบุอายุเป็นตัวเลข' })
      .min(30, 'อายุต้องอยู่ระหว่าง 30 ถึง 70 ปี')
      .max(70, 'อายุต้องอยู่ระหว่าง 30 ถึง 70 ปี'),
    sex: z.enum(['male', 'female'], { required_error: 'กรุณาเลือกเพศ' }),
    sbp: z
      .number({ invalid_type_error: 'กรุณาระบุความดันโลหิตตัวบน' })
      .min(70, 'ค่า SBP ต้องอยู่ระหว่าง 70 ถึง 220 mmHg')
      .max(220, 'ค่า SBP ต้องอยู่ระหว่าง 70 ถึง 220 mmHg'),
    smoking: z.enum(['smoke', 'no_smoke'], { required_error: 'กรุณาเลือกสถานะการสูบบุหรี่' }),
    diabetes: z.enum(['dm', 'no_dm'], { required_error: 'กรุณาเลือกสถานะเบาหวาน' }),
    // Mode 1: Lab
    totalCholesterol: z
      .number({ invalid_type_error: 'กรุณาระบุค่า Total Cholesterol' })
      .min(100, 'ค่า Total Cholesterol ต้องอยู่ระหว่าง 100 ถึง 500 mg/dL')
      .max(500, 'ค่า Total Cholesterol ต้องอยู่ระหว่าง 100 ถึง 500 mg/dL')
      .optional(),
    // Mode 2: Non-Lab
    waistCm: z
      .number({ invalid_type_error: 'กรุณาระบุรอบเอว' })
      .min(40, 'รอบเอวต้องมีค่าอย่างน้อย 40 cm')
      .max(200, 'รอบเอวต้องไม่เกิน 200 cm')
      .optional(),
    heightCm: z
      .number({ invalid_type_error: 'กรุณาระบุส่วนสูง' })
      .min(100, 'ส่วนสูงต้องมีค่าอย่างน้อย 100 cm')
      .max(230, 'ส่วนสูงต้องไม่เกิน 230 cm')
      .optional(),
    waistUnit: z.enum(['cm', 'inch']).default('cm'),
  })
  .refine(
    (data) => {
      if (data.mode === 'lab') {
        return data.totalCholesterol !== undefined && !isNaN(data.totalCholesterol);
      }
      return true;
    },
    {
      message: 'กรุณากรอกระดับ Total Cholesterol (mg/dL)',
      path: ['totalCholesterol'],
    }
  )
  .refine(
    (data) => {
      if (data.mode === 'non_lab') {
        return data.waistCm !== undefined && !isNaN(data.waistCm);
      }
      return true;
    },
    {
      message: 'กรุณากรอกรอบเอว',
      path: ['waistCm'],
    }
  )
  .refine(
    (data) => {
      if (data.mode === 'non_lab') {
        return data.heightCm !== undefined && !isNaN(data.heightCm);
      }
      return true;
    },
    {
      message: 'กรุณากรอกส่วนสูง (cm)',
      path: ['heightCm'],
    }
  );

type RiskFormValues = z.infer<typeof riskFormSchema>;

interface ThaiRiskFormProps {
  initialValues?: Partial<ThaiRiskInput>;
  onCalculated?: (result: ThaiRiskResult) => void;
}

export default function ThaiRiskForm({ initialValues, onCalculated }: ThaiRiskFormProps) {
  const [assessmentMode, setAssessmentMode] = useState<AssessmentMode>(
    initialValues?.mode || 'lab'
  );
  const [formLayout, setFormLayout] = useState<'single' | 'multistep'>('single');
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RiskFormValues>({
    resolver: zodResolver(riskFormSchema),
    defaultValues: {
      mode: initialValues?.mode || 'lab',
      age: initialValues?.age || 50,
      sex: initialValues?.sex || 'male',
      sbp: initialValues?.sbp || 135,
      smoking: initialValues?.smoking || 'no_smoke',
      diabetes: initialValues?.diabetes || 'no_dm',
      totalCholesterol: initialValues?.totalCholesterol || 200,
      waistCm: initialValues?.waistCm || 82,
      heightCm: initialValues?.heightCm || 165,
      waistUnit: initialValues?.waistUnit || 'cm',
    },
  });

  const formValues = watch();

  // Calculate live result in real-time
  const [result, setResult] = useState<ThaiRiskResult>(() =>
    calculateThaiCVRisk({
      mode: initialValues?.mode || 'lab',
      age: initialValues?.age || 50,
      sex: initialValues?.sex || 'male',
      sbp: initialValues?.sbp || 135,
      smoking: initialValues?.smoking || 'no_smoke',
      diabetes: initialValues?.diabetes || 'no_dm',
      totalCholesterol: initialValues?.totalCholesterol || 200,
      waistCm: initialValues?.waistCm || 82,
      heightCm: initialValues?.heightCm || 165,
      waistUnit: initialValues?.waistUnit || 'cm',
    })
  );

  // Real-time calculation effect
  useEffect(() => {
    try {
      const calculated = calculateThaiCVRisk({
        mode: formValues.mode,
        age: formValues.age || 50,
        sex: formValues.sex || 'male',
        sbp: formValues.sbp || 120,
        smoking: formValues.smoking || 'no_smoke',
        diabetes: formValues.diabetes || 'no_dm',
        totalCholesterol: formValues.totalCholesterol || 200,
        waistCm: formValues.waistCm || 80,
        heightCm: formValues.heightCm || 165,
        waistUnit: formValues.waistUnit || 'cm',
      });
      setResult(calculated);
      if (onCalculated) onCalculated(calculated);
    } catch (e) {
      // Ignore intermediate NaN during user typing
    }
  }, [
    formValues.mode,
    formValues.age,
    formValues.sex,
    formValues.sbp,
    formValues.smoking,
    formValues.diabetes,
    formValues.totalCholesterol,
    formValues.waistCm,
    formValues.heightCm,
    formValues.waistUnit,
  ]);

  const handleModeToggle = (mode: AssessmentMode) => {
    setAssessmentMode(mode);
    setValue('mode', mode);
  };

  const onSubmit = (data: RiskFormValues) => {
    const calculatedResult = calculateThaiCVRisk({
      mode: data.mode,
      age: data.age,
      sex: data.sex,
      sbp: data.sbp,
      smoking: data.smoking,
      diabetes: data.diabetes,
      totalCholesterol: data.totalCholesterol,
      waistCm: data.waistCm,
      heightCm: data.heightCm,
      waistUnit: data.waistUnit,
    });
    setResult(calculatedResult);
    if (onCalculated) onCalculated(calculatedResult);
  };

  const handleResetForm = () => {
    reset({
      mode: 'lab',
      age: 50,
      sex: 'male',
      sbp: 135,
      smoking: 'no_smoke',
      diabetes: 'no_dm',
      totalCholesterol: 200,
      waistCm: 82,
      heightCm: 165,
      waistUnit: 'cm',
    });
    setCurrentStep(1);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <Heart className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-teal-200 text-xs font-bold border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>RAMA CVD Risk Score 2021 (สมาคมแพทย์โรคหัวใจแห่งประเทศไทย)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            ระบบประเมินความเสี่ยงโรคหลอดเลือดหัวใจ 10 ปี (RAMA CVD Risk Score)
          </h2>
          <p className="text-xs sm:text-sm text-teal-100/90 max-w-2xl leading-relaxed">
            คำนวณและประเมินโอกาสเกิดโรคหลอดเลือดหัวใจและสมองในคนไทยช่วง 10 ปีข้างหน้า
            อ้างอิงสมการ Cox Proportional Hazards Model สมาคมแพทย์โรคหัวใจแห่งประเทศไทย
          </p>
        </div>
      </div>

      {/* Main Grid: Form Left (7 cols), Live Result Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
            {/* Top Toolbar: Mode & Layout Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              {/* Form Layout Mode Switcher */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setFormLayout('single')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    formLayout === 'single'
                      ? 'bg-white text-teal-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>หน้าเดียว</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormLayout('multistep')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    formLayout === 'multistep'
                      ? 'bg-white text-teal-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>ทีละขั้นตอน (Multi-step)</span>
                </button>
              </div>

              {/* Reset Button */}
              <button
                type="button"
                onClick={handleResetForm}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-all cursor-pointer self-end sm:self-center"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>รีเซ็ต</span>
              </button>
            </div>

            {/* Assessment Mode Toggle */}
            <div>
              <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                1. เลือกโหมดประเมินความเสี่ยง
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/70">
                <button
                  type="button"
                  onClick={() => handleModeToggle('lab')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                    formValues.mode === 'lab'
                      ? 'bg-white text-teal-800 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FlaskConical className="w-4 h-4 text-teal-600" />
                  <span>โหมดมีผลเลือด (TC)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleModeToggle('non_lab')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                    formValues.mode === 'non_lab'
                      ? 'bg-white text-teal-800 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Ruler className="w-4 h-4 text-emerald-600" />
                  <span>โหมดไม่มีผลเลือด (WHR)</span>
                </button>
              </div>
            </div>

            {/* Multi-step Progress Stepper */}
            {formLayout === 'multistep' && (
              <div className="flex items-center justify-between gap-2 pt-1 pb-3 border-b border-slate-100">
                {[
                  { step: 1, title: 'ข้อมูลพื้นฐาน' },
                  { step: 2, title: 'ปัจจัยเสี่ยง' },
                  { step: 3, title: formValues.mode === 'lab' ? 'ผลตรวจแล็บ' : 'สัดส่วนร่างกาย' },
                ].map((s) => (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => setCurrentStep(s.step)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      currentStep === s.step
                        ? 'bg-teal-600 text-white shadow-xs'
                        : currentStep > s.step
                        ? 'bg-teal-50 text-teal-800 border border-teal-200'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <span>{s.step}.</span>
                    <span>{s.title}</span>
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* STEP 1 / Single Mode: Basic Demographics */}
              {(formLayout === 'single' || currentStep === 1) && (
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4 text-teal-600" />
                    <span>2. ข้อมูลพื้นฐานผู้ป่วย</span>
                  </h3>

                  {/* Age & SBP */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        อายุ (Age) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min={30}
                          max={70}
                          {...register('age', { valueAsNumber: true })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-3.5 text-sm text-slate-800 font-extrabold focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                          placeholder="30 - 70 ปี"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          ปี
                        </span>
                      </div>
                      {errors.age && (
                        <p className="text-rose-500 text-[11px] font-bold mt-1">
                          {errors.age.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ความดันโลหิตตัวบน (SBP) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min={70}
                          max={220}
                          {...register('sbp', { valueAsNumber: true })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-3.5 text-sm text-slate-800 font-extrabold focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                          placeholder="70 - 220 mmHg"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          mmHg
                        </span>
                      </div>
                      {errors.sbp && (
                        <p className="text-rose-500 text-[11px] font-bold mt-1">
                          {errors.sbp.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Sex Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      เพศ (Sex) <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label
                        className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs sm:text-sm font-extrabold cursor-pointer transition-all ${
                          formValues.sex === 'male'
                            ? 'bg-teal-50 text-teal-900 border-teal-500 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="radio"
                          value="male"
                          {...register('sex')}
                          className="sr-only"
                        />
                        <span>👨 ชาย (Male)</span>
                      </label>
                      <label
                        className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs sm:text-sm font-extrabold cursor-pointer transition-all ${
                          formValues.sex === 'female'
                            ? 'bg-teal-50 text-teal-900 border-teal-500 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="radio"
                          value="female"
                          {...register('sex')}
                          className="sr-only"
                        />
                        <span>👩 หญิง (Female)</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 / Single Mode: Risk Factors */}
              {(formLayout === 'single' || currentStep === 2) && (
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-teal-600" />
                    <span>3. ปัจจัยเสี่ยงโรคหลอดเลือด</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Smoking */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                        <Cigarette className="w-3.5 h-3.5 text-slate-500" />
                        <span>ประวัติสูบบุหรี่ (Smoking)</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <label
                          className={`p-2.5 rounded-2xl border text-xs font-extrabold text-center cursor-pointer transition-all ${
                            formValues.smoking === 'smoke'
                              ? 'bg-rose-50 text-rose-800 border-rose-400'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          <input
                            type="radio"
                            value="smoke"
                            {...register('smoking')}
                            className="sr-only"
                          />
                          <span>🚭 สูบ (Smoke)</span>
                        </label>
                        <label
                          className={`p-2.5 rounded-2xl border text-xs font-extrabold text-center cursor-pointer transition-all ${
                            formValues.smoking === 'no_smoke'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-400'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          <input
                            type="radio"
                            value="no_smoke"
                            {...register('smoking')}
                            className="sr-only"
                          />
                          <span>🟢 ไม่สูบ (No)</span>
                        </label>
                      </div>
                    </div>

                    {/* Diabetes */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-slate-500" />
                        <span>โรคเบาหวาน (Diabetes DM)</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <label
                          className={`p-2.5 rounded-2xl border text-xs font-extrabold text-center cursor-pointer transition-all ${
                            formValues.diabetes === 'dm'
                              ? 'bg-amber-50 text-amber-800 border-amber-400'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          <input
                            type="radio"
                            value="dm"
                            {...register('diabetes')}
                            className="sr-only"
                          />
                          <span>🍬 เป็น (Yes)</span>
                        </label>
                        <label
                          className={`p-2.5 rounded-2xl border text-xs font-extrabold text-center cursor-pointer transition-all ${
                            formValues.diabetes === 'no_dm'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-400'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          <input
                            type="radio"
                            value="no_dm"
                            {...register('diabetes')}
                            className="sr-only"
                          />
                          <span>🟢 ไม่เป็น (No)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3 / Single Mode: Mode-Specific Variable */}
              {(formLayout === 'single' || currentStep === 3) && (
                <div className="p-4 bg-teal-50/60 border border-teal-200/80 rounded-2xl space-y-3 pt-3">
                  <h3 className="text-xs font-extrabold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-teal-600" />
                    <span>
                      4. ตัวแปรเพิ่มเติม (
                      {formValues.mode === 'lab' ? 'ผลตรวจระดับไขมันในเลือด' : 'การวัดสัดส่วนร่างกาย'}
                      )
                    </span>
                  </h3>

                  {formValues.mode === 'lab' ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ระดับ Total Cholesterol (TC) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min={100}
                          max={500}
                          {...register('totalCholesterol', { valueAsNumber: true })}
                          className="w-full bg-white border border-slate-200 rounded-2xl py-2.5 px-3.5 text-sm text-slate-800 font-extrabold focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                          placeholder="100 - 500 mg/dL"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          mg/dL
                        </span>
                      </div>
                      {errors.totalCholesterol && (
                        <p className="text-rose-500 text-[11px] font-bold mt-1">
                          {errors.totalCholesterol.message}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          รอบเอว (Waist Circumference) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            {...register('waistCm', { valueAsNumber: true })}
                            className="w-full bg-white border border-slate-200 rounded-2xl py-2.5 px-3.5 text-sm text-slate-800 font-extrabold focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                            placeholder="เช่น 82.5"
                          />
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                            ซม. (cm)
                          </span>
                        </div>
                        {errors.waistCm && (
                          <p className="text-rose-500 text-[11px] font-bold mt-1">
                            {errors.waistCm.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          ส่วนสูง (Height) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            {...register('heightCm', { valueAsNumber: true })}
                            className="w-full bg-white border border-slate-200 rounded-2xl py-2.5 px-3.5 text-sm text-slate-800 font-extrabold focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                            placeholder="เช่น 165"
                          />
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                            ซม. (cm)
                          </span>
                        </div>
                        {errors.heightCm && (
                          <p className="text-rose-500 text-[11px] font-bold mt-1">
                            {errors.heightCm.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Multi-step Navigation Controls */}
              {formLayout === 'multistep' && (
                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>ย้อนกลับ</span>
                    </button>
                  ) : (
                    <div></div>
                  )}

                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(currentStep + 1)}
                      className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                    >
                      <span>ถัดไป</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                    >
                      <Calculator className="w-4 h-4" />
                      <span>ยืนยันการประเมิน</span>
                    </button>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right Live Result Display Column (Exact Match to User's Uploaded Design) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card Box matching uploaded image design */}
          <div className="p-5 sm:p-6 bg-white border-2 border-emerald-300 rounded-3xl shadow-lg space-y-4 relative overflow-hidden">
            <div className="flex items-start gap-3">
              <span className="text-2xl sm:text-3xl">🫀</span>
              <div className="flex-1 space-y-2">
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg leading-snug tracking-tight">
                  ความเสี่ยงโรคหลอดเลือดหัวใจ 10 ปี (RAMA CVD Risk)
                </h3>

                {/* Yellow/Amber Risk Stage Badge matching exact design */}
                <div>
                  <span className="inline-block text-xs sm:text-sm font-extrabold bg-[#fef3c7] text-[#78350f] border border-[#fde047] px-4 py-1 rounded-full shadow-2xs">
                    {result.riskStageText}
                  </span>
                </div>

                {/* Detailed Result Status line */}
                <div className="pt-1 flex items-center gap-2">
                  <span className="text-base sm:text-lg">
                    {result.riskGroup === 'low'
                      ? '🟢'
                      : result.riskGroup === 'moderate'
                      ? '🟡'
                      : result.riskGroup === 'high'
                      ? '🟠'
                      : '🔴'}
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-[#065f46] leading-snug">
                    {result.riskLevelText}
                  </span>
                </div>
              </div>
            </div>

            {/* Gauge progress bar & metrics */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <div className="flex justify-between items-center text-xs font-extrabold text-slate-700">
                <span>โอกาสเกิดโรคหลอดเลือดหัวใจ 10 ปี:</span>
                <span className="text-sm font-extrabold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                  {result.riskDisplay}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex p-0.5 border border-slate-200/60">
                <div
                  style={{ width: `${Math.min(result.rawPercentage, 100)}%` }}
                  className={`h-full transition-all duration-500 rounded-full ${
                    result.riskGroup === 'low'
                      ? 'bg-emerald-500'
                      : result.riskGroup === 'moderate'
                      ? 'bg-yellow-500'
                      : result.riskGroup === 'high'
                      ? 'bg-amber-500'
                      : 'bg-rose-600 animate-pulse'
                  }`}
                ></div>
              </div>
              <p className="text-[11px] font-bold text-slate-500 text-right">
                {result.compareRiskText}
              </p>
            </div>
          </div>

          {/* Personal Suggestions Box */}
          <div className="p-5 bg-teal-50/70 border border-teal-200/80 rounded-3xl space-y-3 shadow-xs">
            <h4 className="font-extrabold text-teal-950 text-xs sm:text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>คำแนะนำและแนวทางดูแลสุขภาพเฉพาะบุคคล (Personalized Suggestions)</span>
            </h4>

            <div className="space-y-2">
              {result.suggestions.map((suggestion, sIdx) => (
                <div
                  key={sIdx}
                  className="p-3 bg-white rounded-2xl border border-teal-100 text-xs font-bold text-slate-700 flex items-start gap-2 shadow-2xs leading-relaxed"
                >
                  <span className="mt-0.5 text-teal-600 font-extrabold">✓</span>
                  <span>{suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
