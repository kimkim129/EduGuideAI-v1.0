/**
 * THUẬT TOÁN TƯ VẤN MÔN THI TỐT NGHIỆP VÀ TỔ HỢP MÔN HỌC THPT – EDUGUIDE AI
 * PHƯƠNG PHÁP: ĐỐI CHIẾU TỔ HỢP XÉT TUYỂN HOÀN CHỈNH THEO TỪNG NGUYỆN VỌNG
 * TRỌNG SỐ NGUYỆN VỌNG: NV1 = 3, NV2 = 2, NV3 = 1 (Mỗi nguyện vọng đạt cộng trọng số 1 lần)
 * KẾT HỢP ĐÁNH GIÁ CẶP 02 MÔN THI TỐT NGHIỆP KHẢ THI VÀ HỖ TRỢ HOLLAND RIASEC
 */

import {
  ToHopXetTuyenItem,
  ToHopTHPTItem,
  UniversityWish,
} from './universityApiService';
import { RiasecKey } from './hollandApiService';

// =========================================================================
// CẤU HÌNH TRỌNG SỐ ƯU TIÊN NGUYỆN VỌNG
// Mỗi nguyện vọng được đáp ứng đầy đủ ít nhất 01 tổ hợp xét tuyển hợp lệ
// sẽ cộng trọng số của nguyện vọng đó MỘT LẦN: NV1 = 3, NV2 = 2, NV3 = 1
// =========================================================================
export const WISH_PRIORITY_WEIGHTS: Record<number, number> = {
  1: 3, // Nguyện vọng 1 (Ưu tiên cao nhất)
  2: 2, // Nguyện vọng 2
  3: 1, // Nguyện vọng 3
};

// 4 môn học văn hóa bắt buộc theo Chương trình GDPT 2018 (học liên tục đến lớp 12)
export const COMPULSORY_THPT_CORE = ['Toán', 'Ngữ văn', 'Tiếng Anh', 'Lịch sử'] as const;

// 2 môn thi tốt nghiệp bắt buộc theo quy chế hiện hành (từ 2025)
export const MANDATORY_GRADUATION_EXAMS = ['Toán', 'Ngữ văn'] as const;

// Các môn thi tốt nghiệp tự chọn hợp lệ theo Quy chế thi tốt nghiệp THPT hiện hành
export const VALID_GRADUATION_ELECTIVES = new Set<string>([
  'Tiếng Anh',
  'Tiếng Nhật',
  'Tiếng Trung',
  'Tiếng Hàn',
  'Tiếng Pháp',
  'Tiếng Đức',
  'Tiếng Nga',
  'Lịch sử',
  'Vật lí',
  'Hóa học',
  'Sinh học',
  'Địa lí',
  'Giáo dục kinh tế và pháp luật',
  'Tin học',
  'Công nghệ',
]);

// Thứ tự ưu tiên trung tính chỉ dùng khi học sinh chưa có dữ liệu nguyện vọng/sở thích/Holland
const NEUTRAL_ELECTIVE_ORDER = [
  'Tiếng Anh',
  'Lịch sử',
  'Địa lí',
  'Hóa học',
  'Sinh học',
  'Vật lí',
  'Tin học',
  'Giáo dục kinh tế và pháp luật',
  'Công nghệ',
];

// Ánh xạ môn học phù hợp với từng nhóm tính cách Holland RIASEC (tiêu chí hỗ trợ, không thay thế điều kiện môn học)
const HOLLAND_MATCH_MAP: Record<RiasecKey, string[]> = {
  R: ['Vật lí', 'Tin học', 'Công nghệ', 'Hóa học'],
  I: ['Hóa học', 'Sinh học', 'Vật lí', 'Tin học'],
  A: ['Âm nhạc', 'Mỹ thuật', 'Ngữ văn', 'Địa lí'],
  S: ['Giáo dục kinh tế và pháp luật', 'Địa lí', 'Lịch sử', 'Sinh học'],
  E: ['Giáo dục kinh tế và pháp luật', 'Địa lí', 'Tin học'],
  C: ['Tin học', 'Giáo dục kinh tế và pháp luật', 'Địa lí'],
};

/**
 * Chuẩn hóa tên môn học để đối chiếu chính xác giữa các sheet Google Sheets và Quy chế GDPT 2018
 * Ví dụ: Lý, Lí, Vật lý -> Vật lí; Hóa, Hoá -> Hóa học; Anh, Tiếng Anh -> Tiếng Anh;
 *        Văn -> Ngữ văn; Sử -> Lịch sử; Địa -> Địa lí
 */
export function normalizeSubjectName(sub?: string): string {
  if (!sub) return '';
  const raw = sub.trim();
  if (!raw) return '';
  const s = raw.toLowerCase();

  if (s === 'toán' || s === 'toan' || s.startsWith('toán ')) return 'Toán';
  if (s.includes('ngữ văn') || s === 'văn' || s === 'van') return 'Ngữ văn';

  // Ngoại ngữ khác Tiếng Anh (kiểm tra trước để tránh nhầm với ngoại ngữ chung)
  if (s.includes('tiếng nhật') || s === 'nhật' || s === 'nhat') return 'Tiếng Nhật';
  if (s.includes('tiếng trung') || s === 'trung') return 'Tiếng Trung';
  if (s.includes('tiếng hàn') || s === 'hàn' || s === 'han') return 'Tiếng Hàn';
  if (s.includes('tiếng pháp') || s === 'pháp' || s === 'phap') return 'Tiếng Pháp';
  if (s.includes('tiếng đức') || s === 'đức' || s === 'duc') return 'Tiếng Đức';
  if (s.includes('tiếng nga') || s === 'nga') return 'Tiếng Nga';

  if (
    s.includes('tiếng anh') ||
    s.includes('anh văn') ||
    s.includes('ngoại ngữ') ||
    s === 'anh'
  ) {
    return 'Tiếng Anh';
  }

  if (s.includes('lịch sử') || s === 'sử' || s === 'su') return 'Lịch sử';
  if (
    s.includes('vật lý') ||
    s.includes('vật lí') ||
    s === 'lý' ||
    s === 'lí' ||
    s === 'ly' ||
    s === 'li'
  ) {
    return 'Vật lí';
  }
  if (s.includes('hóa') || s.includes('hoá') || s === 'hoa') return 'Hóa học';
  if (s.includes('sinh học') || s === 'sinh') return 'Sinh học';
  if (s.includes('địa lí') || s.includes('địa lý') || s === 'địa' || s === 'dia') return 'Địa lí';
  if (s.includes('tin học') || s === 'tin') return 'Tin học';
  if (s.includes('công nghệ')) return 'Công nghệ';
  if (
    s.includes('công dân') ||
    s.includes('gdcd') ||
    s.includes('kinh tế') ||
    s.includes('pháp luật') ||
    s.includes('gdkt')
  ) {
    return 'Giáo dục kinh tế và pháp luật';
  }
  if (s.includes('âm nhạc')) return 'Âm nhạc';
  if (s.includes('mỹ thuật') || s.includes('mĩ thuật') || s.includes('hội họa')) return 'Mỹ thuật';

  return raw;
}

export interface AdmissionComboDetail {
  combo: ToHopXetTuyenItem;
  code: string;
  name: string;
  rawSubjects: string[];
  subjects: string[]; // Đã chuẩn hóa
  notes: string;
  method: string;
}

export interface WishAnalysisResult {
  wish: UniversityWish;
  wishOrder: number;
  verifiedCombos: ToHopXetTuyenItem[];
  comboDetails: AdmissionComboDetail[];
  allExamGroupCodes: string[];
  requiredSubjects: string[];
  electiveSubjectsNeeded: string[];
  compulsorySubjectsNeeded: string[];
  isVerified: boolean;
  notes: string;
  prospectusUrl: string;
}

export interface SubjectFrequencyRow {
  subject: string;
  tanSuatNV1: number;
  tanSuatNV2: number;
  tanSuatNV3: number;
  tongTanSuat: number;
  diemUuTien: number;
  isValidGraduationExam: boolean;
  wishesAppearing: number[];
  combosAppearing: string[];
}

