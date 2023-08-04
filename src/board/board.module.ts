import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { Board } from './board.entity';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { BoardMember } from './board-member.entity';
import { AuthModule } from 'src/auth/auth.module';
import { WorkspaceService } from 'src/workspace/workspace.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Board, BoardMember]),
    WorkspaceModule,
    AuthModule,
  ],
  controllers: [BoardController],
  providers: [BoardService, WorkspaceService],
})
export class BoardModule {}
