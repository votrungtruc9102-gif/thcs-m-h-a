import React, { useState, useEffect, useRef } from 'react';
import { GymnasticsGame, GymnasticsQuestion } from '../../types';
import { StudentPECharacter } from './StudentPECharacter';
import { checkTextAnswer, MOVEMENT_GROUPS_CATALOG } from '../../utils/gameRules';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Timer,
  Trophy,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Volume2,
  VolumeX,
  RotateCcw,
  Play,
  Heart,
  ChevronRight,
  Zap,
} from 'lucide-react';

interface GymnasticsPlayViewProps {
  game: GymnasticsGame;
  onBack: () => void;
  onSaveScore: (score: number, maxScore: number, details: string) => void;
}

// Simple Web Audio API sound synthesizer
function playSynthSound(type: 'correct' | 'wrong' | 'whistle' | 'fanfare') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'correct') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.linearRampToValueAtTime(190, now + 0.25);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'whistle') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.linearRampToValueAtTime(1800, now + 0.08);
      osc.frequency.setValueAtTime(1600, now + 0.15);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'fanfare') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(554.37, now + 0.15);
      osc.frequency.setValueAtTime(659.25, now + 0.3);
      osc.frequency.setValueAtTime(880, now + 0.45);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.start(now);
      osc.stop(now + 0.8);
    }
  } catch {}
}

