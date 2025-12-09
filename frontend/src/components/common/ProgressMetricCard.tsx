import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ProgressMetricCardProps {
  title: string;
  value: string;
  change: string;
  isPositive?: boolean;
  icon: LucideIcon;
  color?: 'blue' | 'purple' | 'pink' | 'green';
  className?: string;
}

const ProgressMetricCard: React.FC<ProgressMetricCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  color = 'blue',
  className = ''
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600',
      title: 'text-blue-600'
    },
    purple: {
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      iconText: 'text-purple-600',
      title: 'text-purple-600'
    },
    pink: {
      bg: 'bg-pink-50',
      iconBg: 'bg-pink-100',
      iconText: 'text-pink-600',
      title: 'text-pink-600'
    },
    green: {
      bg: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconText: 'text-green-600',
      title: 'text-green-600'
    }
  };

  const colors = colorClasses[color];

  return (
    <div className={`${colors.bg} rounded-2xl p-6 shadow-sm ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`${colors.title} text-sm mb-1 font-medium`}>{title}</p>
          <p className="text-2xl font-bold mb-2 text-gray-800">{value}</p>
          <p className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </p>
        </div>
        <div className={`${colors.iconBg} ${colors.iconText} p-3 rounded-xl flex-shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default ProgressMetricCard;

