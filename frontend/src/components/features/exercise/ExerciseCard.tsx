import { Exercise } from '../../../types/exercise';
import { formatExerciseParameters } from '../../../utils/exercise.utils';

interface ExerciseCardProps {
  exercise: Exercise;
  onClick?: (exerciseId: string) => void;
  showDetails?: boolean;
  variant?: 'default' | 'compact' | 'selectable' | 'info';
  selected?: boolean;
  onSelect?: (exerciseId: string) => void;
  disabled?: boolean;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  onClick,
  showDetails = true,
  variant = 'default',
  selected = false,
  onSelect,
  disabled = false
}) => {
  const handleClick = () => {
    if (!disabled && onClick) {
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
      <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2 border border-gray-100 dark:border-gray-700">
        <p className="font-medium text-gray-800 dark:text-gray-200">{exercise.exerciseTypeName}</p>
        {showDetails && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Difficulty: {exercise.difficulty ?? 'N/A'} • Points: {exercise.points ?? 'N/A'}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'selectable') {
    return (
      <label className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">{exercise.exerciseTypeName}</p>
          {showDetails && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formatExerciseParameters(exercise.parameters)}
            </p>
          )}
        </div>
        <input
          type="checkbox"
          checked={selected}
          onChange={handleSelect}
          className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
        />
      </label>
    );
  }

  if (variant === 'info') {
    return (
      <div className="w-full text-left bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-700">
        <div className="flex-1">
          <p className="font-medium text-gray-900 dark:text-gray-100">{exercise.exerciseTypeName}</p>
          {showDetails && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formatExerciseParameters(exercise.parameters)}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`w-full text-left rounded-lg p-4 border-2 transition-all ${
        disabled
          ? 'bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-60'
          : 'bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`font-medium ${disabled ? 'text-gray-500 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
            {exercise.exerciseTypeName}
          </p>
          {showDetails && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formatExerciseParameters(exercise.parameters)}
            </p>
          )}
        </div>
        {disabled ? (
          <div className="text-green-600 dark:text-green-400 font-medium text-sm">✓ Completed</div>
        ) : (
          <div className="text-blue-600 dark:text-blue-400 font-medium">Start →</div>
        )}
      </div>
    </button>
  );
};

export default ExerciseCard;

