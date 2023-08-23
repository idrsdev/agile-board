// comment.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { CreateCommentDto, UpdateCommentDto } from './comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  /**
   * Create a new comment for a card.
   * @param {number} cardId - ID of the card to which the comment belongs.
   * @param {number} userId - The ID of the user making request.
   * @param {CreateCommentDto} createCommentDto - Data for creating a comment.
   * @returns {Promise<Comment>} - The created comment.
   */
  async createComment(
    cardId: number,
    userId: number,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    // Create a new comment
    const comment = this.commentRepository.create({
      text: createCommentDto.text,
      card: { id: cardId },
      author: { id: userId },
    });

    return this.commentRepository.save(comment);
  }

  /**
   * Update a comment.
   * @param {number} commentId - ID of the comment to update.
   * @param {UpdateCommentDto} updateCommentDto - Updated comment data.
   * @returns {Promise<Comment>} - The updated comment.
   * @throws {NotFoundException} - If the comment with specified ID is not found.
   */
  async updateComment(
    commentId: number,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    comment.text = updateCommentDto.text;

    return this.commentRepository.save(comment);
  }

  /**
   * Delete a comment.
   * @param {number} commentId - ID of the comment to delete.
   * @returns {Promise<void>}
   * @throws {NotFoundException} - If the comment with specified ID is not found.
   */
  async deleteComment(commentId: number): Promise<void> {
    await this.commentRepository.delete(commentId);
  }
}
