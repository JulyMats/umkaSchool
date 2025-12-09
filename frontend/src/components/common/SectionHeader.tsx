import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  icon?: LucideIcon;
  title: string;
  action?: {
    label: string;
    onClick: () => void;
    href?: string;
  };
  badge?: string;
  color?: 'pink' | 'blue' | 'purple' | 'yellow' | 'green';
  iconPosition?: 'left' | 'right';
  className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon: Icon,
  title,
  action,
  badge,
  color = 'pink',
  iconPosition = 'left',
  className = ''
}) => {
  const colorClasses = {
    pink: {
      iconBg: 'bg-pink-100',
      iconText: 'text-pink-700',
      title: 'text-pink-700',
      action: 'text-pink-600',
      badge: 'text-pink-500'
    },
    blue: {
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-700',
      title: 'text-blue-700',
      action: 'text-blue-600',
      badge: 'text-blue-500'
    },
    purple: {
      iconBg: 'bg-purple-100',
      iconText: 'text-purple-700',
      title: 'text-purple-700',
      action: 'text-purple-600',
      badge: 'text-purple-500'
    },
    yellow: {
      iconBg: 'bg-yellow-100',
      iconText: 'text-yellow-700',
      title: 'text-yellow-700',
      action: 'text-yellow-600',
      badge: 'text-yellow-500'
    },
    green: {
      iconBg: 'bg-green-100',
      iconText: 'text-green-700',
      title: 'text-green-700',
      action: 'text-green-600',
      badge: 'text-green-500'
    }
  };

  const colors = colorClasses[color];
  const iconElement = Icon ? (
    <div className={`${colors.iconBg} ${colors.iconText} p-3 rounded-xl flex items-center justify-center flex-shrink-0`}>
      <Icon className="w-5 h-5" />
    </div>
  ) : null;

  return (
    <div className={`flex justify-between items-center mb-3 ${className}`}>
      <h3 className={`font-semibold ${colors.title} flex items-center gap-2`}>
        {iconPosition === 'left' && iconElement}
        {title}
      </h3>
      <div className="flex items-center gap-3">
        {action ? (
          <a
            href={action.href || '#'}
            onClick={(e) => {
              e.preventDefault();
              action.onClick();
            }}
            className={`text-sm ${colors.action} font-medium hover:underline transition-colors`}
          >
            {action.label}
          </a>
        ) : badge ? (
          <span className={`text-sm ${colors.badge} font-medium`}>
            {badge}
          </span>
        ) : null}
        {iconPosition === 'right' && iconElement}
      </div>
    </div>
  );
};

export default SectionHeader;

