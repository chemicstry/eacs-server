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
}
Object.defineProperty(exports, "__esModule", { value: true });
const lowdb_1 = __importDefault(require("lowdb"));
const FileAsync_1 = __importDefault(require("lowdb/adapters/FileAsync"));
const Log_1 = require("./Log");
const shortid_1 = __importDefault(require("shortid"));
class DB {
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
    authUID(UID, permission) {
        return __awaiter(this, void 0, void 0, function* () {
            // Find groups with permission
            let groups = yield this.db.get('groups').filter(g => g.permissions.includes(permission)).value();
            if (!groups.length)
                return false;
            // Find user
            let user = yield this.db.get('users').filter(u => {
                // has UID and is part of one of the groups
                return u.tags.includes(UID) &&
                    u.groups.some((g) => groups.find((gi) => gi.name == g));
            }).value();
            if (user.length)
                return true;
            else
                return false;
        });
    }
    getUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.get('users');
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
            return yield this.db.get('groups');
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
}
exports.default = DB;
