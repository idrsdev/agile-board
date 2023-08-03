import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class AddOrRemoveMemberDto {
  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) =>
    typeof value === 'number' ? value : parseInt(value),
  )
  workspaceId: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) =>
    typeof value === 'number' ? value : parseInt(value),
  )
  memberId: number;
}
