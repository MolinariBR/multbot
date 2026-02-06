export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number = 400) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = 'Não autorizado') {
        super(message, 401);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = 'Recurso não encontrado') {
        super(message, 404);
    }
}

export class ConflictError extends AppError {
    constructor(message: string = 'Conflito de dados') {
        super(message, 409);
    }
}

export class ValidationError extends AppError {
    public readonly details: Record<string, string[]>;

    constructor(message: string, details: Record<string, string[]> = {}) {
        super(message, 400);
        this.details = details;
    }
}
