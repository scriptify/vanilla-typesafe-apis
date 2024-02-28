import { Identifier } from './Identifier';
import { v4 } from 'uuid';

export class UniqueEntityID extends Identifier {
  public IDENTIFIER_TYPE = 'UniqueEntityID';
  constructor(id?: string) {
    super(id ? id : v4());
  }
}
