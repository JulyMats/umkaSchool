import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Calendar, CalendarPlus, ClipboardList, Loader2, Plus, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import {
    homeworkService,
    HomeworkDetail,
    HomeworkAssignmentDetail,
    HomeworkStatus,
    CreateHomeworkPayload,
    UpdateHomeworkPayload,
    CreateHomeworkAssignmentPayload,
    UpdateHomeworkAssignmentPayload
} from '../services/homework.service';
import { groupService, Group } from '../services/group.service';
import { studentService, Student } from '../services/student.service';
import { exerciseService, Exercise } from '../services/exercise.service';

type HomeworkModalMode = 'create' | 'edit';
type AssignmentModalMode = 'create' | 'edit';

interface HomeworkFormState {
    id?: string;
    title: string;
    description: string;
    selectedExerciseIds: string[];
}

interface AssignmentFormState {
    id?: string;
    homeworkId: string;
    dueDate: string;
    selectedGroupIds: string[];
    selectedStudentIds: string[];
    status: HomeworkStatus;
}

const homeworkInitialState: HomeworkFormState = {
    title: '',
    description: '',
    selectedExerciseIds: []
};

const assignmentInitialState: AssignmentFormState = {
    homeworkId: '',
    dueDate: '',
    selectedGroupIds: [],
    selectedStudentIds: [],
    status: 'ASSIGNED'
};

