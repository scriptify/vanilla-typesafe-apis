import Ajv, { JSONSchemaType } from 'ajv';
const ajv = new Ajv();

export type TJsonSchema<TData = any> = JSONSchemaType<TData>;

export function validateJsonSchema<DataType>(data: unknown, jsonSchema: any): data is DataType {
  const validate = ajv.compile(jsonSchema);
  const valid = validate(data);
  if (!valid) {
    console.error(validate.errors);
  }
  return valid;
}
