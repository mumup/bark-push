export class BarkError extends Error {
  readonly status: number;
  readonly response: unknown;

  constructor(message: string, status: number, response?: unknown) {
    super(message);
    this.name = 'BarkError';
    this.status = status;
    this.response = response;
  }
}
