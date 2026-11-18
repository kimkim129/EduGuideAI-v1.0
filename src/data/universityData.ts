export interface MajorOption {
  id: string;
  code: string;
  name: string;
  group: string;
  targetExamGroups: string[]; // Khối thi chuẩn: A00, A01, B00, C00, D01, D07, D14...
  requiredHighSchoolSubjects: string[]; // Môn cần học tốt ở THPT
  careerOutlook: string;
}

export interface UniversityOption {
  id: string;
  name: string;
  shortName: string;
  city: 'Đà Nẵng' | 'TP. Hồ Chí Minh' | 'Hà Nội' | 'Thừa Thiên Huế';
  website: string;
  majors: MajorOption[];
}

export const CITIES = [
  'Đà Nẵng',
  'TP. Hồ Chí Minh',
  'Hà Nội',
  'Thừa Thiên Huế'
] as const;

export const UNIVERSITIES_DATA: UniversityOption[] = [
  // --- ĐÀ NẴNG ---
  {
    id: 'dut-udn',
    name: 'Trường Đại học Bách khoa – ĐH Đà Nẵng',
    shortName: 'ĐH Bách khoa Đà Nẵng',
    city: 'Đà Nẵng',
    website: 'dut.udn.vn',
    majors: [
      {
        id: 'dut-it',
        code: '7480201',
        name: 'Công nghệ thông tin (Khoa học máy tính & Kỹ thuật phần mềm)',
        group: 'Máy tính & CNTT',
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)'],
        requiredHighSchoolSubjects: ['Toán', 'Vật lí', 'Tin học'],
        careerOutlook: 'Kỹ sư phần mềm, kỹ sư AI, lập trình viên hệ thống, kỹ sư dữ liệu.'
      },
      {
        id: 'dut-semiconductor',
        code: '7520401',
        name: 'Kỹ thuật Điện tử - Viễn thông (Chuyên ngành Thiết kế vi mạch bán dẫn)',
        group: 'Điện & Điện tử',
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)'],
        requiredHighSchoolSubjects: ['Toán', 'Vật lí', 'Tin học'],
        careerOutlook: 'Kỹ sư thiết kế chip vi mạch, kỹ sư viễn thông, kỹ sư IoT.'
      },
      {
        id: 'dut-mechatronics',
        code: '7520114',
        name: 'Kỹ thuật Cơ điện tử & Robot',
        group: 'Cơ khí & Tự động hóa',
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)'],
        requiredHighSchoolSubjects: ['Toán', 'Vật lí', 'Công nghệ'],
        careerOutlook: 'Kỹ sư chế tạo robot, tự động hóa dây chuyền sản xuất, kỹ sư cơ điện tử.'
      },
      {
        id: 'dut-chemical',
        code: '7520301',
        name: 'Kỹ thuật Hóa học & Công nghệ Thực phẩm',
        group: 'Hóa chất & Thực phẩm',
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'B00 (Toán, Hóa, Sinh)'],
        requiredHighSchoolSubjects: ['Toán', 'Hóa học', 'Sinh học'],
        careerOutlook: 'Kỹ sư chế biến thực phẩm, chuyên gia hóa mỹ phẩm, kiểm định chất lượng.'
      },
      {
        id: 'dut-civil',
        code: '7580201',
        name: 'Kỹ thuật Xây dựng công trình & Cầu đường',
        group: 'Xây dựng & Kiến trúc',
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)'],
        requiredHighSchoolSubjects: ['Toán', 'Vật lí'],
        careerOutlook: 'Kỹ sư giám sát công trình, quản lý dự án xây dựng hạ tầng đô thị.'
      }
    ]
  },
  {
    id: 'due-udn',
    name: 'Trường Đại học Kinh tế – ĐH Đà Nẵng',
    shortName: 'ĐH Kinh tế Đà Nẵng',
    city: 'Đà Nẵng',
    website: 'due.udn.vn',
    majors: [
      {
        id: 'due-ib',
        code: '7340120',
        name: 'Kinh doanh quốc tế & Thương mại điện tử',
        group: 'Kinh doanh & Quản trị',
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)', 'D01 (Toán, Văn, Anh)'],
        requiredHighSchoolSubjects: ['Toán', 'Tiếng Anh', 'Địa lí'],
        careerOutlook: 'Chuyên viên xuất nhập khẩu, quản lý chuỗi cung ứng, chuyên gia E-commerce.'
      },
      {
        id: 'due-finance',
        code: '7340201',
        name: 'Tài chính – Ngân hàng & Công nghệ tài chính (Fintech)',
        group: 'Tài chính & Kế toán',
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)', 'D01 (Toán, Văn, Anh)'],
        requiredHighSchoolSubjects: ['Toán', 'GDKT&PL', 'Tiếng Anh'],
        careerOutlook: 'Chuyên viên phân tích đầu tư, chuyên viên tín dụng ngân hàng, tư vấn Fintech.'
      },
      {
        id: 'due-marketing',
        code: '7340115',
        name: 'Marketing số (Digital Marketing) & Truyền thông thương hiệu',
        group: 'Marketing',
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)', 'D01 (Toán, Văn, Anh)'],
        requiredHighSchoolSubjects: ['Tiếng Anh', 'Toán', 'Tin học'],
        careerOutlook: 'Chuyên viên hoạch định chiến dịch Marketing, quản lý thương hiệu, sáng tạo nội dung.'
      },
      {
        id: 'due-law',
        code: '7380107',
        name: 'Luật kinh tế & Luật thương mại quốc tế',
        group: 'Pháp luật',
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)', 'D01 (Toán, Văn, Anh)'],
        requiredHighSchoolSubjects: ['GDKT&PL', 'Ngữ văn', 'Tiếng Anh'],
        careerOutlook: 'Luật sư kinh tế, chuyên viên pháp chế doanh nghiệp, trọng tài thương mại.'
      }
    ]
  },
  {
    id: 'smp-udn',
    name: 'Khoa Y Dược – ĐH Đà Nẵng (Trường ĐH Y Dược ĐHĐN)',
    shortName: 'Khoa Y Dược ĐH Đà Nẵng',
    city: 'Đà Nẵng',
    website: 'smp.udn.vn',
    majors: [
      {
        id: 'smp-doctor',
        code: '7720101',
        name: 'Y khoa (Bác sĩ đa khoa)',
        group: 'Sức khỏe & Y dược',
        targetExamGroups: ['B00 (Toán, Hóa, Sinh)'],
        requiredHighSchoolSubjects: ['Hóa học', 'Sinh học', 'Toán'],
        careerOutlook: 'Bác sĩ điều trị tại bệnh viện, trung tâm y tế, giảng viên y khoa.'
      },
      {
        id: 'smp-pharmacy',
        code: '7720201',
        name: 'Dược học',
        group: 'Sức khỏe & Y dược',
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'B00 (Toán, Hóa, Sinh)'],
        requiredHighSchoolSubjects: ['Hóa học', 'Toán', 'Sinh học'],
        careerOutlook: 'Dược sĩ lâm sàng, nghiên cứu bào chế thuốc, quản lý dược phẩm.'
      },
      {
        id: 'smp-dentistry',
        code: '7720501',
        name: 'Răng – Hàm – Mặt',
        group: 'Sức khỏe & Y dược',
        targetExamGroups: ['B00 (Toán, Hóa, Sinh)'],
        requiredHighSchoolSubjects: ['Hóa học', 'Sinh học', 'Toán'],
        careerOutlook: 'Bác sĩ nha khoa, phẫu thuật hàm mặt thẩm mỹ.'
      },
      {
        id: 'smp-nursing',
        code: '7720301',
        name: 'Điều dưỡng & Kỹ thuật xét nghiệm y học',
        group: 'Sức khỏe & Y dược',
        targetExamGroups: ['B00 (Toán, Hóa, Sinh)'],
        requiredHighSchoolSubjects: ['Sinh học', 'Hóa học'],
        careerOutlook: 'Điều dưỡng viên chuyên nghiệp, chuyên viên xét nghiệm y khoa.'
      }
    ]
  },
  {
    id: 'ufl-udn',
    name: 'Trường Đại học Ngoại ngữ – ĐH Đà Nẵng',
    shortName: 'ĐH Ngoại ngữ Đà Nẵng',
    city: 'Đà Nẵng',
    website: 'ufl.udn.vn',
    majors: [
      {
        id: 'ufl-eng',
        code: '7220201',
        name: 'Ngôn ngữ Anh & Tiếng Anh Thương mại',
        group: 'Ngôn ngữ & Văn hóa',
        targetExamGroups: ['D01 (Toán, Văn, Anh)', 'D14 (Văn, Sử, Anh)'],
        requiredHighSchoolSubjects: ['Tiếng Anh', 'Ngữ văn'],
        careerOutlook: 'Biên phiên dịch viên, chuyên viên đối ngoại, giảng viên ngoại ngữ.'
      },
      {
        id: 'ufl-international',
        code: '7310201',
        name: 'Quốc tế học & Quan hệ quốc tế',
        group: 'Khoa học Xã hội',
        targetExamGroups: ['D01 (Toán, Văn, Anh)', 'D14 (Văn, Sử, Anh)', 'C00 (Văn, Sử, Địa)'],
        requiredHighSchoolSubjects: ['Lịch sử', 'Địa lí', 'Tiếng Anh'],
        careerOutlook: 'Nhà ngoại giao, phóng viên quốc tế, cán bộ tổ chức phi chính phủ (NGO).'
      },
      {
        id: 'ufl-japanese-korean',
        code: '7220209',
        name: 'Ngôn ngữ Nhật – Ngôn ngữ Hàn Quốc',
        group: 'Ngôn ngữ & Văn hóa',
        targetExamGroups: ['D01 (Toán, Văn, Anh)', 'D14 (Văn, Sử, Anh)'],
        requiredHighSchoolSubjects: ['Tiếng Anh', 'Ngữ văn'],
        careerOutlook: 'Biên dịch viên doanh nghiệp FDI, trợ lý giám đốc nước ngoài.'
      }
    ]
  },
  {
    id: 'ued-udn',
    name: 'Trường Đại học Sư phạm – ĐH Đà Nẵng',
    shortName: 'ĐH Sư phạm Đà Nẵng',
    city: 'Đà Nẵng',
    website: 'ued.udn.vn',
    majors: [
      {
        id: 'ued-math',
        code: '7140209',
        name: 'Sư phạm Toán học & Sư phạm Tin học',
        group: 'Sư phạm & Đào tạo',
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)'],
        requiredHighSchoolSubjects: ['Toán', 'Tin học'],
        careerOutlook: 'Giáo viên THPT, chuyên gia phát triển chương trình toán tin.'
      },
      {
        id: 'ued-literature',
        code: '7140217',
        name: 'Sư phạm Ngữ văn & Báo chí – Truyền thông',
        group: 'Sư phạm & Đào tạo',
        targetExamGroups: ['C00 (Văn, Sử, Địa)', 'D01 (Toán, Văn, Anh)'],
        requiredHighSchoolSubjects: ['Ngữ văn', 'Lịch sử'],
        careerOutlook: 'Giáo viên Ngữ văn, biên tập viên báo chí, chuyên viên truyền thông sự kiện.'
      },
      {
        id: 'ued-psychology',
        code: '7310401',
        name: 'Tâm lý học học đường & Tham vấn tâm lý',
        group: 'Khoa học Xã hội',
        targetExamGroups: ['C00 (Văn, Sử, Địa)', 'D01 (Toán, Văn, Anh)', 'B00 (Toán, Hóa, Sinh)'],
        requiredHighSchoolSubjects: ['Ngữ văn', 'Sinh học'],
        careerOutlook: 'Chuyên viên tham vấn tâm lý học đường, chuyên gia trị liệu tâm lý.'
      }
    ]
  },
  {
    id: 'vku-udn',
    name: 'Trường ĐH Công nghệ Thông tin & Truyền thông Việt – Hàn (VKU)',
    shortName: 'ĐH CNTT Việt – Hàn (VKU)',
    city: 'Đà Nẵng',
    website: 'vku.udn.vn',
    majors: [
      {
        id: 'vku-ai',
        code: '7480207',
        name: 'Trí tuệ nhân tạo (AI) & Khoa học Dữ liệu',
        group: 'Máy tính & CNTT',
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)'],
        requiredHighSchoolSubjects: ['Toán', 'Tin học'],
        careerOutlook: 'Kỹ sư AI, chuyên gia khai phá dữ liệu (Data Scientist), kỹ sư học máy.'
      },
      {
        id: 'vku-digital-media',
        code: '7480205',
        name: 'Thiết kế đồ họa & Truyền thông số',
        group: 'Nghệ thuật & Đồ họa',
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)', 'D01 (Toán, Văn, Anh)'],
        requiredHighSchoolSubjects: ['Tin học', 'Mỹ thuật / Công nghệ'],
        careerOutlook: 'UI/UX Designer, chuyên viên thiết kế đồ họa 3D, đạo diễn kỹ xảo.'
      }
    ]
  },
  {
    id: 'duytan-uni',
    name: 'Đại học Duy Tân',
    shortName: 'ĐH Duy Tân',
    city: 'Đà Nẵng',
    website: 'duytan.edu.vn',
    majors: [
      {
        id: 'dtu-software',
        code: '7480103',
        name: 'Kỹ thuật Phần mềm chuẩn CMU (Mỹ)',
        group: 'Máy tính & CNTT',
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)', 'D01 (Toán, Văn, Anh)'],
        requiredHighSchoolSubjects: ['Toán', 'Tin học', 'Tiếng Anh'],
        careerOutlook: 'Kỹ sư phần mềm toàn cầu, lập trình viên quốc tế.'
      },
      {
        id: 'dtu-tourism',
        code: '7810103',
        name: 'Quản trị Khách sạn & Resort quốc tế chuẩn PSU',
        group: 'Du lịch & Dịch vụ',
        targetExamGroups: ['D01 (Toán, Văn, Anh)', 'C00 (Văn, Sử, Địa)', 'A01 (Toán, Lí, Anh)'],
        requiredHighSchoolSubjects: ['Tiếng Anh', 'Địa lí'],
        careerOutlook: 'Tổng giám đốc khách sạn/resort 5 sao, quản lý ẩm thực và sự kiện.'
      }
    ]
  },
  {
    id: 'fpt-danang',
    name: 'Đại học FPT Đà Nẵng',
    shortName: 'ĐH FPT Đà Nẵng',
    city: 'Đà Nẵng',
    website: 'dnuni.fpt.edu.vn',
    majors: [
      {
        id: 'fpt-microchip',
        code: '7520405',
        name: 'Thiết kế Vi mạch Bán dẫn',
        group: 'Điện & Điện tử',
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)'],
        requiredHighSchoolSubjects: ['Toán', 'Vật lí', 'Tin học'],
        careerOutlook: 'Kỹ sư kiểm thử và thiết kế chip bán dẫn cho các tập đoàn toàn cầu.'
      },
      {
        id: 'fpt-cybersecurity',
        code: '7480202',
        name: 'An toàn thông tin & Kỹ thuật mạng',
        group: 'Máy tính & CNTT',
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)'],
        requiredHighSchoolSubjects: ['Toán', 'Tin học'],
        careerOutlook: 'Chuyên gia bảo mật an ninh mạng, kỹ sư phòng thủ mạng.'
      }
    ]
  },

  // --- TP. HỒ CHÍ MINH ---
  {
    id: 'bku-vnuhcm',
    name: 'Trường Đại học Bách khoa – ĐHQG TP.HCM',
    shortName: 'ĐH Bách khoa TP.HCM',
    city: 'TP. Hồ Chí Minh',
    website: 'hcmut.edu.vn',
    majors: [
      {
        id: 'bku-cs',
        code: '7480101',
        name: 'Khoa học Máy tính & Kỹ thuật Máy tính',
        group: 'Máy tính & CNTT',
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)'],
        requiredHighSchoolSubjects: ['Toán', 'Vật lí', 'Tin học'],
        careerOutlook: 'Kỹ sư phần mềm, kiến trúc sư hệ thống, chuyên gia dữ liệu lớn.'
      },
      {
        id: 'bku-auto',
        code: '7520130',
        name: 'Kỹ thuật Ô tô & Xe điện thông minh',
        group: 'Cơ khí & Động lực',
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)'],
        requiredHighSchoolSubjects: ['Toán', 'Vật lí'],
        careerOutlook: 'Kỹ sư nghiên cứu phát triển ô tô điện, quản lý xưởng sản xuất ô tô.'
      }
    ]
  },
  {
    id: 'ueh-uni',
    name: 'Đại học Kinh tế TP. Hồ Chí Minh (UEH)',
    shortName: 'ĐH Kinh tế TP.HCM (UEH)',
    city: 'TP. Hồ Chí Minh',
    website: 'ueh.edu.vn',
    majors: [
      {
        id: 'ueh-logistics',
        code: '7510605',
        name: 'Logistics & Quản lý Chuỗi cung ứng',
        group: 'Kinh doanh & Quản trị',
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)', 'D01 (Toán, Văn, Anh)', 'D07 (Toán, Hóa, Anh)'],
        requiredHighSchoolSubjects: ['Toán', 'Tiếng Anh', 'Địa lí'],
        careerOutlook: 'Giám đốc chuỗi cung ứng, chuyên viên điều phối logistics quốc tế.'
      },
      {
        id: 'ueh-finance',
        code: '7340201',
        name: 'Tài chính công nghệ & Ngân hàng đầu tư',
        group: 'Tài chính & Kế toán',
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)', 'D01 (Toán, Văn, Anh)'],
        requiredHighSchoolSubjects: ['Toán', 'Tiếng Anh'],
        careerOutlook: 'Chuyên viên phân tích tài chính cao cấp, quản lý quỹ đầu tư.'
      }
    ]
  },
  {
    id: 'ump-hcm',
    name: 'Đại học Y Dược TP. Hồ Chí Minh',
    shortName: 'ĐH Y Dược TP.HCM',
    city: 'TP. Hồ Chí Minh',
    website: 'ump.edu.vn',
    majors: [
      {
        id: 'ump-doctor',
        code: '7720101',
        name: 'Y đa khoa',
        group: 'Sức khỏe & Y dược',
        targetExamGroups: ['B00 (Toán, Hóa, Sinh)'],
        requiredHighSchoolSubjects: ['Toán', 'Hóa học', 'Sinh học'],
        careerOutlook: 'Bác sĩ chuyên khoa tại các bệnh viện tuyến trung ương.'
      },
      {
        id: 'ump-pharmacy',
        code: '7720201',
        name: 'Dược học',
        group: 'Sức khỏe & Y dược',
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'B00 (Toán, Hóa, Sinh)'],
        requiredHighSchoolSubjects: ['Toán', 'Hóa học'],
        careerOutlook: 'Dược sĩ nghiên cứu phát triển thuốc, dược sĩ bệnh viện.'
      }
    ]
  },

  // --- HÀ NỘI ---
  {
    id: 'hust-uni',
    name: 'Đại học Bách khoa Hà Nội (HUST)',
    shortName: 'ĐH Bách khoa Hà Nội',
    city: 'Hà Nội',
    website: 'hust.edu.vn',
    majors: [
      {
        id: 'hust-it',
        code: 'IT1',
        name: 'Khoa học Máy tính (IT1)',
        group: 'Máy tính & CNTT',
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)'],
        requiredHighSchoolSubjects: ['Toán', 'Vật lí', 'Tin học'],
        careerOutlook: 'Kỹ sư công nghệ hàng đầu, chuyên gia nghiên cứu thuật toán và AI.'
      },
      {
        id: 'hust-control',
        code: 'EE2',
        name: 'Kỹ thuật Điều khiển & Tự động hóa',
        group: 'Cơ khí & Tự động hóa',
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)'],
        requiredHighSchoolSubjects: ['Toán', 'Vật lí'],
        careerOutlook: 'Kỹ sư tự động hóa nhà máy thông minh, lập trình PLC/SCADA.'
      }
    ]
  },
  {
    id: 'neu-uni',
    name: 'Trường Đại học Kinh tế Quốc dân (NEU)',
    shortName: 'ĐH Kinh tế Quốc dân (NEU)',
    city: 'Hà Nội',
    website: 'neu.edu.vn',
    majors: [
      {
        id: 'neu-audit',
        code: '7340302',
        name: 'Kiểm toán & Kế toán công chứng',
        group: 'Tài chính & Kế toán',
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)', 'D01 (Toán, Văn, Anh)', 'D07 (Toán, Hóa, Anh)'],
        requiredHighSchoolSubjects: ['Toán', 'Tiếng Anh'],
        careerOutlook: 'Kiểm toán viên tại các công ty kiểm toán Big 4, giám đốc tài chính CFO.'
      },
      {
        id: 'neu-biz-admin',
        code: '7340101',
        name: 'Quản trị kinh doanh & Quản trị khởi nghiệp',
        group: 'Kinh doanh & Quản trị',
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)', 'D01 (Toán, Văn, Anh)'],
        requiredHighSchoolSubjects: ['Toán', 'Ngữ văn', 'GDKT&PL'],
        careerOutlook: 'Nhà sáng lập doanh nghiệp, giám đốc điều hành dự án.'
      }
    ]
  },
  {
    id: 'hmu-uni',
    name: 'Trường Đại học Y Hà Nội',
    shortName: 'ĐH Y Hà Nội',
    city: 'Hà Nội',
    website: 'hmu.edu.vn',
    majors: [
      {
        id: 'hmu-doctor',
        code: '7720101',
        name: 'Bác sĩ Y đa khoa',
        group: 'Sức khỏe & Y dược',
        targetExamGroups: ['B00 (Toán, Hóa, Sinh)'],
        requiredHighSchoolSubjects: ['Toán', 'Hóa học', 'Sinh học'],
        careerOutlook: 'Bác sĩ chuyên khoa tại các viện nghiên cứu và bệnh viện đầu ngành.'
      }
    ]
  },

  // --- THỪA THIÊN HUẾ ---
  {
    id: 'hue-med',
    name: 'Trường Đại học Y – Dược, Đại học Huế',
    shortName: 'ĐH Y Dược Huế',
    city: 'Thừa Thiên Huế',
    website: 'huemed-univ.edu.vn',
    majors: [
      {
        id: 'hue-med-doctor',
        code: '7720101',
        name: 'Y khoa (Bác sĩ đa khoa)',
        group: 'Sức khỏe & Y dược',
        targetExamGroups: ['B00 (Toán, Hóa, Sinh)'],
        requiredHighSchoolSubjects: ['Hóa học', 'Sinh học', 'Toán'],
        careerOutlook: 'Bác sĩ khám chữa bệnh tại các bệnh viện khu vực miền Trung – Tây Nguyên.'
      },
      {
        id: 'hue-med-pharmacy',
        code: '7720201',
        name: 'Dược học',
        group: 'Sức khỏe & Y dược',
        targetExamGroups: ['A00 (Toán, Lí, Hóa)', 'B00 (Toán, Hóa, Sinh)'],
        requiredHighSchoolSubjects: ['Hóa học', 'Toán'],
        careerOutlook: 'Dược sĩ bệnh viện, nhà máy sản xuất thuốc.'
      }
    ]
  }
];

