export interface Teacher {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    bio: string | null;
    phone: string | null;
    totalStudents: number;
    totalGroups: number;
    createdAt: string;
    avatarUrl: string;
}

export interface CreateTeacherPayload {
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
    bio?: string;
    phone?: string;
}

export interface UpdateTeacherPayload {
    firstName?: string;
    lastName?: string;
    email?: string;
    bio?: string;
    phone?: string;
}

