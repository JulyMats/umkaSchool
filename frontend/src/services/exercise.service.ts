import axiosInstance from './axios.config';
import { Exercise, CreateExercisePayload, UpdateExercisePayload } from '../types/exercise';

export interface GenerateExerciseNumbersRequest {
    exerciseId: string;
    cardCount?: number;
    digitLength?: number;
    min?: number;
    max?: number;
}

export interface GenerateExerciseNumbersResponse {
    numbers: number[];
    expectedAnswer: number;
    exerciseTypeName: string;
}

export interface ValidateAnswerRequest {
    exerciseId: string;
    numbers: number[];
    studentAnswer: number;
}

export interface ValidateAnswerResponse {
    isCorrect: boolean;
    expectedAnswer: number;
    studentAnswer: number;
    difference: number;
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
    },

    generateExerciseNumbers: async (request: GenerateExerciseNumbersRequest): Promise<GenerateExerciseNumbersResponse> => {
        const response = await axiosInstance.post<GenerateExerciseNumbersResponse>('/api/exercises/generate-numbers', request);
        return response.data;
    },

    validateAnswer: async (request: ValidateAnswerRequest): Promise<ValidateAnswerResponse> => {
        const response = await axiosInstance.post<ValidateAnswerResponse>('/api/exercises/validate-answer', request);
        return response.data;
    }
};


