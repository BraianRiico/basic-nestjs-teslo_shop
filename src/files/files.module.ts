import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { AuthModule } from './../auth/auth.module';

@Module({
  controllers: [FilesController],
  providers: [FilesService],
  imports:    [
    ConfigModule, 
  ],
})
export class FilesModule {}
