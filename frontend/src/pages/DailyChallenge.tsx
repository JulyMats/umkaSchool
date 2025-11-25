import Layout from "../components/Layout";
import { Star, Trophy, Clock, Zap, Target, Flame, Brain, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { exerciseTypeService, ExerciseType } from '../services/exerciseType.service';
import { useAuth } from '../contexts/AuthContext';
import { exerciseAttemptService } from '../services/exerciseAttempt.service';

interface Challenge extends ExerciseType {
  category: 'daily' | 'special' | 'streak';
  completionRate?: number;
}

export default function DailyChallenge() {
  const { student } = useAuth();
  const navigate = useNavigate();
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const exerciseTypes = await exerciseTypeService.getAllExerciseTypes();
        
        // Convert exercise types to challenges
        const challengesData: Challenge[] = await Promise.all(
          exerciseTypes.map(async (exerciseType) => {
            // Determine category based on difficulty
            let category: 'daily' | 'special' | 'streak' = 'daily';
            if (exerciseType.difficulty === 'advanced') {
              category = 'special';
            } else if (exerciseType.difficulty === 'intermediate') {
              category = 'streak';
            }

            // Calculate completion rate if student is available
            let completionRate: number | undefined;
            if (student?.id) {
              try {
                const attempts = await exerciseAttemptService.getAttemptsByStudent(student.id);
                const completedAttempts = attempts.filter(
                  a => a.exerciseTypeName === exerciseType.name && a.completedAt
                );
                const totalAttempts = attempts.filter(
                  a => a.exerciseTypeName === exerciseType.name
                );
                if (totalAttempts.length > 0) {
                  completionRate = Math.round((completedAttempts.length / totalAttempts.length) * 100);
                }
              } catch (error) {
                console.error('Error calculating completion rate:', error);
              }
            }

            return {
              ...exerciseType,
              category,
              completionRate
            };
          })
        );

        setChallenges(challengesData);
      } catch (error) {
        console.error('Error fetching challenges:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [student?.id]);

  const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-600 bg-green-50';
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-50';
      case 'advanced':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: Challenge['category']) => {
    switch (category) {
      case 'daily':
        return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'special':
        return <Star className="w-5 h-5 text-purple-500" />;
      case 'streak':
        return <Flame className="w-5 h-5 text-orange-500" />;
      default:
        return null;
    }
  };

  const filteredChallenges = selectedDifficulty === 'all'
    ? challenges
    : challenges.filter(challenge => challenge.difficulty === selectedDifficulty);

  const dailyChallenges = challenges.filter(c => c.category === 'daily');
  const completedDaily = dailyChallenges.filter(c => c.completionRate && c.completionRate >= 100).length;
  const remainingDaily = dailyChallenges.length - completedDaily;

  if (loading) {
    return (
      <Layout
        title="Daily Challenges"
        subtitle="Loading challenges..."
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Daily Challenges"
      subtitle="Push your limits with exciting math challenges"
    >
      {/* Featured Challenge */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Today's Special Challenge</h2>
        </div>
        <p className="text-lg mb-6 text-blue-100">
          Complete all daily challenges this week to earn bonus points and unlock special achievements!
        </p>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            <span>{remainingDaily} challenges remaining</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            <span>Practice to improve</span>
          </div>
        </div>
      </div>

      {/* Difficulty Filter */}
      <div className="flex gap-2 mb-6">
        {['all', 'beginner', 'intermediate', 'advanced'].map((difficulty) => (
          <button
            key={difficulty}
            onClick={() => setSelectedDifficulty(difficulty)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${selectedDifficulty === difficulty
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'}`}
          >
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </button>
        ))}
      </div>

      {/* Challenge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChallenges.map((challenge) => (
          <div
            key={challenge.id}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50">
                  {getCategoryIcon(challenge.category)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{challenge.title}</h3>
                  <p className="text-gray-500 text-sm">{challenge.type}</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm ${getDifficultyColor(challenge.difficulty)}`}>
                {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              {challenge.description}
            </p>

            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {challenge.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Brain className="w-4 h-4" />
                  {challenge.difficulty}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              {challenge.completionRate !== undefined && (
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-100 rounded-full">
                    <div
                      className="h-2 bg-green-500 rounded-full"
                      style={{ width: `${challenge.completionRate}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500">
                    {challenge.completionRate}% completed
                  </span>
                </div>
              )}
              <button 
                onClick={() => navigate('/exercises')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Start Challenge
              </button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}