import axiosInstance from './axios.config';

export interface ExerciseAttempt {
    id: string;
    studentId: string;
    studentName: string;
    exerciseId: string;
    exerciseTypeName: string;
    startedAt: string;
    completedAt: string | null;
    score: number | null;
    timeSpentSeconds: number | null;
    accuracy: number | null;
    mistakes: number | null;
}

export const exerciseAttemptService = {
    getAttemptsByStudent: async (studentId: string): Promise<ExerciseAttempt[]> => {
        const response = await axiosInstance.get<ExerciseAttempt[]>(`/api/exercise-attempts/student/${studentId}`);
        return response.data;
    },

    getAttemptCountByStudent: async (studentId: string): Promise<number> => {
        const response = await axiosInstance.get<number>(`/api/exercise-attempts/student/${studentId}/count`);
        return response.data;
    },

    createAttempt: async (data: {
        studentId: string;
        exerciseId: string;
        score?: number;
        timeSpentSeconds?: number;
        accuracy?: number;
        mistakes?: number;
    }): Promise<ExerciseAttempt> => {
        const response = await axiosInstance.post<ExerciseAttempt>('/api/exercise-attempts', data);
        return response.data;
    }
};

