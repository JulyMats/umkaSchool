import axiosInstance from './axios.config';

export type HomeworkStatus = 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';

export interface HomeworkAssignment {
    id: string;
    homeworkId: string;
    homeworkTitle: string;
    teacherId: string;
    teacherName: string;
    assignedAt: string;
    dueDate: string;
    status: HomeworkStatus;
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

export interface HomeworkExercise {
    exerciseId: string;
    exerciseTypeName: string;
    difficulty: number | null;
    points: number | null;
}

export interface HomeworkDetail {
    id: string;
    title: string;
    description: string;
    teacherId: string;
    teacherName: string;
    createdAt: string;
    updatedAt: string;
    exercises: HomeworkExercise[];
}

export interface CreateHomeworkPayload {
    title: string;
    description: string;
    teacherId: string;
    exerciseIds: string[];
}

export interface UpdateHomeworkPayload {
    title?: string;
    description?: string;
    teacherId?: string;
    exerciseIds?: string[];
}

export interface HomeworkAssignmentDetail extends HomeworkAssignment {}

export interface CreateHomeworkAssignmentPayload {
    homeworkId: string;
    teacherId: string;
    dueDate: string;
    groupIds?: string[];
    studentIds?: string[];
}

export interface UpdateHomeworkAssignmentPayload {
    dueDate?: string;
    status?: HomeworkStatus;
    groupIds?: string[];
    studentIds?: string[];
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

const mapHomeworkResponse = (response: any): HomeworkDetail => ({
    id: response.id,
    title: response.title,
    description: response.description,
    teacherId: response.teacherId,
    teacherName: response.teacherName,
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
    exercises: (response.exercises || []).map((exercise: any) => ({
        exerciseId: exercise.exerciseId,
        exerciseTypeName: exercise.exerciseTypeName,
        difficulty: exercise.difficulty ?? null,
        points: exercise.points ?? null
    }))
});

const mapHomeworkAssignmentResponse = (assignment: any): HomeworkAssignmentDetail => ({
    id: assignment.id,
    homeworkId: assignment.homeworkId,
    homeworkTitle: assignment.homeworkTitle,
    teacherId: assignment.teacherId,
    teacherName: assignment.teacherName,
    assignedAt: assignment.assignedAt,
    dueDate: assignment.dueDate,
    status: assignment.status,
    assignedGroupIds: assignment.assignedGroupIds || [],
    assignedStudentIds: assignment.assignedStudentIds || []
});

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
    },

    // Teacher homework management
    getHomeworkByTeacher: async (teacherId: string): Promise<HomeworkDetail[]> => {
        const response = await axiosInstance.get(`/api/homework/teacher/${teacherId}`);
        return (response.data || []).map(mapHomeworkResponse);
    },

    getAllHomework: async (): Promise<HomeworkDetail[]> => {
        const response = await axiosInstance.get('/api/homework');
        return (response.data || []).map(mapHomeworkResponse);
    },

    getHomeworkById: async (homeworkId: string): Promise<HomeworkDetail> => {
        const response = await axiosInstance.get(`/api/homework/${homeworkId}`);
        return mapHomeworkResponse(response.data);
    },

    createHomework: async (payload: CreateHomeworkPayload): Promise<HomeworkDetail> => {
        const response = await axiosInstance.post('/api/homework', payload);
        return mapHomeworkResponse(response.data);
    },

    updateHomework: async (homeworkId: string, payload: UpdateHomeworkPayload): Promise<HomeworkDetail> => {
        const response = await axiosInstance.put(`/api/homework/${homeworkId}`, payload);
        return mapHomeworkResponse(response.data);
    },

    deleteHomework: async (homeworkId: string): Promise<void> => {
        await axiosInstance.delete(`/api/homework/${homeworkId}`);
    },

    // Teacher assignment management
    getAssignmentsByTeacher: async (teacherId: string): Promise<HomeworkAssignmentDetail[]> => {
        const response = await axiosInstance.get(`/api/homework-assignments/teacher/${teacherId}`);
        return (response.data || []).map(mapHomeworkAssignmentResponse);
    },

    getAssignmentById: async (assignmentId: string): Promise<HomeworkAssignmentDetail> => {
        const response = await axiosInstance.get(`/api/homework-assignments/${assignmentId}`);
        return mapHomeworkAssignmentResponse(response.data);
    },

    createHomeworkAssignment: async (
        payload: CreateHomeworkAssignmentPayload
    ): Promise<HomeworkAssignmentDetail> => {
        const response = await axiosInstance.post('/api/homework-assignments', {
            homeworkId: payload.homeworkId,
            teacherId: payload.teacherId,
            dueDate: new Date(payload.dueDate).toISOString(),
            groupIds: payload.groupIds,
            studentIds: payload.studentIds
        });
        return mapHomeworkAssignmentResponse(response.data);
    },

    updateHomeworkAssignment: async (
        assignmentId: string,
        payload: UpdateHomeworkAssignmentPayload
    ): Promise<HomeworkAssignmentDetail> => {
        const response = await axiosInstance.put(`/api/homework-assignments/${assignmentId}`, {
            dueDate: payload.dueDate ? new Date(payload.dueDate).toISOString() : undefined,
            status: payload.status,
            groupIds: payload.groupIds,
            studentIds: payload.studentIds
        });
        return mapHomeworkAssignmentResponse(response.data);
    },

    deleteHomeworkAssignment: async (assignmentId: string): Promise<void> => {
        await axiosInstance.delete(`/api/homework-assignments/${assignmentId}`);
    }
};