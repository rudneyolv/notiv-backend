import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';

export class CreatePostDto {
  @IsString({ message: 'Título precisa ser uma string' })
  @Length(10, 150, { message: 'Título precisa ter entre 10 e 150 caracteres' })
  title: string;

  @IsString({ message: 'O resumo precisa ser uma string' })
  @Length(10, 200, {
    message: 'O resumo precisa ter entre 10 e 200 caracteres',
  })
  summary: string;

  @IsString({ message: 'Conteúdo precisa ser uma string' })
  @IsNotEmpty({ message: 'Conteúdo não pode ficar vazio' })
  content: string;

  @IsOptional()
  @IsUrl({ require_tld: false }) // Top level domain proíbe localhost e IP
  imageUrl?: string;

  @IsBoolean({ message: 'Campo de publicar post precisa ser um boolean' })
  @IsOptional()
  published?: boolean;
}
