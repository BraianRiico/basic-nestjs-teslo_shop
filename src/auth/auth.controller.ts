import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';


import { AuthService } from './auth.service';
import { GetUser } from './decorators/get-user.decorator';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login( loginUserDto );
  }

  @Get('private')
  @UseGuards( AuthGuard() )
  testingPrivateRoute(
    @GetUser() user: User
  ) {

    return {
      ok: true,
      message: 'Hola Mundo Private',
      user,
    }
  }
}
