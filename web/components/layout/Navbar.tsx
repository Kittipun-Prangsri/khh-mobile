'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HeartHandshake, LayoutDashboard, Database, Users, Calendar, PhoneCall, MessageSquare, BookOpen, BarChart3, Upload, Settings, LogOut } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'หน้าแรก', icon: LayoutDashboard },
    { href: '/registry', label: 'ทะเบียน & ติดตาม', icon: Database },
    { href: '/patients', label: 'ทะเบียนผู้ป่วย', icon: Users },
    { href: '/appointments', label: 'นัดหมาย', icon: Calendar },
    { href: '/follow-ups', label: 'งานติดตาม', icon: PhoneCall },
    { href: '/reply', label: 'Reply', icon: MessageSquare, badge: 3 },
    { href: '/education', label: 'คำแนะนำสุขภาพ', icon: BookOpen },
    { href: '/reports', label: 'รายงาน', icon: BarChart3 },
    { href: '/imports', label: 'นำเข้า Excel', icon: Upload },
  ];

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 px-4 md:px-6 py-3 flex items-center justify-between shadow-sm">
      {/* Brand Logo */}
      <Link href="/dashboard" className="flex items-center gap-2.5 group shrink-0">
        <div className="p-2 rounded-xl bg-teal-600 text-white shadow-md transition-all group-hover:scale-105 group-hover:bg-teal-500">
          <HeartHandshake className="w-5 h-5" />
        </div>
        <div>
          <span className="font-extrabold text-sm tracking-wide text-slate-800 group-hover:text-teal-700 transition-colors">KHH SAFE-CONNECT</span>
          <span className="block text-[9px] text-teal-600 font-bold uppercase tracking-wider leading-none">NCDs Care Platform</span>
        </div>
      </Link>

      {/* Main Nav Links */}
      <div className="hidden xl:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname?.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all relative ${
                isActive
                  ? 'bg-teal-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:bg-white hover:text-teal-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full flex items-center justify-center animate-pulse">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Right Side: Profile Info & Actions */}
      <div className="flex items-center gap-3">
        {/* User Card */}
        <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
          <div className="text-right hidden md:block">
            <span className="block text-xs font-bold text-slate-800">กิตติพงษ์ แก้วมณี</span>
            <span className="block text-[9px] text-teal-600 font-medium">พยาบาลวิชาชีพ (Nurse)</span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-xs font-bold text-teal-700">
            กแก
          </div>
        </div>

        {/* Settings button */}
        <Link
          href="/settings"
          className={`p-2 rounded-xl border transition-all ${
            pathname?.startsWith('/settings')
              ? 'bg-teal-600 text-white border-teal-600'
              : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-teal-700'
          }`}
          title="ตั้งค่าระบบ"
        >
          <Settings className="w-4 h-4" />
        </Link>

        {/* Logout */}
        <Link
          href="/"
          className="p-2 rounded-xl border border-rose-100 bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all"
          title="ออกจากระบบ"
        >
          <LogOut className="w-4 h-4" />
        </Link>
      </div>
    </nav>
  );
}
