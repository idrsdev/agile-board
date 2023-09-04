import { Entity, ManyToOne, PrimaryGeneratedColumn, Column } from 'typeorm';
import { User } from '../auth/user.entity';
import { Workspace } from './workspace.entity';
import { WorkspaceRole } from './workspace-role.enum';

@Entity()
export class UserWorkspace {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.userWorkspaces, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Workspace, (workspace) => workspace.userWorkspaces, {
    onDelete: 'CASCADE',
  })
  workspace: Workspace;

  @Column({ type: 'enum', enum: WorkspaceRole })
  role: WorkspaceRole;
}
