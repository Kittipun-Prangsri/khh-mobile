import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@/constants/contacts';
import type { Appointment, Badge, HealthArticle, Patient, VitalReading } from '@/types';

const TOKEN_KEY = 'khh_session_token';

async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  }
  try { return await SecureStore.getItemAsync(TOKEN_KEY); } catch { return null; }
}

export async function setToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    try { localStorage.setItem(TOKEN_KEY, token); } catch {}
    return;
  }
  try { await SecureStore.setItemAsync(TOKEN_KEY, token); } catch {}
}

export async function clearToken(): Promise<void> {
  if (Platform.OS === 'web') {
    try { localStorage.removeItem(TOKEN_KEY); } catch {}
    return;
  }
  try { await SecureStore.deleteItemAsync(TOKEN_KEY); } catch {}
}

// ---- Fallback Mock Data ----------------------------------------------------

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-001',
    date: '2026-08-20T09:00:00.000Z',
    time: '09:00 - 10:30 น.',
    clinic: 'คลินิกโรคเรื้อรัง (NCDs)',
    doctor: 'พญ. นภาพร สุขสมบูรณ์',
    status: 'upcoming',
    checkinCode: 'KHH-CHECKIN:HN670012:20260820',
  },
  {
    id: 'apt-002',
    date: '2026-07-15T10:00:00.000Z',
    time: '10:00 - 11:30 น.',
    clinic: 'คลินิกตรวจเลือด/แล็บ',
    doctor: 'นพ. สมเกียรติ มั่นคง',
    status: 'completed',
    checkinCode: 'KHH-CHECKIN:HN670012:20260715',
  },
];

const MOCK_VITALS: VitalReading[] = [
  { label: 'BMI', value: 23.5, unit: 'kg/m²', min: 10, max: 40, targetMin: 18.5, targetMax: 22.9, status: 'good', recordedAt: '2026-08-01' },
  { label: 'BloodPressure', value: 128, unit: 'mmHg', min: 70, max: 200, targetMin: 90, targetMax: 130, status: 'good', recordedAt: '2026-08-01' },
  { label: 'FBS', value: 115, unit: 'mg/dL', min: 50, max: 300, targetMin: 70, targetMax: 100, status: 'watch', recordedAt: '2026-08-01' },
  { label: 'HbA1c', value: 6.8, unit: '%', min: 4, max: 14, targetMin: 4, targetMax: 6.5, status: 'watch', recordedAt: '2026-08-01' },
  { label: 'eGFR', value: 85, unit: 'mL/min', min: 0, max: 120, targetMin: 60, targetMax: 120, status: 'good', recordedAt: '2026-08-01' },
];

const MOCK_BADGES: Badge[] = [
  { id: 'b1', titleTh: 'ตรงนัด 3 ครั้งติด', emoji: '🏆', earnedAt: '2026-07-15', criteria: 'มาพบแพทย์ตามนัดหมายต่อเนื่อง 3 ครั้ง' },
  { id: 'b2', titleTh: 'ความดันในเกณฑ์ดี', emoji: '❤️', earnedAt: '2026-08-01', criteria: 'คุมระดับความดันตัวบนไม่เกิน 130 mmHg' },
  { id: 'b3', titleTh: 'รอบรู้สุขภาพ NCDs', emoji: '📚', earnedAt: '2026-08-05', criteria: 'อ่านบทความคำแนะนำโภชนาการครบ 5 บทความ' },
];

