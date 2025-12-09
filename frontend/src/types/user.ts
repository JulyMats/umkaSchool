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

export interface UpdateUserPayload {
    firstName?: string;
    lastName?: string;
    email?: string;
    appLanguage?: string;
    avatarUrl?: string;
    appTheme?: 'LIGHT' | 'DARK';
}

export interface UserResponse {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    userRole: string;
    appLanguage: string;
    avatarUrl: string | null;
    appTheme: string;
    isActive: boolean;
    createdAt: string;
    lastLoginAt: string | null;
}

