import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from '@tickon/types';
        
@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async createUser({
        email,
        password,
        name,
      }: RegisterDto) {

    const existing = await this.prisma.user.findUnique({
        where: { email },
    });
    
    if(existing){
        throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
        data: {
            email,
            passwordHash: hashedPassword,
            name,
        },select:{
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
            createdAt: true,
            updatedAt: true,
        }
    });
    return user;
  }
}
