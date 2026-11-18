/**
 * Dịch vụ API kết nối dữ liệu Tuyển sinh Đại học từ Google Apps Script
 * - action=tinhThanh: Danh mục Tỉnh/Thành phố
 * - action=truongDH: Danh mục Trường Đại học (lọc theo Tỉnh/Thành)
 * - action=chuongTrinh: Danh mục Ngành / Chương trình đào tạo (lọc theo Trường)
 * - action=toHopXetTuyen: Danh mục Tổ hợp xét tuyển
 */

import { ApiFetchError, getGoogleAppsScriptUrl } from './schoolApiService';

export interface TinhThanhItem {
  maTinh: string;
  tenTinh: string;
  rawItem?: any;
}

export interface TruongDHItem {
  maTruongDH: string;
  tenTruongDH: string;
  tenVietTat?: string;
  maTinh: string;
  tenTinh?: string;
  loaiHinh?: string;
  logo?: string;
  website?: string;
  ghiChuKiemChung?: string;
  rawItem?: any;
}

export interface ChuongTrinhItem {
  maChuongTrinh: string;
  maNganh?: string;
  tenNganh: string;
  tenChuongTrinh?: string;
  maTruongDH: string;
  namTuyenSinh?: string;
  tenTruong?: string;
  soDongXetTuyen?: string;
  trangThaiXacMinh?: string;
  toHopXetTuyen?: string[];
  rawItem?: any;
}

export interface ToHopXetTuyenItem {
  id?: string;
  maToHop: string;
  tenToHop?: string;
  maNganh?: string;
  maChuongTrinh?: string;
  maTruongDH?: string;
  tenNganh?: string;
  mon1?: string;
  mon2?: string;
  mon3?: string;
  mon4?: string;
  dieuKienGhiChu?: string;
  phuongThucXetTuyen?: string;
  urlDeAnTuyenSinh?: string;
  rawItem?: any;
}

export interface ToHopTHPTItem {
  id?: string;
  maToHopTHPT: string;
  maTruongTHPT: string;
  tenTruongTHPT: string;
  namHoc: string;
  monLuaChon1: string;
  monLuaChon2: string;
  monLuaChon3: string;
  monLuaChon4: string;
  monLuaChon: string[];
  chuyenDe1: string;
  chuyenDe2: string;
  chuyenDe3: string;
  chuyenDe: string[];
  nguonXacNhan: string;
  ngayCapNhat: string;
  trangThai: string;
  rawItem?: any;
}

export interface UniversityWish {
  id: string; // Khóa định danh duy nhất trong phiên làm việc
  order: number; // 1, 2, 3
  maTinh: string;
  tenTinh: string;
  maTruongDH: string;
  tenTruongDH: string;
  tenVietTat?: string;
  maChuongTrinh: string;
  maNganh?: string;
  tenNganh: string;
  toHopXetTuyen?: string[]; // Danh sách tổ hợp xét tuyển thực tế từ API
}

export interface UniversityApiResponse<T> {
  ok: boolean;
  source: string;
  action: string;
  count: number;
  data: T[];
  message?: string;
}

/**
 * Gọi API trung gian backend để truy vấn dữ liệu tuyển sinh đại học & tổ hợp môn THPT
 * @param action Hành động: tinhThanh | truongDH | chuongTrinh | toHopXetTuyen | toHopTHPT
 * @param params Các tham số bổ sung (maTinh, maTruong, maNganh, maTruongTHPT, namHoc...)
 * @param customUrl URL Web App Google Apps Script tùy chỉnh
 */
export async function fetchUniversityApi<T = any>(
  action: 'tinhThanh' | 'truongDH' | 'chuongTrinh' | 'toHopXetTuyen' | 'toHopTHPT',
  params: Record<string, string> = {},
  customUrl?: string
): Promise<T[]> {
  const targetGasUrl = customUrl !== undefined ? customUrl : getGoogleAppsScriptUrl();

  if (!targetGasUrl || !targetGasUrl.trim()) {
    const error: ApiFetchError = {
      errorType: 'MISSING_URL',
      message: 'Chưa cấu hình URL API Google Apps Script cho dữ liệu Đại học.',
      details: `Vui lòng nhập đường dẫn Web App Google Apps Script (?action=${action}) để kết nối dữ liệu thật.`,
    };
    throw error;
  }

  const queryParams = new URLSearchParams({
    url: targetGasUrl.trim(),
    action,
    ...params,
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

  try {
    const res = await fetch(`/api/dai-hoc?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const json = await res.json();

    if (!res.ok || !json.ok) {
      const error: ApiFetchError = {
        errorType: json.errorType || 'SCRIPT_ERROR',
        message: json.message || `Lỗi tải dữ liệu ${action} từ Google Apps Script`,
        details: json.details || 'Không thể lấy dữ liệu từ sheet tương ứng.',
        loginUrl: json.loginUrl,
      };
      throw error;
    }

    if (!Array.isArray(json.data)) {
      const error: ApiFetchError = {
        errorType: 'UNSUPPORTED_STRUCTURE',
        message: `Dữ liệu ${action} không đúng định dạng danh sách.`,
        details: 'API cần trả về mảng danh mục tương ứng.',
      };
      throw error;
    }

    return json.data as T[];
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.errorType) {
      throw err;
    }

    if (err.name === 'AbortError') {
      const timeoutError: ApiFetchError = {
        errorType: 'TIMEOUT',
        message: `Quá thời gian kết nối API ${action} (hết 20 giây).`,
        details: 'Máy chủ Google phản hồi quá chậm hoặc đường truyền bị ngắt.',
      };
      throw timeoutError;
    }

    const netError: ApiFetchError = {
      errorType: 'NETWORK_ERROR',
      message: 'Không thể kết nối đến máy chủ trung gian EduGuide AI.',
      details: err.message || 'Vui lòng kiểm tra lại kết nối mạng.',
    };
    throw netError;
  }
}
