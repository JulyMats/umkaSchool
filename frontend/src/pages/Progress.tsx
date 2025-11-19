import Layout from "../components/Layout";
import { CalendarDays, Brain, Target, Clock } from 'lucide-react';
import { ReactElement, useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { statsService, TimePeriod, StudentStats, SubjectProgress } from '../services/stats.service';

interface ProgressMetric {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: ReactElement;
  color?: 'blue' | 'purple' | 'pink' | 'green';
}

interface TimeOption {
  value: TimePeriod;
  label: string;
}

const timeOptions: TimeOption[] = [
  { value: 'day', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All Time' }
];

export default function Progress() {
  const { student } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('week');
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [previousStats, setPreviousStats] = useState<StudentStats | null>(null);
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!student?.id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch current period stats
        const currentStats = await statsService.getStudentStats(student.id, selectedPeriod);
        setStats(currentStats);

        // Fetch previous period for comparison
        let previousPeriod: TimePeriod = 'all';
        if (selectedPeriod === 'week') {
          previousPeriod = 'month';
        } else if (selectedPeriod === 'month') {
          previousPeriod = 'all';
        }
        const prevStats = await statsService.getStudentStats(student.id, previousPeriod);
        setPreviousStats(prevStats);

        // Fetch subject progress
        const subjects = await statsService.getSubjectProgress(student.id, selectedPeriod);
        setSubjectProgress(subjects);
      } catch (error) {
        console.error('Error fetching progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [student?.id, selectedPeriod]);

  const getChangeText = (current: number, previous: number, label: string): string => {
    const diff = current - previous;
    if (diff > 0) {
      return `+${diff} ${label}`;
    } else if (diff < 0) {
      return `${diff} ${label}`;
    }
    return `No change`;
  };

  const metrics: ProgressMetric[] = stats ? [
    {
      title: "Total Practice Time",
      value: stats.totalPracticeTime,
      change: previousStats ? getChangeText(
        parseInt(stats.totalPracticeTime.split('h')[0]) || 0,
        parseInt(previousStats.totalPracticeTime.split('h')[0]) || 0,
        'h'
      ) : 'No previous data',
      isPositive: true,
      icon: <Clock className="w-5 h-5" />,
      color: 'blue'
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
      icon: <Brain className="w-5 h-5" />,
      color: 'purple'
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
      icon: <Target className="w-5 h-5" />,
      color: 'pink'
    },
    {
      title: "Current Streak",
      value: `${stats.currentStreak} ${stats.currentStreak === 1 ? 'day' : 'days'}`,
      change: `Best: ${stats.bestStreak} days`,
      isPositive: true,
      icon: <CalendarDays className="w-5 h-5" />,
      color: 'green'
    }
  ] : [];

  if (loading) {
    return (
      <Layout
        title="Your Progress"
        subtitle="Loading your progress..."
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (!student) {
    return (
      <Layout
        title="Your Progress"
        subtitle="Please log in to view your progress"
      >
        <div className="text-center text-gray-500 p-8">
          Student information not available. Please log in again.
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Your Progress"
      subtitle="Track your learning journey and improvements"
    >
      {/* Time Period Selector */}
      <div className="flex justify-end mb-6">
        <div className="inline-flex bg-white rounded-lg p-1 shadow-sm">
          {timeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedPeriod(option.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${selectedPeriod === option.value
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => {
          const colorClasses = {
            blue: {
              bg: 'bg-blue-50',
              iconBg: 'bg-blue-100',
              iconText: 'text-blue-600',
              title: 'text-blue-600'
            },
            purple: {
              bg: 'bg-purple-50',
              iconBg: 'bg-purple-100',
              iconText: 'text-purple-600',
              title: 'text-purple-600'
            },
            pink: {
              bg: 'bg-pink-50',
              iconBg: 'bg-pink-100',
              iconText: 'text-pink-600',
              title: 'text-pink-600'
            },
            green: {
              bg: 'bg-green-50',
              iconBg: 'bg-green-100',
              iconText: 'text-green-600',
              title: 'text-green-600'
            }
          };
          const colors = colorClasses[metric.color || 'blue'];
          
          return (
            <div key={metric.title} className={`${colors.bg} rounded-2xl p-6 shadow-sm`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={`${colors.title} text-sm mb-1 font-medium`}>{metric.title}</p>
                  <p className="text-2xl font-bold mb-2 text-gray-800">{metric.value}</p>
                  <p className={`text-sm ${metric.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.change}
                  </p>
                </div>
                <div className={`${colors.iconBg} ${colors.iconText} p-3 rounded-xl`}>
                  {metric.icon}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Subject-wise Progress */}
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 shadow-sm border border-blue-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Subject-wise Progress</h2>
          <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
            View Details
          </button>
        </div>
        {subjectProgress.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No progress data available for the selected period.
          </div>
        ) : (
          <div className="space-y-6">
            {subjectProgress.map((subject) => (
              <div key={subject.subject} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{subject.subject}</span>
                  <span className="text-sm text-gray-500">
                    {subject.totalProblems} problems
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${subject.accuracy}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-16 text-gray-700">
                    {subject.accuracy}%
                  </span>
                </div>
                <div className="flex justify-end">
                  <span className="text-sm text-gray-500">
                    Avg. time per problem: {subject.averageTime}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}