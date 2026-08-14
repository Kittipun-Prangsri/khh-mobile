export interface Patient {
  hn: string;
  name: string;
  role: 'patient' | 'staff';
  pdpaVerified: boolean;
}

export interface Appointment {
  id: string;
  date: string; // ISO date
  time: string;
  clinic: string;
  doctor?: string;
  status: 'upcoming' | 'confirmed' | 'completed' | 'missed' | 'rescheduled';
  checkinCode: string; // KHH-CHECKIN:{HN}:{DATE}
}

export interface VitalReading {
  label: 'BMI' | 'BloodPressure' | 'FBS' | 'HbA1c' | 'eGFR';
  value: number;
  unit: string;
  min: number;
  max: number;
  targetMin: number;
  targetMax: number;
  status: 'good' | 'watch' | 'risk';
  recordedAt: string;
}

export interface Badge {
  id: string;
  titleTh: string;
  emoji: string;
  earnedAt: string;
  criteria: string;
}

export interface HealthArticle {
  id: string;
  category: 'diet' | 'medication' | 'exercise' | 'thai_medicine' | 'mental_health';
  titleTh: string;
  summaryTh: string;
}
