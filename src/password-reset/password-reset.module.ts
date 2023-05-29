import { Module } from '@nestjs/common';
import { PasswordResetService } from './password-reset.service';
import { PasswordResetController } from './password-reset.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [PasswordResetService],
  controllers: [PasswordResetController],
})
export class PasswordResetModule {}
