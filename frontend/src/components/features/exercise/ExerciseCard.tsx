import { Exercise } from '../../../types/exercise';
import { formatExerciseParameters } from '../../../utils/exercise.utils';

interface ExerciseCardProps {
  exercise: Exercise;
  onClick?: (exerciseId: string) => void;
  showDetails?: boolean;
  variant?: 'default' | 'compact' | 'selectable';
  selected?: boolean;
  onSelect?: (exerciseId: string) => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  onClick,
  showDetails = true,
  variant = 'default',
  selected = false,
  onSelect
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(exercise.id);
    }
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelect) {
      onSelect(exercise.id);
    }
  };

  if (variant === 'compact') {
    return (
      <div className="text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
        <p className="font-medium text-gray-800">{exercise.exerciseTypeName}</p>
        {showDetails && (
          <p className="text-xs text-gray-500 mt-1">
            Difficulty: {exercise.difficulty ?? 'N/A'} • Points: {exercise.points ?? 'N/A'}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'selectable') {
    return (
      <label className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-gray-50 cursor-pointer border rounded-lg">
        <div>
          <p className="font-medium text-gray-900">{exercise.exerciseTypeName}</p>
          {showDetails && (
            <p className="text-xs text-gray-500 mt-1">
              {formatExerciseParameters(exercise.parameters)}
            </p>
          )}
        </div>
        <input
          type="checkbox"
          checked={selected}
          onChange={handleSelect}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </label>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="w-full text-left bg-gray-50 hover:bg-blue-50 rounded-lg p-4 border-2 border-gray-200 hover:border-blue-300 transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-medium text-gray-900">{exercise.exerciseTypeName}</p>
          {showDetails && (
            <p className="text-xs text-gray-500 mt-1">
              {formatExerciseParameters(exercise.parameters)}
            </p>
          )}
        </div>
        <div className="text-blue-600 font-medium">Start →</div>
      </div>
    </button>
  );
};

export default ExerciseCard;

