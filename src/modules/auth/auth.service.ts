import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/create-auth.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginResponse } from './types/auth-response.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_TOKEN } from '../supabase/supabase.provider';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(SUPABASE_TOKEN) private readonly supabase: SupabaseClient,
  ) {}

  async login(data: LoginDto): Promise<LoginResponse> {
    const { email, password } = data;
    const user = await this.userService.findByEmail(email);

    if (!user) throw new UnauthorizedException('Usuário ou senha inválidos');

    const { data: supabaseData, error } =
      await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error || !supabaseData.session) {
      throw new UnauthorizedException(
        error?.message || 'Erro desconhecido ao autenticar.',
      );
    }

    return {
      accessToken: supabaseData.session.access_token,
      refreshToken: supabaseData.session.refresh_token,
      user: user,
    };
  }
}
