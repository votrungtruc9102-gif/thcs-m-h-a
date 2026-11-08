import React from 'react';
import { useApp } from '../../context/AppContext';
import { GraduationCap, MapPin, Mail, Phone, Globe, Shield, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveTab, openDrawer, currentSubject, currentGrade } = useApp();

  return (
    <footer className="bg-white border-t border-[#E2EAF5] mt-16 text-xs text-[#64748B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: School Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2684FF] to-[#22C7E8] text-white flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-sm text-[#172B4D] leading-none">THCS MỸ HÒA</div>
                <div className="text-[10px] text-[#2684FF] font-semibold mt-0.5">Năm học 2026 – 2027</div>
              </div>
            </div>
            <p className="text-xs leading-relaxed">
              Hệ thống Học tập Trực tuyến hiện đại, hỗ trợ học sinh rèn luyện kiến thức, phát triển phẩm chất và năng lực số toàn diện.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-[#16A34A] font-semibold bg-[#F0FDF4] px-2.5 py-1 rounded-lg w-fit border border-[#BBF7D0]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chuyển đổi số giáo dục THCS</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#172B4D]">Không gian học tập</h4>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('home')}
                  className="hover:text-[#2684FF] transition-colors cursor-pointer"
                >
                  Trang chủ
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('knowledge')}
                  className="hover:text-[#2684FF] transition-colors cursor-pointer"
                >
                  Kho kiến thức trọng tâm
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('practice')}
                  className="hover:text-[#2684FF] transition-colors cursor-pointer"
                >
                  Luyện tập trắc nghiệm
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('games')}
                  className="hover:text-[#2684FF] transition-colors cursor-pointer"
                >
                  Trò chơi học tập số
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('statistics')}
                  className="hover:text-[#2684FF] transition-colors cursor-pointer"
                >
                  Hồ sơ năng lực học tập
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Selected Program */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#172B4D]">Chương trình học tập</h4>
            <p className="text-xs leading-relaxed">
              Bạn đang học chương trình <strong>{currentSubject.name}</strong> khối <strong>{currentGrade.name}</strong>.
            </p>
            <button
              type="button"
              onClick={openDrawer}
              className="mt-1 px-3 py-1.5 rounded-xl bg-[#EFF6FF] text-[#2684FF] border border-[#BFDBFE] font-bold text-xs hover:bg-[#DBEAFE] cursor-pointer flex items-center gap-1.5"
            >
              <span>Mở bộ chọn môn & khối</span>
              &rarr;
            </button>
          </div>

          {/* Col 4: Contact & School Units */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#172B4D]">Trường THCS Mỹ Hòa</h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-[#2684FF] mt-0.5" />
                <span>Mỹ Hòa, thị xã Bình Minh, Vĩnh Long</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 shrink-0 text-[#2684FF]" />
                <span>thcsmyhoa.edu.vn@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 shrink-0 text-[#2684FF]" />
                <span>Cổng thông tin số ngành GD&ĐT</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-[#E2EAF5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#94A3B8]">
          <div>
            © 2026–2027 TRƯỜNG THCS MỸ HÒA. Bản quyền hệ thống học tập trực tuyến thuộc về nhà trường.
          </div>
          <div className="flex items-center gap-4">
            <span>An toàn dữ liệu học sinh</span>
            <span>·</span>
            <span>Nền tảng số thế hệ mới</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
