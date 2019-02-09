import { Table, Model, Column, ForeignKey, PrimaryKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';

@Table
export class Tag extends Model<Tag> {
  @PrimaryKey
  @Column
  uid!: string;

  @PrimaryKey
  @ForeignKey(() => User)
  @Column
  userId!: number;

  @BelongsTo(() => User)
  user!: User;
}
