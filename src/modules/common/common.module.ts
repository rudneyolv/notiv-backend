import { Module } from '@nestjs/common';
import { HashProvider } from 'src/common/hash/hash.provider';

@Module({
  providers: [HashProvider],
  exports: [HashProvider],
})
export class CommonModule {}
