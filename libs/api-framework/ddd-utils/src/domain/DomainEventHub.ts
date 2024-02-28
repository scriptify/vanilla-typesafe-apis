import { deepCloneEntity, Entity } from './Entity';

type HasPrototype<T> = T extends { prototype: any } ? T : never;
type HasTypeProperty<T> = T extends { type: any } ? T : never;
type HasPayloadProperty<T> = T extends { payload: any } ? T : never;

type AllClassTypes<Exports> = Extract<Exports[keyof Exports], { type: 'Entity' }>;

type AllClassInstanceTypes<Exports> = HasPrototype<AllClassTypes<Exports>>['prototype'];
type AllDomainEventsWithVoid<Exports> = Parameters<AllClassInstanceTypes<Exports>['emit']>[0];
type AllDomainEvents<Exports> = Exclude<AllDomainEventsWithVoid<Exports>, void>;
type AllDomainEventTypes<Exports> = HasTypeProperty<AllDomainEvents<Exports>>['type'];

type FindEntityByDomainEvent<Exports, EvType extends AllDomainEventTypes<Exports>> = Extract<
  AllClassInstanceTypes<Exports>,
  {
    emit: (event: Extract<AllDomainEvents<Exports>, { type: EvType }>) => void;
  }
>;

type ListenerFn<Exports, EvType extends AllDomainEventTypes<Exports>> = (
  entity: FindEntityByDomainEvent<Exports, EvType>,
  payload: EvPayload<Exports, EvType>
) => void;

type EvPayload<Exports, EvType extends AllDomainEventTypes<Exports>> = HasPayloadProperty<
  Extract<AllDomainEvents<Exports>, { type: EvType }>
>['payload'];

type EvQueue<Exports> = {
  type: AllDomainEventTypes<Exports>;
  parameters: Parameters<ListenerFn<Exports, AllDomainEventTypes<Exports>>>;
}[];

export class DomainEventHub<Exports> {
  private listeners = new Map<
    AllDomainEventTypes<Exports>,
    Set<ListenerFn<Exports, AllDomainEventTypes<Exports>>>
  >();
  private eventQueue: EvQueue<Exports> = [];

  private constructor() {
    // Set up all entity listeners
    Entity.on((event, entity) => {
      if (event) {
        const eventType = event.type as AllDomainEventTypes<Exports>;
        const entityWithType = entity as FindEntityByDomainEvent<Exports, typeof eventType>;
        const payloadWithType = event.payload as EvPayload<Exports, typeof eventType>;
        this.emit(eventType, entityWithType, payloadWithType);
      }
    });
  }

  public static create<Exports>() {
    return new DomainEventHub<Exports>();
  }

  public getListeners() {
    return this.listeners;
  }

  public on<EvType extends AllDomainEventTypes<Exports>>(
    eventType: EvType,
    listener: ListenerFn<Exports, EvType>
  ) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    const listenerSet = this.listeners.get(eventType);

    if (listenerSet) {
      listenerSet.add(listener);
    }
  }

  public off<EvType extends AllDomainEventTypes<Exports>>(
    eventType: EvType,
    listener: ListenerFn<Exports, EvType>
  ) {
    if (!this.listeners.has(eventType)) {
      return;
    }

    const listenerSet = this.listeners.get(eventType);

    if (listenerSet) {
      listenerSet.delete(listener);
    }
  }

  private emit<EvType extends AllDomainEventTypes<Exports>>(
    eventType: EvType,
    entity: FindEntityByDomainEvent<Exports, EvType>,
    payload: EvPayload<Exports, EvType>
  ) {
    const clonedEntity = deepCloneEntity(entity);
    this.eventQueue.push({
      type: eventType,
      parameters: [clonedEntity, payload],
    });
  }

  /**
   * Flushes all domain events that have been emitted during the current
   * lifecycle of the application.
   */
  public async flushAllDomainEvents() {
    for (const event of this.eventQueue) {
      const listenerSet = this.listeners.get(event.type);

      if (listenerSet) {
        const allListenerResults = [...listenerSet].map((listener) => {
          return listener(...event.parameters);
        });

        await Promise.all(allListenerResults);
      }
    }

    this.eventQueue = [];
  }
}
