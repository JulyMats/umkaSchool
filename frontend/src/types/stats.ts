export type TimePeriod = 'day' | 'week' | 'month' | 'all';

export interface StudentStats {
    totalPracticeTime: string; // Format: "Xh Ym"
    problemsSolved: number;
    accuracyRate: number; // Percentage
    currentStreak: number; // Days
    bestStreak: number; // Days
}

export interface SubjectProgress {
    subject: string;
    accuracy: number;
    totalProblems: number;
    averageTime: string; // Format: "X.Xs"
}

