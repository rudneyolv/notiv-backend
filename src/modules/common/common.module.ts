import { Module } from '@nestjs/common';
import { HashProvider } from 'src/common/hash/hash.provider';
import { SlugifyProvider } from 'src/common/slugify/slugify.provider';

@Module({
  providers: [HashProvider, SlugifyProvider],
  exports: [HashProvider, SlugifyProvider],
})
export class CommonModule {}
