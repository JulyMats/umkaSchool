export interface Group {
    id: string;
    name: string;
    code: string;
    description: string | null;
    teacherId: string;
    teacherName: string;
    studentCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateGroupPayload {
    name: string;
    code: string;
    description?: string;
    teacherId: string;
    studentIds?: string[];
}

export interface UpdateGroupPayload {
    name?: string;
    description?: string | null;
    teacherId?: string;
    studentIds?: string[];
}

