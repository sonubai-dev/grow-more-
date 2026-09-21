/**
 * Standardized Application & API Error Architecture
 * Ensures consistent HTTP status codes, structured error classifications,
 * field-level validation, and sanitized user-facing messages.
 */

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'DATABASE_ERROR'
  | 'NETWORK_ERROR'
  | 'INTERNAL_ERROR';

export interface FieldValidationError {
  field: string;
  message: string;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly userMessage: string;
  public readonly validationErrors?: FieldValidationError[];

  constructor(
    message: string,
    statusCode: number = 500,
    code: ErrorCode = 'INTERNAL_ERROR',
    validationErrors?: FieldValidationError[]
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.userMessage = message;
    this.validationErrors = validationErrors;

    // Maintains proper stack trace for where error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

/**
 * Maps unknown errors into structured AppErrors with user-friendly sanitized messages.
 * Prevents internal database paths, credentials, and stack traces from leaking to clients.
 */
export function toAppError(error: unknown, fallbackMessage = 'An unexpected error occurred.'): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error && typeof error === 'object') {
    const errObj = error as { code?: string; message?: string; status?: number };
    const errCode = errObj.code || '';
    const rawMessage = errObj.message || '';

    // Firestore permission denied
    if (errCode === 'permission-denied' || rawMessage.includes('permission-denied') || rawMessage.includes('Missing or insufficient permissions')) {
      return new AppError(
        'Unable to load your data right now. Please try again.',
        403,
        'FORBIDDEN'
      );
    }

    // Firestore unauthenticated
    if (errCode === 'unauthenticated' || rawMessage.includes('unauthenticated')) {
      return new AppError(
        'Authentication Required: Please sign in to continue.',
        401,
        'UNAUTHORIZED'
      );
    }

    // Resource not found
    if (errCode === 'not-found' || rawMessage.includes('not-found')) {
      return new AppError(
        'The requested resource was not found.',
        404,
        'NOT_FOUND'
      );
    }

    // Network / offline
    if (
      errCode === 'unavailable' ||
      rawMessage.includes('client is offline') ||
      rawMessage.includes('network-request-failed') ||
      rawMessage.includes('Failed to fetch')
    ) {
      return new AppError(
        'Network Connection Error: Please check your internet connection and try again.',
        503,
        'NETWORK_ERROR'
      );
    }

    // Already exists / conflict
    if (errCode === 'already-exists') {
      return new AppError(
        'A record with this identifier already exists.',
        409,
        'CONFLICT'
      );
    }

    // Clean standard Error
    if (rawMessage) {
      // If error is a JSON string from legacy handler, extract user-facing portion safely
      try {
        const parsed = JSON.parse(rawMessage);
        if (parsed.error && typeof parsed.error === 'string') {
          return new AppError(parsed.error, errObj.status || 400, 'DATABASE_ERROR');
        }
      } catch {
        // Raw string message - sanitize if it looks like an internal path
        if (!rawMessage.includes('projects/') && !rawMessage.includes('databases/')) {
          return new AppError(rawMessage, errObj.status || 500, 'INTERNAL_ERROR');
        }
      }
    }
  }

  return new AppError(fallbackMessage, 500, 'INTERNAL_ERROR');
}

// -------------------------------------------------------------
// Input Validation & Sanitization Helpers
// -------------------------------------------------------------

export function sanitizeString(val: unknown, maxLength = 500): string {
  if (typeof val !== 'string') return '';
  const stripped = val.replace(/<[^>]*>/g, '');
  return stripped.trim().slice(0, maxLength);
}

export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailRegex.test(email.trim()) && email.length <= 150;
}

export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  // Allows international (+), digits, spaces, dashes, parentheses
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,20}$/;
  return phoneRegex.test(phone.trim());
}

export function validateUrl(urlString: string): boolean {
  if (!urlString || typeof urlString !== 'string') return false;
  try {
    const parsed = new URL(urlString.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateRating(rating: unknown): 1 | 2 | 3 | 4 | 5 {
  const num = Number(rating);
  if (Number.isInteger(num) && num >= 1 && num <= 5) {
    return num as 1 | 2 | 3 | 4 | 5;
  }
  throw new AppError(
    'Validation Error: Star rating must be an integer between 1 and 5.',
    400,
    'VALIDATION_ERROR',
    [{ field: 'rating', message: 'Rating must be an integer between 1 and 5.' }]
  );
}

export function validateSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') return false;
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length >= 2 && slug.length <= 100;
}
