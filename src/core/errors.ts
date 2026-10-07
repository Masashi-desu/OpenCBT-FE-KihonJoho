export class DataError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "DataError";
  }
}
