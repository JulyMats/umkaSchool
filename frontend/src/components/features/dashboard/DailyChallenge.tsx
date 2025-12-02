import { Timer, TrendingUp, Play, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { exerciseTypeService } from '../../../services/exerciseType.service';
import { ExerciseType } from '../../../types/exerciseType';
import { SectionHeader, EmptyState, LoadingState } from '../../../components/common';
import { Card, Button } from '../../../components/ui';

export default function DailyChallenge() {
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<ExerciseType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const exerciseTypes = await exerciseTypeService.getAllExerciseTypes();
        // For now, use the first exercise type as daily challenge
        // In the future, this could be a specific endpoint for daily challenges
        if (exerciseTypes.length > 0) {
          setChallenge(exerciseTypes[0]);
        }
      } catch (error) {
        console.error('Error fetching daily challenge:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, []);

  return (
    <Card variant="blue">
      <SectionHeader
        icon={Zap}
        title="Daily challenge"
        badge="Available now"
        color="blue"
      />
      {loading ? (
        <LoadingState message="Loading challenge..." size="sm" />
      ) : challenge ? (
        <>
          <div className="bg-blue-100 p-4 rounded-xl mb-4">
            <h4 className="font-semibold mb-2">{challenge.name}</h4>
            <p className="text-sm text-gray-600 mb-3">
              {challenge.description || 'Complete this exercise to earn bonus points!'}
            </p>
            <div className="flex justify-between text-xs text-gray-500">
              <p className="flex items-center gap-1">
                <Timer className="w-4 h-4" /> {challenge.duration}
              </p>
              <p className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> Practice
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/exercises')}
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
          message="No challenge available"
          icon={Zap}
        />
      )}
    </Card>
  );
}

