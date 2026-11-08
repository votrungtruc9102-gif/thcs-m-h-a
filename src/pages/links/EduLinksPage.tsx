import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  EduLinkItem,
  EduLinkCategory,
  GradeId,
  EDU_SUBJECT_LIST,
  EduSubjectName,
} from '../../types';
import {
  saveTextbookFile,
  getTextbookFile,
  downloadDataUrl,
} from '../../utils/fileStorage';
import {
  Globe,
  BookOpen,
  ExternalLink,
  Search,
  Pin,
  CheckCircle2,
  Award,
  Filter,
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Building,
  GraduationCap,
  FileText,
  Compass,
  ArrowUpRight,
  ShieldCheck,
  X,
  Copy,
  Check,
  Upload,
  FileUp,
  Download,
  AlertCircle,
  Link as LinkIcon,
  Laptop,
} from 'lucide-react';

export const EduLinksPage: React.FC = () => {
  const {
    eduLinks,
    addEduLink,
    updateEduLink,
    deleteEduLink,
    toggleEduLinkPin,
    toggleEduLinkVisibility,
    recordEduLinkOpen,
    isTeacherAuthenticated,
    currentUser,
    effectiveTheme,
    currentGrade,
  } = useApp();

  const isDark = effectiveTheme === 'black';

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EduLinkCategory | 'all'>('textbooks');
  const [selectedGrade, setSelectedGrade] = useState<GradeId | 'all'>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  // Teacher Modals: 'none' | 'embed_link' | 'upload_file' | 'edit'
  const [activeModal, setActiveModal] = useState<'none' | 'embed_link' | 'upload_file' | 'edit'>('none');
  const [editingItem, setEditingItem] = useState<EduLinkItem | null>(null);

  // Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // ----------------------------------------------------
  // KHUNG A: FORM DATA FOR EMBEDDING TEXTBOOK LINK
  // ----------------------------------------------------
  const [embedForm, setEmbedForm] = useState<{
    title: string;
    subjectName: EduSubjectName;
    gradeId: GradeId | 'all';
    publisher: string;
    schoolYear: string;
    description: string;
    url: string;
    isPinned: boolean;
  }>({
    title: '',
    subjectName: 'Ngữ văn',
    gradeId: '6',
    publisher: 'Nhà xuất bản Giáo dục Việt Nam',
    schoolYear: '2026–2027',
    description: '',
    url: '',
    isPinned: false,
  });

  // Khung A: Link validation & testing state
  const [linkCheckStatus, setLinkCheckStatus] = useState<{
    tested: boolean;
    valid: boolean;
    message: string;
  }>({ tested: false, valid: false, message: '' });

  // ----------------------------------------------------
  // KHUNG B: FORM DATA FOR UPLOADING TEXTBOOK FILE
  // ----------------------------------------------------
  const [uploadForm, setUploadForm] = useState<{
    title: string;
    subjectName: EduSubjectName;
    gradeId: GradeId | 'all';
    publisher: string;
    schoolYear: string;
    description: string;
    isPinned: boolean;
    allowDownload: boolean;
  }>({
    title: '',
    subjectName: 'Ngữ văn',
    gradeId: '6',
    publisher: 'Nhà xuất bản Giáo dục Việt Nam',
    schoolYear: '2026–2027',
    description: '',
    isPinned: false,
    allowDownload: true,
  });

  // Khung B: File upload state
  const [uploadedFile, setUploadedFile] = useState<{
    file: File | null;
    name: string;
    sizeFormatted: string;
    rawSize: number;
    type: string;
    dataUrl: string;
  } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // PHẦN 1: Categories - Sách giáo khoa as primary
  const categories: Array<{ id: EduLinkCategory | 'all'; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'textbooks', label: 'Sách giáo khoa', icon: BookOpen },
    { id: 'all', label: 'Tất cả tài nguyên', icon: Compass },
    { id: 'official_portals', label: 'Bộ GD&ĐT & Sở GD&ĐT', icon: Building },
    { id: 'training_materials', label: 'Tập huấn giáo viên & Học liệu', icon: GraduationCap },
    { id: 'exam_references', label: 'Đề kiểm tra & Ôn tập', icon: FileText },
  ];

  const gradeOptions: Array<{ id: GradeId | 'all'; label: string }> = [
    { id: 'all', label: 'Tất cả khối' },
    { id: '6', label: 'Khối 6' },
    { id: '7', label: 'Khối 7' },
    { id: '8', label: 'Khối 8' },
    { id: '9', label: 'Khối 9' },
  ];

  // Filter links (WITHOUT ANY BOOK SERIES FILTER)
  const filteredLinks = useMemo(() => {
    return eduLinks.filter((item) => {
      // Non-teachers only see visible items
      if (!isTeacherAuthenticated && !item.isVisible) return false;

      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

      // Grade filter: show items matching selected grade OR available for 'all'
      if (selectedGrade !== 'all') {
        const itemGrade = item.gradeId || 'all';
        if (itemGrade !== 'all' && itemGrade !== selectedGrade) {
          return false;
        }
      }

      // Subject filter (13 subjects)
      if (selectedSubject !== 'all') {
        const itemSubj = item.subjectName || '';
        if (itemSubj.toLowerCase() !== selectedSubject.toLowerCase()) {
          // If category is not textbooks and doesn't have subjectName, allow general portals if 'all'
          if (item.category === 'textbooks') return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchDesc = item.description.toLowerCase().includes(query);
        const matchPublisher = item.publisher?.toLowerCase().includes(query);
        const matchSubj = item.subjectName?.toLowerCase().includes(query);
        return matchTitle || matchDesc || matchPublisher || matchSubj;
      }

      return true;
    });
  }, [eduLinks, selectedCategory, selectedGrade, selectedSubject, searchQuery, isTeacherAuthenticated]);

  // Separate pinned vs standard
  const pinnedLinks = useMemo(() => {
    return filteredLinks.filter((l) => l.isPinned);
  }, [filteredLinks]);

  const regularLinks = useMemo(() => {
    return filteredLinks.filter((l) => !l.isPinned);
  }, [filteredLinks]);

  // Mandatory Spotlight: Ngữ văn 6 – Tập một
  const featuredNguVan6 = useMemo(() => {
    return eduLinks.find(
      (l) =>
        l.id === 'link-ngu-van-6-tap-1' ||
        l.url.includes('ngu-van-6-tap-mot-939788653.939788653')
    );
  }, [eduLinks]);

  // Handle open textbook
  const handleOpenLink = async (link: EduLinkItem) => {
    recordEduLinkOpen(link.id);

    // If it is an uploaded file
    if (link.entryType === 'file' || (!link.url.startsWith('http') && link.fileDataUrl)) {
      let targetData = link.fileDataUrl;
      if (!targetData && link.fileStorageId) {
        const record = await getTextbookFile(link.fileStorageId);
        if (record) targetData = record.dataUrl;
      }

      if (targetData) {
        const newWin = window.open();
        if (newWin) {
          newWin.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>${link.title} – THCS Mỹ Hòa</title>
                <style>
                  body { margin: 0; padding: 0; background: #070B14; font-family: sans-serif; display: flex; flex-direction: column; height: 100vh; }
                  header { background: #0F172A; color: #fff; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1E293B; }
                  h1 { font-size: 16px; margin: 0; font-weight: bold; }
                  .btn { background: #2684FF; color: #fff; border: none; padding: 6px 14px; border-radius: 8px; font-weight: bold; cursor: pointer; text-decoration: none; font-size: 13px; }
                  iframe { flex: 1; width: 100%; border: none; }
                </style>
              </head>
              <body>
                <header>
                  <h1>${link.title} (${link.fileName || 'Tài liệu Sách giáo khoa'})</h1>
                  <a href="${targetData}" download="${link.fileName || 'tai-lieu.pdf'}" class="btn">Tải tệp xuống</a>
                </header>
                <iframe src="${targetData}" allowfullscreen></iframe>
              </body>
            </html>
          `);
          return;
        }
      }
    }

    // Open external URL in a clean new tab
    if (link.url && link.url.startsWith('http')) {
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Handle download file
  const handleDownloadFile = async (link: EduLinkItem) => {
    let dataUrl = link.fileDataUrl;
    if (!dataUrl && link.fileStorageId) {
      const record = await getTextbookFile(link.fileStorageId);
      if (record) dataUrl = record.dataUrl;
    }

    if (dataUrl) {
      downloadDataUrl(dataUrl, link.fileName || `${link.title}.pdf`);
      showToast(`Đang tải xuống tệp: ${link.fileName || link.title}`);
    } else if (link.url && link.url.startsWith('http')) {
      window.open(link.url, '_blank');
    }
  };

  // Handle copy link
  const handleCopyLink = (link: EduLinkItem) => {
    const targetUrl = link.url || window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(targetUrl).then(() => {
        setCopiedId(link.id);
        showToast(`Đã sao chép liên kết "${link.title}" vào bộ nhớ tạm!`);
        setTimeout(() => setCopiedId(null), 2500);
      }).catch(() => {
        showToast(`Liên kết: ${targetUrl}`);
      });
    } else {
      showToast(`Liên kết: ${targetUrl}`);
    }
  };

  // ----------------------------------------------------
  // KHUNG A ACTIONS: EMBED URL
  // ----------------------------------------------------
  const handleOpenEmbedModal = () => {
    setEmbedForm({
      title: '',
      subjectName: 'Ngữ văn',
      gradeId: '6',
      publisher: 'Nhà xuất bản Giáo dục Việt Nam',
      schoolYear: '2026–2027',
      description: '',
      url: '',
      isPinned: false,
    });
    setLinkCheckStatus({ tested: false, valid: false, message: '' });
    setActiveModal('embed_link');
  };

  const handleTestEmbedLink = () => {
    const rawUrl = embedForm.url.trim();
    if (!rawUrl) {
      setLinkCheckStatus({
        tested: true,
        valid: false,
        message: 'Vui lòng dán đường link sách giáo khoa cần kiểm tra.',
      });
      return;
    }

    // Validate URL format
    const urlPattern = /^(https?:\/\/)([\w.-]+)+(:\d+)?(\/.*)?$/i;
    if (!urlPattern.test(rawUrl)) {
      setLinkCheckStatus({
        tested: true,
        valid: false,
        message: 'Đường link không đúng định dạng. Phải bắt đầu bằng https:// hoặc http://',
      });
      return;
    }

    setLinkCheckStatus({
      tested: true,
      valid: true,
      message: '✓ Định dạng URL hợp lệ, giao thức an toàn. Sẵn sàng nhúng vào hệ thống!',
    });
  };

  const handlePreviewEmbedLink = () => {
    const rawUrl = embedForm.url.trim();
    if (!rawUrl) {
      showToast('Vui lòng dán đường link trước khi xem trước.');
      return;
    }
    window.open(rawUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSaveEmbedLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!embedForm.title.trim()) {
      showToast('Vui lòng nhập tên sách giáo khoa.');
      return;
    }
    if (!embedForm.url.trim()) {
      showToast('Vui lòng nhập đường link URL của sách giáo khoa.');
      return;
    }

    const urlPattern = /^(https?:\/\/)/i;
    if (!urlPattern.test(embedForm.url.trim())) {
      showToast('Đường link phải bắt đầu bằng https:// hoặc http://');
      return;
    }

    const newLink: EduLinkItem = {
      id: `textbook-link-${Date.now()}`,
      title: embedForm.title.trim(),
      description: embedForm.description.trim() || `Sách giáo khoa môn ${embedForm.subjectName} năm học ${embedForm.schoolYear}`,
      url: embedForm.url.trim(),
      category: 'textbooks',
      entryType: 'link',
      gradeId: embedForm.gradeId,
      subjectName: embedForm.subjectName,
      publisher: embedForm.publisher.trim() || 'Nhà xuất bản Giáo dục Việt Nam',
      schoolYear: embedForm.schoolYear.trim() || '2026–2027',
      isPinned: embedForm.isPinned,
      isOfficial: true,
      badgeText: embedForm.gradeId === 'all' ? 'Tất cả khối' : `Khối ${embedForm.gradeId}`,
      addedBy: currentUser?.name || 'Giáo viên THCS Mỹ Hòa',
      createdAt: new Date().toISOString(),
      isVisible: true,
      openCount: 0,
    };

    addEduLink(newLink);
    showToast(`Đã nhúng sách giáo khoa "${newLink.title}" thành công!`);
    setActiveModal('none');
  };

  // ----------------------------------------------------
  // KHUNG B ACTIONS: UPLOAD TEXTBOOK FILE
  // ----------------------------------------------------
  const handleOpenUploadModal = () => {
    setUploadForm({
      title: '',
      subjectName: 'Ngữ văn',
      gradeId: '6',
      publisher: 'Nhà xuất bản Giáo dục Việt Nam',
      schoolYear: '2026–2027',
      description: '',
      isPinned: false,
      allowDownload: true,
    });
    setUploadedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    setActiveModal('upload_file');
  };

  const processSelectedFile = (file: File) => {
    const validExtensions = ['.pdf', '.docx', '.doc', '.epub'];
    const lowerName = file.name.toLowerCase();
    const isSupported = validExtensions.some((ext) => lowerName.endsWith(ext));

    if (!isSupported) {
      showToast('Định dạng tệp không được hỗ trợ. Vui lòng chọn tệp PDF, DOCX hoặc EPUB.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      showToast('Tệp quá lớn. Dung lượng tối đa là 50MB.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);

    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 90);
        setUploadProgress(percent);
      }
    };

    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const sizeMB = file.size / (1024 * 1024);
      const sizeFormatted = sizeMB >= 1 ? `${sizeMB.toFixed(2)} MB` : `${(file.size / 1024).toFixed(0)} KB`;

      setUploadedFile({
        file,
        name: file.name,
        sizeFormatted,
        rawSize: file.size,
        type: file.type || 'application/pdf',
        dataUrl,
      });

      // Auto fill title if empty
      setUploadForm((prev) => ({
        ...prev,
        title: prev.title || file.name.replace(/\.[^/.]+$/, ''),
      }));

      setUploadProgress(100);
      setIsUploading(false);
      showToast(`Đã nạp tệp "${file.name}" (${sizeFormatted}) sẵn sàng lưu!`);
    };

    reader.onerror = () => {
      setIsUploading(false);
      showToast('Đã xảy ra lỗi khi đọc tệp. Vui lòng thử lại.');
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleSaveUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.title.trim()) {
      showToast('Vui lòng nhập tên sách giáo khoa.');
      return;
    }
    if (!uploadedFile) {
      showToast('Vui lòng chọn hoặc kéo thả tệp sách giáo khoa vào khung.');
      return;
    }

    const fileStorageId = `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    // Save actual file data in IndexedDB for persistent real website storage
    await saveTextbookFile({
      id: fileStorageId,
      name: uploadedFile.name,
      type: uploadedFile.type,
      size: uploadedFile.rawSize,
      dataUrl: uploadedFile.dataUrl,
      savedAt: new Date().toISOString(),
    });

    const newLink: EduLinkItem = {
      id: `textbook-file-${Date.now()}`,
      title: uploadForm.title.trim(),
      description: uploadForm.description.trim() || `Tệp sách giáo khoa ${uploadedFile.name} môn ${uploadForm.subjectName}`,
      url: uploadedFile.dataUrl,
      category: 'textbooks',
      entryType: 'file',
      gradeId: uploadForm.gradeId,
      subjectName: uploadForm.subjectName,
      publisher: uploadForm.publisher.trim() || 'Nhà xuất bản Giáo dục Việt Nam',
      schoolYear: uploadForm.schoolYear.trim() || '2026–2027',
      fileName: uploadedFile.name,
      fileSize: uploadedFile.sizeFormatted,
      fileStorageId,
      allowDownload: uploadForm.allowDownload,
      isPinned: uploadForm.isPinned,
      isOfficial: true,
      badgeText: 'Tệp SGK Tải Lên',
      addedBy: currentUser?.name || 'Giáo viên THCS Mỹ Hòa',
      createdAt: new Date().toISOString(),
      isVisible: true,
      openCount: 0,
    };

    addEduLink(newLink);
    showToast(`Đã lưu tệp sách giáo khoa "${newLink.title}" vào kho lưu trữ!`);
    setActiveModal('none');
  };

  // ----------------------------------------------------
  // EDIT EXISTING ITEM
  // ----------------------------------------------------
  const handleOpenEditModal = (item: EduLinkItem) => {
    setEditingItem(item);
    setActiveModal('edit');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    updateEduLink(editingItem);
    showToast('Đã cập nhật thông tin sách giáo khoa thành công!');
    setActiveModal('none');
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa sách giáo khoa / tài liệu "${title}"?`)) {
      deleteEduLink(id);
      showToast('Đã xóa tài liệu khỏi hệ thống.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#0B132B] text-white border border-[#00E5FF] shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-200">
          <Sparkles className="w-5 h-5 text-[#00E5FF]" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. HERO HEADER: SÁCH GIÁO KHOA & LIÊN KẾT GIÁO DỤC 2026–2027 */}
      {/* ======================================================== */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#0B132B] border border-[#BFDBFE] dark:border-[#00E5FF]/30 shadow-md">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-gradient-to-br from-[#2684FF]/20 via-[#00E5FF]/20 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-gradient-to-tr from-[#10B981]/15 via-[#2684FF]/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF6FF] dark:bg-[#00E5FF]/15 text-[#2684FF] dark:text-[#00E5FF] text-xs font-extrabold uppercase tracking-wider border border-[#BFDBFE] dark:border-[#00E5FF]/30">
                <BookOpen className="w-3.5 h-3.5" />
                Sách Giáo Khoa THCS Mỹ Hòa
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F0FDF4] dark:bg-[#10B981]/20 text-[#15803D] dark:text-[#34D399] text-[11px] font-bold border border-[#BBF7D0] dark:border-[#10B981]/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Năm học 2026–2027
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#172B4D] dark:text-white tracking-tight leading-tight">
              SÁCH GIÁO KHOA & LIÊN KẾT GIÁO DỤC 2026–2027
            </h1>

            <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-300 leading-relaxed">
              Kho tài nguyên <strong className="text-[#2684FF] dark:text-[#00E5FF]">Sách giáo khoa điện tử</strong> và tài liệu chính thức theo 13 môn học dành cho học sinh THCS Mỹ Hòa các khối 6, 7, 8 và 9.
            </p>
          </div>

          {/* Quick Stats Banner */}
          <div className="flex items-center gap-3 bg-[#F8FAFC] dark:bg-white/5 p-3.5 rounded-2xl border border-[#E2EAF5] dark:border-white/10 shrink-0">
            <div className="text-center px-3 border-r border-[#CBD5E1] dark:border-white/10">
              <span className="block text-lg font-black text-[#2684FF] dark:text-[#00E5FF]">13</span>
              <span className="text-[10px] text-[#64748B] dark:text-slate-400">Môn học</span>
            </div>
            <div className="text-center px-3 border-r border-[#CBD5E1] dark:border-white/10">
              <span className="block text-lg font-black text-[#10B981]">4</span>
              <span className="text-[10px] text-[#64748B] dark:text-slate-400">Khối lớp (6–9)</span>
            </div>
            <div className="text-center px-3">
              <span className="block text-lg font-black text-[#F59E0B]">{eduLinks.length}</span>
              <span className="text-[10px] text-[#64748B] dark:text-slate-400">Tài liệu</span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. KHU VỰC QUẢN LÝ DÀNH CHO GIÁO VIÊN: HAI KHUNG RIÊNG BIỆT */}
      {/* ======================================================== */}
      {isTeacherAuthenticated && (
        <section className="p-6 rounded-3xl bg-gradient-to-r from-[#EFF6FF] via-[#F8FAFC] to-[#ECFEFF] dark:from-[#0B132B] dark:via-[#0F1E3D] dark:to-[#08182B] border-2 border-[#2684FF] dark:border-[#00E5FF]/40 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#BFDBFE] dark:border-white/10">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#2684FF] dark:text-[#00E5FF]" />
              <h2 className="text-base font-black text-[#172B4D] dark:text-white uppercase tracking-wider">
                Khu Vực Quản Lý Sách Giáo Khoa (Dành Cho Giáo Viên)
              </h2>
            </div>
            <span className="text-xs font-semibold text-[#2684FF] dark:text-[#00E5FF] bg-white dark:bg-white/10 px-3 py-1 rounded-full border border-[#BFDBFE] dark:border-white/10">
              GV: {currentUser?.name || 'Đặng Văn Thắng'}
            </span>
          </div>

          <p className="text-xs text-[#475569] dark:text-slate-300">
            Thầy cô vui lòng chọn một trong hai phương thức độc lập dưới đây để bổ sung sách giáo khoa cho học sinh:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* KHUNG A TRIGGER */}
            <div
              onClick={handleOpenEmbedModal}
              className="group p-5 rounded-2xl bg-white dark:bg-[#070B14] border-2 border-[#BFDBFE] hover:border-[#2684FF] dark:border-white/15 dark:hover:border-[#00E5FF] shadow-xs hover:shadow-md cursor-pointer transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] dark:bg-[#00E5FF]/10 text-[#2684FF] dark:text-[#00E5FF] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <LinkIcon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#EFF6FF] text-[#2684FF] dark:bg-[#00E5FF]/20 dark:text-[#00E5FF]">
                    Cách A: Nhập URL
                  </span>
                </div>
                <h3 className="font-extrabold text-sm text-[#172B4D] dark:text-white group-hover:text-[#2684FF] dark:group-hover:text-[#00E5FF]">
                  A. NHÚNG ĐƯỜNG LINK SÁCH GIÁO KHOA
                </h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1 leading-relaxed">
                  Nhập địa chỉ URL sách giáo khoa điện tử từ các trang chính thống (NXB Giáo Dục Việt Nam, taphuan.nxbgd.vn...). Có nút kiểm tra liên kết và xem trước.
                </p>
              </div>

              <div className="pt-3 border-t border-[#F1F5F9] dark:border-white/10 flex items-center justify-between text-xs font-bold text-[#2684FF] dark:text-[#00E5FF]">
                <span>Mở khung nhúng link</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            {/* KHUNG B TRIGGER */}
            <div
              onClick={handleOpenUploadModal}
              className="group p-5 rounded-2xl bg-white dark:bg-[#070B14] border-2 border-[#BBF7D0] hover:border-[#10B981] dark:border-white/15 dark:hover:border-[#10B981] shadow-xs hover:shadow-md cursor-pointer transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] dark:bg-[#10B981]/10 text-[#10B981] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <FileUp className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#F0FDF4] text-[#15803D] dark:bg-[#10B981]/20 dark:text-[#34D399]">
                    Cách B: Tải File Lên
                  </span>
                </div>
                <h3 className="font-extrabold text-sm text-[#172B4D] dark:text-white group-hover:text-[#10B981] dark:group-hover:text-[#34D399]">
                  B. TẢI TỆP SÁCH GIÁO KHOA LÊN WEBSITE
                </h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1 leading-relaxed">
                  Tải trực tiếp tệp sách từ máy tính hoặc điện thoại (PDF, DOCX, EPUB) với tính năng kéo thả, xem dung lượng và lưu trữ bền vững.
                </p>
              </div>

              <div className="pt-3 border-t border-[#F1F5F9] dark:border-white/10 flex items-center justify-between text-xs font-bold text-[#10B981] dark:text-[#34D399]">
                <span>Mở khung tải tệp lên</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* 3. MANDATORY SPOTLIGHT: NGỮ VĂN 6 – TẬP MỘT             */}
      {/* ======================================================== */}
      {featuredNguVan6 && (
        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-[#EFF6FF] via-white to-[#F0FDFA] dark:from-[#0B132B] dark:via-[#0F1E3D] dark:to-[#09182B] border-2 border-[#2684FF] dark:border-[#00E5FF] shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <div className="w-20 h-28 rounded-2xl bg-[#DBEAFE] dark:bg-[#00E5FF]/10 border border-[#BFDBFE] dark:border-[#00E5FF]/30 flex flex-col items-center justify-center shrink-0 shadow-sm text-center p-2">
                <BookOpen className="w-8 h-8 text-[#2684FF] dark:text-[#00E5FF] mb-1" />
                <span className="text-[10px] font-black text-[#1E40AF] dark:text-[#38BDF8] uppercase">VĂN 6</span>
                <span className="text-[9px] text-[#64748B] dark:text-slate-400">TẬP 1</span>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#2684FF] text-white text-[11px] font-black uppercase tracking-wider shadow-xs flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" />
                    Sách Giáo Khoa Trọng Tâm 2026–2027
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white dark:bg-white/10 text-[#0284C7] dark:text-[#38BDF8] border border-[#BFDBFE] dark:border-white/10 text-xs font-bold">
                    Khối 6 · Môn Ngữ văn
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white dark:bg-white/10 text-[#15803D] dark:text-[#34D399] border border-[#BBF7D0] dark:border-white/10 text-xs font-bold">
                    NXB Giáo Dục Việt Nam
                  </span>
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#172B4D] dark:text-white leading-snug">
                    {featuredNguVan6.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    {featuredNguVan6.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B] dark:text-slate-400">
                  <span className="font-mono bg-white/80 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-[#E2EAF5] dark:border-white/10">
                    🌐 taphuan.nxbgd.vn
                  </span>
                  <span>•</span>
                  <span>Năm học: <strong>2026–2027</strong></span>
                  <span>•</span>
                  <span>Đã có <strong>{featuredNguVan6.openCount || 342}</strong> lượt truy cập học tập</span>
                </div>
              </div>
            </div>

            {/* Launch & Copy Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => handleCopyLink(featuredNguVan6)}
                title="Sao chép liên kết vào clipboard"
                className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-white dark:bg-white/10 border border-[#CBD5E1] dark:border-white/20 hover:border-[#2684FF] text-[#172B4D] dark:text-white font-bold text-xs shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all"
              >
                {copiedId === featuredNguVan6.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-[#2684FF]" />}
                <span>{copiedId === featuredNguVan6.id ? 'Đã chép link' : 'Sao chép link'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenLink(featuredNguVan6)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#2684FF] via-[#0284C7] to-[#00E5FF] hover:opacity-95 text-white font-black text-sm shadow-md hover:shadow-xl cursor-pointer flex items-center justify-center gap-2 group transition-all"
              >
                <span>Mở sách giáo khoa</span>
                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. SEARCH & FILTERS (GRADE & 13 SUBJECTS - ZERO BOOK SERIES) */}
      {/* ======================================================== */}
      <div className="space-y-4">
        {/* Search Bar & Primary Grade Filters */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0B132B] border border-[#E2EAF5] dark:border-white/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Real-time search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm sách giáo khoa theo tên sách, môn học, nhà xuất bản..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#CBD5E1] dark:border-white/15 bg-[#F8FAFC] dark:bg-white/5 text-xs font-medium text-[#172B4D] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#2684FF] dark:focus:border-[#00E5FF] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#64748B] hover:text-[#172B4D] dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Grade Selector Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {gradeOptions.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setSelectedGrade(g.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  selectedGrade === g.id
                    ? 'bg-[#2684FF] text-white shadow-xs'
                    : 'bg-[#F8FAFC] dark:bg-white/5 text-[#64748B] dark:text-slate-300 hover:bg-[#EFF6FF] dark:hover:bg-white/10'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Tabs & Subject Dropdown (NO BOOK SERIES FILTER) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#2684FF] to-[#1B6EE0] text-white shadow-sm'
                      : 'bg-white dark:bg-[#0B132B] border border-[#E2EAF5] dark:border-white/10 text-[#64748B] dark:text-slate-300 hover:border-[#BFDBFE] dark:hover:border-white/20'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Subject Filter (13 subjects) */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-[#64748B] dark:text-slate-400 hidden sm:inline">Môn học:</span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-white/15 bg-white dark:bg-[#0B132B] text-xs font-bold text-[#172B4D] dark:text-white focus:outline-none focus:border-[#2684FF]"
            >
              <option value="all">Tất cả môn học (13 môn)</option>
              {EDU_SUBJECT_LIST.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. PINNED TEXTBOOKS & PORTALS                            */}
      {/* ======================================================== */}
      {pinnedLinks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Pin className="w-4 h-4 text-[#2684FF] dark:text-[#00E5FF] rotate-45" />
            <h3 className="text-sm font-black text-[#172B4D] dark:text-white uppercase tracking-wider">
              Sách Giáo Khoa & Tài Liệu Nổi Bật ({pinnedLinks.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pinnedLinks.map((link) => (
              <div
                key={link.id}
                className="group p-6 rounded-3xl bg-white dark:bg-[#0B132B] border-2 border-[#BFDBFE] dark:border-[#00E5FF]/40 hover:border-[#2684FF] dark:hover:border-[#00E5FF] shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-[#EFF6FF] dark:bg-[#00E5FF]/15 text-[#2684FF] dark:text-[#00E5FF] border border-[#BFDBFE] dark:border-[#00E5FF]/30 uppercase tracking-wider">
                      {link.category === 'textbooks' ? 'Sách Giáo Khoa' : link.badgeText || 'Tài Liệu'}
                    </span>

                    {/* Controls */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleCopyLink(link)}
                        title="Sao chép liên kết"
                        className="p-1.5 text-[#64748B] hover:text-[#2684FF] hover:bg-[#EFF6FF] rounded-lg cursor-pointer transition-colors"
                      >
                        {copiedId === link.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      {isTeacherAuthenticated && (
                        <>
                          <button
                            type="button"
                            onClick={() => toggleEduLinkPin(link.id)}
                            title="Bỏ ghim"
                            className="p-1 text-[#2684FF] hover:bg-[#EFF6FF] rounded-lg cursor-pointer"
                          >
                            <Pin className="w-3.5 h-3.5 rotate-45" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(link)}
                            title="Chỉnh sửa"
                            className="p-1 text-[#64748B] hover:text-[#172B4D] rounded-lg cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(link.id, link.title)}
                            title="Xóa sách"
                            className="p-1 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-base text-[#172B4D] dark:text-white group-hover:text-[#2684FF] dark:group-hover:text-[#00E5FF] transition-colors leading-snug">
                      {link.title}
                    </h4>
                    <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {link.description}
                    </p>
                  </div>

                  {/* Badges: Subject, Grade, Year (NO BOOK SERIES) */}
                  <div className="flex flex-wrap gap-1.5 pt-1 text-[10px]">
                    {link.subjectName && (
                      <span className="px-2 py-0.5 rounded-md bg-[#EFF6FF] dark:bg-[#00E5FF]/10 text-[#2684FF] dark:text-[#00E5FF] font-bold">
                        {link.subjectName}
                      </span>
                    )}
                    {link.gradeId && (
                      <span className="px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-white/10 text-[#475569] dark:text-slate-300 font-semibold">
                        {link.gradeId === 'all' ? 'Tất cả khối' : `Khối ${link.gradeId}`}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-white/10 text-[#475569] dark:text-slate-300">
                      NH {link.schoolYear || '2026–2027'}
                    </span>
                    {link.fileName && (
                      <span className="px-2 py-0.5 rounded-md bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]">
                        📎 {link.fileName} ({link.fileSize})
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#F1F5F9] dark:border-white/5 flex items-center justify-between text-[11px] text-[#64748B] dark:text-slate-400">
                    <span className="truncate max-w-[200px] font-medium text-[#475569] dark:text-slate-300">
                      {link.publisher || 'Nhà xuất bản Giáo dục Việt Nam'}
                    </span>
                  </div>
                </div>

                {/* Actions: Open & Download */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleCopyLink(link)}
                    className="p-2.5 rounded-xl border border-[#CBD5E1] dark:border-white/15 text-[#475569] dark:text-slate-300 hover:text-[#2684FF] hover:border-[#2684FF] cursor-pointer transition-colors"
                    title="Sao chép liên kết"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  {link.entryType === 'file' && (
                    <button
                      type="button"
                      onClick={() => handleDownloadFile(link)}
                      className="p-2.5 rounded-xl bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] hover:bg-[#DCFCE7] cursor-pointer transition-colors"
                      title="Tải tệp xuống máy"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleOpenLink(link)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#EFF6FF] dark:bg-white/10 hover:bg-[#2684FF] hover:text-white dark:hover:bg-[#00E5FF] dark:hover:text-[#070B14] text-[#2684FF] dark:text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-2 transition-all shadow-2xs"
                  >
                    <span>{link.entryType === 'file' ? 'Mở tài liệu' : 'Mở sách giáo khoa'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. REGULAR SÁCH GIÁO KHOA CATALOG                       */}
      {/* ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-[#172B4D] dark:text-white uppercase tracking-wider">
            Danh Mục Sách Giáo Khoa ({regularLinks.length})
          </h3>
          <span className="text-xs text-[#64748B] dark:text-slate-400">
            Hiển thị {regularLinks.length} tài liệu phù hợp
          </span>
        </div>

        {regularLinks.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0B132B] border border-[#E2EAF5] dark:border-white/10 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#EFF6FF] dark:bg-white/10 flex items-center justify-center text-[#2684FF] dark:text-[#00E5FF]">
              <Search className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-[#172B4D] dark:text-white">
              Không tìm thấy sách giáo khoa phù hợp
            </p>
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              Hãy thử chọn khối lớp khác hoặc chọn &quot;Tất cả môn học&quot; để xem danh mục đầy đủ.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {regularLinks.map((link) => (
              <div
                key={link.id}
                className={`p-6 rounded-3xl bg-white dark:bg-[#0B132B] border border-[#E2EAF5] dark:border-white/10 hover:border-[#2684FF] dark:hover:border-[#00E5FF] shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${
                  !link.isVisible ? 'opacity-50 border-dashed' : ''
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-white/10 text-[#475569] dark:text-slate-300">
                      {link.category === 'textbooks' ? 'Sách giáo khoa' : 'Tài liệu giáo dục'}
                    </span>

                    {/* Teacher & Copy Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleCopyLink(link)}
                        title="Sao chép liên kết"
                        className="p-1 text-[#64748B] hover:text-[#2684FF] rounded-lg cursor-pointer"
                      >
                        {copiedId === link.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      {isTeacherAuthenticated && (
                        <>
                          <button
                            type="button"
                            onClick={() => toggleEduLinkPin(link.id)}
                            title="Ghim lên đầu"
                            className="p-1 text-[#64748B] hover:text-[#2684FF] rounded-lg cursor-pointer"
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleEduLinkVisibility(link.id)}
                            title={link.isVisible ? 'Ẩn với học sinh' : 'Hiện cho học sinh'}
                            className="p-1 text-[#64748B] hover:text-[#172B4D] rounded-lg cursor-pointer"
                          >
                            {link.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-amber-500" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(link)}
                            title="Chỉnh sửa"
                            className="p-1 text-[#64748B] hover:text-[#172B4D] rounded-lg cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(link.id, link.title)}
                            title="Xóa"
                            className="p-1 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-base text-[#172B4D] dark:text-white group-hover:text-[#2684FF] dark:group-hover:text-[#00E5FF] transition-colors leading-snug">
                      {link.title}
                    </h4>
                    <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {link.description}
                    </p>
                  </div>

                  {/* Badges: Subject, Grade, Year (NO BOOK SERIES) */}
                  <div className="flex flex-wrap gap-1.5 pt-1 text-[10px]">
                    {link.subjectName && (
                      <span className="px-2 py-0.5 rounded-md bg-[#EFF6FF] dark:bg-[#00E5FF]/10 text-[#2684FF] dark:text-[#00E5FF] font-bold">
                        {link.subjectName}
                      </span>
                    )}
                    {link.gradeId && (
                      <span className="px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-white/10 text-[#475569] dark:text-slate-300 font-semibold">
                        {link.gradeId === 'all' ? 'Tất cả khối' : `Khối ${link.gradeId}`}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-white/10 text-[#475569] dark:text-slate-300">
                      NH {link.schoolYear || '2026–2027'}
                    </span>
                    {link.fileName && (
                      <span className="px-2 py-0.5 rounded-md bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]">
                        📎 {link.fileName} ({link.fileSize})
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#F1F5F9] dark:border-white/5 flex items-center justify-between text-[11px] text-[#64748B] dark:text-slate-400">
                    <span className="truncate max-w-[200px] font-medium text-[#475569] dark:text-slate-300">
                      {link.publisher || 'Nhà xuất bản Giáo dục Việt Nam'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleCopyLink(link)}
                    className="p-2.5 rounded-xl border border-[#CBD5E1] dark:border-white/15 text-[#475569] dark:text-slate-300 hover:text-[#2684FF] hover:border-[#2684FF] cursor-pointer transition-colors"
                    title="Sao chép liên kết"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  {link.entryType === 'file' && (
                    <button
                      type="button"
                      onClick={() => handleDownloadFile(link)}
                      className="p-2.5 rounded-xl bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] hover:bg-[#DCFCE7] cursor-pointer transition-colors"
                      title="Tải tệp xuống máy"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleOpenLink(link)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#F8FAFC] dark:bg-white/5 hover:bg-[#2684FF] hover:text-white dark:hover:bg-[#00E5FF] dark:hover:text-[#070B14] text-[#334155] dark:text-slate-200 font-bold text-xs cursor-pointer flex items-center justify-center gap-2 transition-all border border-[#E2EAF5] dark:border-white/10"
                  >
                    <span>{link.entryType === 'file' ? 'Mở tài liệu' : 'Mở sách giáo khoa'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 7. MODAL A: NHÚNG LINK SÁCH GIÁO KHOA                    */}
      {/* ======================================================== */}
      {activeModal === 'embed_link' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActiveModal('none')}
        >
          <div
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#0B132B] border-2 border-[#2684FF] dark:border-[#00E5FF]/40 shadow-2xl p-6 sm:p-7 space-y-5 text-[#172B4D] dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E2EAF5] dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] dark:bg-[#00E5FF]/10 text-[#2684FF] dark:text-[#00E5FF] flex items-center justify-center">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black">NHÚNG LINK SÁCH GIÁO KHOA</h3>
                  <p className="text-[11px] text-[#64748B] dark:text-slate-400">
                    Nhập đường dẫn trực tuyến từ website nhà xuất bản hoặc cổng giáo dục
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal('none')}
                className="text-[#64748B] hover:text-[#172B4D] dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmbedLink} className="space-y-4">
              {/* 1. Tên sách giáo khoa */}
              <div>
                <label className="text-xs font-bold text-[#475569] dark:text-slate-300 block mb-1">
                  1. Tên sách giáo khoa *
                </label>
                <input
                  type="text"
                  required
                  value={embedForm.title}
                  onChange={(e) => setEmbedForm({ ...embedForm, title: e.target.value })}
                  placeholder="Ví dụ: Ngữ văn 6 – Tập một"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-white/15 bg-[#F8FAFC] dark:bg-white/5 text-xs text-[#172B4D] dark:text-white focus:outline-none focus:border-[#2684FF]"
                />
              </div>

              {/* 2 & 3. Môn học (13 môn) và Khối lớp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#475569] dark:text-slate-300 block mb-1">
                    2. Môn học (chọn trong 13 môn) *
                  </label>
                  <select
                    value={embedForm.subjectName}
                    onChange={(e) => setEmbedForm({ ...embedForm, subjectName: e.target.value as EduSubjectName })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070B14] text-xs font-semibold text-[#172B4D] dark:text-white focus:outline-none focus:border-[#2684FF]"
                  >
                    {EDU_SUBJECT_LIST.map((subj) => (
                      <option key={subj} value={subj}>
                        {subj}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#475569] dark:text-slate-300 block mb-1">
                    3. Khối lớp *
                  </label>
                  <select
                    value={embedForm.gradeId}
                    onChange={(e) => setEmbedForm({ ...embedForm, gradeId: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070B14] text-xs font-semibold text-[#172B4D] dark:text-white focus:outline-none focus:border-[#2684FF]"
                  >
                    <option value="6">Khối 6</option>
                    <option value="7">Khối 7</option>
                    <option value="8">Khối 8</option>
                    <option value="9">Khối 9</option>
                    <option value="all">Tất cả (cả 4 khối)</option>
                  </select>
                </div>
              </div>

              {/* 4 & 5. Nhà xuất bản & Năm học */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#475569] dark:text-slate-300 block mb-1">
                    4. Nhà xuất bản
                  </label>
                  <input
                    type="text"
                    value={embedForm.publisher}
                    onChange={(e) => setEmbedForm({ ...embedForm, publisher: e.target.value })}
                    placeholder="Nhà xuất bản Giáo dục Việt Nam"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-white/15 bg-[#F8FAFC] dark:bg-white/5 text-xs text-[#172B4D] dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#475569] dark:text-slate-300 block mb-1">
                    5. Năm học
                  </label>
                  <input
                    type="text"
                    value={embedForm.schoolYear}
                    onChange={(e) => setEmbedForm({ ...embedForm, schoolYear: e.target.value })}
                    placeholder="2026–2027"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-white/15 bg-[#F8FAFC] dark:bg-white/5 text-xs text-[#172B4D] dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* 6. Mô tả ngắn */}
              <div>
                <label className="text-xs font-bold text-[#475569] dark:text-slate-300 block mb-1">
                  6. Mô tả ngắn
                </label>
                <textarea
                  rows={2}
                  value={embedForm.description}
                  onChange={(e) => setEmbedForm({ ...embedForm, description: e.target.value })}
                  placeholder="Giới thiệu nội dung trọng tâm của sách giáo khoa..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-white/15 bg-[#F8FAFC] dark:bg-white/5 text-xs text-[#172B4D] dark:text-white focus:outline-none"
                />
              </div>

              {/* 7. Ô nhập URL sách giáo khoa */}
              <div className="p-4 rounded-2xl bg-[#EFF6FF] dark:bg-white/5 border border-[#BFDBFE] dark:border-white/10 space-y-2.5">
                <label className="text-xs font-bold text-[#172B4D] dark:text-white block">
                  7. Đường link (URL) sách giáo khoa *
                </label>
                <input
                  type="url"
                  required
                  value={embedForm.url}
                  onChange={(e) => {
                    setEmbedForm({ ...embedForm, url: e.target.value });
                    setLinkCheckStatus({ tested: false, valid: false, message: '' });
                  }}
                  placeholder="Dán đường link sách giáo khoa tại đây... (Ví dụ: https://taphuan.nxbgd.vn/tap-huan/chi-tiet-sach/ngu-van-6-tap-mot-939788653.939788653)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-white/15 bg-white dark:bg-[#070B14] text-xs font-mono text-[#172B4D] dark:text-white focus:outline-none focus:border-[#2684FF]"
                />

                {/* Validation Status Notice */}
                {linkCheckStatus.tested && (
                  <div
                    className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                      linkCheckStatus.valid
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800'
                    }`}
                  >
                    {linkCheckStatus.valid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span>{linkCheckStatus.message}</span>
                  </div>
                )}

                {/* Function Buttons: Kiểm tra liên kết & Xem trước */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleTestEmbedLink}
                    className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#070B14] border border-[#BFDBFE] dark:border-white/20 hover:border-[#2684FF] text-xs font-bold text-[#2684FF] dark:text-[#00E5FF] cursor-pointer flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Kiểm tra liên kết</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePreviewEmbedLink}
                    className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#070B14] border border-[#CBD5E1] dark:border-white/20 hover:border-[#2684FF] text-xs font-bold text-[#475569] dark:text-slate-300 cursor-pointer flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Xem trước liên kết</span>
                  </button>
                </div>
              </div>

              {/* Ghim lên đầu */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="embedPinCheck"
                  checked={embedForm.isPinned}
                  onChange={(e) => setEmbedForm({ ...embedForm, isPinned: e.target.checked })}
                  className="rounded text-[#2684FF]"
                />
                <label htmlFor="embedPinCheck" className="text-xs font-bold text-[#172B4D] dark:text-white cursor-pointer">
                  Ghim sách này vào mục Nổi Bật trên đầu trang
                </label>
              </div>

              {/* Actions: Lưu & Hủy */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E2EAF5] dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="px-4 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#2684FF] to-[#1B6EE0] text-white text-xs font-bold cursor-pointer hover:shadow-md transition-all"
                >
                  Lưu liên kết sách giáo khoa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. MODAL B: TẢI TỆP SÁCH GIÁO KHOA LÊN WEBSITE          */}
      {/* ======================================================== */}
      {activeModal === 'upload_file' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActiveModal('none')}
        >
          <div
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#0B132B] border-2 border-[#10B981] dark:border-[#10B981]/50 shadow-2xl p-6 sm:p-7 space-y-5 text-[#172B4D] dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E2EAF5] dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#F0FDF4] dark:bg-[#10B981]/10 text-[#10B981] flex items-center justify-center">
                  <FileUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black">TẢI TỆP SÁCH GIÁO KHOA LÊN WEBSITE</h3>
                  <p className="text-[11px] text-[#64748B] dark:text-slate-400">
                    Khung độc lập hỗ trợ tải tệp PDF, DOCX, EPUB trực tiếp vào kho lưu trữ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal('none')}
                className="text-[#64748B] hover:text-[#172B4D] dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUploadFile} className="space-y-4">
              {/* Khu vực chọn / Kéo thả tệp */}
              <div>
                <label className="text-xs font-bold text-[#475569] dark:text-slate-300 block mb-1">
                  Chọn hoặc kéo thả tệp sách giáo khoa (PDF, DOCX, EPUB) *
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,.docx,.doc,.epub"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-6 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
                    isDragOver
                      ? 'border-[#10B981] bg-[#F0FDF4] dark:bg-[#10B981]/10'
                      : 'border-[#CBD5E1] dark:border-white/20 bg-[#F8FAFC] dark:bg-white/5 hover:border-[#10B981]'
                  }`}
                >
                  <Upload className="w-8 h-8 mx-auto text-[#10B981] mb-2" />
                  <p className="text-xs font-bold text-[#172B4D] dark:text-white">
                    Nhấn vào đây để chọn tệp từ máy tính / điện thoại
                  </p>
                  <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-1">
                    Hoặc kéo thả tệp vào khung này (Hỗ trợ: PDF, DOCX, EPUB - tối đa 50MB)
                  </p>
                </div>

                {/* Upload progress & Selected File Card */}
                {isUploading && (
                  <div className="mt-3 p-3 rounded-xl bg-[#EFF6FF] dark:bg-white/5 space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-[#2684FF]">
                      <span>Đang nạp dữ liệu tệp...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-[#BFDBFE] dark:bg-white/10 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#2684FF] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {uploadedFile && !isUploading && (
                  <div className="mt-3 p-3.5 rounded-xl bg-[#F0FDF4] dark:bg-[#10B981]/10 border border-[#BBF7D0] dark:border-[#10B981]/30 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 truncate">
                      <FileText className="w-5 h-5 text-[#10B981] shrink-0" />
                      <div className="truncate text-left">
                        <span className="block text-xs font-bold text-[#15803D] dark:text-[#34D399] truncate">
                          {uploadedFile.name}
                        </span>
                        <span className="text-[11px] text-[#64748B] dark:text-slate-400">
                          Dung lượng: <strong>{uploadedFile.sizeFormatted}</strong>
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setUploadedFile(null)}
                      className="px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg cursor-pointer shrink-0 transition-colors"
                    >
                      Xóa tệp
                    </button>
                  </div>
                )}
              </div>

              {/* 1. Tên sách */}
              <div>
                <label className="text-xs font-bold text-[#475569] dark:text-slate-300 block mb-1">
                  1. Tên sách giáo khoa *
                </label>
                <input
                  type="text"
                  required
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder="Ví dụ: Khoa học tự nhiên 6 – Tài liệu điện tử"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-white/15 bg-[#F8FAFC] dark:bg-white/5 text-xs text-[#172B4D] dark:text-white focus:outline-none focus:border-[#10B981]"
                />
              </div>

              {/* 2 & 3. Môn học và Khối lớp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#475569] dark:text-slate-300 block mb-1">
                    2. Môn học (chọn trong 13 môn) *
                  </label>
                  <select
                    value={uploadForm.subjectName}
                    onChange={(e) => setUploadForm({ ...uploadForm, subjectName: e.target.value as EduSubjectName })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070B14] text-xs font-semibold text-[#172B4D] dark:text-white focus:outline-none focus:border-[#10B981]"
                  >
                    {EDU_SUBJECT_LIST.map((subj) => (
                      <option key={subj} value={subj}>
                        {subj}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#475569] dark:text-slate-300 block mb-1">
                    3. Khối lớp *
                  </label>
                  <select
                    value={uploadForm.gradeId}
                    onChange={(e) => setUploadForm({ ...uploadForm, gradeId: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070B14] text-xs font-semibold text-[#172B4D] dark:text-white focus:outline-none focus:border-[#10B981]"
                  >
                    <option value="6">Khối 6</option>
                    <option value="7">Khối 7</option>
                    <option value="8">Khối 8</option>
                    <option value="9">Khối 9</option>
                    <option value="all">Tất cả (cả 4 khối)</option>
                  </select>
                </div>
              </div>

              {/* 4 & 5. Nhà xuất bản & Năm học */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#475569] dark:text-slate-300 block mb-1">
                    4. Nhà xuất bản
                  </label>
                  <input
                    type="text"
                    value={uploadForm.publisher}
                    onChange={(e) => setUploadForm({ ...uploadForm, publisher: e.target.value })}
                    placeholder="Nhà xuất bản Giáo dục Việt Nam"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-white/15 bg-[#F8FAFC] dark:bg-white/5 text-xs text-[#172B4D] dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#475569] dark:text-slate-300 block mb-1">
                    5. Năm học
                  </label>
                  <input
                    type="text"
                    value={uploadForm.schoolYear}
                    onChange={(e) => setUploadForm({ ...uploadForm, schoolYear: e.target.value })}
                    placeholder="2026–2027"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-white/15 bg-[#F8FAFC] dark:bg-white/5 text-xs text-[#172B4D] dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* 6. Mô tả ngắn */}
              <div>
                <label className="text-xs font-bold text-[#475569] dark:text-slate-300 block mb-1">
                  6. Mô tả ngắn
                </label>
                <textarea
                  rows={2}
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder="Mô tả thông tin tệp tài liệu để học sinh tiện tra cứu..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-white/15 bg-[#F8FAFC] dark:bg-white/5 text-xs text-[#172B4D] dark:text-white focus:outline-none"
                />
              </div>

              {/* Options: Ghim & Cho phép tải */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="uploadPinCheck"
                    checked={uploadForm.isPinned}
                    onChange={(e) => setUploadForm({ ...uploadForm, isPinned: e.target.checked })}
                    className="rounded text-[#10B981]"
                  />
                  <label htmlFor="uploadPinCheck" className="text-xs font-bold text-[#172B4D] dark:text-white cursor-pointer">
                    Ghim vào mục Nổi Bật
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="allowDownloadCheck"
                    checked={uploadForm.allowDownload}
                    onChange={(e) => setUploadForm({ ...uploadForm, allowDownload: e.target.checked })}
                    className="rounded text-[#10B981]"
                  />
                  <label htmlFor="allowDownloadCheck" className="text-xs font-bold text-[#172B4D] dark:text-white cursor-pointer">
                    Cho phép học sinh tải tệp xuống
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E2EAF5] dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="px-4 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!uploadedFile}
                  className={`px-6 py-2.5 rounded-xl text-white text-xs font-bold transition-all ${
                    uploadedFile
                      ? 'bg-gradient-to-r from-[#10B981] to-[#059669] cursor-pointer hover:shadow-md'
                      : 'bg-gray-400 cursor-not-allowed opacity-60'
                  }`}
                >
                  Lưu tệp sách giáo khoa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 9. MODAL C: EDIT EXISTING TEXTBOOK ITEM                 */}
      {/* ======================================================== */}
      {activeModal === 'edit' && editingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActiveModal('none')}
        >
          <div
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#0B132B] border-2 border-[#2684FF] shadow-2xl p-6 sm:p-7 space-y-5 text-[#172B4D] dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E2EAF5] dark:border-white/10">
              <h3 className="text-base font-black">Chỉnh Sửa Sách Giáo Khoa</h3>
              <button
                type="button"
                onClick={() => setActiveModal('none')}
                className="text-[#64748B] hover:text-[#172B4D] dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#475569] dark:text-slate-300 block mb-1">
                  Tên sách giáo khoa *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-white/15 bg-[#F8FAFC] dark:bg-white/5 text-xs text-[#172B4D] dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#475569] dark:text-slate-300 block mb-1">
                    Môn học (13 môn) *
                  </label>
                  <select
                    value={editingItem.subjectName || 'Ngữ văn'}
                    onChange={(e) => setEditingItem({ ...editingItem, subjectName: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070B14] text-xs font-semibold text-[#172B4D] dark:text-white"
                  >
                    {EDU_SUBJECT_LIST.map((subj) => (
                      <option key={subj} value={subj}>
                        {subj}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#475569] dark:text-slate-300 block mb-1">
                    Khối lớp *
                  </label>
                  <select
                    value={editingItem.gradeId || 'all'}
                    onChange={(e) => setEditingItem({ ...editingItem, gradeId: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070B14] text-xs font-semibold text-[#172B4D] dark:text-white"
                  >
                    <option value="6">Khối 6</option>
                    <option value="7">Khối 7</option>
                    <option value="8">Khối 8</option>
                    <option value="9">Khối 9</option>
                    <option value="all">Tất cả khối</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#475569] dark:text-slate-300 block mb-1">
                    Nhà xuất bản
                  </label>
                  <input
                    type="text"
                    value={editingItem.publisher || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, publisher: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-white/15 bg-[#F8FAFC] dark:bg-white/5 text-xs text-[#172B4D] dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#475569] dark:text-slate-300 block mb-1">
                    Năm học
                  </label>
                  <input
                    type="text"
                    value={editingItem.schoolYear || '2026–2027'}
                    onChange={(e) => setEditingItem({ ...editingItem, schoolYear: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-white/15 bg-[#F8FAFC] dark:bg-white/5 text-xs text-[#172B4D] dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#475569] dark:text-slate-300 block mb-1">
                  Đường link hoặc tệp URL
                </label>
                <input
                  type="text"
                  value={editingItem.url}
                  onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-white/15 bg-[#F8FAFC] dark:bg-white/5 text-xs font-mono text-[#172B4D] dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#475569] dark:text-slate-300 block mb-1">
                  Mô tả ngắn
                </label>
                <textarea
                  rows={2}
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-white/15 bg-[#F8FAFC] dark:bg-white/5 text-xs text-[#172B4D] dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editPinCheck"
                  checked={Boolean(editingItem.isPinned)}
                  onChange={(e) => setEditingItem({ ...editingItem, isPinned: e.target.checked })}
                  className="rounded text-[#2684FF]"
                />
                <label htmlFor="editPinCheck" className="text-xs font-bold text-[#172B4D] dark:text-white cursor-pointer">
                  Ghim sách giáo khoa lên đầu trang
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E2EAF5] dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="px-4 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#2684FF] to-[#1B6EE0] text-white text-xs font-bold cursor-pointer hover:shadow-md transition-all"
                >
                  Cập nhật thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
