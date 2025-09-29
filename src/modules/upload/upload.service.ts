import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { Express } from 'express';

const maxFileSize = 900 * 1024;

@Injectable()
export class UploadService {
  //TODO:Alterar upload para cloud

  upload(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }

    if (file.size > maxFileSize) {
      throw new BadRequestException('Arquivo muito grande');
    }

    // const fileType = await fileTypeFromBuffer(file.buffer);

    // if (
    //   !fileType ||
    //   !['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(
    //     fileType.mime,
    //   )
    // ) {
    //   throw new BadRequestException('Arquivo inválido ou tipo não permitido.');
    // }

    const mimeToExt: Record<string, string> = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/webp': 'webp',
      'image/gif': 'gif',
    };

    const today = new Date().toISOString().split('T')[0];
    const uploadPath = resolve(process.cwd(), 'uploads', today);

    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }

    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const fileExtension = mimeToExt[file.mimetype];
    const fileName = `${uniqueSuffix}.${fileExtension}`;
    const fileFullPath = resolve(uploadPath, fileName);

    // Salvar o buffer no disco
    writeFileSync(fileFullPath, file.buffer);

    return {
      url: `http://localhost:3001/uploads/${today}/${fileName}`,
    };
  }
}
