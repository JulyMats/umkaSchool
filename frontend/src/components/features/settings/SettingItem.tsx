import React from 'react';
import { LucideIcon } from 'lucide-react';
import ToggleSwitch from '../../ui/ToggleSwitch';
import { SelectField } from '../../common';
import { Button } from '../../ui';

export interface SettingItemData {
  id: string;
  label: string;
  description: string;
  type: 'toggle' | 'select' | 'button';
  value?: boolean | string;
  options?: string[];
  icon: LucideIcon;
  onToggle?: (id: string, value: boolean) => void;
  onSelect?: (id: string, value: string) => void;
  onButtonClick?: (id: string) => void;
}

interface SettingItemProps {
  setting: SettingItemData;
}

const SettingItem: React.FC<SettingItemProps> = ({ setting }) => {
  const Icon = setting.icon;

  const renderControl = () => {
    switch (setting.type) {
      case 'toggle':
        return (
          <ToggleSwitch
            checked={setting.value as boolean}
            onChange={(checked) => setting.onToggle?.(setting.id, checked)}
          />
        );
      case 'select':
        return (
          <SelectField
            name={setting.id}
            label=""
            value={setting.value as string}
            onChange={(e) => setting.onSelect?.(setting.id, e.target.value)}
            options={setting.options?.map(opt => ({ value: opt, label: opt })) || []}
            className="w-40"
          />
        );
      case 'button':
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setting.onButtonClick?.(setting.id)}
          >
            Manage
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-3 flex-1">
        <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <div className="text-left flex-1 min-w-0">
          <h3 className="font-medium text-gray-900">{setting.label}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{setting.description}</p>
        </div>
      </div>
      <div className="flex-shrink-0 ml-4">
        {renderControl()}
      </div>
    </div>
  );
};

export default SettingItem;

