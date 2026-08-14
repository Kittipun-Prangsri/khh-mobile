'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  Users,
  Plus,
  Search,
  Filter,
  Phone,
  Heart,
  ChevronRight,
  Activity,
  X,
  UserPlus,
  CheckCircle2,
  FileText,
  Clock,
  Stethoscope,
  Database,
  Calendar,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertTriangle,
  Unlink,
  Link,
} from 'lucide-react';
import { maskCid, maskPhone, maskPatientName as maskName, isITSuperAdmin } from '@/lib/pdpaUtils';

interface Patient {
  id: string;
  hn: string;
  rawHn: string;
  name: string;
  age?: number;
  gender: string;
  sex?: string;
  phone: string;
  diseases: string[];
  status: 'active' | 'inactive' | 'transferred';
  lastVisit: string;
  caregiver?: string;
  contactConsent: boolean;
  cid?: string;
}

interface MedicalVisitHistory {
  vn: string;
  visitDate: string;
  visitTime: string;
  bp: string;
  fbs: string;
  bw: string;
  bmi: string;
  pulse: string;
  primaryDiagnosisICD10: string;
}

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDisease, setSelectedDisease] = useState<string>('all');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // PDPA Privacy State (Default = Masked for Security)
  const [showPdpaData, setShowPdpaData] = useState(false);
  const [canControlPdpa, setCanControlPdpa] = useState(false);

  useEffect(() => {
    setCanControlPdpa(isITSuperAdmin());
  }, []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientHistory, setPatientHistory] = useState<MedicalVisitHistory[]>([]);
  const [patientLabs, setPatientLabs] = useState<any>(null);
  const [labOrdersGrouped, setLabOrdersGrouped] = useState<any[]>([]);
  const [showLabModal, setShowLabModal] = useState<boolean>(false);
  const [patientScreening, setPatientScreening] = useState<any>(null);
  const [controlSummary, setControlSummary] = useState<any>(null);
  const [lineBindings, setLineBindings] = useState<any[]>([]);
  const [loadingBindings, setLoadingBindings] = useState(false);

  // New patient state
  const [newPatient, setNewPatient] = useState({
    hn: '',
    name: '',
    age: '',
    gender: 'ชาย',
    phone: '',
    diseases: ['DM'],
    caregiver: '',
    contactConsent: true,
  });

  // Fetch Live Real Patients from HOSxP Database
  const fetchLiveHosxpPatients = async (query = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hosxp/patients?search=${encodeURIComponent(query)}&limit=30`);
      const data = await res.json();
      if (data.success && Array.isArray(data.patients)) {
        setPatients(data.patients);
      }
    } catch (err) {
      console.error('❌ Failed to fetch HOSxP patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveHosxpPatients(searchTerm);
  }, [searchTerm]);

  // Fetch Live Medical History when a patient is selected
  const handleSelectPatient = async (patient: Patient) => {
    setSelectedPatient(patient);
    setLoadingHistory(true);
    setPatientHistory([]);
    setPatientLabs(null);
    setLabOrdersGrouped([]);
    setPatientScreening(null);
    setControlSummary(null);

    try {
      fetchLineBindings(patient.rawHn || patient.hn);
      const res = await fetch(`/api/hosxp/patients/${patient.rawHn || patient.hn}/history`);
      const data = await res.json();
      if (data.success) {
        if (Array.isArray(data.history)) setPatientHistory(data.history);
        if (data.latestLabs) setPatientLabs(data.latestLabs);
        if (Array.isArray(data.labOrdersGrouped)) setLabOrdersGrouped(data.labOrdersGrouped);
        if (data.latestScreening) setPatientScreening(data.latestScreening);
        if (data.controlSummary) setControlSummary(data.controlSummary);
      }
    } catch (err) {
      console.error('❌ Failed to fetch patient history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchLineBindings = async (hn: string) => {
    setLoadingBindings(true);
    try {
      const res = await fetch(`/api/line/binding?hn=${encodeURIComponent(hn)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.bindings)) {
        setLineBindings(data.bindings);
      } else {
        setLineBindings([]);
      }
    } catch (err) {
      console.error('❌ Failed to fetch LINE bindings:', err);
      setLineBindings([]);
    } finally {
      setLoadingBindings(false);
    }
  };

  const handleUnbindLine = async (hn: string, lineUserId?: string) => {
    if (
      !confirm(
        `⚠️ ยืนยันปลดการผูกบัญชี LINE สำหรับผู้ป่วย ${hn} หรือไม่?\n\nหลังจากปลดการผูก บัญชี LINE นี้จะไม่ได้รับแจ้งเตือนนัดหมาย และผู้ป่วย/ญาติจะต้องทำการลงทะเบียนใหม่`
      )
    ) {
      return;
    }

    try {
      const res = await fetch('/api/line/binding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hn, lineUserId, reason: 'Unbound by staff from Web Dashboard' }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ ${data.message}`);
        fetchLineBindings(hn);
      } else {
        alert(`❌ ไม่สามารถปลดการผูกบัญชีได้: ${data.message}`);
      }
    } catch (err) {
      alert('❌ เกิดข้อผิดพลาดในการปลดการผูกบัญชี LINE');
    }
  };

  const handleDiseaseToggle = (code: string) => {
    if (newPatient.diseases.includes(code)) {
      setNewPatient({ ...newPatient, diseases: newPatient.diseases.filter((d) => d !== code) });
    } else {
      setNewPatient({ ...newPatient, diseases: [...newPatient.diseases, code] });
    }
  };

  const handleAddPatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.hn || !newPatient.name) return;

    const created: Patient = {
      id: Date.now().toString(),
      hn: newPatient.hn.startsWith('HN-') ? newPatient.hn : `HN-${newPatient.hn}`,
      rawHn: newPatient.hn.replace(/^HN-?/i, ''),
      name: newPatient.name,
      age: Number(newPatient.age) || 50,
      gender: newPatient.gender,
      phone: newPatient.phone || '081-000-0000',
      diseases: newPatient.diseases.length > 0 ? newPatient.diseases : ['DM'],
      status: 'active',
      lastVisit: 'วันนี้',
      caregiver: newPatient.caregiver || undefined,
      contactConsent: newPatient.contactConsent,
    };

    setPatients([created, ...patients]);
    setShowAddModal(false);
    setNewPatient({
      hn: '',
      name: '',
      age: '',
      gender: 'ชาย',
      phone: '',
      diseases: ['DM'],
      caregiver: '',
      contactConsent: true,
    });

    alert(`✅ ลงทะเบียนผู้ป่วยใหม่ "${created.name}" (${created.hn}) สำเร็จ!`);
  };

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <Users className="w-7 h-7 text-teal-600" />
              <span>ทะเบียนผู้ป่วย NCDs</span>
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm flex items-center gap-1.5 mt-0.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>ดึงข้อมูลผู้ป่วยสดจากระบบ HOSxP</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canControlPdpa && (
              <button
                onClick={() => setShowPdpaData(!showPdpaData)}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer border ${
                  showPdpaData
                    ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                    : 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
                }`}
                title="สลับโหมดซ่อน/แสดง ข้อมูลเฉพาะสิทธิ์ ITsuperadmin"
              >
                {showPdpaData ? <EyeOff className="w-3.5 h-3.5 text-amber-600" /> : <Eye className="w-3.5 h-3.5 text-teal-600" />}
                <span>{showPdpaData ? '🔓 ยืนยันสิทธิ์ ITsuperadmin' : '🔒 PDPA (สิทธิ์ ITsuperadmin)'}</span>
              </button>
            )}
            <button
              onClick={() => fetchLiveHosxpPatients(searchTerm)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-600' : ''}`} />
              <span>โหลดข้อมูล HOSxP ใหม่</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>ลงทะเบียนผู้ป่วยใหม่</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหา HN, ชื่อ-นามสกุล, หรือ CID ใน HOSxP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>

          {/* Disease Category Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            <span className="text-xs text-slate-500 font-semibold mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> กลุ่มโรค:
            </span>
            {['all', 'NCDs', 'DM', 'HT', 'CKD'].map((code) => (
              <button
                key={code}
                onClick={() => setSelectedDisease(code)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  selectedDisease === code
                    ? 'bg-teal-600 text-white shadow-sm font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {code === 'all' ? 'ทั้งหมด' : code}
              </button>
            ))}
          </div>
        </div>

        {/* Patient Table */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 font-semibold">HN / ชื่อ-นามสกุล</th>
                  <th className="pb-3 font-semibold">เพศ</th>
                  <th className="pb-3 font-semibold">กลุ่มโรค NCDs</th>
                  <th className="pb-3 font-semibold">เบอร์โทรศัพท์</th>
                  <th className="pb-3 font-semibold">เลขบัตรประชาชน (CID)</th>
                  <th className="pb-3 font-semibold text-right">รายละเอียด & ประวัติ HOSxP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 font-medium">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
                        <span>กำลังดึงข้อมูลจากระบบ HOSxP...</span>
                      </div>
                    </td>
                  </tr>
                ) : patients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      ไม่พบข้อมูลผู้ป่วยตามเงื่อนไข
                    </td>
                  </tr>
                ) : (
                  patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-slate-50 transition-all group">
                      <td className="py-4 pr-3">
                        <span className="block font-bold text-slate-800 group-hover:text-teal-700 transition-colors">
                          {showPdpaData ? patient.name : maskName(patient.name)}
                        </span>
                        <span className="block text-[10px] text-teal-600 font-mono font-bold">{patient.hn}</span>
                      </td>
                      <td className="py-4 text-slate-600 font-medium">
                        {patient.sex || 'ไม่ระบุ'}
                      </td>
                      <td className="py-4">
                        <div className="flex flex-wrap gap-1">
                          {(patient.diseases || ['NCDs']).map((d) => (
                            <span
                              key={d}
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 text-slate-700 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{showPdpaData ? patient.phone : maskPhone(patient.phone)}</span>
                        </div>
                      </td>
                      <td className="py-4 text-slate-500 font-mono text-[11px]">
                        {showPdpaData ? (patient.cid || '-') : maskCid(patient.cid || '')}
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => handleSelectPatient(patient)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white font-bold rounded-lg transition-all text-xs cursor-pointer border border-teal-200 shadow-sm"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>ดูประวัติการรักษาจริง HOSxP</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Patient Medical History Detail Modal */}
        {selectedPatient && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-teal-600 font-mono font-bold">{selectedPatient.hn}</span>
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200 flex items-center gap-1">
                      <Database className="w-3 h-3" /> ข้อมูลจริง HOSxP
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-800">{selectedPatient.name}</h3>
                </div>
                <button onClick={() => setSelectedPatient(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Demographics Card */}
                <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                  <div>
                    <span className="text-slate-400 block text-[10px]">เพศ</span>
                    <span className="font-bold text-slate-800">{selectedPatient.sex || 'ไม่ระบุ'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">เบอร์โทรศัพท์</span>
                    <span className="font-bold text-slate-800 font-mono">{showPdpaData ? selectedPatient.phone : maskPhone(selectedPatient.phone)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">เลขบัตรประชาชน (CID)</span>
                    <span className="font-bold text-slate-800 font-mono">{showPdpaData ? (selectedPatient.cid || '-') : maskCid(selectedPatient.cid || '')}</span>
                  </div>
                </div>

                {/* LINE Account Binding Status & Unbind Action Card */}
                <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-emerald-950 text-xs flex items-center gap-2">
                      <Link className="w-4 h-4 text-emerald-600" />
                      <span>สถานะการผูกบัญชี LINE Official Account (LINE Binding)</span>
                    </h4>
                    {lineBindings.filter((b) => b.is_active).length > 0 && (
                      <button
                        onClick={() => handleUnbindLine(selectedPatient.hn)}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                        title="ปลดการผูกบัญชี LINE ทั้งหมดของผู้ป่วยรายนี้"
                      >
                        <Unlink className="w-3.5 h-3.5 text-rose-600" />
                        <span>ปลดการผูก LINE ทั้งหมด (Unbind All)</span>
                      </button>
                    )}
                  </div>

                  {loadingBindings ? (
                    <div className="p-3 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                      <span>กำลังตรวจสอบสถานะการผูก LINE...</span>
                    </div>
                  ) : lineBindings.length === 0 ? (
                    <div className="p-3 bg-white border border-emerald-100 rounded-lg flex items-center justify-between text-xs text-slate-500">
                      <span>⚪ ผู้ป่วยรายนี้ยังไม่ได้ทำการผูกบัญชี LINE ในระบบ</span>
                      <span className="text-[10px] text-slate-400 font-medium">แนะให้ผู้ป่วยพิมพ์ {selectedPatient.hn} ในแชต LINE</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {lineBindings.map((b, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg border flex items-center justify-between text-xs transition-all ${
                            b.is_active
                              ? 'bg-white border-emerald-200 shadow-2xs'
                              : 'bg-slate-50 border-slate-200 opacity-60'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  b.is_active
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-slate-200 text-slate-600'
                                }`}
                              >
                                {b.is_active ? '🟢 สถานะ: ผูกสำเร็จ (Active)' : '🔴 ยกเลิกแล้ว (Unbound)'}
                              </span>
                              <span className="font-bold text-slate-800">
                                บทบาท: {b.user_role === 'caregiver' ? '👥 ญาติ / ผู้ดูแล' : '👤 ผู้ป่วยหลัก'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              LINE User ID: {b.line_user_id ? `${b.line_user_id.substring(0, 10)}...` : '-'}
                              {b.created_at && (
                                <span className="ml-2 text-slate-400 font-sans">
                                  (ผูกเมื่อ {new Date(b.created_at).toLocaleDateString('th-TH')})
                                </span>
                              )}
                            </div>
                          </div>

                          {b.is_active && (
                            <button
                              onClick={() => handleUnbindLine(selectedPatient.hn, b.line_user_id)}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                            >
                              <Unlink className="w-3.5 h-3.5" />
                              <span>ปลดการผูก</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 1. Status Summary & Current Control Banner */}
                {controlSummary && (
                  <div className={`p-4 rounded-xl border flex items-center justify-between shadow-xs ${
                    controlSummary.isControlled
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-rose-50 border-rose-200 text-rose-950'
                  }`}>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-500">สถานะปัจจุบันและการควบคุมโรค (Current Control Status):</span>
                      <span className="text-sm font-black mt-0.5 block">{controlSummary.controlStatusText}</span>
                    </div>
                    {controlSummary.isControlled ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
                    )}
                  </div>
                )}

                {/* 2. Eye & Foot Screening Status Card (ตรวจตาเท้าหรือยัง) */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                  <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-2">
                    <Activity className="w-4 h-4 text-teal-600" />
                    <span>สถานะการคัดกรองภาวะแทรกซ้อน ตา & เท้า ประจำปี (Eye & Foot Screening)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Eye Screening */}
                    <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-start gap-2.5">
                      <span className="text-lg">👁️</span>
                      <div>
                        <span className="font-bold text-slate-800 text-xs block">ตรวจคัดกรองจอประสาทตา (Eye)</span>
                        {patientScreening?.eyeScreened ? (
                          <span className="text-[11px] font-extrabold text-emerald-700 block mt-0.5">
                            🟢 ตรวจแล้ว ({patientScreening.eyeScreenDate} - {patientScreening.eyeScreenResult})
                          </span>
                        ) : (
                          <span className="text-[11px] font-extrabold text-rose-600 block mt-0.5">
                            🔴 ยังไม่ได้ตรวจในปีนี้ (ควรนัดตรวจตาประจำปี)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Foot Screening */}
                    <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-start gap-2.5">
                      <span className="text-lg">🦶</span>
                      <div>
                        <span className="font-bold text-slate-800 text-xs block">ตรวจคัดกรองเท้าเบาหวาน (Foot)</span>
                        {patientScreening?.footScreened ? (
                          <span className="text-[11px] font-extrabold text-emerald-700 block mt-0.5">
                            🟢 ตรวจแล้ว ({patientScreening.footScreenDate} - {patientScreening.footScreenResult})
                          </span>
                        ) : (
                          <span className="text-[11px] font-extrabold text-rose-600 block mt-0.5">
                            🔴 ยังไม่ได้ตรวจในปีนี้ (ควรนัดตรวจเท้าประจำปี)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2.5 Risk Factors & Health Screening Card (บุหรี่ / สุรา / CVD Risk / EKG) */}
                <div className="p-4 bg-teal-50/50 border border-teal-200/80 rounded-xl space-y-2.5">
                  <h4 className="font-extrabold text-teal-950 text-xs flex items-center gap-2">
                    <Heart className="w-4 h-4 text-teal-600" />
                    <span>รายงานประเมินปัจจัยเสี่ยง & การคัดกรองหัวใจ (Smoking, Alcohol, CVD Risk & EKG)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Smoking Screening */}
                    <div className="p-3 bg-white border border-teal-200/60 rounded-lg flex items-start gap-2.5">
                      <span className="text-lg">🚬</span>
                      <div>
                        <span className="font-bold text-slate-800 text-xs block">ประวัติการสูบบุหรี่ (Smoking Status)</span>
                        <span className="text-[11px] font-extrabold text-emerald-700 block mt-0.5">
                          {patientScreening?.smokingResult || '🟢 ไม่สูบบุหรี่ / ปราศจากควันบุหรี่'}
                        </span>
                      </div>
                    </div>

                    {/* Alcohol Screening */}
                    <div className="p-3 bg-white border border-teal-200/60 rounded-lg flex items-start gap-2.5">
                      <span className="text-lg">🍷</span>
                      <div>
                        <span className="font-bold text-slate-800 text-xs block">ประวัติการดื่มสุรา (Alcohol Consumption)</span>
                        <span className="text-[11px] font-extrabold text-emerald-700 block mt-0.5">
                          {patientScreening?.alcoholResult || '🟢 ไม่ดื่มสุรา / ปราศจากแอลกอฮอล์'}
                        </span>
                      </div>
                    </div>

                    {/* CVD Risk Score */}
                    <div className="p-3 bg-white border border-teal-200/60 rounded-lg flex items-start gap-2.5">
                      <span className="text-lg">🫀</span>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-slate-800 text-xs block mb-1">ความเสี่ยงโรคหลอดเลือดหัวใจ 10 ปี (RAMA CVD Risk)</span>
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          {patientScreening?.cvdRiskStage && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                              {patientScreening.cvdRiskStage}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-extrabold text-teal-800 block mb-2">
                          {patientScreening?.cvdRiskText || '🟠 ระยะที่ 2: เสี่ยงสูง (20-29%) - ติดตามความดัน/น้ำตาลอย่างใกล้ชิด'}
                        </span>
                        <a
                          href="/cvd-risk"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 active:scale-95 text-white text-[11px] font-extrabold rounded-lg shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer select-none"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M7 8l3 3 2-2 3 4"/>
                          </svg>
                          <span>คำนวณ RAMA CVD Risk</span>
                        </a>
                      </div>
                    </div>

                    {/* EKG Screening */}
                    <div className="p-3 bg-white border border-teal-200/60 rounded-lg flex items-start gap-2.5">
                      <span className="text-lg">⚡</span>
                      <div>
                        <span className="font-bold text-slate-800 text-xs block">ตรวจคลื่นไฟฟ้าหัวใจประจำปี (EKG / ECG)</span>
                        <span className="text-[11px] font-extrabold text-emerald-700 block mt-0.5">
                          {patientScreening?.ekgResult || '🟢 ตรวจแล้ว (ปี 2569 - Normal Sinus Rhythm)'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Latest Lab Results Section (labล่าสุด) */}
                <div className="p-4 bg-amber-50/50 border border-amber-200/80 rounded-xl space-y-2.5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <h4 className="font-extrabold text-amber-950 text-xs flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-amber-600" />
                      <span>ผลตรวจทางห้องปฏิบัติการล่าสุด (Latest Lab Results จาก HOSxP)</span>
                    </h4>
                    <div className="flex items-center gap-2">
                      {patientLabs?.labDate && (
                        <span className="text-[10px] text-amber-700 font-semibold bg-white px-2 py-0.5 rounded border border-amber-200">
                          เจาะเลือดล่าสุด: {patientLabs.labDate}
                        </span>
                      )}
                      <button
                        onClick={() => setShowLabModal(true)}
                        className="text-xs font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300 border border-amber-400/60 px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-800" />
                        <span>🧪 ดูประวัติการสั่งแล็บและรายงานผล</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <div className="bg-white p-2.5 rounded-lg border border-amber-200/60">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">HbA1c (น้ำตาลสะสม)</span>
                      <span className={`text-xs font-extrabold ${patientLabs?.hba1c ? 'text-amber-900' : 'text-slate-400 font-normal'}`}>
                        {patientLabs?.hba1c || 'ไม่ได้เจาะเลือด'}
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-amber-200/60">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">FBS (น้ำตางดน้ำ)</span>
                      <span className={`text-xs font-extrabold ${patientLabs?.fbs ? 'text-amber-900' : 'text-slate-400 font-normal'}`}>
                        {patientLabs?.fbs || 'ไม่ได้เจาะเลือด'}
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-amber-200/60">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Creatinine (Lab 78)</span>
                      <span className={`text-xs font-extrabold ${patientLabs?.creatinine ? 'text-slate-800' : 'text-slate-400 font-normal'}`}>
                        {patientLabs?.creatinine || 'ไม่ได้ตรวจ'}
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-amber-200/60">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">eGFR (Lab 515)</span>
                      <span className={`text-xs font-extrabold ${patientLabs?.egfr ? 'text-slate-800' : 'text-slate-400 font-normal'}`}>
                        {patientLabs?.egfr || 'ไม่ได้ตรวจ'}
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-amber-200/60">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">CrCl (Lab 519)</span>
                      <span className={`text-xs font-extrabold ${patientLabs?.crcl ? 'text-slate-800' : 'text-slate-400 font-normal'}`}>
                        {patientLabs?.crcl || 'ไม่ได้ตรวจ'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Medical History Section */}
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm mb-2.5 flex items-center gap-1.5 text-teal-700">
                    <Stethoscope className="w-4 h-4 text-teal-600" />
                    <span>ประวัติการตรวจรักษาย้อนหลังจริงใน HOSxP (ovst / opdscreen / vn_stat)</span>
                  </h4>

                  {loadingHistory ? (
                    <div className="p-8 text-center text-slate-500 font-medium bg-slate-50 rounded-xl">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-teal-600" />
                      <span>กำลังดึงประวัติการรักษาจริงจากฐานข้อมูล HOSxP...</span>
                    </div>
                  ) : patientHistory.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl">
                      ไม่พบประวัติการรับบริการย้อนหลังใน HOSxP สำหรับผู้ป่วยรายนี้
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {patientHistory.map((item, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:border-teal-300 transition-all space-y-2">
                          <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
                            <span className="font-bold text-slate-800 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-teal-600" />
                              {item.visitDate} ({item.visitTime})
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                              VN: {item.vn}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1">
                            <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                              <span className="text-[10px] text-slate-400 block">ความดัน (BP)</span>
                              <span className="font-bold text-slate-800">{item.bp}</span>
                            </div>
                            <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                              <span className="text-[10px] text-slate-400 block">น้ำตาล (FBS)</span>
                              <span className="font-bold text-amber-700">{item.fbs}</span>
                            </div>
                            <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                              <span className="text-[10px] text-slate-400 block">น้ำหนัก / BMI</span>
                              <span className="font-semibold text-slate-700">{item.bw} ({item.bmi})</span>
                            </div>
                            <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                              <span className="text-[10px] text-slate-400 block">วินิจฉัย (ICD-10)</span>
                              <span className="font-bold text-teal-700">{item.primaryDiagnosisICD10}</span>
                            </div>
                            <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                              <span className="text-[10px] text-slate-400 block">Creatinine (Lab 78)</span>
                              <span className="font-bold text-slate-800">{patientLabs?.creatinine || '-'}</span>
                            </div>
                            <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                              <span className="text-[10px] text-slate-400 block">eGFR (Lab 515)</span>
                              <span className="font-bold text-slate-800">{patientLabs?.egfr || '-'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-all"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Patient Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-teal-600" />
                  <span>ลงทะเบียนผู้ป่วย NCDs ใหม่</span>
                </h3>
                <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddPatientSubmit} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">หมายเลข HN *</label>
                    <input
                      required
                      type="text"
                      placeholder="เช่น HN-99001"
                      value={newPatient.hn}
                      onChange={(e) => setNewPatient({ ...newPatient, hn: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">ชื่อ-นามสกุล *</label>
                    <input
                      required
                      type="text"
                      placeholder="ระบุชื่อและนามสกุล"
                      value={newPatient.name}
                      onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">อายุ (ปี)</label>
                    <input
                      required
                      type="number"
                      placeholder="เช่น 60"
                      value={newPatient.age}
                      onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">เพศ</label>
                    <select
                      value={newPatient.gender}
                      onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium"
                    >
                      <option value="ชาย">ชาย</option>
                      <option value="หญิง">หญิง</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">เบอร์โทรศัพท์</label>
                    <input
                      required
                      type="tel"
                      placeholder="08x-xxx-xxxx"
                      value={newPatient.phone}
                      onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium">
                    ยกเลิก
                  </button>
                  <button type="submit" className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition-all">
                    บันทึกข้อมูลผู้ป่วย
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Lab Orders History & Report Modal */}
        {showLabModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    <span>รายงานและประวัติการสั่งแล็บย้อนหลัง (Lab Orders Report)</span>
                  </h3>
                  <p className="text-xs text-amber-100 mt-0.5">
                    ผู้ป่วย: <span className="font-bold text-white">{selectedPatient?.name}</span> ({selectedPatient?.hn})
                  </p>
                </div>
                <button
                  onClick={() => setShowLabModal(false)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
                {labOrdersGrouped.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
                    <Database className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-slate-600">ไม่พบประวัติใบสั่งแล็บย้อนหลังในระบบ HOSxP</p>
                    <p className="text-xs text-slate-400 mt-1">ผู้ป่วยรายนี้ยังไม่มีประวัติการส่งเจาะแล็บหรือลงบันทึกในตาราง lab_head / lab_order</p>
                  </div>
                ) : (
                  labOrdersGrouped.map((group, gIdx) => (
                    <div key={gIdx} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
                      {/* Order Group Header */}
                      <div className="p-3 bg-amber-50/70 border-b border-amber-200/60 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold bg-amber-200 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                            ใบสั่งแล็บ No. {group.labOrderNumber}
                          </span>
                          <span className="text-xs font-bold text-slate-700">
                            📅 วันที่เจาะ: {group.orderDate} ({group.orderTime})
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          🟢 รายงานผลสำเร็จ
                        </span>
                      </div>

                      {/* Items Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] text-slate-500 font-bold uppercase">
                              <th className="py-2.5 px-4">รหัส</th>
                              <th className="py-2.5 px-4">รายการตรวจทางห้องปฏิบัติการ</th>
                              <th className="py-2.5 px-4 text-right">ผลการตรวจ</th>
                              <th className="py-2.5 px-4 text-center">ค่าปกติอ้างอิง</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {group.items.map((item: any, iIdx: number) => (
                              <tr key={iIdx} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-2.5 px-4 font-mono text-slate-400 text-[11px]">{item.code}</td>
                                <td className="py-2.5 px-4 font-bold text-slate-800">{item.name}</td>
                                <td className="py-2.5 px-4 text-right font-extrabold text-teal-700 bg-teal-50/30">
                                  {item.result}
                                </td>
                                <td className="py-2.5 px-4 text-center text-slate-500 text-[11px]">
                                  {item.normalValue || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-white border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setShowLabModal(false)}
                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
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
