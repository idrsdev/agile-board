import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Board } from '../board.entity';
import { BoardMemberType } from '../board-member-type.enum';
import { WorkspaceService } from 'src/workspace/workspace.service';

@Injectable()
export class BoardAclService {
  constructor(
    private dataSource: DataSource,
    private readonly workspaceService: WorkspaceService,
  ) {}

  /**
   * Check if a user is the owner or an admin of a board.
   *
   * @param boardId - The ID of the board to check.
   * @param userId - The ID of the user to check.
   * @returns `true` if the user is the owner or an admin, otherwise `false`.
   */
  async checkUserIsOwnerOrAdmin(
    boardId: number,
    userId: number,
  ): Promise<boolean> {
    try {
      const connection = this.dataSource.manager.connection;

      const isOwnerOrAdmin = await connection
        .createQueryBuilder()
        .select('board.id')
        .from(Board, 'board')
        .leftJoinAndSelect('board.members', 'boardMember')
        .where(
          '(board.id = :boardId AND boardMember.userId = :userId AND (boardMember.role = :roleOwner OR boardMember.role = :roleAdmin))',
          {
            boardId,
            userId,
            roleOwner: BoardMemberType.OWNER,
            roleAdmin: BoardMemberType.ADMIN,
          },
        )
        .getCount();

      if (isOwnerOrAdmin > 0) {
        return true;
      }

      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  /**
   * Check if a user is an admin of a board.
   *
   * @param boardId - The ID of the board to check.
   * @param userId - The ID of the user to check.
   * @returns `true` if the user is an admin, otherwise `false`.
   */
  async checkUserIsBoardAdmin(
    boardId: number,
    userId: number,
  ): Promise<boolean> {
    const connection = this.dataSource.manager.connection;

    const isAdmin = await connection
      .createQueryBuilder()
      .select('board.id')
      .from(Board, 'board')
      .leftJoinAndSelect('board.members', 'boardMember')
      .where(
        '(board.id = :boardId AND boardMember.userId = :userId AND boardMember.role = :roleOwner)',
        {
          boardId,
          userId,
          roleOwner: BoardMemberType.OWNER,
        },
      )
      .getCount();

    return isAdmin > 0;
  }

  async checkUserHasBoardPermissions(
    workspaceId: number,
    boardId: number,
    userId: number,
  ): Promise<boolean> {
    const isWorkspaceAdminOrOwner =
      await this.workspaceService.checkUserIsOwnerOrAdmin(workspaceId, userId);

    const isBoardAdminOrOwner = await this.checkUserIsOwnerOrAdmin(
      boardId,
      userId,
    );

    return isWorkspaceAdminOrOwner || isBoardAdminOrOwner;
  }
}
