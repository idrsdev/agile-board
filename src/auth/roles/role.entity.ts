import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user.entity';
import { UserRole } from './role.enum';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  name: UserRole;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}
