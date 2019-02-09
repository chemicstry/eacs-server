import { Table, Model, PrimaryKey, AutoIncrement, Column, HasMany, BelongsToMany } from 'sequelize-typescript';
import { GroupPermission } from './GroupPermission';
import { User } from './User';
import { UserGroup } from './UserGroup';

@Table
export class Group extends Model<Group> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @Column
  name!: string;

  @HasMany(() => GroupPermission)
  permissions!: GroupPermission[];

  @HasMany(() => UserGroup)
  usergroups!: UserGroup[];

  @BelongsToMany(() => User, () => UserGroup)
  users!: User[];
}
