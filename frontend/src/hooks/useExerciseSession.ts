import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { exerciseService } from '../services/exercise.service';
import { exerciseAttemptService } from '../services/exerciseAttempt.service';
import { achievementService } from '../services/achievement.service';
import { ExerciseSessionConfig } from '../types/exercise';
import { ExerciseAttempt } from '../types/exerciseAttempt';
import { StudentAchievement } from '../types/achievement';
import { extractErrorMessage } from '../utils/error.utils';

interface UseExerciseSessionProps {
  config: ExerciseSessionConfig | undefined;
  studentId: string | undefined;
  onError: (message: string) => void;
  returnPath?: string; // Optional custom return path after completion
}

interface UseExerciseSessionReturn {
  currentAttempt: ExerciseAttempt | null;
  sessionStarted: boolean;
  totalAttempts: number;
  totalCorrect: number;
  exerciseId: string | null;
  initializeSession: () => Promise<void>;
  completeSession: () => Promise<void>;
  handleAnswer: (isCorrect: boolean) => Promise<void>;
  newAchievements: StudentAchievement[];
  showAchievementModal: boolean;
  currentAchievementIndex: number;
  handleAchievementModalClose: () => void;
}

export const useExerciseSession = ({
  config,
  studentId,
  onError,
  returnPath = '/exercises'
}: UseExerciseSessionProps): UseExerciseSessionReturn => {
  const navigate = useNavigate();
  
  const [currentAttempt, setCurrentAttempt] = useState<ExerciseAttempt | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [exerciseId, setExerciseId] = useState<string | null>(null);
  const [newAchievements, setNewAchievements] = useState<StudentAchievement[]>([]);
  const [currentAchievementIndex, setCurrentAchievementIndex] = useState(0);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  
  const previousAchievementsRef = useRef<Set<string>>(new Set());
  const totalAttemptsRef = useRef<number>(0);
  const totalCorrectRef = useRef<number>(0);
  const isInitializingRef = useRef<boolean>(false);
  const sessionCompletedRef = useRef<boolean>(false);

  const initializeSession = useCallback(async () => {
    if (!config || !studentId || sessionStarted || isInitializingRef.current) {
      return;
    }

    isInitializingRef.current = true;

    try {
      let exerciseIdToUse: string;

      if (config.exerciseId) {
        exerciseIdToUse = config.exerciseId;
      } else {
        const exerciseParams: Record<string, unknown> = {
          cardCount: config.cardCount,
          digitLength: config.digitLength,
          displaySpeed: config.displaySpeed,
          timePerQuestion: config.timePerQuestion
        };
        
        if (config.min !== undefined) {
          exerciseParams.min = config.min;
        }
        if (config.max !== undefined) {
          exerciseParams.max = config.max;
        }
        
        const exerciseParamsJson = JSON.stringify(exerciseParams);

        const exercise = await exerciseService.createExercise({
          exerciseTypeId: config.exerciseTypeId,
          parameters: exerciseParamsJson
        });

        exerciseIdToUse = exercise.id;
      }

      setExerciseId(exerciseIdToUse);

      const settings = JSON.stringify({
        timePerQuestion: config.timePerQuestion,
        displaySpeed: config.displaySpeed,
        cardCount: config.cardCount,
        digitLength: config.digitLength
      });

      const attempt = await exerciseAttemptService.createAttempt({
        studentId: studentId,
        exerciseId: exerciseIdToUse,
        startedAt: new Date().toISOString(),
        settings: settings
      });

      setCurrentAttempt(attempt);
      setSessionStarted(true);
      setTotalAttempts(0);
      setTotalCorrect(0);
      totalAttemptsRef.current = 0;
      totalCorrectRef.current = 0;
      sessionCompletedRef.current = false;
      
      try {
        const initialAchievements = await achievementService.getStudentAchievements(studentId);
        previousAchievementsRef.current = new Set(initialAchievements.map(a => a.achievementId));
      } catch (error) {
        console.error('Failed to fetch initial achievements:', error);
        previousAchievementsRef.current = new Set();
      }
    } catch (error: unknown) {
      console.error('Failed to initialize session:', error);
      const errorMessage = extractErrorMessage(error, 'Failed to start session. Please try again.');
      onError(errorMessage);
      isInitializingRef.current = false;
      navigate(returnPath);
    }
  }, [config, studentId, sessionStarted, navigate, onError, returnPath]);

  const handleAnswer = useCallback(async (isCorrect: boolean) => {
    if (!currentAttempt) return;

    const newTotalAttempts = totalAttempts + 1;
    const newTotalCorrect = isCorrect ? totalCorrect + 1 : totalCorrect;

    setTotalAttempts(newTotalAttempts);
    setTotalCorrect(newTotalCorrect);
    
    totalAttemptsRef.current = newTotalAttempts;
    totalCorrectRef.current = newTotalCorrect;

    try {
      await exerciseAttemptService.updateAttempt(currentAttempt.id, {
        totalAttempts: newTotalAttempts,
        totalCorrect: newTotalCorrect
      });
    } catch (error) {
      console.error('Failed to update attempt:', error);
    }
  }, [currentAttempt, totalAttempts, totalCorrect]);

  const completeSession = useCallback(async () => {
    if (!currentAttempt || !exerciseId || sessionCompletedRef.current || !studentId) return;

    try {
      sessionCompletedRef.current = true;
      const endTime = new Date();

      await exerciseAttemptService.updateAttempt(currentAttempt.id, {
        completedAt: endTime.toISOString(),
        totalAttempts: totalAttempts,
        totalCorrect: totalCorrect
      });

      setTimeout(async () => {
        try {
          const allCurrentAchievements = await achievementService.getStudentAchievements(studentId);
          const currentAchievementIds = new Set(allCurrentAchievements.map(a => a.achievementId));
          
          const newlyEarned = allCurrentAchievements.filter(
            achievement => !previousAchievementsRef.current.has(achievement.achievementId)
          );
          
          if (newlyEarned.length > 0) {
            setNewAchievements(newlyEarned);
            setCurrentAchievementIndex(0);
            setShowAchievementModal(true);
          } else {
            navigate(returnPath);
          }
          
          previousAchievementsRef.current = currentAchievementIds;
        } catch (error) {
          console.error('Failed to fetch achievements:', error);
        }
      }, 500);
    } catch (error) {
      console.error('Failed to complete session:', error);
      sessionCompletedRef.current = false;
    }
  }, [currentAttempt, exerciseId, studentId, totalAttempts, totalCorrect, navigate, returnPath]);

  const handleAchievementModalClose = useCallback(() => {
    if (currentAchievementIndex < newAchievements.length - 1) {
      setCurrentAchievementIndex(currentAchievementIndex + 1);
    } else {
      setShowAchievementModal(false);
      setNewAchievements([]);
      setCurrentAchievementIndex(0);
      navigate(returnPath);
    }
  }, [currentAchievementIndex, newAchievements.length, navigate, returnPath]);

  useEffect(() => {
    return () => {
      if (currentAttempt && sessionStarted && exerciseId && !sessionCompletedRef.current) {
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
  }, [currentAttempt?.id, sessionStarted, exerciseId]);

  return {
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
  };
};

