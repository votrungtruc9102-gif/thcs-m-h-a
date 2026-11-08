import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Question, QuizAttempt } from '../../types';
import { calculateScore } from '../../utils/quizRules';
import confetti from 'canvas-confetti';
import {
  CheckSquare,
  Clock,
  Flag,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Award,
  Sparkles,
  SlidersHorizontal,
  AlertCircle,
  HelpCircle,
  Send,
} from 'lucide-react';

export const PracticePage: React.FC = () => {
  const {
    currentSubject,
    currentGrade,
    filteredQuestions,
    filteredTopics,
    addQuizAttempt,
    openDrawer,
  } = useApp();

  // Mode: 'setup' | 'taking' | 'result'
  const [quizState, setQuizState] = useState<'setup' | 'taking' | 'result'>('setup');

  // Setup options
  const [selectedTopicId, setSelectedTopicId] = useState<string>('all');
  const [questionCountLimit, setQuestionCountLimit] = useState<number>(5);

  // Active quiz session data
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [lastAttempt, setLastAttempt] = useState<QuizAttempt | null>(null);

  // Timer loop when taking quiz
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (quizState === 'taking') {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizState]);

  // Questions available for current subject, grade and selected topic
  const eligibleQuestions = filteredQuestions.filter((q) =>
    selectedTopicId === 'all' ? true : q.topicId === selectedTopicId
  );

  const startQuiz = () => {
    if (eligibleQuestions.length === 0) return;

    // Pick questions up to count limit
    const shuffled = [...eligibleQuestions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(questionCountLimit, eligibleQuestions.length));

    setQuizQuestions(selected);
    setCurrentIndex(0);
    setUserAnswers({});
    setFlaggedQuestions({});
    setTimerSeconds(0);
    setQuizState('taking');
  };

  const handleSelectAnswer = (optionId: string) => {
    const currentQ = quizQuestions[currentIndex];
    if (!currentQ) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionId,
    }));
  };

  const toggleFlagCurrent = () => {
    const currentQ = quizQuestions[currentIndex];
    if (!currentQ) return;
    setFlaggedQuestions((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id],
    }));
  };

  const handleSubmitQuiz = () => {
    // Calculate score
    let correct = 0;
    quizQuestions.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });

    const finalScore = calculateScore(correct, quizQuestions.length);

    const attempt: QuizAttempt = {
      id: `att_${Date.now()}`,
      subjectId: currentSubject.id,
      gradeId: currentGrade.id as any,
      topicId: selectedTopicId,
      timestamp: new Date().toISOString(),
      totalQuestions: quizQuestions.length,
      correctCount: correct,
      score: finalScore,
      timeSpentSeconds: timerSeconds,
      userAnswers,
    };

    addQuizAttempt(attempt);
    setLastAttempt(attempt);
    setQuizState('result');

    // Trigger celebratory confetti if high score
    if (finalScore >= 7.0) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentQ = quizQuestions[currentIndex];
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. SETUP STATE */}
      {quizState === 'setup' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-[#E2EAF5] shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2684FF] border border-[#BFDBFE] flex items-center justify-center shrink-0">
                <CheckSquare className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#2684FF]">
                  Luyện tập trắc nghiệm
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-[#172B4D] mt-0.5">
                  Ôn tập & Kiểm tra kiến thức số
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={openDrawer}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F8FAFC] border border-[#BFDBFE] text-xs font-bold text-[#2684FF] cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>
                {currentSubject.name} · {currentGrade.name}
              </span>
            </button>
          </div>

          {/* Configuration Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E2EAF5] shadow-xs space-y-6">
            <h2 className="text-base font-bold text-[#172B4D] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2684FF]" />
              Thiết lập bài luyện tập trắc nghiệm
            </h2>

            {/* Topic Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                1. Chọn phạm vi ôn tập
              </label>
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="w-full p-3 rounded-xl border border-[#CBD5E1] bg-white text-sm font-medium text-[#172B4D] focus:border-[#2684FF] focus:ring-2 focus:ring-[#2684FF]/20 outline-none"
              >
                <option value="all">
                  Tất cả các chủ đề môn {currentSubject.name} ({eligibleQuestions.length} câu)
                </option>
                {filteredTopics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Question count limit */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                2. Số lượng câu hỏi muốn làm
              </label>
              <div className="flex flex-wrap gap-3">
                {[5, 10, 15, 20].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuestionCountLimit(num)}
                    className={`px-5 py-2.5 rounded-xl border font-bold text-sm transition-all cursor-pointer ${
                      questionCountLimit === num
                        ? 'bg-[#2684FF] border-[#2684FF] text-white shadow-xs'
                        : 'bg-white border-[#E2EAF5] text-[#475569] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    {num} câu
                  </button>
                ))}
              </div>
            </div>

            {/* Ready summary */}
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2EAF5] flex items-center justify-between text-xs text-[#64748B]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#2684FF]" />
                <span>Không giới hạn thời gian ép buộc (Tự do rèn luyện)</span>
              </div>
              <span className="font-semibold text-[#172B4D]">
                Có sẵn {eligibleQuestions.length} câu hỏi
              </span>
            </div>

            {eligibleQuestions.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#FFFBEB] text-amber-800 text-xs border border-[#FDE68A]">
                Chưa có câu hỏi trắc nghiệm cho môn học này. Thầy cô có thể thêm câu hỏi trong mục "Dành cho giáo viên" hoặc bạn có thể chuyển sang môn Tin học.
              </div>
            ) : (
              <button
                type="button"
                onClick={startQuiz}
                className="w-full py-4 rounded-2xl bg-[#2684FF] hover:bg-[#1A6DDF] text-white font-bold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Bắt đầu làm bài</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. TAKING QUIZ STATE */}
      {quizState === 'taking' && currentQ && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Top Bar: Progress & Timer */}
          <div className="p-4 rounded-2xl bg-white border border-[#E2EAF5] shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#EFF6FF] text-[#2684FF] border border-[#BFDBFE]">
                Câu {currentIndex + 1} / {quizQuestions.length}
              </span>
              <span className="text-xs text-[#64748B]">
                Đã trả lời: <strong className="text-[#172B4D]">{answeredCount}</strong> / {quizQuestions.length}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#475569] bg-[#F8FAFC] px-3 py-1.5 rounded-xl border border-[#E2EAF5]">
                <Clock className="w-4 h-4 text-[#2684FF]" />
                <span>{formatTime(timerSeconds)}</span>
              </div>

              <button
                type="button"
                onClick={toggleFlagCurrent}
                className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  flaggedQuestions[currentQ.id]
                    ? 'border-amber-400 bg-amber-50 text-amber-700'
                    : 'border-[#E2EAF5] text-[#64748B] hover:bg-[#F8FAFC]'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {flaggedQuestions[currentQ.id] ? 'Đã đánh dấu' : 'Đánh dấu xem lại'}
                </span>
              </button>
            </div>
          </div>

          {/* Question Navigator Ribbon */}
          <div className="p-3 rounded-2xl bg-white border border-[#E2EAF5] shadow-xs flex items-center gap-1.5 overflow-x-auto">
            {quizQuestions.map((q, idx) => {
              const isAnswered = userAnswers[q.id] !== undefined;
              const isCurrent = currentIndex === idx;
              const isFlagged = flaggedQuestions[q.id];

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative min-w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[#2684FF] text-white shadow-xs scale-105'
                      : isAnswered
                      ? 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]'
                      : 'bg-[#F8FAFC] text-[#64748B] border border-[#E2EAF5] hover:bg-[#F1F5F9]'
                  }`}
                >
                  {idx + 1}
                  {isFlagged && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Question Box */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E2EAF5] shadow-xs space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  Mã câu: {currentQ.code}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F1F5F9] text-[#64748B]">
                  {currentQ.cognitiveLevel === 'nhan_biet'
                    ? 'Nhận biết'
                    : currentQ.cognitiveLevel === 'thong_hieu'
                    ? 'Thông hiểu'
                    : currentQ.cognitiveLevel === 'van_dung'
                    ? 'Vận dụng'
                    : 'Vận dụng cao'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#172B4D] leading-relaxed">
                {currentQ.content}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQ.options.map((opt) => {
                const isSelected = userAnswers[currentQ.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectAnswer(opt.id)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-150 flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-[#2684FF] bg-[#EFF6FF] shadow-xs ring-2 ring-[#2684FF]/20'
                        : 'border-[#E2EAF5] bg-white hover:border-[#BFDBFE] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#2684FF] text-white'
                          : 'bg-[#F1F5F9] text-[#64748B]'
                      }`}
                    >
                      {opt.id}
                    </span>
                    <span className="text-sm font-medium text-[#172B4D] pt-0.5 leading-snug">
                      {opt.text}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Nav: Prev, Next, Submit */}
            <div className="pt-4 border-t border-[#E2EAF5] flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="py-2.5 px-4 rounded-xl border border-[#CBD5E1] text-[#475569] font-bold text-xs hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Câu trước</span>
              </button>

              {currentIndex < quizQuestions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.min(quizQuestions.length - 1, prev + 1))}
                  className="py-2.5 px-5 rounded-xl bg-[#2684FF] hover:bg-[#1A6DDF] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Câu kế tiếp</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitQuiz}
                  className="py-2.5 px-6 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#22C55E]/20"
                >
                  <Send className="w-4 h-4" />
                  <span>Nộp bài & Chấm điểm</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. RESULT & REVIEW STATE */}
      {quizState === 'result' && lastAttempt && (
        <div className="space-y-6 animate-in zoom-in-95 duration-200">
          {/* Result Banner Card */}
          <div className="p-8 rounded-3xl bg-white border border-[#E2EAF5] shadow-sm text-center space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#2684FF] to-[#22C7E8] text-white mx-auto flex items-center justify-center shadow-lg shadow-[#2684FF]/25">
              <Award className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#2684FF]">
                Kết quả bài luyện tập
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#172B4D] mt-1">
                {lastAttempt.score} / 10.0
              </h2>
              <p className="text-sm text-[#64748B] mt-1">
                Đúng {lastAttempt.correctCount} / {lastAttempt.totalQuestions} câu · Thời gian làm: {formatTime(lastAttempt.timeSpentSeconds)}
              </p>
            </div>

            {/* Performance status message */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-[#EFF6FF] text-[#2684FF] border border-[#BFDBFE]">
              <Sparkles className="w-4 h-4" />
              <span>
                {lastAttempt.score >= 9
                  ? 'Xuất sắc! Bạn nắm bài rất vững vàng.'
                  : lastAttempt.score >= 7
                  ? 'Khá giỏi! Tiếp tục phát huy nhé.'
                  : 'Cần ôn lại các nội dung chưa chính xác.'}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setQuizState('setup')}
                className="py-2.5 px-5 rounded-xl bg-[#2684FF] hover:bg-[#1A6DDF] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Luyện tập đề khác</span>
              </button>
            </div>
          </div>

          {/* Detailed Question Review & Explanations */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#172B4D] uppercase tracking-wider flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#2684FF]" />
              Chi tiết bài làm & Lời giải thích của Giáo viên
            </h3>

            {quizQuestions.map((q, idx) => {
              const studentAnswer = lastAttempt.userAnswers[q.id];
              const isCorrect = studentAnswer === q.correctAnswer;

              return (
                <div
                  key={q.id}
                  className={`p-6 rounded-3xl bg-white border-2 space-y-4 ${
                    isCorrect ? 'border-[#BBF7D0]' : 'border-[#FECDD3]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[#F1F5F9] text-[#172B4D] font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-[#64748B]">{q.code}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      {isCorrect ? (
                        <span className="text-[#16A34A] flex items-center gap-1 bg-[#F0FDF4] px-2.5 py-1 rounded-full border border-[#BBF7D0]">
                          <CheckCircle2 className="w-4 h-4" /> Chính xác (+{((10 / quizQuestions.length)).toFixed(1)}đ)
                        </span>
                      ) : (
                        <span className="text-[#DC2626] flex items-center gap-1 bg-[#FEF2F2] px-2.5 py-1 rounded-full border border-[#FECDD3]">
                          <XCircle className="w-4 h-4" /> Chưa đúng
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm font-bold text-[#172B4D]">{q.content}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt) => {
                      const isChosen = studentAnswer === opt.id;
                      const isRight = q.correctAnswer === opt.id;

                      let optClass = 'bg-white border-[#E2EAF5] text-[#475569]';
                      if (isRight) {
                        optClass = 'bg-[#F0FDF4] border-[#86EFAC] text-[#15803D] font-bold';
                      } else if (isChosen && !isRight) {
                        optClass = 'bg-[#FEF2F2] border-[#FCA5A5] text-[#991B1B] line-through';
                      }

                      return (
                        <div
                          key={opt.id}
                          className={`p-3 rounded-xl border flex items-start gap-2 ${optClass}`}
                        >
                          <span className="font-bold shrink-0">{opt.id}.</span>
                          <span>{opt.text}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Teacher's In-depth Explanation */}
                  <div className="p-3.5 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] text-xs text-[#1E40AF] leading-relaxed">
                    <strong className="font-bold">Lời giải thích: </strong>
                    {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
