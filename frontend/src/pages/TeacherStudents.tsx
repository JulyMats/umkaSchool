import { useState, useMemo } from 'react';
import { Plus, Users } from 'lucide-react';
import Layout from '../components/layout';
import { useAuth } from '../contexts/AuthContext';
import { studentService } from '../services/student.service';
import { groupService } from '../services/group.service';
import { Student } from '../types/student';
import { LoadingState, ErrorState, EmptyState } from '../components/common';
import { Button, SearchInput } from '../components/ui';
import { useTeacherStudents } from '../hooks/useTeacherStudents';
import { filterStudents } from '../utils/student.utils';
import { useModal } from '../hooks';
import { extractErrorMessage } from '../utils/error.utils';
import { AssignStudentModal, ManageStudentModal, StudentTableRow } from '../components/features/teacher';

interface AssignFormState {
    studentId: string;
    groupId: string | null;
}

interface ManageFormState {
    studentId: string;
    groupId: string | null;
}

export default function TeacherStudents() {
    const { teacher, isLoading: authLoading } = useAuth();
    const { students, groups, unassignedStudents, studentLastAchievements, loading, error: dataError, refetch } = useTeacherStudents(teacher?.id);
    const [searchTerm, setSearchTerm] = useState('');
    const [assignForm, setAssignForm] = useState<AssignFormState>({ studentId: '', groupId: null });
    const [manageForm, setManageForm] = useState<ManageFormState>({ studentId: '', groupId: null });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { isOpen: assignModalOpen, open: openAssignModal, close: closeAssignModal } = useModal();
    const { isOpen: manageModalOpen, open: openManageModal, close: closeManageModal } = useModal();

    const filteredStudents = useMemo(() => {
        return filterStudents(students, searchTerm);
    }, [students, searchTerm]);

    const handleOpenAssignModal = () => {
        setAssignForm({ studentId: '', groupId: null });
        openAssignModal();
    };

    const handleOpenManageModal = (student: Student) => {
        setManageForm({ studentId: student.id, groupId: student.groupId });
        openManageModal();
    };

    const handleAssignSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!teacher?.id) {
            setError('Teacher profile not found. Unable to assign students.');
            return;
        }

        if (!assignForm.studentId) {
            setError('Please select a student to assign.');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            await studentService.assignToTeacher(assignForm.studentId, teacher.id);

            if (assignForm.groupId) {
                await studentService.assignToGroup(assignForm.studentId, assignForm.groupId);
            }

            closeAssignModal();
            await refetch();
                } catch (err: unknown) {
                    console.error('[TeacherStudents] Failed to assign student', err);
                    setError(extractErrorMessage(err, 'Failed to assign student. Please try again.'));
        } finally {
            setSaving(false);
        }
    };

    const handleManageSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!manageForm.studentId) {
            return;
        }

        setSaving(true);
        setError(null);

        try {
            if (manageForm.groupId) {
                await studentService.assignToGroup(manageForm.studentId, manageForm.groupId);
            } else {
                await groupService.removeStudentFromGroup(manageForm.studentId);
            }

            closeManageModal();
            await refetch();
                } catch (err: unknown) {
                    console.error('[TeacherStudents] Failed to update student', err);
                    setError(extractErrorMessage(err, 'Failed to update student. Please try again.'));
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || loading) {
        return (
            <Layout title="Students" subtitle="Loading student data...">
                <LoadingState message="Loading student data..." />
            </Layout>
        );
    }

    if (!teacher) {
        return (
            <Layout title="Students" subtitle="Teacher profile required">
                <ErrorState message="You must complete your teacher profile before managing students." />
            </Layout>
        );
    }

    return (
        <Layout
            title="Students"
            subtitle="Assign existing students and manage their group placements"
        >
            {(error || dataError) && (
                <ErrorState message={error || dataError || ''} className="mb-4" />
            )}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="w-full md:max-w-sm">
                    <SearchInput
                        placeholder="Search by name, email, or group"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <Button
                    onClick={handleOpenAssignModal}
                    variant="primary"
                    className="inline-flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Assign Student
                </Button>
            </div>

            {/* Desktop: Table view */}
            <div className="hidden md:block mt-6 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500 tracking-wide">
                        <tr>
                            <th className="px-6 py-3">Student</th>
                            <th className="px-6 py-3">Guardian</th>
                            <th className="px-6 py-3">Group</th>
                            <th className="px-6 py-3">Last Achievement</th>
                            <th className="px-6 py-3">Enrollment Date</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {filteredStudents.map((student) => (
                            <StudentTableRow
                                key={student.id}
                                student={student}
                                lastAchievement={studentLastAchievements[student.id] || null}
                                onManage={handleOpenManageModal}
                            />
                        ))}

                        {filteredStudents.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12">
                                    <EmptyState
                                        message={students.length === 0
                                            ? 'You have not assigned any students yet.'
                                            : 'No students match your search.'}
                                        icon={Users}
                                    />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile: Card view */}
            <div className="md:hidden mt-6 space-y-4">
                {filteredStudents.length === 0 ? (
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                        <EmptyState
                            message={students.length === 0
                                ? 'You have not assigned any students yet.'
                                : 'No students match your search.'}
                            icon={Users}
                        />
                    </div>
                ) : (
                    filteredStudents.map((student) => {
                        const lastAchievement = studentLastAchievements[student.id] || null;
                        return (
                            <div
                                key={student.id}
                                className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 space-y-3"
                            >
                                {/* Student Info */}
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 text-base">
                                            {student.firstName} {student.lastName}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-0.5">{student.email}</p>
                                    </div>
                                    <button
                                        onClick={() => handleOpenManageModal(student)}
                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                                    >
                                        Manage
                                    </button>
                                </div>

                                {/* Guardian */}
                                <div className="pt-2 border-t border-gray-100">
                                    <p className="text-xs font-medium text-gray-500 mb-1">Guardian</p>
                                    {student.guardian ? (
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {student.guardian.firstName} {student.guardian.lastName}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {student.guardian.relationship} • {student.guardian.email}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">No guardian info</p>
                                    )}
                                </div>

                                {/* Group */}
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1">Group</p>
                                    {student.groupName ? (
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{student.groupName}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Code: {student.groupCode || '—'}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">Unassigned</p>
                                    )}
                                </div>

                                {/* Last Achievement */}
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1">Last Achievement</p>
                                    {lastAchievement ? (
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {lastAchievement.name}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {new Date(lastAchievement.earnedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">No achievement</p>
                                    )}
                                </div>

                                {/* Enrollment Date */}
                                <div className="pt-2 border-t border-gray-100">
                                    <p className="text-xs font-medium text-gray-500 mb-1">Enrollment Date</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {student.enrollmentDate
                                            ? new Date(student.enrollmentDate).toLocaleDateString()
                                            : '—'}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <AssignStudentModal
                isOpen={assignModalOpen}
                isSaving={saving}
                formState={assignForm}
                unassignedStudents={unassignedStudents}
                groups={groups}
                studentLastAchievements={studentLastAchievements}
                onClose={closeAssignModal}
                onSubmit={handleAssignSubmit}
                onChange={setAssignForm}
            />

            <ManageStudentModal
                isOpen={manageModalOpen}
                isSaving={saving}
                formState={manageForm}
                groups={groups}
                onClose={closeManageModal}
                onSubmit={handleManageSubmit}
                onChange={setManageForm}
            />
        </Layout>
    );
}


