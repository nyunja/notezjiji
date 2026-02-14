import { AxiosError } from 'axios';

/**
 * Extracts error message from various error types
 * Handles Axios errors with response data structure
 */
export function getErrorMessage(error: unknown, defaultMessage = 'An error occurred'): string {
  // Check if it's an Axios error with response data
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
  }

  // Check if it's a standard Error object
  if (error instanceof Error) {
    return error.message;
  }

  // Check if it's a string
  if (typeof error === 'string') {
    return error;
  }

  // Return default message for unknown error types
  return defaultMessage;
}

