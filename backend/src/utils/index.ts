import crypto from 'crypto';

const PASSWORD_SALT = process.env.PASSWORD_SALT || 'foundlily_secure_salt_2026';

export function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, PASSWORD_SALT, 1000, 64, 'sha512').toString('hex');
}

export function comparePassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const rand = Math.random().toString(36).substring(2, 6);
  return `${base}-${rand}`;
}
