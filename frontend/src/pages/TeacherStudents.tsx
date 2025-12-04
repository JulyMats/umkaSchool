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
        } catch (err: any) {
            console.error('[TeacherStudents] Failed to assign student', err);
            setError(err?.message || 'Failed to assign student. Please try again.');
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
        } catch (err: any) {
            console.error('[TeacherStudents] Failed to update student', err);
            setError(err?.message || 'Failed to update student. Please try again.');
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

            <div className="mt-6 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
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


