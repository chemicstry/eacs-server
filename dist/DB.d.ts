import lowdb from 'lowdb';
declare class DB {
    private db;
    constructor(dbFile: string);
    private initDatabase(dbFile);
    authUID(UID: String, permission: String): Promise<boolean>;
    getUsers(): Promise<lowdb.LoDashExplicitAsyncWrapper<any>>;
    upsertUser(data: any): Promise<void>;
    deleteUser(id: String): Promise<void>;
    getGroups(): Promise<lowdb.LoDashExplicitAsyncWrapper<any>>;
    upsertGroup(data: any): Promise<void>;
    deleteGroup(id: String): Promise<void>;
}
export default DB;
