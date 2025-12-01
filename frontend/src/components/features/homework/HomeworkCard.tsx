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
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'overdue':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: HomeworkStatusType) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  if (variant === 'compact') {
    return (
      <div
        onClick={() => onClick?.(homework.id)}
        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{homework.title}</h3>
            {homework.dueDate && (
              <p className="text-sm text-gray-500 mt-1">
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
      className="bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 p-6 hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Book className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{homework.title}</h3>
            {homework.teacherName && (
              <p className="text-sm text-gray-600 mt-1">Assigned by: {homework.teacherName}</p>
            )}
          </div>
        </div>
        {showStatus && getStatusIcon(homework.status)}
      </div>

      <div className="flex items-center justify-between text-sm">
        {homework.dueDate && (
          <div className="flex items-center gap-2 text-gray-600">
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

