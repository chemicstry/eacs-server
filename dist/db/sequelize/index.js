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
const sequelize_typescript_1 = require("sequelize-typescript");
const Log_1 = require("Log");
const User_1 = require("./models/User");
const Tag_1 = require("./models/Tag");
const Group_1 = require("./models/Group");
const GroupPermission_1 = require("./models/GroupPermission");
const path_1 = __importDefault(require("path"));
const UserGroup_1 = require("./models/UserGroup");
const Event_1 = require("./models/Event");
class SequelizeDB {
    constructor(config) {
        this.initDatabase(config);
    }
    initDatabase(config) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.db = new sequelize_typescript_1.Sequelize(Object.assign({}, config, { modelPaths: [path_1.default.join(__dirname, "models")] }));
                yield this.db.authenticate();
                yield this.db.sync();
            }
            catch (e) {
                Log_1.Log.error("Databse init failed.", e);
                process.exit(1);
            }
        });
    }
    findUserIdByTag(UID) {
        return __awaiter(this, void 0, void 0, function* () {
            var tag = yield Tag_1.Tag.findOne({
                include: [User_1.User],
                where: {
                    uid: UID
                }
            });
            if (!tag.user)
                throw new Error(`User with tag ${UID} not found`);
            return tag.user.id.toString();
        });
    }
    getUserPermissions(sUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            let userId = parseInt(sUserId);
            var permissions = yield GroupPermission_1.GroupPermission.findAll({
                include: [{
                        model: Group_1.Group,
                        required: true,
                        include: [{
                                model: UserGroup_1.UserGroup,
                                required: true,
                                where: {
                                    userId
                                }
                            }]
                    }]
            });
            return permissions.map(permission => permission.permission);
        });
    }
    /*public async authUID(UID: string, permission: string): Promise<IUser|null>
    {
      var user = await User.findOne({
        include: [{
          model: Tag,
          where: {
            uid: UID
          }
        }, {
          model: Group,
          include: [{
            model: GroupPermission,
            where: {
              permission: permission
            }
          }]
        }]
      });
  
      console.log(user);
  
      return null;
    }*/
    getUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            var dbusers = yield User_1.User.findAll({
                include: [Tag_1.Tag, Group_1.Group]
            });
            var users = [];
            dbusers.forEach((user) => {
                users.push({
                    id: user.id.toString(),
                    name: user.name,
                    tags: user.tags.map(tag => tag.uid),
                    groups: user.groups.map(group => group.name)
                });
            });
            return users;
        });
    }
    upsertUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var id = parseInt(data.id);
            yield this.db.transaction({ autocommit: false }, (transaction) => __awaiter(this, void 0, void 0, function* () {
                if (isNaN(id)) {
                    // Create new user
                    var user = yield User_1.User.create({
                        name: data.name
                    }, { transaction });
                    // Get newly inserted id
                    id = user.id;
                }
                else {
                    // Update existing user
                    yield User_1.User.update({
                        name: data.name
                    }, {
                        where: { id },
                        transaction
                    });
                    // Delete existing group relations
                    yield UserGroup_1.UserGroup.destroy({
                        where: {
                            userId: id
                        },
                        transaction
                    });
                    // Delete existing tags
                    yield Tag_1.Tag.destroy({
                        where: {
                            userId: id
                        },
                        transaction
                    });
                }
                // Associate groups, firstly by translating group name to id
                for (let name of data.groups) {
                    var group = yield Group_1.Group.findOne({
                        where: { name },
                        transaction
                    });
                    if (!group)
                        throw new Error(`Group ${name} not found in database`);
                    yield UserGroup_1.UserGroup.create({
                        userId: id,
                        groupId: group.id
                    }, { transaction });
                }
                // Insert new tags
                for (let tag of data.tags) {
                    yield Tag_1.Tag.create({
                        uid: tag,
                        userId: id
                    }, { transaction });
                }
            }));
        });
    }
    deleteUser(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            var id = parseInt(ids);
            User_1.User.destroy({
                where: { id }
            });
        });
    }
    getGroups() {
        return __awaiter(this, void 0, void 0, function* () {
            var dbgroups = yield Group_1.Group.findAll({
                include: [GroupPermission_1.GroupPermission]
            });
            var groups = [];
            dbgroups.forEach((group) => {
                groups.push({
                    id: group.id.toString(),
                    name: group.name,
                    permissions: group.permissions.map(p => p.permission)
                });
            });
            return groups;
        });
    }
    upsertGroup(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var id = parseInt(data.id);
            yield this.db.transaction({ autocommit: false }, (transaction) => __awaiter(this, void 0, void 0, function* () {
                if (isNaN(id)) {
                    // Create new group
                    var group = yield Group_1.Group.create({
                        name: data.name
                    }, { transaction });
                    // Get newly inserted id
                    id = group.id;
                }
                else {
                    // Update existing group
                    yield Group_1.Group.update({
                        name: data.name
                    }, {
                        where: { id },
                        transaction
                    });
                    // Delete existing permissions
                    yield GroupPermission_1.GroupPermission.destroy({
                        where: {
                            groupId: id
                        },
                        transaction
                    });
                }
                // Insert new permission
                for (let permission of data.permissions) {
                    yield GroupPermission_1.GroupPermission.create({
                        permission,
                        groupId: id
                    }, { transaction });
                }
            }));
        });
    }
    deleteGroup(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            var id = parseInt(ids);
            Group_1.Group.destroy({
                where: { id }
            });
        });
    }
    logEvent(event, identifier, userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Event_1.Event.create({
                event,
                identifier,
                userId,
                data: JSON.stringify(data)
            });
        });
    }
}
exports.default = SequelizeDB;
