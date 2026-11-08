import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { INITIAL_TERM_PAIRS } from '../../data/initialData';
import { Question, GymnasticsGame, ImagePuzzleGame, GradeId } from '../../types';
import { GymnasticsPlayView } from '../../components/games/GymnasticsPlayView';
import { ImagePuzzlePlayView } from '../../components/games/ImagePuzzlePlayView';
import confetti from 'canvas-confetti';
import {
  Gamepad2,
  Sparkles,
  RotateCw,
  Trophy,
  Zap,
  Timer,
  CheckCircle,
  HelpCircle,
  Award,
  Layers,
  ArrowRight,
  ArrowLeft,
  Shuffle,
  Activity,
  Puzzle,
  Play,
  Filter,
  ShieldCheck,
  ChevronRight,
  Lock,
  GraduationCap,
  Users,
  CheckCircle2,
} from 'lucide-react';

export const GamesPage: React.FC = () => {
  const {
    currentSubject,
    currentGrade,
    selectedSubjectId,
    selectedGradeId,
    setSubjectAndGrade,
    filteredQuestions,
    addGameScore,
    gymnasticsGames,
    imagePuzzleGames,
    isTeacherAuthenticated,
    setActiveTab,
    currentUser,
    effectiveTheme,
  } = useApp();

  const isDark = effectiveTheme === 'black';

  // Active playing session: null = cards catalog; otherwise specific active game
  const [activePlaySession, setActivePlaySession] = useState<
    | { type: 'built_in'; id: 'wheel' | 'matching' | 'speed' | 'keyword' }
    | { type: 'gymnastics'; game: GymnasticsGame }
    | { type: 'puzzle'; game: ImagePuzzleGame }
    | null
  >(null);

  // 4 Grades list
  const gradesList: Array<{ id: GradeId; label: string; desc: string }> = [
    { id: '6', label: 'Khối 6', desc: 'Nhập môn & Nền tảng số' },
    { id: '7', label: 'Khối 7', desc: 'Tư duy logic & Thuật toán' },
    { id: '8', label: 'Khối 8', desc: 'Ứng dụng & Khoa học số' },
    { id: '9', label: 'Khối 9', desc: 'Bảo mật & Ôn thi chuyển cấp' },
  ];

  // Category filter on the card list
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'exercise' | 'puzzle' | 'built_in'>('all');

  // Handle student / teacher grade change
  const handleSelectGrade = (gradeId: GradeId) => {
    setSubjectAndGrade(selectedSubjectId, gradeId);
  };

  // Find games for currently selected grade
  const currentGymnasticsGame = gymnasticsGames.find(
    (g) => g.gradeId === selectedGradeId && (isTeacherAuthenticated || g.status === 'published')
  ) || gymnasticsGames.find((g) => g.gradeId === selectedGradeId) || gymnasticsGames[0];

  const currentPuzzleGame = imagePuzzleGames.find(
    (g) => g.gradeId === selectedGradeId && (isTeacherAuthenticated || g.status === 'published')
  ) || imagePuzzleGames.find((g) => g.gradeId === selectedGradeId) || imagePuzzleGames[0];

  // --- 1. LUCKY WHEEL STATE (BUILT-IN) ---
  const [wheelDegree, setWheelDegree] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelQuestion, setWheelQuestion] = useState<Question | null>(null);
  const [wheelSelectedOpt, setWheelSelectedOpt] = useState<string | null>(null);
  const [wheelResultMsg, setWheelResultMsg] = useState<string | null>(null);
  const [wheelTotalScore, setWheelTotalScore] = useState(0);

  const spinWheel = () => {
    if (isSpinning || filteredQuestions.length === 0) return;
    setIsSpinning(true);
    setWheelQuestion(null);
    setWheelSelectedOpt(null);
    setWheelResultMsg(null);

    const randomRotations = 5 + Math.floor(Math.random() * 5);
    const randomDegrees = Math.floor(Math.random() * 360);
    const targetDegree = wheelDegree + randomRotations * 360 + randomDegrees;
    setWheelDegree(targetDegree);

    setTimeout(() => {
      setIsSpinning(false);
      const randomQ = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
      setWheelQuestion(randomQ);
    }, 3200);
  };

  const handleWheelAnswer = (optId: string) => {
    if (!wheelQuestion || wheelSelectedOpt) return;
    setWheelSelectedOpt(optId);

    if (optId === wheelQuestion.correctAnswer) {
      setWheelResultMsg('Chính xác! Bạn được cộng +100 điểm may mắn!');
      setWheelTotalScore((prev) => prev + 100);
      addGameScore({
        id: `g_${Date.now()}`,
        gameType: 'wheel',
        score: 100,
        maxScore: 100,
        timestamp: new Date().toISOString(),
        details: `Vòng quay may mắn: Trả lời đúng câu ${wheelQuestion.code} (Khối ${selectedGradeId})`,
      });
      try {
        confetti({ particleCount: 50, spread: 60 });
      } catch {}
    } else {
      setWheelResultMsg(`Chưa đúng! Đáp án chính xác là ${wheelQuestion.correctAnswer}.`);
    }
  };

  // --- 2. MATCHING GAME STATE (BUILT-IN) ---
  const [matchingCards, setMatchingCards] = useState<
    Array<{ id: string; text: string; pairId: string; type: 'term' | 'def'; isMatched: boolean; isSelected: boolean }>
  >([]);
  const [firstSelectedCard, setFirstSelectedCard] = useState<number | null>(null);
  const [matchingScore, setMatchingScore] = useState(0);

  const initMatchingGame = () => {
    const rawPairs = INITIAL_TERM_PAIRS.slice(0, 4);
    const cards: Array<{
      id: string;
      text: string;
      pairId: string;
      type: 'term' | 'def';
      isMatched: boolean;
      isSelected: boolean;
    }> = [];

    rawPairs.forEach((pair, idx) => {
      cards.push({
        id: `term_${idx}`,
        text: pair.term,
        pairId: pair.id,
        type: 'term',
        isMatched: false,
        isSelected: false,
      });
      cards.push({
        id: `def_${idx}`,
        text: pair.definition,
        pairId: pair.id,
        type: 'def',
        isMatched: false,
        isSelected: false,
      });
    });

    setMatchingCards(cards.sort(() => 0.5 - Math.random()));
    setFirstSelectedCard(null);
    setMatchingScore(0);
  };

  useEffect(() => {
    if (activePlaySession?.type === 'built_in' && activePlaySession.id === 'matching') {
      initMatchingGame();
    }
  }, [activePlaySession]);

  const handleCardClick = (index: number) => {
    const card = matchingCards[index];
    if (card.isMatched || card.isSelected) return;

    if (firstSelectedCard === null) {
      setFirstSelectedCard(index);
      setMatchingCards((prev) =>
        prev.map((c, i) => (i === index ? { ...c, isSelected: true } : c))
      );
    } else {
      const first = matchingCards[firstSelectedCard];
      const isMatch = first.pairId === card.pairId && first.type !== card.type;

      if (isMatch) {
        setMatchingCards((prev) =>
          prev.map((c, i) =>
            i === index || i === firstSelectedCard
              ? { ...c, isMatched: true, isSelected: false }
              : c
          )
        );
        setFirstSelectedCard(null);
        setMatchingScore((prev) => prev + 25);
        try {
          confetti({ particleCount: 30, spread: 50 });
        } catch {}

        if (matchingScore + 25 >= 100) {
          addGameScore({
            id: `g_${Date.now()}`,
            gameType: 'matching',
            score: 100,
            maxScore: 100,
            timestamp: new Date().toISOString(),
            details: `Ghép cặp thuật ngữ hoàn hảo (Khối ${selectedGradeId})`,
          });
        }
      } else {
        setMatchingCards((prev) =>
          prev.map((c, i) => (i === index ? { ...c, isSelected: true } : c))
        );
        setTimeout(() => {
          setMatchingCards((prev) =>
            prev.map((c, i) =>
              i === index || i === firstSelectedCard ? { ...c, isSelected: false } : c
            )
          );
          setFirstSelectedCard(null);
        }, 900);
      }
    }
  };

  // --- 3. SPEED CHALLENGE (BUILT-IN) ---
  const [speedQuestions, setSpeedQuestions] = useState<Question[]>([]);
  const [speedIndex, setSpeedIndex] = useState(0);
  const [speedScore, setSpeedScore] = useState(0);
  const [speedTimer, setSpeedTimer] = useState(15);
  const [isSpeedOver, setIsSpeedOver] = useState(false);

  const startSpeedGame = () => {
    const shuffled = [...filteredQuestions].sort(() => 0.5 - Math.random()).slice(0, 5);
    setSpeedQuestions(shuffled);
    setSpeedIndex(0);
    setSpeedScore(0);
    setSpeedTimer(15);
    setIsSpeedOver(false);
  };

  useEffect(() => {
    if (activePlaySession?.type === 'built_in' && activePlaySession.id === 'speed') {
      startSpeedGame();
    }
  }, [activePlaySession]);

  useEffect(() => {
    if (activePlaySession?.type !== 'built_in' || activePlaySession.id !== 'speed') return;
    if (isSpeedOver) return;

    if (speedTimer <= 0) {
      handleSpeedNext(null);
      return;
    }

    const interval = setInterval(() => {
      setSpeedTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [speedTimer, isSpeedOver, activePlaySession]);

  const handleSpeedNext = (selectedOpt: string | null) => {
    const currentQ = speedQuestions[speedIndex];
    if (currentQ && selectedOpt === currentQ.correctAnswer) {
      setSpeedScore((prev) => prev + 20 + speedTimer);
    }

    if (speedIndex + 1 < speedQuestions.length) {
      setSpeedIndex((prev) => prev + 1);
      setSpeedTimer(15);
    } else {
      setIsSpeedOver(true);
      addGameScore({
        id: `g_${Date.now()}`,
        gameType: 'speed',
        score: speedScore,
        maxScore: 100,
        timestamp: new Date().toISOString(),
        details: `Thử thách phản xạ 15s (Khối ${selectedGradeId})`,
      });
      try {
        confetti({ particleCount: 60, spread: 70 });
      } catch {}
    }
  };

  // --- 4. KEYWORD GUESS (BUILT-IN) ---
  const KEYWORDS = [
    { word: 'INTERNET', hint: 'Mạng máy tính toàn cầu kết nối triệu người' },
    { word: 'ROBOT', hint: 'Cỗ máy tự động có thể lập trình thông minh' },
    { word: 'PYTHON', hint: 'Ngôn ngữ lập trình phổ biến bậc nhất hiện nay' },
    { word: 'DATABASE', hint: 'Cơ sở dữ liệu lưu trữ thông tin có cấu trúc' },
  ];
  const [kwIndex, setKwIndex] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);

  const activeKw = KEYWORDS[kwIndex % KEYWORDS.length];
  const isWordSolved = activeKw.word.split('').every((l) => guessedLetters.includes(l));

  const handleGuessLetter = (letter: string) => {
    if (guessedLetters.includes(letter)) return;
    const next = [...guessedLetters, letter];
    setGuessedLetters(next);

    if (activeKw.word.split('').every((l) => next.includes(l))) {
      addGameScore({
        id: `g_${Date.now()}`,
        gameType: 'keyword',
        score: 100,
        maxScore: 100,
        timestamp: new Date().toISOString(),
        details: `Đoán từ khóa thành công: ${activeKw.word}`,
      });
      try {
        confetti({ particleCount: 50, spread: 60 });
      } catch {}
    }
  };

  const nextWord = () => {
    setKwIndex((prev) => prev + 1);
    setGuessedLetters([]);
  };

  // ==========================================================
  // RENDER ACTIVE PLAYING SESSION VIEW
  // ==========================================================
  if (activePlaySession) {
    if (activePlaySession.type === 'gymnastics') {
      return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <GymnasticsPlayView
            game={activePlaySession.game}
            onBack={() => setActivePlaySession(null)}
            onSaveScore={(score, maxScore, details) => {
              addGameScore({
                id: `gym_${Date.now()}`,
                gameType: 'gymnastics',
                score,
                maxScore,
                timestamp: new Date().toISOString(),
                details,
              });
            }}
          />
        </div>
      );
    }

    if (activePlaySession.type === 'puzzle') {
      return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ImagePuzzlePlayView
            game={activePlaySession.game}
            onBack={() => setActivePlaySession(null)}
            onSaveScore={(score, maxScore, details) => {
              addGameScore({
                id: `pz_${Date.now()}`,
                gameType: 'image_puzzle',
                score,
                maxScore,
                timestamp: new Date().toISOString(),
                details,
              });
            }}
          />
        </div>
      );
    }

    // Built-in playing sessions wrapper
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation header */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0B132B] border border-[#E2EAF5] dark:border-white/10 shadow-xs flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActivePlaySession(null)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#CBD5E1] dark:border-white/20 text-xs font-bold text-[#172B4D] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-white/5 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách trò chơi</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#2684FF] dark:text-[#00E5FF] bg-[#EFF6FF] dark:bg-[#00E5FF]/10 px-3 py-1 rounded-full">
              {activePlaySession.id === 'wheel' && '🎡 Vòng quay may mắn'}
              {activePlaySession.id === 'matching' && '🃏 Ghép cặp thuật ngữ'}
              {activePlaySession.id === 'speed' && '⚡ Thử thách phản xạ 15s'}
              {activePlaySession.id === 'keyword' && '🔤 Đoán từ khóa số'}
            </span>
            <span className="text-xs font-bold text-[#64748B] dark:text-slate-400">
              Khối {selectedGradeId}
            </span>
          </div>
        </div>

        {/* --- 1. LUCKY WHEEL --- */}
        {activePlaySession.id === 'wheel' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-[#0B132B] border border-[#E2EAF5] dark:border-white/10 shadow-xs flex flex-col items-center text-center space-y-4">
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold text-[#64748B] dark:text-slate-400">Điểm thưởng tích lũy</span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FFFBEB] dark:bg-amber-950/40 text-[#D97706] dark:text-amber-400 border border-[#FDE68A] dark:border-amber-800">
                  ★ {wheelTotalScore} điểm
                </span>
              </div>

              <div className="relative w-64 h-64 my-4 flex items-center justify-center">
                <div className="absolute -top-3 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-red-500 filter drop-shadow" />

                <div
                  className="w-full h-full rounded-full border-8 border-white dark:border-[#070B14] shadow-2xl relative overflow-hidden transition-transform ease-out"
                  style={{
                    transform: `rotate(${wheelDegree}deg)`,
                    transitionDuration: isSpinning ? '3.2s' : '0s',
                    background:
                      'conic-gradient(#2684FF 0deg 45deg, #22C7E8 45deg 90deg, #22C55E 90deg 135deg, #FFB020 135deg 180deg, #8B5CF6 180deg 225deg, #EC4899 225deg 270deg, #3B82F6 270deg 315deg, #10B981 315deg 360deg)',
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-white font-black text-xs">
                    <div className="absolute top-4 font-bold">+100</div>
                    <div className="absolute bottom-4 font-bold">+200</div>
                    <div className="absolute left-4 font-bold">+50</div>
                    <div className="absolute right-4 font-bold">+150</div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isSpinning}
                  onClick={spinWheel}
                  className="absolute z-10 w-18 h-18 rounded-full bg-white dark:bg-[#070B14] text-[#2684FF] dark:text-[#00E5FF] shadow-lg border-4 border-[#EFF6FF] dark:border-white/10 font-black text-xs flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>{isSpinning ? 'QUAY...' : 'QUAY'}</span>
                </button>
              </div>

              <p className="text-xs text-[#64748B] dark:text-slate-400">
                Nhấn <strong>QUAY</strong> để chọn ngẫu nhiên một câu hỏi thử thách Khối {selectedGradeId}!
              </p>
            </div>

            <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-[#0B132B] border border-[#E2EAF5] dark:border-white/10 shadow-xs flex flex-col justify-center">
              {wheelQuestion ? (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2684FF] dark:text-[#00E5FF] bg-[#EFF6FF] dark:bg-[#00E5FF]/10 px-2.5 py-1 rounded-lg">
                      Thử thách: {wheelQuestion.code}
                    </span>
                    <span className="text-xs text-[#64748B] dark:text-slate-400">{currentSubject.name}</span>
                  </div>

                  <h3 className="text-base font-bold text-[#172B4D] dark:text-white leading-relaxed">
                    {wheelQuestion.content}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {wheelQuestion.options.map((opt) => {
                      const isChosen = wheelSelectedOpt === opt.id;
                      const isCorrect = wheelQuestion.correctAnswer === opt.id;

                      let btnClass = 'bg-white dark:bg-white/5 border-[#E2EAF5] dark:border-white/10 text-[#334155] dark:text-slate-200 hover:bg-[#F8FAFC]';
                      if (wheelSelectedOpt) {
                        if (isCorrect) btnClass = 'bg-[#F0FDF4] dark:bg-emerald-950/40 border-[#86EFAC] text-[#15803D] dark:text-emerald-400 font-bold';
                        else if (isChosen) btnClass = 'bg-[#FEF2F2] dark:bg-red-950/40 border-[#FCA5A5] text-[#991B1B] dark:text-red-400';
                      }

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleWheelAnswer(opt.id)}
                          disabled={wheelSelectedOpt !== null}
                          className={`p-3 rounded-xl border text-left text-xs transition-colors flex items-start gap-2 cursor-pointer ${btnClass}`}
                        >
                          <span className="font-bold shrink-0">{opt.id}.</span>
                          <span>{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>

                  {wheelResultMsg && (
                    <div
                      className={`p-3 rounded-xl text-xs font-semibold ${
                        wheelSelectedOpt === wheelQuestion.correctAnswer
                          ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]'
                          : 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
                      }`}
                    >
                      {wheelResultMsg}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#EFF6FF] dark:bg-white/5 flex items-center justify-center text-[#2684FF] dark:text-[#00E5FF]">
                    <RotateCw className="w-6 h-6 animate-spin" style={{ animationDuration: '8s' }} />
                  </div>
                  <h4 className="font-bold text-sm text-[#172B4D] dark:text-white">Vòng quay đang chờ bạn!</h4>
                  <p className="text-xs text-[#64748B] dark:text-slate-400">
                    Bấm nút <strong>QUAY</strong> ở khung bên trái để nhận câu hỏi may mắn.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- 2. MATCHING GAME --- */}
        {activePlaySession.id === 'matching' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0B132B] border border-[#E2EAF5] dark:border-white/10 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#172B4D] dark:text-white">Ghép cặp thuật ngữ & Định nghĩa</h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
                  Chọn 1 thẻ thuật ngữ và 1 thẻ giải nghĩa tương ứng để tạo thành cặp đúng.
                </p>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-[#F0FDF4] dark:bg-emerald-950/40 text-[#16A34A] dark:text-emerald-400 border border-[#BBF7D0] text-xs font-bold">
                Điểm số: {matchingScore} / 100
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {matchingCards.map((card, idx) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleCardClick(idx)}
                  disabled={card.isMatched}
                  className={`p-4 rounded-2xl border-2 text-xs font-semibold min-h-28 flex flex-col justify-center items-center text-center transition-all cursor-pointer ${
                    card.isMatched
                      ? 'border-[#86EFAC] bg-[#F0FDF4] dark:bg-emerald-950/20 text-[#15803D] dark:text-emerald-400 opacity-60'
                      : card.isSelected
                      ? 'border-[#2684FF] dark:border-[#00E5FF] bg-[#EFF6FF] dark:bg-[#00E5FF]/20 text-[#1E40AF] dark:text-[#00E5FF] shadow-sm scale-102'
                      : 'border-[#CBD5E1] dark:border-white/15 bg-white dark:bg-white/5 text-[#172B4D] dark:text-white hover:border-[#94A3B8]'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-[#94A3B8] mb-1">
                    {card.type === 'term' ? 'Thuật ngữ' : 'Định nghĩa'}
                  </span>
                  <span>{card.text}</span>
                </button>
              ))}
            </div>

            {matchingScore >= 100 && (
              <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] text-center space-y-2">
                <span className="text-xl">🎉</span>
                <p className="text-sm font-bold text-[#15803D]">
                  Xuất sắc! Bạn đã ghép chính xác toàn bộ các cặp thuật ngữ!
                </p>
                <button
                  type="button"
                  onClick={initMatchingGame}
                  className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold cursor-pointer"
                >
                  Chơi lại ván mới
                </button>
              </div>
            )}
          </div>
        )}

        {/* --- 3. SPEED CHALLENGE --- */}
        {activePlaySession.id === 'speed' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0B132B] border border-[#E2EAF5] dark:border-white/10 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FEF3C7] dark:bg-amber-950/40 text-[#D97706] flex items-center justify-center font-black">
                  ⚡
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#172B4D] dark:text-white">Thử thách phản xạ 15 giây</h3>
                  <p className="text-xs text-[#64748B] dark:text-slate-400">
                    Câu {speedIndex + 1} / {speedQuestions.length || 5}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-mono font-bold text-sm border border-red-200">
                  <Timer className="w-4 h-4" />
                  <span>{speedTimer}s</span>
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-[#EFF6FF] dark:bg-white/5 text-[#2684FF] dark:text-[#00E5FF] font-bold text-xs">
                  Điểm: {speedScore}
                </div>
              </div>
            </div>

            {isSpeedOver ? (
              <div className="p-8 text-center space-y-3">
                <div className="text-4xl">🏆</div>
                <h4 className="text-lg font-black text-[#172B4D] dark:text-white">Hoàn thành thử thách tốc độ!</h4>
                <p className="text-xs text-[#64748B] dark:text-slate-400">
                  Tổng điểm phản xạ Khối {selectedGradeId} của bạn là: <strong>{speedScore} điểm</strong>
                </p>
                <button
                  type="button"
                  onClick={startSpeedGame}
                  className="px-6 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-white text-xs font-bold cursor-pointer"
                >
                  Chơi lại
                </button>
              </div>
            ) : (
              speedQuestions[speedIndex] && (
                <div className="space-y-4">
                  <h4 className="text-base font-bold text-[#172B4D] dark:text-white leading-relaxed">
                    {speedQuestions[speedIndex].content}
                  </h4>

                  <div className="space-y-2">
                    {speedQuestions[speedIndex].options.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSpeedNext(opt.id)}
                        className="w-full p-3.5 rounded-xl border border-[#E2EAF5] dark:border-white/10 hover:border-[#2684FF] hover:bg-[#EFF6FF] dark:hover:bg-white/5 text-left text-xs font-medium text-[#172B4D] dark:text-white flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <span className="font-bold text-[#2684FF] dark:text-[#00E5FF]">{opt.id}.</span>
                        <span>{opt.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* --- 4. KEYWORD GUESS --- */}
        {activePlaySession.id === 'keyword' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0B132B] border border-[#E2EAF5] dark:border-white/10 shadow-xs space-y-6 text-center">
            <div className="max-w-md mx-auto space-y-3">
              <span className="text-xs font-bold text-[#2684FF] dark:text-[#00E5FF] uppercase tracking-wider">
                Câu đố từ khóa công nghệ số
              </span>
              <div className="p-4 rounded-2xl bg-[#EFF6FF] dark:bg-white/5 border border-[#BFDBFE] dark:border-white/10 text-xs text-[#1E40AF] dark:text-slate-300">
                <strong>Gợi ý: </strong>
                {activeKw.hint}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 py-4">
              {activeKw.word.split('').map((letter, idx) => {
                const isRevealed = guessedLetters.includes(letter);
                return (
                  <div
                    key={idx}
                    className={`w-11 h-13 sm:w-13 sm:h-16 rounded-2xl border-2 font-mono font-black text-xl sm:text-2xl flex items-center justify-center shadow-xs ${
                      isRevealed
                        ? 'border-[#22C55E] bg-[#F0FDF4] dark:bg-emerald-950/40 text-[#15803D] dark:text-emerald-400'
                        : 'border-[#CBD5E1] dark:border-white/15 bg-[#F8FAFC] dark:bg-white/5 text-transparent'
                    }`}
                  >
                    {isRevealed ? letter : '?'}
                  </div>
                );
              })}
            </div>

            {isWordSolved ? (
              <div className="space-y-3 animate-in zoom-in-95">
                <div className="text-base font-bold text-[#16A34A] dark:text-emerald-400">
                  🎉 Chúc mừng! Bạn đã giải chính xác từ khóa "{activeKw.word}"!
                </div>
                <button
                  type="button"
                  onClick={nextWord}
                  className="py-2.5 px-6 rounded-xl bg-[#2684FF] hover:bg-[#1A6DDF] text-white font-bold text-xs cursor-pointer"
                >
                  Từ khóa kế tiếp &rarr;
                </button>
              </div>
            ) : (
              <div className="max-w-xl mx-auto flex flex-wrap justify-center gap-1.5 pt-2">
                {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((char) => {
                  const isGuessed = guessedLetters.includes(char);
                  return (
                    <button
                      key={char}
                      type="button"
                      disabled={isGuessed}
                      onClick={() => handleGuessLetter(char)}
                      className={`w-9 h-9 rounded-xl font-mono font-bold text-xs transition-all cursor-pointer ${
                        isGuessed
                          ? 'bg-[#E2EAF5] dark:bg-white/5 text-[#94A3B8] opacity-50 cursor-not-allowed'
                          : 'bg-white dark:bg-white/5 border border-[#CBD5E1] dark:border-white/15 text-[#172B4D] dark:text-white hover:bg-[#EFF6FF] hover:border-[#2684FF]'
                      }`}
                    >
                      {char}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ==========================================================
  // DEFAULT VIEW: CARDS CATALOG OF ALL LEARNING GAMES
  // ==========================================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner: Đổi tên thành "Trò chơi học tập" */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0B132B] border border-[#E2EAF5] dark:border-white/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#8B5CF6] to-[#6D28D9] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Gamepad2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8B5CF6] dark:text-[#C084FC]">
                Không gian giáo dục tương tác
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#F0FDF4] dark:bg-emerald-950/40 text-[#16A34A] dark:text-emerald-400 border border-[#BBF7D0] dark:border-emerald-800">
                Môn {currentSubject.name} · {currentGrade.name}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#172B4D] dark:text-white mt-0.5">
              Trò chơi học tập – Vừa học vừa thư giãn
            </h1>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
              Kết hợp kiến thức bộ môn, vận động thể chất nhẹ nhàng giải tỏa mỏi mệt, tư duy hình ảnh và phản xạ nhanh.
            </p>
          </div>
        </div>

        {/* Teacher Shortcut to Game Management if Authenticated */}
        {isTeacherAuthenticated && (
          <button
            type="button"
            onClick={() => setActiveTab('teacher')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FAF5FF] dark:bg-white/5 border border-[#DDD6FE] dark:border-white/15 text-[#7C3AED] dark:text-[#C084FC] hover:bg-[#F3E8FF] text-xs font-bold cursor-pointer transition-colors shrink-0 shadow-2xs"
          >
            <ShieldCheck className="w-4 h-4 text-[#7C3AED] dark:text-[#C084FC]" />
            <span>Quản lý trò chơi (Cổng Giáo viên)</span>
          </button>
        )}
      </div>

      {/* ======================================================== */}
      {/* 4 THCS GRADES TABS (KHỐI 6, KHỐI 7, KHỐI 8, KHỐI 9)       */}
      {/* ======================================================== */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0B132B] border border-[#E2EAF5] dark:border-white/10 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#2684FF] dark:text-[#00E5FF]" />
            <h2 className="text-sm font-black text-[#172B4D] dark:text-white uppercase tracking-wider">
              Chọn Khối Lớp Trải Nghiệm Trò Chơi (Khối 6, 7, 8, 9)
            </h2>
          </div>
          <span className="text-xs text-[#64748B] dark:text-slate-400">
            Đang chọn: <strong>Khối {selectedGradeId}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {gradesList.map((g) => {
            const isSelected = selectedGradeId === g.id;

            return (
              <button
                key={g.id}
                type="button"
                onClick={() => handleSelectGrade(g.id)}
                className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col justify-between cursor-pointer group ${
                  isSelected
                    ? 'border-[#2684FF] dark:border-[#00E5FF] bg-[#EFF6FF] dark:bg-[#00E5FF]/10 shadow-xs'
                    : 'border-[#E2EAF5] dark:border-white/10 bg-white dark:bg-white/5 hover:border-[#CBD5E1]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-xs font-black uppercase tracking-wider ${
                      isSelected ? 'text-[#2684FF] dark:text-[#00E5FF]' : 'text-[#64748B] dark:text-slate-400'
                    }`}
                  >
                    {g.label}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-[#2684FF] dark:bg-[#00E5FF] animate-ping" />
                  )}
                </div>

                <div className="mt-2">
                  <div className="text-sm font-extrabold text-[#172B4D] dark:text-white">
                    {g.label} THCS
                  </div>
                  <div className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                    {g.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Tabs Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'Tất cả trò chơi' },
            { id: 'exercise', label: '🏃‍♂️ Thể Dục Trí Tuệ' },
            { id: 'puzzle', label: '🧩 Giải Đố Hình Ảnh' },
            { id: 'built_in', label: '⚡ Trò chơi phản xạ & may mắn' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategoryFilter(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                categoryFilter === tab.id
                  ? 'bg-[#2684FF] text-white shadow-xs'
                  : 'bg-white dark:bg-[#0B132B] border border-[#CBD5E1] dark:border-white/15 text-[#64748B] dark:text-slate-300 hover:bg-[#F8FAFC] dark:hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs font-bold text-[#1E40AF] dark:text-[#00E5FF] bg-[#EFF6FF] dark:bg-[#00E5FF]/10 px-3.5 py-1.5 rounded-xl border border-[#BFDBFE] dark:border-[#00E5FF]/30">
          Chương trình: <strong>Khối {selectedGradeId}</strong> · Môn {currentSubject.name}
        </span>
      </div>

      {/* ======================================================== */}
      {/* GAME CARDS GRID (CÁC KHUNG HÌNH RIÊNG BIỆT)               */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* KHUNG HÌNH 1: THỂ DỤC TRÍ TUỆ (FLAGSHIP GAME) */}
        {(categoryFilter === 'all' || categoryFilter === 'exercise') && (
          <div className="group p-6 rounded-3xl bg-white dark:bg-[#0B132B] border-2 border-[#BFDBFE] dark:border-[#00E5FF]/40 hover:border-[#2684FF] dark:hover:border-[#00E5FF] shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              {/* Image banner / Icon */}
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#2684FF] to-[#38BDF8] text-white flex items-center justify-center text-3xl shadow-xs group-hover:scale-105 transition-transform">
                  🏃‍♂️
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F0FDF4] dark:bg-emerald-950/40 text-[#16A34A] dark:text-emerald-400 border border-[#BBF7D0]">
                    ● Đang hoạt động
                  </span>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#EFF6FF] dark:bg-[#00E5FF]/15 text-[#2684FF] dark:text-[#00E5FF] border border-[#BFDBFE] uppercase">
                    Khối {selectedGradeId}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-extrabold text-base text-[#172B4D] dark:text-white group-hover:text-[#2684FF] dark:group-hover:text-[#00E5FF] transition-colors leading-snug">
                  Thể Dục Trí Tuệ – Vận Động & Tri Thức
                </h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1 leading-relaxed">
                  Trả lời câu hỏi kết hợp nhân vật thực hiện 8 nhóm động tác thể dục giải phẫu xương khớp giống con người (cổ, vai, cánh tay, cổ tay, thân, hông, gối, cổ chân).
                </p>
              </div>

              <div className="pt-2 border-t border-[#F1F5F9] dark:border-white/5 flex flex-wrap gap-2 text-[11px] text-[#475569] dark:text-slate-300">
                <span className="bg-[#F8FAFC] dark:bg-white/5 px-2 py-0.5 rounded-md border border-[#E2EAF5] dark:border-white/10">
                  {currentGymnasticsGame?.questions.length || 8} câu hỏi & bài tập
                </span>
                <span className="bg-[#F0FDF4] dark:bg-emerald-950/30 text-[#15803D] dark:text-emerald-400 px-2 py-0.5 rounded-md border border-[#BBF7D0] dark:border-emerald-800">
                  Khớp tự nhiên 100%
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActivePlaySession({ type: 'gymnastics', game: currentGymnasticsGame })}
              className="w-full py-3 rounded-2xl bg-[#2684FF] hover:bg-[#1A6DDF] text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-2 shadow-xs transition-all group-hover:shadow-sm"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Bắt đầu chơi (Khối {selectedGradeId})</span>
            </button>
          </div>
        )}

        {/* KHUNG HÌNH 2: GIẢI ĐỐ HÌNH ẢNH (FLAGSHIP GAME) */}
        {(categoryFilter === 'all' || categoryFilter === 'puzzle') && (
          <div className="group p-6 rounded-3xl bg-white dark:bg-[#0B132B] border-2 border-[#BAE6FD] dark:border-[#38BDF8]/40 hover:border-[#0284C7] dark:hover:border-[#38BDF8] shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              {/* Image banner / Icon */}
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0284C7] to-[#06B6D4] text-white flex items-center justify-center text-3xl shadow-xs group-hover:scale-105 transition-transform">
                  🧩
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F0FDF4] dark:bg-emerald-950/40 text-[#16A34A] dark:text-emerald-400 border border-[#BBF7D0]">
                    ● Đang hoạt động
                  </span>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#E0F2FE] dark:bg-[#38BDF8]/15 text-[#0284C7] dark:text-[#38BDF8] border border-[#BAE6FD] uppercase">
                    Khối {selectedGradeId}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-extrabold text-base text-[#172B4D] dark:text-white group-hover:text-[#0284C7] dark:group-hover:text-[#38BDF8] transition-colors leading-snug">
                  Giải Đố Hình Ảnh – Quan Sát & Suy Luận
                </h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1 leading-relaxed">
                  Quan sát các hình ảnh công nghệ và bài học trực quan, mở các gợi ý thông minh 3 cấp độ để giải đáp từ khóa chính xác.
                </p>
              </div>

              <div className="pt-2 border-t border-[#F1F5F9] dark:border-white/5 flex flex-wrap gap-2 text-[11px] text-[#475569] dark:text-slate-300">
                <span className="bg-[#F8FAFC] dark:bg-white/5 px-2 py-0.5 rounded-md border border-[#E2EAF5] dark:border-white/10">
                  {currentPuzzleGame?.questions.length || 6} câu đố thị giác
                </span>
                <span className="bg-[#E0F2FE] dark:bg-sky-950/30 text-[#0369A1] dark:text-sky-300 px-2 py-0.5 rounded-md border border-[#BAE6FD] dark:border-sky-800">
                  Gợi ý đa cấp độ
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActivePlaySession({ type: 'puzzle', game: currentPuzzleGame })}
              className="w-full py-3 rounded-2xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-2 shadow-xs transition-all group-hover:shadow-sm"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Bắt đầu chơi (Khối {selectedGradeId})</span>
            </button>
          </div>
        )}

        {/* KHUNG HÌNH 3: VÒNG QUAY MAY MẮN (BUILT-IN) */}
        {(categoryFilter === 'all' || categoryFilter === 'built_in') && (
          <div className="group p-6 rounded-3xl bg-white dark:bg-[#0B132B] border border-[#E2EAF5] dark:border-white/10 hover:border-[#8B5CF6] shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-[#F5F3FF] dark:bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#DDD6FE] dark:border-[#8B5CF6]/30 flex items-center justify-center group-hover:scale-105 transition-transform text-2xl">
                  🎡
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F0FDF4] dark:bg-emerald-950/40 text-[#16A34A] dark:text-emerald-400 border border-[#BBF7D0]">
                    ● Đang hoạt động
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAF5FF] dark:bg-purple-950/30 text-[#7C3AED] dark:text-purple-300 border border-[#DDD6FE] uppercase">
                    Khối 6, 7, 8, 9
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-extrabold text-base text-[#172B4D] dark:text-white group-hover:text-[#8B5CF6] transition-colors leading-snug">
                  Vòng Quay May Mắn
                </h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1 leading-relaxed">
                  Quay số ngẫu nhiên mở khóa các câu hỏi trắc nghiệm bí mật, nhận điểm thưởng may mắn và củng cố kiến thức toàn diện.
                </p>
              </div>

              <div className="pt-2 border-t border-[#F1F5F9] dark:border-white/5 text-[11px] text-[#64748B] dark:text-slate-400">
                Ngân hàng câu hỏi: {filteredQuestions.length} câu sẵn sàng
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActivePlaySession({ type: 'built_in', id: 'wheel' })}
              className="w-full py-3 rounded-2xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Bắt đầu chơi</span>
            </button>
          </div>
        )}

        {/* KHUNG HÌNH 4: GHÉP CẶP THUẬT NGỮ (BUILT-IN) */}
        {(categoryFilter === 'all' || categoryFilter === 'built_in') && (
          <div className="group p-6 rounded-3xl bg-white dark:bg-[#0B132B] border border-[#E2EAF5] dark:border-white/10 hover:border-[#10B981] shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-[#ECFDF5] dark:bg-emerald-950/30 text-[#10B981] border border-[#A7F3D0] flex items-center justify-center group-hover:scale-105 transition-transform text-2xl">
                  🃏
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F0FDF4] dark:bg-emerald-950/40 text-[#16A34A] dark:text-emerald-400 border border-[#BBF7D0]">
                    ● Đang hoạt động
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0] uppercase">
                    Khối 6, 7, 8, 9
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-extrabold text-base text-[#172B4D] dark:text-white group-hover:text-[#10B981] transition-colors leading-snug">
                  Ghép Cặp Thuật Ngữ & Định Nghĩa
                </h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1 leading-relaxed">
                  Rèn luyện tư duy logic qua việc nối chuẩn các từ viết tắt chuyên ngành và giải thích ý nghĩa cốt lõi theo từng bài học.
                </p>
              </div>

              <div className="pt-2 border-t border-[#F1F5F9] dark:border-white/5 text-[11px] text-[#64748B] dark:text-slate-400">
                Xáo trộn ngẫu nhiên mỗi lượt chơi
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActivePlaySession({ type: 'built_in', id: 'matching' })}
              className="w-full py-3 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Bắt đầu chơi</span>
            </button>
          </div>
        )}

        {/* KHUNG HÌNH 5: THỬ THÁCH PHẢN XẠ 15S (BUILT-IN) */}
        {(categoryFilter === 'all' || categoryFilter === 'built_in') && (
          <div className="group p-6 rounded-3xl bg-white dark:bg-[#0B132B] border border-[#E2EAF5] dark:border-white/10 hover:border-[#F59E0B] shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-[#FFFBEB] dark:bg-amber-950/30 text-[#D97706] border border-[#FDE68A] flex items-center justify-center group-hover:scale-105 transition-transform text-2xl">
                  ⚡
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F0FDF4] dark:bg-emerald-950/40 text-[#16A34A] dark:text-emerald-400 border border-[#BBF7D0]">
                    ● Đang hoạt động
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] uppercase">
                    Khối 6, 7, 8, 9
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-extrabold text-base text-[#172B4D] dark:text-white group-hover:text-[#D97706] transition-colors leading-snug">
                  Thử Thách Phản Xạ 15 Giây
                </h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1 leading-relaxed">
                  Trả lời nhanh các câu hỏi trắc nghiệm dưới áp lực thời gian đếm ngược. Trả lời càng sớm nhận điểm nhân đôi!
                </p>
              </div>

              <div className="pt-2 border-t border-[#F1F5F9] dark:border-white/5 text-[11px] text-[#64748B] dark:text-slate-400">
                Đồng hồ đếm ngược từng giây kịch tính
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActivePlaySession({ type: 'built_in', id: 'speed' })}
              className="w-full py-3 rounded-2xl bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Bắt đầu chơi</span>
            </button>
          </div>
        )}

        {/* KHUNG HÌNH 6: ĐOÁN TỪ KHÓA SỐ (BUILT-IN) */}
        {(categoryFilter === 'all' || categoryFilter === 'built_in') && (
          <div className="group p-6 rounded-3xl bg-white dark:bg-[#0B132B] border border-[#E2EAF5] dark:border-white/10 hover:border-[#2684FF] shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] dark:bg-[#2684FF]/20 text-[#2684FF] border border-[#BFDBFE] flex items-center justify-center group-hover:scale-105 transition-transform text-2xl">
                  🔤
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F0FDF4] dark:bg-emerald-950/40 text-[#16A34A] dark:text-emerald-400 border border-[#BBF7D0]">
                    ● Đang hoạt động
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#2684FF] border border-[#BFDBFE] uppercase">
                    Khối 6, 7, 8, 9
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-extrabold text-base text-[#172B4D] dark:text-white group-hover:text-[#2684FF] transition-colors leading-snug">
                  Đoán Từ Khóa Công Nghệ Số
                </h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1 leading-relaxed">
                  Giải mã các từ khóa bí ẩn theo bảng chữ cái tương tác, gợi ý khoa học và tích lũy điểm thưởng chung cuộc.
                </p>
              </div>

              <div className="pt-2 border-t border-[#F1F5F9] dark:border-white/5 text-[11px] text-[#64748B] dark:text-slate-400">
                Bộ từ khóa định hướng tin học & giáo dục số
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActivePlaySession({ type: 'built_in', id: 'keyword' })}
              className="w-full py-3 rounded-2xl bg-[#2684FF] hover:bg-[#1A6DDF] text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Bắt đầu chơi</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
