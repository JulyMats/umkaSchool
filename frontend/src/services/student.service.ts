import axiosInstance from './axios.config';
import { Student, CreateStudentPayload, UpdateStudentPayload } from '../types/student';

export const studentService = {
    getStudentByUserId: async (userId: string): Promise<Student> => {
        const response = await axiosInstance.get<Student>(`/api/students/user/${userId}`);
        return response.data;
    },

    getStudentById: async (studentId: string): Promise<Student> => {
        const response = await axiosInstance.get<Student>(`/api/students/${studentId}`);
        return response.data;
    },

    getAllStudents: async (): Promise<Student[]> => {
        const response = await axiosInstance.get<Student[]>('/api/students');
        return response.data;
    },

    getStudentsByTeacher: async (teacherId: string): Promise<Student[]> => {
        const response = await axiosInstance.get<Student[]>(`/api/students/teacher/${teacherId}`);
        return response.data;
    },

    getStudentsByGroup: async (groupId: string): Promise<Student[]> => {
        const response = await axiosInstance.get<Student[]>(`/api/students/group/${groupId}`);
        return response.data;
    },

    createStudent: async (payload: CreateStudentPayload): Promise<Student> => {
        const response = await axiosInstance.post<Student>('/api/students', {
            firstName: payload.firstName,
            lastName: payload.lastName,
            email: payload.email,
            password: payload.password,
            dateOfBirth: new Date(payload.dateOfBirth).toISOString().split('T')[0],
            guardianFirstName: payload.guardian.firstName,
            guardianLastName: payload.guardian.lastName,
            guardianEmail: payload.guardian.email,
            guardianPhone: payload.guardian.phone,
            guardianRelationship: payload.guardian.relationship,
            teacherId: payload.teacherId,
            groupId: payload.groupId
        });
        return response.data;
    },

    updateStudent: async (studentId: string, payload: UpdateStudentPayload): Promise<Student> => {
        const response = await axiosInstance.put<Student>(`/api/students/${studentId}`, {
            firstName: payload.firstName,
            lastName: payload.lastName,
            email: payload.email,
            dateOfBirth: payload.dateOfBirth
                ? new Date(payload.dateOfBirth).toISOString().split('T')[0]
                : undefined,
            guardianFirstName: payload.guardian?.firstName,
            guardianLastName: payload.guardian?.lastName,
            guardianEmail: payload.guardian?.email,
            guardianPhone: payload.guardian?.phone,
            guardianRelationship: payload.guardian?.relationship,
            teacherId: payload.teacherId,
            groupId: payload.groupId
        });
        return response.data;
    },

    deleteStudent: async (studentId: string): Promise<void> => {
        await axiosInstance.delete(`/api/students/${studentId}`);
    },

    assignToTeacher: async (studentId: string, teacherId: string): Promise<void> => {
        await axiosInstance.put(`/api/students/${studentId}/teacher/${teacherId}`);
    },

    unassignFromTeacher: async (studentId: string): Promise<void> => {
        await axiosInstance.delete(`/api/students/${studentId}/teacher`);
    },

    assignToGroup: async (studentId: string, groupId: string): Promise<void> => {
        await axiosInstance.put(`/api/students/${studentId}/group/${groupId}`);
    },

    updateLastActivity: async (studentId: string): Promise<void> => {
        await axiosInstance.put(`/api/students/${studentId}/activity`);
    }
};

