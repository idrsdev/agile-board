import { Module } from '@nestjs/common';
import { PasswordResetService } from './password-reset.service';
import { PasswordResetController } from './password-reset.controller';
import { AuthModule } from 'src/auth/auth.module';
import { MailerService } from 'src/common/mailer.service';

@Module({
  imports: [AuthModule],
  providers: [PasswordResetService, MailerService],
  controllers: [PasswordResetController],
})
export class PasswordResetModule {}
