'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { ShieldCheck, RefreshCw, Clock, Monitor, LogIn, Lock } from 'lucide-react';

interface LoginActivityRow {
  id: string;
  loginname: string;
  name: string;
  role: string;
  source: string;
  ip_address: string;
  user_agent: string;
  logged_in_at: string;
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'ผู้ดูแลระบบ (IT)',
  doctor: 'แพทย์',
  nurse: 'พยาบาล',
  staff: 'เจ้าหน้าที่',
  executive: 'ผู้บริหาร',
};

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<LoginActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/hosxp/activity-log', { cache: 'no-store' });
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : {};

      if (res.status === 403) {
        setForbidden(true);
        return;
      }
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'ไม่สามารถโหลดประวัติการเข้าใช้งานได้');
      }
      setLogs(data.logs || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl lg:text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-teal-600" />
              ประวัติการเข้าใช้งานระบบ
            </h1>
            <p className="text-xs text-slate-500 mt-1">ใครเข้าสู่ระบบ เมื่อไหร่ และผ่านช่องทางไหนบ้าง</p>
          </div>
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            รีเฟรช
          </button>
        </div>

        {forbidden ? (
          <div className="bg-white border border-rose-200 rounded-2xl p-10 text-center space-y-2">
            <Lock className="w-10 h-10 text-rose-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700">หน้านี้สำหรับผู้ดูแลระบบ (Super Admin) เท่านั้น</p>
            <p className="text-xs text-slate-500">บัญชีของคุณไม่มีสิทธิ์ดูประวัติการเข้าใช้งาน</p>
          </div>
        ) : errorMsg ? (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-700 font-medium">
            {errorMsg}
          </div>
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wide">
                    <th className="text-left font-bold px-4 py-3">เวลาเข้าสู่ระบบ</th>
                    <th className="text-left font-bold px-4 py-3">ชื่อผู้ใช้งาน</th>
                    <th className="text-left font-bold px-4 py-3">Username</th>
                    <th className="text-left font-bold px-4 py-3">บทบาท</th>
                    <th className="text-left font-bold px-4 py-3">ช่องทางยืนยันตัวตน</th>
                    <th className="text-left font-bold px-4 py-3">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={6} className="px-4 py-3">
                          <div className="h-4 bg-slate-100 rounded animate-pulse" />
                        </td>
                      </tr>
                    ))
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                        <LogIn className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        ยังไม่มีประวัติการเข้าใช้งาน
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(log.logged_in_at).toLocaleString('th-TH', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{log.name}</td>
                        <td className="px-4 py-3 text-slate-500">{log.loginname}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex text-[10px] font-bold px-2 py-1 rounded-md bg-teal-50 text-teal-700 border border-teal-200/60">
                            {ROLE_LABELS[log.role] || log.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{log.source}</td>
                        <td className="px-4 py-3 text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <Monitor className="w-3.5 h-3.5 text-slate-400" />
                            {log.ip_address}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
