import axiosInstance from './axios.config';
import { Achievement, StudentAchievement } from '../types/achievement';

export const achievementService = {
    getAllAchievements: async (): Promise<Achievement[]> => {
        const response = await axiosInstance.get<Achievement[]>('/api/achievements');
        return response.data;
    },

    getStudentAchievements: async (studentId: string): Promise<StudentAchievement[]> => {
        const response = await axiosInstance.get<StudentAchievement[]>(`/api/achievements/student/${studentId}`);
        return response.data;
    },

    getRecentStudentAchievements: async (studentId: string, hours: number = 24): Promise<StudentAchievement[]> => {
        const response = await axiosInstance.get<StudentAchievement[]>(
            `/api/achievements/student/${studentId}/recent`,
            { params: { hours } }
        );
        return response.data;
    }
};

