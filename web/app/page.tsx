'use client';

import React, { useState } from 'react';
import { Shield, Lock, User, Activity, ArrowRight, HeartHandshake, AlertCircle, Database, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password) {
      setErrorMsg('กรุณากรอก ชื่อผู้ใช้งาน (Username) และ รหัสผ่าน (Password)');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/hosxp/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      // Read as text first — an interrupted connection (e.g. the dev server
      // reloading mid-request) can leave the body empty or truncated, which
      // makes res.json() throw a raw, meaningless error straight at the user.
      const raw = await res.text();
      let data: any = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        throw new Error('การเชื่อมต่อกับเซิร์ฟเวอร์ขาดหาย กรุณาลองเข้าสู่ระบบอีกครั้ง');
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'ไม่สามารถเข้าสู่ระบบได้ กรุณาตรวจสอบชื่อผู้ใช้และรหัสผ่าน');
      }

      // The server already set an httpOnly session cookie on this response —
      // that's what actually gates access. localStorage here is just for
      // client-side UI display (e.g. the header's name/role badge).
      if (typeof window !== 'undefined') {
        localStorage.setItem('khh_user_session', JSON.stringify(data.user));
      }

      // Honor the page the user was originally trying to reach (set by
      // middleware when it redirected an unauthenticated request here).
      // Only allow relative paths, to avoid an open-redirect.
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get('redirectTo');
      window.location.href = redirectTo && redirectTo.startsWith('/') ? redirectTo : '/dashboard';
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์กับฐานข้อมูล HOSxP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen bg-slate-50">
      {/* Left Banner: Brand Atmosphere */}
      <div className="md:w-1/2 flex flex-col justify-between p-8 md:p-16 bg-gradient-to-br from-slate-900 via-teal-900 to-slate-950 text-white relative overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl" />

        {/* Top Brand Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500 text-white shadow-lg">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-wider text-white">KHH SAFE-CONNECT</h1>
            <span className="text-[10px] text-teal-300 font-bold uppercase tracking-widest block">NCDs Care & Requisition Portal</span>
          </div>
        </div>

        {/* Middle Value Proposition */}
        <div className="relative z-10 my-12 space-y-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Database className="w-3.5 h-3.5 text-emerald-400" /> เชื่อมต่อฐานข้อมูล HOSxP opduser สด 100%
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
            เข้าสู่ระบบด้วยบัญชี HOSxP <br />
            <span className="text-teal-400">ของโรงพยาบาลคลองหาด</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-300 max-w-md leading-relaxed">
            เจ้าหน้าที่ แพทย์ พยาบาล และผู้ดูแลระบบ สามารถใช้ ชื่อผู้ใช้งาน (loginname) และ รหัสผ่าน เดียวกับที่ขึ้นเวรใช้งาน HOSxP เพื่อเข้าสู่ระบบได้ทันที
          </p>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-[11px] text-slate-400 flex items-center justify-between border-t border-white/10 pt-4">
          <span>โรงพยาบาลคลองหาด (KHH Hospital)</span>
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" /> HOSxP Auth Active
          </span>
        </div>
      </div>

      {/* Right Form: Login Card */}
      <div className="md:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xl space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">เข้าสู่ระบบ (Sign In)</h3>
            <p className="text-xs text-slate-500 mt-1">ยืนยันตัวตนผ่านตาราง opduser ของระบบ HOSxP</p>
          </div>

          {/* Error Message Box */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="font-medium">{errorMsg}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อผู้ใช้งาน HOSxP (Username / Login Name)</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="เช่น 0816 หรือ loginname"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">รหัสผ่าน HOSxP (Password)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="กรอกรหัสผ่าน HOSxP"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>กำลังตรวจสอบสิทธิ์กับฐานข้อมูล HOSxP...</span>
              ) : (
                <>
                  <span>เข้าสู่ระบบด้วย HOSxP Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              * หากไม่สามารถเข้าสู่ระบบได้ กรุณาติดต่อผู้ดูแลระบบ IT โรงพยาบาลคลองหาดเพื่อเปิดใช้งานสิทธิ์ `opduser`
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
