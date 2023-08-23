import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  text: string;
}

export class UpdateCommentDto {
  @IsNotEmpty()
  @IsString()
  text: string;
}
