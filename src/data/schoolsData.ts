import schoolCampusImg from '../assets/images/school_campus_danang_1793890829229.jpg';
import heroEduguideImg from '../assets/images/hero_eduguide_students_1793890827676.jpg';
import careerOrientationImg from '../assets/images/career_orientation_workspace_1793890828694.jpg';

export interface SubjectCombination {
  id: string;
  name: string;
  code: string;
  focusArea: 'KHTN' | 'KHXH' | 'Kinh tế & Ngôn ngữ' | 'Công nghệ & Kỹ thuật';
  electiveSubjects: string[]; // 4 môn tự chọn
  specialTopics: string[]; // 3 cụm chuyên đề học tập
  targetMajors: string[]; // Các ngành đại học phù hợp
  targetExamGroups: string[]; // Tổ hợp xét tuyển đại học (A00, A01, D01...)
  careerProspects: string[]; // Nghề nghiệp tiêu biểu
  suitableFor: string;
}

export interface School {
  id: string;
  name: string;
  shortName: string;
  district: string;
  address: string;
  phone: string;
  website: string;
  foundedYear: number;
  benchmarkScore: string; // Điểm chuẩn tuyển sinh tham khảo
  studentQuota: number; // Chỉ tiêu tuyển sinh lớp 10 tham khảo
  image: string;
  badgeColor: string;
  description: string;
  strengths: string[];
  combinations: SubjectCombination[];
}

export const DA_NANG_DISTRICTS = [
  'Tất cả',
  'Hải Châu',
  'Thanh Khê',
  'Sơn Trà',
  'Ngũ Hành Sơn',
  'Liên Chiểu',
  'Cẩm Lệ',
  'Hòa Vang'
] as const;

