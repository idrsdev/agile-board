import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Card } from './card.entity';
import { User } from '../auth/user.entity';

@Entity()
export class CardAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Card, (card) => card.assignments)
  card: Card;

  @ManyToOne(() => User)
  user: User;
}
