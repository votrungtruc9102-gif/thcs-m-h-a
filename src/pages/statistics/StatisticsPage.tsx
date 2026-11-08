import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  Award,
  CheckCircle,
  Clock,
  TrendingUp,
  Target,
  Sparkles,
  RotateCcw,
  BookOpen,
  Calendar,
  AlertTriangle,
  User,
  GraduationCap,
  LogOut,
  UserCheck,
} from 'lucide-react';

export const StatisticsPage: React.FC = () => {
  const { quizAttempts, gameScores, setActiveTab, currentUser, openAuthModal, logout } = useApp();

  const totalAttempts = quizAttempts.length;

  const totalQuestionsAnswered = quizAttempts.reduce(
    (sum, a) => sum + a.totalQuestions,
    0
  );

  const totalCorrectAnswered = quizAttempts.reduce(
    (sum, a) => sum + a.correctCount,
    0
  );

  const accuracyRate =
    totalQuestionsAnswered > 0
      ? Math.round((totalCorrectAnswered / totalQuestionsAnswered) * 100)
      : 100;

  const avgScore =
    totalAttempts > 0
      ? (
          quizAttempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts
        ).toFixed(1)
      : '10.0';

  const totalGamePoints = gameScores.reduce((sum, g) => sum + g.score, 0);

  // Badges calculation
  const badges = [
    {
      id: 'b1',
      title: 'Khởi đầu kỷ nguyên số',
      desc: 'Hoàn thành bài luyện tập đầu tiên',
      earned: totalAttempts >= 1,
      icon: Sparkles,
      color: '#2684FF',
      bg: '#EFF6FF',
    },
    {
      id: 'b2',
      title: 'Chuyên gia Trắc nghiệm',
      desc: 'Đạt điểm từ 8.0 trở lên trong bài thi',
      earned: quizAttempts.some((a) => a.score >= 8),
      icon: Target,
      color: '#22C55E',
      bg: '#F0FDF4',
    },
    {
      id: 'b3',
      title: 'Chiến binh Học tập',
      desc: 'Hoàn thành từ 3 bài luyện tập trở lên',
      earned: totalAttempts >= 3,
      icon: Award,
      color: '#FFB020',
      bg: '#FFFBEB',
    },
    {
      id: 'b4',
      title: 'Bậc thầy Trò chơi số',
      desc: 'Tích lũy từ 150 điểm trong Game học tập',
      earned: totalGamePoints >= 150,
      icon: TrendingUp,
      color: '#8B5CF6',
      bg: '#F5F3FF',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white border border-[#E2EAF5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFFBEB] text-[#FFB020] border border-[#FDE68A] flex items-center justify-center shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#D97706]">
              Hồ sơ năng lực học sinh
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#172B4D] mt-0.5">
              Thống kê kết quả & Tiến độ học tập
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('practice')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2684FF] text-white text-xs font-bold shadow-xs hover:bg-[#1A6DDF] cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Luyện tập thêm</span>
        </button>
      </div>

      {/* Personalized Student Profile Card */}
      {currentUser && currentUser.role === 'student' ? (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-[#EFF6FF] via-white to-[#ECFEFF] border border-[#BFDBFE] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-[#DBEAFE] border-2 border-[#93C5FD] flex items-center justify-center text-3xl shadow-xs">
              {currentUser.avatar || '🎒'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-[#172B4D]">{currentUser.name}</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#2684FF] text-white">
                  Lớp {currentUser.className}
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                Mã định danh: <span className="font-semibold text-[#172B4D]">{currentUser.studentCode}</span> · Trường THCS Mỹ Hòa · Năm học 2026–2027
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => openAuthModal('student')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#CBD5E1] text-[#475569] hover:border-[#2684FF] hover:text-[#2684FF] text-xs font-semibold cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Đổi tài khoản</span>
            </button>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2EAF5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#64748B]">
            <User className="w-4 h-4 text-[#2684FF]" />
            <span>Chế độ Khách: Kết quả chỉ lưu tạm thời trên trình duyệt.</span>
          </div>
          <button
            type="button"
            onClick={() => openAuthModal('student')}
            className="text-xs font-bold text-[#2684FF] hover:underline self-start sm:self-auto cursor-pointer"
          >
            Đăng nhập Học sinh để lưu trữ chính thức →
          </button>
        </div>
      )}

      {/* KPI Overview Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#E2EAF5] shadow-xs">
          <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
            Bài luyện đã làm
          </div>
          <div className="text-2xl font-black text-[#2684FF] mt-1">{totalAttempts} lượt</div>
          <div className="text-xs text-[#94A3B8] mt-1">Ghi nhận trên thiết bị</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E2EAF5] shadow-xs">
          <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
            Độ chính xác trung bình
          </div>
          <div className="text-2xl font-black text-[#22C55E] mt-1">{accuracyRate}%</div>
          <div className="text-xs text-[#94A3B8] mt-1">{totalCorrectAnswered}/{totalQuestionsAnswered} câu đúng</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E2EAF5] shadow-xs">
          <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
            Điểm số trung bình
          </div>
          <div className="text-2xl font-black text-[#FFB020] mt-1">{avgScore}/10</div>
          <div className="text-xs text-[#94A3B8] mt-1">Thang điểm 10 chuẩn</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E2EAF5] shadow-xs">
          <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
            Điểm thưởng Game số
          </div>
          <div className="text-2xl font-black text-[#8B5CF6] mt-1">{totalGamePoints} ★</div>
          <div className="text-xs text-[#94A3B8] mt-1">{gameScores.length} lượt hoàn thành</div>
        </div>
      </div>

      {/* Badges Section */}
      <div className="p-6 rounded-3xl bg-white border border-[#E2EAF5] shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#172B4D] uppercase tracking-wider flex items-center gap-2">
          <Award className="w-4 h-4 text-[#FFB020]" />
          Huy hiệu & Thành tích tự rèn luyện
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border-2 transition-all flex items-start gap-3 ${
                  badge.earned
                    ? 'border-[#BFDBFE] bg-white shadow-xs'
                    : 'border-[#F1F5F9] bg-[#F8FAFC] opacity-60'
                }`}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: badge.earned ? badge.bg : '#F1F5F9',
                    color: badge.earned ? badge.color : '#94A3B8',
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#172B4D]">{badge.title}</div>
                  <div className="text-[11px] text-[#64748B] mt-0.5 leading-snug">{badge.desc}</div>
                  <div className="mt-2">
                    {badge.earned ? (
                      <span className="text-[10px] font-bold text-[#16A34A] bg-[#F0FDF4] px-2 py-0.5 rounded-full border border-[#BBF7D0]">
                        ✓ Đã đạt được
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-[#94A3B8] bg-[#F1F5F9] px-2 py-0.5 rounded-full">
                        Chưa mở khóa
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* History of Quiz Attempts */}
      <div className="p-6 rounded-3xl bg-white border border-[#E2EAF5] shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#172B4D] uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#2684FF]" />
          Lịch sử các lần làm bài gần nhất ({quizAttempts.length})
        </h2>

        {quizAttempts.length > 0 ? (
          <div className="divide-y divide-[#E2EAF5] overflow-x-auto">
            {quizAttempts.map((item, idx) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-[#EFF6FF] text-[#2684FF] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-[#172B4D]">
                      Lớp {item.gradeId} · Môn {item.subjectId === 'tin_hoc' ? 'Tin học' : item.subjectId}
                    </div>
                    <div className="text-[11px] text-[#94A3B8]">
                      {new Date(item.timestamp).toLocaleString('vi-VN')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-bold text-sm text-[#2684FF]">{item.score} đ</span>
                    <div className="text-[10px] text-[#64748B]">
                      {item.correctCount}/{item.totalQuestions} câu đúng
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]">
                    Hoàn thành
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-[#64748B]">
            Bạn chưa làm bài luyện tập nào. Hãy bắt đầu ôn tập ở mục <strong>"Luyện tập"</strong>!
          </div>
        )}
      </div>
    </div>
  );
};
