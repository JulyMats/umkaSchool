import React from 'react';
import { Hash } from 'lucide-react';
import { DigitType } from '../../../types/exercise';
import { digitTypeOptions } from '../../../config/exercise.config';

interface DigitTypeSelectorProps {
  selectedType: DigitType;
  onSelect: (type: DigitType) => void;
  availableTypes?: DigitType[];
}

const DigitTypeSelector: React.FC<DigitTypeSelectorProps> = ({
  selectedType,
  onSelect,
  availableTypes
}) => {
  const typesToShow = availableTypes 
    ? digitTypeOptions.filter(opt => availableTypes.includes(opt.value))
    : digitTypeOptions;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-4 sm:p-6 border-2 border-purple-200">
      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
        <Hash className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 flex-shrink-0" /> 
        <span className="break-words">Number Type 🔢</span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {typesToShow.map((option) => (
          <button
            type="button"
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`text-left rounded-2xl border-2 px-4 sm:px-6 py-3 sm:py-4 transition-all transform hover:scale-105 ${
              selectedType === option.value
                ? 'border-purple-400 bg-gradient-to-br from-purple-100 to-indigo-100 shadow-lg scale-105'
                : 'border-gray-200 bg-white hover:border-purple-200 hover:bg-purple-50'
            }`}
          >
            <div className="text-2xl sm:text-3xl mb-2">{option.emoji}</div>
            <p className="text-sm sm:text-base font-bold text-gray-800">{option.label}</p>
            <p className="text-xs text-gray-600 mt-1">{option.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DigitTypeSelector;

