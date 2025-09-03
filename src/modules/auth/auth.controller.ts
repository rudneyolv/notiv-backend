import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/create-auth.dto';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedRequest } from './types/authenticated-request.types';
import { UserResponseDto } from '../users/dto/response-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @UseGuards(AuthGuard('supabase-jwt'))
  @Get('validate-session')
  validateSession(@Req() req: AuthenticatedRequest) {
    return { logged: !!req.user };
  }

  @Post('login')
  async login(
    @Body() data: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const loginData = await this.authService.login(data);

    res.cookie('access_token', loginData.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 604_800_000, // 7d
      path: '/',
    });

    return new UserResponseDto(loginData.user);
  }
}
