import { DynamicModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './config/TypeOrmConfigService';
import { PasswordResetModule } from './password-reset/password-reset.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { DataSource, createConnection } from 'typeorm';
import { createRoles } from './auth/roles/predefined-roles';
import { BoardModule } from './board/board.module';
import { ListModule } from './list/list.module';
import { CardModule } from './card/card.module';
import { CommentModule } from './comment/comment.module';
@Module({})
export class AppModule {
  static forRoot(configModule?: DynamicModule): DynamicModule {
    return {
      module: AppModule,
      imports: [
        configModule ||
          ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
          }),
        TypeOrmModule.forRootAsync({
          useClass: TypeOrmConfigService,
        }),
        AuthModule,
        PasswordResetModule,
        WorkspaceModule,
        BoardModule,
        ListModule,
        CardModule,
        CommentModule,
      ],
      controllers: [AppController],
      providers: [AppService],
    };
  }

  constructor(private dataSource: DataSource) {}
  async onModuleInit() {
    // Create static roles in our system
    await createRoles(this.dataSource.manager.connection);
  }
}
