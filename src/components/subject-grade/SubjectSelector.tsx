import React from 'react';
import { SubjectId } from '../../types';
import { SUBJECTS } from '../../data/initialData';
import {
  Laptop,
  Calculator,
  BookOpen,
  Languages,
  Atom,
  Compass,
  Cpu,
  ShieldCheck,
  Check,
  Clock,
} from 'lucide-react';

interface SubjectSelectorProps {
  selectedSubject: SubjectId;
  onSelectSubject: (subject: SubjectId) => void;
}

const SUBJECT_ICONS = {
  Laptop,
  Calculator,
  BookOpen,
  Languages,
  Atom,
  Compass,
  Cpu,
  ShieldCheck,
};

export const SubjectSelector: React.FC<SubjectSelectorProps> = ({
  selectedSubject,
  onSelectSubject,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-[#172B4D] uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#22C7E8]" />
          2. Chọn Môn học
        </label>
        <span className="text-xs text-[#2684FF] font-medium bg-[#EFF6FF] px-2 py-0.5 rounded-full">
          Ưu tiên: Tin học THCS
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5">
        {SUBJECTS.map((subject) => {
          const isSelected = selectedSubject === subject.id;
          const IconComponent =
            SUBJECT_ICONS[subject.iconName as keyof typeof SUBJECT_ICONS] || BookOpen;

          return (
            <button
              key={subject.id}
              type="button"
              onClick={() => onSelectSubject(subject.id)}
              className={`relative flex items-start p-3 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'border-[#2684FF] bg-[#EFF6FF] shadow-sm ring-2 ring-[#2684FF]/20'
                  : 'border-[#E2EAF5] bg-white hover:border-[#BFDBFE] hover:bg-[#F8FAFC]'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-[#2684FF] text-white flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}

              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mr-2.5 transition-transform"
                style={{
                  backgroundColor: subject.bgLight,
                  color: subject.color,
                  border: `1px solid ${subject.borderColor}`,
                }}
              >
                <IconComponent className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-[#172B4D] truncate">{subject.name}</span>
                </div>
                {!subject.hasContent ? (
                  <span className="inline-flex items-center gap-1 text-[10px] text-[#94A3B8] font-medium mt-0.5 bg-[#F1F5F9] px-1.5 py-0.5 rounded">
                    <Clock className="w-2.5 h-2.5" />
                    Đang cập nhật
                  </span>
                ) : (
                  <p className="text-[11px] text-[#64748B] line-clamp-1 mt-0.5">
                    {subject.id === 'tin_hoc' ? 'Đầy đủ bài học & đề thi' : 'Có dữ liệu ôn tập'}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
