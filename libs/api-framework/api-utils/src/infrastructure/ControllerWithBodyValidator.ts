import { HttpBadRequestError } from './ControllerError';
import { IController } from './IController';
import { TJsonSchema, validateJsonSchema } from './validation';

type IControllerWithBody<TBody> = Required<Pick<IController<unknown, TBody>, 'validateBody'>>;

type ConstructorData = {
  inputSchema: TJsonSchema<any>;
};

export class ControllerWithBodyValidator<TBody> implements IControllerWithBody<TBody> {
  constructor(private schemas: ConstructorData) {}

  public validateBody(body: unknown): asserts body is TBody {
    const isValid = validateJsonSchema<TBody>(body, this.schemas.inputSchema);
    if (!isValid) {
      throw new HttpBadRequestError();
    }
  }
}
