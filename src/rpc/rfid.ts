import { RPCNode } from 'modular-json-rpc';
import { db } from 'dbInstance';
import { Log } from 'Log';
import { RPCMethodError } from 'modular-json-rpc/dist/Defines';
import { RequirePermission, RPCErrors } from 'utils';
import { SocketACL } from 'socket';
import { options } from 'options';
import { HKDF } from 'rfid/KeyProvider';
import { Tag, TagInfo, TagConstructor } from 'rfid/Tag';
import { TagFactory } from 'rfid/TagFactory';

// Initial keying material used to derive keys
const IKM = Buffer.from(options.hkdf_ikm, 'hex');

// HKDF key provider
const keyProvider = new HKDF(IKM, 'sha256', Buffer.from(options.hkdf_salt));

type TransceiveFn = (buf: Buffer) => Promise<Buffer>

interface AuthResult {
  userId: string,
  permissions: string[]
}

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
  // Exchanges data with remote tag
  async function Transceive(buf: Buffer) {
    // Call remote transceive function
    var result = await node.call("rfid:transceive", buf.toString('hex'));

    // Convert result to buffer
    return Buffer.from(<string>result, 'hex');
  }

  // Returns list of permissions authenticated user has
  async function RFIDAuthenticate(tagInfo: TagInfo, crypto: boolean): Promise<AuthResult> {
    let tag = GetTag(tagInfo, Transceive);

    // Authenticate RFID with crypto if enabled
    if (crypto) {
      try {
        if (!await tag.Authenticate(keyProvider))
          return {
            userId: '',
            permissions: []
          };
      } catch (e) {
        Log.error(`rfid:auth(): Authentication error: ${e.message}`, e);
        throw new RPCMethodError(RPCErrors.AUTHENTICATE_FAILED, `Error authenticating: ${e.message}`);
      }
    }
    
    // Authenticate via database
    try {
      var userId = await db.findUserIdByTag(tagInfo.UID.toString('hex'));
      var permissions = await db.getUserPermissions(userId);
      return {userId, permissions};
    } catch (err) {
      Log.error("auth:uid error", err);
      throw new RPCMethodError(RPCErrors.GENERIC, err);
    }
  }

  // Authenticates users against socket identifier (JWT token identifier)
  node.bind("rfid:auth", async (tagInfo: any) => {
    Log.debug("rfid:auth()", tagInfo);
    var authResult = await RFIDAuthenticate(tagInfo, options.rfidAuthCrypto);
    db.logEvent("rfid:auth", acl.identifier, authResult.userId, authResult);
    return authResult.permissions.includes(acl.identifier);
  });

  node.bind("rfid:logEvent", async (data: any) => {
    Log.debug("rfid:logEvent()", data);
    db.logEvent("rfid:logEvent", acl.identifier, '0', data);
  })

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
      db.logEvent("rfid:initKey", acl.identifier, '', {});
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
    var authResult = await RFIDAuthenticate(tagInfo, options.rfidAuthSocketCrypto);
    acl.externalPerms = authResult.permissions;

    db.logEvent("rfid:authSocket", acl.identifier, authResult.userId, authResult);

    // return granted permissions
    return authResult.permissions;
  })
}