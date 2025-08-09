import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { SLUGIFY_TOKEN } from 'src/common/slugify/slugify.token';
import { SlugifyInterface } from 'src/common/slugify/slugify.interface';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @Inject(SLUGIFY_TOKEN) private readonly slugify: SlugifyInterface,
  ) {}

  async getAllPublic(): Promise<Post[]> {
    return this.postRepo.find({
      order: { createdAt: 'DESC' },
      relations: ['author'],
    });
  }

  async getAllByAuthorId(authorId: string): Promise<Post[]> {
    return this.postRepo.find({
      where: { author: { id: authorId } },
      order: { createdAt: 'DESC' },
      relations: ['author'],
    });
  }

  async getById(id: string): Promise<Post> {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!post) throw new NotFoundException('Post não encontrado');

    return post;
  }

  async getBySlug(slug: string): Promise<Post> {
    const post = await this.postRepo.findOne({
      where: { slug },
      relations: ['author'],
    });

    if (!post) throw new NotFoundException('Post não encontrado');

    return post;
  }

  create({
    data,
    author,
  }: {
    data: CreatePostDto;
    author: User;
  }): Promise<Post> {
    const randomId = Math.random().toString(36).substring(2, 8); // 6 chars
    const slug = this.slugify.generate(`${data.title}-${randomId}`);
    return this.postRepo.save({ slug, ...data, author });
  }

  async update(data: {
    postId: string;
    authorId: string;
    postDto: UpdatePostDto;
  }): Promise<Post> {
    const { postId, authorId, postDto } = data;

    const post = await this.postRepo.findOne({
      where: { id: postId, author: { id: authorId } },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException(
        'Post não encontrado ou você não tem permissão para editá-lo.',
      );
    }

    Object.assign(post, postDto);

    return this.postRepo.save(post);
  }

  async softDelete(data: { postId: string; authorId: string }) {
    const { postId, authorId } = data;

    const post = await this.postRepo.findOne({
      where: { id: postId, author: { id: authorId } },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException(
        'Post não encontrado ou você não tem permissão para editá-lo.',
      );
    }

    const result = await this.postRepo.softDelete({
      id: postId,
      author: { id: authorId },
    });

    if (result.affected === 0) {
      throw new NotFoundException('Post não alterado');
    }

    return post;
  }
}
