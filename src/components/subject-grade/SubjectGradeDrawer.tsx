import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { GradeId, SubjectId } from '../../types';
import { GradeSelector } from './GradeSelector';
import { SubjectSelector } from './SubjectSelector';
import { SelectionSummary } from './SelectionSummary';
import { DrawerActions } from './DrawerActions';
import { X, SlidersHorizontal, Sparkles } from 'lucide-react';

export const SubjectGradeDrawer: React.FC = () => {
  const {
    isDrawerOpen,
    closeDrawer,
    selectedGradeId,
    selectedSubjectId,
    setSubjectAndGrade,
  } = useApp();

  // Temporary staging state inside the drawer
  const [stagedGrade, setStagedGrade] = useState<GradeId>(selectedGradeId);
  const [stagedSubject, setStagedSubject] = useState<SubjectId>(selectedSubjectId);

  // Sync staging state whenever drawer opens
  useEffect(() => {
    if (isDrawerOpen) {
      setStagedGrade(selectedGradeId);
      setStagedSubject(selectedSubjectId);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen, selectedGradeId, selectedSubjectId]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        closeDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  if (!isDrawerOpen) return null;

  const handleApply = () => {
    setSubjectAndGrade(stagedSubject, stagedGrade);
    closeDrawer();
  };

  const handleCancel = () => {
    // Reset to current active
    setStagedGrade(selectedGradeId);
    setStagedSubject(selectedSubjectId);
    closeDrawer();
  };

  const isValid = Boolean(stagedGrade && stagedSubject);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
      className="fixed inset-0 z-50 flex justify-end"
    >
      {/* Blurred Backdrop */}
      <div
        onClick={handleCancel}
        className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
      />

      {/* Drawer Surface: bottom sheet on mobile, right slide on desktop */}
      <div
        className="relative z-10 w-full max-w-lg md:max-w-md lg:max-w-lg bg-white h-full md:h-screen shadow-2xl flex flex-col border-l border-[#E2EAF5] animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E2EAF5] bg-gradient-to-r from-white to-[#F8FAFC]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#2684FF]/10 text-[#2684FF] flex items-center justify-center">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <h2 id="drawer-title" className="text-lg font-bold text-[#172B4D] leading-tight">
                  Chọn môn học và khối lớp
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Lựa chọn nội dung phù hợp với chương trình học của bạn
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              aria-label="Đóng cửa sổ chọn môn và khối"
              className="w-8 h-8 rounded-full hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#172B4D] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Grade Selector Section */}
          <GradeSelector
            selectedGrade={stagedGrade}
            onSelectGrade={(g) => setStagedGrade(g)}
          />

          {/* Subject Selector Section */}
          <SubjectSelector
            selectedSubject={stagedSubject}
            onSelectSubject={(s) => setStagedSubject(s)}
          />

          {/* Selection Summary Section */}
          <SelectionSummary gradeId={stagedGrade} subjectId={stagedSubject} />
        </div>

        {/* Footer Actions */}
        <div className="p-5 sm:p-6 bg-white border-t border-[#E2EAF5]">
          <DrawerActions
            onCancel={handleCancel}
            onApply={handleApply}
            isValid={isValid}
          />
        </div>
      </div>
    </div>
  );
};
