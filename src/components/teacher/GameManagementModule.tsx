import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  GymnasticsGame,
  ImagePuzzleGame,
  GymnasticsQuestion,
  ImagePuzzleQuestion,
  SubjectId,
  GradeId,
  SchoolClass,
  ExerciseMovementGroup,
  GameQuestionType,
} from '../../types';
import { SUBJECTS, GRADES } from '../../data/initialData';
import { MOVEMENT_GROUPS_CATALOG, isGameEligibleForClass } from '../../utils/gameRules';
import { SUPPORTED_CLASSES, CLASS_TO_GRADE } from '../../utils/cryptoAuth';
import { StudentPECharacter } from '../games/StudentPECharacter';
import {
  Gamepad2,
  Plus,
  Trash2,
  Edit3,
  Copy,
  Eye,
  CheckCircle,
  FileCheck,
  Upload,
  FolderUp,
  Folder,
  Image as ImageIcon,
  HelpCircle,
  Sparkles,
  AlertCircle,
  Clock,
  Layers,
  ArrowRight,
  ArrowLeft,
  X,
  RotateCw,
  Trophy,
  Share2,
  GraduationCap,
  Filter,
} from 'lucide-react';

export const GameManagementModule: React.FC = () => {
  const {
    currentSubject,
    currentGrade,
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
    currentUser,
  } = useApp();

  // Filter tabs and class filter
  const [filterType, setFilterType] = useState<'all' | 'gymnastics' | 'puzzle' | 'built_in'>('all');
  const [filterClass, setFilterClass] = useState<'all' | SchoolClass>('all');
  const [notification, setNotification] = useState<string | null>(null);

  // Clone to Class Modal State
  const [cloneModalState, setCloneModalState] = useState<{
    isOpen: boolean;
    game: GymnasticsGame | ImagePuzzleGame | null;
    gameType: 'gymnastics' | 'puzzle';
    targetClass: SchoolClass;
    customTitle: string;
  }>({
    isOpen: false,
    game: null,
    gameType: 'gymnastics',
    targetClass: '7A5',
    customTitle: '',
  });

  // Modal states
  const [isGymModalOpen, setIsGymModalOpen] = useState(false);
  const [isPuzzleModalOpen, setIsPuzzleModalOpen] = useState(false);
  const [editingGymGame, setEditingGymGame] = useState<GymnasticsGame | null>(null);
  const [editingPuzzleGame, setEditingPuzzleGame] = useState<ImagePuzzleGame | null>(null);

  // --- 10-STEP WIZARD STATE FOR THỂ DỤC TRÍ TUỆ ---
  const [gymStep, setGymStep] = useState(1);
  const [gymTitle, setGymTitle] = useState('');
  const [gymDesc, setGymDesc] = useState('');
  const [gymSubject, setGymSubject] = useState<SubjectId>(currentSubject.id);
  const [gymGrade, setGymGrade] = useState<GradeId>(currentGrade.id as any);
  const [gymTargetClass, setGymTargetClass] = useState<SchoolClass | 'all'>('6A5');
  const [gymStatus, setGymStatus] = useState<'draft' | 'published'>('published');
  const [gymQuestions, setGymQuestions] = useState<GymnasticsQuestion[]>([]);

  // Current Question being added/edited in Wizard
  const [activeQIndex, setActiveQIndex] = useState<number>(0);
  const [qType, setQType] = useState<GameQuestionType>('multiple_choice');
  const [qPrompt, setQPrompt] = useState('');
  const [qOptA, setQOptA] = useState('');
  const [qOptB, setQOptB] = useState('');
  const [qOptC, setQOptC] = useState('');
  const [qOptD, setQOptD] = useState('');
  const [qCorrect, setQCorrect] = useState('A');
  const [qAcceptedAnswers, setQAcceptedAnswers] = useState('');
  const [qHint, setQHint] = useState('');
  const [qExplanation, setQExplanation] = useState('');
  const [qMovement, setQMovement] = useState<ExerciseMovementGroup>('neck');
  const [qReps, setQReps] = useState<number>(4);
  const [qTimeLimit, setQTimeLimit] = useState<number>(120);
  const [qPoints, setQPoints] = useState<number>(20);
  const [qMediaUrl, setQMediaUrl] = useState<string>('');

  // Uploaded resource files tracking
  const [uploadedFilesSummary, setUploadedFilesSummary] = useState<string[]>([]);

  // --- STATE FOR GIẢI ĐỐ HÌNH ẢNH CREATOR ---
  const [pzTitle, setPzTitle] = useState('');
  const [pzDesc, setPzDesc] = useState('');
  const [pzSubject, setPzSubject] = useState<SubjectId>(currentSubject.id);
  const [pzGrade, setPzGrade] = useState<GradeId>(currentGrade.id as any);
  const [pzTargetClass, setPzTargetClass] = useState<SchoolClass | 'all'>('6A5');
  const [pzStatus, setPzStatus] = useState<'draft' | 'published'>('published');
  const [pzQuestions, setPzQuestions] = useState<ImagePuzzleQuestion[]>([]);

  const [activePzQIndex, setActivePzQIndex] = useState<number>(0);
  const [pzQPrompt, setPzQPrompt] = useState('');
  const [pzQImage, setPzQImage] = useState('');
  const [pzQHint1, setPzQHint1] = useState('');
  const [pzQHint2, setPzQHint2] = useState('');
  const [pzQHint3, setPzQHint3] = useState('');
  const [pzQCorrect, setPzQCorrect] = useState('');
  const [pzQAccepted, setPzQAccepted] = useState('');
  const [pzQExplanation, setPzQExplanation] = useState('');
  const [pzQTimeLimit, setPzQTimeLimit] = useState(90);
  const [pzQPoints, setPzQPoints] = useState(100);

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // --- OPEN GYMNASTICS CREATOR / EDITOR ---
  const handleOpenGymCreator = (gameToEdit?: GymnasticsGame) => {
    if (gameToEdit) {
      setEditingGymGame(gameToEdit);
      setGymTitle(gameToEdit.title);
      setGymDesc(gameToEdit.description);
      setGymSubject(gameToEdit.subjectId);
      setGymGrade(gameToEdit.gradeId);
      setGymTargetClass(gameToEdit.targetClass || gameToEdit.appliedClasses?.[0] || '6A5');
      setGymStatus(gameToEdit.status);
      setGymQuestions(gameToEdit.questions);
      if (gameToEdit.questions.length > 0) {
        loadQuestionIntoForm(gameToEdit.questions[0], 0);
      }
    } else {
      setEditingGymGame(null);
      setGymTitle('Thể Dục Trí Tuệ – Bài tập thực hành mới');
      setGymDesc('Vừa ôn luyện kiến thức vừa rèn luyện sức khỏe qua các bài tập thể dục sinh động.');
      setGymSubject(currentSubject.id);
      setGymGrade(currentGrade.id as any);
      setGymTargetClass('6A5');
      setGymStatus('published');

      // Seed 2 initial questions
      const initialQs: GymnasticsQuestion[] = [
        {
          id: `q_${Date.now()}_1`,
          type: 'multiple_choice',
          prompt: 'Thiết bị nào sau đây tiếp nhận và xử lý toàn bộ dữ liệu trong máy tính?',
          options: [
            { id: 'A', text: 'Bộ vi xử lý (CPU)' },
            { id: 'B', text: 'Bàn phím cơ' },
            { id: 'C', text: 'Chuột quang' },
            { id: 'D', text: 'Màn hình máy tính' },
          ],
          correctAnswer: 'A',
          hint: 'Viết tắt của Central Processing Unit.',
          explanation: 'CPU là thành phần cốt lõi chỉ huy mọi hoạt động tính toán.',
          movementGroup: 'neck',
          repetitionCount: 4,
          timeLimitSeconds: 120,
          points: 20,
        },
      ];
      setGymQuestions(initialQs);
      loadQuestionIntoForm(initialQs[0], 0);
    }
    setGymStep(1);
    setUploadedFilesSummary([]);
    setIsGymModalOpen(true);
  };

  const loadQuestionIntoForm = (q: GymnasticsQuestion, index: number) => {
    setActiveQIndex(index);
    setQType(q.type);
    setQPrompt(q.prompt);
    setQOptA(q.options?.[0]?.text || '');
    setQOptB(q.options?.[1]?.text || '');
    setQOptC(q.options?.[2]?.text || '');
    setQOptD(q.options?.[3]?.text || '');
    setQCorrect(q.correctAnswer);
    setQAcceptedAnswers(q.acceptedAnswers ? q.acceptedAnswers.join(', ') : '');
    setQHint(q.hint || '');
    setQExplanation(q.explanation || '');
    setQMovement(q.movementGroup);
    setQReps(q.repetitionCount || 4);
    setQTimeLimit(q.timeLimitSeconds || 120);
    setQPoints(q.points || 20);
    setQMediaUrl(q.mediaUrl || '');
  };

  const saveCurrentQToQuestions = () => {
    const updatedQ: GymnasticsQuestion = {
      id: gymQuestions[activeQIndex]?.id || `q_${Date.now()}`,
      type: qType,
      prompt: qPrompt.trim() || 'Câu hỏi thể dục trí tuệ',
      options:
        qType === 'multiple_choice'
          ? [
              { id: 'A', text: qOptA.trim() || 'Lựa chọn A' },
              { id: 'B', text: qOptB.trim() || 'Lựa chọn B' },
              { id: 'C', text: qOptC.trim() || 'Lựa chọn C' },
              { id: 'D', text: qOptD.trim() || 'Lựa chọn D' },
            ]
          : undefined,
      correctAnswer: qType === 'multiple_choice' ? qCorrect : qCorrect.trim(),
      acceptedAnswers:
        qType === 'short_answer'
          ? qAcceptedAnswers
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
      hint: qHint.trim(),
      explanation: qExplanation.trim(),
      movementGroup: qMovement,
      repetitionCount: qReps,
      timeLimitSeconds: qTimeLimit,
      points: qPoints,
      mediaUrl: qMediaUrl,
    };

    setGymQuestions((prev) => {
      const next = [...prev];
      if (activeQIndex < next.length) {
        next[activeQIndex] = updatedQ;
      } else {
        next.push(updatedQ);
      }
      return next;
    });
  };

  // Add new blank question to wizard
  const handleAddNewQuestion = () => {
    saveCurrentQToQuestions();
    const newQ: GymnasticsQuestion = {
      id: `q_${Date.now()}`,
      type: 'multiple_choice',
      prompt: '',
      options: [
        { id: 'A', text: '' },
        { id: 'B', text: '' },
        { id: 'C', text: '' },
        { id: 'D', text: '' },
      ],
      correctAnswer: 'A',
      hint: '',
      explanation: '',
      movementGroup: 'shoulders',
      repetitionCount: 4,
      timeLimitSeconds: 120,
      points: 20,
    };
    setGymQuestions((prev) => [...prev, newQ]);
    loadQuestionIntoForm(newQ, gymQuestions.length);
  };

  // Delete question from wizard
  const handleDeleteQuestion = (idx: number) => {
    if (gymQuestions.length <= 1) {
      alert('Bài tập cần có ít nhất 1 câu hỏi.');
      return;
    }
    const filtered = gymQuestions.filter((_, i) => i !== idx);
    setGymQuestions(filtered);
    const newIdx = Math.max(0, idx - 1);
    loadQuestionIntoForm(filtered[newIdx], newIdx);
  };

  // Handle single file upload or folder upload (Step 9)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      fileList.push(`${file.name} (${Math.round(file.size / 1024)} KB)`);

      // If single image or first image, read as DataURL to auto-populate mediaUrl
      if (i === 0 && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setQMediaUrl(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    }

    setUploadedFilesSummary((prev) => [...prev, ...fileList]);
    showNotice(`Đã tải lên và xác thực thành công ${files.length} tệp tài nguyên!`);
  };

  // Save Gymnastics Game (Draft or Publish)
  const handleSaveGymGame = (status: 'draft' | 'published') => {
    saveCurrentQToQuestions();

    const targetClass = gymTargetClass === 'all' ? undefined : gymTargetClass;
    const appliedClasses = gymTargetClass === 'all' ? undefined : [gymTargetClass];
    const computedGrade = targetClass ? CLASS_TO_GRADE[targetClass] : gymGrade;

    const finalizedGame: GymnasticsGame = {
      id: editingGymGame ? editingGymGame.id : `gym_${Date.now()}`,
      title: gymTitle.trim() || 'Thể Dục Trí Tuệ',
      description: gymDesc.trim(),
      subjectId: gymSubject,
      gradeId: computedGrade,
      targetClass,
      appliedClasses,
      status,
      questions: gymQuestions,
      thumbnail: '🏃‍♂️',
      authorName: currentUser?.name || 'Giáo viên THCS Mỹ Hòa',
      createdAt: editingGymGame?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingGymGame) {
      updateGymnasticsGame(finalizedGame);
      showNotice(`Đã cập nhật bài tập "${finalizedGame.title}" (${status === 'published' ? 'Đã xuất bản' : 'Bản nháp'})!`);
    } else {
      addGymnasticsGame(finalizedGame);
      showNotice(`Đã tạo mới bài tập "${finalizedGame.title}" (${status === 'published' ? 'Đã xuất bản' : 'Bản nháp'})!`);
    }

    setIsGymModalOpen(false);
  };

  // --- OPEN IMAGE PUZZLE CREATOR / EDITOR ---
  const handleOpenPuzzleCreator = (gameToEdit?: ImagePuzzleGame) => {
    if (gameToEdit) {
      setEditingPuzzleGame(gameToEdit);
      setPzTitle(gameToEdit.title);
      setPzDesc(gameToEdit.description);
      setPzSubject(gameToEdit.subjectId);
      setPzGrade(gameToEdit.gradeId);
      setPzTargetClass(gameToEdit.targetClass || gameToEdit.appliedClasses?.[0] || '6A5');
      setPzStatus(gameToEdit.status);
      setPzQuestions(gameToEdit.questions);
      if (gameToEdit.questions.length > 0) {
        loadPuzzleQIntoForm(gameToEdit.questions[0], 0);
      }
    } else {
      setEditingPuzzleGame(null);
      setPzTitle('Giải Đố Hình Ảnh – Nhận Diện Công Nghệ & Khoa Học');
      setPzDesc('Quan sát hình ảnh và các manh mối để giải mã tên linh kiện, thiết bị.');
      setPzSubject(currentSubject.id);
      setPzGrade(currentGrade.id as any);
      setPzTargetClass('6A5');
      setPzStatus('published');

      const initialQ: ImagePuzzleQuestion = {
        id: `pz_${Date.now()}_1`,
        title: 'Linh kiện quan trọng số 1',
        image:
          'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" rx="16" fill="%231E293B"/><rect x="80" y="40" width="140" height="120" rx="8" fill="%230284C7" stroke="%2338BDF8" stroke-width="2"/><text x="150" y="105" font-family="Arial" font-size="18" font-weight="bold" fill="%23FFFFFF" text-anchor="middle">CHIP CPU</text></svg>',
        prompt: 'Quan sát hình ảnh và cho biết: Đây là linh kiện xử lý dữ liệu nào của máy tính?',
        hints: [
          'Gợi ý 1: Đóng vai trò là bộ não của máy vi tính.',
          'Gợi ý 2: Viết tắt của Central Processing Unit.',
          'Gợi ý 3: Tên gọi thường dùng là CPU hoặc Bộ vi xử lý.',
        ],
        hintPenaltyPoints: 10,
        correctAnswer: 'CPU',
        acceptedAnswers: ['CPU', 'Bộ vi xử lý', 'Vi xử lý', 'Chip máy tính'],
        explanation: 'CPU là bộ xử lý trung tâm giải mã và thực thi các câu lệnh.',
        timeLimitSeconds: 90,
        points: 100,
      };

      setPzQuestions([initialQ]);
      loadPuzzleQIntoForm(initialQ, 0);
    }

    setIsPuzzleModalOpen(true);
  };

  const loadPuzzleQIntoForm = (q: ImagePuzzleQuestion, idx: number) => {
    setActivePzQIndex(idx);
    setPzQPrompt(q.prompt);
    setPzQImage(q.image);
    setPzQHint1(q.hints[0] || '');
    setPzQHint2(q.hints[1] || '');
    setPzQHint3(q.hints[2] || '');
    setPzQCorrect(q.correctAnswer);
    setPzQAccepted(q.acceptedAnswers.join(', '));
    setPzQExplanation(q.explanation);
    setPzQTimeLimit(q.timeLimitSeconds || 90);
    setPzQPoints(q.points || 100);
  };

  const saveCurrentPzQ = () => {
    const updated: ImagePuzzleQuestion = {
      id: pzQuestions[activePzQIndex]?.id || `pz_${Date.now()}`,
      title: `Câu đố số ${activePzQIndex + 1}`,
      image: pzQImage || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150"><rect width="200" height="150" fill="%23E2E8F0"/><text x="100" y="80" text-anchor="middle">Ảnh câu đố</text></svg>',
      prompt: pzQPrompt.trim() || 'Hãy quan sát hình ảnh và giải đố',
      hints: [pzQHint1.trim(), pzQHint2.trim(), pzQHint3.trim()].filter(Boolean),
      hintPenaltyPoints: 10,
      correctAnswer: pzQCorrect.trim() || 'Đáp án',
      acceptedAnswers: pzQAccepted
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      explanation: pzQExplanation.trim(),
      timeLimitSeconds: pzQTimeLimit,
      points: pzQPoints,
    };

    setPzQuestions((prev) => {
      const next = [...prev];
      if (activePzQIndex < next.length) {
        next[activePzQIndex] = updated;
      } else {
        next.push(updated);
      }
      return next;
    });
  };

  const handlePuzzleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPzQImage(event.target.result as string);
        showNotice(`Đã tải lên hình ảnh: ${file.name}`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSavePuzzleGame = (status: 'draft' | 'published') => {
    saveCurrentPzQ();

    const targetClass = pzTargetClass === 'all' ? undefined : pzTargetClass;
    const appliedClasses = pzTargetClass === 'all' ? undefined : [pzTargetClass];
    const computedGrade = targetClass ? CLASS_TO_GRADE[targetClass] : pzGrade;

    const finalized: ImagePuzzleGame = {
      id: editingPuzzleGame ? editingPuzzleGame.id : `puzzle_${Date.now()}`,
      title: pzTitle.trim() || 'Giải Đố Hình Ảnh',
      description: pzDesc.trim(),
      subjectId: pzSubject,
      gradeId: computedGrade,
      targetClass,
      appliedClasses,
      status,
      questions: pzQuestions,
      thumbnail: '🧩',
      authorName: currentUser?.name || 'Giáo viên THCS Mỹ Hòa',
      createdAt: editingPuzzleGame?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingPuzzleGame) {
      updateImagePuzzleGame(finalized);
      showNotice(`Đã cập nhật bài giải đố "${finalized.title}"!`);
    } else {
      addImagePuzzleGame(finalized);
      showNotice(`Đã tạo mới bài giải đố "${finalized.title}"!`);
    }

    setIsPuzzleModalOpen(false);
  };

  // Open Clone to Class modal
  const handleOpenCloneModal = (
    game: GymnasticsGame | ImagePuzzleGame,
    gameType: 'gymnastics' | 'puzzle'
  ) => {
    const currentCls = game.targetClass || game.appliedClasses?.[0] || '6A5';
    const otherClasses = SUPPORTED_CLASSES.filter((c) => c !== currentCls);
    const defaultTarget = otherClasses[0] || '7A5';

    setCloneModalState({
      isOpen: true,
      game,
      gameType,
      targetClass: defaultTarget,
      customTitle: `${game.title} (Dành cho Lớp ${defaultTarget})`,
    });
  };

  // Confirm clone game to target class
  const handleConfirmClone = () => {
    if (!cloneModalState.game) return;
    const { game, gameType, targetClass, customTitle } = cloneModalState;

    if (gameType === 'gymnastics') {
      const cloned = cloneGymnasticsGameToClass(game.id, targetClass, customTitle);
      if (cloned) {
        showNotice(
          `Đã sao chép độc lập bài tập sang Lớp ${targetClass}! Bản sao lưu dưới dạng Bản nháp và không làm ảnh hưởng đến dữ liệu bài gốc.`
        );
      }
    } else {
      const cloned = cloneImagePuzzleGameToClass(game.id, targetClass, customTitle);
      if (cloned) {
        showNotice(
          `Đã sao chép độc lập câu đố sang Lớp ${targetClass}! Bản sao lưu dưới dạng Bản nháp và không làm ảnh hưởng đến dữ liệu bài gốc.`
        );
      }
    }

    setCloneModalState((prev) => ({ ...prev, isOpen: false }));
  };

  // Duplicate a game
  const handleDuplicateGymGame = (game: GymnasticsGame) => {
    const copy: GymnasticsGame = {
      ...game,
      id: `gym_${Date.now()}`,
      title: `${game.title} (Bản sao)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addGymnasticsGame(copy);
    showNotice(`Đã nhân bản bài tập "${copy.title}" thành bản nháp!`);
  };

  const handleDuplicatePuzzleGame = (game: ImagePuzzleGame) => {
    const copy: ImagePuzzleGame = {
      ...game,
      id: `puzzle_${Date.now()}`,
      title: `${game.title} (Bản sao)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addImagePuzzleGame(copy);
    showNotice(`Đã nhân bản câu đố "${copy.title}" thành bản nháp!`);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header & Quick Action Buttons */}
      <div className="p-6 rounded-3xl bg-white border border-[#E2EAF5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7C3AED]">
              Quản trị Chuyên môn Trò chơi
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#2684FF] border border-[#BFDBFE]">
              Kho trò chơi THCS Mỹ Hòa
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#172B4D] mt-1">
            Quản lý Trò chơi học tập
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Tạo mới, chỉnh sửa, gắn động tác thể dục, tải lên tài nguyên và kiểm duyệt trạng thái xuất bản cho học sinh.
          </p>
        </div>

        {/* Create Game Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenGymCreator()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#2684FF] to-[#1E6FD9] hover:from-[#1E6FD9] hover:to-[#175BB8] text-white text-xs font-bold cursor-pointer shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Thể Dục Trí Tuệ</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenPuzzleCreator()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:from-[#0369A1] hover:to-[#075985] text-white text-xs font-bold cursor-pointer shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Giải Đố Hình Ảnh</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      {notification && (
        <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] text-xs font-semibold text-[#15803D] flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4 text-[#16A34A] shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Filter Tabs & Class Filter Bar */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'Tất cả trò chơi' },
            { id: 'gymnastics', label: 'Thể Dục Trí Tuệ' },
            { id: 'puzzle', label: 'Giải Đố Hình Ảnh' },
            { id: 'built_in', label: 'Trò chơi mặc định' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                filterType === tab.id
                  ? 'bg-[#7C3AED] text-white shadow-xs'
                  : 'bg-white border border-[#CBD5E1] text-[#64748B] hover:bg-[#F8FAFC]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Class Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-2xl bg-white border border-[#E2EAF5]">
          <span className="text-xs font-bold text-[#64748B] flex items-center gap-1.5 px-2">
            <GraduationCap className="w-4 h-4 text-[#2684FF]" /> Phân loại theo lớp:
          </span>
          <button
            type="button"
            onClick={() => setFilterClass('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
              filterClass === 'all'
                ? 'bg-[#2684FF] text-white shadow-2xs'
                : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#EFF6FF]'
            }`}
          >
            Tất cả các lớp
          </button>
          {SUPPORTED_CLASSES.map((cls) => (
            <button
              key={cls}
              type="button"
              onClick={() => setFilterClass(cls)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                filterClass === cls
                  ? 'bg-[#2684FF] text-white shadow-2xs'
                  : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#EFF6FF]'
              }`}
            >
              Lớp {cls} (Khối {CLASS_TO_GRADE[cls]})
            </button>
          ))}
        </div>
      </div>

      {/* Game Catalog Grid for Teachers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Gymnastics Games */}
        {(filterType === 'all' || filterType === 'gymnastics') &&
          gymnasticsGames
            .filter((g) => (filterClass === 'all' ? true : isGameEligibleForClass(g, filterClass)))
            .map((game) => (
            <div
              key={game.id}
              className="p-5 rounded-3xl bg-white border border-[#E2EAF5] hover:border-[#2684FF] shadow-xs flex flex-col justify-between space-y-4 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{game.thumbnail || '🏃‍♂️'}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#EFF6FF] text-[#2684FF] uppercase">
                      Thể Dục Trí Tuệ
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE]">
                      Lớp {game.targetClass || game.appliedClasses?.[0] || `${game.gradeId}A5`}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        game.status === 'published'
                          ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]'
                          : 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]'
                      }`}
                    >
                      {game.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-[#172B4D] leading-snug line-clamp-2">
                  {game.title}
                </h3>
                <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                  {game.description}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-[#64748B] pt-2 border-t border-[#F1F5F9]">
                  <span>{game.questions.length} câu hỏi & động tác</span>
                  <span>·</span>
                  <span>Khối {game.gradeId}</span>
                </div>
              </div>

              {/* Teacher Actions */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenGymCreator(game)}
                    className="p-2 rounded-xl border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC] hover:text-[#2684FF] text-xs font-semibold cursor-pointer"
                    title="Chỉnh sửa câu hỏi & động tác"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenCloneModal(game, 'gymnastics')}
                    className="p-2 rounded-xl border border-[#CBD5E1] text-[#2684FF] hover:bg-[#EFF6FF] text-xs font-semibold cursor-pointer"
                    title="Sao chép sang lớp khác"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDuplicateGymGame(game)}
                    className="p-2 rounded-xl border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC] text-xs font-semibold cursor-pointer"
                    title="Nhân bản tại chỗ"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Xác nhận xóa bài tập "${game.title}"?`)) {
                        deleteGymnasticsGame(game.id);
                        showNotice(`Đã xóa "${game.title}".`);
                      }
                    }}
                    className="p-2 rounded-xl border border-[#CBD5E1] text-[#94A3B8] hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-xs font-semibold cursor-pointer"
                    title="Xóa bài tập"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const newStatus = game.status === 'published' ? 'draft' : 'published';
                    updateGymnasticsGame({ ...game, status: newStatus });
                    showNotice(
                      `Đã chuyển trạng thái sang "${
                        newStatus === 'published' ? 'Đã xuất bản' : 'Bản nháp'
                      }"!`
                    );
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    game.status === 'published'
                      ? 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2EAF5]'
                      : 'bg-[#10B981] text-white hover:bg-[#059669]'
                  }`}
                >
                  {game.status === 'published' ? 'Chuyển về nháp' : 'Xuất bản'}
                </button>
              </div>
            </div>
          ))}

        {/* 2. Image Puzzle Games */}
        {(filterType === 'all' || filterType === 'puzzle') &&
          imagePuzzleGames
            .filter((g) => (filterClass === 'all' ? true : isGameEligibleForClass(g, filterClass)))
            .map((game) => (
            <div
              key={game.id}
              className="p-5 rounded-3xl bg-white border border-[#E2EAF5] hover:border-[#0284C7] shadow-xs flex flex-col justify-between space-y-4 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{game.thumbnail || '🧩'}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#E0F2FE] text-[#0284C7] uppercase">
                      Giải Đố Hình Ảnh
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
                      Lớp {game.targetClass || game.appliedClasses?.[0] || `${game.gradeId}A5`}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        game.status === 'published'
                          ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]'
                          : 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]'
                      }`}
                    >
                      {game.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-[#172B4D] leading-snug line-clamp-2">
                  {game.title}
                </h3>
                <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                  {game.description}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-[#64748B] pt-2 border-t border-[#F1F5F9]">
                  <span>{game.questions.length} câu đố thị giác</span>
                  <span>·</span>
                  <span>Khối {game.gradeId}</span>
                </div>
              </div>

              {/* Teacher Actions */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenPuzzleCreator(game)}
                    className="p-2 rounded-xl border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0284C7] text-xs font-semibold cursor-pointer"
                    title="Chỉnh sửa câu đố"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenCloneModal(game, 'puzzle')}
                    className="p-2 rounded-xl border border-[#CBD5E1] text-[#0284C7] hover:bg-[#E0F2FE] text-xs font-semibold cursor-pointer"
                    title="Sao chép sang lớp khác"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDuplicatePuzzleGame(game)}
                    className="p-2 rounded-xl border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC] text-xs font-semibold cursor-pointer"
                    title="Nhân bản tại chỗ"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Xác nhận xóa câu đố "${game.title}"?`)) {
                        deleteImagePuzzleGame(game.id);
                        showNotice(`Đã xóa "${game.title}".`);
                      }
                    }}
                    className="p-2 rounded-xl border border-[#CBD5E1] text-[#94A3B8] hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-xs font-semibold cursor-pointer"
                    title="Xóa câu đố"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const newStatus = game.status === 'published' ? 'draft' : 'published';
                    updateImagePuzzleGame({ ...game, status: newStatus });
                    showNotice(
                      `Đã chuyển trạng thái sang "${
                        newStatus === 'published' ? 'Đã xuất bản' : 'Bản nháp'
                      }"!`
                    );
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    game.status === 'published'
                      ? 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2EAF5]'
                      : 'bg-[#0284C7] text-white hover:bg-[#0369A1]'
                  }`}
                >
                  {game.status === 'published' ? 'Chuyển về nháp' : 'Xuất bản'}
                </button>
              </div>
            </div>
          ))}

        {/* 3. Built-in system games (Permanent, non-deletable) */}
        {(filterType === 'all' || filterType === 'built_in') && (
          <>
            <div className="p-5 rounded-3xl bg-[#FAF5FF] border border-[#DDD6FE] shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">🎡</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EDE9FE] text-[#7C3AED]">
                    Mặc định hệ thống
                  </span>
                </div>
                <h3 className="font-bold text-sm text-[#172B4D]">Vòng quay may mắn</h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Trò chơi quay số ngẫu nhiên trả lời câu hỏi trắc nghiệm từ ngân hàng câu hỏi.
                </p>
              </div>
              <div className="text-[11px] text-[#7C3AED] font-semibold pt-2 border-t border-[#EDE9FE]">
                Tự động đồng bộ câu hỏi theo môn & khối lớp
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-[#FAF5FF] border border-[#DDD6FE] shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">🃏</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EDE9FE] text-[#7C3AED]">
                    Mặc định hệ thống
                  </span>
                </div>
                <h3 className="font-bold text-sm text-[#172B4D]">Ghép cặp thuật ngữ</h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Ghép thuật ngữ viết tắt với định nghĩa chính xác.
                </p>
              </div>
              <div className="text-[11px] text-[#7C3AED] font-semibold pt-2 border-t border-[#EDE9FE]">
                Dữ liệu thuật ngữ chuẩn bộ môn
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-[#FAF5FF] border border-[#DDD6FE] shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">⚡</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EDE9FE] text-[#7C3AED]">
                    Mặc định hệ thống
                  </span>
                </div>
                <h3 className="font-bold text-sm text-[#172B4D]">Thử thách phản xạ</h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Đua thời gian 15 giây cho mỗi câu hỏi trắc nghiệm tốc độ cao.
                </p>
              </div>
              <div className="text-[11px] text-[#7C3AED] font-semibold pt-2 border-t border-[#EDE9FE]">
                Kích hoạt tư duy phản xạ học sinh
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-[#FAF5FF] border border-[#DDD6FE] shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">🔤</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EDE9FE] text-[#7C3AED]">
                    Mặc định hệ thống
                  </span>
                </div>
                <h3 className="font-bold text-sm text-[#172B4D]">Đoán từ khóa số</h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Lật mở các chữ cái để khám phá từ khóa công nghệ thông tin.
                </p>
              </div>
              <div className="text-[11px] text-[#7C3AED] font-semibold pt-2 border-t border-[#EDE9FE]">
                Rèn luyện khả năng ghi nhớ từ vựng
              </div>
            </div>
          </>
        )}
      </div>

      {/* ========================================================= */}
      {/* 10-STEP MODAL: THỂ DỤC TRÍ TUỆ CREATOR / WIZARD           */}
      {/* ========================================================= */}
      {isGymModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 border border-[#E2EAF5]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#2684FF] flex items-center justify-center font-bold">
                  🏃‍♂️
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#172B4D]">
                    {editingGymGame ? 'Chỉnh sửa' : 'Tạo mới'} trò chơi "Thể Dục Trí Tuệ"
                  </h3>
                  <span className="text-xs text-[#64748B]">
                    Quy trình tạo bài tập tích hợp vận động 10 bước chuyên nghiệp
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGymModalOpen(false)}
                className="p-2 text-[#94A3B8] hover:text-[#172B4D] rounded-xl hover:bg-[#F1F5F9]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 10-step progress indicator */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#64748B]">
                <span>Bước {gymStep} / 10:</span>
                <span className="text-[#2684FF]">
                  {gymStep === 1 && 'Bước 1: Thông tin chung & Môn học'}
                  {gymStep === 2 && 'Bước 2: Danh sách câu hỏi bài tập'}
                  {gymStep === 3 && 'Bước 3: Chọn dạng câu hỏi (Trắc nghiệm / Trả lời ngắn)'}
                  {gymStep === 4 && 'Bước 4: Nhập nội dung, đáp án & giải thích'}
                  {gymStep === 5 && 'Bước 5: Gắn động tác thể dục (8 nhóm động tác)'}
                  {gymStep === 6 && 'Bước 6: Cài đặt số lần lặp lại (2, 4, 6, 8 nhịp)'}
                  {gymStep === 7 && 'Bước 7: Cài đặt thời gian đếm ngược'}
                  {gymStep === 8 && 'Bước 8: Cài đặt điểm thưởng'}
                  {gymStep === 9 && 'Bước 9: Tải lên tài nguyên (Tệp lẻ hoặc Thư mục)'}
                  {gymStep === 10 && 'Bước 10: Xem trước (Preview) & Xuất bản'}
                </span>
              </div>
              <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2684FF] transition-all duration-300"
                  style={{ width: `${(gymStep / 10) * 100}%` }}
                />
              </div>
            </div>

            {/* WIZARD CONTENT BY STEP */}
            <div className="space-y-5 min-h-[300px]">
              {/* STEP 1: Basic Information */}
              {gymStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#172B4D] mb-1">
                      Tên trò chơi thể dục trí tuệ:
                    </label>
                    <input
                      type="text"
                      value={gymTitle}
                      onChange={(e) => setGymTitle(e.target.value)}
                      placeholder="Ví dụ: Thể Dục Trí Tuệ – Vận Động Khỏe Khắn Cùng Tin Học 6"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#CBD5E1] text-xs outline-none focus:border-[#2684FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#172B4D] mb-1">
                      Mô tả ngắn cho học sinh:
                    </label>
                    <textarea
                      rows={2}
                      value={gymDesc}
                      onChange={(e) => setGymDesc(e.target.value)}
                      placeholder="Mô tả ý nghĩa và lợi ích của bài tập..."
                      className="w-full px-4 py-2.5 rounded-xl border border-[#CBD5E1] text-xs outline-none focus:border-[#2684FF]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#172B4D] mb-1">
                        Môn học:
                      </label>
                      <select
                        value={gymSubject}
                        onChange={(e) => setGymSubject(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                      >
                        {SUBJECTS.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#172B4D] mb-1">
                        Lớp áp dụng (THCS Mỹ Hòa):
                      </label>
                      <select
                        value={gymTargetClass}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setGymTargetClass(val);
                          if (val !== 'all' && CLASS_TO_GRADE[val as SchoolClass]) {
                            setGymGrade(CLASS_TO_GRADE[val as SchoolClass]);
                          }
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs font-semibold text-[#172B4D]"
                      >
                        {SUPPORTED_CLASSES.map((cls) => (
                          <option key={cls} value={cls}>
                            Lớp {cls} (Khối {CLASS_TO_GRADE[cls]})
                          </option>
                        ))}
                        <option value="all">Toàn bộ các lớp trong khối</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#172B4D] mb-1">
                        Khối lớp:
                      </label>
                      <select
                        value={gymGrade}
                        onChange={(e) => setGymGrade(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                      >
                        {GRADES.map((g) => (
                          <option key={g.id} value={g.id}>
                            Khối {g.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Manage Questions List */}
              {gymStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#172B4D]">
                      Danh sách câu hỏi trong bài ({gymQuestions.length} câu)
                    </span>
                    <button
                      type="button"
                      onClick={handleAddNewQuestion}
                      className="px-3 py-1.5 rounded-xl bg-[#2684FF] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm câu hỏi mới</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {gymQuestions.map((q, idx) => (
                      <div
                        key={q.id}
                        onClick={() => loadQuestionIntoForm(q, idx)}
                        className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          activeQIndex === idx
                            ? 'bg-[#EFF6FF] border-[#2684FF] shadow-xs'
                            : 'bg-white border-[#E2EAF5] hover:bg-[#F8FAFC]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-[#2684FF] text-white flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-[#172B4D] line-clamp-1">
                              {q.prompt || 'Chưa nhập nội dung câu hỏi'}
                            </p>
                            <span className="text-[10px] text-[#64748B]">
                              {q.type === 'multiple_choice' ? 'Trắc nghiệm' : 'Trả lời ngắn'} · Động tác:{' '}
                              <strong>{q.movementGroup}</strong> ({q.repetitionCount || 4} nhịp)
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuestion(idx);
                          }}
                          className="p-1.5 text-[#94A3B8] hover:text-red-500 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: Question Type */}
              {gymStep === 3 && (
                <div className="space-y-4">
                  <span className="text-xs font-bold text-[#172B4D]">
                    Chọn dạng câu hỏi cho câu {activeQIndex + 1}:
                  </span>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setQType('multiple_choice')}
                      className={`p-5 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                        qType === 'multiple_choice'
                          ? 'border-[#2684FF] bg-[#EFF6FF] shadow-xs'
                          : 'border-[#E2EAF5] bg-white hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <span className="font-bold text-sm text-[#172B4D] block mb-1">
                        1. Trắc nghiệm (2-4 lựa chọn)
                      </span>
                      <p className="text-xs text-[#64748B]">
                        Học sinh chọn 1 đáp án đúng từ các lựa chọn A, B, C, D.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setQType('short_answer')}
                      className={`p-5 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                        qType === 'short_answer'
                          ? 'border-[#2684FF] bg-[#EFF6FF] shadow-xs'
                          : 'border-[#E2EAF5] bg-white hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <span className="font-bold text-sm text-[#172B4D] block mb-1">
                        2. Trả lời ngắn (Tự nhập văn bản)
                      </span>
                      <p className="text-xs text-[#64748B]">
                        Học sinh gõ trực tiếp câu trả lời. Hệ thống so khớp tương đối & từ đồng nghĩa.
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Prompt, Options & Answers */}
              {gymStep === 4 && (
                <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
                  <div>
                    <label className="block text-xs font-bold text-[#172B4D] mb-1">
                      Nội dung câu hỏi {activeQIndex + 1}:
                    </label>
                    <textarea
                      rows={2}
                      value={qPrompt}
                      onChange={(e) => setQPrompt(e.target.value)}
                      placeholder="Nhập nội dung câu hỏi..."
                      className="w-full px-4 py-2.5 rounded-xl border border-[#CBD5E1] text-xs outline-none focus:border-[#2684FF]"
                    />
                  </div>

                  {qType === 'multiple_choice' ? (
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-[#172B4D]">
                        Các phương án lựa chọn và đáp án đúng:
                      </label>
                      {[
                        { id: 'A', val: qOptA, set: setQOptA },
                        { id: 'B', val: qOptB, set: setQOptB },
                        { id: 'C', val: qOptC, set: setQOptC },
                        { id: 'D', val: qOptD, set: setQOptD },
                      ].map((item) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="correctOpt"
                            checked={qCorrect === item.id}
                            onChange={() => setQCorrect(item.id)}
                            className="cursor-pointer"
                          />
                          <span className="text-xs font-bold w-4">{item.id}.</span>
                          <input
                            type="text"
                            value={item.val}
                            onChange={(e) => item.set(e.target.value)}
                            placeholder={`Nội dung phương án ${item.id}`}
                            className="flex-1 px-3 py-1.5 rounded-xl border border-[#CBD5E1] text-xs outline-none focus:border-[#2684FF]"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-[#172B4D] mb-1">
                          Đáp án chuẩn:
                        </label>
                        <input
                          type="text"
                          value={qCorrect}
                          onChange={(e) => setQCorrect(e.target.value)}
                          placeholder="Ví dụ: Internet"
                          className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs outline-none focus:border-[#2684FF]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#172B4D] mb-1">
                          Các từ khóa đồng nghĩa / tương đương (phân tách bằng dấu phẩy):
                        </label>
                        <input
                          type="text"
                          value={qAcceptedAnswers}
                          onChange={(e) => setQAcceptedAnswers(e.target.value)}
                          placeholder="Ví dụ: mạng internet, mạng toàn cầu, internet"
                          className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs outline-none focus:border-[#2684FF]"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-[#172B4D] mb-1">
                        Gợi ý hỗ trợ học sinh:
                      </label>
                      <input
                        type="text"
                        value={qHint}
                        onChange={(e) => setQHint(e.target.value)}
                        placeholder="Gợi ý nhẹ nhàng không làm lộ đáp án..."
                        className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#172B4D] mb-1">
                        Giải thích kiến thức chi tiết:
                      </label>
                      <input
                        type="text"
                        value={qExplanation}
                        onChange={(e) => setQExplanation(e.target.value)}
                        placeholder="Lý thuyết giải thích sau khi trả lời..."
                        className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: Assign PE Movement */}
              {gymStep === 5 && (
                <div className="space-y-4">
                  <span className="text-xs font-bold text-[#172B4D]">
                    Gắn động tác thể dục cho câu hỏi {activeQIndex + 1} (chọn từ 8 nhóm):
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {MOVEMENT_GROUPS_CATALOG.map((m) => {
                      const isChosen = qMovement === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setQMovement(m.id)}
                          className={`p-3 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                            isChosen
                              ? 'border-[#2684FF] bg-[#EFF6FF] shadow-xs'
                              : 'border-[#E2EAF5] bg-white hover:bg-[#F8FAFC]'
                          }`}
                        >
                          <span className="text-xs font-bold text-[#172B4D] block">
                            {m.shortName}
                          </span>
                          <span className="text-[10px] text-[#64748B] block mt-1 line-clamp-2 leading-tight">
                            {m.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 6: Repetition count */}
              {gymStep === 6 && (
                <div className="space-y-4">
                  <span className="text-xs font-bold text-[#172B4D]">
                    Cài đặt số lần lặp lại của động tác khi học sinh trả lời đúng:
                  </span>

                  <div className="grid grid-cols-4 gap-3">
                    {[2, 4, 6, 8].map((rep) => (
                      <button
                        key={rep}
                        type="button"
                        onClick={() => setQReps(rep)}
                        className={`p-5 rounded-2xl border-2 text-center cursor-pointer transition-all ${
                          qReps === rep
                            ? 'border-[#10B981] bg-[#F0FDF4] shadow-xs ring-2 ring-[#10B981]/20'
                            : 'border-[#E2EAF5] bg-white hover:bg-[#F8FAFC]'
                        }`}
                      >
                        <div className="text-2xl font-black text-[#15803D]">{rep} nhịp</div>
                        <span className="text-[10px] text-[#64748B] block mt-1">
                          {rep <= 4 ? 'Thư giãn nhanh' : 'Vận động sâu'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 7: Countdown Timer */}
              {gymStep === 7 && (
                <div className="space-y-4">
                  <span className="text-xs font-bold text-[#172B4D]">
                    Cài đặt thời gian đếm ngược cho câu hỏi:
                  </span>

                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { sec: 30, label: '30 giây (Nhanh)' },
                      { sec: 60, label: '1 phút (Chuẩn)' },
                      { sec: 120, label: '2 phút (Khuyến nghị)' },
                      { sec: 180, label: '3 phút (Thoải mái)' },
                    ].map((item) => (
                      <button
                        key={item.sec}
                        type="button"
                        onClick={() => setQTimeLimit(item.sec)}
                        className={`p-4 rounded-2xl border-2 text-center cursor-pointer transition-all ${
                          qTimeLimit === item.sec
                            ? 'border-[#2684FF] bg-[#EFF6FF] shadow-xs'
                            : 'border-[#E2EAF5] bg-white hover:bg-[#F8FAFC]'
                        }`}
                      >
                        <div className="text-lg font-bold text-[#172B4D]">{item.sec}s</div>
                        <span className="text-[10px] text-[#64748B] block mt-1">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 8: Points */}
              {gymStep === 8 && (
                <div className="space-y-4">
                  <span className="text-xs font-bold text-[#172B4D]">
                    Cài đặt điểm thưởng cho câu trả lời đúng:
                  </span>

                  <div className="grid grid-cols-3 gap-4">
                    {[10, 20, 50].map((pts) => (
                      <button
                        key={pts}
                        type="button"
                        onClick={() => setQPoints(pts)}
                        className={`p-5 rounded-2xl border-2 text-center cursor-pointer transition-all ${
                          qPoints === pts
                            ? 'border-[#F59E0B] bg-[#FFFBEB] shadow-xs'
                            : 'border-[#E2EAF5] bg-white hover:bg-[#F8FAFC]'
                        }`}
                      >
                        <div className="text-2xl font-black text-[#D97706]">+{pts} điểm</div>
                        <span className="text-[10px] text-[#64748B] block mt-1">
                          Điểm cộng thành tích
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 9: Resource & Folder Upload */}
              {gymStep === 9 && (
                <div className="space-y-4">
                  <span className="text-xs font-bold text-[#172B4D]">
                    Tải lên tài nguyên minh họa (ảnh, video ngắn, gif hoặc thư mục bài học):
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Single File Upload */}
                    <div className="p-5 rounded-2xl border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] text-center space-y-2">
                      <Upload className="w-8 h-8 text-[#2684FF] mx-auto" />
                      <div className="text-xs font-bold text-[#172B4D]">Tải lên tệp đơn lẻ</div>
                      <p className="text-[10px] text-[#64748B]">
                        Hỗ trợ ảnh JPG, PNG, WebP, SVG, GIF minh họa câu hỏi
                      </p>
                      <label className="inline-block px-4 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs font-bold cursor-pointer hover:bg-[#EFF6FF] text-[#2684FF]">
                        Chọn tệp ảnh
                        <input
                          type="file"
                          accept="image/*,video/mp4"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Folder / Directory Upload (webkitdirectory) */}
                    <div className="p-5 rounded-2xl border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] text-center space-y-2">
                      <FolderUp className="w-8 h-8 text-[#7C3AED] mx-auto" />
                      <div className="text-xs font-bold text-[#172B4D]">
                        Tải cả thư mục tài nguyên
                      </div>
                      <p className="text-[10px] text-[#64748B]">
                        Hỗ trợ quét tự động toàn bộ thư mục dữ liệu bài tập
                      </p>
                      <label className="inline-block px-4 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs font-bold cursor-pointer hover:bg-[#FAF5FF] text-[#7C3AED]">
                        Chọn thư mục
                        <input
                          type="file"
                          multiple
                          {...({ webkitdirectory: '' } as any)}
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {uploadedFilesSummary.length > 0 && (
                    <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#166534]">
                      <strong>Tệp đã nạp vào bài: </strong>
                      {uploadedFilesSummary.slice(-3).join(', ')}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 10: Preview & Publish */}
              {gymStep === 10 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] text-xs text-[#1E40AF]">
                    <strong>Xem trước (Preview):</strong> Kiểm tra nhân vật học sinh đồng phục thể dục thực hiện động tác mẫu "{qMovement}" và toàn bộ cấu trúc câu hỏi.
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div>
                      <StudentPECharacter
                        movement={qMovement}
                        currentRep={qReps}
                        totalReps={qReps}
                        isExercising={true}
                      />
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="p-3 bg-white rounded-xl border border-[#E2EAF5]">
                        <span className="font-bold text-[#64748B]">Tiêu đề:</span> {gymTitle}
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-[#E2EAF5]">
                        <span className="font-bold text-[#64748B]">Số lượng câu:</span> {gymQuestions.length} câu
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-[#E2EAF5]">
                        <span className="font-bold text-[#64748B]">Thời gian mỗi câu:</span> {qTimeLimit} giây
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-[#E2EAF5]">
                        <span className="font-bold text-[#64748B]">Động tác gắn:</span> {qMovement} ({qReps} nhịp)
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-[#F1F5F9]">
              <button
                type="button"
                disabled={gymStep === 1}
                onClick={() => setGymStep((prev) => Math.max(1, prev - 1))}
                className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#172B4D] hover:bg-[#F8FAFC] disabled:opacity-40 cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay lại</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveGymGame('draft')}
                  className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#475569] hover:bg-[#F8FAFC] cursor-pointer"
                >
                  Lưu bản nháp
                </button>

                {gymStep < 10 ? (
                  <button
                    type="button"
                    onClick={() => {
                      saveCurrentQToQuestions();
                      setGymStep((prev) => Math.min(10, prev + 1));
                    }}
                    className="px-5 py-2 rounded-xl bg-[#2684FF] hover:bg-[#1A6DDF] text-white text-xs font-bold cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <span>Tiếp theo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSaveGymGame('published')}
                    className="px-6 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Xuất bản cho học sinh</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: GIẢI ĐỐ HÌNH ẢNH CREATOR                            */}
      {/* ========================================================= */}
      {isPuzzleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-5 shadow-2xl my-8 border border-[#E2EAF5]">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center font-bold">
                  🧩
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#172B4D]">
                    {editingPuzzleGame ? 'Chỉnh sửa' : 'Tạo mới'} trò chơi "Giải Đố Hình Ảnh"
                  </h3>
                  <span className="text-xs text-[#64748B]">
                    Tải ảnh lên, viết câu đố gợi mở và cài đặt gợi ý
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPuzzleModalOpen(false)}
                className="p-2 text-[#94A3B8] hover:text-[#172B4D] rounded-xl hover:bg-[#F1F5F9]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#172B4D] mb-1">
                    Tiêu đề trò chơi:
                  </label>
                  <input
                    type="text"
                    value={pzTitle}
                    onChange={(e) => setPzTitle(e.target.value)}
                    placeholder="Ví dụ: Giải Đố Hình Ảnh – Nhận Diện Linh Kiện Số"
                    className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs outline-none focus:border-[#0284C7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172B4D] mb-1">
                    Lớp áp dụng (THCS Mỹ Hòa):
                  </label>
                  <select
                    value={pzTargetClass}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setPzTargetClass(val);
                      if (val !== 'all' && CLASS_TO_GRADE[val as SchoolClass]) {
                        setPzGrade(CLASS_TO_GRADE[val as SchoolClass]);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs font-semibold text-[#172B4D]"
                  >
                    {SUPPORTED_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>
                        Lớp {cls} (Khối {CLASS_TO_GRADE[cls]})
                      </option>
                    ))}
                    <option value="all">Toàn bộ các lớp trong khối</option>
                  </select>
                </div>
              </div>

              {/* Image Upload Area */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] text-center space-y-2">
                {pzQImage ? (
                  <div className="space-y-2">
                    <img
                      src={pzQImage}
                      alt="Xem trước ảnh câu đố"
                      className="max-h-36 mx-auto rounded-xl border border-[#CBD5E1]"
                    />
                    <label className="inline-block px-3 py-1 bg-white border border-[#CBD5E1] rounded-lg text-xs font-bold cursor-pointer text-[#0284C7]">
                      Đổi hình ảnh khác
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePuzzleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <div>
                    <ImageIcon className="w-8 h-8 text-[#0284C7] mx-auto" />
                    <div className="text-xs font-bold text-[#172B4D] mt-1">
                      Tải lên hình ảnh câu đố từ máy tính
                    </div>
                    <label className="inline-block mt-2 px-4 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs font-bold cursor-pointer text-[#0284C7] hover:bg-[#E0F2FE]">
                      Chọn tệp hình ảnh (JPG, PNG, WebP, SVG)
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePuzzleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">
                  Câu hỏi gợi mở cho bức ảnh:
                </label>
                <textarea
                  rows={2}
                  value={pzQPrompt}
                  onChange={(e) => setPzQPrompt(e.target.value)}
                  placeholder="Ví dụ: Quan sát hình trên và cho biết: Đây là linh kiện phần cứng nào?"
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs outline-none focus:border-[#0284C7]"
                />
              </div>

              {/* Hints */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#172B4D]">
                  3 mức gợi ý mở dần:
                </label>
                <input
                  type="text"
                  value={pzQHint1}
                  onChange={(e) => setPzQHint1(e.target.value)}
                  placeholder="Gợi ý 1 (Đặc điểm nhận dạng tổng quát)..."
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                />
                <input
                  type="text"
                  value={pzQHint2}
                  onChange={(e) => setPzQHint2(e.target.value)}
                  placeholder="Gợi ý 2 (Tên viết tắt hoặc chức năng chính)..."
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                />
                <input
                  type="text"
                  value={pzQHint3}
                  onChange={(e) => setPzQHint3(e.target.value)}
                  placeholder="Gợi ý 3 (Tên tiếng Việt hoặc ứng dụng cụ thể)..."
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>

              {/* Answers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#172B4D] mb-1">
                    Đáp án đúng:
                  </label>
                  <input
                    type="text"
                    value={pzQCorrect}
                    onChange={(e) => setPzQCorrect(e.target.value)}
                    placeholder="Ví dụ: CPU"
                    className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#172B4D] mb-1">
                    Từ đồng nghĩa chấp nhận (cách nhau bởi dấu phẩy):
                  </label>
                  <input
                    type="text"
                    value={pzQAccepted}
                    onChange={(e) => setPzQAccepted(e.target.value)}
                    placeholder="Ví dụ: Bộ vi xử lý, Vi xử lý, Chip"
                    className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">
                  Thuyết minh chuyên sâu sau khi giải xong:
                </label>
                <textarea
                  rows={2}
                  value={pzQExplanation}
                  onChange={(e) => setPzQExplanation(e.target.value)}
                  placeholder="Thông tin mở rộng về thiết bị để học sinh ghi nhớ..."
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={() => handleSavePuzzleGame('draft')}
                className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#475569] hover:bg-[#F8FAFC] cursor-pointer"
              >
                Lưu bản nháp
              </button>
              <button
                type="button"
                onClick={() => handleSavePuzzleGame('published')}
                className="px-5 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                Xuất bản câu đố
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CLONE TO CLASS MODAL                                      */}
      {/* ========================================================= */}
      {cloneModalState.isOpen && cloneModalState.game && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-[#E2EAF5] animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#2684FF] flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#172B4D]">Sao chép sang lớp khác</h3>
                  <p className="text-[11px] text-[#64748B]">Tạo bản sao độc lập cho lớp học chỉ định</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCloneModalState((prev) => ({ ...prev, isOpen: false }))}
                className="p-1.5 rounded-xl text-[#94A3B8] hover:bg-[#F1F5F9] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2EAF5] text-xs space-y-1">
                <div className="font-bold text-[#172B4D]">{cloneModalState.game.title}</div>
                <div className="text-[11px] text-[#64748B]">
                  Loại trò chơi: {cloneModalState.gameType === 'gymnastics' ? 'Thể Dục Trí Tuệ' : 'Giải Đố Hình Ảnh'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1.5">
                  Chọn Lớp đích nhận bản sao:
                </label>
                <select
                  value={cloneModalState.targetClass}
                  onChange={(e) => {
                    const tClass = e.target.value as SchoolClass;
                    setCloneModalState((prev) => ({
                      ...prev,
                      targetClass: tClass,
                      customTitle: `${prev.game?.title || 'Trò chơi'} (Dành cho Lớp ${tClass})`,
                    }));
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#172B4D]"
                >
                  {SUPPORTED_CLASSES.map((cls) => (
                    <option key={cls} value={cls}>
                      Lớp {cls} (Khối {CLASS_TO_GRADE[cls]})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1.5">
                  Tiêu đề cho bản sao tại Lớp {cloneModalState.targetClass}:
                </label>
                <input
                  type="text"
                  value={cloneModalState.customTitle}
                  onChange={(e) =>
                    setCloneModalState((prev) => ({ ...prev, customTitle: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[11px] text-[#15803D] leading-relaxed">
                ✓ <strong>Độc lập hoàn toàn:</strong> Bản sao mới sẽ có mã ID riêng biệt, lưu trữ dưới dạng <strong>Bản nháp</strong>. Giáo viên có thể chỉnh sửa nội dung câu hỏi cho phù hợp trình độ lớp đích mà không làm thay đổi bài tập gốc.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={() => setCloneModalState((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#64748B] hover:bg-[#F8FAFC] cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmClone}
                className="px-5 py-2.5 rounded-xl bg-[#2684FF] hover:bg-[#1A6DDF] text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                Xác nhận sao chép
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
