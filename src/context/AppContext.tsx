import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SubjectId,
  GradeId,
  SubjectConfig,
  Topic,
  Lesson,
  Question,
  DocumentItem,
  QuizAttempt,
  GameScore,
  UserProfile,
  UserAccount,
  SchoolClass,
  GymnasticsGame,
  ImagePuzzleGame,
  TechThemeMode,
  EduLinkItem,
} from '../types';
import {
  SUBJECTS,
  GRADES,
  INITIAL_TOPICS,
  INITIAL_LESSONS,
  INITIAL_QUESTIONS,
  INITIAL_DOCUMENTS,
} from '../data/initialData';
import {
  INITIAL_GYMNASTICS_GAMES,
  INITIAL_IMAGE_PUZZLE_GAMES,
} from '../data/initialGames';
import { INITIAL_EDU_LINKS } from '../data/initialEduLinks';
import {
  loadStoredAccounts,
  saveStoredAccounts,
  accountToProfile,
} from '../data/userAccounts';
import {
  AUTH_MESSAGES,
  validateRegistration,
  hashPassword,
  verifyPassword,
  deriveGradeFromClass,
  isAttemptLocked,
  recordFailedAttempt,
  resetFailedAttempts,
} from '../utils/cryptoAuth';
import { cloneGameForTargetClass } from '../utils/gameRules';

interface AppContextType {
  selectedSubjectId: SubjectId;
  selectedGradeId: GradeId;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  setSubjectAndGrade: (subjectId: SubjectId, gradeId: GradeId) => void;
  
  activeTab: 'home' | 'knowledge' | 'practice' | 'games' | 'statistics' | 'teacher' | 'links';
  setActiveTab: (tab: 'home' | 'knowledge' | 'practice' | 'games' | 'statistics' | 'teacher' | 'links') => void;


  // Dual Account System
  accounts: UserAccount[];
  currentUser: UserProfile | null;
  authModalInitialTab: 'student' | 'teacher';
  openAuthModal: (defaultTab?: 'student' | 'teacher') => void;
  closeAuthModal: () => void;
  registerStudent: (input: {
    fullName: string;
    username: string;
    className: SchoolClass;
    password: string;
    confirmPassword: string;
  }) => { success: boolean; message: string };
  loginWithCredentials: (
    username: string,
    password: string,
    expectedRole: 'student' | 'teacher'
  ) => { success: boolean; message?: string };
  updateStudentClass: (accountId: string, newClass: SchoolClass) => boolean;
  toggleAccountLock: (accountId: string) => boolean;
  deleteStudentAccount: (accountId: string) => boolean;
  loginAsTeacher: (codeOrEmail: string, password?: string) => { success: boolean; message?: string };
  loginAsStudent: (student: { name: string; className: string; gradeId: GradeId; studentCode?: string }) => void;
  loginWithPredefinedUser: (user: UserProfile) => void;
  logout: () => void;

