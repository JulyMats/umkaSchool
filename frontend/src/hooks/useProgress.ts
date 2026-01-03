import { useState, useEffect, useRef } from 'react';
import { statsService } from '../services/stats.service';
import { achievementService } from '../services/achievement.service';
import { TimePeriod, StudentStats } from '../types/stats';
import { StudentAchievement, Achievement } from '../types/achievement';
import { extractErrorMessage } from '../utils/error.utils';

interface UseProgressReturn {
  stats: StudentStats | null;
  previousStats: StudentStats | null;
  studentAchievements: StudentAchievement[];
  allAchievements: Achievement[];
  loading: boolean;
  statsLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useProgress = (studentId: string | undefined, selectedPeriod: TimePeriod): UseProgressReturn => {
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [previousStats, setPreviousStats] = useState<StudentStats | null>(null);
  const [studentAchievements, setStudentAchievements] = useState<StudentAchievement[]>([]);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Cache to store stats by period to avoid refetching
  const statsCache = useRef<Map<string, StudentStats>>(new Map());
  const achievementsFetched = useRef(false);

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!studentId || achievementsFetched.current) {
        return;
      }

      try {
        const [earnedAchievements, allAchievementsList] = await Promise.all([
          achievementService.getStudentAchievements(studentId),
          achievementService.getAllAchievements()
        ]);
        setStudentAchievements(earnedAchievements);
        setAllAchievements(allAchievementsList);
        achievementsFetched.current = true;
      } catch (err: unknown) {
        console.error('[useProgress] Error fetching achievements:', err);
        setError(extractErrorMessage(err, 'Failed to load achievements'));
      }
    };

    fetchAchievements();
  }, [studentId]);

  // Fetch stats when period changes (with caching)
  useEffect(() => {
    const fetchStats = async () => {
      if (!studentId) {
        setLoading(false);
        return;
      }

      const cacheKey = `${studentId}-${selectedPeriod}`;
      
      // Check cache first
      if (statsCache.current.has(cacheKey)) {
        const cachedStats = statsCache.current.get(cacheKey)!;
        setStats(cachedStats);
        setLoading(false);
        setStatsLoading(false);
        
        // Still fetch previous period stats for comparison
        let previousPeriod: TimePeriod = 'all';
        if (selectedPeriod === 'week') {
          previousPeriod = 'all';
        } else if (selectedPeriod === 'month') {
          previousPeriod = 'all';
        }
        
        const prevCacheKey = `${studentId}-${previousPeriod}`;
        if (statsCache.current.has(prevCacheKey)) {
          setPreviousStats(statsCache.current.get(prevCacheKey)!);
        } else {
          try {
            const prevStats = await statsService.getStudentStats(studentId, previousPeriod);
            setPreviousStats(prevStats);
            statsCache.current.set(prevCacheKey, prevStats);
          } catch (err: unknown) {
            console.error('Error fetching previous stats:', err);
          }
        }
        return;
      }

      try {
        setStatsLoading(true);
        setError(null);

        // Fetch current period stats
        const currentStats = await statsService.getStudentStats(studentId, selectedPeriod);
        setStats(currentStats);
        statsCache.current.set(cacheKey, currentStats);

        // Fetch previous period for comparison
        let previousPeriod: TimePeriod = 'all';
        if (selectedPeriod === 'week') {
          previousPeriod = 'all';
        } else if (selectedPeriod === 'month') {
          previousPeriod = 'all';
        }
        
        const prevCacheKey = `${studentId}-${previousPeriod}`;
        if (statsCache.current.has(prevCacheKey)) {
          setPreviousStats(statsCache.current.get(prevCacheKey)!);
        } else {
          const prevStats = await statsService.getStudentStats(studentId, previousPeriod);
          setPreviousStats(prevStats);
          statsCache.current.set(prevCacheKey, prevStats);
        }
      } catch (err: unknown) {
        console.error('Error fetching stats:', err);
        setError(extractErrorMessage(err, 'Failed to load progress data'));
      } finally {
        setLoading(false);
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [studentId, selectedPeriod]);

  // Initial loading state
  useEffect(() => {
    if (studentId && !achievementsFetched.current) {
      setLoading(true);
    }
  }, [studentId]);

  const refetch = async () => {
    if (!studentId) return;
    
    // Clear cache and refetch
    statsCache.current.clear();
    achievementsFetched.current = false;
    
    setLoading(true);
    setStatsLoading(true);
    
    try {
      const [currentStats, earnedAchievements, allAchievementsList] = await Promise.all([
        statsService.getStudentStats(studentId, selectedPeriod),
        achievementService.getStudentAchievements(studentId),
        achievementService.getAllAchievements()
      ]);
      
      setStats(currentStats);
      setStudentAchievements(earnedAchievements);
      setAllAchievements(allAchievementsList);
      
      const cacheKey = `${studentId}-${selectedPeriod}`;
      statsCache.current.set(cacheKey, currentStats);
      achievementsFetched.current = true;
    } catch (err: unknown) {
      console.error('Error refetching:', err);
      setError(extractErrorMessage(err, 'Failed to load progress data'));
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  };

  return {
    stats,
    previousStats,
    studentAchievements,
    allAchievements,
    loading,
    statsLoading,
    error,
    refetch
  };
};

