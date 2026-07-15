import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async upsertOAuthUser(dto: { email: string; name?: string; provider: string }) {
    const user = await this.prisma.user.upsert({
      where: { email: dto.email },
      create: {
        email: dto.email,
        name: dto.name,
        oauthProvider: dto.provider,
      },
      update: { name: dto.name ?? undefined, oauthProvider: dto.provider },
    });
    return this.issueTokens(user.id, user.email);
  }

  issueTokens(userId: string, email: string) {
    const accessToken = this.jwt.sign({ sub: userId, email });
    const refreshToken = this.jwt.sign(
      { sub: userId, email, type: 'refresh' },
      { expiresIn: '7d' },
    );
    return { accessToken, refreshToken, userId, email };
  }
}
