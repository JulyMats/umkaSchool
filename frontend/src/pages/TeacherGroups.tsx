import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Loader2, Plus, Users } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { groupService } from '../services/group.service';
import { studentService } from '../services/student.service';
import { Group, CreateGroupPayload, UpdateGroupPayload } from '../types/group';
import { Student } from '../types/student';

type Mode = 'create' | 'edit';

interface GroupFormState {
    id?: string;
    name: string;
    code: string;
    description: string;
    selectedStudentIds: string[];
}

const initialGroupForm: GroupFormState = {
    name: '',
    code: generateGroupCode(),
    description: '',
    selectedStudentIds: []
};

export default function TeacherGroups() {
    const { teacher, isLoading: authLoading } = useAuth();
    const [groups, setGroups] = useState<Group[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<Mode>('create');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formState, setFormState] = useState<GroupFormState>(initialGroupForm);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!teacher?.id) {
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const [groupsResponse, studentsResponse] = await Promise.all([
                    groupService.getGroupsByTeacher(teacher.id),
                    studentService.getStudentsByTeacher(teacher.id)
                ]);
                setGroups(groupsResponse);
                setStudents(studentsResponse);
            } catch (err: any) {
                console.error('[TeacherGroups] Failed to load data', err);
                setError(err?.message || 'Failed to load groups. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [teacher?.id]);

    const openCreateModal = () => {
        setMode('create');
        setFormState({
            ...initialGroupForm,
            code: generateGroupCode()
        });
        setIsModalOpen(true);
    };

    const openEditModal = (group: Group) => {
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
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
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

                const createdGroup = await groupService.createGroup(payload);
                setGroups((prev) => [createdGroup, ...prev]);
            } else if (mode === 'edit' && formState.id) {
                const payload: UpdateGroupPayload = {
                    name: formState.name,
                    description: formState.description,
                    teacherId: teacher.id,
                    studentIds: formState.selectedStudentIds
                };

                const updatedGroup = await groupService.updateGroup(formState.id, payload);
                setGroups((prev) =>
                    prev.map((group) => (group.id === updatedGroup.id ? updatedGroup : group))
                );
            }

            setIsModalOpen(false);
        } catch (err: any) {
            console.error('[TeacherGroups] Failed to save group', err);
            setError(err?.message || 'Failed to save group. Please try again.');
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
            setGroups((prev) => prev.filter((item) => item.id !== group.id));
        } catch (err: any) {
            console.error('[TeacherGroups] Failed to delete group', err);
            setError(err?.message || 'Failed to delete group. Please try again.');
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
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                </div>
            </Layout>
        );
    }

    if (!teacher) {
        return (
            <Layout title="Groups" subtitle="Teacher profile required">
                <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-6">
                    You must complete your teacher profile before managing groups.
                </div>
            </Layout>
        );
    }

    return (
        <Layout
            title="Groups"
            subtitle="Create and manage learning groups for your students"
        >
            {error && (
                <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{error}</span>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <p className="text-sm text-gray-500">
                        {groups.length} group{groups.length === 1 ? '' : 's'} •{' '}
                        {unassignedStudents.length} student
                        {unassignedStudents.length === 1 ? '' : 's'} without a group
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Create Group
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
                {groups.map((group) => (
                    <div
                        key={group.id}
                        className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                                <p className="text-sm text-gray-500">Code: {group.code}</p>
                            </div>
                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 text-gray-600 text-sm rounded-full">
                                <Users className="w-4 h-4" />
                                {group.studentCount} students
                            </span>
                        </div>
                        <p className="text-sm text-gray-600">
                            {group.description || 'No description provided.'}
                        </p>

                        <div className="flex items-center justify-end gap-3 mt-auto">
                            <button
                                onClick={() => openEditModal(group)}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(group)}
                                disabled={deletingId === group.id}
                                className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                            >
                                {deletingId === group.id ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {groups.length === 0 && (
                <div className="mt-10 bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center text-gray-500">
                    Create your first group to organize students by level, schedule, or classroom.
                </div>
            )}

            {isModalOpen && (
                <GroupModal
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
            )}
        </Layout>
    );
}

interface GroupModalProps {
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

function GroupModal({
    mode,
    isSaving,
    students,
    formState,
    onClose,
    onSubmit,
    onChange,
    onToggleStudent,
    regenerateCode
}: GroupModalProps) {
    const assignedStudentIds = new Set(formState.selectedStudentIds);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            {mode === 'create' ? 'Create Group' : 'Edit Group'}
                        </h2>
                        <p className="text-sm text-gray-500">
                            Define the group details and assign students who should belong to it.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
                    >
                        Close
                    </button>
                </div>

                <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 py-6">
                    <section className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs uppercase text-gray-500">Group name</label>
                            <input
                                type="text"
                                required
                                value={formState.name}
                                onChange={(event) =>
                                    onChange((prev) => ({ ...prev, name: event.target.value }))
                                }
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs uppercase text-gray-500">Group code</label>
                                {mode === 'create' && (
                                    <button
                                        type="button"
                                        onClick={regenerateCode}
                                        className="text-xs text-blue-600 hover:text-blue-700"
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
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase tracking-widest disabled:bg-gray-50"
                            />
                            <p className="text-xs text-gray-500">
                                Share this code with students to help them identify the group.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase text-gray-500">Description</label>
                            <textarea
                                rows={4}
                                value={formState.description}
                                onChange={(event) =>
                                    onChange((prev) => ({ ...prev, description: event.target.value }))
                                }
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            />
                            <p className="text-xs text-gray-500">
                                Describe the purpose or focus of this group to keep things organized.
                            </p>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                            Assign Students
                        </h3>
                        <div className="max-h-72 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-100">
                            {students.map((student) => {
                                const checked = assignedStudentIds.has(student.id);
                                return (
                                    <label
                                        key={student.id}
                                        className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-gray-50 cursor-pointer"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {student.firstName} {student.lastName}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {student.email}{' '}
                                                {student.groupName && (
                                                    <span className="text-gray-400">
                                                        • In {student.groupName}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => onToggleStudent(student.id)}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </label>
                                );
                            })}

                            {students.length === 0 && (
                                <div className="px-4 py-6 text-center text-gray-400 text-sm">
                                    No students available yet. Add students before assigning them to groups.
                                </div>
                            )}
                        </div>
                    </section>

                    <div className="lg:col-span-2 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
                        >
                            {isSaving
                                ? 'Saving...'
                                : mode === 'create'
                                ? 'Create Group'
                                : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function generateGroupCode(): string {
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
    const length = 5;
    let result = '';
    for (let i = 0; i < length; i += 1) {
        const index = Math.floor(Math.random() * charset.length);
        result += charset[index];
    }
    return result;
}


