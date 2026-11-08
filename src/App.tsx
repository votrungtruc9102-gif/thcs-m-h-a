import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ModernTechBackground } from './components/layout/ModernTechBackground';
import { Navbar } from './components/navigation/Navbar';
import { SubjectGradeDrawer } from './components/subject-grade/SubjectGradeDrawer';
import { AuthModal } from './components/auth/AuthModal';
import { TechThemeModal } from './components/layout/TechThemeModal';
import { Footer } from './components/layout/Footer';

// Pages
import { HomePage } from './pages/home/HomePage';
import { KnowledgePage } from './pages/knowledge/KnowledgePage';
import { PracticePage } from './pages/practice/PracticePage';
import { GamesPage } from './pages/games/GamesPage';
import { EduLinksPage } from './pages/links/EduLinksPage';
import { StatisticsPage } from './pages/statistics/StatisticsPage';
import { TeacherPortal } from './pages/teacher/TeacherPortal';

const AppContent: React.FC = () => {
  const { activeTab, bgIntensity, effectiveTheme } = useApp();
  const isDark = effectiveTheme === 'black';

  return (
    <div
      className={`relative min-h-screen flex flex-col font-['Be_Vietnam_Pro',sans-serif] transition-colors duration-300 ${
        isDark
          ? 'dark text-white selection:bg-[#00E5FF]/30 selection:text-white'
          : 'text-[#172B4D] selection:bg-[#2684FF]/20 selection:text-[#172B4D]'
      }`}
    >
      {/* Modern High-Tech Background Component */}
      <ModernTechBackground intensity={bgIntensity} />

      {/* Main Navigation Bar */}
      <Navbar />

      {/* Primary Page Router */}
      <main className="flex-1 w-full">
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'knowledge' && <KnowledgePage />}
        {activeTab === 'practice' && <PracticePage />}
        {activeTab === 'games' && <GamesPage />}
        {activeTab === 'links' && <EduLinksPage />}
        {activeTab === 'statistics' && <StatisticsPage />}
        {activeTab === 'teacher' && <TeacherPortal />}
      </main>

      {/* Global Subject and Grade Sliding Drawer */}
      <SubjectGradeDrawer />

      {/* Modern Dual Tech Theme Customization Modal (Trắng & Đen công nghệ) */}
      <TechThemeModal />

      {/* Modern Centered Dual-Role Authentication Modal (Student & Teacher) */}
      <AuthModal />

      {/* Application Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
