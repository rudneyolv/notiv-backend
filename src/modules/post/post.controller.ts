import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  Param,
  BadRequestException,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { AuthenticatedRequest } from '../auth/types/authenticated-request.types';
import { PostResponseDto } from './dto/response-post.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdatePostDto } from './dto/update-post.dto';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  async getAllPublic() {
    const posts = await this.postService.getAllPublic();
    const cleanedPosts = posts.map((post) => new PostResponseDto(post));
    return cleanedPosts;
  }

  @UseGuards(AuthGuard('supabase-jwt'))
  @Get('/me')
  async getMyPosts(@CurrentUser() user: User) {
    const myPosts = await this.postService.getAllByAuthorId(user.id);
    const myPostsCleaned = myPosts.map((post) => new PostResponseDto(post));
    return myPostsCleaned;
  }

  @Get('/id/:id')
  async getByid(@Param('id', ParseUUIDPipe) id: string) {
    const post = await this.postService.getById(id);
    return new PostResponseDto(post);
  }

  @Get('/slug/:slug')
  async getBySlug(@Param('slug') slug: string) {
    const post = await this.postService.getBySlug(slug);
    return new PostResponseDto(post);
  }

  @UseGuards(AuthGuard('supabase-jwt'))
  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() data: CreatePostDto,
  ): Promise<PostResponseDto> {
    const post = await this.postService.create({ data, author: user });
    return new PostResponseDto(post);
  }

  @UseGuards(AuthGuard('supabase-jwt'))
  @Patch('/:id')
  async update(
    @CurrentUser() user: User,
    @Body() postDto: UpdatePostDto,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PostResponseDto> {
    if (Object.keys(postDto).length === 0) {
      throw new BadRequestException('Nenhum dado foi enviado');
    }

    const post = await this.postService.update({
      postId: id,
      authorId: user.id,
      postDto: postDto,
    });

    return new PostResponseDto(post);
  }

  @UseGuards(AuthGuard('supabase-jwt'))
  @Patch('/soft-delete/:id')
  async softDelete(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const post = await this.postService.softDelete({
      postId: id,
      authorId: user.id,
    });

    return new PostResponseDto(post);
  }
}
