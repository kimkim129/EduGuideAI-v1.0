/**
 * Dịch vụ API kết nối dữ liệu trường THPT từ Google Apps Script
 * Endpoint trung gian backend: /api/truong-thpt?url=...
 * Tham số Google Apps Script: ?action=truongTHPT
 * Các trường dữ liệu chuẩn: MaTruongTHPT, TenTruong, DiaChi, AnhTruong, LogoTruong
 */

import schoolCampusImg from '../assets/images/school_campus_danang_1793890829229.jpg';

export interface TruongTHPT {
  MaTruongTHPT: string;
  TenTruong: string;
  DiaChi: string;
  AnhTruong?: string;
  LogoTruong?: string;
}

export type ApiErrorType =
  | 'MISSING_URL'
  | 'INVALID_URL'
  | 'AUTH_REQUIRED'
  | 'TIMEOUT'
  | 'SCRIPT_ERROR'
  | 'HTML_RESPONSE'
  | 'INVALID_JSON'
  | 'UNSUPPORTED_STRUCTURE'
  | 'SHEET_API_NOT_AVAILABLE'
  | 'EMPTY_LIST'
  | 'NETWORK_ERROR'
  | 'CORS_ERROR'
  | 'UNKNOWN';

export interface ApiFetchError {
  errorType: ApiErrorType;
  message: string;
  details?: string;
  loginUrl?: string;
}

// Khóa lưu URL API tùy chỉnh trong trình duyệt nếu người dùng cấu hình
export const GAS_API_URL_STORAGE_KEY = 'eduguide_google_apps_script_url';

// URL Google Apps Script chính thức của hệ thống EduGuide AI
export const DEFAULT_GAS_URL =
  'https://script.google.com/macros/s/AKfycbyZ8xpFIF-N5QULbetT_bi6brJSZwDajXhnMlITPM7_Z4z5mTKnKFZK6oCh2yBOtyP8Aw/exec';

/**
 * Lấy URL Google Apps Script đã cấu hình (từ localStorage hoặc mặc định)
 */
export function getGoogleAppsScriptUrl(): string {
  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem(GAS_API_URL_STORAGE_KEY) : null;
  return storedUrl ? storedUrl.trim() : DEFAULT_GAS_URL;
}

/**
 * Lưu URL Google Apps Script vào bộ nhớ trình duyệt
 */
export function setGoogleAppsScriptUrl(url: string): void {
  if (typeof window !== 'undefined') {
    if (url.trim()) {
      localStorage.setItem(GAS_API_URL_STORAGE_KEY, url.trim());
    } else {
      localStorage.removeItem(GAS_API_URL_STORAGE_KEY);
    }
  }
}

/**
 * Xử lý đường dẫn ảnh Google Drive sang dạng https://drive.google.com/thumbnail?id=FILE_ID&sz=...
 * - Trích xuất FILE_ID từ các dạng liên kết chia sẻ Google Drive (file/d/, open?id=, uc?id=, d/...)
 * - Chuyển sang dạng thumbnail trực tiếp: sz=w1200 cho ảnh trường, sz=w400 cho logo
 * - Nếu URL đã có dạng https://drive.google.com/thumbnail?id=FILE_ID&sz=w1200 (hoặc sz chỉ định), giữ nguyên
 * - Nếu là URL ảnh trực tiếp từ nguồn khác (https://, http://, data:, blob:, /assets/...), giữ nguyên
 * @param url Đường dẫn ảnh gốc
 * @param size Kích thước thumbnail mong muốn ('w1200' cho ảnh trường, 'w400' cho logo)
 */
