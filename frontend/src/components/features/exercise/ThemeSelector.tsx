import React from 'react';
import { BookOpen } from 'lucide-react';
import { themeLabels } from '../../../config/exercise.config';

interface ThemeSelectorProps {
  themes: string[];
  selectedTheme: string;
  onSelect: (theme: string) => void;
  title: string;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  themes,
  selectedTheme,
  onSelect,
  title
}) => {
  if (!themes || themes.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 sm:p-6 border-2 border-green-200">
      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" /> 
        <span className="break-words">{title}</span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {themes.map((theme: string) => (
          <button
            type="button"
            key={theme}
            onClick={() => onSelect(theme)}
            className={`text-left rounded-2xl border-2 px-4 sm:px-6 py-3 sm:py-4 transition-all transform hover:scale-105 ${
              selectedTheme === theme
                ? 'border-green-400 bg-gradient-to-br from-green-100 to-emerald-100 shadow-lg scale-105'
                : 'border-gray-200 bg-white hover:border-green-200 hover:bg-green-50'
            }`}
          >
            <p className="text-sm sm:text-base font-bold text-gray-800 break-words">
              {themeLabels[theme] || theme}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;

