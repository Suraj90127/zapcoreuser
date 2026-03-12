import crypto from "crypto";

export const aesEncrypt = (text, key) => {
  if (key.length !== 32) {
    throw new Error("AES-256 key must be exactly 32 bytes");
  }

  const cipher = crypto.createCipheriv(
    "aes-256-ecb",
    key,
    null
  );
  cipher.setAutoPadding(true);

  return Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final()
  ]).toString("base64");
};

export const aesDecrypt = (encrypted, key) => {
  if (key.length !== 32) {
    throw new Error("AES-256 key must be exactly 32 bytes");
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-ecb",
    key,
    null
  );
  decipher.setAutoPadding(true);

  return Buffer.concat([
    decipher.update(Buffer.from(encrypted, "base64")),
    decipher.final()
  ]).toString("utf8");
};
