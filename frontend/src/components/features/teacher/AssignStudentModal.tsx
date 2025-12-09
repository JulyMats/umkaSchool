import React, { useState, useMemo } from 'react';
import { Student } from '../../../types/student';
import { Group } from '../../../types/group';
import { StudentAchievement } from '../../../types/achievement';
import { Modal, SearchInput, Button } from '../../../components/ui';
import { SelectField } from '../../../components/common';
import { filterStudents } from '../../../utils/student.utils';
import { DateDisplay } from '../../common';

interface AssignFormState {
  studentId: string;
  groupId: string | null;
}

interface AssignStudentModalProps {
  isOpen: boolean;
  isSaving: boolean;
  formState: AssignFormState;
  unassignedStudents: Student[];
  groups: Group[];
  studentLastAchievements: Record<string, StudentAchievement | null>;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onChange: React.Dispatch<React.SetStateAction<AssignFormState>>;
}

const AssignStudentModal: React.FC<AssignStudentModalProps> = ({
  isOpen,
  isSaving,
  formState,
  unassignedStudents,
  groups,
  studentLastAchievements,
  onClose,
  onSubmit,
  onChange
}) => {
  const [search, setSearch] = useState('');

  const filteredOptions = useMemo(() => {
    return filterStudents(unassignedStudents, search);
  }, [search, unassignedStudents]);

  const selectedStudent = unassignedStudents.find(
    (student) => student.id === formState.studentId
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Existing Student"
      size="xl"
    >
      <p className="text-sm text-gray-500 mb-6">
        Choose a student who already has an account in the system.
      </p>
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs uppercase text-gray-500">
              Search student
            </label>
            <SearchInput
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="max-h-64 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-100">
            {filteredOptions.map((student) => (
              <label
                key={student.id}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-gray-50 cursor-pointer"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {student.firstName} {student.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{student.email}</p>
                </div>
                <input
                  type="radio"
                  name="student"
                  checked={formState.studentId === student.id}
                  onChange={() =>
                    onChange((prev) => ({
                      ...prev,
                      studentId: student.id
                    }))
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
              </label>
            ))}

            {filteredOptions.length === 0 && (
              <div className="px-4 py-6 text-center text-gray-400 text-sm">
                No students found. Try a different search term.
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <SelectField
            label="Assign to group (optional)"
            name="groupId"
            value={formState.groupId || ''}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                groupId: e.target.value ? e.target.value : null
              }))
            }
            options={[
              { value: '', label: 'No group' },
              ...groups.map((group) => ({
                value: group.id,
                label: `${group.name} (${group.code})`
              }))
            ]}
          />

          {selectedStudent && (
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2 text-sm text-gray-600">
              <div>
                <p className="text-xs uppercase text-gray-500 tracking-wide">
                  Guardian
                </p>
                {selectedStudent.guardian ? (
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedStudent.guardian.firstName}{' '}
                      {selectedStudent.guardian.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedStudent.guardian.relationship} •{' '}
                      {selectedStudent.guardian.email}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">
                    No guardian information on file.
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500 tracking-wide">
                  Current status
                </p>
                <p>
                  Last achievement:{' '}
                  {studentLastAchievements[selectedStudent.id]
                    ? studentLastAchievements[selectedStudent.id]!.name
                    : 'No achievement'}
                </p>
                {studentLastAchievements[selectedStudent.id] && (
                  <p className="text-xs text-gray-500 mt-1">
                    Achieved: <DateDisplay date={studentLastAchievements[selectedStudent.id]!.earnedAt} format="short" />
                  </p>
                )}
              </div>
            </div>
          )}
        </section>

        <div className="md:col-span-2 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSaving || !formState.studentId}
            variant="primary"
          >
            {isSaving ? 'Assigning...' : 'Assign Student'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AssignStudentModal;

