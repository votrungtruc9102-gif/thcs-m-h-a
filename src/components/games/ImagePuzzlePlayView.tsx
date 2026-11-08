import React, { useState, useEffect } from 'react';
import { ImagePuzzleGame, ImagePuzzleQuestion } from '../../types';
import { checkTextAnswer, calculateImagePuzzleScore } from '../../utils/gameRules';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Timer,
  Trophy,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  ZoomIn,
  RotateCcw,
  ChevronRight,
  Eye,
  Sparkles,
  Award,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface ImagePuzzlePlayViewProps {
  game: ImagePuzzleGame;
  onBack: () => void;
  onSaveScore: (score: number, maxScore: number, details: string) => void;
}

export const ImagePuzzlePlayView: React.FC<ImagePuzzlePlayViewProps> = ({
  game,
  onBack,
  onSaveScore,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [revealedHintsCount, setRevealedHintsCount] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [matchedSynonym, setMatchedSynonym] = useState<string | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const currentQ: ImagePuzzleQuestion | undefined = game.questions[currentIdx];
  const timeLimit = currentQ?.timeLimitSeconds || 90;
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  // Reset state on question change
  useEffect(() => {
    if (!currentQ) return;
    setUserInput('');
    setRevealedHintsCount(0);
    setIsAnswered(false);
    setIsCorrect(false);
    setMatchedSynonym(null);
    setTimeLeft(currentQ.timeLimitSeconds || 90);
  }, [currentIdx, currentQ]);

  // Countdown timer
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

  const handleTimeOut = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    setIsCorrect(false);
  };

  const handleRevealNextHint = () => {
    if (!currentQ) return;
    if (revealedHintsCount < currentQ.hints.length) {
      setRevealedHintsCount((prev) => prev + 1);
    }
  };

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnswered || !currentQ || !userInput.trim()) return;

    const check = checkTextAnswer(
      userInput,
      currentQ.correctAnswer,
      currentQ.acceptedAnswers || []
    );

    setIsAnswered(true);
    setIsCorrect(check.isCorrect);
    setMatchedSynonym(check.matchedWith || null);

    if (check.isCorrect) {
      const earned = calculateImagePuzzleScore(
        currentQ.points || 100,
        revealedHintsCount,
        currentQ.hintPenaltyPoints || 10
      );
      setTotalScore((prev) => prev + earned);

      try {
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      } catch {}
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx < game.questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setIsGameOver(true);
      const maxPts = game.questions.reduce((sum, q) => sum + (q.points || 100), 0);
      onSaveScore(
        totalScore,
        maxPts,
        `Giải đố hình ảnh: "${game.title}" đạt ${totalScore}/${maxPts} điểm`
      );
      try {
        confetti({ particleCount: 130, spread: 90, origin: { y: 0.5 } });
      } catch {}
    }
  };

  const handleRetry = () => {
    setUserInput('');
    setIsAnswered(false);
    setIsCorrect(false);
    setMatchedSynonym(null);
  };

  const maxTotalScore = game.questions.reduce((sum, q) => sum + (q.points || 100), 0);

  // Victory & Summary view
  if (isGameOver) {
    const percent = Math.round((totalScore / Math.max(1, maxTotalScore)) * 100);
    return (
      <div className="max-w-2xl mx-auto p-6 sm:p-10 rounded-3xl bg-white border border-[#E2EAF5] shadow-xs text-center space-y-6 animate-in zoom-in-95">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#3B82F6] to-[#06B6D4] text-white mx-auto flex items-center justify-center shadow-md">
          <Award className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold text-[#0284C7] uppercase tracking-wider">
            Thám tử công nghệ xuất sắc!
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#172B4D] mt-1">
            {game.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-md mx-auto">
            Bạn đã giải mã thành công tất cả các câu đố hình ảnh với khả năng quan sát và suy luận sắc bén!
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          <div className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE]">
            <span className="text-[11px] font-bold text-[#1E40AF] uppercase">Tổng điểm</span>
            <div className="text-3xl font-black text-[#2684FF] mt-1">{totalScore}</div>
            <span className="text-[10px] text-[#64748B]">trên tối đa {maxTotalScore}đ</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0]">
            <span className="text-[11px] font-bold text-[#166534] uppercase">Tỷ lệ chính xác</span>
            <div className="text-3xl font-black text-[#15803D] mt-1">{percent}%</div>
            <span className="text-[10px] text-[#64748B]">{game.questions.length} câu đố</span>
          </div>
        </div>

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
            <span>Chơi lại từ đầu</span>
          </button>

          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#2684FF] hover:bg-[#1A6DDF] text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về danh sách trò chơi</span>
          </button>
        </div>
      </div>
    );
  }

  if (!currentQ) {
    return (
      <div className="text-center p-8 bg-white rounded-3xl border border-[#E2EAF5]">
        <p className="text-sm text-[#64748B]">Không có câu đố nào trong trò chơi này.</p>
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

  const currentPointsValue = calculateImagePuzzleScore(
    currentQ.points || 100,
    revealedHintsCount,
    currentQ.hintPenaltyPoints || 10
  );

  return (
    <div className="max-w-5xl mx-auto space-y-5 animate-in fade-in duration-200">
      {/* Top Header */}
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
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded-lg border border-[#BAE6FD]">
                Giải Đố Hình Ảnh
              </span>
              <span className="text-xs text-[#64748B] font-medium hidden sm:inline">
                {game.title}
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-[#172B4D] mt-0.5">
              Câu đố {currentIdx + 1} / {game.questions.length}
            </h2>
          </div>
        </div>

        {/* Indicators */}
        <div className="flex items-center gap-2.5">
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

          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] text-xs font-bold">
            <Trophy className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>{totalScore} đ</span>
          </div>
        </div>
      </div>

      {/* Main Puzzle Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (5 cols): Puzzle Image & Zoom Preview */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-4 rounded-3xl bg-white border border-[#E2EAF5] shadow-xs flex flex-col items-center">
            <div className="relative w-full rounded-2xl overflow-hidden border border-[#CBD5E1] bg-slate-900 flex items-center justify-center min-h-[220px]">
              <img
                src={currentQ.image}
                alt="Hình ảnh câu đố"
                className="w-full h-auto max-h-72 object-contain select-none"
              />

              {/* Zoom Trigger Button */}
              <button
                type="button"
                onClick={() => setIsZoomOpen(true)}
                className="absolute bottom-2 right-2 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs backdrop-blur-xs transition-colors cursor-pointer flex items-center gap-1"
                title="Phóng to ảnh"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span className="text-[10px] font-semibold">Xem lớn</span>
              </button>
            </div>

            <div className="w-full flex items-center justify-between text-[11px] text-[#64748B] mt-2 px-1">
              <span>Quan sát chi tiết hình ảnh</span>
              <span className="font-semibold text-[#0284C7]">{currentQ.title || 'Câu đố thị giác'}</span>
            </div>
          </div>

          {/* Current Question Points & Penalty Indicator */}
          <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2EAF5] text-xs flex items-center justify-between">
            <span className="text-[#64748B] font-medium">Giá trị câu đố này:</span>
            <span className="font-black text-[#15803D] bg-[#DCFCE7] px-2.5 py-1 rounded-lg">
              +{currentPointsValue} điểm
            </span>
          </div>
        </div>

        {/* Right Column (7 cols): Clues, Hint revealing, and Answer input */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-[#E2EAF5] shadow-xs space-y-5">
            {/* Prompt */}
            <div>
              <span className="text-[11px] font-bold text-[#0284C7] uppercase tracking-wider">
                Câu hỏi gợi mở
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#172B4D] mt-1 leading-relaxed">
                {currentQ.prompt}
              </h3>
            </div>

            {/* Progressive Hint Reveal System */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#172B4D] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Hệ thống gợi ý ({revealedHintsCount}/{currentQ.hints.length})
                </span>

                {revealedHintsCount < currentQ.hints.length && !isAnswered && (
                  <button
                    type="button"
                    onClick={handleRevealNextHint}
                    className="text-xs font-bold text-[#0284C7] bg-[#E0F2FE] hover:bg-[#BAE6FD] px-3 py-1.5 rounded-xl cursor-pointer transition-colors flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>
                      Mở Gợi ý {revealedHintsCount + 1}{' '}
                      {currentQ.hintPenaltyPoints ? `(-${currentQ.hintPenaltyPoints}đ)` : ''}
                    </span>
                  </button>
                )}
              </div>

              {/* List of hints */}
              <div className="space-y-2">
                {currentQ.hints.map((hint, idx) => {
                  const isRevealed = idx < revealedHintsCount;
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border text-xs transition-all ${
                        isRevealed
                          ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF] font-medium'
                          : 'bg-[#F8FAFC] border-dashed border-[#CBD5E1] text-[#94A3B8] italic'
                      }`}
                    >
                      {isRevealed ? (
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-md bg-[#2684FF] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                            {idx + 1}
                          </span>
                          <span className="leading-snug">{hint}</span>
                        </div>
                      ) : (
                        <span>🔒 Gợi ý {idx + 1} đang bị khóa. Nhấn "Mở gợi ý" để xem manh mối.</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Answer Input */}
            <div className="pt-2 border-t border-[#F1F5F9]">
              <form onSubmit={handleSubmitAnswer} className="space-y-3">
                <label className="block text-xs font-bold text-[#172B4D]">
                  Nhập câu trả lời của bạn:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    disabled={isAnswered}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Gõ tên thiết bị, linh kiện hoặc khái niệm..."
                    className="flex-1 px-4 py-3 rounded-2xl border-2 border-[#CBD5E1] text-sm focus:border-[#2684FF] outline-none disabled:bg-[#F8FAFC] disabled:text-[#64748B]"
                  />
                  {!isAnswered && (
                    <button
                      type="submit"
                      disabled={!userInput.trim()}
                      className="px-6 py-3 rounded-2xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs cursor-pointer disabled:opacity-50 transition-colors shadow-xs shrink-0"
                    >
                      Kiểm tra
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Answer Feedback */}
            {isAnswered && (
              <div className="space-y-3 pt-2 animate-in fade-in duration-150">
                {isCorrect ? (
                  <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#86EFAC] text-xs text-[#15803D] space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
                      <span>Chính xác tuyệt đối! +{currentPointsValue} điểm</span>
                    </div>
                    {matchedSynonym && matchedSynonym.toLowerCase() !== userInput.trim().toLowerCase() && (
                      <p className="text-[11px] text-[#166534]">
                        Hệ thống đã nhận diện từ tương đương: "<strong>{matchedSynonym}</strong>".
                      </p>
                    )}
                    {currentQ.explanation && (
                      <p className="text-[11px] text-[#166534] pt-1 border-t border-[#BBF7D0]">
                        <strong>Thuyết minh chuyên sâu: </strong>
                        {currentQ.explanation}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FECDD3] text-xs text-[#991B1B] space-y-2">
                    <div className="flex items-center gap-2 font-bold">
                      <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0" />
                      <span>Câu trả lời chưa chính xác rồi!</span>
                    </div>
                    <p className="text-[11px] text-[#991B1B]/90">
                      Đáp án chính xác là: <strong className="text-[#B91C1C]">{currentQ.correctAnswer}</strong>
                    </p>
                    {currentQ.explanation && (
                      <p className="text-[11px] text-[#991B1B] pt-1 border-t border-[#FECDD3]">
                        <strong>Thuyết minh: </strong>
                        {currentQ.explanation}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 pt-2">
                  {!isCorrect && (
                    <button
                      type="button"
                      onClick={handleRetry}
                      className="px-4 py-2.5 rounded-xl border border-[#CBD5E1] hover:bg-[#F8FAFC] text-xs font-bold text-[#172B4D] cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Thử lại</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="ml-auto px-6 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <span>
                      {currentIdx < game.questions.length - 1 ? 'Câu tiếp theo' : 'Xem tổng kết'}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            className="max-w-4xl max-h-[90vh] bg-white rounded-3xl p-4 overflow-hidden relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3 px-2">
              <span className="text-sm font-bold text-[#172B4D]">
                {currentQ.title || 'Hình ảnh câu đố phóng to'}
              </span>
              <button
                type="button"
                onClick={() => setIsZoomOpen(false)}
                className="px-3 py-1 bg-[#F1F5F9] hover:bg-[#E2EAF5] text-xs font-bold rounded-xl cursor-pointer"
              >
                Đóng [ESC]
              </button>
            </div>
            <img
              src={currentQ.image}
              alt="Hình ảnh câu đố"
              className="max-w-full max-h-[75vh] object-contain mx-auto rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
