import { IController } from './IController';

type GuardedType<T> = T extends (x: unknown) => asserts x is infer T ? T : never;

export type ControllerQueryParameters<TController extends IController> = GuardedType<
  TController['validateQueryParameters']
>;

export type ControllerBodyParameters<TController extends IController> = GuardedType<
  TController['validateBody']
>;

export type ControllerExecutionResult<TController extends IController> = Awaited<
  ReturnType<TController['execute']>
>['body'];

export type ControllerExecutionSuccessResult<TController extends IController> = Extract<
  ControllerExecutionResult<TController>,
  { type: 'success' }
>;
