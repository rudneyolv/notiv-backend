import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
  ) {}

  create({
    data,
    author,
  }: {
    data: CreatePostDto;
    author: User;
  }): Promise<Post> {
    const slug = randomUUID();
    return this.postRepo.save({ slug, ...data, author });
  }
}
