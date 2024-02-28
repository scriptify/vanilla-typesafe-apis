import { DomainError } from '../domain/DomainError';
import { UseCaseError } from './UseCaseError';

export enum USE_CASE_ERROR_CODE {
  UNEXPECTED_ERROR = 'UNEXPECTED_ERROR',
  DOMAIN_ERROR = 'UNEXPECTED_ERROR',
  NOT_AUTHORIZED = 'NOT_AUTHORIZED',
  INVALID_INPUT = 'INVALID_INPUT',
  NOT_FOUND = 'NOT_FOUND',
}

export class UnexpectedUseCaseError extends UseCaseError {
  public constructor(err: unknown) {
    super({
      message: 'An unexpected error occurred.',
      errorCode: USE_CASE_ERROR_CODE.UNEXPECTED_ERROR,
    });
    console.error(`[AppError ${this.errorCode}]: ${this.message}`, err);
  }
}

export class UseCaseDomainErrors extends UseCaseError {
  public constructor(errors: DomainError[]) {
    super({
      message: 'Domain errors occurred.',
      errorCode: USE_CASE_ERROR_CODE.DOMAIN_ERROR,
      domainErrors: errors,
    });
    console.warn(`[DomainError ${this.errorCode}]: ${this.message}`, errors);
  }
}

export class UseCaseNotAuthorizedError extends UseCaseError {
  public constructor() {
    super({
      message: 'Not authorized.',
      errorCode: USE_CASE_ERROR_CODE.NOT_AUTHORIZED,
    });
  }
}

export class UseCaseInvalidInputError extends UseCaseError {
  public constructor(message?: string) {
    super({
      message: message ?? 'Invalid input.',
      errorCode: USE_CASE_ERROR_CODE.INVALID_INPUT,
    });
  }
}

export class UseCaseNotFoundError extends UseCaseError {
  public constructor() {
    super({
      message: 'Not found.',
      errorCode: USE_CASE_ERROR_CODE.NOT_FOUND,
    });
  }
}
