/* eslint-disable @typescript-eslint/no-var-requires */
import * as path from 'path';
import execute from '../generate-controller-schema';
jest.setTimeout(20000);

describe('generate-api-json-schemas', () => {
  it('should generate the correct schema from complex types', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error');

    await execute('api-framework-schema-generator', path.resolve('.'));

    expect(consoleErrorSpy).not.toHaveBeenCalled();

    const fixturesFolder = path.resolve(__dirname, '__fixtures__');

    const reqSchema = require(path.join(fixturesFolder, 'Fake.request.schema.json'));

    expect(reqSchema).toMatchSnapshot();
  });
});
