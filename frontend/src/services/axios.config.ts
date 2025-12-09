import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to add token to all requests
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    const { authService } = await import('./auth.service');
                    const refreshResponse = await authService.refreshToken(refreshToken);
                    
                    localStorage.setItem('token', refreshResponse.jwtToken);
                    localStorage.setItem('refreshToken', refreshResponse.refreshToken);
                    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${refreshResponse.jwtToken}`;
                    
                    originalRequest.headers['Authorization'] = `Bearer ${refreshResponse.jwtToken}`;
                    return axiosInstance(originalRequest);
                } catch (refreshError) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('userEmail');
                    delete axiosInstance.defaults.headers.common['Authorization'];
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            } else {
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('userEmail');
                delete axiosInstance.defaults.headers.common['Authorization'];
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;