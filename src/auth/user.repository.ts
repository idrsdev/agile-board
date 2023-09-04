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
import { TokenRepository } from '../auth/token/token.repository';
import { RoleRepository } from './roles/role.repository';
import { UserRole } from './roles/role.enum';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private roleRepository: RoleRepository,
    private tokenRepository: TokenRepository,
    private jwtService: JwtService,
  ) {
    super(
      userRepository.target,
      userRepository.manager,
      userRepository.queryRunner,
    );
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { name, email, password } = createUserDto;
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const defaultRole = await this.roleRepository.findOne({
      where: {
        name: UserRole.USER,
      },
    });

    if (!defaultRole) {
      throw new NotFoundException('Default role not found');
    }

    const user = new User();
    user.name = name;
    user.email = email;
    user.password = await this.hashPassword(password);
    user.roles = [defaultRole];
    return this.userRepository.save(user);
  }

  async authenticateUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'password'],
      relations: {
        roles: true,
      },
    });

    if (!user || !(await this.validatePassword(password, user.password))) {
      throw new BadRequestException('Invalid credential');
    }

    const token = this.generateAccessToken(
      user.id,
      user.roles?.map((role) => role.name),
    );

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

  async getUserById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: id },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

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

  private async generateAccessToken(
    userId: number,
    roles: UserRole[],
  ): Promise<string> {
    return this.jwtService.sign(
      {
        _id: userId,
        roles,
      },
      {
        secret: process.env.JWT_SECRET,
      },
    );
  }
}
