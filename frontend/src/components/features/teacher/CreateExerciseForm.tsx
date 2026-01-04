import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { exerciseService } from '../../../services/exercise.service';
import { ExerciseType } from '../../../types/exerciseType';
import { Exercise, DigitType, DigitLength } from '../../../types/exercise';
import { extractErrorMessage, extractFieldErrors } from '../../../utils/error.utils';

interface CreateExerciseFormProps {
  exerciseTypes: ExerciseType[];
  teacherId: string;
  creating: boolean;
  error: string | null;
  onCreatingChange: (creating: boolean) => void;
  onErrorChange: (error: string | null) => void;
  onExerciseCreated: (exercise: Exercise) => void;
}

const digitTypeOptions: { value: DigitType; label: string }[] = [
  { value: 'single-digit', label: 'Single-digit' },
  { value: 'two-digit', label: 'Two-digit' },
  { value: 'three-digit', label: 'Three-digit' },
  { value: 'four-digit', label: 'Four-digit' }
];

const themeLabels: Record<string, string> = {
  'simple': 'Simple',
  'friend': 'Friend',
  'brother': 'Brother',
  'transition': 'Transition',
  'friend+brother': 'Friend + Brother',
  'friend+brat': 'Friend + Brat',
  '0-20': 'From 0 to 20',
  '0-9': 'From 0 to 9',
  '10-90': 'Tens (10-90)',
  '10-19': 'Two-digit (10-19)',
  '10-99': 'Two-digit (10-99)',
  '100-900': 'Hundreds (100-900)',
  '100-999': 'Three-digit (100-999)',
  'From 0 to 20': 'From 0 to 20',
  'From 0 to 9': 'From 0 to 9',
  'Tens (10-90)': 'Tens (10-90)',
  'Two-digit (10-19)': 'Two-digit (10-19)',
  'Two-digit (10-99)': 'Two-digit (10-99)',
  'Hundreds (100-900)': 'Hundreds (100-900)',
  'Three-digit (100-999)': 'Three-digit (100-999)'
};

