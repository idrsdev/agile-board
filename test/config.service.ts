import { DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';

let globalConfigService: ConfigService | undefined;
let configModule: DynamicModule | undefined;

const ensureGlobalConfigService = async () => {
  if (globalConfigService && configModule) {
    return { configModule, globalConfigService };
  }

  configModule = ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env.test',
  });

  const moduleRef = await Test.createTestingModule({
    imports: [configModule],
  }).compile();

  globalConfigService = moduleRef.get<ConfigService>(ConfigService);

  return { configModule, globalConfigService };
};

export { ensureGlobalConfigService };
