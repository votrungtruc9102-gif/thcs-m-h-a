import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Question, DocumentItem, CognitiveLevel, SubjectId, GradeId, SchoolClass } from '../../types';
import { SUBJECTS, GRADES, INITIAL_TOPICS } from '../../data/initialData';
import { SUPPORTED_CLASSES } from '../../utils/cryptoAuth';
import {
  validateQuestion,
  detectDuplicateQuestions,
  countCognitiveLevels,
  formatFileSize,
  parseQuestionsFromJSON,
} from '../../utils/quizRules';
import { TextbookProcessor } from '../../components/teacher/TextbookProcessor';
import { GameManagementModule } from '../../components/teacher/GameManagementModule';
import {
  ShieldCheck,
  HelpCircle,
  FileText,
  Upload,
  Plus,
  Trash2,
  Edit3,
  Search,
  Filter,
  Download,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Printer,
  Copy,
  Layers,
  Sparkles,
  X,
  FileSpreadsheet,
  BookOpen,
  Users,
  Lock,
  Unlock,
  GraduationCap,
  UserCheck,
  Gamepad2,
  Globe,
} from 'lucide-react';

export const TeacherPortal: React.FC = () => {
  const {
    isTeacherAuthenticated,
    setIsTeacherAuthenticated,
    currentUser,
    accounts,
    updateStudentClass,
    toggleAccountLock,
    deleteStudentAccount,
    openAuthModal,
    logout,
    setIsAuthModalOpen,
    setActiveTab,
    questionBank,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    importQuestionsBatch,
    documents,
    addDocument,
    deleteDocument,
    currentSubject,
    currentGrade,
  } = useApp();

  // Active sub-module inside Teacher Portal: defaults to textbook & lesson management
  const [activeModule, setActiveModule] = useState<'textbook' | 'students' | 'games' | 'bank' | 'exam' | 'docs'>('textbook');

  // --- STUDENT MANAGEMENT STATE ---
  const [studentFilterClass, setStudentFilterClass] = useState<'all' | SchoolClass>('all');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentNotice, setStudentNotice] = useState<string | null>(null);

  // --- QUESTION BANK STATE ---
  const [bankSearch, setBankSearch] = useState('');
  const [bankSubject, setBankSubject] = useState<SubjectId>(currentSubject.id);
  const [bankGrade, setBankGrade] = useState<GradeId>(currentGrade.id as any);
  const [bankLevel, setBankLevel] = useState<string>('all');

  // Add / Edit Question Modal
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [qContent, setQContent] = useState('');
  const [qCode, setQCode] = useState('');
  const [qOptionA, setQOptionA] = useState('');
  const [qOptionB, setQOptionB] = useState('');
  const [qOptionC, setQOptionC] = useState('');
  const [qOptionD, setQOptionD] = useState('');
  const [qCorrect, setQCorrect] = useState('A');
  const [qExplanation, setQExplanation] = useState('');
  const [qCognitive, setQCognitive] = useState<CognitiveLevel>('nhan_biet');
  const [qTopic, setQTopic] = useState('');
  const [qFormErrors, setQFormErrors] = useState<string[]>([]);
  const [qDuplicateWarning, setQDuplicateWarning] = useState<string | null>(null);

  // Import JSON Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importReport, setImportReport] = useState<{ count: number; errors: string[] } | null>(null);

  // --- EXAM BUILDER STATE ---
  const [examSubject, setExamSubject] = useState<SubjectId>(currentSubject.id);
  const [examGrade, setExamGrade] = useState<GradeId>(currentGrade.id as any);
  const [examTitle, setExamTitle] = useState('Đề kiểm tra định kỳ Học kỳ I - Năm học 2026-2027');
  const [examTime, setExamTime] = useState(45);
  const [selectedExamQIds, setSelectedExamQIds] = useState<string[]>([]);
  const [isExamPreviewOpen, setIsExamPreviewOpen] = useState(false);

  // --- DOCUMENT UPLOAD STATE ---
  const [docTitle, setDocTitle] = useState('');
  const [docSubject, setDocSubject] = useState<SubjectId>(currentSubject.id);
  const [docGrade, setDocGrade] = useState<GradeId>(currentGrade.id as any);
  const [docNotes, setDocNotes] = useState('');
  const [docSource, setDocSource] = useState('Tổ Chuyên môn THCS Mỹ Hòa');
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);

  if (!isTeacherAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-3xl bg-white border border-[#E2EAF5] shadow-xs text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-[#F5F3FF] text-[#7C3AED] mx-auto flex items-center justify-center">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#172B4D]">Khu vực dành riêng cho Giáo viên</h2>
        <p className="text-xs text-[#64748B]">
          Vui lòng đăng nhập với tài khoản Giáo viên trường THCS Mỹ Hòa để truy cập hệ thống xử lý SGK, quản lý ngân hàng câu hỏi và tạo đề thi.
        </p>
        <button
          type="button"
          onClick={() => openAuthModal('teacher')}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#6D28D9] hover:to-[#5B21B6] text-white font-bold text-sm cursor-pointer shadow-xs transition-all"
        >
          Đăng nhập Giáo viên ngay
        </button>
      </div>
    );
  }

  // Filtered Question Bank
  const filteredBank = questionBank.filter((q) => {
    const matchSubject = q.subjectId === bankSubject;
    const matchGrade = q.gradeId === bankGrade;
    const matchLevel = bankLevel === 'all' || q.cognitiveLevel === bankLevel;
    const matchSearch =
      bankSearch.trim() === '' ||
      q.content.toLowerCase().includes(bankSearch.toLowerCase()) ||
      q.code.toLowerCase().includes(bankSearch.toLowerCase());
    return matchSubject && matchGrade && matchLevel && matchSearch;
  });

  const cognitiveStats = countCognitiveLevels(filteredBank);

  // Handle open Add Question
  const handleOpenAddQuestion = () => {
    setEditingQuestion(null);
    setQCode(`TH${bankGrade}_${Date.now().toString().slice(-3)}`);
    setQContent('');
    setQOptionA('');
    setQOptionB('');
    setQOptionC('');
    setQOptionD('');
    setQCorrect('A');
    setQExplanation('');
    setQCognitive('nhan_biet');
    setQTopic(INITIAL_TOPICS.find((t) => t.subjectId === bankSubject && t.gradeId === bankGrade)?.id || '');
    setQFormErrors([]);
    setQDuplicateWarning(null);
    setIsQuestionModalOpen(true);
  };

  // Handle open Edit Question
  const handleOpenEditQuestion = (q: Question) => {
    setEditingQuestion(q);
    setQCode(q.code);
    setQContent(q.content);
    setQOptionA(q.options[0]?.text || '');
    setQOptionB(q.options[1]?.text || '');
    setQOptionC(q.options[2]?.text || '');
    setQOptionD(q.options[3]?.text || '');
    setQCorrect(q.correctAnswer);
    setQExplanation(q.explanation);
    setQCognitive(q.cognitiveLevel);
    setQTopic(q.topicId);
    setQFormErrors([]);
    setQDuplicateWarning(null);
    setIsQuestionModalOpen(true);
  };

  // Check duplicate while typing question content
  const handleContentChange = (text: string) => {
    setQContent(text);
    if (text.length >= 8) {
      const dup = detectDuplicateQuestions(
        text,
        questionBank.filter((item) => (editingQuestion ? item.id !== editingQuestion.id : true))
      );
      if (dup.isDuplicate) {
        setQDuplicateWarning(`Lưu ý: Nội dung câu hỏi có thể trùng lặp với câu trong hệ thống!`);
      } else {
        setQDuplicateWarning(null);
      }
    } else {
      setQDuplicateWarning(null);
    }
  };

  // Save question
  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const candidate: Question = {
      id: editingQuestion ? editingQuestion.id : `q_${Date.now()}`,
      code: qCode.trim() || `Q_${Date.now().toString().slice(-4)}`,
      content: qContent.trim(),
      options: [
        { id: 'A', text: qOptionA.trim() },
        { id: 'B', text: qOptionB.trim() },
        { id: 'C', text: qOptionC.trim() },
        { id: 'D', text: qOptionD.trim() },
      ],
      correctAnswer: qCorrect,
      explanation: qExplanation.trim(),
      subjectId: bankSubject,
      gradeId: bankGrade,
      topicId: qTopic || 'general',
      cognitiveLevel: qCognitive,
      source: 'Giáo viên THCS Mỹ Hòa cập nhật',
    };

    const val = validateQuestion(candidate);
    if (!val.isValid) {
      setQFormErrors(val.errors);
      return;
    }

    if (editingQuestion) {
      updateQuestion(candidate);
    } else {
      addQuestion(candidate);
    }
    setIsQuestionModalOpen(false);
  };

  // Export Question Bank to JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredBank, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `NganHangCauHoi_${bankSubject}_Lop${bankGrade}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON action
  const handleRunImport = () => {
    const result = parseQuestionsFromJSON(importJsonText, bankSubject, bankGrade);
    if (result.success && result.questions.length > 0) {
      const count = importQuestionsBatch(result.questions);
      setImportReport({ count, errors: result.errors });
      setImportJsonText('');
    } else {
      setImportReport({ count: 0, errors: result.errors });
    }
  };

  // Auto-generate exam question selection by cognitive level
  const handleAutoSelectExam = () => {
    const bankForExam = questionBank.filter((q) => q.subjectId === examSubject && q.gradeId === examGrade);
    const shuffled = [...bankForExam].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, 10).map((q) => q.id);
    setSelectedExamQIds(picked);
  };

  // Handle mock document upload
  const handleMockUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 25MB
    if (file.size > 25 * 1024 * 1024) {
      alert('Tệp vượt quá giới hạn 25MB cho phép.');
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    let fileType: DocumentItem['fileType'] = 'pdf';
    if (ext === 'docx' || ext === 'doc') fileType = 'docx';
    else if (ext === 'pptx' || ext === 'ppt') fileType = 'pptx';
    else if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') fileType = 'xlsx';
    else if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') fileType = 'image';
    else if (ext === 'json') fileType = 'json';

    const newDoc: DocumentItem = {
      id: `doc_${Date.now()}`,
      fileName: file.name,
      fileSize: file.size,
      fileType,
      title: docTitle.trim() || file.name,
      subjectId: docSubject,
      gradeId: docGrade,
      schoolYear: '2026-2027',
      source: docSource.trim() || 'Tổ bộ môn THCS Mỹ Hòa',
      notes: docNotes.trim() || 'Tài liệu bổ trợ giảng dạy và ôn tập',
      uploadedBy: 'Thầy / Cô (Tổ chuyên môn)',
      uploadedAt: new Date().toISOString(),
      status: 'teacher_verified',
    };

    addDocument(newDoc);
    setUploadSuccessMsg(`Tải lên thành công: ${file.name} (${formatFileSize(file.size)})`);
    setDocTitle('');
    setDocNotes('');
    setTimeout(() => setUploadSuccessMsg(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Portal Banner */}
      <div className="p-6 rounded-3xl bg-white border border-[#E2EAF5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7C3AED]">
                Khu vực Quản trị Chuyên môn
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]">
                Đã xác thực quyền Giáo viên
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#172B4D] mt-0.5">
              Hệ thống Quản lý Dạy học THCS Mỹ Hòa
            </h1>
            {currentUser && (
              <p className="text-xs text-[#64748B] mt-0.5">
                Giáo viên phụ trách: <span className="font-bold text-[#7C3AED]">{currentUser.name}</span> ({currentUser.subjectDepartment || 'Tổ Chuyên môn'})
              </p>
            )}
          </div>
        </div>

        {/* Portal submodules */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'textbook', label: 'Xử lý SGK & Bài học', icon: BookOpen },
            { id: 'students', label: 'Quản lý Học sinh theo Lớp', icon: Users },
            { id: 'games', label: 'Quản lý Trò chơi học tập', icon: Gamepad2 },
            { id: 'bank', label: 'Ngân hàng câu hỏi', icon: HelpCircle },
            { id: 'exam', label: 'Tạo đề kiểm tra', icon: FileCheck },
            { id: 'docs', label: 'Tài liệu giảng dạy', icon: Upload },
          ].map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeModule === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveModule(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isTabActive
                    ? 'bg-[#7C3AED] text-white shadow-xs'
                    : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setActiveTab('links')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer bg-[#EFF6FF] text-[#2684FF] border border-[#BFDBFE] hover:bg-[#DBEAFE]"
            title="Đến trang Quản lý Sách giáo khoa & Liên kết 2026–2027"
          >
            <Globe className="w-4 h-4" />
            <span>Quản lý Sách giáo khoa</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODULE 0: TEXTBOOK PROCESSOR & LESSON PUBLISHING         */}
      {/* ======================================================== */}
      {activeModule === 'textbook' && (
        <div className="animate-in fade-in">
          <TextbookProcessor />
        </div>
      )}

      {/* ======================================================== */}
      {/* MODULE: QUẢN LÝ TRÒ CHƠI HỌC TẬP                         */}
      {/* ======================================================== */}
      {activeModule === 'games' && (
        <div className="animate-in fade-in">
          <GameManagementModule />
        </div>
      )}

      {/* ======================================================== */}
      {/* MODULE: QUẢN LÝ HỌC SINH THEO LỚP                       */}
      {/* ======================================================== */}
      {activeModule === 'students' && (
        <div className="space-y-5 animate-in fade-in">
          {/* Top Info & Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div
              onClick={() => setStudentFilterClass('all')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                studentFilterClass === 'all'
                  ? 'bg-[#F5F3FF] border-[#7C3AED] shadow-xs ring-2 ring-[#7C3AED]/20'
                  : 'bg-white border-[#E2EAF5] hover:border-[#BFDBFE]'
              }`}
            >
              <span className="text-[11px] font-bold text-[#64748B] uppercase">Tất cả học sinh</span>
              <div className="text-2xl font-black text-[#172B4D] mt-1">
                {accounts.filter((a) => a.role === 'student').length}
              </div>
            </div>
            {SUPPORTED_CLASSES.map((cls) => {
              const count = accounts.filter((a) => a.role === 'student' && a.className === cls).length;
              return (
                <div
                  key={cls}
                  onClick={() => setStudentFilterClass(cls)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    studentFilterClass === cls
                      ? 'bg-[#EFF6FF] border-[#2684FF] shadow-xs ring-2 ring-[#2684FF]/20'
                      : 'bg-white border-[#E2EAF5] hover:border-[#BFDBFE]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#64748B] uppercase">Lớp {cls}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-[#2684FF]">
                      Khối {cls.charAt(0)}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-[#2684FF] mt-1">{count}</div>
                </div>
              );
            })}
          </div>

          {/* Filter, Search & Notice Bar */}
          <div className="p-5 rounded-3xl bg-white border border-[#E2EAF5] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  placeholder="Tìm theo họ tên hoặc tên tài khoản học sinh..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#CBD5E1] text-xs focus:border-[#2684FF] outline-none"
                />
              </div>

              {/* Class Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-[#64748B] mr-1">Lọc theo lớp:</span>
                <button
                  type="button"
                  onClick={() => setStudentFilterClass('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    studentFilterClass === 'all'
                      ? 'bg-[#2684FF] text-white shadow-xs'
                      : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2EAF5]'
                  }`}
                >
                  Tất cả các lớp
                </button>
                {SUPPORTED_CLASSES.map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setStudentFilterClass(cls)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                      studentFilterClass === cls
                        ? 'bg-[#2684FF] text-white shadow-xs'
                        : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2EAF5]'
                    }`}
                  >
                    Lớp {cls}
                  </button>
                ))}
              </div>
            </div>

            {studentNotice && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{studentNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStudentNotice(null)}
                  className="text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Student Table */}
          <div className="rounded-3xl bg-white border border-[#E2EAF5] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#F1F5F9] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#172B4D]">
                  Danh sách Học sinh {studentFilterClass !== 'all' ? `– Lớp ${studentFilterClass}` : '(Toàn trường)'}
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Mật khẩu được mã hóa an toàn và không hiển thị tại đây. Thầy/Cô có thể chuyển lớp hoặc khóa tài khoản học sinh.
                </p>
              </div>
              <span className="text-xs font-extrabold text-[#2684FF] bg-[#EFF6FF] px-2.5 py-1 rounded-lg">
                {
                  accounts
                    .filter((a) => a.role === 'student')
                    .filter((a) => studentFilterClass === 'all' || a.className === studentFilterClass)
                    .filter(
                      (a) =>
                        !studentSearchQuery.trim() ||
                        a.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
                        a.username.toLowerCase().includes(studentSearchQuery.toLowerCase())
                    ).length
                }{' '}
                học sinh
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2EAF5] text-[#64748B] font-bold">
                    <th className="py-3 px-4 w-12 text-center">STT</th>
                    <th className="py-3 px-4">Họ và tên học sinh</th>
                    <th className="py-3 px-4">Tên tài khoản</th>
                    <th className="py-3 px-4">Lớp hiện tại</th>
                    <th className="py-3 px-4">Khối học</th>
                    <th className="py-3 px-4">Ngày đăng ký</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {(() => {
                    const studentList = accounts
                      .filter((a) => a.role === 'student')
                      .filter((a) => studentFilterClass === 'all' || a.className === studentFilterClass)
                      .filter(
                        (a) =>
                          !studentSearchQuery.trim() ||
                          a.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
                          a.username.toLowerCase().includes(studentSearchQuery.toLowerCase())
                      );

                    if (studentList.length === 0) {
                      return (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-[#94A3B8]">
                            <GraduationCap className="w-10 h-10 mx-auto text-[#CBD5E1] mb-2" />
                            <p className="font-semibold text-sm text-[#64748B]">Không tìm thấy học sinh nào</p>
                            <p className="text-xs text-[#94A3B8] mt-1">
                              Học sinh có thể đăng ký tài khoản mới trực tiếp từ Cổng Học sinh với các lớp 6A5, 7A5, 8A5, 9A5.
                            </p>
                          </td>
                        </tr>
                      );
                    }

                    return studentList.map((st, index) => (
                      <tr key={st.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-3.5 px-4 text-center font-bold text-[#94A3B8]">{index + 1}</td>
                        <td className="py-3.5 px-4 font-bold text-[#172B4D]">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{st.avatar || '🎒'}</span>
                            <span>{st.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-[#2684FF]">{st.username}</td>
                        <td className="py-3.5 px-4">
                          <select
                            value={st.className || '6A5'}
                            onChange={(e) => {
                              updateStudentClass(st.id, e.target.value as SchoolClass);
                              setStudentNotice(`Đã chuyển lớp cho học sinh ${st.name} sang lớp ${e.target.value}`);
                            }}
                            className="font-bold text-xs px-2.5 py-1 rounded-lg border border-[#CBD5E1] bg-white text-[#172B4D] focus:border-[#2684FF] cursor-pointer"
                            title="Chọn lớp để chuyển lớp cho học sinh"
                          >
                            {SUPPORTED_CLASSES.map((c) => (
                              <option key={c} value={c}>
                                Lớp {c}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold px-2 py-0.5 rounded-md bg-[#EFF6FF] text-[#2684FF]">
                            Khối {st.className ? st.className.charAt(0) : '6'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[#64748B]">
                          {st.createdAt ? st.createdAt.split('T')[0] : 'Vừa đăng ký'}
                        </td>
                        <td className="py-3.5 px-4">
                          {st.isLocked ? (
                            <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                              <Lock className="w-3 h-3" />
                              <span>Tạm khóa</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                              <CheckCircle className="w-3 h-3" />
                              <span>Hoạt động</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                toggleAccountLock(st.id);
                                setStudentNotice(
                                  st.isLocked
                                    ? `Đã mở khóa tài khoản cho ${st.name}`
                                    : `Đã khóa tài khoản của ${st.name}`
                                );
                              }}
                              className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                                st.isLocked
                                  ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                                  : 'border-amber-300 text-amber-700 hover:bg-amber-50'
                              }`}
                              title={st.isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                            >
                              {st.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Thầy/Cô có chắc chắn muốn xóa tài khoản học sinh "${st.name}" không?`)) {
                                  deleteStudentAccount(st.id);
                                  setStudentNotice(`Đã xóa tài khoản học sinh ${st.name}`);
                                }
                              }}
                              className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs transition-colors cursor-pointer"
                              title="Xóa tài khoản"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODULE 1: QUESTION BANK (NGÂN HÀNG CÂU HỎI)              */}
      {/* ======================================================== */}
      {activeModule === 'bank' && (
        <div className="space-y-5 animate-in fade-in">
          {/* Controls & Filter Bar */}
          <div className="p-5 rounded-3xl bg-white border border-[#E2EAF5] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={bankSearch}
                  onChange={(e) => setBankSearch(e.target.value)}
                  placeholder="Tìm kiếm nội dung, mã câu hỏi..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#CBD5E1] text-xs focus:border-[#2684FF] outline-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(true)}
                  className="px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#475569] hover:bg-[#F8FAFC] flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Nhập JSON</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#475569] hover:bg-[#F8FAFC] flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Xuất JSON</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenAddQuestion}
                  className="px-4 py-2 rounded-xl bg-[#2684FF] hover:bg-[#1A6DDF] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Thêm câu hỏi mới</span>
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#F1F5F9] text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#64748B]">
                <Filter className="w-3.5 h-3.5" />
                <span>Bộ lọc:</span>
              </div>

              {/* Subject */}
              <select
                value={bankSubject}
                onChange={(e) => setBankSubject(e.target.value as any)}
                className="p-1.5 rounded-lg border border-[#CBD5E1] font-semibold text-[#172B4D] bg-white outline-none"
              >
                {SUBJECTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              {/* Grade */}
              <select
                value={bankGrade}
                onChange={(e) => setBankGrade(e.target.value as any)}
                className="p-1.5 rounded-lg border border-[#CBD5E1] font-semibold text-[#172B4D] bg-white outline-none"
              >
                {GRADES.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>

              {/* Cognitive level */}
              <select
                value={bankLevel}
                onChange={(e) => setBankLevel(e.target.value)}
                className="p-1.5 rounded-lg border border-[#CBD5E1] font-semibold text-[#172B4D] bg-white outline-none"
              >
                <option value="all">Tất cả mức độ</option>
                <option value="nhan_biet">Nhận biết ({cognitiveStats.nhan_biet})</option>
                <option value="thong_hieu">Thông hiểu ({cognitiveStats.thong_hieu})</option>
                <option value="van_dung">Vận dụng ({cognitiveStats.van_dung})</option>
                <option value="van_dung_cao">Vận dụng cao ({cognitiveStats.van_dung_cao})</option>
              </select>

              <span className="text-xs text-[#64748B] ml-auto font-medium">
                Tìm thấy <strong>{filteredBank.length}</strong> câu hỏi
              </span>
            </div>
          </div>

          {/* Question List Table */}
          <div className="p-6 rounded-3xl bg-white border border-[#E2EAF5] shadow-xs space-y-4">
            {filteredBank.length > 0 ? (
              <div className="divide-y divide-[#E2EAF5] space-y-4">
                {filteredBank.map((q, idx) => (
                  <div key={q.id} className="pt-4 first:pt-0 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#EFF6FF] text-[#2684FF] font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-[#172B4D]">{q.code}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F1F5F9] text-[#64748B]">
                          {q.cognitiveLevel === 'nhan_biet'
                            ? 'Nhận biết'
                            : q.cognitiveLevel === 'thong_hieu'
                            ? 'Thông hiểu'
                            : q.cognitiveLevel === 'van_dung'
                            ? 'Vận dụng'
                            : 'Vận dụng cao'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditQuestion(q)}
                          className="p-1.5 rounded-lg text-[#2684FF] hover:bg-[#EFF6FF] text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Sửa</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Bạn có chắc chắn muốn xóa câu hỏi ${q.code}?`)) {
                              deleteQuestion(q.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-xs font-bold text-[#172B4D]">{q.content}</p>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt) => (
                        <div
                          key={opt.id}
                          className={`p-2 rounded-lg border flex items-start gap-1.5 ${
                            opt.id === q.correctAnswer
                              ? 'bg-[#F0FDF4] border-[#86EFAC] text-[#15803D] font-bold'
                              : 'bg-[#F8FAFC] border-[#E2EAF5] text-[#475569]'
                          }`}
                        >
                          <span className="shrink-0">{opt.id}.</span>
                          <span>{opt.text}</span>
                        </div>
                      ))}
                    </div>

                    <div className="text-[11px] text-[#64748B]">
                      <strong>Giải thích: </strong>
                      {q.explanation}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-[#64748B]">
                Không tìm thấy câu hỏi phù hợp. Hãy nhấn <strong>+ Thêm câu hỏi mới</strong> để bắt đầu xây dựng ngân hàng đề!
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODULE 2: EXAM BUILDER (TẠO ĐỀ KIỂM TRA)                  */}
      {/* ======================================================== */}
      {activeModule === 'exam' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          {/* Left Config Panel */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-[#E2EAF5] shadow-xs space-y-5">
            <h2 className="text-base font-bold text-[#172B4D] flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[#2684FF]" />
              Thiết lập Đề kiểm tra trực tuyến
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#64748B] mb-1">Tên bài kiểm tra</label>
                <input
                  type="text"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold focus:border-[#2684FF] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#64748B] mb-1">Môn học</label>
                  <select
                    value={examSubject}
                    onChange={(e) => setExamSubject(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-[#CBD5E1] font-semibold bg-white outline-none"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#64748B] mb-1">Khối lớp</label>
                  <select
                    value={examGrade}
                    onChange={(e) => setExamGrade(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-[#CBD5E1] font-semibold bg-white outline-none"
                  >
                    {GRADES.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#64748B] mb-1">Thời gian làm bài (Phút)</label>
                <input
                  type="number"
                  value={examTime}
                  onChange={(e) => setExamTime(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-[#CBD5E1] font-semibold focus:border-[#2684FF] outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleAutoSelectExam}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#EFF6FF] text-[#2684FF] border border-[#BFDBFE] font-bold text-xs hover:bg-[#DBEAFE] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Tự động chọn câu theo ma trận đề</span>
                </button>
              </div>
            </div>

            {/* Exam Summary Box */}
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2EAF5] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Số câu đã chọn:</span>
                <strong className="text-[#172B4D]">{selectedExamQIds.length} câu</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Tổng điểm đề thi:</span>
                <strong className="text-[#22C55E]">10.0 điểm</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Điểm mỗi câu:</span>
                <strong className="text-[#2684FF]">
                  {selectedExamQIds.length > 0
                    ? `${(10 / selectedExamQIds.length).toFixed(2)} điểm`
                    : '0 điểm'}
                </strong>
              </div>
            </div>

            <button
              type="button"
              disabled={selectedExamQIds.length === 0}
              onClick={() => setIsExamPreviewOpen(true)}
              className="w-full py-3 rounded-2xl bg-[#2684FF] hover:bg-[#1A6DDF] text-white font-bold text-xs cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Xem trước bản in & Hướng dẫn chấm</span>
            </button>
          </div>

          {/* Right Question Picker */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-[#E2EAF5] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#172B4D] flex items-center justify-between">
              <span>Chọn câu hỏi từ Ngân hàng đề</span>
              <span className="text-xs text-[#2684FF]">
                Đã chọn {selectedExamQIds.length} câu
              </span>
            </h3>

            <div className="max-h-[500px] overflow-y-auto space-y-2.5 pr-1">
              {questionBank
                .filter((q) => q.subjectId === examSubject && q.gradeId === examGrade)
                .map((q) => {
                  const isChecked = selectedExamQIds.includes(q.id);
                  return (
                    <div
                      key={q.id}
                      onClick={() => {
                        setSelectedExamQIds((prev) =>
                          prev.includes(q.id) ? prev.filter((id) => id !== q.id) : [...prev, q.id]
                        );
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? 'border-[#2684FF] bg-[#EFF6FF]'
                          : 'border-[#E2EAF5] hover:border-[#BFDBFE]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-[#2684FF]"
                      />
                      <div className="flex-1 text-xs">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-[#172B4D]">{q.code}</span>
                          <span className="text-[10px] text-[#64748B]">
                            {q.cognitiveLevel === 'nhan_biet' ? 'Nhận biết' : 'Vận dụng'}
                          </span>
                        </div>
                        <p className="text-[#334155] font-medium leading-relaxed">{q.content}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODULE 3: DOCUMENT UPLOAD & MANAGER (TẢI TÀI LIỆU LÊN)    */}
      {/* ======================================================== */}
      {activeModule === 'docs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          {/* Upload Form Box */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-[#E2EAF5] shadow-xs space-y-5">
            <h2 className="text-base font-bold text-[#172B4D] flex items-center gap-2">
              <Upload className="w-5 h-5 text-[#2684FF]" />
              Tải tài liệu giảng dạy lên
            </h2>

            {uploadSuccessMsg && (
              <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#166534] font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#16A34A]" />
                <span>{uploadSuccessMsg}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#64748B] mb-1">Tiêu đề tài liệu</label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="Ví dụ: Đề cương ôn tập Học kỳ 1 Tin học 6"
                  className="w-full p-2.5 rounded-xl border border-[#CBD5E1] font-semibold focus:border-[#2684FF] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#64748B] mb-1">Môn học</label>
                  <select
                    value={docSubject}
                    onChange={(e) => setDocSubject(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-[#CBD5E1] font-semibold bg-white outline-none"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#64748B] mb-1">Khối lớp</label>
                  <select
                    value={docGrade}
                    onChange={(e) => setDocGrade(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-[#CBD5E1] font-semibold bg-white outline-none"
                  >
                    {GRADES.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#64748B] mb-1">Ghi chú & Hướng dẫn sử dụng</label>
                <textarea
                  rows={2}
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                  placeholder="Ghi chú cho học sinh hoặc đồng nghiệp..."
                  className="w-full p-2.5 rounded-xl border border-[#CBD5E1] focus:border-[#2684FF] outline-none"
                />
              </div>

              {/* Drag and Drop Zone / File selector */}
              <div>
                <label className="block font-bold text-[#64748B] mb-1">
                  Chọn tệp từ máy tính (Hỗ trợ PDF, DOCX, PPTX, XLSX, TXT, JSON, Ảnh)
                </label>
                <label className="border-2 border-dashed border-[#BFDBFE] hover:border-[#2684FF] bg-[#EFF6FF]/40 hover:bg-[#EFF6FF] p-6 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors block">
                  <Upload className="w-8 h-8 text-[#2684FF] mb-2" />
                  <span className="text-xs font-bold text-[#172B4D]">Nhấn để chọn tệp tải lên</span>
                  <span className="text-[10px] text-[#64748B] mt-0.5">Dung lượng tối đa 25MB</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleMockUpload}
                    accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.csv,.txt,.json,image/*"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Uploaded Documents List */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-[#E2EAF5] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#172B4D] flex items-center justify-between">
              <span>Kho tài liệu đã tải lên ({documents.length})</span>
              <span className="text-xs text-[#22C55E]">Đã kiểm duyệt chuyên môn</span>
            </h3>

            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2EAF5] flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#172B4D] truncate">{doc.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#2684FF] border border-[#BFDBFE] uppercase">
                        {doc.fileType}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      Tệp: {doc.fileName} · {formatFileSize(doc.fileSize)} · Lớp {doc.gradeId}
                    </div>
                    <div className="text-[10px] text-[#94A3B8]">
                      Người tải: {doc.uploadedBy} · {new Date(doc.uploadedAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => alert(`Đang chuẩn bị tải xuống: ${doc.fileName}`)}
                      className="p-2 rounded-xl border border-[#CBD5E1] text-[#475569] hover:bg-white cursor-pointer"
                      title="Tải về"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Xóa tài liệu "${doc.title}"?`)) {
                          deleteDocument(doc.id);
                        }
                      }}
                      className="p-2 rounded-xl text-red-500 hover:bg-red-50 cursor-pointer"
                      title="Xóa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- ADD / EDIT QUESTION MODAL --- */}
      {isQuestionModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={() => setIsQuestionModalOpen(false)}
            className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-xs"
          />

          <div className="relative z-10 w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#E2EAF5] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2EAF5]">
              <h3 className="font-bold text-base text-[#172B4D]">
                {editingQuestion ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới vào Ngân hàng'}
              </h3>
              <button
                type="button"
                onClick={() => setIsQuestionModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-[#F1F5F9] text-[#64748B] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="mt-4 space-y-4 text-xs">
              {qFormErrors.length > 0 && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 space-y-1">
                  {qFormErrors.map((err, i) => (
                    <div key={i}>• {err}</div>
                  ))}
                </div>
              )}

              {qDuplicateWarning && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{qDuplicateWarning}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#64748B] mb-1">Mã câu hỏi</label>
                  <input
                    type="text"
                    value={qCode}
                    onChange={(e) => setQCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#CBD5E1] font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#64748B] mb-1">Mức độ nhận thức</label>
                  <select
                    value={qCognitive}
                    onChange={(e) => setQCognitive(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-[#CBD5E1] font-semibold bg-white"
                  >
                    <option value="nhan_biet">Nhận biết</option>
                    <option value="thong_hieu">Thông hiểu</option>
                    <option value="van_dung">Vận dụng</option>
                    <option value="van_dung_cao">Vận dụng cao</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#64748B] mb-1">Nội dung câu hỏi</label>
                <textarea
                  rows={3}
                  value={qContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Nhập nội dung câu hỏi trắc nghiệm..."
                  className="w-full p-2.5 rounded-xl border border-[#CBD5E1] font-medium"
                />
              </div>

              {/* 4 Options */}
              <div className="space-y-2">
                <label className="block font-bold text-[#64748B]">Các phương án trả lời</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#2684FF]">A.</span>
                    <input
                      type="text"
                      value={qOptionA}
                      onChange={(e) => setQOptionA(e.target.value)}
                      placeholder="Phương án A"
                      className="w-full p-2 rounded-lg border border-[#CBD5E1]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#2684FF]">B.</span>
                    <input
                      type="text"
                      value={qOptionB}
                      onChange={(e) => setQOptionB(e.target.value)}
                      placeholder="Phương án B"
                      className="w-full p-2 rounded-lg border border-[#CBD5E1]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#2684FF]">C.</span>
                    <input
                      type="text"
                      value={qOptionC}
                      onChange={(e) => setQOptionC(e.target.value)}
                      placeholder="Phương án C"
                      className="w-full p-2 rounded-lg border border-[#CBD5E1]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#2684FF]">D.</span>
                    <input
                      type="text"
                      value={qOptionD}
                      onChange={(e) => setQOptionD(e.target.value)}
                      placeholder="Phương án D"
                      className="w-full p-2 rounded-lg border border-[#CBD5E1]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#64748B] mb-1">Đáp án đúng</label>
                  <select
                    value={qCorrect}
                    onChange={(e) => setQCorrect(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#CBD5E1] font-bold bg-white text-[#22C55E]"
                  >
                    <option value="A">Phương án A</option>
                    <option value="B">Phương án B</option>
                    <option value="C">Phương án C</option>
                    <option value="D">Phương án D</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#64748B] mb-1">Lời giải thích chi tiết</label>
                <textarea
                  rows={2}
                  value={qExplanation}
                  onChange={(e) => setQExplanation(e.target.value)}
                  placeholder="Giải thích lý do chọn đáp án này..."
                  className="w-full p-2.5 rounded-xl border border-[#CBD5E1]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2EAF5]">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#CBD5E1] font-semibold text-[#475569] cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2684FF] text-white font-bold cursor-pointer shadow-xs"
                >
                  Lưu vào Ngân hàng câu hỏi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- IMPORT JSON MODAL --- */}
      {isImportModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div onClick={() => setIsImportModalOpen(false)} className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-xs" />

          <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-[#E2EAF5] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2EAF5]">
              <h3 className="font-bold text-sm text-[#172B4D]">Nhập câu hỏi từ tệp JSON</h3>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-[#F1F5F9] text-[#64748B] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#64748B]">
              Dán nội dung JSON chứa mảng câu hỏi với định dạng tiêu chuẩn (id, content, options, correctAnswer, explanation).
            </p>

            <textarea
              rows={6}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='[{"content": "...", "options": [{"id": "A", "text": "..."}], "correctAnswer": "A"}]'
              className="w-full p-3 rounded-xl border border-[#CBD5E1] font-mono text-xs"
            />

            {importReport && (
              <div
                className={`p-3 rounded-xl text-xs ${
                  importReport.count > 0 ? 'bg-[#F0FDF4] text-[#166534]' : 'bg-red-50 text-red-700'
                }`}
              >
                {importReport.count > 0
                  ? `Đã nhập thành công ${importReport.count} câu hỏi vào hệ thống!`
                  : `Không thể nhập câu hỏi: ${importReport.errors.join('; ')}`}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-xs font-semibold text-[#475569] cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleRunImport}
                className="px-5 py-2 rounded-xl bg-[#2684FF] text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                Kiểm tra & Nhập dữ liệu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- EXAM PREVIEW & PRINT MODAL --- */}
      {isExamPreviewOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div onClick={() => setIsExamPreviewOpen(false)} className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-xs" />

          <div className="relative z-10 w-full max-w-3xl bg-white rounded-3xl p-8 shadow-2xl border border-[#E2EAF5] max-h-[90vh] overflow-y-auto space-y-6">
            {/* School Header */}
            <div className="border-b-2 border-dashed border-[#CBD5E1] pb-4 flex justify-between items-start text-xs text-[#172B4D]">
              <div>
                <div className="font-bold uppercase">PHÒNG GD&ĐT HUYỆN · TRƯỜNG THCS MỸ HÒA</div>
                <div className="font-medium text-[#64748B]">Năm học: 2026 – 2027</div>
              </div>
              <div className="text-right">
                <div className="font-bold uppercase">ĐỀ KIỂM TRA CHÍNH THỨC</div>
                <div className="font-medium text-[#64748B]">Thời gian làm bài: {examTime} phút</div>
              </div>
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-lg font-black uppercase text-[#172B4D]">{examTitle}</h2>
              <p className="text-xs text-[#64748B]">
                Môn: {SUBJECTS.find((s) => s.id === examSubject)?.name} – Khối: Lớp {examGrade}
              </p>
            </div>

            {/* Questions list */}
            <div className="space-y-4 text-xs">
              {questionBank
                .filter((q) => selectedExamQIds.includes(q.id))
                .map((q, idx) => (
                  <div key={q.id} className="space-y-1.5">
                    <p className="font-bold text-[#172B4D]">
                      Câu {idx + 1} ({((10 / selectedExamQIds.length)).toFixed(1)}đ): {q.content}
                    </p>
                    <div className="grid grid-cols-2 gap-2 pl-4">
                      {q.options.map((opt) => (
                        <div key={opt.id}>
                          <strong>{opt.id}.</strong> {opt.text}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>

            {/* Answer Key */}
            <div className="pt-4 border-t-2 border-dashed border-[#CBD5E1] space-y-2">
              <h4 className="font-bold text-xs uppercase text-[#172B4D]">Đáp án & Thang điểm:</h4>
              <div className="flex flex-wrap gap-2 text-xs">
                {questionBank
                  .filter((q) => selectedExamQIds.includes(q.id))
                  .map((q, idx) => (
                    <span
                      key={q.id}
                      className="px-2 py-1 rounded bg-[#EFF6FF] border border-[#BFDBFE] font-bold text-[#2684FF]"
                    >
                      Câu {idx + 1}: {q.correctAnswer}
                    </span>
                  ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsExamPreviewOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-xs font-semibold text-[#475569] cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-[#2684FF] text-white text-xs font-bold cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>In đề thi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
