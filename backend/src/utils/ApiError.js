class ApiError extends Error {
    constructor(statusCode, message = "Something went wrong", errors = [], stack = "") {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.errors = errors;
        this.success = false;

         Object.defineProperty(this, "message", {
            value: message,
            enumerable: true,
            writable: true,
            configurable: true
        });
        
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
        this.log();
    }

    log() {
        console.error(`Status Code:${this.statusCode}\n${this.stack}\n`);
        if (this.errors.length > 0) {
            console.error('Additional errors:', this.errors);
        }
    }
}

export {ApiError}