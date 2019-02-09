import { Model, Table, PrimaryKey, AutoIncrement, Column, CreatedAt, DataType } from 'sequelize-typescript';

@Table
export class Event extends Model<Event> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @CreatedAt
  date!: Date;

  @Column
  event!: string;

  @Column
  identifier!: string;

  @Column
  userId!: number;

  @Column(DataType.TEXT)
  data!: string;
}
