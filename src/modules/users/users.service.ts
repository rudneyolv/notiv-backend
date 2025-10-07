import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN_TOKEN } from '../supabase/supabase.tokens';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @Inject(SUPABASE_ADMIN_TOKEN)
    private readonly supabaseAdmin: SupabaseClient,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOneBy(data: Partial<User>): Promise<User | null> {
    return this.userRepo.findOneBy(data);
  }

  async findOneByOrFail(data: Partial<User>) {
    const user = await this.userRepo.findOneBy(data);

    if (!user) {
      throw new NotFoundException('O usuário não foi encontrado.');
    }

    return user;
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOneBy({ email });
  }

  async create(data: CreateUserDto): Promise<User> {
    const { name, email, password } = data;
    let createdSupabaseUserId: string | null = null;

    try {
      const exists = await this.userRepo.existsBy({ email });

      if (exists) throw new ConflictException('Este e-mail já existe.');

      const { data: supabaseUser, error: supabaseError } =
        await this.supabaseAdmin.auth.admin.createUser({
          email,
          password,
        });

      if (supabaseError || !supabaseUser.user) {
        throw new BadRequestException(
          supabaseError?.message || 'Erro ao criar usuário.',
        );
      }

      createdSupabaseUserId = supabaseUser.user.id;

      const user = {
        name,
        email,
        supabaseId: supabaseUser.user.id,
      };

      return await this.userRepo.save(user);
    } catch (error) {
      if (createdSupabaseUserId) {
        this.logger.error(
          `Falha ao salvar usuário no DB local. Revertendo criação no Supabase para o ID: ${createdSupabaseUserId}`,
        );

        await this.supabaseAdmin.auth.admin.deleteUser(createdSupabaseUserId);
      }

      throw error;
    }
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    const { email: newEmail, name: newName } = data;

    if (!newEmail && !newName) {
      throw new BadRequestException(
        'É necessário enviar pelo menos um dado para atualização.',
      );
    }

    const currentUser = await this.findOneByOrFail({ id });
    const { email: currentEmail, name: currentName } = currentUser;

    if (newEmail && newEmail !== currentEmail) {
      const emailExists = await this.userRepo.findOneBy({ email: newEmail });
      if (emailExists) {
        throw new ConflictException('Este e-mail já existe.');
      }
    }

    Object.assign(currentUser, {
      email: newEmail ?? currentEmail,
      name: newName ?? currentName,
    });

    return await this.userRepo.save(currentUser);
  }

  // async updatePassword(id: string, data: UpdatePasswordDto): Promise<User> {
  //   const { currentPassword, newPassword } = data;

  //   const user = await this.findOneByOrFail({ id });

  //   const isValid = await this.hasher.compare(currentPassword, user.password);

  //   if (!isValid) {
  //     throw new UnauthorizedException('Senha atual incorreta.');
  //   }

  //   user.password = await this.hasher.hash(newPassword);

  //   return await this.userRepo.save(user);
  // }

  async softDeleteMe(id: string): Promise<User> {
    const user = await this.findOneByOrFail({ id });
    const result = await this.userRepo.softDelete({ id });

    if (result.affected === 0) {
      throw new NotFoundException('O usuário não foi encontrado.');
    }

    return user;
  }
}
