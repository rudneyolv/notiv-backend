import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { HASH_TOKEN } from 'src/common/hash/hash.token';
import { HashInterface } from 'src/common/hash/hash.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @Inject(HASH_TOKEN) private readonly hasher: HashInterface,
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
    const exists = await this.userRepo.existsBy({ email });

    if (exists) throw new ConflictException('Este e-mail já existe.');

    const hashedPassword = await this.hasher.hash(password);

    const user = {
      name,
      email,
      password: hashedPassword,
    };

    return await this.userRepo.save(user);
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

  async updatePassword(id: string, data: UpdatePasswordDto): Promise<User> {
    const { currentPassword, newPassword } = data;

    const user = await this.findOneByOrFail({ id });

    const isValid = await this.hasher.compare(currentPassword, user.password);

    if (!isValid) {
      throw new UnauthorizedException('Senha atual incorreta.');
    }

    user.password = await this.hasher.hash(newPassword);

    return await this.userRepo.save(user);
  }

  async softDeleteMe(id: string): Promise<User> {
    const user = await this.findOneByOrFail({ id });
    const result = await this.userRepo.softDelete({ id });

    if (result.affected === 0) {
      throw new NotFoundException('O usuário não foi encontrado.');
    }

    return user;
  }
}
