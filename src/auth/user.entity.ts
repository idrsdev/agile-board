import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './roles/role.entity';
import { Board } from '../board/board.entity';
import { UserWorkspace } from '../workspace/user-workspace.entity';

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

  @OneToMany(() => Board, (Board) => Board.createdBy)
  boards: Board[];

  @OneToMany(() => UserWorkspace, (userWorkspace) => userWorkspace.user)
  userWorkspaces: UserWorkspace[];

  // @NOTE
  // This role is to identify if it's a client or system administrator/user etc
  // The permission for workspaces and boards are handled separately
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
