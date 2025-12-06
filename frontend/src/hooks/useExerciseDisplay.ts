import { useState, useEffect, useRef, useCallback } from 'react';
import { ExerciseSessionConfig } from '../types/exercise';
import { exerciseService } from '../services/exercise.service';

interface UseExerciseDisplayProps {
  config: ExerciseSessionConfig | undefined;
  sessionStarted: boolean;
  exerciseId: string | null;
  onTimeout: () => void;
}

interface UseExerciseDisplayReturn {
  numbers: number[];
  expectedAnswer: number | null;
  displayIndex: number;
  showAnswerBox: boolean;
  countdown: number;
  loadingNumbers: boolean;
  generateNewNumbers: () => Promise<void>;
  resetDisplay: () => void;
  stopTimer: () => void;
}

export const useExerciseDisplay = ({
  config,
  sessionStarted,
  exerciseId,
  onTimeout
}: UseExerciseDisplayProps): UseExerciseDisplayReturn => {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [expectedAnswer, setExpectedAnswer] = useState<number | null>(null);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [showAnswerBox, setShowAnswerBox] = useState(false);
  const [countdown, setCountdown] = useState(config?.timePerQuestion ?? 10);
  const [loadingNumbers, setLoadingNumbers] = useState(false);
  
  const displayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const answerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isSequenceRunningRef = useRef<boolean>(false);

  const generateNewNumbers = useCallback(async () => {
    if (!config || !exerciseId) return;
    
    setLoadingNumbers(true);
    try {
      const response = await exerciseService.generateExerciseNumbers({
        exerciseId: exerciseId,
        cardCount: config.cardCount ?? 2,
        digitLength: config.digitLength ?? 1,
        min: config.min,
        max: config.max
      });
      
      setNumbers(response.numbers);
      setExpectedAnswer(response.expectedAnswer);
    } catch (error) {
      console.error('Failed to generate numbers:', error);
      throw error;
    } finally {
      setLoadingNumbers(false);
    }
  }, [config, exerciseId]);

  const stopTimer = useCallback(() => {
    if (answerIntervalRef.current) {
      clearInterval(answerIntervalRef.current);
      answerIntervalRef.current = null;
    }
  }, []);

  const resetDisplay = useCallback(() => {
    setDisplayIndex(0);
    setShowAnswerBox(false);
    setCountdown(config?.timePerQuestion ?? 10);
    stopTimer();
  }, [config?.timePerQuestion, stopTimer]);

  useEffect(() => {
    if (!config || numbers.length === 0 || !sessionStarted || loadingNumbers || isSequenceRunningRef.current) {
      return;
    }

    if (displayTimeoutRef.current) {
      clearTimeout(displayTimeoutRef.current);
      displayTimeoutRef.current = null;
    }
    if (answerIntervalRef.current) {
      clearInterval(answerIntervalRef.current);
      answerIntervalRef.current = null;
    }

    setDisplayIndex(0);
    setShowAnswerBox(false);
    setCountdown(config.timePerQuestion ?? 10);
    isSequenceRunningRef.current = true;

    const displaySpeed = config.displaySpeed ?? 1;
    const runSequence = (index: number) => {
      if (index >= numbers.length) {
        isSequenceRunningRef.current = false;
        setShowAnswerBox(true);
        setCountdown(config.timePerQuestion ?? 10);
        
        if (answerIntervalRef.current) {
          clearInterval(answerIntervalRef.current);
        }
        answerIntervalRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              if (answerIntervalRef.current) {
                clearInterval(answerIntervalRef.current);
                answerIntervalRef.current = null;
              }
              onTimeout();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        return;
      }

      setDisplayIndex(index);
      if (index < numbers.length - 1) {
        displayTimeoutRef.current = setTimeout(() => runSequence(index + 1), displaySpeed * 1000);
      } else {
        displayTimeoutRef.current = setTimeout(() => {
          runSequence(numbers.length); 
        }, displaySpeed * 1000);
      }
    };

    runSequence(0);

    return () => {
      isSequenceRunningRef.current = false;
      if (displayTimeoutRef.current) {
        clearTimeout(displayTimeoutRef.current);
        displayTimeoutRef.current = null;
      }
      if (answerIntervalRef.current) {
        clearInterval(answerIntervalRef.current);
        answerIntervalRef.current = null;
      }
    };
  }, [config, numbers, sessionStarted, loadingNumbers, onTimeout]);

  return {
    numbers,
    expectedAnswer,
    displayIndex,
    showAnswerBox,
    countdown,
    loadingNumbers,
    generateNewNumbers,
    resetDisplay,
    stopTimer
  };
};

