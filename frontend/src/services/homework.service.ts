import axiosInstance from './axios.config';

export interface HomeworkAssignment {
    id: string;
    homeworkId: string;
    homeworkTitle: string;
    teacherId: string;
    teacherName: string;
    assignedAt: string;
    dueDate: string;
    status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
    assignedGroupIds: string[];
    assignedStudentIds: string[];
}

export interface Homework {
    id: string;
    assignmentId: string;
    title: string;
    dueDate: string;
    status: 'pending' | 'completed' | 'overdue';
    teacherName: string;
    timeEstimate: string;
}

const mapApiStatusToUiStatus = (apiStatus: string): 'pending' | 'completed' | 'overdue' => {
    switch (apiStatus) {
        case 'COMPLETED':
            return 'completed';
        case 'OVERDUE':
            return 'overdue';
        case 'ASSIGNED':
        case 'IN_PROGRESS':
        default:
            return 'pending';
    }
};

const calculateTimeEstimate = (dueDate: string, assignedAt: string): string => {
    const dueDateTime = new Date(dueDate);
    const assignedDateTime = new Date(assignedAt);
    const diffInHours = Math.abs(dueDateTime.getTime() - assignedDateTime.getTime()) / 36e5;
    // Assuming students should spend about 20% of the available time on the homework
    const estimatedMinutes = Math.round((diffInHours * 60) * 0.2);
    return `${estimatedMinutes} mins`;
};

export const homeworkService = {
    // Get homework assignments for the current student
    getCurrentStudentHomework: async (studentId: string): Promise<Homework[]> => {
        try {
            console.log('[homeworkService] getCurrentStudentHomework called with studentId:', studentId);
            const url = `/api/homework-assignments/student/${studentId}`;
            console.log('[homeworkService] Making request to:', url);
            console.log('[homeworkService] Axios instance baseURL:', axiosInstance.defaults.baseURL);
            console.log('[homeworkService] Authorization header:', axiosInstance.defaults.headers.common['Authorization'] ? 'Present' : 'Missing');
            
            const response = await axiosInstance.get<HomeworkAssignment[]>(url);
            console.log('[homeworkService] Response received:', {
                status: response.status,
                dataLength: response.data?.length,
                data: response.data
            });
            
            const mappedData = response.data.map(assignment => ({
                id: assignment.homeworkId,
                assignmentId: assignment.id,
                title: assignment.homeworkTitle,
                dueDate: new Date(assignment.dueDate).toISOString().split('T')[0],
                status: mapApiStatusToUiStatus(assignment.status),
                teacherName: assignment.teacherName,
                timeEstimate: calculateTimeEstimate(assignment.dueDate, assignment.assignedAt)
            }));
            
            console.log('[homeworkService] Mapped homework data:', mappedData);
            return mappedData;
        } catch (error: any) {
            console.error('[homeworkService] Error fetching homework assignments:', error);
            console.error('[homeworkService] Error details:', {
                message: error?.message,
                response: error?.response?.data,
                status: error?.response?.status,
                statusText: error?.response?.statusText,
                config: {
                    url: error?.config?.url,
                    method: error?.config?.method,
                    baseURL: error?.config?.baseURL,
                    headers: error?.config?.headers
                }
            });
            // Provide more detailed error message
            if (error.response) {
                throw new Error(error.response.data?.message || `Failed to load homework: ${error.response.status}`);
            } else if (error.request) {
                throw new Error('No response from server. Please check your connection.');
            } else {
                throw new Error(error.message || 'Failed to load homework');
            }
        }
    },

    // Get a specific homework assignment
    getHomeworkAssignment: async (assignmentId: string): Promise<Homework> => {
        try {
            const response = await axiosInstance.get<HomeworkAssignment>(`/api/homework-assignments/${assignmentId}`);
            const assignment = response.data;
            return {
                id: assignment.homeworkId,
                assignmentId: assignment.id,
                title: assignment.homeworkTitle,
                dueDate: new Date(assignment.dueDate).toISOString().split('T')[0],
                status: mapApiStatusToUiStatus(assignment.status),
                teacherName: assignment.teacherName,
                timeEstimate: calculateTimeEstimate(assignment.dueDate, assignment.assignedAt)
            };
        } catch (error: any) {
            console.error(`Error fetching homework assignment with id ${assignmentId}:`, error);
            if (error.response) {
                throw new Error(error.response.data?.message || `Failed to load homework: ${error.response.status}`);
            } else if (error.request) {
                throw new Error('No response from server. Please check your connection.');
            } else {
                throw new Error(error.message || 'Failed to load homework');
            }
        }
    }
};