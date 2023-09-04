import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/createUser.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ResendActivationEmailDto } from './dto/resendActivationEmail.dto';

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
  ): Promise<{ message: string; id: string }> {
    const res = await this.authService.create(createUserDto, req);
    return { message: 'User successfully registered', id: res.id };
  }

  @ApiOperation({ summary: 'Authenticate user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully authenticated',
  })
  @HttpCode(200)
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
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Activation link queued for sending',
  })
  @Post('resend-activation-link')
  async resendActivationEmail(
    @Body() body: ResendActivationEmailDto,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    return await this.authService.resendActivationLink(body.email, req);
  }
}
