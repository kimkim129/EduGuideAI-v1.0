import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DEFAULT_GAS_URL =
  'https://script.google.com/macros/s/AKfycbyZ8xpFIF-N5QULbetT_bi6brJSZwDajXhnMlITPM7_Z4z5mTKnKFZK6oCh2yBOtyP8Aw/exec';

interface RawTruongTHPT {
  MaTruongTHPT?: string;
  maTruong?: string;
  MATRUONGTHPT?: string;
  id?: string;
  TenTruong?: string;
  tenTruong?: string;
  TENTRUONG?: string;
  name?: string;
  DiaChi?: string;
  diaChi?: string;
  DIACHI?: string;
  address?: string;
  AnhTruong?: string;
  anhTruong?: string;
  ANHTRUONG?: string;
  image?: string;
  LogoTruong?: string;
  logoTruong?: string;
  LOGOTRUONG?: string;
  logo?: string;
}

export interface TruongTHPTResponseItem {
  MaTruongTHPT: string;
  TenTruong: string;
  DiaChi: string;
  AnhTruong: string;
  LogoTruong: string;
}

export function getGoogleDriveImageUrl(url?: string | null, size: string = 'w1200'): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  const isGoogleDrive =
    trimmed.includes('drive.google.com') ||
    trimmed.includes('docs.google.com') ||
    trimmed.includes('googleusercontent.com');

  if (!isGoogleDrive) {
    return trimmed;
  }

  const thumbnailMatch = trimmed.match(/drive\.google\.com\/thumbnail\?[^ ]*id=([a-zA-Z0-9_-]+)/i);
  if (thumbnailMatch && thumbnailMatch[1]) {
    const fileId = thumbnailMatch[1];
    if (trimmed.includes(`sz=${size}`)) {
      return trimmed;
    }
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=${size}`;
  }

  let fileId = '';
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (fileDMatch && fileDMatch[1]) {
    fileId = fileDMatch[1];
  }

  if (!fileId) {
    const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
    if (idParamMatch && idParamMatch[1]) {
      fileId = idParamMatch[1];
    }
  }

  if (!fileId) {
    const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/i);
    if (dMatch && dMatch[1]) {
      fileId = dMatch[1];
    }
  }

  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=${size}`;
  }

  return trimmed;
}

