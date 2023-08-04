import {
  IsEnum,
  IsNotIn,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { BoardMemberType } from '../board-member-type.enum';
import { IsAllowedRole } from '../decorator/is-allowed-role.decorator';

export class BoardMemberDto {
  @IsOptional()
  @IsString()
  @IsAllowedRole()
  role?: BoardMemberType;
}
