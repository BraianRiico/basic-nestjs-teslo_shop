import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, Get, Param, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import { fileFilter, fileNamer } from './helpers';


@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
    ) {}

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response, // tener cuidado al utilizar este res porque este se salta interceptores definidos de manera global y varias restricciones que tiene nest (varios ciclos de vida)
    @Param('imageName') imageName: string
  ) {
    
    const path = this.filesService.getStaticProductImage( imageName );

    res.sendFile( path );//muestra la imagen

  }

  @Post('product')
  @UseInterceptors( FileInterceptor('file', {
    fileFilter: fileFilter,
    // limits: { fileSize: 1000 }
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer,
    })
  }) )
  uploadProductImage( 
    @UploadedFile() file: Express.Multer.File
    ){

      if ( !file ) {
        throw new BadRequestException( 'Make sure that the file is an image' );
      }

      const secureUrl = `${ this.configService.get('HOST_API')}/files/product/${ file.filename } `;

    return {
      secureUrl
    };
  }
  
}
