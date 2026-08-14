'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, X, ChevronRight, Stethoscope, Pill, Apple, Brain, Building2, Sparkles, Send } from 'lucide-react';

export default function FloatingStaffChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(3);

  useEffect(() => {
    async function fetchUnreadCount() {
      try {
        const res = await fetch('/api/hosxp/conversations/unread-count');
        const data = await res.json();
        if (data.success && typeof data.count === 'number') {
          setUnreadCount(data.count);
        }
      } catch (err) {
        // Fallback default badge count
      }
    }
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const handleClearUnreadCount = async () => {
    setUnreadCount(0);
    try {
      await fetch('/api/hosxp/conversations/unread-count', { method: 'POST' });
    } catch (err) {
      console.warn('Error clearing unread count:', err);
    }
  };

  const departments = [
    { id: 'nurse', label: 'พยาบาล NCDs', icon: Stethoscope, color: 'text-teal-700 bg-teal-50/90 border-teal-200 hover:bg-teal-100/90', desc: 'ติดตามเคสขาดนัด & ปรับพฤติกรรม' },
    { id: 'pharmacist', label: 'เภสัชกร', icon: Pill, color: 'text-sky-700 bg-sky-50/90 border-sky-200 hover:bg-sky-100/90', desc: 'ให้คำแนะนำการใช้ยา & ผลข้างเคียง' },
    { id: 'dietitian', label: 'นักโภชนาการ', icon: Apple, color: 'text-emerald-700 bg-emerald-50/90 border-emerald-200 hover:bg-emerald-100/90', desc: 'จัดสูตรอาหาร 2:1:1 และควบคุมคาร์บ' },
    { id: 'psychiatrist', label: 'สุขภาพจิต', icon: Brain, color: 'text-purple-700 bg-purple-50/90 border-purple-200 hover:bg-purple-100/90', desc: 'ประเมิน DMH & จัดการความเครียด' },
    { id: 'public_health', label: 'สาธารณสุข', icon: Building2, color: 'text-amber-700 bg-amber-50/90 border-amber-200 hover:bg-amber-100/90', desc: 'ประสานงาน รพ.สต. และลงพื้นที่' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {/* Floating Chat Quick Popover Panel */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden transform transition-all animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Popover Header */}
          <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/20 rounded-2xl backdrop-blur-md">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm tracking-tight flex items-center gap-1.5">
                  <span>ศูนย์สื่อสารข้อความทีมสหวิชาชีพ</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                </h4>
                <p className="text-[11px] text-teal-100">LINE OA Web Reply Hub (รพ.คลองหาด)</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/20 text-white transition-all cursor-pointer"
              title="ปิดเมนูด่วน"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Department Selector */}
          <div className="p-4 space-y-2.5 max-h-80 overflow-y-auto">
            <div className="flex justify-between items-center px-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">เลือกช่องทางตอบกลับผู้ป่วยตามทีม</span>
              {unreadCount > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] bg-rose-500 text-white font-bold px-2 py-0.5 rounded-full animate-bounce">
                    {unreadCount} ข้อความใหม่
                  </span>
                  <button
                    type="button"
                    onClick={handleClearUnreadCount}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded-md border border-slate-300 transition-all cursor-pointer"
                    title="ล้างตัวเลขแจ้งเตือนทั้งหมด"
                  >
                    ✓ เคลียร์
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              {departments.map((dept) => {
                const Icon = dept.icon;
                return (
                  <Link
                    key={dept.id}
                    href={`/reply?role=${dept.id}`}
                    onClick={() => setIsOpen(false)}
                    className={`group p-3 rounded-2xl border transition-all flex items-center justify-between ${dept.color}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white shadow-sm">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-xs group-hover:text-teal-800 transition-colors">
                          {dept.label}
                        </div>
                        <div className="text-[10px] text-slate-500">{dept.desc}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Popover Footer Button */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <span className="text-[11px] text-slate-500 font-medium">ตอบกลับผู้ป่วยผ่าน LINE ได้ทันที</span>
            <Link
              href="/reply"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>เปิดกล่องข้อความทั้งหมด</span>
              <Send className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group p-4 rounded-full bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 text-white shadow-2xl hover:shadow-teal-500/40 hover:scale-105 active:scale-95 transition-all transform cursor-pointer flex items-center justify-center border-2 border-white/40"
        title="ศูนย์สื่อสารสหวิชาชีพ (Quick Staff Chat Hub)"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageSquare className="w-6 h-6" />
        )}

        {/* Pulse Unread Badge */}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-rose-600 text-white text-[10px] font-extrabold items-center justify-center shadow">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </span>
        )}
      </button>
    </div>
  );
}
