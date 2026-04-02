/**
 * API Response Types
 * Defines standard API response formats
 */

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Error response
 */
export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: Date;
}

/**
 * Success response
 */
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

// Made with Bob
