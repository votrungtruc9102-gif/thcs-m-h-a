import test from 'node:test';
import assert from 'node:assert/strict';
import { loadStoredAccounts } from '../data/userAccounts';
import { verifyPassword } from '../utils/cryptoAuth';
import { INITIAL_EDU_LINKS } from '../data/initialEduLinks';
import { EDU_SUBJECT_LIST } from '../types';

test('Teacher account Đặng Văn Thắng exists and verifies with password 12345678', () => {
  const accounts = loadStoredAccounts();
  const dvt = accounts.find(
    (a) =>
      a.username === 'dangvanthang' ||
      a.name === 'Đặng Văn Thắng' ||
      a.teacherCode === 'GV.DANGVANTHANG'
  );

  assert.ok(dvt, 'Teacher account Đặng Văn Thắng should be present');
  assert.equal(dvt.role, 'teacher');
  assert.equal(dvt.isLocked, false);

  const isPasswordValid = verifyPassword('12345678', dvt.salt, dvt.passwordHash);
  assert.equal(isPasswordValid, true, 'Default password 12345678 should verify successfully');
});

test('Mandatory featured Ngữ văn 6 textbook link exists with exact official URL', () => {
  const nguVan6 = INITIAL_EDU_LINKS.find(
    (l) => l.id === 'link-ngu-van-6-tap-1' || l.url.includes('ngu-van-6-tap-mot')
  );

  assert.ok(nguVan6, 'Ngữ văn 6 – Tập một must exist in INITIAL_EDU_LINKS');
  assert.equal(
    nguVan6.url,
    'https://taphuan.nxbgd.vn/tap-huan/chi-tiet-sach/ngu-van-6-tap-mot-939788653.939788653'
  );
  assert.equal(nguVan6.title, 'Ngữ văn 6 – Tập một');
  assert.equal(nguVan6.gradeId, '6');
  assert.equal(nguVan6.subjectId, 'ngu_van');
  assert.equal(nguVan6.subjectName, 'Ngữ văn');
  assert.equal(nguVan6.isPinned, true);
  assert.equal(nguVan6.isVisible, true);
});

test('Educational links include official portals of MOET and An Giang DOET', () => {
  const moet = INITIAL_EDU_LINKS.find((l) => l.url === 'https://moet.gov.vn');
  assert.ok(moet, 'Ministry of Education and Training portal must exist');

  const anGiang = INITIAL_EDU_LINKS.find((l) => l.url === 'https://angiang.edu.vn');
  assert.ok(anGiang, 'An Giang DOET portal must exist');

  const hocLieu = INITIAL_EDU_LINKS.find((l) => l.url === 'https://hoclieu.vn');
  assert.ok(hocLieu, 'Hoclieu.vn portal must exist');
});

test('Exact 13 subjects required by THCS Mỹ Hòa are all defined in EDU_SUBJECT_LIST', () => {
  const expected13Subjects = [
    'Ngữ văn',
    'Toán',
    'Tiếng Anh',
    'Khoa học tự nhiên',
    'Lịch sử và Địa lí',
    'Giáo dục công dân',
    'Tin học',
    'Công nghệ',
    'Âm nhạc',
    'Mĩ thuật',
    'Giáo dục thể chất',
    'Hoạt động trải nghiệm, hướng nghiệp',
    'Giáo dục địa phương',
  ];

  assert.equal(EDU_SUBJECT_LIST.length, 13, 'There must be exactly 13 subjects');
  for (const subj of expected13Subjects) {
    assert.ok(
      EDU_SUBJECT_LIST.includes(subj as any),
      `Subject "${subj}" must be in EDU_SUBJECT_LIST`
    );
  }
});
