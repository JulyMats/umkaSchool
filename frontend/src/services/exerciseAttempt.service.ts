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
    totalAttempts: number;
    totalCorrect: number;
    durationSeconds: number | null;
    accuracy: number | null;
}

export interface CreateExerciseAttemptRequest {
    studentId: string;
    exerciseId: string;
    startedAt?: string;
    settings?: string; // JSON string with game settings
}

export interface UpdateExerciseAttemptRequest {
    studentId?: string;
    exerciseId?: string;
    startedAt?: string;
    completedAt?: string;
    score?: number;
    totalAttempts?: number;
    totalCorrect?: number;
    settings?: string;
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

    getAttemptById: async (attemptId: string): Promise<ExerciseAttempt> => {
        const response = await axiosInstance.get<ExerciseAttempt>(`/api/exercise-attempts/${attemptId}`);
        return response.data;
    },

    createAttempt: async (data: CreateExerciseAttemptRequest): Promise<ExerciseAttempt> => {
        const response = await axiosInstance.post<ExerciseAttempt>('/api/exercise-attempts', data);
        return response.data;
    },

    updateAttempt: async (attemptId: string, data: UpdateExerciseAttemptRequest): Promise<ExerciseAttempt> => {
        const response = await axiosInstance.put<ExerciseAttempt>(`/api/exercise-attempts/${attemptId}`, data);
        return response.data;
    }
};

