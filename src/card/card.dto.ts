import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Comment } from '../comment/comment.entity';

export class CreateCardDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  listId: number;
}

export class UpdateCardDto {
  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  coverColor?: string;
}

export class CardDetailsDto {
  id: number;
  title: string;
  description: string;
  // attachments: Attachment[];
  comments: Comment[];
}

export class ReorderCardsDto {
  @ApiProperty()
  @IsNumber()
  listId: number;

  @ApiProperty()
  @IsArray()
  cardIds: number[];
}

export class MoveCardDto {
  @ApiProperty()
  @IsNumber()
  cardId: number;

  @ApiProperty()
  @IsNumber()
  newListId: number;
}
