import React from 'react';
import { Calendar, Trash2 } from 'lucide-react';
import { HomeworkAssignmentDetail } from '../../../types/homework';
import { formatAssignmentStatus, getAssignmentStatusColors } from '../../../utils/homework.utils';
import { DateDisplay } from '../../common';

interface AssignmentCardProps {
  assignment: HomeworkAssignmentDetail;
  homeworkTitle: string | undefined;
  assignedGroups: string[];
  assignedStudents: string[];
  onEdit: (assignment: HomeworkAssignmentDetail) => void;
  onDelete: (assignment: HomeworkAssignmentDetail) => void;
  isDeleting: boolean;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  homeworkTitle,
  assignedGroups,
  assignedStudents,
  onEdit,
  onDelete,
  isDeleting
}) => {
  const statusLabel = formatAssignmentStatus(assignment.status);
  const colors = getAssignmentStatusColors(assignment.status);

  return (
    <div
      className={`${colors.bg} ${colors.border} border rounded-2xl p-5 shadow-sm`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-xs ${colors.text} uppercase tracking-wide font-medium`}>
            {statusLabel}
          </p>
          <h3 className="text-base font-semibold text-gray-900">
            {homeworkTitle || 'Homework'}
          </h3>
          <p className="text-sm text-gray-500">
            Due <DateDisplay date={assignment.dueDate} format="short" />
          </p>
        </div>
        <button
          onClick={() => onEdit(assignment)}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Edit
        </button>
      </div>

      <div className="mt-3 space-y-2 text-sm text-gray-600">
        {assignedGroups.length > 0 && (
          <p>
            Groups: {assignedGroups.join(', ')}
          </p>
        )}
        {assignedStudents.length > 0 && (
          <p>
            Students: {assignedStudents.join(', ')}
          </p>
        )}
        <p className="inline-flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide">
          <Calendar className="w-4 h-4" />
          Assigned <DateDisplay date={assignment.assignedAt} format="short" />
        </p>
      </div>

      <div className="mt-4 flex items-center justify-end gap-3 text-sm">
        <button
          onClick={() => onDelete(assignment)}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-700 disabled:opacity-50 inline-flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
};

export default AssignmentCard;
