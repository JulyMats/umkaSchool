import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExerciseType } from '../../../types/exerciseType';
import { Button } from '../../ui';
import DifficultyBadge from '../../common/DifficultyBadge';

interface ExerciseTypeCardProps {
  exerciseType: ExerciseType;
  colorScheme: ColorScheme;
  index?: number;
}

export interface ColorScheme {
  bg: string;
  border: string;
  button: string;
  title: string;
}

const ExerciseTypeCard: React.FC<ExerciseTypeCardProps> = ({
  exerciseType,
  colorScheme,
}) => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate(`/exercises/${exerciseType.id}/setup`, {
      state: { exerciseType }
    });
  };

  return (
    <div
      className={`${colorScheme.bg} ${colorScheme.border} border-2 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full transform hover:scale-105`}
    >
      <div className="flex-1">
        <div className="flex flex-col items-center mb-3">
          <h3 className={`text-xl font-bold ${colorScheme.title} text-center mb-2`}>
            {exerciseType.name}
          </h3>
          <DifficultyBadge difficulty={exerciseType.difficulty} />
        </div>
        <p className="text-gray-700 text-sm font-medium leading-relaxed text-center">
          {exerciseType.description}
        </p>
      </div>
      <div className="flex justify-center mt-6">
        <Button
          onClick={handleStart}
          variant="gradient-pink"
          size="lg"
          className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
        >
          🚀 Start
        </Button>
      </div>
    </div>
  );
};

export default ExerciseTypeCard;

