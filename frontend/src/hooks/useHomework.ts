import { useState, useEffect } from 'react';
import { homeworkService } from '../services/homework.service';
import { Homework } from '../types/homework';
import { useAuth } from '../contexts/AuthContext';
import { extractErrorMessage } from '../utils/error.utils';

interface UseHomeworkReturn {
  homework: Homework[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useHomework = (): UseHomeworkReturn => {
  const { student, user, isAuthenticated } = useAuth();
  const [homework, setHomework] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHomework = async () => {
    if (!student?.id) {
      setLoading(false);
      if (student === null && user?.role === 'STUDENT') {
        setError('Student profile not found. Please complete your profile setup or contact your teacher.');
      } else if (!isAuthenticated) {
        setError('Please log in to view your homework.');
      } else {
        setError('Student information not available. Please log in again.');
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await homeworkService.getCurrentStudentHomework(student.id);
      setHomework(data);
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err, 'Failed to load homework. Please try again later.');
      setError(errorMessage);
      console.error('Error fetching homework:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomework();
  }, [student?.id]);

  return {
    homework,
    loading,
    error,
    refetch: fetchHomework
  };
};

