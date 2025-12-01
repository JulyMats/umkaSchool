import axiosInstance from './axios.config';
import {
    ExerciseAttempt,
    CreateExerciseAttemptPayload,
    UpdateExerciseAttemptPayload
} from '../types/exerciseAttempt';

export const exerciseAttemptService = {
    getAttemptsByStudent: async (studentId: string): Promise<ExerciseAttempt[]> => {
        const response = await axiosInstance.get<ExerciseAttempt[]>(`/api/exercise-attempts/student/${studentId}`);
        return response.data;
    },

    getAttemptCountByStudent: async (studentId: string): Promise<number> => {
        const response = await axiosInstance.get<number>(`/api/exercise-attempts/student/${studentId}/count`);
        return response.data;
    },

    createAttempt: async (data: CreateExerciseAttemptPayload): Promise<ExerciseAttempt> => {
        const response = await axiosInstance.post<ExerciseAttempt>('/api/exercise-attempts', data);
        return response.data;
    },

    updateAttempt: async (attemptId: string, data: UpdateExerciseAttemptPayload): Promise<ExerciseAttempt> => {
        const response = await axiosInstance.put<ExerciseAttempt>(`/api/exercise-attempts/${attemptId}`, data);
        return response.data;
    }
};

