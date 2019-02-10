import { Model } from 'sequelize-typescript';
import { Group } from './Group';
export declare class GroupPermission extends Model<GroupPermission> {
    permission: string;
    groupId: number;
    group: Group;
}
