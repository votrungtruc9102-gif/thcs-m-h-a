import React from 'react';
import { useApp } from '../../context/AppContext';
import { HelpCircle, CheckCircle, Award, Sparkles, TrendingUp } from 'lucide-react';

export const StatsCards: React.FC = () => {
  const { questionBank, quizAttempts, gameScores, currentSubject, currentGrade } = useApp();

  // Real question count for current subject and grade
  const currentSubjectQuestions = questionBank.filter(
    (q) => q.subjectId === currentSubject.id && q.gradeId === currentGrade.id
  ).length;

  const totalQuestions = questionBank.length;

  // Real completed attempts
  const completedCount = quizAttempts.length;

  // Real average score calculated from attempts
  const avgScore =
    completedCount > 0
      ? (
          quizAttempts.reduce((sum, item) => sum + item.score, 0) / completedCount
        ).toFixed(1)
      : '10.0';

  const gamesCount = gameScores.length;

  const stats = [
    {
      id: 'questions',
      title: 'Ngân hàng câu hỏi',
      value: `${currentSubjectQuestions} câu`,
      badge: `${totalQuestions} câu toàn trường`,
      description: `${currentSubject.name} (${currentGrade.name}) sẵn sàng ôn tập`,
      icon: HelpCircle,
      accentColor: '#2684FF',
      bgColor: '#EFF6FF',
      borderColor: '#BFDBFE',
    },
    {
      id: 'practices',
      title: 'Bài luyện đã làm',
      value: `${completedCount} bài`,
      badge: completedCount > 0 ? 'Đang học chăm chỉ' : 'Sẵn sàng khởi động',
      description: 'Lượt trắc nghiệm và kiểm tra trực tuyến',
      icon: CheckCircle,
      accentColor: '#22C55E',
      bgColor: '#F0FDF4',
      borderColor: '#BBF7D0',
    },
    {
      id: 'score',
      title: 'Điểm số trung bình',
      value: completedCount > 0 ? `${avgScore}/10` : '9.5/10',
      badge: completedCount > 0 ? 'Kết quả thực tế' : 'Điểm mẫu lớp',
      description: 'Đánh giá năng lực tự học của học sinh',
      icon: Award,
      accentColor: '#FFB020',
      bgColor: '#FFFBEB',
      borderColor: '#FDE68A',
    },
    {
      id: 'games',
      title: 'Thử thách & Trò chơi',
      value: `${gamesCount + 6} hoạt động`,
      badge: 'Vòng quay, Ghép cặp, Tốc độ',
      description: 'Trò chơi rèn phản xạ và ghi nhớ kiến thức',
      icon: Sparkles,
      accentColor: '#8B5CF6',
      bgColor: '#F5F3FF',
      borderColor: '#DDD6FE',
    },
  ];

  return (
    <section className="py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.id}
                className="group relative p-5 rounded-2xl bg-white border border-[#E2EAF5] hover:border-[#BFDBFE] shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                      style={{
                        backgroundColor: stat.bgColor,
                        color: stat.accentColor,
                        border: `1px solid ${stat.borderColor}`,
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: stat.bgColor,
                        color: stat.accentColor,
                      }}
                    >
                      {stat.badge}
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                    {stat.title}
                  </h3>
                  <div
                    className="text-2xl font-black mt-1 tracking-tight"
                    style={{ color: stat.accentColor }}
                  >
                    {stat.value}
                  </div>
                </div>

                <p className="text-xs text-[#64748B] mt-2 pt-2 border-t border-[#F1F5F9] leading-snug">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
