import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/createUser.dto';
import { Request } from 'express';
import { LoginUserDto } from './dto/loginUser.dto';
import { TokenRepository } from 'src/auth/token/token.repository';
import { MailerService } from 'src/common/mailer.service';
import { User } from './user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository, // private readonly mailerService: MailerService,
    private readonly tokenRepository: TokenRepository,
    private readonly mailerService: MailerService,
  ) {}

  async create(createUserDto: CreateUserDto, req: Request): Promise<void> {
    // Create a new user
    const user = await this.userRepository.createUser(createUserDto);

    // Generate an activation token
    const activationToken = await this.tokenRepository.generateActivationToken(
      user.id,
    );

    // Construct the activation email
    const activationLink = `${req.protocol}://${req.get('host')}/auth/verify/${
      user.email
    }/${activationToken}`;

    const emailOptions = {
      recipient: user.email,
      subject: 'Account Activation',
      content: `Please click on the following link to activate your account: ${activationLink}`,
    };

    // Send the activation email
    await this.mailerService.sendEmail(emailOptions);
  }

  async login(loginUserDto: LoginUserDto): Promise<{ accessToken: string }> {
    // Perform authentication and generate a JWT token for the user
    const token = await this.userRepository.authenticateUser(loginUserDto);

    return { accessToken: token };
  }

  async verifyUser(email: string, token: string): Promise<void> {
    // Verify user account based on email and activation token
    const user = await this.userRepository.getUserByEmail(email);

    if (
      !user ||
      !this.tokenRepository.validateActivationToken(user.id, token)
    ) {
      throw new NotFoundException('Invalid activation link');
    }

    // Activate the user account
    await this.userRepository.activateUser(user);
  }

  async resendActivationLink(email: string, req: Request): Promise<void> {
    // Check if the user exists
    const user = await this.userRepository.getUserByEmail(email);

    if (!user || user.isActive) {
      throw new NotFoundException(
        'User not found or account already activated',
      );
    }

    // Generate a new activation token
    const activationToken = await this.tokenRepository.generateActivationToken(
      user.id,
    );

    // Construct the activation email
    const activationLink = `${req.protocol}://${req.get('host')}/auth/verify/${
      user.email
    }/${activationToken}`;

    const emailOptions = {
      recipient: user.email,
      subject: 'Account Activation',
      content: `Please click on the following link to activate your account: ${activationLink}`,
    };

    // Send the activation email
    await this.mailerService.sendEmail(emailOptions);
  }

  async getUserById(id: string): Promise<User | null> {
    const user = await this.userRepository.getUserById(id);
    return user;
  }
}
