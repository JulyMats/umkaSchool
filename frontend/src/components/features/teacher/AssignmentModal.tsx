import React from 'react';
import { HomeworkDetail } from '../../../types/homework';
import { Group } from '../../../types/group';
import { Student } from '../../../types/student';
import { HomeworkStatus } from '../../../types/homework';
import { Modal, Button } from '../../../components/ui';
import { SelectField } from '../../../components/common';

type AssignmentModalMode = 'create' | 'edit';

export interface AssignmentFormState {
  id?: string;
  homeworkId: string;
  dueDate: string;
  selectedGroupIds: string[];
  selectedStudentIds: string[];
  status: HomeworkStatus;
}

interface AssignmentModalProps {
  isOpen: boolean;
  mode: AssignmentModalMode;
  isSaving: boolean;
  formState: AssignmentFormState;
  homeworkOptions: HomeworkDetail[];
  groupOptions: Group[];
  studentOptions: Student[];
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onChange: React.Dispatch<React.SetStateAction<AssignmentFormState>>;
}

const AssignmentModal: React.FC<AssignmentModalProps> = ({
  isOpen,
  mode,
  isSaving,
  formState,
  homeworkOptions,
  groupOptions,
  studentOptions,
  onClose,
  onSubmit,
  onChange
}) => {
  const toggleSelection = (field: 'selectedGroupIds' | 'selectedStudentIds', id: string) => {
    onChange((prev) => {
      const selected = new Set(prev[field]);
      if (selected.has(id)) {
        selected.delete(id);
      } else {
        selected.add(id);
      }
      return {
        ...prev,
        [field]: Array.from(selected)
      };
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Create Assignment' : 'Edit Assignment'}
      size="xl"
    >
      <p className="text-sm text-gray-500 mb-6">
        Schedule homework for specific groups or individual students.
      </p>
      <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="space-y-4">
          <SelectField
            label="Homework set"
            name="homeworkId"
            value={formState.homeworkId}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                homeworkId: e.target.value
              }))
            }
            required
            options={[
              { value: '', label: 'Select homework' },
              ...homeworkOptions.map((homework) => ({
                value: homework.id,
                label: homework.title
              }))
            ]}
          />

          <div className="space-y-2">
            <label className="text-xs uppercase text-gray-500">Due date</label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={formState.dueDate}
              onChange={(event) =>
                onChange((prev) => ({ ...prev, dueDate: event.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase text-gray-500">
                Assign to groups
              </label>
              <span className="text-xs text-gray-500">
                {formState.selectedGroupIds.length} selected
              </span>
            </div>
            <div className="mt-2 max-h-40 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-100">
              {groupOptions.map((group) => (
                <label
                  key={group.id}
                  className="flex items-center justify-between gap-3 px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                >
                  <span>
                    {group.name}{' '}
                    <span className="text-xs text-gray-400">({group.code})</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={formState.selectedGroupIds.includes(group.id)}
                    onChange={() => toggleSelection('selectedGroupIds', group.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
              ))}

              {groupOptions.length === 0 && (
                <div className="px-4 py-4 text-center text-gray-400 text-sm">
                  No groups available.
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase text-gray-500">
                Assign to individual students
              </label>
              <span className="text-xs text-gray-500">
                {formState.selectedStudentIds.length} selected
              </span>
            </div>
            <div className="mt-2 max-h-40 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-100">
              {studentOptions.map((student) => (
                <label
                  key={student.id}
                  className="flex items-center justify-between gap-3 px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                >
                  <span>
                    {student.firstName} {student.lastName}
                    {student.groupName && (
                      <span className="text-xs text-gray-400">
                        {' '}
                        ({student.groupName})
                      </span>
                    )}
                  </span>
                  <input
                    type="checkbox"
                    checked={formState.selectedStudentIds.includes(student.id)}
                    onChange={() => toggleSelection('selectedStudentIds', student.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
              ))}

              {studentOptions.length === 0 && (
                <div className="px-4 py-4 text-center text-gray-400 text-sm">
                  No students available.
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="lg:col-span-2 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
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
              ? 'Create Assignment'
              : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AssignmentModal;

