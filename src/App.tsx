/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import GuidanceView from './components/GuidanceView';
import Footer from './components/Footer';
import type { School } from './data/schoolsData';
import { generateStudentSessionIds } from './services/consultationSaveService';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'guidance'>('home');
  const [guidanceStep, setGuidanceStep] = useState<1 | 2 | 3 | 4>(1);
  const [studentName, setStudentName] = useState<string>('');
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  // Mã học sinh duy nhất và mã phiếu tư vấn cho phiên làm việc (Yêu cầu 2)
  const [sessionIds, setSessionIds] = useState<{ studentId: string; slipId: string }>(() =>
    generateStudentSessionIds()
  );
  // Đồng ý lưu kết quả tư vấn (Yêu cầu 10)
  const [consentSaveData, setConsentSaveData] = useState<boolean>(true);

  // Start guidance from Hero chatbot input
  const handleStartGuidance = (name: string, consent: boolean = true) => {
    setStudentName(name);
    setConsentSaveData(consent);
    // Để học sinh tự chọn trường trúng tuyển, không chọn sẵn trường đầu tiên
    setSelectedSchool(null);
    // Tạo mã học sinh và mã phiếu mới cho phiên tư vấn mới
    setSessionIds(generateStudentSessionIds());
    setCurrentView('guidance');
    setGuidanceStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toolbar navigation: Home
  const handleNavigateHome = () => {
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toolbar navigation: 4 steps
  const handleNavigateGuidanceStep = (step: 1 | 2 | 3 | 4) => {
    // Nếu học sinh chưa chọn trường THPT trúng tuyển, chuyển về Bước 1 để chọn trường trước
    if (step > 1 && !selectedSchool) {
      setCurrentView('guidance');
      setGuidanceStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setCurrentView('guidance');
    setGuidanceStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans overflow-x-clip">
      {/* Top Header with Exact 5 Toolbar items */}
      <Header
        currentView={currentView}
        guidanceStep={guidanceStep}
        onNavigateHome={handleNavigateHome}
        onNavigateGuidanceStep={handleNavigateGuidanceStep}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {currentView === 'home' ? (
          <HeroSection
            studentName={studentName}
            onStudentNameChange={setStudentName}
            onStartGuidance={handleStartGuidance}
          />
        ) : (
          /* Full-width Guidance View (Matching homepage width) */
          <GuidanceView
            currentStep={guidanceStep}
            onStepChange={handleNavigateGuidanceStep}
            studentName={studentName}
            onStudentNameChange={setStudentName}
            onNavigateHome={handleNavigateHome}
            selectedSchool={selectedSchool}
            onSelectSchool={setSelectedSchool}
            sessionIds={sessionIds}
            consentSaveData={consentSaveData}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigateHome={handleNavigateHome}
        onNavigateGuidanceStep={handleNavigateGuidanceStep}
      />
    </div>
  );
}
