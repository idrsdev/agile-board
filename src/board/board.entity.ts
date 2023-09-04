import { Workspace } from '../workspace/workspace.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../auth/user.entity';
import { BoardVisibility } from './board-visibility.enum';
import { BoardMember } from './board-member.entity';
import { List } from '../list/list.entity';

@Entity()
export class Board {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  visibility: BoardVisibility;

  @ManyToOne(() => User, (user) => user.boards)
  createdBy: User;

  @ManyToOne(() => Workspace, (workspace) => workspace.boards, {
    onDelete: 'CASCADE',
  })
  workspace: Workspace;

  @OneToMany(() => BoardMember, (boardMember) => boardMember.board)
  members: BoardMember[];

  @OneToMany(() => List, (list) => list.board)
  lists: List[];
}
