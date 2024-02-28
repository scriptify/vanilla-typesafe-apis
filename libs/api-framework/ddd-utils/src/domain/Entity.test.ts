import { deepCloneEntity, DomainEvent, Entity } from './Entity';
import { UniqueEntityID } from './UniqueEntityID';

type TestEntityProps = {
  name: string;
  someId?: UniqueEntityID;
};

type TestEntityDomainEvents = DomainEvent<'test_greet', { message: string }>;

class TestEntity extends Entity<TestEntityProps, TestEntityDomainEvents> {
  public static create(props: TestEntityProps, id?: UniqueEntityID) {
    return new TestEntity(props, id);
  }

  public greet(message: string) {
    this.emit({
      type: 'test_greet',
      payload: {
        message: `[${this.props.name}] ${message}`,
      },
    });
  }
}

describe('Entity', () => {
  it('should emit domain events', () => {
    const entity = TestEntity.create({ name: 'Test' });
    const listener = jest.fn();
    TestEntity.on(listener);
    entity.greet('Hello');
    expect(listener).toBeCalledTimes(1);
    expect(listener).toBeCalledWith(
      {
        payload: { message: '[Test] Hello' },
        type: 'test_greet',
      },
      entity
    );
  });

  it('should not emit domain events after unsubscription', () => {
    const entity = TestEntity.create({ name: 'Test' });
    const listener = jest.fn();
    TestEntity.on(listener);
    TestEntity.off(listener);
    entity.greet('Hello');
    expect(listener).toBeCalledTimes(0);
  });

  it('should be able to deep clone an entity', () => {
    const id = new UniqueEntityID();
    const testEntity = TestEntity.create({ name: 'Test', someId: id });
    const clonedEntity = deepCloneEntity(testEntity);
    expect(clonedEntity).not.toBe(testEntity);
    expect(clonedEntity.props).toEqual(testEntity.props);

    expect(clonedEntity.props.someId?.equals(testEntity.props.someId)).toBe(true);
  });
});
