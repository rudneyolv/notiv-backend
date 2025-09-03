import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { SupabaseJwtPayload } from '../types/jwt.types';
import { Request } from 'express';

// Request customizado para incluir cookies
interface AuthRequest extends Request {
  cookies: {
    access_token?: string;
    [key: string]: string | undefined;
  };
}

//TODO: Alterar para usar decorator de CurrentUser()
@Injectable()
export class SupabaseJwtStrategy extends PassportStrategy(
  Strategy,
  'supabase-jwt',
) {
  constructor(private readonly usersService: UsersService) {
    const supabaseSecret = process.env.SUPABASE_JWT_SECRET;

    if (!supabaseSecret) {
      throw new InternalServerErrorException(
        'SUPABASE_JWT_SECRET está ausente. Configure no .env',
      );
    }

    super({
      jwtFromRequest: (req: AuthRequest) => {
        return (
          req.cookies?.access_token ||
          ExtractJwt.fromAuthHeaderAsBearerToken()(req)
        );
      },
      ignoreExpiration: false,
      secretOrKey: supabaseSecret,
    });
  }

  async validate(payload: SupabaseJwtPayload) {
    const user = await this.usersService.findOneByOrFail({
      supabaseId: payload.sub,
    });

    return user;
  }
}
