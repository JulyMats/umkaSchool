import React from 'react';
import { Group } from '../../../types/group';
import { Modal, Button } from '../../../components/ui';
import { SelectField } from '../../../components/common';

interface ManageFormState {
  studentId: string;
  groupId: string | null;
}

interface ManageStudentModalProps {
  isOpen: boolean;
  isSaving: boolean;
  formState: ManageFormState;
  groups: Group[];
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onChange: React.Dispatch<React.SetStateAction<ManageFormState>>;
}

const ManageStudentModal: React.FC<ManageStudentModalProps> = ({
  isOpen,
  isSaving,
  formState,
  groups,
  onClose,
  onSubmit,
  onChange
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Student Placement"
      size="md"
    >
      <p className="text-sm text-gray-500 mb-4">
        Update the student's group assignment.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <SelectField
          label="Assign to group"
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

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
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
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ManageStudentModal;

