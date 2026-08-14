'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { maskPatientName, maskCid, maskPhone, maskAddress, isITSuperAdmin } from '@/lib/pdpaUtils';
import {
  Users,
  Activity,
  Heart,
  Droplet,
  Search,
  RefreshCw,
  MessageSquare,
  Phone,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  X,
  ChevronRight,
  TrendingUp,
  Stethoscope,
  Filter,
  Shield,
  Eye,
  EyeOff,
  Home,
  Download,
} from 'lucide-react';

interface RegistryPatient {
  hn: string;
  rawHn: string;
  patientName: string;
  phone: string;
  address?: string;
  cid: string;
  birthday?: string;
  sex?: string;
  clinicCode: string;
  clinicName: string;
  diseaseType: string;
  regDate?: string;
  regDateFormatted?: string;
  lastVstDate?: string;
  lastVisitFormatted?: string;
  daysSinceLastVisit?: number;
  isOverOneYearMissed?: boolean;
  isPendingScreening?: boolean;
  alertType?: 'over_1year' | 'pending_screening' | 'normal';
  alertText?: string;
  isDiscontinuedMed?: boolean;
  medStatus?: 'active_meds' | 'discontinued_self' | 'discontinued_doctor' | 'med_refused';
  discontinuedReason?: string;
  discontinuedNote?: string;
  cvdRiskPercent?: number;
  cvdRiskLevel?: 'low' | 'moderate' | 'high' | 'very_high';
  cvdRiskText?: string;
  vitals: {
    bp: string;
    bps: number | null;
    bpd: number | null;
    fbs: string;
    rawFbs: number | null;
    bw: string;
    bmi: string;
    pulse: string;
    pdx: string;
  };
  controlStatusCode: 'controlled' | 'uncontrolled' | 'unknown';
  controlStatusText: string;
  isControlled: boolean;
  nextDate?: string;
  nextTime?: string;
  rawNextDate?: string;
  nextDateFormatted: string;
}

