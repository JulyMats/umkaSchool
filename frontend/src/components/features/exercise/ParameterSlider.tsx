import React from 'react';

interface ParameterSliderProps {
  label: string;
  icon: React.ReactNode;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  description?: string;
  formatValue?: (value: number) => string;
  color?: 'pink' | 'blue' | 'yellow' | 'green' | 'orange';
}

const ParameterSlider: React.FC<ParameterSliderProps> = ({
  label,
  icon,
  value,
  min,
  max,
  step = 1,
  onChange,
  description,
  formatValue,
  color = 'pink'
}) => {
  const colorClasses = {
    pink: {
      accent: 'accent-pink-500',
      text: 'text-pink-600',
      bg: 'bg-pink-50',
      border: 'border-pink-200'
    },
    blue: {
      accent: 'accent-blue-500',
      text: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200'
    },
    yellow: {
      accent: 'accent-yellow-500',
      text: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200'
    },
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
  const displayValue = formatValue ? formatValue(value) : value.toString();

  return (
    <div className={`bg-gradient-to-br ${colors.bg} rounded-2xl p-6 border-2 ${colors.border}`}>
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        {icon} {label}
      </h3>
      <div className={`bg-white rounded-xl p-4 border-2 ${colors.border}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-base font-semibold text-gray-800 mb-1">{label}</p>
            {description && <p className="text-sm text-gray-600">{description}</p>}
          </div>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
              className={`w-40 ${colors.accent}`}
            />
            <div className={`flex items-center gap-2 ${colors.text} font-bold text-lg`}>
              {icon}
              <span>{displayValue}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParameterSlider;

