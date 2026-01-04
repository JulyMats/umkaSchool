import React from 'react';
import { Student } from '../../../types/student';
import { Modal, Button } from '../../../components/ui';
import { generateGroupCode } from '../../../utils/group.utils';

type Mode = 'create' | 'edit';

export interface GroupFormState {
  id?: string;
  name: string;
  code: string;
  description: string;
  selectedStudentIds: string[];
}

interface GroupModalProps {
  isOpen: boolean;
  mode: Mode;
  isSaving: boolean;
  students: Student[];
  formState: GroupFormState;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onChange: React.Dispatch<React.SetStateAction<GroupFormState>>;
  onToggleStudent: (studentId: string) => void;
  regenerateCode: () => void;
}

const GroupModal: React.FC<GroupModalProps> = ({
  isOpen,
  mode,
  isSaving,
  students,
  formState,
  onClose,
  onSubmit,
  onChange,
  onToggleStudent,
  regenerateCode
}) => {
  const assignedStudentIds = new Set(formState.selectedStudentIds);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Create Group' : 'Edit Group'}
      size="xl"
    >
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Define the group details and assign students who should belong to it.
      </p>
      <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs uppercase text-gray-500 dark:text-gray-400">Group name</label>
            <input
              type="text"
              required
              value={formState.name}
              onChange={(event) =>
                onChange((prev) => ({ ...prev, name: event.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase text-gray-500 dark:text-gray-400">Group code</label>
              {mode === 'create' && (
                <button
                  type="button"
                  onClick={regenerateCode}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  Regenerate
                </button>
              )}
            </div>
            <input
              type="text"
              required
              value={formState.code}
              onChange={(event) =>
                onChange((prev) => ({ ...prev, code: event.target.value.toUpperCase().slice(0, 5) }))
              }
              maxLength={5}
              disabled={mode === 'edit'}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase tracking-widest disabled:bg-gray-50 dark:disabled:bg-gray-700/50 dark:disabled:text-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Share this code with students to help them identify the group.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase text-gray-500 dark:text-gray-400">Description</label>
            <textarea
              rows={4}
              value={formState.description}
              onChange={(event) =>
                onChange((prev) => ({ ...prev, description: event.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Describe the purpose or focus of this group to keep things organized.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            Assign Students
          </h3>
          <div className="max-h-72 overflow-y-auto border border-gray-100 dark:border-gray-700 rounded-xl divide-y divide-gray-100 dark:divide-gray-700">
            {students.map((student) => {
              const checked = assignedStudentIds.has(student.id);
              return (
                <label
                  key={student.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer bg-white dark:bg-gray-800"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {student.email}{' '}
                      {student.groupName && (
                        <span className="text-gray-400 dark:text-gray-500">
                          • In {student.groupName}
                        </span>
                      )}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleStudent(student.id)}
                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                  />
                </label>
              );
            })}

            {students.length === 0 && (
              <div className="px-4 py-6 text-center text-gray-400 dark:text-gray-500 text-sm">
                No students available yet. Add students before assigning them to groups.
              </div>
            )}
          </div>
        </section>

        <div className="lg:col-span-2 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-700 pt-4">
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            variant="primary"
          >
            {isSaving
              ? 'Saving...'
              : mode === 'create'
              ? 'Create Group'
              : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default GroupModal;