export const SCHOOLS_DATA: School[] = [
  {
    id: 'thpt-phan-chau-trinh',
    name: 'Trường THPT Phan Châu Trinh',
    shortName: 'THPT Phan Châu Trinh',
    district: 'Hải Châu',
    address: '154 Lê Lợi, Phường Hải Châu 1, Quận Hải Châu, TP. Đà Nẵng',
    phone: '0236 3822 559',
    website: 'thptphanchautrinh.edu.vn',
    foundedYear: 1952,
    benchmarkScore: '58.13 điểm',
    studentQuota: 1360,
    image: schoolCampusImg,
    badgeColor: 'from-blue-600 to-indigo-700',
    description: 'Trường THPT có bề dày lịch sử và chất lượng giáo dục hàng đầu thành phố Đà Nẵng. Trường luôn tiên phong trong việc đổi mới phương pháp dạy học và xây dựng các tổ hợp môn học định hướng đại học chất lượng cao.',
    strengths: [
      'Top trường THPT công lập có điểm chuẩn đầu vào cao nhất Đà Nẵng',
      'Đội ngũ giáo viên giàu kinh nghiệm, nhiều giải thưởng quốc gia',
      'Cơ sở vật chất hiện đại với phòng thí nghiệm STEM, sân bóng đá, thư viện số',
      'Hoạt động ngoại khóa và câu lạc bộ học thuật phát triển sôi nổi'
    ],
    combinations: [
      {
        id: 'pct-khtn-1',
        name: 'Tổ hợp Tự nhiên 1 (Vật lí - Hóa học - Sinh học - Tin học)',
        code: 'TN01-PCT',
        focusArea: 'KHTN',
        electiveSubjects: ['Vật lí', 'Hóa học', 'Sinh học', 'Tin học'],
        specialTopics: ['Toán học chuyên đề', 'Vật lí chuyên đề', 'Hóa học chuyên đề'],
        targetMajors: ['Y đa khoa', 'Dược học', 'Kỹ thuật Y sinh', 'Khoa học máy tính', 'Kỹ thuật Điện tử - Viễn thông'],
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'B00 (Toán, Hóa, Sinh)', 'A01 (Toán, Lí, Anh)'],
        careerProspects: ['Bác sĩ / Dược sĩ', 'Kỹ sư phần mềm / AI', 'Kỹ sư Vi mạch bán dẫn', 'Nhà nghiên cứu Sinh học'],
        suitableFor: 'Học sinh có tư duy logic tốt, yêu thích môn Toán, khoa học tự nhiên và định hướng thi các trường Đại học Y Dược, Bách Khoa, CNTT.'
      },
      {
        id: 'pct-khtn-2',
        name: 'Tổ hợp Công nghệ Kỹ thuật (Vật lí - Hóa học - Tin học - Công nghệ CN)',
        code: 'TN02-PCT',
        focusArea: 'Công nghệ & Kỹ thuật',
        electiveSubjects: ['Vật lí', 'Hóa học', 'Tin học', 'Công nghệ Công nghiệp'],
        specialTopics: ['Toán học nâng cao', 'Vật lí ứng dụng', 'Tin học chuyên đề'],
        targetMajors: ['Kỹ thuật Phần mềm', 'Trí tuệ nhân tạo (AI)', 'Cơ điện tử & Robotics', 'Kỹ thuật Hàng không'],
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)'],
        careerProspects: ['Kỹ sư AI / Lập trình viên', 'Kỹ sư Tự động hóa & Robotics', 'Kỹ sư Cơ điện tử'],
        suitableFor: 'Học sinh đam mê lập trình, chế tạo thiết bị thông minh, công nghệ số và muốn theo học khối ngành kỹ thuật công nghệ cao.'
      },
      {
        id: 'pct-kinhte',
        name: 'Tổ hợp Kinh tế & Ngoại ngữ (Địa lí - GDKT&PL - Tin học - Vật lí)',
        code: 'KT01-PCT',
        focusArea: 'Kinh tế & Ngôn ngữ',
        electiveSubjects: ['Địa lí', 'Giáo dục Kinh tế & Pháp luật', 'Tin học', 'Vật lí'],
        specialTopics: ['Toán học tài chính', 'Tiếng Anh thương mại', 'GDKT&PL chuyên đề'],
        targetMajors: ['Quản trị kinh doanh', 'Kinh tế quốc tế', 'Tài chính - Ngân hàng', 'Logistics & Quỗi cung ứng'],
        targetExamGroups: ['D01 (Toán, Văn, Anh)', 'A01 (Toán, Lí, Anh)', 'D07 (Toán, Hóa, Anh)'],
        careerProspects: ['Chuyên viên Phân tích Tài chính', 'Chuyên gia Marketing', 'Quản trị viên Logistics', 'Doanh nhân khởi nghiệp'],
        suitableFor: 'Học sinh năng động, có thế mạnh môn Tiếng Anh và Toán, thích kinh doanh, thương mại quốc tế và môi trường đa văn hóa.'
      },
      {
        id: 'pct-khxh',
        name: 'Tổ hợp Khoa học Xã hội (Lịch sử - Địa lí - GDKT&PL - Tin học)',
        code: 'XH01-PCT',
        focusArea: 'KHXH',
        electiveSubjects: ['Lịch sử', 'Địa lí', 'Giáo dục Kinh tế & Pháp luật', 'Tin học'],
        specialTopics: ['Ngữ văn chuyên đề', 'Lịch sử văn hóa', 'Pháp luật đại cương'],
        targetMajors: ['Luật kinh tế / Luật học', 'Báo chí & Truyền thông', 'Quan hệ Quốc tế', 'Sư phạm / Tâm lý học'],
        targetExamGroups: ['C00 (Văn, Sử, Địa)', 'D01 (Toán, Văn, Anh)', 'D14 (Văn, Sử, Anh)'],
        careerProspects: ['Luật sư / Tư vấn pháp lý', 'Nhà báo / Biên tập viên truyền thông', 'Chuyên viên Đối ngoại', 'Nhà tâm lý học'],
        suitableFor: 'Học sinh có khả năng ngôn ngữ tốt, tư duy phản biện sắc sảo, quan tâm đến các vấn đề xã hội, luật pháp và truyền thông.'
      }
    ]
  },
  {
    id: 'thpt-chuyen-le-quy-don',
    name: 'Trường THPT Chuyên Lê Quý Đôn',
    shortName: 'THPT Chuyên Lê Quý Đôn',
    district: 'Sơn Trà',
    address: '01 Vũ Văn Dũng, Phường An Hải Tây, Quận Sơn Trà, TP. Đà Nẵng',
    phone: '0236 3944 844',
    website: 'thpt-lequydon-danang.edu.vn',
    foundedYear: 1986,
    benchmarkScore: 'Thi tuyển chuyên riêng',
    studentQuota: 300,
    image: heroEduguideImg,
    badgeColor: 'from-amber-600 to-blue-700',
    description: 'Trường THPT Chuyên trọng điểm quốc gia tại thành phố Đà Nẵng, đào tạo nhân tài cho khu vực miền Trung và cả nước với thành tích học sinh giỏi quốc gia và Olympic quốc tế hàng đầu.',
    strengths: [
      'Chương trình bồi dưỡng chuyên sâu theo từng môn chuyên KHTN, KHXH, Tin học, Ngoại ngữ',
      'Cơ sở vật chất hiện đại hàng đầu với ký túc xá, bể bơi, nhà đa năng, phòng thí nghiệm cao cấp',
      'Cơ hội học bổng du học quốc tế và tuyển thẳng vào các đại học danh tiếng',
      'Môi trường học tập năng động, hội tụ học sinh xuất sắc nhất Đà Nẵng và Quảng Nam'
    ],
    combinations: [
      {
        id: 'lqd-chuyen-tin-toan',
        name: 'Tổ hợp Chuyên sâu Công nghệ & Toán Tin (Toán - Tin - Vật lí - Hóa học)',
        code: 'CHUYEN-TIN',
        focusArea: 'Công nghệ & Kỹ thuật',
        electiveSubjects: ['Tin học', 'Vật lí', 'Hóa học', 'Công nghệ Công nghiệp'],
        specialTopics: ['Toán chuyên sâu', 'Thuật toán & Lập trình thi đấu', 'Vật lí ứng dụng'],
        targetMajors: ['Khoa học Máy tính', 'Trí tuệ nhân tạo', 'An toàn thông tin', 'Thiết kế Vi mạch'],
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)'],
        careerProspects: ['Kỹ sư AI / Lập trình viên cao cấp', 'Chuyên gia Bảo mật mạng', 'Kiến trúc sư giải pháp phần mềm'],
        suitableFor: 'Học sinh đam mê toán tin, mong muốn chinh phục kỳ thi HSG quốc gia và theo đuổi các ngành công nghệ đỉnh cao.'
      },
      {
        id: 'lqd-chuyen-hoa-sinh',
        name: 'Tổ hợp Chuyên sâu Khoa học Sự sống & Y sinh (Hóa học - Sinh học - Vật lí - Tin học)',
        code: 'CHUYEN-SINH',
        focusArea: 'KHTN',
        electiveSubjects: ['Hóa học', 'Sinh học', 'Vật lí', 'Tin học'],
        specialTopics: ['Hóa sinh chuyên sâu', 'Sinh học phân tử & Di truyền', 'Toán ứng dụng'],
        targetMajors: ['Y đa khoa', 'Dược học', 'Công nghệ Sinh học', 'Kỹ thuật Y sinh'],
        targetExamGroups: ['B00 (Toán, Hóa, Sinh)', 'A00 (Toán, Lí, Hóa)'],
        careerProspects: ['Bác sĩ chuyên khoa', 'Nhà nghiên cứu Y sinh học', 'Chuyên gia Công nghệ Di truyền'],
        suitableFor: 'Học sinh có thiên hướng nghiên cứu y dược, y sinh học và hóa sinh chuyên sâu.'
      },
      {
        id: 'lqd-chuyen-ngoai-ngu',
        name: 'Tổ hợp Chuyên sâu Ngoại ngữ & Kinh tế Toàn cầu (Địa lí - GDKT&PL - Tin học - Vật lí)',
        code: 'CHUYEN-ANH',
        focusArea: 'Kinh tế & Ngôn ngữ',
        electiveSubjects: ['Địa lí', 'GDKT&PL', 'Tin học', 'Vật lí'],
        specialTopics: ['Tiếng Anh học thuật (IELTS/SAT)', 'Toán học kinh tế', 'Văn hóa thế giới'],
        targetMajors: ['Kinh tế Quốc tế', 'Quan hệ Quốc tế', 'Kinh doanh Quốc tế', 'Truyền thông Đa phương tiện'],
        targetExamGroups: ['D01 (Toán, Văn, Anh)', 'A01 (Toán, Lí, Anh)'],
        careerProspects: ['Nhà ngoại giao', 'Chuyên viên Phân tích Đầu tư Quốc tế', 'Giám đốc Thương hiệu'],
        suitableFor: 'Học sinh định hướng hội nhập quốc tế, săn học bổng du học hoặc ứng tuyển các trường đại học quốc tế tại Việt Nam.'
      }
    ]
  },
  {
    id: 'thpt-hoang-hoa-tham',
    name: 'Trường THPT Hoàng Hoa Thám',
    shortName: 'THPT Hoàng Hoa Thám',
    district: 'Sơn Trà',
    address: '63 Phạm Cự Lượng, Phường An Hải Đông, Quận Sơn Trà, TP. Đà Nẵng',
    phone: '0236 3844 772',
    website: 'thpthoanghoathamdanang.edu.vn',
    foundedYear: 1963,
    benchmarkScore: '53.88 điểm',
    studentQuota: 560,
    image: schoolCampusImg,
    badgeColor: 'from-sky-600 to-blue-800',
    description: 'Trường THPT danh tiếng tại bờ Đông sông Hàn, có bề dày thành tích xuất sắc trong các kỳ thi tốt nghiệp và đại học. Học sinh Hoàng Hoa Thám nổi tiếng tự tin, sáng tạo và học giỏi toàn diện.',
    strengths: [
      'Top 3 trường THPT công lập có điểm chuẩn đầu vào cao nhất thành phố',
      'Cơ sở khang trang, phòng thực hành máy tính và phòng thí nghiệm hiện đại',
      'Tập trung phát triển các câu lạc bộ Tiếng Anh, CLB Robotics, CLB Nghệ thuật',
      'Tỉ lệ học sinh đỗ đại học nguyện vọng 1 đạt trên 95%'
    ],
    combinations: [
      {
        id: 'hht-khtn-stem',
        name: 'Tổ hợp Khoa học Kỹ thuật STEM (Vật lí - Hóa học - Sinh học - Tin học)',
        code: 'TN01-HHT',
        focusArea: 'KHTN',
        electiveSubjects: ['Vật lí', 'Hóa học', 'Sinh học', 'Tin học'],
        specialTopics: ['Toán ứng dụng', 'Vật lí thực nghiệm', 'Hóa học đời sống'],
        targetMajors: ['Công nghệ thông tin', 'Tự động hóa', 'Kỹ thuật Hóa học', 'Khoa học Dữ liệu'],
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)', 'B00 (Toán, Hóa, Sinh)'],
        careerProspects: ['Kỹ sư CNTT / Lập trình viên', 'Chuyên gia Khoa học Dữ liệu', 'Kỹ sư Tự động hóa'],
        suitableFor: 'Học sinh muốn học vững kiến thức tự nhiên, định hướng các ngành kỹ thuật, công nghệ cao và khoa học máy tính.'
      },
      {
        id: 'hht-kinhte-d01',
        name: 'Tổ hợp Kinh tế Thương mại & Tiếng Anh (Địa lí - GDKT&PL - Vật lí - Tin học)',
        code: 'KT01-HHT',
        focusArea: 'Kinh tế & Ngôn ngữ',
        electiveSubjects: ['Địa lí', 'GDKT&PL', 'Vật lí', 'Tin học'],
        specialTopics: ['Toán học kinh tế', 'Tiếng Anh giao tiếp quốc tế', 'GDKT&PL'],
        targetMajors: ['Kinh tế đối ngoại', 'Marketing số', 'Tài chính doanh nghiệp', 'Thương mại điện tử'],
        targetExamGroups: ['D01 (Toán, Văn, Anh)', 'A01 (Toán, Lí, Anh)'],
        careerProspects: ['Chuyên viên Marketing & Truyền thông số', 'Quản lý Dự án Thương mại điện tử', 'Chuyên viên Tín dụng ngân hàng'],
        suitableFor: 'Học sinh yêu thích kinh tế, giao tiếp ngoại ngữ tốt, có xu hướng làm việc trong các công ty đa quốc gia.'
      },
      {
        id: 'hht-khxh-nghethuat',
        name: 'Tổ hợp Xã hội & Truyền thông Hiện đại (Lịch sử - Địa lí - GDKT&PL - Âm nhạc/Tin học)',
        code: 'XH01-HHT',
        focusArea: 'KHXH',
        electiveSubjects: ['Lịch sử', 'Địa lí', 'GDKT&PL', 'Tin học'],
        specialTopics: ['Văn học đương đại', 'Lịch sử văn hóa', 'Truyền thông đại chúng'],
        targetMajors: ['Báo chí', 'Quan hệ công chúng (PR)', 'Luật học', 'Du lịch & Khách sạn'],
        targetExamGroups: ['C00 (Văn, Sử, Địa)', 'D01 (Toán, Văn, Anh)', 'D14 (Văn, Sử, Anh)'],
        careerProspects: ['Chuyên viên PR / Tổ chức sự kiện', 'Nhà báo / Sáng tạo nội dung số', 'Luật sư'],
        suitableFor: 'Học sinh có thiên hướng nghệ thuật, xã hội, năng khiếu viết lách và diễn đạt trước công chúng.'
      }
    ]
  },
  {
    id: 'thpt-hoa-vang',
    name: 'Trường THPT Hòa Vang',
    shortName: 'THPT Hòa Vang',
    district: 'Cẩm Lệ',
    address: '101 Ông Ích Đường, Phường Khuê Trung, Quận Cẩm Lệ, TP. Đà Nẵng',
    phone: '0236 3846 137',
    website: 'thpthoavang.danang.edu.vn',
    foundedYear: 1961,
    benchmarkScore: '55.63 điểm',
    studentQuota: 520,
    image: schoolCampusImg,
    badgeColor: 'from-blue-700 to-cyan-800',
    description: 'Trường THPT giàu truyền thống hiếu học và kỷ luật, luôn đứng trong top đầu thành phố về điểm trung bình thi đại học. Thầy cô tận tâm, học sinh chăm ngoan và có thành tích học tập vượt trội.',
    strengths: [
      'Điểm chuẩn tuyển sinh top 2 toàn thành phố Đà Nẵng liên tục nhiều năm',
      'Tập trung luyện thi tốt nghiệp THPT và đại học với kết quả thủ khoa, á khoa xuất sắc',
      'Môi trường rèn luyện nền nếp, kỷ luật và phong trào đoàn đội vững mạnh',
      'Không gian học đường xanh, sạch, thân thiện và an toàn'
    ],
    combinations: [
      {
        id: 'hv-khtn-toan-li-hoa',
        name: 'Tổ hợp Tự nhiên Chuẩn Bách Khoa (Vật lí - Hóa học - Sinh học - Tin học)',
        code: 'TN01-HV',
        focusArea: 'KHTN',
        electiveSubjects: ['Vật lí', 'Hóa học', 'Sinh học', 'Tin học'],
        specialTopics: ['Toán học chuyên sâu', 'Vật lí giải bài tập nâng cao', 'Hóa học thực nghiệm'],
        targetMajors: ['Kỹ thuật Cơ khí', 'Kỹ thuật Điện - Điện tử', 'Kỹ thuật Xây dựng', 'Công nghệ Hóa học'],
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'B00 (Toán, Hóa, Sinh)'],
        careerProspects: ['Kỹ sư Cơ khí chính xác', 'Kỹ sư Điện lực', 'Kỹ sư Xây dựng công trình', 'Dược sĩ'],
        suitableFor: 'Học sinh kiên trì, chăm chỉ, có nền tảng Toán - Tự nhiên vững vàng muốn đỗ các trường đại học kỹ thuật hàng đầu.'
      },
      {
        id: 'hv-kinhte-taichinh',
        name: 'Tổ hợp Kinh tế Tài chính & Luật (Địa lí - GDKT&PL - Tin học - Vật lí)',
        code: 'KT01-HV',
        focusArea: 'Kinh tế & Ngôn ngữ',
        electiveSubjects: ['Địa lí', 'GDKT&PL', 'Tin học', 'Vật lí'],
        specialTopics: ['Toán ứng dụng', 'Pháp luật trong kinh doanh', 'Kỹ năng số'],
        targetMajors: ['Kiểm toán', 'Kế toán', 'Tài chính - Ngân hàng', 'Luật Kinh tế'],
        targetExamGroups: ['D01 (Toán, Văn, Anh)', 'A01 (Toán, Lí, Anh)'],
        careerProspects: ['Kiểm toán viên Big4', 'Chuyên viên Tín dụng', 'Tư vấn Thuế & Tài chính'],
        suitableFor: 'Học sinh cẩn thận, chi tiết, thích các con số và văn bản pháp luật, hướng đến các trường ĐH Kinh tế Đà Nẵng, Kinh tế Quốc dân.'
      }
    ]
  },
  {
    id: 'thpt-tran-phu',
    name: 'Trường THPT Trần Phú',
    shortName: 'THPT Trần Phú',
    district: 'Hải Châu',
    address: '11 Lê Thánh Tôn, Phường Hải Châu 1, Quận Hải Châu, TP. Đà Nẵng',
    phone: '0236 3822 935',
    website: 'thpttranphudanang.edu.vn',
    foundedYear: 1978,
    benchmarkScore: '51.75 điểm',
    studentQuota: 760,
    image: careerOrientationImg,
    badgeColor: 'from-indigo-600 to-blue-700',
    description: 'Ngôi trường tọa lạc tại vị trí trung tâm sầm uất của thành phố, nổi bật với phong trào học sinh tích cực, tinh thần sáng tạo và môi trường học tập hiện đại, cởi mở.',
    strengths: [
      'Vị trí trung tâm thuận tiện di chuyển, cơ sở vật chất không ngừng nâng cấp',
      'Định hướng phát triển toàn diện cả kiến thức học thuật lẫn kỹ năng mềm',
      'Các câu lạc bộ truyền thông, âm nhạc, bóng rổ hoạt động sôi nổi',
      'Học sinh tự tin, năng động trong giao lưu quốc tế'
    ],
    combinations: [
      {
        id: 'tp-khtn-congnghe',
        name: 'Tổ hợp Tự nhiên & Công nghệ Ứng dụng (Vật lí - Hóa học - Tin học - Công nghệ CN)',
        code: 'TN01-TP',
        focusArea: 'Công nghệ & Kỹ thuật',
        electiveSubjects: ['Vật lí', 'Hóa học', 'Tin học', 'Công nghệ Công nghiệp'],
        specialTopics: ['Toán học chuyên đề', 'Vật lí thực hành', 'Tin học ứng dụng'],
        targetMajors: ['Công nghệ thông tin', 'Thiết kế đồ họa số', 'Kỹ thuật Ô tô', 'Thương mại điện tử'],
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)'],
        careerProspects: ['Lập trình viên Web/App', 'Kỹ sư Công nghệ Ô tô', 'UI/UX Designer'],
        suitableFor: 'Học sinh năng động, thích thực hành công nghệ, sáng tạo sản phẩm số và kỹ thuật.'
      },
      {
        id: 'tp-khxh-ngonngu',
        name: 'Tổ hợp Xã hội & Ngoại ngữ Du lịch (Lịch sử - Địa lí - GDKT&PL - Tin học)',
        code: 'XH01-TP',
        focusArea: 'Kinh tế & Ngôn ngữ',
        electiveSubjects: ['Lịch sử', 'Địa lí', 'GDKT&PL', 'Tin học'],
        specialTopics: ['Tiếng Anh giao tiếp', 'Văn hóa Du lịch Đà Nẵng', 'Địa lí kinh tế'],
        targetMajors: ['Quản trị Khách sạn', 'Ngôn ngữ Anh / Nhật / Hàn', 'Du lịch lữ hành', 'Truyền thông sự kiện'],
        targetExamGroups: ['D01 (Toán, Văn, Anh)', 'C00 (Văn, Sử, Địa)', 'D14 (Văn, Sử, Anh)'],
        careerProspects: ['Quản lý Khách sạn quốc tế', 'Hướng dẫn viên du lịch quốc tế', 'Biên phiên dịch viên'],
        suitableFor: 'Học sinh yêu thích du lịch Đà Nẵng, giao lưu văn hóa và đam mê học ngoại ngữ.'
      }
    ]
  },
  {
    id: 'thpt-thai-phien',
    name: 'Trường THPT Thái Phiên',
    shortName: 'THPT Thái Phiên',
    district: 'Thanh Khê',
    address: '733 Trần Cao Vân, Phường Thanh Khê Đông, Quận Thanh Khê, TP. Đà Nẵng',
    phone: '0236 3756 099',
    website: 'thptthaiphien.danang.edu.vn',
    foundedYear: 1963,
    benchmarkScore: '49.50 điểm',
    studentQuota: 720,
    image: schoolCampusImg,
    badgeColor: 'from-blue-600 to-teal-700',
    description: 'Trường THPT trọng điểm quận Thanh Khê với bề dày hơn 60 năm xây dựng và phát triển. Đội ngũ giáo viên tâm huyết, nhiều thế hệ học sinh thành đạt trong nhiều lĩnh vực.',
    strengths: [
      'Bề dày truyền thống giáo dục hơn 60 năm',
      'Đội ngũ giáo viên cốt cán cấp thành phố giàu chuyên môn',
      'Cơ sở vật chất rộng rãi, nhiều cây xanh, sân thể thao tiêu chuẩn',
      'Phong trào thể dục thể thao và văn nghệ luôn đạt thành tích cao'
    ],
    combinations: [
      {
        id: 'tpn-khtn',
        name: 'Tổ hợp Khoa học Tự nhiên Chuẩn (Vật lí - Hóa học - Sinh học - Tin học)',
        code: 'TN-TPN',
        focusArea: 'KHTN',
        electiveSubjects: ['Vật lí', 'Hóa học', 'Sinh học', 'Tin học'],
        specialTopics: ['Toán học chuyên đề', 'Vật lí chuyên đề', 'Hóa học chuyên đề'],
        targetMajors: ['Kỹ thuật Điện tử', 'Khoa học Môi trường', 'Sư phạm KHTN', 'Y học dự phòng'],
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'B00 (Toán, Hóa, Sinh)', 'A01 (Toán, Lí, Anh)'],
        careerProspects: ['Kỹ sư Môi trường', 'Giáo viên KHTN', 'Kỹ thuật viên xét nghiệm'],
        suitableFor: 'Học sinh định hướng học đều các môn KHTN, mở rộng cơ hội đăng ký cả khối A00 và B00.'
      },
      {
        id: 'tpn-khxh',
        name: 'Tổ hợp Xã hội & Pháp luật (Lịch sử - Địa lí - GDKT&PL - Tin học)',
        code: 'XH-TPN',
        focusArea: 'KHXH',
        electiveSubjects: ['Lịch sử', 'Địa lí', 'GDKT&PL', 'Tin học'],
        specialTopics: ['Ngữ văn chuyên đề', 'Lịch sử thế giới', 'Kinh tế học đại cương'],
        targetMajors: ['Luật học', 'Quản trị nhân lực', 'Xã hội học', 'Sư phạm Văn/Sử'],
        targetExamGroups: ['C00 (Văn, Sử, Địa)', 'D01 (Toán, Văn, Anh)'],
        careerProspects: ['Chuyên viên Pháp chế', 'Chuyên viên Tuyển dụng & Đào tạo', 'Giáo viên THPT'],
        suitableFor: 'Học sinh yêu thích văn học, lịch sử, có khả năng tư duy biện luận và muốn theo đuổi ngành luật, nhân sự.'
      }
    ]
  },
  {
    id: 'thpt-nguyen-khuyen',
    name: 'Trường THPT Nguyễn Khuyến',
    shortName: 'THPT Nguyễn Khuyến',
    district: 'Cẩm Lệ',
    address: '02 Đặng Xuân Bảng, Phường Khuê Trung, Quận Cẩm Lệ, TP. Đà Nẵng',
    phone: '0236 3695 565',
    website: 'thptnguyenkhuyen.danang.edu.vn',
    foundedYear: 2003,
    benchmarkScore: '43.25 điểm',
    studentQuota: 560,
    image: careerOrientationImg,
    badgeColor: 'from-cyan-600 to-blue-700',
    description: 'Ngôi trường khang trang, năng động với mô hình giáo dục thân thiện, phát huy tối đa năng lực cá nhân của từng học sinh, chú trọng kỹ năng hội nhập và chuyển đổi số.',
    strengths: [
      'Khuôn viên trường mới, phòng học máy chiếu và điều hòa đồng bộ',
      'Thầy cô trẻ trung, tận tâm, đồng hành sát sao cùng học sinh',
      'Định hướng nghề nghiệp thực tế ngay từ đầu năm lớp 10',
      'Nhiều hoạt động trải nghiệm sáng tạo và câu lạc bộ kỹ năng'
    ],
    combinations: [
      {
        id: 'nk-khtn',
        name: 'Tổ hợp Kỹ thuật Số & Tin học (Vật lí - Hóa học - Tin học - Công nghệ CN)',
        code: 'TN-NK',
        focusArea: 'Công nghệ & Kỹ thuật',
        electiveSubjects: ['Vật lí', 'Hóa học', 'Tin học', 'Công nghệ Công nghiệp'],
        specialTopics: ['Toán ứng dụng', 'Tin học đồ họa', 'Vật lí thực hành'],
        targetMajors: ['Công nghệ Kỹ thuật Điện tử', 'Kỹ thuật Máy tính', 'Thương mại điện tử'],
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)'],
        careerProspects: ['Kỹ thuật viên Phần cứng/Mạng', 'Chuyên viên Vận hành Hệ thống', 'Kỹ sư Lắp ráp Điện tử'],
        suitableFor: 'Học sinh có sở thích về máy tính, công nghệ, muốn chọn ngành nghề có nhu cầu tuyển dụng cao.'
      },
      {
        id: 'nk-kinhte',
        name: 'Tổ hợp Kinh tế Xã hội (Địa lí - GDKT&PL - Tin học - Sinh học)',
        code: 'KT-NK',
        focusArea: 'Kinh tế & Ngôn ngữ',
        electiveSubjects: ['Địa lí', 'GDKT&PL', 'Tin học', 'Sinh học'],
        specialTopics: ['GDKT&PL chuyên đề', 'Toán học kinh tế', 'Địa lí dịch vụ'],
        targetMajors: ['Quản trị kinh doanh', 'Marketing', 'Quản trị Khách sạn & Nhà hàng'],
        targetExamGroups: ['D01 (Toán, Văn, Anh)', 'C00 (Văn, Sử, Địa)'],
        careerProspects: ['Nhân viên Kinh doanh (Sales)', 'Chuyên viên Dịch vụ Khách hàng', 'Quản trị viên Nhà hàng'],
        suitableFor: 'Học sinh hòa đồng, thích giao tiếp, muốn làm việc trong khối ngành dịch vụ thương mại phát triển.'
      }
    ]
  },
  {
    id: 'thpt-nguyen-trai',
    name: 'Trường THPT Nguyễn Trãi',
    shortName: 'THPT Nguyễn Trãi',
    district: 'Liên Chiểu',
    address: '01 Phan Văn Định, Phường Hòa Khánh Bắc, Quận Liên Chiểu, TP. Đà Nẵng',
    phone: '0236 3842 308',
    website: 'thptnguyentraidanang.edu.vn',
    foundedYear: 1980,
    benchmarkScore: '46.00 điểm',
    studentQuota: 600,
    image: schoolCampusImg,
    badgeColor: 'from-blue-700 to-indigo-900',
    description: 'Trường THPT lớn nhất khu vực Liên Chiểu, nằm cạnh làng đại học và các khu công nghiệp công nghệ cao Đà Nẵng, mang lại lợi thế lớn trong việc liên kết hướng nghiệp kỹ thuật công nghệ.',
    strengths: [
      'Gần các trường Đại học Bách Khoa, Sư phạm Đà Nẵng, thuận tiện tham quan hướng nghiệp',
      'Mô hình liên kết hướng nghiệp công nghệ cao với các doanh nghiệp khu công nghiệp',
      'Đội ngũ giáo viên giàu kinh nghiệm luyện thi đại học khối KHTN',
      'Sân vận động và nhà thi đấu đa năng hiện đại'
    ],
    combinations: [
      {
        id: 'nt-khtn-congnghiep',
        name: 'Tổ hợp Tự nhiên Công nghệ Cao (Vật lí - Hóa học - Tin học - Công nghệ CN)',
        code: 'TN01-NT',
        focusArea: 'Công nghệ & Kỹ thuật',
        electiveSubjects: ['Vật lí', 'Hóa học', 'Tin học', 'Công nghệ Công nghiệp'],
        specialTopics: ['Toán học chuyên đề', 'Vật lí kỹ thuật', 'Lập trình ứng dụng'],
        targetMajors: ['Kỹ thuật Cơ khí', 'Công nghệ Ô tô', 'Tự động hóa', 'Công nghệ Thông tin'],
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)'],
        careerProspects: ['Kỹ sư Nhà máy Công nghệ cao', 'Kỹ sư Ô tô', 'Lập trình viên IoT'],
        suitableFor: 'Học sinh định hướng học kỹ thuật tại ĐH Bách Khoa Đà Nẵng hoặc làm việc trong các khu công nghệ cao.'
      },
      {
        id: 'nt-kinhte-d01',
        name: 'Tổ hợp Quản trị & Ngoại ngữ (Địa lí - GDKT&PL - Tin học - Vật lí)',
        code: 'KT01-NT',
        focusArea: 'Kinh tế & Ngôn ngữ',
        electiveSubjects: ['Địa lí', 'GDKT&PL', 'Tin học', 'Vật lí'],
        specialTopics: ['Tiếng Anh ứng dụng', 'Toán tài chính', 'Quản trị căn bản'],
        targetMajors: ['Quản trị Chuỗi cung ứng', 'Logistics', 'Kinh tế Đầu tư'],
        targetExamGroups: ['D01 (Toán, Văn, Anh)', 'A01 (Toán, Lí, Anh)'],
        careerProspects: ['Chuyên viên Logistics & Kho bãi cảng Liên Chiểu', 'Nhân viên Xuất nhập khẩu'],
        suitableFor: 'Học sinh nắm bắt cơ hội phát triển cảng nước sâu và logistics tại khu vực Liên Chiểu - Đà Nẵng.'
      }
    ]
  },
  {
    id: 'thpt-ngu-hanh-son',
    name: 'Trường THPT Ngũ Hành Sơn',
    shortName: 'THPT Ngũ Hành Sơn',
    district: 'Ngũ Hành Sơn',
    address: '115 Lê Văn Hiến, Phường Khuê Mỹ, Quận Ngũ Hành Sơn, TP. Đà Nẵng',
    phone: '0236 3847 219',
    website: 'thptnguhanhson.edu.vn',
    foundedYear: 1997,
    benchmarkScore: '40.50 điểm',
    studentQuota: 440,
    image: careerOrientationImg,
    badgeColor: 'from-sky-700 to-blue-800',
    description: 'Tọa lạc tại vùng đất danh thắng Ngũ Hành Sơn thanh bình, trường chú trọng phát triển toàn diện nhân cách, ngoại ngữ và kỹ năng hội nhập, tiếp cận làng đại học Đà Nẵng.',
    strengths: [
      'Gần khu đô thị Làng Đại học Đà Nẵng và các trường đại học quốc tế',
      'Đẩy mạnh câu lạc bộ Tiếng Anh và kỹ năng du lịch dịch vụ',
      'Không gian học tập yên tĩnh, thoáng mát dưới bóng danh thắng Ngũ Hành Sơn',
      'Mối gắn kết chặt chẽ giữa nhà trường, phụ huynh và học sinh'
    ],
    combinations: [
      {
        id: 'nhs-dulich-ngonngu',
        name: 'Tổ hợp Ngôn ngữ & Dịch vụ Quốc tế (Địa lí - GDKT&PL - Tin học - Lịch sử)',
        code: 'NN-NHS',
        focusArea: 'Kinh tế & Ngôn ngữ',
        electiveSubjects: ['Địa lí', 'GDKT&PL', 'Tin học', 'Lịch sử'],
        specialTopics: ['Tiếng Anh giao tiếp nâng cao', 'Văn hóa Du lịch Biển', 'Kỹ năng số'],
        targetMajors: ['Quản trị Khách sạn & Resort cao cấp', 'Ngôn ngữ Anh', 'Quan hệ Quốc tế'],
        targetExamGroups: ['D01 (Toán, Văn, Anh)', 'D14 (Văn, Sử, Anh)'],
        careerProspects: ['Quản lý Resort ven biển', 'Chuyên viên Điều hành Tour', 'Chuyên gia Truyền thông Thương hiệu'],
        suitableFor: 'Học sinh yêu thích cảnh quan, ngoại ngữ và mong muốn phát triển trong chuỗi khách sạn resort 5 sao tại Đà Nẵng.'
      },
      {
        id: 'nhs-khtn',
        name: 'Tổ hợp Kỹ thuật & Khoa học Tự nhiên (Vật lí - Hóa học - Sinh học - Tin học)',
        code: 'TN-NHS',
        focusArea: 'KHTN',
        electiveSubjects: ['Vật lí', 'Hóa học', 'Sinh học', 'Tin học'],
        specialTopics: ['Toán học chuyên đề', 'Vật lí thực nghiệm', 'Hóa sinh đại cương'],
        targetMajors: ['Kỹ thuật Y sinh', 'Khoa học Môi trường biển', 'Công nghệ Thông tin'],
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)', 'B00 (Toán, Hóa, Sinh)'],
        careerProspects: ['Kỹ sư Môi trường', 'Lập trình viên phần mềm', 'Dược sĩ'],
        suitableFor: 'Học sinh có thiên hướng tự nhiên và muốn học tập tại các trường thuộc Đại học Đà Nẵng.'
      }
    ]
  },
  {
    id: 'thpt-cam-le',
    name: 'Trường THPT Cẩm Lệ',
    shortName: 'THPT Cẩm Lệ',
    district: 'Cẩm Lệ',
    address: 'Phường Hòa Xuân, Quận Cẩm Lệ, TP. Đà Nẵng',
    phone: '0236 3678 123',
    website: 'thptcamle.edu.vn',
    foundedYear: 2012,
    benchmarkScore: '42.75 điểm',
    studentQuota: 480,
    image: schoolCampusImg,
    badgeColor: 'from-blue-600 to-indigo-800',
    description: 'Trường THPT trẻ trung, tọa lạc tại khu đô thị mới Hòa Xuân hiện đại, có cơ sở vật chất mới khang trang và tinh thần đổi mới giảng dạy nhiệt huyết.',
    strengths: [
      'Trường mới khang trang, phòng học thông minh trang bị hiện đại',
      'Môi trường năng động, văn minh, an ninh trật tự tốt',
      'Định hướng đổi mới giáo dục theo hướng phát triển năng lực học sinh',
      'Tập trung hỗ trợ học sinh lựa chọn tổ hợp môn phù hợp ngay từ lớp 10'
    ],
    combinations: [
      {
        id: 'cl-khtn',
        name: 'Tổ hợp KHTN Hiện Đại (Vật lí - Hóa học - Sinh học - Tin học)',
        code: 'TN-CL',
        focusArea: 'KHTN',
        electiveSubjects: ['Vật lí', 'Hóa học', 'Sinh học', 'Tin học'],
        specialTopics: ['Toán nâng cao', 'Vật lí chuyên đề', 'Hóa học chuyên đề'],
        targetMajors: ['Công nghệ Thông tin', 'Kỹ thuật Xây dựng', 'Nông nghiệp Công nghệ cao'],
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)', 'B00 (Toán, Hóa, Sinh)'],
        careerProspects: ['Kỹ sư Phần mềm', 'Kỹ sư Thiết kế Đô thị', 'Chuyên viên Nông nghiệp sạch'],
        suitableFor: 'Học sinh thích khám phá tự nhiên, công nghệ và quy hoạch đô thị.'
      },
      {
        id: 'cl-khxh',
        name: 'Tổ hợp Khoa học Xã hội & Pháp luật (Lịch sử - Địa lí - GDKT&PL - Tin học)',
        code: 'XH-CL',
        focusArea: 'KHXH',
        electiveSubjects: ['Lịch sử', 'Địa lí', 'GDKT&PL', 'Tin học'],
        specialTopics: ['Văn học đời sống', 'Pháp luật thực hành', 'Kỹ năng giao tiếp'],
        targetMajors: ['Luật hành chính', 'Báo chí', 'Công tác xã hội', 'Sư phạm'],
        targetExamGroups: ['C00 (Văn, Sử, Địa)', 'D01 (Toán, Văn, Anh)'],
        careerProspects: ['Cán bộ Pháp chế', 'Chuyên viên Hành chính công', 'Giáo viên'],
        suitableFor: 'Học sinh có thiên hướng xã hội, thích đọc sách, tranh biện và tìm hiểu pháp luật.'
      }
    ]
  },
  {
    id: 'thpt-son-tra',
    name: 'Trường THPT Sơn Trà',
    shortName: 'THPT Sơn Trà',
    district: 'Sơn Trà',
    address: '01 Lê Văn Thứ, Phường Mân Thái, Quận Sơn Trà, TP. Đà Nẵng',
    phone: '0236 3922 414',
    website: 'thptsontra.danang.edu.vn',
    foundedYear: 2008,
    benchmarkScore: '41.50 điểm',
    studentQuota: 440,
    image: schoolCampusImg,
    badgeColor: 'from-blue-600 to-sky-700',
    description: 'Trường THPT năng động tại bán đảo Sơn Trà, chú trọng định hướng phát triển du lịch, ngôn ngữ và dịch vụ biển.',
    strengths: [
      'Gần các khu du lịch biển và trung tâm dịch vụ quận Sơn Trà',
      'Đẩy mạnh hoạt động ngoại khóa kỹ năng sống và câu lạc bộ Tiếng Anh',
      'Đội ngũ giáo viên nhiệt huyết, quan tâm sâu sát đến từng học sinh'
    ],
    combinations: [
      {
        id: 'st-khtn',
        name: 'Tổ hợp Tự nhiên & Tin học (Vật lí - Hóa học - Sinh học - Tin học)',
        code: 'TN-ST',
        focusArea: 'KHTN',
        electiveSubjects: ['Vật lí', 'Hóa học', 'Sinh học', 'Tin học'],
        specialTopics: ['Toán ứng dụng', 'Vật lí thực hành', 'Tin học văn phòng'],
        targetMajors: ['Công nghệ thông tin', 'Khoa học Môi trường', 'Kỹ thuật Điện'],
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)'],
        careerProspects: ['Lập trình viên', 'Kỹ thuật viên Mạng', 'Kỹ sư Điện'],
        suitableFor: 'Học sinh định hướng khối ngành kỹ thuật và khoa học tự nhiên.'
      },
      {
        id: 'st-khxh',
        name: 'Tổ hợp Xã hội & Dịch vụ Du lịch (Lịch sử - Địa lí - GDKT&PL - Tin học)',
        code: 'XH-ST',
        focusArea: 'KHXH',
        electiveSubjects: ['Lịch sử', 'Địa lí', 'GDKT&PL', 'Tin học'],
        specialTopics: ['Địa lí du lịch biển', 'Tiếng Anh giao tiếp', 'GDKT&PL'],
        targetMajors: ['Quản trị Dịch vụ Du lịch & Lữ hành', 'Khách sạn', 'Xã hội học'],
        targetExamGroups: ['C00 (Văn, Sử, Địa)', 'D01 (Toán, Văn, Anh)'],
        careerProspects: ['Hướng dẫn viên du lịch', 'Quản lý lữ hành', 'Chuyên viên Tổ chức sự kiện'],
        suitableFor: 'Học sinh năng động, thích giao tiếp và định hướng ngành du lịch biển Đà Nẵng.'
      }
    ]
  },
  {
    id: 'thpt-ton-that-tung',
    name: 'Trường THPT Tôn Thất Tùng',
    shortName: 'THPT Tôn Thất Tùng',
    district: 'Sơn Trà',
    address: '200 Trần Nhân Tông, Phường An Hải Bắc, Quận Sơn Trà, TP. Đà Nẵng',
    phone: '0236 3933 667',
    website: 'thpttonthattung.edu.vn',
    foundedYear: 2004,
    benchmarkScore: '34.75 điểm',
    studentQuota: 480,
    image: careerOrientationImg,
    badgeColor: 'from-blue-600 to-indigo-700',
    description: 'Ngôi trường mang tên vị bác sĩ tài hoa Tôn Thất Tùng, chú trọng rèn đức luyện tài và giáo dục hướng nghiệp thực tiễn.',
    strengths: [
      'Phong trào thanh niên tình nguyện và rèn luyện kỹ năng số năng động',
      'Môi trường giáo dục thân thiện, an toàn và kỷ cương'
    ],
    combinations: [
      {
        id: 'ttt-khtn',
        name: 'Tổ hợp KHTN Cơ bản (Vật lí - Hóa học - Sinh học - Công nghệ)',
        code: 'TN-TTT',
        focusArea: 'KHTN',
        electiveSubjects: ['Vật lí', 'Hóa học', 'Sinh học', 'Công nghệ'],
        specialTopics: ['Toán học chuyên đề', 'Hóa sinh đại cương', 'Vật lí thực hành'],
        targetMajors: ['Điều dưỡng', 'Kỹ thuật Xét nghiệm Y học', 'Công nghệ Nông nghiệp'],
        targetExamGroups: ['B00 (Toán, Hóa, Sinh)', 'A00 (Toán, Lí, Hóa)'],
        careerProspects: ['Điều dưỡng viên', 'Kỹ thuật viên y tế', 'Cử nhân Sinh học'],
        suitableFor: 'Học sinh muốn theo học khối ngành y tế, sức khỏe và nông nghiệp sạch.'
      },
      {
        id: 'ttt-khxh',
        name: 'Tổ hợp KHXH & Kinh tế (Địa lí - GDKT&PL - Lịch sử - Tin học)',
        code: 'XH-TTT',
        focusArea: 'KHXH',
        electiveSubjects: ['Địa lí', 'GDKT&PL', 'Lịch sử', 'Tin học'],
        specialTopics: ['Pháp luật công dân', 'Địa lí kinh tế', 'Ngữ văn nâng cao'],
        targetMajors: ['Quản trị kinh doanh', 'Luật', 'Sư phạm'],
        targetExamGroups: ['C00 (Văn, Sử, Địa)', 'D01 (Toán, Văn, Anh)'],
        careerProspects: ['Nhân viên kinh doanh', 'Tư vấn viên pháp lý', 'Giáo viên'],
        suitableFor: 'Học sinh yêu thích tìm hiểu kinh tế xã hội và pháp luật.'
      }
    ]
  },
  {
    id: 'thpt-thanh-khe',
    name: 'Trường THPT Thanh Khê',
    shortName: 'THPT Thanh Khê',
    district: 'Thanh Khê',
    address: '202 Uy Nỗ, Phường An Khê, Quận Thanh Khê, TP. Đà Nẵng',
    phone: '0236 3724 668',
    website: 'thptthanhkhe.danang.edu.vn',
    foundedYear: 2007,
    benchmarkScore: '38.00 điểm',
    studentQuota: 440,
    image: schoolCampusImg,
    badgeColor: 'from-sky-600 to-blue-800',
    description: 'Trường THPT tại khu vực trung tâm quận Thanh Khê với cơ sở vật chất khang trang, phong trào học tập tiến bộ không ngừng.',
    strengths: [
      'Không gian học đường xanh mát, sạch đẹp, an ninh đảm bảo',
      'Thầy cô gần gũi, hỗ trợ học sinh phương pháp học tập hiệu quả'
    ],
    combinations: [
      {
        id: 'tk-khtn',
        name: 'Tổ hợp Tự nhiên & Ứng dụng (Vật lí - Hóa học - Tin học - Công nghệ CN)',
        code: 'TN-TK',
        focusArea: 'Công nghệ & Kỹ thuật',
        electiveSubjects: ['Vật lí', 'Hóa học', 'Tin học', 'Công nghệ Công nghiệp'],
        specialTopics: ['Toán ứng dụng', 'Vật lí kỹ thuật', 'Tin học chuyên đề'],
        targetMajors: ['Kỹ thuật Cơ khí', 'Công nghệ Thông tin', 'Kỹ thuật Điện tử'],
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)'],
        careerProspects: ['Kỹ sư cơ khí', 'Kỹ thuật viên CNTT', 'Kỹ sư tự động hóa'],
        suitableFor: 'Học sinh yêu thích kỹ thuật thực hành và công nghệ máy móc.'
      },
      {
        id: 'tk-kinhte',
        name: 'Tổ hợp Kinh tế & Pháp luật (Địa lí - GDKT&PL - Tin học - Lịch sử)',
        code: 'KT-TK',
        focusArea: 'Kinh tế & Ngôn ngữ',
        electiveSubjects: ['Địa lí', 'GDKT&PL', 'Tin học', 'Lịch sử'],
        specialTopics: ['Kinh tế thương mại', 'Pháp luật doanh nghiệp', 'Toán tài chính'],
        targetMajors: ['Marketing', 'Kế toán', 'Quản trị chuỗi cung ứng'],
        targetExamGroups: ['D01 (Toán, Văn, Anh)', 'C00 (Văn, Sử, Địa)'],
        careerProspects: ['Chuyên viên Marketing', 'Kế toán viên', 'Chuyên viên Xuất nhập khẩu'],
        suitableFor: 'Học sinh năng động, thích môi trường kinh doanh dịch vụ.'
      }
    ]
  },
  {
    id: 'thpt-vo-chi-cong',
    name: 'Trường THPT Võ Chí Công',
    shortName: 'THPT Võ Chí Công',
    district: 'Ngũ Hành Sơn',
    address: 'Khu tái định cư Tân Trà, Phường Hòa Hải, Quận Ngũ Hành Sơn, TP. Đà Nẵng',
    phone: '0236 3968 112',
    website: 'thptvochicong.danang.edu.vn',
    foundedYear: 2015,
    benchmarkScore: '38.25 điểm',
    studentQuota: 400,
    image: careerOrientationImg,
    badgeColor: 'from-blue-700 to-indigo-800',
    description: 'Ngôi trường hiện đại tiếp giáp khu đô thị Làng Đại học Đà Nẵng và các trường đại học công nghệ quốc tế.',
    strengths: [
      'Trường lớp mới, trang thiết bị phòng thí nghiệm và máy tính đồng bộ',
      'Lợi thế kết nối hướng nghiệp cùng các trường đại học lân cận'
    ],
    combinations: [
      {
        id: 'vcc-khtn',
        name: 'Tổ hợp Tự nhiên & Số hóa (Vật lí - Hóa học - Sinh học - Tin học)',
        code: 'TN-VCC',
        focusArea: 'KHTN',
        electiveSubjects: ['Vật lí', 'Hóa học', 'Sinh học', 'Tin học'],
        specialTopics: ['Toán học chuyên sâu', 'Vật lí số', 'Hóa sinh ứng dụng'],
        targetMajors: ['Công nghệ Phần mềm', 'Khoa học Dữ liệu', 'Kỹ thuật Môi trường'],
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)'],
        careerProspects: ['Lập trình viên', 'Chuyên viên Phân tích dữ liệu', 'Kỹ sư Viễn thông'],
        suitableFor: 'Học sinh đam mê số hóa, máy tính và công nghệ.'
      },
      {
        id: 'vcc-khxh',
        name: 'Tổ hợp Xã hội & Ngoại ngữ (Lịch sử - Địa lí - GDKT&PL - Tin học)',
        code: 'XH-VCC',
        focusArea: 'KHXH',
        electiveSubjects: ['Lịch sử', 'Địa lí', 'GDKT&PL', 'Tin học'],
        specialTopics: ['Tiếng Anh ứng dụng', 'Văn hóa du lịch', 'Pháp luật đại cương'],
        targetMajors: ['Quản trị Khách sạn', 'Quan hệ Quốc tế', 'Ngôn ngữ Anh'],
        targetExamGroups: ['D01 (Toán, Văn, Anh)', 'C00 (Văn, Sử, Địa)'],
        careerProspects: ['Quản lý Khách sạn', 'Chuyên viên Truyền thông', 'Hướng dẫn viên'],
        suitableFor: 'Học sinh định hướng ngành dịch vụ, du lịch quốc tế ven biển.'
      }
    ]
  },
  {
    id: 'thpt-lien-chieu',
    name: 'Trường THPT Liên Chiểu',
    shortName: 'THPT Liên Chiểu',
    district: 'Liên Chiểu',
    address: 'Khu dân cư Hòa Minh 2, Phường Hòa Minh, Quận Liên Chiểu, TP. Đà Nẵng',
    phone: '0236 3768 899',
    website: 'thptlienchieu.danang.edu.vn',
    foundedYear: 2013,
    benchmarkScore: '40.00 điểm',
    studentQuota: 440,
    image: schoolCampusImg,
    badgeColor: 'from-blue-600 to-teal-700',
    description: 'Trường THPT phát triển nhanh chóng tại trung tâm quận Liên Chiểu với môi trường năng động, phát huy sở trường học sinh.',
    strengths: [
      'Gần các trường đại học Bách Khoa, Sư phạm, Giao thông Vận tải',
      'Định hướng nghề nghiệp thực tiễn gắn liền khu công nghiệp'
    ],
    combinations: [
      {
        id: 'lc-khtn',
        name: 'Tổ hợp Kỹ thuật Cơ bản (Vật lí - Hóa học - Tin học - Công nghệ CN)',
        code: 'TN-LC',
        focusArea: 'Công nghệ & Kỹ thuật',
        electiveSubjects: ['Vật lí', 'Hóa học', 'Tin học', 'Công nghệ Công nghiệp'],
        specialTopics: ['Toán ứng dụng', 'Vật lí thực hành', 'Tin học chuyên đề'],
        targetMajors: ['Kỹ thuật Giao thông', 'Kỹ thuật Điện', 'Công nghệ Thông tin'],
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)'],
        careerProspects: ['Kỹ sư Cầu đường', 'Kỹ sư Điện lực', 'Kỹ thuật viên Mạng'],
        suitableFor: 'Học sinh định hướng học kỹ thuật công nghiệp và xây dựng.'
      },
      {
        id: 'lc-khxh',
        name: 'Tổ hợp Kinh tế & Pháp luật (Địa lí - GDKT&PL - Tin học - Sinh học)',
        code: 'KT-LC',
        focusArea: 'Kinh tế & Ngôn ngữ',
        electiveSubjects: ['Địa lí', 'GDKT&PL', 'Tin học', 'Sinh học'],
        specialTopics: ['GDKT&PL chuyên sâu', 'Địa lí kinh tế', 'Toán tài chính'],
        targetMajors: ['Quản trị kinh doanh', 'Logistics', 'Kinh tế Đầu tư'],
        targetExamGroups: ['D01 (Toán, Văn, Anh)', 'A01 (Toán, Lí, Anh)'],
        careerProspects: ['Nhân viên Xuất nhập khẩu', 'Chuyên viên Kinh doanh', 'Nhân viên Ngân hàng'],
        suitableFor: 'Học sinh định hướng ngành kinh tế và thương mại.'
      }
    ]
  },
  {
    id: 'thpt-phan-thanh-tai',
    name: 'Trường THPT Phan Thành Tài',
    shortName: 'THPT Phan Thành Tài',
    district: 'Hòa Vang',
    address: 'Xã Hòa Châu, Huyện Hòa Vang, TP. Đà Nẵng',
    phone: '0236 3684 017',
    website: 'thptphanthanhtai.edu.vn',
    foundedYear: 2002,
    benchmarkScore: '39.75 điểm',
    studentQuota: 440,
    image: schoolCampusImg,
    badgeColor: 'from-blue-700 to-indigo-900',
    description: 'Trường THPT giàu truyền thống hiếu học của huyện Hòa Vang, đào tạo nhiều thế hệ học sinh chăm ngoan, đỗ đạt cao.',
    strengths: [
      'Không gian trường học yên tĩnh, trong lành, gắn bó với phụ huynh địa phương',
      'Đội ngũ giáo viên nhiều kinh nghiệm bồi dưỡng học sinh thi đại học'
    ],
    combinations: [
      {
        id: 'ptt-khtn',
        name: 'Tổ hợp Khoa học Tự nhiên Chuẩn (Vật lí - Hóa học - Sinh học - Tin học)',
        code: 'TN-PTT',
        focusArea: 'KHTN',
        electiveSubjects: ['Vật lí', 'Hóa học', 'Sinh học', 'Tin học'],
        specialTopics: ['Toán học chuyên đề', 'Vật lí thực hành', 'Hóa học đại cương'],
        targetMajors: ['Kỹ thuật Cơ khí', 'Nông nghiệp Công nghệ cao', 'Sư phạm KHTN'],
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'B00 (Toán, Hóa, Sinh)'],
        careerProspects: ['Kỹ sư nông nghiệp', 'Kỹ sư cơ khí', 'Giáo viên'],
        suitableFor: 'Học sinh học đều các môn tự nhiên, chăm chỉ, kiên trì.'
      },
      {
        id: 'ptt-khxh',
        name: 'Tổ hợp Xã hội & Pháp luật (Lịch sử - Địa lí - GDKT&PL - Tin học)',
        code: 'XH-PTT',
        focusArea: 'KHXH',
        electiveSubjects: ['Lịch sử', 'Địa lí', 'GDKT&PL', 'Tin học'],
        specialTopics: ['Lịch sử Việt Nam', 'Pháp luật công dân', 'Văn học đời sống'],
        targetMajors: ['Luật', 'Sư phạm Lịch sử / Địa lí', 'Báo chí'],
        targetExamGroups: ['C00 (Văn, Sử, Địa)', 'D01 (Toán, Văn, Anh)'],
        careerProspects: ['Cán bộ tư pháp', 'Giáo viên THCS/THPT', 'Biên tập viên'],
        suitableFor: 'Học sinh có thiên hướng xã hội và văn hóa lịch sử.'
      }
    ]
  },
  {
    id: 'thpt-ong-ich-khiem',
    name: 'Trường THPT Ông Ích Khiêm',
    shortName: 'THPT Ông Ích Khiêm',
    district: 'Hòa Vang',
    address: 'Xã Hòa Phong, Huyện Hòa Vang, TP. Đà Nẵng',
    phone: '0236 3788 123',
    website: 'thptongichkhiem.edu.vn',
    foundedYear: 2001,
    benchmarkScore: '36.50 điểm',
    studentQuota: 440,
    image: schoolCampusImg,
    badgeColor: 'from-blue-600 to-cyan-800',
    description: 'Trường THPT mang tên danh nhân Ông Ích Khiêm, trung tâm giáo dục chất lượng cao phía Nam huyện Hòa Vang.',
    strengths: [
      'Truyền thống học sinh vượt khó học giỏi, nhiều thủ khoa đại học nông thôn',
      'Phong trào rèn luyện kỹ năng và thể thao học đường phát triển mạnh'
    ],
    combinations: [
      {
        id: 'oik-khtn',
        name: 'Tổ hợp Tự nhiên Thực hành (Vật lí - Hóa học - Sinh học - Công nghệ)',
        code: 'TN-OIK',
        focusArea: 'KHTN',
        electiveSubjects: ['Vật lí', 'Hóa học', 'Sinh học', 'Công nghệ'],
        specialTopics: ['Toán học chuyên đề', 'Hóa học ứng dụng', 'Sinh học môi trường'],
        targetMajors: ['Y tế dự phòng', 'Thú y', 'Kỹ thuật Sinh học', 'Cơ khí'],
        targetExamGroups: ['B00 (Toán, Hóa, Sinh)', 'A00 (Toán, Lí, Hóa)'],
        careerProspects: ['Bác sĩ thú y', 'Kỹ sư nông học', 'Kỹ thuật viên xét nghiệm'],
        suitableFor: 'Học sinh yêu thích thế giới tự nhiên và các ngành thực hành sinh hóa.'
      },
      {
        id: 'oik-khxh',
        name: 'Tổ hợp Xã hội & Quản lý (Lịch sử - Địa lí - GDKT&PL - Tin học)',
        code: 'XH-OIK',
        focusArea: 'KHXH',
        electiveSubjects: ['Lịch sử', 'Địa lí', 'GDKT&PL', 'Tin học'],
        specialTopics: ['Địa lí kinh tế địa phương', 'Pháp luật cơ sở', 'Kỹ năng số'],
        targetMajors: ['Quản trị kinh doanh', 'Công tác xã hội', 'Hành chính công'],
        targetExamGroups: ['C00 (Văn, Sử, Địa)', 'D01 (Toán, Văn, Anh)'],
        careerProspects: ['Cán bộ hành chính', 'Nhân viên kinh doanh', 'Tư vấn viên'],
        suitableFor: 'Học sinh thích giao tiếp, tổ chức công việc và hiểu biết pháp luật.'
      }
    ]
  },
  {
    id: 'thpt-pham-phu-thu',
    name: 'Trường THPT Phạm Phú Thứ',
    shortName: 'THPT Phạm Phú Thứ',
    district: 'Hòa Vang',
    address: 'Xã Hòa Sơn, Huyện Hòa Vang, TP. Đà Nẵng',
    phone: '0236 3794 219',
    website: 'thptphamphuthu.edu.vn',
    foundedYear: 2000,
    benchmarkScore: '37.75 điểm',
    studentQuota: 440,
    image: careerOrientationImg,
    badgeColor: 'from-blue-700 to-indigo-800',
    description: 'Ngôi trường mang tên nhà canh tân Phạm Phú Thứ, nổi tiếng với tinh thần đổi mới và nỗ lực học tập không ngừng.',
    strengths: [
      'Đội ngũ giáo viên tận tâm, đồng hành hỗ trợ ôn thi chu đáo',
      'Cơ sở vật chất được nâng cấp hiện đại, sân bóng tiêu chuẩn'
    ],
    combinations: [
      {
        id: 'ppt-khtn',
        name: 'Tổ hợp Tự nhiên & Kỹ thuật (Vật lí - Hóa học - Tin học - Công nghệ CN)',
        code: 'TN-PPT',
        focusArea: 'Công nghệ & Kỹ thuật',
        electiveSubjects: ['Vật lí', 'Hóa học', 'Tin học', 'Công nghệ Công nghiệp'],
        specialTopics: ['Toán ứng dụng', 'Vật lí kỹ thuật', 'Lập trình căn bản'],
        targetMajors: ['Kỹ thuật Điện tử', 'Cơ điện tử', 'Kỹ thuật Phần mềm'],
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)'],
        careerProspects: ['Kỹ sư điện', 'Kỹ thuật viên máy tính', 'Kỹ sư tự động hóa'],
        suitableFor: 'Học sinh định hướng kỹ thuật và làm việc trong khu công nghiệp công nghệ cao.'
      },
      {
        id: 'ppt-khxh',
        name: 'Tổ hợp Xã hội Nhân văn (Lịch sử - Địa lí - GDKT&PL - Tin học)',
        code: 'XH-PPT',
        focusArea: 'KHXH',
        electiveSubjects: ['Lịch sử', 'Địa lí', 'GDKT&PL', 'Tin học'],
        specialTopics: ['Ngữ văn chuyên sâu', 'Lịch sử thế giới', 'Pháp luật công dân'],
        targetMajors: ['Sư phạm', 'Luật', 'Xã hội học', 'Du lịch'],
        targetExamGroups: ['C00 (Văn, Sử, Địa)', 'D01 (Toán, Văn, Anh)'],
        careerProspects: ['Giáo viên', 'Chuyên viên pháp chế', 'Hướng dẫn viên'],
        suitableFor: 'Học sinh có thế mạnh môn Văn, Sử, Địa và thích nghiên cứu xã hội.'
      }
    ]
  },
  {
    id: 'thpt-quang-trung',
    name: 'Trường THPT Quang Trung',
    shortName: 'THPT Quang Trung',
    district: 'Hải Châu',
    address: '68 Đỗ Thúc Tịnh, Phường Khuê Trung, Quận Cẩm Lệ, TP. Đà Nẵng',
    phone: '0236 3672 345',
    website: 'thptquangtrungdanang.edu.vn',
    foundedYear: 2011,
    benchmarkScore: '35.00 điểm',
    studentQuota: 360,
    image: schoolCampusImg,
    badgeColor: 'from-blue-600 to-indigo-700',
    description: 'Trường THPT tư thục chất lượng cao với mô hình lớp học sĩ số nhỏ, quản lý bán trú chu đáo và giáo dục định hướng cá nhân hóa.',
    strengths: [
      'Sĩ số lớp nhỏ từ 25-30 học sinh, giáo viên kèm cặp sát sao',
      'Định hướng ngoại ngữ và kỹ năng tin học văn phòng quốc tế MOS'
    ],
    combinations: [
      {
        id: 'qt-kinhte',
        name: 'Tổ hợp Kinh tế & Ngoại ngữ (Địa lí - GDKT&PL - Tin học - Vật lí)',
        code: 'KT-QT',
        focusArea: 'Kinh tế & Ngôn ngữ',
        electiveSubjects: ['Địa lí', 'GDKT&PL', 'Tin học', 'Vật lí'],
        specialTopics: ['Tiếng Anh ứng dụng', 'Toán tài chính', 'Tin học văn phòng MOS'],
        targetMajors: ['Quản trị kinh doanh', 'Marketing số', 'Kế toán'],
        targetExamGroups: ['D01 (Toán, Văn, Anh)', 'A01 (Toán, Lí, Anh)'],
        careerProspects: ['Chuyên viên Marketing', 'Kế toán viên', 'Nhân viên kinh doanh'],
        suitableFor: 'Học sinh muốn tập trung phát triển kỹ năng ngoại ngữ và kinh tế ứng dụng.'
      }
    ]
  },
  {
    id: 'thpt-hermann-gmeiner',
    name: 'Trường Phổ thông Hermann Gmeiner',
    shortName: 'THPT Hermann Gmeiner',
    district: 'Ngũ Hành Sơn',
    address: 'Làng SOS Đà Nẵng, Phường Khuê Mỹ, Quận Ngũ Hành Sơn, TP. Đà Nẵng',
    phone: '0236 3958 777',
    website: 'hermanngmeiner-danang.edu.vn',
    foundedYear: 1994,
    benchmarkScore: '35.50 điểm',
    studentQuota: 320,
    image: careerOrientationImg,
    badgeColor: 'from-sky-600 to-blue-700',
    description: 'Trường phổ thông liên cấp uy tín của tổ chức Làng trẻ em SOS, giàu giá trị nhân văn và môi trường rèn luyện kỷ luật, nhân ái.',
    strengths: [
      'Môi trường giáo dục nhân văn, rèn luyện phẩm chất và lòng trắc ẩn',
      'Định hướng nghề nghiệp hướng nghiệp sớm và đào tạo ngoại ngữ'
    ],
    combinations: [
      {
        id: 'hg-khtn',
        name: 'Tổ hợp Tự nhiên Cơ bản (Vật lí - Hóa học - Sinh học - Tin học)',
        code: 'TN-HG',
        focusArea: 'KHTN',
        electiveSubjects: ['Vật lí', 'Hóa học', 'Sinh học', 'Tin học'],
        specialTopics: ['Toán ứng dụng', 'Vật lí thực hành', 'Hóa học đời sống'],
        targetMajors: ['Khoa học Tự nhiên', 'Kỹ thuật', 'Nông nghiệp sạch'],
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'B00 (Toán, Hóa, Sinh)'],
        careerProspects: ['Kỹ thuật viên', 'Cử nhân sinh học', 'Nhân viên công nghệ'],
        suitableFor: 'Học sinh chăm ngoan, kiên nhẫn, thích học các môn tự nhiên.'
      }
    ]
  },
  {
    id: 'thpt-nguyen-van-thoai',
    name: 'Trường THPT Nguyễn Văn Thoại',
    shortName: 'THPT Nguyễn Văn Thoại',
    district: 'Cẩm Lệ',
    address: 'Khu đô thị sinh thái Hòa Xuân, Quận Cẩm Lệ, TP. Đà Nẵng',
    phone: '0236 3689 333',
    website: 'thptnguyenvanthoai.edu.vn',
    foundedYear: 2020,
    benchmarkScore: '43.50 điểm',
    studentQuota: 440,
    image: schoolCampusImg,
    badgeColor: 'from-blue-700 to-cyan-700',
    description: 'Ngôi trường THPT công lập mới nhất của thành phố Đà Nẵng với kiến trúc xanh hiện đại, trang thiết bị tiên tiến chuẩn quốc gia.',
    strengths: [
      'Trường học thông minh xây dựng mới hoàn toàn, phòng lab và nhà thi đấu hiện đại',
      'Đội ngũ giáo viên trẻ, năng động, ứng dụng công nghệ số trong giảng dạy'
    ],
    combinations: [
      {
        id: 'nvt-khtn',
        name: 'Tổ hợp Khoa học Công nghệ Mới (Vật lí - Hóa học - Tin học - Công nghệ CN)',
        code: 'TN-NVT',
        focusArea: 'Công nghệ & Kỹ thuật',
        electiveSubjects: ['Vật lí', 'Hóa học', 'Tin học', 'Công nghệ Công nghiệp'],
        specialTopics: ['Toán chuyên đề', 'Lập trình ứng dụng', 'Vật lí thực nghiệm'],
        targetMajors: ['Khoa học Máy tính', 'Trí tuệ Nhân tạo', 'Tự động hóa'],
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)'],
        careerProspects: ['Kỹ sư phần mềm', 'Chuyên viên IoT', 'Kỹ sư Robot'],
        suitableFor: 'Học sinh năng động, đam mê khoa học công nghệ thế hệ mới.'
      },
      {
        id: 'nvt-kinhte',
        name: 'Tổ hợp Kinh tế & Pháp luật (Địa lí - GDKT&PL - Tin học - Vật lí)',
        code: 'KT-NVT',
        focusArea: 'Kinh tế & Ngôn ngữ',
        electiveSubjects: ['Địa lí', 'GDKT&PL', 'Tin học', 'Vật lí'],
        specialTopics: ['Toán tài chính', 'Tiếng Anh thương mại', 'GDKT&PL'],
        targetMajors: ['Thương mại điện tử', 'Kinh doanh quốc tế', 'Logistics'],
        targetExamGroups: ['D01 (Toán, Văn, Anh)', 'A01 (Toán, Lí, Anh)'],
        careerProspects: ['Quản lý dự án E-commerce', 'Chuyên viên Logistics', 'Chuyên viên Tài chính'],
        suitableFor: 'Học sinh yêu thích chuyển đổi số trong kinh tế và thương mại điện tử.'
      }
    ]
  },
  {
    id: 'thpt-fpt-danang',
    name: 'Trường THPT FPT Đà Nẵng',
    shortName: 'THPT FPT',
    district: 'Ngũ Hành Sơn',
    address: 'Khu đô thị FPT City, Phường Hòa Hải, Quận Ngũ Hành Sơn, TP. Đà Nẵng',
    phone: '0236 350 2992',
    website: 'thptdanang.fpt.edu.vn',
    foundedYear: 2017,
    benchmarkScore: 'Xét học bạ & ĐGNL riêng',
    studentQuota: 500,
    image: careerOrientationImg,
    badgeColor: 'from-amber-600 to-blue-700',
    description: 'Trường THPT nội trú - bán trú định hướng công nghệ thông tin, ngoại ngữ và kỹ năng thế kỷ 21 nằm trong khuôn viên FPT City.',
    strengths: [
      'Chương trình học tăng cường Tin học và Tiếng Anh giao tiếp với người nước ngoài',
      'Định hướng công nghệ vi mạch, AI và liên thông trực tiếp Đại học FPT'
    ],
    combinations: [
      {
        id: 'fpt-khtn-ai',
        name: 'Tổ hợp Công nghệ Số & AI (Vật lí - Hóa học - Tin học - Công nghệ CN)',
        code: 'TN-FPT',
        focusArea: 'Công nghệ & Kỹ thuật',
        electiveSubjects: ['Vật lí', 'Hóa học', 'Tin học', 'Công nghệ Công nghiệp'],
        specialTopics: ['Toán chuyên đề', 'Lập trình Python & AI', 'Tiếng Anh học thuật'],
        targetMajors: ['Kỹ thuật Phần mềm', 'Trí tuệ nhân tạo', 'An toàn thông tin', 'Thiết kế Vi mạch'],
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)', 'D01 (Toán, Văn, Anh)'],
        careerProspects: ['Lập trình viên AI / Fullstack', 'Kỹ sư Vi mạch bán dẫn', 'Chuyên gia An ninh mạng'],
        suitableFor: 'Học sinh đam mê công nghệ thông tin và mong muốn môi trường học tập tự lập, hiện đại.'
      }
    ]
  }
];

