import { useState, useMemo } from "react";
import Layout from "../components/layout";
import { SettingsSection } from "../components/features/settings";
import { SettingItemData } from "../components/features/settings";
import { HelpButton } from "../components/common";
import { DEFAULT_SETTINGS, SETTINGS_SECTIONS, SettingSection } from "../config/settings.config";

export default function Settings() {
  // Initialize settings from config
  const [settings, setSettings] = useState<Record<string, boolean | string>>(() => {
    const initial: Record<string, boolean | string> = {};
    DEFAULT_SETTINGS.forEach(setting => {
      initial[setting.id] = setting.defaultValue;
    });
    return initial;
  });

  const handleToggle = (settingId: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [settingId]: value
    }));
    // TODO: Save to backend/localStorage
  };

  const handleSelect = (settingId: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [settingId]: value
    }));
    // TODO: Save to backend/localStorage
  };

  const handleButtonClick = (settingId: string) => {
    // TODO: Handle button actions (e.g., open privacy modal)
    console.log(`Button clicked for setting: ${settingId}`);
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
      onButtonClick: config.type === 'button' ? handleButtonClick : undefined
    }));
  }, [settings]);

  // Group settings by section
  const settingsBySection = useMemo(() => {
    const grouped: Record<SettingSection, SettingItemData[]> = {
      preferences: [],
      notifications: [],
      account: []
    };

    settingItems.forEach(item => {
      const config = DEFAULT_SETTINGS.find(s => s.id === item.id);
      if (config) {
        grouped[config.section].push(item);
      }
    });

    return grouped;
  }, [settingItems]);

  const handleHelpClick = () => {
    // TODO: Open help modal or navigate to help page
    console.log('Help clicked');
  };

  return (
    <Layout
      title="Settings"
      subtitle="Customize your learning experience"
    >
      <div className="w-full">
        <div className="mb-8">
          <HelpButton onClick={handleHelpClick} />
        </div>

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