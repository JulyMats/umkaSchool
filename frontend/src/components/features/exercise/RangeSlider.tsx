import React from 'react';
import { Hash } from 'lucide-react';

interface RangeSliderProps {
  label: string;
  icon: React.ReactNode;
  value: [number, number];
  min: number;
  max: number;
  onChange: (value: [number, number]) => void;
  description?: string;
  color?: 'green' | 'orange';
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  label,
  icon,
  value,
  min,
  max,
  onChange,
  description,
  color = 'green'
}) => {
  const colorClasses = {
    green: {
      accent: 'accent-green-500',
      text: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200'
    },
    orange: {
      accent: 'accent-orange-500',
      text: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200'
    }
  };

  const colors = colorClasses[color];

  return (
    <div className={`bg-gradient-to-br ${colors.bg} rounded-2xl p-6 border-2 ${colors.border}`}>
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        {icon} {label}
      </h3>
      <div className={`bg-white rounded-xl p-4 border-2 ${colors.border} space-y-4`}>
        {description && <p className="text-sm text-gray-600">{description}</p>}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-xs font-semibold text-gray-700 mb-2 block">Min</label>
            <input
              type="range"
              min={min}
              max={max}
              value={value[0]}
              onChange={(e) => onChange([Number(e.target.value), value[1]])}
              className={`w-full ${colors.accent}`}
            />
            <div className={`text-center ${colors.text} font-bold text-lg mt-1`}>{value[0]}</div>
          </div>
          <div className="flex-1">
            <label className="text-xs font-semibold text-gray-700 mb-2 block">Max</label>
            <input
              type="range"
              min={value[0]}
              max={max}
              value={value[1]}
              onChange={(e) => onChange([value[0], Number(e.target.value)])}
              className={`w-full ${colors.accent}`}
            />
            <div className={`text-center ${colors.text} font-bold text-lg mt-1`}>{value[1]}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RangeSlider;

