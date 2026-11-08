import { Question, CognitiveLevel, SubjectId, GradeId } from '../types';

/**
 * Calculates a standardized score out of 10.0 based on correct count
 */
export function calculateScore(correctCount: number, totalQuestions: number): number {
  if (totalQuestions <= 0) return 0;
  if (correctCount < 0) return 0;
  const raw = (correctCount / totalQuestions) * 10;
  return Math.round(raw * 10) / 10;
}

/**
 * Normalizes text for duplicate comparison (removes accents, lowercase, strips punctuation)
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Detects if a question with near-identical wording already exists
 */
export function detectDuplicateQuestions(
  newQuestionContent: string,
  existingQuestions: Array<{ id: string; content: string }>
): { isDuplicate: boolean; duplicateId?: string } {
  const normalizedNew = normalizeText(newQuestionContent);
  if (!normalizedNew) return { isDuplicate: false };

  for (const q of existingQuestions) {
    const normalizedExisting = normalizeText(q.content);
    if (normalizedExisting === normalizedNew) {
      return { isDuplicate: true, duplicateId: q.id };
    }
  }
  return { isDuplicate: false };
}

/**
 * Validates a question object before adding to Question Bank
 */
export function validateQuestion(q: Partial<Question>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!q.content || q.content.trim().length < 5) {
    errors.push('Nội dung câu hỏi phải có ít nhất 5 ký tự.');
  }

  if (!q.options || q.options.length < 2) {
    errors.push('Câu hỏi phải có ít nhất 2 phương án trả lời.');
  } else {
    const hasEmptyOption = q.options.some((opt) => !opt.text || opt.text.trim().length === 0);
    if (hasEmptyOption) {
      errors.push('Tất cả các phương án trả lời phải có nội dung.');
    }
  }

  if (!q.correctAnswer) {
    errors.push('Vui lòng chọn đáp án đúng.');
  } else if (q.options && !q.options.some((opt) => opt.id === q.correctAnswer)) {
    errors.push('Đáp án đúng không nằm trong danh sách các phương án.');
  }

  if (!q.subjectId) {
    errors.push('Vui lòng chọn môn học.');
  }

  if (!q.gradeId) {
    errors.push('Vui lòng chọn khối lớp.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Summarizes the cognitive level distribution of a list of questions
 */
export function countCognitiveLevels(questions: Question[]): Record<CognitiveLevel, number> {
  const result: Record<CognitiveLevel, number> = {
    nhan_biet: 0,
    thong_hieu: 0,
    van_dung: 0,
    van_dung_cao: 0,
  };

  for (const q of questions) {
    if (q.cognitiveLevel && result[q.cognitiveLevel] !== undefined) {
      result[q.cognitiveLevel] += 1;
    }
  }

  return result;
}

/**
 * Filters any content list strictly by Subject and Grade
 */
export function filterContentBySubjectAndGrade<T extends { subjectId: SubjectId; gradeId: GradeId }>(
  items: T[],
  subjectId: SubjectId,
  gradeId: GradeId
): T[] {
  return items.filter((item) => item.subjectId === subjectId && item.gradeId === gradeId);
}

/**
 * Formats byte size to human readable string (KB, MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Parses and verifies question JSON for batch import
 */
export function parseQuestionsFromJSON(
  rawText: string,
  defaultSubject: SubjectId,
  defaultGrade: GradeId
): { success: boolean; questions: Question[]; errors: string[] } {
  try {
    const parsed = JSON.parse(rawText);
    if (!Array.isArray(parsed)) {
      return { success: false, questions: [], errors: ['Dữ liệu tệp JSON phải là một danh sách các câu hỏi.'] };
    }

    const validQuestions: Question[] = [];
    const errors: string[] = [];

    parsed.forEach((item, index) => {
      const q: Question = {
        id: item.id || `imp_${Date.now()}_${index}`,
        code: item.code || `Q_${index + 1}`,
        content: item.content || item.question || '',
        options: item.options || [
          { id: 'A', text: item.optionA || '' },
          { id: 'B', text: item.optionB || '' },
          { id: 'C', text: item.optionC || '' },
          { id: 'D', text: item.optionD || '' },
        ],
        correctAnswer: item.correctAnswer || item.answer || 'A',
        explanation: item.explanation || item.note || '',
        subjectId: item.subjectId || defaultSubject,
        gradeId: item.gradeId || defaultGrade,
        topicId: item.topicId || 'default',
        cognitiveLevel: item.cognitiveLevel || 'nhan_biet',
        source: item.source || 'Nhập từ tệp JSON',
      };

      const val = validateQuestion(q);
      if (val.isValid) {
        validQuestions.push(q);
      } else {
        errors.push(`Câu ${index + 1}: ${val.errors.join(', ')}`);
      }
    });

    return {
      success: validQuestions.length > 0,
      questions: validQuestions,
      errors,
    };
  } catch (err: any) {
    return {
      success: false,
      questions: [],
      errors: [`Định dạng JSON không hợp lệ: ${err.message}`],
    };
  }
}
