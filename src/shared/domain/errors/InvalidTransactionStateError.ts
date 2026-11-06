export class InvalidTransactionStateError extends Error {
  constructor(status: string) {
    super(
      `Invalid transaction state: operation not allowed for status "${status}".`,
    );

    this.name = InvalidTransactionStateError.name;
  }
}