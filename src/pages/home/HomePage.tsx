import React from 'react';
import { useApp } from '../../context/AppContext';
import { HeroSection } from '../../components/home/HeroSection';
import { PersonalizedGreeting } from '../../components/home/PersonalizedGreeting';
import { StatsCards } from '../../components/home/StatsCards';
import {
  BookOpen,
  CheckSquare,
  Gamepad2,
  Globe,
  BarChart3,
  ArrowRight,
  Sparkles,
  School,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Laptop,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { setActiveTab, currentSubject, currentGrade, openDrawer, filteredTopics } = useApp();

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 1.5. Dynamic Personalized Greeting Banner */}
      <PersonalizedGreeting />

      {/* 2. Four Real Statistics Cards */}
      <StatsCards />

      {/* 3. Student Dedicated Feature Cards Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-[#172B4D] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2684FF]" />
              Không gian học tập cho học sinh {currentGrade.name}
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Chọn chức năng để bắt đầu buổi tự học hiệu quả cùng môn {currentSubject.name}
            </p>
          </div>
          <button
            type="button"
            onClick={openDrawer}
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#2684FF] bg-[#EFF6FF] px-3 py-1.5 rounded-xl border border-[#BFDBFE] hover:bg-[#DBEAFE] cursor-pointer"
          >
            <span>Đổi khối lớp ({currentGrade.name})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Feature 1: Kho kiến thức */}
          <div
            onClick={() => setActiveTab('knowledge')}
            className="group p-5 rounded-2xl bg-white border border-[#E2EAF5] hover:border-[#2684FF] shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2684FF] border border-[#BFDBFE] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#172B4D] group-hover:text-[#2684FF] transition-colors">
                Kho kiến thức trọng tâm
              </h3>
              <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                Tóm tắt lý thuyết bài học, mục tiêu đạt được, ví dụ thực hành và câu hỏi củng cố.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-bold text-[#2684FF]">
              <span>Khám phá bài giảng</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Feature 2: Luyện tập trắc nghiệm */}
          <div
            onClick={() => setActiveTab('practice')}
            className="group p-5 rounded-2xl bg-white border border-[#E2EAF5] hover:border-[#22C55E] shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#F0FDF4] text-[#22C55E] border border-[#BBF7D0] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <CheckSquare className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#172B4D] group-hover:text-[#22C55E] transition-colors">
                Luyện tập trắc nghiệm
              </h3>
              <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                Làm bài thi trắc nghiệm theo chủ đề, xem giải thích chi tiết và nhận điểm tức thì.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-bold text-[#22C55E]">
              <span>Vào làm bài ngay</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Feature 3: Trò chơi học tập */}
          <div
            onClick={() => setActiveTab('games')}
            className="group p-5 rounded-2xl bg-white border border-[#E2EAF5] hover:border-[#8B5CF6] shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#F5F3FF] text-[#8B5CF6] border border-[#DDD6FE] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EDE9FE] text-[#7C3AED]">Khối 6–9</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#DCFCE7] text-[#15803D]">Mới</span>
              </div>
              <h3 className="font-bold text-base text-[#172B4D] group-hover:text-[#7C3AED] transition-colors">
                Trò chơi học tập
              </h3>
              <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                Thể Dục Trí Tuệ (khớp động học), Giải Đố Hình Ảnh 3 cấp gợi ý, Vòng quay tri thức.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-bold text-[#7C3AED]">
              <span>Vào phòng trò chơi</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Feature 4: Liên kết giáo dục & SGK */}
          <div
            onClick={() => setActiveTab('links')}
            className="group p-5 rounded-2xl bg-white border border-[#E2EAF5] hover:border-[#0284C7] shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#ECFEFF] text-[#0284C7] border border-[#BAE6FD] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#172B4D] group-hover:text-[#0284C7] transition-colors">
                Sách giáo khoa & Liên kết
              </h3>
              <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                SGK điện tử 2026–2027, Kết nối tri thức (Ngữ văn 6...), Cổng Bộ GD&ĐT, Sở GD&ĐT An Giang.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-bold text-[#0284C7]">
              <span>Tra cứu tài liệu</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Feature 5: Thống kê cá nhân */}
          <div
            onClick={() => setActiveTab('statistics')}
            className="group p-5 rounded-2xl bg-white border border-[#E2EAF5] hover:border-[#FFB020] shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#FFFBEB] text-[#FFB020] border border-[#FDE68A] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#172B4D] group-hover:text-[#D97706] transition-colors">
                Hồ sơ & Thống kê
              </h3>
              <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                Theo dõi tiến độ học tập, điểm rèn luyện trò chơi, số câu đúng và phân tích năng lực.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-bold text-[#D97706]">
              <span>Xem kết quả cá nhân</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Active Topics Quick List in Current Subject & Grade */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="p-6 rounded-3xl bg-white border border-[#E2EAF5] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="font-bold text-base text-[#172B4D] flex items-center gap-2">
                <Laptop className="w-4 h-4 text-[#2684FF]" />
                Các chủ đề trọng tâm môn {currentSubject.name} – {currentGrade.name}
              </h3>
              <p className="text-xs text-[#64748B]">Bám sát chương trình dạy và học Trường THCS Mỹ Hòa</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('knowledge')}
              className="text-xs font-bold text-[#2684FF] hover:underline self-start sm:self-auto cursor-pointer"
            >
              Xem toàn bộ giáo trình &rarr;
            </button>
          </div>

          {filteredTopics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTopics.map((topic, idx) => (
                <div
                  key={topic.id}
                  onClick={() => setActiveTab('knowledge')}
                  className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2EAF5] hover:border-[#BFDBFE] hover:bg-[#EFF6FF] transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-[#2684FF] mb-1">
                    <span className="w-5 h-5 rounded-full bg-white border border-[#BFDBFE] flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="truncate">{topic.title}</span>
                  </div>
                  <p className="text-xs text-[#64748B] line-clamp-2 mt-1 leading-relaxed">
                    {topic.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-[#64748B]">
              Nội dung của môn {currentSubject.name} ({currentGrade.name}) đang được thầy cô cập nhật.
            </div>
          )}
        </div>
      </section>

      {/* 5. School Pride & Tech Commitment Info Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
        <div className="p-6 rounded-3xl bg-gradient-to-r from-[#EFF6FF] via-white to-[#F0FDF4] border border-[#BFDBFE] shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#2684FF] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#2684FF]/20">
              <School className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-bold text-base text-[#172B4D]">
                Trường THCS Mỹ Hòa – Vững bước tương lai
              </h4>
              <p className="text-xs text-[#64748B] mt-1 max-w-xl leading-relaxed">
                Đẩy mạnh ứng dụng chuyển đổi số và công nghệ thông tin trong dạy và học,
                xây dựng môi trường giáo dục thân thiện, sáng tạo và hiện đại cho toàn thể học sinh.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-[#172B4D]">Năm học 2026–2027</div>
              <div className="text-[11px] text-[#22C55E] font-medium flex items-center gap-1 justify-end">
                <CheckCircle2 className="w-3 h-3" />
                Hệ thống trực tuyến chính thức
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
