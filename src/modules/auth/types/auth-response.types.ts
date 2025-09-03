import { User } from 'src/modules/users/entities/user.entity';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
