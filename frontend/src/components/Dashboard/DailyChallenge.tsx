import { Timer, TrendingUp, Play, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { exerciseTypeService } from '../../services/exerciseType.service';
import { ExerciseType } from '../../types/exerciseType';

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
    <div className="bg-blue-50 p-4 rounded-2xl">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-blue-700 flex items-center gap-2">
          <div className="bg-blue-100 p-1.5 rounded-full aspect-square flex items-center justify-center">
            <Zap className="w-5 h-5 text-blue-700" />
          </div>
          Daily challenge
        </h3>
        <span className="text-sm text-blue-500 font-medium">Available now</span>
      </div>
      {loading ? (
        <div className="text-center py-4 text-gray-500">Loading...</div>
      ) : challenge ? (
        <>
          <div className="bg-blue-100 p-4 rounded-xl mb-4">
            <h4 className="font-semibold mb-2">{challenge.name}</h4>
            <p className="text-sm text-gray-600 mb-3">
              {challenge.description || 'Complete this exercise to earn bonus points!'}
            </p>
            <div className="flex justify-between text-xs text-gray-500">
              <p className="flex items-center gap-1"><Timer className="w-4 h-4" /> {challenge.duration}</p>
              <p className="flex items-center gap-1"><TrendingUp className="w-4 h-4" /> Practice</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/exercises')}
            className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-1 hover:bg-blue-600 transition-colors"
          >
            <Play className="w-4 h-4" /> Start Challenge
          </button>
        </>
      ) : (
        <div className="text-center py-4 text-gray-500">No challenge available</div>
      )}
    </div>
  );
}
