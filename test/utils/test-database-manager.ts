import { ConfigService } from '@nestjs/config';
import { TypeOrmConfigService } from '../../src/config/TypeOrmConfigService';
import { DataSource } from 'typeorm';

class TestDatabaseManager {
  private rootConnection: DataSource | undefined;
  private testDbName: string | undefined;

  async getRootConnection(
    globalConfigService: ConfigService,
  ): Promise<{ rootConnection: DataSource; testDbName: string }> {
    if (!this.rootConnection || !this.testDbName) {
      const configService = new TypeOrmConfigService(globalConfigService);
      this.testDbName = configService.createTypeOrmOptions().database;

      this.rootConnection = new DataSource({
        ...configService.createTypeOrmOptions(),
        database: 'postgres',
      });

      await this.rootConnection.initialize();
    }

    return { rootConnection: this.rootConnection, testDbName: this.testDbName };
  }

  createTestDatabase = async (globalConfigService: ConfigService) => {
    const { rootConnection, testDbName } = await this.getRootConnection(
      globalConfigService,
    );

    // Drop and recreate the test database
    await rootConnection.query(`DROP DATABASE IF EXISTS "${testDbName}";`);
    await rootConnection.query(`CREATE DATABASE "${testDbName}";`);

    if (Boolean(process.env.DB_SYNCHRONIZE) === true) {
      process.env.DB_SYNCHRONIZE = 'false';

      rootConnection.setOptions({
        database: testDbName,
      });

      await rootConnection.synchronize();
    }
  };

  dropTestDatabase = async (globalConfigService: ConfigService) => {
    const { rootConnection, testDbName } = await this.getRootConnection(
      globalConfigService,
    );
    await rootConnection.query(`DROP DATABASE IF EXISTS "${testDbName}";`);
  };
}

export default new TestDatabaseManager();
