import React from 'react';
import { DailyChallengeExercise } from '../../../types/dailyChallenge';
import { Clock, Trophy, Target } from 'lucide-react';
import { Button } from '../../ui';
import { getStatusColor, getStatusIcon } from '../../../utils/homeworkStatus.utils';
import { DifficultyBadge } from '../../common';

interface DailyChallengeExerciseCardProps {
  exercise: DailyChallengeExercise;
  index: number;
  isCompleted: boolean;
  onSeeDetails: () => void;
  onStart: () => void;
  isLoading?: boolean;
}

const DailyChallengeExerciseCard: React.FC<DailyChallengeExerciseCardProps> = ({
  exercise,
  index,
  isCompleted,
  onStart,
  isLoading = false
}) => {
  const status = isCompleted ? 'completed' : 'pending';
  const StatusIcon = getStatusIcon(status);
  const statusColorClasses = getStatusColor(status);

  const getDifficultyLevel = (difficulty?: number): 'beginner' | 'intermediate' | 'advanced' => {
    if (!difficulty) return 'beginner';
    if (difficulty <= 3) return 'beginner';
    if (difficulty <= 7) return 'intermediate';
    return 'advanced';
  };

  const difficultyLevel = getDifficultyLevel(exercise.difficulty);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="flex items-start gap-3 mb-4">
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-2 rounded-lg shrink-0">
          <Target className="w-5 h-5 text-pink-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg truncate">{exercise.exerciseTypeName}</h3>
            <DifficultyBadge difficulty={difficultyLevel} />
          </div>
          <p className="text-gray-500 text-sm">Exercise #{index + 1}</p>
        </div>
      </div>

      <div className={`self-start px-3 py-1 rounded-full text-sm flex items-center gap-2 mb-4 ${statusColorClasses}`}>
        <StatusIcon className="w-4 h-4" />
        <span className="capitalize">{status}</span>
      </div>
      
      <div className="space-y-4 mt-auto">
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Difficulty: {exercise.difficulty}/10
          </span>
          <span className="flex items-center gap-1">
            <Trophy className="w-4 h-4" />
            Points: {exercise.points}
          </span>
        </div>
        
        <Button
          onClick={onStart}
          disabled={isLoading}
          variant={isCompleted ? 'ghost' : 'primary'}
          size="md"
          fullWidth
        >
          {isLoading ? 'Loading...' : isCompleted ? 'Try Again' : 'Start Now'}
        </Button>
      </div>
    </div>
  );
};

export default DailyChallengeExerciseCard;

