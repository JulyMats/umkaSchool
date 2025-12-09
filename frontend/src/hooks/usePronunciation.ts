import { useState } from 'react';

const PRONUNCIATION_PREFERENCE_KEY = 'umkaSchool_pronunciation_enabled';

export const usePronunciation = (defaultValue: boolean = true): [boolean, (enabled: boolean) => void] => {
  const [enabled, setEnabledState] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(PRONUNCIATION_PREFERENCE_KEY);
      return stored !== null ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setEnabled = (value: boolean) => {
    try {
      localStorage.setItem(PRONUNCIATION_PREFERENCE_KEY, JSON.stringify(value));
      setEnabledState(value);
    } catch (error) {
      console.error('Failed to save pronunciation preference:', error);
    }
  };

  return [enabled, setEnabled];
};

