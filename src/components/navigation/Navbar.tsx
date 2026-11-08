import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SubjectGradeTrigger } from '../subject-grade/SubjectGradeTrigger';
import {
  GraduationCap,
  Home,
  BookOpen,
  CheckSquare,
  Gamepad2,
  Globe,
  BarChart3,
  ShieldCheck,
  Menu,
  X,
  Sparkles,
  LogOut,
  User,
  ChevronDown,
  Layers,
  Settings,
  UserCheck,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    isTeacherAuthenticated,
    openAuthModal,
    logout,
    techTheme,
    effectiveTheme,
    setIsTechThemeModalOpen,
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Trang chủ', icon: Home },
    { id: 'knowledge', label: 'Kho kiến thức', icon: BookOpen },
    { id: 'practice', label: 'Luyện tập', icon: CheckSquare },
    { id: 'games', label: 'Trò chơi học tập', icon: Gamepad2 },
    { id: 'links', label: 'Liên kết giáo dục', icon: Globe },
    { id: 'statistics', label: 'Thống kê', icon: BarChart3 },
  ] as const;

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#070B14]/90 backdrop-blur-md border-b border-[#E2EAF5] dark:border-white/10 shadow-xs transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleTabChange('home')}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2684FF] via-[#22C7E8] to-[#10B981] p-0.5 shadow-sm group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-white dark:bg-[#0B132B] rounded-[14px] flex items-center justify-center text-[#2684FF] dark:text-[#00E5FF]">
                  <GraduationCap className="w-5 h-5" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-[#172B4D] dark:text-white group-hover:text-[#2684FF] dark:group-hover:text-[#00E5FF] transition-colors leading-none">
                  THCS MỸ HÒA
                </span>
                <span className="text-[11px] font-medium text-[#64748B] dark:text-slate-400 mt-0.5 tracking-wide">
                  Học Tập Trực Tuyến 2026–2027
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1.5" aria-label="Menu chính">
            {navLinks.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTabChange(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#EFF6FF] dark:bg-[#00E5FF]/15 text-[#2684FF] dark:text-[#00E5FF] shadow-xs'
                      : 'text-[#475569] dark:text-slate-300 hover:text-[#172B4D] dark:hover:text-white hover:bg-[#F8FAFC] dark:hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#2684FF] dark:text-[#00E5FF]' : 'text-[#64748B] dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {isTeacherAuthenticated && (
              <button
                type="button"
                onClick={() => handleTabChange('teacher')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                  activeTab === 'teacher'
                    ? 'bg-[#8B5CF6]/15 dark:bg-[#A855F7]/25 text-[#7C3AED] dark:text-[#C084FC] shadow-xs font-bold'
                    : 'text-[#7C3AED] dark:text-[#C084FC] hover:bg-[#F5F3FF] dark:hover:bg-white/5'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-[#7C3AED] dark:text-[#C084FC]" />
                <span>Quản trị Giáo viên</span>
              </button>
            )}
          </nav>

          {/* Action Zone: Subject & Grade Trigger + Modern User Account Area + Tech Wallpaper Toggle */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Tech Background Toggle */}
            <button
              type="button"
              onClick={() => setIsTechThemeModalOpen(true)}
              title="Tùy chỉnh Nền công nghệ (Trắng / Đen / Tự động)"
              className={`p-2 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                effectiveTheme === 'black'
                  ? 'border-[#00E5FF]/60 bg-[#070B14] text-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                  : 'border-[#BFDBFE] bg-[#EFF6FF] text-[#2684FF] hover:bg-[#DBEAFE]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00E5FF] dark:text-[#00E5FF]" />
              <span className="hidden xl:inline">Nền công nghệ</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/50 dark:bg-white/10 uppercase">
                {techTheme === 'black' ? 'Đen' : techTheme === 'white' ? 'Trắng' : 'Auto'}
              </span>
            </button>


            {/* Mandatory Subject & Grade Trigger */}
            <SubjectGradeTrigger />

            {/* UPGRADED DUAL-ROLE USER ACCOUNT COMPONENT */}
            {!currentUser ? (
              // Guest Mode -> Login Action Buttons
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openAuthModal('student')}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#2684FF] to-[#1B6EE0] hover:from-[#1B6EE0] hover:to-[#1557B0] text-white text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Đăng nhập</span>
                </button>

                <button
                  type="button"
                  onClick={() => openAuthModal('teacher')}
                  title="Dành cho Giáo viên bộ môn"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-[#475569] hover:border-[#7C3AED] hover:text-[#7C3AED] text-xs font-semibold transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#64748B]" />
                  <span className="hidden md:inline">Giáo viên</span>
                </button>
              </div>
            ) : currentUser.role === 'student' ? (
              // Student Account Badge & Dropdown
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  title={`${currentUser.name} – Lớp ${currentUser.className}`}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-2xl bg-gradient-to-r from-[#EFF6FF] to-white border border-[#BFDBFE] hover:border-[#2684FF] shadow-xs transition-all cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-xl bg-[#DBEAFE] flex items-center justify-center text-sm shadow-xs">
                    {currentUser.avatar || '🎒'}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-[#172B4D] leading-tight truncate max-w-[140px]">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] font-extrabold text-[#2684FF] leading-tight">
                      Lớp {currentUser.className}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
                </button>

                {/* Student Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#BFDBFE] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2.5 border-b border-[#F1F5F9] bg-[#F8FAFC]">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{currentUser.avatar || '🎒'}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#172B4D] truncate">{currentUser.name} – Lớp {currentUser.className}</p>
                          <p className="text-[10px] font-semibold text-[#2684FF]">
                            Khối {currentUser.gradeId} · Mã: {currentUser.studentCode || currentUser.username}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => handleTabChange('statistics')}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#334155] hover:bg-[#EFF6FF] hover:text-[#2684FF] text-left cursor-pointer"
                      >
                        <BarChart3 className="w-4 h-4 text-[#2684FF]" />
                        <span>Hồ sơ & Thống kê cá nhân</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTabChange('practice')}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#334155] hover:bg-[#EFF6FF] hover:text-[#2684FF] text-left cursor-pointer"
                      >
                        <CheckSquare className="w-4 h-4 text-[#10B981]" />
                        <span>Luyện tập đề trắc nghiệm</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          openAuthModal('student');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#334155] hover:bg-[#EFF6FF] hover:text-[#2684FF] text-left cursor-pointer"
                      >
                        <UserCheck className="w-4 h-4 text-[#64748B]" />
                        <span>Đăng nhập tài khoản khác</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-[#F1F5F9]">
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất (Về chế độ khách)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Teacher Account Badge & Actions
              <div className="relative" ref={userMenuRef}>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleTabChange('teacher')}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-2xl bg-[#FAF5FF] border border-[#DDD6FE] hover:border-[#7C3AED] shadow-xs transition-all cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-xl bg-[#EDE9FE] flex items-center justify-center text-sm shadow-xs">
                      {currentUser.avatar || '👨‍🏫'}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-[#172B4D] leading-tight truncate max-w-[120px]">
                        {currentUser.name}
                      </span>
                      <span className="text-[10px] font-extrabold text-[#7C3AED] leading-tight">
                        {currentUser.subjectDepartment || 'Giáo viên'}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={logout}
                    title="Đăng xuất giáo viên"
                    className="p-2 rounded-xl text-[#94A3B8] hover:text-red-500 hover:bg-red-50 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <SubjectGradeTrigger className="text-xs py-1.5 px-2.5" />
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-white border border-[#E2EAF5] text-[#172B4D]"
              aria-label="Mở menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="sm:hidden border-t border-[#E2EAF5] dark:border-white/10 bg-white dark:bg-[#070B14] px-4 py-4 space-y-2 animate-in slide-in-from-top-4 duration-200">
          {/* Mobile User Information Banner */}
          {currentUser ? (
            <div className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-white/5 border border-[#E2EAF5] dark:border-white/10 flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{currentUser.avatar || '👤'}</span>
                <div>
                  <div className="text-xs font-bold text-[#172B4D] dark:text-white">{currentUser.name}</div>
                  <div className="text-[11px] font-semibold text-[#2684FF] dark:text-[#00E5FF]">
                    {currentUser.role === 'student'
                      ? `Học sinh Lớp ${currentUser.className}`
                      : `${currentUser.subjectDepartment || 'Giáo viên'}`}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2.5 py-1.5 rounded-xl cursor-pointer"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openAuthModal('student');
                }}
                className="py-2.5 rounded-xl bg-[#2684FF] text-white text-xs font-bold text-center cursor-pointer"
              >
                Đăng nhập Học sinh
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openAuthModal('teacher');
                }}
                className="py-2.5 rounded-xl bg-[#FAF5FF] dark:bg-white/5 border border-[#DDD6FE] dark:border-white/15 text-[#7C3AED] dark:text-[#C084FC] text-xs font-bold text-center cursor-pointer"
              >
                Cổng Giáo viên
              </button>
            </div>
          )}

          {navLinks.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-left cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-[#EFF6FF] dark:bg-[#00E5FF]/15 text-[#2684FF] dark:text-[#00E5FF]'
                    : 'text-[#475569] dark:text-slate-300 hover:bg-[#F8FAFC] dark:hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}

          {isTeacherAuthenticated && (
            <button
              type="button"
              onClick={() => handleTabChange('teacher')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-left bg-[#FAF5FF] text-[#7C3AED]"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Khu vực Quản trị Giáo viên</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
