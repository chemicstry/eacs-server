import { Table, Model, Column, ForeignKey, PrimaryKey, BelongsTo } from 'sequelize-typescript';
import { Group } from './Group';

@Table
export class GroupPermission extends Model<GroupPermission> {
  @PrimaryKey
  @Column
  permission!: string;

  @PrimaryKey
  @ForeignKey(() => Group)
  @Column
  groupId!: number;

  @BelongsTo(() => Group)
  group!: Group;
}
