import React from 'react';
import { Users } from 'lucide-react';
import { Group } from '../../../types/group';
import { Card } from '../../ui';

interface GroupCardProps {
  group: Group;
  onEdit: (group: Group) => void;
  onDelete: (group: Group) => void;
  isDeleting: boolean;
}

const GroupCard: React.FC<GroupCardProps> = ({
  group,
  onEdit,
  onDelete,
  isDeleting
}) => {
  return (
    <Card variant="white" className="p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{group.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Code: {group.code}</p>
        </div>
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-sm rounded-full">
          <Users className="w-4 h-4" />
          {group.studentCount} students
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {group.description || 'No description provided.'}
      </p>

      <div className="flex items-center justify-end gap-3 mt-auto">
        <button
          onClick={() => onEdit(group)}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(group)}
          disabled={isDeleting}
          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium disabled:opacity-50"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </Card>
  );
};

export default GroupCard;

