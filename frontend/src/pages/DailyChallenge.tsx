import Layout from "../components/layout";
import { Trophy, Zap, Target, TrendingUp } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { dailyChallengeService } from '../services/dailyChallenge.service';
import { DailyChallenge, DailyChallengeExercise } from '../types/dailyChallenge';
import { useAuth } from '../contexts/AuthContext';
import { exerciseAttemptService } from '../services/exerciseAttempt.service';
import { exerciseService } from '../services/exercise.service';
import { Exercise } from '../types/exercise';
import { extractErrorMessage } from '../utils/error.utils';
import { convertExerciseToConfig } from '../utils/homework.utils';
import { LoadingState, ErrorState, EmptyState, FilterTabs } from '../components/common';
import { Card } from '../components/ui';
import { DailyChallengeExerciseCard, DailyChallengeDetailsModal } from '../components/features/dailyChallenge';
import { useModal } from '../hooks';
import { useMemo } from 'react';

interface ExerciseCompletion {
  exerciseId: string;
  completed: boolean;
  completionRate?: number;
}

export default function DailyChallenge() {
  const { student } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const prevPathRef = useRef<string>(location.pathname);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exerciseCompletions, setExerciseCompletions] = useState<ExerciseCompletion[]>([]);
  const [loadingExercise, setLoadingExercise] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<DailyChallengeExercise | null>(null);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const { isOpen: showDetailsModal, open: openDetailsModal, close: closeDetailsModal } = useModal();

  const fetchCompletionStatus = useCallback(async (challenge: DailyChallenge) => {
    if (!student?.id || challenge.exercises.length === 0) return;

    try {
      const attempts = await exerciseAttemptService.getAttemptsByStudent(student.id);
      const completions: ExerciseCompletion[] = challenge.exercises.map((exercise) => {
        const exerciseAttempts = attempts.filter(
          a => a.exerciseId === exercise.exerciseId && a.completedAt
        );
        const totalAttempts = attempts.filter(
          a => a.exerciseId === exercise.exerciseId
        );
        const completionRate = totalAttempts.length > 0
          ? Math.round((exerciseAttempts.length / totalAttempts.length) * 100)
          : 0;

        return {
          exerciseId: exercise.exerciseId,
          completed: exerciseAttempts.length > 0,
          completionRate
        };
      });
      setExerciseCompletions(completions);
    } catch (err) {
      console.error('Error fetching completion status:', err);
    }
  }, [student?.id]);

  useEffect(() => {
    const fetchTodayChallenge = async () => {
      try {
        setLoading(true);
        setError(null);
        const challenge = await dailyChallengeService.getTodayChallenge();
        setDailyChallenge(challenge);

        // Fetch completion status for each exercise
        await fetchCompletionStatus(challenge);
      } catch (err) {
        console.error('Error fetching daily challenge:', err);
        setError(extractErrorMessage(err, 'Failed to load today\'s challenge'));
      } finally {
        setLoading(false);
      }
    };

    fetchTodayChallenge();
  }, [student?.id, fetchCompletionStatus]);

  // Refresh completion status when returning from exercise (location change)
  useEffect(() => {
    // Check if we're returning to this page from another route
    if (location.pathname === '/challenges' && prevPathRef.current !== location.pathname && dailyChallenge && student?.id && !loading) {
      fetchCompletionStatus(dailyChallenge);
    }
    prevPathRef.current = location.pathname;
  }, [location.pathname, dailyChallenge, student?.id, fetchCompletionStatus, loading]);

  // Also refresh when window gains focus (user returns to tab)
  useEffect(() => {
    const handleFocus = () => {
      if (dailyChallenge && student?.id && !loading) {
        fetchCompletionStatus(dailyChallenge);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [dailyChallenge, student?.id, fetchCompletionStatus, loading]);

  const loadExerciseDetails = async (exercise: DailyChallengeExercise) => {
    try {
      const fullExercise = await exerciseService.getExerciseById(exercise.exerciseId);
      setSelectedExercise(exercise);
      setSelectedExercises([fullExercise]);
      return fullExercise;
    } catch (err) {
      console.error('Failed to load exercise details:', err);
      throw err;
    }
  };

  const handleSeeDetails = async (exercise: DailyChallengeExercise) => {
    try {
      await loadExerciseDetails(exercise);
      openDetailsModal();
    } catch (err) {
      console.error('Failed to load exercise details:', err);
    }
  };

  const handleStartExercise = async (exercise: DailyChallengeExercise) => {
    try {
      setLoadingExercise(exercise.exerciseId);
      
      // Start the clicked exercise directly
      const fullExercise = await exerciseService.getExerciseById(exercise.exerciseId);
      const config = convertExerciseToConfig(fullExercise);
      
      navigate('/exercises/play', { 
        state: { 
          config,
          returnPath: '/challenges'
        } 
      });
    } catch (err) {
      console.error('Failed to start exercise:', err);
      setError(extractErrorMessage(err, 'Failed to start exercise. Please try again.'));
    } finally {
      setLoadingExercise(null);
    }
  };

  const handleStartFromDetails = () => {
    closeDetailsModal();
    if (selectedExercise) {
      handleStartExercise(selectedExercise);
    }
  };

  const getCompletionStatus = (exerciseId: string) => {
    return exerciseCompletions.find(ec => ec.exerciseId === exerciseId);
  };

  // Determine difficulty level from numeric difficulty
  const getDifficultyLevel = (difficulty?: number): 'beginner' | 'intermediate' | 'advanced' => {
    if (!difficulty) return 'beginner';
    if (difficulty <= 3) return 'beginner';
    if (difficulty <= 7) return 'intermediate';
    return 'advanced';
  };

  // Filter exercises by difficulty
  const filteredExercises = useMemo(() => {
    if (!dailyChallenge) return [];
    if (difficultyFilter === 'all') return dailyChallenge.exercises;
    
    return dailyChallenge.exercises.filter(exercise => {
      const level = getDifficultyLevel(exercise.difficulty);
      return level === difficultyFilter;
    });
  }, [dailyChallenge, difficultyFilter]);

  const completedCount = exerciseCompletions.filter(ec => ec.completed).length;
  const totalExercises = dailyChallenge?.exercises.length || 0;
  const remainingCount = totalExercises - completedCount;

  const filterOptions = [
    { value: 'all' as const, label: 'All' },
    { value: 'beginner' as const, label: 'Beginner', color: 'green' as const },
    { value: 'intermediate' as const, label: 'Intermediate', color: 'yellow' as const },
    { value: 'advanced' as const, label: 'Advanced', color: 'red' as const }
  ];

  if (loading) {
    return (
      <Layout
        title="Daily Challenges"
        subtitle="Loading today's challenge..."
      >
        <LoadingState message="Loading your daily challenge..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout
        title="Daily Challenges"
        subtitle="Oops! Something went wrong"
      >
        <ErrorState
          message={error}
          onRetry={() => window.location.reload()}
          retryLabel="Try Again"
        />
      </Layout>
    );
  }

  if (!dailyChallenge) {
    return (
      <Layout
        title="Daily Challenges"
        subtitle="No challenge available"
      >
        <EmptyState
          message="No daily challenge available for today. Check back tomorrow!"
        />
      </Layout>
    );
  }

  return (
    <Layout
      title="Daily Challenges"
      subtitle={dailyChallenge.title}
    >
      {/* Featured Challenge Header */}
      <Card variant="blue" className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Today's Challenge</h2>
            <p className="text-blue-100">{dailyChallenge.description || 'Complete all exercises to earn bonus points!'}</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-white">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            <span>{remainingCount} exercises remaining</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            <span>{completedCount} of {totalExercises} completed</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            <span>Challenge Date: {new Date(dailyChallenge.challengeDate).toLocaleDateString()}</span>
          </div>
        </div>
      </Card>

      {/* Exercises List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Exercises</h3>
          {dailyChallenge.exercises.length > 0 && (
            <FilterTabs
              filters={filterOptions}
              activeFilter={difficultyFilter}
              onFilterChange={setDifficultyFilter}
            />
          )}
        </div>
        {dailyChallenge.exercises.length === 0 ? (
          <EmptyState
            message="No exercises in today's challenge"
          />
        ) : filteredExercises.length === 0 ? (
          <EmptyState
            message={`No ${difficultyFilter} exercises in today's challenge`}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExercises.map((exercise, index) => {
              const completion = getCompletionStatus(exercise.exerciseId);
              const isCompleted = completion?.completed || false;
              // Find original index for numbering
              const originalIndex = dailyChallenge.exercises.findIndex(ex => ex.exerciseId === exercise.exerciseId);

              return (
                <DailyChallengeExerciseCard
                  key={exercise.exerciseId}
                  exercise={exercise}
                  index={originalIndex >= 0 ? originalIndex : index}
                  isCompleted={isCompleted}
                  onSeeDetails={() => handleSeeDetails(exercise)}
                  onStart={() => handleStartExercise(exercise)}
                  isLoading={loadingExercise === exercise.exerciseId}
                />
              );
            })}
          </div>
        )}
      </div>

      <DailyChallengeDetailsModal
        isOpen={showDetailsModal}
        onClose={closeDetailsModal}
        dailyChallenge={dailyChallenge}
        exercises={selectedExercises}
        onStart={handleStartFromDetails}
        isLoading={loadingExercise !== null}
      />
    </Layout>
  );
}
