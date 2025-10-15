import Layout from "../components/Layout";
import { Star, Trophy, Clock, Zap, Target, Flame, Brain, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeEstimate: string;
  points: number;
  category: 'daily' | 'special' | 'streak';
  type: string;
  completionRate?: string;
}

export default function DailyChallenge() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const challenges: Challenge[] = [
    {
      id: '1',
      title: 'Speed Master',
      description: 'Complete 20 addition problems in under 2 minutes. Push your mental math skills to the limit!',
      difficulty: 'intermediate',
      timeEstimate: '5 mins',
      points: 100,
      category: 'daily',
      type: 'Speed Challenge',
      completionRate: '75%'
    },
    {
      id: '2',
      title: 'Division Pro',
      description: 'Master division with two-digit numbers. Can you solve all problems without a calculator?',
      difficulty: 'advanced',
      timeEstimate: '10 mins',
      points: 150,
      category: 'special',
      type: 'Mastery Challenge',
      completionRate: '45%'
    },
    {
      id: '3',
      title: 'Pattern Detective',
      description: 'Identify and continue number patterns. Train your analytical thinking!',
      difficulty: 'beginner',
      timeEstimate: '7 mins',
      points: 75,
      category: 'daily',
      type: 'Pattern Recognition',
      completionRate: '85%'
    },
    {
      id: '4',
      title: 'Multiplication Marathon',
      description: 'Test your multiplication skills with a mix of easy and hard problems. How far can you go?',
      difficulty: 'intermediate',
      timeEstimate: '15 mins',
      points: 200,
      category: 'streak',
      type: 'Endurance Challenge',
      completionRate: '60%'
    },
    {
      id: '5',
      title: 'Mental Math Master',
      description: 'Solve arithmetic problems without writing anything down. Pure mental calculations!',
      difficulty: 'advanced',
      timeEstimate: '8 mins',
      points: 125,
      category: 'special',
      type: 'Mental Math',
      completionRate: '40%'
    },
    {
      id: '6',
      title: 'Number Ninja',
      description: 'Quick calculations with mixed operations. Perfect your mental math techniques!',
      difficulty: 'beginner',
      timeEstimate: '6 mins',
      points: 80,
      category: 'daily',
      type: 'Mixed Operations',
      completionRate: '80%'
    }
  ];

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
            <span>7 challenges remaining</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            <span>500 bonus points</span>
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
                  {challenge.timeEstimate}
                </span>
                <span className="flex items-center gap-1">
                  <Brain className="w-4 h-4" />
                  {challenge.points} pts
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-100 rounded-full">
                  <div
                    className="h-2 bg-green-500 rounded-full"
                    style={{ width: challenge.completionRate }}
                  />
                </div>
                <span className="text-sm text-gray-500">
                  {challenge.completionRate} completed
                </span>
              </div>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                Start Challenge
              </button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}