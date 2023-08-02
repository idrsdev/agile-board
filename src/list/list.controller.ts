import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { ListService } from './list.service';
import { CreateListDto, UpdateListDto } from './list.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('List')
@Controller('lists')
export class ListController {
  // TODO: Check for permissions here before allowing these actions
  constructor(private readonly listService: ListService) {}

  @Post()
  async createList(@Body() createListDto: CreateListDto) {
    const newList = await this.listService.createList(createListDto);
    return { message: 'List created successfully', data: newList };
  }

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

  @Delete(':id')
  async deleteList(@Param('id') listId: number) {
    await this.listService.deleteList(listId);
    return { message: 'List Deleted Successfully' };
  }
}
