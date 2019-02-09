import { Table, Model, ForeignKey, BelongsTo, Column, PrimaryKey } from 'sequelize-typescript';
import { Group } from './Group';
import { User } from './User';

@Table
export class UserGroup extends Model<UserGroup> {
  @PrimaryKey
  @ForeignKey(() => Group)
  @Column
  groupId!: number;

  @PrimaryKey
  @ForeignKey(() => User)
  @Column
  userId!: number;
}
