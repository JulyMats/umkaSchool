import { TrendingUp, Play, Zap, Target } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { dailyChallengeService } from '../../../services/dailyChallenge.service';
import { DailyChallenge, DailyChallengeExercise } from '../../../types/dailyChallenge';
import { SectionHeader, EmptyState, LoadingState } from '../../../components/common';
import { Card, Button } from '../../../components/ui';
import { useAuth } from '../../../contexts/AuthContext';
import { exerciseAttemptService } from '../../../services/exerciseAttempt.service';
import { exerciseService } from '../../../services/exercise.service';
import { convertExerciseToConfig } from '../../../utils/homework.utils';

export default function DailyChallenge() {
  const navigate = useNavigate();
  const { student } = useAuth();
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAvailableExercise, setHasAvailableExercise] = useState(false);
  const [firstAvailableExercise, setFirstAvailableExercise] = useState<DailyChallengeExercise | null>(null);

  const checkCompletionStatus = useCallback(async (challenge: DailyChallenge) => {
    if (!student?.id || challenge.exercises.length === 0) {
      setHasAvailableExercise(false);
      return;
    }

    try {
      const attempts = await exerciseAttemptService.getAttemptsByStudent(student.id);
      const completedExerciseIds = new Set(
        attempts
          .filter(a => a.completedAt)
          .map(a => a.exerciseId)
      );

      const availableExercise = challenge.exercises.find(
        exercise => !completedExerciseIds.has(exercise.exerciseId)
      );

      setHasAvailableExercise(!!availableExercise);
      setFirstAvailableExercise(availableExercise || null);
    } catch (err) {
      console.error('Error checking completion status:', err);
      setHasAvailableExercise(challenge.exercises.length > 0);
      setFirstAvailableExercise(challenge.exercises[0] || null);
    }
  }, [student?.id]);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        setLoading(true);
        const challenge = await dailyChallengeService.getTodayChallenge();
        setDailyChallenge(challenge);
        await checkCompletionStatus(challenge);
      } catch (error) {
        console.error('Error fetching daily challenge:', error);
        setDailyChallenge(null);
        setHasAvailableExercise(false);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [checkCompletionStatus]);

  const handleStartExercise = async () => {
    if (!firstAvailableExercise) return;

    try {
      const fullExercise = await exerciseService.getExerciseById(firstAvailableExercise.exerciseId);
      const config = convertExerciseToConfig(fullExercise);
      
      navigate('/exercises/play', { 
        state: { 
          config,
          returnPath: '/dashboard'
        } 
      });
    } catch (err) {
      console.error('Failed to start exercise:', err);
    }
  };

  return (
    <Card variant="blue">
      <SectionHeader
        icon={Zap}
        title="Daily challenge"
        badge={hasAvailableExercise ? "Available now" : undefined}
        badgeOnClick={hasAvailableExercise ? () => navigate('/challenges') : undefined}
        color="blue"
      />
      {loading ? (
        <LoadingState message="Loading challenge..." size="sm" />
      ) : dailyChallenge && hasAvailableExercise ? (
        <>
          <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-xl mb-4">
            <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">{dailyChallenge.title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              {dailyChallenge.description || 'Complete this exercise to earn bonus points!'}
            </p>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <p className="flex items-center gap-1">
                <Target className="w-4 h-4" /> {dailyChallenge.exercises.length} exercises
              </p>
              <p className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> Daily Challenge
              </p>
            </div>
          </div>
          <Button
            onClick={handleStartExercise}
            variant="secondary"
            size="md"
            fullWidth
            className="flex items-center justify-center gap-1"
          >
            <Play className="w-4 h-4" />
            Start Challenge
          </Button>
        </>
      ) : (
        <EmptyState
          message="No available daily challenges"
          icon={Zap}
        />
      )}
    </Card>
  );
}

