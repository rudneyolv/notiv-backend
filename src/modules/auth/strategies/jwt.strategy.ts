import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { JwtPayload } from '../types/jwt.types';
import { Request } from 'express';

// Request customizado para incluir cookies
interface AuthRequest extends Request {
  cookies: {
    access_token?: string;
    [key: string]: string | undefined;
  };
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly usersService: UsersService) {
    const secret = process.env.JWT_SECRET;

    if (!secret || typeof secret !== 'string') {
      throw new InternalServerErrorException(
        'JWT_SECRET está ausente ou inválido. Verifique o arquivo .env.',
      );
    }

    super({
      // dual: tenta pegar do cookie e depois do header
      jwtFromRequest: (req: AuthRequest) => {
        const tokenFromCookie = req.cookies?.access_token;
        if (tokenFromCookie) return tokenFromCookie;

        return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      },
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedException('Você precisa fazer login');
    }
    return user;
  }
}
