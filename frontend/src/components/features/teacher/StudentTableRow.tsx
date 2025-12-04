import React from 'react';
import { Student } from '../../../types/student';
import { StudentAchievement } from '../../../types/achievement';
import { DateDisplay } from '../../common';

interface StudentTableRowProps {
  student: Student;
  lastAchievement: StudentAchievement | null;
  onManage: (student: Student) => void;
}

const StudentTableRow: React.FC<StudentTableRowProps> = ({
  student,
  lastAchievement,
  onManage
}) => {
  return (
    <tr className="hover:bg-gray-50/80 transition-colors">
      <td className="px-6 py-4">
        <div className="font-medium text-gray-900">
          {student.firstName} {student.lastName}
        </div>
        <div className="text-gray-500 text-xs">{student.email}</div>
      </td>
      <td className="px-6 py-4">
        {student.guardian ? (
          <div>
            <p className="font-medium text-gray-900">
              {student.guardian.firstName} {student.guardian.lastName}
            </p>
            <p className="text-gray-500 text-xs">
              {student.guardian.relationship} • {student.guardian.email}
            </p>
          </div>
        ) : (
          <span className="text-gray-400 italic text-sm">
            No guardian info
          </span>
        )}
      </td>
      <td className="px-6 py-4">
        {student.groupName ? (
          <div>
            <p className="font-medium text-gray-900">{student.groupName}</p>
            <p className="text-gray-500 text-xs">
              Code: {student.groupCode || '—'}
            </p>
          </div>
        ) : (
          <span className="text-gray-400 italic text-sm">Unassigned</span>
        )}
      </td>
      <td className="px-6 py-4">
        {lastAchievement ? (
          <div>
            <p className="text-gray-900 font-medium">
              {lastAchievement.name}
            </p>
            <p className="text-gray-500 text-xs">
              <DateDisplay date={lastAchievement.earnedAt} format="short" />
            </p>
          </div>
        ) : (
          <p className="text-gray-400 italic text-sm">
            No achievement
          </p>
        )}
      </td>
      <td className="px-6 py-4">
        <p className="text-gray-900 font-medium">
          {student.enrollmentDate ? (
            <DateDisplay date={student.enrollmentDate} format="long" />
          ) : (
            '—'
          )}
        </p>
      </td>
      <td className="px-6 py-4">
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onManage(student)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Manage
          </button>
        </div>
      </td>
    </tr>
  );
};

export default StudentTableRow;

