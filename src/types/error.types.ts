// types/error.types.ts
export class CustomError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends CustomError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class AuthenticationError extends CustomError {
  constructor(message: string = "Authentication failed") {
    super(message, 401);
  }
}

export class AuthorizationError extends CustomError {
  constructor(message: string = "Access denied") {
    super(message, 403);
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
  }
}

export class RateLimitError extends CustomError {
  constructor(message: string = "Too many requests") {
    super(message, 429);
  }
}

export class ServerError extends CustomError {
  constructor(message: string = "Internal server error") {
    super(message, 500);
  }
}
