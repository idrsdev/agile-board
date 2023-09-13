import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { config as dotenvConfig } from 'dotenv';

const NODE_ENV = process.env.NODE_ENV || 'dev';

dotenvConfig({ path: NODE_ENV.trim().concat('.env') });

export const config: PostgresConnectionOptions = {
  type: process.env.DB_TYPE as 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  synchronize: Boolean(process.env.DB_SYNCHRONIZE),
  migrations: ['dist/database/migrations/*.js'],
};
export default new DataSource(config);
