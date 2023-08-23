import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto, UpdateCommentDto } from './comment.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUserId } from 'src/common/decorators/get-user-id.decorator';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';

@ApiTags('Comments')
@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiOperation({ summary: 'Create a new comment for a card' })
  @Post(':cardId')
  async createComment(
    @Param('cardId') cardId: number,
    @GetUserId() userId: number,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const newComment = await this.commentService.createComment(
      cardId,
      userId,
      createCommentDto,
    );
    return { message: 'Comment created successfully', data: newComment };
  }

  @ApiOperation({ summary: 'Update a comment' })
  @Patch(':id')
  async updateComment(
    @Param('id') commentId: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    const updatedComment = await this.commentService.updateComment(
      commentId,
      updateCommentDto,
    );
    return { message: 'Comment updated successfully', data: updatedComment };
  }

  @ApiOperation({ summary: 'Delete a comment' })
  @Delete(':id')
  async deleteComment(@Param('id') commentId: number) {
    await this.commentService.deleteComment(commentId);
    return { message: 'Comment deleted successfully' };
  }
}
