import React, { createContext, useContext, useState, useCallback } from 'react';
import { Platform } from 'react-native';

interface AccessibilityContextType {
  isLargeText: boolean;
  toggleLargeText: () => void;
  speakText: (text: string) => void;
  stopSpeech: () => void;
  isSpeaking: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType>({
  isLargeText: false,
  toggleLargeText: () => {},
  speakText: () => {},
  stopSpeech: () => {},
  isSpeaking: false,
});

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLargeText, setIsLargeText] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const toggleLargeText = useCallback(() => {
    setIsLargeText((prev) => !prev);
  }, []);

  const speakText = useCallback((text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'th-TH';
      utterance.rate = 0.9; // Slightly slower for elderly patients
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      console.log('Speech synthesis speaking:', text);
    }
  }, []);

  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        isLargeText,
        toggleLargeText,
        speakText,
        stopSpeech,
        isSpeaking,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => useContext(AccessibilityContext);
