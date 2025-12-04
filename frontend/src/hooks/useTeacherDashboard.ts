import { useState, useEffect } from 'react';
import { studentService } from '../services/student.service';
import { groupService } from '../services/group.service';
import { homeworkService } from '../services/homework.service';
import { achievementService } from '../services/achievement.service';
import { Student } from '../types/student';
import { Group } from '../types/group';
import { HomeworkAssignmentDetail } from '../types/homework';
import { StudentAchievement } from '../types/achievement';
import { getRecentStudentAchievements } from '../utils/teacher.utils';

interface DashboardData {
  students: Student[];
  groups: Group[];
  assignments: HomeworkAssignmentDetail[];
}

interface RecentStudentAchievement extends StudentAchievement {
  studentId: string;
  studentName: string;
}

interface UseTeacherDashboardReturn {
  data: DashboardData;
  recentAchievements: RecentStudentAchievement[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useTeacherDashboard = (teacherId: string | undefined): UseTeacherDashboardReturn => {
  const [data, setData] = useState<DashboardData>({
    students: [],
    groups: [],
    assignments: []
  });
  const [recentAchievements, setRecentAchievements] = useState<RecentStudentAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!teacherId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [students, groups, assignments] = await Promise.all([
        studentService.getStudentsByTeacher(teacherId),
        groupService.getGroupsByTeacher(teacherId),
        homeworkService.getAssignmentsByTeacher(teacherId)
      ]);
      setData({ students, groups, assignments });

      // Fetch recent achievements for all students
      const achievements = await getRecentStudentAchievements(students);
      setRecentAchievements(achievements);
    } catch (err: any) {
      console.error('[TeacherDashboard] Failed to load dashboard data', err);
      setError(err?.message || 'Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [teacherId]);

  return {
    data,
    recentAchievements,
    loading,
    error,
    refetch: fetchData
  };
};

