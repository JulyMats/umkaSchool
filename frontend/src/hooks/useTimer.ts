import { useEffect, useRef, useState, useCallback } from 'react';


export const useTimer = (
  initialSeconds: number,
  onComplete?: () => void
) => {
  const [countdown, setCountdown] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [onComplete]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const reset = useCallback((newSeconds?: number) => {
    stop();
    setCountdown(newSeconds ?? initialSeconds);
  }, [initialSeconds, stop]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    countdown,
    isRunning,
    start,
    stop,
    reset,
    setCountdown
  };
};

