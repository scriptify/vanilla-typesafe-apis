import { DomainError } from '../domain';
import { UnexpectedUseCaseError, UseCaseDomainErrors } from './UseCaseErrorsCollection';

export abstract class AbstractUseCase<Params, ResultType> {
  protected abstract executeImpl(params: Params): Promise<ResultType> | ResultType;

  public execute(params: Params) {
    try {
      return this.executeImpl(params);
    } catch (e) {
      if (e instanceof DomainError) {
        throw new UseCaseDomainErrors([e as DomainError]);
      }

      throw new UnexpectedUseCaseError(e);
    }
  }
}
