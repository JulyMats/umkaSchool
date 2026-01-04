import React from 'react';
import { Trophy } from 'lucide-react';
import { DateDisplay } from '../../common';
import { RecentStudentAchievement } from '../../../utils/teacher.utils';

interface AchievementCardProps {
  achievement: RecentStudentAchievement;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement }) => {
  return (
    <div className="flex items-start gap-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex-shrink-0">
        {achievement.iconUrl ? (
          <img
            src={achievement.iconUrl}
            alt={achievement.name}
            className="w-14 h-14 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 dark:text-gray-100">
          {achievement.studentName}
        </p>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
          {achievement.name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Achieved: <DateDisplay date={achievement.earnedAt} format="long" />
        </p>
      </div>
    </div>
  );
};

export default AchievementCard;

