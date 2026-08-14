'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, LogOut, Settings } from 'lucide-react';
import { PRESET_USERS, UserProfile } from '@/lib/rbac';
import { extractThaiInitials } from '@/lib/userProvisioningService';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [user, setUser] = useState<UserProfile>(PRESET_USERS.nurse);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('khh_user_session');
      if (saved) {
        try {
          setUser(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  return (
    <header className="bg-white border-b border-slate-200/80 px-4 py-3 lg:px-8 lg:py-4 flex items-center justify-between shadow-sm shrink-0 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 lg:hidden transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
          title="เปิดเมนู"
          aria-label="เปิดเมนูนำทาง"
        >
          <Menu className="w-5 h-5 stroke-[2.2]" aria-hidden="true" />
        </button>

        <span className="hidden sm:inline-flex text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200/60 px-2.5 py-1 rounded-md">
          เครือข่ายบริการปฐมภูมิ
        </span>
        <span className="hidden sm:inline text-xs text-slate-300 font-medium">|</span>
        <span className="text-xs text-slate-600 font-bold truncate max-w-[140px] sm:max-w-none">
          รพ.คลองหาด (KHH)
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Active User RBAC Card */}
        <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl">
          <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
            {extractThaiInitials(user.name, user.role)}
          </div>
          <div className="text-left hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="block text-xs font-bold text-slate-800 leading-tight">{user.name}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="เชื่อมต่อข้อมูล opduser_Ncd สด" />
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded border ${user.badgeColor}`}>
                {user.roleLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Settings button */}
        <Link
          href="/settings"
          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-teal-700 transition-all shadow-sm"
          title="ตั้งค่าระบบและสิทธิ์ผู้ใช้งาน"
        >
          <Settings className="w-4 h-4" />
        </Link>

        {/* Logout button */}
        <Link
          href="/"
          onClick={() => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('khh_user_session');
            }
          }}
          className="p-2 rounded-xl border border-rose-100 bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all"
          title="ออกจากระบบ"
        >
          <LogOut className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}
