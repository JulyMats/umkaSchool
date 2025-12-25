import { useState } from 'react';
import { Plus } from 'lucide-react';
import Layout from '../components/layout';
import { LoadingState, ErrorState, EmptyState } from '../components/common';
import { Button, SearchInput, Modal } from '../components/ui';
import { useAdminTeachers } from '../hooks/useAdminTeachers';
import {
    TeacherForm,
    StudentForm,
    TeacherCard,
    StudentsListModal,
    AssignStudentsModal
} from '../components/features/admin';
import { Teacher } from '../types/teacher';
import { Student } from '../types/student';

const initialTeacherForm = {
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    phone: ''
};

const initialCreateTeacherForm = {
    ...initialTeacherForm,
    password: ''
};

const initialStudentForm = {
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: ''
};

export default function AdminTeachers() {
    const {
        teachers,
        selectedTeacher,
        teacherStudents,
        availableStudents,
        loading,
        saving,
        error,
        searchTerm,
        setSelectedTeacher,
        setSearchTerm,
        setError,
        loadTeacherStudents,
        createTeacher,
        updateTeacher,
        toggleTeacherActive,
        assignStudent,
        unassignStudent,
        updateStudent,
        toggleStudentActive
    } = useAdminTeachers();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
    const [isAssignStudentsModalOpen, setIsAssignStudentsModalOpen] = useState(false);
    const [isEditStudentModalOpen, setIsEditStudentModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    
    const [editForm, setEditForm] = useState(initialTeacherForm);
    const [createForm, setCreateForm] = useState(initialCreateTeacherForm);
    const [editStudentForm, setEditStudentForm] = useState(initialStudentForm);

    const handleEdit = (teacher: Teacher) => {
        setSelectedTeacher(teacher);
        setEditForm({
            firstName: teacher.firstName,
            lastName: teacher.lastName,
            email: teacher.email,
            bio: teacher.bio || '',
            phone: teacher.phone || ''
        });
        setIsEditModalOpen(true);
    };

    const handleViewStudents = async (teacher: Teacher) => {
        setSelectedTeacher(teacher);
        setIsStudentsModalOpen(true);
        await loadTeacherStudents(teacher.id);
    };

    const handleOpenCreateModal = () => {
        setCreateForm(initialCreateTeacherForm);
        setIsCreateModalOpen(true);
    };

    const handleCreateTeacher = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createTeacher(createForm);
            setIsCreateModalOpen(false);
            setCreateForm(initialCreateTeacherForm);
        } catch (err) {
        }
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTeacher) return;
        
        try {
            await updateTeacher(selectedTeacher.id, editForm);
            setIsEditModalOpen(false);
            setEditForm(initialTeacherForm);
        } catch (err) {
        }
    };

    const handleOpenAssignStudentsModal = async (teacher: Teacher) => {
        setSelectedTeacher(teacher);
        setIsAssignStudentsModalOpen(true);
    };

    const handleAssignStudent = async (student: Student) => {
        if (!selectedTeacher) return;
        try {
            await assignStudent(student.id, selectedTeacher.id);
        } catch (err) {
        }
    };

    const handleUnassignStudent = async (student: Student) => {
        if (!selectedTeacher) return;
        try {
            await unassignStudent(student.id, selectedTeacher.id);
        } catch (err) {
        }
    };

    const handleEditStudent = (student: Student) => {
        setSelectedStudent(student);
        setEditStudentForm({
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email,
            dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : ''
        });
        setIsEditStudentModalOpen(true);
    };

    const handleSaveStudentEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent) return;

        try {
            await updateStudent(selectedStudent.id, editStudentForm);
            setIsEditStudentModalOpen(false);
            setSelectedStudent(null);
            setEditStudentForm(initialStudentForm);
        } catch (err) {
        }
    };

    const handleToggleStudentActive = async (student: Student) => {
        if (!selectedTeacher) return;
        try {
            await toggleStudentActive(student, selectedTeacher.id);
        } catch (err) {
        }
    };

    if (loading) {
        return (
            <Layout title="Manage Teachers" subtitle="Loading teachers...">
                <LoadingState message="Loading teachers..." />
            </Layout>
        );
    }

    if (error && teachers.length === 0) {
        return (
            <Layout title="Manage Teachers" subtitle="Error loading data">
                <ErrorState message={error} onRetry={() => window.location.reload()} />
            </Layout>
        );
    }

    return (
        <Layout title="Manage Teachers" subtitle="View and manage all teachers">
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}

            <div className="mb-6 flex items-center gap-4">
                <div className="flex-1">
                    <SearchInput
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search teachers by name or email..."
                    />
                </div>
                <Button onClick={handleOpenCreateModal}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Teacher
                </Button>
            </div>

            {teachers.length === 0 ? (
                <EmptyState message="No teachers found" />
            ) : (
                <div className="space-y-4">
                    {teachers.map((teacher) => (
                        <TeacherCard
                            key={teacher.id}
                            teacher={teacher}
                            onEdit={handleEdit}
                            onViewStudents={handleViewStudents}
                            onToggleActive={toggleTeacherActive}
                            isSaving={saving}
                        />
                    ))}
                </div>
            )}

            {/* Edit Teacher Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditForm(initialTeacherForm);
                }}
                title="Edit Teacher"
            >
                <TeacherForm
                    formData={editForm}
                    onChange={setEditForm}
                    onSubmit={handleSaveEdit}
                    onCancel={() => {
                        setIsEditModalOpen(false);
                        setEditForm(initialTeacherForm);
                    }}
                    isSaving={saving}
                />
            </Modal>

            {/* Create Teacher Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setCreateForm(initialCreateTeacherForm);
                }}
                title="Create New Teacher"
            >
                <TeacherForm
                    formData={{
                        firstName: createForm.firstName,
                        lastName: createForm.lastName,
                        email: createForm.email,
                        bio: createForm.bio,
                        phone: createForm.phone
                    }}
                    onChange={(data) => setCreateForm({ ...createForm, ...data })}
                    onSubmit={handleCreateTeacher}
                    onCancel={() => {
                        setIsCreateModalOpen(false);
                        setCreateForm(initialCreateTeacherForm);
                    }}
                    isSaving={saving}
                    submitLabel="Create Teacher"
                    showPassword={true}
                    password={createForm.password}
                    onPasswordChange={(password) => setCreateForm({ ...createForm, password })}
                />
            </Modal>

            {/* Students List Modal */}
            <StudentsListModal
                isOpen={isStudentsModalOpen}
                onClose={() => setIsStudentsModalOpen(false)}
                teacherName={selectedTeacher ? `${selectedTeacher.firstName} ${selectedTeacher.lastName}` : ''}
                students={teacherStudents}
                onEdit={handleEditStudent}
                onUnassign={handleUnassignStudent}
                onToggleActive={handleToggleStudentActive}
                onAssignClick={() => {
                    setIsStudentsModalOpen(false);
                    if (selectedTeacher) {
                        handleOpenAssignStudentsModal(selectedTeacher);
                    }
                }}
                isSaving={saving}
            />

            {/* Assign Students Modal */}
            <AssignStudentsModal
                isOpen={isAssignStudentsModalOpen}
                onClose={() => setIsAssignStudentsModalOpen(false)}
                teacherName={selectedTeacher ? `${selectedTeacher.firstName} ${selectedTeacher.lastName}` : ''}
                students={availableStudents}
                onAssign={handleAssignStudent}
                isSaving={saving}
            />

            {/* Edit Student Modal */}
            <Modal
                isOpen={isEditStudentModalOpen}
                onClose={() => {
                    setIsEditStudentModalOpen(false);
                    setSelectedStudent(null);
                    setEditStudentForm(initialStudentForm);
                }}
                title="Edit Student"
            >
                <StudentForm
                    formData={editStudentForm}
                    onChange={setEditStudentForm}
                    onSubmit={handleSaveStudentEdit}
                    onCancel={() => {
                        setIsEditStudentModalOpen(false);
                        setSelectedStudent(null);
                        setEditStudentForm(initialStudentForm);
                    }}
                    isSaving={saving}
                />
            </Modal>
        </Layout>
    );
}
