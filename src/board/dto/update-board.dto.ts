import { IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { BoardVisibility } from '../board-visibility.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBoardDto {
  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  title?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(BoardVisibility)
  visibility?: BoardVisibility;
}
