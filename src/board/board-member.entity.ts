import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Board } from './board.entity';
import { User } from 'src/auth/user.entity';

@Entity()
export class BoardMember {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Board, (board) => board.members)
  board: Board;

  @ManyToOne(() => User)
  user: User;

  @Column({ default: false })
  isAdmin: boolean;
}