export function getGoogleDriveImageUrl(url?: string | null, size: string = 'w1200'): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // 1. Nếu không phải là liên kết Google Drive, giữ nguyên URL ảnh trực tiếp
  const isGoogleDrive =
    trimmed.includes('drive.google.com') ||
    trimmed.includes('docs.google.com') ||
    trimmed.includes('googleusercontent.com');

  if (!isGoogleDrive) {
    return trimmed;
  }

  // 2. Nếu đã có dạng thumbnail Google Drive
  const thumbnailMatch = trimmed.match(/drive\.google\.com\/thumbnail\?[^ ]*id=([a-zA-Z0-9_-]+)/i);
  if (thumbnailMatch && thumbnailMatch[1]) {
    const fileId = thumbnailMatch[1];
    // Nếu URL đã đúng dạng và đúng kích thước mong muốn, giữ nguyên
    if (trimmed.includes(`sz=${size}`)) {
      return trimmed;
    }
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=${size}`;
  }

  // 3. Trích xuất FILE_ID từ các định dạng link chia sẻ Drive thông dụng
  let fileId = '';

  // Dạng /file/d/FILE_ID/view... hoặc /preview, /edit
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (fileDMatch && fileDMatch[1]) {
    fileId = fileDMatch[1];
  }

  // Dạng ?id=FILE_ID hoặc &id=FILE_ID (bao gồm cả open?id=, uc?id=)
  if (!fileId) {
    const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
    if (idParamMatch && idParamMatch[1]) {
      fileId = idParamMatch[1];
    }
  }

  // Dạng /d/FILE_ID
  if (!fileId) {
    const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/i);
    if (dMatch && dMatch[1]) {
      fileId = dMatch[1];
    }
  }

  // 4. Trả về link thumbnail chuẩn hóa tải nhanh & không bị chặn
  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=${size}`;
  }

  // Nếu không nhận diện được fileId, giữ nguyên
  return trimmed;
}

/**
 * Gọi API lấy danh sách trường THPT từ Google Apps Script
 * - Tuyệt đối không gọi fetch trực tiếp từ trình duyệt đến script.google.com để tránh lỗi "Failed to fetch" / CORS.
 * - Sử dụng endpoint trung gian backend /api/truong-thpt của hệ thống EduGuide AI.
 * - Nhận diện chính xác nếu API yêu cầu xác thực / đăng nhập Google và báo chi tiết.
 * @param customUrl URL Web App Google Apps Script
 */