export const HOLLAND_GROUPS = [
  { code: 'R', name: 'Realistic (Kỹ thuật)', desc: 'Thích làm việc với máy móc, công cụ, thực hành kỹ thuật, điện tử, xây dựng.' },
  { code: 'I', name: 'Investigative (Nghiên cứu)', desc: 'Thích tìm tòi, tư duy logic, phân tích dữ liệu, nghiên cứu khoa học tự nhiên, y sinh.' },
  { code: 'A', name: 'Artistic (Nghệ thuật)', desc: 'Thích sáng tạo, thiết kế, văn học, âm nhạc, truyền thông đa phương tiện.' },
  { code: 'S', name: 'Social (Xã hội)', desc: 'Thích giao tiếp, giúp đỡ, đào tạo, tư vấn tâm lý, chăm sóc sức khỏe, hoạt động cộng đồng.' },
  { code: 'E', name: 'Enterprising (Quản lý)', desc: 'Thích lãnh đạo, kinh doanh, thuyết phục, quản trị doanh nghiệp, marketing.' },
  { code: 'C', name: 'Conventional (Nghiệp vụ)', desc: 'Thích làm việc chi tiết, số liệu, quy trình, tài chính, ngân hàng, kiểm toán, văn thư.' },
];


export const MANDATORY_SUBJECTS = [
  { name: 'Ngữ văn', hours: '105 tiết/năm', type: 'Môn bắt buộc' },
  { name: 'Toán', hours: '105 tiết/năm', type: 'Môn bắt buộc' },
  { name: 'Ngoại ngữ 1 (Tiếng Anh)', hours: '105 tiết/năm', type: 'Môn bắt buộc' },
  { name: 'Lịch sử', hours: '52 tiết/năm', type: 'Môn bắt buộc' },
  { name: 'Giáo dục thể chất', hours: '70 tiết/năm', type: 'Môn bắt buộc' },
  { name: 'Giáo dục quốc phòng và an ninh', hours: '35 tiết/năm', type: 'Môn bắt buộc' },
  { name: 'Hoạt động trải nghiệm, hướng nghiệp', hours: '105 tiết/năm', type: 'Hoạt động bắt buộc' },
  { name: 'Nội dung giáo dục địa phương', hours: '35 tiết/năm', type: 'Nội dung bắt buộc' },
];

