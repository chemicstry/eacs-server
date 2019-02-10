"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lowdb_1 = __importDefault(require("lowdb"));
const FileAsync_1 = __importDefault(require("lowdb/adapters/FileAsync"));
const Log_1 = require("Log");
const shortid_1 = __importDefault(require("shortid"));
class LowDB {
    constructor(dbFile) {
        this.initDatabase(dbFile);
    }
    initDatabase(dbFile) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const adapter = new FileAsync_1.default(dbFile);
                this.db = yield lowdb_1.default(adapter);
                this.db.defaults({
                    users: [],
                    groups: [],
                }).write();
            }
            catch (e) {
                Log_1.Log.error("Databse init failed.", e);
                process.exit(1);
            }
        });
    }
    findUserIdByTag(UID) {
        return __awaiter(this, void 0, void 0, function* () {
            let users = yield this.db.get('users').filter(u => {
                return u.tags.includes(UID);
            }).value();
            if (!users.length)
                throw new Error(`User with tag ${UID} not found`);
            return users[0].id;
        });
    }
    getUserPermissions(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var user = yield this.db.get('users').find({ id: userId }).value();
            // Find groups that user belongs to
            var groups = yield this.db.get('groups').filter(g => {
                return user.groups.includes(g.name);
            }).value();
            // Append all group permissions to a single array
            var permissions = [];
            for (let g of groups)
                permissions = [...permissions, ...g.permissions];
            return permissions;
        });
    }
    getUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.get('users').value();
        });
    }
    upsertUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // Update if exists, create new otherwise
            if (data.id)
                this.db.get('users').find({ id: data.id }).assign(data).write();
            else
                this.db.get('users').push(Object.assign({ id: shortid_1.default.generate() }, data)).write();
        });
    }
    deleteUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            this.db.get('users').remove({ id }).write();
        });
    }
    getGroups() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.get('groups').value();
        });
    }
    upsertGroup(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // Update if exists, create new otherwise
            if (data.id)
                this.db.get('groups').find({ id: data.id }).assign(data).write();
            else
                this.db.get('groups').push(Object.assign({ id: shortid_1.default.generate() }, data)).write();
        });
    }
    deleteGroup(id) {
        return __awaiter(this, void 0, void 0, function* () {
            this.db.get('groups').remove({ id }).write();
        });
    }
    logEvent(event, identifier, userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db.get('events').push({
                date: Date.now(),
                event,
                identifier,
                userId,
                data
            });
        });
    }
}
exports.default = LowDB;
