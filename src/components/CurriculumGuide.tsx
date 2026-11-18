import { MANDATORY_SUBJECTS, CAREER_PATHS } from '../data/schoolsData';
import { BookOpen, AlertCircle, Compass, CheckCircle2, Award, Lightbulb, ArrowUpRight } from 'lucide-react';
import careerOrientationImg from '../assets/images/career_orientation_workspace_1793890828694.jpg';

interface CurriculumGuideProps {
  onStartGuidance: () => void;
}

export default function CurriculumGuide({ onStartGuidance }: CurriculumGuideProps) {
  return (
    <section id="gdpt-guide" className="py-16 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Cẩm nang chương trình mới</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Hiểu rõ Chương trình GDPT 2018 Lớp 10
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Khác với chương trình cũ, học sinh lớp 10 không còn học tất cả các môn như nhau 
            mà được tự chọn tổ hợp môn định hướng nghề nghiệp gắn liền với 3 năm THPT.
          </p>
        </div>

        {/* Structure Grid: 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Pillar 1: Mandatory */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                8 Môn &amp; Hoạt động bắt buộc
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tất cả học sinh lớp 10 ở mọi trường THPT đều phải hoàn thành các môn học nền tảng này:
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {MANDATORY_SUBJECTS.map((sub, idx) => (
                  <li key={idx} className="flex items-center justify-between py-1 border-b border-slate-200/60">
                    <span className="font-medium">{sub.name}</span>
                    <span className="text-[11px] text-slate-500 tabular-nums">{sub.hours}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-2 text-[11px] text-blue-700 font-medium">
              ✓ Nền tảng văn hóa &amp; kỹ năng bắt buộc
            </div>
          </div>

          {/* Pillar 2: Elective 4 Subjects */}
          <div className="p-6 rounded-2xl border-2 border-blue-600 bg-blue-50/40 flex flex-col justify-between space-y-4 relative shadow-sm">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="text-lg font-bold text-blue-950">
                4 Môn học lựa chọn (Tổ hợp)
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                Học sinh chọn 4 môn từ 3 nhóm môn học để tạo thành tổ hợp học tập chuyên sâu:
              </p>

              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="bg-white p-2.5 rounded-lg border border-blue-100">
                  <strong className="text-blue-900 block font-semibold">Nhóm Khoa học Tự nhiên:</strong>
                  <span>Vật lí, Hóa học, Sinh học</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-blue-100">
                  <strong className="text-blue-900 block font-semibold">Nhóm Khoa học Xã hội:</strong>
                  <span>Lịch sử, Địa lí, Giáo dục Kinh tế &amp; Pháp luật</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-blue-100">
                  <strong className="text-blue-900 block font-semibold">Nhóm Công nghệ &amp; Nghệ thuật:</strong>
                  <span>Tin học, Công nghệ, Âm nhạc, Mỹ thuật</span>
                </div>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-blue-900 font-bold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Quyết định tổ hợp xét tuyển Đại học</span>
            </div>
          </div>

          {/* Pillar 3: Special study topics */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                3 Cụm chuyên đề học tập
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mỗi học sinh chọn học 3 cụm chuyên đề học tập của 3 môn học (35 tiết/cụm/năm) 
                nhằm đào sâu kiến thức hướng nghiệp:
              </p>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-800 block">Chuyên đề Toán học:</span>
                  <span>Toán tài chính, hình học không gian nâng cao, xác suất ứng dụng</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-800 block">Chuyên đề Vật lí / Hóa học:</span>
                  <span>Vật lí bán dẫn, quang học thực nghiệm, hóa dược hữu cơ</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-800 block">Chuyên đề Tin học / Ngôn ngữ:</span>
                  <span>Lập trình Python, thiết kế đồ họa, tiếng Anh thương mại</span>
                </div>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-indigo-700 font-medium">
              ✓ Tăng cường điểm thi đánh giá năng lực &amp; thi HSG
            </div>
          </div>

        </div>

        {/* Why Choosing Right Combination Matters */}
        <div id="career-paths" className="bg-slate-900 rounded-2xl p-6 sm:p-10 text-white overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 uppercase tracking-wider">
                <Lightbulb className="w-4 h-4 text-blue-400" />
                <span>Chiến lược dài hạn</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Vì sao chọn tổ hợp lớp 10 lại quyết định cơ hội vào Đại học?
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Theo quy định của Bộ GD&amp;ĐT, việc chuyển đổi tổ hợp môn học trong suốt 3 năm THPT rất phức tạp 
                do học sinh phải học bù kiến thức và thực hiện bài kiểm tra bổ sung. Chọn đúng tổ hợp ngay từ đầu 
                giúp học sinh:
              </p>
              
              <ul className="space-y-2 text-xs text-slate-200 pt-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span><strong>Tối ưu điểm học bạ (GPA):</strong> Học đúng thế mạnh giúp duy trì điểm số xuất sắc để xét tuyển học bạ vào các trường đại học top đầu.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span><strong>Đồng bộ khối thi tốt nghiệp:</strong> Kiến thức môn lựa chọn gắn chặt với cấu trúc đề thi tốt nghiệp THPT và kỳ thi Đánh giá năng lực của ĐHQG.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span><strong>Tiết kiệm thời gian ôn luyện:</strong> Không bị phân tán năng lượng vào các môn học không phục vụ ngành học mong muốn.</span>
                </li>
              </ul>

              <div className="pt-4">
                <button
                  onClick={onStartGuidance}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-900 bg-white rounded-xl hover:bg-slate-100 transition-colors cursor-pointer shadow-md"
                >
                  <Compass className="w-4 h-4 text-blue-600" />
                  <span>Kiểm tra tổ hợp phù hợp ngay</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
                <img
                  src={careerOrientationImg}
                  alt="Không gian học tập và định hướng ngành học tương lai của học sinh"
                  referrerPolicy="no-referrer"
                  className="w-full h-72 sm:h-80 object-cover"
                />
              </div>
            </div>

          </div>
        </div>

        {/* 4 Core Career Path Cards */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                4 Nhóm ngành nghề trọng điểm &amp; Tổ hợp môn tương ứng
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Tham khảo để định hình môn học tự chọn từ năm lớp 10
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CAREER_PATHS.map((career) => (
              <div
                key={career.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-blue-600">
                    Khối thi: {career.examGroup}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {career.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {career.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                  <div>
                    <span className="font-semibold text-slate-700">Tổ hợp gợi ý: </span>
                    <span>{career.recommendedGroup}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Môn tự chọn: </span>
                    <span className="text-blue-700 font-medium">
                      {career.suitableCombinations.join(', ')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
