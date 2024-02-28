import { Infrastructure } from '@local/api-utils';
import reqJsonSchema from './GetCharacter.request.schema.json';
import { getAllRickAndMortyCharacters } from './data';

export type GetCharacterQueryParameters = {
  filter?: string;
  /**
   * @minimum 1
   * @maximum 20
   * @default 20
   * @type integer
   * @description The number of items to retrieve per page
   */
  pageSize?: string;
  /**
   * @minimum 1
   * @default 1
   * @type integer
   * @description The page number to retrieve
   */
  pageNumber?: string;
};

type Character = {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  image: string;
  location: {
    name: string;
  };
};

export type GetCharacterResponse = {
  page: number;
  count: number;
  pages: number;
  results: Character[];
} & Infrastructure.BaseControllerResponse;

export class GetCharacterController
  extends Infrastructure.ControllerWithQueryParametersValidator<GetCharacterQueryParameters>
  implements
    Infrastructure.IController<
      GetCharacterQueryParameters,
      unknown,
      GetCharacterResponse
    >
{
  constructor() {
    super({
      inputSchema: reqJsonSchema as unknown as Infrastructure.TJsonSchema,
    });
  }

  public async execute({
    queryParameters,
  }: Infrastructure.ControllerExecutionParameters): Promise<
    Infrastructure.ControllerResponse<GetCharacterResponse>
  > {
    this.validateQueryParameters(queryParameters);

    const { filter, pageSize, pageNumber } = queryParameters;

    const allCharacters = await getAllRickAndMortyCharacters();

    const filteredCharacters = filter
      ? allCharacters.filter((c) => c.name.includes(filter))
      : allCharacters;

    const page = pageNumber ? parseInt(pageNumber, 10) : 1;

    const size = pageSize ? parseInt(pageSize, 10) : 20;

    const start = (page - 1) * size;

    const end = start + size;

    const characters = filteredCharacters.slice(start, end);

    return {
      statusCode: 200,
      body: {
        page,
        count: characters.length,
        pages: Math.ceil(filteredCharacters.length / size),
        results: characters,
        type: 'success',
      },
    };
  }
}
