import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Calendar, CalendarPlus, ClipboardList, Loader2, Plus, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { homeworkService } from '../services/homework.service';
import { groupService } from '../services/group.service';
import { studentService } from '../services/student.service';
import { exerciseService } from '../services/exercise.service';
import { exerciseTypeService } from '../services/exerciseType.service';
import {
    HomeworkDetail,
    HomeworkAssignmentDetail,
    HomeworkStatus,
    CreateHomeworkPayload,
    UpdateHomeworkPayload,
    CreateHomeworkAssignmentPayload,
    UpdateHomeworkAssignmentPayload
} from '../types/homework';
import { Group } from '../types/group';
import { Student } from '../types/student';
import { Exercise } from '../types/exercise';
import { ExerciseType } from '../types/exerciseType';
import { DigitLength, DigitType } from '../types/exercise';

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
    const [exerciseTypes, setExerciseTypes] = useState<ExerciseType[]>([]);
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
                    exercisesResponse,
                    exerciseTypesResponse
                ] = await Promise.all([
                    homeworkService.getHomeworkByTeacher(teacher.id),
                    homeworkService.getAssignmentsByTeacher(teacher.id),
                    groupService.getGroupsByTeacher(teacher.id),
                    studentService.getStudentsByTeacher(teacher.id),
                    exerciseService.getExercisesByTeacher(teacher.id),
                    exerciseTypeService.getAllExerciseTypes()
                ]);

                setHomework(homeworkResponse);
                setAssignments(assignmentsResponse);
                setGroups(groupsResponse);
                setStudents(studentsResponse);
                setExercises(exercisesResponse);
                setExerciseTypes(exerciseTypesResponse);
            } catch (err: any) {
                console.error('[TeacherHomework] Failed to load data', err);
                setError(err?.message || 'Failed to load homework data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [teacher?.id]);

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
                <div className="flex-1 space-y-6 flex flex-col">
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

                    <div className="space-y-4 overflow-y-auto flex-1 max-h-[calc(100vh-250px)]">
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

                                    <div className="flex flex-col items-end gap-2">
                                        <button
                                            onClick={() => openCreateAssignmentModal(item.id)}
                                            className="inline-flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                                        >
                                            <CalendarPlus className="w-4 h-4" />
                                            Assign Homework
                                        </button>
                                        <button
                                            onClick={() => openEditHomeworkModal(item)}
                                            className="inline-flex items-center justify-center gap-2 text-blue-600 px-4 py-2 rounded-lg hover:text-blue-700 transition-colors"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-end border-t border-gray-100 pt-4">
                                    <button
                                        onClick={() => handleDeleteHomework(item)}
                                        disabled={deletingHomeworkId === item.id}
                                        className="inline-flex items-center justify-center gap-2 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        {deletingHomeworkId === item.id ? 'Deleting...' : 'Delete'}
                                    </button>
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

                <div className="w-full lg:w-96 space-y-4 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-semibold text-gray-900">Scheduled Assignments</h2>
                        <button
                            onClick={() => openCreateAssignmentModal()}
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            New Assignment
                        </button>
                    </div>

                    <div className="space-y-4 overflow-y-auto flex-1 max-h-[calc(100vh-250px)] -mt-2">
                        {assignments.map((assignment) => {
                            const statusLabel = formatAssignmentStatus(assignment.status);
                            const homeworkInfo = homeworkById.get(assignment.homeworkId);
                            const assignedGroups = assignment.assignedGroupIds
                                .map((groupId) => groupById.get(groupId)?.name)
                                .filter(Boolean);
                            const assignedStudents = assignment.assignedStudentIds
                                .map((studentId) => studentById.get(studentId))
                                .filter(Boolean);

                            const getStatusColors = (status: string) => {
                                switch (status) {
                                    case 'ASSIGNED':
                                    case 'IN_PROGRESS':
                                        return {
                                            bg: 'bg-blue-50',
                                            border: 'border-blue-200',
                                            text: 'text-blue-700',
                                            badge: 'bg-blue-100 text-blue-700'
                                        };
                                    case 'COMPLETED':
                                        return {
                                            bg: 'bg-green-50',
                                            border: 'border-green-200',
                                            text: 'text-green-700',
                                            badge: 'bg-green-100 text-green-700'
                                        };
                                    case 'OVERDUE':
                                        return {
                                            bg: 'bg-red-50',
                                            border: 'border-red-200',
                                            text: 'text-red-700',
                                            badge: 'bg-red-100 text-red-700'
                                        };
                                    default:
                                        return {
                                            bg: 'bg-gray-50',
                                            border: 'border-gray-200',
                                            text: 'text-gray-700',
                                            badge: 'bg-gray-100 text-gray-700'
                                        };
                                }
                            };

                            const colors = getStatusColors(assignment.status);

                            return (
                                <div
                                    key={assignment.id}
                                    className={`${colors.bg} ${colors.border} border rounded-2xl p-5 shadow-sm`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className={`text-xs ${colors.text} uppercase tracking-wide font-medium`}>
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
                    exerciseTypes={exerciseTypes}
                    teacherId={teacher?.id || ''}
                    onClose={closeHomeworkModal}
                    onSubmit={handleHomeworkSubmit}
                    onChange={setHomeworkForm}
                    onExerciseCreated={(newExercise) => {
                        setExercises((prev) => [newExercise, ...prev]);
                    }}
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
    exerciseTypes: ExerciseType[];
    teacherId: string;
    onClose: () => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    onChange: React.Dispatch<React.SetStateAction<HomeworkFormState>>;
    onExerciseCreated: (exercise: Exercise) => void;
}

function HomeworkModal({
    mode,
    isSaving,
    formState,
    exercises,
    exerciseTypes,
    teacherId,
    onClose,
    onSubmit,
    onChange,
    onExerciseCreated
}: HomeworkModalProps) {
    const [activeTab, setActiveTab] = useState<'existing' | 'create'>('existing');
    const [creatingExercise, setCreatingExercise] = useState(false);
    const [createExerciseError, setCreateExerciseError] = useState<string | null>(null);

    const formatExerciseParameters = (parameters: string): string => {
        try {
            const params = JSON.parse(parameters);
            const parts: string[] = [];

            if (params.exampleCount) {
                parts.push(`${params.exampleCount} examples`);
            }
            if (params.cardCount) {
                parts.push(`${params.cardCount} cards`);
            }
            if (params.digitType) {
                const digitTypeLabels: Record<string, string> = {
                    'single-digit': 'Single-digit',
                    'two-digit': 'Two-digit',
                    'three-digit': 'Three-digit',
                    'four-digit': 'Four-digit'
                };
                parts.push(digitTypeLabels[params.digitType] || params.digitType);
            }
            if (params.dividendDigits) {
                parts.push(`Dividend: ${params.dividendDigits[0]}-${params.dividendDigits[1]} digits`);
            }
            if (params.divisorDigits) {
                parts.push(`Divisor: ${params.divisorDigits[0]}-${params.divisorDigits[1]} digits`);
            }
            if (params.firstMultiplierDigits) {
                parts.push(`Multiplier: ${params.firstMultiplierDigits[0]}-${params.firstMultiplierDigits[1]} digits`);
            }
            if (params.minValue !== undefined && params.maxValue !== undefined) {
                parts.push(`Range: ${params.minValue}-${params.maxValue}`);
            }
            if (params.timePerQuestion) {
                const minutes = Math.floor(params.timePerQuestion / 60);
                const seconds = params.timePerQuestion % 60;
                if (minutes > 0) {
                    parts.push(`Time: ${minutes}m ${seconds > 0 ? seconds + 's' : ''}`);
                } else {
                    parts.push(`Time: ${seconds}s`);
                }
            }
            if (params.displaySpeed) {
                parts.push(`Speed: ${params.displaySpeed}s`);
            }
            if (params.theme) {
                parts.push(`Theme: ${params.theme}`);
            }

            return parts.length > 0 ? parts.join(' • ') : 'No parameters';
        } catch {
            return 'Invalid parameters';
        }
    };

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
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                Exercises
                            </h3>
                            <span className="text-xs text-gray-500">
                                {formState.selectedExerciseIds.length} selected
                            </span>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 border-b border-gray-200 mb-4">
                            <button
                                type="button"
                                onClick={() => setActiveTab('existing')}
                                className={`px-4 py-2 text-sm font-medium transition-colors ${
                                    activeTab === 'existing'
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Select Existing
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('create')}
                                className={`px-4 py-2 text-sm font-medium transition-colors ${
                                    activeTab === 'create'
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Create New
                            </button>
                        </div>

                        {/* Existing Exercises Tab */}
                        {activeTab === 'existing' && (
                            <div className="space-y-3">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('create')}
                                    className="w-full px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create New Exercise
                                </button>
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
                                                        {formatExerciseParameters(exercise.parameters)}
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
                            </div>
                        )}

                        {/* Create New Exercise Tab */}
                        {activeTab === 'create' && (
                            <CreateExerciseForm
                                exerciseTypes={exerciseTypes}
                                teacherId={teacherId}
                                creating={creatingExercise}
                                error={createExerciseError}
                                onCreatingChange={setCreatingExercise}
                                onErrorChange={setCreateExerciseError}
                                onExerciseCreated={(exercise) => {
                                    onExerciseCreated(exercise);
                                    onChange((prev) => ({
                                        ...prev,
                                        selectedExerciseIds: [...prev.selectedExerciseIds, exercise.id]
                                    }));
                                    setActiveTab('existing');
                                }}
                            />
                        )}
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

interface CreateExerciseFormProps {
    exerciseTypes: ExerciseType[];
    teacherId: string;
    creating: boolean;
    error: string | null;
    onCreatingChange: (creating: boolean) => void;
    onErrorChange: (error: string | null) => void;
    onExerciseCreated: (exercise: Exercise) => void;
}

const digitTypeOptions: { value: DigitType; label: string }[] = [
    { value: 'single-digit', label: 'Single-digit' },
    { value: 'two-digit', label: 'Two-digit' },
    { value: 'three-digit', label: 'Three-digit' },
    { value: 'four-digit', label: 'Four-digit' }
];

const themeLabels: Record<string, string> = {
    'simple': 'Simple',
    'friend': 'Friend',
    'brother': 'Brother',
    'transition': 'Transition',
    'friend+brother': 'Friend + Brother',
    'friend+brat': 'Friend + Brat',
    '0-20': 'From 0 to 20',
    '0-9': 'From 0 to 9',
    '10-90': 'Tens (10-90)',
    '10-19': 'Two-digit (10-19)',
    '10-99': 'Two-digit (10-99)',
    '100-900': 'Hundreds (100-900)',
    '100-999': 'Three-digit (100-999)',
    'From 0 to 20': 'From 0 to 20',
    'From 0 to 9': 'From 0 to 9',
    'Tens (10-90)': 'Tens (10-90)',
    'Two-digit (10-19)': 'Two-digit (10-19)',
    'Two-digit (10-99)': 'Two-digit (10-99)',
    'Hundreds (100-900)': 'Hundreds (100-900)',
    'Three-digit (100-999)': 'Three-digit (100-999)'
};

function CreateExerciseForm({
    exerciseTypes,
    teacherId,
    creating,
    error,
    onCreatingChange,
    onErrorChange,
    onExerciseCreated
}: CreateExerciseFormProps) {
    const [selectedExerciseTypeId, setSelectedExerciseTypeId] = useState<string>('');
    const [exerciseType, setExerciseType] = useState<ExerciseType | null>(null);

    const ranges = exerciseType?.parameterRanges || {};

    const [exampleCount, setExampleCount] = useState(() => {
        const range = ranges.exampleCount || [1, 30];
        return Math.round((range[0] + range[1]) / 2);
    });

    const [timePerQuestion, setTimePerQuestion] = useState(() => {
        const range = ranges.timePerQuestion || [2, 30];
        return Math.round((range[0] + range[1]) / 2);
    });

    const [displaySpeed, setDisplaySpeed] = useState(() => {
        const range = ranges.displaySpeed || [0.5, 10];
        return Number(((range[0] + range[1]) / 2).toFixed(1));
    });

    const [cardCount, setCardCount] = useState(() => {
        const range = ranges.cardCount || [2, 15];
        return Math.round((range[0] + range[1]) / 2);
    });

    const [digitType, setDigitType] = useState<DigitType>('single-digit');
    const [dividendDigits, setDividendDigits] = useState<[number, number]>(() => {
        const range = ranges.dividendDigits || [2, 4];
        return range as [number, number];
    });

    const [divisorDigits, setDivisorDigits] = useState<[number, number]>(() => {
        const range = ranges.divisorDigits || [1, 3];
        return range as [number, number];
    });

    const [firstMultiplierDigits, setFirstMultiplierDigits] = useState<[number, number]>(() => {
        const range = ranges.firstMultiplierDigits || [1, 4];
        return range as [number, number];
    });

    const [minValue, setMinValue] = useState(() => ranges.minValue || 1);
    const [maxValue, setMaxValue] = useState(() => ranges.maxValue || 9);
    const [selectedTheme, setSelectedTheme] = useState<string>(() => {
        const availableThemes = ranges.themes || [];
        return availableThemes[0] || '';
    });

    useEffect(() => {
        if (!selectedExerciseTypeId) {
            setExerciseType(null);
            return;
        }

        const foundType = exerciseTypes.find(et => et.id === selectedExerciseTypeId);
        if (foundType) {
            setExerciseType(foundType);
            const ranges = foundType.parameterRanges || {};
            
            // Reset values based on new exercise type
            if (ranges.exampleCount) {
                setExampleCount(Math.round((ranges.exampleCount[0] + ranges.exampleCount[1]) / 2));
            }
            if (ranges.timePerQuestion) {
                setTimePerQuestion(Math.round((ranges.timePerQuestion[0] + ranges.timePerQuestion[1]) / 2));
            }
            if (ranges.displaySpeed) {
                setDisplaySpeed(Number(((ranges.displaySpeed[0] + ranges.displaySpeed[1]) / 2).toFixed(1)));
            }
            if (ranges.cardCount) {
                setCardCount(Math.round((ranges.cardCount[0] + ranges.cardCount[1]) / 2));
            }
            if (ranges.dividendDigits) {
                setDividendDigits(ranges.dividendDigits as [number, number]);
            }
            if (ranges.divisorDigits) {
                setDivisorDigits(ranges.divisorDigits as [number, number]);
            }
            if (ranges.firstMultiplierDigits) {
                setFirstMultiplierDigits(ranges.firstMultiplierDigits as [number, number]);
            }
            if (ranges.minValue !== undefined) {
                setMinValue(ranges.minValue);
            }
            if (ranges.maxValue !== undefined) {
                setMaxValue(ranges.maxValue);
            }
            if (ranges.themes && ranges.themes.length > 0) {
                setSelectedTheme(ranges.themes[0]);
            }
        }
    }, [selectedExerciseTypeId, exerciseTypes]);

    const exerciseTypeName = exerciseType?.name?.toLowerCase() || '';
    const isDivision = exerciseTypeName.includes('division');
    const isMultiplication = exerciseTypeName.includes('multiplication');
    const isAdditionSubtraction = exerciseTypeName.includes('addition') || exerciseTypeName.includes('subtraction');
    const isFlashCards = exerciseTypeName.includes('flash cards') && !exerciseTypeName.includes('active');
    const isFlashCardsActive = exerciseTypeName.includes('flash cards active');
    const isThemeTraining = exerciseTypeName.includes('theme training');

    const calculateDifficulty = (): number => {
        if (!exerciseType) return 1;
        
        let difficulty = exerciseType.difficulty === 'beginner' ? 1 : exerciseType.difficulty === 'intermediate' ? 5 : 10;

        if (isDivision || isMultiplication) {
            const avgDigits = isDivision 
                ? (dividendDigits[0] + dividendDigits[1] + divisorDigits[0] + divisorDigits[1]) / 4
                : (firstMultiplierDigits[0] + firstMultiplierDigits[1]) / 2;
            difficulty = Math.min(10, Math.max(1, Math.round(difficulty + avgDigits * 1.5)));
        }

        if (isAdditionSubtraction || isThemeTraining) {
            const digitMap: Record<DigitType, number> = {
                'single-digit': 1,
                'two-digit': 2,
                'three-digit': 3,
                'four-digit': 4
            };
            const digitLength = digitMap[digitType] || 1;
            difficulty = Math.min(10, Math.max(1, Math.round(difficulty + digitLength * 1.2)));
        }

        return Math.min(10, Math.max(1, difficulty));
    };

    const calculatePoints = (): number => {
        const baseDifficulty = calculateDifficulty();
        return baseDifficulty * 10;
    };

    const handleSubmit = async (event?: React.MouseEvent<HTMLButtonElement>) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation(); 
        }
        
        if (!exerciseType) {
            onErrorChange('Please select an exercise type');
            return;
        }

        onErrorChange(null);
        onCreatingChange(true);

        try {
            const parameters: any = {
                exerciseTypeId: exerciseType.id,
                exerciseTypeName: exerciseType.name
            };

            if (isDivision) {
                parameters.exampleCount = exampleCount;
                parameters.dividendDigits = dividendDigits;
                parameters.divisorDigits = divisorDigits;
                parameters.timePerQuestion = timePerQuestion;
            }

            if (isMultiplication) {
                parameters.exampleCount = exampleCount;
                parameters.firstMultiplierDigits = firstMultiplierDigits;
                parameters.minValue = minValue;
                parameters.maxValue = maxValue;
                parameters.timePerQuestion = timePerQuestion;
            }

            if (isAdditionSubtraction) {
                parameters.timePerQuestion = timePerQuestion;
                parameters.cardCount = cardCount;
                parameters.digitType = digitType;
                parameters.theme = selectedTheme;
                parameters.displaySpeed = displaySpeed;
                const digitTypeMap: Record<DigitType, DigitLength> = {
                    'single-digit': 1,
                    'two-digit': 2,
                    'three-digit': 3,
                    'four-digit': 4
                };
                parameters.digitLength = digitTypeMap[digitType];
            }

            if (isFlashCards || isFlashCardsActive) {
                parameters.theme = selectedTheme;
                parameters.displaySpeed = displaySpeed;
            }

            if (isThemeTraining) {
                parameters.displaySpeed = displaySpeed;
                parameters.timePerQuestion = timePerQuestion;
                parameters.cardCount = cardCount;
                parameters.digitType = digitType;
                parameters.theme = selectedTheme;
                const digitTypeMap: Record<DigitType, DigitLength> = {
                    'single-digit': 1,
                    'two-digit': 2,
                    'three-digit': 3,
                    'four-digit': 4
                };
                parameters.digitLength = digitTypeMap[digitType];
            }

            console.log('[CreateExerciseForm] Creating exercise with payload:', {
                exerciseTypeId: exerciseType.id,
                parameters: JSON.stringify(parameters),
                difficulty: calculateDifficulty(),
                points: calculatePoints(),
                createdById: teacherId
            });

            const newExercise = await exerciseService.createExercise({
                exerciseTypeId: exerciseType.id,
                parameters: JSON.stringify(parameters),
                difficulty: calculateDifficulty(),
                points: calculatePoints(),
                createdById: teacherId
            });

            console.log('[CreateExerciseForm] Exercise created successfully:', newExercise);

            onExerciseCreated(newExercise);

            setSelectedExerciseTypeId('');
            setExerciseType(null);
        } catch (err: any) {
            console.error('[CreateExerciseForm] Failed to create exercise', err);
            let errorMessage = 'Failed to create exercise. Please try again.';
            
            if (err?.response?.data) {
                if (err.response.data.fieldErrors) {
                    const fieldErrors = err.response.data.fieldErrors;
                    errorMessage = Object.entries(fieldErrors)
                        .map(([field, message]) => `${field}: ${message}`)
                        .join(', ');
                } else if (err.response.data.message) {
                    errorMessage = err.response.data.message;
                } else if (err.response.data.error) {
                    errorMessage = err.response.data.error;
                }
            } else if (err?.message) {
                errorMessage = err.message;
            }
            
            console.error('[CreateExerciseForm] Error details:', {
                message: errorMessage,
                response: err?.response?.data,
                status: err?.response?.status,
                fullError: err
            });
            onErrorChange(errorMessage);
        } finally {
            onCreatingChange(false);
        }
    };

    const formatTime = (seconds: number): string => {
        if (seconds >= 60) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
        }
        return `${seconds}s`;
    };

    return (
        <div className="max-h-96 overflow-y-auto border border-gray-100 rounded-xl p-4 bg-gray-50">
            {error && (
                <div className="mb-4 p-3 bg-red-50 border-2 border-red-300 text-red-700 rounded-lg text-sm font-medium animate-pulse">
                    ⚠️ {error}
                </div>
            )}

            {creating && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating exercise...
                </div>
            )}

            <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                        Exercise Type
                    </label>
                    <select
                        value={selectedExerciseTypeId}
                        onChange={(e) => setSelectedExerciseTypeId(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                        <option value="">Select exercise type...</option>
                        {exerciseTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                                {type.name}
                            </option>
                        ))}
                    </select>
                </div>

                {exerciseType && (
                    <div className="space-y-4 border-t border-gray-200 pt-4">
                        {/* Division Settings */}
                        {isDivision && (
                            <>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                                        Number of Examples: {exampleCount}
                                    </label>
                                    <input
                                        type="range"
                                        min={ranges.exampleCount?.[0] || 1}
                                        max={ranges.exampleCount?.[1] || 30}
                                        value={exampleCount}
                                        onChange={(e) => setExampleCount(Number(e.target.value))}
                                        className="w-full accent-blue-500"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-2">
                                            Dividend: {dividendDigits[0]}-{dividendDigits[1]} digits
                                        </label>
                                        <div className="space-y-2">
                                            <input
                                                type="range"
                                                min={ranges.dividendDigits?.[0] || 2}
                                                max={ranges.dividendDigits?.[1] || 4}
                                                value={dividendDigits[0]}
                                                onChange={(e) => setDividendDigits([Number(e.target.value), dividendDigits[1]])}
                                                className="w-full accent-green-500"
                                            />
                                            <input
                                                type="range"
                                                min={dividendDigits[0]}
                                                max={ranges.dividendDigits?.[1] || 4}
                                                value={dividendDigits[1]}
                                                onChange={(e) => setDividendDigits([dividendDigits[0], Number(e.target.value)])}
                                                className="w-full accent-green-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-2">
                                            Divisor: {divisorDigits[0]}-{divisorDigits[1]} digits
                                        </label>
                                        <div className="space-y-2">
                                            <input
                                                type="range"
                                                min={ranges.divisorDigits?.[0] || 1}
                                                max={ranges.divisorDigits?.[1] || 3}
                                                value={divisorDigits[0]}
                                                onChange={(e) => setDivisorDigits([Number(e.target.value), divisorDigits[1]])}
                                                className="w-full accent-orange-500"
                                            />
                                            <input
                                                type="range"
                                                min={divisorDigits[0]}
                                                max={ranges.divisorDigits?.[1] || 3}
                                                value={divisorDigits[1]}
                                                onChange={(e) => setDivisorDigits([divisorDigits[0], Number(e.target.value)])}
                                                className="w-full accent-orange-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                                        Time per Question: {formatTime(timePerQuestion)}
                                    </label>
                                    <input
                                        type="range"
                                        min={ranges.timePerQuestion?.[0] || 60}
                                        max={ranges.timePerQuestion?.[1] || 600}
                                        step={30}
                                        value={timePerQuestion}
                                        onChange={(e) => setTimePerQuestion(Number(e.target.value))}
                                        className="w-full accent-pink-500"
                                    />
                                </div>
                            </>
                        )}

                        {/* Multiplication Settings */}
                        {isMultiplication && (
                            <>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                                        Number of Examples: {exampleCount}
                                    </label>
                                    <input
                                        type="range"
                                        min={ranges.exampleCount?.[0] || 1}
                                        max={ranges.exampleCount?.[1] || 30}
                                        value={exampleCount}
                                        onChange={(e) => setExampleCount(Number(e.target.value))}
                                        className="w-full accent-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                                        First Multiplier: {firstMultiplierDigits[0]}-{firstMultiplierDigits[1]} digits
                                    </label>
                                    <div className="space-y-2">
                                        <input
                                            type="range"
                                            min={ranges.firstMultiplierDigits?.[0] || 1}
                                            max={ranges.firstMultiplierDigits?.[1] || 4}
                                            value={firstMultiplierDigits[0]}
                                            onChange={(e) => setFirstMultiplierDigits([Number(e.target.value), firstMultiplierDigits[1]])}
                                            className="w-full accent-green-500"
                                        />
                                        <input
                                            type="range"
                                            min={firstMultiplierDigits[0]}
                                            max={ranges.firstMultiplierDigits?.[1] || 4}
                                            value={firstMultiplierDigits[1]}
                                            onChange={(e) => setFirstMultiplierDigits([firstMultiplierDigits[0], Number(e.target.value)])}
                                            className="w-full accent-green-500"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-2">
                                            Min Value: {minValue}
                                        </label>
                                        <input
                                            type="range"
                                            min={ranges.minValue || 1}
                                            max={ranges.maxValue || 9}
                                            value={minValue}
                                            onChange={(e) => setMinValue(Number(e.target.value))}
                                            className="w-full accent-yellow-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-2">
                                            Max Value: {maxValue}
                                        </label>
                                        <input
                                            type="range"
                                            min={minValue}
                                            max={ranges.maxValue || 9}
                                            value={maxValue}
                                            onChange={(e) => setMaxValue(Number(e.target.value))}
                                            className="w-full accent-yellow-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                                        Time per Question: {formatTime(timePerQuestion)}
                                    </label>
                                    <input
                                        type="range"
                                        min={ranges.timePerQuestion?.[0] || 60}
                                        max={ranges.timePerQuestion?.[1] || 600}
                                        step={30}
                                        value={timePerQuestion}
                                        onChange={(e) => setTimePerQuestion(Number(e.target.value))}
                                        className="w-full accent-pink-500"
                                    />
                                </div>
                            </>
                        )}

                        {/* Addition/Subtraction Settings */}
                        {(isAdditionSubtraction || isThemeTraining) && (
                            <>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                                        Number of Cards: {cardCount}
                                    </label>
                                    <input
                                        type="range"
                                        min={ranges.cardCount?.[0] || 2}
                                        max={ranges.cardCount?.[1] || 15}
                                        value={cardCount}
                                        onChange={(e) => setCardCount(Number(e.target.value))}
                                        className="w-full accent-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                                        Digit Type
                                    </label>
                                    <select
                                        value={digitType}
                                        onChange={(e) => setDigitType(e.target.value as DigitType)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    >
                                        {digitTypeOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {ranges.themes && ranges.themes.length > 0 && (
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-2">
                                            Theme
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {ranges.themes.map((theme) => (
                                                <button
                                                    key={theme}
                                                    type="button"
                                                    onClick={() => setSelectedTheme(theme)}
                                                    className={`px-3 py-1 rounded-lg text-sm border transition-colors ${
                                                        selectedTheme === theme
                                                            ? 'bg-blue-500 text-white border-blue-500'
                                                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {themeLabels[theme] || theme}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                                        Display Speed: {displaySpeed}s
                                    </label>
                                    <input
                                        type="range"
                                        min={ranges.displaySpeed?.[0] || 0.5}
                                        max={ranges.displaySpeed?.[1] || 10}
                                        step={0.1}
                                        value={displaySpeed}
                                        onChange={(e) => setDisplaySpeed(Number(e.target.value))}
                                        className="w-full accent-purple-500"
                                    />
                                </div>
                                {isThemeTraining && (
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-2">
                                            Time per Question: {formatTime(timePerQuestion)}
                                        </label>
                                        <input
                                            type="range"
                                            min={ranges.timePerQuestion?.[0] || 2}
                                            max={ranges.timePerQuestion?.[1] || 30}
                                            value={timePerQuestion}
                                            onChange={(e) => setTimePerQuestion(Number(e.target.value))}
                                            className="w-full accent-pink-500"
                                        />
                                    </div>
                                )}
                            </>
                        )}

                        {/* Flash Cards Settings */}
                        {(isFlashCards || isFlashCardsActive) && (
                            <>
                                {ranges.themes && ranges.themes.length > 0 && (
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-2">
                                            Theme
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {ranges.themes.map((theme) => (
                                                <button
                                                    key={theme}
                                                    type="button"
                                                    onClick={() => setSelectedTheme(theme)}
                                                    className={`px-3 py-1 rounded-lg text-sm border transition-colors ${
                                                        selectedTheme === theme
                                                            ? 'bg-blue-500 text-white border-blue-500'
                                                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {themeLabels[theme] || theme}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                                        Display Speed: {displaySpeed}s
                                    </label>
                                    <input
                                        type="range"
                                        min={ranges.displaySpeed?.[0] || 0.5}
                                        max={ranges.displaySpeed?.[1] || 10}
                                        step={0.1}
                                        value={displaySpeed}
                                        onChange={(e) => setDisplaySpeed(Number(e.target.value))}
                                        className="w-full accent-purple-500"
                                    />
                                </div>
                            </>
                        )}

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={creating || !exerciseType}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 text-sm font-medium"
                        >
                            {creating ? 'Creating...' : 'Create Exercise'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}


