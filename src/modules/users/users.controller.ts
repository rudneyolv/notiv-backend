import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserResponseDto } from './dto/response-user.dto';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('supabase-jwt'))
  @Get()
  async findUsers(): Promise<UserResponseDto[]> {
    const users = await this.usersService.findAll();
    const cleanedUsers = users.map((user) => new UserResponseDto(user));
    return cleanedUsers;
  }

  @UseGuards(AuthGuard('supabase-jwt'))
  @Get('me')
  async getMe(@CurrentUser() user: User): Promise<UserResponseDto> {
    const fetchedUser = await this.usersService.findOneByOrFail({
      id: user.id,
    });
    return new UserResponseDto(fetchedUser);
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

  @UseGuards(AuthGuard('supabase-jwt'))
  @Patch('me')
  async updateProfile(
    @CurrentUser() user: User,
    @Body() data: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const updatedUser = await this.usersService.update(user.id, data);
    return new UserResponseDto(updatedUser);
  }

  @UseGuards(AuthGuard('supabase-jwt'))
  @Patch('me/soft-delete')
  async softDeleteMe(@CurrentUser() user: User) {
    const softDeletedUser = await this.usersService.softDeleteMe(user.id);
    return new UserResponseDto(softDeletedUser);
  }
}
