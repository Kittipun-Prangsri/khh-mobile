'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  BookOpen,
  Utensils,
  Heart,
  Pill,
  CheckCircle,
  Search,
  Plus,
  Award,
  Send,
  X,
  MessageSquare,
  User,
  History,
  CheckCircle2,
  Calendar,
  AlertCircle,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';

interface Topic {
  id: string;
  category: 'diet' | 'stress' | 'medication';
  code: string;
  title: string;
  content: string;
  targetDiseases: string[];
}

interface CounselingLog {
  id: string;
  hn: string;
  patientName: string;
  topicCode: string;
  topicTitle: string;
  category: 'diet' | 'stress' | 'medication';
  channel: 'clinic' | 'phone' | 'line';
  comprehension: 'good' | 'fair' | 'needs_followup';
  notes: string;
  givenBy: string;
  givenAt: string;
  lineNotified: boolean;
}

const DEFAULT_COUNSELING_LOGS: CounselingLog[] = [
  {
    id: 'log-1',
    hn: 'HN-98302',
    patientName: 'นายสมชาย ดีเลิศ',
    topicCode: 'DIET-DM-01',
    topicTitle: 'การควบคุมปริมาณคาร์โบไฮเดรตและดัชนีน้ำตาล (Glycemic Index)',
    category: 'diet',
    channel: 'clinic',
    comprehension: 'good',
    notes: 'ผู้ป่วยรับทราบเรื่องการลดหวาน ปรับเปลี่ยนมารับประทานข้าวกล้องและจำกัดผลไม้หวานจัด',
    givenBy: 'กิตติพงษ์ (พยาบาล NCDs)',
    givenAt: '2026-08-02 10:30 น.',
    lineNotified: true,
  },
  {
    id: 'log-2',
    hn: 'HN-85401',
    patientName: 'นางสมศรี มีสุข',
    topicCode: 'MED-DM-01',
    topicTitle: 'การทานยาเบาหวานและสังเกตอาการภาวะน้ำตาลในเลือดต่ำ (Hypoglycemia)',
    category: 'medication',
    channel: 'phone',
    comprehension: 'good',
    notes: 'โทรติดตามเรื่องการทานยาเน้นย้ำทานหลังอาหารทันทีเพื่อป้องกันภาวะน้ำตาลตก',
    givenBy: 'วรรณภา (พยาบาลวิชาชีพ)',
    givenAt: '2026-08-01 14:15 น.',
    lineNotified: true,
  },
  {
    id: 'log-3',
    hn: 'HN-77120',
    patientName: 'นายบุญมี มั่นคง',
    topicCode: 'DIET-HT-01',
    topicTitle: 'การลดโซเดียมและอาหารแปรรูป (DASH Diet)',
    category: 'diet',
    channel: 'line',
    comprehension: 'fair',
    notes: 'ส่งการ์ด DASH Diet ผ่าน LINE แนะนำชิมก่อนปรุง และลดการกินซุปแกงเข้มข้น',
    givenBy: 'กิตติพงษ์ (พยาบาล NCDs)',
    givenAt: '2026-07-30 09:00 น.',
    lineNotified: true,
  },
];

