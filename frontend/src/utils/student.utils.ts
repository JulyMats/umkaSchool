import { Student } from '../types/student';


export const filterStudents = (students: Student[], searchTerm: string): Student[] => {
  if (!searchTerm.trim()) {
    return students;
  }

  const term = searchTerm.toLowerCase();
  return students.filter((student) =>
    [student.firstName, student.lastName, student.email, student.groupName]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(term))
  );
};


export const getUnassignedStudents = (students: Student[]): Student[] => {
  return students.filter((student) => !student.teacherId);
};