export interface HollandQuestion {
  id: string;
  category: 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
  categoryName: string;
  question: string;
  iconName: string;
}

export const HOLLAND_QUESTIONS: HollandQuestion[] = [
  {
    id: 'q1',
    category: 'R',
    categoryName: 'Realistic (Kỹ thuật / Thực tế)',
    question: 'Bạn thích tự tay sửa chữa đồ đạc, lắp ráp mô hình robot, thiết bị điện tử hoặc làm việc với công cụ máy móc.',
    iconName: 'Wrench'
  },
  {
    id: 'q2',
    category: 'I',
    categoryName: 'Investigative (Nghiên cứu / Khám phá)',
    question: 'Bạn thích giải quyết các bài toán hóc búa, tò mò cơ chế tự nhiên, phân tích dữ liệu và tìm hiểu nguyên nhân khoa học.',
    iconName: 'Microscope'
  },
  {
    id: 'q3',
    category: 'A',
    categoryName: 'Artistic (Nghệ thuật / Sáng tạo)',
    question: 'Bạn thích vẽ tranh, thiết kế đồ họa, sáng tác thơ văn, chơi nhạc cụ hoặc làm video sáng tạo theo phong cách riêng.',
    iconName: 'Palette'
  },
  {
    id: 'q4',
    category: 'S',
    categoryName: 'Social (Xã hội / Giúp đỡ)',
    question: 'Bạn thích lắng nghe chia sẻ, giảng giải bài học cho bạn bè, tham gia hoạt động thiện nguyện và chăm sóc mọi người.',
    iconName: 'Users'
  },
  {
    id: 'q5',
    category: 'E',
    categoryName: 'Enterprising (Quản lý / Kinh doanh)',
    question: 'Bạn tự tin thuyết trình trước đám đông, thích lập kế hoạch kinh doanh nhỏ, thuyết phục người khác và làm nhóm trưởng.',
    iconName: 'TrendingUp'
  },
  {
    id: 'q6',
    category: 'C',
    categoryName: 'Conventional (Nghiệp vụ / Quy trình)',
    question: 'Bạn thích sắp xếp đồ đạc và thời gian biểu ngăn nắp, làm việc cẩn thận với bảng tính con số, hợp đồng và quy tắc rõ ràng.',
    iconName: 'CheckSquare'
  }
];
