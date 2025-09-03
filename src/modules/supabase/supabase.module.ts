import { Module } from '@nestjs/common';
import { SupabaseProvider } from './supabase.provider';

@Module({
  controllers: [],
  providers: [SupabaseProvider],
  imports: [],
  exports: [SupabaseProvider],
})
export class SupabaseModule {}
