import { Database } from 'db';
declare class LowDB implements Database {
    private db;
    constructor(dbFile: string);
    private initDatabase;
    findUserIdByTag(UID: String): Promise<string>;
    getUserPermissions(userId: string): Promise<string[]>;
    getUsers(): Promise<any>;
    upsertUser(data: any): Promise<void>;
    deleteUser(id: string): Promise<void>;
    getGroups(): Promise<any>;
    upsertGroup(data: any): Promise<void>;
    deleteGroup(id: string): Promise<void>;
    logEvent(event: string, identifier: string, userId: string, data: object): Promise<void>;
}
export default LowDB;
