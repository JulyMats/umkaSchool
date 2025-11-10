import axiosInstance from './axios.config';

interface UserResponse {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    userRole: string; // Backend returns 'userRole' not 'role'
    appLanguage: string;
    avatarUrl: string | null;
    appTheme: string;
    isActive: boolean;
    createdAt: string;
    lastLoginAt: string | null;
}

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'STUDENT' | 'TEACHER' | 'ADMIN';
    appLanguage: string;
    avatarUrl: string | null;
    appTheme: 'LIGHT' | 'DARK';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    lastLoginAt: string | null;
}

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
        console.log('[userService] Getting user by email:', email);
        const response = await axiosInstance.get<UserResponse>(`/api/users/email/${email}`);
        console.log('[userService] Raw user response:', response.data);
        const mappedUser = mapUserResponse(response.data);
        console.log('[userService] Mapped user:', mappedUser);
        return mappedUser;
    },

    getUserById: async (userId: string): Promise<User> => {
        const response = await axiosInstance.get<UserResponse>(`/api/users/${userId}`);
        return mapUserResponse(response.data);
    }
};

