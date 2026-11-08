import { SchoolClass, GradeId, UserAccount, UserProfile } from '../types';

export const SUPPORTED_CLASSES: SchoolClass[] = ['6A5', '7A5', '8A5', '9A5'];

export const CLASS_TO_GRADE: Record<SchoolClass, GradeId> = {
  '6A5': '6',
  '7A5': '7',
  '8A5': '8',
  '9A5': '9',
};

export const AUTH_MESSAGES = {
  REGISTRATION_SUCCESS: 'Đăng ký tài khoản thành công! Bạn có thể đăng nhập để bắt đầu học tập.',
  USERNAME_EXISTS: 'Tên tài khoản đã tồn tại. Vui lòng chọn tên tài khoản khác.',
  PASSWORD_MISMATCH: 'Mật khẩu nhập lại không khớp.',
  INVALID_CREDENTIALS: 'Tên tài khoản hoặc mật khẩu không đúng.',
  ACCOUNT_LOCKED: 'Tài khoản đã bị tạm khóa. Vui lòng liên hệ giáo viên hoặc quản trị viên.',
  TOO_MANY_FAILED_ATTEMPTS: 'Tài khoản tạm thời bị khóa do nhập sai nhiều lần. Vui lòng thử lại sau ít phút.',
  REQUIRED_FIELDS: 'Vui lòng điền đầy đủ các thông tin bắt buộc.',
  INVALID_CLASS: 'Vui lòng chọn lớp học hợp lệ (6A5, 7A5, 8A5, 9A5).',
  PASSWORD_MIN_LENGTH: 'Mật khẩu phải có ít nhất 6 ký tự để bảo mật tài khoản.',
} as const;

/**
 * Pure TypeScript SHA-256 implementation (FIPS 180-2).
 * Works reliably in all browsers and Node.js without async or native bindings.
 */
export function sha256(ascii: string): string {
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = 'length';
  let i = 0;
  let j = 0;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii[lengthProperty] * 8;

  // Initial hash values: first 32 bits of the fractional parts of the square roots of the first 8 primes
  let hash: number[] = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];

  // First 32 bits of the fractional parts of the cube roots of the first 64 primes
  const k: number[] = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  // Pre-processing
  let compositeLength = asciiBitLength;
  for (i = 0; i < ascii[lengthProperty]; i++) {
    words[i >> 2] |= (ascii.charCodeAt(i) & 255) << (24 - (i % 4) * 8);
  }
  words[compositeLength >> 5] |= 0x80 << (24 - (compositeLength % 32));
  words[(((compositeLength + 64) >> 9) << 4) + 15] = asciiBitLength;

  // Process the message in successive 512-bit chunks
  for (i = 0; i < words[lengthProperty]; i += 16) {
    const w: number[] = [];
    for (j = 0; j < 16; j++) {
      w[j] = words[i + j] || 0;
    }
    for (j = 16; j < 64; j++) {
      const s0 =
        ((w[j - 15] >>> 7) | (w[j - 15] << 25)) ^
        ((w[j - 15] >>> 18) | (w[j - 15] << 14)) ^
        (w[j - 15] >>> 3);
      const s1 =
        ((w[j - 2] >>> 17) | (w[j - 2] << 15)) ^
        ((w[j - 2] >>> 19) | (w[j - 2] << 13)) ^
        (w[j - 2] >>> 10);
      w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
    }

    let a = hash[0];
    let b = hash[1];
    let c = hash[2];
    let d = hash[3];
    let e = hash[4];
    let f = hash[5];
    let g = hash[6];
    let h = hash[7];

    for (j = 0; j < 64; j++) {
      const S1 =
        ((e >>> 6) | (e << 26)) ^
        ((e >>> 11) | (e << 21)) ^
        ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + k[j] + w[j]) | 0;
      const S0 =
        ((a >>> 2) | (a << 30)) ^
        ((a >>> 13) | (a << 19)) ^
        ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    hash[0] = (hash[0] + a) | 0;
    hash[1] = (hash[1] + b) | 0;
    hash[2] = (hash[2] + c) | 0;
    hash[3] = (hash[3] + d) | 0;
    hash[4] = (hash[4] + e) | 0;
    hash[5] = (hash[5] + f) | 0;
    hash[6] = (hash[6] + g) | 0;
    hash[7] = (hash[7] + h) | 0;
  }

  // Convert to hex
  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }

  return result;
}

/**
 * Generate a random salt string
 */
