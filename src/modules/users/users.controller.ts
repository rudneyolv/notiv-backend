import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  BadRequestException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthenticatedRequest } from '../auth/types/authenticated-request.types';
import { UserResponseDto } from './dto/response-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { validate as isUUID } from 'uuid';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findUsers(): Promise<UserResponseDto[]> {
    const users = await this.usersService.findAll();
    const cleanedUsers = users.map((user) => new UserResponseDto(user));
    return cleanedUsers;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getMe(@Req() req: AuthenticatedRequest): Promise<UserResponseDto> {
    const user = await this.usersService.findOneByOrFail({ id: req.user.id });
    return new UserResponseDto(user);
  }

  @Get('/:id')
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.findOneByOrFail({ id });
    return new UserResponseDto(user);
  }

  @Post()
  async create(@Body() data: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.usersService.create(data);
    return new UserResponseDto(user);
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

  @UseGuards(AuthGuard('jwt'))
  @Patch('me/soft-delete')
  async softDeleteMe(@Req() req: AuthenticatedRequest) {
    const user = await this.usersService.softDeleteMe(req.user.id);
    return new UserResponseDto(user);
  }
}
