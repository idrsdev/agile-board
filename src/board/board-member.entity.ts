import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Board } from './board.entity';
import { User } from 'src/auth/user.entity';
import { BoardMemberType } from './board-member-type.enum';

@Entity()
export class BoardMember {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Board, (board) => board.members, {
    onDelete: 'CASCADE',
  })
  board: Board;

  @ManyToOne(() => User)
  user: User;

  @Column({ enum: BoardMemberType, default: BoardMemberType.MEMBER })
  role: BoardMemberType;

  @Column({ default: false })
  isAdmin: boolean;
}