export const CAREER_PATHS = [
  {
    id: 'tech',
    title: 'Công nghệ thông tin & Trí tuệ nhân tạo (AI)',
    description: 'Phát triển phần mềm, trí tuệ nhân tạo, thiết kế vi mạch bán dẫn, an ninh mạng và dữ liệu lớn.',
    recommendedGroup: 'Công nghệ & Kỹ thuật hoặc KHTN',
    examGroup: 'A00, A01',
    suitableCombinations: ['Vật lí', 'Tin học', 'Hóa học / Công nghệ']
  },
  {
    id: 'med',
    title: 'Y Dược & Khoa học Sự sống',
    description: 'Bác sĩ đa khoa, răng hàm mặt, dược sĩ lâm sàng, công nghệ sinh học và kỹ thuật y sinh.',
    recommendedGroup: 'Khoa học Tự nhiên (KHTN)',
    examGroup: 'B00, A00',
    suitableCombinations: ['Hóa học', 'Sinh học', 'Vật lí']
  },
  {
    id: 'biz',
    title: 'Kinh tế, Tài chính & Kinh doanh Quốc tế',
    description: 'Tài chính ngân hàng, logistics cảng biển, quản trị kinh doanh, marketing số và ngoại thương.',
    recommendedGroup: 'Kinh tế & Ngôn ngữ',
    examGroup: 'D01, A01',
    suitableCombinations: ['Địa lí', 'GDKT&PL', 'Tin học / Vật lí']
  },
  {
    id: 'law-media',
    title: 'Luật, Báo chí & Truyền thông Đa phương tiện',
    description: 'Tư vấn pháp luật, luật sư doanh nghiệp, nhà báo, quan hệ công chúng (PR), ngoại giao.',
    recommendedGroup: 'Khoa học Xã hội (KHXH)',
    examGroup: 'C00, D01, D14',
    suitableCombinations: ['Lịch sử', 'Địa lí', 'GDKT&PL']
  }
];
