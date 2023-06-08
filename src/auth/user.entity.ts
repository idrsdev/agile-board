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

  @OneToOne(() => Token)
  @JoinColumn({ name: 'tokenId' })
  token: Token;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Workspace, (workspace) => workspace.createdBy)
  createdWorkspaces: Workspace[];

  @ManyToMany(() => Workspace, (workspace) => workspace.members)
  workspaces: Workspace[];
}
