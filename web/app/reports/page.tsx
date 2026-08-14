'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock3,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  TrendingUp,
  Users,
} from 'lucide-react';

const PERIODS = ['7 วันล่าสุด', 'เดือนนี้', 'ไตรมาสนี้', 'ปีนี้'];

const summaryCards = [
  { title: 'ผู้ป่วยลงทะเบียนรวม', value: '336 ราย', detail: 'DM 42%, HT 37%', icon: Users, tone: 'bg-teal-50 text-teal-700', accent: 'bg-teal-500' },
  { title: 'อัตราการมาตามนัด', value: '92.4%', detail: '+3.1% จากเดือนก่อน', icon: TrendingUp, tone: 'bg-emerald-50 text-emerald-700', accent: 'bg-emerald-500' },
  { title: 'ติดตามผู้ป่วยขาดนัดสำเร็จ', value: '88.5%', detail: 'โทรติดตามภายใน 24 ชม.', icon: CheckCircle2, tone: 'bg-indigo-50 text-indigo-700', accent: 'bg-indigo-500' },
  { title: 'จำนวนการสื่อสาร Reply', value: '142 เรื่อง', detail: 'แก้ไขสำเร็จ 96%', icon: Clock3, tone: 'bg-amber-50 text-amber-700', accent: 'bg-amber-500' },
];

