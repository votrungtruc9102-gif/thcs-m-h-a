import React from 'react';
import { useApp } from '../../context/AppContext';
import { BookOpen, ChevronRight, Sparkles } from 'lucide-react';

interface SubjectGradeTriggerProps {
  className?: string;
}

export const SubjectGradeTrigger: React.FC<SubjectGradeTriggerProps> = ({ className = '' }) => {
  const { openDrawer, currentSubject, currentGrade } = useApp();

  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-label={`Chọn môn và khối: hiện tại là ${currentSubject.name}, ${currentGrade.name}`}
      className={`group relative flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white border border-[#BFDBFE] hover:border-[#2684FF] shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer text-left ${className}`}
    >
      {/* Icon with glowing aura */}
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2684FF] to-[#22C7E8] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
        <BookOpen className="w-4 h-4" />
      </div>

      {/* Label and current selection */}
      <div className="flex flex-col min-w-0 pr-1">
        <span className="text-[10px] uppercase font-bold text-[#2684FF] tracking-wider leading-none">
          Chọn môn & khối
        </span>
        <div className="flex items-center gap-1.5 mt-0.5 font-bold text-xs text-[#172B4D] truncate">
          <span>{currentSubject.name}</span>
          <span className="text-[#94A3B8]">·</span>
          <span className="text-[#2563EB] bg-[#EFF6FF] px-1.5 py-0.2 rounded font-semibold text-[11px]">
            {currentGrade.name}
          </span>
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#2684FF] group-hover:translate-x-0.5 transition-all shrink-0 ml-auto" />
    </button>
  );
};
