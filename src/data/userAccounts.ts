import { UserAccount, SchoolClass, GradeId, UserProfile } from '../types';
import {
  SUPPORTED_CLASSES,
  CLASS_TO_GRADE,
  hashPassword,
  deriveGradeFromClass,
} from '../utils/cryptoAuth';

export { SUPPORTED_CLASSES, CLASS_TO_GRADE };

export const AVAILABLE_CLASSES = [
  { gradeId: '6' as GradeId, label: 'Khối 6', classes: ['6A5'] },
  { gradeId: '7' as GradeId, label: 'Khối 7', classes: ['7A5'] },
  { gradeId: '8' as GradeId, label: 'Khối 8', classes: ['8A5'] },
  { gradeId: '9' as GradeId, label: 'Khối 9', classes: ['9A5'] },
] as const;

export const STORAGE_KEYS = {
  ACCOUNTS: 'thcs_myhoa_accounts_v2',
  CURRENT_USER: 'thcs_myhoa_user',
} as const;

/**
 * Pre-seeded system accounts with salted hash.
 * Passwords are NEVER stored in plaintext.
 */
function createInitialAccounts(): UserAccount[] {
  // Pre-configured system teacher accounts
  const dvtSalt = 'e3b0c44298fc1c14';
  const dvtHash = hashPassword('12345678', dvtSalt);

  const teacherSalt = 'a1f8c4e2098b7d61';
  const teacherHash = hashPassword('GiaoVien@MyHoa2026', teacherSalt);

  const adminSalt = '9d8e7f6a5b4c3d2e';
  const adminHash = hashPassword('Admin@MyHoa2026', adminSalt);

  return [
    {
      id: 'tc-dangvanthang',
      username: 'dangvanthang',
      passwordHash: dvtHash.hash,
      salt: dvtHash.salt,
      role: 'teacher',
      name: 'Đặng Văn Thắng',
      teacherCode: 'GV.DANGVANTHANG',
      email: 'dangvanthang@thcsmyhoa.edu.vn',
      subjectDepartment: 'Tổ Tin học & Chuyên môn THCS Mỹ Hòa',
      avatar: '👨‍🏫',
      createdAt: '2026-09-01T08:00:00.000Z',
      isLocked: false,
    },
    {
      id: 'tc-admin-01',
      username: 'giaovien',
      passwordHash: teacherHash.hash,
      salt: teacherHash.salt,
      role: 'teacher',
      name: 'Thầy/Cô Quản Trị Chuyên Môn',
      teacherCode: 'GV.THCSMYHOA',
      email: 'giaovien@thcsmyhoa.edu.vn',
      subjectDepartment: 'Tổ Chuyên Môn THCS Mỹ Hòa',
      avatar: '👨‍🏫',
      createdAt: '2026-09-01T08:00:00.000Z',
      isLocked: false,
    },
    {
      id: 'tc-admin-02',
      username: 'admin',
      passwordHash: adminHash.hash,
      salt: adminHash.salt,
      role: 'teacher',
      name: 'Quản Trị Viên Hệ Thống',
      teacherCode: 'ADMIN.MYHOA',
      email: 'admin@thcsmyhoa.edu.vn',
      subjectDepartment: 'Ban Quản Trị Hệ Thống THCS Mỹ Hòa',
      avatar: '🛡️',
      createdAt: '2026-09-01T08:00:00.000Z',
      isLocked: false,
    },
  ];
}

/**
 * Retrieve all accounts from localStorage or initial seed
 */
export function loadStoredAccounts(): UserAccount[] {
  const initial = createInitialAccounts();
  if (typeof window === 'undefined') {
    return initial;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Guarantee initial teachers (including Đặng Văn Thắng) exist even if localStorage was already populated
        const existingUsernames = new Set(parsed.map((a: UserAccount) => a.username.toLowerCase()));
        const missingInitial = initial.filter((initAcc) => !existingUsernames.has(initAcc.username.toLowerCase()));
        if (missingInitial.length > 0) {
          const merged = [...parsed, ...missingInitial];
          saveStoredAccounts(merged);
          return merged;
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading stored accounts:', err);
  }

  saveStoredAccounts(initial);
  return initial;
}

/**
 * Persist accounts securely to localStorage
 */
export function saveStoredAccounts(accounts: UserAccount[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  } catch (err) {
    console.error('Error saving stored accounts:', err);
  }
}

/**
 * Convert UserAccount to UserProfile (safe, omits password hash and salt)
 */
export function accountToProfile(acc: UserAccount): UserProfile {
  return {
    id: acc.id,
    name: acc.name,
    username: acc.username,
    role: acc.role,
    className: acc.className,
    gradeId: acc.gradeId || (acc.className ? deriveGradeFromClass(acc.className) : undefined),
    studentCode: acc.studentCode,
    teacherCode: acc.teacherCode,
    subjectDepartment: acc.subjectDepartment,
    email: acc.email,
    avatar: acc.avatar || (acc.role === 'teacher' ? '👨‍🏫' : '🎒'),
    joinedAt: acc.createdAt.split('T')[0],
    isLocked: acc.isLocked,
  };
}
