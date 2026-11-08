import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SchoolClass } from '../../types';
import { SUPPORTED_CLASSES, AUTH_MESSAGES } from '../../utils/cryptoAuth';
import {
  GraduationCap,
  ShieldCheck,
  User,
  Lock,
  X,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  School,
  UserPlus,
  LogIn,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalInitialTab,
    loginWithCredentials,
    registerStudent,
    setActiveTab,
  } = useApp();

  // Role area: 'student' or 'teacher'
  const [activeArea, setActiveArea] = useState<'student' | 'teacher'>('student');

  // Student sub-mode: 'login' or 'register'
  const [studentMode, setStudentMode] = useState<'login' | 'register'>('login');

  // Teacher Login Form State
  const [teacherUsername, setTeacherUsername] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [teacherError, setTeacherError] = useState('');

  // Student Login Form State
  const [studentLoginUsername, setStudentLoginUsername] = useState('');
  const [studentLoginPassword, setStudentLoginPassword] = useState('');
  const [studentLoginError, setStudentLoginError] = useState('');

  // Student Registration Form State
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regClass, setRegClass] = useState<SchoolClass>('6A5');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccessMessage, setRegSuccessMessage] = useState('');

  // Sync open state and default area
  useEffect(() => {
    if (isAuthModalOpen) {
      setActiveArea(authModalInitialTab || 'student');
      setStudentMode('login');
      setTeacherError('');
      setStudentLoginError('');
      setRegError('');
      setRegSuccessMessage('');
    }
  }, [isAuthModalOpen, authModalInitialTab]);

  if (!isAuthModalOpen) return null;

  // Handle Teacher Login
  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherError('');

    if (!teacherUsername.trim() || !teacherPassword) {
      setTeacherError(AUTH_MESSAGES.INVALID_CREDENTIALS);
      setTeacherPassword('');
      return;
    }

    const result = loginWithCredentials(teacherUsername, teacherPassword, 'teacher');
    if (result.success) {
      setActiveTab('teacher');
      closeAuthModal();
      setTeacherUsername('');
      setTeacherPassword('');
    } else {
      // Clear password, keep username
      setTeacherPassword('');
      setTeacherError(result.message || AUTH_MESSAGES.INVALID_CREDENTIALS);
    }
  };

  // Handle Student Login
  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentLoginError('');
    setRegSuccessMessage('');

    if (!studentLoginUsername.trim() || !studentLoginPassword) {
      setStudentLoginError(AUTH_MESSAGES.INVALID_CREDENTIALS);
      setStudentLoginPassword('');
      return;
    }

    const result = loginWithCredentials(studentLoginUsername, studentLoginPassword, 'student');
    if (result.success) {
      closeAuthModal();
      setStudentLoginUsername('');
      setStudentLoginPassword('');
    } else {
      // Retain username, clear password
      setStudentLoginPassword('');
      setStudentLoginError(result.message || AUTH_MESSAGES.INVALID_CREDENTIALS);
    }
  };

  // Handle Student Registration
  const handleStudentRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regFullName.trim() || !regUsername.trim() || !regPassword || !regConfirmPassword) {
      setRegError(AUTH_MESSAGES.REQUIRED_FIELDS);
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError(AUTH_MESSAGES.PASSWORD_MISMATCH);
      return;
    }

    const result = registerStudent({
      fullName: regFullName,
      username: regUsername,
      className: regClass,
      password: regPassword,
      confirmPassword: regConfirmPassword,
    });

    if (result.success) {
      // Retain username and transfer to login mode with success notice
      setStudentLoginUsername(regUsername.trim());
      setStudentLoginPassword('');
      setRegFullName('');
      setRegUsername('');
      setRegPassword('');
      setRegConfirmPassword('');
      setRegSuccessMessage(result.message);
      setStudentMode('login');
    } else {
      setRegError(result.message);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
    >
      {/* Background Backdrop Blur */}
      <div
        onClick={closeAuthModal}
        className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-md transition-opacity duration-300"
      />

      {/* Main Centered Modal Window */}
      <div className="relative z-10 w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#BFDBFE] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Top Header Banner */}
        <div className="relative px-6 pt-6 pb-5 bg-gradient-to-r from-[#2684FF] via-[#1B6EE0] to-[#0284C7] text-white">
          <div className="absolute top-0 right-0 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between relative">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-xs">
                <School className="w-6 h-6" />
              </div>
              <div>
                <span className="inline-block text-[11px] font-bold tracking-wider uppercase text-blue-100 bg-white/15 px-2.5 py-0.5 rounded-full mb-1">
                  Cổng Xác Thực Giáo Dục
                </span>
                <h2 id="auth-modal-title" className="text-xl sm:text-2xl font-black text-white leading-tight">
                  THCS MỸ HÒA – HỌC TẬP TRỰC TUYẾN
                </h2>
                <p className="text-xs text-blue-100 mt-0.5">Năm học 2026–2027 · Phân chia lớp học an toàn</p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeAuthModal}
              aria-label="Đóng cửa sổ"
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Two Distinct Role Selector Tabs */}
          <div className="mt-5 grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20">
            {/* Student Area Button */}
            <button
              type="button"
              onClick={() => {
                setActiveArea('student');
                setTeacherError('');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                activeArea === 'student'
                  ? 'bg-white text-[#2684FF] shadow-md shadow-black/10'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Khu vực Học sinh</span>
            </button>

            {/* Teacher Area Button */}
            <button
              type="button"
              onClick={() => {
                setActiveArea('teacher');
                setStudentLoginError('');
                setRegError('');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                activeArea === 'teacher'
                  ? 'bg-white text-[#1E40AF] shadow-md shadow-black/10'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Khu vực Giáo viên</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* ========================================================
              AREA 1: KHU VỰC HỌC SINH
             ======================================================== */}
          {activeArea === 'student' && (
            <div className="space-y-4">
              {/* Area Subtitle */}
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#172B4D]">
                    {studentMode === 'login' ? 'Đăng nhập tài khoản Học sinh' : 'Đăng ký tài khoản Học sinh mới'}
                  </h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {studentMode === 'login'
                      ? 'Dành cho học sinh đăng nhập bằng tài khoản cá nhân đã đăng ký'
                      : 'Đăng ký tài khoản và chọn đúng lớp học (6A5, 7A5, 8A5, 9A5)'}
                  </p>
                </div>

                {/* Toggle Login / Register Button */}
                <button
                  type="button"
                  onClick={() => {
                    setStudentMode(studentMode === 'login' ? 'register' : 'login');
                    setStudentLoginError('');
                    setRegError('');
                    setRegSuccessMessage('');
                  }}
                  className="text-xs font-bold text-[#2684FF] hover:text-[#1B6EE0] bg-[#EFF6FF] px-3 py-1.5 rounded-xl hover:bg-[#DBEAFE] transition-colors cursor-pointer"
                >
                  {studentMode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
                </button>
              </div>

              {/* Success Notification Banner */}
              {regSuccessMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>{regSuccessMessage}</div>
                </div>
              )}

              {/* 1A. STUDENT LOGIN FORM */}
              {studentMode === 'login' && (
                <form onSubmit={handleStudentLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#172B4D] mb-1.5">
                      Tên tài khoản <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={studentLoginUsername}
                        onChange={(e) => {
                          setStudentLoginUsername(e.target.value);
                          setStudentLoginError('');
                        }}
                        placeholder="Nhập tên tài khoản của em"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#CBD5E1] focus:border-[#2684FF] focus:ring-2 focus:ring-[#2684FF]/20 text-sm outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#172B4D] mb-1.5">
                      Mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={studentLoginPassword}
                        onChange={(e) => {
                          setStudentLoginPassword(e.target.value);
                          setStudentLoginError('');
                        }}
                        placeholder="Nhập mật khẩu"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#CBD5E1] focus:border-[#2684FF] focus:ring-2 focus:ring-[#2684FF]/20 text-sm outline-none transition-all"
                      />
                    </div>
                  </div>

                  {studentLoginError && (
                    <div className="flex items-center gap-2 text-xs text-red-600 font-semibold bg-red-50 p-3 rounded-xl border border-red-200">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{studentLoginError}</span>
                    </div>
                  )}

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setStudentMode('register');
                        setStudentLoginError('');
                      }}
                      className="text-xs font-medium text-[#2684FF] hover:underline cursor-pointer"
                    >
                      Chưa có tài khoản? Đăng ký ngay
                    </button>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={closeAuthModal}
                        className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl border border-[#CBD5E1] text-[#475569] font-bold text-sm hover:bg-[#F1F5F9] transition-all cursor-pointer"
                      >
                        Đóng
                      </button>
                      <button
                        type="submit"
                        className="flex-1 sm:flex-initial py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#2684FF] to-[#1B6EE0] hover:from-[#1B6EE0] hover:to-[#1557B0] text-white font-bold text-sm shadow-md shadow-[#2684FF]/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Đăng nhập</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* 1B. STUDENT REGISTRATION FORM */}
              {studentMode === 'register' && (
                <form onSubmit={handleStudentRegister} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-[#172B4D] mb-1.5">
                      Họ và tên học sinh <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={regFullName}
                        onChange={(e) => {
                          setRegFullName(e.target.value);
                          setRegError('');
                        }}
                        placeholder="Ví dụ: Nguyễn Văn An"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#CBD5E1] focus:border-[#2684FF] focus:ring-2 focus:ring-[#2684FF]/20 text-sm outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Username & Mandatory Class Dropdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-[#172B4D] mb-1.5">
                        Tên tài khoản <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={regUsername}
                        onChange={(e) => {
                          setRegUsername(e.target.value);
                          setRegError('');
                        }}
                        placeholder="Ví dụ: an.nguyen"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] focus:border-[#2684FF] focus:ring-2 focus:ring-[#2684FF]/20 text-sm outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#172B4D] mb-1.5">
                        Lớp học <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={regClass}
                        onChange={(e) => setRegClass(e.target.value as SchoolClass)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] focus:border-[#2684FF] focus:ring-2 focus:ring-[#2684FF]/20 text-sm outline-none bg-white font-semibold cursor-pointer text-[#172B4D]"
                      >
                        {SUPPORTED_CLASSES.map((cls) => (
                          <option key={cls} value={cls}>
                            Lớp {cls} (Khối {cls.charAt(0)})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-[#172B4D] mb-1.5">
                        Mật khẩu <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          value={regPassword}
                          onChange={(e) => {
                            setRegPassword(e.target.value);
                            setRegError('');
                          }}
                          placeholder="Mật khẩu bảo mật"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#CBD5E1] focus:border-[#2684FF] focus:ring-2 focus:ring-[#2684FF]/20 text-sm outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#172B4D] mb-1.5">
                        Nhập lại mật khẩu <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          value={regConfirmPassword}
                          onChange={(e) => {
                            setRegConfirmPassword(e.target.value);
                            setRegError('');
                          }}
                          placeholder="Xác nhận mật khẩu"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#CBD5E1] focus:border-[#2684FF] focus:ring-2 focus:ring-[#2684FF]/20 text-sm outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {regError && (
                    <div className="flex items-center gap-2 text-xs text-red-600 font-semibold bg-red-50 p-3 rounded-xl border border-red-200">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{regError}</span>
                    </div>
                  )}

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setStudentMode('login');
                        setRegError('');
                      }}
                      className="text-xs font-medium text-[#2684FF] hover:underline cursor-pointer"
                    >
                      Đã có tài khoản? Đăng nhập
                    </button>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={closeAuthModal}
                        className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl border border-[#CBD5E1] text-[#475569] font-bold text-sm hover:bg-[#F1F5F9] transition-all cursor-pointer"
                      >
                        Đóng
                      </button>
                      <button
                        type="submit"
                        className="flex-1 sm:flex-initial py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#2684FF] to-[#1B6EE0] hover:from-[#1B6EE0] hover:to-[#1557B0] text-white font-bold text-sm shadow-md shadow-[#2684FF]/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Tạo tài khoản</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ========================================================
              AREA 2: KHU VỰC GIÁO VIÊN
             ======================================================== */}
          {activeArea === 'teacher' && (
            <div className="space-y-4">
              <div className="border-b border-[#F1F5F9] pb-3">
                <h3 className="text-sm font-bold text-[#172B4D]">Khu vực dành cho Giáo viên</h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Dành cho giáo viên đã được cấp tài khoản hoặc quản trị viên tạo tài khoản
                </p>
              </div>

              {/* Teacher Login Form */}
              <form onSubmit={handleTeacherLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#172B4D] mb-1.5">
                    Tên tài khoản hoặc Email giáo viên <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={teacherUsername}
                      onChange={(e) => {
                        setTeacherUsername(e.target.value);
                        setTeacherError('');
                      }}
                      placeholder="Nhập tên tài khoản hoặc email được cấp"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#CBD5E1] focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20 text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172B4D] mb-1.5">
                    Mật khẩu quản trị <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={teacherPassword}
                      onChange={(e) => {
                        setTeacherPassword(e.target.value);
                        setTeacherError('');
                      }}
                      placeholder="Nhập mật khẩu"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#CBD5E1] focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20 text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                {teacherError && (
                  <div className="flex items-center gap-2 text-xs text-red-600 font-semibold bg-red-50 p-3 rounded-xl border border-red-200">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{teacherError}</span>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeAuthModal}
                    className="py-2.5 px-4 rounded-xl border border-[#CBD5E1] text-[#475569] font-bold text-sm hover:bg-[#F1F5F9] transition-all cursor-pointer"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#1E40AF] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#172554] text-white font-bold text-sm shadow-md shadow-[#1E40AF]/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Đăng nhập Giáo viên</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Modal Footer Notes */}
        <div className="px-6 py-3.5 bg-[#F8FAFC] border-t border-[#E2EAF5] flex items-center justify-between text-xs text-[#64748B]">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Mật khẩu được mã hóa muối an toàn (Salted SHA-256)</span>
          </div>
          <span className="text-[11px] font-medium text-[#94A3B8]">THCS Mỹ Hòa Online</span>
        </div>
      </div>
    </div>
  );
};