export interface NonSatisfiedComboItem {
  code: string;
  subjects: string[];
  rawSubjects: string[];
  missing: string[];
  matched: string[];
  notes: string;
  isPartialMatch: boolean;
  coveredByTHPTSubjects?: boolean;
  missingFromTHPT?: string[];
}

export interface WishComparisonBreakdown {
  wish: UniversityWish;
  order: number;
  schoolName: string;
  majorName: string;
  isSatisfied: boolean;
  allCombos: AdmissionComboDetail[];
  satisfiedCombos: {
    code: string;
    subjects: string[];
    rawSubjects: string[];
    notes: string;
  }[];
  partialCombos: NonSatisfiedComboItem[]; // Bao gồm tất cả tổ hợp chưa đạt (sắp xếp ít môn thiếu nhất lên đầu)
  unmatchedCombos: NonSatisfiedComboItem[]; // Tổ hợp không trùng môn nào trong tập đánh giá
  thptCoveredComboCodes: string[]; // Tổ hợp xét tuyển có đủ môn học ở bậc THPT (dù 2 môn thi dự kiến không bao phủ hết)
  matchLevel: 'FULL' | 'PARTIAL' | 'NONE';
  matchLabel: string;
}

export interface ExamPairEvaluation {
  sub1: string;
  sub2: string;
  fourSubjects: string[];
  satisfiedWishesCount: number;
  wishWeightScore: number; // Tổng trọng số NV đạt (3 cho NV1, 2 cho NV2, 1 cho NV3 - mỗi NV tính tối đa 1 lần)
  maxPossibleWishWeightScore: number;
  partialOneMissingWishesCount: number;
  supportsNV1: boolean;
  supportsNV2: boolean;
  supportsNV3: boolean;
  allWishesSatisfied: boolean;
  totalSatisfiedCombos: number;
  preferenceScore: number; // Sở thích THCS + Holland (chỉ dùng phân hạng khi độ phủ nguyện vọng tương đương)
  frequencyPrioritySum: number;
  breakdown: WishComparisonBreakdown[];
  coverageScore: number;
}

export interface EvaluatedTHPTCombination {
  comb: ToHopXetTuyenItem | any;
  electives: string[]; // Đúng 4 môn lựa chọn thực tế từ sheet TO_HOP_THPT
  topics: string[]; // 3 chuyên đề học tập
  normElectives: string[];
  actualSubjectsToGrade12: string[]; // Các môn thực tế học đến lớp 12 (gồm Toán, Văn, Anh, Sử + 4 môn lựa chọn)
  containsBothProjectedExams: boolean;
  containsProjectedSub1: boolean;
  containsProjectedSub2: boolean;
  additionalElectives: string[]; // 2 môn lựa chọn bổ sung trong tổ hợp (ngoài 2 môn thi dự kiến)
  additionalElectiveDetails: { subject: string; diemUuTien: number; tongTanSuat: number }[];
  top2AdditionalPriorityScore: number;
  allAdditionalPriorityScore: number;
  bestExamPairInCombo: ExamPairEvaluation;
  thptWishesBreakdown: WishComparisonBreakdown[]; // Đối chiếu tập môn học THPT đến lớp 12 với từng NV
  thptWishWeightScore: number; // Tổng trọng số NV được đáp ứng đầy đủ về môn học ở THPT (tính 1 lần/NV)
  thptSupportedWishesOrders: number[]; // Các NV đáp ứng đầy đủ về môn học ở THPT (1, 2, 3)
  thptUnsatisfiedWishesOrders: number[]; // Các NV chưa đáp ứng đầy đủ về môn học ở THPT
  supportsNV1: boolean;
  supportsNV2: boolean;
  supportsNV3: boolean;
  supportedWishesCount: number;
  supportedWishesOrders: number[]; // Các NV đáp ứng đầy đủ bởi cặp 2 môn thi tối ưu + Toán, Văn
  unsatisfiedWishesOrders: number[]; // Các NV chưa đáp ứng đầy đủ
  totalSatisfiedCombos: number;
  reachableCombosCount: number; // Số tổ hợp xét tuyển nằm gọn trong tập môn học đến lớp 12 của tổ hợp THPT này
  hollandScore: number;
  favoriteScore: number;
  score: number;
  rankTierLabel: string;
  rankingReason: string;
  strengths: string[];
  limitations: string[];
}

export interface FrequencyConsultationResult {
  wishesAnalysis: WishAnalysisResult[];
  frequencyTable: SubjectFrequencyRow[];
  excludedNonExamSubjects: SubjectFrequencyRow[];
  projectedPair: [string, string]; // 2 môn thi tốt nghiệp tự chọn tối ưu theo độ phủ tổ hợp xét tuyển & trọng số 3-2-1
  projectedFourSubjects: string[];
  projectedEvaluation: ExamPairEvaluation;
  meetsAllWishesByFrequency: boolean;
  statusTag: 'FULL_MATCH' | 'PARTIAL_MATCH';
  statusBadgeText: string;
  selectionReasonText: string;
  examPairLimitationNotice: string | null;
  tiedTopPairs: ExamPairEvaluation[];
  higherCoverageAlternatives: ExamPairEvaluation[];
  alternativePairs: ExamPairEvaluation[];
  evaluatedTHPTCombinations: EvaluatedTHPTCombination[];
  top3THPTCombinations: EvaluatedTHPTCombination[];
  anyTHPTContainsBothProjected: boolean;
  thptFallbackNotice: string | null;
  activeSupplementaryElectives: string[];
  nextPriorityCandidates: SubjectFrequencyRow[];
}

/**
 * BƯỚC 1: Truy xuất toàn bộ tổ hợp xét tuyển thực tế cho từng nguyện vọng (NV1, NV2, NV3)
 */
