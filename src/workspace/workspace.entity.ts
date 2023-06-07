import { User } from 'src/auth/user.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Workspace {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => User, (user) => user.createdWorkspaces)
  createdBy: User;

  @ManyToMany(() => User, (user) => user.workspaces)
  @JoinTable()
  members: User[];

  //   @OneToMany(() => Board, (user) => user.workspaces)
  //   boards: Board[];
}
