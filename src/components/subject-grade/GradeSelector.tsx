import React from 'react';
import { GradeId } from '../../types';
import { GRADES } from '../../data/initialData';
import { useApp } from '../../context/AppContext';
import { GraduationCap, Award, Sparkles, Compass, Check, Lock } from 'lucide-react';

interface GradeSelectorProps {
  selectedGrade: GradeId;
  onSelectGrade: (grade: GradeId) => void;
}

const ICONS = {
  GraduationCap,
  Award,
  Sparkles,
  Compass,
};

export const GradeSelector: React.FC<GradeSelectorProps> = ({ selectedGrade, onSelectGrade }) => {
  const { currentUser } = useApp();
  const isStudent = currentUser?.role === 'student' && !!currentUser.gradeId;
  const studentGradeId = currentUser?.gradeId;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-[#172B4D] uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#2684FF]" />
          1. Chọn Khối lớp
        </label>
        <span className="text-xs text-[#64748B]">Năm học 2026–2027</span>
      </div>

      {isStudent && (
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-[#1E40AF] flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#2684FF] shrink-0" />
          <span>
            Em đang học <strong>Lớp {currentUser.className}</strong> (Khối {currentUser.gradeId}).
            Hệ thống tự động đồng bộ chương trình đúng khối lớp của em.
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {GRADES.map((grade) => {
          const isSelected = selectedGrade === grade.id;
          const IconComponent = ICONS[grade.icon as keyof typeof ICONS] || GraduationCap;
          const isLockedForStudent = isStudent && grade.id !== studentGradeId;

          return (
            <button
              key={grade.id}
              type="button"
              disabled={isLockedForStudent}
              onClick={() => !isLockedForStudent && onSelectGrade(grade.id as GradeId)}
              className={`relative flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 text-center transition-all duration-200 ${
                isLockedForStudent
                  ? 'border-[#E2EAF5] bg-[#F8FAFC] text-[#94A3B8] opacity-60 cursor-not-allowed'
                  : isSelected
                  ? 'border-[#2684FF] bg-[#EFF6FF] text-[#2684FF] shadow-sm ring-2 ring-[#2684FF]/20 scale-[1.02] cursor-pointer'
                  : 'border-[#E2EAF5] bg-white text-[#172B4D] hover:border-[#BFDBFE] hover:bg-[#F8FAFC] cursor-pointer'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#2684FF] text-white flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
              {isLockedForStudent && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#E2EAF5] text-[#94A3B8] flex items-center justify-center">
                  <Lock className="w-2.5 h-2.5" />
                </div>
              )}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 transition-colors ${
                  isSelected ? 'bg-[#2684FF] text-white shadow-sm' : 'bg-[#F1F5F9] text-[#64748B]'
                }`}
              >
                <IconComponent className="w-5 h-5" />
              </div>
              <span className="font-bold text-base leading-tight">{grade.name}</span>
              <span className="text-[11px] text-[#64748B] mt-0.5 line-clamp-1">{grade.badge}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
