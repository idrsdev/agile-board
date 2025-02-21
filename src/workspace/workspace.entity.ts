import { User } from '../auth/user.entity';
import { Board } from '../board/board.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserWorkspace } from './user-workspace.entity';

@Entity()
export class Workspace {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => UserWorkspace, (userWorkspace) => userWorkspace.workspace)
  userWorkspaces: UserWorkspace[];

  @OneToMany(() => Board, (board) => board.workspace)
  boards: Board[];
}
