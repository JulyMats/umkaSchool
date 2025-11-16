import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCcw, Sparkles, Timer, X } from 'lucide-react';
import Layout from '../components/Layout';
import { ExerciseSessionConfig } from '../types/exercise';
import { useAuth } from '../contexts/AuthContext';
import { exerciseService } from '../services/exercise.service';
import { exerciseAttemptService, ExerciseAttempt } from '../services/exerciseAttempt.service';

interface LocationState {
  config?: ExerciseSessionConfig;
}

type Feedback = 'correct' | 'incorrect' | 'timeout' | null;

export default function ExercisePlay() {
  const navigate = useNavigate();
  const location = useLocation();
  const { config } = (location.state as LocationState) ?? {};
  const { student } = useAuth();

  const [sessionKey, setSessionKey] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [showAnswerBox, setShowAnswerBox] = useState(false);
  const [countdown, setCountdown] = useState(config?.timePerQuestion ?? 0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<Feedback>(null);
  
  // Session management
  const [currentAttempt, setCurrentAttempt] = useState<ExerciseAttempt | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [exerciseId, setExerciseId] = useState<string | null>(null);

  const displayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const answerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalAttemptsRef = useRef<number>(0);
  const totalCorrectRef = useRef<number>(0);
  const isInitializingRef = useRef<boolean>(false);
  const sessionCompletedRef = useRef<boolean>(false);

  const numbers = useMemo(() => (
    config ? generateNumbers(config.cardCount, config.digitLength) : []
  ), [config, sessionKey]);

  // Calculate result based on exercise type
  const total = useMemo(() => {
    if (numbers.length === 0) return 0;
    
    const exerciseTypeName = config?.exerciseTypeName?.toLowerCase() || '';
    
    if (exerciseTypeName.includes('addition') || exerciseTypeName.includes('add')) {
      // Addition: sum all numbers
      return numbers.reduce((sum, value) => sum + value, 0);
    } else if (exerciseTypeName.includes('subtraction') || exerciseTypeName.includes('subtract')) {
      // Subtraction: subtract all numbers from the first
      return numbers.slice(1).reduce((result, value) => result - value, numbers[0]);
    } else if (exerciseTypeName.includes('multiplication') || exerciseTypeName.includes('multiply')) {
      // Multiplication: multiply all numbers
      return numbers.reduce((product, value) => product * value, 1);
    } else if (exerciseTypeName.includes('division') || exerciseTypeName.includes('divide')) {
      // Division: divide first number by all others
      return numbers.slice(1).reduce((result, value) => result / value, numbers[0]);
    } else {
      // Default to addition
      return numbers.reduce((sum, value) => sum + value, 0);
    }
  }, [numbers, config?.exerciseTypeName]);

  // Initialize session and create ExerciseAttempt
  useEffect(() => {
    if (!config || !student?.id || sessionStarted || isInitializingRef.current) {
      return;
    }

    const initializeSession = async () => {
      // Prevent duplicate initialization
      if (isInitializingRef.current) {
        return;
      }
      
      isInitializingRef.current = true;

      try {
        // Create Exercise with settings
        const exerciseParams: any = {
          cardCount: config.cardCount,
          digitLength: config.digitLength,
          displaySpeed: config.displaySpeed,
          timePerQuestion: config.timePerQuestion
        };
        
        // Add min/max if provided
        if (config.min !== undefined) {
          exerciseParams.min = config.min;
        }
        if (config.max !== undefined) {
          exerciseParams.max = config.max;
        }
        
        const exerciseParamsJson = JSON.stringify(exerciseParams);

        // Calculate difficulty based on digit length and card count
        const difficulty = Math.min(10, Math.max(1, config.digitLength + Math.floor(config.cardCount / 3)));

        const exercise = await exerciseService.createExercise({
          exerciseTypeId: config.exerciseTypeId,
          parameters: exerciseParamsJson,
          difficulty: difficulty,
          points: difficulty * 10,
          createdById: undefined // Not required for student-created exercises
        });

        setExerciseId(exercise.id);

        // Create ExerciseAttempt
        const settings = JSON.stringify({
          timePerQuestion: config.timePerQuestion,
          displaySpeed: config.displaySpeed,
          cardCount: config.cardCount,
          digitLength: config.digitLength
        });

        const attempt = await exerciseAttemptService.createAttempt({
          studentId: student.id,
          exerciseId: exercise.id,
          startedAt: new Date().toISOString(),
          settings: settings
        });

        setCurrentAttempt(attempt);
        setSessionStarted(true);
        setSessionStartTime(new Date());
        setTotalAttempts(0);
        setTotalCorrect(0);
        totalAttemptsRef.current = 0;
        totalCorrectRef.current = 0;
        sessionCompletedRef.current = false; // Reset completion flag for new session
      } catch (error: any) {
        console.error('Failed to initialize session:', error);
        const errorMessage = error?.response?.data?.message || 
                            error?.response?.data?.error || 
                            error?.message || 
                            'Failed to start session. Please try again.';
        console.error('Error details:', {
          status: error?.response?.status,
          data: error?.response?.data,
          message: errorMessage
        });
        alert(`Failed to start session: ${errorMessage}`);
        isInitializingRef.current = false; // Reset on error
        navigate('/exercises');
      }
    };

    initializeSession();
  }, [config, student?.id, navigate, sessionStarted]);

  // Cleanup on unmount - complete the attempt
  useEffect(() => {
    return () => {
      // Only complete if session hasn't been completed yet
      if (currentAttempt && sessionStarted && exerciseId && !sessionCompletedRef.current) {
        // Use refs to get latest values
        const endTime = new Date();
        sessionCompletedRef.current = true;
        exerciseAttemptService.updateAttempt(currentAttempt.id, {
          completedAt: endTime.toISOString(),
          totalAttempts: totalAttemptsRef.current,
          totalCorrect: totalCorrectRef.current,
          score: totalCorrectRef.current * 10
        }).catch(err => console.error('Failed to complete session on unmount:', err));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAttempt?.id, sessionStarted, exerciseId]);

  const completeSession = async () => {
    if (!currentAttempt || !exerciseId || sessionCompletedRef.current) return;

    try {
      sessionCompletedRef.current = true;
      const endTime = new Date();

      await exerciseAttemptService.updateAttempt(currentAttempt.id, {
        completedAt: endTime.toISOString(),
        totalAttempts: totalAttempts,
        totalCorrect: totalCorrect,
        score: totalCorrect * 10 // Simple scoring
      });
    } catch (error) {
      console.error('Failed to complete session:', error);
      // Reset flag on error so cleanup can try again
      sessionCompletedRef.current = false;
    }
  };

  useEffect(() => {
    if (!config || numbers.length === 0 || !sessionStarted) {
      return undefined;
    }

    setDisplayIndex(0);
    setShowAnswerBox(false);
    setCountdown(config.timePerQuestion);
    setUserAnswer('');
    setFeedback(null);

    const runSequence = (index: number) => {
      setDisplayIndex(index);
      if (index < numbers.length - 1) {
        displayTimeoutRef.current = setTimeout(() => runSequence(index + 1), config.displaySpeed * 1000);
      } else {
        displayTimeoutRef.current = setTimeout(() => {
          setShowAnswerBox(true);
        }, config.displaySpeed * 1000);
      }
    };

    runSequence(0);

    return () => {
      if (displayTimeoutRef.current) {
        clearTimeout(displayTimeoutRef.current);
      }
      if (answerIntervalRef.current) {
        clearInterval(answerIntervalRef.current);
      }
    };
  }, [config, numbers, sessionKey, sessionStarted]);

  useEffect(() => {
    if (!config || !showAnswerBox || !sessionStarted) {
      return undefined;
    }

    setCountdown(config.timePerQuestion);

    if (answerIntervalRef.current) {
      clearInterval(answerIntervalRef.current);
    }

    answerIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(answerIntervalRef.current!);
          handleAnswer(false); // Timeout = incorrect
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (answerIntervalRef.current) {
        clearInterval(answerIntervalRef.current);
      }
    };
  }, [config, showAnswerBox, sessionStarted]);

  const handleAnswer = async (isCorrect: boolean) => {
    if (!currentAttempt) return;

    const newTotalAttempts = totalAttempts + 1;
    const newTotalCorrect = isCorrect ? totalCorrect + 1 : totalCorrect;

    setTotalAttempts(newTotalAttempts);
    setTotalCorrect(newTotalCorrect);
    
    // Update refs for cleanup
    totalAttemptsRef.current = newTotalAttempts;
    totalCorrectRef.current = newTotalCorrect;

    // Update attempt on backend
    try {
      await exerciseAttemptService.updateAttempt(currentAttempt.id, {
        totalAttempts: newTotalAttempts,
        totalCorrect: newTotalCorrect
      });
    } catch (error) {
      console.error('Failed to update attempt:', error);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!config || !currentAttempt) {
      return;
    }

    if (answerIntervalRef.current) {
      clearInterval(answerIntervalRef.current);
    }

    const parsedAnswer = Number(userAnswer.trim());
    if (!Number.isFinite(parsedAnswer)) {
      setFeedback('incorrect');
      await handleAnswer(false);
      return;
    }

    const isCorrect = parsedAnswer === total;
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    await handleAnswer(isCorrect);
  };

  const handleRetry = () => {
    if (answerIntervalRef.current) {
      clearInterval(answerIntervalRef.current);
    }
    setSessionKey((prev) => prev + 1);
  };

  const handleExit = async () => {
    if (currentAttempt && sessionStarted) {
      await completeSession();
    }
    navigate('/exercises');
  };

  if (!config || !student) {
    return (
      <Layout title="Error" subtitle="Missing configuration or student data">
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl p-6">
          <p>Unable to start exercise session. Please go back and try again.</p>
          <button
            onClick={() => navigate('/exercises')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Back to Exercises
          </button>
        </div>
      </Layout>
    );
  }

  if (!sessionStarted || !currentAttempt) {
    return (
      <Layout title="Loading..." subtitle="Preparing your session...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  const numbersShown = numbers.slice(0, displayIndex + 1);

  return (
    <Layout
      title={`Playing: ${config.exerciseTypeName}`}
      subtitle="Focus on the numbers, keep your rhythm, and trust your brain!"
    >
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleExit}
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" /> Exit session
        </button>
        <div className="text-sm text-gray-600">
          <span className="font-semibold">{totalCorrect}</span> / <span>{totalAttempts}</span> correct
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <header className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm uppercase text-gray-500 tracking-wide">Number flow</p>
              <h2 className="text-xl font-semibold text-gray-900">Watch the cards carefully</h2>
            </div>
            <div className="text-sm text-gray-500">
              Card {Math.min(displayIndex + 1, numbers.length)} / {numbers.length}
            </div>
          </header>

          <div className="flex flex-col items-center justify-center h-64 bg-gray-50 border border-gray-100 rounded-3xl relative overflow-hidden">
            {!showAnswerBox ? (
              <span className="text-6xl font-bold text-blue-600 drop-shadow-sm">
                {numbers[displayIndex] ?? 'Ready'}
              </span>
            ) : (
              <div className="w-full max-w-md px-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    {config.exerciseTypeName.includes('Addition') && 'Type the sum of the numbers you saw'}
                    {config.exerciseTypeName.includes('Subtraction') && 'Type the result of subtracting the numbers'}
                    {config.exerciseTypeName.includes('Multiplication') && 'Type the product of the numbers you saw'}
                    {config.exerciseTypeName.includes('Division') && 'Type the result of dividing the numbers'}
                    {!config.exerciseTypeName.includes('Addition') && 
                     !config.exerciseTypeName.includes('Subtraction') && 
                     !config.exerciseTypeName.includes('Multiplication') && 
                     !config.exerciseTypeName.includes('Division') && 
                     'Type the result'}
                  </label>
                  <input
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg text-center"
                    placeholder="Your answer"
                    disabled={feedback !== null}
                    autoFocus
                  />
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="inline-flex items-center gap-2">
                      <Timer className="w-4 h-4" />
                      {feedback === null ? `${countdown}s left` : 'Time stopped'}
                    </span>
                    <span className="text-gray-400">
                      {config.exerciseTypeName.includes('Addition') && 'Add every number in your head ✨'}
                      {config.exerciseTypeName.includes('Subtraction') && 'Subtract the numbers in your head ✨'}
                      {config.exerciseTypeName.includes('Multiplication') && 'Multiply every number in your head ✨'}
                      {config.exerciseTypeName.includes('Division') && 'Divide the numbers in your head ✨'}
                      {!config.exerciseTypeName.includes('Addition') && 
                       !config.exerciseTypeName.includes('Subtraction') && 
                       !config.exerciseTypeName.includes('Multiplication') && 
                       !config.exerciseTypeName.includes('Division') && 
                       'Calculate in your head ✨'}
                    </span>
                  </div>
                  <button
                    type="submit"
                    className="w-full px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
                    disabled={feedback !== null}
                  >
                    Check answer
                  </button>
                </form>
              </div>
            )}
          </div>

          {feedback && (
            <div className={`mt-6 rounded-2xl px-4 py-3 ${
              feedback === 'correct'
                ? 'bg-green-50 border border-green-100 text-green-700'
                : 'bg-red-50 border border-red-100 text-red-700'
            }`}>
              {feedback === 'correct' && <p>Fantastic! You nailed it. 🎉</p>}
              {feedback === 'incorrect' && (
                <p>Almost! The correct answer was <strong>{total}</strong>. Keep going!</p>
              )}
              {feedback === 'timeout' && (
                <p>Time&apos;s up! The right answer was <strong>{total}</strong>. Try once more!</p>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <RefreshCcw className="w-4 h-4" /> Next round
            </button>
            <button
              onClick={handleExit}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-white"
            >
              <X className="w-4 h-4" /> End session
            </button>
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="bg-blue-50 text-blue-700 rounded-2xl px-4 py-3 text-sm">
            <p className="font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4" /> Session summary</p>
            <p>You chose {numbers.length} cards with {digitLabel(config.digitLength)} numbers.</p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Problems solved:</span>
              <span className="font-semibold">{totalAttempts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Correct answers:</span>
              <span className="font-semibold text-green-600">{totalCorrect}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Accuracy:</span>
              <span className="font-semibold">
                {totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0}%
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
              Numbers shown
            </h3>
            <div className="flex flex-wrap gap-2">
              {numbersShown.map((number, index) => (
                <span
                  key={`${number}-${index}`}
                  className={`px-3 py-1 rounded-full text-sm ${
                    index === displayIndex && !showAnswerBox ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {number}
                </span>
              ))}
              {showAnswerBox && numbersShown.length < numbers.length && (
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-400 text-sm">...</span>
              )}
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Cards:</strong> {numbers.length}</p>
            <p><strong>Speed:</strong> {config.displaySpeed.toFixed(1)} seconds per card</p>
            <p><strong>Answer time:</strong> {config.timePerQuestion} seconds</p>
          </div>
        </section>
      </div>
    </Layout>
  );
}

function generateNumbers(count: number, digitLength: number, min?: number, max?: number): number[] {
  const numbers: number[] = [];
  for (let i = 0; i < count; i += 1) {
    numbers.push(generateNumber(digitLength, min, max));
  }
  return numbers;
}

function generateNumber(digitLength: number, min?: number, max?: number): number {
  // Use provided min/max if available, otherwise calculate from digitLength
  let calculatedMin: number;
  let calculatedMax: number;
  
  if (min !== undefined && max !== undefined) {
    calculatedMin = min;
    calculatedMax = max;
  } else {
    // Default calculation based on digitLength
    calculatedMin = digitLength === 1 ? 1 : Math.pow(10, digitLength - 1);
    calculatedMax = Math.pow(10, digitLength) - 1;
  }
  
  return Math.floor(Math.random() * (calculatedMax - calculatedMin + 1)) + calculatedMin;
}

function digitLabel(length: number): string {
  switch (length) {
    case 1:
      return 'one-digit';
    case 2:
      return 'two-digit';
    case 3:
      return 'three-digit';
    case 4:
      return 'four-digit';
    default:
      return 'multi-digit';
  }
}
