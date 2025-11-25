import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Clock, ArrowLeft, Sparkles, Zap, Hash, Divide, X, Plus, Minus, BookOpen, Star, Trophy, Rocket } from 'lucide-react';
import { exerciseTypeService, ExerciseType } from '../services/exerciseType.service';
import { DigitLength, ExerciseSessionConfig, DigitType, SorobanTheme, FlashCardTheme } from '../types/exercise';

interface LocationState {
  exerciseType?: ExerciseType;
}

const digitOptions: { value: DigitLength; label: string; description: string; emoji: string }[] = [
  { value: 1, label: '1 digit', description: 'Numbers from 1 to 9', emoji: '🔢' },
  { value: 2, label: '2 digits', description: 'Numbers like 14 or 87', emoji: '🔢🔢' },
  { value: 3, label: '3 digits', description: 'Numbers up to 999', emoji: '🔢🔢🔢' },
  { value: 4, label: '4 digits', description: 'Bigger numbers for super brains', emoji: '🔢🔢🔢🔢' }
];

const digitTypeOptions: { value: DigitType; label: string; description: string; emoji: string }[] = [
  { value: 'single-digit', label: 'Single-digit', description: 'Numbers from 1 to 9', emoji: '1️⃣' },
  { value: 'two-digit', label: 'Two-digit', description: 'Numbers like 14 or 87', emoji: '2️⃣' },
  { value: 'three-digit', label: 'Three-digit', description: 'Numbers up to 999', emoji: '3️⃣' },
  { value: 'four-digit', label: 'Four-digit', description: 'Bigger numbers for super brains', emoji: '4️⃣' }
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
  
  const [digitLength, setDigitLength] = useState<DigitLength>(1);
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
      } catch (err) {
        console.error('Failed to load exercise type', err);
        setError('Could not find this exercise type.');
      } finally {
        setLoading(false);
      }
    };

    loadExerciseType();
  }, [exerciseType, exerciseTypeId]);

  const difficultyLabel = useMemo(() => {
    if (!exerciseType) return '';
    return exerciseType.difficulty.charAt(0).toUpperCase() + exerciseType.difficulty.slice(1);
  }, [exerciseType]);

  const exerciseTypeName = exerciseType?.name?.toLowerCase() || '';

  const isDivision = exerciseTypeName.includes('division');
  const isMultiplication = exerciseTypeName.includes('multiplication');
  const isAdditionSubtraction = exerciseTypeName.includes('addition') || exerciseTypeName.includes('subtraction');
  const isFlashCards = exerciseTypeName.includes('flash cards') && !exerciseTypeName.includes('active');
  const isFlashCardsActive = exerciseTypeName.includes('flash cards active');
  const isThemeTraining = exerciseTypeName.includes('theme training');

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 relative overflow-hidden">
        <div className="absolute top-10 left-10 text-6xl animate-bounce" style={{ animationDuration: '3s' }}>🐼</div>
        <div className="absolute top-20 right-20 text-5xl animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>🦁</div>
        <div className="absolute bottom-20 left-20 text-5xl animate-bounce" style={{ animationDuration: '2.8s', animationDelay: '1s' }}>🐨</div>
        <div className="absolute bottom-10 right-10 text-6xl animate-bounce" style={{ animationDuration: '3.2s', animationDelay: '1.5s' }}>🐯</div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-400 border-t-transparent"></div>
          <p className="text-xl font-bold bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            Loading your adventure...
          </p>
        </div>
      </div>
    );
  }

  if (!exerciseType || error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 relative overflow-hidden">
        <div className="absolute top-10 left-10 text-6xl animate-bounce" style={{ animationDuration: '3s' }}>🐼</div>
        <div className="absolute top-20 right-20 text-5xl animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>🦁</div>
        <div className="absolute bottom-20 left-20 text-5xl animate-bounce" style={{ animationDuration: '2.8s', animationDelay: '1s' }}>🐨</div>
        <div className="absolute bottom-10 right-10 text-6xl animate-bounce" style={{ animationDuration: '3.2s', animationDelay: '1.5s' }}>🐯</div>
        <div className="relative z-10 bg-white rounded-3xl shadow-xl p-8 border-4 border-red-300 max-w-md mx-4">
          <div className="text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
            <p className="text-gray-600 mb-6">{error ?? 'We could not load this exercise type.'}</p>
            <button
              onClick={() => navigate('/exercises')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold hover:from-pink-600 hover:to-purple-600 transition-all transform hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" /> Back to exercises
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const config: ExerciseSessionConfig = {
      exerciseTypeId: exerciseType.id,
      exerciseTypeName: exerciseType.name,
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
      const digitTypeMap: Record<DigitType, DigitLength> = {
        'single-digit': 1,
        'two-digit': 2,
        'three-digit': 3,
        'four-digit': 4
      };
      config.digitLength = digitTypeMap[digitType];
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
      const digitTypeMap: Record<DigitType, DigitLength> = {
        'single-digit': 1,
        'two-digit': 2,
        'three-digit': 3,
        'four-digit': 4
      };
      config.digitLength = digitTypeMap[digitType];
    }

    navigate('/exercises/play', { state: { config } });
  };

  const formatTime = (seconds: number): string => {
    if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    }
    return `${seconds}s`;
  };

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
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 relative overflow-hidden py-8 px-4 sm:px-6 lg:px-8">
      {/* Decorative animals */}
      <div className="absolute top-10 left-10 text-6xl animate-bounce" style={{ animationDuration: '3s' }}>🐼</div>
      <div className="absolute top-20 right-20 text-5xl animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>🦁</div>
      <div className="absolute bottom-20 left-20 text-5xl animate-bounce" style={{ animationDuration: '2.8s', animationDelay: '1s' }}>🐨</div>
      <div className="absolute bottom-10 right-10 text-6xl animate-bounce" style={{ animationDuration: '3.2s', animationDelay: '1.5s' }}>🐯</div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg text-pink-600 hover:text-pink-700 hover:bg-white transition-all transform hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-3">
            {exerciseType.name} 🎮
          </h1>
          
          <div className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${getDifficultyColor()} rounded-full shadow-lg text-white font-bold mb-3`}>
            <Trophy className="w-4 h-4" /> {difficultyLabel}
          </div>
          
          <p className="text-lg text-gray-700 max-w-2xl mx-auto mt-4">
            {exerciseType.description}
          </p>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 border-4 border-pink-300">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* DIVISION */}
            {isDivision && (
              <>
                <section className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Divide className="w-6 h-6 text-blue-600" /> Number of Examples ✨
                  </h3>
                  <div className="bg-white rounded-xl p-4 border-2 border-blue-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-gray-800 mb-1">How many division examples? 🤔</p>
                        <p className="text-sm text-gray-600">Choose between {ranges.exampleCount?.[0] || 1} and {ranges.exampleCount?.[1] || 30} examples.</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min={ranges.exampleCount?.[0] || 1}
                          max={ranges.exampleCount?.[1] || 30}
                          value={exampleCount}
                          onChange={(e) => setExampleCount(Number(e.target.value))}
                          className="w-40 accent-pink-500"
                        />
                        <div className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                          {exampleCount} 🎯
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-6 border-2 border-green-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Hash className="w-6 h-6 text-green-600" /> Dividend Digits 📊
                  </h3>
                  <div className="bg-white rounded-xl p-4 border-2 border-green-200 space-y-4">
                    <p className="text-sm text-gray-600">From {ranges.dividendDigits?.[0] || 2} to {ranges.dividendDigits?.[1] || 4} digits.</p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-gray-700 mb-2 block">Min digits</label>
                        <input
                          type="range"
                          min={ranges.dividendDigits?.[0] || 2}
                          max={ranges.dividendDigits?.[1] || 4}
                          value={dividendDigits[0]}
                          onChange={(e) => setDividendDigits([Number(e.target.value), dividendDigits[1]])}
                          className="w-full accent-green-500"
                        />
                        <div className="text-center text-green-600 font-bold text-lg mt-1">{dividendDigits[0]}</div>
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-gray-700 mb-2 block">Max digits</label>
                        <input
                          type="range"
                          min={dividendDigits[0]}
                          max={ranges.dividendDigits?.[1] || 4}
                          value={dividendDigits[1]}
                          onChange={(e) => setDividendDigits([dividendDigits[0], Number(e.target.value)])}
                          className="w-full accent-green-500"
                        />
                        <div className="text-center text-green-600 font-bold text-lg mt-1">{dividendDigits[1]}</div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 border-2 border-orange-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Hash className="w-6 h-6 text-orange-600" /> Divisor Digits 📐
                  </h3>
                  <div className="bg-white rounded-xl p-4 border-2 border-orange-200 space-y-4">
                    <p className="text-sm text-gray-600">From {ranges.divisorDigits?.[0] || 1} to {ranges.divisorDigits?.[1] || 3} digits.</p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-gray-700 mb-2 block">Min digits</label>
                        <input
                          type="range"
                          min={ranges.divisorDigits?.[0] || 1}
                          max={ranges.divisorDigits?.[1] || 3}
                          value={divisorDigits[0]}
                          onChange={(e) => setDivisorDigits([Number(e.target.value), divisorDigits[1]])}
                          className="w-full accent-orange-500"
                        />
                        <div className="text-center text-orange-600 font-bold text-lg mt-1">{divisorDigits[0]}</div>
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-gray-700 mb-2 block">Max digits</label>
                        <input
                          type="range"
                          min={divisorDigits[0]}
                          max={ranges.divisorDigits?.[1] || 3}
                          value={divisorDigits[1]}
                          onChange={(e) => setDivisorDigits([divisorDigits[0], Number(e.target.value)])}
                          className="w-full accent-orange-500"
                        />
                        <div className="text-center text-orange-600 font-bold text-lg mt-1">{divisorDigits[1]}</div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border-2 border-pink-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Clock className="w-6 h-6 text-pink-600" /> Answer Time ⏱️
                  </h3>
                  <div className="bg-white rounded-xl p-4 border-2 border-pink-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-gray-800 mb-1">Time per example</p>
                        <p className="text-sm text-gray-600">From {formatTime(ranges.timePerQuestion?.[0] || 60)} to {formatTime(ranges.timePerQuestion?.[1] || 600)}.</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min={ranges.timePerQuestion?.[0] || 60}
                          max={ranges.timePerQuestion?.[1] || 600}
                          step={30}
                          value={timePerQuestion}
                          onChange={(e) => setTimePerQuestion(Number(e.target.value))}
                          className="w-40 accent-pink-500"
                        />
                        <div className="flex items-center gap-2 text-pink-600 font-bold text-lg">
                          <Clock className="w-5 h-5" />
                          <span>{formatTime(timePerQuestion)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* MULTIPLICATION */}
            {isMultiplication && (
              <>
                <section className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <X className="w-6 h-6 text-blue-600" /> Number of Examples ✨
                  </h3>
                  <div className="bg-white rounded-xl p-4 border-2 border-blue-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-gray-800 mb-1">How many multiplication examples? 🤔</p>
                        <p className="text-sm text-gray-600">Choose between {ranges.exampleCount?.[0] || 1} and {ranges.exampleCount?.[1] || 30} examples.</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min={ranges.exampleCount?.[0] || 1}
                          max={ranges.exampleCount?.[1] || 30}
                          value={exampleCount}
                          onChange={(e) => setExampleCount(Number(e.target.value))}
                          className="w-40 accent-blue-500"
                        />
                        <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                          {exampleCount} 🎯
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-6 border-2 border-green-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Hash className="w-6 h-6 text-green-600" /> First Multiplier Digits 📊
                  </h3>
                  <div className="bg-white rounded-xl p-4 border-2 border-green-200 space-y-4">
                    <p className="text-sm text-gray-600">From {ranges.firstMultiplierDigits?.[0] || 1} to {ranges.firstMultiplierDigits?.[1] || 4} digits.</p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-gray-700 mb-2 block">Min digits</label>
                        <input
                          type="range"
                          min={ranges.firstMultiplierDigits?.[0] || 1}
                          max={ranges.firstMultiplierDigits?.[1] || 4}
                          value={firstMultiplierDigits[0]}
                          onChange={(e) => setFirstMultiplierDigits([Number(e.target.value), firstMultiplierDigits[1]])}
                          className="w-full accent-green-500"
                        />
                        <div className="text-center text-green-600 font-bold text-lg mt-1">{firstMultiplierDigits[0]}</div>
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-gray-700 mb-2 block">Max digits</label>
                        <input
                          type="range"
                          min={firstMultiplierDigits[0]}
                          max={ranges.firstMultiplierDigits?.[1] || 4}
                          value={firstMultiplierDigits[1]}
                          onChange={(e) => setFirstMultiplierDigits([firstMultiplierDigits[0], Number(e.target.value)])}
                          className="w-full accent-green-500"
                        />
                        <div className="text-center text-green-600 font-bold text-lg mt-1">{firstMultiplierDigits[1]}</div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Hash className="w-6 h-6 text-yellow-600" /> Value Range 🔢
                  </h3>
                  <div className="bg-white rounded-xl p-4 border-2 border-yellow-200 space-y-4">
                    <p className="text-sm text-gray-600">From {ranges.minValue || 1} to {ranges.maxValue || 9}.</p>
                    <div className="flex items-center gap-4">
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
                        <div className="text-center text-yellow-600 font-bold text-lg mt-1">{minValue}</div>
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
                        <div className="text-center text-yellow-600 font-bold text-lg mt-1">{maxValue}</div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border-2 border-pink-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Clock className="w-6 h-6 text-pink-600" /> Answer Time ⏱️
                  </h3>
                  <div className="bg-white rounded-xl p-4 border-2 border-pink-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-gray-800 mb-1">Time per example</p>
                        <p className="text-sm text-gray-600">From {formatTime(ranges.timePerQuestion?.[0] || 60)} to {formatTime(ranges.timePerQuestion?.[1] || 600)}.</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min={ranges.timePerQuestion?.[0] || 60}
                          max={ranges.timePerQuestion?.[1] || 600}
                          step={30}
                          value={timePerQuestion}
                          onChange={(e) => setTimePerQuestion(Number(e.target.value))}
                          className="w-40 accent-pink-500"
                        />
                        <div className="flex items-center gap-2 text-pink-600 font-bold text-lg">
                          <Clock className="w-5 h-5" />
                          <span>{formatTime(timePerQuestion)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* ADDITION/SUBTRACTION */}
            {(isAdditionSubtraction || isThemeTraining) && (
              <>
                <section className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border-2 border-pink-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Clock className="w-6 h-6 text-pink-600" /> Answer Time ⏱️
                  </h3>
                  <div className="bg-white rounded-xl p-4 border-2 border-pink-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-gray-800 mb-1">Time to answer</p>
                        <p className="text-sm text-gray-600">From {ranges.timePerQuestion?.[0] || 2} to {ranges.timePerQuestion?.[1] || 30} seconds.</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min={ranges.timePerQuestion?.[0] || 2}
                          max={ranges.timePerQuestion?.[1] || 30}
                          value={timePerQuestion}
                          onChange={(e) => setTimePerQuestion(Number(e.target.value))}
                          className="w-40 accent-pink-500"
                        />
                        <div className="flex items-center gap-2 text-pink-600 font-bold text-lg">
                          <Clock className="w-5 h-5" />
                          <span>{timePerQuestion}s</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Hash className="w-6 h-6 text-blue-600" /> Number of Cards 🎴
                  </h3>
                  <div className="bg-white rounded-xl p-4 border-2 border-blue-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-gray-800 mb-1">How many cards? 🎯</p>
                        <p className="text-sm text-gray-600">From {ranges.cardCount?.[0] || 2} to {ranges.cardCount?.[1] || 15} cards.</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min={ranges.cardCount?.[0] || 2}
                          max={ranges.cardCount?.[1] || 15}
                          value={cardCount}
                          onChange={(e) => setCardCount(Number(e.target.value))}
                          className="w-40 accent-blue-500"
                        />
                        <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                          {cardCount} 🎴
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border-2 border-purple-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Hash className="w-6 h-6 text-purple-600" /> Number Type 🔢
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {digitTypeOptions.map((option) => {
                      const isAvailable = !ranges.digitTypes || ranges.digitTypes.includes(option.value);
                      if (!isAvailable) return null;
                      
                      return (
                        <button
                          type="button"
                          key={option.value}
                          onClick={() => setDigitType(option.value)}
                          className={`text-left rounded-2xl border-2 px-6 py-4 transition-all transform hover:scale-105 ${
                            digitType === option.value
                              ? 'border-purple-400 bg-gradient-to-br from-purple-100 to-indigo-100 shadow-lg scale-105'
                              : 'border-gray-200 bg-white hover:border-purple-200 hover:bg-purple-50'
                          }`}
                        >
                          <div className="text-3xl mb-2">{option.emoji}</div>
                          <p className="text-base font-bold text-gray-800">{option.label}</p>
                          <p className="text-xs text-gray-600 mt-1">{option.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-yellow-600" /> Card Speed ⚡
                  </h3>
                  <div className="bg-white rounded-xl p-4 border-2 border-yellow-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-gray-800 mb-1">Card flip speed</p>
                        <p className="text-sm text-gray-600">From {ranges.displaySpeed?.[0] || 0.5} to {ranges.displaySpeed?.[1] || 10} seconds per card.</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min={ranges.displaySpeed?.[0] || 0.5}
                          max={ranges.displaySpeed?.[1] || 10}
                          step={0.1}
                          value={displaySpeed}
                          onChange={(e) => setDisplaySpeed(Number(e.target.value))}
                          className="w-40 accent-yellow-500"
                        />
                        <div className="flex items-center gap-2 text-yellow-600 font-bold text-lg">
                          <Zap className="w-5 h-5" />
                          <span>{displaySpeed.toFixed(1)}s/card</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {ranges.themes && ranges.themes.length > 0 && (
                  <section className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <BookOpen className="w-6 h-6 text-green-600" /> {isAdditionSubtraction ? 'Soroban Method 🧮' : 'Training Theme 🎯'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {ranges.themes.map((theme: string) => (
                        <button
                          type="button"
                          key={theme}
                          onClick={() => setSelectedTheme(theme)}
                          className={`text-left rounded-2xl border-2 px-6 py-4 transition-all transform hover:scale-105 ${
                            selectedTheme === theme
                              ? 'border-green-400 bg-gradient-to-br from-green-100 to-emerald-100 shadow-lg scale-105'
                              : 'border-gray-200 bg-white hover:border-green-200 hover:bg-green-50'
                          }`}
                        >
                          <p className="text-base font-bold text-gray-800">
                            {themeLabels[theme] || theme}
                          </p>
                        </button>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}

            {/* FLASH CARDS */}
            {(isFlashCards || isFlashCardsActive) && (
              <>
                {ranges.themes && ranges.themes.length > 0 && (
                  <section className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <BookOpen className="w-6 h-6 text-green-600" /> Number Range Theme 🎯
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {ranges.themes.map((theme: string) => (
                        <button
                          type="button"
                          key={theme}
                          onClick={() => setSelectedTheme(theme)}
                          className={`text-left rounded-2xl border-2 px-6 py-4 transition-all transform hover:scale-105 ${
                            selectedTheme === theme
                              ? 'border-green-400 bg-gradient-to-br from-green-100 to-emerald-100 shadow-lg scale-105'
                              : 'border-gray-200 bg-white hover:border-green-200 hover:bg-green-50'
                          }`}
                        >
                          <p className="text-base font-bold text-gray-800">
                            {themeLabels[theme] || theme}
                          </p>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                <section className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-yellow-600" /> Card Speed ⚡
                  </h3>
                  <div className="bg-white rounded-xl p-4 border-2 border-yellow-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-gray-800 mb-1">Card flip speed</p>
                        <p className="text-sm text-gray-600">From {ranges.displaySpeed?.[0] || 0.5} to {ranges.displaySpeed?.[1] || 10} seconds per card.</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min={ranges.displaySpeed?.[0] || 0.5}
                          max={ranges.displaySpeed?.[1] || 10}
                          step={0.1}
                          value={displaySpeed}
                          onChange={(e) => setDisplaySpeed(Number(e.target.value))}
                          className="w-40 accent-yellow-500"
                        />
                        <div className="flex items-center gap-2 text-yellow-600 font-bold text-lg">
                          <Zap className="w-5 h-5" />
                          <span>{displaySpeed.toFixed(1)}s/card</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* Summary section */}
            <section className="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 rounded-3xl p-6 border-4 border-pink-300">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500" /> Ready to play? 🎮
              </h3>
              <ul className="text-base text-gray-700 space-y-2 font-medium">
                {isDivision && (
                  <>
                    <li>🎯 You will solve <strong className="text-pink-600">{exampleCount}</strong> division examples</li>
                    <li>📊 Dividend: <strong className="text-green-600">{dividendDigits[0]}-{dividendDigits[1]} digits</strong>, Divisor: <strong className="text-orange-600">{divisorDigits[0]}-{divisorDigits[1]} digits</strong></li>
                    <li>⏱️ You have <strong className="text-pink-600">{formatTime(timePerQuestion)}</strong> per example</li>
                  </>
                )}
                {isMultiplication && (
                  <>
                    <li>🎯 You will solve <strong className="text-blue-600">{exampleCount}</strong> multiplication examples</li>
                    <li>📊 First multiplier: <strong className="text-green-600">{firstMultiplierDigits[0]}-{firstMultiplierDigits[1]} digits</strong></li>
                    <li>🔢 Second multiplier: <strong className="text-yellow-600">{minValue}-{maxValue}</strong></li>
                    <li>⏱️ You have <strong className="text-pink-600">{formatTime(timePerQuestion)}</strong> per example</li>
                  </>
                )}
                {(isAdditionSubtraction || isThemeTraining) && (
                  <>
                    <li>🎴 You will see <strong className="text-blue-600">{cardCount}</strong> cards with <strong className="text-purple-600">{digitTypeOptions.find((d) => d.value === digitType)?.label}</strong> numbers</li>
                    <li>⚡ Each card stays for <strong className="text-yellow-600">{displaySpeed.toFixed(1)} seconds</strong></li>
                    <li>⏱️ You have <strong className="text-pink-600">{timePerQuestion} seconds</strong> to type the final answer</li>
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
                    <li>⚡ Each card stays for <strong className="text-yellow-600">{displaySpeed.toFixed(1)} seconds</strong></li>
                  </>
                )}
              </ul>
            </section>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/exercises')}
                className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all transform hover:scale-105 font-semibold"
              >
                ← Back to list
              </button>
              <button
                type="submit"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 text-white font-bold text-lg hover:from-yellow-500 hover:via-pink-600 hover:to-purple-600 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
              >
                <Rocket className="w-5 h-5" />
                Start the challenge! 🚀
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
