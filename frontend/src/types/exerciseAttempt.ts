export interface ExerciseAttempt {
    id: string;
    studentId: string;
    studentName: string;
    exerciseId: string;
    exerciseTypeName: string;
    startedAt: string;
    completedAt: string | null;
    score: number | null;
    timeSpentSeconds: number | null;
    accuracy: number | null;
    mistakes: number | null;
    totalAttempts?: number;
    totalCorrect?: number;
    durationSeconds?: number;
}

export interface CreateExerciseAttemptPayload {
    studentId: string;
    exerciseId: string;
    startedAt?: string;
    settings?: string;
    score?: number;
    timeSpentSeconds?: number;
    accuracy?: number;
    mistakes?: number;
}

export interface UpdateExerciseAttemptPayload {
    completedAt?: string;
    totalAttempts?: number;
    totalCorrect?: number;
    score?: number;
    timeSpentSeconds?: number;
    accuracy?: number;
    mistakes?: number;
}

