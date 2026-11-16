import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service.js';
import type { LoginUserDto } from './dto/login.dto.js';
import { CreateUserDto } from './dto/register.dto.js';
import { AuthInterceptor } from './auth.interceptor.js';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
@UseInterceptors(AuthInterceptor)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3/min
  register(@Body() payload: CreateUserDto) {
    return this.authService.createUser(payload);
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5/min
  login(@Body() payload: LoginUserDto) {
    return this.authService.login(payload);
  }

  @Post('refresh')
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20/min
  refresh(@Req() req: Request) {
    const refreshToken = req.cookies?.['refreshToken'];
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token');
    }
    return this.authService.refreshTokens(refreshToken);
  }

  @Post('logout')
  async logout(@Req() req: Request) {
    const refreshToken = req.cookies?.['refreshToken'];

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    // AuthInterceptor will clear cookies automatically
    return { message: 'Logged out' };
  }
}
