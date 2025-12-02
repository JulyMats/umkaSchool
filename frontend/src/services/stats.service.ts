import axiosInstance from './axios.config';
import { exerciseAttemptService } from './exerciseAttempt.service';
import { TimePeriod, StudentStats, SubjectProgress } from '../types/stats';

const formatAverageTime = (seconds: number): string => {
    return `${seconds.toFixed(1)}s`;
};

const getDateRange = (period: TimePeriod): { start: Date; end: Date } => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date();

    switch (period) {
        case 'day':
            start.setHours(0, 0, 0, 0);
            break;
        case 'week':
            start.setDate(start.getDate() - 7);
            start.setHours(0, 0, 0, 0);
            break;
        case 'month':
            start.setMonth(start.getMonth() - 1);
            start.setHours(0, 0, 0, 0);
            break;
        case 'all':
            start.setFullYear(2000, 0, 1); // Very old date
            break;
    }

    return { start, end };
};

export const statsService = {
    getStudentStats: async (studentId: string, period: TimePeriod = 'all'): Promise<StudentStats> => {
        const response = await axiosInstance.get<{
            totalPracticeTime: string;
            problemsSolved: number;
            accuracyRate: number;
            currentStreak: number;
            bestStreak: number;
        }>(`/api/progress-snapshots/student/${studentId}/stats`, {
            params: { period }
        });

        return {
            totalPracticeTime: response.data.totalPracticeTime,
            problemsSolved: response.data.problemsSolved,
            accuracyRate: response.data.accuracyRate,
            currentStreak: response.data.currentStreak,
            bestStreak: response.data.bestStreak
        };
    },

    getSubjectProgress: async (studentId: string, period: TimePeriod = 'all'): Promise<SubjectProgress[]> => {
        const attempts = await exerciseAttemptService.getAttemptsByStudent(studentId);
        const { start, end } = getDateRange(period);

        // Filter attempts by period
        const filteredAttempts = attempts.filter(attempt => {
            if (!attempt.completedAt) return false;
            const attemptDate = new Date(attempt.completedAt);
            return attemptDate >= start && attemptDate <= end;
        });

        // Group by exercise type
        const bySubject = new Map<string, { total: number; accuracySum: number; timeSum: number }>();

        filteredAttempts.forEach(attempt => {
            const subject = attempt.exerciseTypeName;
            if (!bySubject.has(subject)) {
                bySubject.set(subject, { total: 0, accuracySum: 0, timeSum: 0 });
            }
            const stats = bySubject.get(subject)!;
            stats.total += attempt.totalAttempts || 0;
            // Calculate accuracy from totalAttempts and totalCorrect
            const attemptAccuracy = (attempt.totalAttempts || 0) > 0 
                ? ((attempt.totalCorrect || 0) / (attempt.totalAttempts || 1)) * 100 
                : 0;
            stats.accuracySum += attemptAccuracy * (attempt.totalAttempts || 0);
            stats.timeSum += attempt.durationSeconds || 0;
        });

        // Convert to array
        const progress: SubjectProgress[] = Array.from(bySubject.entries()).map(([subject, stats]) => ({
            subject,
            accuracy: stats.total > 0 ? Math.round(stats.accuracySum / stats.total) : 0,
            totalProblems: stats.total,
            averageTime: stats.total > 0 ? formatAverageTime(stats.timeSum / stats.total) : '0.0s'
        }));

        return progress.sort((a, b) => b.totalProblems - a.totalProblems);
    }
};
