export class SitesError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'SitesError';
    }
}

export class ValidationError extends SitesError {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export class NotFoundError extends SitesError {
    constructor(message: string) {
        super(message);
        this.name = 'NotFoundError';
    }
}

export class ConflictError extends SitesError {
    constructor(message: string) {
        super(message);
        this.name = 'ConflictError';
    }
}
