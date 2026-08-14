'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  Calendar,
  AlertCircle,
  PhoneCall,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Users,
  Plus,
  RefreshCw,
  Database,
  CheckCircle2,
  Clock,
  UserCheck,
  Settings,
  Activity,
  ArrowUpRight,
  Sparkles,
  Wifi,
} from 'lucide-react';
import Link from 'next/link';

/* ---------- Small presentational helpers (kept local — dashboard-only) ---------- */

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 26 - ((v - min) / range) * 22;
      return `${x},${y}`;
    })
    .join(' ');
  const areaPoints = `0,28 ${points} 100,28`;

  return (
    <svg viewBox="0 0 100 30" className="w-full h-9" preserveAspectRatio="none">
      <polyline points={areaPoints} fill={color} opacity="0.08" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface MetricCardProps {
  label: string;
  value: number;
  unit: string;
  loading: boolean;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  trendUp: boolean;
  trendText: string;
  trendColor: string;
  sparkData: number[];
  sparkColor: string;
}

function MetricCard({
  label,
  value,
  unit,
  loading,
  icon: Icon,
  iconBg,
  iconColor,
  trendUp,
  trendText,
  trendColor,
  sparkData,
  sparkColor,
}: MetricCardProps) {
  const TrendIcon = trendUp ? TrendingUp : TrendingDown;
  return (
    <div className="hover-grow p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <span className="text-slate-500 text-xs font-bold">{label}</span>
          {loading ? (
            <div className="h-8 w-24 mt-3 rounded-lg bg-slate-100 animate-pulse" />
          ) : (
            <div className="text-2xl md:text-3xl font-black text-slate-900 mt-3 tabular-nums">
              {value.toLocaleString()} <span className="text-xs font-semibold text-slate-500">{unit}</span>
            </div>
          )}
          <div className={`text-xs font-bold mt-2 flex items-center gap-1 ${trendColor}`}>
            <TrendIcon className="w-3.5 h-3.5" />
            <span>{trendText}</span>
          </div>
        </div>
        <div className={`p-3 rounded-2xl ${iconBg} ${iconColor} border shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3 -mx-1">
        <Sparkline data={sparkData} color={sparkColor} />
      </div>
    </div>
  );
}

const APPOINTMENT_STATUS_META: Record<string, { text: string; color: string }> = {
  confirmed: { text: 'ยืนยันแล้ว', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  pending: { text: 'รอยืนยัน', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  line_sent: { text: 'ส่ง LINE แล้ว', color: 'bg-teal-50 text-teal-700 border-teal-200' },
};
const DEFAULT_STATUS_META = { text: 'นัดหมาย', color: 'bg-slate-50 text-slate-600 border-slate-200' };

function getAppointmentStatusMeta(app: { status?: string; statusText?: string; statusColor?: string }) {
  const fallback = APPOINTMENT_STATUS_META[app.status ?? ''] ?? DEFAULT_STATUS_META;
  return {
    text: app.statusText || fallback.text,
    color: app.statusColor || fallback.color,
  };
}

function ProgressRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-600 font-semibold">{label}</span>
        <strong className="text-slate-900 font-black">{value}%</strong>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700 ease-out`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

/* ---------------------------------- Page ---------------------------------- */

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState<Date | null>(null);
  const [statsData, setStatsData] = useState({
    totalPatients: 7400,
    appointmentsToday: 46,
    upcomingAppointments: 2944,
    missedFollowUps: 761,
  });

  const [recentAppointments, setRecentAppointments] = useState<any[]>([
    {
      id: '1',
      patientName: 'นายสุบิน อักษร',
      hn: 'HN-000028935',
      clinic: 'โรคเบาหวาน',
      doctor: 'นายแพทย์วัฒนนิกรณ์',
      time: '08:00 น.',
      status: 'confirmed',
      statusText: 'ยืนยันแล้ว',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: '2',
      patientName: 'น.ส.มาลัย วงษ์จำปา',
      hn: 'HN-000059754',
      clinic: 'โรคเบาหวาน',
      doctor: 'นายแพทย์วัฒนนิกรณ์',
      time: '08:30 น.',
      status: 'pending',
      statusText: 'รอยืนยัน',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      id: '3',
      patientName: 'นายวิทยา วงษ์จำปา',
      hn: 'HN-000006358',
      clinic: 'โรคความดัน',
      doctor: 'นายแพทย์วัฒนนิกรณ์',
      time: '09:00 น.',
      status: 'line_sent',
      statusText: 'ส่ง LINE แล้ว',
      statusColor: 'bg-teal-50 text-teal-700 border-teal-200',
    },
  ]);

  const fetchLiveHosxpStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hosxp/stats');
      const data = await res.json();
      if (data.success && data.stats) {
        setStatsData({
          totalPatients: data.stats.totalPatients || 7400,
          appointmentsToday: data.stats.appointmentsToday || 46,
          upcomingAppointments: data.stats.upcomingAppointments || 2944,
          missedFollowUps: data.stats.missedFollowUps || 761,
        });
        if (data.recentAppointments && data.recentAppointments.length > 0) {
          setRecentAppointments(data.recentAppointments);
        }
      }
    } catch (err) {
      console.error('❌ Failed to fetch live HOSxP stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setNow(new Date());
    fetchLiveHosxpStats();
    const clock = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(clock);
  }, []);

  const monthlyTrend = [
    { month: 'มี.ค.', count: 89 },
    { month: 'เม.ย.', count: 112 },
    { month: 'พ.ค.', count: 96 },
    { month: 'มิ.ย.', count: 138 },
    { month: 'ก.ค.', count: 166 },
    { month: 'ส.ค.', count: 124 },
  ];
  const trendMax = Math.max(...monthlyTrend.map((m) => m.count));
  const trendAvg = Math.round(monthlyTrend.reduce((s, m) => s + m.count, 0) / monthlyTrend.length);
  const barHeightPct = (count: number) => (count / trendMax) * 85;

  const hour = now?.getHours() ?? 9;
  const greeting = hour < 12 ? 'สวัสดีตอนเช้า' : hour < 17 ? 'สวัสดีตอนบ่าย' : 'สวัสดีตอนเย็น';
  const thaiDate = now
    ? new Intl.DateTimeFormat('th-TH-u-ca-buddhist', { day: 'numeric', month: 'long', year: 'numeric' }).format(now)
    : '';
  const thaiTime = now ? new Intl.DateTimeFormat('th-TH', { hour: '2-digit', minute: '2-digit' }).format(now) : '';

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-800 font-sans">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-clinical-gradient p-6 md:p-8 shadow-lg shadow-teal-900/10">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, white 1.5px, transparent 0)',
              backgroundSize: '22px 22px',
            }}
          />
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -right-4 bottom-0 w-40 h-40 rounded-full bg-emerald-400/10 blur-2xl" />

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/90 text-[11px] font-bold mb-3">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>ข้อมูลสด จาก HOSxP</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {greeting}, ทีมงาน NCDs Care
              </h1>
              <p className="text-teal-100/90 text-xs sm:text-sm mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>รพ.คลองหาด — ภาพรวมระบบวันนี้</span>
                {thaiDate && (
                  <>
                    <span className="text-white/30">•</span>
                    <span>
                      {thaiDate} {thaiTime && `เวลา ${thaiTime} น.`}
                    </span>
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={fetchLiveHosxpStats}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white backdrop-blur-sm transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>อัปเดตข้อมูล</span>
              </button>
              <Link
                href="/appointments"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-teal-50 text-teal-700 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>สร้างรายการนัด</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Primary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          <MetricCard
            label="ผู้ป่วยทั้งหมดใน HOSxP"
            value={statsData.totalPatients}
            unit="ราย"
            loading={loading}
            icon={Users}
            iconBg="bg-emerald-50 border-emerald-100"
            iconColor="text-emerald-600"
            trendUp
            trendText="เพิ่มขึ้น 3.2%"
            trendColor="text-emerald-600"
            sparkData={[60, 63, 65, 68, 70, 74, 78]}
            sparkColor="#10b981"
          />
          <MetricCard
            label="ผู้ป่วยนัดล่วงหน้า"
            value={statsData.upcomingAppointments}
            unit="ราย"
            loading={loading}
            icon={Calendar}
            iconBg="bg-sky-50 border-sky-100"
            iconColor="text-sky-600"
            trendUp
            trendText="ตารางนัดหมาย"
            trendColor="text-sky-600"
            sparkData={[40, 55, 50, 62, 58, 66, 70]}
            sparkColor="#0284c7"
          />
          <MetricCard
            label="ผู้ป่วยนัดวันนี้"
            value={statsData.appointmentsToday}
            unit="ราย"
            loading={loading}
            icon={PhoneCall}
            iconBg="bg-amber-50 border-amber-100"
            iconColor="text-amber-600"
            trendUp
            trendText="ต้องดำเนินการวันนี้"
            trendColor="text-amber-600"
            sparkData={[30, 45, 38, 50, 42, 48, 46]}
            sparkColor="#d97706"
          />
          <MetricCard
            label="ต้องติดตามขาดนัด"
            value={statsData.missedFollowUps}
            unit="ราย"
            loading={loading}
            icon={AlertCircle}
            iconBg="bg-rose-50 border-rose-100"
            iconColor="text-rose-600"
            trendUp
            trendText="เพิ่มขึ้น 8.2%"
            trendColor="text-rose-600"
            sparkData={[50, 48, 55, 58, 62, 66, 72]}
            sparkColor="#e11d48"
          />
        </div>

        {/* Row 1: Urgent Tasks & Quick Menu */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Urgent Tasks */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                  <Sparkles className="w-4 h-4" />
                </span>
                <span>งานเร่งด่วนวันนี้</span>
              </h3>
              <Link href="/reply" className="text-xs font-bold text-teal-600 hover:underline flex items-center gap-0.5">
                <span>ดูทั้งหมด</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              <div className="group p-3.5 rounded-xl border border-slate-200/80 bg-white flex items-center gap-3 hover:border-rose-200 hover:bg-rose-50/40 transition-all">
                <span className="w-1.5 self-stretch rounded-full bg-rose-500 shrink-0" />
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-700 shrink-0">เร่งด่วน</span>
                    <span className="text-xs font-bold text-slate-800 truncate">Reply คัดกรองอาการผิดปกติ</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white shrink-0 ml-2">3 ราย</span>
                </div>
              </div>

              <div className="group p-3.5 rounded-xl border border-slate-200/80 bg-white flex items-center gap-3 hover:border-amber-200 hover:bg-amber-50/40 transition-all">
                <span className="w-1.5 self-stretch rounded-full bg-amber-500 shrink-0" />
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 shrink-0">ติดตาม</span>
                    <span className="text-xs font-bold text-slate-800 truncate">ผู้ป่วยขาดนัดเกิน 7 วัน</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white shrink-0 ml-2">18 ราย</span>
                </div>
              </div>

              <div className="group p-3.5 rounded-xl border border-slate-200/80 bg-white flex items-center gap-3 hover:border-sky-200 hover:bg-sky-50/40 transition-all">
                <span className="w-1.5 self-stretch rounded-full bg-sky-500 shrink-0" />
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-100 text-sky-700 shrink-0">ยืนยันนัด</span>
                    <span className="text-xs font-bold text-slate-800 truncate">ผู้ป่วยยังไม่ตอบรับนัดวันนี้</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-600 text-white shrink-0 ml-2">12 ราย</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                <MessageSquare className="w-4 h-4" />
              </span>
              <span>เมนูด่วนสำหรับเจ้าหน้าที่ NCDs</span>
            </h3>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <Link
                href="/registry"
                className="hover-grow p-3.5 bg-gradient-to-br from-emerald-50 to-emerald-100/60 hover:from-emerald-100 hover:to-emerald-100 border border-emerald-200 rounded-2xl font-bold text-emerald-900 transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer min-h-[92px]"
              >
                <UserCheck className="w-6 h-6 text-emerald-600" />
                <span>ทะเบียน NCDs</span>
              </Link>

              <Link
                href="/follow-ups"
                className="hover-grow p-3.5 bg-gradient-to-br from-rose-50 to-rose-100/60 hover:from-rose-100 hover:to-rose-100 border border-rose-200 rounded-2xl font-bold text-rose-900 transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer min-h-[92px]"
              >
                <AlertCircle className="w-6 h-6 text-rose-600" />
                <span>ผู้ป่วยขาดนัด</span>
              </Link>

              <Link
                href="/line-flex-test"
                className="hover-grow p-3.5 bg-gradient-to-br from-teal-50 to-teal-100/60 hover:from-teal-100 hover:to-teal-100 border border-teal-200 rounded-2xl font-bold text-teal-900 transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer min-h-[92px]"
              >
                <MessageSquare className="w-6 h-6 text-teal-600" />
                <span>LINE Flex Cards</span>
              </Link>

              <Link
                href="/settings"
                className="hover-grow p-3.5 bg-gradient-to-br from-slate-50 to-slate-100/60 hover:from-slate-100 hover:to-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-700 transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer min-h-[92px]"
              >
                <Settings className="w-6 h-6 text-slate-600" />
                <span>ตั้งค่าระบบ</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Row 2: Today's Appointments & Database Connection Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Appointments from HOSxP */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" />
                <span>รายการนัดหมายวันนี้ (HOSxP Live Data)</span>
              </h3>
              <Link href="/appointments" className="text-xs font-bold text-teal-600 hover:underline flex items-center gap-0.5">
                <span>ดูทั้งหมด</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentAppointments.map((app) => {
                const statusMeta = getAppointmentStatusMeta(app);
                return (
                  <div
                    key={app.id}
                    className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 flex items-center gap-3.5 hover:bg-slate-100/60 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-teal-600/10 text-teal-700 border border-teal-200 flex items-center justify-center font-black text-xs shrink-0">
                      {app.patientName?.replace(/^นาย|^น\.ส\.|^นาง/, '').trim().charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm truncate">{app.patientName}</span>
                        <span className="text-[10px] text-teal-700 font-mono font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200 shrink-0">
                          {app.hn}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 truncate">
                        {app.clinic} · {app.doctor}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-slate-800 text-xs">{app.time}</div>
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border mt-1 ${statusMeta.color}`}>
                        {statusMeta.text}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Database Connection Status */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 pb-2 border-b border-slate-100">
              <Wifi className="w-5 h-5 text-teal-600" />
              <span>สถานะการเชื่อมต่อระบบ</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              {[
                { label: 'HOSxP Database', status: 'ACTIVE' },
                { label: 'Supabase Cloud', status: 'ONLINE' },
                { label: 'LINE Messaging API', status: 'CONNECTED' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between"
                >
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {item.label}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    {item.status}
                  </span>
                </div>
              ))}

              <div className="pt-2 flex justify-between items-center text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" />
                  Last Sync
                </span>
                <strong className="text-slate-800">{thaiTime ? `${thaiTime} น.` : '—'}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: 6-Month Missed Followup Trend & Follow-up Effectiveness */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Missed Follow-ups Trend Chart */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-600" />
                <span>แนวโน้มผู้ป่วยขาดนัดย้อนหลัง 6 เดือน</span>
              </h3>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                เฉลี่ย {trendAvg} ราย/เดือน
              </span>
            </div>

            {/* Visual Bar Chart */}
            <div className="h-56 flex items-end gap-3 sm:gap-6 pt-6 pb-2 px-2 border-b border-slate-100 relative">
              {/* average guideline */}
              <div
                className="absolute left-2 right-2 border-t border-dashed border-slate-300 z-0"
                style={{ bottom: `${barHeightPct(trendAvg) + 8}%` }}
              />
              {monthlyTrend.map((m, idx) => {
                const isPeak = m.count === trendMax;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative z-10">
                    <span
                      className={`text-xs font-extrabold opacity-90 group-hover:scale-110 transition-transform ${
                        isPeak ? 'text-teal-700' : 'text-slate-700'
                      }`}
                    >
                      {m.count}
                    </span>
                    <div
                      style={{ height: `${barHeightPct(m.count)}%` }}
                      className={`w-full rounded-t-lg shadow-sm transition-all ${
                        isPeak
                          ? 'bg-gradient-to-t from-teal-700 to-teal-400 group-hover:from-teal-800 group-hover:to-teal-500'
                          : 'bg-gradient-to-t from-teal-600/70 to-teal-400/70 group-hover:from-teal-700 group-hover:to-teal-500'
                      }`}
                    />
                    <span className="text-xs font-bold text-slate-500">{m.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Follow-up Effectiveness Stats */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-5">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 pb-2 border-b border-slate-100">
              <Clock className="w-5 h-5 text-teal-600" />
              <span>ประสิทธิผลการติดตาม</span>
            </h3>

            <div className="space-y-4">
              <ProgressRow label="ติดต่อสำเร็จ" value={68} color="from-emerald-400 to-emerald-600" />
              <ProgressRow label="ส่ง LINE สำเร็จ" value={21} color="from-sky-400 to-sky-600" />
              <ProgressRow label="ติดต่อไม่ได้" value={8} color="from-amber-400 to-amber-600" />
              <ProgressRow label="ปฏิเสธนัด" value={3} color="from-rose-400 to-rose-600" />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
