export interface ControllerErrorProps {
  message: string;
  statusCode: number;
}

export class ControllerError extends Error implements ControllerErrorProps {
  public override message: string;
  public readonly statusCode: number;

  constructor({ statusCode, message }: ControllerErrorProps) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
  }
}

export enum CONTROLLER_ERROR_CODE {
  NOT_FOUND_ERROR = 404,
  UNAUTHORIZED_ERROR = 401,
  BAD_REQUEST_ERROR = 400,
}

export class HttpNotFoundError extends ControllerError {
  public constructor(msg?: string) {
    super({
      message: msg ?? 'This resource was not found.',
      statusCode: CONTROLLER_ERROR_CODE.NOT_FOUND_ERROR,
    });
    // console.warn(`[ControllerError ${this.errorCode}]: ${this.message}`);
  }
}

export class HttpUnauthorizedError extends ControllerError {
  public constructor(message?: string) {
    super({
      message: `You are not authorized to access this resource.${message ? ` (${message})` : ''}`,
      statusCode: CONTROLLER_ERROR_CODE.UNAUTHORIZED_ERROR,
    });
    // console.warn(`[ControllerError ${this.errorCode}]: ${this.message}`);
  }
}

export class HttpBadRequestError extends ControllerError {
  public constructor(missingFields: string[] = []) {
    super({
      message: `Missing required fields (${missingFields.join(', ')})`,
      statusCode: CONTROLLER_ERROR_CODE.BAD_REQUEST_ERROR,
    });
    // console.warn(`[ControllerError ${this.errorCode}]: ${this.message}`);
  }
}
