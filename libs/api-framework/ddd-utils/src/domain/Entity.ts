import { UniqueEntityID } from './UniqueEntityID';

function isEntity<T = unknown>(v: unknown): v is Entity<T> {
  return v instanceof Entity;
}
/**
 * Deep copy function for TypeScript.
 * @param T Generic type of target/copied value.
 * @param target Target value to be copied.
 * @see Source project, ts-deepcopy https://github.com/ykdr2017/ts-deepcopy
 * @see Code pen https://codepen.io/erikvullings/pen/ejyBYg
 */
export const deepCopy = <T>(target: T): T => {
  if (target === null) {
    return target;
  }
  if (target instanceof Date) {
    return new Date(target.getTime()) as any;
  }
  if (target instanceof Array) {
    const cp = [] as any[];
    (target as any[]).forEach((v) => {
      cp.push(v);
    });
    return cp.map((n: any) => deepCopy<any>(n)) as any;
  }

  const constructor = (target as any)?.constructor;

  if (constructor?.name !== 'Object') {
    // Preserve custom class instances
    return target;
  }

  if (typeof target === 'object') {
    const cp = { ...(target as { [key: string]: any }) } as { [key: string]: any };
    Object.keys(cp).forEach((k) => {
      cp[k] = deepCopy<any>(cp[k]);
    });
    return cp as T;
  }
  return target;
};

export function deepCloneEntity<TEntity extends Entity<unknown, any>>(entity: TEntity): TEntity {
  const clonedProps = typeof entity.props === 'object' ? deepCopy(entity.props) : entity.props;

  const cloned = new (entity.constructor as any)(clonedProps, entity.id);
  return cloned;
}

export interface DomainEvent<EvType extends string = string, Payload extends object = object> {
  type: EvType;
  payload: Payload;
}

const isVoid = <T>(v: T | void): v is void => v === undefined;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GlobalListenerFn = (event: DomainEvent, entity: Entity<unknown, any>) => void;

export abstract class Entity<T, TDomainEvent extends DomainEvent | void = void> {
  public static readonly type = 'Entity';
  public readonly id: UniqueEntityID;
  public readonly props: T;

  private static eventListeners: GlobalListenerFn[] = [];

  public constructor(props: T, id?: UniqueEntityID) {
    this.id = id ? id : new UniqueEntityID();
    this.props = props;
  }

  public equals(object?: Entity<T, TDomainEvent>): boolean {
    if (object == null || object == undefined) {
      return false;
    }

    if (this === object) {
      return true;
    }

    if (!isEntity(object)) {
      return false;
    }

    return this.id.equals(object.id);
  }

  public emit(event: TDomainEvent): void {
    if (isVoid(event)) {
      return;
    }
    Entity.eventListeners.forEach((listener) => listener(event, this));
  }

  public static on(listener: GlobalListenerFn): void {
    Entity.eventListeners.push(listener);
  }

  public static off(listener: GlobalListenerFn): void {
    Entity.eventListeners = Entity.eventListeners.filter((l) => l !== listener);
  }
}
