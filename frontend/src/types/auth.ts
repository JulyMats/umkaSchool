export interface SignUpRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: 'TEACHER' | 'STUDENT';
    avatarUrl?: string;
    // Student fields
    dateOfBirth?: string;
    guardianFirstName?: string;
    guardianLastName?: string;
    guardianEmail?: string;
    guardianPhone?: string;
    guardianRelationship?: 'MOTHER' | 'FATHER' | 'GUARDIAN' | 'OTHER';
    // Teacher fields
    phone?: string;
    bio?: string;
}

export interface SignInRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    jwtToken: string | null;
    refreshToken: string | null;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: 'STUDENT' | 'TEACHER' | 'ADMIN';
    };
}

export interface RegisterResponse {
    id: string;
    role: string;
}

