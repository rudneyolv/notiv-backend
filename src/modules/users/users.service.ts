import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { HASH_TOKEN } from 'src/common/hash/hash.token';
import { HashInterface } from 'src/common/hash/hash.interface';
import { CreateUserResponse } from './user.types';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @Inject(HASH_TOKEN) private readonly hasher: HashInterface,
  ) {}

  async create(data: CreateUserDto): Promise<CreateUserResponse> {
    const { name, email, password } = data;
    const exists = await this.userRepo.exists({
      where: {
        email: email,
      },
    });

    if (exists) throw new ConflictException('E-mail já existe');

    const hashedPassword = await this.hasher.hash(password);

    const user = {
      name,
      email,
      password: hashedPassword,
    };

    const userCreated = await this.userRepo.save(user);

    return {
      name: userCreated.name,
      id: userCreated.id,
    };
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOneBy({ email });
  }
}
