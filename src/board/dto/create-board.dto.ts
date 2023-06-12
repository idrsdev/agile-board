import { IsNotEmpty, IsEnum, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BoardVisibility } from '../board-visibility.enum';
export class CreateBoardDto {
  @ApiProperty()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsEnum(BoardVisibility)
  visibility: BoardVisibility;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  workspaceId: number;
}
