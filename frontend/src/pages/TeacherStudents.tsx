import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Loader2, Plus, Search, Users } from 'lucide-react';
import Layout from '../components/layout';
import { useAuth } from '../contexts/AuthContext';
import { studentService } from '../services/student.service';
import { groupService } from '../services/group.service';
import { achievementService } from '../services/achievement.service';
import { Student } from '../types/student';
import { Group } from '../types/group';
import { StudentAchievement } from '../types/achievement';

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
    const [students, setStudents] = useState<Student[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [unassignedStudents, setUnassignedStudents] = useState<Student[]>([]);
    const [studentLastAchievements, setStudentLastAchievements] = useState<Record<string, StudentAchievement | null>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [manageModalOpen, setManageModalOpen] = useState(false);
    const [assignForm, setAssignForm] = useState<AssignFormState>({ studentId: '', groupId: null });
    const [manageForm, setManageForm] = useState<ManageFormState>({ studentId: '', groupId: null });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (!teacher?.id) {
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const [assignedStudents, teacherGroups, allStudents] = await Promise.all([
                    studentService.getStudentsByTeacher(teacher.id),
                    groupService.getGroupsByTeacher(teacher.id),
                    studentService.getAllStudents()
                ]);

                setStudents(assignedStudents);
                setGroups(teacherGroups);
                setUnassignedStudents(allStudents.filter((student) => !student.teacherId));

                // Load last achievements for all assigned students
                const achievementsMap: Record<string, StudentAchievement | null> = {};
                for (const student of assignedStudents) {
                    try {
                        const allAchievements = await achievementService.getStudentAchievements(student.id);
                        if (allAchievements.length > 0) {
                            // Sort by earned date and get the most recent one
                            const sortedAchievements = allAchievements.sort(
                                (a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()
                            );
                            achievementsMap[student.id] = sortedAchievements[0];
                        } else {
                            achievementsMap[student.id] = null;
                        }
                    } catch (err) {
                        console.error(`Failed to load achievements for student ${student.id}:`, err);
                        achievementsMap[student.id] = null;
                    }
                }
                setStudentLastAchievements(achievementsMap);
            } catch (err: any) {
                console.error('[TeacherStudents] Failed to load data', err);
                setError(err?.message || 'Failed to load students. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [teacher?.id]);

    const refreshData = async () => {
        if (!teacher?.id) {
            return;
        }

        try {
            const [assignedStudents, teacherGroups, allStudents] = await Promise.all([
                studentService.getStudentsByTeacher(teacher.id),
                groupService.getGroupsByTeacher(teacher.id),
                studentService.getAllStudents()
            ]);

            setStudents(assignedStudents);
            setGroups(teacherGroups);
            setUnassignedStudents(allStudents.filter((student) => !student.teacherId));
        } catch (err: any) {
            console.error('[TeacherStudents] Failed to refresh data', err);
            setError(err?.message || 'Failed to refresh data. Please try again.');
        }
    };

    const filteredStudents = useMemo(() => {
        if (!searchTerm.trim()) {
            return students;
        }

        const term = searchTerm.toLowerCase();
        return students.filter((student) =>
            [student.firstName, student.lastName, student.email, student.groupName]
                .filter(Boolean)
                .some((value) => value!.toLowerCase().includes(term))
        );
    }, [students, searchTerm]);

    const openAssignModal = () => {
        setAssignForm({ studentId: '', groupId: null });
        setAssignModalOpen(true);
    };

    const openManageModal = (student: Student) => {
        setManageForm({ studentId: student.id, groupId: student.groupId });
        setManageModalOpen(true);
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

            setAssignModalOpen(false);
            await refreshData();
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

            setManageModalOpen(false);
            await refreshData();
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
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                </div>
            </Layout>
        );
    }

    if (!teacher) {
        return (
            <Layout title="Students" subtitle="Teacher profile required">
                <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-6">
                    You must complete your teacher profile before managing students.
                </div>
            </Layout>
        );
    }

    return (
        <Layout
            title="Students"
            subtitle="Assign existing students and manage their group placements"
        >
            {error && (
                <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{error}</span>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="relative w-full md:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, email, or group"
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <button
                    onClick={openAssignModal}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Assign Student
                </button>
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
                            <tr key={student.id} className="hover:bg-gray-50/80 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">
                                        {student.firstName} {student.lastName}
                                    </div>
                                    <div className="text-gray-500 text-xs">{student.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    {student.guardian ? (
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {student.guardian.firstName} {student.guardian.lastName}
                                            </p>
                                            <p className="text-gray-500 text-xs">
                                                {student.guardian.relationship} • {student.guardian.email}
                                            </p>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 italic text-sm">
                                            No guardian info
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {student.groupName ? (
                                        <div>
                                            <p className="font-medium text-gray-900">{student.groupName}</p>
                                            <p className="text-gray-500 text-xs">
                                                Code: {student.groupCode || '—'}
                                            </p>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 italic text-sm">Unassigned</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {studentLastAchievements[student.id] ? (
                                        <div>
                                            <p className="text-gray-900 font-medium">
                                                {studentLastAchievements[student.id]?.name}
                                            </p>
                                            <p className="text-gray-500 text-xs">
                                                {new Date(studentLastAchievements[student.id]!.earnedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-gray-400 italic text-sm">
                                            No achievement
                                        </p>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-gray-900 font-medium">
                                        {student.enrollmentDate
                                            ? new Date(student.enrollmentDate).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })
                                            : '—'}
                                    </p>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => openManageModal(student)}
                                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                        >
                                            Manage
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {filteredStudents.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-3">
                                        <Users className="w-8 h-8 text-gray-300" />
                                        <p className="text-sm">
                                            {students.length === 0
                                                ? 'You have not assigned any students yet.'
                                                : 'No students match your search.'}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {assignModalOpen && (
                <AssignStudentModal
                    isSaving={saving}
                    formState={assignForm}
                    unassignedStudents={unassignedStudents}
                    groups={groups}
                    studentLastAchievements={studentLastAchievements}
                    onClose={() => setAssignModalOpen(false)}
                    onSubmit={handleAssignSubmit}
                    onChange={setAssignForm}
                />
            )}

            {manageModalOpen && (
                <ManageStudentModal
                    isSaving={saving}
                    formState={manageForm}
                    groups={groups}
                    students={students}
                    studentLastAchievements={studentLastAchievements}
                    onClose={() => setManageModalOpen(false)}
                    onSubmit={handleManageSubmit}
                    onChange={setManageForm}
                />
            )}
        </Layout>
    );
}

interface AssignStudentModalProps {
    isSaving: boolean;
    formState: AssignFormState;
    unassignedStudents: Student[];
    groups: Group[];
    studentLastAchievements: Record<string, StudentAchievement | null>;
    onClose: () => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    onChange: React.Dispatch<React.SetStateAction<AssignFormState>>;
}

function AssignStudentModal({
    isSaving,
    formState,
    unassignedStudents,
    groups,
    studentLastAchievements,
    onClose,
    onSubmit,
    onChange
}: AssignStudentModalProps) {
    const [search, setSearch] = useState('');

    const filteredOptions = useMemo(() => {
        if (!search.trim()) {
            return unassignedStudents;
        }
        const term = search.toLowerCase();
        return unassignedStudents.filter((student) =>
            [student.firstName, student.lastName, student.email]
                .filter(Boolean)
                .some((value) => value!.toLowerCase().includes(term))
        );
    }, [search, unassignedStudents]);

    const selectedStudent = unassignedStudents.find(
        (student) => student.id === formState.studentId
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Assign Existing Student
                        </h2>
                        <p className="text-sm text-gray-500">
                            Choose a student who already has an account in the system.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
                    >
                        Close
                    </button>
                </div>

                <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-6">
                    <section className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs uppercase text-gray-500">
                                Search student
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search by name or email"
                                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="max-h-64 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-100">
                            {filteredOptions.map((student) => (
                                <label
                                    key={student.id}
                                    className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-gray-50 cursor-pointer"
                                >
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {student.firstName} {student.lastName}
                                        </p>
                                        <p className="text-xs text-gray-500">{student.email}</p>
                                    </div>
                                    <input
                                        type="radio"
                                        name="student"
                                        checked={formState.studentId === student.id}
                                        onChange={() =>
                                            onChange((prev) => ({
                                                ...prev,
                                                studentId: student.id
                                            }))
                                        }
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                    />
                                </label>
                            ))}

                            {filteredOptions.length === 0 && (
                                <div className="px-4 py-6 text-center text-gray-400 text-sm">
                                    No students found. Try a different search term.
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs uppercase text-gray-500">
                                Assign to group (optional)
                            </label>
                            <select
                                value={formState.groupId || ''}
                                onChange={(event) =>
                                    onChange((prev) => ({
                                        ...prev,
                                        groupId: event.target.value ? event.target.value : null
                                    }))
                                }
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">No group</option>
                                {groups.map((group) => (
                                    <option key={group.id} value={group.id}>
                                        {group.name} ({group.code})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedStudent && (
                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2 text-sm text-gray-600">
                                <div>
                                    <p className="text-xs uppercase text-gray-500 tracking-wide">
                                        Guardian
                                    </p>
                                    {selectedStudent.guardian ? (
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {selectedStudent.guardian.firstName}{' '}
                                                {selectedStudent.guardian.lastName}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {selectedStudent.guardian.relationship} •{' '}
                                                {selectedStudent.guardian.email}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-500 italic">
                                            No guardian information on file.
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs uppercase text-gray-500 tracking-wide">
                                        Current status
                                    </p>
                                    <p>
                                        Last achievement:{' '}
                                        {selectedStudent && studentLastAchievements[selectedStudent.id]
                                            ? studentLastAchievements[selectedStudent.id]!.name
                                            : 'No achievement'}
                                    </p>
                                    {selectedStudent && studentLastAchievements[selectedStudent.id] && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Achieved: {new Date(studentLastAchievements[selectedStudent.id]!.earnedAt).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </section>

                    <div className="md:col-span-2 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || !formState.studentId}
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
                        >
                            {isSaving ? 'Assigning...' : 'Assign Student'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

interface ManageStudentModalProps {
    isSaving: boolean;
    formState: ManageFormState;
    groups: Group[];
    students: Student[];
    studentLastAchievements: Record<string, StudentAchievement | null>;
    onClose: () => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    onChange: React.Dispatch<React.SetStateAction<ManageFormState>>;
}

function ManageStudentModal({
    isSaving,
    formState,
    groups,
    students,
    studentLastAchievements,
    onClose,
    onSubmit,
    onChange
}: ManageStudentModalProps) {
    const selectedStudent = students.find((student) => student.id === formState.studentId);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Manage Student Placement
                        </h2>
                        <p className="text-sm text-gray-500">
                            Update the student's group assignment.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
                    >
                        Close
                    </button>
                </div>

                <form onSubmit={onSubmit} className="px-6 py-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs uppercase text-gray-500">
                            Assign to group
                        </label>
                        <select
                            value={formState.groupId || ''}
                            onChange={(event) =>
                                onChange((prev) => ({
                                    ...prev,
                                    groupId: event.target.value ? event.target.value : null
                                }))
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">No group</option>
                            {groups.map((group) => (
                                <option key={group.id} value={group.id}>
                                    {group.name} ({group.code})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
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
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}


