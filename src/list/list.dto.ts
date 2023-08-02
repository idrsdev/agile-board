import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateListDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  boardId: number;
}

export class UpdateListDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;
}
