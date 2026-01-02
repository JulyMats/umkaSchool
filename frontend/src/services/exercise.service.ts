import axiosInstance from './axios.config';
import { Exercise, CreateExercisePayload, UpdateExercisePayload } from '../types/exercise';
import { PaginatedResponse } from '../types/common';

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
    getAllExercises: async (page: number = 0, size: number = 20, sort?: string): Promise<PaginatedResponse<Exercise>> => {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString()
        });
        if (sort) {
            params.append('sort', sort);
        }
        const response = await axiosInstance.get<PaginatedResponse<Exercise>>(`/api/exercises?${params.toString()}`);
        return response.data;
    },

    getExercisesByTeacher: async (teacherId: string, page: number = 0, size: number = 20, sort?: string): Promise<PaginatedResponse<Exercise>> => {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString()
        });
        if (sort) {
            params.append('sort', sort);
        }
        const response = await axiosInstance.get<PaginatedResponse<Exercise>>(`/api/exercises/teacher/${teacherId}?${params.toString()}`);
        return response.data;
    },

    getExercisesByType: async (exerciseTypeId: string, page: number = 0, size: number = 20, sort?: string): Promise<PaginatedResponse<Exercise>> => {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString()
        });
        if (sort) {
            params.append('sort', sort);
        }
        const response = await axiosInstance.get<PaginatedResponse<Exercise>>(`/api/exercises/type/${exerciseTypeId}?${params.toString()}`);
        return response.data;
    },

    getExercisesByDifficulty: async (difficulty: number, page: number = 0, size: number = 20, sort?: string): Promise<PaginatedResponse<Exercise>> => {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString()
        });
        if (sort) {
            params.append('sort', sort);
        }
        const response = await axiosInstance.get<PaginatedResponse<Exercise>>(`/api/exercises/difficulty/${difficulty}?${params.toString()}`);
        return response.data;
    },

    getAllExercisesAll: async (): Promise<Exercise[]> => {
        const allExercises: Exercise[] = [];
        let page = 0;
        let hasMore = true;

        while (hasMore) {
            const response = await exerciseService.getAllExercises(page, 100);
            allExercises.push(...response.content);
            hasMore = !response.last;
            page++;
        }

        return allExercises;
    },

    getExercisesByTeacherAll: async (teacherId: string): Promise<Exercise[]> => {
        const allExercises: Exercise[] = [];
        let page = 0;
        let hasMore = true;

        while (hasMore) {
            const response = await exerciseService.getExercisesByTeacher(teacherId, page, 100);
            allExercises.push(...response.content);
            hasMore = !response.last;
            page++;
        }

        return allExercises;
    },

    getExercisesByTypeAll: async (exerciseTypeId: string): Promise<Exercise[]> => {
        const allExercises: Exercise[] = [];
        let page = 0;
        let hasMore = true;

        while (hasMore) {
            const response = await exerciseService.getExercisesByType(exerciseTypeId, page, 100);
            allExercises.push(...response.content);
            hasMore = !response.last;
            page++;
        }

        return allExercises;
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


