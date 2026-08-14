'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import FloatingStaffChatWidget from './FloatingStaffChatWidget';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="bg-slate-50 min-h-screen flex text-slate-800 antialiased overflow-hidden">
      {/* Sidebar */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto">{children}</main>

        {/* Floating Quick Staff Chat Widget */}
        <FloatingStaffChatWidget />
      </div>
    </div>
  );
}
