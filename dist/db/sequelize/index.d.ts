import { User as IUser, Group as IGroup, Database } from 'db';
import { SequelizeConfig } from 'sequelize-typescript/lib/types/SequelizeConfig';
declare class SequelizeDB implements Database {
    private db;
    constructor(config: SequelizeConfig);
    private initDatabase;
    findUserIdByTag(UID: string): Promise<string>;
    getUserPermissions(sUserId: string): Promise<string[]>;
    getUsers(): Promise<IUser[]>;
    upsertUser(data: IUser): Promise<void>;
    deleteUser(ids: string): Promise<void>;
    getGroups(): Promise<IGroup[]>;
    upsertGroup(data: IGroup): Promise<void>;
    deleteGroup(ids: string): Promise<void>;
    logEvent(event: string, identifier: string, userId: string, data: object): Promise<void>;
}
export default SequelizeDB;
