require("dotenv").config();
const masterKey = Buffer.from(process.env.MASTER_KEY, "hex");

const saveFile = async (fileBuffer, destinationPath) => {
  try {
    const filekey = crypto.randomBytes(32);
    const { iv: fileIv, authTag: fileAuthTag } = await fileEncrypt(
      fileBuffer,
      destinationPath,
      filekey
    );
    const {
      encryptedKey: wrappedKey,
      iv: keyIv,
      authTag: keyAuthTag,
    } = keyEncrypt(filekey, masterKey);
    return {
      wrappedKey,
      keyIv,
      keyAuthTag,
      fileIv,
      fileAuthTag,
    };
  } catch (error) {
    throw new Error("File saving failed: " + error.message);
  }
};

module.exports = saveFile;