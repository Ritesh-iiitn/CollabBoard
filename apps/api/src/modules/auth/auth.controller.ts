import { Body, Controller, Post } from '@nestjs/common';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { AuthService } from './auth.service';

class OAuthCallbackDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
  provider!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /** Exchange OAuth profile (from Firebase bridge) for Nest JWT */
  @Post('oauth/callback')
  oauthCallback(@Body() dto: OAuthCallbackDto) {
    return this.auth.upsertOAuthUser(dto);
  }
}