export default function TeacherHomework() {
    const { teacher, isLoading: authLoading } = useAuth();
    const [homework, setHomework] = useState<HomeworkDetail[]>([]);
    const [assignments, setAssignments] = useState<HomeworkAssignmentDetail[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [homeworkModalOpen, setHomeworkModalOpen] = useState(false);
    const [homeworkModalMode, setHomeworkModalMode] = useState<HomeworkModalMode>('create');
    const [homeworkForm, setHomeworkForm] = useState<HomeworkFormState>(homeworkInitialState);
    const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
    const [assignmentModalMode, setAssignmentModalMode] = useState<AssignmentModalMode>('create');
    const [assignmentForm, setAssignmentForm] = useState<AssignmentFormState>(assignmentInitialState);
    const [saving, setSaving] = useState(false);
    const [deletingHomeworkId, setDeletingHomeworkId] = useState<string | null>(null);
    const [deletingAssignmentId, setDeletingAssignmentId] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!teacher?.id) {
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const [
                    homeworkResponse,
                    assignmentsResponse,
                    groupsResponse,
                    studentsResponse,
                    exercisesResponse
                ] = await Promise.all([
                    homeworkService.getHomeworkByTeacher(teacher.id),
                    homeworkService.getAssignmentsByTeacher(teacher.id),
                    groupService.getGroupsByTeacher(teacher.id),
                    studentService.getStudentsByTeacher(teacher.id),
                    exerciseService.getExercisesByTeacher(teacher.id)
                ]);

                setHomework(homeworkResponse);
                setAssignments(assignmentsResponse);
                setGroups(groupsResponse);
                setStudents(studentsResponse);
                setExercises(exercisesResponse);
            } catch (err: any) {
                console.error('[TeacherHomework] Failed to load data', err);
                setError(err?.message || 'Failed to load homework data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [teacher?.id]);

    const activeAssignments = useMemo(
        () => assignments.filter((assignment) => assignment.status !== 'COMPLETED'),
        [assignments]
    );

    const homeworkById = useMemo(() => {
        const map = new Map<string, HomeworkDetail>();
        homework.forEach((item) => map.set(item.id, item));
        return map;
    }, [homework]);

    const groupById = useMemo(() => {
        const map = new Map<string, Group>();
        groups.forEach((group) => map.set(group.id, group));
        return map;
    }, [groups]);

    const studentById = useMemo(() => {
        const map = new Map<string, Student>();
        students.forEach((student) => map.set(student.id, student));
        return map;
    }, [students]);

    const openCreateHomeworkModal = () => {
        setHomeworkModalMode('create');
        setHomeworkForm(homeworkInitialState);
        setHomeworkModalOpen(true);
    };

    const openEditHomeworkModal = (homeworkItem: HomeworkDetail) => {
        setHomeworkModalMode('edit');
        setHomeworkForm({
            id: homeworkItem.id,
            title: homeworkItem.title,
            description: homeworkItem.description,
            selectedExerciseIds: homeworkItem.exercises.map((exercise) => exercise.exerciseId)
        });
        setHomeworkModalOpen(true);
    };

    const closeHomeworkModal = () => {
        setHomeworkModalOpen(false);
    };

    const openCreateAssignmentModal = (homeworkId?: string) => {
        setAssignmentModalMode('create');
        setAssignmentForm({
            ...assignmentInitialState,
            homeworkId: homeworkId || ''
        });
        setAssignmentModalOpen(true);
    };

    const openEditAssignmentModal = (assignment: HomeworkAssignmentDetail) => {
        setAssignmentModalMode('edit');
        setAssignmentForm({
            id: assignment.id,
            homeworkId: assignment.homeworkId,
            dueDate: assignment.dueDate ? assignment.dueDate.split('T')[0] : '',
            selectedGroupIds: assignment.assignedGroupIds,
            selectedStudentIds: assignment.assignedStudentIds,
            status: assignment.status
        });
        setAssignmentModalOpen(true);
    };

    const closeAssignmentModal = () => {
        setAssignmentModalOpen(false);
    };

    const handleHomeworkSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!teacher?.id) {
            setError('Teacher profile not found. Unable to manage homework.');
            return;
        }

        if (homeworkForm.selectedExerciseIds.length === 0) {
            setError('Please select at least one exercise to include in the homework.');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            if (homeworkModalMode === 'create') {
                const payload: CreateHomeworkPayload = {
                    title: homeworkForm.title,
                    description: homeworkForm.description,
                    teacherId: teacher.id,
                    exerciseIds: homeworkForm.selectedExerciseIds
                };

                const createdHomework = await homeworkService.createHomework(payload);
                setHomework((prev) => [createdHomework, ...prev]);
            } else if (homeworkModalMode === 'edit' && homeworkForm.id) {
                const payload: UpdateHomeworkPayload = {
                    title: homeworkForm.title,
                    description: homeworkForm.description,
                    teacherId: teacher.id,
                    exerciseIds: homeworkForm.selectedExerciseIds
                };

                const updatedHomework = await homeworkService.updateHomework(homeworkForm.id, payload);
                setHomework((prev) =>
                    prev.map((item) => (item.id === updatedHomework.id ? updatedHomework : item))
                );
            }

            setHomeworkModalOpen(false);
        } catch (err: any) {
            console.error('[TeacherHomework] Failed to save homework', err);
            setError(err?.message || 'Failed to save homework. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleAssignmentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!teacher?.id) {
            setError('Teacher profile not found. Unable to manage assignments.');
            return;
        }

        if (!assignmentForm.homeworkId) {
            setError('Please choose a homework set before assigning.');
            return;
        }

        if (!assignmentForm.dueDate) {
            setError('Please select a due date for the assignment.');
            return;
        }

        if (
            assignmentForm.selectedGroupIds.length === 0 &&
            assignmentForm.selectedStudentIds.length === 0
        ) {
            setError('Assign the homework to at least one group or student.');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            if (assignmentModalMode === 'create') {
                const payload: CreateHomeworkAssignmentPayload = {
                    homeworkId: assignmentForm.homeworkId,
                    teacherId: teacher.id,
                    dueDate: assignmentForm.dueDate,
                    groupIds: assignmentForm.selectedGroupIds,
                    studentIds: assignmentForm.selectedStudentIds
                };

                const createdAssignment = await homeworkService.createHomeworkAssignment(payload);
                setAssignments((prev) => [createdAssignment, ...prev]);
            } else if (assignmentModalMode === 'edit' && assignmentForm.id) {
                const payload: UpdateHomeworkAssignmentPayload = {
                    dueDate: assignmentForm.dueDate,
                    status: assignmentForm.status,
                    groupIds: assignmentForm.selectedGroupIds,
                    studentIds: assignmentForm.selectedStudentIds
                };

                const updatedAssignment = await homeworkService.updateHomeworkAssignment(
                    assignmentForm.id,
                    payload
                );
                setAssignments((prev) =>
                    prev.map((item) => (item.id === updatedAssignment.id ? updatedAssignment : item))
                );
            }

            setAssignmentModalOpen(false);
        } catch (err: any) {
            console.error('[TeacherHomework] Failed to save assignment', err);
            setError(err?.message || 'Failed to save assignment. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteHomework = async (homeworkItem: HomeworkDetail) => {
        if (
            !window.confirm(
                `Delete homework "${homeworkItem.title}"? This will remove the template but not affect existing assignments.`
            )
        ) {
            return;
        }

        setDeletingHomeworkId(homeworkItem.id);
        setError(null);

        try {
            await homeworkService.deleteHomework(homeworkItem.id);
            setHomework((prev) => prev.filter((item) => item.id !== homeworkItem.id));
        } catch (err: any) {
            console.error('[TeacherHomework] Failed to delete homework', err);
            setError(err?.message || 'Failed to delete homework. Please try again.');
        } finally {
            setDeletingHomeworkId(null);
        }
    };

    const handleDeleteAssignment = async (assignment: HomeworkAssignmentDetail) => {
        if (!window.confirm('Delete this assignment? Students assigned will no longer see it.')) {
            return;
        }

        setDeletingAssignmentId(assignment.id);
        setError(null);

        try {
            await homeworkService.deleteHomeworkAssignment(assignment.id);
            setAssignments((prev) => prev.filter((item) => item.id !== assignment.id));
        } catch (err: any) {
            console.error('[TeacherHomework] Failed to delete assignment', err);
            setError(err?.message || 'Failed to delete assignment. Please try again.');
        } finally {
            setDeletingAssignmentId(null);
        }
    };

    if (authLoading || loading) {
        return (
            <Layout title="Homework" subtitle="Loading homework library and assignments...">
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                </div>
            </Layout>
        );
    }

    if (!teacher) {
        return (
            <Layout title="Homework" subtitle="Teacher profile required">
                <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-6">
                    You must complete your teacher profile before managing homework.
                </div>
            </Layout>
        );
    }

    return (
        <Layout
            title="Homework Management"
            subtitle="Build homework sets and schedule assignments for your students"
        >
            {error && (
                <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{error}</span>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Homework Library</h2>
                        <button
                            onClick={openCreateHomeworkModal}
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Create Homework
                        </button>
                    </div>

                    <div className="space-y-4">
                        {homework.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {item.description || 'No description provided.'}
                                        </p>
                                        <div className="flex flex-wrap gap-3 mt-4 text-sm text-gray-600">
                                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
                                                <ClipboardList className="w-4 h-4" />
                                                {item.exercises.length} exercise
                                                {item.exercises.length === 1 ? '' : 's'}
                                            </span>
                                            <span>
                                                Created {new Date(item.createdAt).toLocaleDateString()}
                                            </span>
                                            {item.updatedAt && item.updatedAt !== item.createdAt && (
                                                <span>
                                                    Updated {new Date(item.updatedAt).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-4 space-y-3">
                                            <p className="text-xs uppercase text-gray-500 tracking-wide">
                                                Exercises Included
                                            </p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {item.exercises.map((exercise) => (
                                                    <div
                                                        key={exercise.exerciseId}
                                                        className="text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100"
                                                    >
                                                        <p className="font-medium text-gray-800">
                                                            {exercise.exerciseTypeName}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            Difficulty: {exercise.difficulty ?? 'N/A'} • Points:{' '}
                                                            {exercise.points ?? 'N/A'}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-stretch gap-2">
                                        <button
                                            onClick={() => openCreateAssignmentModal(item.id)}
                                            className="inline-flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                                        >
                                            <CalendarPlus className="w-4 h-4" />
                                            Assign Homework
                                        </button>
                                        <button
                                            onClick={() => openEditHomeworkModal(item)}
                                            className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteHomework(item)}
                                            disabled={deletingHomeworkId === item.id}
                                            className="inline-flex items-center justify-center gap-2 border border-transparent text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            {deletingHomeworkId === item.id ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {homework.length === 0 && (
                            <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center text-gray-500">
                                You have not created any homework sets yet. Use the button above to start building your library.
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-full lg:w-96 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Scheduled Assignments</h2>
                        <button
                            onClick={() => openCreateAssignmentModal()}
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            New Assignment
                        </button>
                    </div>

                    <div className="space-y-4">
                        {assignments.map((assignment) => {
                            const statusLabel = formatAssignmentStatus(assignment.status);
                            const homeworkInfo = homeworkById.get(assignment.homeworkId);
                            const assignedGroups = assignment.assignedGroupIds
                                .map((groupId) => groupById.get(groupId)?.name)
                                .filter(Boolean);
                            const assignedStudents = assignment.assignedStudentIds
                                .map((studentId) => studentById.get(studentId))
                                .filter(Boolean);

                            return (
                                <div
                                    key={assignment.id}
                                    className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                                                {statusLabel}
                                            </p>
                                            <h3 className="text-base font-semibold text-gray-900">
                                                {homeworkInfo?.title || 'Homework'}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                Due {new Date(assignment.dueDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => openEditAssignmentModal(assignment)}
                                            className="text-sm text-blue-600 hover:text-blue-700"
                                        >
                                            Edit
                                        </button>
                                    </div>

                                    <div className="mt-3 space-y-2 text-sm text-gray-600">
                                        {assignedGroups.length > 0 && (
                                            <p>
                                                Groups: {assignedGroups.join(', ')}
                                            </p>
                                        )}
                                        {assignedStudents.length > 0 && (
                                            <p>
                                                Students:{' '}
                                                {assignedStudents
                                                    .map((student) => `${student?.firstName} ${student?.lastName}`)
                                                    .join(', ')}
                                            </p>
                                        )}
                                        <p className="inline-flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide">
                                            <Calendar className="w-4 h-4" />
                                            Assigned {new Date(assignment.assignedAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className="mt-4 flex items-center justify-end gap-3 text-sm">
                                        <button
                                            onClick={() => handleDeleteAssignment(assignment)}
                                            disabled={deletingAssignmentId === assignment.id}
                                            className="text-red-600 hover:text-red-700 disabled:opacity-50 inline-flex items-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            {deletingAssignmentId === assignment.id ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        {assignments.length === 0 && (
                            <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-6 text-center text-gray-500">
                                No assignments scheduled yet. Create a homework set and assign it to get started.
                            </div>
                        )}
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-sm text-blue-700">
                        <p className="font-semibold mb-2">Assignment tips</p>
                        <ul className="space-y-1 list-disc list-inside">
                            <li>Assign to groups for classroom-wide homework.</li>
                            <li>Use individual assignments for targeted practice.</li>
                            <li>Monitor progress from your dashboard.</li>
                        </ul>
                    </div>
                </div>
            </div>

            {homeworkModalOpen && (
                <HomeworkModal
                    mode={homeworkModalMode}
                    isSaving={saving}
                    formState={homeworkForm}
                    exercises={exercises}
                    onClose={closeHomeworkModal}
                    onSubmit={handleHomeworkSubmit}
                    onChange={setHomeworkForm}
                />
            )}

            {assignmentModalOpen && (
                <AssignmentModal
                    mode={assignmentModalMode}
                    isSaving={saving}
                    formState={assignmentForm}
                    homeworkOptions={homework}
                    groupOptions={groups}
                    studentOptions={students}
                    onClose={closeAssignmentModal}
                    onSubmit={handleAssignmentSubmit}
                    onChange={setAssignmentForm}
                />
            )}
        </Layout>
    );
}

interface HomeworkModalProps {
    mode: HomeworkModalMode;
    isSaving: boolean;
    formState: HomeworkFormState;
    exercises: Exercise[];
    onClose: () => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    onChange: React.Dispatch<React.SetStateAction<HomeworkFormState>>;
}

function HomeworkModal({
    mode,
    isSaving,
    formState,
    exercises,
    onClose,
    onSubmit,
    onChange
}: HomeworkModalProps) {
    const toggleExercise = (exerciseId: string) => {
        onChange((prev) => {
            const alreadySelected = prev.selectedExerciseIds.includes(exerciseId);
            return {
                ...prev,
                selectedExerciseIds: alreadySelected
                    ? prev.selectedExerciseIds.filter((id) => id !== exerciseId)
                    : [...prev.selectedExerciseIds, exerciseId]
            };
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            {mode === 'create' ? 'Create Homework Set' : 'Edit Homework Set'}
                        </h2>
                        <p className="text-sm text-gray-500">
                            Combine exercises into a reusable homework collection.
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
                            <label className="text-xs uppercase text-gray-500">Title</label>
                            <input
                                type="text"
                                required
                                value={formState.title}
                                onChange={(event) =>
                                    onChange((prev) => ({ ...prev, title: event.target.value }))
                                }
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase text-gray-500">Description</label>
                            <textarea
                                rows={5}
                                value={formState.description}
                                onChange={(event) =>
                                    onChange((prev) => ({ ...prev, description: event.target.value }))
                                }
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Explain the focus of this homework set..."
                            />
                        </div>
                    </section>

                    <section className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                Select Exercises
                            </h3>
                            <span className="text-xs text-gray-500">
                                {formState.selectedExerciseIds.length} selected
                            </span>
                        </div>
                        <div className="max-h-80 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-100">
                            {exercises.map((exercise) => {
                                const checked = formState.selectedExerciseIds.includes(exercise.id);
                                return (
                                    <label
                                        key={exercise.id}
                                        className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-gray-50 cursor-pointer"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {exercise.exerciseTypeName}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Difficulty: {exercise.difficulty ?? 'N/A'}
                                            </p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => toggleExercise(exercise.id)}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </label>
                                );
                            })}

                            {exercises.length === 0 && (
                                <div className="px-4 py-6 text-center text-gray-400 text-sm">
                                    No exercises available yet. Create exercises first to build homework sets.
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
                                ? 'Create Homework'
                                : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

interface AssignmentModalProps {
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

function AssignmentModal({
    mode,
    isSaving,
    formState,
    homeworkOptions,
    groupOptions,
    studentOptions,
    onClose,
    onSubmit,
    onChange
}: AssignmentModalProps) {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            {mode === 'create' ? 'Create Assignment' : 'Edit Assignment'}
                        </h2>
                        <p className="text-sm text-gray-500">
                            Schedule homework for specific groups or individual students.
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
                            <label className="text-xs uppercase text-gray-500">Homework set</label>
                            <select
                                value={formState.homeworkId}
                                onChange={(event) =>
                                    onChange((prev) => ({
                                        ...prev,
                                        homeworkId: event.target.value
                                    }))
                                }
                                required
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select homework</option>
                                {homeworkOptions.map((homework) => (
                                    <option key={homework.id} value={homework.id}>
                                        {homework.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase text-gray-500">Due date</label>
                            <input
                                type="date"
                                required
                                value={formState.dueDate}
                                onChange={(event) =>
                                    onChange((prev) => ({ ...prev, dueDate: event.target.value }))
                                }
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {mode === 'edit' && (
                            <div className="space-y-2">
                                <label className="text-xs uppercase text-gray-500">Status</label>
                                <select
                                    value={formState.status}
                                    onChange={(event) =>
                                        onChange((prev) => ({
                                            ...prev,
                                            status: event.target.value as HomeworkStatus
                                        }))
                                    }
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="ASSIGNED">Assigned</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="OVERDUE">Overdue</option>
                                </select>
                            </div>
                        )}
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
                                ? 'Create Assignment'
                                : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function formatAssignmentStatus(status: HomeworkStatus): string {
    switch (status) {
        case 'ASSIGNED':
            return 'Assigned';
        case 'IN_PROGRESS':
            return 'In Progress';
        case 'COMPLETED':
            return 'Completed';
        case 'OVERDUE':
            return 'Overdue';
        default:
            return status;
    }
}


