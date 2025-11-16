import { exerciseAttemptService, ExerciseAttempt } from './exerciseAttempt.service';
import { progressSnapshotService, ProgressSnapshot } from './progressSnapshot.service';

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

const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
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
            // Try to get stats from snapshots first (more efficient)
            const { start, end } = getDateRange(period);
            const startDateStr = formatDate(start);
            const endDateStr = formatDate(end);

            // Get snapshots for the period
            let snapshots: ProgressSnapshot[] = [];
            if (period === 'all') {
                snapshots = await progressSnapshotService.getSnapshotsByStudent(studentId);
            } else {
                snapshots = await progressSnapshotService.getSnapshotsByDateRange(studentId, startDateStr, endDateStr);
            }

            // If we have snapshots, use the latest one for current stats
            if (snapshots.length > 0) {
                const latestSnapshot = snapshots[0]; // Already sorted desc
                
                // For period-specific stats, calculate from snapshots
                let periodProblemsSolved = 0;
                let periodPracticeSeconds = 0;
                let periodAccuracySum = 0;
                let snapshotCount = 0;

                if (period === 'all') {
                    // Use latest snapshot for all-time stats
                    periodProblemsSolved = latestSnapshot.totalAttempts;
                    periodPracticeSeconds = latestSnapshot.totalPracticeSeconds;
                    // Calculate accuracy from totalAttempts and totalCorrect
                    const accuracy = latestSnapshot.totalAttempts > 0 
                        ? (latestSnapshot.totalCorrect / latestSnapshot.totalAttempts) * 100 
                        : 0;
                    periodAccuracySum = accuracy;
                    snapshotCount = 1;
                } else {
                    // For period stats, we need snapshots for the start and end of the period
                    const startDateStr = formatDate(start);
                    const endDateStr = formatDate(end);
                    
                    // Find snapshot for the end of period (should be today for "day" period)
                    const endSnapshot = snapshots.find(s => {
                        const snapDate = new Date(s.snapshotDate + 'T00:00:00');
                        const endDateOnly = new Date(endDateStr + 'T00:00:00');
                        return snapDate.getTime() === endDateOnly.getTime();
                    });
                    
                    // Find snapshot for the day before period starts
                    const startDateOnly = new Date(startDateStr + 'T00:00:00');
                    startDateOnly.setDate(startDateOnly.getDate() - 1); // Day before period starts
                    const beforeStartDateStr = formatDate(startDateOnly);
                    
                    const beforePeriodSnapshot = snapshots.find(s => {
                        const snapDate = new Date(s.snapshotDate + 'T00:00:00');
                        const beforeDate = new Date(beforeStartDateStr + 'T00:00:00');
                        return snapDate.getTime() === beforeDate.getTime();
                    });
                    
                    // If we have snapshot for end of period, use it; otherwise use latest
                    const periodEndSnapshot = endSnapshot || latestSnapshot;
                    
                    // Calculate difference: end snapshot - before period snapshot
                    const baselineProblems = beforePeriodSnapshot?.totalAttempts || 0;
                    const baselineSeconds = beforePeriodSnapshot?.totalPracticeSeconds || 0;
                    
                    periodProblemsSolved = periodEndSnapshot.totalAttempts - baselineProblems;
                    periodPracticeSeconds = periodEndSnapshot.totalPracticeSeconds - baselineSeconds;
                    
                    // For accuracy, calculate from snapshots within the period
                    const periodSnapshots = snapshots.filter(s => {
                        const snapDate = new Date(s.snapshotDate + 'T00:00:00');
                        return snapDate >= start && snapDate <= end;
                    });
                    
                    if (periodSnapshots.length > 0) {
                        // Calculate average accuracy from snapshots in period
                        const totalAttempts = periodSnapshots.reduce((sum, s) => sum + s.totalAttempts, 0);
                        const totalCorrect = periodSnapshots.reduce((sum, s) => sum + s.totalCorrect, 0);
                        periodAccuracySum = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;
                        snapshotCount = periodSnapshots.length;
                    } else if (endSnapshot) {
                        // If no snapshots in period but we have end snapshot, use its accuracy
                        const accuracy = endSnapshot.totalAttempts > 0 
                            ? (endSnapshot.totalCorrect / endSnapshot.totalAttempts) * 100 
                            : 0;
                        periodAccuracySum = accuracy;
                        snapshotCount = 1;
                    } else {
                        // Fallback to latest snapshot's accuracy
                        const accuracy = latestSnapshot.totalAttempts > 0 
                            ? (latestSnapshot.totalCorrect / latestSnapshot.totalAttempts) * 100 
                            : 0;
                        periodAccuracySum = accuracy;
                        snapshotCount = 1;
                    }
                    
                    // If period is "day" and we don't have snapshot for today, use fallback
                    if (period === 'day' && !endSnapshot) {
                        console.log('No snapshot for today, using direct calculation from attempts');
                        // Will fall through to fallback below
                        throw new Error('No snapshot for today');
                    }
                }

                // Calculate streak from all attempts (needs real-time calculation)
                const allAttempts = await exerciseAttemptService.getAttemptsByStudent(studentId);
                const { current, best } = calculateStreak(allAttempts);

                const accuracyRate = snapshotCount > 0 
                    ? Math.round(periodAccuracySum / snapshotCount)
                    : (latestSnapshot.totalAttempts > 0 
                        ? Math.round((latestSnapshot.totalCorrect / latestSnapshot.totalAttempts) * 100) 
                        : 0);

                return {
                    totalPracticeTime: formatTime(periodPracticeSeconds),
                    problemsSolved: Math.max(0, periodProblemsSolved),
                    accuracyRate: Math.max(0, accuracyRate),
                    currentStreak: current,
                    bestStreak: best
                };
            } else {
                // No snapshots available, will use fallback below
                console.log('No snapshots found, using direct calculation from attempts');
            }
        } catch (error) {
            console.warn('Error fetching from snapshots, falling back to direct calculation:', error);
        }

        // Fallback to direct calculation from attempts if snapshots not available
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
