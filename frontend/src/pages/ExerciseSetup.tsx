import { FormEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Rocket, Clock, Divide, X, Zap, Hash } from 'lucide-react';
import { exerciseTypeService } from '../services/exerciseType.service';
import { ExerciseType } from '../types/exerciseType';
import { ExerciseSessionConfig, DigitType, SorobanTheme, FlashCardTheme } from '../types/exercise';
import { extractErrorMessage } from '../utils/error.utils';
import { digitTypeToLengthMap, formatTime } from '../config/exercise.config';
import { AnimatedBackground } from '../components/common';
import {
  ParameterSlider,
  RangeSlider,
  ThemeSelector,
  DigitTypeSelector,
  ExerciseTypeHeader,
  ExerciseSetupSummary
} from '../components/features/exercise';
import { Button } from '../components/ui';
import { LoadingState } from '../components/common';

interface LocationState {
  exerciseType?: ExerciseType;
}

export default function ExerciseSetup() {
  const { exerciseTypeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { exerciseType: stateExercise } = (location.state as LocationState) ?? {};

  const [exerciseType, setExerciseType] = useState<ExerciseType | null>(stateExercise ?? null);
  const [loading, setLoading] = useState(!stateExercise);
  const [error, setError] = useState<string | null>(null);

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
    if (exerciseType || !exerciseTypeId) {
      setLoading(false);
      return;
    }

    const loadExerciseType = async () => {
      try {
        const data = await exerciseTypeService.getExerciseTypeById(exerciseTypeId);
        setExerciseType(data);
        setError(null);
        
        if (data.parameterRanges?.themes && data.parameterRanges.themes.length > 0) {
          setSelectedTheme(data.parameterRanges.themes[0]);
        }
      } catch (err: unknown) {
        console.error('Failed to load exercise type', err);
        setError(extractErrorMessage(err, 'Could not find this exercise type.'));
      } finally {
        setLoading(false);
      }
    };

    loadExerciseType();
  }, [exerciseType, exerciseTypeId]);

  const exerciseTypeName = exerciseType?.name?.toLowerCase() || '';

  const isDivision = exerciseTypeName.includes('division');
  const isMultiplication = exerciseTypeName.includes('multiplication');
  const isAdditionSubtraction = exerciseTypeName.includes('addition') || exerciseTypeName.includes('subtraction');
  const isFlashCards = exerciseTypeName.includes('flash cards') && !exerciseTypeName.includes('active');
  const isFlashCardsActive = exerciseTypeName.includes('flash cards active');
  const isThemeTraining = exerciseTypeName.includes('theme training');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const config: ExerciseSessionConfig = {
      exerciseTypeId: exerciseType!.id,
      exerciseTypeName: exerciseType!.name,
    };

    if (isDivision) {
      config.exampleCount = exampleCount;
      config.dividendDigits = dividendDigits;
      config.divisorDigits = divisorDigits;
      config.timePerQuestion = timePerQuestion;
    }
    
    if (isMultiplication) {
      config.exampleCount = exampleCount;
      config.firstMultiplierDigits = firstMultiplierDigits;
      config.minValue = minValue;
      config.maxValue = maxValue;
      config.timePerQuestion = timePerQuestion;
    }
    
    if (isAdditionSubtraction) {
      config.timePerQuestion = timePerQuestion;
      config.cardCount = cardCount;
      config.digitType = digitType;
      config.theme = selectedTheme as SorobanTheme;
      config.displaySpeed = displaySpeed;
      config.digitLength = digitTypeToLengthMap[digitType];
    }
    
    if (isFlashCards || isFlashCardsActive) {
      config.theme = selectedTheme as FlashCardTheme;
      config.displaySpeed = displaySpeed;
    }
    
    if (isThemeTraining) {
      config.displaySpeed = displaySpeed;
      config.timePerQuestion = timePerQuestion;
      config.cardCount = cardCount;
      config.digitType = digitType;
      config.theme = selectedTheme as SorobanTheme;
      config.digitLength = digitTypeToLengthMap[digitType];
    }

    navigate('/exercises/play', { state: { config } });
  };

  if (loading) {
    return (
      <AnimatedBackground>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <LoadingState message="Loading your adventure..." size="lg" />
        </div>
      </AnimatedBackground>
    );
  }

  if (!exerciseType || error) {
    return (
      <AnimatedBackground>
        <div className="flex flex-col items-center justify-center min-h-screen py-8 px-4">
          <div className="bg-white rounded-3xl shadow-xl p-8 border-4 border-red-300 max-w-md mx-4">
            <div className="text-center">
              <div className="text-6xl mb-4">😕</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
              <p className="text-gray-600 mb-6">{error ?? 'We could not load this exercise type.'}</p>
              <Button
                onClick={() => navigate('/exercises')}
                variant="gradient-pink"
                className="inline-flex items-center gap-2"
              >
                ← Back to exercises
              </Button>
            </div>
          </div>
        </div>
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground>
      <div className="min-h-screen py-4 sm:py-8 px-3 sm:px-4 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <ExerciseTypeHeader
            exerciseType={exerciseType}
            onBack={() => navigate(-1)}
          />

          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 border-2 sm:border-4 border-pink-300">
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {/* DIVISION */}
              {isDivision && (
                <>
                  <ParameterSlider
                    label="Number of Examples ✨"
                    icon={<Divide className="w-6 h-6 text-blue-600" />}
                    value={exampleCount}
                    min={ranges.exampleCount?.[0] || 1}
                    max={ranges.exampleCount?.[1] || 30}
                    onChange={setExampleCount}
                    description={`Choose between ${ranges.exampleCount?.[0] || 1} and ${ranges.exampleCount?.[1] || 30} examples.`}
                    formatValue={(v) => `${v} 🎯`}
                    color="blue"
                  />

                  <RangeSlider
                    label="Dividend Digits 📊"
                    icon={<Hash className="w-6 h-6 text-green-600" />}
                    value={dividendDigits}
                    min={ranges.dividendDigits?.[0] || 2}
                    max={ranges.dividendDigits?.[1] || 4}
                    onChange={setDividendDigits}
                    description={`From ${ranges.dividendDigits?.[0] || 2} to ${ranges.dividendDigits?.[1] || 4} digits.`}
                    color="green"
                  />

                  <RangeSlider
                    label="Divisor Digits 📐"
                    icon={<Hash className="w-6 h-6 text-orange-600" />}
                    value={divisorDigits}
                    min={ranges.divisorDigits?.[0] || 1}
                    max={ranges.divisorDigits?.[1] || 3}
                    onChange={setDivisorDigits}
                    description={`From ${ranges.divisorDigits?.[0] || 1} to ${ranges.divisorDigits?.[1] || 3} digits.`}
                    color="orange"
                  />

                  <ParameterSlider
                    label="Answer Time ⏱️"
                    icon={<Clock className="w-6 h-6 text-pink-600" />}
                    value={timePerQuestion}
                    min={ranges.timePerQuestion?.[0] || 60}
                    max={ranges.timePerQuestion?.[1] || 600}
                    step={30}
                    onChange={setTimePerQuestion}
                    description={`From ${formatTime(ranges.timePerQuestion?.[0] || 60)} to ${formatTime(ranges.timePerQuestion?.[1] || 600)}.`}
                    formatValue={formatTime}
                    color="pink"
                  />
                </>
              )}

              {/* MULTIPLICATION */}
              {isMultiplication && (
                <>
                  <ParameterSlider
                    label="Number of Examples ✨"
                    icon={<X className="w-6 h-6 text-blue-600" />}
                    value={exampleCount}
                    min={ranges.exampleCount?.[0] || 1}
                    max={ranges.exampleCount?.[1] || 30}
                    onChange={setExampleCount}
                    description={`Choose between ${ranges.exampleCount?.[0] || 1} and ${ranges.exampleCount?.[1] || 30} examples.`}
                    formatValue={(v) => `${v} 🎯`}
                    color="blue"
                  />

                  <RangeSlider
                    label="First Multiplier Digits 📊"
                    icon={<Hash className="w-6 h-6 text-green-600" />}
                    value={firstMultiplierDigits}
                    min={ranges.firstMultiplierDigits?.[0] || 1}
                    max={ranges.firstMultiplierDigits?.[1] || 4}
                    onChange={setFirstMultiplierDigits}
                    description={`From ${ranges.firstMultiplierDigits?.[0] || 1} to ${ranges.firstMultiplierDigits?.[1] || 4} digits.`}
                    color="green"
                  />

                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-yellow-200">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                      <Hash className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" /> Value Range 🔢
                    </h3>
                    <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-yellow-200 space-y-3 sm:space-y-4">
                      <p className="text-xs sm:text-sm text-gray-600">From {ranges.minValue || 1} to {ranges.maxValue || 9}.</p>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                        <div className="flex-1">
                          <label className="text-xs font-semibold text-gray-700 mb-2 block">Min value</label>
                          <input
                            type="range"
                            min={ranges.minValue || 1}
                            max={ranges.maxValue || 9}
                            value={minValue}
                            onChange={(e) => setMinValue(Number(e.target.value))}
                            className="w-full accent-yellow-500"
                          />
                          <div className="text-center text-yellow-600 font-bold text-base sm:text-lg mt-1">{minValue}</div>
                        </div>
                        <div className="flex-1">
                          <label className="text-xs font-semibold text-gray-700 mb-2 block">Max value</label>
                          <input
                            type="range"
                            min={minValue}
                            max={ranges.maxValue || 9}
                            value={maxValue}
                            onChange={(e) => setMaxValue(Number(e.target.value))}
                            className="w-full accent-yellow-500"
                          />
                          <div className="text-center text-yellow-600 font-bold text-base sm:text-lg mt-1">{maxValue}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <ParameterSlider
                    label="Answer Time ⏱️"
                    icon={<Clock className="w-6 h-6 text-pink-600" />}
                    value={timePerQuestion}
                    min={ranges.timePerQuestion?.[0] || 60}
                    max={ranges.timePerQuestion?.[1] || 600}
                    step={30}
                    onChange={setTimePerQuestion}
                    description={`From ${formatTime(ranges.timePerQuestion?.[0] || 60)} to ${formatTime(ranges.timePerQuestion?.[1] || 600)}.`}
                    formatValue={formatTime}
                    color="pink"
                  />
                </>
              )}

              {/* ADDITION/SUBTRACTION */}
              {(isAdditionSubtraction || isThemeTraining) && (
                <>
                  <ParameterSlider
                    label="Answer Time ⏱️"
                    icon={<Clock className="w-6 h-6 text-pink-600" />}
                    value={timePerQuestion}
                    min={ranges.timePerQuestion?.[0] || 2}
                    max={ranges.timePerQuestion?.[1] || 30}
                    onChange={setTimePerQuestion}
                    description={`From ${ranges.timePerQuestion?.[0] || 2} to ${ranges.timePerQuestion?.[1] || 30} seconds.`}
                    formatValue={(v) => `${v}s`}
                    color="pink"
                  />

                  <ParameterSlider
                    label="Number of Cards 🎴"
                    icon={<Hash className="w-6 h-6 text-blue-600" />}
                    value={cardCount}
                    min={ranges.cardCount?.[0] || 2}
                    max={ranges.cardCount?.[1] || 15}
                    onChange={setCardCount}
                    description={`From ${ranges.cardCount?.[0] || 2} to ${ranges.cardCount?.[1] || 15} cards.`}
                    formatValue={(v) => `${v} 🎴`}
                    color="blue"
                  />

                  <DigitTypeSelector
                    selectedType={digitType}
                    onSelect={setDigitType}
                    availableTypes={ranges.digitTypes as DigitType[] | undefined}
                  />

                  <ParameterSlider
                    label="Card Speed ⚡"
                    icon={<Zap className="w-6 h-6 text-yellow-600" />}
                    value={displaySpeed}
                    min={ranges.displaySpeed?.[0] || 0.5}
                    max={ranges.displaySpeed?.[1] || 10}
                    step={0.1}
                    onChange={setDisplaySpeed}
                    description={`From ${ranges.displaySpeed?.[0] || 0.5} to ${ranges.displaySpeed?.[1] || 10} seconds per card.`}
                    formatValue={(v) => `${v.toFixed(1)}s/card`}
                    color="yellow"
                  />

                  {ranges.themes && ranges.themes.length > 0 && (
                    <ThemeSelector
                      themes={ranges.themes}
                      selectedTheme={selectedTheme}
                      onSelect={setSelectedTheme}
                      title={isAdditionSubtraction ? 'Soroban Method 🧮' : 'Training Theme 🎯'}
                    />
                  )}
                </>
              )}

              {/* FLASH CARDS */}
              {(isFlashCards || isFlashCardsActive) && (
                <>
                  {ranges.themes && ranges.themes.length > 0 && (
                    <ThemeSelector
                      themes={ranges.themes}
                      selectedTheme={selectedTheme}
                      onSelect={setSelectedTheme}
                      title="Number Range Theme 🎯"
                    />
                  )}

                  <ParameterSlider
                    label="Card Speed ⚡"
                    icon={<Zap className="w-6 h-6 text-yellow-600" />}
                    value={displaySpeed}
                    min={ranges.displaySpeed?.[0] || 0.5}
                    max={ranges.displaySpeed?.[1] || 10}
                    step={0.1}
                    onChange={setDisplaySpeed}
                    description={`From ${ranges.displaySpeed?.[0] || 0.5} to ${ranges.displaySpeed?.[1] || 10} seconds per card.`}
                    formatValue={(v) => `${v.toFixed(1)}s/card`}
                    color="yellow"
                  />
                </>
              )}

              <ExerciseSetupSummary
                config={{} as ExerciseSessionConfig}
                exerciseTypeName={exerciseType.name}
                exampleCount={exampleCount}
                dividendDigits={dividendDigits}
                divisorDigits={divisorDigits}
                firstMultiplierDigits={firstMultiplierDigits}
                minValue={minValue}
                maxValue={maxValue}
                cardCount={cardCount}
                digitType={digitType}
                displaySpeed={displaySpeed}
                timePerQuestion={timePerQuestion}
                selectedTheme={selectedTheme}
              />

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pt-4">
                <Button
                  type="button"
                  onClick={() => navigate('/exercises')}
                  variant="outline"
                  className="w-full sm:w-auto"
                  size="sm"
                >
                  ← Back to list
                </Button>
                <Button
                  type="submit"
                  variant="gradient-yellow"
                  size="lg"
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <Rocket className="w-5 h-5" />
                  Start the challenge! 🚀
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
}

