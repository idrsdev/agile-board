import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../auth/user.repository';
import { TokenRepository } from 'src/auth/token/token.repository';
import { MailerService } from 'src/common/mailer.service';
import { Request } from 'express';

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly mailerService: MailerService,
  ) {}

  async sendPasswordResetEmail(email: string, req: Request): Promise<void> {
    const user = await this.userRepository.getUserByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate a password reset token
    const token = await this.tokenRepository.generateActivationToken(user.id);

    // Construct the password reset email
    const resetLink = `http://${req.headers.host}/password-reset?userId=${user.id}&token=${token}`;

    const emailOptions = {
      recipient: user.email,
      subject: 'Password Reset',
      content: `Please click on the following link to reset your password: ${resetLink}`,
    };

    await this.mailerService.sendEmail(emailOptions);
  }

  async resetPassword(
    userId: number,
    token: string,
    password: string,
  ): Promise<void> {
    const user = await this.userRepository.getUserById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValidToken = await this.tokenRepository.validateActivationToken(
      userId,
      token,
    );

    if (!isValidToken) {
      throw new NotFoundException('Invalid password reset token');
    }

    await this.userRepository.resetPassword(user, password);

    const tokenEntity = await this.tokenRepository.findTokenByUserId(userId);
    if (tokenEntity) {
      await this.tokenRepository.deleteToken(tokenEntity);
    }
  }
}
