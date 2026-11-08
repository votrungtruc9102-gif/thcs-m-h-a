import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateScore,
  detectDuplicateQuestions,
  validateQuestion,
  countCognitiveLevels,
  filterContentBySubjectAndGrade,
  formatFileSize,
} from './quizRules';
import { Question } from '../types';

test('calculateScore calculates 10-scale score accurately', () => {
  assert.equal(calculateScore(10, 10), 10);
  assert.equal(calculateScore(5, 10), 5);
  assert.equal(calculateScore(7, 10), 7);
  assert.equal(calculateScore(2, 3), 6.7);
  assert.equal(calculateScore(0, 5), 0);
  assert.equal(calculateScore(0, 0), 0);
});

test('detectDuplicateQuestions detects duplicate wording regardless of case and diacritics', () => {
  const existing = [
    { id: 'q1', content: 'Thiết bị nào sau đây là thiết bị vào của máy tính?' },
    { id: 'q2', content: 'CPU là viết tắt của từ gì?' },
  ];

  // Exact duplicate with different punctuation or case
  const dupCheck1 = detectDuplicateQuestions('Thiết bị nào sau đây là thiết bị vào của máy tính?!', existing);
  assert.equal(dupCheck1.isDuplicate, true);
  assert.equal(dupCheck1.duplicateId, 'q1');

  // New unique question
  const dupCheck2 = detectDuplicateQuestions('RAM có chức năng gì trong máy tính?', existing);
  assert.equal(dupCheck2.isDuplicate, false);
});

test('validateQuestion verifies mandatory fields', () => {
  const invalidQ: Partial<Question> = {
    content: 'Hi',
    options: [{ id: 'A', text: 'Opt A' }],
  };
  const res1 = validateQuestion(invalidQ);
  assert.equal(res1.isValid, false);
  assert.ok(res1.errors.length > 0);

  const validQ: Partial<Question> = {
    content: 'Mạng máy tính là gì?',
    options: [
      { id: 'A', text: 'Hai hay nhiều máy tính kết nối với nhau' },
      { id: 'B', text: 'Chỉ có một máy tính duy nhất' },
    ],
    correctAnswer: 'A',
    subjectId: 'tin_hoc',
    gradeId: '6',
  };
  const res2 = validateQuestion(validQ);
  assert.equal(res2.isValid, true);
  assert.equal(res2.errors.length, 0);
});

test('countCognitiveLevels counts distributions correctly', () => {
  const mockQuestions: Question[] = [
    {
      id: '1',
      code: 'Q1',
      content: 'C1',
      options: [],
      correctAnswer: 'A',
      explanation: '',
      subjectId: 'tin_hoc',
      gradeId: '6',
      topicId: 't1',
      cognitiveLevel: 'nhan_biet',
      source: '',
    },
    {
      id: '2',
      code: 'Q2',
      content: 'C2',
      options: [],
      correctAnswer: 'A',
      explanation: '',
      subjectId: 'tin_hoc',
      gradeId: '6',
      topicId: 't1',
      cognitiveLevel: 'nhan_biet',
      source: '',
    },
    {
      id: '3',
      code: 'Q3',
      content: 'C3',
      options: [],
      correctAnswer: 'A',
      explanation: '',
      subjectId: 'tin_hoc',
      gradeId: '6',
      topicId: 't1',
      cognitiveLevel: 'thong_hieu',
      source: '',
    },
  ];

  const dist = countCognitiveLevels(mockQuestions);
  assert.equal(dist.nhan_biet, 2);
  assert.equal(dist.thong_hieu, 1);
  assert.equal(dist.van_dung, 0);
  assert.equal(dist.van_dung_cao, 0);
});

test('filterContentBySubjectAndGrade isolates by grade and subject', () => {
  const items = [
    { id: '1', subjectId: 'tin_hoc' as const, gradeId: '6' as const, name: 'Tin 6' },
    { id: '2', subjectId: 'tin_hoc' as const, gradeId: '7' as const, name: 'Tin 7' },
    { id: '3', subjectId: 'toan' as const, gradeId: '6' as const, name: 'Toán 6' },
  ];

  const filtered = filterContentBySubjectAndGrade(items, 'tin_hoc', '6');
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, '1');
});

test('formatFileSize converts bytes properly', () => {
  assert.equal(formatFileSize(0), '0 B');
  assert.equal(formatFileSize(1024), '1 KB');
  assert.equal(formatFileSize(1048576), '1 MB');
});
