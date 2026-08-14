import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { Patient } from '@/types';
import { clearToken } from '@/services/api';

interface AuthState {
  patient: Patient | null;
  isLoading: boolean;
  signIn: (patient: Patient) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const PATIENT_CACHE_KEY = 'khh_patient_cache';

const DEFAULT_DEMO_PATIENT: Patient = {
  hn: 'HN-670012',
  name: 'สมชาย ใจดี',
  role: 'patient',
  pdpaVerified: true,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [patient, setPatient] = useState<Patient | null>(DEFAULT_DEMO_PATIENT);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (Platform.OS !== 'web') {
          const cached = await SecureStore.getItemAsync(PATIENT_CACHE_KEY);
          if (cached) setPatient(JSON.parse(cached) as Patient);
        } else {
          const cached = localStorage.getItem(PATIENT_CACHE_KEY);
          if (cached) setPatient(JSON.parse(cached) as Patient);
        }
      } catch {
        // Fallback to demo patient for web preview
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const signIn = (p: Patient) => {
    setPatient(p);
    if (Platform.OS === 'web') {
      try { localStorage.setItem(PATIENT_CACHE_KEY, JSON.stringify(p)); } catch {}
    } else {
      SecureStore.setItemAsync(PATIENT_CACHE_KEY, JSON.stringify(p)).catch(() => {});
    }
  };

  const signOut = async () => {
    setPatient(null);
    await clearToken();
    if (Platform.OS === 'web') {
      try { localStorage.removeItem(PATIENT_CACHE_KEY); } catch {}
    } else {
      await SecureStore.deleteItemAsync(PATIENT_CACHE_KEY).catch(() => {});
    }
  };

  const value = useMemo(() => ({ patient, isLoading, signIn, signOut }), [patient, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

