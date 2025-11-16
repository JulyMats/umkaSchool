import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Clock, ArrowLeft, Sparkles, Zap } from 'lucide-react';
import Layout from '../components/Layout';
import { exerciseTypeService, ExerciseType } from '../services/exerciseType.service';
import { DigitLength, ExerciseSessionConfig } from '../types/exercise';

interface LocationState {
  exerciseType?: ExerciseType;
}

const digitOptions: { value: DigitLength; label: string; description: string }[] = [
  { value: 1, label: '1 digit', description: 'Numbers from 1 to 9' },
  { value: 2, label: '2 digits', description: 'Numbers like 14 or 87' },
  { value: 3, label: '3 digits', description: 'Numbers up to 999' },
  { value: 4, label: '4 digits', description: 'Bigger numbers for super brains' }
];

export default function ExerciseSetup() {
  const { exerciseTypeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { exerciseType: stateExercise } = (location.state as LocationState) ?? {};

  const [exerciseType, setExerciseType] = useState<ExerciseType | null>(stateExercise ?? null);
  const [loading, setLoading] = useState(!stateExercise);
  const [error, setError] = useState<string | null>(null);

  // Default values (fallback if parameterRanges not available)
  const defaultRanges = {
    cardCount: [2, 20] as [number, number],
    displaySpeed: [0.5, 3.0] as [number, number],
    timePerQuestion: [2, 20] as [number, number]
  };

  // Get ranges from exerciseType or use defaults
  const ranges = exerciseType?.parameterRanges 
    ? {
        cardCount: exerciseType.parameterRanges.cardCount || defaultRanges.cardCount,
        displaySpeed: exerciseType.parameterRanges.displaySpeed || defaultRanges.displaySpeed,
        timePerQuestion: exerciseType.parameterRanges.timePerQuestion || defaultRanges.timePerQuestion
      }
    : defaultRanges;

  const [timePerQuestion, setTimePerQuestion] = useState(() => {
    const range = ranges.timePerQuestion || defaultRanges.timePerQuestion;
    return Math.round((range[0] + range[1]) / 2);
  });
  const [displaySpeed, setDisplaySpeed] = useState(() => {
    const range = ranges.displaySpeed || defaultRanges.displaySpeed;
    return Number(((range[0] + range[1]) / 2).toFixed(1));
  });
  const [cardCount, setCardCount] = useState(() => {
    const range = ranges.cardCount || defaultRanges.cardCount;
    return Math.round((range[0] + range[1]) / 2);
  });
  const [digitLength, setDigitLength] = useState<DigitLength>(1);

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

  if (loading) {
    return (
      <Layout title="Pick your settings" subtitle="Loading exercise...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (!exerciseType || error) {
    return (
      <Layout title="Pick your settings" subtitle="Something went wrong">
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl p-6">
          {error ?? 'We could not load this exercise type.'}
        </div>
        <button
          onClick={() => navigate('/exercises')}
          className="mt-6 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back to exercises
        </button>
      </Layout>
    );
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const config: ExerciseSessionConfig = {
      exerciseTypeId: exerciseType.id,
      exerciseTypeName: exerciseType.name,
      timePerQuestion,
      displaySpeed,
      cardCount,
      digitLength
    };

    navigate('/exercises/play', { state: { config } });
  };

  return (
    <Layout
      title={`Get ready for ${exerciseType.name}`}
      subtitle="Tune the settings to match your super-skills"
    >
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium mb-3">
              <Sparkles className="w-3 h-3" /> {difficultyLabel}
            </div>
            <p className="text-gray-600 max-w-2xl">{exerciseType.description}</p>
          </div>
          <div className="bg-blue-50 text-blue-700 rounded-2xl px-4 py-3 text-sm">
            <p className="font-semibold">Quick tip</p>
            <p className="text-blue-600">
              Start with fewer numbers and slower pace to warm up. Ready to go faster? Slide the controls!
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <section>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Step 1 · Answer time
            </h3>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-800 mb-1">How many seconds do you need to answer?</p>
                <p className="text-gray-500 text-sm">Choose between 2 and 20 seconds. You can always speed up later.</p>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={ranges.timePerQuestion?.[0] ?? 2}
                  max={ranges.timePerQuestion?.[1] ?? 20}
                  value={timePerQuestion}
                  onChange={(e) => setTimePerQuestion(Number(e.target.value))}
                  className="w-40"
                />
                <div className="flex items-center gap-2 text-blue-600 font-semibold">
                  <Clock className="w-4 h-4" />
                  <span>{timePerQuestion} s</span>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Step 2 · Card speed
            </h3>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-800 mb-1">How quickly should the cards flash?</p>
                <p className="text-gray-500 text-sm">Slide to choose between super slow (3.0s) and super fast (0.5s).</p>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={ranges.displaySpeed?.[0] ?? 0.5}
                  max={ranges.displaySpeed?.[1] ?? 3.0}
                  step={0.1}
                  value={displaySpeed}
                  onChange={(e) => setDisplaySpeed(Number(e.target.value))}
                  className="w-40"
                />
                <div className="flex items-center gap-2 text-blue-600 font-semibold">
                  <Zap className="w-4 h-4" />
                  <span>{displaySpeed.toFixed(1)} s/card</span>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Step 3 · Number of cards
            </h3>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-800 mb-1">How many cards do you want to see?</p>
                <p className="text-gray-500 text-sm">Build longer chains as you get stronger. Max: 20 cards.</p>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={ranges.cardCount?.[0] ?? 2}
                  max={ranges.cardCount?.[1] ?? 20}
                  value={cardCount}
                  onChange={(e) => setCardCount(Number(e.target.value))}
                  className="w-40"
                />
                <div className="text-blue-600 font-semibold text-lg">{cardCount}</div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Step 4 · Number size
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {digitOptions.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => setDigitLength(option.value)}
                  className={`text-left rounded-2xl border px-4 py-3 transition-colors ${
                    digitLength === option.value
                      ? 'border-blue-400 bg-blue-50 shadow-sm'
                      : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/60'
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-800">{option.label}</p>
                  <p className="text-xs text-gray-500">{option.description}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="bg-blue-50 border border-blue-100 rounded-3xl px-4 py-6 md:px-6">
            <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-4">
              Ready to play?
            </h3>
            <ul className="text-sm text-blue-700 space-y-2">
              <li>
                • You will see <strong>{cardCount}</strong> numbers with <strong>{digitOptions.find((d) => d.value === digitLength)?.label}</strong>.
              </li>
              <li>
                • Each card stays for <strong>{displaySpeed.toFixed(1)} seconds</strong>.
              </li>
              <li>
                • You have <strong>{timePerQuestion} seconds</strong> to type the final answer.
              </li>
            </ul>
          </section>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate('/exercises')}
              className="px-5 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-white transition-colors"
            >
              Back to list
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors"
            >
              Start the challenge
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
