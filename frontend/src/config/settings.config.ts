import { Globe, Moon, LucideIcon } from 'lucide-react';

export type SettingType = 'toggle' | 'select';
export type SettingSection = 'preferences';

export interface SettingConfig {
  id: string;
  label: string;
  description: string;
  type: SettingType;
  defaultValue: boolean | string;
  options?: { value: string; label: string }[];
  section: SettingSection;
  icon: LucideIcon;
}

export const LANGUAGE_OPTIONS = [
  { value: 'EN', label: 'English' },
  { value: 'PL', label: 'Polski' },
  { value: 'RU', label: 'Русский' }
];

export const DEFAULT_SETTINGS: SettingConfig[] = [
  {
    id: 'appTheme',
    label: 'Dark Mode',
    description: 'Use dark theme for better visibility in low light',
    type: 'toggle',
    defaultValue: false,
    section: 'preferences',
    icon: Moon
  },
  {
    id: 'appLanguage',
    label: 'Language',
    description: 'Choose your preferred language',
    type: 'select',
    defaultValue: 'EN',
    options: LANGUAGE_OPTIONS,
    section: 'preferences',
    icon: Globe
  }
];

export const SETTINGS_SECTIONS: Record<SettingSection, string> = {
  preferences: 'Preferences'
};

