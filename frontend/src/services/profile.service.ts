import axiosInstance from './axios.config';

export interface GuardianInfo {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    relationship: 'MOTHER' | 'FATHER' | 'GUARDIAN' | 'OTHER';
}

export interface CreateStudentProfileRequest {
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
    guardianFirstName: string;
    guardianLastName: string;
    guardianEmail: string;
    guardianPhone: string;
    guardianRelationship: 'MOTHER' | 'FATHER' | 'GUARDIAN' | 'OTHER';
    avatarUrl?: string;
    teacherId?: string;
    groupId?: string;
}

export interface CreateTeacherProfileRequest {
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
    bio?: string;
    phone?: string;
}

export const profileService = {
    createStudentProfile: async (profileData: CreateStudentProfileRequest) => {
        const response = await axiosInstance.post('/api/students', {
            ...profileData,
            dateOfBirth: new Date(profileData.dateOfBirth).toISOString().split('T')[0]
        });
        return response.data;
    },

    createTeacherProfile: async (data: CreateTeacherProfileRequest) => {
        const response = await axiosInstance.post('/api/teachers', data);
        return response.data;
    }
};