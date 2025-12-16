export type HomeworkStatus = 'PENDING' | 'COMPLETED' | 'OVERDUE';

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

