/**
 * Dịch vụ API và thuật toán trắc nghiệm sở thích nghề nghiệp Holland (RIASEC) 108 câu hỏi
 * Sheet câu hỏi: BO_108_CAU_HOI (MaCauHoi, STT, MaRIASEC, TenNhomHolland, PhanLoai, NoiDungCauHoi, DiemNeuChon, Nguon)
 * Sheet tra cứu: TRA_CUU_NGANH_NGHE (Mã, Tên nhóm Holland, Đặc điểm & Năng lực nổi bật, Ngành nghề phù hợp (Theo tài liệu IUQ))
 */

import { ApiFetchError, getGoogleAppsScriptUrl } from './schoolApiService';

export type RiasecKey = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

export const RIASEC_TIE_BREAK_ORDER: readonly RiasecKey[] = ['R', 'I', 'A', 'S', 'E', 'C'] as const;

export interface HollandQuestionItem {
  id: string; // MaCauHoi duy nhất
  maCauHoi?: string;
  stt: number; // Số thứ tự câu hỏi (1..108)
  content: string; // Nội dung câu hỏi từ sheet BO_108_CAU_HOI (NoiDungCauHoi)
  category: RiasecKey; // Mã nhóm RIASEC (MaRIASEC: R, I, A, S, E, C)
  categoryName: string; // Tên nhóm Holland
  tenNhomHolland?: string;
  phanLoai?: string; // PhanLoai ("Tôi là người...", "Tôi có thể...", "Tôi thích...")
  diemNeuChon?: number; // DiemNeuChon (luôn = 1)
  nguon?: string; // Nguon
  thangDiem?: string | null;
  rawItem?: Record<string, any>;
}

export interface HollandCareerLookupItem {
  ma: RiasecKey; // Mã (R, I, A, S, E, C)
  maRIASEC: RiasecKey; // MaRIASEC từ API ?action=traCuuNganhNghe
  tenTiengAnh: string; // TenTiengAnh
  tenTiengViet: string; // TenTiengViet
  moTa: string; // MoTa
  linhVucGoiY: string; // LinhVucGoiY
  tenNhomHolland: string; // TenNhomHolland
  nganhNgheGoiY: string; // NganhNgheGoiY
  dacDiemNoiBat: string; // Tương thích hiển thị mô tả
  nganhNghePhuHop: string; // Tương thích hiển thị ngành nghề
  nganhNgheList: string[]; // Danh sách ngành nghề tách theo dấu chấm phẩy/xuống dòng
  rawItem?: any;
}

export type HollandFitLevel = 'THẤP' | 'TRUNG BÌNH' | 'CAO';

export interface ScaleOption {
  value: number;
  label: string;
  desc?: string;
}

// Thang điểm nhị phân chuẩn cho trắc nghiệm RIASEC 108 câu: Tick = 1, Không tick = 0
export const DEFAULT_SCALE_OPTIONS: ScaleOption[] = [
  { value: 0, label: 'Không chọn', desc: 'Không tính điểm (0 điểm)' },
  { value: 1, label: 'Tick chọn', desc: 'Phù hợp với bản thân (1 điểm)' },
];

export const LIKERT_3_SCALE_OPTIONS: ScaleOption[] = DEFAULT_SCALE_OPTIONS;
export const LIKERT_5_SCALE_OPTIONS: ScaleOption[] = DEFAULT_SCALE_OPTIONS;

// Thông tin hiển thị giao diện (màu sắc, nhãn nhóm) 6 nhóm RIASEC
export interface RiasecInfo {
  code: RiasecKey;
  name: string;
  vietnameseName: string;
  color: string;
  badgeBg: string;
  borderColor: string;
  barColor: string;
  summary: string;
  traits: string[];
  careers: string[];
}

