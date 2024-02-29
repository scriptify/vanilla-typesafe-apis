export interface AdapterErrorProps {
  message: string;
  errorCode: number | string;
}

export class AdapterError extends Error implements AdapterErrorProps {
  public override message: string;
  public readonly errorCode: number | string;

  constructor({ errorCode, message }: AdapterErrorProps) {
    super(message);
    this.message = message;
    this.errorCode = errorCode;
  }
}
