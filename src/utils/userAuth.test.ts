import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SUPPORTED_CLASSES,
  CLASS_TO_GRADE,
  AUTH_MESSAGES,
  hashPassword,
  verifyPassword,
  validateRegistration,
  deriveGradeFromClass,
  recordFailedAttempt,
  resetFailedAttempts,
  isAttemptLocked,
} from './cryptoAuth';
import { SchoolClass, GradeId } from '../types';

test('SUPPORTED_CLASSES contains strictly the four mandatory classes: 6A5, 7A5, 8A5, 9A5', () => {
  assert.equal(SUPPORTED_CLASSES.length, 4);
  assert.deepEqual(SUPPORTED_CLASSES, ['6A5', '7A5', '8A5', '9A5']);
});

test('CLASS_TO_GRADE maps classes correctly to grades 6, 7, 8, 9', () => {
  assert.equal(CLASS_TO_GRADE['6A5'], '6');
  assert.equal(CLASS_TO_GRADE['7A5'], '7');
  assert.equal(CLASS_TO_GRADE['8A5'], '8');
  assert.equal(CLASS_TO_GRADE['9A5'], '9');

  assert.equal(deriveGradeFromClass('6A5'), '6');
  assert.equal(deriveGradeFromClass('7A5'), '7');
  assert.equal(deriveGradeFromClass('8A5'), '8');
  assert.equal(deriveGradeFromClass('9A5'), '9');
});

test('Salted SHA-256 password hashing works and never stores plaintext', () => {
  const plainPassword = 'SecretPassword123!';
  const { salt, hash, combined } = hashPassword(plainPassword);

  assert.ok(salt.length >= 16);
  assert.ok(hash.length === 64);
  assert.notEqual(hash, plainPassword);
  assert.ok(!hash.includes(plainPassword));
  assert.equal(combined, `${salt}$${hash}`);

  // Verification succeeds with correct password
  const isValid = verifyPassword(plainPassword, salt, hash);
  assert.equal(isValid, true);

  // Verification fails with wrong password
  const isWrongValid = verifyPassword('WrongPassword', salt, hash);
  assert.equal(isWrongValid, false);

  // Different salts produce different hashes for same password
  const hash2 = hashPassword(plainPassword);
  assert.notEqual(hash, hash2.hash);
});

test('validateRegistration requires all mandatory fields', () => {
  const existingUsers: string[] = ['existing.user'];

  const missingName = validateRegistration(
    {
      fullName: '',
      username: 'new.student',
      className: '6A5',
      password: 'mypassword',
      confirmPassword: 'mypassword',
    },
    existingUsers
  );
  assert.equal(missingName.valid, false);
  assert.equal(missingName.error, AUTH_MESSAGES.REQUIRED_FIELDS);
});

test('validateRegistration checks exact password mismatch message', () => {
  const existingUsers: string[] = [];

  const mismatch = validateRegistration(
    {
      fullName: 'Trần Văn Bình',
      username: 'binh.tran',
      className: '7A5',
      password: 'password123',
      confirmPassword: 'password999',
    },
    existingUsers
  );
  assert.equal(mismatch.valid, false);
  assert.equal(mismatch.error, 'Mật khẩu nhập lại không khớp.');
});

test('validateRegistration checks exact duplicate username message', () => {
  const existingUsers = ['hoangan', 'linh.mai'];

  const duplicate = validateRegistration(
    {
      fullName: 'Hoàng An Mới',
      username: 'HOANGAN', // Test case-insensitive
      className: '8A5',
      password: 'password123',
      confirmPassword: 'password123',
    },
    existingUsers
  );
  assert.equal(duplicate.valid, false);
  assert.equal(duplicate.error, 'Tên tài khoản đã tồn tại. Vui lòng chọn tên tài khoản khác.');
});

test('validateRegistration rejects non-supported classes', () => {
  const existingUsers: string[] = [];

  const invalidClass = validateRegistration(
    {
      fullName: 'Lê Văn C',
      username: 'le.vanc',
      className: '6A1' as any, // Not in [6A5, 7A5, 8A5, 9A5]
      password: 'password123',
      confirmPassword: 'password123',
    },
    existingUsers
  );
  assert.equal(invalidClass.valid, false);
  assert.equal(invalidClass.error, AUTH_MESSAGES.INVALID_CLASS);
});

test('validateRegistration succeeds with valid input across all 4 classes', () => {
  const existingUsers = ['user1', 'user2'];

  for (const cls of SUPPORTED_CLASSES) {
    const valid = validateRegistration(
      {
        fullName: `Học Sinh Lớp ${cls}`,
        username: `student.${cls.toLowerCase()}`,
        className: cls,
        password: 'securePassword123',
        confirmPassword: 'securePassword123',
      },
      existingUsers
    );
    assert.equal(valid.valid, true);
    assert.equal(valid.error, undefined);
  }
});

test('Rate limiting locks account after 5 consecutive failed login attempts', () => {
  const testUser = 'attack_test_user';
  resetFailedAttempts(testUser);

  assert.equal(isAttemptLocked(testUser), false);

  // 1st to 4th attempts
  for (let i = 1; i <= 4; i++) {
    const res = recordFailedAttempt(testUser, 5, 1000);
    assert.equal(res.isLocked, false);
    assert.equal(res.attemptsLeft, 5 - i);
  }

  // 5th attempt locks
  const fifth = recordFailedAttempt(testUser, 5, 1000);
  assert.equal(fifth.isLocked, true);
  assert.equal(fifth.attemptsLeft, 0);
  assert.equal(isAttemptLocked(testUser), true);

  // Reset clears lock
  resetFailedAttempts(testUser);
  assert.equal(isAttemptLocked(testUser), false);
});
