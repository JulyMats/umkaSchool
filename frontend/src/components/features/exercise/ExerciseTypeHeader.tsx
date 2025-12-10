import React from 'react';
import { ArrowLeft, Trophy } from 'lucide-react';
import { ExerciseType } from '../../../types/exerciseType';
import { Button } from '../../ui';

interface ExerciseTypeHeaderProps {
  exerciseType: ExerciseType;
  onBack: () => void;
}

const ExerciseTypeHeader: React.FC<ExerciseTypeHeaderProps> = ({
  exerciseType,
  onBack
}) => {
  const difficultyLabel = exerciseType.difficulty.charAt(0).toUpperCase() + exerciseType.difficulty.slice(1);

  const getDifficultyColor = () => {
    switch (difficultyLabel.toLowerCase()) {
      case 'beginner':
        return 'from-green-400 to-emerald-500';
      case 'intermediate':
        return 'from-yellow-400 to-orange-500';
      case 'advanced':
        return 'from-red-400 to-pink-500';
      default:
        return 'from-blue-400 to-purple-500';
    }
  };

  return (
    <div className="text-center mb-6 sm:mb-8">
      <Button
        onClick={onBack}
        variant="outline"
        className="inline-flex items-center gap-2 mb-3 sm:mb-4 text-sm sm:text-base"
        size="sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>
      
      <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-2 sm:mb-3 px-2">
        {exerciseType.name} 🎮
      </h1>
      
      <div className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r ${getDifficultyColor()} rounded-full shadow-lg text-white text-sm sm:text-base font-bold mb-2 sm:mb-3`}>
        <Trophy className="w-3 h-3 sm:w-4 sm:h-4" /> {difficultyLabel}
      </div>
      
      <p className="text-sm sm:text-base lg:text-lg text-gray-700 max-w-2xl mx-auto mt-3 sm:mt-4 px-2">
        {exerciseType.description}
      </p>
    </div>
  );
};

export default ExerciseTypeHeader;

