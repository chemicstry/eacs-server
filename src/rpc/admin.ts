import { RPCNode } from 'modular-json-rpc';
import { db } from 'dbInstance';
import { Log } from 'Log';
import { RPCMethodError } from 'modular-json-rpc/dist/Defines';
import { RequirePermission, RPCErrors } from 'utils';
import { SocketACL } from 'socket';
import { Client, ClientRegistry } from 'client';

export default function InitAdminRPC(client: Client, registry: ClientRegistry) {
  client.rpc.bind("admin:getUsers", async () => {
    RequirePermission(client.acl, "admin:getUsers");
    try {
      return db.getUsers();
    } catch (err) {
      Log.error("getUsers error", err)
      throw new RPCMethodError(RPCErrors.GENERIC, err);
    }
  });

  client.rpc.bind("admin:upsertUser", async (data: any) => {
    Log.info("admin:upsertUser", data);
    RequirePermission(client.acl, "admin:upsertUser");
    try {
      db.upsertUser(data);
      return true;
    } catch (err) {
      Log.error("upserUser error", err)
      throw new RPCMethodError(RPCErrors.GENERIC, err);
    }
  });

  client.rpc.bind("admin:deleteUser", async (id: string) => {
    Log.info("admin:deleteUser", id);
    RequirePermission(client.acl, "admin:deleteUser");
    try {
      db.deleteUser(id);
      return true;
    } catch (err) {
      Log.error("admin:deleteUser error", err)
      throw new RPCMethodError(RPCErrors.GENERIC, err);
    }
  })

  client.rpc.bind("admin:getGroups", async () => {
    RequirePermission(client.acl, "admin:getGroups");
    try {
      return db.getGroups();
    } catch (err) {
      Log.error("admin:getGroups error", err)
      throw new RPCMethodError(RPCErrors.GENERIC, err);
    }
  });

  client.rpc.bind("admin:upsertGroup", async (data: any) => {
    Log.info("admin:upsertGroup", data);
    RequirePermission(client.acl, "admin:upsertGroup");
    try {
      db.upsertGroup(data);
      return true;
    } catch (err) {
      Log.error("admin:upsertGroup error", err)
      throw new RPCMethodError(RPCErrors.GENERIC, err);
    }
  });

  client.rpc.bind("admin:deleteGroup", async (id: string) => {
    Log.info("admin:deleteGroup", id);
    RequirePermission(client.acl, "admin:deleteGroup");
    try {
      db.deleteGroup(id);
      return true;
    } catch (err) {
      Log.error("admin:deleteGroup error", err)
      throw new RPCMethodError(RPCErrors.GENERIC, err);
    }
  })
}