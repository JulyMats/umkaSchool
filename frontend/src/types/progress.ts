export interface ProgressSnapshot {
    id: string;
    studentId: string;
    studentName: string;
    snapshotDate: string;
    totalAttempts: number;
    totalCorrect: number;
    totalPracticeSeconds: number;
    currentStreak: number;
    createdAt: string;
}

