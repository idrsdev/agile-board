import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { createConnection } from 'typeorm';
import { TypeOrmConfigService } from '../src/config/TypeOrmConfigService';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../src/auth/user.entity';
import { createUserAndToken } from './fixtures/user.fixture';
import { TokenRepository } from '../src/auth/token/token.repository';
import { UserRepository } from '../src/auth/user.repository';
import { ResendActivationEmailDto } from '../src/auth/dto/resendActivationEmail.dto';

let app: INestApplication;
let globalConfigService: ConfigService;
let userRepository: UserRepository;
let tokenRepository: TokenRepository;

describe('Auth (E2E)', () => {
  beforeAll(async () => {
    const configModule = ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.test',
    });

    const moduleRef = await Test.createTestingModule({
      imports: [configModule],
    }).compile();

    globalConfigService = moduleRef.get<ConfigService>(ConfigService);

    await createTestDatabase();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule.forRoot(configModule)],
    }).compile();

    tokenRepository = moduleFixture.get<TokenRepository>(TokenRepository);
    userRepository = moduleFixture.get<UserRepository>(UserRepository);

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await dropTestDatabase();
  });

  describe('Registration', () => {
    it('should register a new user', async () => {
      const createUserDto = {
        name: 'E2E Test User',
        email: 'e2etest@example.com',
        password: 'e2ePassword123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toHaveProperty(
        'message',
        'User successfully registered',
      );
    });

    it('should not allow duplicate registration', async () => {
      const createUserDto = {
        name: 'Duplicate User',
        email: 'e2etest@example.com', // Same email as the previous test
        password: 'e2ePassword123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(createUserDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toHaveProperty(
        'message',
        'User with this email already exists',
      );
    });
  });

  describe('Login', () => {
    it('should authenticate a user and return an access token', async () => {
      const loginUserDto = {
        email: 'e2etest@example.com',
        password: 'e2ePassword123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginUserDto)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('accessToken');
    });
  });

  describe('Email Verification', () => {
    it('should verify a user account', async () => {
      const createUserDto = {
        name: 'E2E Test User',
        email: 'e2etestverifyEmail@example.com',
        password: 'e2ePassword123',
      };

      const { user, token } = await createUserAndToken(
        userRepository,
        tokenRepository,
        createUserDto,
      );

      await request(app.getHttpServer())
        .get(`/auth/verify?email=${user.email}&token=${token}`)
        .expect(HttpStatus.OK);
    });
  });

  describe('Resending Activation Link', () => {
    let user: Partial<User>;

    beforeAll(async () => {
      const createUserDto = {
        name: 'E2E Test User',
        email: 'e2etestReSendverifyEmail@example.com',
        password: 'e2ePassword123',
      };

      const { user: newUser } = await createUserAndToken(
        userRepository,
        tokenRepository,
        createUserDto,
      );
      user = newUser;
    });

    it('should resend activation link to the given email', async () => {
      const resendActivationDto: ResendActivationEmailDto = {
        email: user.email,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/resend-activation-link')
        .send(resendActivationDto)
        .expect(HttpStatus.ACCEPTED);

      expect(response.body).toHaveProperty(
        'message',
        'Activation link queued for sending',
      );
    });
  });
});

async function createTestDatabase() {
  const configService = new TypeOrmConfigService(globalConfigService);

  const rootConnection = await createConnection({
    ...configService.createTypeOrmOptions(),
    database: 'postgres',
  });

  await rootConnection.query(
    `DROP DATABASE IF EXISTS "${
      configService.createTypeOrmOptions().database
    }";`,
  );
  await rootConnection.query(
    `CREATE DATABASE "${configService.createTypeOrmOptions().database}";`,
  );
  await rootConnection.close();
}

async function dropTestDatabase() {
  const configService = new TypeOrmConfigService(
    new ConfigService({ envFilePath: '.env.e2e' }),
  );

  const rootConnection = await createConnection({
    ...configService.createTypeOrmOptions(),
    database: 'postgres',
  });

  await rootConnection.query(
    `DROP DATABASE IF EXISTS "${
      configService.createTypeOrmOptions().database
    }";`,
  );
  await rootConnection.close();
}
