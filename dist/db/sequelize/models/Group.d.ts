import { Model } from 'sequelize-typescript';
import { GroupPermission } from './GroupPermission';
import { User } from './User';
import { UserGroup } from './UserGroup';
export declare class Group extends Model<Group> {
    id: number;
    name: string;
    permissions: GroupPermission[];
    usergroups: UserGroup[];
    users: User[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
