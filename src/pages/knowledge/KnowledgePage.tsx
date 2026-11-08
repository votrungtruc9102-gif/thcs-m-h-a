import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  Search,
  CheckCircle,
  FileText,
  Lightbulb,
  HelpCircle,
  ChevronRight,
  ExternalLink,
  Download,
  SlidersHorizontal,
  Bookmark,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const KnowledgePage: React.FC = () => {
  const {
    currentSubject,
    currentGrade,
    filteredTopics,
    filteredLessons,
    filteredDocuments,
    openDrawer,
    setActiveTab,
  } = useApp();

  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    filteredTopics[0]?.id || ''
  );
  const [selectedLessonId, setSelectedLessonId] = useState<string>(
    filteredLessons[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});

  // Keep active topic and lesson in sync when list changes
  React.useEffect(() => {
    if (filteredTopics.length > 0 && !filteredTopics.some((t) => t.id === selectedTopicId)) {
      setSelectedTopicId(filteredTopics[0].id);
    }
  }, [filteredTopics, selectedTopicId]);

  // Active topic or fallback
  const activeTopic =
    filteredTopics.find((t) => t.id === selectedTopicId) || filteredTopics[0];

  // Lessons belonging to active topic
  const activeLessons = filteredLessons.filter((l) =>
    activeTopic ? l.topicId === activeTopic.id : true
  );

  React.useEffect(() => {
    if (activeLessons.length > 0 && !activeLessons.some((l) => l.id === selectedLessonId)) {
      setSelectedLessonId(activeLessons[0].id);
    }
  }, [activeLessons, selectedLessonId]);

  // Active lesson
  const activeLesson =
    activeLessons.find((l) => l.id === selectedLessonId) || activeLessons[0] || filteredLessons[0];

  // Documents attached to this topic
  const topicDocs = filteredDocuments.filter(
    (d) => d.topicId === activeTopic?.id || d.lessonId === activeLesson?.id
  );

  const toggleAnswer = (idx: number) => {
    setRevealedAnswers((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-[#E2EAF5] shadow-xs">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: currentSubject.bgLight, color: currentSubject.color }}
          >
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2684FF]">
                Kho kiến thức trọng tâm
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#2684FF] border border-[#BFDBFE]">
                {currentSubject.name} · {currentGrade.name}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#172B4D] mt-0.5">
              Tài liệu & Bài học chuẩn THCS Mỹ Hòa
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={openDrawer}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F8FAFC] border border-[#BFDBFE] hover:border-[#2684FF] text-xs font-bold text-[#2684FF] cursor-pointer transition-all self-start sm:self-auto"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Đổi môn & khối</span>
        </button>
      </div>

      {filteredTopics.length === 0 ? (
        /* Empty state if subject has no data yet */
        <div className="p-12 text-center rounded-3xl bg-white border border-[#E2EAF5] shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-[#EFF6FF] text-[#2684FF] mx-auto flex items-center justify-center">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-[#172B4D]">
            Môn {currentSubject.name} ({currentGrade.name}) đang được biên soạn nội dung
          </h2>
          <p className="text-sm text-[#64748B] max-w-md mx-auto">
            Hệ thống đang ưu tiên cập nhật hoàn chỉnh chương trình Tin học THCS. Bạn có thể chuyển sang môn Tin học để trải nghiệm toàn bộ bài học và trắc nghiệm.
          </p>
          <button
            type="button"
            onClick={openDrawer}
            className="px-5 py-2.5 rounded-xl bg-[#2684FF] hover:bg-[#1A6DDF] text-white font-semibold text-sm cursor-pointer shadow-sm"
          >
            Mở cửa sổ chọn Môn & Khối
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Topic List & Lesson Selector */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 rounded-2xl bg-white border border-[#E2EAF5] shadow-xs">
              <h2 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#2684FF]" />
                Danh mục chủ đề ({filteredTopics.length})
              </h2>

              <div className="space-y-1.5">
                {filteredTopics.map((topic, index) => {
                  const isSelected = activeTopic?.id === topic.id;
                  const topicLessons = filteredLessons.filter((l) => l.topicId === topic.id);

                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => {
                        setSelectedTopicId(topic.id);
                        if (topicLessons[0]) setSelectedLessonId(topicLessons[0].id);
                      }}
                      className={`w-full p-3 rounded-xl text-left transition-all duration-150 flex items-start gap-2.5 cursor-pointer ${
                        isSelected
                          ? 'bg-[#EFF6FF] border border-[#BFDBFE] text-[#2684FF] shadow-xs font-bold'
                          : 'hover:bg-[#F8FAFC] text-[#334155] border border-transparent'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                          isSelected ? 'bg-[#2684FF] text-white' : 'bg-[#F1F5F9] text-[#64748B]'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs truncate">{topic.title}</div>
                        <div className="text-[11px] font-normal text-[#64748B] mt-0.5">
                          {topicLessons.length} bài học có sẵn
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'translate-x-0.5 text-[#2684FF]' : 'text-[#CBD5E1]'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lessons within Selected Topic */}
            {activeLessons.length > 0 && (
              <div className="p-4 rounded-2xl bg-white border border-[#E2EAF5] shadow-xs">
                <h2 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#10B981]" />
                  Bài học trong chủ đề
                </h2>

                <div className="space-y-1.5">
                  {activeLessons.map((lesson) => {
                    const isSelected = activeLesson?.id === lesson.id;
                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => setSelectedLessonId(lesson.id)}
                        className={`w-full p-2.5 rounded-xl text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] font-bold'
                            : 'hover:bg-[#F8FAFC] text-[#475569]'
                        }`}
                      >
                        <span className="truncate pr-2">{lesson.title}</span>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Practice shortcut */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#EFF6FF] to-[#F5F3FF] border border-[#BFDBFE] space-y-2">
              <div className="text-xs font-bold text-[#1E40AF] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#2684FF]" />
                Luyện tập ngay sau khi học
              </div>
              <p className="text-xs text-[#64748B]">
                Củng cố kiến thức vừa đọc bằng bộ câu hỏi trắc nghiệm của chủ đề này.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('practice')}
                className="w-full py-2 px-3 rounded-xl bg-[#2684FF] hover:bg-[#1A6DDF] text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Làm bài trắc nghiệm</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column: Detailed Lesson Viewer */}
          <div className="lg:col-span-8">
            {activeLesson ? (
              <article className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E2EAF5] shadow-xs space-y-6">
                {/* Lesson Header */}
                <div className="border-b border-[#E2EAF5] pb-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-[#2684FF] uppercase tracking-wider">
                      {activeTopic?.title}
                    </span>
                    <div className="flex items-center gap-2">
                      {activeLesson.sourceBookTitle && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#2684FF] border border-[#BFDBFE]">
                          📖 Sách: {activeLesson.sourceBookTitle}
                        </span>
                      )}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]">
                        ✓ Đã xuất bản
                      </span>
                    </div>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#172B4D] leading-tight">
                    {activeLesson.title}
                  </h2>
                </div>

                {/* 1. Learning Objectives (Mục tiêu học tập) */}
                <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-2">
                  <h3 className="text-xs font-bold text-[#15803D] uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Mục tiêu bài học cần đạt
                  </h3>
                  <ul className="space-y-1.5 text-xs text-[#166534]">
                    {activeLesson.objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="font-bold shrink-0">•</span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 2. Core Knowledge (Nội dung kiến thức trọng tâm) */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-[#172B4D] uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#2684FF]" />
                    Kiến thức trọng tâm
                  </h3>
                  <div className="text-sm text-[#334155] leading-relaxed whitespace-pre-line bg-[#F8FAFC] p-5 rounded-2xl border border-[#E2EAF5] font-sans">
                    {activeLesson.coreKnowledge.trim()}
                  </div>
                </div>

                {/* 3. Illustrative Examples (Ví dụ minh họa) */}
                {activeLesson.examples && activeLesson.examples.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-[#172B4D] uppercase tracking-wider flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-[#F59E0B]" />
                      Ví dụ minh họa thực tiễn
                    </h3>
                    <div className="space-y-2">
                      {activeLesson.examples.map((ex, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#92400E] leading-relaxed"
                        >
                          {ex}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Review Questions with Interactive Reveal (Câu hỏi ôn tập) */}
                {activeLesson.reviewQuestions && activeLesson.reviewQuestions.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-[#172B4D] uppercase tracking-wider flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-[#8B5CF6]" />
                      Câu hỏi tự kiểm tra kiến thức
                    </h3>
                    <div className="space-y-3">
                      {activeLesson.reviewQuestions.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-white border border-[#E2EAF5] hover:border-[#BFDBFE] transition-colors space-y-2"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-xs font-bold text-[#172B4D]">
                              Câu {idx + 1}: {item.question}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleAnswer(idx)}
                              className="text-[11px] font-bold text-[#2684FF] hover:underline shrink-0 cursor-pointer"
                            >
                              {revealedAnswers[idx] ? 'Ẩn đáp án' : 'Xem đáp án'}
                            </button>
                          </div>
                          {revealedAnswers[idx] && (
                            <div className="p-3 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-xs text-[#1E40AF] animate-in fade-in">
                              <strong>Hướng dẫn:</strong> {item.answer}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Attached Documents for this Topic/Lesson */}
                {topicDocs.length > 0 && (
                  <div className="pt-4 border-t border-[#E2EAF5] space-y-3">
                    <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-2">
                      <Download className="w-4 h-4 text-[#2684FF]" />
                      Tài liệu đính kèm từ giáo viên ({topicDocs.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {topicDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2EAF5] flex items-center justify-between text-xs"
                        >
                          <div className="truncate pr-2">
                            <div className="font-bold text-[#172B4D] truncate">{doc.title}</div>
                            <div className="text-[10px] text-[#64748B]">{doc.fileName}</div>
                          </div>
                          <span className="px-2 py-1 rounded bg-white text-[#2684FF] font-semibold text-[10px] uppercase border border-[#BFDBFE]">
                            {doc.fileType}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. References */}
                {activeLesson.references && (
                  <div className="pt-4 border-t border-[#F1F5F9] text-[11px] text-[#94A3B8]">
                    <span>Nguồn tham khảo: </span>
                    {activeLesson.references.join(' · ')}
                  </div>
                )}
              </article>
            ) : (
              <div className="p-12 text-center rounded-3xl bg-white border border-[#E2EAF5] text-xs text-[#64748B]">
                Vui lòng chọn bài học ở danh mục bên trái.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
