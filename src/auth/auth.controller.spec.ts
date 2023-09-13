import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/createUser.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import { ResendActivationEmailDto } from './dto/resendActivationEmail.dto';
import { Request } from 'express';
import { NotFoundException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            create: jest.fn(),
            login: jest.fn(),
            verifyUser: jest.fn(),
            resendActivationLink: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('registerUser', () => {
    it('should register a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
      };
      const req: Request = {} as Request;

      authService.create = jest.fn().mockResolvedValue({
        message: 'User successfully registered',
        id: 1,
      });

      await controller.registerUser(createUserDto, req);

      expect(authService.create).toHaveBeenCalledWith(createUserDto, req);
    });
  });

  describe('loginUser', () => {
    it('should authenticate a user and return access token', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password',
      };

      const accessToken = 'access_token';

      authService.login = jest.fn().mockResolvedValue({ accessToken });

      const result = await controller.loginUser(loginUserDto);

      expect(authService.login).toHaveBeenCalledWith(loginUserDto);
      expect(result).toEqual({ accessToken });
    });
  });

  describe('verifyUser', () => {
    it('should verify a user account', async () => {
      const email = 'test@example.com';
      const token = 'token';

      await controller.verifyUser(email, token);

      expect(authService.verifyUser).toHaveBeenCalledWith(email, token);
    });

    it('should throw NotFoundException if user or token is invalid', async () => {
      const email = 'invalid@example.com';
      const token = 'invalid-token';

      authService.verifyUser = jest
        .fn()
        .mockRejectedValue(new NotFoundException());

      await expect(controller.verifyUser(email, token)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('resendActivationEmail', () => {
    it('should resend activation link', async () => {
      const resendActivationEmailDto: ResendActivationEmailDto = {
        email: 'test@example.com',
      };
      const req: Request = {} as Request;

      await controller.resendActivationEmail(resendActivationEmailDto, req);

      expect(authService.resendActivationLink).toHaveBeenCalledWith(
        resendActivationEmailDto.email,
        req,
      );
    });

    it('should throw NotFoundException if user not found or account already activated', async () => {
      const resendActivationEmailDto: ResendActivationEmailDto = {
        email: 'invalid@example.com',
      };
      const req: Request = {} as Request;

      authService.resendActivationLink = jest
        .fn()
        .mockRejectedValue(new NotFoundException());

      await expect(
        controller.resendActivationEmail(resendActivationEmailDto, req),
      ).rejects.toThrowError(NotFoundException);
    });
  });
});
