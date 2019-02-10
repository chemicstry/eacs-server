"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const GroupPermission_1 = require("./GroupPermission");
const User_1 = require("./User");
const UserGroup_1 = require("./UserGroup");
let Group = class Group extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Group.prototype, "id", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Group.prototype, "name", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => GroupPermission_1.GroupPermission),
    __metadata("design:type", Array)
], Group.prototype, "permissions", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => UserGroup_1.UserGroup),
    __metadata("design:type", Array)
], Group.prototype, "usergroups", void 0);
__decorate([
    sequelize_typescript_1.BelongsToMany(() => User_1.User, () => UserGroup_1.UserGroup),
    __metadata("design:type", Array)
], Group.prototype, "users", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], Group.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], Group.prototype, "updatedAt", void 0);
__decorate([
    sequelize_typescript_1.DeletedAt,
    __metadata("design:type", Date)
], Group.prototype, "deletedAt", void 0);
Group = __decorate([
    sequelize_typescript_1.Table
], Group);
exports.Group = Group;
