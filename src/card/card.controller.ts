import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto, UpdateCardDto } from './card.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Cards')
@Controller('cards')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @ApiOperation({ summary: 'Create a new card' })
  @Post()
  async createCard(@Body() createCardDto: CreateCardDto) {
    const newCard = await this.cardService.createCard(createCardDto);
    return { message: 'Card created successfully', data: newCard };
  }

  @ApiOperation({ summary: 'Update a card' })
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

  @ApiOperation({ summary: 'Delete a card' })
  @Delete(':id')
  async deleteCard(@Param('id') cardId: number) {
    await this.cardService.deleteCard(cardId);
    return { message: 'Card deleted successfully' };
  }

  @ApiOperation({ summary: 'Get card details' })
  @Get(':id/details')
  async getCardDetails(@Param('id') cardId: number) {
    const cardDetails = await this.cardService.getCardDetails(cardId);
    return { message: 'Card details fetched successfully', data: cardDetails };
  }

  @ApiOperation({ summary: 'Assign a card to a user' })
  @Post(':id/assign/:userId')
  async assignCardToUser(
    @Param('id') cardId: number,
    @Param('userId') userId: number,
  ) {
    await this.cardService.assignCardToUser(cardId, userId);
    return { message: 'Card assigned to user successfully' };
  }

  @ApiOperation({ summary: 'Unassign a card from a user' })
  @Delete(':id/unassign/:userId')
  async unassignCardFromUser(
    @Param('id') cardId: number,
    @Param('userId') userId: number,
  ) {
    await this.cardService.removeCardAssignment(cardId, userId);
    return { message: 'Card unassigned from user successfully' };
  }
}
