import { BadRequestException, Get, Injectable, InternalServerErrorException, Logger, NotFoundException, Param, ParseUUIDPipe } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Repository } from 'typeorm'; 
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { validate as isUUID } from 'uuid';
import { Product, ProductImage } from './entities';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductService');
  constructor(
    
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
  ){}

  async  create(createProductDto: CreateProductDto) {
    try {
      const { images = [], ...productDetails } = createProductDto;
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map( image => this.productImageRepository.create({ url: image}))
      });
      await this.productRepository.save( product );

      return { ...product, images: images };
      
    } catch (error) {
      this.handleDBExceptions(error);
    }  
  }

  findAll( paginationDto: PaginationDto) {

    const { limit = 10, offset= 0 } = paginationDto;

    return this.productRepository.find({
      take: limit,
      skip: offset,
      //TODO Relaciones
    });
  }

  async findOne( term: string ) {

    let product: Product;

    if ( isUUID(term) ){
      product = await this.productRepository.findOneBy({ id: term });
    } else {    const queryBuilder = this.productRepository.createQueryBuilder();
      product = await queryBuilder.where( 'UPPER(title) =:title or slug=:slug',{
        title:  term.toUpperCase(), //utilizar el metodo touppercase es opción para ser más flexibles en las consultas
        slug:   term.toLowerCase(), //utilizar el metodo tolowercase es opción para ser más flexibles en las consultas
      }).getOne();
    }
    
    if(!product) throw new NotFoundException(`Product with ${ term } not found`);
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto,
      images: [],
    });

    if ( !product ) throw new NotFoundException(`Product with id: ${ id } not found`);

    try {

      await this.productRepository.save( product );
      return product;
      
    } catch (error) {
      
      this.handleDBExceptions(error);
      
    }

  }

  async remove(id: string) {
    const product = await this.findOne( id );

    await this.productRepository.remove( product );
    
    return `This action removes a #${id} product`;
  }

  private handleDBExceptions( error:any ) {
    if( error.code === '23505' ) throw new BadRequestException(error.detail);

      this.logger.error(error);
      throw new InternalServerErrorException('Unexpected error, check serve logs');
      
  }
}
