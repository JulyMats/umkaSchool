import { useState, useEffect } from 'react';
import { exerciseTypeService } from '../services/exerciseType.service';
import { ExerciseType } from '../types/exerciseType';

interface UseExerciseTypesReturn {
  exerciseTypes: ExerciseType[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useExerciseTypes = (): UseExerciseTypesReturn => {
  const [exerciseTypes, setExerciseTypes] = useState<ExerciseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExerciseTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await exerciseTypeService.getAllExerciseTypes();
      setExerciseTypes(data);
    } catch (err) {
      setError('Failed to load exercises. Please try again later.');
      console.error('Error fetching exercises:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExerciseTypes();
  }, []);

  return {
    exerciseTypes,
    loading,
    error,
    refetch: fetchExerciseTypes
  };
};

