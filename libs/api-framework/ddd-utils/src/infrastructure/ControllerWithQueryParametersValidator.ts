import { IController } from './IController';
import { TJsonSchema, validateJsonSchema } from './validation';

type IControllerWithQueryParameters<TQueryParameters> = Required<
  Pick<IController<TQueryParameters, unknown>, 'validateQueryParameters'>
>;

type ConstructorData = {
  inputSchema: TJsonSchema<any>;
};

export class ControllerWithQueryParametersValidator<TQueryParameters>
  implements IControllerWithQueryParameters<TQueryParameters>
{
  constructor(private schemas: ConstructorData) {}

  public validateQueryParameters(
    queryParameters: unknown
  ): asserts queryParameters is TQueryParameters {
    const isValid = validateJsonSchema<TQueryParameters>(queryParameters, this.schemas.inputSchema);
    if (!isValid) {
      throw new Error('Query parameters are invalid');
    }
  }
}
