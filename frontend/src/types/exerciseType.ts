export interface ParameterRanges {
    cardCount?: [number, number];
    displaySpeed?: [number, number];
    timePerQuestion?: [number, number];
    exampleCount?: [number, number];
    dividendDigits?: [number, number];
    divisorDigits?: [number, number];
    firstMultiplierDigits?: [number, number];
    minValue?: number;
    maxValue?: number;
    digitTypes?: string[];
    themes?: string[];
}

export interface ExerciseType {
    id: string;
    name: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    duration: string;
    parameterRanges?: ParameterRanges;
}

export interface APIExerciseType {
    id: string;
    name: string;
    description: string;
    baseDifficulty: number;
    avgTimeSeconds: number;
    parameterRanges?: string; // JSON string
    createdById: string;
    createdByName: string;
    createdAt: string;
    updatedAt: string;
}

