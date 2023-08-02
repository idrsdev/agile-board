import { Board } from 'src/board/board.entity';
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

  // TODO: Uncomment once, we have card entity
  //   @OneToMany(() => Card, (card) => card.list)
  //   cards: Card[];
}
