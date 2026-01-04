import React from 'react';
import { Homework } from '../../../types/homework';
import { Clock, Book, Info } from 'lucide-react';
import { DateDisplay } from '../../common';
import { Button } from '../../ui';
import { getStatusColor, getStatusIcon } from '../../../utils/homeworkStatus.utils';

interface HomeworkCardWithActionsProps {
  homework: Homework;
  onSeeDetails: () => void;
  onStart: () => void;
  isLoading?: boolean;
}

const HomeworkCardWithActions: React.FC<HomeworkCardWithActionsProps> = ({
  homework,
  onSeeDetails,
  onStart,
  isLoading = false
}) => {
  const StatusIcon = getStatusIcon(homework.status);
  const statusColorClasses = getStatusColor(homework.status);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full relative">
      <button
        onClick={onSeeDetails}
        className="absolute top-4 right-4 p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        title="See details"
      >
        <Info className="w-5 h-5" />
      </button>
      
      <div className="flex items-start gap-3 mb-4">
        <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg shrink-0">
          <Book className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0 pr-8">
          <h3 className="font-semibold text-lg truncate text-gray-900 dark:text-gray-100">{homework.title}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Assigned by: {homework.teacherName}</p>
        </div>
      </div>

      <div className={`self-start px-3 py-1 rounded-full text-sm flex items-center gap-2 mb-4 ${statusColorClasses}`}>
        <StatusIcon className="w-4 h-4" />
        <span className="capitalize">{homework.status}</span>
      </div>
      
      <div className="space-y-4 mt-auto">
        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {homework.timeEstimate}
          </span>
          <span className="flex items-center gap-1">
            Due: <DateDisplay date={homework.dueDate} format="short" />
          </span>
        </div>
        
        <Button
          onClick={onStart}
          disabled={homework.status === 'completed' || isLoading}
          variant={homework.status === 'completed' ? 'ghost' : 'primary'}
          size="md"
          fullWidth
        >
          {isLoading ? 'Loading...' : homework.status === 'completed' ? 'Completed' : 'Start Now'}
        </Button>
      </div>
    </div>
  );
};

export default HomeworkCardWithActions;