export const RIASEC_INFO_MAP: Record<RiasecKey, RiasecInfo> = {
  R: {
    code: 'R',
    name: 'Realistic',
    vietnameseName: 'Kỹ thuật / Thực tế',
    color: 'text-amber-700',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
    borderColor: 'border-amber-200',
    barColor: 'bg-amber-500',
    summary: 'Nhóm Kỹ thuật / Thực tế (Realistic)',
    traits: [],
    careers: [],
  },
  I: {
    code: 'I',
    name: 'Investigative',
    vietnameseName: 'Nghiên cứu / Khám phá',
    color: 'text-blue-700',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
    borderColor: 'border-blue-200',
    barColor: 'bg-blue-600',
    summary: 'Nhóm Nghiên cứu / Khám phá (Investigative)',
    traits: [],
    careers: [],
  },
  A: {
    code: 'A',
    name: 'Artistic',
    vietnameseName: 'Nghệ thuật / Sáng tạo',
    color: 'text-purple-700',
    badgeBg: 'bg-purple-100 text-purple-800 border-purple-300',
    borderColor: 'border-purple-200',
    barColor: 'bg-purple-500',
    summary: 'Nhóm Nghệ thuật / Sáng tạo (Artistic)',
    traits: [],
    careers: [],
  },
  S: {
    code: 'S',
    name: 'Social',
    vietnameseName: 'Xã hội / Giúp đỡ',
    color: 'text-emerald-700',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    borderColor: 'border-emerald-200',
    barColor: 'bg-emerald-500',
    summary: 'Nhóm Xã hội / Giúp đỡ (Social)',
    traits: [],
    careers: [],
  },
  E: {
    code: 'E',
    name: 'Enterprising',
    vietnameseName: 'Quản lý / Kinh doanh',
    color: 'text-rose-700',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
    borderColor: 'border-rose-200',
    barColor: 'bg-rose-500',
    summary: 'Nhóm Quản lý / Kinh doanh (Enterprising)',
    traits: [],
    careers: [],
  },
  C: {
    code: 'C',
    name: 'Conventional',
    vietnameseName: 'Nghiệp vụ / Quy chuẩn',
    color: 'text-cyan-700',
    badgeBg: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    borderColor: 'border-cyan-200',
    barColor: 'bg-cyan-600',
    summary: 'Nhóm Nghiệp vụ / Quy chuẩn (Conventional)',
    traits: [],
    careers: [],
  },
};

// Danh mục môn học THPT/THCS dùng cho tùy chọn bổ sung
export interface HighSchoolSubject {
  id: string;
  name: string;
  category: 'Bắt buộc' | 'Khoa học tự nhiên' | 'Khoa học xã hội' | 'Công nghệ & Nghệ thuật';
  desc: string;
}

export const DM_MON_HOC: HighSchoolSubject[] = [
  { id: 'toan', name: 'Toán', category: 'Bắt buộc', desc: 'Tư duy logic và giải quyết vấn đề định lượng' },
  { id: 'ngu_van', name: 'Ngữ văn', category: 'Bắt buộc', desc: 'Tư duy ngôn ngữ, cảm thụ văn học và giao tiếp' },
  { id: 'tieng_anh', name: 'Tiếng Anh', category: 'Bắt buộc', desc: 'Ngoại ngữ hội nhập quốc tế' },
  { id: 'lich_su', name: 'Lịch sử', category: 'Bắt buộc', desc: 'Kiến thức lịch sử dân tộc và thế giới' },
  { id: 'vat_li', name: 'Vật lí', category: 'Khoa học tự nhiên', desc: 'Khám phá quy luật tự nhiên, cơ học và năng lượng' },
  { id: 'hoa_hoc', name: 'Hóa học', category: 'Khoa học tự nhiên', desc: 'Cấu tạo vật chất, phản ứng hóa học và ứng dụng' },
  { id: 'sinh_hoc', name: 'Sinh học', category: 'Khoa học tự nhiên', desc: 'Thế giới sống, cơ thể người và y sinh học' },
  { id: 'dia_li', name: 'Địa lí', category: 'Khoa học xã hội', desc: 'Địa lí tự nhiên, dân cư và kinh tế xã hội' },
  { id: 'cong_dan', name: 'Công dân', category: 'Khoa học xã hội', desc: 'Giáo dục công dân, kinh tế và pháp luật thực tiễn' },
  { id: 'tieng_nhat', name: 'Tiếng Nhật', category: 'Khoa học xã hội', desc: 'Ngoại ngữ tiếng Nhật' },
  { id: 'tieng_trung', name: 'Tiếng Trung', category: 'Khoa học xã hội', desc: 'Ngoại ngữ tiếng Trung' },
  { id: 'tieng_han', name: 'Tiếng Hàn', category: 'Khoa học xã hội', desc: 'Ngoại ngữ tiếng Hàn' },
  { id: 'tin_hoc', name: 'Tin học', category: 'Công nghệ & Nghệ thuật', desc: 'Lập trình, thuật toán và ứng dụng kỹ thuật số' },
  { id: 'cong_nghe', name: 'Công nghệ', category: 'Công nghệ & Nghệ thuật', desc: 'Kỹ thuật công nghiệp hoặc nông nghiệp công nghệ cao' },
  { id: 'am_nhac', name: 'Âm nhạc', category: 'Công nghệ & Nghệ thuật', desc: 'Thanh nhạc, nhạc cụ và cảm thụ âm nhạc' },
  { id: 'mi_thuat', name: 'Mĩ thuật', category: 'Công nghệ & Nghệ thuật', desc: 'Hội họa, điêu khắc và thiết kế thẩm mỹ' },
];

