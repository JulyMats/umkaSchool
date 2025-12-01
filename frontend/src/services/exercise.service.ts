import axiosInstance from './axios.config';
import { Exercise, CreateExercisePayload, UpdateExercisePayload } from '../types/exercise';

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

    getExerciseById: async (exerciseId: string): Promise<Exercise> => {
        const response = await axiosInstance.get(`/api/exercises/${exerciseId}`);
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


