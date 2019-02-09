import { RPCNode } from 'modular-json-rpc';
import { db } from '../dbInstance';
import { Log } from '../Log';
import { RPCMethodError } from 'modular-json-rpc/dist/Defines';
import { RequirePermission, RPCErrors } from '../utils';
import { SocketACL } from '../socket';

export default function InitAdminRPC(node: RPCNode, acl: SocketACL) {
  node.bind("admin:getUsers", async () => {
    RequirePermission(acl, "admin:getUsers");
    try {
      return db.getUsers();
    } catch (err) {
      Log.error("getUsers error", err)
      throw new RPCMethodError(RPCErrors.GENERIC, err);
    }
  });

  node.bind("admin:upsertUser", async (data: any) => {
    Log.info("admin:upsertUser", data);
    RequirePermission(acl, "admin:upsertUser");
    try {
      db.upsertUser(data);
      return true;
    } catch (err) {
      Log.error("upserUser error", err)
      throw new RPCMethodError(RPCErrors.GENERIC, err);
    }
  });

  node.bind("admin:deleteUser", async (id: string) => {
    Log.info("admin:deleteUser", id);
    RequirePermission(acl, "admin:deleteUser");
    try {
      db.deleteUser(id);
      return true;
    } catch (err) {
      Log.error("admin:deleteUser error", err)
      throw new RPCMethodError(RPCErrors.GENERIC, err);
    }
  })

  node.bind("admin:getGroups", async () => {
    RequirePermission(acl, "admin:getGroups");
    try {
      return db.getGroups();
    } catch (err) {
      Log.error("admin:getGroups error", err)
      throw new RPCMethodError(RPCErrors.GENERIC, err);
    }
  });

  node.bind("admin:upsertGroup", async (data: any) => {
    Log.info("admin:upsertGroup", data);
    RequirePermission(acl, "admin:upsertGroup");
    try {
      db.upsertGroup(data);
      return true;
    } catch (err) {
      Log.error("admin:upsertGroup error", err)
      throw new RPCMethodError(RPCErrors.GENERIC, err);
    }
  });

  node.bind("admin:deleteGroup", async (id: string) => {
    Log.info("admin:deleteGroup", id);
    RequirePermission(acl, "admin:deleteGroup");
    try {
      db.deleteGroup(id);
      return true;
    } catch (err) {
      Log.error("admin:deleteGroup error", err)
      throw new RPCMethodError(RPCErrors.GENERIC, err);
    }
  })
}