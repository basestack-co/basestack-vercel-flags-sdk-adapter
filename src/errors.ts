export type BasestackAdapterErrorOptions = {
  status?: number;
  responseBody?: unknown;
  cause?: unknown;
};

export class BasestackAdapterError extends Error {
  readonly status?: number;
  readonly responseBody?: unknown;

  constructor(message: string, options: BasestackAdapterErrorOptions = {}) {
    super(message);
    this.name = "BasestackAdapterError";
    this.status = options.status;
    this.responseBody = options.responseBody;

    if (options.cause !== undefined) {
      this.cause = options.cause;
    }

    Error.captureStackTrace?.(this, BasestackAdapterError);
  }
}

export const isBasestackAdapterError = (
  error: unknown
): error is BasestackAdapterError => error instanceof BasestackAdapterError;