export default function EducationPage() {
  const [activeTab, setActiveTab] = useState<'diet' | 'stress' | 'medication'>('diet');
  const [showCounselingModal, setShowCounselingModal] = useState(false);
  const [selectedTopicForCounseling, setSelectedTopicForCounseling] = useState<Topic | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Counseling Modal Form State
  const [formHn, setFormHn] = useState('');
  const [formPatientName, setFormPatientName] = useState('');
  const [formChannel, setFormChannel] = useState<'clinic' | 'phone' | 'line'>('clinic');
  const [formComprehension, setFormComprehension] = useState<'good' | 'fair' | 'needs_followup'>('good');
  const [formNotes, setFormNotes] = useState('');
  const [formSendLine, setFormSendLine] = useState(true);

  // Patient Search State for Counseling Form
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [searchedPatients, setSearchedPatients] = useState<any[]>([]);
  const [searchingPatient, setSearchingPatient] = useState(false);
  const [selectedPatientForAdd, setSelectedPatientForAdd] = useState<any | null>(null);

  // Counseling History State with LocalStorage Persistence
  const [counselingLogs, setCounselingLogs] = useState<CounselingLog[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('khh_counseling_logs');
      if (saved) {
        setCounselingLogs(JSON.parse(saved));
      } else {
        setCounselingLogs(DEFAULT_COUNSELING_LOGS);
        localStorage.setItem('khh_counseling_logs', JSON.stringify(DEFAULT_COUNSELING_LOGS));
      }
    } catch (e) {
      setCounselingLogs(DEFAULT_COUNSELING_LOGS);
    }
  }, []);

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

  const topics: Topic[] = [
    {
      id: 'e1',
      category: 'diet',
      code: 'DIET-DM-01',
      title: 'การควบคุมปริมาณคาร์โบไฮเดรตและดัชนีน้ำตาล (Glycemic Index)',
      content: 'หลีกเลี่ยงน้ำหวาน ขนมหวาน ปรับเปลี่ยนมารับประทานข้าวกล้อง ขนมปังโฮลวีต และจำกัดผลไม้หวานจัดไม่เกิน 1 กำมือต่อวัน',
      targetDiseases: ['DM', 'CKD'],
    },
    {
      id: 'e2',
      category: 'diet',
      code: 'DIET-HT-01',
      title: 'การลดโซเดียมและอาหารแปรรูป (DASH Diet)',
      content: 'จำกัดเกลือไม่เกิน 1 ช้อนชาต่อวัน หลีกเลี่ยงผงชูรส บะหมี่กึ่งสำเร็จรูป อาหารหมักดอง และน้ำซุปเข้มข้น',
      targetDiseases: ['HT', 'CKD'],
    },
    {
      id: 'e3',
      category: 'stress',
      code: 'STRESS-01',
      title: 'เทคนิคการผ่อนคลายความเครียดและการนอนหลับคุณภาพ',
      content: 'ฝึกการหายใจเข้าลึกออกยาว (4-7-8 Breathing) หลีกเลี่ยงการหน้าจอสมาร์ทโฟนก่อนนอน 1 ชั่วโมง เข้านอนเวลาเดิมทุกวัน',
      targetDiseases: ['HT', 'DM', 'ASTHMA'],
    },
    {
      id: 'e4',
      category: 'medication',
      code: 'MED-DM-01',
      title: 'การทานยาเบาหวานและสังเกตอาการภาวะน้ำตาลในเลือดต่ำ (Hypoglycemia)',
      content: 'รับประทานยาตามเวลาที่แพทย์สั่ง หากมีอาการใจสั่น เหงื่อออก ตาพร่า ให้ทานอมยิ้มหรือน้ำหวาน 1/2 แก้วทันที',
      targetDiseases: ['DM'],
    },
  ];

  const filteredTopics = topics.filter((t) => t.category === activeTab);

  const handleOpenCounselingModal = (topic?: Topic) => {
    const defaultTopic = topic || filteredTopics[0] || topics[0];
    setSelectedTopicForCounseling(defaultTopic);
    setFormNotes(defaultTopic.content);
    setPatientSearchTerm('');
    setSearchedPatients([]);
    setSelectedPatientForAdd(null);
    setFormHn('');
    setFormPatientName('');
    setShowCounselingModal(true);
  };

  const handleSaveCounselingRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formHn || !formPatientName || !selectedTopicForCounseling) {
      alert('⚠️ กรุณากรอกหมายเลข HN และชื่อผู้ป่วยให้ครบถ้วน');
      return;
    }

    const now = new Date();
    const dateFormatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} น.`;

    const newLog: CounselingLog = {
      id: `log-${Date.now()}`,
      hn: formHn.startsWith('HN-') ? formHn : `HN-${formHn}`,
      patientName: formPatientName,
      topicCode: selectedTopicForCounseling.code,
      topicTitle: selectedTopicForCounseling.title,
      category: selectedTopicForCounseling.category,
      channel: formChannel,
      comprehension: formComprehension,
      notes: formNotes || selectedTopicForCounseling.content,
      givenBy: 'กิตติพงษ์ (พยาบาล NCDs)',
      givenAt: dateFormatted,
      lineNotified: formSendLine,
    };

    const updatedLogs = [newLog, ...counselingLogs];
    setCounselingLogs(updatedLogs);
    try {
      localStorage.setItem('khh_counseling_logs', JSON.stringify(updatedLogs));
    } catch (e) {
      console.error(e);
    }

    if (formSendLine) {
      try {
        await fetch('/api/notify/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'Uf636cf9137cbd32ff2c18773591be46a',
            patientName: newLog.patientName,
            hn: newLog.hn,
            appointmentDate: 'คำแนะนำสุขภาพ NCDs',
            appointmentTime: dateFormatted,
            clinic: 'คลินิก NCDs โรงพยาบาลคลองหาด',
            doctor: selectedTopicForCounseling.title,
          }),
        });
      } catch (err) {
        console.error('Error sending LINE card:', err);
      }
    }

    setShowCounselingModal(false);

    // Reset Form
    setFormHn('');
    setFormPatientName('');
    setFormNotes('');
    setSelectedPatientForAdd(null);
    setPatientSearchTerm('');

    alert(`✅ บันทึกการให้คำแนะนำ "${selectedTopicForCounseling.title}" สำหรับคุณ ${formPatientName} เรียบร้อยแล้ว! ${formSendLine ? '(ส่งการ์ดแจ้งเตือนทาง LINE เรียบร้อย)' : ''}`);
  };

  const filteredLogs = counselingLogs.filter((log) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      log.patientName.toLowerCase().includes(q) ||
      log.hn.toLowerCase().includes(q) ||
      log.topicCode.toLowerCase().includes(q) ||
      log.topicTitle.toLowerCase().includes(q)
    );
  });

  const educationSummary = {
    topics: topics.length,
    records: counselingLogs.length,
    followUps: counselingLogs.filter((log) => log.comprehension === 'needs_followup').length,
    lineSent: counselingLogs.filter((log) => log.lineNotified).length,
  };

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        {/* Education Command Center */}
        <section className="relative overflow-hidden rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-50 via-white to-cyan-50/80 p-5 shadow-sm md:p-6">
          <div className="pointer-events-none absolute -right-12 -top-20 h-56 w-56 rounded-full bg-teal-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/4 h-48 w-48 rounded-full bg-cyan-200/30 blur-3xl" />
          <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/85 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-teal-700 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                HEALTH EDUCATION &amp; COUNSELING
              </div>
              <h1 className="flex items-center gap-3 text-2xl font-extrabold tracking-tight text-slate-800 md:text-3xl">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/20">
                  <BookOpen className="h-5 w-5" />
                </span>
                <span>คลังคำแนะนำสุขภาพและการบันทึก</span>
              </h1>
              <p className="mt-2 text-xs font-medium leading-relaxed text-slate-500 md:text-sm">
                เลือกคำแนะนำมาตรฐาน บันทึกการให้คำปรึกษา และติดตามความเข้าใจของผู้ป่วย NCDs ในที่เดียว
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { label: 'หัวข้อคำแนะนำ', value: educationSummary.topics, icon: BookOpen, tone: 'bg-teal-100 text-teal-700' },
                  { label: 'บันทึกทั้งหมด', value: educationSummary.records, icon: History, tone: 'bg-indigo-100 text-indigo-700' },
                  { label: 'ต้องติดตามซ้ำ', value: educationSummary.followUps, icon: AlertCircle, tone: 'bg-rose-100 text-rose-700' },
                  { label: 'ส่ง LINE แล้ว', value: educationSummary.lineSent, icon: MessageSquare, tone: 'bg-emerald-100 text-emerald-700' },
                ].map((stat) => {
                  const StatIcon = stat.icon;
                  return (
                    <div key={stat.label} className="min-w-[118px] rounded-2xl border border-white/90 bg-white/80 px-3 py-2.5 shadow-sm backdrop-blur">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                        <span className={`flex h-5 w-5 items-center justify-center rounded-md ${stat.tone}`}><StatIcon className="h-3 w-3" /></span>
                        {stat.label}
                      </div>
                      <p className="mt-1 text-lg font-extrabold leading-none text-slate-800">{stat.value}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            <button
              onClick={() => handleOpenCounselingModal()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-teal-600/20 transition-all hover:bg-teal-700 hover:shadow-lg cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>บันทึกการให้คำแนะนำ</span>
            </button>
          </div>
        </section>

        {/* Category Tabs */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm">
          <div className="flex gap-2 overflow-x-auto">
          {[
            { id: 'diet', label: '1. การรับประทานอาหาร', icon: Utensils },
            { id: 'stress', label: '2. ความเครียดและการนอน', icon: Heart },
            { id: 'medication', label: '3. การใช้ยาและข้อควรระวัง', icon: Pill },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex min-w-max items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
          </div>
        </div>

        {/* Topics List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTopics.map((topic) => (
            <article key={topic.id} className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-900/5 flex flex-col justify-between space-y-4">
              <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-bl-[4rem] bg-teal-50 opacity-0 transition-opacity group-hover:opacity-100" />
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="rounded-md bg-teal-50 px-2 py-1 text-[10px] font-mono font-bold text-teal-700 ring-1 ring-teal-100">{topic.code}</span>
                  <div className="flex gap-1">
                    {topic.targetDiseases.map((d) => (
                      <span key={d} className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
                <h3 className="text-base font-bold leading-snug text-slate-800 mb-3">{topic.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">{topic.content}</p>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-teal-600" /> คำแนะนำมาตรฐานทางการแพทย์
                </span>
                <button
                  onClick={() => handleOpenCounselingModal(topic)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white rounded-lg text-xs font-semibold transition-all border border-teal-200 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>บันทึกส่งให้ผู้ป่วย</span>
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Counseling History Section */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <History className="w-5 h-5 text-teal-600" />
              <span>ประวัติการบันทึกการให้คำแนะนำสุขภาพล่าสุด</span>
            </h2>

            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="ค้นหาตาม HN หรือชื่อผู้ป่วย..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-1.5 pl-8 pr-3 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full whitespace-nowrap">
                รวม {filteredLogs.length} รายการ
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="p-3.5">ผู้ป่วย (HN)</th>
                    <th className="p-3.5">หมวดคำแนะนำ</th>
                    <th className="p-3.5">ช่องทางให้คำแนะนำ</th>
                    <th className="p-3.5">การรับรู้/ความเข้าใจ</th>
                    <th className="p-3.5">ผู้บันทึก & วันเวลา</th>
                    <th className="p-3.5">สถานะ LINE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        ไม่พบประวัติการให้คำแนะนำตามเงื่อนไขที่ค้นหา
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-800">{log.patientName}</div>
                          <div className="text-[10px] text-teal-600 font-mono font-bold">{log.hn}</div>
                        </td>
                        <td className="p-3.5 max-w-xs">
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-teal-50 text-teal-700 border border-teal-200">
                              {log.topicCode}
                            </span>
                            <span className="truncate">{log.topicTitle}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1 line-clamp-1 italic bg-slate-50 p-1.5 rounded border border-slate-100">
                            "{log.notes}"
                          </div>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          {log.channel === 'clinic' && <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-bold">🏥 ที่คลินิก NCDs</span>}
                          {log.channel === 'phone' && <span className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg font-bold">📞 ทางโทรศัพท์</span>}
                          {log.channel === 'line' && <span className="px-2 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg font-bold">💬 ทาง LINE OA</span>}
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          {log.comprehension === 'good' && <span className="text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> เข้าใจดีมาก</span>}
                          {log.comprehension === 'fair' && <span className="text-amber-600 font-bold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> เข้าใจปานกลาง</span>}
                          {log.comprehension === 'needs_followup' && <span className="text-rose-600 font-bold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> ต้องติดตามซ้ำ</span>}
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <div className="font-semibold text-slate-700">{log.givenBy}</div>
                          <div className="text-[10px] text-slate-400">{log.givenAt}</div>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          {log.lineNotified ? (
                            <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded-full font-bold text-[10px] flex items-center gap-1 w-max">
                              <MessageSquare className="w-3 h-3" /> ส่ง LINE แล้ว
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-full font-bold text-[10px]">
                              ไม่ได้ส่ง LINE
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Counseling Form Modal */}
        {showCounselingModal && selectedTopicForCounseling && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-teal-600" />
                  <span>บันทึกการให้คำแนะนำผู้ป่วย (Counseling Record)</span>
                </h3>
                <button onClick={() => setShowCounselingModal(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCounselingRecord} className="space-y-4 text-xs">
                {/* Topic Banner */}
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl space-y-1">
                  <div className="text-[10px] font-mono text-teal-700 font-bold">{selectedTopicForCounseling.code}</div>
                  <div className="font-bold text-teal-900 text-sm">{selectedTopicForCounseling.title}</div>
                </div>

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
                            setFormHn(p.hn);
                            setFormPatientName(p.name);
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

                {/* Patient Information Inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">หมายเลข HN ผู้ป่วย *</label>
                    <input
                      required
                      type="text"
                      placeholder="เช่น HN-98302"
                      value={formHn}
                      onChange={(e) => setFormHn(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">ชื่อ-นามสกุล ผู้ป่วย *</label>
                    <input
                      required
                      type="text"
                      placeholder="เช่น นายสมชาย ดีเลิศ"
                      value={formPatientName}
                      onChange={(e) => setFormPatientName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium"
                    />
                  </div>
                </div>

                {/* Counseling Channel & Comprehension */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">ช่องทางให้คำแนะนำ</label>
                    <select
                      value={formChannel}
                      onChange={(e) => setFormChannel(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium"
                    >
                      <option value="clinic">🏥 ที่คลินิก NCDs (Face-to-face)</option>
                      <option value="phone">📞 สนทนาทางโทรศัพท์</option>
                      <option value="line">💬 ทาง LINE OA</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">การรับรู้/ความเข้าใจของผู้ป่วย</label>
                    <select
                      value={formComprehension}
                      onChange={(e) => setFormComprehension(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold"
                    >
                      <option value="good">🟢 เข้าใจดีและพร้อมปฏิบัติตาม</option>
                      <option value="fair">🟡 เข้าใจปานกลาง</option>
                      <option value="needs_followup">🔴 ต้องติดตามซ้ำในการนัดครั้งหน้า</option>
                    </select>
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">รายละเอียดคำแนะนำ & บันทึกเพิ่มเติม</label>
                  <textarea
                    rows={3}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="ระบุคำแนะนำเฉพาะบุคคล หรือข้อตกลงในการปรับเปลี่ยนพฤติกรรม..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                  />
                </div>

                {/* Checkbox: Send LINE */}
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-emerald-900 font-bold">ส่งการ์ดคำแนะนำสุขภาพนี้เข้า LINE ผู้ป่วยทันที</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formSendLine}
                    onChange={(e) => setFormSendLine(e.target.checked)}
                    className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCounselingModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-medium cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>บันทึกคำแนะนำ</span>
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
