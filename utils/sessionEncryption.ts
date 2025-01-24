"use server"; 
import crypto from "crypto";
import base85 from "base85";

const ENCRYPTION_KEY = `${process.env.ENCRYPTION_KEY}`;

const IV_LENGTH = 16;
const key = Buffer.from(ENCRYPTION_KEY, "utf-8").subarray(0, 32);

// Encrypt function (async)
export const encrypt = async (text: string): Promise<string> => {
  if (!text) {
    throw new Error("Text to encrypt cannot be empty.");
  }

  // Generate a random IV for each encryption operation
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf-8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  // Combine IV and encrypted data, then encode in Base85
  const combined = Buffer.concat([iv, encrypted]);
  return base85.encode(combined);
};

// Decrypt function (async)
export const decrypt = async (encryptedText: string): Promise<string> => {
  if (!encryptedText) throw new Error("Encrypted text cannot be empty.");

  const combined = base85.decode(encryptedText);

  if (!Buffer.isBuffer(combined)) {
    throw new Error("Invalid Base85 encoding");
  }

  const iv = Buffer.from(combined.buffer, combined.byteOffset, IV_LENGTH);
  const encrypted = Buffer.from(
    combined.buffer,
    combined.byteOffset + IV_LENGTH
  );

  // Create decipher and decrypt
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString("utf-8");
};
