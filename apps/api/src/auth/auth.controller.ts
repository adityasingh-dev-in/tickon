import { Body, Controller, Post } from '@nestjs/common';
import type { RegisterDto } from '@tickon/types'
import { CreateUserDto } from './dto/register.dto.js';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() payload:CreateUserDto){
    console.log(payload);
    return this.authService.createUser(payload);
  }
}
