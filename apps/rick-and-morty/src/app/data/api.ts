import { ControllerExecutionResult, IController } from '@local/api-utils';

const API_URI = 'http://localhost:3333';

type ApiRequestOptions =
  | ({
      queryParameters?: Record<string, string>;
    } & RequestInit)
  | undefined;

function cleanQueryParameters(queryParameters?: Record<string, string>) {
  if (!queryParameters) {
    return undefined;
  }

  const cleanedQueryParameters: Record<string, string> = Object.entries(
    queryParameters
  ).reduce((acc, [key, value]) => {
    if (value) {
      return {
        ...acc,
        [key]: value,
      };
    }

    return acc;
  }, {});

  return cleanedQueryParameters;
}

export async function apiRequest<TController extends IController>(
  endpoint: string,
  options?: ApiRequestOptions
) {
  const { queryParameters, ...fetchOpts } = options || {};

  const response = await fetch(
    `${API_URI}${endpoint}${
      queryParameters
        ? `?${new URLSearchParams(cleanQueryParameters(queryParameters))}`
        : ''
    }`,
    {
      ...fetchOpts,
      headers: {
        ...(fetchOpts.headers || {}),
      },
    }
  );

  const reqBody =
    (await response.json()) as ControllerExecutionResult<TController>;

  if (reqBody.type !== 'success') {
    switch (reqBody.type) {
      // TODO: Advanced error handling will be handled in the future, it's too complex for this simple example now
      case 'domain_error':
      case 'use_case_error':
      case 'controller_error':
      default:
        throw new Error('Unexpected error');
    }
  }

  if (!response.ok) {
    throw new Error('Unexpected error');
  }

  // Force success type, because we already checked it above;
  // an error would have been thrown otherwise
  type SuccessBody = Extract<
    ControllerExecutionResult<TController>,
    { type: 'success' }
  >;

  return reqBody as SuccessBody;
}
