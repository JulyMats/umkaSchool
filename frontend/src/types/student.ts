export interface GuardianInfo {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    relationship: string;
}

export interface Student {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
    enrollmentDate: string;
    lastActivityAt: string | null;
    teacherId: string | null;
    teacherName: string | null;
    groupId: string | null;
    groupName: string | null;
    groupCode: string | null;
    avatarUrl: string;
    guardian: GuardianInfo | null;
}

export interface CreateStudentPayload {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    dateOfBirth: string;
    guardian: GuardianInfo;
    teacherId?: string | null;
    groupId?: string | null;
}

export interface UpdateStudentPayload {
    firstName?: string;
    lastName?: string;
    email?: string;
    dateOfBirth?: string;
    guardian?: Partial<GuardianInfo>;
    teacherId?: string | null;
    groupId?: string | null;
}

