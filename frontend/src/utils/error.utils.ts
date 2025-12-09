import { ApiError } from '../types/common';

interface AxiosErrorResponse {
  response?: {
    data?: ApiError | { message?: string; error?: string; fieldErrors?: Record<string, string> };
    status?: number;
  };
  message?: string;
}

export const extractErrorMessage = (
  error: unknown,
  defaultMessage: string = 'An error occurred. Please try again.'
): string => {
  const errorObj = error as AxiosErrorResponse;

  // Check if it's an Axios error with response data
  if (errorObj?.response?.data) {
    const data = errorObj.response.data;
    
    // Handle structured ApiError
    if (typeof data === 'object' && 'message' in data) {
      return data.message || defaultMessage;
    }
    
    // Handle error object with message or error field
    if ('message' in data && data.message) {
      return data.message;
    }
    if ('error' in data && data.error) {
      return data.error;
    }
  }

  // Check for direct message
  if (errorObj?.message) {
    return errorObj.message;
  }

  // Fallback to default
  return defaultMessage;
};

export const extractFieldErrors = (
  error: unknown
): Record<string, string> | null => {
  const errorObj = error as AxiosErrorResponse;

  if (errorObj?.response?.data) {
    const data = errorObj.response.data;
    
    if (typeof data === 'object' && 'fieldErrors' in data && data.fieldErrors) {
      return data.fieldErrors;
    }
  }

  return null;
};

export const extractErrorStatus = (error: unknown): number | null => {
  const errorObj = error as AxiosErrorResponse;
  return errorObj?.response?.status || null;
};