export default function ReportsPage() {
  const [period, setPeriod] = useState('เดือนนี้');

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <section className="relative overflow-hidden rounded-3xl border border-teal-100 bg-gradient-to-br from-slate-900 via-teal-950 to-cyan-900 p-5 text-white shadow-xl shadow-teal-950/10 md:p-7">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-teal-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-cyan-300/10 blur-3xl" />
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-white/10 px-3 py-1 text-[10px] font-extrabold tracking-[0.14em] text-teal-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ANALYTICS CENTER · UPDATED TODAY
              </div>
              <h1 className="flex items-center gap-3 text-2xl font-extrabold tracking-tight md:text-3xl">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15"><BarChart3 className="h-5 w-5 text-teal-200" /></span>
                รายงานและสถิติ
              </h1>
              <p className="mt-2 max-w-2xl text-xs font-medium leading-relaxed text-slate-300 md:text-sm">
                ภาพรวมการมาตามนัด การติดตามผู้ป่วย และประสิทธิภาพการสื่อสาร เพื่อช่วยตัดสินใจได้อย่างมั่นใจ
              </p>
            </div>
            <div className="flex flex-wrap gap-2 xl:justify-end">
              <button onClick={() => alert('ส่งออกรายงานเป็น Excel/CSV')} className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-white/20 cursor-pointer">
                <FileSpreadsheet className="w-4 h-4" /> Export Excel
              </button>
              <button onClick={() => alert('ส่งออกรายงานเป็น PDF')} className="flex items-center gap-1.5 rounded-xl bg-teal-400 px-4 py-2.5 text-xs font-extrabold text-teal-950 shadow-lg shadow-teal-950/20 transition-all hover:bg-teal-300 cursor-pointer">
                <FileText className="w-4 h-4" /> Export PDF
              </button>
            </div>
          </div>
          <div className="relative mt-6 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-300"><Activity className="h-3.5 w-3.5 text-teal-300" /> ข้อมูลสรุปจากรอบการให้บริการล่าสุด</div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Filter className="mr-1 h-3.5 w-3.5 text-teal-200" />
              {PERIODS.map((item) => <button key={item} onClick={() => setPeriod(item)} className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-all cursor-pointer ${period === item ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>{item}</button>)}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className={`absolute inset-x-0 top-0 h-1 ${card.accent}`} />
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{card.title}</span>
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.tone}`}><Icon className="h-4 w-4" /></span>
                </div>
                <div className="mt-4 text-2xl font-extrabold text-slate-800">{card.value}</div>
                <div className="mt-2 flex items-center gap-1 text-[10px] font-medium text-slate-500"><TrendingUp className="h-3 w-3 text-teal-500" />{card.detail}</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm xl:col-span-3 md:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-teal-600">Appointment performance</p>
                <h2 className="mt-1 text-base font-extrabold text-slate-800">แนวโน้มการมาตามนัด</h2>
                <p className="mt-1 text-xs text-slate-500">สรุปผลการให้บริการในช่วง <span className="font-bold text-slate-700">{period}</span></p>
              </div>
              <button className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold text-teal-700 transition-colors hover:bg-teal-50">ดูรายละเอียด <ArrowUpRight className="h-3 w-3" /></button>
            </div>
            <div className="mt-6 flex h-44 items-end justify-between gap-2 border-b border-slate-100 px-1 pb-1">
              {[58, 72, 65, 82, 76, 91, 84, 96, 92, 88, 98, 94].map((height, index) => <div key={index} className="group flex h-full flex-1 items-end justify-center"><div className="relative w-full max-w-7 rounded-t-md bg-gradient-to-t from-teal-500 to-cyan-300 transition-all duration-300 group-hover:from-teal-600 group-hover:to-cyan-200" style={{ height: `${height}%` }}><span className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold text-white group-hover:block">{height}%</span></div></div>)}
            </div>
            <div className="mt-3 flex justify-between text-[10px] font-semibold text-slate-400"><span>สัปดาห์ 1</span><span>สัปดาห์ 2</span><span>สัปดาห์ 3</span><span>สัปดาห์ 4</span></div>
          </section>

          <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm xl:col-span-2 md:p-6">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-teal-600">Workflow snapshot</p>
            <h2 className="mt-1 text-base font-extrabold text-slate-800">สถานะงานติดตาม</h2>
            <div className="mt-5 space-y-4">
              {[{ label: 'มาตามนัดตามแผน', value: '92.4%', width: 'w-[92.4%]', color: 'bg-teal-500' }, { label: 'ติดตามขาดนัดสำเร็จ', value: '88.5%', width: 'w-[88.5%]', color: 'bg-indigo-500' }, { label: 'แก้ไข Reply สำเร็จ', value: '96.0%', width: 'w-[96%]', color: 'bg-emerald-500' }].map((item) => <div key={item.label}><div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold"><span className="text-slate-600">{item.label}</span><span className="text-slate-800">{item.value}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${item.width} ${item.color}`} /></div></div>)}
            </div>
            <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-3 text-[11px] text-amber-800"><span className="font-extrabold">จุดที่ควรติดตาม:</span> ผู้ป่วยขาดนัด 12 รายยังต้องได้รับการติดต่อ</div>
          </section>
        </div>

        <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-widest text-teal-600">Report library</p><h2 className="mt-1 text-base font-extrabold text-slate-800">รายงานพร้อมใช้งาน</h2></div><span className="text-[11px] font-medium text-slate-400">เลือกดาวน์โหลดตามวัตถุประสงค์การใช้งาน</span></div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ReportCard icon={Calendar} tone="bg-teal-100 text-teal-700" title="รายงานสรุปนัดหมายประจำเดือน" description="รายงานการเข้าตรวจของผู้ป่วย NCDs แยกตามกลุ่มโรคและคลินิกบริการ" onDownload={() => alert('ดาวน์โหลดรายงานนัดหมาย')} />
            <ReportCard icon={Users} tone="bg-indigo-100 text-indigo-700" title="รายงานการติดตามผู้ป่วยขาดนัด" description="รายงานประวัติการโทรติดตาม และสาเหตุการขาดนัดเพื่อนำไปวิเคราะห์" onDownload={() => alert('ดาวน์โหลดรายงานติดตาม')} />
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

function ReportCard({ icon: Icon, tone, title, description, onDownload }: { icon: React.ElementType; tone: string; title: string; description: string; onDownload: () => void }) {
  return <div className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition-all hover:border-teal-200 hover:bg-teal-50/40"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}><Icon className="h-4 w-4" /></div><h3 className="mt-4 text-base font-extrabold text-slate-800">{title}</h3><p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p><button onClick={onDownload} className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition-all hover:border-teal-200 hover:text-teal-700 cursor-pointer"><Download className="h-3.5 w-3.5" /> ดาวน์โหลดรายงาน (.xlsx)</button></div>;
}
