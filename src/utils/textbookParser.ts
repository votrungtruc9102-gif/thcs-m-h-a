import { SubjectId, GradeId, Lesson, Topic, ExtractedLesson, TextbookParseResult } from '../types';

/**
 * Normalizes text line breaks and multiple spaces
 */
export function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, '  ')
    .trim();
}

/**
 * Intelligent Vietnamese Textbook Structure Parser
 * Automatically parses Chapters/Topics, Lessons, Objectives, Core Knowledge, Examples, and Questions
 */
export function parseTextbookContent(
  rawContent: string,
  bookTitle: string,
  subjectId: SubjectId,
  gradeId: GradeId
): TextbookParseResult {
  const normalized = cleanText(rawContent);
  if (!normalized) {
    return {
      bookTitle,
      subjectId,
      gradeId,
      detectedTopics: [],
      lessons: [],
      rawTextLength: 0,
    };
  }

  const lines = normalized.split('\n').map((l) => l.trim()).filter(Boolean);

  // Split content by "Bài [số]: [Tên bài]" or "Bài [số]. [Tên bài]"
  const lessonRegex = /^(?:bài|bai)\s*([0-9]{1,2})[\s.:\-–—]+(.*)$/i;
  const topicRegex = /^(?:chủ\s*đề|chu\s*de|chương|chuong|phần|phan)\s*([0-9IVXLCDMivxlcdm]{1,5})[\s.:\-–—]+(.*)$/i;

  const detectedTopics: string[] = [];
  const lessons: ExtractedLesson[] = [];

  let currentTopicTitle = 'Chủ đề mặc định';
  let currentLessonRaw: {
    title: string;
    topicTitle: string;
    lines: string[];
  } | null = null;

  const rawLessonBlocks: Array<{
    title: string;
    topicTitle: string;
    lines: string[];
  }> = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line declares a Topic/Chapter
    const topicMatch = line.match(topicRegex);
    if (topicMatch) {
      currentTopicTitle = line;
      if (!detectedTopics.includes(line)) {
        detectedTopics.push(line);
      }
      continue;
    }

    // Check if line declares a Lesson
    const lessonMatch = line.match(lessonRegex);
    if (lessonMatch) {
      if (currentLessonRaw) {
        rawLessonBlocks.push(currentLessonRaw);
      }
      currentLessonRaw = {
        title: line,
        topicTitle: currentTopicTitle,
        lines: [],
      };
      continue;
    }

    if (currentLessonRaw) {
      currentLessonRaw.lines.push(line);
    } else {
      // If content appears before any "Bài X", create an initial block if substantial
      if (!currentLessonRaw && lines.length > 0 && i === 0) {
        currentLessonRaw = {
          title: bookTitle || 'Bài học trích xuất từ SGK',
          topicTitle: currentTopicTitle,
          lines: [line],
        };
      }
    }
  }

  if (currentLessonRaw) {
    rawLessonBlocks.push(currentLessonRaw);
  }

  // Parse each raw lesson block into structured fields
  rawLessonBlocks.forEach((block, index) => {
    const lessonObj = parseSingleLessonBlock(block.lines, block.title, block.topicTitle, bookTitle, index);
    lessons.push(lessonObj);
  });

  return {
    bookTitle: bookTitle || 'Sách giáo khoa điện tử',
    subjectId,
    gradeId,
    detectedTopics: detectedTopics.length > 0 ? detectedTopics : [currentTopicTitle],
    lessons,
    rawTextLength: normalized.length,
  };
}

/**
 * Extracts sections from a single lesson's text lines
 */
function parseSingleLessonBlock(
  lines: string[],
  lessonTitle: string,
  topicTitle: string,
  bookTitle: string,
  index: number
): ExtractedLesson {
  const objectives: string[] = [];
  const coreKnowledgeLines: string[] = [];
  const examples: string[] = [];
  const reviewQuestions: Array<{ question: string; answer: string }> = [];

  type SectionMode = 'none' | 'objectives' | 'knowledge' | 'examples' | 'questions';
  let mode: SectionMode = 'knowledge';

  const objectivesHeaderRegex = /^(?:mục\s*tiêu|yêu\s*cầu\s*cần\s*đạt|sau\s*bài\s*học\s*này|học\s*xong\s*bài\s*này)/i;
  const knowledgeHeaderRegex = /^(?:kiến\s*thức\s*trọng\s*tâm|nội\s*dung\s*bài\s*học|khám\s*phá|lý\s*thuyết|[1-9]\.\s*)/i;
  const exampleHeaderRegex = /^(?:ví\s*dụ|hoạt\s*động|tình\s*huống|thực\s*hành)/i;
  const questionHeaderRegex = /^(?:câu\s*hỏi|luyện\s*tập|vận\s*dụng|củng\s*cố|ôn\s*tập|bài\s*tập)/i;

  for (const line of lines) {
    // Check mode transition headers
    if (objectivesHeaderRegex.test(line)) {
      mode = 'objectives';
      continue;
    } else if (exampleHeaderRegex.test(line)) {
      mode = 'examples';
      continue;
    } else if (questionHeaderRegex.test(line)) {
      mode = 'questions';
      continue;
    } else if (knowledgeHeaderRegex.test(line)) {
      mode = 'knowledge';
    }

    if (mode === 'objectives') {
      // Clean bullet points
      const cleanObj = line.replace(/^[-•*+–—]\s*/, '').replace(/^[0-9]+\.\s*/, '').trim();
      if (cleanObj.length > 5) {
        objectives.push(cleanObj);
      }
    } else if (mode === 'examples') {
      examples.push(line);
    } else if (mode === 'questions') {
      const cleanQ = line.replace(/^[-•*+–—]\s*/, '').replace(/^(?:câu\s*[0-9]+|bài\s*[0-9]+)[\s.:\-–—]+/i, '').trim();
      if (cleanQ.length > 5) {
        reviewQuestions.push({
          question: cleanQ,
          answer: 'Xem lại phần kiến thức trọng tâm trong sách giáo khoa để trả lời chính xác.',
        });
      }
    } else {
      coreKnowledgeLines.push(line);
    }
  }

  // Fallbacks if section was sparse or unstructured
  if (objectives.length === 0) {
    objectives.push(`Nắm vững kiến thức cốt lõi và kỹ năng thực hành của ${lessonTitle}.`);
    objectives.push('Vận dụng kiến thức vào giải quyết các bài tập và tình huống thực tiễn.');
  }

  if (coreKnowledgeLines.length === 0 && lines.length > 0) {
    coreKnowledgeLines.push(...lines.slice(0, 15));
  }

  if (reviewQuestions.length === 0) {
    reviewQuestions.push({
      question: `Em hãy tóm tắt nội dung chính đã học trong ${lessonTitle}?`,
      answer: 'Học sinh trình bày lại các ý chính đã được nêu trong mục kiến thức trọng tâm.',
    });
  }

  return {
    id: `ext_${Date.now()}_${index}`,
    topicTitle,
    title: lessonTitle,
    objectives,
    coreKnowledge: coreKnowledgeLines.join('\n\n'),
    examples: examples.length > 0 ? examples : [`Ví dụ minh họa thực tế cho ${lessonTitle}`],
    reviewQuestions,
    references: [bookTitle || 'Sách giáo khoa chuẩn THCS Mỹ Hòa'],
    status: 'draft',
    sourceBookTitle: bookTitle,
  };
}

