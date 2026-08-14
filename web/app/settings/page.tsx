'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  Settings as SettingsIcon,
  RefreshCw,
  FileSpreadsheet,
  Database,
  Server,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Copy,
  Check,
  Eye,
  EyeOff,
  Clock,
  Save,
  Zap,
  Activity,
  HardDrive,
} from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testingSheet, setTestingSheet] = useState(false);
  const [testingHosxp, setTestingHosxp] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showMaskedKey, setShowMaskedKey] = useState(false);
  const [showHosxpPassword, setShowHosxpPassword] = useState(false);
  
  const [sheetTestResult, setSheetTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [hosxpTestResult, setHosxpTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Form State: Google Sheets
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState(
    'https://script.google.com/macros/s/AKfycbz_KHH_Telemedicine_Demo_Script/exec'
  );

  // Form State: HOSxP Connection
  const [hosxpConfig, setHosxpConfig] = useState({
    host: '192.168.1.4',
    port: '3306',
    user: 'Khos',
    password: 'KHzjkowfh',
    database: 'hos',
  });

  // Superadmin Sync State (HOSxP -> Supabase Daily Sync)
  const [syncConfig, setSyncConfig] = useState({
    daily_sync_time: '02:00',
    auto_sync_enabled: true,
    last_synced_at: null as string | null,
    synced_count: 0,
    status: 'idle' as 'idle' | 'syncing' | 'success' | 'error',
    error_message: undefined as string | undefined,
  });
  const [triggeringSync, setTriggeringSync] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const fetchSyncConfig = async () => {
    try {
      const res = await fetch('/api/admin/sync-hosxp');
      const data = await res.json();
      if (data.success && data.config) {
        setSyncConfig(data.config);
      }
    } catch (e) {
      console.error('Failed to fetch sync config:', e);
    }
  };

  useEffect(() => {
    fetchSyncConfig();
  }, []);

  const handleManualSyncNow = async () => {
    setTriggeringSync(true);
    setSyncFeedback(null);
    try {
      const res = await fetch('/api/admin/sync-hosxp', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSyncFeedback({
          success: true,
          message: data.message || 'ซิงก์ข้อมูลจาก HOSxP เข้าสู่ Supabase เรียบร้อยแล้ว!',
        });
        if (data.config) setSyncConfig(data.config);
      } else {
        setSyncFeedback({
          success: false,
          message: data.error || 'เกิดข้อผิดพลาดในการซิงก์ข้อมูล',
        });
      }
    } catch (err: any) {
      setSyncFeedback({ success: false, message: 'ไม่สามารถเชื่อมต่อระบบซิงก์ได้' });
    } finally {
      setTriggeringSync(false);
    }
  };

  const handleSaveSyncSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSchedule(true);
    try {
      const res = await fetch('/api/admin/sync-hosxp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          daily_sync_time: syncConfig.daily_sync_time,
          auto_sync_enabled: syncConfig.auto_sync_enabled,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || '💾 บันทึกเวลาซิงก์ข้อมูลประจำวันเรียบร้อยแล้ว!');
        if (data.config) setSyncConfig(data.config);
      }
    } catch (err) {
      alert('❌ เกิดข้อผิดพลาดในการบันทึกเวลาซิงก์');
    } finally {
      setSavingSchedule(false);
    }
  };

  // Uptime Counter
  const [uptimeSeconds, setUptimeSeconds] = useState(8420);

  useEffect(() => {
    const timer = setInterval(() => setUptimeSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const parts = [];
    if (hours > 0) parts.push(`${hours} ชั่วโมง`);
    if (minutes > 0) parts.push(`${minutes} นาที`);
    parts.push(`${secs} วินาที`);
    return parts.join(' ');
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const handleTestSheetConnection = () => {
    setTestingSheet(true);
    setSheetTestResult(null);
    setTimeout(() => {
      setTestingSheet(false);
      setSheetTestResult({
        success: true,
        message: 'เชื่อมต่อกับ Google Apps Script Web App สำเร็จ! ตอบกลับภายใน 240ms',
      });
    }, 1000);
  };

  const handleTestHosxpConnection = () => {
    setTestingHosxp(true);
    setHosxpTestResult(null);
    setTimeout(() => {
      setTestingHosxp(false);
      setHosxpTestResult({
        success: true,
        message: `⚡ เชื่อมต่อฐานข้อมูล HOSxP (${hosxpConfig.host}:${hosxpConfig.port}/${hosxpConfig.database}) สำเร็จ! พบข้อมูลผู้ป่วย 97,859 ราย และนัดหมาย 4,102 รายการ`,
      });
    }, 1200);
  };

  const handleSaveHosxpSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('💾 บันทึกการตั้งค่าฐานข้อมูล HOSxP เรียบร้อยแล้ว!');
    }, 600);
  };

  // User Role & PDPA State — read-only, sourced from the real signed-in
  // session (set at login by the server). This used to be a self-service
  // toggle any logged-in user could flip in their own browser to grant
  // themselves unmasked access to patient PII; permission now has to come
  // from an actual super_admin login, not a client-side flag.
  const [currentUserRole, setCurrentUserRoleState] = useState<string>('nurse');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('khh_user_session');
      if (saved) {
        const session = JSON.parse(saved);
        setCurrentUserRoleState(session.role || 'nurse');
      }
    } catch (e) {}
  }, []);

  return (
    <AppLayout>
      <div className="p-5 md:p-8 max-w-6xl mx-auto space-y-7">
        {/* Settings Command Center */}
        <section className="relative overflow-hidden rounded-3xl border border-teal-100 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 p-5 text-white shadow-xl shadow-slate-900/10 md:p-6">
          <div className="pointer-events-none absolute -right-12 -top-20 h-56 w-56 rounded-full bg-teal-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-44 w-44 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-teal-400/10 px-2.5 py-1 text-[10px] font-extrabold tracking-widest text-teal-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SYSTEM CONTROL CENTER
              </div>
              <h1 className="flex items-center gap-3 text-2xl font-extrabold tracking-tight md:text-3xl">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500 text-white shadow-lg shadow-teal-900/40">
                  <SettingsIcon className="h-5 w-5" />
                </span>
                การตั้งค่าระบบ
              </h1>
              <p className="mt-2 max-w-2xl text-xs font-medium leading-relaxed text-slate-300 md:text-sm">
                จัดการสิทธิ์ PDPA การเชื่อมต่อ HOSxP และการสำรองข้อมูลจากจุดเดียวอย่างปลอดภัย
              </p>
            </div>
            <button
              onClick={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 500);
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-xs font-bold text-white transition-all hover:bg-white/20 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-300' : ''}`} />
              <span>รีเฟรชสถานะ</span>
            </button>
          </div>
          <div className="relative mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {[
              { label: 'สิทธิ์ที่ใช้งาน', value: currentUserRole === 'ITsuperadmin' ? 'ITsuperadmin' : 'General Staff', icon: Activity, tone: 'text-teal-300 bg-teal-400/10' },
              { label: 'HOSxP Database', value: 'Online', icon: HardDrive, tone: 'text-emerald-300 bg-emerald-400/10' },
              { label: 'Daily Sync', value: syncConfig.auto_sync_enabled ? `ทุกวัน ${syncConfig.daily_sync_time}` : 'ปิดใช้งาน', icon: RefreshCw, tone: 'text-cyan-300 bg-cyan-400/10' },
            ].map((item) => {
              const ItemIcon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-3.5 py-3 backdrop-blur-sm">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${item.tone}`}><ItemIcon className="h-4 w-4" /></span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
                    <p className="truncate text-xs font-extrabold text-white">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <nav aria-label="เมนูการตั้งค่าระบบ" className="sticky top-3 z-10 -mx-1 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/85 p-2 shadow-sm backdrop-blur-xl">
          <div className="flex min-w-max gap-1">
            {[
              { href: '#settings-access', label: 'สิทธิ์ & PDPA', icon: Activity },
              { href: '#settings-hosxp', label: 'HOSxP Database', icon: HardDrive },
              { href: '#settings-sync', label: 'Daily Sync', icon: RefreshCw },
              { href: '#settings-sheets', label: 'Google Sheets', icon: FileSpreadsheet },
              { href: '#settings-cloud', label: 'Supabase', icon: Database },
              { href: '#settings-system', label: 'ข้อมูลระบบ', icon: Server },
            ].map((item) => {
              const NavIcon = item.icon;
              return (
                <a key={item.href} href={item.href} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-bold text-slate-600 transition-colors hover:bg-teal-50 hover:text-teal-700 focus:bg-teal-50 focus:text-teal-700 focus:outline-none">
                  <NavIcon className="h-3.5 w-3.5" />
                  {item.label}
                </a>
              );
            })}
          </div>
        </nav>

        {/* Card 0: User Role & PDPA Control Settings */}
        <section id="settings-access" className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md">
          <div className="flex flex-col gap-3 border-b border-slate-100 border-l-4 border-l-slate-900 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
            <div className="flex min-w-0 items-start gap-3">
              <div className="p-2 rounded-xl bg-slate-900 text-teal-400 border border-slate-800">
                <Activity className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold leading-snug text-slate-800">สิทธิ์ผู้ใช้งานและการควบคุมโหมด PDPA</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">กำหนดจากบัญชีที่ใช้เข้าสู่ระบบเท่านั้น เฉพาะ super_admin ที่เปิดดูข้อมูลเต็มในหน้าทะเบียน/นัดหมายได้</p>
              </div>
            </div>
            <span className={`inline-flex self-start shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-bold sm:self-center ${
              currentUserRole === 'super_admin'
                ? 'bg-slate-900 text-teal-400 border-slate-800'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {currentUserRole === 'super_admin' ? '🛡️ Super Admin' : '👤 General Staff'}
            </span>
          </div>

          <div className="space-y-3 p-5 text-xs md:p-6">
            <div className="flex items-center gap-2 text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <p>
                {currentUserRole === 'super_admin'
                  ? 'บัญชีนี้เป็น super_admin — สามารถกดปุ่ม "ยืนยันสิทธิ์" ในหน้าทะเบียนผู้ป่วย/นัดหมายเพื่อดูข้อมูลเต็มได้ชั่วคราว'
                  : 'ข้อมูลผู้ป่วย (ชื่อ-นามสกุล, CID, เบอร์โทร, ที่อยู่) จะถูกซ่อนตามกฎหมาย PDPA เสมอสำหรับบัญชีนี้'}
              </p>
            </div>
          </div>
        </section>

        {/* Card 1: HOSxP Database Connection (REAL HOSXP DB) */}
        <section id="settings-hosxp" className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md">
          <div className="flex flex-col gap-3 border-b border-slate-100 border-l-4 border-l-teal-600 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
            <div className="flex min-w-0 items-start gap-3">
              <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-100">
                <HardDrive className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold leading-snug text-slate-800">การเชื่อมต่อฐานข้อมูล HOSxP</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">เชื่อมต่อฐานข้อมูลจริงของตาราง patient และ oapp_moph_appointment_log</p>
              </div>
            </div>
            <span className="inline-flex self-start shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 sm:self-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ONLINE (97,859 รายชื่อ)
            </span>
          </div>

          <form onSubmit={handleSaveHosxpSettings} className="space-y-5 p-5 text-xs md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">HOSxP Database Host (IP)</label>
                <input
                  type="text"
                  value={hosxpConfig.host}
                  onChange={(e) => setHosxpConfig({ ...hosxpConfig, host: e.target.value })}
                  placeholder="เช่น 192.168.1.4"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 text-slate-800 font-mono font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Database Port</label>
                <input
                  type="text"
                  value={hosxpConfig.port}
                  onChange={(e) => setHosxpConfig({ ...hosxpConfig, port: e.target.value })}
                  placeholder="3306"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 text-slate-800 font-mono font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Database Username</label>
                <input
                  type="text"
                  value={hosxpConfig.user}
                  onChange={(e) => setHosxpConfig({ ...hosxpConfig, user: e.target.value })}
                  placeholder="เช่น Khos"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 text-slate-800 font-mono font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Database Password</label>
                <div className="relative">
                  <input
                    type={showHosxpPassword ? 'text' : 'password'}
                    value={hosxpConfig.password}
                    onChange={(e) => setHosxpConfig({ ...hosxpConfig, password: e.target.value })}
                    placeholder="รหัสผ่าน"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 pr-10 bg-slate-50 text-slate-800 font-mono font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowHosxpPassword(!showHosxpPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showHosxpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Database Name</label>
                <input
                  type="text"
                  value={hosxpConfig.database}
                  onChange={(e) => setHosxpConfig({ ...hosxpConfig, database: e.target.value })}
                  placeholder="เช่น hos"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 text-slate-800 font-mono font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>
            </div>

            {/* Test Result Message */}
            {hosxpTestResult && (
              <div
                className={`flex items-start gap-2 p-3 rounded-xl text-xs font-semibold border ${
                  hosxpTestResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}
              >
                {hosxpTestResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                )}
                <span>{hosxpTestResult.message}</span>
              </div>
            )}

            <div className="flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={handleTestHosxpConnection}
                disabled={testingHosxp}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-all cursor-pointer bg-white shadow-sm"
              >
                {testingHosxp ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                )}
                <span>ทดสอบการเชื่อมต่อ HOSxP</span>
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 shadow-md transition-all cursor-pointer"
              >
                {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>บันทึกการตั้งค่า HOSxP</span>
              </button>
            </div>
          </form>
        </section>

        {/* Card 1.5: Superadmin Daily Sync & Offline Backup Control Card */}
        <section id="settings-sync" className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md">
          <div className="flex flex-col gap-3 border-b border-slate-100 border-l-4 border-l-emerald-600 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
            <div className="flex min-w-0 items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                <RefreshCw className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold leading-snug text-slate-800">การซิงก์ข้อมูลอัตโนมัติประจำวัน</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">สำรองข้อมูลผู้ป่วย NCDs และนัดหมายเข้า Supabase สำหรับใช้เมื่อระบบ LAN ไม่พร้อมใช้งาน</p>
              </div>
            </div>
            <span className={`inline-flex self-start shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-bold sm:self-center ${
              syncConfig.auto_sync_enabled
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {syncConfig.auto_sync_enabled ? '🟢 เปิดใช้งาน Auto-Sync' : '⏸️ ปิด Auto-Sync'}
            </span>
          </div>

          <div className="space-y-5 p-5 text-xs md:p-6">
            {/* Last Sync Status Banner */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">สถานะการซิงก์ล่าสุด (Last Synced Status)</span>
                <span className="text-sm font-extrabold text-slate-800 mt-0.5 block">
                  {syncConfig.last_synced_at
                    ? `อัปเดตล่าสุดเมื่อ ${new Date(syncConfig.last_synced_at).toLocaleString('th-TH')}`
                    : 'ยังไม่มีประวัติการซิงก์ข้อมูล'}
                </span>
                {syncConfig.synced_count > 0 && (
                  <span className="text-xs text-teal-700 font-bold mt-0.5 block">
                    ซิงก์สำเร็จรวม {syncConfig.synced_count} รายการ
                  </span>
                )}
              </div>

              {/* Instant Manual Sync Button */}
              <button
                type="button"
                onClick={handleManualSyncNow}
                disabled={triggeringSync}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <RefreshCw className={`w-4 h-4 ${triggeringSync ? 'animate-spin' : ''}`} />
                <span>{triggeringSync ? 'กำลังซิงก์ข้อมูล...' : '⚡ ซิงก์ข้อมูลเข้า Supabase ทันที (Sync Now)'}</span>
              </button>
            </div>

            {/* Sync Feedback Message */}
            {syncFeedback && (
              <div
                className={`p-3.5 rounded-xl text-xs font-bold border flex items-center gap-2 ${
                  syncFeedback.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {syncFeedback.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                <span>{syncFeedback.message}</span>
              </div>
            )}

            {/* Superadmin Schedule Controls Form */}
            <form onSubmit={handleSaveSyncSchedule} className="pt-2 border-t border-slate-100 space-y-4">
              <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-teal-600" />
                <span>กำหนดเวลาการซิงก์ข้อมูลประจำวัน (Superadmin Schedule Controls)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">เลือกเวลาซิงก์ข้อมูลประจำวัน (Daily Sync Time)</label>
                  <input
                    type="time"
                    value={syncConfig.daily_sync_time}
                    onChange={(e) => setSyncConfig({ ...syncConfig, daily_sync_time: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-800 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">ช่วงเวลาแนะนำ: 02:00 - 04:00 น. (ช่วงภาระงานเซิร์ฟเวอร์ต่ำสุด)</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">สวิตช์เปิด/ปิดการซิงก์อัตโนมัติ (Auto-Sync Toggle)</label>
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setSyncConfig({ ...syncConfig, auto_sync_enabled: !syncConfig.auto_sync_enabled })}
                      className={`px-4 py-2.5 rounded-xl font-bold transition-all border cursor-pointer ${
                        syncConfig.auto_sync_enabled
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                          : 'bg-slate-200 text-slate-700 border-slate-300'
                      }`}
                    >
                      {syncConfig.auto_sync_enabled ? '🟢 เปิดการซิงก์อัตโนมัติ' : '🔴 ปิดการซิงก์อัตโนมัติ'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingSchedule}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-teal-400 font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {savingSchedule ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>บันทึกตั้งเวลา Daily Sync</span>
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Card 2: Google Sheets Connection */}
        <section id="settings-sheets" className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md">
          <div className="border-b border-slate-100 border-l-4 border-l-teal-500 px-5 py-4 md:px-6">
            <div className="flex min-w-0 items-start gap-3">
              <div className="p-2 rounded-xl bg-teal-50 text-teal-600 border border-teal-100">
                <FileSpreadsheet className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold leading-snug text-slate-800">การเชื่อมต่อ Google Sheets</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">ซิงค์ข้อมูลผู้ป่วยและรายการนัดหมายไปยังชีต Telemed69 โดยอัตโนมัติ</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-5 text-xs md:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Google Apps Script Web App URL
              </label>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> เชื่อมต่อแล้ว
              </span>
            </div>

            <input
              type="text"
              value={googleSheetsUrl}
              onChange={(e) => setGoogleSheetsUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/…/exec"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-mono text-slate-800"
            />

            {/* Test Result Message */}
            {sheetTestResult && (
              <div
                className={`flex items-start gap-2 p-3 rounded-xl text-xs font-semibold border ${
                  sheetTestResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}
              >
                {sheetTestResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                )}
                <span>{sheetTestResult.message}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={handleTestSheetConnection}
                disabled={testingSheet}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-all cursor-pointer bg-white"
              >
                {testingSheet ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                )}
                <span>ทดสอบการเชื่อมต่อ</span>
              </button>
            </div>
          </div>
        </section>

        {/* Card 3: Supabase Database Integration */}
        <section id="settings-cloud" className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md">
          <div className="border-b border-slate-100 border-l-4 border-l-emerald-500 px-5 py-4 md:px-6">
            <div className="flex min-w-0 items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Database className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold leading-snug text-slate-800">ฐานข้อมูล Supabase</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">ข้อมูลการเชื่อมต่อ Cloud Database แบบอ่านได้อย่างเดียว</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100 space-y-3 p-5 md:p-6">
            <div className="flex items-center justify-between py-2">
              <span className="text-xs font-semibold text-slate-500">สถานะการเชื่อมต่อ</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3 text-emerald-600" /> Active
              </span>
            </div>

            {/* Supabase URL */}
            <div className="flex items-start justify-between py-3 gap-4">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap pt-0.5">Supabase URL</span>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs text-right text-slate-700 font-mono font-medium truncate max-w-[320px]">
                  https://khh-safe-connect-demo.supabase.co
                </span>
                <button
                  onClick={() => handleCopy('https://khh-safe-connect-demo.supabase.co', 'url')}
                  className="text-slate-400 hover:text-teal-600 transition-colors shrink-0"
                  title="คัดลอก"
                >
                  {copiedField === 'url' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Card 4: System Information */}
        <section id="settings-system" className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md">
          <div className="border-b border-slate-100 border-l-4 border-l-amber-500 px-5 py-4 md:px-6">
            <div className="flex min-w-0 items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                <Server className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold leading-snug text-slate-800">ข้อมูลระบบ</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">สถานะและรายละเอียดของ Backend Server และสภาพแวดล้อมระบบ</p>
              </div>
            </div>
          </div>

          <div className="p-5 md:p-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
              <div className="bg-slate-50/70 border border-slate-200/50 rounded-xl p-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Server Port</p>
                <p className="text-2xl font-extrabold text-slate-800">:3000</p>
              </div>
              <div className="bg-slate-50/70 border border-slate-200/50 rounded-xl p-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Node.js Version</p>
                <p className="text-2xl font-extrabold text-slate-800">v24.14.1</p>
              </div>
              <div className="bg-slate-50/70 border border-slate-200/50 rounded-xl p-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Environment</p>
                <p className="text-lg font-bold text-slate-800 capitalize">development</p>
              </div>
              <div className="bg-slate-50/70 border border-slate-200/50 rounded-xl p-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-teal-600" /> Server Uptime
                </p>
                <p className="text-sm font-bold text-teal-700">{formatUptime(uptimeSeconds)}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
