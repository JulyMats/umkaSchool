import React from 'react';
import { Calendar, Users, User } from 'lucide-react';
import { HomeworkAssignmentDetail } from '../../../types/homework';
import { Group } from '../../../types/group';
import { Student } from '../../../types/student';
import { DateDisplay } from '../../common';

interface UpcomingDeadlineCardProps {
  assignment: HomeworkAssignmentDetail;
  homeworkTitle?: string;
  groups: Group[];
  students: Student[];
}

const UpcomingDeadlineCard: React.FC<UpcomingDeadlineCardProps> = ({
  assignment,
  homeworkTitle,
  groups,
  students
}) => {
  const assignedGroups = (assignment.assignedGroupIds || [])
    .map((groupId) => groups.find((g) => g.id === groupId)?.name)
    .filter(Boolean) as string[];

  const assignedStudents = (assignment.assignedStudentIds || [])
    .map((studentId) => {
      const student = students.find((s) => s.id === studentId);
      return student ? `${student.firstName} ${student.lastName}` : null;
    })
    .filter(Boolean) as string[];

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {homeworkTitle || 'Homework Assignment'}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <span>
                Due <DateDisplay date={assignment.dueDate} format="short" />
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <span>
                Assigned <DateDisplay date={assignment.assignedAt} format="short" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {(assignedGroups.length > 0 || assignedStudents.length > 0) && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 space-y-2">
          {assignedGroups.length > 0 && (
            <div className="flex items-start gap-2">
              <Users className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Groups: </span>
                <span className="text-sm text-gray-700 dark:text-gray-300">{assignedGroups.join(', ')}</span>
              </div>
            </div>
          )}
          {assignedStudents.length > 0 && (
            <div className="flex items-start gap-2">
              <User className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Students: </span>
                <span className="text-sm text-gray-700 dark:text-gray-300">{assignedStudents.join(', ')}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UpcomingDeadlineCard;

