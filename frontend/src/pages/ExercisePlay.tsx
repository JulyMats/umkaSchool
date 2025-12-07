import { FormEvent, useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCcw, Eye, EyeOff, X } from 'lucide-react';
import { ExerciseSessionConfig } from '../types/exercise';
import { useAuth } from '../contexts/AuthContext';
import { exerciseService } from '../services/exercise.service';
import { AchievementModal } from '../components/features/achievement';
import { isSubtractionExercise } from '../utils/exercise.utils';
import { useExerciseSession, useExerciseDisplay } from '../hooks';
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
  const { student } = useAuth();

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
    onTimeout
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

  // Initialize session on mount
  useEffect(() => {
    if (config && student?.id && !sessionStarted) {
      initializeSession();
    }
  }, [config, student?.id, sessionStarted, initializeSession]);

  // Generate numbers after session starts
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
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              onClick={handleExit}
              variant="outline"
              className="inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Exit
            </Button>
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

            <ExerciseFeedback feedback={feedback} expectedAnswer={expectedAnswer} />

            <div className="mt-6 flex flex-wrap items-center gap-3 justify-center">
              <Button
                onClick={handleRetry}
                variant="secondary"
                className="inline-flex items-center gap-2"
              >
                <RefreshCcw className="w-5 h-5" /> Next round 🎯
              </Button>
              <Button
                onClick={handleExit}
                variant="outline"
                className="inline-flex items-center gap-2"
              >
                <X className="w-5 h-5" /> End session
              </Button>
              {(feedback || countdown === 0) && (
                <Button
                  onClick={() => setShowNumbers(!showNumbers)}
                  variant="outline"
                  className="inline-flex items-center gap-2"
                >
                  {showNumbers ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  {showNumbers ? 'Hide' : 'Show'} Numbers 🔢
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

