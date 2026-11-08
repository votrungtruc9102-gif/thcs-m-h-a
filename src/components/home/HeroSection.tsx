import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckSquare,
  BookOpen,
  Gamepad2,
  Sparkles,
  ArrowRight,
  Shield,
  Laptop,
  Lightbulb,
  Cpu,
  Layers,
} from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { setActiveTab, currentSubject, currentGrade, openDrawer } = useApp();

  return (
    <section className="relative pt-6 pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headline, Description & 3 Core Actions */}
          <div className="lg:col-span-7 space-y-6">
            {/* School & School Year Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#EFF6FF] via-[#ECFEFF] to-white border border-[#BFDBFE] text-xs font-bold text-[#1E40AF] shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2684FF] animate-pulse" />
              <span>TRƯỜNG THCS MỸ HÒA · NĂM HỌC 2026–2027</span>
            </div>

            {/* Main Catchy Heading */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#172B4D] tracking-tight leading-[1.15]">
                Chinh phục <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-[#2684FF] via-[#06B6D4] to-[#10B981] bg-clip-text text-transparent">
                  tri thức số
                </span>{' '}
                thời đại 4.0
              </h1>
              <p className="text-base sm:text-lg text-[#64748B] leading-relaxed max-w-2xl font-normal">
                Nền tảng học tập trực tuyến giúp học sinh Trường THCS Mỹ Hòa khám phá kiến thức trọng tâm,
                rèn luyện kỹ năng giải trắc nghiệm và thử sức qua các trò chơi trí tuệ sinh động.
              </p>
            </div>

            {/* Active Subject and Grade Quick Switch Banner */}
            <div className="p-3.5 rounded-2xl bg-white/80 backdrop-blur-md border border-[#E2EAF5] shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs text-[#334155]">
                <span className="font-semibold text-[#64748B]">Chương trình đang xem:</span>
                <span className="font-bold text-[#2684FF] bg-[#EFF6FF] px-2.5 py-1 rounded-lg border border-[#BFDBFE]">
                  {currentSubject.name}
                </span>
                <span className="font-bold text-[#10B981] bg-[#ECFDF5] px-2.5 py-1 rounded-lg border border-[#A7F3D0]">
                  {currentGrade.name}
                </span>
              </div>
              <button
                type="button"
                onClick={openDrawer}
                className="text-xs font-bold text-[#2684FF] hover:underline flex items-center gap-1 cursor-pointer"
              >
                Đổi môn / khối khác
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Three Mandatory Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              {/* Button 1: Trắc nghiệm */}
              <button
                type="button"
                onClick={() => setActiveTab('practice')}
                className="group p-4 rounded-2xl bg-gradient-to-b from-[#2684FF] to-[#1A6DDF] text-white shadow-md hover:shadow-lg shadow-[#2684FF]/25 hover:-translate-y-0.5 active:translate-y-0 transition-all text-left cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2.5">
                  <CheckSquare className="w-5 h-5 text-white" />
                </div>
                <div className="font-bold text-base leading-tight">Trắc nghiệm</div>
                <div className="text-xs text-blue-100 mt-1 flex items-center justify-between">
                  <span>Luyện đề thi</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Button 2: Khám phá kiến thức */}
              <button
                type="button"
                onClick={() => setActiveTab('knowledge')}
                className="group p-4 rounded-2xl bg-white border-2 border-[#E2EAF5] hover:border-[#2684FF] text-[#172B4D] shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all text-left cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#2684FF] flex items-center justify-center mb-2.5">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="font-bold text-base leading-tight">Khám phá kiến thức</div>
                <div className="text-xs text-[#64748B] mt-1 flex items-center justify-between">
                  <span>Kho bài học số</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#2684FF]" />
                </div>
              </button>

              {/* Button 3: Trò chơi học tập */}
              <button
                type="button"
                onClick={() => setActiveTab('games')}
                className="group p-4 rounded-2xl bg-white border-2 border-[#E2EAF5] hover:border-[#8B5CF6] text-[#172B4D] shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all text-left cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-[#F5F3FF] text-[#8B5CF6] flex items-center justify-center mb-2.5">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <div className="font-bold text-base leading-tight">Trò chơi học tập</div>
                <div className="text-xs text-[#64748B] mt-1 flex items-center justify-between">
                  <span>Học mà chơi</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#8B5CF6]" />
                </div>
              </button>
            </div>
          </div>

          {/* Right Column: Vivid High-Tech Modern EdTech Illustration */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto w-full max-w-md aspect-4/3 sm:aspect-square flex items-center justify-center">
              {/* Soft luminous background backdrop circle */}
              <div className="absolute inset-4 rounded-3xl bg-gradient-to-tr from-[#2684FF]/20 via-[#22C7E8]/15 to-[#8B5CF6]/15 blur-2xl -z-10" />

              {/* Main Illustration Card */}
              <div className="w-full h-full rounded-3xl bg-white/90 backdrop-blur-md border border-[#BFDBFE] p-6 shadow-xl flex flex-col justify-between relative overflow-hidden">
                {/* Modern Tech Circuit Top Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#22C7E8]/20 to-transparent rounded-bl-full pointer-events-none" />

                {/* Header of Visual */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <span className="text-[11px] font-mono text-[#64748B] ml-2">THCS_MyHoa_Studio.app</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-[#2684FF] bg-[#EFF6FF] px-2.5 py-1 rounded-full">
                    <Sparkles className="w-3 h-3 text-[#2684FF]" />
                    <span>Công nghệ 2026</span>
                  </div>
                </div>

                {/* Dynamic Visual Center: Digital Classroom & Computer Science Graphic */}
                <div className="my-auto py-8 flex flex-col items-center text-center relative">
                  {/* Floating Tech Badge Top Left */}
                  <div className="hidden sm:flex absolute -left-2 top-2 p-2.5 rounded-2xl bg-white border border-[#BFDBFE] shadow-md items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] text-[#2684FF] flex items-center justify-center">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-[10px] text-[#64748B]">Xử lý dữ liệu</div>
                      <div className="text-xs font-bold text-[#172B4D]">CPU 64-bit</div>
                    </div>
                  </div>

                  {/* Floating Tech Badge Top Right */}
                  <div className="hidden sm:flex absolute -right-2 top-2 p-2.5 rounded-2xl bg-white border border-[#DDD6FE] shadow-md items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#F5F3FF] text-[#8B5CF6] flex items-center justify-center">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-[10px] text-[#64748B]">Tư duy sáng tạo</div>
                      <div className="text-xs font-bold text-[#7C3AED]">Tin học THCS</div>
                    </div>
                  </div>

                  {/* Core Icon Graphic */}
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#2684FF] to-[#22C7E8] text-white flex items-center justify-center shadow-lg shadow-[#2684FF]/30 mb-4 transform hover:scale-105 transition-transform">
                    <Laptop className="w-10 h-10" />
                  </div>

                  <h3 className="font-bold text-lg text-[#172B4D]">
                    Học tập số – Tương lai số
                  </h3>
                  <p className="text-xs text-[#64748B] max-w-xs mt-1.5 leading-relaxed">
                    Cùng học sinh THCS Mỹ Hòa tự tin bước vào thế giới công nghệ thông tin và trí tuệ nhân tạo.
                  </p>
                </div>

                {/* Bottom Status bar */}
                <div className="pt-3 border-t border-[#E2EAF5] flex items-center justify-between text-xs text-[#64748B]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                    <span>Máy chủ học tập sẵn sàng</span>
                  </div>
                  <span className="font-semibold text-[#2684FF]">100% Trực quan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
