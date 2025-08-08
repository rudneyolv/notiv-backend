import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Logger,
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

@Controller('posts')
export class PostController {
  private readonly logger = new Logger(PostController.name);
  constructor(private readonly postService: PostService) {}

  @Get()
  async getAllPublic() {
    try {
      const posts = await this.postService.getAllPublic();
      const cleanedPosts = posts.map((post) => new PostResponseDto(post));
      return cleanedPosts;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/me')
  async getMyPosts(@Req() req: AuthenticatedRequest) {
    try {
      const myPosts = await this.postService.getAllByAuthorId(req.user.id);
      const myPostsCleaned = myPosts.map((post) => new PostResponseDto(post));
      return myPostsCleaned;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @Get('/:id')
  async getByid(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const post = await this.postService.getById(id);
      return new PostResponseDto(post);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() data: CreatePostDto,
  ): Promise<PostResponseDto> {
    try {
      const post = await this.postService.create({ data, author: req.user });
      return new PostResponseDto(post);
    } catch (error: unknown) {
      this.logger.error(error);
      throw error;
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/:id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Body() data: UpdatePostDto,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PostResponseDto> {
    try {
      if (Object.keys(data).length === 0) {
        throw new BadRequestException('Nenhum dado foi enviado');
      }

      const post = await this.postService.update(id, req.user.id, data);
      return new PostResponseDto(post);
    } catch (error: unknown) {
      this.logger.error(error);
      throw error;
    }
  }
}