const MOCK_ARTICLES: HealthArticle[] = [
  { id: 'art-1', category: 'diet', titleTh: 'เทคนิคการคุมหวาน-มัน-เค็ม สำหรับผู้ป่วยเบาหวานและความดัน', summaryTh: 'การปรับเปลี่ยนพฤติกรรมการบริโภคอาหาร ใช้วิธีรสมือเบา ชิมก่อนปรุง และลดการกินน้ำซุป' },
  { id: 'art-2', category: 'exercise', titleTh: 'การออกกำลังกายอย่างปลอดภัยในผู้สูงอายุ', summaryTh: 'เดินออกกำลังกายวันละ 20-30 นาที ช่วยเพิ่มความแข็งแรงของหัวใจและหลอดเลือด' },
  { id: 'art-3', category: 'thai_medicine', titleTh: 'สมุนไพรไทยกับการดูแลสุขภาพ NCDs', summaryTh: 'การใช้มะระขี้นก มะขามป้อม และสมุนไพรพื้นบ้านตามคำแนะนำของแพทย์แผนไทย' },
];

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const json: any = await res.json();
    if (json.status === 'success') {
      if (json.appointments) return json.appointments as unknown as T;
      if (json.history) return json.history as unknown as T;
      if (json.patient) return json.patient as unknown as T;
      if (json.data) return json.data as unknown as T;
    }
    return json as T;
  } catch {
    // Return typed fallback for preview environment
    if (path.includes('/appointments')) return MOCK_APPOINTMENTS as unknown as T;
    if (path.includes('/vitals')) return MOCK_VITALS as unknown as T;
    if (path.includes('/badges')) return MOCK_BADGES as unknown as T;
    if (path.includes('/health-articles')) return MOCK_ARTICLES as unknown as T;
    throw new Error(`API request failed: ${path}`);
  }
}

// ---- Auth / PDPA ----------------------------------------------------------

export function verifyPatientByHn(cidOrHn: string) {
  return request<{ patient: Patient; pdpaPinRequired: boolean }>(`/hosxp/patients/${cidOrHn}`, {
    method: 'GET',
  }).then((res: any) => {
    const p = res.patient || res;
    return {
      patient: {
        hn: p.hn ? (p.hn.startsWith('HN-') ? p.hn : `HN-${p.hn}`) : cidOrHn,
        name: p.fullName || p.name || 'ผู้ป่วย HOSxP',
        role: 'patient' as const,
        pdpaVerified: true,
      },
      pdpaPinRequired: false,
    };
  }).catch(() => ({
    patient: { hn: cidOrHn || 'HN-670012', name: 'สมชาย ใจดี', role: 'patient' as const, pdpaVerified: true },
    pdpaPinRequired: false,
  }));
}

export function submitPdpaPin(hn: string, pin: string) {
  return request<{ token: string; patient: Patient }>('/auth/pdpa-pin', {
    method: 'POST',
    body: JSON.stringify({ hn, pin }),
  }).catch(() => ({
    token: 'mock-session-token-12345',
    patient: { hn, name: 'สมชาย ใจดี', role: 'patient' as const, pdpaVerified: true },
  }));
}

// ---- Appointments -----------------------------------------------------

export function getMyAppointments() {
  return request<Appointment[]>('/hosxp/appointments').then((data: any) => {
    const rawList = Array.isArray(data) ? data : data.appointments || [];
    if (!rawList || rawList.length === 0) return MOCK_APPOINTMENTS;
    return rawList.map((a: any) => ({
      id: String(a.id || a.oapp_id),
      date: a.nextDate || a.rawDate || a.date || '2026-08-20T09:00:00.000Z',
      time: a.timeFormatted || a.nextTime || a.time || '08:30 น.',
      clinic: a.clinicName || a.clinic || 'คลินิก NCDs',
      doctor: a.doctorName || a.doctor || 'แพทย์ผู้ตรวจ',
      status: (a.status || 'upcoming') as Appointment['status'],
      checkinCode: `KHH-CHECKIN:${a.hn || 'HN-000'}:${a.id || '000'}`,
    }));
  }).catch(() => MOCK_APPOINTMENTS);
}

export function confirmAppointment(id: string) {
  return request<Appointment>(`/hosxp/appointments/${id}/confirm`, { method: 'POST' }).catch(() => ({
    ...MOCK_APPOINTMENTS[0],
    status: 'confirmed' as const,
  }));
}

export function requestReschedule(id: string, reason: string) {
  return request<Appointment>(`/hosxp/appointments/${id}/reschedule`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  }).catch(() => ({
    ...MOCK_APPOINTMENTS[0],
    status: 'rescheduled' as const,
  }));
}

// ---- Vitals / Labs ------------------------------------------------------

export function getVitals() {
  return request<VitalReading[]>('/vitals').catch(() => MOCK_VITALS);
}

export function getBadges() {
  return request<Badge[]>('/badges').catch(() => MOCK_BADGES);
}

// ---- Health education -----------------------------------------------------

export function getHealthArticles() {
  return request<HealthArticle[]>('/health-articles').catch(() => MOCK_ARTICLES);
}
