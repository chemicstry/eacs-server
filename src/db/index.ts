
interface User {
  id: string;
  name: string;
  tags: string[];
  groups: string[];
}

interface Group {
  id: string;
  name: string;
  permissions: string[];
}

interface Database {
  findUserIdByTag(UID: string): Promise<string>;
  getUserPermissions(userId: string): Promise<string[]>;

  getUsers(): Promise<User[]>;
  upsertUser(data: User): Promise<void>;
  deleteUser(id: string): Promise<void>;

  getGroups(): Promise<Group[]>;
  upsertGroup(data: Group): Promise<void>;
  deleteGroup(id: string): Promise<void>;
}

export {
  User,
  Group,
  Database
};
