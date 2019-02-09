import { Model, Table, PrimaryKey, AutoIncrement, Column, HasMany, BelongsToMany } from 'sequelize-typescript';
import { Tag } from './Tag';
import { Group } from './Group';
import { UserGroup } from './UserGroup';

@Table
export class User extends Model<User> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @Column
  name!: string;
 
  @HasMany(() => Tag)
  tags!: Tag[];
 
  @BelongsToMany(() => Group, () => UserGroup)
  groups!: Group[];
}
