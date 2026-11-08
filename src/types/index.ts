export type GradeId = '6' | '7' | '8' | '9';

export type SchoolClass = '6A5' | '7A5' | '8A5' | '9A5';

export type UserRole = 'guest' | 'student' | 'teacher';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  username?: string;
  avatar?: string;
  className?: SchoolClass | string;
  gradeId?: GradeId;
  studentCode?: string;
  teacherCode?: string;
  subjectDepartment?: string;
  email?: string;
  joinedAt?: string;
  isLocked?: boolean;
}

export interface UserAccount {
  id: string;
  username: string;
  passwordHash: string; // salt$sha256
  salt: string;
  role: 'student' | 'teacher';
  name: string;
  className?: SchoolClass;
  gradeId?: GradeId;
  studentCode?: string;
  teacherCode?: string;
  subjectDepartment?: string;
  email?: string;
  avatar?: string;
  isLocked?: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export type SubjectId =
  | 'tin_hoc'
  | 'toan'
  | 'ngu_van'
  | 'tieng_anh'
  | 'khoa_hoc_tu_nhien'
  | 'lich_su_dia_li'
  | 'cong_nghe'
  | 'giao_duc_cong_dan'
  | 'am_nhac'
  | 'mi_thuat'
  | 'giao_duc_the_chat'
  | 'hoat_dong_trai_nghiem'
  | 'giao_duc_dia_phuong';

export interface SubjectConfig {
  id: SubjectId;
  name: string;
  iconName: string;
  color: string;
  bgLight: string;
  borderColor: string;
  description: string;
  hasContent: boolean;
}

export type CognitiveLevel = 'nhan_biet' | 'thong_hieu' | 'van_dung' | 'van_dung_cao';

export interface QuestionOption {
  id: string; // 'A' | 'B' | 'C' | 'D'
  text: string;
}

export interface Question {
  id: string;
  code: string;
  content: string;
  options: QuestionOption[];
  correctAnswer: string; // 'A' | 'B' | 'C' | 'D'
  explanation: string;
  subjectId: SubjectId;
  gradeId: GradeId;
  topicId: string;
  cognitiveLevel: CognitiveLevel;
  source: string;
  createdAt?: string;
}

export interface Lesson {
  id: string;
  topicId: string;
  subjectId: SubjectId;
  gradeId: GradeId;
  title: string;
  order: number;
  objectives: string[];
  coreKnowledge: string;
  examples: string[];
  reviewQuestions: {
    question: string;
    answer: string;
  }[];
  references?: string[];
  attachedDocIds?: string[];
  status?: 'published' | 'draft';
  sourceDocumentId?: string;
  sourceBookTitle?: string;
  updatedAt?: string;
}

export interface ExtractedLesson {
  id: string;
  topicTitle: string;
  title: string;
  objectives: string[];
  coreKnowledge: string;
  examples: string[];
  reviewQuestions: {
    question: string;
    answer: string;
  }[];
  references?: string[];
  status: 'draft' | 'published';
  sourceBookTitle?: string;
}

export interface TextbookParseResult {
  bookTitle: string;
  subjectId: SubjectId;
  gradeId: GradeId;
  detectedTopics: string[];
  lessons: ExtractedLesson[];
  rawTextLength: number;
}

export interface Topic {
  id: string;
  subjectId: SubjectId;
  gradeId: GradeId;
  title: string;
  description: string;
  order: number;
  icon: string;
}

export interface ExamQuestionConfig {
  questionId: string;
  points: number;
}

export interface Exam {
  id: string;
  title: string;
  subjectId: SubjectId;
  gradeId: GradeId;
  timeMinutes: number;
  questions: ExamQuestionConfig[];
  totalPoints: number;
  cognitiveDistribution: Record<CognitiveLevel, number>;
  createdAt: string;
  gradingGuide?: string;
}

export interface QuizAttempt {
  id: string;
  subjectId: SubjectId;
  gradeId: GradeId;
  topicId?: string;
  timestamp: string;
  totalQuestions: number;
  correctCount: number;
  score: number; // 0 - 10
  timeSpentSeconds: number;
  userAnswers: Record<string, string>; // questionId -> chosenOption
}

export type DocumentType = 'pdf' | 'docx' | 'pptx' | 'xlsx' | 'txt' | 'image' | 'json';

export interface DocumentItem {
  id: string;
  fileName: string;
  fileSize: number; // in bytes
  fileType: DocumentType;
  title: string;
  subjectId: SubjectId;
  gradeId: GradeId;
  topicId?: string;
  lessonId?: string;
  schoolYear: string;
  source: string;
  notes: string;
  uploadedBy: string;
  uploadedAt: string;
  status: 'uploaded' | 'processed' | 'teacher_verified';
  downloadUrl?: string;
  textSnippet?: string;
}

export interface TermPair {
  id: string;
  term: string;
  definition: string;
  category: string;
}

export type ExerciseMovementGroup =
  | 'neck' // 1. Cổ
  | 'shoulders' // 2. Vai
  | 'wrists' // 3. Xoay cổ tay
  | 'elbows' // 4. Khớp khuỷu tay
  | 'hips' // 5. Khớp hông
  | 'knees' // 6. Khớp gối
  | 'ankles' // 7. Cổ chân
  | 'full_body'; // 8. Toàn thân / vươn người nhẹ nhàng

export type GameQuestionType = 'multiple_choice' | 'short_answer';

export interface GymnasticsQuestion {
  id: string;
  type: GameQuestionType;
  prompt: string;
  options?: { id: string; text: string }[];
  correctAnswer: string;
  acceptedAnswers?: string[];
  hint?: string;
  explanation?: string;
  movementGroup: ExerciseMovementGroup;
  repetitionCount: number; // 2, 4, 6, 8
  timeLimitSeconds: number; // default 120s
  points: number;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio';
}

export interface GymnasticsGame {
  id: string;
  title: string;
  description: string;
  subjectId: SubjectId;
  gradeId: GradeId;
  targetClass?: SchoolClass;
  appliedClasses?: SchoolClass[];
  status: 'draft' | 'published';
  questions: GymnasticsQuestion[];
  thumbnail?: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImagePuzzleQuestion {
  id: string;
  image: string; // URL, data URL, or SVG
  title?: string;
  prompt: string;
  hints: string[];
  hintPenaltyPoints?: number;
  correctAnswer: string;
  acceptedAnswers: string[];
  explanation: string;
  timeLimitSeconds: number;
  points: number;
}

export interface ImagePuzzleGame {
  id: string;
  title: string;
  description: string;
  subjectId: SubjectId;
  gradeId: GradeId;
  targetClass?: SchoolClass;
  appliedClasses?: SchoolClass[];
  status: 'draft' | 'published';
  questions: ImagePuzzleQuestion[];
  thumbnail?: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface GameScore {
  id: string;
  gameType: 'wheel' | 'matching' | 'speed' | 'keyword' | 'gymnastics' | 'image_puzzle' | string;
  score: number;
  maxScore: number;
  timestamp: string;
  details: string;
}

export type TechThemeMode = 'white' | 'black' | 'auto';

export type EduLinkCategory =
  | 'textbooks'
  | 'official_portals'
  | 'training_materials'
  | 'exam_references';

export const EDU_SUBJECT_LIST = [
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
] as const;

export type EduSubjectName = (typeof EDU_SUBJECT_LIST)[number];

export const BOOK_SERIES_LIST = [
  'Kết nối tri thức với cuộc sống',
  'Chân trời sáng tạo',
  'Cánh Diều',
  'Bộ sách khác',
] as const;

export type BookSeriesType = (typeof BOOK_SERIES_LIST)[number];

export interface EduLinkItem {
  id: string;
  title: string;
  description: string;
  url: string;
  category: EduLinkCategory;
  entryType?: 'link' | 'file';
  gradeId?: GradeId | 'all';
  subjectId?: SubjectId | 'general';
  subjectName?: string;
  bookSeries?: string;
  publisher?: string;
  schoolYear?: string;
  coverImageUrl?: string;
  fileDataUrl?: string;
  fileName?: string;
  fileSize?: string;
  fileStorageId?: string;
  allowDownload?: boolean;
  isPinned?: boolean;
  isOfficial?: boolean;
  thumbnailUrl?: string;
  iconName?: string;
  badgeText?: string;
  addedBy?: string;
  createdAt: string;
  updatedAt?: string;
  isVisible: boolean;
  openCount?: number;
}



