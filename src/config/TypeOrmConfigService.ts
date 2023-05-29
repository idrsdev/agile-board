import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: this.configService.get('DB_TYPE') as 'postgres',
      host: this.configService.get('DB_HOST'),
      port: +this.configService.get<number>('DB_PORT'),
      username: this.configService.get('DB_USERNAME'),
      password: this.configService.get('DB_PASSWORD') as string,
      database: this.configService.get('DB_DATABASE') as string,
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: this.configService.get<boolean>('DB_SYNCHRONIZE'),
    };
  }
}
