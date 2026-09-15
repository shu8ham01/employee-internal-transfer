/**
 * Shared Application Domain Errors
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: string[];

  constructor(message: string, statusCode: number = 500, details?: string[]) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict: an active transfer is already in progress') {
    super(message, 409);
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message: string = 'Unprocessable Entity: proposed department/role cannot match current') {
    super(message, 422);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: string[]) {
    super(message, 400, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized: valid token required') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden: insufficient privileges') {
    super(message, 403);
  }
}
