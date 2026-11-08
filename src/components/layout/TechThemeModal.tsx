import React from 'react';
import { useApp } from '../../context/AppContext';
import { TechThemeMode } from '../../types';
import {
  Sparkles,
  Sun,
  Moon,
  Laptop,
  Check,
  X,
  Zap,
  Sliders,
  Cpu,
} from 'lucide-react';

export const TechThemeModal: React.FC = () => {
  const {
    techTheme,
    effectiveTheme,
    setTechTheme,
    bgIntensity,
    setBgIntensity,
    isTechThemeModalOpen,
    setIsTechThemeModalOpen,
  } = useApp();

  if (!isTechThemeModalOpen) return null;

  const themes: Array<{
    id: TechThemeMode;
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    previewBg: string;
    previewBorder: string;
    textColor: string;
    tagText: string;
  }> = [
    {
      id: 'white',
      title: 'Trắng công nghệ',
      subtitle: 'Nền sáng tinh khôi, vi mạch xanh công nghệ & ánh cyan dịu mắt',
      icon: Sun,
      accentColor: '#2684FF',
      previewBg: 'bg-[#F8FAFD]',
      previewBorder: 'border-[#BFDBFE]',
      textColor: 'text-[#172B4D]',
      tagText: '☀️ Daylight AI Tech',
    },
    {
      id: 'black',
      title: 'Đen công nghệ',
      subtitle: 'Không gian số cyberpunk, vi mạch neon cyan & chống mỏi mắt',
      icon: Moon,
      accentColor: '#00E5FF',
      previewBg: 'bg-[#070B14]',
      previewBorder: 'border-[#00E5FF]/40',
      textColor: 'text-white',
      tagText: '🌙 Cyber Obsidian AI',
    },
    {
      id: 'auto',
      title: 'Tự động theo thiết bị',
      subtitle: 'Tự động đồng bộ giao diện theo cài đặt hệ điều hành (Sáng / Tối)',
      icon: Laptop,
      accentColor: '#8B5CF6',
      previewBg: 'bg-gradient-to-r from-[#F8FAFD] to-[#070B14]',
      previewBorder: 'border-[#C084FC]/40',
      textColor: 'text-[#172B4D]',
      tagText: '⚡ Dynamic Auto OS',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => setIsTechThemeModalOpen(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-[#0B132B] border border-[#BFDBFE] dark:border-[#00E5FF]/40 shadow-2xl p-6 sm:p-7 space-y-6 text-[#172B4D] dark:text-white transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E2EAF5] dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#2684FF] via-[#00E5FF] to-[#10B981] p-0.5 shadow-sm">
              <div className="w-full h-full rounded-[14px] bg-white dark:bg-[#070B14] flex items-center justify-center text-[#2684FF] dark:text-[#00E5FF]">
                <Cpu className="w-6 h-6 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#2684FF] dark:text-[#00E5FF]">
                  Tùy chỉnh thị giác
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EFF6FF] dark:bg-[#00E5FF]/20 text-[#2684FF] dark:text-[#00E5FF]">
                  Đang bật: {effectiveTheme === 'black' ? 'Đen công nghệ' : 'Trắng công nghệ'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black">
                Nền Công Nghệ THCS Mỹ Hòa
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsTechThemeModalOpen(false)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#64748B] hover:text-[#172B4D] dark:hover:text-white hover:bg-[#F1F5F9] dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Theme Options */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>Chọn chế độ nền công nghệ</span>
          </label>

          <div className="grid grid-cols-1 gap-3">
            {themes.map((item) => {
              const isSelected = techTheme === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTechTheme(item.id)}
                  className={`p-4 rounded-2xl border-2 transition-all text-left flex items-center justify-between cursor-pointer group ${
                    isSelected
                      ? 'border-[#2684FF] dark:border-[#00E5FF] bg-[#EFF6FF]/70 dark:bg-[#00E5FF]/10 shadow-sm'
                      : 'border-[#E2EAF5] dark:border-white/10 hover:border-[#BFDBFE] dark:hover:border-white/20 bg-white dark:bg-[#070B14]/60'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                        isSelected
                          ? 'bg-[#2684FF] dark:bg-[#00E5FF] text-white dark:text-[#070B14] shadow-xs'
                          : 'bg-[#F1F5F9] dark:bg-white/10 text-[#64748B] dark:text-slate-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-[#172B4D] dark:text-white">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-white/10 text-[#475569] dark:text-slate-300">
                          {item.tagText}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5 leading-relaxed">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 pl-2">
                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-[#2684FF] dark:bg-[#00E5FF] text-white dark:text-[#070B14] flex items-center justify-center shadow-xs">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-[#CBD5E1] dark:border-white/20 group-hover:border-[#94A3B8]" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Intensity Toggle */}
        <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-white/5 border border-[#E2EAF5] dark:border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#2684FF] dark:text-[#00E5FF]" />
              <span className="text-xs font-bold text-[#172B4D] dark:text-white">
                Mức độ hiển thị hiệu ứng vi mạch
              </span>
            </div>
            <span className="text-[11px] font-bold text-[#2684FF] dark:text-[#00E5FF]">
              {bgIntensity === 'vibrant' ? 'Rực rỡ (+90% nét)' : 'Tiêu chuẩn (Dịu mắt)'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setBgIntensity('subtle')}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                bgIntensity === 'subtle'
                  ? 'border-[#2684FF] dark:border-[#00E5FF] bg-white dark:bg-[#00E5FF]/20 text-[#2684FF] dark:text-[#00E5FF] shadow-xs'
                  : 'border-[#CBD5E1] dark:border-white/10 text-[#64748B] dark:text-slate-400 hover:bg-white dark:hover:bg-white/10'
              }`}
            >
              Tiêu chuẩn (Subtle)
            </button>
            <button
              type="button"
              onClick={() => setBgIntensity('vibrant')}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                bgIntensity === 'vibrant'
                  ? 'border-[#2684FF] dark:border-[#00E5FF] bg-white dark:bg-[#00E5FF]/20 text-[#2684FF] dark:text-[#00E5FF] shadow-xs'
                  : 'border-[#CBD5E1] dark:border-white/10 text-[#64748B] dark:text-slate-400 hover:bg-white dark:hover:bg-white/10'
              }`}
            >
              Rực rỡ (Vibrant)
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-[11px] text-[#64748B] dark:text-slate-400">
            Tự động lưu vào thiết bị của bạn.
          </p>
          <button
            type="button"
            onClick={() => setIsTechThemeModalOpen(false)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2684FF] to-[#1B6EE0] hover:from-[#1B6EE0] hover:to-[#1557B0] text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
          >
            Đã áp dụng xong
          </button>
        </div>
      </div>
    </div>
  );
};
