import React, { FormEvent } from 'react';
import { Timer } from 'lucide-react';
import { ExerciseSessionConfig } from '../../../types/exercise';
import { Button } from '../../ui';
import { Input } from '../../ui';

interface ExerciseAnswerInputProps {
  config: ExerciseSessionConfig;
  userAnswer: string;
  countdown: number;
  feedback: 'correct' | 'incorrect' | 'timeout' | null;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

const ExerciseAnswerInput: React.FC<ExerciseAnswerInputProps> = ({
  config,
  userAnswer,
  countdown,
  feedback,
  onChange,
  onSubmit
}) => {
  const getInstructionText = () => {
    const name = config.exerciseTypeName;
    if (name.includes('Addition')) return 'Add in your head! 🧠✨';
    if (name.includes('Subtraction')) return 'Subtract in your head! 🧠✨';
    if (name.includes('Multiplication')) return 'Multiply in your head! 🧠✨';
    if (name.includes('Division')) return 'Divide in your head! 🧠✨';
    return 'Calculate in your head! 🧠✨';
  };

  return (
    <div className="w-full max-w-md px-6">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="inline-flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full font-bold text-yellow-700">
            <Timer className="w-5 h-5" />
            {feedback === null ? `${countdown}s left ⏱️` : 'Time stopped ⏸️'}
          </span>
          <span className="text-gray-600 font-semibold text-center">
            {getInstructionText()}
          </span>
        </div>
        <label className="block text-center text-sm font-semibold text-gray-700 mb-2">
          Your answer
        </label>
        <Input
          type="number"
          value={userAnswer}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-6 py-4 border-4 border-pink-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-400 focus:border-pink-500 text-2xl text-center font-bold transition-all"
          placeholder=""
          disabled={feedback !== null || countdown === 0}
          autoFocus
        />
        <div className="mt-6">
          <Button
            type="submit"
            variant="gradient-yellow"
            size="lg"
            fullWidth
            disabled={feedback !== null || countdown === 0}
            className="text-lg"
          >
            Check Answer! ✅
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ExerciseAnswerInput;

