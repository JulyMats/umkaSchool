import axiosInstance from './axios.config';
import { SignUpRequest, SignInRequest, LoginResponse, RegisterResponse } from '../types/auth';

export const authService = {
    async login(credentials: SignInRequest): Promise<LoginResponse> {
        const response = await axiosInstance.post<LoginResponse>('/api/auth/signin', credentials);
        return response.data;
    },

    async refreshToken(refreshToken: string): Promise<LoginResponse> {
        const response = await axiosInstance.post<LoginResponse>('/api/auth/refresh', {
            refreshToken
        });
        return response.data;
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

    async logout(refreshToken: string): Promise<void> {
        await axiosInstance.post('/api/auth/logout', { refreshToken });
    },

    setAuthToken(token: string | null) {
        if (token) {
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axiosInstance.defaults.headers.common['Authorization'];
        }
    }
};