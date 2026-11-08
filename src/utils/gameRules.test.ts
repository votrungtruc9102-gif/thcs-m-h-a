import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeAnswer,
  levenshteinDistance,
  checkTextAnswer,
  calculateImagePuzzleScore,
  MOVEMENT_GROUPS_CATALOG,
  isGameEligibleForClass,
  cloneGameForTargetClass,
} from './gameRules';

test('isGameEligibleForClass checks grade and applied class accurately', () => {
  const gameGrade7 = { gradeId: '7' as const, appliedClasses: ['7A5' as const] };
  const gameGrade8 = { gradeId: '8' as const, targetClass: '8A5' as const };
  const generalGrade9 = { gradeId: '9' as const };

  assert.equal(isGameEligibleForClass(gameGrade7, '7A5'), true);
  assert.equal(isGameEligibleForClass(gameGrade7, '6A5'), false);
  assert.equal(isGameEligibleForClass(gameGrade8, '8A5'), true);
  assert.equal(isGameEligibleForClass(gameGrade8, '9A5'), false);
  assert.equal(isGameEligibleForClass(generalGrade9, '9A5'), true);
});

test('cloneGameForTargetClass creates deep independent copy with new target class and draft status', () => {
  const original = {
    id: 'gym_orig',
    title: 'Thể Dục Trí Tuệ 6',
    gradeId: '6' as const,
    targetClass: '6A5' as const,
    appliedClasses: ['6A5' as const],
    status: 'published' as const,
    questions: [{ id: 'q1', prompt: 'Hỏi câu 1' }],
  };

  const cloned = cloneGameForTargetClass(original, '7A5');

  // Verify cloned attributes
  assert.equal(cloned.gradeId, '7');
  assert.equal(cloned.targetClass, '7A5');
  assert.deepEqual(cloned.appliedClasses, ['7A5']);
  assert.equal(cloned.status, 'draft');
  assert.notEqual(cloned.id, original.id);

  // Verify deep independence: mutating cloned questions does not affect original
  cloned.questions[0].prompt = 'Câu hỏi sửa riêng cho Lớp 7A5';
  assert.equal(original.questions[0].prompt, 'Hỏi câu 1');
});


test('normalizeAnswer trims, lowercases, and strips excessive spaces/punctuation', () => {
  assert.equal(normalizeAnswer('  Bộ vi xử lý CPU!  '), 'bộ vi xử lý cpu');
  assert.equal(normalizeAnswer('Router (Bộ định tuyến)...'), 'router bộ định tuyến');
  assert.equal(normalizeAnswer(''), '');
});

test('levenshteinDistance correctly calculates edit distance', () => {
  assert.equal(levenshteinDistance('cpu', 'cpu'), 0);
  assert.equal(levenshteinDistance('router', 'route'), 1);
  assert.equal(levenshteinDistance('ram', 'rom'), 1);
});

test('checkTextAnswer recognizes exact matches and accepted synonyms', () => {
  const primary = 'Bộ vi xử lý';
  const synonyms = ['CPU', 'Vi xử lý', 'Chip máy tính'];

  // Exact match with primary
  assert.equal(checkTextAnswer('bộ vi xử lý', primary, synonyms).isCorrect, true);
  
  // Match with synonym
  assert.equal(checkTextAnswer('cpu', primary, synonyms).isCorrect, true);
  assert.equal(checkTextAnswer('CPU ', primary, synonyms).isCorrect, true);
  assert.equal(checkTextAnswer('vi xử lý', primary, synonyms).isCorrect, true);

  // Minor typo tolerance for words >= 5 characters
  assert.equal(checkTextAnswer('routeer', 'router', []).isCorrect, true);

  // Unrelated wrong answer
  assert.equal(checkTextAnswer('màn hình', primary, synonyms).isCorrect, false);
});

test('calculateImagePuzzleScore deducts penalties but respects minimum threshold', () => {
  // Base 100 points, 1 hint used (-10)
  assert.equal(calculateImagePuzzleScore(100, 1, 10, 0.4), 90);

  // Base 100 points, 3 hints used (-30)
  assert.equal(calculateImagePuzzleScore(100, 3, 10, 0.4), 70);

  // Excessive hints doesn't drop below min 40% (40 pts)
  assert.equal(calculateImagePuzzleScore(100, 10, 10, 0.4), 40);
});

test('MOVEMENT_GROUPS_CATALOG defines all 8 required movement groups', () => {
  assert.equal(MOVEMENT_GROUPS_CATALOG.length, 8);
  const ids = MOVEMENT_GROUPS_CATALOG.map((m) => m.id);
  assert.deepEqual(ids, [
    'neck',
    'shoulders',
    'wrists',
    'elbows',
    'hips',
    'knees',
    'ankles',
    'full_body',
  ]);
});

import { INITIAL_GYMNASTICS_GAMES, INITIAL_IMAGE_PUZZLE_GAMES } from '../data/initialGames';

test('Initial games cover all 4 secondary classes: 6A5, 7A5, 8A5, 9A5', () => {
  const classes = ['6A5', '7A5', '8A5', '9A5'] as const;

  for (const cls of classes) {
    const gymGames = INITIAL_GYMNASTICS_GAMES.filter((g) => isGameEligibleForClass(g, cls));
    const puzzleGames = INITIAL_IMAGE_PUZZLE_GAMES.filter((g) => isGameEligibleForClass(g, cls));

    assert.ok(gymGames.length >= 1, `Missing Thể Dục Trí Tuệ game for class ${cls}`);
    assert.ok(puzzleGames.length >= 1, `Missing Giải Đố Hình Ảnh game for class ${cls}`);

    // Verify Thể Dục Trí Tuệ has questions covering all 8 movement groups
    const gymGame = gymGames[0];
    assert.equal(gymGame.questions.length, 8, `Class ${cls} Thể Dục Trí Tuệ should have 8 questions`);
    const coveredMovements = new Set(gymGame.questions.map((q) => q.movementGroup));
    assert.equal(coveredMovements.size, 8, `Class ${cls} should cover all 8 distinct movement groups`);

    // Verify Puzzle game has questions with valid images and hints
    const puzzleGame = puzzleGames[0];
    assert.ok(puzzleGame.questions.length >= 4, `Class ${cls} Puzzle game should have at least 4 puzzles`);
    for (const q of puzzleGame.questions) {
      assert.ok(q.hints.length >= 3, `Puzzle question ${q.id} in class ${cls} must have at least 3 hints`);
      assert.ok(q.correctAnswer.length > 0, `Puzzle question ${q.id} must have a correct answer`);
      assert.ok(q.image.startsWith('data:image/svg+xml'), `Puzzle question ${q.id} must have SVG image`);
    }
  }
});
