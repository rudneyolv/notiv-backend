import { InternalServerErrorException, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { CommonModule } from '../common/common.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { SupabaseModule } from '../supabase/supabase.module';
import { SupabaseJwtStrategy } from './strategies/supabase-jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, SupabaseJwtStrategy],
  imports: [
    PassportModule,
    UsersModule,
    CommonModule,
    SupabaseModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');

        if (!secret || typeof secret !== 'string') {
          throw new InternalServerErrorException(
            'JWT_SECRET está ausente ou inválido. Verifique o arquivo .env.',
          );
        }

        return {
          secret,
          signOptions: {
            expiresIn: config.get('JWT_EXPIRATION'),
          },
        };
      },
    }),
  ],
})
export class AuthModule {}