/**
 * Gọi API trung gian để tải 108 câu hỏi Holland từ sheet BO_108_CAU_HOI
 */
export async function fetchHollandQuestionsFromGoogleAppsScript(customUrl?: string): Promise<{
  questions: HollandQuestionItem[];
  scaleInfo?: any;
  validation?: {
    uniqueQuestionCount: number;
    groupCounts: Record<RiasecKey, number>;
    isValid108: boolean;
  };
}> {
  const rawUrl = customUrl !== undefined ? customUrl : getGoogleAppsScriptUrl();

  if (!rawUrl || !rawUrl.trim()) {
    const error: ApiFetchError = {
      errorType: 'MISSING_URL',
      message: 'Chưa cấu hình URL API Google Apps Script.',
      details: 'Vui lòng cung cấp URL Web App Google Apps Script để tải 108 câu hỏi từ sheet BO_108_CAU_HOI.',
    };
    throw error;
  }

  const endpoint = `/api/holland?url=${encodeURIComponent(rawUrl.trim())}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const json = await res.json().catch(() => null);

    if (!res.ok || !json || json.ok === false) {
      const error: ApiFetchError = {
        errorType: json?.errorType || 'NETWORK_ERROR',
        message: json?.message || `Lỗi máy chủ trung gian (${res.status})`,
        details: json?.details,
        loginUrl: json?.loginUrl,
      };
      throw error;
    }

    if (!Array.isArray(json.data) || json.data.length === 0) {
      const error: ApiFetchError = {
        errorType: 'EMPTY_LIST',
        message: 'Sheet BO_108_CAU_HOI không trả về câu hỏi nào.',
        details: 'Vui lòng kiểm tra lại cấu trúc và dữ liệu câu hỏi trong Google Sheets của bạn.',
      };
      throw error;
    }

    return {
      questions: json.data as HollandQuestionItem[],
      scaleInfo: json.scaleInfo,
      validation: json.validation,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);

    if (err.errorType) {
      throw err;
    }

    if (err.name === 'AbortError') {
      const timeoutError: ApiFetchError = {
        errorType: 'TIMEOUT',
        message: 'Quá thời gian kết nối API câu hỏi Holland (hết 25 giây).',
        details: 'Máy chủ Google Apps Script phản hồi quá lâu hoặc đường truyền bị gián đoạn.',
      };
      throw timeoutError;
    }

    const netError: ApiFetchError = {
      errorType: 'NETWORK_ERROR',
      message: 'Không thể kết nối đến máy chủ trung gian EduGuide AI.',
      details: err.message || 'Vui lòng kiểm tra kết nối mạng.',
    };
    throw netError;
  }
}

export function extractConciseCareerItems(rawNganhNghe: string, maxItems = 6): string[] {
  if (!rawNganhNghe) return [];
  const text = rawNganhNghe.trim();
  if (!text) return [];

  const splitOutsideParens = (input: string, sepChars: string[]): string[] => {
    const parts: string[] = [];
    let current = '';
    let depth = 0;
    for (let i = 0; i < input.length; i++) {
      const ch = input[i];
      if (ch === '(') depth++;
      else if (ch === ')' && depth > 0) depth--;

      if (depth === 0 && sepChars.includes(ch)) {
        if (current.trim()) parts.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    if (current.trim()) parts.push(current.trim());
    return parts;
  };

  // Loại dấu chấm lửng bên trong ngoặc đơn trước khi tách cụm
  const normalizedText = text
    .replace(/\([^)]*[…\.]{2,}[^)]*\)/g, '')
    .replace(/…\s*/g, '; ')
    .replace(/\.\.\.\s*/g, '; ');

  const primaryChunks = splitOutsideParens(normalizedText, [';', '\n']);

  const items: string[] = [];
  const seen = new Set<string>();

  const pushCleanItem = (rawPart: string) => {
    let cleaned = rawPart
      .replace(/^(các\s+(ngành|nghề)(\s+nghề)?(\s+thuộc\s+lĩnh\s+vực|\s+lĩnh\s+vực|\s+về)?)\s+/i, '')
      .replace(/^[•\-–\s]+/, '')
      .replace(/[\.\…]+$/, '')
      .trim();

    if (!cleaned) return;
    cleaned = cleaned.replace(/\s*\([^)]{16,}\)/g, '').trim();
    cleaned = cleaned.replace(/\s*\(\s*\)/g, '').trim();
    cleaned = cleaned.replace(/[\.\…,;]+$/, '').trim();
    if (!cleaned || cleaned.length < 2) return;

    const formatted = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    const key = formatted.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      items.push(formatted);
    }
  };

  primaryChunks.forEach((chunk) => {
    const subParts = splitOutsideParens(chunk, [',']);
    if (primaryChunks.length <= 3 || subParts.length > 1) {
      subParts.forEach(pushCleanItem);
    } else {
      pushCleanItem(chunk);
    }
  });

  return items.slice(0, maxItems);
}

/**
 * Gọi API trung gian để tải dữ liệu tra cứu 6 nhóm R, I, A, S, E, C từ sheet TRA_CUU_NGANH_NGHE (?action=traCuuNganhNghe)
 */
export async function fetchHollandCareerLookupFromGoogleAppsScript(customUrl?: string): Promise<{
  records: Partial<Record<RiasecKey, HollandCareerLookupItem>>;
  list: HollandCareerLookupItem[];
}> {
  const rawUrl = customUrl !== undefined ? customUrl : getGoogleAppsScriptUrl();

  if (!rawUrl || !rawUrl.trim()) {
    const error: ApiFetchError = {
      errorType: 'MISSING_URL',
      message: 'Chưa cấu hình URL API Google Apps Script.',
      details: 'Vui lòng cung cấp URL Web App Google Apps Script để tải bảng TRA_CUU_NGANH_NGHE.',
    };
    throw error;
  }

  const endpoint = `/api/holland-nganh-nghe?url=${encodeURIComponent(rawUrl.trim())}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const json = await res.json().catch(() => null);

    if (!res.ok || !json || json.ok === false || json.success === false) {
      const error: ApiFetchError = {
        errorType: json?.errorType || 'NETWORK_ERROR',
        message: json?.message || `Lỗi máy chủ trung gian (${res.status})`,
        details: json?.details,
        loginUrl: json?.loginUrl,
      };
      throw error;
    }

    const rawList: any[] = Array.isArray(json.data) ? json.data : [];
    const validCodes = new Set<RiasecKey>(['R', 'I', 'A', 'S', 'E', 'C']);
    const list: HollandCareerLookupItem[] = [];
    const records: Partial<Record<RiasecKey, HollandCareerLookupItem>> = {};

    rawList.forEach((raw) => {
      if (!raw || typeof raw !== 'object') return;
      const maStr = String(raw.MaRIASEC || raw.maRIASEC || raw.ma || raw['Mã'] || '')
        .trim()
        .toUpperCase();
      if (!validCodes.has(maStr as RiasecKey)) return;
      const maCode = maStr as RiasecKey;

      const tenTiengAnh = String(raw.TenTiengAnh || raw.tenTiengAnh || '').trim();
      const tenTiengViet = String(raw.TenTiengViet || raw.tenTiengViet || '').trim();
      const tenNhomHolland = String(
        raw.TenNhomHolland || raw.tenNhomHolland || tenTiengViet || ''
      ).trim();
      const moTa = String(
        raw.MoTa || raw.moTa || raw.dacDiemNoiBat || ''
      ).trim();
      const linhVucGoiY = String(
        raw.LinhVucGoiY || raw.linhVucGoiY || ''
      ).trim();
      const nganhNgheGoiY = String(
        raw.NganhNgheGoiY || raw.nganhNgheGoiY || raw.nganhNghePhuHop || linhVucGoiY || ''
      ).trim();

      const nganhNgheList: string[] = extractConciseCareerItems(nganhNgheGoiY, 6);

      const normalized: HollandCareerLookupItem = {
        ma: maCode,
        maRIASEC: maCode,
        tenTiengAnh,
        tenTiengViet: tenTiengViet || tenNhomHolland,
        moTa,
        linhVucGoiY: linhVucGoiY || nganhNgheGoiY,
        tenNhomHolland: tenNhomHolland || tenTiengViet,
        nganhNgheGoiY,
        dacDiemNoiBat: moTa,
        nganhNghePhuHop: nganhNgheGoiY,
        nganhNgheList,
        rawItem: raw.rawItem || raw,
      };

      if (!records[maCode]) {
        records[maCode] = normalized;
        list.push(normalized);
      }
    });

    if (list.length === 0) {
      const error: ApiFetchError = {
        errorType: 'EMPTY_LIST',
        message: 'API ?action=traCuuNganhNghe không trả về bản ghi hợp lệ nào cho 6 nhóm R, I, A, S, E, C.',
        details: 'Vui lòng kiểm tra dữ liệu trong sheet TRA_CUU_NGANH_NGHE trên Google Sheets.',
      };
      throw error;
    }

    return { records, list };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.errorType) {
      throw err;
    }
    if (err.name === 'AbortError') {
      const timeoutError: ApiFetchError = {
        errorType: 'TIMEOUT',
        message: 'Quá thời gian kết nối API TRA_CUU_NGANH_NGHE (hết 25 giây).',
      };
      throw timeoutError;
    }
    const netError: ApiFetchError = {
      errorType: 'NETWORK_ERROR',
      message: 'Không thể kết nối đến máy chủ trung gian khi tải bảng TRA_CUU_NGANH_NGHE.',
      details: err.message,
    };
    throw netError;
  }
}

