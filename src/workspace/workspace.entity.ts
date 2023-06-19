import { User } from 'src/auth/user.entity';
import { Board } from 'src/board/board.entity';
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

@Entity()
export class Workspace {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.createdWorkspaces)
  createdBy: User;

  @OneToMany(() => Board, (board) => board.workspace)
  boards: Board[];

  @ManyToMany(() => User, (user) => user.workspaces)
  @JoinTable({
    name: 'workspace_members',
  })
  members: User[];
}
