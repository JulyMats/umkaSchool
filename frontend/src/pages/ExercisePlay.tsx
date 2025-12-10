import { FormEvent, useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCcw, Eye, EyeOff, X, Timer } from 'lucide-react';
import { ExerciseSessionConfig } from '../types/exercise';
import { useAuth } from '../contexts/AuthContext';
import { exerciseService } from '../services/exercise.service';
import { AchievementModal } from '../components/features/achievement';
import { isSubtractionExercise } from '../utils/exercise.utils';
import { useExerciseSession, useExerciseDisplay, usePronunciation } from '../hooks';
import {
  ExerciseDisplay,
  ExerciseAnswerInput,
  ExerciseFeedback,
  ExerciseSummary,
  NumbersOverlay
} from '../components/features/exercise';
import { AnimatedBackground } from '../components/common';
import { Button } from '../components/ui';
import { ErrorState, LoadingState } from '../components/common';

interface LocationState {
  config?: ExerciseSessionConfig;
  returnPath?: string;
}

type Feedback = 'correct' | 'incorrect' | 'timeout' | null;

export default function ExercisePlay() {
  const navigate = useNavigate();
  const location = useLocation();
  const { config, returnPath } = (location.state as LocationState) ?? {};
  const { student, user } = useAuth();
  const [pronunciationEnabled] = usePronunciation(true);

  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [showNumbers, setShowNumbers] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSubtraction = config ? isSubtractionExercise(config.exerciseTypeName) : false;

  const {
    currentAttempt,
    sessionStarted,
    totalAttempts,
    totalCorrect,
    exerciseId,
    initializeSession,
    completeSession,
    handleAnswer,
    newAchievements,
    showAchievementModal,
    currentAchievementIndex,
    handleAchievementModalClose
  } = useExerciseSession({
    config,
    studentId: student?.id,
    onError: setError,
    returnPath: returnPath || '/exercises'
  });

  const handleTimeoutRef = useRef<(() => void) | null>(null);
  const stopTimerRef = useRef<(() => void) | null>(null);

  const onTimeout = useCallback(() => {
    if (handleTimeoutRef.current) {
      handleTimeoutRef.current();
    }
  }, []);

  const {
    numbers,
    expectedAnswer,
    displayIndex,
    showAnswerBox,
    countdown,
    loadingNumbers,
    generateNewNumbers,
    resetDisplay,
    stopTimer
  } = useExerciseDisplay({
    config,
    sessionStarted,
    exerciseId,
    onTimeout,
    enablePronunciation: pronunciationEnabled,
    userLanguage: user?.appLanguage
  });

  useEffect(() => {
    stopTimerRef.current = stopTimer;
  }, [stopTimer]);

  const handleTimeout = useCallback(async () => {
    if (stopTimerRef.current) {
      stopTimerRef.current();
    }
    setFeedback('timeout');
    await handleAnswer(false);
  }, [handleAnswer]);

  useEffect(() => {
    handleTimeoutRef.current = handleTimeout;
  }, [handleTimeout]);

  useEffect(() => {
    if (config && student?.id && !sessionStarted) {
      initializeSession();
    }
  }, [config, student?.id, sessionStarted, initializeSession]);

  useEffect(() => {
    if (sessionStarted && exerciseId && numbers.length === 0 && !loadingNumbers) {
      generateNewNumbers();
    }
  }, [sessionStarted, exerciseId, numbers.length, loadingNumbers, generateNewNumbers]);

  const handleRetry = useCallback(async () => {
    setFeedback(null);
    setUserAnswer('');
    setShowNumbers(false);
    resetDisplay();
    
    if (exerciseId) {
      await generateNewNumbers();
    }
  }, [exerciseId, generateNewNumbers, resetDisplay]);

  useEffect(() => {
    if (!sessionStarted || (!feedback && countdown !== 0)) {
      return;
    }

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleRetry();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [feedback, countdown, sessionStarted, handleRetry]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!config || !currentAttempt || !exerciseId || numbers.length === 0) {
      return;
    }

    stopTimer();

    const parsedAnswer = Number(userAnswer.trim());
    if (!Number.isFinite(parsedAnswer)) {
      setFeedback('incorrect');
      await handleAnswer(false);
      return;
    }

    try {
      const validation = await exerciseService.validateAnswer({
        exerciseId: exerciseId,
        numbers: numbers,
        studentAnswer: parsedAnswer
      });
      
      const isCorrect = validation.isCorrect;
      setFeedback(isCorrect ? 'correct' : 'incorrect');
      await handleAnswer(isCorrect);
    } catch (error) {
      console.error('Failed to validate answer:', error);
      const isCorrect = expectedAnswer !== null && Math.abs(parsedAnswer - expectedAnswer) < 0.0001;
      setFeedback(isCorrect ? 'correct' : 'incorrect');
      await handleAnswer(isCorrect);
    }
  };

  const handleExit = async () => {
    if (currentAttempt && sessionStarted) {
      await completeSession();
    } else {
      navigate(returnPath || '/exercises');
    }
  };

  if (!config || !student) {
    return (
      <AnimatedBackground>
        <div className="flex flex-col items-center justify-center min-h-screen py-8 px-4">
          <div className="bg-white rounded-3xl shadow-xl p-8 border-4 border-red-300 max-w-md mx-4">
            <div className="text-center">
              <div className="text-6xl mb-4">😕</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
              <p className="text-gray-600 mb-6">Unable to start exercise session. Please go back and try again.</p>
              <Button
                onClick={() => navigate('/exercises')}
                variant="gradient-pink"
                className="inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" /> Back to Exercises
              </Button>
            </div>
          </div>
        </div>
      </AnimatedBackground>
    );
  }

  if (error) {
    return (
      <AnimatedBackground>
        <div className="flex flex-col items-center justify-center min-h-screen py-8 px-4">
          <ErrorState message={error} onRetry={() => navigate('/exercises')} />
        </div>
      </AnimatedBackground>
    );
  }

  if (!sessionStarted || !currentAttempt) {
    return (
      <AnimatedBackground>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <LoadingState message="Preparing your adventure... 🚀" size="lg" />
        </div>
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground>
      <div className="min-h-screen py-4 sm:py-8 px-3 sm:px-4 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
            <Button
              onClick={handleExit}
              variant="outline"
              className="inline-flex items-center gap-2 text-sm sm:text-base"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4" /> <span className="hidden xs:inline">Exit</span>
            </Button>
            {/* Mobile: Info row - feedback, timer, score on same level as Exit button */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto justify-start sm:justify-start">
              {/* Feedback message */}
              {feedback && (
                <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold ${
                  feedback === 'correct' 
                    ? 'bg-green-100 text-green-800 border border-green-300' 
                    : 'bg-red-100 text-red-800 border border-red-300'
                }`}>
                  <span className="text-sm sm:text-base">
                    {feedback === 'correct' ? '🎉' : feedback === 'timeout' ? '⏰' : '😔'}
                  </span>
                  <span className="hidden sm:inline">
                    {feedback === 'correct' 
                      ? 'You nailed it!' 
                      : feedback === 'timeout' 
                      ? `Time's up!` 
                      : 'Fail!'}
                  </span>
                  <span className="sm:hidden">
                    {feedback === 'correct' 
                      ? 'Nailed it!' 
                      : feedback === 'timeout' 
                      ? 'Time up!' 
                      : 'Fail!'}
                  </span>
                </div>
              )}
              
              {/* Timer */}
              {showAnswerBox && (
                <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-yellow-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full font-bold text-yellow-700 text-xs sm:text-sm border border-yellow-300">
                  <Timer className="w-3 h-3 sm:w-4 sm:h-4" />
                  {feedback === null ? `${countdown}s` : 'Stopped'}
                </div>
              )}
              
              {/* Score */}
              <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/80 backdrop-blur-sm px-2 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-md border border-gray-200 text-xs sm:text-sm">
                <span className="font-bold text-pink-600">{totalCorrect}</span>
                <span className="text-gray-500">/</span>
                <span className="font-semibold text-gray-700">{totalAttempts}</span>
                <span className="text-green-500 text-xs sm:text-sm">✅</span>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-3 sm:mb-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-1 sm:mb-2 px-2">
              {config.exerciseTypeName} 🎮
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-700">Watch the cards carefully! 👀</p>
          </div>

          {/* Main game area */}
          <section className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border-2 sm:border-4 border-pink-300 p-4 sm:p-6 md:p-8">
            <div className="flex flex-col items-center justify-center h-64 sm:h-80 md:h-96 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 sm:border-4 border-blue-200 rounded-2xl sm:rounded-3xl relative overflow-hidden">
              {!showAnswerBox ? (
                <ExerciseDisplay number={numbers[displayIndex]} isLoading={loadingNumbers} />
              ) : (
                <ExerciseAnswerInput
                  config={config}
                  userAnswer={userAnswer}
                  countdown={countdown}
                  feedback={feedback}
                  onChange={setUserAnswer}
                  onSubmit={handleSubmit}
                />
              )}
            </div>

            {/* Desktop: Full feedback message */}
            <div className="hidden sm:block">
              <ExerciseFeedback feedback={feedback} expectedAnswer={expectedAnswer} />
            </div>

            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-3 justify-center">
              <Button
                onClick={handleRetry}
                variant="secondary"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto"
                size="sm"
              >
                <RefreshCcw className="w-4 h-4 sm:w-5 sm:h-5" /> <span>Next round 🎯</span>
              </Button>
              <Button
                onClick={handleExit}
                variant="outline"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto"
                size="sm"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" /> <span>End session</span>
              </Button>
              {(feedback || countdown === 0) && (
                <Button
                  onClick={() => setShowNumbers(!showNumbers)}
                  variant="outline"
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto"
                  size="sm"
                >
                  {showNumbers ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  <span>{showNumbers ? 'Hide' : 'Show'} Numbers 🔢</span>
                </Button>
              )}
            </div>
          </section>

          <ExerciseSummary
            config={config}
            totalAttempts={totalAttempts}
            totalCorrect={totalCorrect}
            numbers={numbers}
            showSummary={showSummary}
            onMouseEnter={() => setShowSummary(true)}
            onMouseLeave={() => setShowSummary(false)}
          />
        </div>

        <NumbersOverlay
          isOpen={showNumbers}
          numbers={numbers}
          expectedAnswer={expectedAnswer}
          isSubtraction={isSubtraction}
          onClose={() => setShowNumbers(false)}
        />

        {showAchievementModal && newAchievements.length > 0 && (
          <AchievementModal
            achievement={newAchievements[currentAchievementIndex]}
            onClose={handleAchievementModalClose}
          />
        )}
      </div>
    </AnimatedBackground>
  );
}

