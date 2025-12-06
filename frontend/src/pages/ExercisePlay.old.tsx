import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCcw, Sparkles, Timer, X, Target, Eye, EyeOff, Info } from 'lucide-react';
import { ExerciseSessionConfig } from '../types/exercise';
import { useAuth } from '../contexts/AuthContext';
import { exerciseService } from '../services/exercise.service';
import { exerciseAttemptService } from '../services/exerciseAttempt.service';
import { achievementService } from '../services/achievement.service';
import { ExerciseAttempt } from '../types/exerciseAttempt';
import { StudentAchievement } from '../types/achievement';
import { AchievementModal } from '../components/features/achievement';
import { extractErrorMessage, extractErrorStatus } from '../utils/error.utils';

interface LocationState {
  config?: ExerciseSessionConfig;
}

type Feedback = 'correct' | 'incorrect' | 'timeout' | null;

export default function ExercisePlay() {
  const navigate = useNavigate();
  const location = useLocation();
  const { config } = (location.state as LocationState) ?? {};
  const { student } = useAuth();

  const [displayIndex, setDisplayIndex] = useState(0);
  const [showAnswerBox, setShowAnswerBox] = useState(false);
  const [countdown, setCountdown] = useState(config?.timePerQuestion ?? 0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [showNumbers, setShowNumbers] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  
  // Session management
  const [currentAttempt, setCurrentAttempt] = useState<ExerciseAttempt | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [exerciseId, setExerciseId] = useState<string | null>(null);

  // Achievement management
  const [newAchievements, setNewAchievements] = useState<StudentAchievement[]>([]);
  const [currentAchievementIndex, setCurrentAchievementIndex] = useState(0);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const previousAchievementsRef = useRef<Set<string>>(new Set());

  const displayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const answerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalAttemptsRef = useRef<number>(0);
  const totalCorrectRef = useRef<number>(0);
  const isInitializingRef = useRef<boolean>(false);
  const sessionCompletedRef = useRef<boolean>(false);

  // Numbers and expected answer from backend
  const [numbers, setNumbers] = useState<number[]>([]);
  const [expectedAnswer, setExpectedAnswer] = useState<number | null>(null);
  const [loadingNumbers, setLoadingNumbers] = useState(false);

  const exerciseTypeNameForSigns = config?.exerciseTypeName?.toLowerCase() || '';
  const isSubtraction = exerciseTypeNameForSigns.includes('subtraction') || exerciseTypeNameForSigns.includes('subtract');

  const formatNumberWithSign = (number: number, index: number): string => {
    if (index === 0) {
      return isSubtraction ? `-${number}` : `+${number}`;
    }
    return isSubtraction ? `-${number}` : `+${number}`;
  };

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

        // Backend will calculate difficulty and points automatically if not provided
        const exercise = await exerciseService.createExercise({
          exerciseTypeId: config.exerciseTypeId,
          parameters: exerciseParamsJson
          // difficulty and points are optional - backend will calculate them
          // createdById is optional - not required for student-created exercises
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
        setTotalAttempts(0);
        setTotalCorrect(0);
        totalAttemptsRef.current = 0;
        totalCorrectRef.current = 0;
        sessionCompletedRef.current = false; // Reset completion flag for new session
        
        // Generate numbers from backend
        await generateNewNumbers(exercise.id);
        
        try {
          const initialAchievements = await achievementService.getStudentAchievements(student.id);
          previousAchievementsRef.current = new Set(initialAchievements.map(a => a.achievementId));
        } catch (error) {
          console.error('Failed to fetch initial achievements:', error);
          previousAchievementsRef.current = new Set();
        }
      } catch (error: unknown) {
        console.error('Failed to initialize session:', error);
        const errorMessage = extractErrorMessage(error, 'Failed to start session. Please try again.');
        console.error('Error details:', {
          status: extractErrorStatus(error),
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
    if (!currentAttempt || !exerciseId || sessionCompletedRef.current || !student) return;

    try {
      sessionCompletedRef.current = true;
      const endTime = new Date();

      // Backend will calculate score automatically based on totalAttempts and totalCorrect
      await exerciseAttemptService.updateAttempt(currentAttempt.id, {
        completedAt: endTime.toISOString(),
        totalAttempts: totalAttempts,
        totalCorrect: totalCorrect
        // Score will be calculated by backend
      });

  
      setTimeout(async () => {
        try {
          const allCurrentAchievements = await achievementService.getStudentAchievements(student.id);
          const currentAchievementIds = new Set(allCurrentAchievements.map(a => a.achievementId));
          
          const newlyEarned = allCurrentAchievements.filter(
            achievement => !previousAchievementsRef.current.has(achievement.achievementId)
          );
          
          if (newlyEarned.length > 0) {
            setNewAchievements(newlyEarned);
            setCurrentAchievementIndex(0);
            setShowAchievementModal(true);
          } else {
            navigate('/exercises');
          }
          
          previousAchievementsRef.current = currentAchievementIds;
        } catch (error) {
          console.error('Failed to fetch achievements:', error);
        }
      }, 500); 
    } catch (error) {
      console.error('Failed to complete session:', error);
      // Reset flag on error so cleanup can try again
      sessionCompletedRef.current = false;
    }
  };

  const handleAchievementModalClose = () => {
    if (currentAchievementIndex < newAchievements.length - 1) {
      setCurrentAchievementIndex(currentAchievementIndex + 1);
    } else {
      setShowAchievementModal(false);
      setNewAchievements([]);
      setCurrentAchievementIndex(0);
      
      navigate('/exercises');
    }
  };

  useEffect(() => {
    if (!config || numbers.length === 0 || !sessionStarted || loadingNumbers) {
      return undefined;
    }

    setDisplayIndex(0);
    setShowAnswerBox(false);
    setCountdown(config.timePerQuestion ?? 10);
    setUserAnswer('');
    setFeedback(null);
    setShowNumbers(false);

    const displaySpeed = config.displaySpeed ?? 1;
    const runSequence = (index: number) => {
      setDisplayIndex(index);
      if (index < numbers.length - 1) {
        displayTimeoutRef.current = setTimeout(() => runSequence(index + 1), displaySpeed * 1000);
      } else {
        displayTimeoutRef.current = setTimeout(() => {
          setShowAnswerBox(true);
        }, displaySpeed * 1000);
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
  }, [config, numbers, sessionStarted, loadingNumbers]);

  useEffect(() => {
    if (!config || !showAnswerBox || !sessionStarted) {
      return undefined;
    }

    setCountdown(config.timePerQuestion ?? 10);

    if (answerIntervalRef.current) {
      clearInterval(answerIntervalRef.current);
    }

    answerIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(answerIntervalRef.current!);
          handleAnswer(false);
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

  const generateNewNumbers = useCallback(async (exerciseId: string) => {
    if (!config) return;
    
    setLoadingNumbers(true);
    try {
      const response = await exerciseService.generateExerciseNumbers({
        exerciseId: exerciseId,
        cardCount: config.cardCount,
        digitLength: config.digitLength,
        min: config.min,
        max: config.max
      });
      
      setNumbers(response.numbers);
      setExpectedAnswer(response.expectedAnswer);
    } catch (error) {
      console.error('Failed to generate numbers:', error);
      alert('Failed to generate exercise numbers. Please try again.');
    } finally {
      setLoadingNumbers(false);
    }
  }, [config]);

  const handleRetry = useCallback(async () => {
    if (answerIntervalRef.current) {
      clearInterval(answerIntervalRef.current);
    }
    setFeedback(null);
    setUserAnswer('');
    setShowNumbers(false);
    
    // Generate new numbers from backend
    if (exerciseId) {
      await generateNewNumbers(exerciseId);
    }
  }, [exerciseId, generateNewNumbers]);

  useEffect(() => {
    if (!sessionStarted || (!feedback && countdown !== 0)) {
      return undefined;
    }

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleRetry();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [feedback, countdown, sessionStarted, handleRetry]);

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
    if (!config || !currentAttempt || !exerciseId || numbers.length === 0) {
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

    // Validate answer using backend
    try {
      const validation = await exerciseService.validateAnswer({
        exerciseId: exerciseId,
        numbers: numbers,
        studentAnswer: parsedAnswer
      });
      
      const isCorrect = validation.isCorrect;
      setFeedback(isCorrect ? 'correct' : 'incorrect');
      await handleAnswer(isCorrect);
      
      // Update expected answer if we don't have it yet (shouldn't happen, but safety check)
      if (expectedAnswer === null && validation.expectedAnswer !== null) {
        setExpectedAnswer(validation.expectedAnswer);
      }
    } catch (error) {
      console.error('Failed to validate answer:', error);
      // Fallback: compare with expected answer if we have it
      const isCorrect = expectedAnswer !== null && Math.abs(parsedAnswer - expectedAnswer) < 0.0001;
      setFeedback(isCorrect ? 'correct' : 'incorrect');
      await handleAnswer(isCorrect);
    }
  };

  const handleExit = async () => {
    if (currentAttempt && sessionStarted && !sessionCompletedRef.current) {
      await completeSession();
    } else {
      navigate('/exercises');
    }
  };

  if (!config || !student) {
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
            <p className="text-gray-600 mb-6">Unable to start exercise session. Please go back and try again.</p>
            <button
              onClick={() => navigate('/exercises')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold hover:from-pink-600 hover:to-purple-600 transition-all transform hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" /> Back to Exercises
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!sessionStarted || !currentAttempt) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 relative overflow-hidden">
        <div className="absolute top-10 left-10 text-6xl animate-bounce" style={{ animationDuration: '3s' }}>🐼</div>
        <div className="absolute top-20 right-20 text-5xl animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>🦁</div>
        <div className="absolute bottom-20 left-20 text-5xl animate-bounce" style={{ animationDuration: '2.8s', animationDelay: '1s' }}>🐨</div>
        <div className="absolute bottom-10 right-10 text-6xl animate-bounce" style={{ animationDuration: '3.2s', animationDelay: '1.5s' }}>🐯</div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-400 border-t-transparent"></div>
          <p className="text-xl font-bold bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            Preparing your adventure... 🚀
          </p>
        </div>
      </div>
    );
  }

  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 relative overflow-hidden py-8 px-4 sm:px-6 lg:px-8">
      {/* Decorative animals */}
      <div className="absolute top-10 left-10 text-6xl animate-bounce" style={{ animationDuration: '3s' }}>🐼</div>
      <div className="absolute top-20 right-20 text-5xl animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>🦁</div>
      <div className="absolute bottom-20 left-20 text-5xl animate-bounce" style={{ animationDuration: '2.8s', animationDelay: '1s' }}>🐨</div>
      <div className="absolute bottom-10 right-10 text-6xl animate-bounce" style={{ animationDuration: '3.2s', animationDelay: '1.5s' }}>🐯</div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleExit}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg text-pink-600 hover:text-pink-700 hover:bg-white transition-all transform hover:scale-105 font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Exit
          </button>
          <div className="flex items-center gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-2 shadow-lg">
              <span className="text-lg font-bold text-pink-600">{totalCorrect}</span>
              <span className="text-gray-500 mx-2">/</span>
              <span className="text-lg font-semibold text-gray-700">{totalAttempts}</span>
              <span className="ml-2 text-green-500">✅</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-3">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-2">
            {config.exerciseTypeName} 🎮
          </h1>
          <p className="text-lg text-gray-700">Watch the cards carefully! 👀</p>
        </div>

        {/* Main game area */}
        <section className="bg-white rounded-3xl shadow-2xl border-4 border-pink-300 p-6 md:p-8">
          <div className="flex flex-col items-center justify-center h-96 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-4 border-blue-200 rounded-3xl relative overflow-hidden">
            {!showAnswerBox ? (
              <div className="text-center">
                <span className="text-8xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg animate-pulse">
                  {numbers[displayIndex] ?? 'Ready'}
                </span>
              </div>
            ) : (
              <div className="w-full max-w-md px-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="inline-flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full font-bold text-yellow-700">
                      <Timer className="w-5 h-5" />
                      {feedback === null ? `${countdown}s left ⏱️` : 'Time stopped ⏸️'}
                    </span>
                    <span className="text-gray-600 font-semibold text-center">
                      {config.exerciseTypeName.includes('Addition') && 'Add in your head! 🧠✨'}
                      {config.exerciseTypeName.includes('Subtraction') && 'Subtract in your head! 🧠✨'}
                      {config.exerciseTypeName.includes('Multiplication') && 'Multiply in your head! 🧠✨'}
                      {config.exerciseTypeName.includes('Division') && 'Divide in your head! 🧠✨'}
                      {!config.exerciseTypeName.includes('Addition') && 
                       !config.exerciseTypeName.includes('Subtraction') && 
                       !config.exerciseTypeName.includes('Multiplication') && 
                       !config.exerciseTypeName.includes('Division') && 
                       'Calculate in your head! 🧠✨'}
                    </span>
                  </div>
                  <label className="block text-center text-sm font-semibold text-gray-700 mb-2">Your answer</label>
                  <input
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="w-full px-6 py-4 border-4 border-pink-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-400 focus:border-pink-500 text-2xl text-center font-bold transition-all"
                    placeholder=""
                    disabled={feedback !== null || countdown === 0}
                    autoFocus
                  />
                  <div className="mt-6">
                    <button
                      type="submit"
                      className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 text-white font-bold text-lg hover:from-yellow-500 hover:via-pink-600 hover:to-purple-600 transition-all transform hover:scale-105 shadow-lg disabled:opacity-60 disabled:transform-none"
                      disabled={feedback !== null || countdown === 0}
                    >
                      Check Answer! ✅
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {feedback && (
            <div className={`mt-6 rounded-2xl px-6 py-4 border-4 ${
              feedback === 'correct'
                ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-300 text-green-800'
                : 'bg-gradient-to-r from-red-100 to-rose-100 border-red-300 text-red-800'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">
                  {feedback === 'correct' ? '🎉' : feedback === 'timeout' ? '⏰' : '😔'}
                </span>
                <div>
                  {feedback === 'correct' && (
                    <p className="text-lg font-bold">Fantastic! You nailed it! 🎊</p>
                  )}
                  {feedback === 'incorrect' && (
                    <p className="text-lg font-bold">
                      Almost! The correct answer was <strong className="text-2xl">{expectedAnswer ?? 'N/A'}</strong>. Keep going! 💪
                    </p>
                  )}
                  {feedback === 'timeout' && (
                    <p className="text-lg font-bold">
                      Time's up! The right answer was <strong className="text-2xl">{expectedAnswer ?? 'N/A'}</strong>. Try once more! 🔄
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3 justify-center">
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-blue-400 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all transform hover:scale-105 font-bold shadow-lg"
            >
              <RefreshCcw className="w-5 h-5" /> Next round 🎯
            </button>
            <button
              onClick={handleExit}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-all transform hover:scale-105 font-bold shadow-lg"
            >
              <X className="w-5 h-5" /> End session
            </button>
            {(feedback || countdown === 0) && (
              <button
                onClick={() => setShowNumbers(!showNumbers)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-purple-400 bg-purple-50 text-purple-700 hover:bg-purple-100 transition-all transform hover:scale-105 font-bold shadow-lg"
              >
                {showNumbers ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                {showNumbers ? 'Hide' : 'Show'} Numbers 🔢
              </button>
            )}
          </div>
        </section>

        {/* Numbers overlay - centered modal */}
        {showNumbers && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowNumbers(false)}>
            <div className="bg-white rounded-3xl shadow-2xl border-4 border-purple-300 p-8 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Target className="w-6 h-6 text-purple-600" /> Numbers Shown 🔢
                </h3>
                <button
                  onClick={() => setShowNumbers(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
              <div className="text-center space-y-4">
                {numbers.map((number, index) => (
                  <div key={`${number}-${index}`} className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {formatNumberWithSign(number, index)}
                  </div>
                ))}
                <div className="mt-6 pt-6 border-t-2 border-gray-200">
                  <p className="text-3xl font-bold text-gray-800">= {expectedAnswer ?? 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Session summary - bottom icon with hover */}
        <div className="fixed bottom-10 right-40 z-40">
          <div className="relative">
            <button
              onMouseEnter={() => setShowSummary(true)}
              onMouseLeave={() => setShowSummary(false)}
              className="p-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full shadow-2xl hover:from-pink-600 hover:to-purple-600 transition-all transform hover:scale-110"
            >
              <Info className="w-6 h-6" />
            </button>
            
            {showSummary && (
              <div className="absolute bottom-full right-0 mb-4 bg-white rounded-2xl shadow-2xl border-4 border-purple-300 p-6 min-w-[300px] max-w-md">
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 rounded-xl px-4 py-3 border-2 border-pink-300">
                    <p className="font-bold flex items-center gap-2 text-purple-700 text-lg mb-2">
                      <Sparkles className="w-5 h-5" /> Session Summary 📊
                    </p>
                    <p className="text-gray-700 font-medium text-sm">
                      You chose <strong className="text-pink-600">{numbers.length}</strong> cards with <strong className="text-purple-600">{digitLabel(config.digitLength ?? 1)}</strong> numbers.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 border-2 border-green-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-700">Problems solved: 📝</span>
                        <span className="text-xl font-bold text-green-600">{totalAttempts}</span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-3 border-2 border-blue-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-700">Correct answers: ✅</span>
                        <span className="text-xl font-bold text-blue-600">{totalCorrect}</span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-3 border-2 border-yellow-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-700">Accuracy: 🎯</span>
                        <span className="text-xl font-bold text-yellow-600">{accuracy}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-3 border-2 border-pink-200">
                    <p className="font-bold text-gray-800"><span className="text-lg">🎴</span> Cards: <strong className="text-pink-600">{numbers.length}</strong></p>
                    <p className="font-bold text-gray-800"><span className="text-lg">⚡</span> Speed: <strong className="text-yellow-600">{(config.displaySpeed ?? 1).toFixed(1)}s</strong> per card</p>
                    <p className="font-bold text-gray-800"><span className="text-lg">⏱️</span> Answer time: <strong className="text-blue-600">{config.timePerQuestion ?? 10}s</strong></p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Achievement Modal */}
      {showAchievementModal && newAchievements.length > 0 && (
        <AchievementModal
          achievement={newAchievements[currentAchievementIndex]}
          onClose={handleAchievementModalClose}
        />
      )}
    </div>
  );
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
