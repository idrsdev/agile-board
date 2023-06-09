import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
} from 'class-validator';

export class AddOrRemoveMemberDto {
  @ApiProperty()
  @IsOptional()
  // @IsNotEmpty()
  // @IsNumber()
  // @IsNumberString()
  workspaceId: number;

  @ApiProperty()
  @IsOptional()
  // @IsNotEmpty()
  // @IsNumberString()
  memberId: number;
}
