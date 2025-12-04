import { useState, useEffect } from 'react';
import { studentService } from '../services/student.service';
import { groupService } from '../services/group.service';
import { achievementService } from '../services/achievement.service';
import { Student } from '../types/student';
import { Group } from '../types/group';
import { StudentAchievement } from '../types/achievement';
import { getLastAchievementsForStudents, getUnassignedStudents } from '../utils/teacher.utils';

interface UseTeacherStudentsReturn {
  students: Student[];
  groups: Group[];
  unassignedStudents: Student[];
  studentLastAchievements: Record<string, StudentAchievement | null>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useTeacherStudents = (teacherId: string | undefined): UseTeacherStudentsReturn => {
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [unassignedStudents, setUnassignedStudents] = useState<Student[]>([]);
  const [studentLastAchievements, setStudentLastAchievements] = useState<Record<string, StudentAchievement | null>>({});
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
      const [assignedStudents, teacherGroups, allStudents] = await Promise.all([
        studentService.getStudentsByTeacher(teacherId),
        groupService.getGroupsByTeacher(teacherId),
        studentService.getAllStudents()
      ]);

      setStudents(assignedStudents);
      setGroups(teacherGroups);
      setUnassignedStudents(getUnassignedStudents(allStudents));

      const achievementsMap = await getLastAchievementsForStudents(assignedStudents);
      setStudentLastAchievements(achievementsMap);
    } catch (err: any) {
      console.error('[TeacherStudents] Failed to load data', err);
      setError(err?.message || 'Failed to load students. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [teacherId]);

  return {
    students,
    groups,
    unassignedStudents,
    studentLastAchievements,
    loading,
    error,
    refetch: fetchData
  };
};

