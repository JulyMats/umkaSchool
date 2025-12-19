import { useState, useMemo } from 'react';
import { Calendar, ClipboardList, Plus } from 'lucide-react';
import Layout from '../components/layout';
import { useAuth } from '../contexts/AuthContext';
import { homeworkService } from '../services/homework.service';
import {
    HomeworkDetail,
    HomeworkAssignmentDetail,
    CreateHomeworkPayload,
    UpdateHomeworkPayload,
    CreateHomeworkAssignmentPayload,
    UpdateHomeworkAssignmentPayload
} from '../types/homework';
import { LoadingState, ErrorState, EmptyState } from '../components/common';
import { Button } from '../components/ui';
import { useTeacherHomework } from '../hooks/useTeacherHomework';
import { extractErrorMessage } from '../utils/error.utils';
import { useModal } from '../hooks';
import {
    HomeworkCard,
    TeacherAssignmentCard,
    HomeworkModal,
    AssignmentModal,
    HomeworkFormState,
    AssignmentFormState
} from '../components/features/teacher';

type HomeworkModalMode = 'create' | 'edit';
type AssignmentModalMode = 'create' | 'edit';

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
    status: 'PENDING' 
};

export default function TeacherHomework() {
    const { teacher, isLoading: authLoading } = useAuth();
    const {
        homework,
        assignments,
        groups,
        students,
        exercises,
        exerciseTypes,
        loading,
        error: dataError,
        refetch
    } = useTeacherHomework(teacher?.id);
    const [homeworkModalMode, setHomeworkModalMode] = useState<HomeworkModalMode>('create');
    const [homeworkForm, setHomeworkForm] = useState<HomeworkFormState>(homeworkInitialState);
    const [assignmentModalMode, setAssignmentModalMode] = useState<AssignmentModalMode>('create');
    const [assignmentForm, setAssignmentForm] = useState<AssignmentFormState>(assignmentInitialState);
    const [saving, setSaving] = useState(false);
    const [deletingHomeworkId, setDeletingHomeworkId] = useState<string | null>(null);
    const [deletingAssignmentId, setDeletingAssignmentId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { isOpen: homeworkModalOpen, open: openHomeworkModal, close: closeHomeworkModal } = useModal();
    const { isOpen: assignmentModalOpen, open: openAssignmentModal, close: closeAssignmentModal } = useModal();

    const homeworkById = useMemo(() => {
        const map = new Map<string, HomeworkDetail>();
        homework.forEach((item) => map.set(item.id, item));
        return map;
    }, [homework]);

    const groupById = useMemo(() => {
        const map = new Map<string, typeof groups[0]>();
        groups.forEach((group) => map.set(group.id, group));
        return map;
    }, [groups]);

    const studentById = useMemo(() => {
        const map = new Map<string, typeof students[0]>();
        students.forEach((student) => map.set(student.id, student));
        return map;
    }, [students]);

    const openCreateHomeworkModal = () => {
        setHomeworkModalMode('create');
        setHomeworkForm(homeworkInitialState);
        openHomeworkModal();
    };

    const openEditHomeworkModal = (homeworkItem: HomeworkDetail) => {
        setHomeworkModalMode('edit');
        setHomeworkForm({
            id: homeworkItem.id,
            title: homeworkItem.title,
            description: homeworkItem.description,
            selectedExerciseIds: homeworkItem.exercises.map((exercise) => exercise.exerciseId)
        });
        openHomeworkModal();
    };

    const openCreateAssignmentModal = (homeworkId?: string) => {
        setAssignmentModalMode('create');
        setAssignmentForm({
            ...assignmentInitialState,
            homeworkId: homeworkId || ''
        });
        openAssignmentModal();
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
        openAssignmentModal();
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

                await homeworkService.createHomework(payload);
            } else if (homeworkModalMode === 'edit' && homeworkForm.id) {
                const payload: UpdateHomeworkPayload = {
                    title: homeworkForm.title,
                    description: homeworkForm.description,
                    teacherId: teacher.id,
                    exerciseIds: homeworkForm.selectedExerciseIds
                };

                await homeworkService.updateHomework(homeworkForm.id, payload);
            }

            closeHomeworkModal();
            await refetch();
        } catch (err: unknown) {
            console.error('[TeacherHomework] Failed to save homework', err);
            setError(extractErrorMessage(err, 'Failed to save homework. Please try again.'));
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

                await homeworkService.createHomeworkAssignment(payload);
            } else if (assignmentModalMode === 'edit' && assignmentForm.id) {
                const payload: UpdateHomeworkAssignmentPayload = {
                    dueDate: assignmentForm.dueDate,
                    groupIds: assignmentForm.selectedGroupIds,
                    studentIds: assignmentForm.selectedStudentIds
                };

                await homeworkService.updateHomeworkAssignment(
                    assignmentForm.id,
                    payload
                );
            }

            closeAssignmentModal();
            await refetch();
        } catch (err: unknown) {
            console.error('[TeacherHomework] Failed to save assignment', err);
            setError(extractErrorMessage(err, 'Failed to save assignment. Please try again.'));
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
            await refetch();
        } catch (err: unknown) {
            console.error('[TeacherHomework] Failed to delete homework', err);
            setError(extractErrorMessage(err, 'Failed to delete homework. Please try again.'));
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
            await refetch();
        } catch (err: unknown) {
            console.error('[TeacherHomework] Failed to delete assignment', err);
            setError(extractErrorMessage(err, 'Failed to delete assignment. Please try again.'));
        } finally {
            setDeletingAssignmentId(null);
        }
    };

    if (authLoading || loading) {
        return (
            <Layout title="Homework" subtitle="Loading homework library and assignments...">
                <LoadingState message="Loading homework library and assignments..." />
            </Layout>
        );
    }

    if (!teacher) {
        return (
            <Layout title="Homework" subtitle="Teacher profile required">
                <ErrorState message="You must complete your teacher profile before managing homework." />
            </Layout>
        );
    }

    return (
        <Layout
            title="Homework Management"
            subtitle="Build homework sets and schedule assignments for your students"
        >
            {(error || dataError) && (
                <ErrorState message={error || dataError || ''} className="mb-4" />
            )}

            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 space-y-6 flex flex-col">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Homework Library</h2>
                        <Button
                            onClick={openCreateHomeworkModal}
                            variant="primary"
                            className="inline-flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Create Homework
                        </Button>
                    </div>

                    <div className="space-y-4 overflow-y-auto flex-1 max-h-[calc(100vh-250px)]">
                        {homework.map((item) => (
                            <HomeworkCard
                                key={item.id}
                                homework={item}
                                onAssign={(homeworkId) => openCreateAssignmentModal(homeworkId)}
                                onEdit={openEditHomeworkModal}
                                onDelete={handleDeleteHomework}
                                isDeleting={deletingHomeworkId === item.id}
                            />
                        ))}

                        {homework.length === 0 && (
                            <EmptyState
                                message="You have not created any homework sets yet. Use the button above to start building your library."
                                icon={ClipboardList}
                            />
                        )}
                    </div>
                </div>

                <div className="w-full lg:w-96 space-y-4 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-semibold text-gray-900">Scheduled Assignments</h2>
                        <Button
                            onClick={() => openCreateAssignmentModal()}
                            variant="primary"
                            className="inline-flex items-center gap-2 text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            New Assignment
                        </Button>
                    </div>

                    <div className="space-y-4 overflow-y-auto flex-1 max-h-[calc(100vh-250px)] -mt-2">
                        {assignments.map((assignment) => {
                            const homeworkInfo = homeworkById.get(assignment.homeworkId);
                            const assignedGroups: string[] = (assignment.assignedGroupIds || [])
                                .map((groupId) => groupById.get(groupId)?.name)
                                .filter((name): name is string => Boolean(name));
                            const assignedStudents: string[] = (assignment.assignedStudentIds || [])
                                .map((studentId) => {
                                    const student = studentById.get(studentId);
                                    return student ? `${student.firstName} ${student.lastName}` : null;
                                })
                                .filter((name): name is string => Boolean(name));

                            return (
                                <TeacherAssignmentCard
                                    key={assignment.id}
                                    assignment={assignment}
                                    homeworkTitle={homeworkInfo?.title}
                                    assignedGroups={assignedGroups}
                                    assignedStudents={assignedStudents}
                                    onEdit={openEditAssignmentModal}
                                    onDelete={handleDeleteAssignment}
                                    isDeleting={deletingAssignmentId === assignment.id}
                                />
                            );
                        })}

                        {assignments.length === 0 && (
                            <EmptyState
                                message="No assignments scheduled yet. Create a homework set and assign it to get started."
                                icon={Calendar}
                            />
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

            <HomeworkModal
                isOpen={homeworkModalOpen}
                mode={homeworkModalMode}
                isSaving={saving}
                formState={homeworkForm}
                exercises={exercises}
                exerciseTypes={exerciseTypes}
                teacherId={teacher?.id || ''}
                onClose={closeHomeworkModal}
                onSubmit={handleHomeworkSubmit}
                onChange={setHomeworkForm}
                onExerciseCreated={async () => {
                    await refetch();
                }}
            />

            <AssignmentModal
                isOpen={assignmentModalOpen}
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
        </Layout>
    );
}
