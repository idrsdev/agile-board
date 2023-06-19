import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Token } from './token/token.entity';
import { Workspace } from 'src/workspace/workspace.entity';
import { Role } from './roles/role.entity';
import { Board } from 'src/board/board.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({
    select: false,
  })
  password: string;

  @Column({ default: false })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Workspace, (workspace) => workspace.createdBy)
  createdWorkspaces: Workspace[];

  @OneToMany(() => Board, (Board) => Board.createdBy)
  boards: Board[];

  @ManyToMany(() => Workspace, (workspace) => workspace.members)
  workspaces: Workspace[];

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'user_role',
    joinColumn: {
      name: 'userId', // Name of the column in the join table that references the User entity
      referencedColumnName: 'id', // Name of the referenced column in the User entity
    },
    inverseJoinColumn: {
      name: 'roleId', // Name of the column in the join table that references the Role entity
      referencedColumnName: 'id', // Name of the referenced column in the Role entity
    },
  })
  roles: Role[];
}
