import axios from 'axios';

interface APIExerciseType {
    id: string;
    name: string;
    description: string;
    baseDifficulty: number;
    avgTimeSeconds: number;
    createdById: string;
    createdByName: string;
    createdAt: string;
    updatedAt: string;
}

export interface ExerciseType {
    id: string;
    name: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    duration: string;
}

const mapDifficulty = (baseDifficulty: number): 'beginner' | 'intermediate' | 'advanced' => {
    if (baseDifficulty <= 1) return 'beginner';
    if (baseDifficulty <= 2) return 'intermediate';
    return 'advanced';
};

const formatDuration = (seconds: number): string => {
    const minutes = Math.round(seconds / 60);
    return `${minutes} mins`;
};

const BASE_URL = 'http://localhost:8080/api';

export const exerciseTypeService = {
    getAllExerciseTypes: async (): Promise<ExerciseType[]> => {
        try {
            const response = await axios.get<APIExerciseType[]>(`${BASE_URL}/exercise-types`);
            return response.data.map(apiExercise => ({
                id: apiExercise.id,
                name: apiExercise.name,
                description: apiExercise.description,
                difficulty: mapDifficulty(apiExercise.baseDifficulty),
                duration: formatDuration(apiExercise.avgTimeSeconds)
            }));
        } catch (error) {
            console.error('Error fetching exercise types:', error);
            throw error;
        }
    },

    getExerciseTypeById: async (id: string): Promise<ExerciseType> => {
        try {
            const response = await axios.get<APIExerciseType>(`${BASE_URL}/exercise-types/${id}`);
            const apiExercise = response.data;
            return {
                id: apiExercise.id,
                name: apiExercise.name,
                description: apiExercise.description,
                difficulty: mapDifficulty(apiExercise.baseDifficulty),
                duration: formatDuration(apiExercise.avgTimeSeconds)
            };
        } catch (error) {
            console.error(`Error fetching exercise type with id ${id}:`, error);
            throw error;
        }
    }
};