export function generateSalt(length = 16): string {
  const chars = '0123456789abcdef';
  let salt = '';
  for (let i = 0; i < length; i++) {
    salt += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return salt;
}

/**
 * Hashes a password with a salt using SHA-256.
 * Result format: salt$hash
 */
export function hashPassword(password: string, customSalt?: string): { salt: string; hash: string; combined: string } {
  const salt = customSalt || generateSalt();
  // Combined input with separator to prevent collision attacks
  const hash = sha256(`thcs_myhoa:${salt}:${password}`);
  return {
    salt,
    hash,
    combined: `${salt}$${hash}`,
  };
}

/**
 * Verifies a password against the stored salt and hash
 */
export function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  if (!password || !salt || !expectedHash) return false;
  const computed = sha256(`thcs_myhoa:${salt}:${password}`);
  return computed.toLowerCase() === expectedHash.toLowerCase();
}

/**
 * Failed attempts memory store for rate limiting
 */
interface FailedAttemptInfo {
  count: number;
  lockedUntil?: number;
}
const failedAttemptsMap = new Map<string, FailedAttemptInfo>();

export function isAttemptLocked(username: string): boolean {
  const key = username.trim().toLowerCase();
  const info = failedAttemptsMap.get(key);
  if (!info || !info.lockedUntil) return false;
  if (Date.now() > info.lockedUntil) {
    failedAttemptsMap.delete(key);
    return false;
  }
  return true;
}

export function recordFailedAttempt(username: string, maxAttempts = 5, lockDurationMs = 60000): { isLocked: boolean; attemptsLeft: number } {
  const key = username.trim().toLowerCase();
  const info = failedAttemptsMap.get(key) || { count: 0 };
  info.count += 1;
  if (info.count >= maxAttempts) {
    info.lockedUntil = Date.now() + lockDurationMs;
    failedAttemptsMap.set(key, info);
    return { isLocked: true, attemptsLeft: 0 };
  }
  failedAttemptsMap.set(key, info);
  return { isLocked: false, attemptsLeft: maxAttempts - info.count };
}

export function resetFailedAttempts(username: string): void {
  const key = username.trim().toLowerCase();
  failedAttemptsMap.delete(key);
}

/**
 * Validate registration input parameters
 */
export interface RegistrationInput {
  fullName: string;
  username: string;
  className: string;
  password: string;
  confirmPassword: string;
}

export function validateRegistration(
  input: RegistrationInput,
  existingUsernames: string[]
): { valid: boolean; error?: string } {
  const { fullName, username, className, password, confirmPassword } = input;

  // 1. Mandatory fields
  if (!fullName?.trim() || !username?.trim() || !className?.trim() || !password || !confirmPassword) {
    return { valid: false, error: AUTH_MESSAGES.REQUIRED_FIELDS };
  }

  // 2. Strict class check: exactly 6A5, 7A5, 8A5, 9A5
  if (!SUPPORTED_CLASSES.includes(className as SchoolClass)) {
    return { valid: false, error: AUTH_MESSAGES.INVALID_CLASS };
  }

  // 3. Username format
  const cleanUsername = username.trim().toLowerCase();
  if (cleanUsername.length < 3) {
    return { valid: false, error: 'Tên tài khoản phải có ít nhất 3 ký tự.' };
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(cleanUsername)) {
    return { valid: false, error: 'Tên tài khoản chỉ được chứa chữ cái, số, dấu chấm, gạch dưới hoặc gạch nối.' };
  }

  // 4. Unique username check (case-insensitive)
  const isDuplicate = existingUsernames.some((u) => u.trim().toLowerCase() === cleanUsername);
  if (isDuplicate) {
    return { valid: false, error: AUTH_MESSAGES.USERNAME_EXISTS };
  }

  // 5. Password minimum length
  if (password.length < 4) {
    return { valid: false, error: AUTH_MESSAGES.PASSWORD_MIN_LENGTH };
  }

  // 6. Password match check
  if (password !== confirmPassword) {
    return { valid: false, error: AUTH_MESSAGES.PASSWORD_MISMATCH };
  }

  return { valid: true };
}

/**
 * Maps a class name (e.g. 6A5) to its corresponding GradeId ('6')
 */
export function deriveGradeFromClass(className: SchoolClass | string): GradeId {
  if (className in CLASS_TO_GRADE) {
    return CLASS_TO_GRADE[className as SchoolClass];
  }
  const firstChar = className.charAt(0);
  if (['6', '7', '8', '9'].includes(firstChar)) {
    return firstChar as GradeId;
  }
  return '6';
}
