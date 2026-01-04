import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  helperText?: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  helperText,
  className = ''
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 ${className}`}>
      <div className="flex items-center gap-4">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 flex-shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
          {helperText && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{helperText}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;