export default function RegistryPage() {
  const [patients, setPatients] = useState<RegistryPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeClinic, setActiveClinic] = useState<'all' | '001' | '002' | '030'>('all');
  const [controlFilter, setControlFilter] = useState<'all' | 'controlled' | 'uncontrolled' | 'over_1year' | 'pending_screening' | 'discontinued_med'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPdpaActive, setIsPdpaActive] = useState(true);
  const [canControlPdpa, setCanControlPdpa] = useState(false);

  useEffect(() => {
    setCanControlPdpa(isITSuperAdmin());
  }, []);

  // Selected Patient for Demographics & Registration Profile Modal
  const [selectedPatientForProfile, setSelectedPatientForProfile] = useState<RegistryPatient | null>(null);

  // Selected Patient for Medical History Modal
  const [selectedPatientForHistory, setSelectedPatientForHistory] = useState<RegistryPatient | null>(null);

  // Selected Patient for Discontinued Medication Note Modal
  const [selectedPatientForNote, setSelectedPatientForNote] = useState<RegistryPatient | null>(null);
  const [selectedReasonCategory, setSelectedReasonCategory] = useState<string>('หยุดยาเองเนื่องจากรู้สึกสบายดี');
  const [customNoteText, setCustomNoteText] = useState<string>('');

  // Stats State
  const [stats, setStats] = useState({
    dmTotal: 1842,
    htTotal: 2315,
    ckdTotal: 412,
    dmControlRate: 78,
    htControlRate: 82,
    uncontrolledCount: 14,
    overOneYearCount: 8,
    pendingScreeningCount: 19,
    discontinuedCount: 12,
  });

  const fetchRegistryData = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        clinic: activeClinic,
        controlStatus: controlFilter,
        search: searchTerm,
        limit: '50',
      });
      const res = await fetch(`/api/hosxp/registry?${query.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.patients)) {
        setPatients(data.patients);
      }
    } catch (err) {
      console.error('❌ Failed to fetch registry data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/hosxp/registry/stats');
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('❌ Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRegistryData();
    }, 300);
    return () => clearTimeout(timer);
  }, [activeClinic, controlFilter, searchTerm]);

  const handleSendLineNotification = async (patient: RegistryPatient) => {
    try {
      const res = await fetch('/api/notify/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'Uf636cf9137cbd32ff2c18773591be46a',
          patientName: patient.patientName,
          hn: patient.hn,
          appointmentDate: patient.nextDateFormatted,
          appointmentTime: patient.nextTime || '08:30 น.',
          clinic: patient.clinicName,
          doctor: 'แพทย์ประจำคลินิก NCDs',
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ ส่งการ์ดแจ้งเตือนนัดหมายติดตามผลไปยัง LINE คุณ ${patient.patientName} เรียบร้อยแล้ว!`);
      } else {
        alert(`⚠️ ไม่สามารถส่ง LINE ได้: ${data.message || 'ข้อผิดพลาดระบบ'}`);
      }
    } catch (err) {
      alert('❌ เกิดข้อผิดพลาดในการเชื่อมต่อระบบ LINE');
    }
  };

  const handleSaveDiscontinuedNote = () => {
    if (!selectedPatientForNote) return;
    const fullNote = `${selectedReasonCategory}${customNoteText.trim() ? ` (${customNoteText.trim()})` : ''}`;

    setPatients((prev) =>
      prev.map((p) =>
        p.hn === selectedPatientForNote.hn
          ? {
              ...p,
              isDiscontinuedMed: true,
              discontinuedReason: selectedReasonCategory,
              discontinuedNote: fullNote,
            }
          : p
      )
    );

    alert(`💾 บันทึกหมายเหตุการหยุดยาสำหรับคุณ ${selectedPatientForNote.patientName} (${selectedPatientForNote.hn}) เรียบร้อยแล้ว!\n\nข้อความบันทึก: "${fullNote}"`);
    setSelectedPatientForNote(null);
    setCustomNoteText('');
  };

  const handleExportCsv = () => {
    if (patients.length === 0) {
      alert('⚠️ ไม่พบข้อมูลสำหรับส่งออก CSV');
      return;
    }
    const headers = ['HN', 'ชื่อ-นามสกุล', 'เพศ', 'โรค', 'BP (mmHg)', 'FBS (mg/dL)', 'CVD Risk', 'สถานะการควบคุม', 'วันนัดถัดไป'];
    const rows = patients.map((p) => [
      p.hn,
      `"${maskPatientName(p.patientName, isPdpaActive)}"`,
      `"${p.sex || '-'}"`,
      `"${p.diseaseType}"`,
      `"${p.vitals.bp}"`,
      `"${p.vitals.fbs}"`,
      `"${p.cvdRiskText || '-'}"`,
      `"${p.controlStatusText.replace(/[\u1F600-\u1F64F]/g, '')}"`,
      `"${p.nextDateFormatted}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `NCD_Registry_KHH_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
              <Activity className="w-8 h-8 text-teal-600" />
              <span>ทะเบียนผู้ป่วยเบาหวาน/ความดัน - ติดตามการรักษา</span>
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              ระบบทะเบียนผู้ป่วยโรคเรื้อรัง (NCDs Registry) และประเมินเป้าหมายการควบคุมระดับน้ำตาลและความดันโลหิตแบบ Real-time จาก HOSxP
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {canControlPdpa && (
              <button
                onClick={() => setIsPdpaActive(!isPdpaActive)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  isPdpaActive
                    ? 'bg-slate-900 text-teal-400 border-slate-800 hover:bg-slate-800'
                    : 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600 shadow-md'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>{isPdpaActive ? '🔒 PDPA (สิทธิ์ ITsuperadmin)' : '🔓 ยืนยันสิทธิ์ ITsuperadmin (แสดงข้อมูลเต็ม)'}</span>
              </button>
            )}
            <button
              onClick={handleExportCsv}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-50 border border-teal-200 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              title="ดาวน์โหลดรายงานทะเบียนเป็นไฟล์ CSV"
            >
              <Download className="w-4 h-4 text-teal-600" />
              <span>ส่งออก CSV</span>
            </button>
            <button
              onClick={() => {
                fetchStats();
                fetchRegistryData();
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 text-teal-600 ${loading ? 'animate-spin' : ''}`} />
              <span>อัปเดตข้อมูลสด</span>
            </button>
          </div>
        </div>

        {/* Main two-column layout: filter sidebar (left) + content (right) */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* ============ Filter Sidebar ============ */}
          <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-6 space-y-5">
            {/* Urgent Alerts */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2.5">
              <h3 className="px-1 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> การแจ้งเตือนด่วน
              </h3>

              {/* ALERT: Over 1 Year Missed Hospital Visit */}
              <button
                onClick={() => setControlFilter(controlFilter === 'over_1year' ? 'all' : 'over_1year')}
                className={`w-full text-left p-3.5 rounded-xl border cursor-pointer transition-all relative overflow-hidden ${
                  controlFilter === 'over_1year'
                    ? 'bg-rose-900 text-white border-rose-900 shadow-lg ring-2 ring-rose-500'
                    : 'bg-rose-50/80 border-rose-200 hover:bg-rose-100/70'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className={`text-[10px] font-bold uppercase tracking-wider block truncate ${controlFilter === 'over_1year' ? 'text-rose-200' : 'text-rose-700'}`}>
                      🚨 ขาดนัดเกิน 1 ปี
                    </span>
                    <div className={`text-xl font-black mt-0.5 ${controlFilter === 'over_1year' ? 'text-white' : 'text-rose-900'}`}>
                      {stats.overOneYearCount} <span className="text-xs font-semibold">ราย</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-rose-500 text-white rounded-xl shadow-md animate-pulse shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                </div>
                <div className={`mt-2.5 pt-2 border-t text-[10px] ${controlFilter === 'over_1year' ? 'border-rose-700/60 text-rose-200' : 'border-rose-200/60 text-rose-700'}`}>
                  หลุดติดตามระบบ &gt;365 วัน — ต้องตามด่วน
                </div>
              </button>

              {/* ALERT: Pending Annual Screening */}
              <button
                onClick={() => setControlFilter(controlFilter === 'pending_screening' ? 'all' : 'pending_screening')}
                className={`w-full text-left p-3.5 rounded-xl border cursor-pointer transition-all relative overflow-hidden ${
                  controlFilter === 'pending_screening'
                    ? 'bg-amber-900 text-white border-amber-900 shadow-lg ring-2 ring-amber-500'
                    : 'bg-amber-50/80 border-amber-200 hover:bg-amber-100/70'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className={`text-[10px] font-bold uppercase tracking-wider block truncate ${controlFilter === 'pending_screening' ? 'text-amber-200' : 'text-amber-800'}`}>
                      ⚠️ ค้างตรวจคัดกรอง
                    </span>
                    <div className={`text-xl font-black mt-0.5 ${controlFilter === 'pending_screening' ? 'text-white' : 'text-amber-900'}`}>
                      {stats.pendingScreeningCount} <span className="text-xs font-semibold">ราย</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-md shrink-0">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
                <div className={`mt-2.5 pt-2 border-t text-[10px] ${controlFilter === 'pending_screening' ? 'border-amber-700/60 text-amber-200' : 'border-amber-200/60 text-amber-800'}`}>
                  ยังไม่ตรวจตา / เท้า / Lab ประจำปี
                </div>
              </button>
            </div>

            {/* Search */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2.5">
              <h3 className="px-1 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" /> ค้นหาผู้ป่วย
              </h3>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="HN, เลข CID หรือ ชื่อ-นามสกุล..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Clinic Filter */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2.5">
              <h3 className="px-1 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5" /> คลินิก
              </h3>
              <div className="space-y-1">
                {[
                  { id: 'all', label: 'ทั้งหมด (NCDs)' },
                  { id: '001', label: '🩸 คลินิกเบาหวาน (001)' },
                  { id: '002', label: '🫀 คลินิกความดัน (002)' },
                  { id: '030', label: '🧪 โรคไตเรื้อรัง (030)' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveClinic(tab.id as any)}
                    className={`w-full text-left px-3.5 py-2.5 border-l-[3px] rounded-r-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      activeClinic === tab.id
                        ? 'border-teal-500 bg-teal-50 text-teal-800'
                        : 'border-transparent text-slate-600 hover:bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Control Status Filter */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2.5">
              <h3 className="px-1 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" /> สถานะการควบคุม
              </h3>
              <div className="space-y-1">
                {[
                  { id: 'all', label: 'ทั้งหมด' },
                  { id: 'controlled', label: '🟢 คุมได้ดี' },
                  { id: 'uncontrolled', label: '🔴 คุมไม่ได้' },
                  { id: 'over_1year', label: '🚨 ขาดนัด >1 ปี' },
                  { id: 'pending_screening', label: '⚠️ ค้างตรวจ' },
                  { id: 'discontinued_med', label: '💊 หยุดยา' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setControlFilter(st.id as any)}
                    className={`w-full text-left px-3.5 py-2.5 border-l-[3px] rounded-r-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      controlFilter === st.id
                        ? 'border-slate-800 bg-slate-100 text-slate-900'
                        : 'border-transparent text-slate-600 hover:bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ============ Content Column ============ */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* DM / HT Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* DM Registry Card */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ทะเบียนเบาหวาน (DM 001)</span>
                    <div className="text-2xl font-black text-slate-800 mt-1">{stats.dmTotal.toLocaleString()} <span className="text-xs font-semibold text-slate-500">คน</span></div>
                  </div>
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                    <Droplet className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">คุมน้ำตาลได้ดี (FBS &lt; 130)</span>
                  <span className="font-extrabold text-emerald-600 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> {stats.dmControlRate}%
                  </span>
                </div>
              </div>

              {/* HT Registry Card */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ทะเบียนความดัน (HT 002)</span>
                    <div className="text-2xl font-black text-slate-800 mt-1">{stats.htTotal.toLocaleString()} <span className="text-xs font-semibold text-slate-500">คน</span></div>
                  </div>
                  <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                    <Heart className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">คุมความดันได้ดี (BP &lt; 140/90)</span>
                  <span className="font-extrabold text-emerald-600 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> {stats.htControlRate}%
                  </span>
                </div>
              </div>
            </div>

            {/* Registry Patients Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-600" />
                  <span>รายชื่อผู้ป่วยในทะเบียนติดตามการรักษา</span>
                </h3>
                <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                  พบ {patients.length} รายการ
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-3.5">ผู้ป่วย / HN</th>
                      <th className="p-3.5">โรค</th>
                      <th className="p-3.5">BP / FBS / CVD Risk</th>
                      <th className="p-3.5">สถานะ</th>
                      <th className="p-3.5">นัดครั้งต่อไป</th>
                      <th className="p-3.5 text-center">ดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-600" />
                          กำลังดึงข้อมูลทะเบียนผู้ป่วยจาก HOSxP...
                        </td>
                      </tr>
                    ) : patients.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          ไม่พบข้อมูลผู้ป่วยตามเงื่อนไขที่เลือก
                        </td>
                      </tr>
                    ) : (
                      patients.map((p, idx) => (
                    <tr key={`${p.hn}-${p.diseaseType}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                      {/* Patient Name & HN — click to open profile popup */}
                      <td className="p-3.5">
                        <button
                          onClick={() => setSelectedPatientForProfile(p)}
                          className="text-left group cursor-pointer block"
                          title="คลิกเพื่อดูข้อมูลส่วนตัวและทะเบียนผู้ป่วย"
                        >
                          <div className="font-extrabold text-slate-800 text-sm group-hover:text-teal-600 transition-colors underline-offset-2 group-hover:underline">
                            {maskPatientName(p.patientName, isPdpaActive)}
                          </div>
                        </button>
                        <div className="text-[10px] font-mono text-teal-700 mt-0.5">{p.hn}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{p.sex}</div>
                      </td>

                      {/* Clinic / Disease */}
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-lg font-bold text-[11px] inline-block">
                          {p.diseaseType}
                        </span>
                      </td>

                      {/* Vitals & CVD Risk */}
                      <td className="p-3.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 text-[10px] w-8">BP:</span>
                            <span className="font-bold font-mono text-slate-800">{p.vitals.bp}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 text-[10px] w-8">FBS:</span>
                            <span className="font-bold font-mono text-amber-700">{p.vitals.fbs}</span>
                          </div>
                          {p.cvdRiskText && (
                            <span className={`mt-1 px-2 py-0.5 rounded text-[10px] font-black border inline-block ${
                              p.cvdRiskLevel === 'very_high' ? 'bg-rose-100 text-rose-900 border-rose-300'
                              : p.cvdRiskLevel === 'high' ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : p.cvdRiskLevel === 'moderate' ? 'bg-yellow-100 text-yellow-900 border-yellow-300'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}>
                              CVD {p.cvdRiskText}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Control Status, Alert & Discontinued Med Note Badge */}
                      <td className="p-3.5">
                        <div className="space-y-1">
                          {p.alertType === 'over_1year' ? (
                            <span className="px-3 py-1 bg-rose-600 text-white rounded-full font-bold text-xs inline-flex items-center gap-1 shadow-md animate-pulse">
                              <AlertTriangle className="w-3.5 h-3.5" /> 🚨 ขาดนัด &gt; 1 ปี
                            </span>
                          ) : p.alertType === 'pending_screening' ? (
                            <span className="px-3 py-1 bg-amber-500 text-white rounded-full font-bold text-xs inline-flex items-center gap-1 shadow-sm">
                              <Activity className="w-3.5 h-3.5" /> ⚠️ ค้างตรวจประจำปี
                            </span>
                          ) : p.controlStatusCode === 'controlled' ? (
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full font-bold text-xs inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> คุมได้ดี
                            </span>
                          ) : p.controlStatusCode === 'uncontrolled' ? (
                            <span className="px-3 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-full font-bold text-xs inline-flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> คุมได้ไม่ดี
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full font-bold text-xs">
                              ⚪ รอตรวจ
                            </span>
                          )}

                          {p.isDiscontinuedMed && (
                            <button
                              onClick={() => { setSelectedPatientForNote(p); setCustomNoteText(p.discontinuedNote || ''); }}
                              className="mt-1 px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded text-[10px] font-extrabold cursor-pointer transition-all"
                              title="คลิกเพื่ออ่าน/แก้ไขหมายเหตุการหยุดยา"
                            >💊 หยุดยา</button>
                          )}
                        </div>
                      </td>

                      {/* Next Appointment Date */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-teal-600" />
                          <span>{p.nextDateFormatted}</span>
                        </div>
                        {p.nextTime && <div className="text-[10px] text-slate-400 mt-0.5">เวลา {p.nextTime} น.</div>}
                      </td>

                      {/* Action Buttons */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {p.isOverOneYearMissed && (
                            <button
                              onClick={() => alert(`🚨 ระบบส่งเรื่องไปยังทีมเยี่ยมบ้าน / อสม. ติดตามคนไข้ขาดนัดเกิน 1 ปี (HN: ${p.hn}) เรียบร้อยแล้ว`)}
                              className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-extrabold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                              title="ส่งทีมเยี่ยมบ้าน / ติดตามด่วน"
                            >
                              <span>📞 ติดตามเยี่ยมบ้าน</span>
                            </button>
                          )}

                          {/* View History Button */}
                          <button
                            onClick={() => setSelectedPatientForHistory(p)}
                            title="ดูประวัติการรักษา"
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {/* LINE Card Button */}
                          <button
                            onClick={() => handleSendLineNotification(p)}
                            title="ส่งการ์ดแจ้งเตือน LINE"
                            className="p-2 bg-teal-50 hover:bg-teal-600 hover:text-white text-teal-700 border border-teal-200 rounded-xl transition-all cursor-pointer"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>

                          {/* Phone Button */}
                          <a
                            href={`tel:${p.phone}`}
                            title={`โทรหาคนไข้ (${p.phone})`}
                            className="p-2 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-200 rounded-xl transition-all cursor-pointer inline-block"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
          </div>
          {/* ============ /Content Column ============ */}
        </div>
        {/* ============ /Main two-column layout ============ */}

        {/* Patient History Modal */}
        {selectedPatientForHistory && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-teal-600" />
                    <span>ประวัติสุขภาพผู้ป่วย NCDs</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{maskPatientName(selectedPatientForHistory.patientName, isPdpaActive)} ({selectedPatientForHistory.hn})</p>
                </div>
                <button onClick={() => setSelectedPatientForHistory(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Vitals & Labs Detail Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">ความดันโลหิต (BP)</span>
                  <span className="text-base font-extrabold text-slate-800">{selectedPatientForHistory.vitals.bp}</span>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-[10px] text-amber-700 font-bold block uppercase">ระดับน้ำตาล (FBS)</span>
                  <span className="text-base font-extrabold text-amber-900">{selectedPatientForHistory.vitals.fbs}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">ดัชนีมวลกาย (BMI)</span>
                  <span className="text-base font-extrabold text-slate-800">{selectedPatientForHistory.vitals.bmi}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">น้ำหนักตัว (BW)</span>
                  <span className="text-base font-extrabold text-slate-800">{selectedPatientForHistory.vitals.bw}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">อัตราการเต้นหัวใจ</span>
                  <span className="text-base font-extrabold text-slate-800">{selectedPatientForHistory.vitals.pulse}</span>
                </div>
                <div className="p-3 bg-teal-50 rounded-xl border border-teal-200">
                  <span className="text-[10px] text-teal-700 font-bold block uppercase">รหัสโรคหลัก (ICD10)</span>
                  <span className="text-base font-extrabold text-teal-900 font-mono">{selectedPatientForHistory.vitals.pdx}</span>
                </div>
              </div>

              {/* Status Summary Banner */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                selectedPatientForHistory.isControlled
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                <div>
                  <span className="text-xs font-bold block">ประเมินสภาวะสุขภาพผู้ป่วย:</span>
                  <span className="text-sm font-extrabold">{selectedPatientForHistory.controlStatusText}</span>
                </div>
                {selectedPatientForHistory.isControlled ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-rose-600" />
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedPatientForHistory(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-all cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Discontinued Medication Note Modal */}
        {selectedPatientForNote && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                    <Droplet className="w-5 h-5 text-amber-600" />
                    <span>บันทึกหมายเหตุผู้ป่วยหยุดยา / พักยา</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {maskPatientName(selectedPatientForNote.patientName, isPdpaActive)} ({selectedPatientForNote.hn})
                  </p>
                </div>
                <button onClick={() => setSelectedPatientForNote(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Home Visit Address Display */}
                <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-xl space-y-1">
                  <span className="text-[10px] text-teal-800 font-extrabold uppercase flex items-center gap-1">
                    <Home className="w-3.5 h-3.5 text-teal-600" /> ที่อยู่ปัจจุบันสำหรับลงพื้นที่เยี่ยมบ้าน (Home Visit Address):
                  </span>
                  <span className="text-xs font-bold text-slate-800 block">
                    {maskAddress(selectedPatientForNote.address || 'ไม่ระบุที่อยู่', isPdpaActive)}
                  </span>
                </div>

                {/* Select Reason Category */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">เลือกสาเหตุหลักในการหยุดยา (Medication Stop Reason):</label>
                  <select
                    value={selectedReasonCategory}
                    onChange={(e) => setSelectedReasonCategory(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-800 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    <option value="หยุดยาเองเนื่องจากรู้สึกสบายดี">1. 🔴 หยุดยาเองเนื่องจากรู้สึกสบายดี/อาการปกติ (เสี่ยงแทรกซ้อน)</option>
                    <option value="แพทย์พิจารณาหยุดยาหลังคุม HbA1c/FBS ได้ดีเยี่ยม">2. 🟢 แพทย์สั่งหยุดยา (DM Remission / คุมระดับน้ำตาลได้ดีเยี่ยม)</option>
                    <option value="ซื้อยากินเองจากร้านยาภายนอก / ทานยาสมุนไพร">3. 💊 ซื้อยากินเองจากร้านยาภายนอก / ทานยาสมุนไพรทางเลือก</option>
                    <option value="เกิดผลข้างเคียงจากยา / ปฏิเสธการทานยา">4. ⚠️ เกิดผลข้างเคียงจากยา / ปฏิเสธการรับประทานยา</option>
                    <option value="ย้ายภูมิลำเนา / ไปรับบริการโรงพยาบาลอื่น">5. 🚚 ย้ายภูมิลำเนา / ไปรับบริการโรงพยาบาลอื่น</option>
                  </select>
                </div>

                {/* Additional Free-text Note */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">รายละเอียดเพิ่มเติม / ข้อความโน้ตบันทึก:</label>
                  <textarea
                    rows={3}
                    value={customNoteText}
                    onChange={(e) => setCustomNoteText(e.target.value)}
                    placeholder="เช่น ขาดยา 3 เดือนล่าสุดเนื่องจากไปทำงานต่างจังหวัด อสม. ลงติดตามแล้ว..."
                    className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedPatientForNote(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-all cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSaveDiscontinuedNote}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  💾 บันทึกหมายเหตุหยุดยา
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Patient Demographics & Registration Profile Modal (ป๊อบอัปข้อมูลส่วนตัว) */}
        {selectedPatientForProfile && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-extrabold text-lg shadow-sm">
                    {selectedPatientForProfile.sex === 'ชาย' ? '👨' : '👩'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-teal-700 font-mono font-bold">{selectedPatientForProfile.hn}</span>
                      <span className="px-2.5 py-0.5 bg-teal-50 text-teal-800 text-[10px] font-bold rounded-full border border-teal-200">
                        {selectedPatientForProfile.diseaseType}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mt-0.5">
                      {maskPatientName(selectedPatientForProfile.patientName, isPdpaActive)}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPatientForProfile(null)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Grid Profile Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Personal Information */}
                <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-2.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-teal-600" /> ข้อมูลส่วนบุคคล (Personal Details)
                  </span>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                      <span className="text-slate-500 font-medium">เพศ</span>
                      <span className="font-bold text-slate-800">{selectedPatientForProfile.sex || 'ไม่ระบุ'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                      <span className="text-slate-500 font-medium">เลขประจำตัวประชาชน (CID)</span>
                      <span className="font-bold text-slate-800 font-mono">
                        {maskCid(selectedPatientForProfile.cid, isPdpaActive)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">รหัสประจำตัวผู้ป่วย (HN)</span>
                      <span className="font-bold text-teal-700 font-mono">{selectedPatientForProfile.hn}</span>
                    </div>
                  </div>
                </div>

                {/* Contact & Phone */}
                <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-2.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-teal-600" /> การติดต่อสื่อสาร (Contact Info)
                  </span>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between border-b border-slate-200/50 pb-1.5">
                      <span className="text-slate-500 font-medium">เบอร์โทรศัพท์มือถือ</span>
                      <span className="font-bold text-slate-800 font-mono">
                        {maskPhone(selectedPatientForProfile.phone, isPdpaActive)}
                      </span>
                    </div>
                    <div className="pt-1 flex justify-end">
                      <a
                        href={`tel:${selectedPatientForProfile.phone}`}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] flex items-center gap-1 shadow-sm transition-all"
                      >
                        <Phone className="w-3 h-3" /> โทรออกด่วน
                      </a>
                    </div>
                  </div>
                </div>

                {/* Home Visit Address */}
                <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-2 md:col-span-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-teal-600" /> ที่อยู่ปัจจุบันสำหรับลงพื้นที่เยี่ยมบ้าน (Home Visit Address)
                  </span>
                  <p className="text-xs font-bold text-slate-800 bg-white p-3 rounded-xl border border-slate-200/70 leading-relaxed">
                    {maskAddress(selectedPatientForProfile.address || 'ไม่ระบุที่อยู่', isPdpaActive)}
                  </p>
                </div>

                {/* Registration & Hospital Details */}
                <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" /> การขึ้นทะเบียนคลินิก (Clinic Registration)
                  </span>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                      <span className="text-slate-500 font-medium">วันขึ้นทะเบียน NCDs</span>
                      <span className="font-bold text-slate-800">{selectedPatientForProfile.regDateFormatted || 'ในระบบ HOSxP'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">คลินิกประจำ</span>
                      <span className="font-bold text-teal-700">{selectedPatientForProfile.clinicName}</span>
                    </div>
                  </div>
                </div>

                {/* Health & Control Status */}
                <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-teal-600" /> สภาวะสุขภาพ & CVD Risk
                  </span>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                      <span className="text-slate-500 font-medium">การคุมโรค</span>
                      <span className="font-bold text-slate-800">{selectedPatientForProfile.controlStatusText}</span>
                    </div>
                    {selectedPatientForProfile.cvdRiskText && (
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">CVD Risk 10 ปี</span>
                        <span className="font-extrabold text-amber-900">{selectedPatientForProfile.cvdRiskText}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap justify-end gap-2 text-xs">
                <button
                  onClick={() => {
                    const p = selectedPatientForProfile;
                    setSelectedPatientForProfile(null);
                    setSelectedPatientForHistory(p);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span>ดูประวัติเวชระเบียนย้อนหลัง</span>
                </button>
                <button
                  onClick={() => {
                    handleSendLineNotification(selectedPatientForProfile);
                  }}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>ส่งการ์ดแจ้งเตือน LINE</span>
                </button>
                <button
                  onClick={() => setSelectedPatientForProfile(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-all cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
