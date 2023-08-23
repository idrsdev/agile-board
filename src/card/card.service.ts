import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from './card.entity';
import { Repository } from 'typeorm';
import { CardDetailsDto, CreateCardDto, UpdateCardDto } from './card.dto';
import { List } from 'src/list/list.entity';
import { CardAssignment } from './card-assignment.entity';
import { User } from 'src/auth/user.entity';

// TODO: Add Permissions Check through out just like board module
// TODO: Add JsDocs comments
// TODO: Add mising functionality for example card positioning etc

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    @InjectRepository(CardAssignment)
    private readonly cardAssignmentRepository: Repository<CardAssignment>,
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
    const { title, description, coverColor } = updateCardDto;
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

    if (coverColor) {
      card.coverColor = coverColor;
    }

    return this.cardRepository.save(card);
  }

  async getCardDetails(cardId: number): Promise<CardDetailsDto> {
    const card = await this.cardRepository.findOne({
      where: {
        id: cardId,
      },
      relations: {
        comments: true,
        assignments: true,
        // attachments: true,
      },
    });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    const cardDetails: CardDetailsDto = {
      id: card.id,
      title: card.title,
      description: card.description,
      // attachments: card.attachments,
      comments: card.comments,
    };

    return cardDetails;
  }

  async assignCardToUser(cardId: number, UserId: number): Promise<void> {
    const card = await this.cardRepository.findOne({
      where: {
        id: cardId,
      },
    });

    const user = await this.userRepository.findOne({
      where: {
        id: UserId,
      },
    });

    if (!card || !user) {
      throw new NotFoundException('User or Card not found');
    }

    const assignment = this.cardAssignmentRepository.create({
      card,
      user,
    });

    await this.cardAssignmentRepository.save(assignment);
  }

  async removeCardAssignment(cardId: number, userId: number): Promise<void> {
    await this.cardAssignmentRepository.delete({
      card: { id: cardId },
      user: { id: userId },
    });
  }

  async deleteCard(cardId: number): Promise<void> {
    await this.cardRepository.delete(cardId);
  }
}