const CreateExerciseForm: React.FC<CreateExerciseFormProps> = ({
  exerciseTypes,
  teacherId,
  creating,
  error,
  onCreatingChange,
  onErrorChange,
  onExerciseCreated
}) => {
  const [selectedExerciseTypeId, setSelectedExerciseTypeId] = useState<string>('');
  const [exerciseType, setExerciseType] = useState<ExerciseType | null>(null);

  const ranges = exerciseType?.parameterRanges || {};

  const [exampleCount, setExampleCount] = useState(() => {
    const range = ranges.exampleCount || [1, 30];
    return Math.round((range[0] + range[1]) / 2);
  });

  const [timePerQuestion, setTimePerQuestion] = useState(() => {
    const range = ranges.timePerQuestion || [2, 30];
    return Math.round((range[0] + range[1]) / 2);
  });

  const [displaySpeed, setDisplaySpeed] = useState(() => {
    const range = ranges.displaySpeed || [0.5, 10];
    return Number(((range[0] + range[1]) / 2).toFixed(1));
  });

  const [cardCount, setCardCount] = useState(() => {
    const range = ranges.cardCount || [2, 15];
    return Math.round((range[0] + range[1]) / 2);
  });

  const [digitType, setDigitType] = useState<DigitType>('single-digit');
  const [dividendDigits, setDividendDigits] = useState<[number, number]>(() => {
    const range = ranges.dividendDigits || [2, 4];
    return range as [number, number];
  });

  const [divisorDigits, setDivisorDigits] = useState<[number, number]>(() => {
    const range = ranges.divisorDigits || [1, 3];
    return range as [number, number];
  });

  const [firstMultiplierDigits, setFirstMultiplierDigits] = useState<[number, number]>(() => {
    const range = ranges.firstMultiplierDigits || [1, 4];
    return range as [number, number];
  });

  const [minValue, setMinValue] = useState(() => ranges.minValue || 1);
  const [maxValue, setMaxValue] = useState(() => ranges.maxValue || 9);
  const [selectedTheme, setSelectedTheme] = useState<string>(() => {
    const availableThemes = ranges.themes || [];
    return availableThemes[0] || '';
  });

  useEffect(() => {
    if (!selectedExerciseTypeId) {
      setExerciseType(null);
      return;
    }

    const foundType = exerciseTypes.find(et => et.id === selectedExerciseTypeId);
    if (foundType) {
      setExerciseType(foundType);
      const ranges = foundType.parameterRanges || {};
      
      if (ranges.exampleCount) {
        setExampleCount(Math.round((ranges.exampleCount[0] + ranges.exampleCount[1]) / 2));
      }
      if (ranges.timePerQuestion) {
        setTimePerQuestion(Math.round((ranges.timePerQuestion[0] + ranges.timePerQuestion[1]) / 2));
      }
      if (ranges.displaySpeed) {
        setDisplaySpeed(Number(((ranges.displaySpeed[0] + ranges.displaySpeed[1]) / 2).toFixed(1)));
      }
      if (ranges.cardCount) {
        setCardCount(Math.round((ranges.cardCount[0] + ranges.cardCount[1]) / 2));
      }
      if (ranges.dividendDigits) {
        setDividendDigits(ranges.dividendDigits as [number, number]);
      }
      if (ranges.divisorDigits) {
        setDivisorDigits(ranges.divisorDigits as [number, number]);
      }
      if (ranges.firstMultiplierDigits) {
        setFirstMultiplierDigits(ranges.firstMultiplierDigits as [number, number]);
      }
      if (ranges.minValue !== undefined) {
        setMinValue(ranges.minValue);
      }
      if (ranges.maxValue !== undefined) {
        setMaxValue(ranges.maxValue);
      }
      if (ranges.themes && ranges.themes.length > 0) {
        setSelectedTheme(ranges.themes[0]);
      }
    }
  }, [selectedExerciseTypeId, exerciseTypes]);

  const exerciseTypeName = exerciseType?.name?.toLowerCase() || '';
  const isDivision = exerciseTypeName.includes('division');
  const isMultiplication = exerciseTypeName.includes('multiplication');
  const isAdditionSubtraction = exerciseTypeName.includes('addition') || exerciseTypeName.includes('subtraction');
  const isFlashCards = exerciseTypeName.includes('flash cards') && !exerciseTypeName.includes('active');
  const isFlashCardsActive = exerciseTypeName.includes('flash cards active');
  const isThemeTraining = exerciseTypeName.includes('theme training');

  const calculateDifficulty = (): number => {
    if (!exerciseType) return 1;
    
    let difficulty = exerciseType.difficulty === 'beginner' ? 1 : exerciseType.difficulty === 'intermediate' ? 5 : 10;

    if (isDivision || isMultiplication) {
      const avgDigits = isDivision 
        ? (dividendDigits[0] + dividendDigits[1] + divisorDigits[0] + divisorDigits[1]) / 4
        : (firstMultiplierDigits[0] + firstMultiplierDigits[1]) / 2;
      difficulty = Math.min(10, Math.max(1, Math.round(difficulty + avgDigits * 1.5)));
    }

    if (isAdditionSubtraction || isThemeTraining) {
      const digitMap: Record<DigitType, number> = {
        'single-digit': 1,
        'two-digit': 2,
        'three-digit': 3,
        'four-digit': 4
      };
      const digitLength = digitMap[digitType] || 1;
      difficulty = Math.min(10, Math.max(1, Math.round(difficulty + digitLength * 1.2)));
    }

    return Math.min(10, Math.max(1, difficulty));
  };

  const calculatePoints = (): number => {
    const baseDifficulty = calculateDifficulty();
    return baseDifficulty * 10;
  };

  const handleSubmit = async (event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation(); 
    }
    
    if (!exerciseType) {
      onErrorChange('Please select an exercise type');
      return;
    }

    onErrorChange(null);
    onCreatingChange(true);

    try {
      const parameters: any = {
        exerciseTypeId: exerciseType.id,
        exerciseTypeName: exerciseType.name
      };

      if (isDivision) {
        parameters.exampleCount = exampleCount;
        parameters.dividendDigits = dividendDigits;
        parameters.divisorDigits = divisorDigits;
        parameters.timePerQuestion = timePerQuestion;
      }

      if (isMultiplication) {
        parameters.exampleCount = exampleCount;
        parameters.firstMultiplierDigits = firstMultiplierDigits;
        parameters.minValue = minValue;
        parameters.maxValue = maxValue;
        parameters.timePerQuestion = timePerQuestion;
      }

      if (isAdditionSubtraction) {
        parameters.timePerQuestion = timePerQuestion;
        parameters.cardCount = cardCount;
        parameters.digitType = digitType;
        parameters.theme = selectedTheme;
        parameters.displaySpeed = displaySpeed;
        const digitTypeMap: Record<DigitType, DigitLength> = {
          'single-digit': 1,
          'two-digit': 2,
          'three-digit': 3,
          'four-digit': 4
        };
        parameters.digitLength = digitTypeMap[digitType];
      }

      if (isFlashCards || isFlashCardsActive) {
        parameters.theme = selectedTheme;
        parameters.displaySpeed = displaySpeed;
      }

      if (isThemeTraining) {
        parameters.displaySpeed = displaySpeed;
        parameters.timePerQuestion = timePerQuestion;
        parameters.cardCount = cardCount;
        parameters.digitType = digitType;
        parameters.theme = selectedTheme;
        const digitTypeMap: Record<DigitType, DigitLength> = {
          'single-digit': 1,
          'two-digit': 2,
          'three-digit': 3,
          'four-digit': 4
        };
        parameters.digitLength = digitTypeMap[digitType];
      }

      const newExercise = await exerciseService.createExercise({
        exerciseTypeId: exerciseType.id,
        parameters: JSON.stringify(parameters),
        difficulty: calculateDifficulty(),
        points: calculatePoints(),
        createdById: teacherId
      });

      onExerciseCreated(newExercise);

      setSelectedExerciseTypeId('');
      setExerciseType(null);
    } catch (err: unknown) {
      console.error('[CreateExerciseForm] Failed to create exercise', err);
      let errorMessage = 'Failed to create exercise. Please try again.';
      
      const fieldErrors = extractFieldErrors(err);
      if (fieldErrors) {
        errorMessage = Object.entries(fieldErrors)
          .map(([field, message]) => `${field}: ${message}`)
          .join(', ');
      } else {
        errorMessage = extractErrorMessage(err, 'Failed to create exercise. Please try again.');
      }
      
      onErrorChange(errorMessage);
    } finally {
      onCreatingChange(false);
    }
  };

  const formatTime = (seconds: number): string => {
    if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    }
    return `${seconds}s`;
  };

  return (
    <div className="max-h-96 overflow-y-auto border border-gray-100 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-800">
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium animate-pulse">
          ⚠️ {error}
        </div>
      )}

      {creating && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-400 rounded-lg text-sm flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Creating exercise...
        </div>
      )}

      <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Exercise Type
          </label>
          <select
            value={selectedExerciseTypeId}
            onChange={(e) => setSelectedExerciseTypeId(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">Select exercise type...</option>
            {exerciseTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        {exerciseType && (
          <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            {/* Division Settings */}
            {isDivision && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Number of Examples: {exampleCount}
                  </label>
                  <input
                    type="range"
                    min={ranges.exampleCount?.[0] || 1}
                    max={ranges.exampleCount?.[1] || 30}
                    value={exampleCount}
                    onChange={(e) => setExampleCount(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Dividend: {dividendDigits[0]}-{dividendDigits[1]} digits
                    </label>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min={ranges.dividendDigits?.[0] || 2}
                        max={ranges.dividendDigits?.[1] || 4}
                        value={dividendDigits[0]}
                        onChange={(e) => setDividendDigits([Number(e.target.value), dividendDigits[1]])}
                        className="w-full accent-green-500"
                      />
                      <input
                        type="range"
                        min={dividendDigits[0]}
                        max={ranges.dividendDigits?.[1] || 4}
                        value={dividendDigits[1]}
                        onChange={(e) => setDividendDigits([dividendDigits[0], Number(e.target.value)])}
                        className="w-full accent-green-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Divisor: {divisorDigits[0]}-{divisorDigits[1]} digits
                    </label>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min={ranges.divisorDigits?.[0] || 1}
                        max={ranges.divisorDigits?.[1] || 3}
                        value={divisorDigits[0]}
                        onChange={(e) => setDivisorDigits([Number(e.target.value), divisorDigits[1]])}
                        className="w-full accent-orange-500"
                      />
                      <input
                        type="range"
                        min={divisorDigits[0]}
                        max={ranges.divisorDigits?.[1] || 3}
                        value={divisorDigits[1]}
                        onChange={(e) => setDivisorDigits([divisorDigits[0], Number(e.target.value)])}
                        className="w-full accent-orange-500"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Time per Question: {formatTime(timePerQuestion)}
                  </label>
                  <input
                    type="range"
                    min={ranges.timePerQuestion?.[0] || 60}
                    max={ranges.timePerQuestion?.[1] || 600}
                    step={30}
                    value={timePerQuestion}
                    onChange={(e) => setTimePerQuestion(Number(e.target.value))}
                    className="w-full accent-pink-500"
                  />
                </div>
              </>
            )}

            {/* Multiplication Settings */}
            {isMultiplication && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Number of Examples: {exampleCount}
                  </label>
                  <input
                    type="range"
                    min={ranges.exampleCount?.[0] || 1}
                    max={ranges.exampleCount?.[1] || 30}
                    value={exampleCount}
                    onChange={(e) => setExampleCount(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    First Multiplier: {firstMultiplierDigits[0]}-{firstMultiplierDigits[1]} digits
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min={ranges.firstMultiplierDigits?.[0] || 1}
                      max={ranges.firstMultiplierDigits?.[1] || 4}
                      value={firstMultiplierDigits[0]}
                      onChange={(e) => setFirstMultiplierDigits([Number(e.target.value), firstMultiplierDigits[1]])}
                      className="w-full accent-green-500"
                    />
                    <input
                      type="range"
                      min={firstMultiplierDigits[0]}
                      max={ranges.firstMultiplierDigits?.[1] || 4}
                      value={firstMultiplierDigits[1]}
                      onChange={(e) => setFirstMultiplierDigits([firstMultiplierDigits[0], Number(e.target.value)])}
                      className="w-full accent-green-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Min Value: {minValue}
                    </label>
                    <input
                      type="range"
                      min={ranges.minValue || 1}
                      max={ranges.maxValue || 9}
                      value={minValue}
                      onChange={(e) => setMinValue(Number(e.target.value))}
                      className="w-full accent-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Max Value: {maxValue}
                    </label>
                    <input
                      type="range"
                      min={minValue}
                      max={ranges.maxValue || 9}
                      value={maxValue}
                      onChange={(e) => setMaxValue(Number(e.target.value))}
                      className="w-full accent-yellow-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Time per Question: {formatTime(timePerQuestion)}
                  </label>
                  <input
                    type="range"
                    min={ranges.timePerQuestion?.[0] || 60}
                    max={ranges.timePerQuestion?.[1] || 600}
                    step={30}
                    value={timePerQuestion}
                    onChange={(e) => setTimePerQuestion(Number(e.target.value))}
                    className="w-full accent-pink-500"
                  />
                </div>
              </>
            )}

            {/* Addition/Subtraction Settings */}
            {(isAdditionSubtraction || isThemeTraining) && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Number of Cards: {cardCount}
                  </label>
                  <input
                    type="range"
                    min={ranges.cardCount?.[0] || 2}
                    max={ranges.cardCount?.[1] || 15}
                    value={cardCount}
                    onChange={(e) => setCardCount(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Digit Type
                  </label>
                  <select
                    value={digitType}
                    onChange={(e) => setDigitType(e.target.value as DigitType)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    {digitTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                {ranges.themes && ranges.themes.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Theme
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {ranges.themes.map((theme) => (
                        <button
                          key={theme}
                          type="button"
                          onClick={() => setSelectedTheme(theme)}
                          className={`px-3 py-1 rounded-lg text-sm border transition-colors ${
                            selectedTheme === theme
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                        >
                          {themeLabels[theme] || theme}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Display Speed: {displaySpeed}s
                  </label>
                  <input
                    type="range"
                    min={ranges.displaySpeed?.[0] || 0.5}
                    max={ranges.displaySpeed?.[1] || 10}
                    step={0.1}
                    value={displaySpeed}
                    onChange={(e) => setDisplaySpeed(Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>
                {isThemeTraining && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Time per Question: {formatTime(timePerQuestion)}
                    </label>
                    <input
                      type="range"
                      min={ranges.timePerQuestion?.[0] || 2}
                      max={ranges.timePerQuestion?.[1] || 30}
                      value={timePerQuestion}
                      onChange={(e) => setTimePerQuestion(Number(e.target.value))}
                      className="w-full accent-pink-500"
                    />
                  </div>
                )}
              </>
            )}

            {/* Flash Cards Settings */}
            {(isFlashCards || isFlashCardsActive) && (
              <>
                {ranges.themes && ranges.themes.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Theme
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {ranges.themes.map((theme) => (
                        <button
                          key={theme}
                          type="button"
                          onClick={() => setSelectedTheme(theme)}
                          className={`px-3 py-1 rounded-lg text-sm border transition-colors ${
                            selectedTheme === theme
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                        >
                          {themeLabels[theme] || theme}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Display Speed: {displaySpeed}s
                  </label>
                  <input
                    type="range"
                    min={ranges.displaySpeed?.[0] || 0.5}
                    max={ranges.displaySpeed?.[1] || 10}
                    step={0.1}
                    value={displaySpeed}
                    onChange={(e) => setDisplaySpeed(Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>
              </>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={creating || !exerciseType}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 text-sm font-medium"
            >
              {creating ? 'Creating...' : 'Create Exercise'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateExerciseForm;

