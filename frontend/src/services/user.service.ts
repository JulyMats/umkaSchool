import axiosInstance from './axios.config';
import { User, UpdateUserPayload, UserResponse } from '../types/user';

const mapUserResponse = (response: UserResponse): User => {
    return {
        id: response.id,
        firstName: response.firstName,
        lastName: response.lastName,
        email: response.email,
        role: (response.userRole || 'STUDENT') as 'STUDENT' | 'TEACHER' | 'ADMIN',
        appLanguage: response.appLanguage,
        avatarUrl: response.avatarUrl,
        appTheme: (response.appTheme || 'LIGHT') as 'LIGHT' | 'DARK',
        isActive: response.isActive,
        createdAt: response.createdAt,
        updatedAt: response.createdAt, // Use createdAt as fallback if updatedAt not available
        lastLoginAt: response.lastLoginAt
    };
};

export const userService = {
    getUserByEmail: async (email: string): Promise<User> => {
        const response = await axiosInstance.get<UserResponse>(`/api/users/email/${email}`);
        const mappedUser = mapUserResponse(response.data);
        return mappedUser;
    },

    getUserById: async (userId: string): Promise<User> => {
        const response = await axiosInstance.get<UserResponse>(`/api/users/${userId}`);
        return mapUserResponse(response.data);
    },

    updateUser: async (userId: string, payload: UpdateUserPayload): Promise<User> => {
        const response = await axiosInstance.put<UserResponse>(`/api/users/${userId}`, payload);
        return mapUserResponse(response.data);
    },

    activateUser: async (userId: string): Promise<void> => {
        await axiosInstance.put(`/api/users/${userId}/activate`);
    },

    deactivateUser: async (userId: string): Promise<void> => {
        await axiosInstance.put(`/api/users/${userId}/deactivate`);
    }
};

