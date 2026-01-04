import React from 'react';
import { UserPlus } from 'lucide-react';
import { Modal, Button, Card } from '../../ui';
import { EmptyState } from '../../common';
import { Student } from '../../../types/student';

interface AssignStudentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    teacherName: string;
    students: Student[];
    onAssign: (student: Student) => void;
    isSaving: boolean;
}

export const AssignStudentsModal: React.FC<AssignStudentsModalProps> = ({
    isOpen,
    onClose,
    teacherName,
    students,
    onAssign,
    isSaving
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Assign Students to ${teacherName}`}
        >
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {students.length === 0 ? (
                    <EmptyState message="All students are already assigned to teachers" />
                ) : (
                    students.map((student) => (
                        <Card key={student.id} variant="white" className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                        {student.firstName} {student.lastName}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{student.email}</p>
                                    {student.teacherName && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Current teacher: {student.teacherName}
                                        </p>
                                    )}
                                </div>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => onAssign(student)}
                                    disabled={isSaving}
                                    title="Assign to teacher"
                                >
                                    <UserPlus className="w-4 h-4" />
                                </Button>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </Modal>
    );
};

