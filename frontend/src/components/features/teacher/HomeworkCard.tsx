import React from 'react';
import { CalendarPlus, Trash2, ClipboardList } from 'lucide-react';
import { HomeworkDetail } from '../../../types/homework';
import { Card } from '../../ui';
import { DateDisplay } from '../../common';

interface HomeworkCardProps {
  homework: HomeworkDetail;
  onAssign: (homeworkId: string) => void;
  onEdit: (homework: HomeworkDetail) => void;
  onDelete: (homework: HomeworkDetail) => void;
  isDeleting: boolean;
}

const HomeworkCard: React.FC<HomeworkCardProps> = ({
  homework,
  onAssign,
  onEdit,
  
  onDelete,
  isDeleting
}) => {
  return (
    <Card variant="white" className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {homework.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {homework.description || 'No description provided.'}
          </p>
          <div className="flex flex-wrap gap-3 mt-4 text-sm text-gray-600">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
              <ClipboardList className="w-4 h-4" />
              {homework.exercises.length} exercise
              {homework.exercises.length === 1 ? '' : 's'}
            </span>
            <span>
              Created <DateDisplay date={homework.createdAt} format="short" />
            </span>
          </div>
          <div className="mt-4 space-y-3">
            <p className="text-xs uppercase text-gray-500 tracking-wide">
              Exercises Included
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {homework.exercises.map((exercise) => (
                <div
                  key={exercise.exerciseId}
                  className="text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100"
                >
                  <p className="font-medium text-gray-800">
                    {exercise.exerciseTypeName}
                  </p>
                  <p className="text-xs text-gray-500">
                    Difficulty: {exercise.difficulty ?? 'N/A'} • Points:{' '}
                    {exercise.points ?? 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <button
            onClick={() => onAssign(homework.id)}
            className="inline-flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <CalendarPlus className="w-4 h-4" />
            Assign Homework
          </button>
          <button
            onClick={() => onEdit(homework)}
            className="inline-flex items-center justify-center gap-2 text-blue-600 px-4 py-2 rounded-lg hover:text-blue-700 transition-colors"
          >
            Edit
          </button>
        </div>
      </div>
      <div className="mt-4 flex justify-end border-t border-gray-100 pt-4">
        <button
          onClick={() => onDelete(homework)}
          disabled={isDeleting}
          className="inline-flex items-center justify-center gap-2 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </Card>
  );
};

export default HomeworkCard;

