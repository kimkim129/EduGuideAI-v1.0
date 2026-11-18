import { Compass } from 'lucide-react';

interface FooterProps {
  onNavigateHome: () => void;
  onNavigateGuidanceStep: (step: 1 | 2 | 3 | 4) => void;
}

export default function Footer({
  onNavigateHome,
  onNavigateGuidanceStep,
}: FooterProps) {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Brand & Purpose */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5 text-white font-bold text-lg">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Compass className="w-4 h-4" />
              </div>
              <span>EduGuide AI – Hướng nghiệp thông minh</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Ứng dụng hỗ trợ học sinh trúng tuyển lớp 10 lựa chọn tổ hợp môn học theo định hướng nghề nghiệp, 
              chuẩn chương trình GDPT 2018 tại các trường THPT thành phố Đà Nẵng.
            </p>
            <div className="text-[11px] text-slate-500">
              * Bản thử nghiệm giao diện và dữ liệu mẫu xem trước. Không yêu cầu đăng nhập và không lưu trữ thông tin cá nhân.
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Điều hướng nhanh
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={onNavigateHome}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Trang chủ
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateGuidanceStep(1)}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Chọn trường THPT Đà Nẵng
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateGuidanceStep(2)}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Khám phá Holland (RIASEC)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateGuidanceStep(3)}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Chọn nguyện vọng đại học
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateGuidanceStep(4)}
                  className="hover:text-white transition-colors text-left text-blue-400 font-semibold cursor-pointer"
                >
                  Xem kết quả tư vấn tổ hợp
                </button>
              </li>
            </ul>
          </div>

          {/* Da Nang School Clusters */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Các trường THPT tiêu biểu
            </h4>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="text-slate-400">THPT Phan Châu Trinh</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">THPT Hoàng Hoa Thám</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">THPT Hòa Vang</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">THPT Trần Phú</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">THPT Thái Phiên</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">THPT Nguyễn Khuyến</span>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              Phát triển vì cộng đồng học sinh, phụ huynh và giáo viên THPT Đà Nẵng.
            </p>
          </div>

        </div>

        {/* Khối lời chúc ý nghĩa gửi tới các em học sinh THPT */}
        <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-center flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-slate-300">
          <span className="text-amber-400 text-base">✨</span>
          <p className="text-xs sm:text-[13px] font-semibold text-slate-200">
            Chúc các em học tập thật tốt, chọn đúng tổ hợp môn học sở trường, vững bước trên hành trình THPT và tự tin chinh phục ước mơ đại học tương lai! 🎓
          </p>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left text-xs text-slate-400 gap-2">
          <div>
            © 2026 EduGuide AI · Hướng nghiệp thông minh. Chọn đúng tổ hợp – Vững bước tương lai.
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span>Dành cho học sinh THPT tại TP Đà Nẵng</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
