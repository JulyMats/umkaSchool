import axios from 'axios';

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

const BASE_URL = 'http://localhost:8080/api';

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
            const response = await axios.get<HomeworkAssignment[]>(`${BASE_URL}/homework-assignments/student/${studentId}`);
            return response.data.map(assignment => ({
                id: assignment.homeworkId,
                assignmentId: assignment.id,
                title: assignment.homeworkTitle,
                dueDate: new Date(assignment.dueDate).toISOString().split('T')[0],
                status: mapApiStatusToUiStatus(assignment.status),
                teacherName: assignment.teacherName,
                timeEstimate: calculateTimeEstimate(assignment.dueDate, assignment.assignedAt)
            }));
        } catch (error) {
            console.error('Error fetching homework assignments:', error);
            throw error;
        }
    },

    // Get a specific homework assignment
    getHomeworkAssignment: async (assignmentId: string): Promise<Homework> => {
        try {
            const response = await axios.get<HomeworkAssignment>(`${BASE_URL}/homework-assignments/${assignmentId}`);
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
        } catch (error) {
            console.error(`Error fetching homework assignment with id ${assignmentId}:`, error);
            throw error;
        }
    }
};