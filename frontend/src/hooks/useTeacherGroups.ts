import { useState, useEffect } from 'react';
import { groupService } from '../services/group.service';
import { studentService } from '../services/student.service';
import { Group } from '../types/group';
import { Student } from '../types/student';
import { extractErrorMessage } from '../utils/error.utils';

interface UseTeacherGroupsReturn {
  groups: Group[];
  students: Student[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useTeacherGroups = (teacherId: string | undefined): UseTeacherGroupsReturn => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
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
      const [groupsResponse, studentsResponse] = await Promise.all([
        groupService.getGroupsByTeacher(teacherId),
        studentService.getStudentsByTeacher(teacherId)
      ]);
      setGroups(groupsResponse);
      setStudents(studentsResponse);
    } catch (err: unknown) {
      console.error('[TeacherGroups] Failed to load data', err);
      setError(extractErrorMessage(err, 'Failed to load groups. Please try again later.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [teacherId]);

  return {
    groups,
    students,
    loading,
    error,
    refetch: fetchData
  };
};

