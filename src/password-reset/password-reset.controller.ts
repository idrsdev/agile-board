import { Controller, Post, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { PasswordResetService } from './password-reset.service';
import {
  ReqResetPasswordDto,
  ResetPasswordDto,
} from './dto/reset-password.dto';
import { Request } from 'express';

@ApiTags('Password Reset')
@Controller('password-reset')
export class PasswordResetController {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  @ApiOperation({ summary: 'Send password reset email' })
  @ApiBody({
    description: 'Email of the user',
    required: true,
    type: ReqResetPasswordDto,
  })
  @Post()
  async sendPasswordResetEmail(
    @Body() body: ReqResetPasswordDto,
    @Req() req: Request,
  ) {
    await this.passwordResetService.sendPasswordResetEmail(body.email, req);
  }

  @ApiOperation({ summary: 'Reset password' })
  @ApiBody({
    description: 'Reset password details',
    required: true,
    type: ResetPasswordDto,
  })
  @Post('reset')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const { userId, token, password } = resetPasswordDto;
    await this.passwordResetService.resetPassword(userId, token, password);
  }
}
