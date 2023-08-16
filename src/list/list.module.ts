import { Module } from '@nestjs/common';
import { ListController } from './list.controller';
import { ListService } from './list.service';
import { List } from './list.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { BoardModule } from 'src/board/board.module';
import { BoardService } from 'src/board/board.service';
import { BoardAclService } from 'src/board/board-acl/board-acl.service';
import { AuthModule } from 'src/auth/auth.module';

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
