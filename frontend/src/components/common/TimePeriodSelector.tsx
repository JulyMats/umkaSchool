import React from 'react';
import { TimePeriod } from '../../types/stats';

interface TimePeriodSelectorProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  className?: string;
}

const timeOptions: { value: TimePeriod; label: string }[] = [
  { value: 'day', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All Time' }
];

const TimePeriodSelector: React.FC<TimePeriodSelectorProps> = ({
  selectedPeriod,
  onPeriodChange,
  className = ''
}) => {
  return (
    <div className={`flex justify-end ${className}`}>
      <div className="inline-flex bg-white rounded-lg p-1 shadow-sm">
        {timeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onPeriodChange(option.value)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${selectedPeriod === option.value
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimePeriodSelector;

