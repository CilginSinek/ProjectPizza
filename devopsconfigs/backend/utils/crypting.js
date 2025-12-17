const fs = require("fs");
const crypto = require("crypto");

const fileEncrypt = (input, output, key) => {
  return new Promise((resolve, reject) => {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const inputStream = fs.createReadStream(input);
    const outputStream = fs.createWriteStream(output);

    inputStream
      .pipe(cipher)
      .pipe(outputStream)
      .on('finish', () => {
        const authTag = cipher.getAuthTag();
        resolve({ iv, authTag });
      })
      .on('error', reject);
  });
};

const fileDecrypt = (input, output, key, iv, authTag) => {
  return new Promise((resolve, reject) => {
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);
    const inputStream = fs.createReadStream(input);
    const outputStream = fs.createWriteStream(output);

    inputStream
      .pipe(decipher)
      .pipe(outputStream)
      .on('finish', () => resolve())
      .on('error', reject);
  });
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
