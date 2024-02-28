// eslint-disable-next-line @nx/enforce-module-boundaries
import type { GetCharacterController } from '@local/rnm-api';
import {
  ControllerExecutionSuccessResult,
  ControllerQueryParameters,
} from '@local/api-utils';
import { apiRequest } from './api';
import { useQuery } from '@tanstack/react-query';

export type GetCharacterParams =
  ControllerQueryParameters<GetCharacterController>;
export type GetCharacterResponse =
  ControllerExecutionSuccessResult<GetCharacterController>;

function getCharacterQuery(params: GetCharacterParams) {
  return apiRequest<GetCharacterController>('/character', {
    method: 'GET',
    queryParameters: params,
  });
}

export function useGetCharacters(params: GetCharacterParams) {
  return useQuery<GetCharacterResponse>({
    queryKey: ['character', params],
    queryFn: () => getCharacterQuery(params),
  });
}
