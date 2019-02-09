import { RPCNode } from 'modular-json-rpc';
import { db } from 'src/dbInstance';
import { Log } from 'src/Log';
import { RPCMethodError } from 'modular-json-rpc/dist/Defines';
import { RequirePermission, RPCErrors } from 'src/utils';
import { SocketACL } from 'src/socket';
import { options } from 'src/options';
import { HKDF } from 'src/rfid/KeyProvider';
import { Tag, TagInfo, TagConstructor } from 'src/rfid/Tag';
import { TagFactory } from 'src/rfid/TagFactory';
import { User } from '../db/sequelize/models/User';

// Initial keying material used to derive keys
const IKM = Buffer.from(options.hkdf_ikm, 'hex');

// HKDF key provider
const keyProvider = new HKDF(IKM, 'sha256', Buffer.from(options.hkdf_salt));

type TransceiveFn = (buf: Buffer) => Promise<Buffer>

// Returns tag object bound to RPC transceive function
function GetTag(tagInfoRPC: any, transceive: TransceiveFn): Tag {
  // Parse arguments
  const taginfo: TagInfo = {
    ATQA: tagInfoRPC.ATQA,
    SAK: tagInfoRPC.SAK,
    UID: Buffer.from(tagInfoRPC.UID, 'hex'),
    ATS: Buffer.from(tagInfoRPC.ATS, 'hex')
  };

  var TagClass: TagConstructor;

  try {
    TagClass = TagFactory.Identify(taginfo);
  } catch (e) {
    throw new RPCMethodError(RPCErrors.UNSUPPORTED_TAG_TYPE, "Unsupported tag type");
  }

  // Initialize tag
  return new TagClass(taginfo, (buf: Buffer) => transceive(buf));
}

export default function InitRFIDRPC(node: RPCNode, acl: SocketACL) {
  // object - permission (i.e. main door, lights, etc)
  /*node.bind("auid", async (object: string, uid: string) => {
    RequirePermission(acl, "auth:uid");
 
    try {
      return await db.authUID(uid, object);
    } catch (err) {
      Log.error("auth:uid error", err);
      throw new RPCMethodError(RPCErrors.GENERIC, err);
    }
  });*/

  // Exchanges data with remote tag
  async function Transceive(buf: Buffer) {
    // Call remote transceive function
    var result = await node.call("rfid:transceive", buf.toString('hex'));

    // Convert result to buffer
    return Buffer.from(<string>result, 'hex');
  }

  // Returns list of permissions authenticated user has
  async function RFIDAuthenticate(tagInfo: TagInfo): Promise<string[]> {
    let tag = GetTag(tagInfo, Transceive);

    // Authenticate RFID with crypto if enabled
    if (options.rfidCrypto) {
      try {
        if (!await tag.Authenticate(keyProvider))
          return [];
      } catch (e) {
        Log.error(`rfid:auth(): Authentication error: ${e.message}`, e);
        throw new RPCMethodError(RPCErrors.AUTHENTICATE_FAILED, `Error authenticating: ${e.message}`);
      }
    }
    
    // Authenticate via database
    try {
      var userId = await db.findUserIdByTag(tagInfo.UID.toString('hex'));
      var permissions = await db.getUserPermissions(userId);
      return permissions;
    } catch (err) {
      Log.error("auth:uid error", err);
      throw new RPCMethodError(RPCErrors.GENERIC, err);
    }
  }

  // Authenticates users against socket identifier (JWT token identifier)
  node.bind("rfid:auth", async (tagInfo: any) => {
    Log.debug("rfid:auth()", tagInfo);
    var permissions = await RFIDAuthenticate(tagInfo);
    return permissions.includes(acl.identifier);
  });

  // Authenticates tag and returns user info
  node.bind("rfid:tagInfo", async (tagInfo: any) => {
    RequirePermission(acl, "rfid:tagInfo");
    Log.debug("rfid:tagInfo()", tagInfo);

    let tag = GetTag(tagInfo, Transceive);

    var info: any = {
      UID: tagInfo.UID,
      cryptoAuth: false,
      userId: null,
      permissions: null,
      user: {}
    };

    // Test if tag has correct keys
    try {
      if (await tag.Authenticate(keyProvider))
        info.cryptoAuth = true
    } catch (e) {}

    // Check if tag is associated with user
    try {
      info.userId = await db.findUserIdByTag(tagInfo.UID.toString('hex'));
      info.permissions = await db.getUserPermissions(info.userId);
      var users = await db.getUsers();
      info.user = users.find((u) => u.id == info.userId);
    } catch (err) {
      console.log(err);
    }

    return info;
  });

  node.bind("rfid:initKey", async (tagInfo: any) => {
    RequirePermission(acl, "rfid:initKey");

    let tag = GetTag(tagInfo, Transceive);

    // Initialize key
    try {
      var res = await tag.InitializeKey(keyProvider);
    } catch (e) {
      Log.error(`rfid:initKey(): error: ${e.message}`, e);
      throw new RPCMethodError(RPCErrors.INITIALIZE_KEY_FAILED, e.message);
    }

    return res;
  });

  // authenticate rfid tag and append user permission to socket permissions
  node.bind("rfid:authSocket", async (tagInfo: any) => {
    Log.debug("rfid:authSocket()", tagInfo);
    console.log(tagInfo);

    // Authenticate and append received permissions
    var permissions = await RFIDAuthenticate(tagInfo);
    acl.externalPerms = permissions;

    // return granted permissions
    return permissions;
  })
}