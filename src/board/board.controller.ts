import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { BoardService, FlattenedBoard } from './board.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { GetUserId } from 'src/common/decorators/get-user-id.decorator';
import { Board } from './board.entity';
import { UpdateBoardDto } from './dto/update-board.dto';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { BoardMember } from './board-member.entity';
import { BoardMemberDto } from './dto/board-member.dto';

@ApiTags('Boards')
@UseGuards(JwtAuthGuard)
@Controller('boards')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Post()
  async createBoard(
    @Body() createBoardDto: CreateBoardDto,
    @GetUserId() userId: number,
  ): Promise<Board> {
    const workspaceId = createBoardDto.workspaceId;
    return this.boardService.createBoard(createBoardDto, workspaceId, userId);
  }

  @Patch(':id')
  async updateBoard(
    @Param('id') boardId: number,
    @Body() updateBoardDto: UpdateBoardDto,
    @GetUserId() userId: number,
  ): Promise<Board> {
    return this.boardService.updateBoard(boardId, updateBoardDto, userId);
  }

  @Delete(':id')
  async deleteBoard(
    @Param('id') boardId: number,
    @GetUserId() userId: number,
  ): Promise<void> {
    return this.boardService.deleteBoard(boardId, userId);
  }

  @Get(':id')
  async getBoardById(
    @Param('id') boardId: number,
    @GetUserId() userId: number,
  ): Promise<FlattenedBoard> {
    return this.boardService.getBoardById(boardId, userId);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Get a list of board members' })
  @ApiParam({ name: 'id', description: 'Board ID' })
  @ApiResponse({
    status: 200,
    description: 'List of board members',
    type: [BoardMemberDto],
  })
  async getBoardMembers(
    @Param('id') boardId: number,
    @GetUserId() userId: number,
  ): Promise<BoardMemberDto[]> {
    return this.boardService.getBoardMembers(boardId, userId);
  }

  @Post(':id/members/:userId')
  async addMemberToBoard(
    @Param('id') boardId: number,
    @Param('userId') userId: number,
    @Body(new ValidationPipe({ transform: true }))
    boardMemberDto: BoardMemberDto,
  ): Promise<BoardMember> {
    return this.boardService.addMemberToBoard(
      boardId,
      userId,
      boardMemberDto.role,
    );
  }

  @Delete(':id/members/:userId')
  async removeMemberFromBoard(
    @Param('id') boardId: number,
    @Param('userId') userId: number,
  ): Promise<void> {
    return this.boardService.removeMemberFromBoard(boardId, userId);
  }
}
