import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { JwtService } from '@nestjs/jwt';
import { RegisterDto, type LoginDto } from '@tickon/types';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtPayload } from './jwt.strategy.js';
import { randomBytes, createHash } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async createUser({ email, password, name }: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const { accessToken, refreshToken } = await this.generateToken(
      user.id,
      user.email,
    );

    return { ...user, accessToken, refreshToken };
  }

  async login({ email, password }: LoginDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!existing) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatched = await bcrypt.compare(
      password,
      existing.passwordHash,
    );

    if (!passwordMatched) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const { passwordHash, ...safeUser } = existing;
    const { accessToken, refreshToken } = await this.generateToken(
      safeUser.id,
      safeUser.email,
    );
    return { safeUser, accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string) {
    const tokenHash = createHash('sha256').update(refreshToken).digest('hex');

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Already revoked?
    if (storedToken.revokedAt) {
      const graceMs = 10 * 1000;
      const timeSinceRotation =
        Date.now() -
        new Date(storedToken.rotatedAt ?? storedToken.revokedAt).getTime();

      if (timeSinceRotation > graceMs) {
        await this.revokeTokenFamily(storedToken.familyId);
        throw new UnauthorizedException('Token reuse detected');
      }
      throw new UnauthorizedException('Token already used');
    }

    // Expired?
    if (new Date() > storedToken.expiresAt) {
      throw new UnauthorizedException('Refresh token expired');
    }

    // User deleted?
    if (!storedToken.user) {
      throw new UnauthorizedException('User not found');
    }

    // Rotate
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date(), rotatedAt: new Date() },
    });

    const { passwordHash, ...user } = storedToken.user;

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    const newRefreshToken = randomBytes(32).toString('hex');
    const newTokenHash = createHash('sha256')
      .update(newRefreshToken)
      .digest('hex');

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: newTokenHash,
        familyId: storedToken.familyId,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken: newRefreshToken, user };
  }

  async logout(refreshToken: string) {
    const tokenHash = createHash('sha256').update(refreshToken).digest('hex');

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (storedToken) {
      await this.revokeTokenFamily(storedToken.familyId);
    }
  }

  async revokeTokenFamily(familyId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { familyId },
      data: { revokedAt: new Date() },
    });
  }

  async generateToken(userId: string, email: string) {
    const payload: JwtPayload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      randomBytes(32).toString('hex'),
    ]);

    const refreshHash = createHash('sha256').update(refreshToken).digest('hex');

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: refreshHash,
        familyId: randomBytes(16).toString('hex'),
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  }
}
