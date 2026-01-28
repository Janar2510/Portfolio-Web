// Shared TypeScript types across the monorepo

export type Locale = 'en' | 'et';

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = T | ApiError;

export * from './crm';
