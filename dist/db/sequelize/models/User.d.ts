import { Model } from 'sequelize-typescript';
import { Tag } from './Tag';
import { Group } from './Group';
export declare class User extends Model<User> {
    id: number;
    name: string;
    tags: Tag[];
    groups: Group[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
