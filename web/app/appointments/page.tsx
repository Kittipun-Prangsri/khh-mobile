'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { maskPatientName, maskCid, isITSuperAdmin } from '@/lib/pdpaUtils';
import {
  Calendar as CalendarIcon,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Search,
  ChevronRight,
  MessageSquare,
  Edit3,
  Save,
  RefreshCw,
  Stethoscope,
  Check,
  Send,
  Shield,
} from 'lucide-react';

interface Appointment {
  id: string;
  hn: string;
  patientName: string;
  disease: string;
  rawDate?: string;
  date: string;
  time: string;
  clinic: string;
  provider: string;
  status: 'scheduled' | 'confirmed' | 'rescheduled' | 'missed' | 'completed';
}

export default function AppointmentsPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [notifyLineOnSave, setNotifyLineOnSave] = useState(true);
  const [loading, setLoading] = useState(true);
  const [sendingBatchLine, setSendingBatchLine] = useState(false);
  const [batchNoticeResult, setBatchNoticeResult] = useState<any | null>(null);
  const [isPdpaActive, setIsPdpaActive] = useState(true);
  const [canControlPdpa, setCanControlPdpa] = useState(false);

  useEffect(() => {
    setCanControlPdpa(isITSuperAdmin());
  }, []);

  // Date Filter States
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [datePreset, setDatePreset] = useState<'all' | 'today' | 'tomorrow' | 'next7days' | 'thisMonth' | 'custom'>('all');

  // New Appointment Form State
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [searchedPatients, setSearchedPatients] = useState<any[]>([]);
  const [searchingPatient, setSearchingPatient] = useState(false);
  const [selectedPatientForAdd, setSelectedPatientForAdd] = useState<any | null>(null);

  const getLocalDateString = (d: Date = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [newAppointment, setNewAppointment] = useState({
    hn: '',
    patientName: '',
    phone: '',
    date: getLocalDateString(),
    time: '08:30',
    clinic: 'ตรวจโรคทั่วไป (000)',
    doctor: 'แพทย์หญิงนิศานาถ เจริญเดชธนกิจ',
    cause: 'ติดตามอาการโรคเรื้อรัง',
    sendLineAlert: true,
  });

  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const applyDatePreset = (preset: 'all' | 'today' | 'tomorrow' | 'next7days' | 'thisMonth' | 'custom') => {
    setDatePreset(preset);
    const today = new Date();
    const formatDate = (d: Date) => getLocalDateString(d);

    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'today') {
      const todayStr = formatDate(today);
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const tomStr = formatDate(tomorrow);
      setStartDate(tomStr);
      setEndDate(tomStr);
    } else if (preset === 'next7days') {
      const todayStr = formatDate(today);
      const next7 = new Date(today);
      next7.setDate(today.getDate() + 7);
      setStartDate(todayStr);
      setEndDate(formatDate(next7));
    } else if (preset === 'thisMonth') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setStartDate(formatDate(firstDay));
      setEndDate(formatDate(lastDay));
    }
  };

  // Fetch Live Real Appointments from HOSxP Database
  const fetchLiveHosxpAppointments = async (start = startDate, end = endDate) => {
    setLoading(true);
    try {
      let url = '/api/hosxp/appointments';
      const params = new URLSearchParams();
      if (start) params.append('startDate', start);
      if (end) params.append('endDate', end);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.appointments)) {
        const formatted = data.appointments.map((a: any) => ({
          id: a.id,
          hn: a.hn,
          patientName: a.patientName || 'ไม่ระบุชื่อ',
          disease: 'NCDs (HOSxP)',
          rawDate: a.rawDate || '',
          date: a.date || a.appointmentDate || 'วันนี้',
          time: a.time || a.appointmentTime || '08:30 น.',
          clinic: a.clinic || 'คลินิก NCDs',
          provider: a.provider || a.doctor || 'แพทย์ผู้ตรวจ',
          status: 'confirmed' as const,
        }));
        setAppointments(formatted);
      }
    } catch (err) {
      console.error('❌ Failed to fetch live HOSxP appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveHosxpAppointments(startDate, endDate);
  }, [startDate, endDate]);

  // Search Live HOSxP Patient for New Appointment Form
  const handleSearchPatientForForm = async (query: string) => {
    setPatientSearchTerm(query);
    if (!query.trim()) {
      setSearchedPatients([]);
      return;
    }
    setSearchingPatient(true);
    try {
      const res = await fetch(`/api/hosxp/patients?search=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();
      if (data.success && Array.isArray(data.patients)) {
        setSearchedPatients(data.patients);
      }
    } catch (err) {
      console.error('❌ Search error:', err);
    } finally {
      setSearchingPatient(false);
    }
  };

  const filteredAppointments = appointments.filter((app) => {
    const matchesSearch = app.patientName.includes(searchTerm) || app.hn.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || app.status === selectedStatus;
    
    let matchesDate = true;
    if (startDate || endDate) {
      const appDateStr = app.rawDate;
      if (appDateStr) {
        if (startDate && appDateStr < startDate) matchesDate = false;
        if (endDate && appDateStr > endDate) matchesDate = false;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const appointmentSummary = {
    total: filteredAppointments.length,
    confirmed: filteredAppointments.filter((app) => app.status === 'confirmed').length,
    pending: filteredAppointments.filter((app) => app.status === 'scheduled').length,
    missed: filteredAppointments.filter((app) => app.status === 'missed').length,
  };

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200"><CheckCircle2 className="w-3 h-3 text-teal-600" /> ยืนยันนัดแล้ว</span>;
      case 'scheduled':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3 h-3 text-amber-600" /> รอยืนยันนัด</span>;
      case 'missed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"><AlertCircle className="w-3 h-3 text-rose-600" /> ขาดนัดตรวจ</span>;
      case 'rescheduled':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"><Clock className="w-3 h-3 text-indigo-600" /> ขอเลื่อนนัด</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700"><CheckCircle2 className="w-3 h-3" /> ตรวจแล้ว</span>;
    }
  };

  const handleCreateAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppointment.hn || !newAppointment.patientName) return;

    const formattedDate = new Date(newAppointment.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });

    const created: Appointment = {
      id: Date.now().toString(),
      hn: newAppointment.hn.startsWith('HN-') ? newAppointment.hn : `HN-${newAppointment.hn}`,
      patientName: newAppointment.patientName,
      disease: 'NCDs (HOSxP)',
      date: formattedDate,
      time: `${newAppointment.time} น.`,
      clinic: newAppointment.clinic,
      provider: newAppointment.doctor,
      status: 'confirmed',
    };

    setAppointments([created, ...appointments]);

    if (newAppointment.sendLineAlert) {
      try {
        await fetch('/api/notify/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'Uf636cf9137cbd32ff2c18773591be46a',
            patientName: created.patientName,
            hn: created.hn,
            appointmentDate: created.date,
            appointmentTime: created.time,
            clinic: created.clinic,
            doctor: created.provider,
          }),
        });
      } catch (err) {
        console.error('Error sending LINE alert:', err);
      }
    }

    setShowAddModal(false);
    setSelectedPatientForAdd(null);
    setPatientSearchTerm('');
    setSearchedPatients([]);
    alert(`✅ สร้างรายการนัดหมายผู้ป่วย "${created.patientName}" (${created.hn}) สำเร็จ!`);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppointment) return;

    setAppointments(appointments.map(a => a.id === editingAppointment.id ? editingAppointment : a));

    if (notifyLineOnSave) {
      try {
        await fetch('/api/notify/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'Uf636cf9137cbd32ff2c18773591be46a',
            patientName: editingAppointment.patientName,
            hn: editingAppointment.hn,
            appointmentDate: editingAppointment.date,
            appointmentTime: editingAppointment.time,
            clinic: editingAppointment.clinic,
            doctor: editingAppointment.provider,
          }),
        });
      } catch (err) {
        console.error('Error sending LINE alert:', err);
      }
    }

    setEditingAppointment(null);
    alert(`✅ บันทึกข้อมูลนัดหมายผู้ป่วย "${editingAppointment.patientName}" (${editingAppointment.hn}) เรียบร้อย!`);
  };

  const handleSendBatchLineReminders = async () => {
    setSendingBatchLine(true);
    setBatchNoticeResult(null);

    try {
      const res = await fetch('/api/notify/appointments', { method: 'POST' });
      const data = await res.json();
      if (data.status === 'success') {
        setBatchNoticeResult(data);
      } else {
        alert(`❌ เกิดข้อผิดพลาด: ${data.message}`);
      }
    } catch (err: any) {
      alert(`❌ ไม่สามารถส่งแจ้งเตือน LINE ได้: ${err.message}`);
    } finally {
      setSendingBatchLine(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Appointment Command Center */}
        <section className="relative overflow-hidden rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-50 via-white to-cyan-50/70 p-5 md:p-6 shadow-sm">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-teal-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-cyan-200/25 blur-3xl" />

          <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-emerald-700 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                HOSxP REAL DATABASE · LIVE CONNECTION
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 md:text-3xl flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/20">
                  <CalendarIcon className="w-5 h-5" />
                </span>
                รายการนัดหมายผู้ป่วย
              </h1>
              <p className="mt-2 text-xs font-medium text-slate-500 md:text-sm">
                ตรวจสอบนัดหมาย ติดตามสถานะ และส่งการแจ้งเตือนจากข้อมูล HOSxP ล่าสุด
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { label: 'รายการที่แสดง', value: appointmentSummary.total, icon: CalendarIcon, tone: 'text-teal-700 bg-teal-100' },
                  { label: 'ยืนยันแล้ว', value: appointmentSummary.confirmed, icon: CheckCircle2, tone: 'text-emerald-700 bg-emerald-100' },
                  { label: 'รอยืนยัน', value: appointmentSummary.pending, icon: Clock, tone: 'text-amber-700 bg-amber-100' },
                  { label: 'ขาดนัด', value: appointmentSummary.missed, icon: AlertCircle, tone: 'text-rose-700 bg-rose-100' },
                ].map((stat) => {
                  const StatIcon = stat.icon;
                  return (
                    <div key={stat.label} className="min-w-[112px] rounded-2xl border border-white/90 bg-white/80 px-3 py-2.5 shadow-sm backdrop-blur">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                        <span className={`flex h-5 w-5 items-center justify-center rounded-md ${stat.tone}`}><StatIcon className="h-3 w-3" /></span>
                        <span>{stat.label}</span>
                      </div>
                      <p className="mt-1 text-lg font-extrabold leading-none text-slate-800">{loading ? '—' : stat.value}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 xl:max-w-md xl:justify-end">
            {canControlPdpa && (
              <button
                onClick={() => setIsPdpaActive(!isPdpaActive)}
                className={`flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
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
              onClick={handleSendBatchLineReminders}
              disabled={sendingBatchLine}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
              title="รันระบบส่ง LINE Flex Message แจ้งเตือนคนไข้นัดล่วงหน้า 3 วัน และ 1 วัน อัตโนมัติ"
            >
              <Send className={`w-4 h-4 ${sendingBatchLine ? 'animate-bounce' : ''}`} />
              <span>{sendingBatchLine ? 'กำลังส่ง LINE เตือนนัด...' : '⚡ รันระบบส่ง LINE เตือนนัด 3วัน/1วัน สด'}</span>
            </button>
            <button
              onClick={() => fetchLiveHosxpAppointments()}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-600' : ''}`} />
              <span>โหลดนัดหมาย HOSxP ใหม่</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <span>สร้างรายการนัดหมายใหม่</span>
            </button>
            </div>
          </div>
        </section>

        {/* Batch Notice Result Banner */}
        {batchNoticeResult && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs shadow-sm flex items-start justify-between gap-3 animate-fade-in">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-emerald-950 text-sm mb-1">
                  {batchNoticeResult.message}
                </h4>
                <p className="text-emerald-800 font-medium">
                  📊 สรุปผลการประมวลผล: <span className="font-bold">เตือนล่วงหน้า 3 วัน ({batchNoticeResult.sent3DaysCount} ราย)</span> | <span className="font-bold">เตือนล่วงหน้า 1 วัน ({batchNoticeResult.sent1DayCount} ราย)</span>
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {batchNoticeResult.recipients?.slice(0, 8).map((r: any, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-white border border-emerald-200 rounded text-[10px] font-bold text-emerald-800">
                      👤 {r.name} ({r.clinic}) • {r.noticeType}
                    </span>
                  ))}
                  {(batchNoticeResult.recipients?.length || 0) > 8 && (
                    <span className="px-2 py-0.5 bg-emerald-100 rounded text-[10px] font-bold text-emerald-800">
                      +{batchNoticeResult.recipients.length - 8} รายชื่อเพิ่มเติม
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={() => setBatchNoticeResult(null)} className="text-emerald-700 hover:text-emerald-950 font-bold p-1">
              ✕
            </button>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหา HN หรือชื่อผู้ป่วยใน HOSxP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              <span className="text-xs text-slate-500 font-semibold mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> สถานะ:
              </span>
              {[
                { code: 'all', label: 'ทั้งหมด' },
                { code: 'confirmed', label: 'ยืนยันแล้ว' },
                { code: 'scheduled', label: 'รอยืนยัน' },
                { code: 'rescheduled', label: 'ขอเลื่อน' },
                { code: 'missed', label: 'ขาดนัด' },
              ].map((s) => (
                <button
                  key={s.code}
                  onClick={() => setSelectedStatus(s.code)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    selectedStatus === s.code
                      ? 'bg-teal-600 text-white shadow-sm font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Search Bar & Quick Presets */}
          <div className="pt-3 border-t border-slate-100 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-500 font-semibold flex items-center gap-1 mr-1 shrink-0">
                <CalendarIcon className="w-3.5 h-3.5 text-teal-600" />
                <span>ช่วงวันที่:</span>
              </span>
              {[
                { id: 'all', label: 'ทั้งหมด' },
                { id: 'today', label: 'วันนี้' },
                { id: 'tomorrow', label: 'พรุ่งนี้' },
                { id: 'next7days', label: '7 วันข้างหน้า' },
                { id: 'thisMonth', label: 'เดือนนี้' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyDatePreset(p.id as any)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    datePreset === p.id
                      ? 'bg-teal-50 text-teal-700 border border-teal-300 font-bold shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/70'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Custom Date Pickers */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl">
                <span className="text-slate-400 font-medium text-[10px]">เริ่ม:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setDatePreset('custom');
                  }}
                  className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer text-xs"
                />
              </div>

              <span className="text-slate-400 text-xs">-</span>

              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl">
                <span className="text-slate-400 font-medium text-[10px]">ถึง:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setDatePreset('custom');
                  }}
                  className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer text-xs"
                />
              </div>

              {(startDate || endDate || datePreset !== 'all') && (
                <button
                  type="button"
                  onClick={() => applyDatePreset('all')}
                  className="px-2 py-1 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors font-semibold cursor-pointer text-xs"
                  title="ล้างตัวกรองวันที่"
                >
                  ล้างวันที่
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 md:p-5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-teal-600" />
              <span>รายการนัดหมายทั้งหมด</span>
            </h3>
            <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
              พบ {filteredAppointments.length} รายการ
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 md:p-5 flex items-center gap-4 animate-pulse">
                  <div className="w-11 h-11 rounded-full bg-slate-100 shrink-0" />
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="h-3 w-1/3 max-w-[160px] bg-slate-100 rounded" />
                    <div className="h-2.5 w-1/4 max-w-[100px] bg-slate-100 rounded" />
                  </div>
                  <div className="h-6 w-24 bg-slate-100 rounded-full shrink-0" />
                </div>
              ))
            ) : filteredAppointments.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-300">
                  <CalendarIcon className="w-7 h-7" />
                </div>
                <p className="text-sm font-bold text-slate-500">ไม่พบรายการนัดหมายตามเงื่อนไข</p>
                <p className="text-xs text-slate-400">ลองปรับตัวกรองค้นหา สถานะ หรือช่วงวันที่ใหม่</p>
              </div>
            ) : (
              filteredAppointments.map((app) => {
                const maskedName = maskPatientName(app.patientName, isPdpaActive);
                return (
                  <div
                    key={app.id}
                    className="group p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-3 md:gap-5 hover:bg-slate-50/70 transition-all"
                  >
                    {/* Patient */}
                    <div className="flex items-center gap-3 md:w-56 shrink-0 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-teal-600/10 text-teal-700 border border-teal-200 flex items-center justify-center font-black text-sm shrink-0">
                        {maskedName?.replace(/^นาย|^น\.ส\.|^นาง/, '').trim().charAt(0) || '?'}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 text-sm group-hover:text-teal-700 transition-colors truncate">
                          {maskedName}
                        </div>
                        <div className="text-[10px] text-teal-600 font-mono font-bold">{app.hn}</div>
                      </div>
                    </div>

                    {/* Date / Time */}
                    <div className="flex items-center gap-2 md:w-32 shrink-0">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 text-xs truncate">{app.date}</div>
                        <div className="text-[10px] text-amber-700 font-semibold truncate">{app.time}</div>
                      </div>
                    </div>

                    {/* Clinic / Provider */}
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      <Stethoscope className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-700 truncate">{app.clinic}</div>
                        <div className="text-[10px] text-slate-400 truncate">{app.provider}</div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="shrink-0">{getStatusBadge(app.status)}</div>

                    {/* Action */}
                    <div className="shrink-0">
                      <button
                        onClick={() => setEditingAppointment(app)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-700 rounded-lg transition-all text-xs font-semibold border border-slate-200 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-teal-600" />
                        <span>แก้ไข</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Create New Appointment Modal (Smart HOSxP Patient Search & Auto-fill) */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-teal-600" />
                  <span>สร้างรายการนัดหมายใหม่ (HOSxP Appointment)</span>
                </h3>
                <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateAppointmentSubmit} className="space-y-4 text-xs">
                {/* Patient Search in HOSxP */}
                <div className="relative">
                  <label className="block text-slate-700 font-bold mb-1">🔍 ค้นหาผู้ป่วยใน HOSxP (HN / เลขบัตร CID / ชื่อ-นามสกุล) *</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="พิมพ์ HN หรือ ชื่อผู้ป่วย เช่น สุธารัตน์..."
                      value={patientSearchTerm}
                      onChange={(e) => handleSearchPatientForForm(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 pl-9 text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    {searchingPatient && <RefreshCw className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-teal-600" />}
                  </div>

                  {/* Dropdown Results */}
                  {searchedPatients.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 divide-y divide-slate-100 max-h-48 overflow-y-auto">
                      {searchedPatients.map((p) => (
                        <div
                          key={p.hn}
                          onClick={() => {
                            setSelectedPatientForAdd(p);
                            setNewAppointment({
                              ...newAppointment,
                              hn: p.hn,
                              patientName: p.name,
                              phone: p.phone,
                            });
                            setPatientSearchTerm(`${p.name} (${p.hn})`);
                            setSearchedPatients([]);
                          }}
                          className="p-3 hover:bg-teal-50/70 cursor-pointer flex items-center justify-between transition-colors"
                        >
                          <div>
                            <span className="font-bold text-slate-800 text-xs block">{p.name}</span>
                            <span className="text-[10px] text-teal-600 font-mono font-bold">{p.hn} | CID: {p.cid}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Patient Box */}
                {selectedPatientForAdd && (
                  <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-teal-600 font-mono font-bold">{selectedPatientForAdd.hn}</span>
                      <p className="font-extrabold text-slate-800">{selectedPatientForAdd.name}</p>
                    </div>
                    <span className="text-xs font-bold text-teal-700 bg-white px-2 py-1 rounded border border-teal-200">
                      ✓ เลือกรายชื่อแล้ว
                    </span>
                  </div>
                )}

                {/* Patient Name & HN Inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">หมายเลข HN *</label>
                    <input
                      required
                      type="text"
                      placeholder="เช่น HN-000095429"
                      value={newAppointment.hn}
                      onChange={(e) => setNewAppointment({ ...newAppointment, hn: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">ชื่อ-นามสกุล ผู้ป่วย *</label>
                    <input
                      required
                      type="text"
                      placeholder="ระบุชื่อและนามสกุล"
                      value={newAppointment.patientName}
                      onChange={(e) => setNewAppointment({ ...newAppointment, patientName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium"
                    />
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">วันนัดหมาย *</label>
                    <input
                      required
                      type="date"
                      value={newAppointment.date}
                      onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">เวลานัดหมาย *</label>
                    <select
                      value={newAppointment.time}
                      onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium"
                    >
                      <option value="08:00">08:00 น.</option>
                      <option value="08:30">08:30 น.</option>
                      <option value="09:00">09:00 น.</option>
                      <option value="09:30">09:30 น.</option>
                      <option value="10:00">10:00 น.</option>
                      <option value="10:30">10:30 น.</option>
                      <option value="13:00">13:00 น.</option>
                    </select>
                  </div>
                </div>

                {/* Clinic & Doctor */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">คลินิกบริการ HOSxP</label>
                    <select
                      value={newAppointment.clinic}
                      onChange={(e) => setNewAppointment({ ...newAppointment, clinic: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium"
                    >
                      <option value="ตรวจโรคทั่วไป (000)">ตรวจโรคทั่วไป (000)</option>
                      <option value="คลินิกโรคเบาหวาน DM (018)">คลินิกโรคเบาหวาน DM (018)</option>
                      <option value="คลินิกโรคไตเรื้อรัง CKD (030)">คลินิกโรคไตเรื้อรัง CKD (030)</option>
                      <option value="คลินิกโรคความดัน HT">คลินิกโรคความดัน HT</option>
                      <option value="คลินิกโรคปอด/หืด COPD/ASTHMA">คลินิกโรคปอด/หืด COPD/ASTHMA</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">แพทย์ผู้ตรวจ HOSxP</label>
                    <select
                      value={newAppointment.doctor}
                      onChange={(e) => setNewAppointment({ ...newAppointment, doctor: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium"
                    >
                      <option value="แพทย์หญิงนิศานาถ เจริญเดชธนกิจ">แพทย์หญิงนิศานาถ เจริญเดชธนกิจ</option>
                      <option value="นายแพทย์พิทวัส แววสุวรรณ">นายแพทย์พิทวัส แววสุวรรณ</option>
                      <option value="นายแพทย์วัฒนินทร์ บรรณสาร">นายแพทย์วัฒนินทร์ บรรณสาร</option>
                      <option value="นางสาวกัญญาพัชร การชนะ">นางสาวกัญญาพัชร การชนะ</option>
                    </select>
                  </div>
                </div>

                {/* Reason & Preparation */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">คำแนะนำการเตรียมตัว / สาเหตุการนัด</label>
                  <select
                    value={newAppointment.cause}
                    onChange={(e) => setNewAppointment({ ...newAppointment, cause: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium"
                  >
                    <option value="ติดตามอาการโรคเรื้อรัง">ติดตามอาการโรคเรื้อรัง</option>
                    <option value="เจาะเลือด ตรวจแล็บ (งดน้ำ-อาหารหลังเที่ยงคืน)">เจาะเลือด ตรวจแล็บ (งดน้ำ-อาหารหลังเที่ยงคืน)</option>
                    <option value="รับยาเดิม / ฟังผลตรวจ">รับยาเดิม / ฟังผลตรวจ</option>
                    <option value="ตรวจตา และ ตรวจเท้าผู้ป่วยเบาหวาน">ตรวจตา และ ตรวจเท้าผู้ป่วยเบาหวาน</option>
                  </select>
                </div>

                {/* LINE Alert Checkbox */}
                <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-teal-600" />
                    <span className="text-xs text-teal-800 font-medium">ส่ง LINE Flex Message แจ้งวันนัดหมายไปยังผู้ป่วยทันที</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={newAppointment.sendLineAlert}
                    onChange={(e) => setNewAppointment({ ...newAppointment, sendLineAlert: e.target.checked })}
                    className="w-4 h-4 text-teal-600 rounded cursor-pointer"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-medium cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md cursor-pointer transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>บันทึกและสร้างรายการนัด</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Interactive Edit Appointment Modal */}
        {editingAppointment && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-teal-600" />
                  <span>แก้ไขข้อมูลรายการนัดหมาย ({editingAppointment.hn})</span>
                </h3>
                <button onClick={() => setEditingAppointment(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">ชื่อ-นามสกุล ผู้ป่วย</label>
                  <input
                    required
                    type="text"
                    value={editingAppointment.patientName}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, patientName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">วันนัดหมายใหม่</label>
                    <input
                      required
                      type="text"
                      value={editingAppointment.date}
                      onChange={(e) => setEditingAppointment({ ...editingAppointment, date: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">เวลานัดหมายใหม่</label>
                    <input
                      required
                      type="text"
                      value={editingAppointment.time}
                      onChange={(e) => setEditingAppointment({ ...editingAppointment, time: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">คลินิกบริการ</label>
                    <input
                      required
                      type="text"
                      value={editingAppointment.clinic}
                      onChange={(e) => setEditingAppointment({ ...editingAppointment, clinic: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">แพทย์ผู้ตรวจ</label>
                    <input
                      required
                      type="text"
                      value={editingAppointment.provider}
                      onChange={(e) => setEditingAppointment({ ...editingAppointment, provider: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">สถานะการนัดหมาย</label>
                  <select
                    value={editingAppointment.status}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, status: e.target.value as Appointment['status'] })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium"
                  >
                    <option value="confirmed">ยืนยันนัดแล้ว</option>
                    <option value="scheduled">รอยืนยันนัด</option>
                    <option value="rescheduled">ขอเลื่อนนัด</option>
                    <option value="missed">ขาดนัดตรวจ</option>
                    <option value="completed">ตรวจแล้ว</option>
                  </select>
                </div>

                <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-teal-600" />
                    <span className="text-xs text-teal-800 font-medium">ส่ง LINE Flex Message แจ้งวันนัดใหม่ทันที</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyLineOnSave}
                    onChange={(e) => setNotifyLineOnSave(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded cursor-pointer"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingAppointment(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-medium cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md cursor-pointer transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>บันทึกการแก้ไข</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
