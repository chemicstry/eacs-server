import { Sequelize} from 'sequelize-typescript';
import { User as IUser, Group as IGroup, Database } from '..';
import { Log } from '../../Log';
import { SequelizeConfig } from 'sequelize-typescript/lib/types/SequelizeConfig';
import { User } from './models/User';
import { Tag } from './models/Tag';
import { Group } from './models/Group';
import { GroupPermission } from './models/GroupPermission';
import path from 'path';
import { UserGroup } from './models/UserGroup';
import { Event } from './models/Event';

class SequelizeDB implements Database {
  private db!: Sequelize;

  constructor(config: SequelizeConfig) {
    this.initDatabase(config);
  }

  private async initDatabase(config: SequelizeConfig) {
    try {
      this.db = new Sequelize({
        ...config,
        modelPaths: [path.join(__dirname, "models")]
      });
      await this.db.authenticate();
      await this.db.sync();
    } catch (e) {
      Log.error("Databse init failed.", e);
      process.exit(1);
    }
  }

  public async findUserIdByTag(UID: string)
  {
    var tag = <Tag>await Tag.findOne({
      include: [User],
      where: {
        uid: UID
      }
    });
  
    if (!tag.user)
      throw new Error(`User with tag ${UID} not found`);

    return tag.user.id.toString();
  }

  public async getUserPermissions(sUserId: string)
  {
    let userId = parseInt(sUserId);

    var permissions = await GroupPermission.findAll({
      include: [{
        model: Group,
        required: true,
        include: [{
          model: UserGroup,
          required: true,
          where: {
            userId
          }
        }]
      }]
    });

    return permissions.map(permission => permission.permission);
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

  public async getUsers() {
    var dbusers = await User.findAll({
      include: [Tag, Group]
    });

    var users: IUser[] = [];
    dbusers.forEach((user) => {
      users.push({
        id: user.id.toString(),
        name: user.name,
        tags: user.tags.map(tag => tag.uid),
        groups: user.groups.map(group => group.name)
      })
    })

    return users;
  }

  public async upsertUser(data: IUser) {
    var id = parseInt(data.id);

    await this.db.transaction({autocommit: false}, async (transaction) => {
      if (isNaN(id)) {
        // Create new user
        var user = await User.create({
          name: data.name
        }, {transaction})

        // Get newly inserted id
        id = user.id;
      } else {
        // Update existing user
        await User.update({
          name: data.name
        }, {
          where: {id},
          transaction
        });

        // Delete existing group relations
        await UserGroup.destroy({
          where: {
            userId: id
          },
          transaction
        });

        // Delete existing tags
        await Tag.destroy({
          where: {
            userId: id
          },
          transaction
        });
      }

      // Associate groups, firstly by translating group name to id
      for (let name of data.groups) {
        var group = await Group.findOne({
          where: {name},
          transaction
        });

        if (!group)
          throw new Error(`Group ${name} not found in database`);

        await UserGroup.create({
          userId: id,
          groupId: group.id
        }, {transaction});
      }

      // Insert new tags
      for (let tag of data.tags) {
        await Tag.create({
          uid: tag,
          userId: id
        }, {transaction})
      }
    });
  }

  public async deleteUser(ids: string) {
    var id = parseInt(ids);
    User.destroy({
      where: {id}
    });
  }

  public async getGroups() {
    var dbgroups = await Group.findAll({
      include: [GroupPermission]
    });

    var groups: IGroup[] = [];
    dbgroups.forEach((group) => {
      groups.push({
        id: group.id.toString(),
        name: group.name,
        permissions: group.permissions.map(p => p.permission)
      })
    })

    return groups;
  }

  public async upsertGroup(data: IGroup) {
    var id = parseInt(data.id);

    await this.db.transaction({autocommit: false}, async (transaction) => {
      if (isNaN(id)) {
        // Create new group
        var group = await Group.create({
          name: data.name
        }, {transaction})

        // Get newly inserted id
        id = group.id;
      } else {
        // Update existing group
        await Group.update({
          name: data.name
        }, {
          where: {id},
          transaction
        });

        // Delete existing permissions
        await GroupPermission.destroy({
          where: {
            groupId: id
          },
          transaction
        });
      }

      // Insert new permission
      for (let permission of data.permissions) {
        await GroupPermission.create({
          permission,
          groupId: id
        }, {transaction})
      }
    });
  }

  public async deleteGroup(ids: string) {
    var id = parseInt(ids);
    Group.destroy({
      where: {id}
    })
  }

  public async logEvent(event: string, identifier: string, userId: string, data: object) {
    await Event.create({
      event,
      identifier,
      userId,
      data: JSON.stringify(data)
    })
  }
}

export default SequelizeDB;
