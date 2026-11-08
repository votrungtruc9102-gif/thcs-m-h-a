import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanText,
  parseTextbookContent,
  convertExtractedLessonToLesson,
  SAMPLE_TEXTBOOK_DATA,
} from './textbookParser';

test('cleanText removes carriage returns and trims text', () => {
  const raw = '  Hello \r\n World \t \r  ';
  const cleaned = cleanText(raw);
  assert.equal(cleaned.includes('\r'), false);
  assert.equal(cleaned.startsWith('Hello'), true);
});

test('parseTextbookContent extracts Topic, Lesson, Objectives, and Questions', () => {
  const result = parseTextbookContent(
    SAMPLE_TEXTBOOK_DATA,
    'Sách giáo khoa Tin học 6 - Kết nối tri thức',
    'tin_hoc',
    '6'
  );

  assert.equal(result.bookTitle, 'Sách giáo khoa Tin học 6 - Kết nối tri thức');
  assert.equal(result.subjectId, 'tin_hoc');
  assert.equal(result.gradeId, '6');
  assert.ok(result.detectedTopics.length >= 1);
  assert.ok(result.detectedTopics[0].includes('Chủ đề 2'));

  assert.equal(result.lessons.length, 1);
  const lesson = result.lessons[0];
  assert.ok(lesson.title.includes('Bài 4'));
  assert.ok(lesson.objectives.length >= 2);
  assert.ok(lesson.coreKnowledge.toLowerCase().includes('mật khẩu mạnh'));
  assert.ok(lesson.examples.length >= 1);
  assert.ok(lesson.reviewQuestions.length >= 1);
  assert.equal(lesson.status, 'draft');
});

test('convertExtractedLessonToLesson creates a valid published Lesson', () => {
  const parsed = parseTextbookContent(
    SAMPLE_TEXTBOOK_DATA,
    'SGK Tin 6',
    'tin_hoc',
    '6'
  );
  const extracted = parsed.lessons[0];
  const lesson = convertExtractedLessonToLesson(
    extracted,
    'top_tin6_2',
    'tin_hoc',
    '6',
    4,
    'published',
    'doc_123'
  );

  assert.equal(lesson.topicId, 'top_tin6_2');
  assert.equal(lesson.subjectId, 'tin_hoc');
  assert.equal(lesson.gradeId, '6');
  assert.equal(lesson.status, 'published');
  assert.equal(lesson.sourceDocumentId, 'doc_123');
  assert.ok(lesson.objectives.length > 0);
  assert.ok(lesson.id.startsWith('les_'));
});
