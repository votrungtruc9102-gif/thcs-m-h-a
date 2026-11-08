import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  GraduationCap,
  ShieldCheck,
  User,
  ArrowRight,
  Sparkles,
  Award,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

export const PersonalizedGreeting: React.FC = () => {
  const {
    currentUser,
    openAuthModal,
    setActiveTab,
    currentSubject,
    quizAttempts,
    gameScores,
  } = useApp();

  const totalAttempts = quizAttempts.length;
  const avgScore =
    totalAttempts > 0
      ? (quizAttempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts).toFixed(1)
      : '10.0';

  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#EFF6FF] via-[#F0FDF4] to-[#ECFEFF] border border-[#BFDBFE] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#93C5FD] text-[#2684FF] flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="w-5 h-5 text-[#2684FF]" />
            </div>
            <div>
              <div className="font-bold text-sm text-[#172B4D] flex items-center gap-2">
                <span>Bạn đang trải nghiệm ở chế độ Khách</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-[#1E40AF]">
                  Khách vãng lai
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                Đăng nhập tài khoản Học sinh để lưu lịch sử làm bài, tính điểm trung bình và tích lũy huy hiệu số.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => openAuthModal('student')}
              className="px-4 py-2 rounded-xl bg-[#2684FF] hover:bg-[#1B6EE0] text-white text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer flex items-center gap-1.5"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Đăng nhập Học sinh</span>
            </button>
            <button
              type="button"
              onClick={() => openAuthModal('teacher')}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#CBD5E1] hover:border-[#7C3AED] text-[#475569] hover:text-[#7C3AED] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-[#7C3AED]" />
              <span className="hidden sm:inline">Giáo viên</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser.role === 'student') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#EFF6FF] via-white to-[#F0FDF4] border border-[#BFDBFE] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#2684FF]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white border-2 border-[#BFDBFE] shadow-sm flex items-center justify-center text-3xl shrink-0">
              {currentUser.avatar || '🎒'}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#2684FF] text-white">
                  Lớp {currentUser.className}
                </span>
                <span className="text-xs font-semibold text-[#64748B]">Mã HS: {currentUser.studentCode}</span>
                <span className="text-xs text-[#10B981] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Đang hoạt động
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-[#172B4D]">
                Chào mừng em <span className="text-[#2684FF]">{currentUser.name}</span> trở lại học tập! 👋
              </h2>
              <p className="text-xs text-[#64748B] leading-relaxed max-w-xl">
                Cùng nhau khám phá bài giảng mới môn <span className="font-bold text-[#172B4D]">{currentSubject.name}</span> và hoàn thành bài luyện tập để giữ vững vị trí dẫn đầu nhé.
              </p>
            </div>
          </div>

          {/* Quick Stats Pill & Action */}
          <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
            <div className="bg-white/80 backdrop-blur-sm border border-[#E2EAF5] px-3.5 py-2 rounded-2xl text-center shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-[#64748B]">Đã làm</div>
              <div className="text-sm font-black text-[#2684FF]">{totalAttempts} bài</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-[#E2EAF5] px-3.5 py-2 rounded-2xl text-center shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-[#64748B]">Điểm TB</div>
              <div className="text-sm font-black text-[#10B981]">{avgScore}/10</div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('statistics')}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#2684FF] to-[#1B6EE0] hover:from-[#1B6EE0] hover:to-[#1557B0] text-white text-xs font-bold shadow-md shadow-[#2684FF]/20 hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Xem thành tích</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Teacher Profile Banner
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#FAF5FF] via-white to-[#F5F3FF] border border-[#DDD6FE] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white border-2 border-[#DDD6FE] shadow-sm flex items-center justify-center text-3xl shrink-0">
            {currentUser.avatar || '👨‍🏫'}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#7C3AED] text-white">
                {currentUser.subjectDepartment || 'Giáo viên bộ môn'}
              </span>
              <span className="text-xs font-semibold text-[#64748B]">Mã GV: {currentUser.teacherCode}</span>
              <span className="text-xs text-[#7C3AED] font-bold">Cổng Quản trị Chuyên môn</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-[#172B4D]">
              Kính chào <span className="text-[#7C3AED]">{currentUser.name}</span>! 👨‍🏫
            </h2>
            <p className="text-xs text-[#64748B] leading-relaxed max-w-xl">
              Hệ thống xử lý SGK tự động, quản lý ngân hàng câu hỏi và tạo đề thi đã sẵn sàng phục vụ công tác giảng dạy.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
          <button
            type="button"
            onClick={() => setActiveTab('teacher')}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#6D28D9] hover:to-[#5B21B6] text-white text-xs font-bold shadow-md shadow-[#7C3AED]/20 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Vào Trang Quản trị Giáo viên</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
