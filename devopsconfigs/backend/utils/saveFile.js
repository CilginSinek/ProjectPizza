require("dotenv").config();
const masterKey = Buffer.from(process.env.MASTER_KEY, "hex");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { fileEncrypt, keyEncrypt } = require("./crypting");

const saveFile = async (fileBuffer, destinationPath) => {
  try {
    const tempPath = destinationPath + ".tmp";

    const dir = path.dirname(destinationPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(tempPath, fileBuffer);
    const filekey = crypto.randomBytes(32);
    const { iv: fileIv, authTag: fileAuthTag } = await fileEncrypt(
      tempPath,
      destinationPath,
      filekey
    );
    fs.unlinkSync(tempPath);


    const {
      encryptedKey: wrappedKey,
      iv: keyIv,
      authTag: keyAuthTag,
    } = keyEncrypt(filekey, masterKey);

    return {
      wrappedKey: wrappedKey.toString('base64'),
      keyIv: keyIv.toString('base64'),
      keyAuthTag: keyAuthTag.toString('base64'),
      fileIv: fileIv.toString('base64'),
      fileAuthTag: fileAuthTag.toString('base64'),
    };
  } catch (error) {
    throw new Error("File saving failed: " + error.message);
  }
};

module.exports = saveFile;
