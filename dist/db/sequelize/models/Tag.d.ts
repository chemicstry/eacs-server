import { Model } from 'sequelize-typescript';
import { User } from './User';
export declare class Tag extends Model<Tag> {
    uid: string;
    userId: number;
    user: User;
}
