import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/createUser.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @Post('register')
  async registerUser(
    @Body() createUserDto: CreateUserDto,
    @Req() req: Request,
  ): Promise<void> {
    try {
      await this.authService.create(createUserDto, req);
    } catch (error) {
      throw error;
      // console.log({ error });
    }
  }

  @ApiOperation({ summary: 'Authenticate user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully authenticated',
  })
  @Post('login')
  async loginUser(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.login(loginUserDto);
  }

  @ApiOperation({ summary: 'Verify user account' })
  @ApiResponse({
    status: 200,
    description: 'User account successfully verified',
  })
  @Get('verify')
  async verifyUser(
    @Query('email') email: string,
    @Query('token') token: string,
  ): Promise<void> {
    await this.authService.verifyUser(email, token);
  }

  @ApiOperation({ summary: 'Resend activation link' })
  @ApiResponse({
    status: 202,
    description: 'Activation link queued for sending',
  })
  @Post('resend-activation-link')
  async resendActivationEmail(
    @Body('email') email: string,
    @Req() req: Request,
  ): Promise<void> {
    await this.authService.resendActivationLink(email, req);
  }
}
