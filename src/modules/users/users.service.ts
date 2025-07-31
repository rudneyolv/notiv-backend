import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { HASH_TOKEN } from 'src/common/hash/hash.token';
import { HashInterface } from 'src/common/hash/hash.interface';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @Inject(HASH_TOKEN) private readonly hasher: HashInterface,
  ) {}

  async create(data: CreateUserDto): Promise<User> {
    const { name, email, password } = data;
    const exists = await this.userRepo.existsBy({ email });

    if (exists) throw new ConflictException('E-mail já existe');

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
      throw new BadRequestException('Nenhum dado foi enviado');
    }

    const currentUser = await this.findOneByOfFail({ id });
    const { email: currentEmail, name: currentName } = currentUser;

    if (newEmail && newEmail !== currentEmail) {
      const emailExists = await this.userRepo.findOneBy({ email: newEmail });
      if (emailExists) {
        throw new BadRequestException('Email já está em uso');
      }
    }

    Object.assign(currentUser, {
      email: newEmail ?? currentEmail,
      name: newName ?? currentName,
    });

    return await this.userRepo.save(currentUser);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOneBy({ email });
  }

  async findOneByOfFail(data: Partial<User>) {
    const user = await this.userRepo.findOneBy(data);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }
}
