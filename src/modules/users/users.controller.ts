import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthenticatedRequest } from '../auth/types/authenticated-request.types';
import { UserResponseDto } from './dto/response-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() data: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.usersService.create(data);
    return new UserResponseDto(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findUsers(@Req() req: AuthenticatedRequest) {
    return req.user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('me')
  async updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() data: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.update(req.user.id, data);
    return new UserResponseDto(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/me/password')
  async updatePassword(
    @Req() req: AuthenticatedRequest,
    @Body() data: UpdatePasswordDto,
  ) {
    const user = await this.usersService.updatePassword(req.user.id, data);
    return new UserResponseDto(user);
  }
}
