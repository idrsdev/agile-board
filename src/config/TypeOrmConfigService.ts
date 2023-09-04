import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions() {
    return {
      type: this.configService.get('DB_TYPE') as 'postgres',
      host: this.configService.get('DB_HOST'),
      port: +this.configService.get<number>('DB_PORT'),
      username: this.configService.get('DB_USERNAME'),
      password: this.configService.get('DB_PASSWORD') as string,
      database: this.configService.get('DB_DATABASE') as string,
      // entities: process.env.NODE_ENV === 'e2e' ? ['src/**/*.entity.ts'] : ['dist/**/*.entity{.ts,.js}'],
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      // TODO: Change It's value based on NODE_ENV value
      synchronize: this.configService.get<boolean>('DB_SYNCHRONIZE'),
    };
  }
}
