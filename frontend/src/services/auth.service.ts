import axiosInstance from './axios.config';

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

export const authService = {
    async login(credentials: SignInRequest): Promise<string> {
        const response = await axiosInstance.post('/api/auth/signin', credentials);
        return response.data;
    },

    async register(data: SignUpRequest): Promise<void> {
        await axiosInstance.post('/api/auth/signup', data);
    },

    async forgotPassword(email: string): Promise<void> {
        await axiosInstance.post('/api/auth/forgot-password', { email });
    },

    async resetPassword(token: string, newPassword: string): Promise<void> {
        await axiosInstance.post('/api/auth/reset-password', {
            token,
            newPassword
        });
    },

    async logout(): Promise<void> {
        await axiosInstance.post('/api/auth/logout');
    },

    setAuthToken(token: string | null) {
        if (token) {
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axiosInstance.defaults.headers.common['Authorization'];
        }
    }
};