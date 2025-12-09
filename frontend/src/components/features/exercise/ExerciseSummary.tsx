import React from 'react';
import { Info, Sparkles } from 'lucide-react';
import { ExerciseSessionConfig } from '../../../types/exercise';
import { digitLabel } from '../../../config/exercise.config';

interface ExerciseSummaryProps {
  config: ExerciseSessionConfig;
  totalAttempts: number;
  totalCorrect: number;
  numbers: number[];
  showSummary: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const ExerciseSummary: React.FC<ExerciseSummaryProps> = ({
  config,
  totalAttempts,
  totalCorrect,
  numbers,
  showSummary,
  onMouseEnter,
  onMouseLeave
}) => {
  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  return (
    <div className="fixed bottom-10 right-40 z-40">
      <div className="relative">
        <button
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className="p-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full shadow-2xl hover:from-pink-600 hover:to-purple-600 transition-all transform hover:scale-110"
        >
          <Info className="w-6 h-6" />
        </button>
        
        {showSummary && (
          <div className="absolute bottom-full right-0 mb-4 bg-white rounded-2xl shadow-2xl border-4 border-purple-300 p-6 min-w-[300px] max-w-md">
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 rounded-xl px-4 py-3 border-2 border-pink-300">
                <p className="font-bold flex items-center gap-2 text-purple-700 text-lg mb-2">
                  <Sparkles className="w-5 h-5" /> Session Summary 📊
                </p>
                <p className="text-gray-700 font-medium text-sm">
                  You chose <strong className="text-pink-600">{numbers.length}</strong> cards with <strong className="text-purple-600">{digitLabel(config.digitLength ?? 1)}</strong> numbers.
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 border-2 border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-700">Problems solved: 📝</span>
                    <span className="text-xl font-bold text-green-600">{totalAttempts}</span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-3 border-2 border-blue-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-700">Correct answers: ✅</span>
                    <span className="text-xl font-bold text-blue-600">{totalCorrect}</span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-3 border-2 border-yellow-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-700">Accuracy: 🎯</span>
                    <span className="text-xl font-bold text-yellow-600">{accuracy}%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-3 border-2 border-pink-200">
                <p className="font-bold text-gray-800"><span className="text-lg">🎴</span> Cards: <strong className="text-pink-600">{numbers.length}</strong></p>
                <p className="font-bold text-gray-800"><span className="text-lg">⚡</span> Speed: <strong className="text-yellow-600">{(config.displaySpeed ?? 1).toFixed(1)}s</strong> per card</p>
                <p className="font-bold text-gray-800"><span className="text-lg">⏱️</span> Answer time: <strong className="text-blue-600">{config.timePerQuestion ?? 10}s</strong></p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseSummary;