  isTeacherAuthenticated: boolean;
  setIsTeacherAuthenticated: (auth: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  questionBank: Question[];
  addQuestion: (q: Question) => void;
  updateQuestion: (q: Question) => void;
  deleteQuestion: (id: string) => void;
  importQuestionsBatch: (qs: Question[]) => number;

  topics: Topic[];
  addTopic: (topic: Topic) => void;
  updateTopic: (topic: Topic) => void;
  deleteTopic: (topicId: string) => void;

  lessons: Lesson[];
  addLesson: (lesson: Lesson) => void;
  updateLesson: (lesson: Lesson) => void;
  deleteLesson: (lessonId: string) => void;
  publishLesson: (lessonId: string) => void;
  unpublishLesson: (lessonId: string) => void;
  batchImportLessons: (newLessons: Lesson[], newTopics?: Topic[]) => void;

  documents: DocumentItem[];
  addDocument: (doc: DocumentItem) => void;
  deleteDocument: (id: string) => void;

  quizAttempts: QuizAttempt[];
  addQuizAttempt: (attempt: QuizAttempt) => void;

  gameScores: GameScore[];
  addGameScore: (score: GameScore) => void;

  gymnasticsGames: GymnasticsGame[];
  addGymnasticsGame: (game: GymnasticsGame) => void;
  updateGymnasticsGame: (game: GymnasticsGame) => void;
  deleteGymnasticsGame: (id: string) => void;
  cloneGymnasticsGameToClass: (gameId: string, targetClass: SchoolClass, newTitle?: string) => GymnasticsGame | null;

  imagePuzzleGames: ImagePuzzleGame[];
  addImagePuzzleGame: (game: ImagePuzzleGame) => void;
  updateImagePuzzleGame: (game: ImagePuzzleGame) => void;
  deleteImagePuzzleGame: (id: string) => void;
  cloneImagePuzzleGameToClass: (gameId: string, targetClass: SchoolClass, newTitle?: string) => ImagePuzzleGame | null;

  bgIntensity: 'subtle' | 'vibrant';
  setBgIntensity: (intensity: 'subtle' | 'vibrant') => void;

  // Modern Dual Tech Theme System
  techTheme: TechThemeMode;
  effectiveTheme: 'white' | 'black';
  setTechTheme: (mode: TechThemeMode) => void;
  isTechThemeModalOpen: boolean;
  setIsTechThemeModalOpen: (open: boolean) => void;

  // Educational Links & Official 2026-2027 Resources
  eduLinks: EduLinkItem[];
  addEduLink: (link: EduLinkItem) => void;
  updateEduLink: (link: EduLinkItem) => void;
  deleteEduLink: (id: string) => void;
  toggleEduLinkPin: (id: string) => void;
  toggleEduLinkVisibility: (id: string) => void;
  recordEduLinkOpen: (id: string) => void;

  // Convenient selectors
  currentSubject: SubjectConfig;
  currentGrade: { id: string; name: string; badge: string; desc: string; icon: string };
  filteredTopics: Topic[];
  filteredLessons: Lesson[];
  teacherAllLessons: Lesson[];
  filteredQuestions: Question[];
  filteredDocuments: DocumentItem[];
  filteredGymnasticsGames: GymnasticsGame[];
  filteredImagePuzzleGames: ImagePuzzleGame[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial from localStorage or defaults
  const [selectedSubjectId, setSelectedSubjectId] = useState<SubjectId>(() => {
    return (localStorage.getItem('thcs_myhoa_subject') as SubjectId) || 'tin_hoc';
  });
  const [selectedGradeId, setSelectedGradeId] = useState<GradeId>(() => {
    return (localStorage.getItem('thcs_myhoa_grade') as GradeId) || '6';
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'knowledge' | 'practice' | 'games' | 'statistics' | 'teacher' | 'links'>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState<'student' | 'teacher'>('student');

  // Tech Theme State ('white' | 'black' | 'auto')
  const [techTheme, setTechThemeState] = useState<TechThemeMode>(() => {
    try {
      const saved = localStorage.getItem('thcs_myhoa_tech_theme');
      if (saved === 'white' || saved === 'black' || saved === 'auto') {
        return saved;
      }
    } catch {}
    return 'white';
  });

  const [effectiveTheme, setEffectiveTheme] = useState<'white' | 'black'>('white');
  const [isTechThemeModalOpen, setIsTechThemeModalOpen] = useState(false);

  // Sync effectiveTheme based on techTheme and media query
  useEffect(() => {
    const updateEffective = () => {
      if (techTheme === 'white') {
        setEffectiveTheme('white');
        document.documentElement.classList.remove('dark');
      } else if (techTheme === 'black') {
        setEffectiveTheme('black');
        document.documentElement.classList.add('dark');
      } else {
        // 'auto' mode
        const isSystemDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const resolved = isSystemDark ? 'black' : 'white';
        setEffectiveTheme(resolved);
        if (resolved === 'black') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    updateEffective();
    try {
      localStorage.setItem('thcs_myhoa_tech_theme', techTheme);
    } catch {}

    if (techTheme === 'auto' && typeof window !== 'undefined' && window.matchMedia) {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => updateEffective();
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, [techTheme]);

  const setTechTheme = (mode: TechThemeMode) => {
    setTechThemeState(mode);
  };


  // User Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('thcs_myhoa_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [isTeacherAuthenticated, setIsTeacherAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('thcs_myhoa_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.role === 'teacher';
      }
    } catch {}
    return false;
  });

  // Accounts state (persisted securely)
  const [accounts, setAccounts] = useState<UserAccount[]>(() => loadStoredAccounts());

  useEffect(() => {
    saveStoredAccounts(accounts);
  }, [accounts]);

  // Sync user state and role
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('thcs_myhoa_user', JSON.stringify(currentUser));
      setIsTeacherAuthenticated(currentUser.role === 'teacher');
      if (currentUser.role === 'student' && currentUser.gradeId) {
        setSelectedGradeId(currentUser.gradeId);
      }
    } else {
      localStorage.removeItem('thcs_myhoa_user');
      setIsTeacherAuthenticated(false);
    }
  }, [currentUser]);

  // Background intensity state for modern tech wallpaper customization
  const [bgIntensity, setBgIntensity] = useState<'subtle' | 'vibrant'>('subtle');

  // Topics state
  const [topics, setTopics] = useState<Topic[]>(() => {
    try {
      const saved = localStorage.getItem('thcs_myhoa_topics');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_TOPICS;
  });

  // Lessons state (defaults to published for existing core lessons)
  const [lessons, setLessons] = useState<Lesson[]>(() => {
    try {
      const saved = localStorage.getItem('thcs_myhoa_lessons');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_LESSONS.map((l) => ({ ...l, status: 'published' as const }));
  });

  // Question bank state
  const [questionBank, setQuestionBank] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem('thcs_myhoa_questions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_QUESTIONS;
  });

  // Documents state
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    try {
      const saved = localStorage.getItem('thcs_myhoa_docs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_DOCUMENTS;
  });

  // Quiz history
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>(() => {
    try {
      const saved = localStorage.getItem('thcs_myhoa_attempts');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Game scores
  const [gameScores, setGameScores] = useState<GameScore[]>(() => {
    try {
      const saved = localStorage.getItem('thcs_myhoa_games');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Gymnastics Games state
  const [gymnasticsGames, setGymnasticsGames] = useState<GymnasticsGame[]>(() => {
    try {
      const saved = localStorage.getItem('thcs_myhoa_gym_games');
      if (saved) {
        const parsed: GymnasticsGame[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map((g) => g.id));
        const missing = INITIAL_GYMNASTICS_GAMES.filter((g) => !existingIds.has(g.id));
        return [...parsed, ...missing];
      }
    } catch {}
    return INITIAL_GYMNASTICS_GAMES;
  });

  // Image Puzzle Games state
  const [imagePuzzleGames, setImagePuzzleGames] = useState<ImagePuzzleGame[]>(() => {
    try {
      const saved = localStorage.getItem('thcs_myhoa_puzzle_games');
      if (saved) {
        const parsed: ImagePuzzleGame[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map((g) => g.id));
        const missing = INITIAL_IMAGE_PUZZLE_GAMES.filter((g) => !existingIds.has(g.id));
        return [...parsed, ...missing];
      }
    } catch {}
    return INITIAL_IMAGE_PUZZLE_GAMES;
  });

  // Official Educational Links 2026-2027 state
  const [eduLinks, setEduLinks] = useState<EduLinkItem[]>(() => {
    try {
      const saved = localStorage.getItem('thcs_myhoa_edu_links');
      if (saved) {
        const parsed: EduLinkItem[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Guarantee all initial official links (especially Ngữ văn 6) are present
          const existingIds = new Set(parsed.map((l) => l.id));
          const missing = INITIAL_EDU_LINKS.filter((l) => !existingIds.has(l.id));
          return [...parsed, ...missing];
        }
      }
    } catch {}
    return INITIAL_EDU_LINKS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('thcs_myhoa_edu_links', JSON.stringify(eduLinks));
    } catch {}
  }, [eduLinks]);

  const addEduLink = (link: EduLinkItem) => {
    setEduLinks((prev) => [link, ...prev]);
  };

  const updateEduLink = (link: EduLinkItem) => {
    setEduLinks((prev) =>
      prev.map((l) => (l.id === link.id ? { ...link, updatedAt: new Date().toISOString() } : l))
    );
  };

  const deleteEduLink = (id: string) => {
    setEduLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const toggleEduLinkPin = (id: string) => {
    setEduLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isPinned: !l.isPinned, updatedAt: new Date().toISOString() } : l))
    );
  };

  const toggleEduLinkVisibility = (id: string) => {
    setEduLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isVisible: !l.isVisible, updatedAt: new Date().toISOString() } : l))
    );
  };

