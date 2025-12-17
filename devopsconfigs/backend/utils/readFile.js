require("dotenv").config();
const { fileDecrypt, keyDecrypt } = require("./crypting");
const masterKey = Buffer.from(process.env.MASTER_KEY, "hex");

const readFile = async (myfile, readablePath) => {
  try {
    const wrappedKey = Buffer.from(myfile.encryption.wrappedKey, 'base64');
    const keyIv = Buffer.from(myfile.encryption.keyIv, 'base64');
    const keyAuthTag = Buffer.from(myfile.encryption.keyAuthTag, 'base64');
    const fileIv = Buffer.from(myfile.encryption.fileIv, 'base64');
    const fileAuthTag = Buffer.from(myfile.encryption.fileAuthTag, 'base64');

    const decryptedKey = keyDecrypt(
      wrappedKey,
      masterKey,
      keyIv,
      keyAuthTag
    );

    await fileDecrypt(
      myfile.path,
      readablePath,
      decryptedKey,
      fileIv,
      fileAuthTag
    );

    return readablePath;
  } catch (error) {
    throw new Error("File decryption failed: " + error.message);
  }
};
module.exports = readFile;