export function extractWishesAdmissionCombos(
  activeWishes: UniversityWish[],
  toHopList: ToHopXetTuyenItem[]
): WishAnalysisResult[] {
  return activeWishes.map((w, wishIdx) => {
    const targetSchool = (w.maTruongDH || '').trim().toUpperCase();
    const targetMajor = (w.maNganh || '').trim().toUpperCase();
    const targetProg = (w.maChuongTrinh || '').trim().toUpperCase();
    const targetMajorName = (w.tenNganh || '').trim().toLowerCase();

    const normSchoolName = (s: string) =>
      s
        .toLowerCase()
        .replace(/^trường\s+/i, '')
        .replace(/đại học/g, 'đh')
        .replace(/[–—-]/g, '-')
        .replace(/\s+/g, ' ')
        .trim();

    const targetSchoolCleanName = w.tenTruongDH ? normSchoolName(w.tenTruongDH) : '';

    // Tuyệt đối chỉ lọc trong đúng trường đại học đã chọn (không gộp trường khác)
    const directSchoolMatches = targetSchool
      ? toHopList.filter((item) => (item.maTruongDH || '').trim().toUpperCase() === targetSchool)
      : toHopList;

    const sameSchoolItems =
      directSchoolMatches.length > 0 || !targetSchoolCleanName
        ? directSchoolMatches
        : toHopList.filter((item) => {
            const itemSchoolName = item.rawItem?.TenTruong ? normSchoolName(String(item.rawItem.TenTruong)) : '';
            return Boolean(itemSchoolName && itemSchoolName === targetSchoolCleanName);
          });

    // Truy vấn theo MaNganh / MaChuongTrinh
    let rawMatches = sameSchoolItems.filter((item) => {
      const itemMajor = (item.maNganh || '').trim().toUpperCase();
      const itemProg = (item.maChuongTrinh || '').trim().toUpperCase();
      if (targetMajor && itemMajor && itemMajor === targetMajor) return true;
      if (targetProg && itemProg && itemProg === targetProg) return true;
      return false;
    });

    // Fallback theo tên ngành chính xác trong cùng trường nếu thiếu mã ngành
    if (rawMatches.length === 0 && targetMajorName) {
      rawMatches = sameSchoolItems.filter((item) => {
        const itemMajorName = (item.tenNganh || '').trim().toLowerCase();
        return itemMajorName && itemMajorName === targetMajorName;
      });
    }

    // Loại bỏ các dòng tổ hợp xét tuyển trùng hoàn toàn trong cùng trường, ngành và chương trình
    const seenComboKeys = new Set<string>();
    const matchingCombos: ToHopXetTuyenItem[] = [];

    rawMatches.forEach((item) => {
      const comboCode = (item.maToHop || '').trim().toUpperCase();
      const raw1 = item.mon1 || item.rawItem?.MonThi1 || item.rawItem?.Mon1 || '';
      const raw2 = item.mon2 || item.rawItem?.MonThi2 || item.rawItem?.Mon2 || '';
      const raw3 = item.mon3 || item.rawItem?.MonThi3 || item.rawItem?.Mon3 || '';
      const raw4 = item.mon4 || item.rawItem?.Mon4NeuCo || item.rawItem?.Mon4 || '';

      const s1 = normalizeSubjectName(raw1);
      const s2 = normalizeSubjectName(raw2);
      const s3 = normalizeSubjectName(raw3);
      const s4 = normalizeSubjectName(raw4);

      const sortedSubjectsKey = [s1, s2, s3, s4].filter(Boolean).sort().join('_');
      const comboKey = `${comboCode}__${sortedSubjectsKey}`;

      if ((comboCode || sortedSubjectsKey) && !seenComboKeys.has(comboKey)) {
        seenComboKeys.add(comboKey);
        matchingCombos.push({
          ...item,
          mon1: raw1 || item.mon1,
          mon2: raw2 || item.mon2,
          mon3: raw3 || item.mon3,
          mon4: raw4 || item.mon4,
        });
      }
    });

    const isVerified = matchingCombos.length > 0;
    const allExamGroupCodes = Array.from(
      new Set(matchingCombos.map((c) => (c.maToHop || '').trim().toUpperCase()).filter(Boolean))
    );

    const comboDetails: AdmissionComboDetail[] = matchingCombos.map((c) => {
      const rawSubs = [c.mon1, c.mon2, c.mon3, c.mon4].filter((s): s is string =>
        Boolean(s && s.trim())
      );
      const normSubs = Array.from(new Set(rawSubs.map(normalizeSubjectName).filter(Boolean)));
      return {
        combo: c,
        code: (c.maToHop || '').trim().toUpperCase(),
        name: c.tenToHop || '',
        rawSubjects: rawSubs,
        subjects: normSubs,
        notes: c.dieuKienGhiChu || '',
        method: c.phuongThucXetTuyen || '',
      };
    });

    const allSubjects = new Set<string>();
    comboDetails.forEach((cd) => {
      cd.subjects.forEach((s) => allSubjects.add(s));
    });

    const subjectsArr = Array.from(allSubjects);
    const compulsoryNeeded = subjectsArr.filter((s) =>
      (COMPULSORY_THPT_CORE as readonly string[]).includes(s)
    );
    const electivesNeeded = subjectsArr.filter(
      (s) => !(COMPULSORY_THPT_CORE as readonly string[]).includes(s)
    );
    const notes = matchingCombos.find((c) => c.dieuKienGhiChu)?.dieuKienGhiChu || '';
    const prospectusUrl =
      matchingCombos.find((c) => c.urlDeAnTuyenSinh)?.urlDeAnTuyenSinh || '';

    return {
      wish: w,
      wishOrder: w.order || wishIdx + 1,
      verifiedCombos: matchingCombos,
      comboDetails,
      allExamGroupCodes,
      requiredSubjects: subjectsArr,
      electiveSubjectsNeeded: electivesNeeded,
      compulsorySubjectsNeeded: compulsoryNeeded,
      isVerified,
      notes,
      prospectusUrl,
    };
  });
}

/**
 * Thống kê tham khảo mức độ xuất hiện của từng môn trong các nguyện vọng (chỉ dùng làm thông tin tham khảo/tie-breaker phụ)
 */
export function computeSubjectFrequencyStats(
  wishesAnalysis: WishAnalysisResult[],
  favoriteSubjects: string[] = []
): {
  frequencyTable: SubjectFrequencyRow[];
  excludedNonExamSubjects: SubjectFrequencyRow[];
} {
  const statsMap = new Map<
    string,
    {
      tanSuatNV1: number;
      tanSuatNV2: number;
      tanSuatNV3: number;
      wishesSet: Set<number>;
      combosSet: Set<string>;
    }
  >();

  wishesAnalysis.forEach((wa, idx) => {
    const order = wa.wishOrder || idx + 1;
    if (order < 1 || order > 3) return;

    wa.comboDetails.forEach((cd) => {
      const uniqueSubjectsInCombo = new Set(cd.subjects);
      uniqueSubjectsInCombo.forEach((sub) => {
        if (!sub || sub === 'Toán' || sub === 'Ngữ văn') return;

        if (!statsMap.has(sub)) {
          statsMap.set(sub, {
            tanSuatNV1: 0,
            tanSuatNV2: 0,
            tanSuatNV3: 0,
            wishesSet: new Set<number>(),
            combosSet: new Set<string>(),
          });
        }
        const entry = statsMap.get(sub)!;
        if (order === 1) entry.tanSuatNV1 += 1;
        else if (order === 2) entry.tanSuatNV2 += 1;
        else if (order === 3) entry.tanSuatNV3 += 1;

        entry.wishesSet.add(order);
        if (cd.code) entry.combosSet.add(`${cd.code} (NV${order})`);
      });
    });
  });

  const normFavorites = favoriteSubjects.map(normalizeSubjectName);

  const allRows: SubjectFrequencyRow[] = Array.from(statsMap.entries()).map(([subject, data]) => {
    const tongTanSuat = data.tanSuatNV1 + data.tanSuatNV2 + data.tanSuatNV3;
    const diemUuTien =
      (WISH_PRIORITY_WEIGHTS[1] ?? 3) * data.tanSuatNV1 +
      (WISH_PRIORITY_WEIGHTS[2] ?? 2) * data.tanSuatNV2 +
      (WISH_PRIORITY_WEIGHTS[3] ?? 1) * data.tanSuatNV3;

    return {
      subject,
      tanSuatNV1: data.tanSuatNV1,
      tanSuatNV2: data.tanSuatNV2,
      tanSuatNV3: data.tanSuatNV3,
      tongTanSuat,
      diemUuTien,
      isValidGraduationExam: VALID_GRADUATION_ELECTIVES.has(subject),
      wishesAppearing: Array.from(data.wishesSet).sort((a, b) => a - b),
      combosAppearing: Array.from(data.combosSet),
    };
  });

  const sortRows = (a: SubjectFrequencyRow, b: SubjectFrequencyRow) => {
    if (b.diemUuTien !== a.diemUuTien) return b.diemUuTien - a.diemUuTien;
    if (b.tanSuatNV1 !== a.tanSuatNV1) return b.tanSuatNV1 - a.tanSuatNV1;
    if (b.tongTanSuat !== a.tongTanSuat) return b.tongTanSuat - a.tongTanSuat;
    const aFav = normFavorites.includes(a.subject) ? 1 : 0;
    const bFav = normFavorites.includes(b.subject) ? 1 : 0;
    if (bFav !== aFav) return bFav - aFav;
    return a.subject.localeCompare(b.subject, 'vi');
  };

  const frequencyTable = allRows.filter((r) => r.isValidGraduationExam).sort(sortRows);
  const excludedNonExamSubjects = allRows.filter((r) => !r.isValidGraduationExam).sort(sortRows);

  return { frequencyTable, excludedNonExamSubjects };
}

/**
 * Đối chiếu một tập hợp môn học bất kỳ (tập môn học THPT đến lớp 12 HOẶC 4 môn thi tốt nghiệp)
 * với toàn bộ tổ hợp xét tuyển của từng nguyện vọng.
 * - Chỉ tính "ĐÁP ỨNG ĐẦY ĐỦ VỀ MÔN HỌC" khi 100% môn thành phần của tổ hợp xét tuyển thuộc tập môn đánh giá.
 * - Mỗi nguyện vọng chỉ đóng góp trọng số (3/2/1) TỐI ĐA MỘT LẦN nếu có ít nhất 1 tổ hợp đạt.
 */
