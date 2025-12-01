export interface SignUpRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: 'TEACHER' | 'STUDENT';
}

export interface SignInRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    jwtToken: string;
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

