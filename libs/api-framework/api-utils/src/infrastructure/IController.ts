import { ADAPTER_ERROR_CODE, AdapterError } from '../adapter';
import { USE_CASE_ERROR_CODE, UseCaseError } from '../application';
import { ControllerError } from './ControllerError';

export type ControllerExecutionParameters<TOptions = void> = {
  queryParameters?: Record<string, unknown> | null;
  body?: Record<string, unknown> | null;
  httpHeaders?: Record<string, string | undefined> | null;
} & (TOptions extends void ? { options?: never } : { options: TOptions });

export interface IController<
  TQueryParameters = any,
  TBody = any,
  TResponseBody extends BaseControllerResponse = BaseControllerResponse,
  TControllerOptions = any
> {
  execute: (
    params: ControllerExecutionParameters<TControllerOptions>
  ) => Promise<ControllerResponse<TResponseBody>>;
  validateQueryParameters?: (
    queryParameters: unknown
  ) => asserts queryParameters is TQueryParameters;
  validateBody?: (body: unknown) => asserts body is TBody;
  validateResponse?: (res: unknown) => asserts res is TResponseBody;
}

export interface ControllerErrorResponse {
  errors: HttpControllerError[];
  type: 'domain_error' | 'use_case_error' | 'controller_error' | 'adapter_error';
}

export interface BaseControllerResponse {
  type: 'success';
}
export interface HttpControllerError {
  code: string | number;
  message: string;
}

export interface ControllerResponse<
  TResponseBody extends BaseControllerResponse = BaseControllerResponse
> {
  statusCode: number;
  body: TResponseBody | ControllerErrorResponse;
}

function mapUseCaseErrorToHttpCode(error: UseCaseError): number {
  if (error.errorCode === USE_CASE_ERROR_CODE.NOT_AUTHORIZED) {
    return 401;
  }

  if (error.errorCode === USE_CASE_ERROR_CODE.INVALID_INPUT) {
    return 400;
  }

  if (error.errorCode === USE_CASE_ERROR_CODE.NOT_FOUND) {
    return 404;
  }

  if (error.domainErrors.length > 0) {
    return 400;
  }

  return 400;
}

function mapAdapterErrorToHttpCode(error: AdapterError): number {
  if (error.errorCode === ADAPTER_ERROR_CODE.NOT_FOUND_ERROR) {
    return 404;
  }

  return 400;
}

export function adapterErrorToResponse<TResponseBody extends BaseControllerResponse>(
  error: AdapterError
): ControllerResponse<TResponseBody> {
  const statusCode = mapAdapterErrorToHttpCode(error);

  return {
    statusCode,
    body: {
      errors: [
        {
          code: error.errorCode,
          message: error.message,
        },
      ],
      type: 'adapter_error',
    },
  };
}

export function useCaseErrorToResponse<TResponseBody extends BaseControllerResponse>(
  error: UseCaseError
): ControllerResponse<TResponseBody> {
  const statusCode = mapUseCaseErrorToHttpCode(error);

  if (error.domainErrors.length > 0) {
    return {
      statusCode,
      body: {
        errors: error.domainErrors.map((domainError) => ({
          code: domainError.errorCode,
          message: domainError.message,
        })),
        type: 'domain_error',
      },
    };
  }

  return {
    statusCode,
    body: {
      errors: [
        {
          code: error.errorCode,
          message: error.message,
        },
      ],
      type: 'use_case_error',
    },
  };
}

export function controllerErrorToResponse<TResponseBody extends BaseControllerResponse>(
  error: ControllerError
): ControllerResponse<TResponseBody> {
  return {
    statusCode: error.statusCode,
    body: {
      errors: [
        {
          code: error.statusCode,
          message: error.message,
        },
      ],
      type: 'controller_error',
    },
  };
}
