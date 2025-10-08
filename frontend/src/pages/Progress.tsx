import Layout from "../components/Layout";
import { CalendarDays, Brain, Target, Clock } from 'lucide-react';
import { ReactElement, useState } from 'react';

type TimePeriod = 'day' | 'week' | 'month' | 'all';

interface ProgressMetric {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: ReactElement;
}

interface ProgressChart {
  subject: string;
  accuracy: number;
  totalProblems: number;
  averageTime: string;
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
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('week');
  const metrics: ProgressMetric[] = [
    {
      title: "Total Practice Time",
      value: "24h 35m",
      change: "+2.5h this week",
      isPositive: true,
      icon: <Clock className="w-5 h-5" />
    },
    {
      title: "Problems Solved",
      value: "847",
      change: "+124 this week",
      isPositive: true,
      icon: <Brain className="w-5 h-5" />
    },
    {
      title: "Accuracy Rate",
      value: "92%",
      change: "+5% this week",
      isPositive: true,
      icon: <Target className="w-5 h-5" />
    },
    {
      title: "Current Streak",
      value: "12 days",
      change: "Best: 15 days",
      isPositive: true,
      icon: <CalendarDays className="w-5 h-5" />
    }
  ];

  const subjectProgress: ProgressChart[] = [
    {
      subject: "Addition",
      accuracy: 95,
      totalProblems: 250,
      averageTime: "3.2s"
    },
    {
      subject: "Subtraction",
      accuracy: 88,
      totalProblems: 180,
      averageTime: "4.5s"
    },
    {
      subject: "Multiplication",
      accuracy: 85,
      totalProblems: 220,
      averageTime: "5.8s"
    },
    {
      subject: "Division",
      accuracy: 78,
      totalProblems: 150,
      averageTime: "7.2s"
    },
    {
      subject: "Mixed Operations",
      accuracy: 82,
      totalProblems: 120,
      averageTime: "6.5s"
    }
  ];

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
        {metrics.map((metric) => (
          <div key={metric.title} className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">{metric.title}</p>
                <p className="text-2xl font-bold mb-2">{metric.value}</p>
                <p className={`text-sm ${metric.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.change}
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl">
                {metric.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Subject-wise Progress */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Subject-wise Progress</h2>
          <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
            View Details
          </button>
        </div>
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
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${subject.accuracy}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-16">
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
      </div>

      {/* Recent Activity - Can be expanded later */}
      <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
            View All
          </button>
        </div>
        <div className="text-gray-500 text-center py-8">
          Your recent activity will appear here
        </div>
      </div>
    </Layout>
  );
}