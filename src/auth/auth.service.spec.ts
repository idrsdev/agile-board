import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { MailerService } from 'src/common/mailer.service';
import { CreateUserDto } from './dto/createUser.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import { TokenRepository } from './token/token.repository';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: UserRepository;
  let tokenRepository: TokenRepository;
  let mailerService: MailerService;
  const reqMock = {
    protocol: 'http',
    get: jest.fn(() => 'localhost:3000'),
  } as unknown as Request;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: {
            createUser: jest.fn(),
            getUserByEmail: jest.fn(),
            activateUser: jest.fn(),
            authenticateUser: jest.fn(),
            getUserById: jest.fn(),
          },
        },
        {
          provide: TokenRepository,
          useValue: {
            generateActivationToken: jest.fn(),
            validateActivationToken: jest.fn(),
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
    tokenRepository = module.get<TokenRepository>(TokenRepository);
    mailerService = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      name: 'Test',
      email: 'test@email.com',
      password: '12345678',
    };

    it('should create a new user', async () => {
      userRepository.createUser = jest.fn().mockResolvedValue({
        id: 1,
        email: createUserDto.email,
      });
      await authService.create(createUserDto, reqMock);
      expect(userRepository.createUser).toHaveBeenCalledWith(createUserDto);
    });

    it('should generate an activation token for the new user', async () => {
      userRepository.createUser = jest.fn().mockResolvedValue({
        id: 1,
        email: createUserDto.email,
      });
      await authService.create(createUserDto, reqMock);
      expect(tokenRepository.generateActivationToken).toHaveBeenCalledWith(1);
    });

    it('should send an activation email to the new user', async () => {
      userRepository.createUser = jest.fn().mockResolvedValue({
        id: 1,
        email: createUserDto.email,
      });
      tokenRepository.generateActivationToken = jest
        .fn()
        .mockResolvedValue('token');

      const expectedActivationLink = `${reqMock.protocol}://${reqMock.get(
        'host',
      )}/auth/verify?email=${createUserDto.email}&token=token`;

      await authService.create(createUserDto, reqMock);
      expect(mailerService.sendEmail).toHaveBeenCalledWith({
        recipient: createUserDto.email,
        subject: 'Account Activation',
        content: `Please click on the following link to activate your account: ${expectedActivationLink}`,
      });
    });
  });

  describe('login', () => {
    it('should authenticate a user and return access token', async () => {
      // Arrange
      const loginUserDto: LoginUserDto = {
        email: 'test@email.com',
        password: '12345678',
      };
      const mockAccessToken = 'mockAccessToken';

      // Mock the authenticateUser method to return a token
      userRepository.authenticateUser = jest
        .fn()
        .mockResolvedValue(mockAccessToken);

      // Act
      const result = await authService.login(loginUserDto);

      // Assert
      expect(userRepository.authenticateUser).toHaveBeenCalledWith(
        loginUserDto,
      );
      expect(result).toEqual({ accessToken: mockAccessToken });
    });

    it('should throw BadRequestException if login attempt has an invalid email', async () => {
      // Arrange
      const loginUserDto: LoginUserDto = {
        email: 'invalid-email',
        password: '12345678',
      };

      // Mock the authenticateUser method to throw BadRequestException
      userRepository.authenticateUser = jest
        .fn()
        .mockRejectedValue(new BadRequestException('Invalid credential'));

      // Act & Assert
      await expect(authService.login(loginUserDto)).rejects.toThrowError(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if login attempt has an invalid password', async () => {
      // Arrange
      const loginUserDto: LoginUserDto = {
        email: 'test@email.com',
        password: 'invalid-password',
      };

      // Mock the authenticateUser method to throw BadRequestException
      userRepository.authenticateUser = jest
        .fn()
        .mockRejectedValue(new BadRequestException('Invalid credential'));

      // Act & Assert
      await expect(authService.login(loginUserDto)).rejects.toThrowError(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if login attempt has both an invalid email and an invalid password', async () => {
      // Arrange
      const loginUserDto: LoginUserDto = {
        email: 'invalid-email',
        password: 'invalid-password',
      };

      // Mock the authenticateUser method to throw BadRequestException
      userRepository.authenticateUser = jest
        .fn()
        .mockRejectedValue(new BadRequestException('Invalid credential'));

      // Act & Assert
      await expect(authService.login(loginUserDto)).rejects.toThrowError(
        BadRequestException,
      );
    });
  });

  describe('verifyUser', () => {
    it('should verify a user account', async () => {
      // Arrange
      const email = 'test@example.com';
      const token = 'token';
      const user = { id: 1 };

      // Mock dependencies
      userRepository.getUserByEmail = jest.fn().mockResolvedValue(user);
      tokenRepository.validateActivationToken = jest.fn().mockReturnValue(true);

      // Act
      await authService.verifyUser(email, token);

      // Assert
      expect(userRepository.getUserByEmail).toHaveBeenCalledWith(email);
      expect(tokenRepository.validateActivationToken).toHaveBeenCalledWith(
        user.id,
        token,
      );
      expect(userRepository.activateUser).toHaveBeenCalledWith(user);
    });

    it('should throw NotFoundException if user or token is invalid', async () => {
      // Arrange
      const email = 'test@example.com';
      const token = 'token';

      // Mock dependencies
      userRepository.getUserByEmail = jest.fn().mockResolvedValue(null);
      tokenRepository.validateActivationToken = jest
        .fn()
        .mockReturnValue(false);

      // Act & Assert
      await expect(authService.verifyUser(email, token)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('resendActivationLink', () => {
    const reqMock = {
      protocol: 'http',
      get: jest.fn(() => 'localhost:3000'),
    } as unknown as Request;

    it('should resend activation link to the given email', async () => {
      const email = 'test@example.com';

      // Mock dependencies
      userRepository.getUserByEmail = jest
        .fn()
        .mockResolvedValue({ id: 1, isActive: false });
      tokenRepository.generateActivationToken = jest
        .fn()
        .mockResolvedValue('token');

      // Act
      await authService.resendActivationLink(email, reqMock);

      // Assert
      expect(userRepository.getUserByEmail).toHaveBeenCalledWith(email);
      expect(tokenRepository.generateActivationToken).toHaveBeenCalledWith(1);
      expect(mailerService.sendEmail).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found or account already activated', async () => {
      const email = 'test@example.com';
      const req = {} as Request;

      // Mock dependencies
      userRepository.getUserByEmail = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(
        authService.resendActivationLink(email, req),
      ).rejects.toThrowError(NotFoundException);
    });

    // Add more test cases for edge cases...
  });

  describe('getUserById', () => {
    it('should return a user by ID', async () => {
      const id = 1;
      const mockUser = { id, email: 'test@example.com' };

      // Mock dependencies
      userRepository.getUserById = jest.fn().mockResolvedValue(mockUser);

      // Act
      const result = await authService.getUserById(id);

      // Assert
      expect(result).toEqual(mockUser);
      expect(userRepository.getUserById).toHaveBeenCalledWith(id);
    });
  });

  describe('getUserRoles', () => {
    it('should return roles for a user', async () => {
      const id = 1;
      const mockUserRoles = ['ROLE_USER', 'ROLE_ADMIN'];

      // Mock dependencies
      userRepository.findOne = jest.fn().mockResolvedValue({
        roles: mockUserRoles.map((role) => ({ name: role })),
      });

      // Act
      const result = await authService.getUserRoles(id);

      // Assert
      expect(result).toEqual(mockUserRoles);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id } });
    });

    it('should throw NotFoundException if user not found', async () => {
      const id = 1;

      // Mock dependencies
      userRepository.findOne = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(authService.getUserRoles(id)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });
});
