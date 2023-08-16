import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from './card.entity';
import { Repository } from 'typeorm';
import { CreateCardDto, UpdateCardDto } from './card.dto';
import { List } from 'src/list/list.entity';

// TODO: Add Permissions Check through out just like board module
// TODO: Add JsDocs comments
// TODO: Add mising functionality for example card positioning etc

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,
  ) {}

  async createCard(createCardDto: CreateCardDto) {
    const { title, description, listId } = createCardDto;

    const list = await this.listRepository.findOne({
      where: {
        id: listId,
      },
    });

    if (!list) {
      throw new NotFoundException('List not found');
    }

    const newCard = this.cardRepository.create({
      title,
      description,
      list: { id: listId },
    });

    return this.cardRepository.save(newCard);
  }

  async updateCard(updateCardDto: UpdateCardDto, cardId: number) {
    const { title, description } = updateCardDto;
    const card = await this.cardRepository.findOne({
      where: {
        id: cardId,
      },
    });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    if (title) {
      card.title = title;
    }

    if (description) {
      card.description = description;
    }

    return this.cardRepository.save(card);
  }

  async deleteCard(cardId: number): Promise<void> {
    await this.cardRepository.delete(cardId);
  }
}
