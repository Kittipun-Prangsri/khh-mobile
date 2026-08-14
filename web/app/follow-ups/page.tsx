'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  PhoneCall,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  Check,
  X,
  ShieldAlert,
  MessageSquare,
  RefreshCw,
  Send,
  CalendarDays,
  FileSpreadsheet,
} from 'lucide-react';

interface FollowUpTask {
  id: string;
  hn: string;
  patientName: string;
  phone: string;
  taskType: 'โทรยืนยันนัด' | 'ติดตามขาดนัด' | 'ติดตามการใช้ยา' | 'ติดตามอาการ';
  assignedTo: string;
  dueDate: string;
  priority: 'urgent' | 'high' | 'normal';
  status: 'todo' | 'in_progress' | 'completed';
  clinic?: string;
  doctor?: string;
  overdueDays?: number;
  overdueStatusText?: string;
}

export default function FollowUpsPage() {
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedTaskType, setSelectedTaskType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState<FollowUpTask | null>(null);
  const [rescheduleTask, setRescheduleTask] = useState<FollowUpTask | null>(null);
  const [newDate, setNewDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<FollowUpTask[]>([]);

  // New task form state
  const [newTask, setNewTask] = useState<{
    hn: string;
    patientName: string;
    phone: string;
    taskType: FollowUpTask['taskType'];
    assignedTo: string;
    dueDate: string;
    priority: FollowUpTask['priority'];
  }>({
    hn: '',
    patientName: '',
    phone: '',
    taskType: 'ติดตามขาดนัด',
    assignedTo: 'กิตติพงษ์ (พยาบาลวิชาชีพ)',
    dueDate: 'วันนี้ 16:00',
    priority: 'high',
  });

  // Fetch Live Real HOSxP Missed Appointments & Tasks
  const fetchLiveHosxpTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hosxp/follow-ups');
      const data = await res.json();
      if (data.success && Array.isArray(data.tasks)) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error('❌ Failed to fetch HOSxP follow-ups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveHosxpTasks();
  }, []);

  const filteredTasks = tasks.filter((t) => {
    const matchesPriority = selectedPriority === 'all' || t.priority === selectedPriority;
    const matchesType = selectedTaskType === 'all' || t.taskType === selectedTaskType;
    return matchesPriority && matchesType;
  });

  const handleSendLineReminder = async (task: FollowUpTask) => {
    try {
      await fetch('/api/notify/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'Uf636cf9137cbd32ff2c18773591be46a',
          patientName: task.patientName,
          hn: task.hn,
          appointmentDate: 'วันพรุ่งนี้ 08:30 น.',
          appointmentTime: '08:30 น.',
          clinic: task.clinic || 'คลินิก NCDs โรงพยาบาลคลองหาด',
          doctor: task.doctor || 'พญ. วรรณภา จิตดี',
        }),
      });
      alert(`💬 ส่งการ์ด LINE แจ้งเตือนไปยังคุณ "${task.patientName}" สำเร็จ!`);
    } catch (err) {
      alert('❌ ไม่สามารถส่ง LINE ได้ โปรดตรวจสอบคีย์ LINE API');
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleTask) return;

    const formattedDate = new Date(newDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });

    // Update local task list
    setTasks(tasks.map(t => t.id === rescheduleTask.id ? { ...t, status: 'completed', dueDate: `เลื่อนนัดเป็น ${formattedDate}` } : t));

    // Send updated LINE Flex Card to patient
    try {
      await fetch('/api/notify/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reschedule_success',
          patientName: rescheduleTask.patientName,
          hn: rescheduleTask.hn,
          appointmentDate: formattedDate,
          appointmentTime: '08:30 น.',
          clinic: rescheduleTask.clinic || 'คลินิก NCDs โรงพยาบาลคลองหาด',
          doctor: rescheduleTask.doctor || 'พญ. วรรณภา จิตดี (แพทย์ประจำคลินิก NCDs)',
        }),
      });
    } catch (err) {
      console.error('LINE alert error:', err);
    }

    setRescheduleTask(null);
    alert(`📅 เลื่อนนัดหมายให้คุณ "${rescheduleTask.patientName}" เป็นวันที่ ${formattedDate} และส่งการ์ดยืนยันวันนัดใหม่ (พร้อมปุ่ม Google Calendar) ทาง LINE เรียบร้อย!`);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.hn || !newTask.patientName) return;

    const created: FollowUpTask = {
      id: Date.now().toString(),
      hn: newTask.hn.startsWith('HN-') ? newTask.hn : `HN-${newTask.hn}`,
      patientName: newTask.patientName,
      phone: newTask.phone || '081-999-8888',
      taskType: newTask.taskType,
      assignedTo: newTask.assignedTo,
      dueDate: newTask.dueDate,
      priority: newTask.priority,
      status: 'todo',
    };

    setTasks([created, ...tasks]);
    setShowCreateModal(false);
    setNewTask({
      hn: '',
      patientName: '',
      phone: '',
      taskType: 'ติดตามขาดนัด',
      assignedTo: 'กิตติพงษ์ (พยาบาลวิชาชีพ)',
      dueDate: 'วันนี้ 16:00',
      priority: 'high',
    });

    alert(`✅ สร้างงานติดตามผู้ป่วย "${created.patientName}" (${created.hn}) สำเร็จ!`);
  };

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <PhoneCall className="w-7 h-7 text-teal-600" />
              <span>งานติดตามผู้ป่วยขาดนัด NCDs</span>
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm flex items-center gap-1.5 mt-0.5">
              <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span>ตรวจจับผู้ป่วยขาดนัดเฉพาะคลินิก NCDs (เบาหวาน, ความดัน, CKD, COPD, Stroke) จากระบบ HOSxP</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLiveHosxpTasks}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-600' : ''}`} />
              <span>ดึงคนไข้ขาดนัด HOSxP สด</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>สร้างงานติดตาม</span>
            </button>
          </div>
        </div>

        {/* Priority & Type Filters Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Task Type Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            <span className="text-xs text-slate-500 font-semibold mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> ประเภทงาน:
            </span>
            {[
              { code: 'all', label: 'ทั้งหมด' },
              { code: 'ติดตามขาดนัด', label: '🔴 ขาดนัดตรวจ' },
              { code: 'โทรยืนยันนัด', label: '📞 โทรยืนยันนัด' },
              { code: 'ติดตามการใช้ยา', label: '💊 ติดตามยา' },
              { code: 'ติดตามอาการ', label: '🩺 ติดตามอาการ' },
            ].map((t) => (
              <button
                key={t.code}
                onClick={() => setSelectedTaskType(t.code)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  selectedTaskType === t.code
                    ? 'bg-teal-600 text-white shadow-sm font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Priority Filters */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">ความด่วน:</span>
            {[
              { code: 'all', label: 'ทั้งหมด' },
              { code: 'urgent', label: 'ด่วนที่สุด' },
              { code: 'high', label: 'ด่วน' },
              { code: 'normal', label: 'ปกติ' },
            ].map((p) => (
              <button
                key={p.code}
                onClick={() => setSelectedPriority(p.code)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedPriority === p.code
                    ? 'bg-slate-800 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* High-Efficiency Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full py-16 text-center text-slate-500 font-medium bg-white rounded-2xl border border-slate-200">
              <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-2 text-teal-600" />
              <span>กำลังดึงรายการผู้ป่วยขาดนัดจากระบบ HOSxP...</span>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              ไม่พบงานติดตามตามเงื่อนไขที่เลือก
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`p-5 rounded-2xl bg-white border shadow-sm flex flex-col justify-between space-y-4 hover-grow transition-all ${
                  task.status === 'completed' ? 'opacity-60 border-slate-200 bg-slate-50/50' : 'border-slate-200/80 hover:border-teal-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-teal-600 font-mono font-bold">{task.hn}</span>
                    <h3 className="font-extrabold text-slate-800 text-base">{task.patientName}</h3>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      task.priority === 'urgent' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      task.priority === 'high' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-teal-50 text-teal-700 border border-teal-200'
                    }`}
                  >
                    {task.priority === 'urgent' ? '🔴 ด่วนที่สุด' : task.priority === 'high' ? '🟡 ด่วน' : '🟢 ปกติ'}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">ประเภทงาน:</span>
                    <span className="font-bold text-teal-700">{task.taskType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">คลินิก / แพทย์:</span>
                    <span className="text-slate-700 font-medium">{task.clinic || 'ตรวจโรคทั่วไป'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">สถานะเลยกำหนด:</span>
                    <span className="text-rose-600 font-extrabold">{task.overdueStatusText || task.dueDate}</span>
                  </div>
                </div>

                {/* High-Efficiency Quick Action Bar */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-1.5">
                  <a
                    href={`tel:${task.phone}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white rounded-lg text-xs font-bold transition-all border border-teal-200 shadow-sm"
                    title="โทรหาผู้ป่วยทันที"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>โทร</span>
                  </a>

                  <button
                    onClick={() => handleSendLineReminder(task)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-lg text-xs font-bold transition-all border border-emerald-200 shadow-sm cursor-pointer"
                    title="ส่งการ์ด LINE Flex Message เตือนคนไข้"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>ส่ง LINE</span>
                  </button>

                  <button
                    onClick={() => setRescheduleTask(task)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-lg text-xs font-bold transition-all border border-indigo-200 shadow-sm cursor-pointer"
                    title="เลื่อนวันนัดใหม่ทันที"
                  >
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>เลื่อนนัด</span>
                  </button>

                  <button
                    onClick={() => setShowLogModal(task)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    บันทึกผล
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reschedule Modal */}
        {rescheduleTask && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-indigo-600" />
                  <span>เลื่อนวันนัดหมายสำหรับ {rescheduleTask.patientName}</span>
                </h3>
                <button onClick={() => setRescheduleTask(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRescheduleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">เลือกวันนัดหมายใหม่</label>
                  <input
                    required
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium"
                  />
                </div>

                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-2 text-indigo-800">
                  <MessageSquare className="w-4 h-4 shrink-0 text-indigo-600" />
                  <span>ระบบจะส่งการ์ดแจ้งวันนัดใหม่ไปยัง LINE ผู้ป่วยให้อัตโนมัติหลังบันทึก</span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button type="button" onClick={() => setRescheduleTask(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium">
                    ยกเลิก
                  </button>
                  <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all">
                    บันทึกเลื่อนวันนัด
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Follow-up Task Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-teal-600" />
                  <span>สร้างงานติดตามผู้ป่วยใหม่ (New Follow-up Task)</span>
                </h3>
                <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">หมายเลข HN</label>
                    <input
                      required
                      type="text"
                      placeholder="เช่น HN-98302"
                      value={newTask.hn}
                      onChange={(e) => setNewTask({ ...newTask, hn: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">ชื่อ-นามสกุล ผู้ป่วย</label>
                    <input
                      required
                      type="text"
                      placeholder="เช่น นายสมชาย ดีเลิศ"
                      value={newTask.patientName}
                      onChange={(e) => setNewTask({ ...newTask, patientName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">เบอร์โทรศัพท์ติดต่อ</label>
                    <input
                      required
                      type="text"
                      placeholder="เช่น 081-234-5678"
                      value={newTask.phone}
                      onChange={(e) => setNewTask({ ...newTask, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">ประเภทงานติดตาม</label>
                    <select
                      value={newTask.taskType}
                      onChange={(e) => setNewTask({ ...newTask, taskType: e.target.value as FollowUpTask['taskType'] })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium"
                    >
                      <option value="ติดตามขาดนัด">ติดตามขาดนัด</option>
                      <option value="โทรยืนยันนัด">โทรยืนยันนัด</option>
                      <option value="ติดตามการใช้ยา">ติดตามการใช้ยา</option>
                      <option value="ติดตามอาการ">ติดตามอาการ</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">ระดับความด่วน</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as FollowUpTask['priority'] })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold"
                    >
                      <option value="urgent">🔴 ด่วนที่สุด (Urgent)</option>
                      <option value="high">🟡 ด่วน (High)</option>
                      <option value="normal">🟢 ปกติ (Normal)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">กำหนดเวลาติดตาม</label>
                    <input
                      required
                      type="text"
                      placeholder="เช่น วันนี้ 16:00 น."
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-medium cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>สร้างงานติดตาม</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Log Contact Result Modal */}
        {showLogModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <PhoneCall className="w-5 h-5 text-teal-600" />
                  <span>บันทึกผลการติดตาม ({showLogModal.patientName})</span>
                </h3>
                <button onClick={() => setShowLogModal(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setTasks(tasks.map(t => t.id === showLogModal.id ? { ...t, status: 'completed' } : t));
                  setShowLogModal(null);
                  alert('✅ บันทึกผลการติดตามเรียบร้อยแล้ว!');
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">ผลการติดต่อ</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium">
                    <option value="confirmed">ผู้ป่วยรับสาย และยืนยันวันนัด</option>
                    <option value="caregiver">ญาติรับสาย และรับเรื่องไว้แล้ว</option>
                    <option value="no_answer">สายไม่ว่าง / ไม่รับสาย</option>
                    <option value="reschedule">ผู้ป่วยขอเลื่อนวันนัด</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">สรุปการสนทนา & คำแนะนำที่ให้</label>
                  <textarea rows={3} placeholder="ระบุรายละเอียดผลการโทรพูดคุย..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800" />
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowLogModal(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium">ยกเลิก</button>
                  <button type="submit" className="px-4 py-2 bg-teal-600 text-white font-bold rounded-xl shadow-md hover:bg-teal-700 transition-all">บันทึกผลติดตาม</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