/**
 * Converts an ExtractedLesson to a persistent Lesson object
 */
export function convertExtractedLessonToLesson(
  extracted: ExtractedLesson,
  topicId: string,
  subjectId: SubjectId,
  gradeId: GradeId,
  order: number,
  status: 'draft' | 'published' = 'published',
  sourceDocumentId?: string
): Lesson {
  return {
    id: `les_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    topicId,
    subjectId,
    gradeId,
    title: extracted.title,
    order,
    objectives: extracted.objectives,
    coreKnowledge: extracted.coreKnowledge,
    examples: extracted.examples,
    reviewQuestions: extracted.reviewQuestions,
    references: extracted.references || [extracted.sourceBookTitle || 'Sách giáo khoa'],
    attachedDocIds: sourceDocumentId ? [sourceDocumentId] : [],
    status,
    sourceDocumentId,
    sourceBookTitle: extracted.sourceBookTitle,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Sample textbook text for testing and instant demonstration
 */
export const SAMPLE_TEXTBOOK_DATA = `
Chủ đề 2: Mạng máy tính và Internet

Bài 4: An toàn thông tin và bảo vệ dữ liệu cá nhân

Mục tiêu
- Nêu được tầm quan trọng của việc bảo vệ mật khẩu và dữ liệu cá nhân trên không gian mạng.
- Biết cách đặt mật khẩu mạnh và không chia sẻ thông tin nhạy cảm cho người lạ.
- Nhận biết các nguy cơ rò rỉ thông tin cá nhân và phần mềm độc hại.

Kiến thức trọng tâm
1. Dữ liệu cá nhân là gì?
Dữ liệu cá nhân bao gồm họ tên, ngày tháng năm sinh, địa chỉ nhà ở, số điện thoại, hình ảnh cá nhân và thông tin tài khoản học tập.
Khi kẻ xấu chiếm đoạt được dữ liệu cá nhân, chúng có thể mạo danh, lừa đảo hoặc gây ảnh hưởng tiêu cực tới uy tín của học sinh.

2. Quy tắc đặt mật khẩu mạnh (Strong Password):
- Độ dài tối thiểu từ 8 đến 12 ký tự trở lên.
- Kết hợp cả chữ hoa (A-Z), chữ thường (a-z), chữ số (0-9) và ký tự đặc biệt (@, #, $, %, !).
- Không dùng thông tin dễ đoán như ngày sinh, số điện thoại hay tên riêng.
- Thay đổi mật khẩu định kỳ và không dùng chung một mật khẩu cho mọi tài khoản.

3. Phòng tránh mã độc và liên kết lừa đảo (Phishing):
- Tuyệt đối không bấm vào các đường link lạ nhận được qua tin nhắn mạng xã hội.
- Không tải về các tệp tin không rõ nguồn gốc từ Internet.
- Luôn đăng xuất tài khoản sau khi dùng xong máy tính tại phòng máy của trường.

Ví dụ
Ví dụ 1: Bạn An đặt mật khẩu là "an2014" - đây là mật khẩu rất yếu vì ngắn và dùng năm sinh.
Ví dụ 2: Thầy giáo hướng dẫn An đổi mật khẩu thành "Mh@2026#AnPro!" - mật khẩu này rất an toàn vì đủ ký tự hoa, thường, số và ký hiệu đặc biệt.

Câu hỏi ôn tập
Câu 1: Vì sao em không nên tiết lộ địa chỉ nhà và số điện thoại cá nhân trên các diễn đàn mở?
Câu 2: Một mật khẩu mạnh cần đảm bảo những tiêu chí nào? Hãy cho một ví dụ minh họa?
`.trim();
