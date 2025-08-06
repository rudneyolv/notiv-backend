import { Post } from '../entities/post.entity';
import { UserResponseDto } from 'src/modules/users/dto/response-user.dto';

export class PostResponseDto {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly content: string;
  readonly summary: string;
  readonly imageUrl: string | null;
  readonly published: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly author: UserResponseDto;

  constructor(post: Post) {
    this.id = post.id;
    this.title = post.title;
    this.slug = post.slug;
    this.content = post.content;
    this.summary = post.summary;
    this.imageUrl = post.imageUrl;
    this.published = post.published;
    this.createdAt = post.createdAt;
    this.updatedAt = post.updatedAt;
    this.author = new UserResponseDto(post.author);
  }
}