export interface GroupScoreResult {
  code: RiasecKey;
  name: string;
  vietnameseName: string;
  totalScore: number; // Diem[G] (0..18)
  questionCount: number; // 18
  maxPossibleScore: number; // 18
  rawPercentage: number; // (Diem[G] / 18) * 100
  formattedPercentage: string; // Ví dụ: "83.33%", "55.56%", "33.33%"
  normalizedScore: number; // Tỷ lệ phần trăm làm tròn 2 chữ số thập phân (e.g. 83.33)
  fitLevel: HollandFitLevel; // 'THẤP' (0-6) | 'TRUNG BÌNH' (7-12) | 'CAO' (13-18)
  rank: number; // Vị trí sắp xếp 1..6
  competitionRank: number; // Thứ hạng có xét đồng điểm (1, 1, 3...)
  isTied: boolean; // Có bằng điểm với nhóm khác không
  tiedWith: RiasecKey[];
  color: string;
  barColor: string;
}

export interface HollandCalculationResult {
  scores: Record<RiasecKey, GroupScoreResult>;
  sortedScores: GroupScoreResult[];
  top3: GroupScoreResult[];
  hollandCode: string; // Ví dụ: "S-I-A"
  hollandCodeCompact: string; // Ví dụ: "SIA"
  totalExamScore: number; // Tổng điểm toàn bài (0..108)
  maxExamScore: number; // 108
  answeredCount: number;
  totalQuestions: number;
  isComplete: boolean;
  hasAnyTies: boolean;
  hasTop3TieBreak: boolean;
  tieNotice: string | null;
  validation: {
    uniqueQuestionCount: number;
    groupCounts: Record<RiasecKey, number>;
    isValid108: boolean;
  };
}

