import { Board } from 'src/board/board.entity';
import { Card } from 'src/card/card.entity';
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

  @ManyToOne(() => Board)
  board: Board;

  @OneToMany(() => Card, (card) => card.list)
  cards: Card[];
}
