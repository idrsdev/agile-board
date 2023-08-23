import { List } from 'src/list/list.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CardAssignment } from './card-assignment.entity';
import { Comment } from 'src/comment/comment.entity';

@Entity()
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ default: 1 })
  position: number;

  @Column({ nullable: true })
  coverColor: string;

  // @OneToMany(() => Attachment, (attachment) => attachment.card)
  // attachments: Attachment[];

  @OneToMany(() => Comment, (comment) => comment.card)
  comments: Comment[];

  @OneToMany(() => CardAssignment, (assignment) => assignment.card)
  assignments: CardAssignment[];

  @ManyToOne(() => List, (list) => list.cards)
  list: List;
}
