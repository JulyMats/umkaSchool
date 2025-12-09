import axiosInstance from './axios.config';
import { Group, CreateGroupPayload, UpdateGroupPayload } from '../types/group';

export const groupService = {
    getAllGroups: async (): Promise<Group[]> => {
        const response = await axiosInstance.get<Group[]>('/api/groups');
        return response.data;
    },

    getGroupById: async (groupId: string): Promise<Group> => {
        const response = await axiosInstance.get<Group>(`/api/groups/${groupId}`);
        return response.data;
    },

    getGroupByCode: async (code: string): Promise<Group> => {
        const response = await axiosInstance.get<Group>(`/api/groups/code/${code}`);
        return response.data;
    },

    getGroupsByTeacher: async (teacherId: string): Promise<Group[]> => {
        const response = await axiosInstance.get<Group[]>(`/api/groups/teacher/${teacherId}`);
        return response.data;
    },

    createGroup: async (payload: CreateGroupPayload): Promise<Group> => {
        const response = await axiosInstance.post<Group>('/api/groups', payload);
        return response.data;
    },

    updateGroup: async (groupId: string, payload: UpdateGroupPayload): Promise<Group> => {
        const response = await axiosInstance.put<Group>(`/api/groups/${groupId}`, payload);
        return response.data;
    },

    deleteGroup: async (groupId: string): Promise<void> => {
        await axiosInstance.delete(`/api/groups/${groupId}`);
    },

    addStudentsToGroup: async (groupId: string, studentIds: string[]): Promise<void> => {
        await axiosInstance.post(`/api/groups/${groupId}/students`, studentIds);
    },

    removeStudentFromGroup: async (studentId: string): Promise<void> => {
        await axiosInstance.delete(`/api/groups/students/${studentId}`);
    }
};


