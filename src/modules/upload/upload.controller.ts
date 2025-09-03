import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter, limits, storage } from './upload.config';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @UseGuards(AuthGuard('supabase-jwt'))
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: storage,
      limits: limits,
      fileFilter: fileFilter,
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.upload(file);
  }
}
