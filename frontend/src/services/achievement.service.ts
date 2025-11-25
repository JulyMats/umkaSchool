import axiosInstance from './axios.config';

export interface Achievement {
    id: string;
    name: string;
    description: string;
    iconUrl: string;
    requiredCriteria: string; // JSON string
    points: number;
    createdAt: string;
}

export interface StudentAchievement {
    achievementId: string;
    name: string;
    description: string;
    iconUrl: string;
    points: number;
    earnedAt: string;
    isNew: boolean;
}

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

