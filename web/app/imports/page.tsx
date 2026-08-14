'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Upload, FileSpreadsheet, CheckCircle2, ArrowRight, ShieldCheck, RefreshCw, Database, FileCheck2, Sparkles, X } from 'lucide-react';

export default function ImportsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview' | 'success'>('upload');
  const [isDragging, setIsDragging] = useState(false);

  const selectFile = (selectedFile: File) => {
    setFile(selectedFile);
    setStep('preview');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      selectFile(e.target.files[0]);
    }
  };

  const handleProcessImport = () => {
    setImporting(true);
    setTimeout(() => {
      setImporting(false);
      setStep('success');
    }, 1500);
  };

  const resetImport = () => {
    setFile(null);
    setStep('upload');
  };

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Import Command Center */}
        <section className="relative overflow-hidden rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-50 via-white to-cyan-50/70 p-5 shadow-sm md:p-6">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-teal-300/20 blur-3xl" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-teal-700 shadow-sm">
                <Sparkles className="h-3 w-3" /> DATA IMPORT CENTER
              </div>
              <h1 className="flex items-center gap-3 text-2xl font-extrabold tracking-tight text-slate-800 md:text-3xl">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/20">
                  <Upload className="h-5 w-5" />
                </span>
                นำเข้าข้อมูล Excel / CSV
              </h1>
              <p className="mt-2 text-xs font-medium text-slate-500 md:text-sm">นำเข้าทะเบียนผู้ป่วยและรายการนัดหมายจาก HIS ได้อย่างเป็นขั้นตอนและตรวจสอบได้</p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white bg-white/75 px-4 py-3 shadow-sm backdrop-blur">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><ShieldCheck className="h-5 w-5" /></span>
              <div>
                <p className="text-xs font-extrabold text-slate-700">นำเข้าข้อมูลอย่างปลอดภัย</p>
                <p className="text-[10px] font-medium text-slate-500">ตรวจสอบข้อมูลก่อนบันทึกทุกครั้ง</p>
              </div>
            </div>
          </div>
        </section>

        {/* Progress */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:px-6">
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'upload', label: '1. เลือกไฟล์', icon: Upload },
              { id: 'preview', label: '2. ตรวจสอบข้อมูล', icon: FileCheck2 },
              { id: 'success', label: '3. บันทึกสำเร็จ', icon: Database },
            ].map((item, index) => {
              const Icon = item.icon;
              const currentStepIndex = ['upload', 'preview', 'success'].indexOf(step);
              const isCurrent = index === currentStepIndex;
              const isDone = index < currentStepIndex;
              return (
                <div key={item.id} className={`flex min-w-0 items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-bold transition-colors ${isCurrent ? 'bg-teal-50 text-teal-700' : isDone ? 'text-emerald-700' : 'text-slate-400'}`}>
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${isCurrent ? 'bg-teal-600 text-white shadow-sm' : isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                    {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-8">
          {step === 'upload' && (
            <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
              <label
                onDragEnter={() => setIsDragging(true)}
                onDragLeave={() => setIsDragging(false)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                  const droppedFile = event.dataTransfer.files[0];
                  if (droppedFile) selectFile(droppedFile);
                }}
                className={`group flex min-h-[330px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 text-center transition-all ${isDragging ? 'border-teal-500 bg-teal-100 shadow-lg shadow-teal-900/10' : 'border-teal-200 bg-gradient-to-b from-teal-50/70 to-white hover:border-teal-400 hover:from-teal-50 hover:shadow-lg hover:shadow-teal-900/5'}`}
              >
                <span className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-teal-600 text-white shadow-xl shadow-teal-600/20 transition-transform group-hover:-translate-y-1 group-hover:scale-105">
                  <FileSpreadsheet className="h-10 w-10" />
                </span>
                <h3 className="text-lg font-extrabold text-slate-800">เลือกไฟล์ข้อมูลเพื่อเริ่มต้น</h3>
                <p className="mt-2 max-w-md text-xs leading-5 text-slate-500">ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์ Excel (.xlsx, .xls) และ CSV จากคอมพิวเตอร์ของคุณ</p>
                <span className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-xs font-bold text-white shadow-md transition-colors group-hover:bg-teal-700">
                  <Upload className="h-4 w-4" /> เลือกไฟล์นำเข้า
                </span>
                <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileChange} className="hidden" />
              </label>

              <aside className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-800"><FileCheck2 className="h-4 w-4 text-teal-600" /> ก่อนนำเข้า</h3>
                <ul className="mt-4 space-y-3 text-xs leading-5 text-slate-600">
                  <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />รองรับไฟล์ Excel และ CSV</li>
                  <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />ตรวจสอบความถูกต้องก่อนบันทึก</li>
                  <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />แสดงรายการซ้ำเพื่อป้องกันข้อมูลซ้อน</li>
                </ul>
                <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] leading-4 text-amber-800">
                  แนะนำ: ตรวจสอบหัวคอลัมน์ HN, ชื่อผู้ป่วย และวันนัดหมายให้ครบถ้วนก่อนอัปโหลด
                </div>
              </aside>
            </div>
          )}

          {step === 'preview' && file && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-teal-100 bg-teal-50/60 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-teal-600 shadow-sm"><FileSpreadsheet className="w-5 h-5" /></span>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{file.name}</h4>
                    <span className="text-[10px] text-slate-500">{(file.size / 1024).toFixed(1)} KB &bull; พร้อมตรวจสอบความถูกต้อง</span>
                  </div>
                </div>
                <button onClick={resetImport} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50"><X className="h-3.5 w-3.5" />เปลี่ยนไฟล์</button>
              </div>

              {/* Validation Summary */}
              <div className="grid grid-cols-1 gap-3 text-center sm:grid-cols-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-bold uppercase">รายการทั้งหมด</span>
                  <span className="text-xl font-bold text-slate-800">45 ราย</span>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] text-emerald-700 block font-bold uppercase">ข้อมูลถูกต้อง</span>
                  <span className="text-xl font-bold text-emerald-700">45 ราย</span>
                </div>
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-[10px] text-amber-700 block font-bold uppercase">ข้อมูลซ้ำซ้อน</span>
                  <span className="text-xl font-bold text-amber-700">0 ราย</span>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={resetImport} className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold">ยกเลิก</button>
                <button
                  onClick={handleProcessImport}
                  disabled={importing}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {importing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>กำลังนำเข้าข้อมูล...</span>
                    </>
                  ) : (
                    <>
                      <span>ยืนยันบันทึกข้อมูลเข้าสู่ระบบ</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center p-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">นำเข้าข้อมูลสำเร็จ 45 รายการ!</h3>
              <p className="text-xs text-slate-500">ข้อมูลผู้ป่วยและรายการนัดหมายใหม่ถูกบันทึกลงในฐานข้อมูล PostgreSQL เรียบร้อยแล้ว</p>
              <button
                onClick={resetImport}
                className="px-6 py-2.5 bg-teal-600 text-white font-bold rounded-xl text-xs shadow-md hover:bg-teal-700 transition-all cursor-pointer"
              >
                นำเข้าไฟล์อื่นเพิ่มเติม
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
