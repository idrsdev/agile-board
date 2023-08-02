import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { List } from './list.entity';
import { Repository } from 'typeorm';
import { CreateListDto, UpdateListDto } from './list.dto';

@Injectable()
export class ListService {
  constructor(
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,
  ) {}

  async createList(createListDto: CreateListDto): Promise<List> {
    const { title, boardId } = createListDto;
    // TODO: check what happens if board does not exist
    const newList = this.listRepository.create({
      title,
      board: {
        id: boardId,
      },
    });
    return this.listRepository.save(newList);
  }

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
    // TODO: throw an error if it does not exist

    list.title = title;

    return this.listRepository.save(list);
  }

  async deleteList(listId: number): Promise<void> {
    await this.listRepository.delete(listId);
  }
}
