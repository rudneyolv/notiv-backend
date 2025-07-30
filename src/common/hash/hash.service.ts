import { Injectable } from '@nestjs/common';
import { HashInterface } from './hash.interface';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class HashService implements HashInterface {
  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}
