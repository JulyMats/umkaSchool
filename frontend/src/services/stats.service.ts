import axiosInstance from './axios.config';
import { exerciseAttemptService } from './exerciseAttempt.service';
import { TimePeriod, StudentStats, SubjectProgress } from '../types/stats';
import { ExerciseAttempt } from '../types/exerciseAttempt';

const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
};

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

const calculateStreak = (attempts: ExerciseAttempt[]): { current: number; best: number } => {
    if (attempts.length === 0) {
        return { current: 0, best: 0 };
    }

    // Sort by completedAt date (most recent first)
    const completedAttempts = attempts
        .filter(a => a.completedAt)
        .sort((a, b) => {
            const dateA = new Date(a.completedAt!).getTime();
            const dateB = new Date(b.completedAt!).getTime();
            return dateB - dateA;
        });

    if (completedAttempts.length === 0) {
        return { current: 0, best: 0 };
    }

    // Get unique dates
    const dates = new Set<string>();
    completedAttempts.forEach(attempt => {
        if (attempt.completedAt) {
            const date = new Date(attempt.completedAt).toDateString();
            dates.add(date);
        }
    });

    const sortedDates = Array.from(dates)
        .map(d => new Date(d).getTime())
        .sort((a, b) => b - a);

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    for (let i = 0; i < sortedDates.length; i++) {
        const date = new Date(sortedDates[i]);
        date.setHours(0, 0, 0, 0);
        const expectedDate = new Date(todayTime - (i * 24 * 60 * 60 * 1000));
        expectedDate.setHours(0, 0, 0, 0);

        if (date.getTime() === expectedDate.getTime()) {
            currentStreak++;
        } else {
            break;
        }
    }

    // Calculate best streak
    let bestStreak = 1;
    let tempStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
        const daysDiff = Math.floor((sortedDates[i - 1] - sortedDates[i]) / (24 * 60 * 60 * 1000));
        if (daysDiff === 1) {
            tempStreak++;
            bestStreak = Math.max(bestStreak, tempStreak);
        } else {
            tempStreak = 1;
        }
    }

    return { current: currentStreak, best: bestStreak };
};

export const statsService = {
    getStudentStats: async (studentId: string, period: TimePeriod = 'all'): Promise<StudentStats> => {
        try {
            // Use backend API endpoint for statistics calculation
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
        } catch (error) {
            console.error('Error fetching stats from backend:', error);
            // Fallback to direct calculation from attempts if backend fails
            const attempts = await exerciseAttemptService.getAttemptsByStudent(studentId);
            const { start, end } = getDateRange(period);

            // Filter attempts by period - only attempts completed within the period
            const filteredAttempts = attempts.filter(attempt => {
                if (!attempt.completedAt) return false;
                const attemptDate = new Date(attempt.completedAt);
                // Include attempts from start of period (00:00:00) to end of period (23:59:59)
                return attemptDate >= start && attemptDate <= end;
            });

            // Calculate total practice time from durationSeconds
            const totalSeconds = filteredAttempts.reduce((sum, attempt) => {
                return sum + (attempt.durationSeconds || 0);
            }, 0);

            // Calculate problems solved from totalAttempts
            const problemsSolved = filteredAttempts.reduce((sum, attempt) => {
                return sum + (attempt.totalAttempts || 0);
            }, 0);

            // Calculate accuracy rate from totalAttempts and totalCorrect
            const totalAttempts = filteredAttempts.reduce((sum, attempt) => {
                return sum + (attempt.totalAttempts || 0);
            }, 0);
            const totalCorrect = filteredAttempts.reduce((sum, attempt) => {
                return sum + (attempt.totalCorrect || 0);
            }, 0);
            const accuracyRate = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

            // Calculate streak (using all attempts for streak calculation)
            const allAttempts = await exerciseAttemptService.getAttemptsByStudent(studentId);
            const { current, best } = calculateStreak(allAttempts);

            return {
                totalPracticeTime: formatTime(totalSeconds),
                problemsSolved,
                accuracyRate,
                currentStreak: current,
                bestStreak: best
            };
        }
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
