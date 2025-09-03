import { Provider } from '@nestjs/common';
import { SLUGIFY_TOKEN } from './slugify.token';
import { SlugifyService } from './slugify.service';

export const SlugifyProvider: Provider = {
  provide: SLUGIFY_TOKEN,
  useClass: SlugifyService,
};
