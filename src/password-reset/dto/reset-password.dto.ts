import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ReqResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  userId: number;

  @ApiProperty()
  @IsNotEmpty()
  token: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;
}
