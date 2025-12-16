const fs = require("fs");
const crypto = require("crypto");

const fileEncrypt = (input, output, key) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  fs.createReadStream(input).pipe(cipher).pipe(fs.createWriteStream(output));
  const authTag = cipher.getAuthTag();
  return { iv, authTag };
};

const fileDecrypt = (input, output, key, iv, authTag) => {
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  fs.createReadStream(input).pipe(decipher).pipe(fs.createWriteStream(output));
  return;
};

const keyEncrypt = (fileKey, masterKey) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", masterKey, iv);
  const encryptedKey = Buffer.concat([cipher.update(fileKey), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return { encryptedKey, iv, authTag };
};

const keyDecrypt = (encryptedKey, masterKey, iv, authTag) => {
  const decipher = crypto.createDecipheriv("aes-256-gcm", masterKey, iv);
  decipher.setAuthTag(authTag);
  const decryptedKey = Buffer.concat([
    decipher.update(encryptedKey),
    decipher.final(),
  ]);
  return decryptedKey;
};

module.exports = { fileEncrypt, fileDecrypt, keyEncrypt, keyDecrypt };
