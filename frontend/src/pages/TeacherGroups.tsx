import { useState, useMemo } from 'react';
import { Plus, Users } from 'lucide-react';
import Layout from '../components/layout';
import { useAuth } from '../contexts/AuthContext';
import { groupService } from '../services/group.service';
import { Group, CreateGroupPayload, UpdateGroupPayload } from '../types/group';
import { LoadingState, ErrorState, EmptyState } from '../components/common';
import { Button } from '../components/ui';
import { useTeacherGroups } from '../hooks/useTeacherGroups';
import { generateGroupCode, getInitialGroupForm } from '../utils/group.utils';
import { useModal } from '../hooks';
import { extractErrorMessage } from '../utils/error.utils';
import { GroupCard, GroupModal, GroupFormState } from '../components/features/teacher';

type Mode = 'create' | 'edit';

export default function TeacherGroups() {
    const { teacher, isLoading: authLoading } = useAuth();
    const { groups, students, loading, error: dataError, refetch } = useTeacherGroups(teacher?.id);
    const [mode, setMode] = useState<Mode>('create');
    const [formState, setFormState] = useState<GroupFormState>(getInitialGroupForm());
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { isOpen: isModalOpen, open: openModal, close: closeModal } = useModal();

    const handleOpenCreateModal = () => {
        setMode('create');
        setFormState(getInitialGroupForm());
        openModal();
    };

    const handleOpenEditModal = (group: Group) => {
        setMode('edit');
        setFormState({
            id: group.id,
            name: group.name,
            code: group.code,
            description: group.description || '',
            selectedStudentIds: students
                .filter((student) => student.groupId === group.id)
                .map((student) => student.id)
        });
        openModal();
    };

    const handleSelectStudent = (studentId: string) => {
        setFormState((prev) => {
            const isSelected = prev.selectedStudentIds.includes(studentId);
            return {
                ...prev,
                selectedStudentIds: isSelected
                    ? prev.selectedStudentIds.filter((id) => id !== studentId)
                    : [...prev.selectedStudentIds, studentId]
            };
        });
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!teacher?.id) {
            setError('Teacher profile not found. Unable to manage groups.');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            if (mode === 'create') {
                const payload: CreateGroupPayload = {
                    name: formState.name,
                    code: formState.code,
                    description: formState.description,
                    teacherId: teacher.id,
                    studentIds: formState.selectedStudentIds
                };

                await groupService.createGroup(payload);
            } else if (mode === 'edit' && formState.id) {
                const payload: UpdateGroupPayload = {
                    name: formState.name,
                    description: formState.description,
                    teacherId: teacher.id,
                    studentIds: formState.selectedStudentIds
                };

                await groupService.updateGroup(formState.id, payload);
            }

            closeModal();
            await refetch();
        } catch (err: unknown) {
            console.error('[TeacherGroups] Failed to save group', err);
            setError(extractErrorMessage(err, 'Failed to save group. Please try again.'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (group: Group) => {
        if (
            !window.confirm(
                `Delete group "${group.name}"? Students will remain in the system but will be unassigned.`
            )
        ) {
            return;
        }

        setDeletingId(group.id);
        setError(null);

        try {
            await groupService.deleteGroup(group.id);
            await refetch();
        } catch (err: unknown) {
            console.error('[TeacherGroups] Failed to delete group', err);
            setError(extractErrorMessage(err, 'Failed to delete group. Please try again.'));
        } finally {
            setDeletingId(null);
        }
    };

    const unassignedStudents = useMemo(
        () => students.filter((student) => !student.groupId),
        [students]
    );

    if (authLoading || loading) {
        return (
            <Layout title="Groups" subtitle="Loading groups and students...">
                <LoadingState message="Loading groups and students..." />
            </Layout>
        );
    }

    if (!teacher) {
        return (
            <Layout title="Groups" subtitle="Teacher profile required">
                <ErrorState message="You must complete your teacher profile before managing groups." />
            </Layout>
        );
    }

    return (
        <Layout
            title="Groups"
            subtitle="Create and manage learning groups for your students"
        >
            {(error || dataError) && (
                <ErrorState message={error || dataError || ''} className="mb-4" />
            )}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {groups.length} group{groups.length === 1 ? '' : 's'} •{' '}
                        {unassignedStudents.length} student
                        {unassignedStudents.length === 1 ? '' : 's'} without a group
                    </p>
                </div>
                <Button
                    onClick={handleOpenCreateModal}
                    variant="primary"
                    className="inline-flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Create Group
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
                {groups.map((group) => (
                    <GroupCard
                        key={group.id}
                        group={group}
                        onEdit={handleOpenEditModal}
                        onDelete={handleDelete}
                        isDeleting={deletingId === group.id}
                    />
                ))}
            </div>

            {groups.length === 0 && (
                <EmptyState
                    message="Create your first group to organize students by level, schedule, or classroom."
                    icon={Users}
                    className="mt-10"
                />
            )}

            <GroupModal
                isOpen={isModalOpen}
                mode={mode}
                isSaving={saving}
                students={students}
                formState={formState}
                onClose={closeModal}
                onSubmit={handleSubmit}
                onChange={setFormState}
                onToggleStudent={handleSelectStudent}
                regenerateCode={() =>
                    setFormState((prev) => ({
                        ...prev,
                        code: generateGroupCode()
                    }))
                }
            />
        </Layout>
    );
}



