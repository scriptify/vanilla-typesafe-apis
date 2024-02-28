export interface DomainErrorProps {
  message: string;
  errorCode: number | string;
}

export class DomainError extends Error implements DomainErrorProps {
  public override message: string;
  public readonly errorCode: number | string;

  constructor({ errorCode, message }: DomainErrorProps) {
    super(message);
    this.message = message;
    this.errorCode = errorCode;
  }
}
