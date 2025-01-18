import crypto from "crypto";

const SECRET_KEY = process.env.SECRET_KEY;
const IV_LENGTH = 16;
function generateIv() {
  return crypto.randomBytes(IV_LENGTH);
}

export function encryptData(data: string) {
  const iv = generateIv();
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(SECRET_KEY),
    iv
  );
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return { encryptedData: encrypted, iv: iv.toString("hex") };
}

export function decryptData(encryptedData: string, iv: string) {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(SECRET_KEY),
    Buffer.from(iv, "hex")
  );
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
