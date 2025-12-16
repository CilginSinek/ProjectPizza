const readFile = (myfile, readablePath) => {
  const decrptedkey = keyDecrypt(
    myfile.encryption.wrappedKey,
    masterKey,
    myfile.encryption.keyIv,
    myfile.encryption.keyAuthTag
  );
  return fileDecrypt(
    myfile.path,
    readablePath,
    decrptedkey,
    myfile.encryption.fileIv,
    myfile.encryption.fileAuthTag
  );
};
module.exports = readFile;