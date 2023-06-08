import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/createUser.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { TokenRepository } from 'src/auth/token/token.repository';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private tokenRepository: TokenRepository,
    private jwtService: JwtService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { name, email, password } = createUserDto;
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const user = new User();
    user.name = name;
    user.email = email;
    user.password = await this.hashPassword(password);
    return this.userRepository.save(user);
  }

  async authenticateUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user || !(await this.validatePassword(password, user.password))) {
      throw new BadRequestException('Invalid credential');
    }

    const token = this.generateAccessToken(user.id);

    return token;
  }

  async activateUser(user: User): Promise<void> {
    user.isActive = true;
    await this.userRepository.save(user);

    const token = await this.tokenRepository.findTokenByUserId(user.id);
    if (token) {
      await this.tokenRepository.deleteToken(token);
    }
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    delete user.password;
    return user;
  }

  async resetPassword(user: User, password: string): Promise<User> {
    user.password = await this.hashPassword(password);
    return this.userRepository.save(user);
  }

  private async hashPassword(password: string) {
    return bcrypt.hashSync(password, 10);
  }

  private async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  private async generateAccessToken(userId: string): Promise<string> {
    return this.jwtService.sign(
      {
        _id: userId,
      },
      {
        secret: process.env.JWT_SECRET,
      },
    );
  }
}
