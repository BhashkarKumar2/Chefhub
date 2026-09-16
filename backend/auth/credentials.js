import crypto from 'crypto';
import validator from 'validator';
import User from '../models/User.js';

export const BCRYPT_ROUNDS = 12;

export const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
export const MAX_OTP_ATTEMPTS = 5;

export const MAX_FAILED_LOGINS = 5;
export const LOGIN_LOCK_MS = 15 * 60 * 1000; // 15 minutes

export const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).+$/;

// Canonical form new accounts are stored under (lowercase; Gmail dots and
// +tags removed), matching what signup has always saved.
export const normalizeEmail = (email) => {
  if (typeof email !== 'string') return null;
  return validator.normalizeEmail(email.trim()) || null;
};

// Older accounts may be stored as plain lowercase (e.g. with Gmail dots), so
// lookups match either form.
const emailCandidates = (email) => {
  if (typeof email !== 'string') return [];
  return [...new Set([email.trim().toLowerCase(), normalizeEmail(email)].filter(Boolean))];
};

const GMAIL_DOMAINS = new Set(['gmail.com', 'googlemail.com']);
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Find the account for an email however it was stored. Gmail ignores dots and
// +tags, so for Gmail every stored variant of the same inbox matches.
export const findUserByEmail = async (email, select) => {
  const normalized = normalizeEmail(email);
  const filters = [{ email: { $in: emailCandidates(email) } }];

  if (normalized && GMAIL_DOMAINS.has(normalized.split('@')[1])) {
    const pattern = normalized.split('@')[0].split('').map(escapeRegex).join('\\.?');
    filters.push({ email: { $regex: `^${pattern}(\\+[^@]*)?@(gmail|googlemail)\\.com$` } });
  }

  let query = User.find({ $or: filters }).limit(5);
  if (select) query = query.select(select);
  const users = await query;

  // Prefer the exact stored form if several legacy variants exist
  const lower = typeof email === 'string' ? email.trim().toLowerCase() : '';
  return users.find(u => u.email === lower) || users.find(u => u.email === normalized) || users[0] || null;
};

export const generateOtp = () => crypto.randomInt(100000, 1000000).toString();

export const hashOtp = (otp) => crypto.createHash('sha256').update(String(otp)).digest('hex');

// Constant-time comparison of two hex digests
export const hashesMatch = (a, b) => {
  const bufA = Buffer.from(String(a), 'hex');
  const bufB = Buffer.from(String(b), 'hex');
  return bufA.length === bufB.length && bufA.length > 0 && crypto.timingSafeEqual(bufA, bufB);
};

// bcrypt only uses the first 72 bytes of a password
export const validatePassword = (password) => {
  if (typeof password !== 'string' || password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (Buffer.byteLength(password, 'utf8') > 72) {
    return 'Password is too long (maximum 72 characters)';
  }
  if (!PASSWORD_RULE.test(password)) {
    return 'Password must contain at least one letter and one number';
  }
  return null;
};
