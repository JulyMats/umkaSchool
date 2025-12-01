import axiosInstance from './axios.config';
import { ProgressSnapshot } from '../types/progress';

export const progressSnapshotService = {
    getLatestSnapshot: async (studentId: string): Promise<ProgressSnapshot | null> => {
        try {
            const response = await axiosInstance.get<ProgressSnapshot>(`/api/progress-snapshots/student/${studentId}/latest`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null; // No snapshot yet
            }
            console.error('Error fetching latest snapshot:', error);
            throw error;
        }
    },

    getSnapshotsByStudent: async (studentId: string): Promise<ProgressSnapshot[]> => {
        try {
            const response = await axiosInstance.get<ProgressSnapshot[]>(`/api/progress-snapshots/student/${studentId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching snapshots:', error);
            throw error;
        }
    },

    getSnapshotsByDateRange: async (
        studentId: string,
        startDate: string,
        endDate: string
    ): Promise<ProgressSnapshot[]> => {
        try {
            const response = await axiosInstance.get<ProgressSnapshot[]>(
                `/api/progress-snapshots/student/${studentId}/date-range`,
                {
                    params: { startDate, endDate }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching snapshots by date range:', error);
            throw error;
        }
    },

    getSnapshotByDate: async (studentId: string, date: string): Promise<ProgressSnapshot | null> => {
        try {
            const response = await axiosInstance.get<ProgressSnapshot>(
                `/api/progress-snapshots/student/${studentId}/date/${date}`
            );
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            console.error('Error fetching snapshot by date:', error);
            throw error;
        }
    }
};

