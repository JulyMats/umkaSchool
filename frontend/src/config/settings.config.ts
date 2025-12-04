import { Bell, Globe, Moon, Volume2, Shield, LucideIcon } from 'lucide-react';

export type SettingType = 'toggle' | 'select' | 'button';
export type SettingSection = 'preferences' | 'notifications' | 'account';

export interface SettingConfig {
  id: string;
  label: string;
  description: string;
  type: SettingType;
  defaultValue: boolean | string;
  options?: string[];
  section: SettingSection;
  icon: LucideIcon;
}

export const DEFAULT_SETTINGS: SettingConfig[] = [
  {
    id: 'darkMode',
    label: 'Dark Mode',
    description: 'Use dark theme for better visibility in low light',
    type: 'toggle',
    defaultValue: false,
    section: 'preferences',
    icon: Moon
  },
  {
    id: 'language',
    label: 'Language',
    description: 'Choose your preferred language',
    type: 'select',
    defaultValue: 'English',
    options: ['English', 'Español', 'Français', 'Deutsch'],
    section: 'preferences',
    icon: Globe
  },
  {
    id: 'sound',
    label: 'Sound Effects',
    description: 'Play sound effects for actions and achievements',
    type: 'toggle',
    defaultValue: true,
    section: 'preferences',
    icon: Volume2
  },
  {
    id: 'emailNotif',
    label: 'Email Notifications',
    description: 'Receive updates about your progress and new challenges',
    type: 'toggle',
    defaultValue: true,
    section: 'notifications',
    icon: Bell
  },
  {
    id: 'privacy',
    label: 'Privacy Settings',
    description: 'Manage your data and privacy preferences',
    type: 'button',
    defaultValue: '',
    section: 'account',
    icon: Shield
  }
];

export const SETTINGS_SECTIONS: Record<SettingSection, string> = {
  preferences: 'Preferences',
  notifications: 'Notifications',
  account: 'Account Settings'
};

