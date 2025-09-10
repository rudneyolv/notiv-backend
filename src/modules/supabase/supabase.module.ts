import { forwardRef, Module } from '@nestjs/common';
import { SupabaseProvider } from './supabase.provider';
import { SupabaseAdminProvider } from './supabase-admin.provider';
import { SupabaseJwtStrategy } from './strategies/supabase-jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [],
  providers: [SupabaseProvider, SupabaseAdminProvider, SupabaseJwtStrategy],
  exports: [SupabaseProvider, SupabaseAdminProvider],
  imports: [forwardRef(() => UsersModule)],
})
export class SupabaseModule {}
