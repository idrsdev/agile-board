import { ConfigService } from '@nestjs/config';
import { TypeOrmConfigService } from '../../src/config/TypeOrmConfigService';
import { createConnection } from 'typeorm';

async function createTestDatabase(globalConfigService: ConfigService) {
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

async function dropTestDatabase(globalConfigService: ConfigService) {
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
  await rootConnection.close();
}

export { createTestDatabase, dropTestDatabase };
