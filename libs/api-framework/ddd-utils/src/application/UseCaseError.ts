import { DomainError } from '../domain/DomainError';

interface UseCaseErrorProps {
  message: string;
  errorCode: number | string;
  domainErrors?: DomainError[];
}

export class UseCaseError extends Error implements UseCaseErrorProps {
  public override message: string;
  public readonly domainErrors: DomainError[];
  public readonly errorCode: number | string;

  constructor({ errorCode, message, domainErrors = [] }: UseCaseErrorProps) {
    super(message);
    this.message = message;
    this.errorCode = errorCode;
    this.domainErrors = domainErrors;
  }
}
