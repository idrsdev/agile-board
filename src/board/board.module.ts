import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { Board } from './board.entity';
import { WorkspaceModule } from '../workspace/workspace.module';
import { BoardMember } from './board-member.entity';
import { AuthModule } from '../auth/auth.module';
import { WorkspaceService } from '../workspace/workspace.service';
import { BoardAclService } from './board-acl/board-acl.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Board, BoardMember]),
    WorkspaceModule,
    AuthModule,
  ],
  controllers: [BoardController],
  providers: [BoardService, WorkspaceService, BoardAclService],
  exports: [TypeOrmModule],
})
export class BoardModule {}
