import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lesson, Topic, ExtractedLesson, SubjectId, GradeId } from '../../types';
import { SUBJECTS, GRADES } from '../../data/initialData';
import {
  parseTextbookContent,
  convertExtractedLessonToLesson,
  SAMPLE_TEXTBOOK_DATA,
} from '../../utils/textbookParser';
import {
  BookOpen,
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Save,
  Send,
  Layers,
  ArrowRight,
  Plus,
  X,
  FileCheck,
  RotateCcw,
  Clock,
  ChevronRight,
  Search,
} from 'lucide-react';

export const TextbookProcessor: React.FC = () => {
  const {
    currentSubject,
    currentGrade,
    topics,
    addTopic,
    teacherAllLessons,
    addLesson,
    updateLesson,
    deleteLesson,
    publishLesson,
    unpublishLesson,
    batchImportLessons,
    setActiveTab,
  } = useApp();

  // Sub-view: 'upload' | 'review' | 'manage'
  const [subView, setSubView] = useState<'upload' | 'review' | 'manage'>('upload');

  // Input state
  const [bookTitle, setBookTitle] = useState('Sách giáo khoa Tin học 6');
  const [subjectId, setSubjectId] = useState<SubjectId>(currentSubject.id);
  const [gradeId, setGradeId] = useState<GradeId>(currentGrade.id as any);
  const [rawText, setRawText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Extracted lessons from parsing
  const [extractedLessons, setExtractedLessons] = useState<ExtractedLesson[]>([]);
  const [detectedTopics, setDetectedTopics] = useState<string[]>([]);
  const [activeExtractedIndex, setActiveExtractedIndex] = useState(0);

  // Feedback notifications
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Filter for Manage tab
  const [manageStatusFilter, setManageStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [manageSearch, setManageSearch] = useState('');

  // Editing existing lesson modal
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [previewingLesson, setPreviewingLesson] = useState<Lesson | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const showError = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(null), 5000);
  };

  // Handle local file read (supports txt, md, json, etc.)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    if (!bookTitle || bookTitle.includes('Kết nối tri thức')) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
      setBookTitle(`Tài liệu SGK: ${cleanName}`);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawText(content);
        showSuccess(`Đã đọc xong nội dung tệp "${file.name}" (${(file.size / 1024).toFixed(1)} KB)`);
      }
    };
    reader.onerror = () => {
      showError('Không thể đọc tệp văn bản. Vui lòng thử lại hoặc dán nội dung vào ô nhập.');
    };
    reader.readAsText(file);
  };

  // Load official sample textbook excerpt for 1-click test
  const handleLoadSample = () => {
    setRawText(SAMPLE_TEXTBOOK_DATA);
    setBookTitle('Sách giáo khoa Tin học 6 - Bài 4: An toàn thông tin');
    setSubjectId('tin_hoc');
    setGradeId('6');
    setUploadedFileName('SGK_TinHoc6_KetNoiTriThuc_Bai4.txt');
    showSuccess('Đã nạp văn bản mẫu SGK Tin học 6 chuẩn của Bộ GD&ĐT!');
  };

  // Trigger Parsing
  const handleStartParsing = () => {
    if (!rawText || rawText.trim().length < 20) {
      showError('Vui lòng nhập hoặc tải tệp nội dung sách giáo khoa (tối thiểu 20 ký tự).');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      try {
        const result = parseTextbookContent(rawText, bookTitle, subjectId, gradeId);
        if (result.lessons.length === 0) {
          showError('Không nhận diện được bài học nào. Vui lòng kiểm tra định dạng "Bài [số]: [Tên bài]".');
          setIsProcessing(false);
          return;
        }

        setExtractedLessons(result.lessons);
        setDetectedTopics(result.detectedTopics);
        setActiveExtractedIndex(0);
        setIsProcessing(false);
        setSubView('review');
        showSuccess(`Đã trích xuất thành công ${result.lessons.length} bài học và ${result.detectedTopics.length} chủ đề!`);
      } catch (err: any) {
        setIsProcessing(false);
        showError(`Lỗi xử lý tài liệu: ${err.message}`);
      }
    }, 600);
  };

  // Find or create topic ID for extracted topic
  const resolveTopicId = (topicTitle: string): string => {
    const existing = topics.find(
      (t) =>
        t.subjectId === subjectId &&
        t.gradeId === gradeId &&
        (t.title.toLowerCase().includes(topicTitle.toLowerCase()) ||
          topicTitle.toLowerCase().includes(t.title.toLowerCase()))
    );
    if (existing) return existing.id;

    // Create a new topic
    const newTopicId = `top_${subjectId}${gradeId}_${Date.now()}`;
    const newTopic: Topic = {
      id: newTopicId,
      subjectId,
      gradeId,
      title: topicTitle,
      description: `Chủ đề được tự động trích xuất từ sách giáo khoa ${bookTitle}`,
      order: topics.length + 1,
      icon: 'BookOpen',
    };
    addTopic(newTopic);
    return newTopicId;
  };

  // Save single extracted lesson as Draft or Published
  const handleSaveExtractedLesson = (index: number, status: 'draft' | 'published') => {
    const extracted = extractedLessons[index];
    if (!extracted) return;

    const topicId = resolveTopicId(extracted.topicTitle);
    const existingCount = teacherAllLessons.filter((l) => l.topicId === topicId).length;
    const lesson = convertExtractedLessonToLesson(
      extracted,
      topicId,
      subjectId,
      gradeId,
      existingCount + 1,
      status,
      uploadedFileName || 'SGK_Upload'
    );

    addLesson(lesson);

    // Update status in extracted lessons list
    setExtractedLessons((prev) =>
      prev.map((item, i) => (i === index ? { ...item, status } : item))
    );

    showSuccess(
      status === 'published'
        ? `Đã xuất bản bài học "${lesson.title}" lên Kho kiến thức!`
        : `Đã lưu bản nháp "${lesson.title}". Học sinh chưa thấy bài này.`
    );
  };

  // Publish all extracted lessons at once
  const handlePublishAll = () => {
    if (extractedLessons.length === 0) return;

    let count = 0;
    extractedLessons.forEach((extracted, idx) => {
      const topicId = resolveTopicId(extracted.topicTitle);
      const lesson = convertExtractedLessonToLesson(
        extracted,
        topicId,
        subjectId,
        gradeId,
        teacherAllLessons.length + idx + 1,
        'published',
        uploadedFileName || 'SGK_Upload'
      );
      addLesson(lesson);
      count++;
    });

    setExtractedLessons((prev) => prev.map((item) => ({ ...item, status: 'published' })));
    showSuccess(`Đã xuất bản toàn bộ ${count} bài học lên Kho kiến thức! Học sinh có thể học ngay.`);
    setSubView('manage');
  };

  // Update extracted lesson during review
  const handleUpdateActiveExtracted = (field: keyof ExtractedLesson, value: any) => {
    setExtractedLessons((prev) =>
      prev.map((item, i) => (i === activeExtractedIndex ? { ...item, [field]: value } : item))
    );
  };

  // Manage Lessons: filter by status and search
  const filteredTeacherLessons = teacherAllLessons.filter((l) => {
    const matchStatus =
      manageStatusFilter === 'all'
        ? true
        : manageStatusFilter === 'published'
        ? l.status === 'published' || !l.status
        : l.status === 'draft';
    const matchSearch =
      manageSearch.trim() === '' ||
      l.title.toLowerCase().includes(manageSearch.toLowerCase()) ||
      l.coreKnowledge.toLowerCase().includes(manageSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  const publishedCount = teacherAllLessons.filter((l) => l.status === 'published' || !l.status).length;
  const draftCount = teacherAllLessons.filter((l) => l.status === 'draft').length;

  return (
    <div className="space-y-6">
      {/* Toast Notifications */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] text-xs font-bold flex items-center justify-between shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
            <span>{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-[#166534] hover:opacity-75 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorToast && (
        <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FECDD3] text-[#991B1B] text-xs font-bold flex items-center justify-between shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
            <span>{errorToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorToast(null)}
            className="text-[#991B1B] hover:opacity-75 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Process Stepper Header */}
      <div className="p-5 rounded-3xl bg-white border border-[#E2EAF5] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F1F5F9] pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#2684FF]">
              Hệ thống xử lý sách giáo khoa tự động
            </span>
            <h2 className="text-lg font-black text-[#172B4D] mt-0.5">
              Từ Giáo viên tải SGK đến Học sinh đọc bài học
            </h2>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSubView('upload')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                subView === 'upload'
                  ? 'bg-[#2684FF] text-white shadow-xs'
                  : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9]'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>1. Tải & Trích xuất SGK</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (extractedLessons.length === 0) {
                  showError('Chưa có bài học nào được trích xuất. Hãy tải SGK trước.');
                  return;
                }
                setSubView('review');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                subView === 'review'
                  ? 'bg-[#2684FF] text-white shadow-xs'
                  : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9]'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>2. Duyệt & Chỉnh sửa ({extractedLessons.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSubView('manage')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                subView === 'manage'
                  ? 'bg-[#2684FF] text-white shadow-xs'
                  : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>3. Quản lý bài học ({teacherAllLessons.length})</span>
            </button>
          </div>
        </div>

        {/* 5-Step Visual Pipeline */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-4 text-[11px]">
          <div className="p-2.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF]">
            <div className="font-bold">Bước 1</div>
            <div className="truncate">Tải lên SGK / Giáo án</div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF]">
            <div className="font-bold">Bước 2</div>
            <div className="truncate">Hệ thống trích xuất</div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF]">
            <div className="font-bold">Bước 3</div>
            <div className="truncate">Giáo viên rà soát</div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E]">
            <div className="font-bold">Bước 4</div>
            <div className="truncate">Lưu bản nháp</div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534]">
            <div className="font-bold">Bước 5</div>
            <div className="truncate">Xuất bản cho Học sinh</div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* VIEW 1: UPLOAD & TEXTBOOK EXTRACTION                     */}
      {/* ======================================================== */}
      {subView === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          {/* Left: Input Form */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-[#E2EAF5] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#172B4D] flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#2684FF]" />
                Nhập hoặc tải tài liệu Sách giáo khoa
              </h3>
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-xs font-bold text-[#2684FF] hover:underline flex items-center gap-1 cursor-pointer bg-[#EFF6FF] px-2.5 py-1 rounded-lg border border-[#BFDBFE]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Nạp văn bản mẫu SGK Tin học 6</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-1">
                <label className="block font-bold text-[#64748B] mb-1">Môn học</label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-[#CBD5E1] bg-white font-semibold outline-none"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-1">
                <label className="block font-bold text-[#64748B] mb-1">Khối lớp</label>
                <select
                  value={gradeId}
                  onChange={(e) => setGradeId(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-[#CBD5E1] bg-white font-semibold outline-none"
                >
                  {GRADES.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-1">
                <label className="block font-bold text-[#64748B] mb-1">Năm học</label>
                <input
                  type="text"
                  disabled
                  value="2026–2027"
                  className="w-full p-2.5 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-[#64748B] font-semibold"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-bold text-[#64748B] mb-1">Tiêu đề sách / Tài liệu gốc</label>
              <input
                type="text"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                placeholder="Ví dụ: Sách giáo khoa Tin học 6 - Kết nối tri thức với cuộc sống"
                className="w-full p-2.5 rounded-xl border border-[#CBD5E1] font-semibold focus:border-[#2684FF] outline-none"
              />
            </div>

            {/* File Dropzone */}
            <div className="text-xs space-y-1.5">
              <label className="block font-bold text-[#64748B]">
                Chọn tệp văn bản từ máy tính (TXT, Markdown, DOCX, JSON, PDF)
              </label>
              <label className="border-2 border-dashed border-[#BFDBFE] hover:border-[#2684FF] bg-[#EFF6FF]/30 hover:bg-[#EFF6FF] p-5 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors block">
                <Upload className="w-7 h-7 text-[#2684FF] mb-1.5" />
                <span className="font-bold text-[#172B4D]">
                  {uploadedFileName ? `Tệp đã chọn: ${uploadedFileName}` : 'Nhấn để chọn tệp SGK từ máy tính'}
                </span>
                <span className="text-[10px] text-[#64748B] mt-0.5">
                  Hệ thống tự động đọc và phân tích cấu trúc bài học
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".txt,.md,.json,.docx,.pdf"
                />
              </label>
            </div>

            {/* Textarea for pasted text */}
            <div className="text-xs space-y-1">
              <label className="block font-bold text-[#64748B]">
                Hoặc dán trực tiếp nội dung văn bản sách giáo khoa vào đây:
              </label>
              <textarea
                rows={7}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Dán nội dung sách giáo khoa (ví dụ: Chủ đề 2... Bài 4: An toàn thông tin... Mục tiêu... Kiến thức trọng tâm... Câu hỏi ôn tập...)"
                className="w-full p-3 rounded-xl border border-[#CBD5E1] font-mono text-xs focus:border-[#2684FF] outline-none"
              />
              <div className="flex justify-between text-[11px] text-[#94A3B8]">
                <span>Độ dài văn bản: {rawText.length} ký tự</span>
                <span>Hỗ trợ định dạng chương, chủ đề và bài học chuẩn</span>
              </div>
            </div>

            <button
              type="button"
              disabled={isProcessing || rawText.trim().length === 0}
              onClick={handleStartParsing}
              className="w-full py-3.5 rounded-2xl bg-[#2684FF] hover:bg-[#1A6DDF] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang phân tích cấu trúc sách giáo khoa...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Bắt đầu phân tích & Trích xuất nội dung SGK</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Right: Architecture & Instructions */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#EFF6FF] via-white to-[#F0FDF4] border border-[#BFDBFE] shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2684FF] text-white flex items-center justify-center font-bold">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#172B4D]">Quy tắc nhận diện thông minh</h4>
                  <p className="text-xs text-[#64748B]">Bám sát chuẩn chương trình GDPT 2018</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-[#334155] leading-relaxed">
                <div className="p-3 rounded-xl bg-white border border-[#E2EAF5]">
                  <strong className="text-[#2684FF]">1. Chủ đề / Chương:</strong>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Nhận diện tiêu đề bắt đầu bằng: <code>Chủ đề [X]</code> hoặc <code>Chương [I-X]</code>.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#E2EAF5]">
                  <strong className="text-[#10B981]">2. Bài học:</strong>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Tách tự động từng bài bắt đầu bằng: <code>Bài [1-9]: [Tên bài]</code>.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#E2EAF5]">
                  <strong className="text-[#8B5CF6]">3. Cấu trúc bài:</strong>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Tự động bóc tách <em>Mục tiêu</em>, <em>Kiến thức trọng tâm</em>, <em>Ví dụ thực hành</em> và <em>Câu hỏi ôn tập</em>.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#E2EAF5]">
                  <strong className="text-[#D97706]">4. Kiểm soát chất lượng:</strong>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Giáo viên luôn có bước rà soát, chỉnh sửa nội dung và quyết định Lưu nháp hoặc Xuất bản cho học sinh.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Status Box */}
            <div className="p-5 rounded-3xl bg-white border border-[#E2EAF5] shadow-xs space-y-2 text-xs">
              <span className="font-bold text-[#64748B] uppercase tracking-wider text-[10px]">
                Hiện trạng Kho kiến thức môn {currentSubject.name} (Lớp {currentGrade.id})
              </span>
              <div className="flex items-center justify-between pt-1">
                <span>Số bài đã xuất bản (Học sinh thấy):</span>
                <strong className="text-[#16A34A]">{publishedCount} bài</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Số bài đang nháp (Chỉ giáo viên thấy):</span>
                <strong className="text-[#D97706]">{draftCount} bài</strong>
              </div>
              <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-2">
                <span>Tổng số chủ đề sẵn có:</span>
                <strong className="text-[#2684FF]">{topics.filter(t => t.subjectId === currentSubject.id && t.gradeId === currentGrade.id).length} chủ đề</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: REVIEW & EDIT EXTRACTED LESSONS                  */}
      {/* ======================================================== */}
      {subView === 'review' && extractedLessons.length > 0 && (
        <div className="space-y-6 animate-in fade-in">
          {/* Summary Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-[#EFF6FF] via-white to-[#F0FDF4] border border-[#BFDBFE] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#2684FF]">
                Bản xem trước nội dung trích xuất
              </div>
              <div className="text-base font-bold text-[#172B4D] mt-0.5">
                Đã nhận diện: {extractedLessons.length} bài học · {detectedTopics.length} chủ đề
              </div>
              <div className="text-xs text-[#64748B]">
                Nguồn tài liệu: {bookTitle}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePublishAll}
                className="px-4 py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Xuất bản tất cả ({extractedLessons.length})</span>
              </button>
            </div>
          </div>

          {/* Lesson Tabs Selection */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {extractedLessons.map((item, idx) => {
              const isActive = idx === activeExtractedIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveExtractedIndex(idx)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-[#2684FF] text-white shadow-xs'
                      : 'bg-white border border-[#E2EAF5] text-[#475569] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-lg text-[10px] flex items-center justify-center ${isActive ? 'bg-white/20' : 'bg-[#EFF6FF] text-[#2684FF]'}`}>
                    {idx + 1}
                  </span>
                  <span className="max-w-[200px] truncate">{item.title}</span>
                  {item.status === 'published' && (
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Lesson Review & Edit Form */}
          {extractedLessons[activeExtractedIndex] && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E2EAF5] shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2EAF5] pb-4">
                <div>
                  <span className="text-[11px] font-bold text-[#2684FF] uppercase tracking-wider">
                    {extractedLessons[activeExtractedIndex].topicTitle}
                  </span>
                  <h3 className="text-xl font-black text-[#172B4D] mt-0.5">
                    Rà soát & Biên tập bài học {activeExtractedIndex + 1}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveExtractedLesson(activeExtractedIndex, 'draft')}
                    className="px-4 py-2 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] text-[#92400E] font-bold text-xs flex items-center gap-1.5 hover:bg-[#FEF3C7] cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu bản nháp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveExtractedLesson(activeExtractedIndex, 'published')}
                    className="px-4 py-2 rounded-xl bg-[#2684FF] hover:bg-[#1A6DDF] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Xuất bản ngay</span>
                  </button>
                </div>
              </div>

              {/* Form Fields for Active Lesson */}
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[#64748B] mb-1">Tiêu đề bài học</label>
                  <input
                    type="text"
                    value={extractedLessons[activeExtractedIndex].title}
                    onChange={(e) => handleUpdateActiveExtracted('title', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#CBD5E1] font-bold text-sm focus:border-[#2684FF] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#64748B] mb-1">Chủ đề bài học</label>
                  <input
                    type="text"
                    value={extractedLessons[activeExtractedIndex].topicTitle}
                    onChange={(e) => handleUpdateActiveExtracted('topicTitle', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#CBD5E1] font-semibold focus:border-[#2684FF] outline-none"
                  />
                </div>

                {/* Objectives */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-[#15803D] uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mục tiêu bài học cần đạt ({extractedLessons[activeExtractedIndex].objectives.length})
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const current = extractedLessons[activeExtractedIndex].objectives;
                        handleUpdateActiveExtracted('objectives', [...current, 'Mục tiêu mới cần đạt']);
                      }}
                      className="text-[11px] font-bold text-[#16A34A] hover:underline cursor-pointer"
                    >
                      + Thêm mục tiêu
                    </button>
                  </div>
                  <div className="space-y-2">
                    {extractedLessons[activeExtractedIndex].objectives.map((obj, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="font-bold text-[#16A34A] shrink-0">•</span>
                        <input
                          type="text"
                          value={obj}
                          onChange={(e) => {
                            const updated = [...extractedLessons[activeExtractedIndex].objectives];
                            updated[i] = e.target.value;
                            handleUpdateActiveExtracted('objectives', updated);
                          }}
                          className="flex-1 p-2 rounded-lg border border-[#CBD5E1] focus:border-[#10B981] outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = extractedLessons[activeExtractedIndex].objectives.filter((_, idx) => idx !== i);
                            handleUpdateActiveExtracted('objectives', updated);
                          }}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Core Knowledge */}
                <div>
                  <label className="block font-bold text-[#1E40AF] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    Nội dung kiến thức trọng tâm
                  </label>
                  <textarea
                    rows={8}
                    value={extractedLessons[activeExtractedIndex].coreKnowledge}
                    onChange={(e) => handleUpdateActiveExtracted('coreKnowledge', e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#CBD5E1] font-sans leading-relaxed text-xs focus:border-[#2684FF] outline-none"
                  />
                </div>

                {/* Review Questions */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-[#7C3AED] uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      Câu hỏi tự kiểm tra & Ôn tập ({extractedLessons[activeExtractedIndex].reviewQuestions.length})
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const current = extractedLessons[activeExtractedIndex].reviewQuestions;
                        handleUpdateActiveExtracted('reviewQuestions', [
                          ...current,
                          { question: 'Câu hỏi mới?', answer: 'Hướng dẫn trả lời' },
                        ]);
                      }}
                      className="text-[11px] font-bold text-[#7C3AED] hover:underline cursor-pointer"
                    >
                      + Thêm câu hỏi
                    </button>
                  </div>
                  <div className="space-y-3">
                    {extractedLessons[activeExtractedIndex].reviewQuestions.map((q, i) => (
                      <div key={i} className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2EAF5] space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-[#172B4D]">Câu {i + 1}:</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = extractedLessons[activeExtractedIndex].reviewQuestions.filter((_, idx) => idx !== i);
                              handleUpdateActiveExtracted('reviewQuestions', updated);
                            }}
                            className="text-red-500 hover:text-red-700 text-[11px] cursor-pointer"
                          >
                            Xóa câu này
                          </button>
                        </div>
                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) => {
                            const updated = [...extractedLessons[activeExtractedIndex].reviewQuestions];
                            updated[i].question = e.target.value;
                            handleUpdateActiveExtracted('reviewQuestions', updated);
                          }}
                          placeholder="Nội dung câu hỏi ôn tập..."
                          className="w-full p-2 rounded-lg border border-[#CBD5E1] bg-white outline-none"
                        />
                        <input
                          type="text"
                          value={q.answer}
                          onChange={(e) => {
                            const updated = [...extractedLessons[activeExtractedIndex].reviewQuestions];
                            updated[i].answer = e.target.value;
                            handleUpdateActiveExtracted('reviewQuestions', updated);
                          }}
                          placeholder="Hướng dẫn trả lời hoặc đáp án gợi ý..."
                          className="w-full p-2 rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] text-[#1E40AF] outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 3: MANAGE LESSONS (PUBLISHED & DRAFTS)               */}
      {/* ======================================================== */}
      {subView === 'manage' && (
        <div className="space-y-5 animate-in fade-in">
          {/* Filter Bar */}
          <div className="p-5 rounded-3xl bg-white border border-[#E2EAF5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={manageSearch}
                onChange={(e) => setManageSearch(e.target.value)}
                placeholder="Tìm kiếm bài học..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#CBD5E1] text-xs focus:border-[#2684FF] outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[#64748B]">Trạng thái:</span>
              <button
                type="button"
                onClick={() => setManageStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  manageStatusFilter === 'all'
                    ? 'bg-[#172B4D] text-white'
                    : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9]'
                }`}
              >
                Tất cả ({teacherAllLessons.length})
              </button>
              <button
                type="button"
                onClick={() => setManageStatusFilter('published')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  manageStatusFilter === 'published'
                    ? 'bg-[#22C55E] text-white'
                    : 'bg-[#F0FDF4] text-[#166534] hover:bg-[#DCFCE7]'
                }`}
              >
                Đã xuất bản ({publishedCount})
              </button>
              <button
                type="button"
                onClick={() => setManageStatusFilter('draft')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  manageStatusFilter === 'draft'
                    ? 'bg-[#FFB020] text-white'
                    : 'bg-[#FFFBEB] text-[#92400E] hover:bg-[#FEF3C7]'
                }`}
              >
                Bản nháp ({draftCount})
              </button>
            </div>
          </div>

          {/* Lessons Table / Cards */}
          <div className="p-6 rounded-3xl bg-white border border-[#E2EAF5] shadow-xs space-y-4">
            {filteredTeacherLessons.length > 0 ? (
              <div className="divide-y divide-[#E2EAF5] space-y-4">
                {filteredTeacherLessons.map((lesson, idx) => {
                  const topic = topics.find((t) => t.id === lesson.topicId);
                  const isPublished = lesson.status === 'published' || !lesson.status;

                  return (
                    <div key={lesson.id} className="pt-4 first:pt-0 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-[#EFF6FF] text-[#2684FF] font-bold text-xs flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-bold text-[#64748B]">
                              {topic ? topic.title : 'Chủ đề'}
                            </span>
                            {isPublished ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0] flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Đã xuất bản (Học sinh đọc được)
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Bản nháp (Học sinh chưa thấy)
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-[#172B4D]">{lesson.title}</h4>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          {isPublished ? (
                            <button
                              type="button"
                              onClick={() => {
                                unpublishLesson(lesson.id);
                                showSuccess(`Đã chuyển bài "${lesson.title}" về Bản nháp. Học sinh sẽ không còn thấy bài này.`);
                              }}
                              className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                              title="Gỡ xuất bản để học sinh không nhìn thấy nữa"
                            >
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Gỡ xuất bản</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                publishLesson(lesson.id);
                                showSuccess(`Đã xuất bản bài "${lesson.title}"! Học sinh có thể đọc ngay trong Kho kiến thức.`);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-xs"
                              title="Xuất bản để học sinh đọc được ngay"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Xuất bản</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setPreviewingLesson(lesson)}
                            className="p-1.5 rounded-xl border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC] text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            title="Xem trước như học sinh"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Xem thử</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingLesson(lesson)}
                            className="p-1.5 rounded-xl text-[#2684FF] hover:bg-[#EFF6FF] text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            title="Chỉnh sửa nội dung"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Sửa</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Bạn có chắc chắn muốn xóa bài học "${lesson.title}"?`)) {
                                deleteLesson(lesson.id);
                                showSuccess(`Đã xóa bài học "${lesson.title}".`);
                              }
                            }}
                            className="p-1.5 rounded-xl text-red-500 hover:bg-red-50 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            title="Xóa bài học"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Xóa</span>
                          </button>
                        </div>
                      </div>

                      {/* Brief details */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-[#64748B]">
                        <div>• {lesson.objectives.length} mục tiêu cần đạt</div>
                        <div>• {lesson.reviewQuestions.length} câu hỏi tự kiểm tra</div>
                        <div>• Nguồn: {lesson.sourceBookTitle || 'Giáo trình THCS Mỹ Hòa'}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-[#64748B]">
                Không tìm thấy bài học nào phù hợp với bộ lọc hiện tại.
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- PREVIEW LESSON MODAL (AS STUDENT SEES) --- */}
      {previewingLesson && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div onClick={() => setPreviewingLesson(null)} className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-xs" />

          <div className="relative z-10 w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E2EAF5] max-h-[85vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2EAF5]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#2684FF] uppercase tracking-wider">
                  Xem trước bài học giao diện học sinh
                </span>
                {previewingLesson.status === 'draft' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
                    Bản nháp
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setPreviewingLesson(null)}
                className="w-8 h-8 rounded-full hover:bg-[#F1F5F9] text-[#64748B] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-xl font-black text-[#172B4D]">{previewingLesson.title}</h3>

            <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-1.5 text-xs text-[#166534]">
              <div className="font-bold uppercase tracking-wider text-[11px]">Mục tiêu bài học:</div>
              {previewingLesson.objectives.map((obj, i) => (
                <div key={i}>• {obj}</div>
              ))}
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="font-bold text-[#172B4D] uppercase tracking-wider text-[11px]">Kiến thức trọng tâm:</div>
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2EAF5] leading-relaxed whitespace-pre-line text-[#334155]">
                {previewingLesson.coreKnowledge}
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="font-bold text-[#7C3AED] uppercase tracking-wider text-[11px]">Câu hỏi củng cố:</div>
              {previewingLesson.reviewQuestions.map((q, i) => (
                <div key={i} className="p-3 rounded-xl bg-white border border-[#E2EAF5] space-y-1">
                  <div className="font-bold text-[#172B4D]">Câu {i + 1}: {q.question}</div>
                  <div className="text-[11px] text-[#2684FF]">Gợi ý: {q.answer}</div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPreviewingLesson(null)}
                className="px-5 py-2.5 rounded-xl bg-[#2684FF] text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Đóng xem thử
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT EXISTING LESSON MODAL --- */}
      {editingLesson && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div onClick={() => setEditingLesson(null)} className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-xs" />

          <div className="relative z-10 w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E2EAF5] max-h-[85vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2EAF5]">
              <h3 className="text-sm font-bold text-[#172B4D]">
                Chỉnh sửa bài học: {editingLesson.title}
              </h3>
              <button
                type="button"
                onClick={() => setEditingLesson(null)}
                className="w-8 h-8 rounded-full hover:bg-[#F1F5F9] text-[#64748B] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block font-bold text-[#64748B] mb-1">Tiêu đề bài học</label>
              <input
                type="text"
                value={editingLesson.title}
                onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[#CBD5E1] font-bold text-sm focus:border-[#2684FF] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#64748B] mb-1">Nội dung kiến thức trọng tâm</label>
              <textarea
                rows={6}
                value={editingLesson.coreKnowledge}
                onChange={(e) => setEditingLesson({ ...editingLesson, coreKnowledge: e.target.value })}
                className="w-full p-3 rounded-xl border border-[#CBD5E1] font-sans leading-relaxed text-xs focus:border-[#2684FF] outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E2EAF5]">
              <button
                type="button"
                onClick={() => setEditingLesson(null)}
                className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-[#475569] font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  updateLesson(editingLesson);
                  setEditingLesson(null);
                  showSuccess(`Đã cập nhật bài học "${editingLesson.title}". Học sinh sẽ thấy nội dung mới!`);
                }}
                className="px-5 py-2 rounded-xl bg-[#2684FF] text-white font-bold cursor-pointer shadow-xs"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
