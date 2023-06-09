import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './config/TypeOrmConfigService';
import { PasswordResetModule } from './password-reset/password-reset.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { DataSource } from 'typeorm';
import { createRoles } from './auth/roles/predefined-roles';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      inject: [ConfigService],
    }),
    AuthModule,
    PasswordResetModule,
    WorkspaceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
  async onModuleInit() {
    // Create static roles in our system
    await createRoles(this.dataSource.manager.connection);
  }
}
