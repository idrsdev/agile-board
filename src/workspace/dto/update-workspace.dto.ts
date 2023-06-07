import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateWorkspaceDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;
}