/**
 * Phân loại mức độ phù hợp theo điểm nguyên trước khi làm tròn phần trăm:
 * - 0 - 6 điểm: THẤP
 * - 7 - 12 điểm: TRUNG BÌNH
 * - 13 - 18 điểm: CAO
 */
export function classifyHollandFitLevel(score: number): HollandFitLevel {
  if (score >= 13) return 'CAO';
  if (score >= 7) return 'TRUNG BÌNH';
  return 'THẤP';
}

export function formatHollandPercentage(rawPercentage: number): string {
  const rounded2 = Number(rawPercentage.toFixed(2));
  if (Number.isInteger(rounded2)) {
    return `${rounded2}%`;
  }
  return `${rounded2.toFixed(2)}%`;
}

/**
 * Tính điểm chuẩn Holland RIASEC theo bộ 108 câu hỏi (18 câu/nhóm):
 * - Mỗi câu chỉ tính 1 lần theo MaCauHoi/id duy nhất
 * - Tick = 1 điểm, Bỏ tick = 0 điểm (không phụ thuộc thứ tự hay số lần nhấn)
 * - TyLe[G] = (Diem[G] / 18) * 100 (KHÔNG chia cho tổng điểm học sinh)
 * - Phân loại THẤP (0-6), TRUNG BÌNH (7-12), CAO (13-18) trên điểm nguyên trước làm tròn
 * - Sắp xếp giảm dần, đồng điểm ưu tiên theo thứ tự kỹ thuật cố định R-I-A-S-E-C và thông báo rõ
 */
