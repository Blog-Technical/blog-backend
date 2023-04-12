import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './index';

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ nullable: true })
  public title: string;

  @Column()
  public content: string;

  @Column('boolean', { default: false })
  public deleteSoft: boolean;

  @ManyToOne(() => User, (user: User) => user.articles)
  public createdBy: User;

  @CreateDateColumn()
  createdAt: Date;
}
