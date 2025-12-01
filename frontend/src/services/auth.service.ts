import axiosInstance from './axios.config';
import { SignUpRequest, SignInRequest, LoginResponse, RegisterResponse } from '../types/auth';

export const authService = {
    async login(credentials: SignInRequest): Promise<string> {
        const response = await axiosInstance.post<LoginResponse>('/api/auth/signin', credentials);
        return response.data.jwtToken;
    },

    async register(data: SignUpRequest): Promise<RegisterResponse> {
        const response = await axiosInstance.post<RegisterResponse>('/api/auth/signup', data);
        return response.data;
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