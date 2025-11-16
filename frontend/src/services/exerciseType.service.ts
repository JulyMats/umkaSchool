import axiosInstance from './axios.config';

interface APIExerciseType {
    id: string;
    name: string;
    description: string;
    baseDifficulty: number;
    avgTimeSeconds: number;
    parameterRanges?: string; // JSON: {"cardCount": [2, 20], "displaySpeed": [0.5, 3.0], "timePerQuestion": [2, 20]}
    createdById: string;
    createdByName: string;
    createdAt: string;
    updatedAt: string;
}

export interface ParameterRanges {
    cardCount?: [number, number]; // [min, max]
    displaySpeed?: [number, number]; // [min, max]
    timePerQuestion?: [number, number]; // [min, max]
    digitTypes?: string[]; // ["single-digit", "two-digit", "three-digit", "four-digit"]
}

export interface ExerciseType {
    id: string;
    name: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    duration: string;
    parameterRanges?: ParameterRanges;
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

const parseParameterRanges = (parameterRangesJson: string | null): ParameterRanges | null => {
    if (!parameterRangesJson) return null;
    try {
        return JSON.parse(parameterRangesJson) as ParameterRanges;
    } catch (error) {
        console.error('Error parsing parameterRanges:', error);
        return null;
    }
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
