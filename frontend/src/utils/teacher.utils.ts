import { Student } from '../types/student';
import { Group } from '../types/group';
import { StudentAchievement } from '../types/achievement';
import { achievementService } from '../services/achievement.service';
import { HomeworkAssignmentDetail } from '../types/homework';
import { getUnassignedStudents as getUnassignedStudentsUtil } from './student.utils';

export interface RecentStudentAchievement extends StudentAchievement {
  studentId: string;
  studentName: string;
}


export const getRecentStudentAchievements = async (
  students: Student[]
): Promise<RecentStudentAchievement[]> => {
  const allAchievements: RecentStudentAchievement[] = [];
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  for (const student of students) {
    try {
      const allStudentAchievements = await achievementService.getStudentAchievements(student.id);
      
      const recentAchievements = allStudentAchievements.filter(achievement => {
        const earnedDate = new Date(achievement.earnedAt);
        return earnedDate >= thirtyDaysAgo;
      });
      
      const achievementsWithStudentInfo = recentAchievements.map(achievement => ({
        ...achievement,
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`
      }));
      
      allAchievements.push(...achievementsWithStudentInfo);
    } catch (err) {
      console.error(`Failed to load achievements for student ${student.id}:`, err);
    }
  }
  
  // Sort by earned date (most recent first) and take top 4
  return allAchievements
    .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
    .slice(0, 4);
};


export interface DashboardMetrics {
  totalStudents: number;
  totalGroups: number;
  activeAssignmentsCount: number;
  upcomingAssignments: HomeworkAssignmentDetail[];
  recentStudents: Student[];
}

export const calculateDashboardMetrics = (
  assignments: HomeworkAssignmentDetail[],
  students: Student[],
  groups: Group[],
  teacherTotalStudents?: number,
  teacherTotalGroups?: number
): DashboardMetrics => {
  const activeAssignments = assignments.filter(
    (assignment) => assignment.status !== 'COMPLETED'
  );

  const now = new Date();
  const upcomingAssignments = [...activeAssignments]
    .filter((assignment) => {
      if (!assignment.dueDate) return false;
      const dueDate = new Date(assignment.dueDate);
      return dueDate >= now && assignment.status !== 'OVERDUE';
    })
    .sort(
      (a, b) =>
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    )
    .slice(0, 5);

  const recentStudents = [...students]
    .filter((student) => student.lastActivityAt)
    .sort(
      (a, b) =>
        new Date(b.lastActivityAt || '').getTime() -
        new Date(a.lastActivityAt || '').getTime()
    )
    .slice(0, 5);

  return {
    totalStudents: teacherTotalStudents ?? students.length,
    totalGroups: teacherTotalGroups ?? groups.length,
    activeAssignmentsCount: activeAssignments.length,
    upcomingAssignments,
    recentStudents
  };
};


export const getUnassignedStudents = (students: Student[]): Student[] => {
  return getUnassignedStudentsUtil(students);
};


export const getLastAchievementsForStudents = async (
  students: Student[]
): Promise<Record<string, StudentAchievement | null>> => {
  const achievementsMap: Record<string, StudentAchievement | null> = {};

  for (const student of students) {
    try {
      const allAchievements = await achievementService.getStudentAchievements(student.id);
      if (allAchievements.length > 0) {
        // Sort by earned date and get the most recent one
        const sortedAchievements = allAchievements.sort(
          (a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()
        );
        achievementsMap[student.id] = sortedAchievements[0];
      } else {
        achievementsMap[student.id] = null;
      }
    } catch (err) {
      console.error(`Failed to load achievements for student ${student.id}:`, err);
      achievementsMap[student.id] = null;
    }
  }

  return achievementsMap;
};

