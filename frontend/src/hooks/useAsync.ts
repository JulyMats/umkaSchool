import { useState, useCallback, useEffect, useRef } from 'react';

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export const useAsync = <T,>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true
) => {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: immediate,
    error: null
  });
  
  const mountedRef = useRef(true);

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await asyncFunction();
      if (mountedRef.current) {
        setState({ data, loading: false, error: null });
      }
      return data;
    } catch (error) {
      if (mountedRef.current) {
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error : new Error(String(error))
        });
      }
      throw error;
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
    
    return () => {
      mountedRef.current = false;
    };
  }, [immediate, execute]);

  return {
    ...state,
    execute,
    reset: () => setState({ data: null, loading: false, error: null })
  };
};

