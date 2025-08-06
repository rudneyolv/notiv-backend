import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { AuthenticatedRequest } from '../auth/types/authenticated-request.types';
import { PostResponseDto } from './dto/response-post.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() data: CreatePostDto,
  ): Promise<PostResponseDto> {
    const post = await this.postService.create({ data, author: req.user });

    return new PostResponseDto(post);
  }
}
