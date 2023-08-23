import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from './board.entity';
import { FindOptionsRelations, Repository } from 'typeorm';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { BoardVisibility } from './board-visibility.enum';
import { BoardMember } from './board-member.entity';
import { UserRepository } from 'src/auth/user.repository';
import { WorkspaceRepository } from 'src/workspace/workspace.repository';
import { WorkspaceService } from 'src/workspace/workspace.service';
import { BoardMemberType } from './board-member-type.enum';
import { WorkspaceRole } from 'src/workspace/workspace-role.enum';
import { List } from 'src/list/list.entity';
import { Workspace } from 'src/workspace/workspace.entity';
import { BoardAclService } from './board-acl/board-acl.service';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    @InjectRepository(BoardMember)
    private readonly boardMemberRepository: Repository<BoardMember>,

    private readonly userRepository: UserRepository,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly workspaceService: WorkspaceService,
    private readonly boardAclService: BoardAclService,
  ) {}

  /**
   * Create a new board within a workspace.
   *
   * @param createBoardDto - The data to create the board.
   * @param workspaceId - The ID of the workspace in which to create the board.
   * @param userId - The ID of the user performing the action.
   * @throws {UnauthorizedException} if the user doesn't have permission to create a board.
   * @returns The newly created board.
   */
  async createBoard(
    createBoardDto: CreateBoardDto,
    workspaceId: number,
    userId: number,
  ): Promise<any> {
    const isWorkspaceAdminOrOwner =
      await this.workspaceService.checkUserIsOwnerOrAdmin(workspaceId, userId);

    if (!isWorkspaceAdminOrOwner) {
      throw new UnauthorizedException(
        'Only the owner or admin can perform this action',
      );
    }

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    const { title, visibility } = createBoardDto;
    const board = new Board();
    board.title = title;
    board.visibility = visibility;
    board.workspace = workspace;

    const createdBoard = await this.boardRepository.save(board);

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (user) {
      const boardMember = new BoardMember();
      boardMember.board = board;
      boardMember.user = user;
      boardMember.role = BoardMemberType.OWNER;
      boardMember.isAdmin = true;

      await this.boardMemberRepository.save(boardMember);
    }

    return createdBoard;
  }

  /**
   * Update a board's details.
   *
   * @param boardId - The ID of the board to update.
   * @param updateBoardDto - The data to update the board.
   * @param userId - The ID of the user performing the action.
   * @throws {ForbiddenException} if the user doesn't have permission to update the board.
   * @returns The updated board.
   */
  async updateBoard(
    boardId: number,
    updateBoardDto: UpdateBoardDto,
    userId: number,
  ): Promise<Board> {
    const { title, visibility } = updateBoardDto;

    // checkUserHasBoardPermissions;

    const board = await this.getBoardByIdWithRelations(boardId, {
      workspace: true,
    });

    const hasWorkspaceEditAccess =
      await this.workspaceService.checkUserIsOwnerOrAdmin(
        board.workspace.id,
        userId,
      );

    if (
      hasWorkspaceEditAccess ||
      (await this.boardAclService.checkUserIsOwnerOrAdmin(boardId, userId))
    ) {
      if (title) {
        board.title = title;
      }

      if (visibility) {
        board.visibility = visibility;
      }

      return this.boardRepository.save(board);
    }

    throw new ForbiddenException(
      "You don't have permission to update this board",
    );
  }

  /**
   * Delete a board.
   *
   * @param boardId - The ID of the board to delete.
   * @param userId - The ID of the user performing the action.
   * @throws {ForbiddenException} if the user doesn't have permission to delete the board.
   */
  async deleteBoard(boardId: number, userId: number): Promise<void> {
    const board = await this.getBoardByIdWithRelations(boardId, {
      workspace: true,
    });

    const isWorkspaceAdminOrOwner =
      await this.workspaceService.checkUserIsOwnerOrAdmin(
        board.workspace.id,
        userId,
      );

    const isBoardAdmin = await this.boardAclService.checkUserIsBoardAdmin(
      boardId,
      userId,
    );

    if (isWorkspaceAdminOrOwner || isBoardAdmin) {
      await this.boardRepository.delete(boardId);
      return;
    }

    throw new ForbiddenException(
      "You don't have permission to delete this board",
    );
  }

  /**
   * Get a board by its ID along with specified relations.
   *
   * @param boardId - The ID of the board to retrieve.
   * @param userId - The ID of the user requesting the board.
   * @returns The retrieved board along with user roles.
   * @throws {NotFoundException} if the board with the specified ID is not found.
   * @throws {ForbiddenException} if the user doesn't have permission to access the board.
   */
  async getBoardById(boardId: number, userId: number): Promise<FlattenedBoard> {
    // @NOTE Close Board/Leave Board option depending on ownership
    const board = await this.boardRepository
      .createQueryBuilder('board')
      .leftJoinAndSelect('board.lists', 'list')
      .leftJoinAndSelect('list.cards', 'card')
      .leftJoinAndSelect('card.comments', 'comments') //@TODO: A separate endpoint to get card comments
      .leftJoinAndSelect('board.members', 'member')
      .leftJoinAndSelect('member.user', 'user')
      .leftJoinAndSelect('board.workspace', 'workspace')
      .where('board.id = :boardId', { boardId })
      .getOne();

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    const flattedMembers = board.members.map((member) => ({
      id: member.id,
      userId: member.user.id,
      name: member.user.name,
      email: member.user.email,
      role: member.role,
      isAdmin: member.isAdmin,
    }));

    const workspaceId = board.workspace.id;

    if (board.visibility === BoardVisibility.PUBLIC) {
      return {
        ...board,
        members: [],
        boardRole: null,
        workspaceRole: null,
      };
    }

    const isMemberOfWorkspace =
      await this.workspaceService.checkUserIsMemberOfWorkspace(
        workspaceId,
        userId,
      );

    const isMemberOfBoard = flattedMembers.find(
      (member) => member.userId === userId,
    );

    let boardRole: BoardMemberType | null = null;
    let workspaceRole: WorkspaceRole | null = null;

    if (isMemberOfBoard) {
      boardRole = isMemberOfBoard.role;
    }

    if (isMemberOfWorkspace) {
      workspaceRole = await this.workspaceService.getUserWorkspaceRole(
        workspaceId,
        userId,
      );
    }

    if (
      (board.visibility === BoardVisibility.WORKSPACE &&
        !isMemberOfWorkspace) ||
      (board.visibility === BoardVisibility.PRIVATE && !isMemberOfBoard)
    ) {
      throw new ForbiddenException(
        "You don't have permission to access this board",
      );
    }

    return { ...board, members: flattedMembers, boardRole, workspaceRole };
  }

  /**
   * Get the list of members for a specific board.
   *
   * @param {number} boardId - The ID of the board.
   * @param {number} userId - The ID of the user making request.
   * @returns {Promise<{ members: FlattenedMember[] }>} The list of board members.
   * @throws {NotFoundException} If the board with the specified ID is not found.
   * @throws {ForbiddenException} If the user doesn't have permission to access the board.
   */
  async getBoardMembers(
    boardId: number,
    userId: number,
  ): Promise<FlattenedMember[]> {
    const board = await this.getBoardByIdWithRelations(boardId, {
      members: {
        user: true,
      },
      workspace: true,
    });

    const flattedMembers = board.members.map((member) => ({
      id: member.id,
      userId: member.user.id,
      name: member.user.name,
      email: member.user.email,
      role: member.role,
      isAdmin: member.isAdmin,
    }));

    const isMemberOfWorkspace =
      await this.workspaceService.checkUserIsMemberOfWorkspace(
        board.workspace.id,
        userId,
      );

    const isMemberOfBoard = flattedMembers.find(
      (member) => member.userId === userId,
    );
    if (!isMemberOfBoard && !isMemberOfWorkspace) {
      throw new ForbiddenException(
        "You don't have permission to view member list",
      );
    }

    const boardMembers: FlattenedMember[] = board.members.map((member) => ({
      id: member.id,
      userId: member.user.id,
      name: member.user.name,
      email: member.user.email,
      role: member.role,
      isAdmin: member.isAdmin,
    }));

    return boardMembers;
  }

  /**
   * Add a member to a board.
   *
   * @param boardId - The ID of the board to add the member to.
   * @param userId - The ID of the user to add as a member.
   * @param role - The role of the member being added (default: 'member).
   * @throws {ForbiddenException} if the user doesn't have permission to add a member.
   */

  async addMemberToBoard(
    boardId: number,
    userId: number,
    role: BoardMemberType = BoardMemberType.MEMBER,
  ): Promise<BoardMember> {
    const board = await this.getBoardByIdWithRelations(boardId, {
      workspace: true,
    });

    const isWorkspaceAdminOrOwner =
      await this.workspaceService.checkUserIsOwnerOrAdmin(
        board.workspace.id,
        userId,
      );

    const isBoardAdminOrOwner =
      await this.boardAclService.checkUserIsOwnerOrAdmin(board.id, userId);

    if (!isWorkspaceAdminOrOwner && !isBoardAdminOrOwner) {
      throw new ForbiddenException(
        "You don't have permission to add a member to this board",
      );
    }

    // I think now we don't need to explicitly check for user existence
    const existingMember = await this.boardMemberRepository.findOne({
      where: {
        board: {
          id: board.id,
        },
        user: {
          id: userId,
        },
      },
    });

    if (existingMember) {
      throw new ConflictException('User is already a member of this board');
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
    if (role) boardMember.role = role;

    return await this.boardMemberRepository.save(boardMember);
  }

  /**
   * Remove a member from a board.
   *
   * @param boardId - The ID of the board to remove the member from.
   * @param userId - The ID of the user to remove from the board.
   * @throws {ForbiddenException} if the user doesn't have permission to remove a member.
   * @throws {NotFoundException} if the board member is not found.
   */
  async removeMemberFromBoard(boardId: number, userId: number): Promise<void> {
    const board = await this.getBoardByIdWithRelations(boardId, {
      workspace: true,
    });

    const isWorkspaceAdminOrOwner =
      await this.workspaceService.checkUserIsOwnerOrAdmin(
        board.workspace.id,
        userId,
      );

    const isBoardAdminOrOwner =
      await this.boardAclService.checkUserIsOwnerOrAdmin(board.id, userId);

    if (!isWorkspaceAdminOrOwner && !isBoardAdminOrOwner) {
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

  /**
   * Get a board by its ID along with specified relations.
   *
   * @param boardId - The ID of the board to retrieve.
   * @param relations - Optional relations to load along with the board.
   * @throws {NotFoundException} if the board with the specified ID is not found.
   * @returns The retrieved board with specified relations.
   */
  async getBoardByIdWithRelations(
    boardId: number,
    relations?: FindOptionsRelations<Board>,
  ): Promise<Board> {
    const options = {
      where: { id: boardId },
      relations: {
        ...relations,
      },
    };

    const board = await this.boardRepository.findOne(options);

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    return board;
  }
}

export interface FlattenedBoard {
  id: number;
  title: string;
  visibility: BoardVisibility;
  lists: List[];
  members: FlattenedMember[];
  workspace: Workspace;
  boardRole: BoardMemberType | null;
  workspaceRole: WorkspaceRole | null;
}

export interface FlattenedMember {
  id: number;
  userId: number;
  name: string;
  email: string;
  role: BoardMemberType;
  isAdmin: boolean;
}
