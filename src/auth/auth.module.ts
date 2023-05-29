import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserRepository } from './user.repository';
import { User } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TokenModule } from 'src/auth/token/token.module';
import { MailerService } from 'src/common/mailer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TokenModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRY') },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, UserRepository, MailerService],
  controllers: [AuthController],
  exports: [TokenModule, UserRepository, MailerService],
})
export class AuthModule {}
