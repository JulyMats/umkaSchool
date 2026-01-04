import React from 'react';
import { Edit2, Users, Power, PowerOff } from 'lucide-react';
import { Card, Button } from '../../ui';
import { Teacher } from '../../../types/teacher';

interface TeacherCardProps {
    teacher: Teacher;
    onEdit: (teacher: Teacher) => void;
    onViewStudents: (teacher: Teacher) => void;
    onToggleActive: (teacher: Teacher) => void;
    isSaving: boolean;
}

export const TeacherCard: React.FC<TeacherCardProps> = ({
    teacher,
    onEdit,
    onViewStudents,
    onToggleActive,
    isSaving
}) => {
    return (
        <Card variant="white" className="p-6">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {teacher.firstName} {teacher.lastName}
                        </h3>
                        <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                                teacher.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                            }`}
                        >
                            {teacher.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{teacher.email}</p>
                    {teacher.phone && (
                        <p className="text-sm text-gray-600 mb-1">Phone: {teacher.phone}</p>
                    )}
                    {teacher.bio && (
                        <p className="text-sm text-gray-600 mb-2">{teacher.bio}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {teacher.totalStudents} students
                        </span>
                        <span>{teacher.totalGroups} groups</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewStudents(teacher)}
                    >
                        <Users className="w-4 h-4 mr-1" />
                        Students
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(teacher)}
                    >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                    </Button>
                    <Button
                        variant={teacher.isActive ? 'outline' : 'primary'}
                        size="sm"
                        onClick={() => onToggleActive(teacher)}
                        disabled={isSaving}
                    >
                        {teacher.isActive ? (
                            <>
                                <PowerOff className="w-4 h-4 mr-1" />
                                Deactivate
                            </>
                        ) : (
                            <>
                                <Power className="w-4 h-4 mr-1" />
                                Activate
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </Card>
    );
};