export function calculateHollandResults(
  questions: HollandQuestionItem[],
  answers: Record<string, number>,
  _scaleMax: number = 1
): HollandCalculationResult {
  const groups: RiasecKey[] = [...RIASEC_TIE_BREAK_ORDER];
  const groupQuestionsMap: Record<RiasecKey, HollandQuestionItem[]> = {
    R: [],
    I: [],
    A: [],
    S: [],
    E: [],
    C: [],
  };

  // Loại trùng theo mã câu hỏi duy nhất để đảm bảo không câu nào bị tính 2 lần
  const seenKeys = new Set<string>();
  const uniqueQuestions: HollandQuestionItem[] = [];

  questions.forEach((q) => {
    const key = String(q.maCauHoi || q.id || '').trim().toUpperCase();
    if (!key || seenKeys.has(key)) return;
    seenKeys.add(key);
    uniqueQuestions.push(q);
    if (groupQuestionsMap[q.category]) {
      groupQuestionsMap[q.category].push(q);
    }
  });

  const groupCounts: Record<RiasecKey, number> = {
    R: groupQuestionsMap.R.length,
    I: groupQuestionsMap.I.length,
    A: groupQuestionsMap.A.length,
    S: groupQuestionsMap.S.length,
    E: groupQuestionsMap.E.length,
    C: groupQuestionsMap.C.length,
  };

  const scores: Record<RiasecKey, GroupScoreResult> = {} as any;
  let totalExamScore = 0;

  groups.forEach((key) => {
    const qList = groupQuestionsMap[key];
    const qCount = qList.length;
    const maxScore = qCount > 0 ? qCount : 18;
    let sum = 0;

    qList.forEach((q) => {
      const val = answers[q.id] ?? (q.maCauHoi ? answers[q.maCauHoi] : 0);
      // Nhị phân nghiêm ngặt: chỉ cộng đúng 1 điểm nếu được tick
      if (val === 1) {
        sum += 1;
      }
    });

    totalExamScore += sum;

    // Phân loại dựa trên điểm nguyên trước khi làm tròn
    const fitLevel = classifyHollandFitLevel(sum);
    const rawPercentage = (sum / maxScore) * 100;
    const normalizedScore = Math.min(100, Number(rawPercentage.toFixed(2)));
    const formattedPercentage = formatHollandPercentage(Math.min(100, rawPercentage));

    scores[key] = {
      code: key,
      name: RIASEC_INFO_MAP[key].name,
      vietnameseName: RIASEC_INFO_MAP[key].vietnameseName,
      totalScore: sum,
      questionCount: qCount,
      maxPossibleScore: maxScore,
      rawPercentage,
      formattedPercentage,
      normalizedScore,
      fitLevel,
      rank: 1,
      competitionRank: 1,
      isTied: false,
      tiedWith: [],
      color: RIASEC_INFO_MAP[key].color,
      barColor: RIASEC_INFO_MAP[key].barColor,
    };
  });

  // Sắp xếp giảm dần theo điểm nguyên Diem[G]; bằng điểm dùng thứ tự cố định R-I-A-S-E-C
  const sortedScores = Object.values(scores).sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    return groups.indexOf(a.code) - groups.indexOf(b.code);
  });

  // Đánh dấu đồng điểm & thứ hạng thực tế
  sortedScores.forEach((g, idx) => {
    const peers = sortedScores.filter((other) => other.code !== g.code && other.totalScore === g.totalScore);
    g.tiedWith = peers.map((p) => p.code);
    g.isTied = peers.length > 0;
    g.rank = idx + 1;
    if (idx > 0 && sortedScores[idx - 1].totalScore === g.totalScore) {
      g.competitionRank = sortedScores[idx - 1].competitionRank;
    } else {
      g.competitionRank = idx + 1;
    }
  });

  const top3 = sortedScores.slice(0, 3);
  const hollandCode = top3.map((g) => g.code).join('-');
  const hollandCodeCompact = top3.map((g) => g.code).join('');

  const hasAnyTies = sortedScores.some((g) => g.isTied);
  const hasTop3TieBreak = top3.some((g) => g.isTied);

  let tieNotice: string | null = null;
  if (hasAnyTies) {
    // Gom các cụm đồng điểm
    const byScore = new Map<number, RiasecKey[]>();
    sortedScores.forEach((g) => {
      const list = byScore.get(g.totalScore) || [];
      list.push(g.code);
      byScore.set(g.totalScore, list);
    });
    const tieClusters = Array.from(byScore.entries())
      .filter(([, codes]) => codes.length > 1)
      .map(([score, codes]) => `Nhóm ${codes.join(', ')} cùng đạt ${score}/18 điểm`);

    tieNotice =
      `Phát hiện trạng thái đồng điểm (${tieClusters.join('; ')}). ` +
      'Thứ tự ưu tiên R-I-A-S-E-C chỉ là quy tắc xử lý đồng điểm kỹ thuật để hình thành mã 3 chữ cái, hoàn toàn không phản ánh sự chênh lệch năng lực hay mức độ vượt trội hơn giữa các nhóm bằng điểm nhau.';
  }

  return {
    scores,
    sortedScores,
    top3,
    hollandCode,
    hollandCodeCompact,
    totalExamScore,
    maxExamScore: uniqueQuestions.length > 0 ? uniqueQuestions.length : 108,
    answeredCount: totalExamScore,
    totalQuestions: uniqueQuestions.length,
    isComplete: uniqueQuestions.length > 0 && totalExamScore > 0,
    hasAnyTies,
    hasTop3TieBreak,
    tieNotice,
    validation: {
      uniqueQuestionCount: uniqueQuestions.length,
      groupCounts,
      isValid108:
        uniqueQuestions.length === 108 &&
        groups.every((k) => groupCounts[k] === 18),
    },
  };
}

// Dữ liệu mô tả & ngành nghề phù hợp cho 6 nhóm R, I, A, S, E, C được tải trực tiếp từ API ?action=traCuuNganhNghe (sheet TRA_CUU_NGANH_NGHE).


