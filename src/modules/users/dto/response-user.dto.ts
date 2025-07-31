import { User } from '../entities/user.entity';

export class UserResponseDto {
  readonly id: string;
  readonly name: string;

  constructor(user: User) {
    this.id = user.id;
    this.name = user.name;
  }
}
