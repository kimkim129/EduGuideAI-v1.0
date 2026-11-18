import { useState } from 'react';
import { Bot, User, Compass, ArrowRight, GraduationCap } from 'lucide-react';
import vietnameseStudentsImg from '../assets/images/vietnamese_students_plain_uniforms_1793892219762.jpg';

interface HeroSectionProps {
  studentName: string;
  onStudentNameChange: (name: string) => void;
  onStartGuidance: (name: string, consentSave?: boolean) => void;
  consentSaveData?: boolean;
  onConsentSaveDataChange?: (consent: boolean) => void;
}

export default function HeroSection({
  studentName,
  onStudentNameChange,
  onStartGuidance,
}: HeroSectionProps) {
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = studentName.trim();
    if (!trimmed) {
      setErrorMessage('Vui lòng nhập tên của bạn để bắt đầu tư vấn nhé!');
      return;
    }
    setErrorMessage('');
    onStartGuidance(trimmed, true);
  };

  return (
    <section id="hero" className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-20 bg-gradient-to-b from-blue-50/70 via-white to-slate-50">
      {/* Subtle decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-40">
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
        <div className="absolute -top-20 right-1/4 w-80 h-80 bg-sky-200 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column: Headline, Description, Features & Chatbot Input (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-5">
            
            <div className="space-y-4">
              {/* Kicker badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200/80 rounded-full text-xs font-semibold text-blue-700 tracking-wide w-fit">
                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                <span>Chương trình GDPT 2018 · Dành cho tân học sinh lớp 10 Đà Nẵng</span>
              </div>

              {/* Main Headline - Wraps cleanly on mobile/tablet, 1 line on laptop/desktop */}
              <h1 className="text-2xl sm:text-3xl lg:text-[1.95rem] xl:text-[2.25rem] font-extrabold text-slate-900 tracking-tight leading-tight whitespace-normal xl:whitespace-nowrap">
                Chọn đúng tổ hợp – <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600">Vững bước tương lai</span>
              </h1>

              {/* Exact introduction paragraph */}
              <p className="text-sm sm:text-base text-slate-800 font-medium leading-relaxed text-justify">
                Chúc mừng bạn đã trúng tuyển vào lớp 10! Việc chọn tổ hợp môn học là quyết định chiến lược định hình trực tiếp môn thi Tốt nghiệp THPT và nghề nghiệp sau này.{' '}
                <strong className="text-blue-800 font-extrabold">EduGuide AI</strong> đồng hành cùng học sinh và phụ huynh tại TP Đà Nẵng phân tích năng lực, khám phá đam mê và chọn tổ hợp môn tối ưu nhất tại ngôi trường bạn theo học.
              </p>
            </div>

            {/* Chatbot with question "Bạn tên gì?" and "Bắt đầu tư vấn" button next to it */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700 block">
                    Trợ lý EduGuide AI
                  </span>
                  <p className="text-sm sm:text-base font-bold text-slate-950 leading-snug">
                    Chào bạn! Bạn tên gì để EduGuide AI cùng đồng hành và tư vấn nhé?
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                <div className="relative flex-1">
                  <User className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Nhập họ và tên của bạn (ví dụ: Minh Anh, Hoàng Nam...)"
                    value={studentName}
                    onChange={(e) => {
                      onStudentNameChange(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-slate-950 font-medium placeholder:text-slate-600 transition-all"
                  />
                </div>

                {/* Nút Bắt đầu tư vấn ở kế tiếp chatbot */}
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all shadow-md shadow-blue-600/25 whitespace-nowrap cursor-pointer shrink-0"
                >
                  <Compass className="w-4 h-4" />
                  <span>Bắt đầu tư vấn</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {errorMessage && (
                <p className="text-xs text-red-600 font-medium pl-1 pt-1">{errorMessage}</p>
              )}
            </div>

          </div>

          {/* Right Column: Original Image (5 cols) with original untouched content */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 bg-white shadow-lg shadow-slate-200/60 aspect-video w-full group">
              <img
                src={vietnameseStudentsImg}
                alt="Nhóm học sinh THPT Việt Nam trao đổi về lựa chọn môn học và nghề nghiệp tại sân trường"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
              />
              
              {/* Khối chữ trong ảnh: dịch chuyển xuống dưới, màu chữ nổi bật, bỏ 'theo năng lực cá nhân' */}
              <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent px-4 sm:px-5 pt-8 pb-3 sm:pb-3.5 text-white space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs sm:text-[13px] font-bold text-sky-300 drop-shadow-sm">
                  <GraduationCap className="w-4 h-4 text-sky-400 shrink-0" />
                  <span className="tracking-wide">Học sinh THPT tại TP Đà Nẵng</span>
                </div>
                <h2 className="text-sm sm:text-base font-bold text-white leading-snug drop-shadow-sm">
                  Trao đổi &amp; định hướng tương lai vững chắc
                </h2>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