  const recordEduLinkOpen = (id: string) => {
    setEduLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, openCount: (l.openCount || 0) + 1 } : l))
    );
  };


  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('thcs_myhoa_subject', selectedSubjectId);
  }, [selectedSubjectId]);

  useEffect(() => {
    localStorage.setItem('thcs_myhoa_grade', selectedGradeId);
  }, [selectedGradeId]);

  useEffect(() => {
    localStorage.setItem('thcs_myhoa_questions', JSON.stringify(questionBank));
  }, [questionBank]);

  useEffect(() => {
    localStorage.setItem('thcs_myhoa_docs', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('thcs_myhoa_attempts', JSON.stringify(quizAttempts));
  }, [quizAttempts]);

  useEffect(() => {
    localStorage.setItem('thcs_myhoa_games', JSON.stringify(gameScores));
  }, [gameScores]);

  useEffect(() => {
    localStorage.setItem('thcs_myhoa_gym_games', JSON.stringify(gymnasticsGames));
  }, [gymnasticsGames]);

  useEffect(() => {
    localStorage.setItem('thcs_myhoa_puzzle_games', JSON.stringify(imagePuzzleGames));
  }, [imagePuzzleGames]);

  useEffect(() => {
    localStorage.setItem('thcs_myhoa_topics', JSON.stringify(topics));
  }, [topics]);

  useEffect(() => {
    localStorage.setItem('thcs_myhoa_lessons', JSON.stringify(lessons));
  }, [lessons]);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const setSubjectAndGrade = (subjectId: SubjectId, gradeId: GradeId) => {
    setSelectedSubjectId(subjectId);
    setSelectedGradeId(gradeId);
  };

  const addQuestion = (q: Question) => {
    setQuestionBank((prev) => [q, ...prev]);
  };

  const updateQuestion = (q: Question) => {
    setQuestionBank((prev) => prev.map((item) => (item.id === q.id ? q : item)));
  };

  const deleteQuestion = (id: string) => {
    setQuestionBank((prev) => prev.filter((item) => item.id !== id));
  };

  const importQuestionsBatch = (qs: Question[]) => {
    setQuestionBank((prev) => [...qs, ...prev]);
    return qs.length;
  };

  // Topics actions
  const addTopic = (topic: Topic) => {
    setTopics((prev) => [...prev, topic]);
  };

  const updateTopic = (topic: Topic) => {
    setTopics((prev) => prev.map((t) => (t.id === topic.id ? topic : t)));
  };

  const deleteTopic = (topicId: string) => {
    setTopics((prev) => prev.filter((t) => t.id !== topicId));
  };

  // Lessons actions
  const addLesson = (lesson: Lesson) => {
    setLessons((prev) => [lesson, ...prev]);
  };

  const updateLesson = (lesson: Lesson) => {
    setLessons((prev) =>
      prev.map((l) =>
        l.id === lesson.id ? { ...lesson, updatedAt: new Date().toISOString() } : l
      )
    );
  };

  const deleteLesson = (lessonId: string) => {
    setLessons((prev) => prev.filter((l) => l.id !== lessonId));
  };

  const publishLesson = (lessonId: string) => {
    setLessons((prev) =>
      prev.map((l) =>
        l.id === lessonId ? { ...l, status: 'published', updatedAt: new Date().toISOString() } : l
      )
    );
  };

  const unpublishLesson = (lessonId: string) => {
    setLessons((prev) =>
      prev.map((l) =>
        l.id === lessonId ? { ...l, status: 'draft', updatedAt: new Date().toISOString() } : l
      )
    );
  };

  const batchImportLessons = (newLessons: Lesson[], newTopics?: Topic[]) => {
    if (newTopics && newTopics.length > 0) {
      setTopics((prev) => {
        const existingIds = new Set(prev.map((t) => t.id));
        const toAdd = newTopics.filter((t) => !existingIds.has(t.id));
        return [...prev, ...toAdd];
      });
    }
    setLessons((prev) => [...newLessons, ...prev]);
  };

  const addDocument = (doc: DocumentItem) => {
    setDocuments((prev) => [doc, ...prev]);
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((item) => item.id !== id));
  };

  const addQuizAttempt = (attempt: QuizAttempt) => {
    setQuizAttempts((prev) => [attempt, ...prev]);
  };

  const addGameScore = (score: GameScore) => {
    setGameScores((prev) => [score, ...prev]);
  };

  const addGymnasticsGame = (game: GymnasticsGame) => {
    setGymnasticsGames((prev) => [game, ...prev]);
  };

  const updateGymnasticsGame = (game: GymnasticsGame) => {
    setGymnasticsGames((prev) =>
      prev.map((g) => (g.id === game.id ? { ...game, updatedAt: new Date().toISOString() } : g))
    );
  };

  const deleteGymnasticsGame = (id: string) => {
    setGymnasticsGames((prev) => prev.filter((g) => g.id !== id));
  };

  const cloneGymnasticsGameToClass = (
    gameId: string,
    targetClass: SchoolClass,
    newTitle?: string
  ): GymnasticsGame | null => {
    const game = gymnasticsGames.find((g) => g.id === gameId);
    if (!game) return null;
    const cloned = cloneGameForTargetClass(game, targetClass, newTitle);
    setGymnasticsGames((prev) => [cloned, ...prev]);
    return cloned;
  };

  const addImagePuzzleGame = (game: ImagePuzzleGame) => {
    setImagePuzzleGames((prev) => [game, ...prev]);
  };

  const updateImagePuzzleGame = (game: ImagePuzzleGame) => {
    setImagePuzzleGames((prev) =>
      prev.map((g) => (g.id === game.id ? { ...game, updatedAt: new Date().toISOString() } : g))
    );
  };

  const deleteImagePuzzleGame = (id: string) => {
    setImagePuzzleGames((prev) => prev.filter((g) => g.id !== id));
  };

  const cloneImagePuzzleGameToClass = (
    gameId: string,
    targetClass: SchoolClass,
    newTitle?: string
  ): ImagePuzzleGame | null => {
    const game = imagePuzzleGames.find((g) => g.id === gameId);
    if (!game) return null;
    const cloned = cloneGameForTargetClass(game, targetClass, newTitle);
    setImagePuzzleGames((prev) => [cloned, ...prev]);
    return cloned;
  };

  const openAuthModal = (defaultTab: 'student' | 'teacher' = 'student') => {
    setAuthModalInitialTab(defaultTab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  /**
   * Register a new student account with password hashing
   */
  const registerStudent = (input: {
    fullName: string;
    username: string;
    className: SchoolClass;
    password: string;
    confirmPassword: string;
  }): { success: boolean; message: string } => {
    const existingUsernames = accounts.map((a) => a.username);
    const validation = validateRegistration(input, existingUsernames);
    if (!validation.valid) {
      return { success: false, message: validation.error || 'Đăng ký không thành công.' };
    }

    const { salt, hash } = hashPassword(input.password);
    const gradeId = deriveGradeFromClass(input.className);
    const newAccount: UserAccount = {
      id: `hs-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      username: input.username.trim().toLowerCase(),
      passwordHash: hash,
      salt,
      role: 'student',
      name: input.fullName.trim(),
      className: input.className,
      gradeId,
      studentCode: `HS0${gradeId}${Math.floor(Math.random() * 900 + 100)}`,
      avatar: '🎒',
      createdAt: new Date().toISOString(),
      isLocked: false,
    };

    setAccounts((prev) => [newAccount, ...prev]);
    return { success: true, message: AUTH_MESSAGES.REGISTRATION_SUCCESS };
  };

  /**
   * Authenticate student or teacher with credentials
   */
  const loginWithCredentials = (
    username: string,
    password: string,
    expectedRole: 'student' | 'teacher'
  ): { success: boolean; message?: string } => {
    const cleanUsername = username.trim().toLowerCase();

    if (!cleanUsername || !password) {
      return { success: false, message: AUTH_MESSAGES.INVALID_CREDENTIALS };
    }

    if (isAttemptLocked(cleanUsername)) {
      return { success: false, message: AUTH_MESSAGES.TOO_MANY_FAILED_ATTEMPTS };
    }

    // Match account by username, email, teacherCode, or full name (e.g. 'Đặng Văn Thắng')
    const matchedAccount = accounts.find((acc) => {
      const matchRole = acc.role === expectedRole;
      if (!matchRole) return false;

      const isUsername = acc.username.toLowerCase() === cleanUsername;
      const isEmail = acc.email?.toLowerCase() === cleanUsername;
      const isTeacherCode = acc.teacherCode?.toLowerCase() === cleanUsername;
      const isName = acc.name.toLowerCase() === cleanUsername;
      return isUsername || isEmail || isTeacherCode || isName;
    });

    if (!matchedAccount) {
      recordFailedAttempt(cleanUsername);
      return { success: false, message: AUTH_MESSAGES.INVALID_CREDENTIALS };
    }

    // Verify password hash
    const isValid = verifyPassword(password, matchedAccount.salt, matchedAccount.passwordHash);
    if (!isValid) {
      const attempt = recordFailedAttempt(cleanUsername);
      if (attempt.isLocked) {
        return { success: false, message: AUTH_MESSAGES.TOO_MANY_FAILED_ATTEMPTS };
      }
      return { success: false, message: AUTH_MESSAGES.INVALID_CREDENTIALS };
    }

    // Check if account is locked by admin/teacher
    if (matchedAccount.isLocked) {
      return { success: false, message: AUTH_MESSAGES.ACCOUNT_LOCKED };
    }

    // Login successful
    resetFailedAttempts(cleanUsername);
    const profile = accountToProfile(matchedAccount);
    setCurrentUser(profile);

    if (matchedAccount.role === 'teacher') {
      setIsTeacherAuthenticated(true);
    } else if (matchedAccount.role === 'student' && matchedAccount.className) {
      const grade = deriveGradeFromClass(matchedAccount.className);
      setSelectedGradeId(grade);
    }

    setIsAuthModalOpen(false);
    return { success: true };
  };

  /**
   * Teacher student management: update class
   */
  const updateStudentClass = (accountId: string, newClass: SchoolClass): boolean => {
    const gradeId = deriveGradeFromClass(newClass);
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === accountId ? { ...acc, className: newClass, gradeId } : acc
      )
    );

    if (currentUser?.id === accountId) {
      setCurrentUser((prev) => (prev ? { ...prev, className: newClass, gradeId } : null));
      setSelectedGradeId(gradeId);
    }
    return true;
  };

  /**
   * Teacher student management: toggle lock
   */
  const toggleAccountLock = (accountId: string): boolean => {
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === accountId ? { ...acc, isLocked: !acc.isLocked } : acc
      )
    );
    return true;
  };

  /**
   * Teacher student management: delete student account
   */
  const deleteStudentAccount = (accountId: string): boolean => {
    setAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
    if (currentUser?.id === accountId) {
      logout();
    }
    return true;
  };

  // Backwards compatible login helpers
  const loginAsTeacher = (codeOrEmail: string, password?: string): { success: boolean; message?: string } => {
    return loginWithCredentials(codeOrEmail, password || '', 'teacher');
  };

  const loginAsStudent = (studentData: {
    name: string;
    className: string;
    gradeId: GradeId;
    studentCode?: string;
  }) => {
    const user: UserProfile = {
      id: `hs-${Date.now()}`,
      name: studentData.name.trim(),
      role: 'student',
      className: (studentData.className as SchoolClass) || '6A5',
      gradeId: studentData.gradeId,
      studentCode: studentData.studentCode?.trim() || `HS0${studentData.gradeId}0${Math.floor(Math.random() * 90 + 10)}`,
      avatar: '🎒',
      joinedAt: new Date().toISOString().split('T')[0],
    };

    setCurrentUser(user);
    setSelectedGradeId(studentData.gradeId);
    setIsAuthModalOpen(false);
  };

  const loginWithPredefinedUser = (user: UserProfile) => {
    setCurrentUser(user);
    if (user.role === 'teacher') {
      setIsTeacherAuthenticated(true);
    } else if (user.role === 'student' && user.className) {
      setSelectedGradeId(deriveGradeFromClass(user.className as SchoolClass));
    }
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setCurrentUser(null);
    setIsTeacherAuthenticated(false);
    if (activeTab === 'teacher') {
      setActiveTab('home');
    }
  };

  const currentSubject = SUBJECTS.find((s) => s.id === selectedSubjectId) || SUBJECTS[0];
  const currentGrade = GRADES.find((g) => g.id === selectedGradeId) || GRADES[0];

  const filteredTopics = topics.filter(
    (t) => t.subjectId === selectedSubjectId && t.gradeId === selectedGradeId
  );

  // Student view: ONLY published lessons
  const filteredLessons = lessons.filter(
    (l) =>
      l.subjectId === selectedSubjectId &&
      l.gradeId === selectedGradeId &&
      (l.status === 'published' || !l.status)
  );

  // Teacher view: all lessons (draft + published)
  const teacherAllLessons = lessons.filter(
    (l) => l.subjectId === selectedSubjectId && l.gradeId === selectedGradeId
  );

  const filteredQuestions = questionBank.filter(
    (q) => q.subjectId === selectedSubjectId && q.gradeId === selectedGradeId
  );

  const filteredDocuments = documents.filter(
    (d) => d.subjectId === selectedSubjectId && d.gradeId === selectedGradeId
  );

  // Filtered games: for students, only show published games matching current subject/grade
  const filteredGymnasticsGames = gymnasticsGames.filter(
    (g) =>
      g.subjectId === selectedSubjectId &&
      g.gradeId === selectedGradeId &&
      (isTeacherAuthenticated || g.status === 'published')
  );

  const filteredImagePuzzleGames = imagePuzzleGames.filter(
    (g) =>
      g.subjectId === selectedSubjectId &&
      g.gradeId === selectedGradeId &&
      (isTeacherAuthenticated || g.status === 'published')
  );

  return (
    <AppContext.Provider
      value={{
        selectedSubjectId,
        selectedGradeId,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        setSubjectAndGrade,
        activeTab,
        setActiveTab,
        currentUser,
        accounts,
        registerStudent,
        loginWithCredentials,
        updateStudentClass,
        toggleAccountLock,
        deleteStudentAccount,
        authModalInitialTab,
        openAuthModal,
        closeAuthModal,
        loginAsTeacher,
        loginAsStudent,
        loginWithPredefinedUser,
        logout,
        isTeacherAuthenticated,
        setIsTeacherAuthenticated,
        isAuthModalOpen,
        setIsAuthModalOpen,
        questionBank,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        importQuestionsBatch,
        topics,
        addTopic,
        updateTopic,
        deleteTopic,
        lessons,
        addLesson,
        updateLesson,
        deleteLesson,
        publishLesson,
        unpublishLesson,
        batchImportLessons,
        documents,
        addDocument,
        deleteDocument,
        quizAttempts,
        addQuizAttempt,
        gameScores,
        addGameScore,
        gymnasticsGames,
        addGymnasticsGame,
        updateGymnasticsGame,
        deleteGymnasticsGame,
        cloneGymnasticsGameToClass,
        imagePuzzleGames,
        addImagePuzzleGame,
        updateImagePuzzleGame,
        deleteImagePuzzleGame,
        cloneImagePuzzleGameToClass,
        bgIntensity,
        setBgIntensity,
        techTheme,
        effectiveTheme,
        setTechTheme,
        isTechThemeModalOpen,
        setIsTechThemeModalOpen,
        eduLinks,
        addEduLink,
        updateEduLink,
        deleteEduLink,
        toggleEduLinkPin,
        toggleEduLinkVisibility,
        recordEduLinkOpen,
        currentSubject,
        currentGrade,
        filteredTopics,
        filteredLessons,
        teacherAllLessons,
        filteredQuestions,
        filteredDocuments,
        filteredGymnasticsGames,
        filteredImagePuzzleGames,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
