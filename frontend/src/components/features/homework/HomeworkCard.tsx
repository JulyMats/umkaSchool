import { Homework } from '../../../types/homework';
import { Clock, CheckCircle, XCircle, Book } from 'lucide-react';
import { DateDisplay } from '../../common';

interface HomeworkCardProps {
  homework: Homework;
  onClick?: (homeworkId: string) => void;
  showStatus?: boolean;
  variant?: 'default' | 'compact';
}

type HomeworkStatusType = Homework['status'];

const HomeworkCard: React.FC<HomeworkCardProps> = ({
  homework,
  onClick,
  showStatus = true,
  variant = 'default'
}) => {
  const getStatusIcon = (status: HomeworkStatusType) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'overdue':
        return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
    }
  };

  const getStatusColor = (status: HomeworkStatusType) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700';
      case 'overdue':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700';
      default:
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700';
    }
  };

  if (variant === 'compact') {
    return (
      <div
        onClick={() => onClick?.(homework.id)}
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{homework.title}</h3>
            {homework.dueDate && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Due: <DateDisplay date={homework.dueDate} format="short" />
              </p>
            )}
          </div>
          {showStatus && (
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(homework.status)}`}>
              {homework.status}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onClick?.(homework.id)}
      className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 p-6 hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Book className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{homework.title}</h3>
            {homework.teacherName && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Assigned by: {homework.teacherName}</p>
            )}
          </div>
        </div>
        {showStatus && getStatusIcon(homework.status)}
      </div>

      <div className="flex items-center justify-between text-sm">
        {homework.dueDate && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Due: <DateDisplay date={homework.dueDate} format="short" /></span>
          </div>
        )}
        {showStatus && (
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(homework.status)}`}>
            {homework.status}
          </span>
        )}
      </div>
    </div>
  );
};

export default HomeworkCard;

