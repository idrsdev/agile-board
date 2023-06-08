import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ResendActivationEmailDto {
  @ApiProperty()
  @IsNotEmpty()
  email: string;
}
