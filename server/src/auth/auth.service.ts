import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hash, verify } from 'argon2';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request, Response } from 'express';

import { UserEntity } from './entities/user.entity';
import { RegisterRequest } from './dto/register.dto';
import { LoginRequest } from './dto/login.dto';
import type { JwtPayload } from 'src/common/interfaces/jwt.interface';
import { isDev } from 'src/common/utils';

@Injectable()
export class AuthService {
  private readonly JWT_ACCESS_TOKEN_TTL: string;
  private readonly JWT_REFRESH_TOKEN_TTL: string;
  private readonly COOKIE_DOMAIN: string;

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.JWT_ACCESS_TOKEN_TTL = this.configService.getOrThrow<string>(
      'JWT_ACCESS_TOKEN_TTL',
    );
    this.JWT_REFRESH_TOKEN_TTL = this.configService.getOrThrow<string>(
      'JWT_REFRESH_TOKEN_TTL',
    );
    this.COOKIE_DOMAIN = this.configService.getOrThrow<string>('COOKIE_DOMAIN');
  }

  async getOne(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    return user ?? { id, username: 'Unknown' };
  }
  async registerUser(res: Response, dto: RegisterRequest) {
    const { email, password, username } = dto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = this.userRepository.create({
      username,
      email,
      password: await hash(password),
    });
    await this.userRepository.save(user);

    return this.auth(res, user.id);
  }

  async login(res: Response, dto: LoginRequest) {
    const { email, password } = dto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    const isPasswordValid = await verify(user.password, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.auth(res, user.id);
  }

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.id },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.auth(res, user.id);
  }

  async logout(res: Response) {
    this.setCookie(res, '', new Date(0));
  }

  async validate(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private auth(res: Response, id: string) {
    const { accessToken, refreshToken } = this.generateTokens(id);

    const expires = new Date(
      Date.now() + parseInt(this.JWT_REFRESH_TOKEN_TTL, 10) * 86400000,
    );

    this.setCookie(res, refreshToken, expires);

    return { accessToken };
  }

  private generateTokens(id: string) {
    const payload: JwtPayload = { id };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.JWT_ACCESS_TOKEN_TTL,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.JWT_REFRESH_TOKEN_TTL,
    });

    return { accessToken, refreshToken };
  }

  private setCookie(res: Response, value: string, expires: Date) {
    res.cookie('refreshToken', value, {
      httpOnly: true,
      domain: this.COOKIE_DOMAIN,
      expires,
      secure: !isDev(this.configService),
      sameSite: isDev(this.configService) ? 'lax' : 'none',
    });
  }
}
