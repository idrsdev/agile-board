import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceService } from './workspace.service';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceRepository } from './workspace.repository';
import { AuthModule } from '../auth/auth.module';
import { Workspace } from './workspace.entity';
import { UserWorkspace } from './user-workspace.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace, UserWorkspace]), AuthModule],
  controllers: [WorkspaceController],
  providers: [WorkspaceService, WorkspaceRepository],
  exports: [WorkspaceRepository, WorkspaceService, TypeOrmModule],
})
export class WorkspaceModule {}
