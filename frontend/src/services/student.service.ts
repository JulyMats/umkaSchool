import axiosInstance from './axios.config';

export interface Student {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
    enrollmentDate: string;
    lastActivityAt: string | null;
    teacherId: string | null;
    teacherName: string | null;
    groupId: string | null;
    groupName: string | null;
    groupCode: string | null;
    avatarUrl?: string; // Optional avatar URL for student
    guardian: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        relationship: string;
    } | null;
}

export const studentService = {
    getStudentByUserId: async (userId: string): Promise<Student> => {
        const response = await axiosInstance.get<Student>(`/api/students/user/${userId}`);
        return response.data;
    },

    getStudentById: async (studentId: string): Promise<Student> => {
        const response = await axiosInstance.get<Student>(`/api/students/${studentId}`);
        return response.data;
    },

    updateLastActivity: async (studentId: string): Promise<void> => {
        await axiosInstance.put(`/api/students/${studentId}/activity`);
    }
};

