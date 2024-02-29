import { NotFoundError } from '../adapter';
import { UseCaseNotAuthorizedError } from '../application';
import { HttpUnauthorizedError } from './ControllerError';
import { extractLanguageFromHeaders, handleControllerError } from './ControllerUtils';
import { useCaseErrorToResponse } from './IController';

describe('ControllerUtils', () => {
  it('should extract the correct language from the HTTP headers', () => {
    const headers = {
      'accept-language': 'de-CH,en;q=0.9,de;q=0.8,fr;q=0.7,es;q=0.6',
    };

    const language = extractLanguageFromHeaders(headers);

    expect(language).toEqual('de');
  });

  it('should extract the correct language from the HTTP headers (unusual language format)', () => {
    const headers = {
      'accept-language': 'it,en;q=0.9,de;q=0.8,fr;q=0.7,es;q=0.6',
    };

    const language = extractLanguageFromHeaders(headers);

    expect(language).toEqual('it');
  });

  it('should default to English if the language is not supported', () => {
    const headers = {
      'Accept-Language': 'xx-XX',
    };

    const language = extractLanguageFromHeaders(headers);

    expect(language).toEqual('en');
  });

  it('should correctly map an authorization error to a HTTP 401', () => {
    const error = new UseCaseNotAuthorizedError();

    const response = useCaseErrorToResponse(error);

    expect(response.statusCode).toEqual(401);
  });

  it('should correctly map an adapter resource not found error to 404', () => {
    const error = new NotFoundError();

    const response = handleControllerError(error);

    expect(response.statusCode).toEqual(404);
  });

  it('should correctly map a controller error', () => {
    const error = new HttpUnauthorizedError();

    const response = handleControllerError(error);

    expect(response.statusCode).toEqual(401);
  });
});
