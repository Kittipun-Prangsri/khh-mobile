import { API_BASE_URL } from '@/constants/contacts';

export interface LiffUserProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
}

export async function getLiffUserFromBrowser(): Promise<LiffUserProfile | null> {
  if (typeof window === 'undefined') return null;

  // Detect LINE User Agent
  const isLineBrowser = /Line/i.test(navigator.userAgent);
  if (!isLineBrowser) return null;

  try {
    // If LIFF SDK is present on window
    const win = window as unknown as { liff?: { getProfile: () => Promise<LiffUserProfile> } };
    if (win.liff) {
      const profile = await win.liff.getProfile();
      return profile;
    }
  } catch (err) {
    console.log('LIFF profile fetch error:', err);
  }

  return null;
}

export async function autoLoginWithLiff(lineUserId: string) {
  const res = await fetch(`${API_BASE_URL}/hosxp/liff/auto-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lineUserId }),
  });

  if (!res.ok) {
    throw new Error('LIFF Auto login failed');
  }

  return res.json();
}
