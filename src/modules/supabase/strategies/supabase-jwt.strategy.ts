// src/modules/auth/strategies/supabase-jwt.strategy.ts

import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt'; // <-- Apenas as ferramentas padrão são necessárias
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { SupabaseJwtPayload } from '../types/jwt.types';
import { User } from 'src/modules/users/entities/user.entity';

@Injectable()
export class SupabaseJwtStrategy extends PassportStrategy(
  Strategy,
  'supabase-jwt',
) {
  constructor(private readonly usersService: UsersService) {
    const supabaseSecret = process.env.SUPABASE_JWT_SECRET;

    if (!supabaseSecret) {
      throw new InternalServerErrorException(
        'A variável de ambiente SUPABASE_JWT_SECRET precisa ser configurada.',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration: false,
      secretOrKey: supabaseSecret,
    });
  }

  async validate(payload: SupabaseJwtPayload): Promise<User> {
    const user = await this.usersService.findOneByOrFail({
      supabaseId: payload.sub,
    });

    return user;
  }
}
