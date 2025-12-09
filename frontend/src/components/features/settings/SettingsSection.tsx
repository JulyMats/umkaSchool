import React from 'react';
import SettingItem, { SettingItemData } from './SettingItem';
import { Card } from '../../ui';

interface SettingsSectionProps {
  title: string;
  settings: SettingItemData[];
  className?: string;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  settings,
  className = ''
}) => {
  if (settings.length === 0) {
    return null;
  }

  return (
    <div className={`mb-8 ${className}`}>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      <Card variant="white" className="divide-y divide-gray-100 overflow-hidden">
        {settings.map((setting, index) => (
          <SettingItem key={setting.id} setting={setting} />
        ))}
      </Card>
    </div>
  );
};

export default SettingsSection;

