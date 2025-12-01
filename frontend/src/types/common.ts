export interface ApiError {
    message: string;
    error?: string;
    fieldErrors?: Record<string, string>;
    status?: number;
}

export interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
}

