import axiosInstance from './axios.config';
import { Teacher, CreateTeacherPayload, UpdateTeacherPayload } from '../types/teacher';

export const teacherService = {
    getTeacherByUserId: async (userId: string): Promise<Teacher> => {
        const response = await axiosInstance.get<Teacher>(`/api/teachers/user/${userId}`);
        return response.data;
    },

    getTeacherById: async (teacherId: string): Promise<Teacher> => {
        const response = await axiosInstance.get<Teacher>(`/api/teachers/${teacherId}`);
        return response.data;
    },

    getAllTeachers: async (): Promise<Teacher[]> => {
        const response = await axiosInstance.get<Teacher[]>('/api/teachers');
        return response.data;
    },

    createTeacher: async (payload: CreateTeacherPayload): Promise<Teacher> => {
        const response = await axiosInstance.post<Teacher>('/api/teachers', payload);
        return response.data;
    },

    updateTeacher: async (teacherId: string, payload: UpdateTeacherPayload): Promise<Teacher> => {
        const response = await axiosInstance.put<Teacher>(`/api/teachers/${teacherId}`, payload);
        return response.data;
    },

    deleteTeacher: async (teacherId: string): Promise<void> => {
        await axiosInstance.delete(`/api/teachers/${teacherId}`);
    },
};

