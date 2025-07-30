import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/create-auth.dto';
import { UsersService } from '../users/users.service';
import { HASH_TOKEN } from 'src/common/hash/hash.token';
import { HashInterface } from 'src/common/hash/hash.interface';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './types/jwt.types';
import { LoginResponse } from './types/auth-response.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(HASH_TOKEN) private readonly hasher: HashInterface,
  ) {}

  async login(data: LoginDto): Promise<LoginResponse> {
    const { email: inputEmail, password: inputPassword } = data;
    const user = await this.userService.findByEmail(inputEmail);
    if (!user) throw new UnauthorizedException('Usuário ou senha inválidos');

    const { password: hashedPassword, id, email } = user;

    const isValidPassword = await this.hasher.compare(
      inputPassword,
      hashedPassword,
    );

    if (!isValidPassword)
      throw new UnauthorizedException('Usuário ou senha inválidos');

    const jwtPayload: JwtPayload = {
      id,
      email,
    };

    const accessToken = await this.jwtService.signAsync(jwtPayload);

    return {
      accessToken,
    };
  }
}
