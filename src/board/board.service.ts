import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from './board.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { BoardVisibility } from './board-visibility.enum';
import { BoardMember } from './board-member.entity';
import { UserRepository } from 'src/auth/user.repository';
import { WorkspaceRepository } from 'src/workspace/workspace.repository';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    @InjectRepository(BoardMember)
    private readonly boardMemberRepository: Repository<BoardMember>,
    private readonly userRepository: UserRepository,
    private readonly workspaceRepository: WorkspaceRepository,
    private dataSource: DataSource,
  ) {}

  async createBoard(
    createBoardDto: CreateBoardDto,
    workspaceId: number,
    createdBy: number,
  ): Promise<Board> {
    const isMember = await this.workspaceRepository.exist({
      where: {
        id: workspaceId,
        createdBy: {
          id: createdBy,
        },
      },
    });

    if (!isMember) {
      throw new ForbiddenException(
        "You don't have permission to create a board in this workspace",
      );
    }

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    const user = await this.userRepository.findOne({
      where: { id: createdBy },
    });

    const { title, visibility } = createBoardDto;
    const board = new Board();
    board.title = title;
    board.visibility = visibility;
    board.workspace = workspace;
    board.createdBy = user;

    return this.boardRepository.save(board);
  }

  async updateBoard(
    boardId: number,
    updateBoardDto: UpdateBoardDto,
    userId: number,
  ): Promise<Board> {
    const { title, visibility } = updateBoardDto;

    const board = await this.boardRepository.findOne({
      where: {
        id: boardId,
      },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    if (!(await this.hasBoardPermission(boardId, userId))) {
      throw new ForbiddenException(
        "You don't have permission to update this board",
      );
    }

    if (title) {
      board.title = title;
    }

    if (visibility) {
      board.visibility = visibility;
    }

    return this.boardRepository.save(board);
  }

  async deleteBoard(boardId: number, userId: number): Promise<void> {
    const board = await this.boardRepository.findOne({
      where: {
        id: boardId,
      },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    if (!(await this.hasBoardPermission(boardId, userId))) {
      throw new ForbiddenException(
        "You don't have permission to delete this board",
      );
    }

    await this.boardRepository.delete(boardId);
  }

  async getBoardById(boardId: number, userId: number) {
    const board = await this.boardRepository
      .createQueryBuilder('board')
      // TODO: check this once the list module is done
      .leftJoinAndSelect('board.lists', 'list')
      .leftJoinAndSelect('board.cards', 'card')
      .leftJoinAndSelect('board.members', 'member')
      .leftJoinAndSelect('board.workspace', 'workspace')
      .where('board.id = :boardId', { boardId })
      .getOne();

    if (!board) {
      throw new NotFoundException('Board not found');
    }
    const workspaceId = board.workspace.id;

    if (board.visibility === BoardVisibility.PUBLIC) {
      return board;
    }

    const isMemberOfWorkspace = await this.workspaceRepository.exist({
      where: {
        id: workspaceId,
        createdBy: {
          id: userId,
        },
      },
    });

    const isMemberOfBoard = board.members.some(
      (member) => member.id === userId,
    );

    if (
      board.visibility === BoardVisibility.WORKSPACE &&
      !isMemberOfWorkspace
    ) {
      throw new ForbiddenException(
        "You don't have permission to access this board",
      );
    } else if (
      board.visibility === BoardVisibility.PRIVATE &&
      !isMemberOfBoard
    ) {
      throw new ForbiddenException(
        "You don't have permission to access this board",
      );
    }

    return board;
  }

  async addMemberToBoard(boardId: number, userId: number): Promise<void> {
    const board = await this.boardRepository.findOne({
      where: {
        id: boardId,
      },
      relations: {
        workspace: true,
        createdBy: true,
      },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    // Check if the user is a workspace admin or board admin
    const isWorkspaceAdmin = await this.isWorkspaceAdmin(
      board.workspace.id,
      userId,
    );
    const isBoardAdmin = await this.isBoardAdmin(board.createdBy.id, userId);

    if (!isWorkspaceAdmin && !isBoardAdmin) {
      throw new ForbiddenException(
        "You don't have permission to add a member to this board",
      );
    }

    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const boardMember = new BoardMember();
    boardMember.board = board;
    boardMember.user = user;

    await this.boardMemberRepository.save(boardMember);
  }

  async removeMemberFromBoard(boardId: number, userId: number): Promise<void> {
    const board = await this.boardRepository.findOne({
      where: {
        id: boardId,
      },
      relations: {
        workspace: true,
        createdBy: true,
      },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    const isWorkspaceAdmin = await this.isWorkspaceAdmin(
      board.workspace.id,
      userId,
    );
    const isBoardAdmin = await this.isBoardAdmin(board.createdBy.id, userId);

    if (!isWorkspaceAdmin && !isBoardAdmin) {
      throw new ForbiddenException(
        "You don't have permission to remove a member from this board",
      );
    }

    const result = await this.boardMemberRepository.delete({
      board: { id: boardId },
      user: { id: userId },
    });

    if (result.affected === 0) {
      throw new NotFoundException('Board member not found');
    }
  }

  private async isWorkspaceAdmin(
    workspaceId: number,
    userId: number,
  ): Promise<boolean> {
    const workspace = await this.workspaceRepository
      .createQueryBuilder('workspace')
      .leftJoin('workspace.createdBy', 'user')
      .where('workspace.id = :workspaceId', { workspaceId })
      .andWhere('user.id = :userId', { userId })
      .getCount();

    return workspace > 0;
  }

  private async isBoardAdmin(
    boardCreatorId: number,
    userId: number,
  ): Promise<boolean> {
    const board = await this.boardRepository
      .createQueryBuilder('board')
      .leftJoin('board.createdBy', 'user')
      .where('board.createdBy = :boardCreatorId', { boardCreatorId })
      .andWhere('user.id = :userId', { userId })
      .getCount();

    return board > 0;
  }

  private async hasBoardPermission(
    boardId: number,
    userId: number,
  ): Promise<boolean> {
    const count = await this.boardRepository
      .createQueryBuilder('board')
      .leftJoin('board.createdBy', 'user')
      .leftJoin('board.members', 'board_member')
      .where('board.id = :boardId', { boardId })
      .andWhere(
        '(board.createdBy = : userId OR (board_member.user = :userId AND (board_member.role = "admin" OR board_member.role = "member")))',
        { userId },
      )
      .getCount();

    return count > 0;
  }

  //   async hasBoardPermission(boardId: number, userId: number): Promise<boolean> {
  //     const query = `
  //     SELECT COUNT(*) as count
  //     FROM board
  //     WHERE id = $1 AND (created_by = $2 OR EXISTS(
  //         SELECT 1
  //         FROM board_member
  //         WHERE board_id = $1 AND user_id = $2 AND (role = 'admin' OR role='member')
  //     ))`;

  //     const conn = this.dataSource.manager.connection;
  //     const result = await conn.query(query, [boardId, userId]);
  //     const count = result[0].count;

  //     return count > 0;
  //   }
}
