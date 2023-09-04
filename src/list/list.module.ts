import { Module } from '@nestjs/common';
import { ListController } from './list.controller';
import { ListService } from './list.service';
import { List } from './list.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceModule } from '../workspace/workspace.module';
import { BoardModule } from '../board/board.module';
import { BoardService } from '../board/board.service';
import { BoardAclService } from '../board/board-acl/board-acl.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([List]),
    WorkspaceModule,
    AuthModule,
    BoardModule,
  ],
  controllers: [ListController],
  providers: [ListService, BoardService, BoardAclService],
  exports: [TypeOrmModule],
})
export class ListModule {}
