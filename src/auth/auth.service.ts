import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/createUser.dto';
import { Request } from 'express';
import { LoginUserDto } from './dto/loginUser.dto';
import { TokenRepository } from 'src/auth/token/token.repository';
import { MailerService } from 'src/common/mailer.service';
import { User } from './user.entity';
import { UserRole } from './roles/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly mailerService: MailerService,
  ) {}

  /**
   * Creates a new user, sends an activation email, and handles user registration.
   * @param {CreateUserDto} createUserDto - The data to create a new user.
   * @param {Request} req - The HTTP request object.
   * @returns {Promise<void>}
   */
  async create(createUserDto: CreateUserDto, req: Request): Promise<void> {
    const user = await this.userRepository.createUser(createUserDto);

    const activationToken = await this.tokenRepository.generateActivationToken(
      user.id,
    );

    const activationLink = this.constructActivationLink(
      req.protocol,
      req.get('host'),
      user.email,
      activationToken,
    );

    await this.sendActivationEmail(user.email, activationLink);
  }

  /**
   * Authenticates a user based on login credentials and generates an access token.
   * @param {LoginUserDto} loginUserDto - The login credentials.
   * @returns {Promise<{ accessToken: string }>} - The access token.
   */
  async login(loginUserDto: LoginUserDto): Promise<{ accessToken: string }> {
    // Perform authentication and generate a JWT token for the user
    const token = await this.userRepository.authenticateUser(loginUserDto);

    return { accessToken: token };
  }

  /**
   * Verifies a user's account based on email and activation token.
   * @param {string} email - The user's email address.
   * @param {string} token - The activation token.
   * @returns {Promise<void>}
   * @throws {NotFoundException} If the activation link is invalid.
   */
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

  /**
   * Resends an activation link to the given email.
   * @param {string} email - The user's email address.
   * @param {Request} req - The HTTP request object.
   * @returns {Promise<void>}
   * @throws {NotFoundException} If the user is not found or the account is already activated.
   */
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
    const activationLink = this.constructActivationLink(
      req.protocol,
      req.get('host'),
      user.email,
      activationToken,
    );

    await this.sendActivationEmail(user.email, activationLink);
  }

  /**
   * Retrieves a user by their ID.
   * @param {number} id - The user's ID.
   * @returns {Promise<User | null>} - The user or null if not found.
   */
  async getUserById(id: number): Promise<User | null> {
    const user = await this.userRepository.getUserById(id);
    return user;
  }

  /**
   * Retrieves the roles associated with a user.
   * @param {number} userId - The user's ID.
   * @returns {Promise<UserRole[]>} - The user's roles.
   * @throws {NotFoundException} If the user is not found.
   */
  async getUserRoles(userId: number): Promise<UserRole[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.roles.map((role) => role.name);
  }

  /**
   * Constructs an activation link for the user.
   * @param {string} protocol - http  ||  Https.
   * @param {string} host - <>.
   * @param {string} email - The user's email address.
   * @param {string} token - The activation token.
   * @returns {string} - The activation link URL.
   * @private
   */
  private constructActivationLink(
    protocol: string,
    host: string,
    email: string,
    token: string,
  ): string {
    return `${protocol}://${host}/auth/verify?email=${email}&token=${token}`;
  }

  /**
   * Sends an activation email to the user.
   * @param {string} email - The user's email address.
   * @param {string} activationLink - The activation link URL.
   * @returns {Promise<void>}
   * @private
   */
  private async sendActivationEmail(
    email: string,
    activationLink: string,
  ): Promise<void> {
    await this.mailerService.sendEmail({
      recipient: email,
      subject: 'Account Activation',
      content: `Please click on the following link to activate your account: ${activationLink}`,
    });
  }
}
