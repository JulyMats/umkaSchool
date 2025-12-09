import { useState, useEffect } from 'react';
import { homeworkService } from '../services/homework.service';
import { groupService } from '../services/group.service';
import { studentService } from '../services/student.service';
import { exerciseService } from '../services/exercise.service';
import { exerciseTypeService } from '../services/exerciseType.service';
import { HomeworkDetail, HomeworkAssignmentDetail } from '../types/homework';
import { Group } from '../types/group';
import { Student } from '../types/student';
import { Exercise } from '../types/exercise';
import { ExerciseType } from '../types/exerciseType';
import { extractErrorMessage } from '../utils/error.utils';

interface UseTeacherHomeworkReturn {
  homework: HomeworkDetail[];
  assignments: HomeworkAssignmentDetail[];
  groups: Group[];
  students: Student[];
  exercises: Exercise[];
  exerciseTypes: ExerciseType[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useTeacherHomework = (teacherId: string | undefined): UseTeacherHomeworkReturn => {
  const [homework, setHomework] = useState<HomeworkDetail[]>([]);
  const [assignments, setAssignments] = useState<HomeworkAssignmentDetail[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseTypes, setExerciseTypes] = useState<ExerciseType[]>([]);
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
      const [
        homeworkResponse,
        assignmentsResponse,
        groupsResponse,
        studentsResponse,
        exercisesResponse,
        exerciseTypesResponse
      ] = await Promise.all([
        homeworkService.getHomeworkByTeacher(teacherId),
        homeworkService.getAssignmentsByTeacher(teacherId),
        groupService.getGroupsByTeacher(teacherId),
        studentService.getStudentsByTeacher(teacherId),
        exerciseService.getExercisesByTeacher(teacherId),
        exerciseTypeService.getAllExerciseTypes()
      ]);

      setHomework(homeworkResponse);
      setAssignments(assignmentsResponse);
      setGroups(groupsResponse);
      setStudents(studentsResponse);
      setExercises(exercisesResponse);
      setExerciseTypes(exerciseTypesResponse);
    } catch (err: unknown) {
      console.error('[TeacherHomework] Failed to load data', err);
      setError(extractErrorMessage(err, 'Failed to load homework data. Please try again later.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [teacherId]);

  return {
    homework,
    assignments,
    groups,
    students,
    exercises,
    exerciseTypes,
    loading,
    error,
    refetch: fetchData
  };
};

