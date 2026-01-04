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
    number: number; 
    size: number;
    first: boolean;
    last: boolean;
    numberOfElements: number; 
    empty: boolean;
}

