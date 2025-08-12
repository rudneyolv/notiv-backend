import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { PostModule } from './modules/post/post.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Garante que o ConfigModule esteja disponível
      inject: [ConfigService], // Injeta o ConfigService para que possamos usá-lo
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST'),
        port: configService.get<number>('POSTGRES_PORT'),
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DB'),
        autoLoadEntities: true,
        synchronize: configService.get('NODE_ENV') !== 'production',
      }),
    }),
    AuthModule,
    PostModule,
    UsersModule,
    UploadModule,
  ],
})
export class AppModule {}
