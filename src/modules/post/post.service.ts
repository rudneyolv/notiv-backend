import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { SLUGIFY_TOKEN } from 'src/common/utils/slugify/slugify.token';
import { SlugifyInterface } from 'src/common/utils/slugify/slugify.interface';
import { UpdatePostDto } from './dto/update-post.dto';

interface UpdateProps {
  postId: string;
  authorId: string;
  postDto: UpdatePostDto;
}

// TODO: Filtro pra achar apenas posts com published
@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @Inject(SLUGIFY_TOKEN) private readonly slugify: SlugifyInterface,
  ) {}

  async findOneByOrFail(where: FindOptionsWhere<Post>) {
    const post = await this.postRepo.findOne({
      where,
      relations: ['author'],
    });

    if (!post) throw new NotFoundException('Post não encontrado');

    return post;
  }

  async getAllPublic(): Promise<Post[]> {
    return this.postRepo.find({
      order: { createdAt: 'DESC' },
      relations: ['author'],
      where: { published: true },
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
    return this.findOneByOrFail({ id, published: true });
  }

  async getBySlug(slug: string): Promise<Post> {
    return this.findOneByOrFail({ slug, published: true });
  }

  create({
    data,
    author,
  }: {
    data: CreatePostDto;
    author: User;
  }): Promise<Post> {
    const randomId = Math.random().toString(36).substring(2, 8); // 6 random chars
    const slug = this.slugify.generate(`${data.title}-${randomId}`);
    return this.postRepo.save({ ...data, author, slug });
  }

  async update(data: UpdateProps): Promise<Post> {
    const { postId, authorId, postDto } = data;
    const post = await this.findOneByOrFail({
      id: postId,
      author: { id: authorId },
    });

    Object.assign(post, postDto);
    return this.postRepo.save(post);
  }

  async softDelete(data: { postId: string; authorId: string }) {
    const { postId, authorId } = data;

    const post = await this.findOneByOrFail({
      id: postId,
      author: { id: authorId },
    });

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
