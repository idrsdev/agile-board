import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): PostgresConnectionOptions {
    return {
      type: this.configService.get('DB_TYPE') as 'postgres',
      host: this.configService.get('DB_HOST'),
      port: +this.configService.get<number>('DB_PORT'),
      username: this.configService.get('DB_USERNAME'),
      password: this.configService.get('DB_PASSWORD'),
      database: this.configService.get('DB_DATABASE'),
      entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
      synchronize: this.configService.get<string>('DB_SYNCHRONIZE') === 'true',
      migrations: ['dist/database/migrations/*.js'],
    };
  }
}
