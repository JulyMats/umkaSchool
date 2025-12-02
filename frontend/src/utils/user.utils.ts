import { User } from '../types/user';
import { Student } from '../types/student';
import { Teacher } from '../types/teacher';


export const getDisplayName = (
  user: User | null,
  student: Student | null,
  teacher: Teacher | null,
  fallback: string = 'User'
): string => {
  if (student?.firstName) {
    return student.firstName;
  }
  if (teacher?.firstName) {
    return teacher.firstName;
  }
  if (user?.firstName) {
    return user.firstName;
  }
  return fallback;
};


export const getFullName = (
  user: User | null,
  student: Student | null,
  teacher: Teacher | null,
  fallback: string = 'User'
): string => {
  if (student?.firstName && student?.lastName) {
    return `${student.firstName} ${student.lastName}`;
  }
  if (teacher?.firstName && teacher?.lastName) {
    return `${teacher.firstName} ${teacher.lastName}`;
  }
  if (user?.firstName && user?.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  if (student?.firstName || teacher?.firstName || user?.firstName) {
    return student?.firstName || teacher?.firstName || user?.firstName || fallback;
  }
  return fallback;
};

