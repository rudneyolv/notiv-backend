import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  makeLogin() {
    return 'This action make login';
  }
}
