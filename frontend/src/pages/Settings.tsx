import { useState, useMemo, useEffect } from "react";
import Layout from "../components/layout";
import { SettingsSection } from "../components/features/settings";
import { SettingItemData } from "../components/features/settings";
import { DEFAULT_SETTINGS, SETTINGS_SECTIONS, SettingSection } from "../config/settings.config";
import { useAuth } from "../contexts/AuthContext";
import { userService } from "../services/user.service";

export default function Settings() {
  const { user, refreshUserData } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<Record<string, boolean | string>>({});

  useEffect(() => {
    if (user) {
      setSettings({
        appTheme: user.appTheme === 'DARK',
        appLanguage: user.appLanguage || 'EN'
      });
    }
  }, [user]);

  const handleToggle = async (settingId: string, value: boolean) => {
    if (!user) return;

    setSettings(prev => ({
      ...prev,
      [settingId]: value
    }));

    try {
      setIsSaving(true);
      const payload: { appTheme?: 'LIGHT' | 'DARK' } = {};
      
      if (settingId === 'appTheme') {
        payload.appTheme = value ? 'DARK' : 'LIGHT';
      }

      await userService.updateUser(user.id, payload);
      await refreshUserData();
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSettings(prev => ({
        ...prev,
        [settingId]: !value
      }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelect = async (settingId: string, value: string) => {
    if (!user) return;

    setSettings(prev => ({
      ...prev,
      [settingId]: value
    }));

    try {
      setIsSaving(true);
      const payload: { appLanguage?: string } = {};
      
      if (settingId === 'appLanguage') {
        payload.appLanguage = value;
      }

      await userService.updateUser(user.id, payload);
      await refreshUserData();
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSettings(prev => ({
        ...prev,
        [settingId]: user.appLanguage || 'EN'
      }));
    } finally {
      setIsSaving(false);
    }
  };

  // Transform config to SettingItemData format
  const settingItems: SettingItemData[] = useMemo(() => {
    return DEFAULT_SETTINGS.map(config => ({
      id: config.id,
      label: config.label,
      description: config.description,
      type: config.type,
      value: settings[config.id] ?? config.defaultValue,
      options: config.options,
      icon: config.icon,
      onToggle: config.type === 'toggle' ? handleToggle : undefined,
      onSelect: config.type === 'select' ? handleSelect : undefined,
      disabled: isSaving
    }));
  }, [settings, isSaving]);

  const settingsBySection = useMemo(() => {
    const grouped: Record<SettingSection, SettingItemData[]> = {
      preferences: []
    };

    settingItems.forEach(item => {
      const config = DEFAULT_SETTINGS.find(s => s.id === item.id);
      if (config) {
        grouped[config.section].push(item);
      }
    });

    return grouped;
  }, [settingItems]);

  if (!user) {
    return (
      <Layout title="Settings" subtitle="Loading...">
        <div className="text-center py-8 text-gray-500">Loading settings...</div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Settings"
      subtitle="Customize your learning experience"
    >
      <div className="w-full">
        
        {(Object.entries(SETTINGS_SECTIONS) as [SettingSection, string][]).map(([section, title]) => (
          <SettingsSection
            key={section}
            title={title}
            settings={settingsBySection[section]}
          />
        ))}
        
        <div className="mt-8 text-sm text-gray-500">
          Version 1.0.0
        </div>
      </div>
    </Layout>
  );
}