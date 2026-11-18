import { useState } from 'react';
import { Compass, Menu, X } from 'lucide-react';

interface HeaderProps {
  currentView: 'home' | 'guidance';
  guidanceStep: 1 | 2 | 3 | 4;
  onNavigateHome: () => void;
  onNavigateGuidanceStep: (step: 1 | 2 | 3 | 4) => void;
}

export default function Header({
  currentView,
  guidanceStep,
  onNavigateHome,
  onNavigateGuidanceStep,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Trang chủ', isHome: true },
    { id: 'step1', step: 1 as const, label: 'Chọn trường THPT' },
    { id: 'step2', step: 2 as const, label: 'Khám phá Holland' },
    { id: 'step3', step: 3 as const, label: 'Chọn nguyện vọng đại học' },
    { id: 'step4', step: 4 as const, label: 'Xem kết quả tư vấn' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-18">
          
          {/* Brand Logo & Wordmark */}
          <button
            type="button"
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 text-blue-900 font-bold tracking-tight text-xl whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity cursor-pointer text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-extrabold tracking-tight text-blue-900">
                EduGuide <span className="text-blue-600">AI</span>
              </span>
              <span className="text-xs font-semibold text-slate-700">
                Hướng nghiệp thông minh
              </span>
            </div>
          </button>

          {/* Navigation Items (Exact 5 items: Trang chủ, Chọn trường THPT, Khám phá Holland, Chọn nguyện vọng đại học, Xem kết quả tư vấn) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-semibold text-slate-800">
            {navItems.map((item) => {
              if (item.isHome) {
                const isActive = currentView === 'home';
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={onNavigateHome}
                    className={`px-3 py-2 rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? 'text-blue-700 font-bold bg-blue-50/80 shadow-2xs'
                        : 'hover:text-blue-600 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              }

              const step = item.step as 1 | 2 | 3 | 4;
              const isActive = currentView === 'guidance' && guidanceStep === step;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigateGuidanceStep(step)}
                  className={`px-3 py-2 rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'text-blue-700 font-bold bg-blue-50/80 shadow-2xs ring-1 ring-blue-600/30'
                      : 'hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Mobile menu toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-blue-600 rounded-lg border border-slate-200 cursor-pointer"
              aria-label="Mở menu điều hướng"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-1.5 shadow-lg">
          {navItems.map((item) => {
            if (item.isHome) {
              const isActive = currentView === 'home';
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onNavigateHome();
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 text-sm rounded-lg font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                  }`}
                >
                  {item.label}
                </button>
              );
            }

            const step = item.step as 1 | 2 | 3 | 4;
            const isActive = currentView === 'guidance' && guidanceStep === step;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigateGuidanceStep(step);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 text-sm rounded-lg font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
