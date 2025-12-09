import axiosInstance from './axios.config';
import { ExerciseType, ParameterRanges, APIExerciseType } from '../types/exerciseType';

const mapDifficulty = (baseDifficulty: number): 'beginner' | 'intermediate' | 'advanced' => {
    if (baseDifficulty <= 1) return 'beginner';
    if (baseDifficulty <= 2) return 'intermediate';
    return 'advanced';
};

const formatDuration = (seconds: number): string => {
    const minutes = Math.round(seconds / 60);
    return `${minutes} mins`;
};

export const exerciseTypeService = {
    getAllExerciseTypes: async (): Promise<ExerciseType[]> => {
        try {
            const response = await axiosInstance.get<APIExerciseType[]>('/api/exercise-types');
            return response.data.map(apiExercise => {
                let parameterRanges: ParameterRanges | undefined;
                if (apiExercise.parameterRanges) {
                    try {
                        parameterRanges = JSON.parse(apiExercise.parameterRanges);
                    } catch (e) {
                        console.warn('Failed to parse parameterRanges for exercise type:', apiExercise.name, e);
                    }
                }
                return {
                    id: apiExercise.id,
                    name: apiExercise.name,
                    description: apiExercise.description,
                    difficulty: mapDifficulty(apiExercise.baseDifficulty),
                    duration: formatDuration(apiExercise.avgTimeSeconds),
                    parameterRanges
                };
            });
        } catch (error) {
            console.error('Error fetching exercise types:', error);
            throw error;
        }
    },

    getExerciseTypeById: async (id: string): Promise<ExerciseType> => {
        try {
            const response = await axiosInstance.get<APIExerciseType>(`/api/exercise-types/${id}`);
            const apiExercise = response.data;
            let parameterRanges: ParameterRanges | undefined;
            if (apiExercise.parameterRanges) {
                try {
                    parameterRanges = JSON.parse(apiExercise.parameterRanges);
                } catch (e) {
                    console.warn('Failed to parse parameterRanges for exercise type:', apiExercise.name, e);
                }
            }
            return {
                id: apiExercise.id,
                name: apiExercise.name,
                description: apiExercise.description,
                difficulty: mapDifficulty(apiExercise.baseDifficulty),
                duration: formatDuration(apiExercise.avgTimeSeconds),
                parameterRanges
            };
        } catch (error) {
            console.error(`Error fetching exercise type with id ${id}:`, error);
            throw error;
        }
    }
};
