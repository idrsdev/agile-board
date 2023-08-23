import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Comment } from 'src/comment/comment.entity';

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