export function evaluateSubjectSetAgainstWishes(
  subjectSet: Set<string>,
  wishesAnalysis: WishAnalysisResult[],
  thptStudiedSet?: Set<string>
): {
  breakdown: WishComparisonBreakdown[];
  satisfiedWishesCount: number;
  wishWeightScore: number;
  maxPossibleWishWeightScore: number;
  partialOneMissingWishesCount: number;
  supportsNV1: boolean;
  supportsNV2: boolean;
  supportsNV3: boolean;
  totalSatisfiedCombos: number;
} {
  let satisfiedWishesCount = 0;
  let wishWeightScore = 0;
  let maxPossibleWishWeightScore = 0;
  let partialOneMissingWishesCount = 0;
  let supportsNV1 = false;
  let supportsNV2 = false;
  let supportsNV3 = false;
  let totalSatisfiedCombos = 0;

  const breakdown: WishComparisonBreakdown[] = wishesAnalysis.map((wa, wIdx) => {
    const order = wa.wishOrder || wIdx + 1;
    const weight = WISH_PRIORITY_WEIGHTS[order] ?? 0;
    if (wa.comboDetails.length > 0) {
      maxPossibleWishWeightScore += weight;
    }

    const satisfiedCombos: WishComparisonBreakdown['satisfiedCombos'] = [];
    const partialCombos: NonSatisfiedComboItem[] = [];
    const unmatchedCombos: NonSatisfiedComboItem[] = [];
    const thptCoveredComboCodes: string[] = [];

    wa.comboDetails.forEach((cd) => {
      const missing = cd.subjects.filter((sub) => !subjectSet.has(sub));
      const matched = cd.subjects.filter((sub) => subjectSet.has(sub));

      const missingFromTHPT = thptStudiedSet
        ? cd.subjects.filter((sub) => !thptStudiedSet.has(sub))
        : undefined;
      const coveredByTHPTSubjects = thptStudiedSet
        ? (missingFromTHPT?.length ?? 0) === 0
        : undefined;

      if (coveredByTHPTSubjects && cd.code) {
        thptCoveredComboCodes.push(cd.code);
      }

      if (cd.subjects.length > 0 && missing.length === 0) {
        satisfiedCombos.push({
          code: cd.code,
          subjects: cd.subjects,
          rawSubjects: cd.rawSubjects,
          notes: cd.notes,
        });
      } else {
        const item: NonSatisfiedComboItem = {
          code: cd.code,
          subjects: cd.subjects,
          rawSubjects: cd.rawSubjects,
          missing,
          matched,
          notes: cd.notes,
          isPartialMatch: matched.length > 0,
          coveredByTHPTSubjects,
          missingFromTHPT,
        };
        partialCombos.push(item);
        if (matched.length === 0) {
          unmatchedCombos.push(item);
        }
      }
    });

    // Sắp xếp tổ hợp chưa đạt: ít môn thiếu nhất (nhiều môn khớp nhất) lên đầu
    partialCombos.sort((a, b) => {
      if (a.missing.length !== b.missing.length) return a.missing.length - b.missing.length;
      return b.matched.length - a.matched.length;
    });

    const isSatisfied = satisfiedCombos.length > 0;
    if (isSatisfied) {
      satisfiedWishesCount++;
      wishWeightScore += weight; // Cộng trọng số nguyện vọng ĐÚNG MỘT LẦN
      if (order === 1) supportsNV1 = true;
      if (order === 2) supportsNV2 = true;
      if (order === 3) supportsNV3 = true;
      totalSatisfiedCombos += satisfiedCombos.length;
    } else if (partialCombos.some((pc) => pc.missing.length === 1)) {
      partialOneMissingWishesCount++;
    }

    const hasAnyPartial = partialCombos.some((pc) => pc.matched.length > 0);
    let matchLevel: 'FULL' | 'PARTIAL' | 'NONE' = 'NONE';
    let matchLabel =
      wa.comboDetails.length === 0
        ? 'Chưa có dữ liệu tổ hợp xét tuyển trong CSDL'
        : 'Chưa đáp ứng về môn học';

    if (isSatisfied) {
      matchLevel = 'FULL';
      const codes = satisfiedCombos.map((c) => c.code).filter(Boolean).join(', ');
      matchLabel = `Đáp ứng đầy đủ về môn học (${satisfiedCombos.length} tổ hợp${codes ? `: ${codes}` : ''})`;
    } else if (hasAnyPartial) {
      matchLevel = 'PARTIAL';
      const bestPartial = partialCombos[0];
      matchLabel = bestPartial
        ? `Đáp ứng một phần (${bestPartial.code || 'tổ hợp'} thiếu ${bestPartial.missing.join(', ')})`
        : 'Đáp ứng một phần';
    }

    return {
      wish: wa.wish,
      order,
      schoolName: wa.wish.tenVietTat || wa.wish.tenTruongDH || '',
      majorName: wa.wish.tenNganh || '',
      isSatisfied,
      allCombos: wa.comboDetails,
      satisfiedCombos,
      partialCombos,
      unmatchedCombos,
      thptCoveredComboCodes,
      matchLevel,
      matchLabel,
    };
  });

  return {
    breakdown,
    satisfiedWishesCount,
    wishWeightScore,
    maxPossibleWishWeightScore,
    partialOneMissingWishesCount,
    supportsNV1,
    supportsNV2,
    supportsNV3,
    totalSatisfiedCombos,
  };
}

/**
 * Đối chiếu một cặp 02 môn thi tự chọn (+ Toán, Ngữ văn) với TỪNG tổ hợp của TỪNG nguyện vọng
 */
export function evaluateExamPairAgainstWishes(
  sub1: string,
  sub2: string,
  wishesAnalysis: WishAnalysisResult[],
  freqMap: Map<string, SubjectFrequencyRow>,
  options?: {
    favoriteSubjects?: string[];
    dominantHollandCode?: RiasecKey;
    thptStudiedSet?: Set<string>;
  }
): ExamPairEvaluation {
  const s1Norm = normalizeSubjectName(sub1);
  const s2Norm = normalizeSubjectName(sub2);
  const fourSubjects = Array.from(new Set(['Toán', 'Ngữ văn', s1Norm, s2Norm].filter(Boolean)));
  const examSet = new Set(fourSubjects);

  const evalRes = evaluateSubjectSetAgainstWishes(
    examSet,
    wishesAnalysis,
    options?.thptStudiedSet
  );

  const allWishesSatisfied =
    wishesAnalysis.length > 0 && evalRes.satisfiedWishesCount === wishesAnalysis.length;

  const normFavs = (options?.favoriteSubjects || []).map(normalizeSubjectName);
  const hollandSubs = options?.dominantHollandCode
    ? HOLLAND_MATCH_MAP[options.dominantHollandCode] || []
    : [];

  let preferenceScore = 0;
  [s1Norm, s2Norm].forEach((s) => {
    if (normFavs.includes(s)) preferenceScore += 10;
    if (hollandSubs.includes(s)) preferenceScore += 5;
  });

  const p1 = freqMap.get(s1Norm)?.diemUuTien || 0;
  const p2 = freqMap.get(s2Norm)?.diemUuTien || 0;
  const frequencyPrioritySum = p1 + p2;

  const hasNV1 = wishesAnalysis.some((wa, idx) => (wa.wishOrder || idx + 1) === 1 && wa.comboDetails.length > 0);

  // Điểm tổng hợp phản ánh đúng thứ tự ưu tiên:
  // (1) Hỗ trợ NV1 -> (2) Tổng trọng số NV đạt (3-2-1) -> (3) Số NV đạt -> (4) Số NV thiếu 1 môn -> (5) Số tổ hợp đạt -> (6) Sở thích/Holland
  const coverageScore =
    (hasNV1 && evalRes.supportsNV1 ? 1_000_000 : 0) +
    evalRes.wishWeightScore * 100_000 +
    evalRes.satisfiedWishesCount * 10_000 +
    evalRes.partialOneMissingWishesCount * 1_000 +
    evalRes.totalSatisfiedCombos * 50 +
    preferenceScore * 5 +
    Math.min(4, frequencyPrioritySum * 0.05);

  return {
    sub1: s1Norm,
    sub2: s2Norm,
    fourSubjects,
    satisfiedWishesCount: evalRes.satisfiedWishesCount,
    wishWeightScore: evalRes.wishWeightScore,
    maxPossibleWishWeightScore: evalRes.maxPossibleWishWeightScore,
    partialOneMissingWishesCount: evalRes.partialOneMissingWishesCount,
    supportsNV1: evalRes.supportsNV1,
    supportsNV2: evalRes.supportsNV2,
    supportsNV3: evalRes.supportsNV3,
    allWishesSatisfied,
    totalSatisfiedCombos: evalRes.totalSatisfiedCombos,
    preferenceScore,
    frequencyPrioritySum,
    breakdown: evalRes.breakdown,
    coverageScore,
  };
}

