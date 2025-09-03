import { Module } from '@nestjs/common';
import { SlugifyProvider } from 'src/common/utils/slugify/slugify.provider';

@Module({
  providers: [SlugifyProvider],
  exports: [SlugifyProvider],
})
export class CommonModule {}
