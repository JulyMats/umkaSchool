import React from 'react';
import { Edit2, UserMinus, Power, PowerOff, UserPlus } from 'lucide-react';
import { Modal, Button, Card } from '../../ui';
import { EmptyState } from '../../common';
import { Student } from '../../../types/student';

interface StudentsListModalProps {
    isOpen: boolean;
    onClose: () => void;
    teacherName: string;
    students: Student[];
    onEdit: (student: Student) => void;
    onUnassign: (student: Student) => void;
    onToggleActive: (student: Student) => void;
    onAssignClick: () => void;
    isSaving: boolean;
}

export const StudentsListModal: React.FC<StudentsListModalProps> = ({
    isOpen,
    onClose,
    teacherName,
    students,
    onEdit,
    onUnassign,
    onToggleActive,
    onAssignClick,
    isSaving
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Students - ${teacherName}`}
        >
            <div className="mb-4">
                <Button
                    variant="primary"
                    size="sm"
                    onClick={onAssignClick}
                >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Assign Students
                </Button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {students.length === 0 ? (
                    <EmptyState message="No students assigned to this teacher" />
                ) : (
                    students.map((student) => (
                        <Card key={student.id} variant="white" className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-gray-900">
                                        {student.firstName} {student.lastName}
                                    </h4>
                                    <p className="text-sm text-gray-600">{student.email}</p>
                                    <span
                                        className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${
                                            student.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {student.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onEdit(student)}
                                        title="Edit student"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onUnassign(student)}
                                        disabled={isSaving}
                                        title="Unassign from teacher"
                                    >
                                        <UserMinus className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant={student.isActive ? 'outline' : 'primary'}
                                        size="sm"
                                        onClick={() => onToggleActive(student)}
                                        title={student.isActive ? "Deactivate student" : "Activate student"}
                                    >
                                        {student.isActive ? (
                                            <PowerOff className="w-4 h-4" />
                                        ) : (
                                            <Power className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </Modal>
    );
};

