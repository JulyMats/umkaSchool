import { useState, useEffect, useMemo, useCallback } from 'react';
import { teacherService } from '../services/teacher.service';
import { userService } from '../services/user.service';
import { studentService } from '../services/student.service';
import { authService } from '../services/auth.service';
import { Teacher } from '../types/teacher';
import { Student } from '../types/student';
import { extractErrorMessage } from '../utils/error.utils';

interface TeacherFormData {
    firstName: string;
    lastName: string;
    email: string;
    bio: string;
    phone: string;
}

interface CreateTeacherFormData extends TeacherFormData {
    password: string;
}

interface StudentFormData {
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
}

export const useAdminTeachers = () => {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const [teacherStudents, setTeacherStudents] = useState<Student[]>([]);
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const loadTeachers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await teacherService.getAllTeachers();
            setTeachers(data);
        } catch (err) {
            setError(extractErrorMessage(err, 'Failed to load teachers'));
        } finally {
            setLoading(false);
        }
    }, []);

    const loadAllStudents = useCallback(async () => {
        try {
            const students = await studentService.getAllStudents();
            setAllStudents(students);
        } catch (err) {
        }
    }, []);

    const loadTeacherStudents = useCallback(async (teacherId: string) => {
        try {
            const students = await studentService.getStudentsByTeacher(teacherId);
            setTeacherStudents(students);
        } catch (err) {
            setError(extractErrorMessage(err, 'Failed to load students'));
        }
    }, []);

    const createTeacher = useCallback(async (formData: CreateTeacherFormData) => {
        try {
            setSaving(true);
            setError(null);
            await authService.register({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                role: 'TEACHER',
                bio: formData.bio || undefined,
                phone: formData.phone || undefined
            });
            await loadTeachers();
        } catch (err) {
            const errorMessage = extractErrorMessage(err, 'Failed to create teacher');
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setSaving(false);
        }
    }, [loadTeachers]);

    const updateTeacher = useCallback(async (teacherId: string, formData: TeacherFormData) => {
        try {
            setSaving(true);
            setError(null);
            await teacherService.updateTeacher(teacherId, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                bio: formData.bio || undefined,
                phone: formData.phone || undefined
            });
            await loadTeachers();
        } catch (err) {
            const errorMessage = extractErrorMessage(err, 'Failed to update teacher');
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setSaving(false);
        }
    }, [loadTeachers]);

    const toggleTeacherActive = useCallback(async (teacher: Teacher) => {
        try {
            setSaving(true);
            setError(null);
            if (teacher.isActive) {
                await userService.deactivateUser(teacher.userId);
            } else {
                await userService.activateUser(teacher.userId);
            }
            await loadTeachers();
        } catch (err) {
            const errorMessage = extractErrorMessage(err, 'Failed to update teacher status');
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setSaving(false);
        }
    }, [loadTeachers]);

    const assignStudent = useCallback(async (studentId: string, teacherId: string) => {
        try {
            setSaving(true);
            setError(null);
            await studentService.assignToTeacher(studentId, teacherId);
            await loadTeacherStudents(teacherId);
            await loadAllStudents();
        } catch (err) {
            const errorMessage = extractErrorMessage(err, 'Failed to assign student');
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setSaving(false);
        }
    }, [loadTeacherStudents, loadAllStudents]);

    const unassignStudent = useCallback(async (studentId: string, teacherId: string) => {
        try {
            setSaving(true);
            setError(null);
            await studentService.unassignFromTeacher(studentId);
            await loadTeacherStudents(teacherId);
            await loadAllStudents();
        } catch (err) {
            const errorMessage = extractErrorMessage(err, 'Failed to unassign student');
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setSaving(false);
        }
    }, [loadTeacherStudents, loadAllStudents]);

    const updateStudent = useCallback(async (studentId: string, formData: StudentFormData) => {
        try {
            setSaving(true);
            setError(null);
            await studentService.updateStudent(studentId, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                dateOfBirth: formData.dateOfBirth || undefined
            });
            if (selectedTeacher) {
                await loadTeacherStudents(selectedTeacher.id);
            }
        } catch (err) {
            const errorMessage = extractErrorMessage(err, 'Failed to update student');
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setSaving(false);
        }
    }, [selectedTeacher, loadTeacherStudents]);

    const toggleStudentActive = useCallback(async (student: Student, teacherId: string) => {
        try {
            setSaving(true);
            setError(null);
            if (student.isActive) {
                await userService.deactivateUser(student.userId);
            } else {
                await userService.activateUser(student.userId);
            }
            await loadTeacherStudents(teacherId);
        } catch (err) {
            const errorMessage = extractErrorMessage(err, 'Failed to update student status');
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setSaving(false);
        }
    }, [loadTeacherStudents]);

    const filteredTeachers = useMemo(() => {
        if (!searchTerm) return teachers;
        const term = searchTerm.toLowerCase();
        return teachers.filter(
            t =>
                t.firstName.toLowerCase().includes(term) ||
                t.lastName.toLowerCase().includes(term) ||
                t.email.toLowerCase().includes(term)
        );
    }, [teachers, searchTerm]);

    const availableStudents = useMemo(() => {
        if (!selectedTeacher) return [];
        return allStudents.filter(s => s.teacherId !== selectedTeacher.id);
    }, [allStudents, selectedTeacher]);

    useEffect(() => {
        loadTeachers();
        loadAllStudents();
    }, [loadTeachers, loadAllStudents]);

    return {
        teachers: filteredTeachers,
        selectedTeacher,
        teacherStudents,
        allStudents,
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
    };
};

