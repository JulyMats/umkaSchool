import axiosInstance from './axios.config';

export interface AdminDashboardStats {
    totalTeachers: number;
    totalStudents: number;
    activeTeachers: number;
    activeStudents: number;
    totalGroups: number;
    newUsersLastDay: number;
    newUsersLastMonth: number;
    newUsersLastYear: number;
}

export const adminService = {
    getDashboardStats: async (): Promise<AdminDashboardStats> => {
        const response = await axiosInstance.get<AdminDashboardStats>('/api/admin/dashboard');
        return response.data;
    },
};

