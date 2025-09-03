import slugify from 'slugify';
import { Injectable } from '@nestjs/common';
import { SlugifyInterface } from './slugify.interface';

@Injectable()
export class SlugifyService implements SlugifyInterface {
  generate(text: string) {
    return slugify(text, { lower: true, strict: true });
  }
}
