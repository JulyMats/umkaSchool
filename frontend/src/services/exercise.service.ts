import axiosInstance from './axios.config';

export interface Exercise {
    id: string;
    exerciseTypeId: string;
    exerciseTypeName: string;
    parameters: string;
    difficulty: number;
    estimatedSeconds: number;
    points: number;
    createdById: string;
    createdByName: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateExercisePayload {
    exerciseTypeId: string;
    parameters: string;
    difficulty: number;
    estimatedSeconds: number;
    points: number;
    createdById: string;
}

export interface UpdateExercisePayload {
    exerciseTypeId?: string;
    parameters?: string;
    difficulty?: number;
    estimatedSeconds?: number;
    points?: number;
}

export const exerciseService = {
    getAllExercises: async (): Promise<Exercise[]> => {
        const response = await axiosInstance.get('/api/exercises');
        return response.data;
    },

    getExercisesByTeacher: async (teacherId: string): Promise<Exercise[]> => {
        const response = await axiosInstance.get(`/api/exercises/teacher/${teacherId}`);
        return response.data;
    },

    getExercisesByType: async (exerciseTypeId: string): Promise<Exercise[]> => {
        const response = await axiosInstance.get(`/api/exercises/type/${exerciseTypeId}`);
        return response.data;
    },

    createExercise: async (payload: CreateExercisePayload): Promise<Exercise> => {
        const response = await axiosInstance.post('/api/exercises', payload);
        return response.data;
    },

    updateExercise: async (exerciseId: string, payload: UpdateExercisePayload): Promise<Exercise> => {
        const response = await axiosInstance.put(`/api/exercises/${exerciseId}`, payload);
        return response.data;
    },

    deleteExercise: async (exerciseId: string): Promise<void> => {
        await axiosInstance.delete(`/api/exercises/${exerciseId}`);
    }
};