/**
 * So sánh 2 phương án cặp môn thi tốt nghiệp theo thứ tự ưu tiên chuẩn:
 * 1. Đáp ứng NV1
 * 2. Tổng trọng số NV đạt (NV1=3, NV2=2, NV3=1, mỗi NV tối đa 1 lần)
 * 3. Số lượng NV đáp ứng đầy đủ
 * 4. Số NV chỉ thiếu 1 môn (tiêu chí phụ cho phương án gần đạt)
 * 5. Số tổ hợp xét tuyển đạt được (linh hoạt phương án xét tuyển)
 * 6. Sở thích THCS & Holland RIASEC
 * 7. Tổng tần suất tham khảo & thứ tự chữ cái (nhất quán)
 */
export function compareExamPairEvaluations(a: ExamPairEvaluation, b: ExamPairEvaluation): number {
  if (a.supportsNV1 !== b.supportsNV1) return a.supportsNV1 ? -1 : 1;
  if (b.wishWeightScore !== a.wishWeightScore) return b.wishWeightScore - a.wishWeightScore;
  if (b.satisfiedWishesCount !== a.satisfiedWishesCount) {
    return b.satisfiedWishesCount - a.satisfiedWishesCount;
  }
  if (b.partialOneMissingWishesCount !== a.partialOneMissingWishesCount) {
    return b.partialOneMissingWishesCount - a.partialOneMissingWishesCount;
  }
  if (b.totalSatisfiedCombos !== a.totalSatisfiedCombos) {
    return b.totalSatisfiedCombos - a.totalSatisfiedCombos;
  }
  if (b.preferenceScore !== a.preferenceScore) {
    return b.preferenceScore - a.preferenceScore;
  }
  if (b.frequencyPrioritySum !== a.frequencyPrioritySum) {
    return b.frequencyPrioritySum - a.frequencyPrioritySum;
  }
  return `${a.sub1}|${a.sub2}`.localeCompare(`${b.sub1}|${b.sub2}`, 'vi');
}

function buildLimitationNotice(
  pairEval: ExamPairEvaluation,
  wishesCount: number
): string | null {
  if (wishesCount === 0 || pairEval.allWishesSatisfied) return null;

  const satisfiedList = pairEval.breakdown
    .filter((b) => b.isSatisfied)
    .map((b) => `NV${b.order} (${b.satisfiedCombos.map((c) => c.code).join(', ')})`);

  const unsatisfiedList = pairEval.breakdown
    .filter((b) => !b.isSatisfied)
    .map((b) => {
      const bestPartial = b.partialCombos[0];
      if (!bestPartial) return `NV${b.order} (${b.majorName})`;
      const thptHint = bestPartial.coveredByTHPTSubjects
        ? ' — có học ở THPT nhưng không nằm cùng lúc trong 2 môn thi tự chọn'
        : '';
      return `NV${b.order} (tổ hợp gần nhất ${bestPartial.code} thiếu ${bestPartial.missing.join(', ')}${thptHint})`;
    });

  return `Giới hạn phương án thi tốt nghiệp: Do thí sinh chỉ thi 02 môn tự chọn ngoài Toán và Ngữ văn, không có cặp 02 môn thi nào đáp ứng đồng thời toàn bộ ${wishesCount} nguyện vọng. Phương án tối ưu nhất là ${pairEval.sub1} + ${pairEval.sub2} (đạt ${satisfiedList.length > 0 ? satisfiedList.join('; ') : 'chưa đạt NV nào'}; chưa đáp ứng: ${unsatisfiedList.join('; ')}).`;
}

function buildSelectionReasonText(
  pairEval: ExamPairEvaluation,
  wishesCount: number,
  sourceContext: 'THPT_COMBO' | 'OVERALL',
  thptComboCode?: string
): string {
  const ctxPrefix =
    sourceContext === 'THPT_COMBO' && thptComboCode
      ? `Từ tập môn học thực tế đến lớp 12 của tổ hợp ${thptComboCode}, thuật toán đã đối chiếu toàn bộ các cặp 02 môn thi tốt nghiệp tự chọn hợp lệ với tổ hợp xét tuyển của từng nguyện vọng (trọng số NV1 = 3, NV2 = 2, NV3 = 1; mỗi nguyện vọng tính 1 lần).`
      : `Thuật toán đã đối chiếu toàn bộ các cặp 02 môn thi tốt nghiệp tự chọn hợp lệ với tổ hợp xét tuyển hoàn chỉnh của từng nguyện vọng (trọng số NV1 = 3, NV2 = 2, NV3 = 1; mỗi nguyện vọng tính 1 lần).`;

  const satisfiedWishesDesc = pairEval.breakdown
    .filter((b) => b.isSatisfied)
    .map(
      (b) =>
        `NV${b.order} (${b.majorName} – ${b.schoolName}) qua ${b.satisfiedCombos
          .map((c) => c.code)
          .filter(Boolean)
          .join(', ')}`
    )
    .join('; ');

  const unsatisfiedWishesDesc = pairEval.breakdown
    .filter((b) => !b.isSatisfied)
    .map((b) => {
      const closest = b.partialCombos[0];
      return closest
        ? `NV${b.order} (${closest.code} thiếu ${closest.missing.join(', ')})`
        : `NV${b.order}`;
    })
    .join('; ');

  let reason = `${ctxPrefix} Cặp môn thi tối ưu nhất là ${pairEval.sub1} + ${pairEval.sub2} (cùng Toán, Ngữ văn tạo thành 04 môn thi dự kiến; điểm trọng số nguyện vọng: ${pairEval.wishWeightScore}/${pairEval.maxPossibleWishWeightScore || pairEval.wishWeightScore}).`;

  if (satisfiedWishesDesc) {
    reason += ` Đáp ứng đầy đủ về môn học cho ${pairEval.satisfiedWishesCount}/${wishesCount} nguyện vọng: ${satisfiedWishesDesc}.`;
  }
  if (unsatisfiedWishesDesc) {
    reason += ` Chưa đáp ứng đồng thời ở kỳ thi tốt nghiệp: ${unsatisfiedWishesDesc}.`;
  }
  reason += ` Lưu ý: Đây chỉ là đối chiếu môn học giữa môn học THPT, 04 môn thi dự kiến và tổ hợp xét tuyển đại học, không phải xác nhận đủ điều kiện trúng tuyển.`;
  return reason;
}

/**
 * Thuật toán tổng hợp đầy đủ (Bước 1 -> Bước 6)
 */
