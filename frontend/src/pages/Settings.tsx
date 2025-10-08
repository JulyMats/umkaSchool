import Layout from "../components/Layout";
import { Bell, Globe, Moon, Volume2, Shield, HelpCircle } from "lucide-react";
import { JSX, useState } from "react";

interface Setting {
  id: string;
  label: string;
  description: string;
  type: "toggle" | "select" | "button";
  value?: boolean | string;
  options?: string[];
  section: "account" | "preferences" | "notifications";
  icon: JSX.Element;
}

export default function Settings() {
  const [settings, setSettings] = useState<Setting[]>([
    {
      id: "darkMode",
      label: "Dark Mode",
      description: "Use dark theme for better visibility in low light",
      type: "toggle",
      value: false,
      section: "preferences",
      icon: <Moon className="w-5 h-5" />
    },
    {
      id: "language",
      label: "Language",
      description: "Choose your preferred language",
      type: "select",
      value: "English",
      options: ["English", "Español", "Français", "Deutsch"],
      section: "preferences",
      icon: <Globe className="w-5 h-5" />
    },
    {
      id: "sound",
      label: "Sound Effects",
      description: "Play sound effects for actions and achievements",
      type: "toggle",
      value: true,
      section: "preferences",
      icon: <Volume2 className="w-5 h-5" />
    },
    {
      id: "emailNotif",
      label: "Email Notifications",
      description: "Receive updates about your progress and new challenges",
      type: "toggle",
      value: true,
      section: "notifications",
      icon: <Bell className="w-5 h-5" />
    },
    {
      id: "privacy",
      label: "Privacy Settings",
      description: "Manage your data and privacy preferences",
      type: "button",
      section: "account",
      icon: <Shield className="w-5 h-5" />
    }
  ]);

  const handleToggle = (settingId: string) => {
    setSettings(settings.map(setting => 
      setting.id === settingId && setting.type === "toggle"
        ? { ...setting, value: !setting.value }
        : setting
    ));
  };

  const handleSelect = (settingId: string, value: string) => {
    setSettings(settings.map(setting =>
      setting.id === settingId
        ? { ...setting, value }
        : setting
    ));
  };

  const renderSettingControl = (setting: Setting) => {
    switch (setting.type) {
      case "toggle":
        return (
          <button
            onClick={() => handleToggle(setting.id)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${setting.value ? 'bg-blue-500' : 'bg-gray-200'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${setting.value ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        );
      case "select":
        return (
          <select
            value={setting.value as string}
            onChange={(e) => handleSelect(setting.id, e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {setting.options?.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case "button":
        return (
          <button className="px-4 py-1.5 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors">
            Manage
          </button>
        );
      default:
        return null;
    }
  };

  const sections = {
    preferences: "Preferences",
    notifications: "Notifications",
    account: "Account Settings"
  };

  return (
    <Layout
      title="Settings"
      subtitle="Customize your learning experience"
    >
      <div className="w-full">
        {/* Help Button */}
        <button className="mb-8 flex items-center gap-2 px-4 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors">
          <HelpCircle className="w-5 h-5" />
          Need help with settings?
        </button>

        {/* Settings Sections */}
        {(Object.entries(sections) as [keyof typeof sections, string][]).map(([section, title]) => (
          <div key={section} className="mb-8">
            <h2 className="text-lg font-semibold mb-4">{title}</h2>
            <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
              {settings
                .filter(setting => setting.section === section)
                .map(setting => (
                  <div
                    key={setting.id}
                    className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        {setting.icon}
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium">{setting.label}</h3>
                        <p className="text-sm text-gray-500">{setting.description}</p>
                      </div>
                    </div>
                    {renderSettingControl(setting)}
                  </div>
                ))}
            </div>
          </div>
        ))}
        
        {/* Version Info */}
        <div className="mt-8 text-sm text-gray-500">
          Version 1.0.0
        </div>
      </div>
    </Layout>
  );
}