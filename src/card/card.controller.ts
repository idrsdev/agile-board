import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto, UpdateCardDto } from './card.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Cards')
@Controller('cards')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post()
  async createCard(@Body() createCardDto: CreateCardDto) {
    const newCard = await this.cardService.createCard(createCardDto);
    return { message: 'Card created successfully', data: newCard };
  }

  @Patch(':id')
  async updateCard(
    @Param('id') cardId: number,
    @Body() updateCardDto: UpdateCardDto,
  ) {
    const updatedCard = await this.cardService.updateCard(
      updateCardDto,
      cardId,
    );
    return { message: 'Card updated successfully', data: updatedCard };
  }

  @Delete(':id')
  async deleteCard(@Param('id') cardId: number) {
    await this.cardService.deleteCard(cardId);
    return { message: 'Card deleted successfully' };
  }
}
