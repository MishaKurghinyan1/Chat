import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { type Request, type Response } from 'express';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Authorizated } from 'src/common/decorators/authorizated.decorator';
import { RegisterRequest } from './dto/register.dto';
import { LoginRequest } from './dto/login.dto';
import { Authorization } from 'src/common/decorators/authorization.decorator';
import { AuthResponse } from './dto/auth.dto';
import { UserEntity } from './entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Register a new user',
    description: 'Registers a new user and returns authentication tokens.',
  })
  @ApiOkResponse({ type: AuthResponse })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  @ApiConflictResponse({
    description: 'User already exists',
  })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: RegisterRequest,
  ) {
    return this.authService.registerUser(res, dto);
  }

  @ApiOperation({
    summary: 'Login an existing user',
    description: 'Logs in an existing user and returns authentication tokens.',
  })
  @ApiOkResponse({ type: AuthResponse })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Res({ passthrough: true }) res: Response, @Body() dto: LoginRequest) {
    return this.authService.login(res, dto);
  }

  @ApiOperation({
    summary: 'Refresh authentication tokens',
    description: 'Refreshes the authentication tokens using a refresh token.',
  })
  @ApiOkResponse({ type: AuthResponse })
  @ApiUnauthorizedResponse({
    description: 'Refresh token not found',
  })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.refresh(req, res);
  }

  @ApiOperation({
    summary: 'Logout user',
    description: 'Logs out the user by clearing authentication cookies.',
  })
  @ApiOkResponse({
    description: 'User logged out successfully',
  })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }

  @Authorization()
  @Get('me')
  @HttpCode(HttpStatus.OK)
  me(@Authorizated() user: UserEntity) {
    return user;
  }

  @Authorization()
  @Get('byId')
  @HttpCode(HttpStatus.OK)
  all(@Param('id') id: string) {
    return this.authService.getOne(id);
  }
}
