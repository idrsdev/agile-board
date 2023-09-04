import { Board } from '../board/board.entity';
import { Card } from '../card/card.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class List {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ default: 0 })
  position: number;

  @OneToMany(() => Card, (card) => card.list)
  cards: Card[];

  @ManyToOne(() => Board, (board) => board.lists)
  board: Board;
}
