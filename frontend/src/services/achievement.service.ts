import axiosInstance from './axios.config';
import { Achievement, StudentAchievement } from '../types/achievement';

interface AchievementResponse {
    id: string;
    name: string;
    description: string;
    iconUrl: string;
    requiredCriteria: string;
    points: number;
    createdAt: string;
    earnedAt: string | null;
    isNew: boolean | null;
}

export const achievementService = {
    getAllAchievements: async (): Promise<Achievement[]> => {
        const response = await axiosInstance.get<AchievementResponse[]>('/api/achievements');
        return response.data.map(achievement => ({
            id: achievement.id,
            name: achievement.name,
            description: achievement.description,
            iconUrl: achievement.iconUrl,
            requiredCriteria: achievement.requiredCriteria,
            points: achievement.points,
            createdAt: achievement.createdAt
        }));
    },

    getStudentAchievements: async (studentId: string): Promise<StudentAchievement[]> => {
        try {
            const response = await axiosInstance.get<AchievementResponse[]>(`/api/achievements/student/${studentId}`);
            console.log('[AchievementService] Raw API response:', response.data);
            console.log('[AchievementService] Response length:', response.data?.length);
            
            const mapped = response.data
                .filter(achievement => achievement.earnedAt !== null) 
                .map(achievement => ({
                    achievementId: achievement.id,
                    name: achievement.name,
                    description: achievement.description,
                    iconUrl: achievement.iconUrl,
                    points: achievement.points,
                    earnedAt: achievement.earnedAt!,
                    isNew: achievement.isNew ?? false
                }));
            
            console.log('[AchievementService] Mapped achievements:', mapped);
            return mapped;
        } catch (error) {
            console.error('[AchievementService] Error fetching student achievements:', error);
            throw error;
        }
    },

    getRecentStudentAchievements: async (studentId: string, hours: number = 24): Promise<StudentAchievement[]> => {
        const response = await axiosInstance.get<AchievementResponse[]>(
            `/api/achievements/student/${studentId}/recent`,
            { params: { hours } }
        );
        return response.data
            .filter(achievement => achievement.earnedAt !== null)
            .map(achievement => ({
                achievementId: achievement.id,
                name: achievement.name,
                description: achievement.description,
                iconUrl: achievement.iconUrl,
                points: achievement.points,
                earnedAt: achievement.earnedAt!,
                isNew: achievement.isNew ?? false
            }));
    }
};

