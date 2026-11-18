import { useState, useMemo } from 'react';
import {
  School,
  DA_NANG_DISTRICTS,
  SCHOOLS_DATA,
  SubjectCombination,
} from '../data/schoolsData';
import {
  Search,
  MapPin,
  Phone,
  Globe,
  Award,
  Users,
  Compass,
  BookOpen,
  Briefcase,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  Sparkles,
  Layers,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

interface SchoolExplorerProps {
  selectedSchool: School;
  onSelectSchool: (school: School) => void;
  onStartGuidanceWithSchool: (school: School, combinationId?: string) => void;
}

export default function SchoolExplorer({
  selectedSchool,
  onSelectSchool,
  onStartGuidanceWithSchool,
}: SchoolExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Tất cả');
  const [activeCombinationId, setActiveCombinationId] = useState<string>(
    selectedSchool.combinations[0]?.id || ''
  );

  // Update activeCombination when selectedSchool changes
  const activeCombination = useMemo(() => {
    return (
      selectedSchool.combinations.find((c) => c.id === activeCombinationId) ||
      selectedSchool.combinations[0]
    );
  }, [selectedSchool, activeCombinationId]);

  // Filter schools list based on search and district
  const filteredSchools = useMemo(() => {
    return SCHOOLS_DATA.filter((school) => {
      const matchDistrict =
        selectedDistrict === 'Tất cả' || school.district === selectedDistrict;
      const matchSearch =
        school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.address.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDistrict && matchSearch;
    });
  }, [searchQuery, selectedDistrict]);

  const handleSchoolChange = (school: School) => {
    onSelectSchool(school);
    setActiveCombinationId(school.combinations[0]?.id || '');
  };

  return (
    <section id="schools" className="py-14 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 uppercase tracking-wider">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span>Mạng lưới các trường THPT Đà Nẵng</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Khám phá trường THPT &amp; Tổ hợp môn lớp 10
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Mỗi trường THPT tại thành phố Đà Nẵng có cách xây dựng các nhóm tổ hợp môn lựa chọn 
            và chuyên đề học tập khác nhau. Chọn trường bạn đã trúng tuyển để tra cứu chi tiết.
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên trường (Lê Quý Đôn, Phan Châu Trinh, Hoàng Hoa Thám...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all text-slate-800 placeholder:text-slate-400"
              />
            </div>

            {/* Quick School Selector Dropdown */}
            <div className="w-full md:w-80">
              <label htmlFor="school-select" className="sr-only">Chọn nhanh trường THPT</label>
              <select
                id="school-select"
                value={selectedSchool.id}
                onChange={(e) => {
                  const s = SCHOOLS_DATA.find((item) => item.id === e.target.value);
                  if (s) handleSchoolChange(s);
                }}
                className="w-full px-3.5 py-2.5 text-sm font-medium bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
              >
                {SCHOOLS_DATA.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name} ({school.district})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* District Filter Buttons (Interactive filter controls) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none text-xs">
            <span className="text-slate-500 font-medium whitespace-nowrap shrink-0 mr-1">
              Khu vực:
            </span>
            {DA_NANG_DISTRICTS.map((district) => {
              const active = selectedDistrict === district;
              return (
                <button
                  key={district}
                  onClick={() => setSelectedDistrict(district)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {district}
                </button>
              );
            })}
          </div>

          {/* Quick School Carousel / Horizontal Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 pt-2">
            {filteredSchools.map((school) => {
              const isSelected = school.id === selectedSchool.id;
              return (
                <button
                  key={school.id}
                  onClick={() => handleSchoolChange(school)}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-600'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                  }`}
                >
                  <div>
                    <p className={`text-xs font-bold leading-snug line-clamp-1 ${
                      isSelected ? 'text-blue-900' : 'text-slate-800'
                    }`}>
                      {school.shortName}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Quận {school.district}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[10px] text-slate-600">
                    <span className="font-semibold text-blue-700">{school.benchmarkScore}</span>
                    <span className="text-slate-400">{school.combinations.length} tổ hợp</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected School Detailed Profile Area */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Top Banner & Photo Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-slate-200">
            {/* School Photograph */}
            <div className="lg:col-span-5 relative h-64 lg:h-auto min-h-[260px] bg-slate-900">
              <img
                src={selectedSchool.image}
                alt={selectedSchool.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent flex flex-col justify-end p-6 text-white">
                <div className="text-xs font-semibold text-blue-300">
                  Trường THPT tại {selectedSchool.district}, TP. Đà Nẵng
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight mt-1">
                  {selectedSchool.name}
                </h3>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-200">
                  <span>Thành lập: {selectedSchool.foundedYear}</span>
                  <span aria-hidden="true">·</span>
                  <span>Điểm chuẩn: {selectedSchool.benchmarkScore}</span>
                </div>
              </div>
            </div>

            {/* School Quick Stats & Contact */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                      Thông tin trường tuyển sinh
                    </span>
                    <h4 className="text-lg font-bold text-slate-900">
                      {selectedSchool.name}
                    </h4>
                  </div>

                  <button
                    onClick={() => onStartGuidanceWithSchool(selectedSchool)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-[0.98] transition-all cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Tư vấn tổ hợp trường này</span>
                  </button>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {selectedSchool.description}
                </p>

                {/* Contact & Meta rows */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="truncate">{selectedSchool.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{selectedSchool.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="truncate text-blue-600 hover:underline">{selectedSchool.website}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Chỉ tiêu tuyển sinh lớp 10: {selectedSchool.studentQuota} học sinh</span>
                  </div>
                </div>
              </div>

              {/* School highlights list */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span>Điểm nổi bật của nhà trường:</span>
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                  {selectedSchool.strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-blue-600 font-bold">✓</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Combinations Selector & Breakdown */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600" />
                  <span>Các nhóm tổ hợp môn lớp 10 tại {selectedSchool.shortName}</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chọn từng tổ hợp dưới đây để xem 4 môn lựa chọn, chuyên đề và cơ hội nghề nghiệp
                </p>
              </div>

              {/* Number of combinations available */}
              <div className="text-xs font-medium text-slate-600">
                Nhà trường đang mở <span className="font-bold text-blue-700">{selectedSchool.combinations.length}</span> nhóm tổ hợp
              </div>
            </div>

            {/* Combination Select Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {selectedSchool.combinations.map((comb) => {
                const isActive = activeCombination?.id === comb.id;
                return (
                  <button
                    key={comb.id}
                    onClick={() => setActiveCombinationId(comb.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer border ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>{comb.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Detailed Active Combination Card */}
            {activeCombination && (
              <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-6 space-y-6">
                
                {/* Combination Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold text-blue-600">
                      Mã tổ hợp: {activeCombination.code} · Hướng trọng tâm: {activeCombination.focusArea}
                    </div>
                    <h5 className="text-xl font-extrabold text-slate-900 mt-1">
                      {activeCombination.name}
                    </h5>
                  </div>

                  <button
                    onClick={() => onStartGuidanceWithSchool(selectedSchool, activeCombination.id)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto"
                  >
                    <span>Kiểm tra độ phù hợp của tôi</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Subject grid breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Elective subjects card */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span>4 Môn học lựa chọn bắt buộc học suốt 3 năm:</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {activeCombination.electiveSubjects.map((subject, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-2 bg-blue-50/60 border border-blue-100 rounded-lg text-xs font-semibold text-blue-900 flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                          <span>{subject}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Special study topics card */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>3 Cụm chuyên đề học tập chuyên sâu (35 tiết/cụm):</span>
                    </div>
                    <div className="space-y-1.5">
                      {activeCombination.specialTopics.map((topic, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-lg text-xs text-slate-700 flex items-center gap-2"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* University majors & Career prospects */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-900 block mb-2">
                      Tổ hợp xét tuyển ĐH mục tiêu
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeCombination.targetExamGroups.map((group, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded-md"
                        >
                          {group}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-900 block mb-2">
                      Ngành đại học trọng điểm
                    </span>
                    <ul className="text-xs text-slate-600 space-y-1">
                      {activeCombination.targetMajors.map((major, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="text-blue-500">·</span>
                          <span>{major}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-900 block mb-2 flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      <span>Nghề nghiệp tương lai</span>
                    </span>
                    <ul className="text-xs text-slate-600 space-y-1">
                      {activeCombination.careerProspects.map((career, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="text-blue-500">·</span>
                          <span>{career}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Suitable for note */}
                <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4 text-xs text-blue-950 flex items-start gap-2.5">
                  <Compass className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold text-blue-900">Học sinh phù hợp: </strong>
                    <span>{activeCombination.suitableFor}</span>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}