export const GymnasticsPlayView: React.FC<GymnasticsPlayViewProps> = ({
  game,
  onBack,
  onSaveScore,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [characterGender, setCharacterGender] = useState<'boy' | 'girl'>('boy');

  // Exercise execution state
  const [isExercising, setIsExercising] = useState(false);
  const [currentRep, setCurrentRep] = useState(1);
  const repTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer per question
  const currentQ: GymnasticsQuestion | undefined = game.questions[currentIdx];
  const timeLimit = currentQ?.timeLimitSeconds || 120;
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isGameOver, setIsGameOver] = useState(false);

  // Reset question state when moving to next question
  useEffect(() => {
    if (!currentQ) return;
    setSelectedOpt(null);
    setTextAnswer('');
    setIsAnswered(false);
    setIsCorrect(false);
    setShowHint(false);
    setIsExercising(false);
    setCurrentRep(1);
    setTimeLeft(currentQ.timeLimitSeconds || 120);

    if (repTimerRef.current) clearInterval(repTimerRef.current);
  }, [currentIdx, currentQ]);

  // Question countdown timer
  useEffect(() => {
    if (isAnswered || isGameOver || timeLeft <= 0) return;

    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [isAnswered, isGameOver, timeLeft]);

  // Handle timeout
  const handleTimeOut = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    setIsCorrect(false);
    if (soundEnabled) playSynthSound('wrong');
  };

  // Submit multiple-choice answer
  const handleSelectOption = (optId: string) => {
    if (isAnswered || !currentQ) return;
    setSelectedOpt(optId);
    setIsAnswered(true);

    const correct = optId === currentQ.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      handleSuccess();
    } else {
      if (soundEnabled) playSynthSound('wrong');
    }
  };

  // Submit short answer
  const handleSubmitTextAnswer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isAnswered || !currentQ || !textAnswer.trim()) return;

    setIsAnswered(true);
    const result = checkTextAnswer(
      textAnswer,
      currentQ.correctAnswer,
      currentQ.acceptedAnswers || []
    );

    setIsCorrect(result.isCorrect);

    if (result.isCorrect) {
      handleSuccess();
    } else {
      if (soundEnabled) playSynthSound('wrong');
    }
  };

  // On correct answer: trigger celebrations & PE movement cycles
  const handleSuccess = () => {
    if (!currentQ) return;
    const gained = currentQ.points || 20;
    setTotalScore((prev) => prev + gained);

    if (soundEnabled) {
      playSynthSound('correct');
      setTimeout(() => playSynthSound('whistle'), 300);
    }

    try {
      confetti({ particleCount: 65, spread: 70, origin: { y: 0.6 } });
    } catch {}

    // Start exercise movement simulation with countdown of repetitions
    setIsExercising(true);
    setCurrentRep(1);
    const targetReps = currentQ.repetitionCount || 4;

    let rep = 1;
    if (repTimerRef.current) clearInterval(repTimerRef.current);

    repTimerRef.current = setInterval(() => {
      rep += 1;
      if (rep <= targetReps) {
        setCurrentRep(rep);
      } else {
        if (repTimerRef.current) clearInterval(repTimerRef.current);
      }
    }, 1600); // 1.6s per cycle
  };

  // Move to next question or complete game
  const handleNextQuestion = () => {
    if (repTimerRef.current) clearInterval(repTimerRef.current);
    if (currentIdx < game.questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Completed all questions!
      setIsGameOver(true);
      const maxPts = game.questions.reduce((sum, q) => sum + (q.points || 20), 0);
      onSaveScore(
        totalScore,
        maxPts,
        `Thể dục trí tuệ: Hoàn thành "${game.title}" đạt ${totalScore}/${maxPts} điểm`
      );
      if (soundEnabled) playSynthSound('fanfare');
      try {
        confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
      } catch {}
    }
  };

  // Retry same question (encouraging, without penalty)
  const handleRetryQuestion = () => {
    setSelectedOpt(null);
    setTextAnswer('');
    setIsAnswered(false);
    setIsCorrect(false);
    setShowHint(true);
    setTimeLeft(currentQ?.timeLimitSeconds || 120);
  };

  const currentMeta = currentQ
    ? MOVEMENT_GROUPS_CATALOG.find((m) => m.id === currentQ.movementGroup) ||
      MOVEMENT_GROUPS_CATALOG[0]
    : MOVEMENT_GROUPS_CATALOG[0];

  const maxTotalScore = game.questions.reduce((sum, q) => sum + (q.points || 20), 0);

  // If game is completed, render Victory & Summary View
  if (isGameOver) {
    const percent = Math.round((totalScore / Math.max(1, maxTotalScore)) * 100);
    return (
      <div className="max-w-3xl mx-auto p-6 sm:p-10 rounded-3xl bg-white border border-[#E2EAF5] shadow-sm text-center space-y-6 animate-in zoom-in-95">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#22C55E] to-[#10B981] text-white mx-auto flex items-center justify-center shadow-md">
          <Trophy className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold text-[#10B981] uppercase tracking-wider">
            Chúc mừng bạn đã hoàn thành xuất sắc!
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#172B4D] mt-1">
            {game.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-md mx-auto">
            Bạn vừa củng cố kiến thức môn học vừa giúp cơ thể vận động nhẹ nhàng, sảng khoái!
          </p>
        </div>

        {/* Score Card */}
        <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
          <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0]">
            <span className="text-[11px] font-bold text-[#166534] uppercase">Điểm số</span>
            <div className="text-2xl font-black text-[#15803D] mt-1">{totalScore}</div>
            <span className="text-[10px] text-[#64748B]">trên tổng {maxTotalScore}đ</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE]">
            <span className="text-[11px] font-bold text-[#1E40AF] uppercase">Tỷ lệ đúng</span>
            <div className="text-2xl font-black text-[#2684FF] mt-1">{percent}%</div>
            <span className="text-[10px] text-[#64748B]">{game.questions.length} câu hỏi</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF5FF] border border-[#DDD6FE]">
            <span className="text-[11px] font-bold text-[#7C3AED] uppercase">Động tác</span>
            <div className="text-2xl font-black text-[#7C3AED] mt-1">8/8</div>
            <span className="text-[10px] text-[#64748B]">Đã thực hiện</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            type="button"
            onClick={() => {
              setCurrentIdx(0);
              setTotalScore(0);
              setIsGameOver(false);
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#F1F5F9] hover:bg-[#E2EAF5] text-[#172B4D] font-bold text-xs cursor-pointer transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Chơi lại bài này</span>
          </button>

          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#2684FF] hover:bg-[#1A6DDF] text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách trò chơi</span>
          </button>
        </div>
      </div>
    );
  }

  if (!currentQ) {
    return (
      <div className="text-center p-8 bg-white rounded-3xl border border-[#E2EAF5]">
        <p className="text-sm text-[#64748B]">Trò chơi chưa có câu hỏi nào.</p>
        <button
          type="button"
          onClick={onBack}
          className="mt-3 px-4 py-2 bg-[#2684FF] text-white rounded-xl text-xs font-bold"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5 animate-in fade-in duration-200">
      {/* Top Bar Navigation */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#E2EAF5] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC] hover:text-[#172B4D] cursor-pointer transition-colors"
            title="Quay lại danh sách trò chơi"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2684FF] bg-[#EFF6FF] px-2 py-0.5 rounded-lg border border-[#BFDBFE]">
                Thể Dục Trí Tuệ
              </span>
              <span className="text-xs text-[#64748B] font-medium hidden sm:inline">
                {game.title}
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-[#172B4D] mt-0.5">
              Câu {currentIdx + 1} / {game.questions.length}
            </h2>
          </div>
        </div>

        {/* Status Indicators: Timer, Score, Sound */}
        <div className="flex items-center gap-2.5">
          {/* Countdown Timer */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              timeLeft <= 15
                ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            <Timer className="w-4 h-4" />
            <span>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>

          {/* Current Score */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] text-xs font-bold">
            <Trophy className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>{totalScore} đ</span>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
              soundEnabled
                ? 'bg-[#F8FAFC] text-[#2684FF] border-[#BFDBFE]'
                : 'bg-[#F1F5F9] text-[#94A3B8] border-[#CBD5E1]'
            }`}
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Play Arena: Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (5 cols): Animated Character & Movement Cue */}
        <div className="lg:col-span-5 space-y-4">
          <StudentPECharacter
            movement={currentQ.movementGroup}
            currentRep={currentRep}
            totalReps={currentQ.repetitionCount || 4}
            isExercising={isExercising}
            characterGender={characterGender}
            onGenderChange={setCharacterGender}
            showControls={true}
          />

          {/* Movement description card */}
          <div className="p-4 rounded-2xl bg-white border border-[#E2EAF5] shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#64748B] uppercase">
                Động tác gắn liền:
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-[#EFF6FF] text-[#2684FF]">
                {currentQ.repetitionCount || 4} nhịp
              </span>
            </div>
            <p className="text-xs font-semibold text-[#172B4D]">{currentMeta.title}</p>
            <p className="text-[11px] text-[#64748B] leading-relaxed">
              {currentMeta.description}
            </p>
          </div>
        </div>

        {/* Right Column (7 cols): Question Card & Interaction */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E2EAF5] shadow-xs space-y-5">
            {/* Question Header */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#64748B] bg-[#F1F5F9] px-2.5 py-1 rounded-lg">
                Dạng câu hỏi:{' '}
                {currentQ.type === 'multiple_choice' ? 'Trắc nghiệm' : 'Trả lời ngắn'}
              </span>
              <span className="text-xs font-bold text-[#10B981]">
                +{currentQ.points || 20} điểm
              </span>
            </div>

            {/* Prompt Content */}
            <h3 className="text-base sm:text-lg font-bold text-[#172B4D] leading-relaxed">
              {currentQ.prompt}
            </h3>

            {/* Optional media illustration if present */}
            {currentQ.mediaUrl && (
              <div className="rounded-2xl overflow-hidden border border-[#CBD5E1] max-h-56 flex items-center justify-center bg-[#F8FAFC]">
                <img
                  src={currentQ.mediaUrl}
                  alt="Minh họa câu hỏi"
                  className="max-h-56 object-contain"
                />
              </div>
            )}

            {/* Multiple Choice Answers */}
            {currentQ.type === 'multiple_choice' && currentQ.options && (
              <div className="space-y-2.5">
                {currentQ.options.map((opt) => {
                  const isSelected = selectedOpt === opt.id;
                  const isTarget = currentQ.correctAnswer === opt.id;

                  let btnStyle =
                    'bg-white border-[#E2EAF5] text-[#172B4D] hover:border-[#2684FF] hover:bg-[#F8FAFC]';
                  if (isAnswered) {
                    if (isTarget) {
                      btnStyle =
                        'bg-[#F0FDF4] border-[#86EFAC] text-[#15803D] font-bold ring-2 ring-[#86EFAC]/40';
                    } else if (isSelected) {
                      btnStyle = 'bg-[#FEF2F2] border-[#FCA5A5] text-[#991B1B]';
                    } else {
                      btnStyle = 'bg-white border-[#E2EAF5] text-[#94A3B8] opacity-60';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`w-full p-4 rounded-2xl border-2 text-left text-xs sm:text-sm font-medium transition-all flex items-start gap-3 cursor-pointer ${btnStyle}`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                          isAnswered && isTarget
                            ? 'bg-[#15803D] text-white'
                            : isAnswered && isSelected
                            ? 'bg-[#991B1B] text-white'
                            : 'bg-[#EFF6FF] text-[#2684FF]'
                        }`}
                      >
                        {opt.id}
                      </span>
                      <span className="leading-snug">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Short Answer Input Form */}
            {currentQ.type === 'short_answer' && (
              <form onSubmit={handleSubmitTextAnswer} className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    disabled={isAnswered}
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    placeholder="Nhập câu trả lời của bạn vào đây..."
                    className="flex-1 px-4 py-3 rounded-2xl border-2 border-[#CBD5E1] text-sm focus:border-[#2684FF] outline-none disabled:bg-[#F8FAFC] disabled:text-[#64748B]"
                  />
                  {!isAnswered && (
                    <button
                      type="submit"
                      disabled={!textAnswer.trim()}
                      className="px-5 py-3 rounded-2xl bg-[#2684FF] hover:bg-[#1A6DDF] text-white font-bold text-xs cursor-pointer disabled:opacity-50 transition-colors shrink-0 shadow-xs"
                    >
                      Trả lời
                    </button>
                  )}
                </div>

                {isAnswered && (
                  <div className="text-xs font-medium text-[#475569] bg-[#F8FAFC] p-3 rounded-xl border border-[#E2EAF5]">
                    Đáp án chuẩn: <strong className="text-[#2684FF]">{currentQ.correctAnswer}</strong>
                    {currentQ.acceptedAnswers && currentQ.acceptedAnswers.length > 0 && (
                      <span className="text-[#64748B]">
                        {' '}
                        (Chấp nhận: {currentQ.acceptedAnswers.join(', ')})
                      </span>
                    )}
                  </div>
                )}
              </form>
            )}

            {/* Feedback Banners */}
            {isAnswered && (
              <div className="space-y-3 animate-in fade-in duration-150">
                {isCorrect ? (
                  /* Success Feedback with PE Call-to-action */
                  <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#86EFAC] text-xs text-[#15803D] space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
                      <span>Chính xác tuyệt vời! +{currentQ.points || 20} điểm</span>
                    </div>
                    <p className="font-semibold text-[#166534]">
                      🏃 Cùng đứng dậy hoặc ngồi thẳng lưng và thực hiện động tác "
                      <strong>{currentMeta.shortName}</strong>" ({currentRep}/
                      {currentQ.repetitionCount || 4} nhịp) nhé!
                    </p>
                    {currentQ.explanation && (
                      <p className="text-[11px] text-[#166534]/90 pt-1 border-t border-[#BBF7D0]">
                        <strong>Kiến thức ghi nhớ: </strong>
                        {currentQ.explanation}
                      </p>
                    )}
                  </div>
                ) : (
                  /* Polite encouraging message */
                  <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FECDD3] text-xs text-[#991B1B] space-y-2">
                    <div className="flex items-center gap-2 font-bold">
                      <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0" />
                      <span>Chưa hoàn toàn chính xác rồi bạn ơi!</span>
                    </div>
                    <p className="text-[11px] text-[#991B1B]/90">
                      Đừng nản lòng nhé! Bạn có thể xem gợi ý bên dưới hoặc thử trả lời lại.
                    </p>
                    {currentQ.explanation && (
                      <p className="text-[11px] text-[#991B1B] pt-1 border-t border-[#FECDD3]">
                        <strong>Giải thích: </strong>
                        {currentQ.explanation}
                      </p>
                    )}
                  </div>
                )}

                {/* Bottom Actions when answered */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  {!isCorrect && (
                    <button
                      type="button"
                      onClick={handleRetryQuestion}
                      className="px-4 py-2.5 rounded-xl border border-[#CBD5E1] hover:bg-[#F8FAFC] text-xs font-bold text-[#172B4D] cursor-pointer flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Thử lại câu này</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="ml-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#2684FF] to-[#1A6DDF] hover:from-[#1A6DDF] hover:to-[#1557B0] text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-xs transition-all"
                  >
                    <span>
                      {currentIdx < game.questions.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành bài tập'}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Hint Box (if student requests or enabled) */}
            {!isAnswered && (
              <div className="pt-2">
                {!showHint ? (
                  <button
                    type="button"
                    onClick={() => setShowHint(true)}
                    className="text-xs font-bold text-[#2684FF] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Xem gợi ý hỗ trợ</span>
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-xs text-[#1E40AF] animate-in fade-in">
                    <strong>💡 Gợi ý: </strong>
                    {currentQ.hint || 'Hãy suy nghĩ về các bài học và khái niệm cốt lõi đã học nhé!'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