export function createApiApp(): express.Express {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // =========================================================================
  // API Trung gian truy xuất dữ liệu Google Apps Script (action=truongTHPT)
  // Giải quyết triệt để lỗi "Failed to fetch" do CORS và chuyển hướng 302 của Google
  // =========================================================================
  const handleFetchTruongTHPT = async (req: Request, res: Response): Promise<void> => {
    const rawTargetUrl =
      (req.query.url as string) ||
      (req.body && (req.body.url as string)) ||
      DEFAULT_GAS_URL;

    const targetUrl = rawTargetUrl.trim();

    if (!targetUrl) {
      res.status(400).json({
        ok: false,
        errorType: 'MISSING_URL',
        message: 'Chưa cấu hình URL API Google Apps Script.',
        details: 'Vui lòng nhập đường dẫn Web App Google Apps Script (?action=truongTHPT) để kết nối dữ liệu thật.',
      });
      return;
    }

    let parsedEndpoint: URL;
    try {
      parsedEndpoint = new URL(targetUrl);
    } catch {
      res.status(400).json({
        ok: false,
        errorType: 'INVALID_URL',
        message: 'URL Google Apps Script không hợp lệ.',
        details: 'Đường dẫn phải có dạng: https://script.google.com/macros/s/.../exec',
      });
      return;
    }

    // Đảm bảo gắn đúng tham số action=truongTHPT theo yêu cầu kiến trúc
    if (!parsedEndpoint.searchParams.has('action')) {
      parsedEndpoint.searchParams.set('action', 'truongTHPT');
    }

    // Gọi đến Google Apps Script từ server-side bằng Node.js fetch (không bị chặn CORS từ trình duyệt)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
      const upstreamResponse = await fetch(parsedEndpoint.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'EduGuideAI-BackendProxy/1.0',
        },
        redirect: 'follow', // Tự động theo dõi các chuyển hướng 302 của Google Script
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const finalUrl = upstreamResponse.url || '';
      const contentType = upstreamResponse.headers.get('content-type') || '';

      // Kiểm tra nếu Google chuyển hướng tới trang đăng nhập Google Accounts
      // (Xảy ra khi Web App triển khai với quyền "Chỉ mình tôi" hoặc yêu cầu đăng nhập tài khoản Google)
      if (
        finalUrl.includes('accounts.google.com') ||
        finalUrl.includes('ServiceLogin') ||
        finalUrl.includes('signin')
      ) {
        res.status(401).json({
          ok: false,
          errorType: 'AUTH_REQUIRED',
          message: 'API Google Apps Script yêu cầu đăng nhập tài khoản Google.',
          details:
            'Tệp Google Apps Script hiện đang ở chế độ bảo mật riêng tư hoặc yêu cầu quyền truy cập tổ chức. Để ứng dụng kết nối trực tiếp không cần xác thực tài khoản từng người dùng, tác giả script cần cấu hình Web App với tùy chọn: "Who has access" (Ai có quyền truy cập) = "Anyone" (Bất kỳ ai).',
          loginUrl: finalUrl,
        });
        return;
      }

      const responseText = await upstreamResponse.text();

      // Kiểm tra phản hồi dạng HTML
      if (contentType.includes('text/html') || responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
        // Kiểm tra xem HTML có phải là form đăng nhập Google không
        if (
          responseText.includes('accounts.google.com') ||
          responseText.includes('Sign in - Google Accounts') ||
          responseText.includes('Đăng nhập - Tài khoản Google') ||
          responseText.includes('name="service" value="wise"')
        ) {
          res.status(401).json({
            ok: false,
            errorType: 'AUTH_REQUIRED',
            message: 'API Google Apps Script yêu cầu đăng nhập tài khoản Google.',
            details:
              'Web App của bạn hiện yêu cầu đăng nhập để truy cập. Vui lòng mở quyền Web App thành: "Execute as: Me" và "Who has access: Anyone" trong Google Apps Script > Deploy > Manage deployments.',
            loginUrl: finalUrl,
          });
          return;
        }

        // Kiểm tra lỗi kịch bản Google Script trả về
        if (responseText.includes('Script function not found') || responseText.includes('Authorization is required') || responseText.includes('Exception:')) {
          res.status(502).json({
            ok: false,
            errorType: 'SCRIPT_ERROR',
            message: 'Google Apps Script trả về lỗi thực thi kịch bản.',
            details: 'Hàm xử lý doGet() trong script gặp lỗi hoặc chưa được xuất bản chính xác.',
          });
          return;
        }

        res.status(502).json({
          ok: false,
          errorType: 'HTML_RESPONSE',
          message: 'Máy chủ Google Apps Script trả về trang web HTML thay vì định dạng JSON.',
          details: 'Vui lòng kiểm tra lại hàm doGet(e) trong Apps Script để đảm bảo trả về ContentService.createTextOutput(JSON.stringify(...)).setMimeType(ContentService.MimeType.JSON).',
        });
        return;
      }

      // Xử lý dữ liệu JSON
      let jsonData: any;
      try {
        jsonData = JSON.parse(responseText);
      } catch (parseErr) {
        res.status(502).json({
          ok: false,
          errorType: 'INVALID_JSON',
          message: 'Không thể phân tích dữ liệu JSON từ Google Apps Script.',
          details: 'Dữ liệu trả về không phải là JSON hợp lệ.',
        });
        return;
      }

      // Trích xuất danh sách trường từ các định dạng thông dụng của Google Apps Script
      let rawList: RawTruongTHPT[] = [];
      if (Array.isArray(jsonData)) {
        rawList = jsonData;
      } else if (jsonData && Array.isArray(jsonData.data)) {
        rawList = jsonData.data;
      } else if (jsonData && Array.isArray(jsonData.truongTHPT)) {
        rawList = jsonData.truongTHPT;
      } else if (jsonData && Array.isArray(jsonData.result)) {
        rawList = jsonData.result;
      } else if (jsonData && Array.isArray(jsonData.schools)) {
        rawList = jsonData.schools;
      } else {
        res.status(422).json({
          ok: false,
          errorType: 'UNSUPPORTED_STRUCTURE',
          message: 'Cấu trúc dữ liệu API không đúng định dạng danh sách trường THPT.',
          details: 'API cần trả về một mảng chứa danh sách các trường THPT hoặc object { data: [...] }.',
        });
        return;
      }

      // Chuẩn hóa đúng 5 trường dữ liệu bắt buộc: MaTruongTHPT, TenTruong, DiaChi, AnhTruong, LogoTruong
      const formattedList: TruongTHPTResponseItem[] = rawList
        .map((item, idx) => {
          const ma = String(
            item.MaTruongTHPT || item.maTruong || item.MATRUONGTHPT || item.id || `THPT_${idx + 1}`
          ).trim();
          const ten = String(
            item.TenTruong || item.tenTruong || item.TENTRUONG || item.name || ''
          ).trim();
          const diaChi = String(
            item.DiaChi || item.diaChi || item.DIACHI || item.address || ''
          ).trim();
          const anh = String(
            item.AnhTruong || item.anhTruong || item.ANHTRUONG || item.image || ''
          ).trim();
          const logo = String(
            item.LogoTruong || item.logoTruong || item.LOGOTRUONG || item.logo || ''
          ).trim();

          return {
            MaTruongTHPT: ma,
            TenTruong: ten,
            DiaChi: diaChi,
            AnhTruong: anh ? getGoogleDriveImageUrl(anh, 'w1200') : '',
            LogoTruong: logo ? getGoogleDriveImageUrl(logo, 'w400') : '',
          };
        })
        .filter((s) => s.TenTruong.length > 0);

      if (formattedList.length === 0) {
        res.status(404).json({
          ok: false,
          errorType: 'EMPTY_LIST',
          message: 'API Google Apps Script không trả về bản ghi trường THPT nào.',
          details: 'Vui lòng kiểm tra lại dữ liệu trong Google Sheets đã có dữ liệu hay chưa.',
        });
        return;
      }

      // Trả về dữ liệu thật thành công cho frontend
      res.json({
        ok: true,
        source: 'google_apps_script',
        count: formattedList.length,
        data: formattedList,
      });
    } catch (networkErr: any) {
      clearTimeout(timeoutId);
      if (networkErr.name === 'AbortError') {
        res.status(504).json({
          ok: false,
          errorType: 'TIMEOUT',
          message: 'Quá thời gian kết nối đến máy chủ Google Apps Script (hết 15 giây).',
          details: 'Máy chủ Google phản hồi quá chậm hoặc đường link không truy cập được.',
        });
        return;
      }

      res.status(500).json({
        ok: false,
        errorType: 'NETWORK_ERROR',
        message: 'Lỗi mạng khi kết nối đến Google Apps Script từ máy chủ trung gian.',
        details: networkErr.message || 'Không thể thiết lập kết nối mạng.',
      });
    }
  };

  // =========================================================================
  // API Trung gian truy xuất 108 câu hỏi Holland từ sheet BO_108_CAU_HOI
  // Hỗ trợ tự động dò action trên Apps Script: holland | bo108CauHoi | BO_108_CAU_HOI
  // =========================================================================
  const normalizeRiasecCode = (rawVal: unknown): 'R' | 'I' | 'A' | 'S' | 'E' | 'C' | null => {
    const s = String(rawVal || '').trim().toUpperCase();
    if (!s) return null;
    if (s === 'R' || s.startsWith('R ') || s.startsWith('R-') || s.includes('REALISTIC') || s.includes('KỸ THUẬT')) return 'R';
    if (s === 'I' || s.startsWith('I ') || s.startsWith('I-') || s.includes('INVESTIGATIVE') || s.includes('NGHIÊN CỨU')) return 'I';
    if (s === 'A' || s.startsWith('A ') || s.startsWith('A-') || s.includes('ARTISTIC') || s.includes('NGHỆ THUẬT')) return 'A';
    if (s === 'S' || s.startsWith('S ') || s.startsWith('S-') || s.includes('SOCIAL') || s.includes('XÃ HỘI')) return 'S';
    if (s === 'E' || s.startsWith('E ') || s.startsWith('E-') || s.includes('ENTERPRISING') || s.includes('QUẢN LÝ')) return 'E';
    if (s === 'C' || s.startsWith('C ') || s.startsWith('C-') || s.includes('CONVENTIONAL') || s.includes('NGHIỆP VỤ')) return 'C';
    return null;
  };

  const fetchGasJsonForAction = async (
    baseUrl: string,
    actionName: string,
    timeoutMs: number = 20000
  ): Promise<{
    ok: boolean;
    authRequired?: boolean;
    loginUrl?: string;
    htmlResponse?: boolean;
    invalidJson?: boolean;
    jsonData?: any;
    upstreamError?: string;
  }> => {
    const parsedEndpoint = new URL(baseUrl);
    parsedEndpoint.searchParams.set('action', actionName);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const upstreamResponse = await fetch(parsedEndpoint.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'EduGuideAI-BackendProxy/1.0',
        },
        redirect: 'follow',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const finalUrl = upstreamResponse.url || '';
      const contentType = upstreamResponse.headers.get('content-type') || '';

      if (
        finalUrl.includes('accounts.google.com') ||
        finalUrl.includes('ServiceLogin') ||
        finalUrl.includes('signin')
      ) {
        return { ok: false, authRequired: true, loginUrl: finalUrl };
      }

      const responseText = await upstreamResponse.text();

      if (
        contentType.includes('text/html') ||
        responseText.trim().startsWith('<!DOCTYPE') ||
        responseText.trim().startsWith('<html')
      ) {
        if (
          responseText.includes('accounts.google.com') ||
          responseText.includes('Sign in - Google Accounts') ||
          responseText.includes('Đăng nhập - Tài khoản Google')
        ) {
          return { ok: false, authRequired: true, loginUrl: finalUrl };
        }
        return { ok: false, htmlResponse: true };
      }

      let jsonData: any;
      try {
        jsonData = JSON.parse(responseText);
      } catch {
        return { ok: false, invalidJson: true };
      }

      if (jsonData && !Array.isArray(jsonData) && jsonData.success === false) {
        return {
          ok: false,
          jsonData,
          upstreamError: String(jsonData.error || jsonData.message || 'Lỗi từ Apps Script'),
        };
      }

      return { ok: true, jsonData };
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  };

  const handleFetchHolland = async (req: Request, res: Response): Promise<void> => {
    const rawTargetUrl =
      (req.query.url as string) ||
      (req.body && (req.body.url as string)) ||
      DEFAULT_GAS_URL;

    const targetUrl = rawTargetUrl.trim();

    if (!targetUrl) {
      res.status(400).json({
        ok: false,
        errorType: 'MISSING_URL',
        message: 'Chưa cấu hình URL API Google Apps Script.',
        details: 'Vui lòng cung cấp URL Web App Google Apps Script để tải 108 câu hỏi Holland từ sheet BO_108_CAU_HOI.',
      });
      return;
    }

    try {
      new URL(targetUrl);
    } catch {
      res.status(400).json({
        ok: false,
        errorType: 'INVALID_URL',
        message: 'URL Google Apps Script không hợp lệ.',
        details: 'Đường dẫn phải có dạng: https://script.google.com/macros/s/.../exec',
      });
      return;
    }

    try {
      let matchedResult: { action: string; jsonData: any } | null = null;
      const upstreamErrors: string[] = [];

      // Gọi trực tiếp ?action=holland trước; chỉ thử tên thay thế nếu chưa hỗ trợ
      const primaryProbe = await fetchGasJsonForAction(targetUrl, 'holland', 15000);
      if (primaryProbe.authRequired) {
        res.status(401).json({
          ok: false,
          errorType: 'AUTH_REQUIRED',
          message: 'API Google Apps Script yêu cầu đăng nhập tài khoản Google.',
          details:
            'Tệp Google Apps Script hiện đang ở chế độ riêng tư. Vui lòng mở quyền Web App: "Who has access" = "Anyone" trong Google Apps Script > Deploy > Manage deployments.',
          loginUrl: primaryProbe.loginUrl,
        });
        return;
      }

      if (primaryProbe.ok && primaryProbe.jsonData) {
        matchedResult = { action: 'holland', jsonData: primaryProbe.jsonData };
      } else {
        if (primaryProbe.upstreamError) upstreamErrors.push(`holland: ${primaryProbe.upstreamError}`);
        const fallbackProbe = await fetchGasJsonForAction(targetUrl, 'bo108CauHoi', 15000);
        if (fallbackProbe.ok && fallbackProbe.jsonData) {
          matchedResult = { action: 'bo108CauHoi', jsonData: fallbackProbe.jsonData };
        } else if (fallbackProbe.upstreamError) {
          upstreamErrors.push(`bo108CauHoi: ${fallbackProbe.upstreamError}`);
        }
      }

      if (!matchedResult) {
        res.status(422).json({
          ok: false,
          errorType: 'SHEET_API_NOT_AVAILABLE',
          missingSheets: ['BO_108_CAU_HOI'],
          requiredActions: ['?action=holland (đọc sheet BO_108_CAU_HOI)', '?action=bo108CauHoi'],
          message: 'Google Apps Script chưa đọc được dữ liệu từ sheet BO_108_CAU_HOI.',
          details:
            `Máy chủ Apps Script phản hồi lỗi khi truy xuất bộ câu hỏi (${upstreamErrors.join(' | ')}). ` +
            'Vui lòng kiểm tra hàm doGet(e) trong Google Apps Script cho action="holland".',
        });
        return;
      }

      const { action: usedAction, jsonData } = matchedResult;

      let rawQuestions: any[] = [];
      if (Array.isArray(jsonData)) {
        rawQuestions = jsonData;
      } else if (jsonData && Array.isArray(jsonData.data)) {
        rawQuestions = jsonData.data;
      } else if (jsonData && Array.isArray(jsonData.BO_108_CAU_HOI)) {
        rawQuestions = jsonData.BO_108_CAU_HOI;
      } else if (jsonData && Array.isArray(jsonData.cauHoi)) {
        rawQuestions = jsonData.cauHoi;
      } else if (jsonData && Array.isArray(jsonData.HOLLAND_CAU_HOI)) {
        rawQuestions = jsonData.HOLLAND_CAU_HOI;
      } else if (jsonData && Array.isArray(jsonData.holland)) {
        rawQuestions = jsonData.holland;
      } else if (jsonData && Array.isArray(jsonData.questions)) {
        rawQuestions = jsonData.questions;
      } else if (jsonData && Array.isArray(jsonData.result)) {
        rawQuestions = jsonData.result;
      } else {
        res.status(422).json({
          ok: false,
          errorType: 'UNSUPPORTED_STRUCTURE',
          message: 'Cấu trúc dữ liệu API không đúng định dạng danh sách câu hỏi Holland.',
          details: 'API cần trả về mảng 108 câu hỏi hoặc object { data: [...] } từ sheet BO_108_CAU_HOI.',
        });
        return;
      }

      const categoryNames: Record<'R' | 'I' | 'A' | 'S' | 'E' | 'C', string> = {
        R: 'Realistic (Kỹ thuật / Thực tế)',
        I: 'Investigative (Nghiên cứu / Khám phá)',
        A: 'Artistic (Nghệ thuật / Sáng tạo)',
        S: 'Social (Xã hội / Giúp đỡ)',
        E: 'Enterprising (Quản lý / Kinh doanh)',
        C: 'Conventional (Nghiệp vụ / Quy trình)',
      };

      const seenQuestionIds = new Set<string>();
      const formattedQuestions: any[] = [];

      rawQuestions.forEach((item, idx) => {
        const maCauHoi = String(
          item.MaCauHoi || item.maCauHoi || item.MACAUHOI || item.ID || item.id || ''
        ).trim();
        const sttRaw = Number(item.STT || item.stt);
        const stt = Number.isFinite(sttRaw) && sttRaw > 0 ? sttRaw : idx + 1;
        const uniqueId = maCauHoi || `q_${stt}`;

        // Đảm bảo mỗi câu hỏi chỉ xuất hiện và tính điểm 1 lần theo MaCauHoi
        if (seenQuestionIds.has(uniqueId.toUpperCase())) {
          return;
        }

        const content = String(
          item.NoiDungCauHoi ||
            item.noiDungCauHoi ||
            item.NOIDUNGCAUHOI ||
            item.NoiDung ||
            item.noiDung ||
            item.CauHoi ||
            item.cauHoi ||
            item.content ||
            item.question ||
            item.TenCauHoi ||
            ''
        ).trim();

        if (!content) return;

        const category =
          normalizeRiasecCode(
            item.MaRIASEC ||
              item.maRIASEC ||
              item.MARIASec ||
              item.MaNhom ||
              item.maNhom ||
              item.Nhom ||
              item.nhom ||
              item.NhomHolland ||
              item.RIASEC ||
              item.group ||
              item.category
          ) ||
          (['R', 'I', 'A', 'S', 'E', 'C'][Math.floor(idx / 18) % 6] as 'R' | 'I' | 'A' | 'S' | 'E' | 'C');

        const tenNhomHolland = String(
          item.TenNhomHolland || item.tenNhomHolland || item.TENNHOMHOLLAND || ''
        ).trim();
        const phanLoai = String(
          item.PhanLoai || item.phanLoai || item.PHANLOAI || item.Loai || ''
        ).trim();
        const nguon = String(item.Nguon || item.nguon || item.NGUON || '').trim();

        // Quy tắc chấm điểm nhị phân: Tick = 1 điểm, Bỏ tick = 0 điểm
        const diemNeuChon = 1;

        seenQuestionIds.add(uniqueId.toUpperCase());

        formattedQuestions.push({
          id: uniqueId,
          maCauHoi: uniqueId,
          stt,
          content,
          category,
          categoryName: tenNhomHolland || categoryNames[category],
          tenNhomHolland: tenNhomHolland || categoryNames[category],
          phanLoai,
          diemNeuChon,
          nguon,
          thangDiem: item.ThangDiem || item.thangDiem || '0-1',
          rawItem: item,
        });
      });

      if (formattedQuestions.length === 0) {
        res.status(404).json({
          ok: false,
          errorType: 'EMPTY_LIST',
          message: 'Không tìm thấy câu hỏi nào trong sheet BO_108_CAU_HOI.',
          details: 'Vui lòng kiểm tra lại dữ liệu trong sheet BO_108_CAU_HOI của Google Sheets.',
        });
        return;
      }

      const groupCounts: Record<'R' | 'I' | 'A' | 'S' | 'E' | 'C', number> = {
        R: 0,
        I: 0,
        A: 0,
        S: 0,
        E: 0,
        C: 0,
      };
      formattedQuestions.forEach((q) => {
        if (groupCounts[q.category as 'R' | 'I' | 'A' | 'S' | 'E' | 'C'] !== undefined) {
          groupCounts[q.category as 'R' | 'I' | 'A' | 'S' | 'E' | 'C']++;
        }
      });

      const isValid108 =
        formattedQuestions.length === 108 &&
        (['R', 'I', 'A', 'S', 'E', 'C'] as const).every((k) => groupCounts[k] === 18);

      res.json({
        ok: true,
        source: 'google_apps_script',
        sheet: 'BO_108_CAU_HOI',
        action: usedAction,
        count: formattedQuestions.length,
        validation: {
          uniqueQuestionCount: formattedQuestions.length,
          groupCounts,
          isValid108,
        },
        scaleInfo: '0-1',
        data: formattedQuestions,
      });
    } catch (networkErr: any) {
      if (networkErr.name === 'AbortError') {
        res.status(504).json({
          ok: false,
          errorType: 'TIMEOUT',
          message: 'Quá thời gian kết nối đến máy chủ Google Apps Script (hết 20 giây).',
          details: 'Máy chủ Google phản hồi quá chậm khi tải 108 câu hỏi từ BO_108_CAU_HOI.',
        });
        return;
      }

      res.status(500).json({
        ok: false,
        errorType: 'NETWORK_ERROR',
        message: 'Lỗi mạng khi kết nối đến Google Apps Script từ máy chủ trung gian.',
        details: networkErr.message || 'Không thể thiết lập kết nối mạng.',
      });
    }
  };

  // =========================================================================
  // API Trung gian truy xuất bảng TRA_CUU_NGANH_NGHE (?action=traCuuNganhNghe)
  // Ánh xạ chính xác các trường: MaRIASEC, TenTiengAnh, TenTiengViet, MoTa, LinhVucGoiY, TenNhomHolland, NganhNgheGoiY
  // =========================================================================
  const parseTraCuuNganhNgheRows = (jsonData: any): Array<{
    ma: 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
    MaRIASEC: 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
    TenTiengAnh: string;
    TenTiengViet: string;
    MoTa: string;
    LinhVucGoiY: string;
    TenNhomHolland: string;
    NganhNgheGoiY: string;
    tenNhomHolland: string;
    dacDiemNoiBat: string;
    nganhNghePhuHop: string;
    nganhNgheList: string[];
    rawItem: any;
  }> => {
    let rawRows: any[] = [];
    if (Array.isArray(jsonData)) {
      rawRows = jsonData;
    } else if (jsonData && Array.isArray(jsonData.data)) {
      rawRows = jsonData.data;
    } else if (jsonData && Array.isArray(jsonData.TRA_CUU_NGANH_NGHE)) {
      rawRows = jsonData.TRA_CUU_NGANH_NGHE;
    } else if (jsonData && Array.isArray(jsonData.traCuuNganhNghe)) {
      rawRows = jsonData.traCuuNganhNghe;
    } else if (jsonData && Array.isArray(jsonData.result)) {
      rawRows = jsonData.result;
    }

    if (rawRows.length === 0) return [];

    const normText = (v: unknown) =>
      String(v || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .replace(/\s+/g, '')
        .trim();

    const splitCareerClauses = (raw: string): string[] => {
      if (!raw) return [];
      const text = raw.trim();
      if (!text) return [];
      // Tách theo dấu chấm phẩy hoặc xuống dòng để giữ nguyên vẹn cụm ngành + ví dụ trong ngoặc
      if (text.includes(';') || text.includes('\n')) {
        return text
          .split(/[\n;]+/)
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return [text];
    };

    const validCodes = new Set<'R' | 'I' | 'A' | 'S' | 'E' | 'C'>(['R', 'I', 'A', 'S', 'E', 'C']);
    const resultMap = new Map<'R' | 'I' | 'A' | 'S' | 'E' | 'C', any>();

    rawRows.forEach((item) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) return;

      const rawMa =
        item.MaRIASEC ||
        item.maRIASEC ||
        item['Mã'] ||
        item.Ma ||
        item.ma ||
        '';
      const cleanMaStr = String(rawMa).trim().toUpperCase();
      const maCode = validCodes.has(cleanMaStr as any)
        ? (cleanMaStr as 'R' | 'I' | 'A' | 'S' | 'E' | 'C')
        : null;

      if (!maCode || resultMap.has(maCode)) return;

      let tenTiengAnh = String(item.TenTiengAnh || item.tenTiengAnh || '').trim();
      let tenTiengViet = String(item.TenTiengViet || item.tenTiengViet || '').trim();
      let moTa = String(item.MoTa || item.moTa || item['Đặc điểm & Năng lực nổi bật'] || '').trim();
      let linhVucGoiY = String(item.LinhVucGoiY || item.linhVucGoiY || '').trim();
      let tenNhomHolland = String(
        item.TenNhomHolland || item.tenNhomHolland || item['Tên nhóm Holland'] || tenTiengViet || ''
      ).trim();
      let nganhNgheGoiY = String(
        item.NganhNgheGoiY ||
          item.nganhNgheGoiY ||
          item['Ngành nghề phù hợp (Theo tài liệu IUQ)'] ||
          linhVucGoiY ||
          ''
      ).trim();

      // Hỗ trợ dự phòng nếu key có khoảng trắng hoặc viết khác
      if (!tenTiengAnh || !moTa || !nganhNgheGoiY) {
        for (const [k, v] of Object.entries(item)) {
          const nk = normText(k);
          const val = String(v || '').trim();
          if (!val) continue;
          if (!tenTiengAnh && nk === 'tentienganh') tenTiengAnh = val;
          else if (!tenTiengViet && nk === 'tentiengviet') tenTiengViet = val;
          else if (!moTa && (nk === 'mota' || nk.includes('dacdiem'))) moTa = val;
          else if (!linhVucGoiY && nk === 'linhvucgoiy') linhVucGoiY = val;
          else if (!tenNhomHolland && nk.includes('tennhom')) tenNhomHolland = val;
          else if (!nganhNgheGoiY && (nk === 'nganhnghegoiy' || nk.includes('nganhnghe'))) nganhNgheGoiY = val;
        }
      }

      const finalNganhNghe = nganhNgheGoiY || linhVucGoiY;
      const finalTenNhom = tenNhomHolland || tenTiengViet;

      resultMap.set(maCode, {
        ma: maCode,
        MaRIASEC: maCode,
        TenTiengAnh: tenTiengAnh,
        TenTiengViet: tenTiengViet || finalTenNhom,
        MoTa: moTa,
        LinhVucGoiY: linhVucGoiY || finalNganhNghe,
        TenNhomHolland: finalTenNhom,
        NganhNgheGoiY: finalNganhNghe,
        // Các trường tương thích ngược
        tenNhomHolland: finalTenNhom,
        dacDiemNoiBat: moTa,
        nganhNghePhuHop: finalNganhNghe,
        nganhNgheList: splitCareerClauses(finalNganhNghe),
        rawItem: item,
      });
    });

    return Array.from(resultMap.values());
  };

  const handleFetchHollandCareers = async (req: Request, res: Response): Promise<void> => {
    const rawTargetUrl =
      (req.query.url as string) ||
      (req.body && (req.body.url as string)) ||
      DEFAULT_GAS_URL;

    const targetUrl = rawTargetUrl.trim();

    if (!targetUrl) {
      res.status(400).json({
        ok: false,
        errorType: 'MISSING_URL',
        message: 'Chưa cấu hình URL API Google Apps Script.',
        details: 'Vui lòng cung cấp URL Web App Google Apps Script để tải dữ liệu từ sheet TRA_CUU_NGANH_NGHE.',
      });
      return;
    }

    try {
      new URL(targetUrl);
    } catch {
      res.status(400).json({
        ok: false,
        errorType: 'INVALID_URL',
        message: 'URL Google Apps Script không hợp lệ.',
      });
      return;
    }

    try {
      const probe = await fetchGasJsonForAction(targetUrl, 'traCuuNganhNghe', 15000);
      if (probe.authRequired) {
        res.status(401).json({
          ok: false,
          errorType: 'AUTH_REQUIRED',
          message: 'API Google Apps Script yêu cầu đăng nhập tài khoản Google.',
          loginUrl: probe.loginUrl,
        });
        return;
      }

      if (!probe.ok || !probe.jsonData) {
        res.status(502).json({
          ok: false,
          errorType: 'SHEET_API_NOT_AVAILABLE',
          missingSheets: ['TRA_CUU_NGANH_NGHE'],
          requiredActions: ['?action=traCuuNganhNghe'],
          message: 'Không thể tải dữ liệu ngành nghề Holland từ API (?action=traCuuNganhNghe).',
          details: probe.upstreamError || 'Google Apps Script chưa trả về JSON hợp lệ cho action=traCuuNganhNghe.',
        });
        return;
      }

      const parsedRows = parseTraCuuNganhNgheRows(probe.jsonData);
      if (parsedRows.length === 0) {
        res.status(422).json({
          ok: false,
          errorType: 'UNSUPPORTED_STRUCTURE',
          message: 'API ?action=traCuuNganhNghe không trả về bản ghi hợp lệ cho các nhóm R, I, A, S, E, C.',
          details: 'Mỗi bản ghi cần có MaRIASEC, TenTiengAnh, TenTiengViet, MoTa, LinhVucGoiY, TenNhomHolland, NganhNgheGoiY.',
        });
        return;
      }

      res.json({
        ok: true,
        success: true,
        source: 'google_apps_script',
        sheet: 'TRA_CUU_NGANH_NGHE',
        action: 'traCuuNganhNghe',
        total: parsedRows.length,
        count: parsedRows.length,
        data: parsedRows,
      });
    } catch (networkErr: any) {
      if (networkErr.name === 'AbortError') {
        res.status(504).json({
          ok: false,
          errorType: 'TIMEOUT',
          message: 'Quá thời gian kết nối đến Google Apps Script khi tải bảng TRA_CUU_NGANH_NGHE.',
        });
        return;
      }
      res.status(500).json({
        ok: false,
        errorType: 'NETWORK_ERROR',
        message: 'Lỗi mạng khi kết nối đến Google Apps Script.',
        details: networkErr.message || 'Không thể thiết lập kết nối mạng.',
      });
    }
  };

  // =========================================================================
  // API Trung gian truy xuất dữ liệu Tuyển sinh Đại học từ Google Apps Script
  // Các action: tinhThanh | truongDH | chuongTrinh | toHopXetTuyen
  // =========================================================================
  const handleFetchDaiHoc = async (req: Request, res: Response): Promise<void> => {
    const rawTargetUrl =
      (req.query.url as string) ||
      (req.body && (req.body.url as string)) ||
      DEFAULT_GAS_URL;

    const targetUrl = rawTargetUrl.trim();
    const action = String(req.query.action || (req.body && req.body.action) || 'tinhThanh').trim();

    if (!targetUrl) {
      res.status(400).json({
        ok: false,
        errorType: 'MISSING_URL',
        message: 'Chưa cấu hình URL API Google Apps Script cho dữ liệu Đại học.',
        details: `Vui lòng nhập đường dẫn Web App Google Apps Script (?action=${action}) để kết nối dữ liệu thật.`,
      });
      return;
    }

    let parsedEndpoint: URL;
    try {
      parsedEndpoint = new URL(targetUrl);
    } catch {
      res.status(400).json({
        ok: false,
        errorType: 'INVALID_URL',
        message: 'URL Google Apps Script không hợp lệ.',
        details: 'Đường dẫn phải có dạng: https://script.google.com/macros/s/.../exec',
      });
      return;
    }

    parsedEndpoint.searchParams.set('action', action);

    // Chuyển tiếp các tham số lọc nếu có (maTinh, maTruong, maNganh, maChuongTrinh, maTruongTHPT, namHoc)
    ['maTinh', 'maTruong', 'maNganh', 'maChuongTrinh', 'tinhThanh', 'maTruongTHPT', 'namHoc'].forEach((paramKey) => {
      const val = req.query[paramKey] || (req.body && req.body[paramKey]);
      if (val) {
        parsedEndpoint.searchParams.set(paramKey, String(val).trim());
      }
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

    try {
      const upstreamResponse = await fetch(parsedEndpoint.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'EduGuideAI-BackendProxy/1.0',
        },
        redirect: 'follow',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const finalUrl = upstreamResponse.url || '';
      const contentType = upstreamResponse.headers.get('content-type') || '';

      if (
        finalUrl.includes('accounts.google.com') ||
        finalUrl.includes('ServiceLogin') ||
        finalUrl.includes('signin')
      ) {
        res.status(401).json({
          ok: false,
          errorType: 'AUTH_REQUIRED',
          message: 'API Google Apps Script yêu cầu đăng nhập tài khoản Google.',
          details: 'Web App hiện yêu cầu quyền truy cập "Anyone" để người dùng không cần đăng nhập.',
          loginUrl: finalUrl,
        });
        return;
      }

      const responseText = await upstreamResponse.text();

      if (contentType.includes('text/html') || responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
        res.status(502).json({
          ok: false,
          errorType: 'HTML_RESPONSE',
          message: `Google Apps Script trả về HTML thay vì dữ liệu JSON cho action=${action}.`,
          details: `Vui lòng kiểm tra lại hàm xử lý e.parameter.action == "${action}" trong Apps Script.`,
        });
        return;
      }

      let jsonData: any;
      try {
        jsonData = JSON.parse(responseText);
      } catch {
        res.status(502).json({
          ok: false,
          errorType: 'INVALID_JSON',
          message: `Không thể phân tích dữ liệu JSON cho action=${action} từ Google Apps Script.`,
          details: 'Dữ liệu trả về không phải là JSON hợp lệ.',
        });
        return;
      }

      let rawItems: any[] = [];
      if (Array.isArray(jsonData)) {
        rawItems = jsonData;
      } else if (jsonData && Array.isArray(jsonData.data)) {
        rawItems = jsonData.data;
      } else if (jsonData && Array.isArray(jsonData[action])) {
        rawItems = jsonData[action];
      } else if (jsonData && Array.isArray(jsonData.result)) {
        rawItems = jsonData.result;
      } else if (jsonData && Array.isArray(jsonData.items)) {
        rawItems = jsonData.items;
      } else {
        res.status(422).json({
          ok: false,
          errorType: 'UNSUPPORTED_STRUCTURE',
          message: `Cấu trúc dữ liệu API không đúng định dạng danh sách cho action=${action}.`,
          details: `API cần trả về một mảng danh sách cho action=${action} hoặc object { data: [...] }.`,
        });
        return;
      }

      const parseCombos = (val: any): string[] => {
        if (!val) return [];
        if (Array.isArray(val)) return val.map((x) => String(x).trim()).filter(Boolean);
        if (typeof val === 'string') {
          return val.split(/[,;|]+/).map((s) => s.trim()).filter(Boolean);
        }
        return [];
      };

      // Chuẩn hóa dữ liệu theo từng action cụ thể
      let formattedData: any[] = [];
      if (action === 'tinhThanh') {
        formattedData = rawItems.map((item, idx) => {
          if (typeof item === 'string') {
            return { maTinh: `TINH_${idx + 1}`, tenTinh: item.trim(), rawItem: item };
          }
          const ma = String(
            item.MaTinh || item.MaTinhThanh || item.MATINH || item.MATINHTHANH || item.id || item.code || `TINH_${idx + 1}`
          ).trim();
          const ten = String(
            item.TenTinh || item.TenTinhThanh || item.TENTINH || item.TENTINHTHANH || item.TinhThanh || item.name || item.ten || ma
          ).trim();
          const khuVuc = String(item.KhuVuc || item.khuVuc || '').trim();
          return { maTinh: ma, tenTinh: ten, khuVuc, rawItem: item };
        }).filter((t) => t.tenTinh.length > 0);
      } else if (action === 'truongDH') {
        formattedData = rawItems.map((item, idx) => {
          const ma = String(
            item.MaTruongTuyenSinh ||
            item.MATRUONGTUYENSINH ||
            item.MaTruongDH ||
            item.MaTruong ||
            item.MATRUONGDH ||
            item.MATRUONG ||
            item.MaCSGD ||
            item.MACSGD ||
            item.id ||
            item.code ||
            `TRUONG_${idx + 1}`
          ).trim();
          const ten = String(
            item.TenTruong ||
            item.TenTruongDH ||
            item.TENTRUONG ||
            item.TENTRUONGDH ||
            item.name ||
            ''
          ).trim();
          const tenVietTat = String(
            item.TenVietTat || item.TenNgan || item.shortName || item.TENVIETTAT || ''
          ).trim();
          const maTinh = String(
            item.MaTinh || item.MaTinhThanh || item.MATINH || item.city || ''
          ).trim();
          const tenTinh = String(
            item.TinhThanh || item.TenTinh || item.TenTinhThanh || item.TENTINH || item.cityName || ''
          ).trim();
          const logo = String(item.Logo || item.LogoTruong || item.logo || '').trim();
          const website = String(item.Website || item.website || '').trim();
          const loaiHinh = String(item.LoaiHinh || item.loaiHinh || '').trim();
          const ghiChu = String(item.GhiChuKiemChung || item.ghiChu || '').trim();

          return {
            maTruongDH: ma,
            tenTruongDH: ten,
            tenVietTat: tenVietTat || ten,
            maTinh,
            tenTinh,
            loaiHinh,
            logo: logo ? getGoogleDriveImageUrl(logo, 'w400') : '',
            website,
            ghiChuKiemChung: ghiChu,
            rawItem: item,
          };
        }).filter((u) => u.tenTruongDH.length > 0);
      } else if (action === 'chuongTrinh') {
        const rawMapped = rawItems.map((item, idx) => {
          const maCT = String(
            item.MaCTDT ||
            item.MACTDT ||
            item.MaChuongTrinh ||
            item.MACHUONGTRINH ||
            item.MaNganh ||
            item.MANGANH ||
            item.id ||
            item.code ||
            `CT_${idx + 1}`
          ).trim();
          const maTruongDH = String(
            item.MaTruongTuyenSinh ||
            item.MATRUONGTUYENSINH ||
            item.MaTruongDH ||
            item.MATRUONGDH ||
            item.MaTruong ||
            item.MATRUONG ||
            item.MaCSGD ||
            item.MACSGD ||
            item.TruongDH ||
            item.Truong ||
            item.TRUONG ||
            item.TenTruong ||
            item.TENTRUONG ||
            ''
          ).trim();
          const maNganh = String(
            item.MaNganh ||
            item.MANGANH ||
            item.maNganh ||
            item.MaNganhDaoTao ||
            item.MANGANHDAOTAO ||
            item.MaChuyenNganh ||
            item.code ||
            ''
          ).trim();
          const tenNganh = String(
            item.TenNganh ||
            item.TENNGANH ||
            item.TenChuongTrinh ||
            item.TENCHUONGTRINH ||
            item.Nganh ||
            item.NGANH ||
            item.NganhDaoTao ||
            item.NGANHDAOTAO ||
            item.TenNganhDaoTao ||
            item.TENNGANHDAOTAO ||
            item.ChuyenNganh ||
            item.name ||
            ''
          ).trim();
          const tenCT = String(
            item.TenChuongTrinh ||
            item.TENCHUONGTRINH ||
            item.TenNganh ||
            item.Nganh ||
            ''
          ).trim();
          const namTuyenSinh = String(item.NamTuyenSinh || item.namTuyenSinh || '').trim();
          const tenTruong = String(item.TenTruong || item.TENTRUONG || item.tenTruong || item.Truong || '').trim();
          const soDongXetTuyen = String(item.SoDongXetTuyen || '').trim();
          const trangThaiXacMinh = String(item.TrangThaiXacMinh || '').trim();
          const toHop = parseCombos(
            item.ToHopXetTuyen ||
            item.toHop ||
            item.TOHOPXETTUYEN ||
            item.ToHop ||
            item.TOHOP ||
            item.combos
          );

          return {
            maChuongTrinh: maCT,
            maNganh: maNganh || maCT,
            tenNganh: tenNganh || tenCT,
            tenChuongTrinh: tenCT || tenNganh,
            maTruongDH,
            namTuyenSinh,
            tenTruong,
            soDongXetTuyen,
            trangThaiXacMinh,
            toHopXetTuyen: toHop,
            rawItem: item,
          };
        }).filter((c) => c.tenNganh.length > 0);

        // Loại bỏ các bản ghi trùng lặp theo khóa duy nhất: MaTruongTuyenSinh + MaNganh
        const uniqueProgramMap = new Map<string, any>();
        rawMapped.forEach((prog) => {
          const cleanSchool = (prog.maTruongDH || '').trim().toUpperCase();
          const cleanMajor = (prog.maNganh || prog.maChuongTrinh || '').trim().toUpperCase();
          const uniqueKey = `${cleanSchool}_${cleanMajor}`;

          if (!uniqueProgramMap.has(uniqueKey)) {
            uniqueProgramMap.set(uniqueKey, {
              ...prog,
              toHopXetTuyen: [...(prog.toHopXetTuyen || [])],
            });
          } else {
            // Hợp nhất các tổ hợp xét tuyển nếu có ở các dòng trùng
            const existing = uniqueProgramMap.get(uniqueKey);
            if (prog.toHopXetTuyen && prog.toHopXetTuyen.length > 0) {
              existing.toHopXetTuyen = Array.from(new Set([...(existing.toHopXetTuyen || []), ...prog.toHopXetTuyen]));
            }
          }
        });

        formattedData = Array.from(uniqueProgramMap.values());
      } else if (action === 'toHopXetTuyen') {
        formattedData = rawItems.map((item, idx) => {
          const id = String(item.ID || item.id || `TH_${idx + 1}`).trim();
          const maToHop = String(
            item.MaToHop || item.MATOHOP || item.ToHop || item.code || `TH_${idx + 1}`
          ).trim();
          const tenToHop = String(
            item.TenToHop || item.TENTOHOP || item.PhuongThucXetTuyen || item.name || ''
          ).trim();
          const maNganh = String(item.MaNganh || item.MANGANH || '').trim();
          const maCTDT = String(
            item.MaCTDT || item.MACTDT || item.MaChuongTrinh || item.MACHUONGTRINH || ''
          ).trim();
          const maTruongDH = String(
            item.MaTruongTuyenSinh ||
            item.MATRUONGTUYENSINH ||
            item.MaTruongDH ||
            item.MaTruong ||
            ''
          ).trim();
          const tenNganh = String(item.TenNganh || item.TENNGANH || '').trim();
          const mon1 = String(item.MonThi1 || item.MONTHI1 || item.Mon1 || item.MON1 || '').trim();
          const mon2 = String(item.MonThi2 || item.MONTHI2 || item.Mon2 || item.MON2 || '').trim();
          const mon3 = String(item.MonThi3 || item.MONTHI3 || item.Mon3 || item.MON3 || '').trim();
          const mon4 = String(item.MonThi4 || item.MONTHI4 || item.Mon4NeuCo || item.Mon4 || item.MON4 || '').trim();
          const dieuKien = String(item.DieuKienGhiChu || item.dieuKien || '').trim();
          const phuongThuc = String(item.PhuongThucXetTuyen || '').trim();
          const urlDeAn = String(item.URLDeAnTuyenSinh || item.website || '').trim();

          return {
            id,
            maToHop,
            tenToHop,
            maNganh,
            maChuongTrinh: maCTDT,
            maTruongDH,
            tenNganh,
            mon1,
            mon2,
            mon3,
            mon4,
            dieuKienGhiChu: dieuKien,
            phuongThucXetTuyen: phuongThuc,
            urlDeAnTuyenSinh: urlDeAn,
            rawItem: item,
          };
        }).filter((th) => th.maToHop.length > 0);
      } else if (action === 'toHopTHPT') {
        formattedData = rawItems.map((item, idx) => {
          const maToHop = String(item.MaToHopTHPT || item.MATOHOPTHPT || item.MaToHop || '').trim();
          const maTruong = String(item.MaTruongTHPT || item.MATRUONGTHPT || item.MaTruong || '').trim();
          const tenTruong = String(item.TenTruongTHPT || item.TENTRUONGTHPT || item.TenTruong || '').trim();
          const namHoc = String(item.NamHoc || item.NAMHOC || '').trim();
          const mon1 = String(item.MonLuaChon1 || item.MONLUACHON1 || '').trim();
          const mon2 = String(item.MonLuaChon2 || item.MONLUACHON2 || '').trim();
          const mon3 = String(item.MonLuaChon3 || item.MONLUACHON3 || '').trim();
          const mon4 = String(item.MonLuaChon4 || item.MONLUACHON4 || '').trim();
          const cd1 = String(item.ChuyenDe1 || item.CHUYENDE1 || '').trim();
          const cd2 = String(item.ChuyenDe2 || item.CHUYENDE2 || '').trim();
          const cd3 = String(item.ChuyenDe3 || item.CHUYENDE3 || '').trim();
          const nguon = String(item.NguonXacNhan || item.NGUONXACNHAN || item.NguonChungThuc || '').trim();
          const ngayCapNhat = String(item.NgayCapNhat || item.NGAYCAPNHAT || '').trim();
          const trangThai = String(item.TrangThai || item.TRANGTHAI || '').trim();

          const monLuaChon = [mon1, mon2, mon3, mon4].filter(Boolean);
          const chuyenDe = [cd1, cd2, cd3].filter(Boolean);

          return {
            id: `thpt_comb_${idx + 1}`,
            maToHopTHPT: maToHop,
            maTruongTHPT: maTruong,
            tenTruongTHPT: tenTruong,
            namHoc,
            monLuaChon1: mon1,
            monLuaChon2: mon2,
            monLuaChon3: mon3,
            monLuaChon4: mon4,
            monLuaChon,
            chuyenDe1: cd1,
            chuyenDe2: cd2,
            chuyenDe3: cd3,
            chuyenDe,
            nguonXacNhan: nguon,
            ngayCapNhat,
            trangThai,
            rawItem: item,
          };
        });
      } else {
        formattedData = rawItems;
      }

      res.json({
        ok: true,
        source: 'google_apps_script',
        action,
        count: formattedData.length,
        data: formattedData,
      });
    } catch (networkErr: any) {
      clearTimeout(timeoutId);
      if (networkErr.name === 'AbortError') {
        res.status(504).json({
          ok: false,
          errorType: 'TIMEOUT',
          message: `Quá thời gian kết nối đến máy chủ Google Apps Script khi tải ${action} (hết 20 giây).`,
          details: 'Máy chủ Google phản hồi quá chậm hoặc đường truyền bị ngắt.',
        });
        return;
      }

      res.status(500).json({
        ok: false,
        errorType: 'NETWORK_ERROR',
        message: 'Lỗi mạng khi kết nối đến Google Apps Script từ máy chủ trung gian.',
        details: networkErr.message || 'Không thể thiết lập kết nối mạng.',
      });
    }
  };

  // =========================================================================
  // API Lưu kết quả tư vấn vào 3 sheet: KET_QUA_TU_VAN, CHI_TIET_TU_VAN, NGUYEN_VONG_HOC_SINH
  // Bảo vệ phía máy chủ, chống ghi lặp (Yêu cầu 4, 6, 8, 9, 11)
  // =========================================================================
  const savedSlipsSignatureCache = new Map<string, string>();

  const handleCheckSaveStatus = (_req: Request, res: Response): void => {
    const rawUrl = (process.env.GOOGLE_APPS_SCRIPT_WRITE_URL || '').trim();
    const rawSecret = (process.env.GOOGLE_APPS_SCRIPT_WRITE_SECRET || '').trim();
    const hasWriteUrl = rawUrl.length > 0;
    const hasWriteSecret = rawSecret.length > 0;
    const isExecUrl = rawUrl.includes('/exec');

    res.json({
      ok: true,
      service: 'EduGuide AI Consultation Save API',
      hasWriteUrl,
      hasWriteSecret,
      isExecUrl,
      savedSlipsCount: savedSlipsSignatureCache.size,
    });
  };

  const handleSaveConsultation = async (req: Request, res: Response): Promise<void> => {
    try {
      const payload = req.body;
      if (!payload || typeof payload !== 'object') {
        console.error('[LuuKetQua][Lỗi] Dữ liệu gửi lên không phải JSON object hợp lệ.');
        res.status(400).json({
          ok: false,
          saved: false,
          errorType: 'INVALID_PAYLOAD',
          message: 'Dữ liệu gửi lên không đúng định dạng JSON.',
        });
        return;
      }

      const { maPhieu, maHocSinhAnDanh, dongYLuuDuLieu } = payload;
      const ketQua = payload.ketQua || payload.ketQuaTuVan;
      const chiTiet = payload.chiTiet || payload.chiTietTuVan;
      const nguyenVong = payload.nguyenVong || payload.nguyenVongHocSinh;

      if (!maPhieu || typeof maPhieu !== 'string') {
        console.error('[LuuKetQua][Lỗi] Thiếu mã phiếu tư vấn (MaPhieu).');
        res.status(400).json({
          ok: false,
          saved: false,
          errorType: 'MISSING_SLIP_ID',
          message: 'Thiếu mã phiếu tư vấn (MaPhieu).',
        });
        return;
      }

      const cleanSlipId = maPhieu.trim();

      const payloadSignature = JSON.stringify({
        dongY: dongYLuuDuLieu !== false,
        toHop1: String(ketQua?.ToHopTHPTDeXuat1 || ''),
        toHop2: String(ketQua?.ToHopTHPTDeXuat2 || ''),
        toHopChon: String(ketQua?.ToHopTHPTDaChon || ''),
        truongTHPT: String(ketQua?.MaTruongTHPT || ''),
        truongDH: String(ketQua?.MaTruongDH || ''),
        nganh: String(ketQua?.MaNganh || ''),
        holland: [ketQua?.HollandTop1, ketQua?.HollandTop2, ketQua?.HollandTop3].join('-'),
        nvCount: Array.isArray(nguyenVong) ? nguyenVong.length : 0,
      });

      const previousSignature = savedSlipsSignatureCache.get(cleanSlipId);
      const isUpdateForSameSlip = previousSignature !== undefined && previousSignature !== payloadSignature;

      // Chống ghi lặp khi dữ liệu giống hệt lần đã lưu trước đó cho cùng MaPhieu
      if (previousSignature === payloadSignature) {
        console.log(`[LuuKetQua] Phiếu ${cleanSlipId} không thay đổi dữ liệu, bỏ qua yêu cầu ghi lặp.`);
        res.json({
          ok: true,
          saved: true,
          alreadySaved: true,
          message: `Phiên tư vấn mã ${cleanSlipId} đã được ghi nhận trước đó (bỏ qua lệnh ghi lặp).`,
        });
        return;
      }

      // Nếu học sinh chọn không lưu thông tin cá nhân
      if (dongYLuuDuLieu === false) {
        savedSlipsSignatureCache.set(cleanSlipId, payloadSignature);
        console.log(`[LuuKetQua] Phiếu ${cleanSlipId}: Học sinh chọn không lưu dữ liệu.`);
        res.json({
          ok: true,
          saved: false,
          skippedConsent: true,
          message: 'Học sinh đã chọn không lưu thông tin cá nhân. Hệ thống tôn trọng quyền riêng tư và không lưu dữ liệu.',
        });
        return;
      }

      // Kiểm tra cấu trúc 3 sheet bắt buộc
      if (!ketQua || typeof ketQua !== 'object') {
        console.error(`[LuuKetQua][Lỗi] Phiếu ${cleanSlipId}: Thiếu bản ghi dữ liệu cho sheet KET_QUA_TU_VAN (ketQua).`);
        res.status(422).json({
          ok: false,
          saved: false,
          errorType: 'INVALID_KET_QUA_TU_VAN',
          message: 'Thiếu bản ghi dữ liệu cho sheet KET_QUA_TU_VAN.',
        });
        return;
      }

      if (!Array.isArray(chiTiet) || chiTiet.length === 0) {
        console.error(`[LuuKetQua][Lỗi] Phiếu ${cleanSlipId}: Thiếu dữ liệu chi tiết 6 nhóm Holland cho sheet CHI_TIET_TU_VAN (chiTiet).`);
        res.status(422).json({
          ok: false,
          saved: false,
          errorType: 'INVALID_CHI_TIET_TU_VAN',
          message: 'Thiếu dữ liệu chi tiết 6 nhóm Holland cho sheet CHI_TIET_TU_VAN.',
        });
        return;
      }

      if (!Array.isArray(nguyenVong)) {
        console.error(`[LuuKetQua][Lỗi] Phiếu ${cleanSlipId}: Dữ liệu nguyện vọng cho sheet NGUYEN_VONG_HOC_SINH (nguyenVong) phải là mảng.`);
        res.status(422).json({
          ok: false,
          saved: false,
          errorType: 'INVALID_NGUYEN_VONG_HOC_SINH',
          message: 'Dữ liệu nguyện vọng cho sheet NGUYEN_VONG_HOC_SINH phải là danh sách.',
        });
        return;
      }

      // Đọc biến môi trường phía máy chủ (Tuyệt đối không log hoặc gửi secret ra ngoài)
      let writeTargetUrl = (process.env.GOOGLE_APPS_SCRIPT_WRITE_URL || '').trim();
      const serverWriteSecret = (process.env.GOOGLE_APPS_SCRIPT_WRITE_SECRET || '').trim();

      // Loại bỏ dấu ngoặc kép thừa nếu trong .env có nháy
      if (
        (writeTargetUrl.startsWith('"') && writeTargetUrl.endsWith('"')) ||
        (writeTargetUrl.startsWith("'") && writeTargetUrl.endsWith("'"))
      ) {
        writeTargetUrl = writeTargetUrl.slice(1, -1).trim();
      }

      // Tự động chuẩn hóa URL Google Apps Script sang định dạng Web App /exec nếu người dùng dán link /edit
      if (writeTargetUrl.includes('/edit')) {
        writeTargetUrl = writeTargetUrl.replace(/\/edit(\?.*)?$/, '/exec$1');
      }

      const hasWriteUrl = writeTargetUrl.length > 0;
      const hasWriteSecret = serverWriteSecret.length > 0;

      // Nếu chưa cấu hình URL máy chủ ghi, báo rõ Chưa kết nối lưu trữ, KHÔNG giả lập lưu thành công
      if (!hasWriteUrl) {
        console.warn(`[LuuKetQua] Phiếu ${cleanSlipId}: Máy chủ chưa cấu hình GOOGLE_APPS_SCRIPT_WRITE_URL (URL=Không, Secret=${hasWriteSecret ? 'Có' : 'Không'}).`);
        res.status(200).json({
          ok: false,
          saved: false,
          errorType: 'WRITE_ENDPOINT_NOT_CONFIGURED',
          message: 'Máy chủ chưa cấu hình biến môi trường GOOGLE_APPS_SCRIPT_WRITE_URL để ghi dữ liệu vào Google Sheets.',
          details: 'Toàn bộ dữ liệu 3 sheet (KET_QUA_TU_VAN, CHI_TIET_TU_VAN, NGUYEN_VONG_HOC_SINH) đã được chuẩn bị đầy đủ và hợp lệ, sẵn sàng kết nối.',
          hasWriteUrl: false,
          hasWriteSecret,
          preparedData: {
            maPhieu: cleanSlipId,
            maHocSinhAnDanh: String(maHocSinhAnDanh || ''),
            chiTietCount: chiTiet.length,
            nguyenVongCount: nguyenVong.length,
          },
        });
        return;
      }

      console.log(`[LuuKetQua] Bắt đầu gửi dữ liệu lưu phiếu ${cleanSlipId} lên Google Apps Script (URL=Có, Secret=${hasWriteSecret ? 'Có' : 'Không'}).`);

      // Cấu trúc chuẩn theo đúng yêu cầu: secret, ketQua, chiTiet, nguyenVong
      const upstreamPayload = {
        secret: serverWriteSecret,
        ketQua,
        chiTiet,
        nguyenVong,
        // Các trường bổ trợ đảm bảo tương thích mọi phiên bản Google Apps Script & cập nhật theo MaPhieu
        action: 'luuKetQua',
        isUpdate: Boolean(payload.isUpdate || isUpdateForSameSlip),
        updateExisting: true,
        upsertByMaPhieu: true,
        maPhieu: cleanSlipId,
        maHocSinhAnDanh: String(maHocSinhAnDanh || ''),
        ketQuaTuVan: ketQua,
        chiTietTuVan: chiTiet,
        nguyenVongHocSinh: nguyenVong,
        sheets: {
          KET_QUA_TU_VAN: Array.isArray(ketQua) ? ketQua : [ketQua],
          CHI_TIET_TU_VAN: chiTiet,
          NGUYEN_VONG_HOC_SINH: nguyenVong,
        },
      };

      const upstreamHeaders: Record<string, string> = {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'EduGuideAI-BackendWriteProxy/1.0',
      };
      if (hasWriteSecret) {
        upstreamHeaders['X-Write-Secret'] = serverWriteSecret;
        upstreamHeaders['Authorization'] = `Bearer ${serverWriteSecret}`;
      }

      // Chuyển tiếp an toàn qua POST đến Web App với cơ chế theo dõi chuyển hướng 302 tự động
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      let upstreamRes: globalThis.Response;
      try {
        upstreamRes = await fetch(writeTargetUrl, {
          method: 'POST',
          headers: upstreamHeaders,
          body: JSON.stringify(upstreamPayload),
          redirect: 'follow', // Tự động theo dõi chuyển hướng 302 của Google Script sang script.googleusercontent.com
          signal: controller.signal,
        });
      } catch (networkErr: any) {
        clearTimeout(timeoutId);
        const isTimeout = networkErr.name === 'AbortError';
        const errorType = isTimeout ? 'UPSTREAM_TIMEOUT' : 'UPSTREAM_NETWORK_ERROR';
        const errorMsg = isTimeout
          ? 'Quá thời gian chờ phản hồi từ Google Apps Script (hết 30 giây).'
          : (networkErr.message || 'Lỗi mạng khi kết nối đến Google Apps Script.');

        console.error(`[LuuKetQua][Lỗi] Phiếu ${cleanSlipId}: ${errorType} - ${errorMsg}`);
        res.status(504).json({
          ok: false,
          saved: false,
          errorType,
          message: errorMsg,
          details: 'Không thể thiết lập kết nối tới Google Apps Script Web App.',
        });
        return;
      }

      clearTimeout(timeoutId);

      const responseText = await upstreamRes.text();
      const finalUrl = upstreamRes.url || '';

      // Kiểm tra nếu Google Web App chuyển hướng tới trang đăng nhập Google Accounts
      const isAuthRedirect =
        finalUrl.includes('accounts.google.com') ||
        finalUrl.includes('ServiceLogin') ||
        responseText.includes('accounts.google.com') ||
        responseText.includes('Sign in - Google Accounts') ||
        responseText.includes('Đăng nhập - Tài khoản Google');

      if (isAuthRedirect) {
        console.error(`[LuuKetQua][Lỗi] Phiếu ${cleanSlipId}: AUTH_REQUIRED - Google Apps Script yêu cầu đăng nhập tài khoản.`);
        res.status(401).json({
          ok: false,
          saved: false,
          errorType: 'AUTH_REQUIRED',
          message: 'API Google Apps Script yêu cầu đăng nhập tài khoản Google.',
          details:
            'Web App hiện ở chế độ riêng tư hoặc yêu cầu quyền tổ chức. Cần cấu hình: "Execute as: Me" và "Who has access: Anyone".',
        });
        return;
      }

      let upstreamJson: any = null;
      try {
        upstreamJson = JSON.parse(responseText);
      } catch {
        upstreamJson = null;
      }

      // Xác nhận thành công chỉ khi Google Sheets phản hồi xác nhận rõ ràng
      const isUpstreamConfirmed =
        upstreamRes.ok &&
        upstreamJson !== null &&
        typeof upstreamJson === 'object' &&
        (upstreamJson.success === true ||
          upstreamJson.ok === true ||
          upstreamJson.status === 'success' ||
          upstreamJson.result === 'success') &&
        !upstreamJson.error;

      if (isUpstreamConfirmed) {
        savedSlipsSignatureCache.set(cleanSlipId, payloadSignature);
        console.log(`[LuuKetQua] Phiếu ${cleanSlipId} đã được Google Sheets xác nhận ${isUpdateForSameSlip ? 'cập nhật' : 'lưu'} thành công.`);
        res.json({
          ok: true,
          saved: true,
          updated: isUpdateForSameSlip,
          message: isUpdateForSameSlip
            ? 'Đã cập nhật tổ hợp môn lựa chọn theo mã phiếu tư vấn trên Google Sheets.'
            : 'Đã lưu toàn bộ dữ liệu tư vấn thành công vào 3 sheet Google Sheets.',
          upstream: upstreamJson,
        });
      } else {
        const errorDetail =
          (upstreamJson && (upstreamJson.error || upstreamJson.message)) ||
          (responseText.startsWith('<')
            ? 'Máy chủ Google trả về trang HTML thay vì JSON (có thể do lỗi thực thi hàm doPost).'
            : responseText.slice(0, 300)) ||
          'Google Apps Script chưa xác nhận ghi thành công.';

        console.error(
          `[LuuKetQua][Lỗi] Phiếu ${cleanSlipId}: UPSTREAM_REJECTED (HTTP ${upstreamRes.status}) - ${errorDetail}`
        );

        res.status(502).json({
          ok: false,
          saved: false,
          errorType: 'UPSTREAM_WRITE_ERROR',
          message: 'Máy chủ Google Sheets chưa xác nhận hoặc phản hồi lỗi khi ghi dữ liệu.',
          details: errorDetail,
        });
      }
    } catch (err: any) {
      console.error(`[LuuKetQua][Ngoại lệ] Lỗi máy chủ khi xử lý lưu kết quả: ${err?.message || String(err)}`);
      res.status(500).json({
        ok: false,
        saved: false,
        errorType: 'SERVER_WRITE_EXCEPTION',
        message: 'Lỗi máy chủ khi xử lý lưu kết quả tư vấn.',
        details: err?.message || String(err),
      });
    }
  };

  // Hỗ trợ cả GET và POST để frontend linh hoạt gọi
  app.get('/api/truong-thpt', handleFetchTruongTHPT);
  app.post('/api/truong-thpt', handleFetchTruongTHPT);

  app.get('/api/holland', handleFetchHolland);
  app.post('/api/holland', handleFetchHolland);

  app.get('/api/holland-nganh-nghe', handleFetchHollandCareers);
  app.post('/api/holland-nganh-nghe', handleFetchHollandCareers);

  app.get('/api/dai-hoc', handleFetchDaiHoc);
  app.post('/api/dai-hoc', handleFetchDaiHoc);

  // Endpoint lưu kết quả tư vấn vào 3 sheet
  app.get('/api/luu-ket-qua', handleCheckSaveStatus);
  app.post('/api/luu-ket-qua', handleSaveConsultation);

  // Ping health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  return app;
}

async function startServer() {
  const app = createApiApp();

  // Dev server must strictly run on port 3000 (port 8080 is reserved for NGINX proxy)
  const portArgIdx = process.argv.indexOf('--port');
  const portFromArg =
    portArgIdx !== -1 && process.argv[portArgIdx + 1] ? Number(process.argv[portArgIdx + 1]) : null;
  const PORT =
    portFromArg && !isNaN(portFromArg)
      ? portFromArg
      : process.env.PORT && Number(process.env.PORT) !== 8080
      ? Number(process.env.PORT)
      : 3000;

  const hostArgIdx = process.argv.indexOf('--host');
  const HOST =
    hostArgIdx !== -1 && process.argv[hostArgIdx + 1] ? process.argv[hostArgIdx + 1] : '0.0.0.0';

  const httpServer = app.listen(PORT, HOST, () => {
    console.log(`EduGuide AI Server running at http://${HOST}:${PORT}`);
  });

  // Tích hợp Vite middleware trong môi trường Dev hoặc phục vụ static trong Production
  if (process.env.NODE_ENV === 'production') {
    app.use('/src/assets', express.static(path.resolve(__dirname, 'src', 'assets')));
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const viteReadyPromise = (async () => {
      const fs = await import('fs');
      const vitePkg = 'vite';
      const { createServer } = await import(/* @vite-ignore */ vitePkg);
      const vite = await createServer({
        server: {
          middlewareMode: true,
          hmr: process.env.DISABLE_HMR === 'true' ? false : { server: httpServer },
        },
        appType: 'spa',
      });
      return { fs, vite };
    })();

    app.use(async (req, res, next) => {
      try {
        const { vite } = await viteReadyPromise;
        vite.middlewares(req, res, next);
      } catch (err) {
        next(err);
      }
    });

    // Fallback cho định tuyến SPA trong môi trường Dev
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const { fs, vite } = await viteReadyPromise;
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        try {
          const { vite } = await viteReadyPromise;
          if (vite.ssrFixStacktrace) {
            vite.ssrFixStacktrace(e);
          }
        } catch {
          // ignore
        }
        next(e);
      }
    });
  }
}

if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Fatal server error:', err);
    process.exit(1);
  });
}
