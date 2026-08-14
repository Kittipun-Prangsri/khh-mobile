'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  MessageSquare,
  Send,
  Clock,
  Search,
  Filter,
  AlertCircle,
  HeartHandshake,
  RefreshCw,
  Database,
  CheckCircle2,
  Info,
  Stethoscope,
  Pill,
  Brain,
  Utensils,
  Building2,
  UserCheck,
  Sparkles,
  Inbox,
} from 'lucide-react';
import { maskName } from '@/lib/pdpaMasking';

interface ChatMessage {
  id: string;
  sender: 'staff' | 'patient';
  senderName: string;
  staffRole?: string;
  text: string;
  time: string;
  isInternal?: boolean;
}

interface Conversation {
  id: string;
  patientName: string;
  hn: string;
  phone?: string;
  subject: string;
  category: string;
  department: 'nurse' | 'pharmacist' | 'psychiatrist' | 'public_health' | 'dietitian';
  priority: 'urgent' | 'high' | 'normal';
  status?: 'pending' | 'replied';
  lastRepliedByName?: string | null;
  lastRepliedByRole?: string | null;
  lastRepliedAt?: string | null;
  unreadCount: number;
  lastMessageTime: string;
  messages: ChatMessage[];
}

export default function ReplyPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [inputText, setInputText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInfoBanner, setShowInfoBanner] = useState(true);
  const [sendSuccessToast, setSendSuccessToast] = useState<string | null>(null);

  // Multi-Disciplinary Staff Role State
  const [selectedRole, setSelectedRole] = useState<'nurse' | 'pharmacist' | 'psychiatrist' | 'public_health' | 'dietitian'>('nurse');
  const [staffNameInput, setStaffNameInput] = useState('กิตติพงษ์ แก้วมณี');
  const [activeDeptFilter, setActiveDeptFilter] = useState<'all' | 'nurse' | 'pharmacist' | 'psychiatrist' | 'public_health' | 'dietitian'>('all');

  const staffRoles = [
    {
      id: 'nurse',
      label: 'พยาบาลวิชาชีพ',
      icon: Stethoscope,
      color: 'from-teal-500 to-emerald-600',
      badgeBg: 'bg-teal-50 text-teal-700 border-teal-200',
      activeBtn: 'bg-teal-600 text-white shadow-teal-500/20',
      titlePrefix: 'พว.',
      defaultDept: 'คลินิก NCDs / พยาบาลผู้ดูแล',
    },
    {
      id: 'pharmacist',
      label: 'เภสัชกร',
      icon: Pill,
      color: 'from-blue-500 to-indigo-600',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      activeBtn: 'bg-blue-600 text-white shadow-blue-500/20',
      titlePrefix: 'ภก.',
      defaultDept: 'งานเภสัชกรรม / ให้คำปรึกษาด้านยา',
    },
    {
      id: 'psychiatrist',
      label: 'จิตเวช / สุขภาพจิต',
      icon: Brain,
      color: 'from-purple-500 to-pink-600',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
      activeBtn: 'bg-purple-600 text-white shadow-purple-500/20',
      titlePrefix: 'นักจิตวิทยา/เจ้าหน้าที่',
      defaultDept: 'คลินิกสุขภาพจิตและผู้ป่วยเรื้อรัง',
    },
    {
      id: 'public_health',
      label: 'นักวิชาการสาธารณสุข',
      icon: Building2,
      color: 'from-amber-500 to-orange-600',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      activeBtn: 'bg-amber-600 text-white shadow-amber-500/20',
      titlePrefix: 'นักวิชาการ สส.',
      defaultDept: 'กลุ่มงานส่งเสริมสุขภาพและป้องกันโรค',
    },
    {
      id: 'dietitian',
      label: 'นักโภชนาการ',
      icon: Utensils,
      color: 'from-emerald-500 to-teal-700',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      activeBtn: 'bg-emerald-600 text-white shadow-emerald-500/20',
      titlePrefix: 'นักโภชนาการ',
      defaultDept: 'คลินิกปรับเปลี่ยนพฤติกรรมและโภชนบำบัด',
    },
  ] as const;

  // Role-Specific Quick Message Templates
  const roleTemplates: Record<string, string[]> = {
    nurse: [
      'ยินดีให้ข้อมูลค่ะ รพ.คลองหาดยินดีดูแลตลอดยินดีต้อนรับค่ะ',
      'รับทราบการขอเลื่อนนัด เดี๋ยวพยาบาลปรับวันนัดในระบบ HOSxP ให้นะคะ',
      'พรุ่งนี้มีนัดเจาะเลือด กรุณางดน้ำและอาหารหลัง 20:00 น. คืนนี้นะคะ',
      'หากมีอาการผิดปกติ เช่น หายใจเหนื่อย หรือความดันสูงเกิน 160/100 ให้มาพบแพทย์ทันทีค่ะ',
    ],
    pharmacist: [
      'รับประทานยาตามที่แพทย์สั่งหลังอาหารทันทีนะคะ หากมีอาการเวียนศีรษะให้จิบน้อยๆ แล้วโทรแจ้งเภสัช',
      'ยาลดระดับน้ำตาลในเลือดรับประทานก่อนอาหาร 15 นาทีนะคะ ห้ามลืมทานอาหารหลังทานยาเด็ดขาดค่ะ',
      'ตรวจสอบรายการยาเดิมแล้ว มีตัวอย่างยาเพียงพอถึงวันนัดถัดไป ไม่ต้องกังวลนะคะ',
      'หากลืมรับประทานยา ให้ทานทันทีที่นึกได้ แต่ถ้าใกล้ถึงมื้อถัดไปให้ข้ามมื้อที่ลืมไปเลยค่ะ',
    ],
    psychiatrist: [
      'สวัสดิ์ดีค่ะ ทีมงานสุขภาพจิตยินดีรับฟังและพร้อมให้คำปรึกษาส่งต่อเสมอนะคะ',
      'ลองทำแบบประเมินความเครียด 2Q เบื้องต้น: ช่วง 2 สัปดาห์นี้มีรู้สึกเบื่อ ทำอะไรก็ไม่สนุกไหมคะ',
      'แนะนำฝึกหายใจเข้าลึกๆ 4 วินาที กลั้นไว้ 4 วินาที และผ่อนลมหายใจออกช้าๆ 6 วินาที เพื่อลดความกังวลนะคะ',
      'หากรู้สึกไม่สบายใจหรือต้องการพูดคุยด่วน สามารถติดต่อสายด่วนสุขภาพจิต 1323 หรือคลินิกรพ.ได้เลยค่ะ',
    ],
    public_health: [
      'แนะนำการปรับพฤติกรรมสุขภาพ: ออกกำลังกายแอโรบิกเบาๆ วันละ 30 นาที สัปดาห์ละ 5 วันนะคะ',
      'อย่าลืมเข้ารับการตรวจคัดกรองแทรกซ้อนเบาหวานเข้าตาและตรวจเท้าประจำปีที่คลินิก NCDs นะคะ',
      'หลีกเลี่ยงการดื่มเครื่องดื่มแอลกอฮอล์และงดสูบบุหรี่ เพื่อลดความเสี่ยงโรคหลอดเลือดหัวใจค่ะ',
      'ขอเชิญร่วมกิจกรรมกลุ่มสนับสนุนผู้ป่วยเบาหวาน-ความดันในวันนัดถัดไปที่ห้องประชุมชั้น 2 นะคะ',
    ],
    dietitian: [
      'คำแนะนำโภชนาการ: ลดหวาน มัน เค็ม ทานผักใบเขียวเพิ่มขึ้นในทุกมื้ออาหารนะคะ',
      'สำหรับผู้ป่วยโรคไต (CKD) แนะนำหลีกเลี่ยงผลไม้โพแทสเซียมสูง เช่น กล้วย ส้ม ทุเรียน และลดน้ำซุปเข้มข้นค่ะ',
      'จำกัดปริมาณโซเดียมไม่เกิน 1 ช้อนชาต่อวัน ชิมก่อนปรุงและหลีกเลี่ยงอาหารแปรรูปนะคะ',
      'แนะนำทานข้าวกล้องสลับข้าวขาว และแบ่งมื้ออาหารเป็น 3 มื้อหลักย่อย เพื่อคุมระดับน้ำตาลสะสม (HbA1c)',
    ],
  };

  // Fetch real HOSxP & Supabase registry patients
  const fetchLiveHosxpConversations = async (searchQuery: string = '') => {
    setLoading(true);
    try {
      const url = searchQuery
        ? `/api/hosxp/conversations?search=${encodeURIComponent(searchQuery)}`
        : '/api/hosxp/conversations';

      const res = await fetch(url);
      const data = await res.json();

      if (data.success && Array.isArray(data.conversations) && data.conversations.length > 0) {
        // Tag conversations with departments based on category/clinic cause
        const tagged: Conversation[] = data.conversations.map((c: any, index: number) => {
          let dept: Conversation['department'] = 'nurse';
          if (c.category.includes('ยา') || index % 5 === 1) dept = 'pharmacist';
          else if (c.category.includes('จิต') || index % 5 === 2) dept = 'psychiatrist';
          else if (c.category.includes('โภชนาการ') || index % 5 === 3) dept = 'dietitian';
          else if (c.category.includes('ส่งเสริม') || index % 5 === 4) dept = 'public_health';

          return { ...c, department: dept };
        });

        setConversations(tagged);
        if (!activeChat || !tagged.some((item) => item.id === activeChat.id)) {
          setActiveChat(tagged[0]);
        }
      } else {
        setConversations([]);
        setActiveChat(null);
      }
    } catch (error) {
      console.error('Error fetching live HOSxP conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLiveHosxpConversations(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const currentRoleConfig = staffRoles.find((r) => r.id === selectedRole) || staffRoles[0];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat) return;

    setSending(true);

    const fullRoleLabel = `${currentRoleConfig.titlePrefix}${staffNameInput} (${currentRoleConfig.label})`;

    const newMessage: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'staff',
      senderName: fullRoleLabel,
      staffRole: currentRoleConfig.label,
      text: inputText,
      time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      isInternal: isInternalNote,
    };

    // If NOT an internal note, send real LINE message to patient via Push API
    if (!isInternalNote) {
      try {
        const res = await fetch('/api/notify/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hn: activeChat.hn,
            lineUserId: (activeChat as any).lineUserId,
            patientName: activeChat.patientName,
            messageText: inputText,
            staffRole: currentRoleConfig.label,
            staffName: `${currentRoleConfig.titlePrefix}${staffNameInput}`,
          }),
        });

        const data = await res.json();
        if (data.status === 'success') {
          if (data.result?.quotaExceeded) {
            setSendSuccessToast(`💬 บันทึกข้อความการตอบกลับในระบบเรียบร้อยแล้ว (LINE Push ติดโควตาประจำเดือน)`);
          } else {
            setSendSuccessToast(`💬 ส่งข้อความตอบกลับถึงคุณ ${activeChat.patientName} (${activeChat.hn}) ผ่าน LINE เรียบร้อยแล้ว!`);
          }
        } else {
          setSendSuccessToast(data.message || `⚠️ บันทึกการตอบกลับในระบบเรียบร้อยแล้ว`);
        }
        setTimeout(() => setSendSuccessToast(null), 5000);
      } catch (err) {
        console.error('Error pushing LINE message:', err);
      }
    } else {
      setSendSuccessToast(`🔒 บันทึกโน้ตภายในเฉพาะเจ้าหน้าที่เรียบร้อยแล้ว`);
      setTimeout(() => setSendSuccessToast(null), 3000);
    }

    const updated = conversations.map((c) => {
      if (c.id === activeChat.id) {
        return {
          ...c,
          unreadCount: 0,
          status: 'replied' as const,
          lastRepliedByName: `${currentRoleConfig.titlePrefix}${staffNameInput}`,
          lastRepliedByRole: currentRoleConfig.label,
          lastRepliedAt: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          messages: [...c.messages, newMessage],
        };
      }
      return c;
    });

    setConversations(updated);
    setActiveChat({
      ...activeChat,
      status: 'replied' as const,
      lastRepliedByName: `${currentRoleConfig.titlePrefix}${staffNameInput}`,
      lastRepliedByRole: currentRoleConfig.label,
      lastRepliedAt: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      messages: [...activeChat.messages, newMessage],
    });
    setInputText('');
    setSending(false);
  };

  const handleClearAllUnread = async () => {
    try {
      await fetch('/api/hosxp/conversations/unread-count', { method: 'POST' });
      const nowStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
      const cleared = conversations.map((c) => ({
        ...c,
        unreadCount: 0,
        status: 'replied' as const,
        lastRepliedByName: c.lastRepliedByName || `${currentRoleConfig.titlePrefix}${staffNameInput}`,
        lastRepliedByRole: c.lastRepliedByRole || currentRoleConfig.label,
        lastRepliedAt: c.lastRepliedAt || nowStr,
      }));
      setConversations(cleared);
      if (activeChat) {
        setActiveChat({
          ...activeChat,
          unreadCount: 0,
          status: 'replied' as const,
          lastRepliedByName: activeChat.lastRepliedByName || `${currentRoleConfig.titlePrefix}${staffNameInput}`,
          lastRepliedByRole: activeChat.lastRepliedByRole || currentRoleConfig.label,
          lastRepliedAt: activeChat.lastRepliedAt || nowStr,
        });
      }
      setSendSuccessToast('✓ เคลียร์รายการแจ้งเตือนทั้งหมดเรียบร้อยแล้ว');
      setTimeout(() => setSendSuccessToast(null), 3000);
    } catch (err) {
      console.warn('Error clearing all unread:', err);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.hn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = activeDeptFilter === 'all' || c.department === activeDeptFilter;

    return matchesSearch && matchesDept;
  });

  const communicationSummary = {
    total: conversations.length,
    unread: conversations.reduce((total, chat) => total + chat.unreadCount, 0),
    urgent: conversations.filter((chat) => chat.priority === 'urgent' || chat.priority === 'high').length,
    showing: filteredConversations.length,
  };

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto flex flex-col h-[calc(100vh-64px)] sm:h-[calc(100vh-80px)] md:h-[calc(100vh-90px)] space-y-3 md:space-y-4">
        {/* Communication Command Center */}
        <section className="relative overflow-hidden rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-50 via-white to-cyan-50/80 p-4 shadow-sm md:p-5">
          <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-teal-300/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/4 h-40 w-40 rounded-full bg-cyan-200/30 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-2.5 py-1 text-[9px] font-extrabold tracking-wider text-emerald-700 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                MULTI-DISCIPLINARY · LINE CONNECTED
              </div>
              <h1 className="flex items-center gap-2.5 text-lg font-black tracking-tight text-slate-800 md:text-2xl">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/20">
                  <MessageSquare className="h-5 w-5" />
                </span>
                <span>ศูนย์สื่อสารสหวิชาชีพและตอบกลับผู้ป่วย</span>
              </h1>
              <p className="mt-1.5 text-[11px] font-medium text-slate-500 md:text-xs">
                Multi-Disciplinary Staff Chat Hub · ตอบกลับ LINE ผู้ป่วยและประสานทีมดูแลในจุดเดียว
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { label: 'บทสนทนาทั้งหมด', value: communicationSummary.total, icon: MessageSquare, tone: 'bg-teal-100 text-teal-700' },
                  { label: 'ยังไม่ได้อ่าน', value: communicationSummary.unread, icon: AlertCircle, tone: 'bg-blue-100 text-blue-700' },
                  { label: 'ต้องติดตามด่วน', value: communicationSummary.urgent, icon: HeartHandshake, tone: 'bg-rose-100 text-rose-700' },
                  { label: 'รายการที่แสดง', value: communicationSummary.showing, icon: Filter, tone: 'bg-violet-100 text-violet-700' },
                ].map((stat) => {
                  const StatIcon = stat.icon;
                  return (
                    <div key={stat.label} className="rounded-2xl border border-white/90 bg-white/75 px-3 py-2 shadow-sm backdrop-blur">
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500">
                        <span className={`flex h-5 w-5 items-center justify-center rounded-md ${stat.tone}`}><StatIcon className="h-3 w-3" /></span>
                        {stat.label}
                      </div>
                      <p className="mt-1 text-lg font-black leading-none text-slate-800">{loading ? '—' : stat.value}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => fetchLiveHosxpConversations(searchTerm)}
              className="flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer border border-slate-200"
            >
              <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${loading ? 'animate-spin text-teal-600' : ''}`} />
              <span className="hidden sm:inline">โหลดข้อความสด HOSxP</span>
            </button>
            <button
              onClick={() => setShowInfoBanner(!showInfoBanner)}
              className="flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-xl text-[11px] sm:text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">คู่มือการใช้งาน</span>
            </button>
            </div>
          </div>
        </section>

        {/* Staff Role Selector Bar */}
        <div className="bg-slate-900 text-white p-3 sm:p-3.5 rounded-2xl shadow-md border border-slate-800 flex flex-col gap-2 sm:gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400 shrink-0" />
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">เลือกบทบาทวิชาชีพ (Staff Role):</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-extrabold text-teal-200 hidden sm:inline">ผู้ตอบกลับ:</span>
                  <input
                    type="text"
                    value={staffNameInput}
                    onChange={(e) => setStaffNameInput(e.target.value)}
                    placeholder="ชื่อเจ้าหน้าที่..."
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white placeholder-slate-500 font-bold focus:outline-none focus:border-teal-500 w-36 sm:w-44"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {staffRoles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id as any)}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                    isSelected
                      ? `${role.activeBtn} border-transparent scale-105 shadow-md`
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>{role.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Success Toast Notification */}
        {sendSuccessToast && (
          <div className="p-3 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg flex items-center justify-between animate-bounce">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>{sendSuccessToast}</span>
            </div>
            <button onClick={() => setSendSuccessToast(null)} className="text-emerald-200 hover:text-white text-xs font-bold">
              ✕
            </button>
          </div>
        )}

        {/* Chat Interface Container */}
        <div className="flex-1 bg-white border border-slate-200/80 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-sm min-h-0">
          {/* Left Sidebar: Conversations & Department Filter */}
          <div className="w-full md:w-80 lg:w-88 shrink-0 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col bg-slate-50/50 max-h-[35vh] md:max-h-none overflow-hidden md:overflow-visible">
            {/* Search & Dept Filter Tabs */}
            <div className="p-3 border-b border-slate-200 space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อผู้ป่วย, HN, หรือเรื่องสอบถาม..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Department Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto text-[10px] pt-1">
                <button
                  onClick={() => setActiveDeptFilter('all')}
                  className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeDeptFilter === 'all'
                      ? 'bg-slate-800 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  ทั้งหมด ({conversations.length})
                </button>
                {staffRoles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setActiveDeptFilter(r.id as any)}
                    className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                      activeDeptFilter === r.id
                        ? 'bg-teal-700 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleClearAllUnread}
                  className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-bold border border-rose-200 transition-all cursor-pointer whitespace-nowrap ml-auto"
                  title="ล้างสถานะข้อความค้างตอบกลับทั้งหมดเป็นรับทราบแล้ว"
                >
                  ✓ เคลียร์แจ้งเตือน
                </button>
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto text-teal-600" />
                  <p>กำลังดึงรายการข้อความสดจาก HOSxP...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 flex flex-col items-center justify-center gap-2 text-center">
                  <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-300">
                    <Inbox className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-500">ไม่พบรายการสนทนาในแผนกนี้</p>
                </div>
              ) : (
                filteredConversations.map((chat) => {
                  const deptConfig = staffRoles.find((r) => r.id === chat.department) || staffRoles[0];
                  const DeptIcon = deptConfig.icon;
                  const isActive = activeChat?.id === chat.id;
                  const maskedName = maskName(chat.patientName);
                  const priorityBar =
                    chat.priority === 'urgent' ? 'bg-rose-500' : chat.priority === 'high' ? 'bg-amber-500' : 'bg-transparent';

                  return (
                    <div
                      key={chat.id}
                      onClick={() => setActiveChat(chat)}
                      className={`group relative flex gap-2.5 p-3.5 pl-2.5 cursor-pointer transition-all hover:bg-slate-100/60 ${
                        isActive ? 'bg-teal-50/80' : ''
                      }`}
                    >
                      <span className={`w-1 shrink-0 rounded-full ${isActive ? 'bg-teal-600' : priorityBar}`} />

                      <div className="w-9 h-9 rounded-full bg-teal-600/10 text-teal-700 border border-teal-200 flex items-center justify-center font-black text-xs shrink-0">
                        {maskedName.trim().charAt(0) || '?'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <span className="font-bold text-slate-800 text-xs truncate">{maskedName}</span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-0.5 shrink-0">
                            <Clock className="w-2.5 h-2.5" />
                            {chat.lastMessageTime}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] text-teal-600 font-mono font-bold truncate">{chat.hn}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold flex items-center gap-1 border shrink-0 ${deptConfig.badgeBg}`}
                          >
                            <DeptIcon className="w-2.5 h-2.5" />
                            <span>{deptConfig.label}</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-xs text-slate-600 truncate font-medium">{chat.subject}</p>
                          {chat.unreadCount > 0 && (
                            <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-extrabold flex items-center justify-center">
                              {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="pt-0.5">
                          {chat.lastRepliedByName ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md truncate max-w-full">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span>ตอบแล้วโดย: {chat.lastRepliedByRole ? `${chat.lastRepliedByRole} ` : ''}{chat.lastRepliedByName} ({chat.lastRepliedAt || 'ล่าสุด'})</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-md">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                              <span>🔴 รอการตอบกลับ</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>


          {/* Right Area: Active Chat Window */}
          {activeChat ? (
            <div className="flex-1 flex flex-col bg-white">
              {/* Active Chat Header */}
              <div className="p-3.5 border-b border-slate-200 space-y-2 bg-slate-50/50">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <span>{maskName(activeChat.patientName)}</span>
                      <span className="text-xs font-mono text-teal-600 font-bold">({activeChat.hn})</span>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200 flex items-center gap-1">
                        <Database className="w-3 h-3" /> HOSxP Live
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{activeChat.subject}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-xl border flex items-center gap-1.5 ${currentRoleConfig.badgeBg}`}>
                      {React.createElement(currentRoleConfig.icon, { className: 'w-3.5 h-3.5' })}
                      <span>ผู้ตอบ: {currentRoleConfig.titlePrefix}{staffNameInput}</span>
                    </span>
                    <button
                      onClick={() => alert(`ปิดเรื่องข้อความของ "${activeChat.patientName}" (${activeChat.hn}) เรียบร้อยแล้ว`)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-semibold transition-all cursor-pointer border border-slate-200"
                    >
                      ปิดเรื่อง
                    </button>
                  </div>
                </div>

                {/* Staff Collision Prevention Status Banner */}
                {activeChat.lastRepliedByName ? (
                  <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-[11px] font-bold text-emerald-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>เคสนี้ได้รับการตอบกลับแล้วโดย: <strong className="text-emerald-950 font-extrabold">{activeChat.lastRepliedByRole ? `${activeChat.lastRepliedByRole} ` : ''}{activeChat.lastRepliedByName}</strong></span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-normal shrink-0">เมื่อ {activeChat.lastRepliedAt || 'ล่าสุด'} น.</span>
                  </div>
                ) : (
                  <div className="bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl text-[11px] font-bold text-rose-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 animate-pulse" />
                      <span>เคสนี้ยังรอการตอบกลับจากเจ้าหน้าที่ (Pending Staff Response)</span>
                    </div>
                    <span className="text-[10px] text-rose-600 font-semibold shrink-0">โปรดเลือกบทบาทวิชาชีพแล้วพิมพ์ตอบกลับด้านล่าง</span>
                  </div>
                )}
              </div>

              {/* Messages Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30">
                {activeChat.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'staff' ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] text-slate-400 mb-1 flex items-center gap-1">
                      <span>{msg.senderName}</span>
                      <span>({msg.time})</span>
                    </span>
                    <div
                      className={`max-w-xs sm:max-w-sm md:max-w-md p-2.5 sm:p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                        msg.isInternal
                          ? 'bg-amber-50 text-amber-900 border border-amber-300 rounded-br-none'
                          : msg.sender === 'staff'
                          ? 'bg-teal-600 text-white rounded-br-none font-medium'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                      }`}
                    >
                      {msg.isInternal && (
                        <span className="block text-[9px] font-bold uppercase text-amber-700 mb-1">
                          🔒 [บันทึกภายในเจ้าหน้าที่ - ไม่ส่งไปที่ LINE]
                        </span>
                      )}
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Templates & Message Input Form */}
              <div className="p-3.5 border-t border-slate-200 bg-white space-y-2.5">
                {/* Role-Specific Template Buttons */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span>ข้อความด่วนประจำตำแหน่ง ({currentRoleConfig.label}):</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                    {(roleTemplates[selectedRole] || roleTemplates.nurse).map((tpl, i) => (
                      <button
                        key={i}
                        onClick={() => setInputText(tpl)}
                        title={tpl}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 text-slate-700 rounded-xl border border-slate-200 whitespace-nowrap cursor-pointer transition-all text-[11px]"
                      >
                        {tpl.slice(0, 35)}...
                      </button>
                    ))}
                  </div>

                  {/* Preset Flex Cards Quick Action Buttons */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-[10px]">
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">ส่งการ์ด Flex:</span>
                    <button
                      type="button"
                      onClick={() => setInputText('📅 แจ้งยืนยันวันนัดหมายและเวลาเข้าพบแพทย์เรียบร้อยแล้วค่ะ')}
                      className="px-2 py-0.5 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg border border-teal-200 font-bold whitespace-nowrap"
                    >
                      📅 แจ้งวันนัดหมาย
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputText('💊 คำแนะนำจากงานเภสัชกรรม รพ.คลองหาดเรื่องการทานยา')}
                      className="px-2 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg border border-blue-200 font-bold whitespace-nowrap"
                    >
                      💊 คำแนะนำยา
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputText('📅 เจ้าหน้าที่รับทราบคำขอนัดหมายกายภาพบำบัดเรียบร้อยแล้วค่ะ')}
                      className="px-2 py-0.5 bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-lg border border-orange-200 font-bold whitespace-nowrap"
                    >
                      📅 นัดกายภาพ
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputText('🔒 โปรดส่ง PIN- ตามด้วยเลข 4 หลักท้ายของบัตรประชาชนเพื่อปลดล็อกผลตรวจ')}
                      className="px-2 py-0.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg border border-purple-200 font-bold whitespace-nowrap"
                    >
                      🔒 รหัส PIN ผลแล็บ
                    </button>
                  </div>
                </div>

                {/* Input Form */}
                <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer whitespace-nowrap bg-slate-50 hover:bg-slate-100 px-3 py-2.5 rounded-xl border border-slate-200 transition-all">
                    <input
                      type="checkbox"
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="rounded bg-white border-slate-300 text-teal-600"
                    />
                    <span className={isInternalNote ? 'font-bold text-amber-700' : ''}>
                      {isInternalNote ? '🔒 บันทึกภายใน' : '💬 ส่งเข้า LINE'}
                    </span>
                  </label>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                      isInternalNote
                        ? `พิมพ์โน้ตบันทึกภายใน (${currentRoleConfig.label} เห็นเท่านั้น)...`
                        : `พิมพ์ข้อความส่งตรงเข้า LINE คนไข้ในฐานะ [${currentRoleConfig.titlePrefix}${staffNameInput}]...`
                    }
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
                  />

                  <button
                    type="submit"
                    disabled={sending}
                    className={`px-4 py-2.5 text-white rounded-xl shadow-md font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      isInternalNote
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-teal-600 hover:bg-teal-700'
                    }`}
                  >
                    <Send className={`w-4 h-4 ${sending ? 'animate-bounce' : ''}`} />
                    <span>{sending ? 'กำลังส่ง...' : 'ส่งข้อความ'}</span>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-300">
                <Inbox className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-slate-500">ยังไม่ได้เลือกบทสนทนา</p>
              <p className="text-xs text-slate-400 max-w-[220px]">
                เลือกรายการผู้ป่วยทางด้านซ้ายเพื่อเริ่มอ่านและตอบกลับข้อความ
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
