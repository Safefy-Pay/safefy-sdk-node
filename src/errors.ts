export class SafefyApiError extends Error {
  public readonly status: number;
  public readonly code: string | undefined;
  public readonly details: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = "SafefyApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
