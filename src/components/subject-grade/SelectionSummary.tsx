import React from 'react';
import { SubjectId, GradeId } from '../../types';
import { SUBJECTS, GRADES, INITIAL_TOPICS, INITIAL_LESSONS } from '../../data/initialData';
import { BookOpen, Layers, CheckCircle2, AlertCircle } from 'lucide-react';

interface SelectionSummaryProps {
  gradeId: GradeId;
  subjectId: SubjectId;
}

export const SelectionSummary: React.FC<SelectionSummaryProps> = ({ gradeId, subjectId }) => {
  const subject = SUBJECTS.find((s) => s.id === subjectId);
  const grade = GRADES.find((g) => g.id === gradeId);

  const topicsCount = INITIAL_TOPICS.filter(
    (t) => t.subjectId === subjectId && t.gradeId === gradeId
  ).length;

  const lessonsCount = INITIAL_LESSONS.filter(
    (l) => l.subjectId === subjectId && l.gradeId === gradeId
  ).length;

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-[#EFF6FF] to-[#F0FDF4] border border-[#BFDBFE] space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#1E40AF] uppercase tracking-wider flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB]" />
          Xem trước lựa chọn của bạn
        </span>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white text-[#2563EB] shadow-xs">
          {grade?.name} · {subject?.name}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
        <div className="flex items-center gap-2 p-2 rounded-xl bg-white/80 border border-[#E2EAF5]">
          <Layers className="w-4 h-4 text-[#2684FF]" />
          <div>
            <div className="text-[10px] text-[#64748B]">Chủ đề có sẵn</div>
            <div className="font-bold text-[#172B4D]">
              {topicsCount > 0 ? `${topicsCount} chủ đề` : 'Chưa có chủ đề'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-xl bg-white/80 border border-[#E2EAF5]">
          <BookOpen className="w-4 h-4 text-[#22C55E]" />
          <div>
            <div className="text-[10px] text-[#64748B]">Bài học chi tiết</div>
            <div className="font-bold text-[#172B4D]">
              {lessonsCount > 0 ? `${lessonsCount} bài học` : 'Đang cập nhật'}
            </div>
          </div>
        </div>
      </div>

      {!subject?.hasContent && (
        <div className="flex items-center gap-1.5 text-xs text-[#B45309] bg-[#FFFBEB] p-2 rounded-xl border border-[#FDE68A]">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Môn học này đang trong quá trình biên soạn nội dung giáo án 2026–2027.</span>
        </div>
      )}
    </div>
  );
};
