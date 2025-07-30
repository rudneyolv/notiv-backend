import { Provider } from '@nestjs/common';
import { HashService } from './hash.service';
import { HASH_TOKEN } from './hash.token';

export const HashProvider: Provider = {
  provide: HASH_TOKEN, // nome pelo qual a injeção vai acontecer
  useClass: HashService, // classe concreta a ser instanciada
};
