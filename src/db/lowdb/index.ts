import Lowdb, { LowdbAsync } from 'lowdb';
import FileAsync from 'lowdb/adapters/FileAsync';
import { Log } from 'Log';
import ShortId from 'shortid';
import { Database, Group, User } from 'db';

interface Event {
    date: number;
    event: string;
    identifier: string;
    userId: string;
    data: object;
}
  
interface DatabaseSchema {
    users: Array<User>;
    groups: Array<Group>;
    events: Array<Event>
}  

class LowDB implements Database {
    private db!: LowdbAsync<DatabaseSchema>;

    constructor(dbFile: string) {
        this.initDatabase(dbFile);
    }

    private async initDatabase(dbFile: string) {
        try {
            const adapter = new FileAsync<DatabaseSchema>(dbFile);
            this.db = await Lowdb(adapter);

            this.db.defaults({
                users: [],
                groups: [],
            }).write();
        } catch (e) {
            Log.error("Databse init failed.", e);
            process.exit(1);
        }
    }

    public async findUserIdByTag(UID: string) {
        let users = await this.db.get('users').filter(u => {
            return u.tags.includes(UID);
        }).value();

        if (!users.length)
            throw new Error(`User with tag ${UID} not found`);

        return users[0].id;
    }

    public async getUserPermissions(userId: string) {
        var user = await this.db.get('users').find({ id: userId }).value();

        // Find groups that user belongs to
        var groups = await this.db.get('groups').filter(g => {
            return user.groups.includes(g.name);
        }).value();

        // Append all group permissions to a single array
        var permissions: string[] = [];
        for (let g of groups)
            permissions = [...permissions, ...g.permissions];

        return permissions;
    }

    public async getUsers() {
        return await this.db.get('users').value();
    }

    public async upsertUser(data: any) {
        // Update if exists, create new otherwise
        if (data.id)
            this.db.get('users').find({ id: data.id }).assign(data).write();
        else
            this.db.get('users').push({ id: ShortId.generate(), ...data }).write();
    }

    public async deleteUser(id: string) {
        this.db.get('users').remove({ id }).write();
    }

    public async getGroups() {
        return await this.db.get('groups').value();
    }

    public async upsertGroup(data: any) {
        // Update if exists, create new otherwise
        if (data.id)
            this.db.get('groups').find({ id: data.id }).assign(data).write();
        else
            this.db.get('groups').push({ id: ShortId.generate(), ...data }).write();
    }

    public async deleteGroup(id: string) {
        this.db.get('groups').remove({ id }).write();
    }

    public async logEvent(event: string, identifier: string, userId: string, data: object) {
        await this.db.get('events').push({
            date: Date.now(),
            event,
            identifier,
            userId,
            data
        });
    }
}

export default LowDB;