export function runFrequencyConsultationAlgorithm(params: {
  activeWishes: UniversityWish[];
  toHopList: ToHopXetTuyenItem[];
  validTHPTCombinations: ToHopTHPTItem[];
  favoriteSubjects: string[];
  dominantHollandCode: RiasecKey;
}): FrequencyConsultationResult {
  const {
    activeWishes,
    toHopList,
    validTHPTCombinations,
    favoriteSubjects,
    dominantHollandCode,
  } = params;

  // BƯỚC 1: Đọc dữ liệu thực tế tổ hợp xét tuyển của từng nguyện vọng
  const wishesAnalysis = extractWishesAdmissionCombos(activeWishes, toHopList);

  // Thống kê phụ trợ môn học theo nguyện vọng
  const { frequencyTable, excludedNonExamSubjects } = computeSubjectFrequencyStats(
    wishesAnalysis,
    favoriteSubjects
  );

  const freqMap = new Map<string, SubjectFrequencyRow>();
  frequencyTable.forEach((row) => freqMap.set(row.subject, row));

  const normFavs = favoriteSubjects.map(normalizeSubjectName);
  const targetHollandSubjects = HOLLAND_MATCH_MAP[dominantHollandCode] || [];

  // BƯỚC 2, 3, 4: Đánh giá toàn bộ tổ hợp môn học lớp 10 thực tế của trường THPT đã chọn
  const rawEvaluatedTHPT: EvaluatedTHPTCombination[] = validTHPTCombinations
    .filter((item) => {
      const status = (item.trangThai || '').trim().toLowerCase();
      return (
        !status.includes('ngừng') &&
        !status.includes('hủy') &&
        !status.includes('không áp dụng')
      );
    })
    .map((item) => {
      const electives =
        item.monLuaChon && item.monLuaChon.length > 0
          ? item.monLuaChon.filter(Boolean)
          : [item.monLuaChon1, item.monLuaChon2, item.monLuaChon3, item.monLuaChon4].filter(
              (m): m is string => Boolean(m && m.trim())
            );

      const topics =
        item.chuyenDe && item.chuyenDe.length > 0
          ? item.chuyenDe.filter(Boolean)
          : [item.chuyenDe1, item.chuyenDe2, item.chuyenDe3].filter((c): c is string =>
              Boolean(c && c.trim())
            );

      const normElectives = electives.map(normalizeSubjectName);

      // Tập hợp môn học sinh thực tế được học liên tục đến lớp 12 trong tổ hợp THPT này
      const actualSubjectsToGrade12 = Array.from(
        new Set<string>([...COMPULSORY_THPT_CORE, ...normElectives])
      );
      const grade12Set = new Set(actualSubjectsToGrade12);

      // BƯỚC 3 & 4: Đối chiếu tập môn học THPT đến lớp 12 với từng nguyện vọng (trọng số 3-2-1, tính tối đa 1 lần/NV)
      const thptEval = evaluateSubjectSetAgainstWishes(grade12Set, wishesAnalysis, grade12Set);
      const thptSupportedWishesOrders = thptEval.breakdown
        .filter((b) => b.isSatisfied)
        .map((b) => b.order);
      const thptUnsatisfiedWishesOrders = thptEval.breakdown
        .filter((b) => !b.isSatisfied)
        .map((b) => b.order);

      // BƯỚC 5 (trong phạm vi tổ hợp THPT này):
      // Liệt kê mọi cặp 2 môn thi tốt nghiệp tự chọn hợp lệ từ các môn thực tế được học
      const eligibleExamsInCombo = actualSubjectsToGrade12.filter(
        (s) => s !== 'Toán' && s !== 'Ngữ văn' && VALID_GRADUATION_ELECTIVES.has(s)
      );

      const comboPairEvals: ExamPairEvaluation[] = [];
      for (let i = 0; i < eligibleExamsInCombo.length; i++) {
        for (let j = i + 1; j < eligibleExamsInCombo.length; j++) {
          comboPairEvals.push(
            evaluateExamPairAgainstWishes(
              eligibleExamsInCombo[i],
              eligibleExamsInCombo[j],
              wishesAnalysis,
              freqMap,
              {
                favoriteSubjects,
                dominantHollandCode,
                thptStudiedSet: grade12Set,
              }
            )
          );
        }
      }
      comboPairEvals.sort(compareExamPairEvaluations);

      const bestExamPairInCombo =
        comboPairEvals[0] ||
        evaluateExamPairAgainstWishes(
          eligibleExamsInCombo[0] || 'Tiếng Anh',
          eligibleExamsInCombo[1] || 'Lịch sử',
          wishesAnalysis,
          freqMap,
          {
            favoriteSubjects,
            dominantHollandCode,
            thptStudiedSet: grade12Set,
          }
        );

      // Các môn lựa chọn bổ sung còn lại ngoài 2 môn thi tốt nghiệp tối ưu của tổ hợp
      const remainingElectives = normElectives.filter(
        (e) => e !== bestExamPairInCombo.sub1 && e !== bestExamPairInCombo.sub2
      );
      const sortedRemaining = [...remainingElectives].sort((a, b) => {
        const ra = freqMap.get(a);
        const rb = freqMap.get(b);
        const pa = ra?.diemUuTien || 0;
        const pb = rb?.diemUuTien || 0;
        if (pb !== pa) return pb - pa;
        const fa = normFavs.includes(a) ? 1 : 0;
        const fb = normFavs.includes(b) ? 1 : 0;
        if (fb !== fa) return fb - fa;
        return a.localeCompare(b, 'vi');
      });

      const additionalElectives = sortedRemaining.slice(0, 2);
      const additionalElectiveDetails = additionalElectives.map((s) => ({
        subject: s,
        diemUuTien: freqMap.get(s)?.diemUuTien || 0,
        tongTanSuat: freqMap.get(s)?.tongTanSuat || 0,
      }));

      const top2AdditionalPriorityScore = additionalElectives.reduce(
        (sum, s) => sum + (freqMap.get(s)?.diemUuTien || 0),
        0
      );
      const allAdditionalPriorityScore = remainingElectives.reduce(
        (sum, s) => sum + (freqMap.get(s)?.diemUuTien || 0),
        0
      );

      // Tiêu chí hỗ trợ: Sở thích THCS & Holland RIASEC (không thay thế điều kiện môn học)
      const favoriteMatched = normElectives.filter((e) => normFavs.includes(e));
      const favoriteScore = Math.min(20, favoriteMatched.length * 5);

      const hollandMatched = normElectives.filter((e) => targetHollandSubjects.includes(e));
      const hollandScore =
        hollandMatched.length >= 3
          ? 10
          : hollandMatched.length === 2
          ? 7
          : hollandMatched.length === 1
          ? 4
          : 0;

      const supportedWishesOrders = bestExamPairInCombo.breakdown
        .filter((b) => b.isSatisfied)
        .map((b) => b.order);
      const unsatisfiedWishesOrders = bestExamPairInCombo.breakdown
        .filter((b) => !b.isSatisfied)
        .map((b) => b.order);

      const maxWeight = thptEval.maxPossibleWishWeightScore || 6;
      const thptWeightRatio = maxWeight > 0 ? thptEval.wishWeightScore / maxWeight : 0;
      const examWeightRatio = maxWeight > 0 ? bestExamPairInCombo.wishWeightScore / maxWeight : 0;
      const totalScore = Math.min(
        100,
        Math.round(
          (thptEval.supportsNV1 ? 25 : 0) +
            thptWeightRatio * 35 +
            examWeightRatio * 25 +
            Math.min(15, hollandScore + favoriteScore / 4)
        )
      );

      const strengths: string[] = [];
      const limitations: string[] = [];

      if (thptSupportedWishesOrders.length > 0) {
        strengths.push(
          `Môn học THPT đáp ứng đầy đủ ${thptSupportedWishesOrders.map((o) => `NV${o}`).join(', ')} (${thptEval.wishWeightScore}/${maxWeight}đ trọng số).`
        );
      } else {
        limitations.push('Chưa đáp ứng đầy đủ môn học cho các tổ hợp xét tuyển đã chọn.');
      }

      strengths.push(
        `Cặp môn thi tốt nghiệp tối ưu trong tổ hợp: ${bestExamPairInCombo.sub1} + ${bestExamPairInCombo.sub2} (đạt ${bestExamPairInCombo.satisfiedWishesCount}/${wishesAnalysis.length} NV).`
      );

      if (thptUnsatisfiedWishesOrders.length > 0) {
        limitations.push(
          `Chưa đáp ứng về môn học THPT: ${thptUnsatisfiedWishesOrders.map((o) => `NV${o}`).join(', ')}.`
        );
      } else if (unsatisfiedWishesOrders.length > 0) {
        limitations.push(
          `Có đủ môn học ở THPT, nhưng 2 môn thi tốt nghiệp tự chọn chỉ bao phủ đồng thời ${supportedWishesOrders.map((o) => `NV${o}`).join(', ') || '0 NV'}.`
        );
      }

      if (hollandMatched.length > 0 || favoriteMatched.length > 0) {
        const fitParts: string[] = [];
        if (hollandMatched.length > 0) {
          fitParts.push(`khớp nhóm Holland ${dominantHollandCode} (${hollandMatched.join(', ')})`);
        }
        if (favoriteMatched.length > 0) {
          fitParts.push(`${favoriteMatched.length} môn yêu thích THCS (${favoriteMatched.join(', ')})`);
        }
        strengths.push(`Tiêu chí hỗ trợ: ${fitParts.join('; ')}.`);
      }

      return {
        comb: item,
        electives,
        topics,
        normElectives,
        actualSubjectsToGrade12,
        containsBothProjectedExams: true,
        containsProjectedSub1: true,
        containsProjectedSub2: true,
        additionalElectives,
        additionalElectiveDetails,
        top2AdditionalPriorityScore,
        allAdditionalPriorityScore,
        bestExamPairInCombo,
        thptWishesBreakdown: thptEval.breakdown,
        thptWishWeightScore: thptEval.wishWeightScore,
        thptSupportedWishesOrders,
        thptUnsatisfiedWishesOrders,
        supportsNV1: thptEval.supportsNV1,
        supportsNV2: thptEval.supportsNV2,
        supportsNV3: thptEval.supportsNV3,
        supportedWishesCount: thptSupportedWishesOrders.length,
        supportedWishesOrders: thptSupportedWishesOrders,
        unsatisfiedWishesOrders: thptUnsatisfiedWishesOrders,
        totalSatisfiedCombos: thptEval.totalSatisfiedCombos,
        reachableCombosCount: thptEval.totalSatisfiedCombos,
        hollandScore,
        favoriteScore,
        score: totalScore,
        rankTierLabel: '',
        rankingReason: '',
        strengths,
        limitations,
      };
    });

  // BƯỚC 4 & BƯỚC 6: Xếp hạng tổ hợp THPT theo đúng thứ tự ưu tiên:
  // 1. Đáp ứng đầy đủ NV1 (về môn học THPT)
  // 2. Tổng điểm đáp ứng nguyện vọng (trọng số NV1=3, NV2=2, NV3=1; mỗi NV tính 1 lần)
  // 3. Số lượng nguyện vọng được đáp ứng đầy đủ (ở bậc THPT)
  // 4. Khả năng sử dụng cặp 2 môn thi tốt nghiệp tối ưu trong tổ hợp đó (NV1 -> trọng số -> số NV đạt -> số tổ hợp đạt)
  // 5. Mức độ phù hợp Holland & sở thích THCS (chỉ là tiêu chí hỗ trợ)
  // 6. Tiêu chí phụ nhất quán (tổng số tổ hợp xét tuyển đạt, điểm ưu tiên bổ sung, mã tổ hợp)
  const sortedEvaluatedTHPT = [...rawEvaluatedTHPT].sort((a, b) => {
    if (a.supportsNV1 !== b.supportsNV1) {
      return a.supportsNV1 ? -1 : 1;
    }
    if (b.thptWishWeightScore !== a.thptWishWeightScore) {
      return b.thptWishWeightScore - a.thptWishWeightScore;
    }
    if (b.supportedWishesCount !== a.supportedWishesCount) {
      return b.supportedWishesCount - a.supportedWishesCount;
    }
    const examPairCmp = compareExamPairEvaluations(
      a.bestExamPairInCombo,
      b.bestExamPairInCombo
    );
    if (examPairCmp !== 0) return examPairCmp;

    const aFit = a.hollandScore + a.favoriteScore;
    const bFit = b.hollandScore + b.favoriteScore;
    if (bFit !== aFit) return bFit - aFit;

    if (b.reachableCombosCount !== a.reachableCombosCount) {
      return b.reachableCombosCount - a.reachableCombosCount;
    }
    if (b.top2AdditionalPriorityScore !== a.top2AdditionalPriorityScore) {
      return b.top2AdditionalPriorityScore - a.top2AdditionalPriorityScore;
    }
    return (a.comb.maToHopTHPT || '').localeCompare(b.comb.maToHopTHPT || '', 'vi');
  });

  // Chọn cặp 2 môn thi tốt nghiệp dự kiến tổng thể (từ Top 1 tổ hợp THPT nếu có, hoặc đánh giá toàn bộ cặp môn hợp lệ nếu trường chưa có TO_HOP_THPT)
  let projectedEvaluation: ExamPairEvaluation;
  let allCandidatePairsEvals: ExamPairEvaluation[] = [];

  if (sortedEvaluatedTHPT.length > 0) {
    const top1 = sortedEvaluatedTHPT[0];
    projectedEvaluation = top1.bestExamPairInCombo;

    // Tổng hợp các cặp môn khả thi trong Top 1 để so sánh phương án thay thế
    const top1Eligible = top1.actualSubjectsToGrade12.filter(
      (s) => s !== 'Toán' && s !== 'Ngữ văn' && VALID_GRADUATION_ELECTIVES.has(s)
    );
    const grade12SetTop1 = new Set(top1.actualSubjectsToGrade12);
    for (let i = 0; i < top1Eligible.length; i++) {
      for (let j = i + 1; j < top1Eligible.length; j++) {
        allCandidatePairsEvals.push(
          evaluateExamPairAgainstWishes(
            top1Eligible[i],
            top1Eligible[j],
            wishesAnalysis,
            freqMap,
            {
              favoriteSubjects,
              dominantHollandCode,
              thptStudiedSet: grade12SetTop1,
            }
          )
        );
      }
    }
    allCandidatePairsEvals.sort(compareExamPairEvaluations);
  } else {
    // Trường hợp trường THPT chưa có danh sách TO_HOP_THPT: xét mọi cặp môn tự chọn hợp lệ xuất hiện trong NV + sở thích + Holland
    const fallbackCandidates = Array.from(
      new Set([
        ...frequencyTable.map((r) => r.subject),
        ...normFavs.filter(
          (s) => s !== 'Toán' && s !== 'Ngữ văn' && VALID_GRADUATION_ELECTIVES.has(s)
        ),
        ...targetHollandSubjects.filter(
          (s) => s !== 'Toán' && s !== 'Ngữ văn' && VALID_GRADUATION_ELECTIVES.has(s)
        ),
        ...NEUTRAL_ELECTIVE_ORDER,
      ])
    ).filter((s) => s !== 'Toán' && s !== 'Ngữ văn' && VALID_GRADUATION_ELECTIVES.has(s));

    const seenKeys = new Set<string>();
    for (let i = 0; i < fallbackCandidates.length; i++) {
      for (let j = i + 1; j < fallbackCandidates.length; j++) {
        const a = fallbackCandidates[i];
        const b = fallbackCandidates[j];
        if (frequencyTable.length > 0 && !freqMap.has(a) && !freqMap.has(b)) continue;
        const key = [a, b].sort().join('|');
        if (seenKeys.has(key)) continue;
        seenKeys.add(key);
        allCandidatePairsEvals.push(
          evaluateExamPairAgainstWishes(a, b, wishesAnalysis, freqMap, {
            favoriteSubjects,
            dominantHollandCode,
          })
        );
      }
    }
    allCandidatePairsEvals.sort(compareExamPairEvaluations);
    projectedEvaluation =
      allCandidatePairsEvals[0] ||
      evaluateExamPairAgainstWishes(
        fallbackCandidates[0] || 'Tiếng Anh',
        fallbackCandidates[1] || 'Lịch sử',
        wishesAnalysis,
        freqMap,
        { favoriteSubjects, dominantHollandCode }
      );
  }

  const sub1 = projectedEvaluation.sub1;
  const sub2 = projectedEvaluation.sub2;
  const projectedPair: [string, string] = [sub1, sub2];
  const meetsAllWishesByFrequency = projectedEvaluation.allWishesSatisfied;
  const primaryKey = [sub1, sub2].sort().join('|');

  // Cập nhật nhãn xếp hạng, lý do xếp hạng và đối chiếu với cặp môn thi dự kiến tổng thể cho từng tổ hợp THPT
  const evaluatedTHPTCombinations: EvaluatedTHPTCombination[] = sortedEvaluatedTHPT.map(
    (entry, idx) => {
      const grade12Set = new Set(entry.actualSubjectsToGrade12);
      const containsProjectedSub1 = grade12Set.has(sub1);
      const containsProjectedSub2 = grade12Set.has(sub2);
      const containsBothProjectedExams = containsProjectedSub1 && containsProjectedSub2;

      const rankTierLabel =
        idx === 0
          ? 'Top 1: Phù hợp nhất'
          : idx === 1
          ? 'Top 2: Phương án thay thế'
          : idx === 2
          ? 'Top 3: Phương án dự phòng'
          : `Phương án ${idx + 1}`;

      const maxWeight =
        entry.bestExamPairInCombo.maxPossibleWishWeightScore ||
        wishesAnalysis.reduce((s, wa, wIdx) => {
          const order = wa.wishOrder || wIdx + 1;
          return wa.comboDetails.length > 0 ? s + (WISH_PRIORITY_WEIGHTS[order] ?? 0) : s;
        }, 0);

      const satWishesText =
        entry.thptSupportedWishesOrders.length > 0
          ? entry.thptSupportedWishesOrders.map((o) => `NV${o}`).join(', ')
          : 'chưa có';

      const examSatText =
        entry.bestExamPairInCombo.satisfiedWishesCount > 0
          ? entry.bestExamPairInCombo.breakdown
              .filter((b) => b.isSatisfied)
              .map((b) => `NV${b.order} (${b.satisfiedCombos.map((c) => c.code).join(', ')})`)
              .join('; ')
          : 'chưa đạt trực tiếp';

      const favMatched = entry.normElectives.filter((e) => normFavs.includes(e));
      const holMatched = entry.normElectives.filter((e) => targetHollandSubjects.includes(e));
      const fitParts: string[] = [];
      if (holMatched.length > 0) fitParts.push(`phù hợp Holland ${dominantHollandCode} (${holMatched.length} môn)`);
      if (favMatched.length > 0) fitParts.push(`${favMatched.length} môn yêu thích THCS`);
      const fitNote = fitParts.length > 0 ? ` Hỗ trợ: ${fitParts.join(', ')}.` : '';

      const rankingReason =
        `Đáp ứng môn học THPT cho ${satWishesText} (${entry.thptWishWeightScore}/${maxWeight || entry.thptWishWeightScore}đ trọng số). Cặp thi tốt nghiệp tối ưu ${entry.bestExamPairInCombo.sub1} + ${entry.bestExamPairInCombo.sub2} hỗ trợ ${examSatText}.${fitNote}`.trim();

      return {
        ...entry,
        containsProjectedSub1,
        containsProjectedSub2,
        containsBothProjectedExams,
        rankTierLabel,
        rankingReason,
      };
    }
  );

  const top3THPTCombinations = evaluatedTHPTCombinations.slice(0, 3);
  const anyTHPTContainsBothProjected = evaluatedTHPTCombinations.some(
    (c) => c.containsBothProjectedExams
  );

  // Kiểm tra các phương án đồng hạng & phương án thay thế
  const tiedTopPairs = allCandidatePairsEvals.filter((pe) => {
    const key = [pe.sub1, pe.sub2].sort().join('|');
    if (key === primaryKey) return false;
    return (
      pe.supportsNV1 === projectedEvaluation.supportsNV1 &&
      pe.wishWeightScore === projectedEvaluation.wishWeightScore &&
      pe.satisfiedWishesCount === projectedEvaluation.satisfiedWishesCount
    );
  });

  const higherCoverageAlternatives = allCandidatePairsEvals.filter((pe) => {
    const key = [pe.sub1, pe.sub2].sort().join('|');
    if (key === primaryKey) return false;
    if (pe.satisfiedWishesCount > projectedEvaluation.satisfiedWishesCount) return true;
    if (!projectedEvaluation.supportsNV1 && pe.supportsNV1) return true;
    return false;
  });

  const combinedAlternativesMap = new Map<string, ExamPairEvaluation>();
  [...higherCoverageAlternatives, ...tiedTopPairs, ...allCandidatePairsEvals].forEach((pe) => {
    const key = [pe.sub1, pe.sub2].sort().join('|');
    if (key === primaryKey) return;
    if (!combinedAlternativesMap.has(key) && combinedAlternativesMap.size < 4) {
      combinedAlternativesMap.set(key, pe);
    }
  });
  const alternativePairs = Array.from(combinedAlternativesMap.values());

  const statusTag: 'FULL_MATCH' | 'PARTIAL_MATCH' = meetsAllWishesByFrequency
    ? 'FULL_MATCH'
    : 'PARTIAL_MATCH';

  const statusBadgeText = meetsAllWishesByFrequency
    ? `Đáp ứng đầy đủ về môn học ${projectedEvaluation.satisfiedWishesCount}/${wishesAnalysis.length} nguyện vọng`
    : `Phương án tối ưu nhất hiện có (đạt ${projectedEvaluation.satisfiedWishesCount}/${wishesAnalysis.length} nguyện vọng)`;

  const top1Code = evaluatedTHPTCombinations[0]?.comb.maToHopTHPT;
  const selectionReasonText = buildSelectionReasonText(
    projectedEvaluation,
    wishesAnalysis.length,
    evaluatedTHPTCombinations.length > 0 ? 'THPT_COMBO' : 'OVERALL',
    top1Code
  );
  const examPairLimitationNotice = buildLimitationNotice(
    projectedEvaluation,
    wishesAnalysis.length
  );

  let thptFallbackNotice: string | null = null;
  if (
    evaluatedTHPTCombinations.length > 0 &&
    !evaluatedTHPTCombinations[0].bestExamPairInCombo.allWishesSatisfied &&
    wishesAnalysis.length > 0
  ) {
    const top1 = evaluatedTHPTCombinations[0];
    if (top1.thptSupportedWishesOrders.length > top1.bestExamPairInCombo.satisfiedWishesCount) {
      thptFallbackNotice = `Lưu ý: Tổ hợp ${top1.comb.maToHopTHPT} có đủ môn học THPT cho ${top1.thptSupportedWishesOrders.map((o) => `NV${o}`).join(', ')}, nhưng do kỳ thi tốt nghiệp chỉ chọn 02 môn tự chọn nên cặp thi tối ưu (${top1.bestExamPairInCombo.sub1} + ${top1.bestExamPairInCombo.sub2}) đáp ứng đồng thời ${top1.bestExamPairInCombo.satisfiedWishesCount}/${wishesAnalysis.length} nguyện vọng.`;
    }
  }

  const nextPriorityCandidates = frequencyTable.filter(
    (row) => row.subject !== sub1 && row.subject !== sub2
  );

  const activeSupplementaryElectives =
    top3THPTCombinations[0]?.additionalElectives ||
    nextPriorityCandidates.slice(0, 2).map((r) => r.subject);

  return {
    wishesAnalysis,
    frequencyTable,
    excludedNonExamSubjects,
    projectedPair,
    projectedFourSubjects: projectedEvaluation.fourSubjects,
    projectedEvaluation,
    meetsAllWishesByFrequency,
    statusTag,
    statusBadgeText,
    selectionReasonText,
    examPairLimitationNotice,
    tiedTopPairs,
    higherCoverageAlternatives,
    alternativePairs,
    evaluatedTHPTCombinations,
    top3THPTCombinations,
    anyTHPTContainsBothProjected,
    thptFallbackNotice,
    activeSupplementaryElectives,
    nextPriorityCandidates,
  };
}
