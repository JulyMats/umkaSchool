import React from 'react';
import { Star } from 'lucide-react';
import { ExerciseSessionConfig } from '../../../types/exercise';
import { formatTime, digitTypeOptions, themeLabels } from '../../../config/exercise.config';

interface ExerciseSetupSummaryProps {
  config: ExerciseSessionConfig;
  exerciseTypeName: string;
  exampleCount?: number;
  dividendDigits?: [number, number];
  divisorDigits?: [number, number];
  firstMultiplierDigits?: [number, number];
  minValue?: number;
  maxValue?: number;
  cardCount?: number;
  digitType?: string;
  displaySpeed?: number;
  timePerQuestion?: number;
  selectedTheme?: string;
}

const ExerciseSetupSummary: React.FC<ExerciseSetupSummaryProps> = ({
  exerciseTypeName,
  exampleCount,
  dividendDigits,
  divisorDigits,
  firstMultiplierDigits,
  minValue,
  maxValue,
  cardCount,
  digitType,
  displaySpeed,
  timePerQuestion,
  selectedTheme
}) => {
  const name = exerciseTypeName.toLowerCase();
  const isDivision = name.includes('division');
  const isMultiplication = name.includes('multiplication');
  const isAdditionSubtraction = name.includes('addition') || name.includes('subtraction');
  const isThemeTraining = name.includes('theme training');
  const isFlashCards = name.includes('flash cards') && !name.includes('active');
  const isFlashCardsActive = name.includes('flash cards active');

  return (
    <section className="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 rounded-3xl p-6 border-4 border-pink-300">
      <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Star className="w-6 h-6 text-yellow-500" /> Ready to play? 🎮
      </h3>
      <ul className="text-base text-gray-700 space-y-2 font-medium">
        {isDivision && (
          <>
            <li>🎯 You will solve <strong className="text-pink-600">{exampleCount}</strong> division examples</li>
            <li>📊 Dividend: <strong className="text-green-600">{dividendDigits?.[0]}-{dividendDigits?.[1]} digits</strong>, Divisor: <strong className="text-orange-600">{divisorDigits?.[0]}-{divisorDigits?.[1]} digits</strong></li>
            <li>⏱️ You have <strong className="text-pink-600">{timePerQuestion ? formatTime(timePerQuestion) : 'N/A'}</strong> per example</li>
          </>
        )}
        {isMultiplication && (
          <>
            <li>🎯 You will solve <strong className="text-blue-600">{exampleCount}</strong> multiplication examples</li>
            <li>📊 First multiplier: <strong className="text-green-600">{firstMultiplierDigits?.[0]}-{firstMultiplierDigits?.[1]} digits</strong></li>
            <li>🔢 Second multiplier: <strong className="text-yellow-600">{minValue}-{maxValue}</strong></li>
            <li>⏱️ You have <strong className="text-pink-600">{timePerQuestion ? formatTime(timePerQuestion) : 'N/A'}</strong> per example</li>
          </>
        )}
        {(isAdditionSubtraction || isThemeTraining) && (
          <>
            <li>🎴 You will see <strong className="text-blue-600">{cardCount}</strong> cards with <strong className="text-purple-600">{digitTypeOptions.find((d) => d.value === digitType)?.label}</strong> numbers</li>
            <li>⚡ Each card stays for <strong className="text-yellow-600">{displaySpeed?.toFixed(1) || 'N/A'} seconds</strong></li>
            <li>⏱️ You have <strong className="text-pink-600">{timePerQuestion || 'N/A'} seconds</strong> to type the final answer</li>
            {selectedTheme && (
              <li>🎯 Theme: <strong className="text-green-600">{themeLabels[selectedTheme] || selectedTheme}</strong></li>
            )}
          </>
        )}
        {(isFlashCards || isFlashCardsActive) && (
          <>
            {selectedTheme && (
              <li>🎯 Number range: <strong className="text-green-600">{themeLabels[selectedTheme] || selectedTheme}</strong></li>
            )}
            <li>⚡ Each card stays for <strong className="text-yellow-600">{displaySpeed?.toFixed(1) || 'N/A'} seconds</strong></li>
          </>
        )}
      </ul>
    </section>
  );
};

export default ExerciseSetupSummary;

