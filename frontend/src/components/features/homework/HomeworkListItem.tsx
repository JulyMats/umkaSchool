import React from 'react';
import { formatDueDate } from '../../../utils/date.utils';
import { Homework } from '../../../types/homework';
import { Button } from '../../ui';

interface HomeworkListItemProps {
  homework: Homework;
  onStart: () => void;
  variant?: 'default' | 'compact';
  className?: string;
}

const HomeworkListItem: React.FC<HomeworkListItemProps> = ({
  homework,
  onStart,
  variant = 'default',
  className = ''
}) => {
  if (variant === 'compact') {
    return (
      <div className={`flex justify-between items-center bg-pink-100 dark:bg-pink-900/30 p-2 rounded-lg ${className}`}>
        <div className="text-left flex-1 min-w-0">
          <p className="font-semibold text-sm truncate text-gray-900 dark:text-gray-100">{homework.title}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{formatDueDate(homework.dueDate)}</p>
        </div>
        <Button
          onClick={onStart}
          variant="primary"
          size="sm"
          className="ml-2 flex-shrink-0"
        >
          Start
        </Button>
      </div>
    );
  }

  return (
    <li className={`flex justify-between items-center bg-pink-100 dark:bg-pink-900/30 p-3 rounded-xl mb-2 ${className}`}>
      <div className="text-left flex-1 min-w-0">
        <p className="font-semibold text-gray-900 dark:text-gray-100">{homework.title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{formatDueDate(homework.dueDate)}</p>
      </div>
      <button
        onClick={onStart}
        className="bg-pink-500 text-white px-4 py-1 rounded-lg text-sm hover:bg-pink-600 transition-colors flex-shrink-0 ml-2"
      >
        Start
      </button>
    </li>
  );
};

export default HomeworkListItem;

