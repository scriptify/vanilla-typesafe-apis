import { AdapterError } from '../adapter';
import { UseCaseError } from '../application';
import { ControllerError } from './ControllerError';
import {
  adapterErrorToResponse,
  BaseControllerResponse,
  controllerErrorToResponse,
  ControllerResponse,
  useCaseErrorToResponse,
} from './IController';

export function extractBearerToken(
  headers: Record<string, string | undefined> | null | undefined
): string | null {
  if (!headers) {
    return null;
  }

  const authorization = headers.Authorization || headers.authorization;
  if (!authorization) {
    return null;
  }

  const [bearer, token] = authorization.split(' ');
  if (bearer !== 'Bearer') {
    return null;
  }

  return token;
}

export function handleControllerError<TBody extends BaseControllerResponse>(
  err: unknown
): ControllerResponse<TBody> {
  if (err instanceof UseCaseError) {
    return useCaseErrorToResponse(err);
  }

  if (err instanceof AdapterError) {
    return adapterErrorToResponse(err);
  }

  if (err instanceof ControllerError) {
    return controllerErrorToResponse(err);
  }

  console.error('Unexpected controller error: ', err);

  return {
    statusCode: 500,
    body: {
      errors: [
        {
          code: -1,
          message: 'Internal server error',
        },
      ],
      type: 'controller_error',
    },
  };
}