export async function fetchTruongTHPTFromGoogleAppsScript(customUrl?: string): Promise<TruongTHPT[]> {
  const rawUrl = customUrl !== undefined ? customUrl : getGoogleAppsScriptUrl();

  if (!rawUrl || !rawUrl.trim()) {
    const error: ApiFetchError = {
      errorType: 'MISSING_URL',
      message: 'Chưa cấu hình URL API Google Apps Script.',
      details: 'Vui lòng dán liên kết Web App (dạng https://script.google.com/macros/s/.../exec) để kết nối dữ liệu thật.',
    };
    throw error;
  }

  // Gọi qua API trung gian backend /api/truong-thpt
  const proxyEndpoint = `/api/truong-thpt?url=${encodeURIComponent(rawUrl.trim())}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 giây

  try {
    const response = await fetch(proxyEndpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const json = await response.json().catch(() => null);

    if (!response.ok || !json || json.ok === false) {
      const error: ApiFetchError = {
        errorType: json?.errorType || 'NETWORK_ERROR',
        message: json?.message || `Lỗi máy chủ trung gian (${response.status}: ${response.statusText})`,
        details: json?.details,
        loginUrl: json?.loginUrl,
      };
      throw error;
    }

    if (!Array.isArray(json.data) || json.data.length === 0) {
      const error: ApiFetchError = {
        errorType: 'EMPTY_LIST',
        message: 'API Google Apps Script không trả về bản ghi trường THPT nào.',
        details: 'Vui lòng kiểm tra dữ liệu trong trang tính Google Sheets của bạn.',
      };
      throw error;
    }

    // Loại bỏ Trường THPT Chuyên Lê Quý Đôn vì có cơ chế tuyển sinh riêng -> chỉ giữ 20 trường còn lại
    const list: TruongTHPT[] = json.data
      .map((item: any, idx: number) => {
        const rawAnh = String(item.AnhTruong || item.anhTruong || item.image || '').trim();
        const rawLogo = String(item.LogoTruong || item.logoTruong || item.logo || '').trim();
        return {
          MaTruongTHPT: String(item.MaTruongTHPT || item.maTruong || item.id || `THPT_${idx + 1}`).trim(),
          TenTruong: String(item.TenTruong || item.tenTruong || item.name || '').trim(),
          DiaChi: String(item.DiaChi || item.diaChi || item.address || '').trim(),
          AnhTruong: rawAnh ? getGoogleDriveImageUrl(rawAnh, 'w1200') : '',
          LogoTruong: rawLogo ? getGoogleDriveImageUrl(rawLogo, 'w400') : '',
        };
      })
      .filter((s: TruongTHPT) => s.TenTruong.length > 0 && !isLeQuyDonSpecialSchool(s));

    return list;
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.errorType) {
      throw error;
    }

    if (error.name === 'AbortError') {
      const timeoutError: ApiFetchError = {
        errorType: 'TIMEOUT',
        message: 'Quá thời gian kết nối API (hết 20 giây).',
        details: 'Máy chủ phản hồi quá lâu hoặc đường truyền bị gián đoạn.',
      };
      throw timeoutError;
    }

    // Trường hợp máy chủ backend đang khởi động lại hoặc không thể kết nối
    const netError: ApiFetchError = {
      errorType: 'NETWORK_ERROR',
      message: 'Không thể kết nối với dịch vụ trung gian EduGuide AI.',
      details: error.message || 'Vui lòng kiểm tra lại kết nối mạng.',
    };
    throw netError;
  }
}

export function isLeQuyDonSpecialSchool(school: { MaTruongTHPT?: string; TenTruong?: string }): boolean {
  const ma = (school.MaTruongTHPT || '').trim().toUpperCase();
  const normTen = (school.TenTruong || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
  return ma === 'LQD' || ma === 'THPT016' || normTen.includes('le quy don');
}

/**
 * Danh sách 20 trường THPT công lập tại TP. Đà Nẵng (không bao gồm Trường THPT Chuyên Lê Quý Đôn do có cơ chế tuyển sinh riêng)
 * Được chuẩn hóa theo đúng cấu trúc MaTruongTHPT, TenTruong, DiaChi, AnhTruong, LogoTruong
 */
export const OFFICIAL_DANANG_THPT_LIST: TruongTHPT[] = [
  {
    MaTruongTHPT: 'PCT',
    TenTruong: 'Trường THPT Phan Châu Trinh',
    DiaChi: '154 Lê Lợi, Phường Hải Châu 1, Quận Hải Châu, TP. Đà Nẵng',
    AnhTruong: schoolCampusImg,
    LogoTruong: '',
  },
  {
    MaTruongTHPT: 'HHT',
    TenTruong: 'Trường THPT Hoàng Hoa Thám',
    DiaChi: '63 Phạm Cự Lượng, Phường An Hải Đông, Quận Sơn Trà, TP. Đà Nẵng',
    AnhTruong: '',
    LogoTruong: '',
  },
  {
    MaTruongTHPT: 'HV',
    TenTruong: 'Trường THPT Hòa Vang',
    DiaChi: '101 Ông Ích Đường, Phường Khuê Trung, Quận Cẩm Lệ, TP. Đà Nẵng',
    AnhTruong: '',
    LogoTruong: '',
  },
  {
    MaTruongTHPT: 'TP',
    TenTruong: 'Trường THPT Trần Phú',
    DiaChi: '11 Lê Thánh Tôn, Phường Hải Châu 1, Quận Hải Châu, TP. Đà Nẵng',
    AnhTruong: '',
    LogoTruong: '',
  },
  {
    MaTruongTHPT: 'TPH',
    TenTruong: 'Trường THPT Thái Phiên',
    DiaChi: '733 Trần Cao Vân, Phường Thanh Khê Đông, Quận Thanh Khê, TP. Đà Nẵng',
    AnhTruong: '',
    LogoTruong: '',
  },
  {
    MaTruongTHPT: 'NK',
    TenTruong: 'Trường THPT Nguyễn Khuyến',
    DiaChi: 'Số 02 Đặng Xuân Bảng, Phường Khuê Trung, Quận Cẩm Lệ, TP. Đà Nẵng',
    AnhTruong: '',
    LogoTruong: '',
  },
  {
    MaTruongTHPT: 'NT',
    TenTruong: 'Trường THPT Nguyễn Trãi',
    DiaChi: '01 Phan Văn Định, Phường Hòa Khánh Bắc, Quận Liên Chiểu, TP. Đà Nẵng',
    AnhTruong: '',
    LogoTruong: '',
  },
  {
    MaTruongTHPT: 'NHS',
    TenTruong: 'Trường THPT Ngũ Hành Sơn',
    DiaChi: '179 Trần Đại Nghĩa, Phường Hòa Hải, Quận Ngũ Hành Sơn, TP. Đà Nẵng',
    AnhTruong: '',
    LogoTruong: '',
  },
  {
    MaTruongTHPT: 'CL',
    TenTruong: 'Trường THPT Cẩm Lệ',
    DiaChi: '01 Nguyễn Thế Lịch, Phường Hòa An, Quận Cẩm Lệ, TP. Đà Nẵng',
    AnhTruong: '',
    LogoTruong: '',
  },
  {
    MaTruongTHPT: 'ST',
    TenTruong: 'Trường THPT Sơn Trà',
    DiaChi: '01 Lê Văn Quý, Phường An Hải Bắc, Quận Sơn Trà, TP. Đà Nẵng',
    AnhTruong: '',
    LogoTruong: '',
  },
  {
    MaTruongTHPT: 'TTT',
    TenTruong: 'Trường THPT Tôn Thất Tùng',
    DiaChi: 'Trần Nhân Tông, Phường An Hải Bắc, Quận Sơn Trà, TP. Đà Nẵng',
    AnhTruong: '',
    LogoTruong: '',
  },
  {
    MaTruongTHPT: 'TK',
    TenTruong: 'Trường THPT Thanh Khê',
    DiaChi: '207 Uyển Trạch 8, Phường An Khê, Quận Thanh Khê, TP. Đà Nẵng',
    AnhTruong: '',
    LogoTruong: '',
  },
  {
    MaTruongTHPT: 'VCC',
    TenTruong: 'Trường THPT Võ Chí Công',
    DiaChi: 'Khu tái định cư Hòa Quý, Quận Ngũ Hành Sơn, TP. Đà Nẵng',
    AnhTruong: '',
    LogoTruong: '',
  },
  {
    MaTruongTHPT: 'LC',
    TenTruong: 'Trường THPT Liên Chiểu',
    DiaChi: 'Đường số 9, KĐT Phước Lý, Phường Hòa Minh, Quận Liên Chiểu, TP. Đà Nẵng',
    AnhTruong: '',
    LogoTruong: '',
  },
  {
    MaTruongTHPT: 'PTT',
    TenTruong: 'Trường THPT Phan Thành Tài',
    DiaChi: 'Quốc lộ 1A, Xã Hòa Phước, Huyện Hòa Vang, TP. Đà Nẵng',
    AnhTruong: '',
    LogoTruong: '',
  },
  {
    MaTruongTHPT: 'OIK',
    TenTruong: 'Trường THPT Ông Ích Khiêm',
    DiaChi: 'Quốc lộ 14B, Xã Hòa Phong, Huyện Hòa Vang, TP. Đà Nẵng',
    AnhTruong: '',
    LogoTruong: '',
  },
  {
    MaTruongTHPT: 'PPT',
    TenTruong: 'Trường THPT Phạm Phú Thứ',
    DiaChi: 'Thôn Phú Sơn 1, Xã Hòa Khương, Huyện Hòa Vang, TP. Đà Nẵng',
    AnhTruong: '',
    LogoTruong: '',
  },
  {
    MaTruongTHPT: 'QT',
    TenTruong: 'Trường THPT Quang Trung',
    DiaChi: '68 Đỗ Thúc Tịnh, Phường Khuê Trung, Quận Cẩm Lệ, TP. Đà Nẵng',
    AnhTruong: '',
    LogoTruong: '',
  },
  {
    MaTruongTHPT: 'HG',
    TenTruong: 'Trường Phổ thông Hermann Gmeiner',
    DiaChi: 'Khu dân cư số 2, Phường Hòa Cường Bắc, Quận Hải Châu, TP. Đà Nẵng',
    AnhTruong: '',
    LogoTruong: '',
  },
  {
    MaTruongTHPT: 'NVT',
    TenTruong: 'Trường THPT Nguyễn Văn Thoại',
    DiaChi: 'Đường Nguyễn Văn Thoại, Phường Hòa Xuân, Quận Cẩm Lệ, TP. Đà Nẵng',
    AnhTruong: '',
    LogoTruong: '',
  },
];

/**
 * Hàm tìm kiếm tiếng Việt có dấu hoặc không dấu
 */
export function matchVietnamese(text: string, query: string): boolean {
  if (!query || !query.trim()) return true;
  if (!text) return false;

  const normalize = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .trim();

  const textNorm = normalize(text);
  const queryNorm = normalize(query);

  return textNorm.includes(queryNorm);
}
