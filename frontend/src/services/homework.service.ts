import axiosInstance from './axios.config';
import {
    HomeworkAssignment,
    Homework,
    HomeworkDetail,
    HomeworkAssignmentDetail,
    CreateHomeworkPayload,
    UpdateHomeworkPayload,
    CreateHomeworkAssignmentPayload,
    UpdateHomeworkAssignmentPayload
} from '../types/homework';
import { extractErrorMessage } from '../utils/error.utils';

const mapApiStatusToUiStatus = (apiStatus: string): 'pending' | 'completed' | 'overdue' => {
    switch (apiStatus) {
        case 'COMPLETED':
            return 'completed';
        case 'OVERDUE':
            return 'overdue';
        case 'PENDING':
            return 'pending'
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
            const url = `/api/homework-assignments/student/${studentId}`;
            
            const response = await axiosInstance.get<HomeworkAssignment[]>(url);
            
            const mappedData = response.data.map(assignment => ({
                id: assignment.homeworkId,
                assignmentId: assignment.id,
                title: assignment.homeworkTitle,
                dueDate: new Date(assignment.dueDate).toISOString().split('T')[0],
                status: mapApiStatusToUiStatus(assignment.status),
                teacherName: assignment.teacherName,
                timeEstimate: calculateTimeEstimate(assignment.dueDate, assignment.assignedAt)
            }));
            
            return mappedData;
        } catch (error: unknown) {
            console.error('[homeworkService] Error fetching homework assignments:', error);
            const errorMessage = extractErrorMessage(error, 'Failed to load homework');
            throw new Error(errorMessage);
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
        } catch (error: unknown) {
            console.error(`Error fetching homework assignment with id ${assignmentId}:`, error);
            const errorMessage = extractErrorMessage(error, 'Failed to load homework');
            throw new Error(errorMessage);
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