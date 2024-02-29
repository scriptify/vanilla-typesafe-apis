import { AdapterError } from './AdapterError';

export enum ADAPTER_ERROR_CODE {
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
}

export class NotFoundError extends AdapterError {
  public constructor(resourceName?: string) {
    super({
      message: `This resource was not found.${resourceName ? ` (${resourceName})` : ''}`,
      errorCode: ADAPTER_ERROR_CODE.NOT_FOUND_ERROR,
    });

    // console.warn(`[AdapterError ${this.errorCode}]: ${this.message}`);
  }
}
