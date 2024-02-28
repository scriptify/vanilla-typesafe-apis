import { Entity, UniqueEntityID } from '../domain';

export type MapEntityToDto<
  T,
  IdRequired extends boolean = false
> = T extends Entity<infer Props, any>
  ? JsonProps<Props, IdRequired> &
      (IdRequired extends true ? { id: string } : { id?: string })
  : T extends Date
  ? string
  : T extends UniqueEntityID
  ? string
  : T extends Array<infer U>
  ? MapEntityToDto<U, IdRequired>[]
  : T extends object
  ? JsonProps<T, IdRequired>
  : T;

type JsonProps<T, IdRequired extends boolean = false> = {
  [K in keyof T]: MapEntityToDto<T[K], IdRequired>;
};
