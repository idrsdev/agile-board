import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class PaginationParamsDTO {
  @ApiProperty({ default: 10, required: false })
  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  limit: number;

  @ApiProperty({ default: 1, required: false })
  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  page: number;
}
