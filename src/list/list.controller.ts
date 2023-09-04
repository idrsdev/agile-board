import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ListService } from './list.service';
import { CreateListDto, UpdateListDto } from './list.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUserId } from '../common/decorators/get-user-id.decorator';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@ApiTags('List')
@UseGuards(JwtAuthGuard)
@Controller('lists')
export class ListController {
  constructor(private readonly listService: ListService) {}

  @ApiOperation({ summary: 'Create a new list' })
  @Post()
  async createList(
    @Body() createListDto: CreateListDto,
    @GetUserId() userId: number,
  ) {
    const newList = await this.listService.createList(createListDto, userId);
    return { message: 'List created successfully', data: newList };
  }

  @ApiOperation({ summary: 'Update an existing list' })
  @Patch(':id')
  async updateList(
    @Param('id') listId: number,
    @Body() updateListDto: UpdateListDto,
  ) {
    const updatedList = await this.listService.updateList(
      listId,
      updateListDto,
    );
    return { message: 'List updated successfully', data: updatedList };
  }

  @ApiOperation({ summary: 'Delete a list' })
  @Delete(':id')
  async deleteList(
    @Param('boardId') boardId: number,
    @Param('id') listId: number,
    @GetUserId() userId: number,
  ) {
    await this.listService.deleteList(boardId, userId, listId);
    return { message: 'List Deleted Successfully' };
  }

  @ApiOperation({ summary: 'Update list positions' })
  @Patch('update-positions')
  async updateListPositions(
    @Param('boardId') boardId: number,
    @Body() positions: { id: number; position: number }[],
  ) {
    await this.listService.updateListPositions(boardId, positions);
    return { message: 'List positions updated successfully' };
  }
}
