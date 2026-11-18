/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface KetQuaTuVanRecord {
  MaPhieu: string;
  ThoiGian: string;
  MaHocSinhAnDanh: string;
  HoTenHocSinh: string;
  KhoiLop: string;
  MaTruongTHPT: string;
  MaTruongDH: string;
  MaNganh: string;
  TinhThanhDH: string;
  HollandTop1: string;
  HollandTop2: string;
  HollandTop3: string;
  ToHopTHPTDeXuat1: string;
  ToHopTHPTDeXuat2: string;
  ToHopTHPTDaChon?: string;
  Top3ToHopDeXuat?: string;
  MonThiTuChon1_DuKien: string;
  MonThiTuChon2_DuKien: string;
  GhiChuCanTuVan: string;
  DongYLuuDuLieu: string; // 'Có' | 'Không'
}

export interface ChiTietTuVanRecord {
  MaPhieu: string;
  MaRIASEC: string;
  Diem: number;
  TyLe: string;
  XepHang: number;
  MaToHopXetTuyen: string;
  MaToHopTHPT: string;
  SoMonTrungKhop: number;
  MonThieu: string;
  DanhGiaPhuHop: string;
  LyDoDeXuat: string;
}

export interface NguyenVongHocSinhRecord {
  MaPhieu: string;
  ThuTuNguyenVong: number;
  MaTruongTuyenSinh: string;
  TenTruongDH: string;
  MaNganh: string;
  TenNganh: string;
  MaToHopXetTuyen: string;
  MaToHopTHPTDeXuat: string;
  DanhGiaPhuHop: string;
}

export interface SaveConsultationPayload {
  maPhieu: string;
  maHocSinhAnDanh: string;
  dongYLuuDuLieu: boolean;
  isUpdate?: boolean;
  upsertByMaPhieu?: boolean;
  ketQuaTuVan: KetQuaTuVanRecord;
  chiTietTuVan: ChiTietTuVanRecord[];
  nguyenVongHocSinh: NguyenVongHocSinhRecord[];
}

export interface SaveConsultationResult {
  ok: boolean;
  saved?: boolean;
  alreadySaved?: boolean;
  errorType?: string;
  message: string;
  details?: string;
  preparedData?: any;
}

/**
 * Tạo mã học sinh và mã phiếu tư vấn duy nhất cho phiên làm việc
 */
export function generateStudentSessionIds() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand4 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const rand5 = Math.random().toString(36).substring(2, 7).toUpperCase();
  return {
    studentId: `HS_${dateStr}_${rand4}`,
    slipId: `PH_${dateStr}_${rand5}`,
  };
}

/**
 * Gửi dữ liệu tư vấn đến API máy chủ để lưu vào 3 sheet
 */
export async function sendConsultationSaveRequest(
  payload: SaveConsultationPayload
): Promise<SaveConsultationResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s timeout cho Google Apps Script

  try {
    const res = await fetch('/api/luu-ket-qua', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        // Đảm bảo gửi đúng cả 4 khóa chính: secret, ketQua, chiTiet, nguyenVong
        ketQua: payload.ketQuaTuVan,
        chiTiet: payload.chiTietTuVan,
        nguyenVong: payload.nguyenVongHocSinh,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseText = await res.text();
    let data: any = null;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = null;
    }

    if (data && typeof data === 'object') {
      return data;
    }

    return {
      ok: false,
      saved: false,
      errorType: 'INVALID_SERVER_RESPONSE',
      message: res.ok
        ? 'Máy chủ trả về phản hồi không đúng định dạng JSON.'
        : `Máy chủ phản hồi lỗi (Mã lỗi HTTP ${res.status}).`,
      details: responseText.slice(0, 300),
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return {
        ok: false,
        saved: false,
        errorType: 'CLIENT_TIMEOUT',
        message: 'Quá thời gian kết nối đến máy chủ khi lưu kết quả tư vấn (hết 35 giây).',
        details: 'Dịch vụ lưu trữ phản hồi chậm.',
      };
    }
    return {
      ok: false,
      saved: false,
      errorType: 'CLIENT_NETWORK_ERROR',
      message: 'Không thể kết nối đến máy chủ khi lưu kết quả tư vấn.',
      details: err?.message || 'Lỗi mạng phía trình duyệt',
    };
  }
}
