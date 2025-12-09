import { useState, useMemo } from 'react';
import { CalendarDays, Brain, Target, Clock, Trophy } from 'lucide-react';
import Layout from "../components/layout";
import { useAuth } from '../contexts/AuthContext';
import { TimePeriod } from '../types/stats';
import { useProgress } from '../hooks/useProgress';
import { getChangeText, parseTimeHours } from '../utils/progress.utils';
import { LoadingState, ErrorState, ProgressMetricCard, TimePeriodSelector, EmptyState, SectionHeader } from '../components/common';
import { AchievementCard } from '../components/features/achievement';
import { Card } from '../components/ui';

export default function Progress() {
  const { student } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('week');
  const { stats, previousStats, studentAchievements, allAchievements, loading, statsLoading, error } = useProgress(student?.id, selectedPeriod);

  const metrics = useMemo(() => {
    if (!stats) return [];

    return [
      {
        title: "Total Practice Time",
        value: stats.totalPracticeTime,
        change: previousStats ? getChangeText(
          parseTimeHours(stats.totalPracticeTime),
          parseTimeHours(previousStats.totalPracticeTime),
          'h'
        ) : 'No previous data',
        isPositive: true,
        icon: Clock,
        color: 'blue' as const
      },
      {
        title: "Problems Solved",
        value: stats.problemsSolved.toString(),
        change: previousStats ? getChangeText(
          stats.problemsSolved,
          previousStats.problemsSolved,
          'problems'
        ) : 'No previous data',
        isPositive: true,
        icon: Brain,
        color: 'purple' as const
      },
      {
        title: "Accuracy Rate",
        value: `${stats.accuracyRate}%`,
        change: previousStats ? getChangeText(
          stats.accuracyRate,
          previousStats.accuracyRate,
          '%'
        ) : 'No previous data',
        isPositive: true,
        icon: Target,
        color: 'pink' as const
      },
      {
        title: "Current Streak",
        value: `${stats.currentStreak} ${stats.currentStreak === 1 ? 'day' : 'days'}`,
        change: `Best: ${stats.bestStreak} days`,
        isPositive: true,
        icon: CalendarDays,
        color: 'green' as const
      }
    ];
  }, [stats, previousStats]);

  if (loading) {
    return (
      <Layout title="Your Progress" subtitle="Loading your progress...">
        <LoadingState message="Loading your progress..." />
      </Layout>
    );
  }

  if (error || !student) {
    return (
      <Layout title="Your Progress" subtitle="Error loading progress">
        <ErrorState 
          message={error || 'Student information not available. Please log in again.'} 
          onRetry={() => window.location.reload()}
        />
      </Layout>
    );
  }

  return (
    <Layout
      title="Your Progress"
      subtitle="Track your learning journey and improvements"
    >
      <TimePeriodSelector
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        className="mb-6"
      />

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsLoading && !stats ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-100 rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </>
        ) : metrics.length > 0 ? (
          metrics.map((metric) => (
            <ProgressMetricCard
              key={metric.title}
              title={metric.title}
              value={metric.value}
              change={metric.change}
              isPositive={metric.isPositive}
              icon={metric.icon}
              color={metric.color}
            />
          ))
        ) : null}
      </div>

      {/* Achievements Section */}
      <Card variant="yellow" className="mb-8">
        <SectionHeader
          icon={Trophy}
          title="Achievements"
          badge={`${studentAchievements.length} / ${allAchievements.length} unlocked`}
          color="yellow"
          iconPosition="right"
        />

        {studentAchievements.length === 0 ? (
          <EmptyState
            message="No achievements earned yet. Keep practicing to unlock achievements!"
            icon={Trophy}
          />
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-6 min-w-max">
              {studentAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.achievementId}
                  achievement={achievement}
                />
              ))}
            </div>
          </div>
        )}
      </Card>
    </Layout>
  );
}