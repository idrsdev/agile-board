import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserRepository } from './user.repository';
import { User } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TokenModule } from '../auth/token/token.module';
import { MailerService } from '../common/mailer.service';
import { RoleModule } from './roles/role.module';
import { RoleRepository } from './roles/role.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TokenModule,
    RoleModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRY') },
        global: true,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, UserRepository, MailerService, RoleRepository],
  controllers: [AuthController],
  exports: [
    TokenModule,
    UserRepository,
    AuthService,
    RoleRepository,
    TypeOrmModule,
    JwtModule,
  ],
})
export class AuthModule {}
