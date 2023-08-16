import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { List } from './list.entity';
import { Repository } from 'typeorm';
import { CreateListDto, UpdateListDto } from './list.dto';
import { BoardAclService } from 'src/board/board-acl/board-acl.service';
import { BoardService } from 'src/board/board.service';

@Injectable()
export class ListService {
  constructor(
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,
    private readonly boardService: BoardService,
    private readonly boardAclService: BoardAclService,
  ) {}

  /**
   * Create a new list in the board
   * @param {CreateListDto} createListDto - The data for creating a new list.
   * @returns {Promise<List>} - The created list
   */
  async createList(
    createListDto: CreateListDto,
    userId: number,
  ): Promise<List> {
    const { title, boardId } = createListDto;

    const board = await this.boardService.getBoardByIdWithRelations(boardId, {
      workspace: true,
    });

    const hasBoardPermissions =
      await this.boardAclService.checkUserHasBoardPermissions(
        board.workspace.id,
        boardId,
        userId,
      );

    if (hasBoardPermissions) {
      const newList = this.listRepository.create({
        title,
        board: {
          id: boardId,
        },
      });

      return this.listRepository.save(newList);
    }

    throw new ForbiddenException(
      "You don't have permission to create lists in this board",
    );
  }

  /**
   *
   * @param {number} listId - The id of the list to update
   * @param {UpdateListDto} updateListDto - The updated data for the list
   * @returns {Promise<List>} - The updated list
   * @throws {NotFoundException} - If the list with specified ID is not found
   */
  async updateList(
    listId: number,
    updateListDto: UpdateListDto,
  ): Promise<List> {
    const { title } = updateListDto;

    const list = await this.listRepository.findOne({
      where: {
        id: listId,
      },
    });

    if (!list) {
      throw new NotFoundException('List not found');
    }

    list.title = title;

    return this.listRepository.save(list);
  }

  /**
   * Delete a list.
   *
   * @param {number} boardId - The ID of the board containing the list.
   * @param {number} listId - The ID of the list to delete.
   * @param {number} userId - The ID of the user performing the action.
   * @returns {Promise<void>}
   * @throws {ForbiddenException} - If the user doesn't have permission to delete the list.
   */
  async deleteList(
    boardId: number,
    listId: number,
    userId: number,
  ): Promise<void> {
    const board = await this.boardService.getBoardByIdWithRelations(boardId, {
      workspace: true,
    });

    const hasBoardPermissions =
      await this.boardAclService.checkUserHasBoardPermissions(
        board.workspace.id,
        boardId,
        userId,
      );

    if (hasBoardPermissions) {
      await this.listRepository.delete(listId);
      return;
    }

    throw new ForbiddenException(
      "You don't have permission to delete lists in this board",
    );
  }

  /**
   * Update the positions of lists in a board.
   *
   * @param {number} boardId - The ID of the board containing the lists.
   * @param {Array<{ id: number; position: number }>} positions - The list positions to update.
   * @returns {Promise<void>}
   */
  async updateListPositions(
    boardId: number,
    positions: { id: number; position: number }[],
  ): Promise<void> {
    await Promise.all(
      positions.map(async (item) => {
        const list = await this.listRepository.findOne({
          where: {
            id: item.id,
            board: {
              id: boardId,
            },
          },
        });
        if (list) {
          list.position = item.position;
          await this.listRepository.save(list);
        }
      }),
    );
  }
}
