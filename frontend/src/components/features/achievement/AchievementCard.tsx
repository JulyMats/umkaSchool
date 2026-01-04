import React from 'react';
import { Trophy } from 'lucide-react';
import { StudentAchievement } from '../../../types/achievement';
import { DateDisplay } from '../../common';
import { Card } from '../../ui';

interface AchievementCardProps {
  achievement: StudentAchievement;
  className?: string;
}

const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  className = ''
}) => {
  return (
    <Card variant="white" className={`border-2 border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all flex flex-col flex-shrink-0 w-[calc(16.666%-1rem)] min-w-[200px] max-w-[240px] ${className}`}>
      <div className="flex flex-col h-full">
        {/* Achievement Image */}
        <div className="flex justify-center mb-4">
          {achievement.iconUrl ? (
            <img
              src={achievement.iconUrl}
              alt={achievement.name}
              className="w-24 h-24 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) {
                  fallback.style.display = 'flex';
                }
              }}
            />
          ) : null}
          <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center" style={{ display: achievement.iconUrl ? 'none' : 'flex' }}>
            <Trophy className="w-12 h-12 text-gray-400 dark:text-gray-500" />
          </div>
        </div>

        <h3 className="font-semibold text-base text-gray-900 dark:text-gray-100 mb-2 text-center">
          {achievement.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed flex-grow line-clamp-3 mb-3 text-center">
          {achievement.description}
        </p>
        
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700 mt-auto">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Achieved:{' '}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              <DateDisplay date={achievement.earnedAt} format="long" />
            </span>
          </p>
        </div>
      </div>
    </Card>
  );
};

export default AchievementCard;

