import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  School,
  SCHOOLS_DATA,
  DA_NANG_DISTRICTS,
  SubjectCombination,
} from '../data/schoolsData';
import {
  CITIES,
  UNIVERSITIES_DATA,
  MajorOption,
  HOLLAND_QUESTIONS,
  UniversityOption,
} from '../data/universityData';
import {
  TruongTHPT,
  OFFICIAL_DANANG_THPT_LIST,
  fetchTruongTHPTFromGoogleAppsScript,
  matchVietnamese,
  getGoogleAppsScriptUrl,
  setGoogleAppsScriptUrl,
  ApiFetchError,
  getGoogleDriveImageUrl,
  isLeQuyDonSpecialSchool,
} from '../services/schoolApiService';
import {
  HollandQuestionItem,
  HollandCareerLookupItem,
  fetchHollandQuestionsFromGoogleAppsScript,
  fetchHollandCareerLookupFromGoogleAppsScript,
  calculateHollandResults,
  DEFAULT_SCALE_OPTIONS,
  LIKERT_3_SCALE_OPTIONS,
  LIKERT_5_SCALE_OPTIONS,
  ScaleOption,
  RIASEC_INFO_MAP,
  RiasecKey,
  DM_MON_HOC,
  HighSchoolSubject,
} from '../services/hollandApiService';
import {
  TinhThanhItem,
  TruongDHItem,
  ChuongTrinhItem,
  ToHopXetTuyenItem,
  ToHopTHPTItem,
  UniversityWish,
  fetchUniversityApi,
} from '../services/universityApiService';
import {
  KetQuaTuVanRecord,
  ChiTietTuVanRecord,
  NguyenVongHocSinhRecord,
  generateStudentSessionIds,
  sendConsultationSaveRequest,
} from '../services/consultationSaveService';
import {
  WISH_PRIORITY_WEIGHTS,
  COMPULSORY_THPT_CORE as FREQ_COMPULSORY_THPT_CORE,
  normalizeSubjectName as normalizeSubjectNameAlgo,
  runFrequencyConsultationAlgorithm,
} from '../services/frequencyConsultationAlgorithm';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Bot,
  User,
  Search,
  School as SchoolIcon,
  BookOpen,
  Sparkles,
  GraduationCap,
  Award,
  Check,
  Copy,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  Compass,
  MapPin,
  Phone,
  Globe,
  Home,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle,
  Building2,
  ExternalLink,
  SlidersHorizontal,
  Lock,
  CheckSquare,
  HelpCircle,
  ArrowUpRight,
  Layers,
  Wrench,
  Microscope,
  Palette,
  Users,
  TrendingUp,
  Info,
  CheckCheck,
  Clock,
  BookmarkCheck,
  Heart,
  Briefcase,
  Target,
  Star,
} from 'lucide-react';

interface GuidanceViewProps {
  currentStep: 1 | 2 | 3 | 4;
  onStepChange: (step: 1 | 2 | 3 | 4) => void;
  studentName: string;
  onStudentNameChange: (name: string) => void;
  onNavigateHome: () => void;
  selectedSchool: School | null;
  onSelectSchool: (school: School) => void;
  sessionIds?: { studentId: string; slipId: string };
  consentSaveData?: boolean;
}

export default function GuidanceView({
  currentStep,
  onStepChange,
  studentName,
  onStudentNameChange,
  onNavigateHome,
  selectedSchool,
  onSelectSchool,
  sessionIds,
  consentSaveData = true,
}: GuidanceViewProps) {
  // Step 1: School search & Google Apps Script API integration
  const [schoolSearchQuery, setSchoolSearchQuery] = useState('');
  const [schoolsList, setSchoolsList] = useState<TruongTHPT[]>(OFFICIAL_DANANG_THPT_LIST);
  const [showAllSchools, setShowAllSchools] = useState(false);
  const [apiState, setApiState] = useState<'idle' | 'loading' | 'error' | 'waiting'>('idle');
  const [apiErrorMessage, setApiErrorMessage] = useState('');
  const [apiErrorObj, setApiErrorObj] = useState<ApiFetchError | null>(null);
  const [customApiUrl, setCustomApiUrl] = useState(getGoogleAppsScriptUrl());
  const [showApiModal, setShowApiModal] = useState(false);
  const [isUsingApi, setIsUsingApi] = useState(false);

  // Lưu trữ các ảnh và logo bị lỗi hoặc bị Drive chặn để hiển thị ảnh/biểu tượng mặc định dự phòng
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [failedLogos, setFailedLogos] = useState<Record<string, boolean>>({});

  // Auto-connect if Google Apps Script URL was previously saved or set in env
  useEffect(() => {
    const savedUrl = getGoogleAppsScriptUrl();
    if (savedUrl) {
      handleFetchFromApi(savedUrl);
    }
  }, []);

  // Function to load from Google Apps Script API via backend proxy
  const handleFetchFromApi = async (urlToUse?: string) => {
    const url = (urlToUse !== undefined ? urlToUse : customApiUrl).trim();
    if (!url) {
      setApiState('waiting');
      setApiErrorMessage('Chưa có URL API Google Apps Script');
      setApiErrorObj({
        errorType: 'MISSING_URL',
        message: 'Chưa có URL API Google Apps Script',
        details: 'Vui lòng cung cấp đường dẫn Web App Google Apps Script để kết nối.',
      });
      return;
    }
    setApiState('loading');
    setApiErrorMessage('');
    setApiErrorObj(null);
    try {
      const data = await fetchTruongTHPTFromGoogleAppsScript(url);
      setSchoolsList(data);
      setGoogleAppsScriptUrl(url);
      setCustomApiUrl(url);
      setIsUsingApi(true);
      setApiState('idle');
      setApiErrorMessage('');
      setApiErrorObj(null);
      // Đặt lại trạng thái lỗi ảnh khi tải lại dữ liệu mới từ API
      setFailedImages({});
      setFailedLogos({});
      setShowApiModal(false);

      // Cập nhật lại ảnh và thông tin của trường học đang chọn theo đúng MaTruongTHPT từ API nếu đã chọn
      if (selectedSchool) {
        const updatedMatch = data.find(
          (t) =>
            t.MaTruongTHPT.toUpperCase() === selectedSchool.id.toUpperCase() ||
            t.TenTruong.toLowerCase() === selectedSchool.name.toLowerCase() ||
            selectedSchool.name.toLowerCase().includes(t.TenTruong.toLowerCase())
        );
        if (updatedMatch) {
          onSelectSchool({
            ...selectedSchool,
            name: updatedMatch.TenTruong,
            address: updatedMatch.DiaChi,
            image: getGoogleDriveImageUrl(updatedMatch.AnhTruong, 'w1200') || selectedSchool.image,
          });
        }
      }
    } catch (err: any) {
      setApiState('error');
      setApiErrorMessage(err.message || 'Lỗi kết nối API Google Apps Script');
      setApiErrorObj(
        err && err.errorType
          ? (err as ApiFetchError)
          : {
              errorType: 'UNKNOWN',
              message: err.message || 'Lỗi kết nối API Google Apps Script',
            }
      );
    }
  };

  // Switch back to 21 official Da Nang high schools
  const handleUseOfficialList = () => {
    setSchoolsList(OFFICIAL_DANANG_THPT_LIST);
    setIsUsingApi(false);
    setApiState('idle');
    setApiErrorMessage('');
    setApiErrorObj(null);
    setFailedImages({});
    setFailedLogos({});
    setShowApiModal(false);
  };

  // Tìm trường đang chọn nếu học sinh đã chọn, nếu chưa chọn thì là null (không chọn sẵn trường đầu tiên)
  const currentSelectedTruong: TruongTHPT | null = selectedSchool
    ? (schoolsList.find(
        (t) =>
          t.TenTruong.toLowerCase() === selectedSchool.name.toLowerCase() ||
          selectedSchool.name.toLowerCase().includes(t.TenTruong.toLowerCase()) ||
          t.TenTruong.toLowerCase().includes(selectedSchool.shortName.toLowerCase()) ||
          selectedSchool.id.toLowerCase().includes(t.MaTruongTHPT.toLowerCase())
      ) || {
        MaTruongTHPT: selectedSchool.id.toUpperCase(),
        TenTruong: selectedSchool.name,
        DiaChi: selectedSchool.address,
        AnhTruong: selectedSchool.image,
        LogoTruong: '',
      })
    : null;

  // When student clicks a school card: saves MaTruongTHPT and TenTruong in consultation state
  const handleSelectTruong = (truong: TruongTHPT) => {
    const processedImg = getGoogleDriveImageUrl(truong.AnhTruong, 'w1200');
    const matched = SCHOOLS_DATA.find(
      (s) =>
        s.name.toLowerCase() === truong.TenTruong.toLowerCase() ||
        s.shortName.toLowerCase() === truong.TenTruong.toLowerCase() ||
        truong.TenTruong.toLowerCase().includes(s.shortName.toLowerCase()) ||
        s.id.toLowerCase().includes(truong.MaTruongTHPT.toLowerCase())
    );

    if (matched) {
      onSelectSchool({
        ...matched,
        image: processedImg || matched.image,
      });
    } else {
      onSelectSchool({
        ...SCHOOLS_DATA[0],
        id: truong.MaTruongTHPT.toLowerCase(),
        name: truong.TenTruong,
        shortName: truong.TenTruong.replace('Trường THPT ', 'THPT '),
        address: truong.DiaChi,
        image: processedImg || SCHOOLS_DATA[0].image,
      });
    }
  };

  // Filtered schools using accent-sensitive and accent-insensitive matching (excluding Lê Quý Đôn)
  const filteredSchools = schoolsList
    .filter((s) => !isLeQuyDonSpecialSchool(s))
    .filter((s) => {
      return (
        matchVietnamese(s.TenTruong, schoolSearchQuery) ||
        matchVietnamese(s.DiaChi, schoolSearchQuery) ||
        matchVietnamese(s.MaTruongTHPT, schoolSearchQuery)
      );
    });

  // Display schools: when search query is entered, show all matching; otherwise 6 or all
  const displayedSchools = schoolSearchQuery.trim()
    ? filteredSchools
    : showAllSchools
    ? filteredSchools
    : filteredSchools.slice(0, 6);

  // Step 2: Holland RIASEC 108 Questions from sheet BO_108_CAU_HOI & Career Lookup from TRA_CUU_NGANH_NGHE
  const slipStorageKey = sessionIds?.slipId
    ? `eduguide_holland_answers_${sessionIds.slipId}`
    : 'eduguide_holland_answers_session';

  const [hollandQuestions, setHollandQuestions] = useState<HollandQuestionItem[]>([]);
  const [hollandApiState, setHollandApiState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [hollandApiErrorMessage, setHollandApiErrorMessage] = useState('');
  const [hollandApiErrorObj, setHollandApiErrorObj] = useState<ApiFetchError | null>(null);

  const [hollandCareerMap, setHollandCareerMap] = useState<Partial<Record<RiasecKey, HollandCareerLookupItem>>>({});
  const [hollandCareerApiState, setHollandCareerApiState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [hollandCareerErrorObj, setHollandCareerErrorObj] = useState<ApiFetchError | null>(null);

  const [hollandAnswers, setHollandAnswers] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = window.sessionStorage.getItem(slipStorageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            return parsed;
          }
        }
      } catch {
        // Bỏ qua lỗi đọc sessionStorage
      }
    }
    return {};
  });

  // Đồng bộ đáp án Holland vào sessionStorage để luôn giữ nguyên khi chuyển bước hoặc quay lại
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.setItem(slipStorageKey, JSON.stringify(hollandAnswers));
      } catch {
        // Bỏ qua lỗi ghi sessionStorage
      }
    }
  }, [hollandAnswers, slipStorageKey]);

  const [hollandStep, setHollandStep] = useState<'intro' | 'test' | 'result'>('intro');
  const [hollandPage, setHollandPage] = useState(1);
  const [scaleType, setScaleType] = useState<'binary' | 'likert3' | 'likert5'>('binary');
  const [favoriteSubjects, setFavoriteSubjects] = useState<string[]>([]);
  const [pageWarning, setPageWarning] = useState<number | null>(null);
  const testContainerRef = useRef<HTMLDivElement>(null);
  const prevHollandStepRef = useRef<'intro' | 'test' | 'result'>(hollandStep);

  // Tự động cuộn mượt về đầu phần câu hỏi hoặc đầu trang khi chuyển nhóm / xem kết quả
  const scrollToTestTop = () => {
    if (testContainerRef.current) {
      testContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (currentStep === 2 && prevHollandStepRef.current !== hollandStep) {
      prevHollandStepRef.current = hollandStep;
      if (typeof window !== 'undefined') {
        const rafId = window.requestAnimationFrame(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        const timerId = window.setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 80);
        return () => {
          window.cancelAnimationFrame(rafId);
          window.clearTimeout(timerId);
        };
      }
    }
    prevHollandStepRef.current = hollandStep;
  }, [currentStep, hollandStep]);

  const RIASEC_ORDER: RiasecKey[] = ['R', 'I', 'A', 'S', 'E', 'C'];
  const [hollandGroupIndex, setHollandGroupIndex] = useState(0); // 0..5 (Phần 1..6)
  const [viewMode, setViewMode] = useState<'by-group' | 'all'>('by-group');

  // Phân nhóm câu hỏi từ API theo 6 nhóm RIASEC
  const questionsByGroup = useMemo(() => {
    const map: Record<RiasecKey, HollandQuestionItem[]> = {
      R: [],
      I: [],
      A: [],
      S: [],
      E: [],
      C: [],
    };
    hollandQuestions.forEach((q) => {
      if (map[q.category]) {
        map[q.category].push(q);
      } else {
        map.R.push(q);
      }
    });
    return map;
  }, [hollandQuestions]);

  // Phân chia 18 câu của 1 nhóm RIASEC thành 3 khía cạnh theo cột PhanLoai từ sheet BO_108_CAU_HOI:
  // 1. "Tôi là người..."
  // 2. "Tôi có thể..."
  // 3. "Tôi thích..."
  const categorizeGroupQuestionsByAspect = (questions: HollandQuestionItem[]) => {
    if (!questions || questions.length === 0) {
      return { person: [], ability: [], interest: [] };
    }

    const personList: HollandQuestionItem[] = [];
    const abilityList: HollandQuestionItem[] = [];
    const interestList: HollandQuestionItem[] = [];
    const remaining: HollandQuestionItem[] = [];

    questions.forEach((q) => {
      const phanLoai = (q.phanLoai || '').toLowerCase().trim();
      const text = q.content.toLowerCase().trim();

      if (phanLoai) {
        if (
          phanLoai.includes('tôi là người') ||
          phanLoai.includes('là người') ||
          phanLoai.includes('tính cách') ||
          phanLoai.includes('person')
        ) {
          personList.push(q);
          return;
        }
        if (
          phanLoai.includes('tôi có thể') ||
          phanLoai.includes('có thể') ||
          phanLoai.includes('năng lực') ||
          phanLoai.includes('kỹ năng') ||
          phanLoai.includes('ability')
        ) {
          abilityList.push(q);
          return;
        }
        if (
          phanLoai.includes('tôi thích') ||
          phanLoai.includes('thích') ||
          phanLoai.includes('sở thích') ||
          phanLoai.includes('interest')
        ) {
          interestList.push(q);
          return;
        }
      }

      if (
        text.startsWith('tôi là') ||
        text.includes('tôi là người') ||
        text.includes('tính cách') ||
        text.includes('phong cách') ||
        text.includes('bản thân là')
      ) {
        personList.push(q);
      } else if (
        text.startsWith('tôi có thể') ||
        text.includes('có thể') ||
        text.includes('khả năng') ||
        text.includes('kỹ năng') ||
        text.includes('biết cách') ||
        text.includes('thành thạo')
      ) {
        abilityList.push(q);
      } else if (
        text.startsWith('tôi thích') ||
        text.includes('thích') ||
        text.includes('hứng thú') ||
        text.includes('đam mê') ||
        text.includes('say mê') ||
        text.includes('yêu thích')
      ) {
        interestList.push(q);
      } else {
        remaining.push(q);
      }
    });

    if (
      (personList.length > 0 || abilityList.length > 0 || interestList.length > 0) &&
      remaining.length === 0
    ) {
      return { person: personList, ability: abilityList, interest: interestList };
    }

    // Phân bổ đều 3 cột nếu dữ liệu không có cột PhanLoai
    const chunkSize = Math.ceil(questions.length / 3);
    return {
      person: questions.slice(0, chunkSize),
      ability: questions.slice(chunkSize, chunkSize * 2),
      interest: questions.slice(chunkSize * 2),
    };
  };

  // Đổi trạng thái tích chọn câu hỏi (Tick = 1, Bỏ tick = xóa) - cho phép click tick nhiều lần linh hoạt
  const handleToggleQuestionTick = (id: string) => {
    setHollandAnswers((prev) => {
      const current = prev[id];
      const next = { ...prev };
      if (current === 1) {
        delete next[id];
      } else {
        next[id] = 1;
      }
      return next;
    });
  };

  // Chọn nhanh tất cả câu trong 1 cột thành Được chọn (1)
  const handleSelectAllInColumn = (qList: HollandQuestionItem[]) => {
    setHollandAnswers((prev) => {
      const next = { ...prev };
      qList.forEach((q) => {
        next[q.id] = 1;
      });
      return next;
    });
  };

  // Bỏ chọn tất cả câu trong 1 cột
  const handleDeselectAllInColumn = (qList: HollandQuestionItem[]) => {
    setHollandAnswers((prev) => {
      const next = { ...prev };
      qList.forEach((q) => {
        delete next[q.id];
      });
      return next;
    });
  };

  // Chọn nhanh tất cả 18 câu trong cả nhóm thành Được chọn (1)
  const handleSelectAllInGroup = (groupKey: RiasecKey) => {
    const list = questionsByGroup[groupKey] || [];
    setHollandAnswers((prev) => {
      const next = { ...prev };
      list.forEach((q) => {
        next[q.id] = 1;
      });
      return next;
    });
  };

  // Bỏ chọn tất cả 18 câu trong cả nhóm
  const handleDeselectAllInGroup = (groupKey: RiasecKey) => {
    const list = questionsByGroup[groupKey] || [];
    setHollandAnswers((prev) => {
      const next = { ...prev };
      list.forEach((q) => {
        delete next[q.id];
      });
      return next;
    });
  };

  // Đếm tổng số câu hỏi đã được tích chọn (value = 1) trên toàn bộ 108 câu
  const totalTickedCount = useMemo(() => {
    return Object.values(hollandAnswers).filter((v) => v === 1).length;
  }, [hollandAnswers]);

  // Tiến độ làm bài theo 6 phần nhóm (Phần 1..6)
  const groupProgressPercent = useMemo(() => {
    return Math.min(100, Math.round(((hollandGroupIndex + 1) / 6) * 100));
  }, [hollandGroupIndex]);

  const handleNextGroup = () => {
    setHollandGroupIndex((prev) => Math.min(5, prev + 1));
    setTimeout(scrollToTestTop, 40);
  };

  const handlePrevGroup = () => {
    setHollandGroupIndex((prev) => Math.max(0, prev - 1));
    setTimeout(scrollToTestTop, 40);
  };

  const handleGoToGroup = (idx: number) => {
    setHollandGroupIndex(idx);
    setTimeout(scrollToTestTop, 40);
  };

  // Thang điểm đang áp dụng
  const currentScaleOptions: ScaleOption[] =
    scaleType === 'likert5'
      ? LIKERT_5_SCALE_OPTIONS
      : scaleType === 'likert3'
      ? LIKERT_3_SCALE_OPTIONS
      : DEFAULT_SCALE_OPTIONS;

  const currentScaleMax = scaleType === 'likert5' ? 5 : scaleType === 'likert3' ? 2 : 1;

  // Tải bảng tra cứu 6 nhóm từ sheet TRA_CUU_NGANH_NGHE
  const handleFetchHollandCareers = async (urlToUse?: string) => {
    const url = (urlToUse !== undefined ? urlToUse : customApiUrl || getGoogleAppsScriptUrl()).trim();
    if (!url) {
      setHollandCareerApiState('error');
      setHollandCareerErrorObj({
        errorType: 'MISSING_URL',
        message: 'Chưa có URL API Google Apps Script.',
        details: 'Vui lòng cung cấp URL Google Apps Script hỗ trợ ?action=traCuuNganhNghe để tải dữ liệu từ sheet TRA_CUU_NGANH_NGHE.',
      });
      return;
    }
    setHollandCareerApiState('loading');
    setHollandCareerErrorObj(null);
    try {
      const res = await fetchHollandCareerLookupFromGoogleAppsScript(url);
      setHollandCareerMap(res.records);
      setHollandCareerApiState('idle');
      setHollandCareerErrorObj(null);
    } catch (err: any) {
      setHollandCareerApiState('error');
      setHollandCareerErrorObj(
        err && err.errorType
          ? (err as ApiFetchError)
          : {
              errorType: 'SHEET_API_NOT_AVAILABLE',
              message: err.message || 'Chưa kết nối được API sheet TRA_CUU_NGANH_NGHE',
            }
      );
    }
  };

  // Tải 108 câu hỏi Holland từ API Google Apps Script (sheet BO_108_CAU_HOI)
  const handleFetchHollandQuestions = async (urlToUse?: string) => {
    const url = (urlToUse !== undefined ? urlToUse : customApiUrl).trim();
    if (!url) {
      setHollandApiState('error');
      setHollandApiErrorMessage('Chưa có URL API Google Apps Script');
      setHollandApiErrorObj({
        errorType: 'MISSING_URL',
        message: 'Chưa có URL API Google Apps Script',
        details: 'Vui lòng cung cấp URL Google Apps Script để tải 108 câu hỏi Holland từ sheet BO_108_CAU_HOI.',
      });
      return;
    }
    setHollandApiState('loading');
    setHollandApiErrorMessage('');
    setHollandApiErrorObj(null);
    setScaleType('binary');
    try {
      const result = await fetchHollandQuestionsFromGoogleAppsScript(url);
      setHollandQuestions(result.questions);
      setHollandApiState('idle');
      setHollandApiErrorMessage('');
      setHollandApiErrorObj(null);
    } catch (err: any) {
      setHollandApiState('error');
      setHollandApiErrorMessage(err.message || 'Lỗi tải 108 câu hỏi Holland từ Google Apps Script');
      setHollandApiErrorObj(
        err && err.errorType
          ? (err as ApiFetchError)
          : {
              errorType: 'UNKNOWN',
              message: err.message || 'Lỗi tải 108 câu hỏi Holland từ Google Apps Script',
            }
      );
    }
  };

  // Tự động tải bộ 108 câu hỏi & bảng TRA_CUU_NGANH_NGHE khi học sinh vào Bước 2
  useEffect(() => {
    if (currentStep === 2) {
      const url = getGoogleAppsScriptUrl() || customApiUrl;
      if (url) {
        if (hollandQuestions.length === 0 && hollandApiState === 'idle') {
          handleFetchHollandQuestions(url);
        }
        if (Object.keys(hollandCareerMap).length === 0 && hollandCareerApiState === 'idle') {
          handleFetchHollandCareers(url);
        }
      }
    }
  }, [currentStep]);

  // Tính điểm và chuẩn hóa kết quả 6 nhóm RIASEC theo thuật toán chuẩn (thang 18, mức độ THẤP/TRUNG BÌNH/CAO)
  const hollandCalcResult = useMemo(() => {
    return calculateHollandResults(hollandQuestions, hollandAnswers, 1);
  }, [hollandQuestions, hollandAnswers]);

  // Bật/tắt chọn môn học yêu thích ở Bước 2
  const handleToggleFavoriteSubject = (subjectName: string) => {
    if (favoriteSubjects.includes(subjectName)) {
      setFavoriteSubjects(favoriteSubjects.filter((s) => s !== subjectName));
    } else {
      setFavoriteSubjects([...favoriteSubjects, subjectName]);
    }
  };

  // Fallback đánh giá nhanh nếu chưa hoàn thành khảo sát 108 câu
  const [hollandRatings, setHollandRatings] = useState<Record<string, number>>({
    R: 2,
    I: 3,
    A: 2,
    S: 2,
    E: 2,
    C: 2,
  });

  // =========================================================================
  // BƯỚC 3: DỮ LIỆU & QUẢN LÝ NGUYỆN VỌNG ĐẠI HỌC (1 ĐẾN 3 NGUYỆN VỌNG ĐỘC LẬP)
  // =========================================================================
  const [universityWishes, setUniversityWishes] = useState<UniversityWish[]>([
    {
      id: 'wish_1',
      order: 1,
      maTinh: '',
      tenTinh: '',
      maTruongDH: '',
      tenTruongDH: '',
      tenVietTat: '',
      maChuongTrinh: '',
      maNganh: '',
      tenNganh: '',
      toHopXetTuyen: [],
    },
  ]);

  // Danh mục tải từ API Google Apps Script (?action=tinhThanh, truongDH, chuongTrinh, toHopXetTuyen, toHopTHPT)
  const [tinhThanhList, setTinhThanhList] = useState<TinhThanhItem[]>([]);
  const [truongDHList, setTruongDHList] = useState<TruongDHItem[]>([]);
  const [chuongTrinhList, setChuongTrinhList] = useState<ChuongTrinhItem[]>([]);
  const [toHopList, setToHopList] = useState<ToHopXetTuyenItem[]>([]);
  const [toHopTHPTList, setToHopTHPTList] = useState<ToHopTHPTItem[]>([]);
  const [toHopTHPTLoading, setToHopTHPTLoading] = useState<boolean>(false);
  const [toHopTHPTError, setToHopTHPTError] = useState<string>('');

  const [uniApiState, setUniApiState] = useState<'idle' | 'loading' | 'error' | 'waiting'>('idle');
  const [uniApiErrorMessage, setUniApiErrorMessage] = useState<string>('');
  const [uniApiErrorObj, setUniApiErrorObj] = useState<ApiFetchError | null>(null);
  const [uniDuplicateWarning, setUniDuplicateWarning] = useState<string>('');

  // Tải danh mục tuyển sinh đại học & tổ hợp môn THPT từ Google Apps Script
  const handleFetchUniversityData = async (urlToUse?: string) => {
    const url = (urlToUse !== undefined ? urlToUse : customApiUrl || getGoogleAppsScriptUrl()).trim();
    if (!url) {
      setUniApiState('error');
      setUniApiErrorMessage('Chưa cấu hình URL API Google Apps Script cho Tuyển sinh Đại học.');
      setUniApiErrorObj({
        errorType: 'MISSING_URL',
        message: 'Chưa có URL API Google Apps Script',
        details: 'Vui lòng cung cấp URL Web App Google Apps Script để tải danh mục Tỉnh/Thành phố (?action=tinhThanh), Trường Đại học (?action=truongDH), Chương trình đào tạo (?action=chuongTrinh) và Tổ hợp xét tuyển (?action=toHopXetTuyen).',
      });
      return;
    }

    setUniApiState('loading');
    setUniApiErrorMessage('');
    setUniApiErrorObj(null);
    setUniDuplicateWarning('');
    setToHopTHPTLoading(true);
    setToHopTHPTError('');

    try {
      // Tải đồng thời danh mục Tỉnh thành, Trường ĐH, Ngành đào tạo, Tổ hợp xét tuyển và Tổ hợp môn THPT
      const [provinces, universities, programs, toHopXetTuyenData, toHopTHPTData] = await Promise.all([
        fetchUniversityApi<TinhThanhItem>('tinhThanh', {}, url).catch((err) => {
          console.warn('Lỗi tải tinhThanh:', err);
          return [] as TinhThanhItem[];
        }),
        fetchUniversityApi<TruongDHItem>('truongDH', {}, url).catch((err) => {
          console.warn('Lỗi tải truongDH:', err);
          return [] as TruongDHItem[];
        }),
        fetchUniversityApi<ChuongTrinhItem>('chuongTrinh', {}, url).catch((err) => {
          console.warn('Lỗi tải chuongTrinh:', err);
          return [] as ChuongTrinhItem[];
        }),
        fetchUniversityApi<ToHopXetTuyenItem>('toHopXetTuyen', {}, url).catch((err) => {
          console.warn('Lỗi tải toHopXetTuyen:', err);
          return [] as ToHopXetTuyenItem[];
        }),
        fetchUniversityApi<ToHopTHPTItem>('toHopTHPT', {}, url).catch((err) => {
          console.warn('Lỗi tải toHopTHPT:', err);
          return [] as ToHopTHPTItem[];
        }),
      ]);

      if (toHopXetTuyenData && toHopXetTuyenData.length > 0) {
        setToHopList(toHopXetTuyenData);
      }
      if (toHopTHPTData && toHopTHPTData.length > 0) {
        setToHopTHPTList(toHopTHPTData);
      }
      setToHopTHPTLoading(false);

      if (provinces.length === 0 && universities.length === 0 && programs.length === 0) {
        setUniApiState('error');
        setUniApiErrorMessage('API không trả về dữ liệu danh mục Tuyển sinh Đại học.');
        setUniApiErrorObj({
          errorType: 'EMPTY_LIST',
          message: 'Không có dữ liệu Tuyển sinh Đại học',
          details: 'Các sheet DM_TINH_THANH, DM_TRUONG_DH, CHUONG_TRINH_DAO_TAO trong Google Sheets chưa có dữ liệu hoặc action chưa được định nghĩa.',
        });
        return;
      }

      setTinhThanhList(provinces);
      setTruongDHList(universities);

      // Loại bỏ bản ghi trùng lặp theo khóa duy nhất: MaTruongTuyenSinh + MaNganh
      const uniqueProgramsMap = new Map<string, ChuongTrinhItem>();
      programs.forEach((prog) => {
        const cleanSchool = (prog.maTruongDH || '').trim().toUpperCase();
        const cleanMajor = (prog.maNganh || prog.maChuongTrinh || '').trim().toUpperCase();
        const key = `${cleanSchool}_${cleanMajor}`;
        if (!uniqueProgramsMap.has(key)) {
          uniqueProgramsMap.set(key, { ...prog });
        } else {
          const existing = uniqueProgramsMap.get(key)!;
          if (prog.toHopXetTuyen && prog.toHopXetTuyen.length > 0) {
            existing.toHopXetTuyen = Array.from(new Set([...(existing.toHopXetTuyen || []), ...prog.toHopXetTuyen]));
          }
        }
      });
      setChuongTrinhList(Array.from(uniqueProgramsMap.values()));
      setUniApiState('idle');
      setUniApiErrorMessage('');
      setUniApiErrorObj(null);
    } catch (err: any) {
      setToHopTHPTLoading(false);
      setUniApiState('error');
      setUniApiErrorMessage(err.message || 'Lỗi tải dữ liệu Tuyển sinh Đại học từ Google Apps Script');
      setUniApiErrorObj(
        err && err.errorType
          ? (err as ApiFetchError)
          : {
              errorType: 'UNKNOWN',
              message: err.message || 'Lỗi kết nối API Google Apps Script',
            }
      );
    }
  };

  // Tự động tải dữ liệu Tuyển sinh Đại học khi học sinh chuyển sang Bước 3 hoặc Bước 4
  useEffect(() => {
    const url = getGoogleAppsScriptUrl() || customApiUrl;
    if ((currentStep === 3 || currentStep === 4) && url) {
      if (tinhThanhList.length === 0 && uniApiState === 'idle') {
        handleFetchUniversityData(url);
      } else {
        // Đảm bảo toHopList và toHopTHPTList luôn được nạp đầy đủ khi vào Bước 4
        if (currentStep === 4) {
          if (toHopList.length === 0) {
            fetchUniversityApi<ToHopXetTuyenItem>('toHopXetTuyen', {}, url)
              .then((data) => setToHopList(data))
              .catch(() => {});
          }
          if (toHopTHPTList.length === 0 && !toHopTHPTLoading) {
            setToHopTHPTLoading(true);
            fetchUniversityApi<ToHopTHPTItem>('toHopTHPT', {}, url)
              .then((data) => {
                setToHopTHPTList(data);
                setToHopTHPTLoading(false);
              })
              .catch((err) => {
                setToHopTHPTError(err.message || 'Không thể tải tổ hợp THPT');
                setToHopTHPTLoading(false);
              });
          }
        }
      }
    }
  }, [currentStep, tinhThanhList.length, uniApiState, toHopList.length, toHopTHPTList.length, toHopTHPTLoading, customApiUrl]);

  // Thêm nguyện vọng mới (tối đa 3)
  const handleAddWish = () => {
    if (universityWishes.length >= 3) return;
    const newOrder = universityWishes.length + 1;
    setUniversityWishes([
      ...universityWishes,
      {
        id: `wish_${Date.now()}`,
        order: newOrder,
        maTinh: '',
        tenTinh: '',
        maTruongDH: '',
        tenTruongDH: '',
        tenVietTat: '',
        maChuongTrinh: '',
        maNganh: '',
        tenNganh: '',
        toHopXetTuyen: [],
      },
    ]);
    setUniDuplicateWarning('');
  };

  // Xóa nguyện vọng
  const handleDeleteWish = (index: number) => {
    if (universityWishes.length <= 1) return;
    const next = universityWishes.filter((_, i) => i !== index);
    const reordered = next.map((w, idx) => ({ ...w, order: idx + 1 }));
    setUniversityWishes(reordered);
    setUniDuplicateWarning('');
  };

  // Thay đổi thứ tự: Di chuyển lên
  const handleMoveWishUp = (index: number) => {
    if (index <= 0) return;
    const next = [...universityWishes];
    const temp = next[index];
    next[index] = next[index - 1];
    next[index - 1] = temp;
    const reordered = next.map((w, idx) => ({ ...w, order: idx + 1 }));
    setUniversityWishes(reordered);
  };

  // Thay đổi thứ tự: Di chuyển xuống
  const handleMoveWishDown = (index: number) => {
    if (index >= universityWishes.length - 1) return;
    const next = [...universityWishes];
    const temp = next[index];
    next[index] = next[index + 1];
    next[index + 1] = temp;
    const reordered = next.map((w, idx) => ({ ...w, order: idx + 1 }));
    setUniversityWishes(reordered);
  };

  // Thay đổi Tỉnh/Thành phố: Xóa trường và ngành cũ trong thẻ đó
  const handleChangeProvince = (index: number, newMaTinh: string) => {
    const provinceObj = tinhThanhList.find(
      (p) =>
        p.maTinh.trim().toUpperCase() === newMaTinh.trim().toUpperCase() ||
        p.tenTinh.trim().toLowerCase() === newMaTinh.trim().toLowerCase()
    );
    setUniversityWishes((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        maTinh: newMaTinh,
        tenTinh: provinceObj ? provinceObj.tenTinh : newMaTinh,
        maTruongDH: '',
        tenTruongDH: '',
        tenVietTat: '',
        maChuongTrinh: '',
        maNganh: '',
        tenNganh: '',
        toHopXetTuyen: [],
      };
      return next;
    });
    setUniDuplicateWarning('');
  };

  // Thay đổi Trường đại học: Xóa ngành cũ trong thẻ đó
  const handleChangeUniversity = (index: number, newMaTruong: string) => {
    const uniObj = truongDHList.find(
      (u) => u.maTruongDH.trim().toUpperCase() === newMaTruong.trim().toUpperCase()
    );
    setUniversityWishes((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        maTruongDH: newMaTruong,
        tenTruongDH: uniObj ? uniObj.tenTruongDH : '',
        tenVietTat: uniObj ? uniObj.tenVietTat || uniObj.tenTruongDH : '',
        maChuongTrinh: '',
        maNganh: '',
        tenNganh: '',
        toHopXetTuyen: [],
      };
      return next;
    });
    setUniDuplicateWarning('');
  };

  // Xác định nguyên nhân cụ thể khi không tìm thấy ngành đào tạo (Yêu cầu 9)
  const getMajorEmptyReason = (selectedMaTruong: string, schoolName: string) => {
    if (uniApiState === 'loading') {
      return {
        type: 'loading',
        title: 'Đang tải danh mục ngành...',
        desc: 'Vui lòng chờ trong giây lát trong khi hệ thống chuẩn bị danh mục ngành đào tạo.',
        dropdownLabel: '-- Đang tải danh mục ngành... --',
      };
    }
    if (uniApiState === 'error' || chuongTrinhList.length === 0) {
      return {
        type: 'api_not_loaded',
        title: 'API chưa tải được danh mục ngành đào tạo',
        desc: 'Chưa tải được dữ liệu chương trình đào tạo từ Google Apps Script (action=chuongTrinh). Vui lòng kiểm tra kết nối mạng và bấm "Thử tải lại dữ liệu Đại học".',
        dropdownLabel: '-- API chưa tải được danh mục ngành --',
      };
    }

    const normalizedMa = (selectedMaTruong || '').trim().toUpperCase();

    // Kiểm tra nguyên nhân mã trường không khớp giữa 2 nguồn dữ liệu
    const schoolClean = schoolName
      .toLowerCase()
      .replace(/trường đại học|đại học|đh/g, '')
      .trim();

    const mismatchItem = chuongTrinhList.find((c) => {
      const cSchool = (c.tenTruong || c.rawItem?.TenTruong || '')
        .toLowerCase()
        .replace(/trường đại học|đại học|đh/g, '')
        .trim();
      return (
        cSchool.length > 3 &&
        (schoolClean.includes(cSchool) || cSchool.includes(schoolClean)) &&
        c.maTruongDH.trim().toUpperCase() !== normalizedMa
      );
    });

    if (mismatchItem) {
      return {
        type: 'code_mismatch',
        title: 'Mã trường không khớp giữa hai nguồn dữ liệu',
        desc: `Mã trường "${selectedMaTruong}" từ danh mục trường không khớp với mã trường "${mismatchItem.maTruongDH}" trong dữ liệu chương trình đào tạo (Trường: ${mismatchItem.tenTruong || schoolName}).`,
        dropdownLabel: `-- Mã trường không khớp (${selectedMaTruong} ≠ ${mismatchItem.maTruongDH}) --`,
      };
    }

    // Nguyên nhân chưa có dữ liệu chương trình đào tạo cho trường này
    return {
      type: 'no_data',
      title: 'Chưa có dữ liệu chương trình đào tạo cho trường này',
      desc: `Hiện chưa có dữ liệu chương trình đào tạo cho trường "${schoolName}" (Mã tuyển sinh: ${selectedMaTruong}) trong cơ sở dữ liệu API thực tế (${chuongTrinhList.length} chương trình).`,
      dropdownLabel: '-- Chưa có dữ liệu chương trình đào tạo cho trường này --',
    };
  };

  // Thay đổi Ngành đào tạo: Kiểm tra không cho trùng hoàn toàn cùng một trường và một ngành
  const handleChangeMajor = (index: number, newMaCT: string) => {
    if (!newMaCT) {
      setUniversityWishes((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          maChuongTrinh: '',
          maNganh: '',
          tenNganh: '',
          toHopXetTuyen: [],
        };
        return next;
      });
      return;
    }

    const normSchoolName = (s: string) =>
      s
        .toLowerCase()
        .replace(/^trường\s+/i, '')
        .replace(/đại học/g, 'đh')
        .replace(/[–—-]/g, '-')
        .replace(/\s+/g, ' ')
        .trim();

    const currentWish = universityWishes[index];
    const currentSchool = (currentWish.maTruongDH || '').trim().toUpperCase();
    const currentSchoolNorm = normSchoolName(currentWish.tenTruongDH || '');

    const programObj =
      chuongTrinhList.find((c) => {
        if (c.maChuongTrinh !== newMaCT) return false;
        const cSchool = (c.maTruongDH || '').trim().toUpperCase();
        const cSchoolNorm = normSchoolName(c.tenTruong || c.rawItem?.TenTruong || '');
        if (currentSchool && cSchool === currentSchool) return true;
        if (currentSchoolNorm && cSchoolNorm && cSchoolNorm === currentSchoolNorm) return true;
        return false;
      }) || chuongTrinhList.find((c) => c.maChuongTrinh === newMaCT);

    const candidateMaNganh = (programObj ? programObj.maNganh || programObj.maChuongTrinh : newMaCT).trim();
    const effectiveProgSchool = (programObj?.maTruongDH || currentSchool).trim().toUpperCase();

    // Kiểm tra trùng: không cho chọn trùng cùng một cặp mã trường và mã ngành
    const isDuplicate = universityWishes.some(
      (w, i) =>
        i !== index &&
        w.maTruongDH.trim().toUpperCase() === currentSchool &&
        (w.maChuongTrinh === newMaCT || (w.maNganh && w.maNganh.trim().toUpperCase() === candidateMaNganh.toUpperCase()))
    );

    if (isDuplicate) {
      const duplicateWishIndex = universityWishes.findIndex(
        (w, i) =>
          i !== index &&
          w.maTruongDH.trim().toUpperCase() === currentSchool &&
          (w.maChuongTrinh === newMaCT || (w.maNganh && w.maNganh.trim().toUpperCase() === candidateMaNganh.toUpperCase()))
      );
      setUniDuplicateWarning(
        `Không thể chọn: Bạn đã đăng ký ngành này tại ${currentWish.tenVietTat || currentWish.tenTruongDH} ở Nguyện vọng ${duplicateWishIndex + 1} rồi. Vui lòng chọn ngành khác hoặc chọn trường khác!`
      );
      return;
    }

    setUniDuplicateWarning('');

    // Truy vấn đầy đủ các tổ hợp xét tuyển liên quan đến đúng trường và ngành đó
    const targetMajorCode = candidateMaNganh.toUpperCase();
    const targetProgramCode = newMaCT.trim().toUpperCase();

    const matchedToHop = toHopList
      .filter((th) => {
        const thSchool = (th.maTruongDH || '').trim().toUpperCase();
        const thMajor = (th.maNganh || '').trim().toUpperCase();
        const thProg = (th.maChuongTrinh || '').trim().toUpperCase();

        if (thSchool && (thSchool === effectiveProgSchool || thSchool === currentSchool)) {
          if (thMajor && thMajor === targetMajorCode) return true;
          if (thProg && thProg === targetProgramCode) return true;
          if (programObj && th.tenNganh && programObj.tenNganh && th.tenNganh.trim().toLowerCase() === programObj.tenNganh.trim().toLowerCase()) return true;
        }
        return false;
      })
      .map((th) => {
        const subjects = [th.mon1, th.mon2, th.mon3].filter(Boolean).join(', ');
        const label = subjects ? `${th.maToHop} (${subjects})` : th.maToHop;
        return th.dieuKienGhiChu ? `${label} [${th.dieuKienGhiChu}]` : label;
      });

    let toHopCombos: string[] = [];
    if (matchedToHop.length > 0) {
      toHopCombos = Array.from(new Set(matchedToHop));
    } else if (programObj && programObj.toHopXetTuyen && programObj.toHopXetTuyen.length > 0) {
      toHopCombos = programObj.toHopXetTuyen;
    }

    setUniversityWishes((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        maChuongTrinh: newMaCT,
        maNganh: candidateMaNganh,
        tenNganh: programObj ? programObj.tenNganh : newMaCT,
        toHopXetTuyen: toHopCombos,
      };
      return next;
    });
  };

  // Tương thích ngược với Step 4
  const selectedMajors: MajorOption[] = useMemo(() => {
    return universityWishes
      .filter((w) => w.tenNganh && w.tenNganh.trim().length > 0)
      .map((w, idx) => ({
        id: w.maChuongTrinh || `wish_m_${idx}`,
        code: w.maNganh || 'N/A',
        name: `${w.tenNganh} – ${w.tenVietTat || w.tenTruongDH}`,
        group: w.tenTinh || 'Đại học',
        targetExamGroups: w.toHopXetTuyen && w.toHopXetTuyen.length > 0 ? w.toHopXetTuyen : ['A00', 'D01'],
        requiredHighSchoolSubjects: ['Toán', 'Tiếng Anh'],
        careerOutlook: `Định hướng nghề nghiệp theo ngành ${w.tenNganh} tại ${w.tenTruongDH}.`,
      }));
  }, [universityWishes]);

  // Step 4: Copy state
  const [copied, setCopied] = useState(false);

  // Step 4: Tổ hợp THPT học sinh lựa chọn (trong TOP 3)
  const [chosenCombinationCode, setChosenCombinationCode] = useState<string | null>(null);
  // Toggle mở rộng giải thích chi tiết cách tính điểm của từng tổ hợp
  const [expandedScoreCode, setExpandedScoreCode] = useState<string | null>(null);

  // Quản lý mã học sinh & mã phiếu tư vấn (đảm bảo luôn có giá trị hợp lệ cho phiên)
  const [fallbackIds] = useState(() => generateStudentSessionIds());
  const effectiveStudentId = sessionIds?.studentId || fallbackIds.studentId;
  const effectiveSlipId = sessionIds?.slipId || fallbackIds.slipId;

  // Trạng thái tự động lưu kết quả tư vấn vào CSDL 3 Sheet
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    'idle' | 'saving' | 'success' | 'not_configured' | 'failed' | 'skipped'
  >('idle');
  const [autoSaveMessage, setAutoSaveMessage] = useState<string>('');
  const hasSavedForSlipRef = useRef<string | null>(null);
  const lastSavedSignatureRef = useRef<string | null>(null);

  // Find dominant Holland categories
  const getDominantHolland = () => {
    if (hollandCalcResult.top3.length > 0) {
      const top = hollandCalcResult.top3[0];
      return {
        code: top.code,
        name: `${top.name} (${top.vietnameseName})`,
        score: top.normalizedScore,
        hollandCode: hollandCalcResult.hollandCode,
      };
    }
    const sorted = Object.entries(hollandRatings).sort((a, b) => b[1] - a[1]);
    const topCategoryCode = sorted[0][0];
    const categoryInfo = HOLLAND_QUESTIONS.find((q) => q.category === topCategoryCode);
    return {
      code: topCategoryCode,
      name: categoryInfo?.categoryName || 'Sở thích đa dạng',
      score: sorted[0][1],
      hollandCode: 'RIA',
    };
  };

  // =========================================================================
  // THUẬT TOÁN TƯ VẤN THỐNG KÊ TẦN SUẤT MÔN HỌC – ƯU TIÊN NGUYỆN VỌNG 1 (3–2–1)
  // =========================================================================
  const normalizeSubjectName = normalizeSubjectNameAlgo;
  const COMPULSORY_THPT_CORE = [...FREQ_COMPULSORY_THPT_CORE];

  // Lấy danh sách nguyện vọng đại học học sinh đã thực sự chọn (có tên ngành)
  const activeWishes = useMemo(() => {
    return universityWishes.filter((w) => Boolean(w.tenNganh && w.tenNganh.trim()));
  }, [universityWishes]);

  // Xác định mã trường THPT chuẩn (THPT001 đến THPT021) của trường học sinh đã chọn ở Bước 1
  const selectedSchoolCode = useMemo(() => {
    if (!selectedSchool && !currentSelectedTruong) return '';
    if (currentSelectedTruong?.MaTruongTHPT && currentSelectedTruong.MaTruongTHPT.startsWith('THPT')) {
      return currentSelectedTruong.MaTruongTHPT;
    }
    if (selectedSchool) {
      const match = toHopTHPTList.find(
        (t) =>
          t.maTruongTHPT.toLowerCase() === selectedSchool.id.toLowerCase() ||
          t.tenTruongTHPT.toLowerCase() === selectedSchool.name.toLowerCase() ||
          selectedSchool.name.toLowerCase().includes(t.tenTruongTHPT.toLowerCase()) ||
          t.tenTruongTHPT.toLowerCase().includes(selectedSchool.shortName.toLowerCase()) ||
          selectedSchool.shortName.toLowerCase().includes(t.tenTruongTHPT.toLowerCase())
      );
      if (match) return match.maTruongTHPT;
    }
    return currentSelectedTruong?.MaTruongTHPT || selectedSchool?.id || '';
  }, [currentSelectedTruong, selectedSchool, toHopTHPTList]);

  // Lọc dữ liệu tổ hợp môn THPT thực tế theo trường đã chọn từ sheet TO_HOP_THPT
  const schoolTHPTRecords = useMemo(() => {
    if (!selectedSchoolCode && !selectedSchool) return [];
    return toHopTHPTList.filter(
      (t) =>
        (selectedSchoolCode && t.maTruongTHPT.toLowerCase() === selectedSchoolCode.toLowerCase()) ||
        (selectedSchool?.shortName && t.tenTruongTHPT.toLowerCase().includes(selectedSchool.shortName.toLowerCase())) ||
        (selectedSchool?.name && t.tenTruongTHPT.toLowerCase().includes(selectedSchool.name.toLowerCase()))
    );
  }, [toHopTHPTList, selectedSchoolCode, selectedSchool]);

  // Lọc các bản ghi tổ hợp môn THPT thực tế đã có đầy đủ mã và đúng 4 môn lựa chọn (không tính môn bắt buộc hay chuyên đề)
  const validTHPTCombinations = useMemo(() => {
    return schoolTHPTRecords.filter((t) => {
      const hasCode = Boolean(t.maToHopTHPT && t.maToHopTHPT.trim());
      const electives =
        t.monLuaChon && t.monLuaChon.length > 0
          ? t.monLuaChon.filter((m) => Boolean(m && m.trim()))
          : [t.monLuaChon1, t.monLuaChon2, t.monLuaChon3, t.monLuaChon4].filter(
              (m): m is string => Boolean(m && m.trim())
            );
      return hasCode && electives.length >= 4;
    });
  }, [schoolTHPTRecords]);

  const dominantHollandCodeForAlgo = useMemo<RiasecKey>(() => {
    if (hollandCalcResult.top3.length > 0) {
      return hollandCalcResult.top3[0].code;
    }
    const sorted = Object.entries(hollandRatings).sort((a, b) => b[1] - a[1]);
    return (sorted[0]?.[0] as RiasecKey) || 'I';
  }, [hollandCalcResult.top3, hollandRatings]);

  // Chạy toàn bộ thuật toán Thống kê tần suất môn học ưu tiên NV1 (Bước 1 -> Bước 8)
  const frequencyConsultation = useMemo(() => {
    return runFrequencyConsultationAlgorithm({
      activeWishes,
      toHopList,
      validTHPTCombinations,
      favoriteSubjects,
      dominantHollandCode: dominantHollandCodeForAlgo,
    });
  }, [activeWishes, toHopList, validTHPTCombinations, favoriteSubjects, dominantHollandCodeForAlgo]);

  const wishesAnalysis = frequencyConsultation.wishesAnalysis;
  const evaluatedCombinations = frequencyConsultation.evaluatedTHPTCombinations;
  const top3Combinations = frequencyConsultation.top3THPTCombinations;

  // Tổ hợp THPT học sinh lựa chọn (duy nhất 01 tổ hợp trong TOP 3 đề xuất) - Không tự ý chọn trước, để học sinh tự nhấn nút chọn
  const activeChosenCombination = useMemo(() => {
    if (chosenCombinationCode && top3Combinations.length > 0) {
      const match = top3Combinations.find((e) => e.comb.maToHopTHPT === chosenCombinationCode);
      if (match) return match;
    }
    return null;
  }, [chosenCombinationCode, top3Combinations]);

  const activeChosenRank = useMemo(() => {
    if (!activeChosenCombination) return null;
    const idx = top3Combinations.findIndex((e) => e.comb.maToHopTHPT === activeChosenCombination.comb.maToHopTHPT);
    return idx >= 0 ? idx + 1 : null;
  }, [activeChosenCombination, top3Combinations]);

  // Nếu danh sách Top 3 thay đổi (do đổi trường hoặc đổi nguyện vọng) và mã đã chọn không còn nằm trong Top 3, đặt lại về chưa chọn
  useEffect(() => {
    if (chosenCombinationCode && top3Combinations.length > 0) {
      const stillInTop3 = top3Combinations.some((e) => e.comb.maToHopTHPT === chosenCombinationCode);
      if (!stillInTop3) {
        setChosenCombinationCode(null);
      }
    }
  }, [chosenCombinationCode, top3Combinations]);

  // Dữ liệu môn lựa chọn ưu tiên từ bảng tần suất (dùng cho trường hợp fallback nếu trường chưa cập nhật TO_HOP_THPT)
  const neededElectivesAnalysis = useMemo(() => {
    return frequencyConsultation.frequencyTable.map((row) => [
      row.subject,
      {
        count: row.diemUuTien,
        wishes: row.wishesAppearing,
        examCombos: row.combosAppearing,
      },
    ] as [string, { count: number; wishes: number[]; examCombos: string[] }]);
  }, [frequencyConsultation.frequencyTable]);

  // Đề xuất 3 cụm chuyên đề học tập định hướng nghề nghiệp
  const recommendedTopics = useMemo(() => {
    const topElectiveNames = neededElectivesAnalysis.map(([name]) => name);
    if (topElectiveNames.includes('Vật lí') || topElectiveNames.includes('Tin học')) {
      return [
        'Toán học nâng cao (Hình học không gian, Xác suất thống kê, Toán ứng dụng)',
        'Vật lí thực nghiệm & Thiết kế kỹ thuật',
        'Tin học thuật toán & Lập trình ứng dụng',
      ];
    }
    if (topElectiveNames.includes('Hóa học') && topElectiveNames.includes('Sinh học')) {
      return [
        'Hóa học hữu cơ & Ứng dụng hóa dược',
        'Sinh học phân tử & Công nghệ y sinh',
        'Toán học ứng dụng trong khoa học sự sống',
      ];
    }
    if (topElectiveNames.includes('Giáo dục kinh tế và pháp luật') || topElectiveNames.includes('Địa lí')) {
      return [
        'Toán tài chính & Xử lý số liệu thống kê',
        'Giáo dục KT&PL: Pháp luật doanh nghiệp & Thị trường tài chính',
        'Địa lí kinh tế - xã hội thế giới & Việt Nam',
      ];
    }
    return [
      'Toán học ứng dụng và mô hình hóa',
      'Ngữ văn & Nghệ thuật tư duy phản biện',
      'Chuyên đề định hướng nghề nghiệp theo nhóm ngành lựa chọn',
    ];
  }, [neededElectivesAnalysis]);

  // Tổng hợp tất cả các tổ hợp xét tuyển đã xác minh của các nguyện vọng
  const allVerifiedExamGroups = useMemo(() => {
    const set = new Set<string>();
    wishesAnalysis.forEach((wa) => {
      wa.allExamGroupCodes.forEach((code) => set.add(code));
    });
    return Array.from(set);
  }, [wishesAnalysis]);

  // 02 Môn thi tốt nghiệp dự kiến & đối chiếu nguyện vọng theo tổ hợp THPT đang chọn (hoặc Top 1 đề xuất)
  const recommendedGraduationElectives = useMemo(() => {
    const activeTargetComb = activeChosenCombination || evaluatedCombinations[0] || null;
    const activeEval = activeTargetComb
      ? activeTargetComb.bestExamPairInCombo
      : frequencyConsultation.projectedEvaluation;

    const wishesCount = wishesAnalysis.length;
    const isUsingChosenCombo = Boolean(activeChosenCombination);

    const satisfiedDesc = activeEval.breakdown
      .filter((b) => b.isSatisfied)
      .map(
        (b) =>
          `NV${b.order} (${b.majorName} – ${b.schoolName}) qua ${b.satisfiedCombos
            .map((c) => c.code)
            .filter(Boolean)
            .join(', ')}`
      )
      .join('; ');

    const unsatisfiedDesc = activeEval.breakdown
      .filter((b) => !b.isSatisfied)
      .map((b) => {
        const closest = b.partialCombos[0];
        return closest
          ? `NV${b.order} (${closest.code} thiếu ${closest.missing.join(', ')})`
          : `NV${b.order}`;
      })
      .join('; ');

    let rationale = frequencyConsultation.selectionReasonText;
    if (isUsingChosenCombo && activeTargetComb) {
      rationale = `Theo tổ hợp ${activeTargetComb.comb.maToHopTHPT} mà học sinh đã chọn, cặp 02 môn thi tốt nghiệp tự chọn tối ưu nhất là ${activeEval.sub1} + ${activeEval.sub2} (cùng Toán, Ngữ văn tạo thành 04 môn thi dự kiến; điểm trọng số nguyện vọng: ${activeEval.wishWeightScore}/${activeEval.maxPossibleWishWeightScore || activeEval.wishWeightScore}).`;
      if (satisfiedDesc) {
        rationale += ` Đáp ứng đầy đủ về môn học cho ${activeEval.satisfiedWishesCount}/${wishesCount} nguyện vọng: ${satisfiedDesc}.`;
      }
      if (unsatisfiedDesc) {
        rationale += ` Chưa đáp ứng đồng thời ở kỳ thi tốt nghiệp: ${unsatisfiedDesc}.`;
      }
      rationale += ` Lưu ý: Đây chỉ là đối chiếu môn học, không phải xác nhận đủ điều kiện trúng tuyển đại học.`;
    }

    let limitationNotice: string | null = frequencyConsultation.examPairLimitationNotice;
    if (isUsingChosenCombo && activeTargetComb) {
      if (wishesCount > 0 && !activeEval.allWishesSatisfied) {
        const satParts = activeEval.breakdown
          .filter((b) => b.isSatisfied)
          .map((b) => `NV${b.order} (${b.satisfiedCombos.map((c) => c.code).join(', ')})`);
        const unsatParts = activeEval.breakdown
          .filter((b) => !b.isSatisfied)
          .map((b) => {
            const bestP = b.partialCombos[0];
            if (!bestP) return `NV${b.order}`;
            return `NV${b.order} (${bestP.code} thiếu ${bestP.missing.join(', ')}${bestP.coveredByTHPTSubjects ? ' — có học ở THPT nhưng không thi đồng thời trong 2 môn tự chọn' : ''})`;
          });
        limitationNotice = `Giới hạn tổ hợp ${activeTargetComb.comb.maToHopTHPT}: Không có cặp 02 môn thi tự chọn nào trong tổ hợp này đáp ứng đồng thời cả ${wishesCount} nguyện vọng. Phương án tối ưu nhất là ${activeEval.sub1} + ${activeEval.sub2} (đạt ${satParts.length > 0 ? satParts.join('; ') : 'chưa đạt NV nào'}; chưa đáp ứng: ${unsatParts.join('; ')}).`;
      } else {
        limitationNotice = null;
      }
    }

    return {
      subject1: activeEval.sub1,
      subject2: activeEval.sub2,
      fourExamSubjects: activeEval.fourSubjects,
      satisfiedWishesCount: activeEval.satisfiedWishesCount,
      wishWeightScore: activeEval.wishWeightScore,
      maxPossibleWishWeightScore: activeEval.maxPossibleWishWeightScore,
      supportsNV1: activeEval.supportsNV1,
      supportsNV2: activeEval.supportsNV2,
      supportsNV3: activeEval.supportsNV3,
      allWishesSatisfied: activeEval.allWishesSatisfied,
      totalSatisfiedCombos: activeEval.totalSatisfiedCombos,
      wishesBreakdown: activeEval.breakdown,
      activeTargetComb,
      alternativePairs: frequencyConsultation.alternativePairs,
      tiedTopPairs: frequencyConsultation.tiedTopPairs,
      higherCoverageAlternatives: frequencyConsultation.higherCoverageAlternatives,
      rationale,
      limitationNotice,
      isFrequencyProjected: !isUsingChosenCombo,
      statusTag: activeEval.allWishesSatisfied ? 'FULL_MATCH' : 'PARTIAL_MATCH',
      statusBadgeText: activeEval.allWishesSatisfied
        ? `Đáp ứng đầy đủ về môn học ${activeEval.satisfiedWishesCount}/${wishesCount} nguyện vọng`
        : `Phương án tối ưu hiện có (đạt ${activeEval.satisfiedWishesCount}/${wishesCount} nguyện vọng)`,
    };
  }, [activeChosenCombination, evaluatedCombinations, frequencyConsultation, wishesAnalysis.length]);

  const currentChosenCombinationCode = activeChosenCombination?.comb.maToHopTHPT || '';
  const currentSaveSignature = `${effectiveSlipId}::${currentChosenCombinationCode}::${selectedSchoolCode}::${activeWishes.map((w) => w.maNganh).join(',')}`;

  // Tự động chuẩn bị và lưu (hoặc cập nhật theo cùng MaPhieu) kết quả tư vấn vào CSDL 3 Sheet (Google Sheets)
  const triggerAutoSaveConsultation = async (forceRetry: boolean = false) => {
    if (!consentSaveData) {
      setAutoSaveStatus('skipped');
      setAutoSaveMessage('Học sinh đã chọn không lưu thông tin cá nhân vào hệ thống máy chủ.');
      return;
    }

    const chosenCode = currentChosenCombinationCode.trim();
    const top3Codes = top3Combinations.map((c) => c.comb.maToHopTHPT).filter(Boolean);
    const saveSignature = currentSaveSignature;

    // Tránh gửi lặp nếu dữ liệu không thay đổi
    if (!forceRetry && lastSavedSignatureRef.current === saveSignature) {
      return;
    }

    const isUpdate = hasSavedForSlipRef.current === effectiveSlipId;

    setAutoSaveStatus('saving');
    setAutoSaveMessage(
      isUpdate
        ? 'Đang cập nhật tổ hợp môn lựa chọn theo mã phiếu tư vấn...'
        : 'Đang tự động chuẩn hóa và lưu kết quả tư vấn vào 3 sheet CSDL...'
    );

    try {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const thoiGianStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

      const dominant = getDominantHolland();
      const primaryWish = activeWishes[0] || universityWishes[0] || null;

      // 1. KET_QUA_TU_VAN - Chỉ lưu 01 mã tổ hợp học sinh lựa chọn cuối cùng (phân biệt rõ với Top 3 đề xuất)
      const ketQuaTuVan: KetQuaTuVanRecord = {
        MaPhieu: effectiveSlipId,
        ThoiGian: thoiGianStr,
        MaHocSinhAnDanh: effectiveStudentId,
        HoTenHocSinh: studentName.trim() || 'Học sinh ẩn danh',
        KhoiLop: '10',
        MaTruongTHPT: selectedSchool?.id || currentSelectedTruong?.MaTruongTHPT || '',
        MaTruongDH: primaryWish?.maTruongDH || '',
        MaNganh: primaryWish?.maNganh || '',
        TinhThanhDH: primaryWish?.tenTinh || '',
        HollandTop1: hollandCalcResult.top3[0]?.code || dominant.code,
        HollandTop2: hollandCalcResult.top3[1]?.code || '',
        HollandTop3: hollandCalcResult.top3[2]?.code || '',
        ToHopTHPTDeXuat1: chosenCode,
        ToHopTHPTDeXuat2: '',
        ToHopTHPTDaChon: chosenCode,
        Top3ToHopDeXuat: top3Codes.join(', '),
        MonThiTuChon1_DuKien: recommendedGraduationElectives.subject1 || '',
        MonThiTuChon2_DuKien: recommendedGraduationElectives.subject2 || '',
        GhiChuCanTuVan: `Đã phân tích ${activeWishes.length} nguyện vọng; Nhóm Holland: ${hollandCalcResult.hollandCode}; Top 3 đề xuất: ${top3Codes.join(', ') || 'Chưa có'}; Tổ hợp HS chọn: ${chosenCode || 'Chưa chọn'}; Đề xuất 2 môn thi tốt nghiệp: ${recommendedGraduationElectives.subject1} và ${recommendedGraduationElectives.subject2}.`,
        DongYLuuDuLieu: consentSaveData ? 'Có' : 'Không',
      };

      // 2. CHI_TIET_TU_VAN (Lưu đủ 6 nhóm Holland: R, I, A, S, E, C)
      const riasecKeys: RiasecKey[] = ['R', 'I', 'A', 'S', 'E', 'C'];
      const sortedByScore = hollandCalcResult.sortedScores || [];
      const rankMap = new Map<string, number>();
      sortedByScore.forEach((item, idx) => {
        rankMap.set(item.code, idx + 1);
      });

      const chiTietTuVan: ChiTietTuVanRecord[] = riasecKeys.map((code) => {
        const found = hollandCalcResult.scores[code];
        const score = found ? found.totalScore : 0;
        const pctStr = found ? found.formattedPercentage : '0%';
        const fitLevel = found ? found.fitLevel : 'THẤP';
        const rank = rankMap.get(code) || 6;
        const isTop3 = rank <= 3;
        const primaryCombo = primaryWish?.toHopXetTuyen?.[0] || 'A00';

        return {
          MaPhieu: effectiveSlipId,
          MaRIASEC: code,
          Diem: score,
          TyLe: pctStr,
          XepHang: rank,
          MaToHopXetTuyen: primaryCombo,
          MaToHopTHPT: chosenCode,
          SoMonTrungKhop: isTop3 ? 3 : 1,
          MonThieu: isTop3 ? '' : 'Xem chi tiết đề án tuyển sinh',
          DanhGiaPhuHop: `Mức ${fitLevel} (${score}/18 · ${pctStr})`,
          LyDoDeXuat: `Điểm ${score}/18 (${pctStr}, mức phù hợp ${fitLevel}), xếp hạng ${rank}/6 theo bài trắc nghiệm Holland RIASEC.`,
        };
      });

      // 3. NGUYEN_VONG_HOC_SINH (Tối đa 3 nguyện vọng thực tế)
      const nguyenVongHocSinh: NguyenVongHocSinhRecord[] = activeWishes.map((w, idx) => {
        const order = w.order || idx + 1;
        const examCombos = (w.toHopXetTuyen && w.toHopXetTuyen.length > 0)
          ? w.toHopXetTuyen.join(', ')
          : 'A00, D01';
        return {
          MaPhieu: effectiveSlipId,
          ThuTuNguyenVong: order,
          MaTruongTuyenSinh: w.maTruongDH || '',
          TenTruongDH: w.tenTruongDH || '',
          MaNganh: w.maNganh || '',
          TenNganh: w.tenNganh || '',
          MaToHopXetTuyen: examCombos,
          MaToHopTHPTDeXuat: chosenCode,
          DanhGiaPhuHop: chosenCode
            ? `Phù hợp với tổ hợp THPT đã chọn (${chosenCode}) tại ${selectedSchool?.shortName || selectedSchool?.name || 'trường THPT'}`
            : `Top 3 đề xuất: ${top3Codes.join(', ') || 'đang cập nhật'} (học sinh chưa chọn tổ hợp)`,
        };
      });

      const response = await sendConsultationSaveRequest({
        maPhieu: effectiveSlipId,
        maHocSinhAnDanh: effectiveStudentId,
        dongYLuuDuLieu: consentSaveData,
        isUpdate,
        upsertByMaPhieu: true,
        ketQuaTuVan,
        chiTietTuVan,
        nguyenVongHocSinh,
      });

      if (response.ok) {
        hasSavedForSlipRef.current = effectiveSlipId;
        lastSavedSignatureRef.current = saveSignature;
        setAutoSaveStatus('success');
        setAutoSaveMessage(`Đã tự động lưu thành công kết quả tư vấn vào CSDL (Mã phiếu: ${effectiveSlipId}).`);
      } else if (response.errorType === 'WRITE_ENDPOINT_NOT_CONFIGURED') {
        // Yêu cầu 11: Chuẩn bị đủ dữ liệu, báo rõ máy chủ đang chờ cấu hình endpoint an toàn, không giả mạo thành công
        setAutoSaveStatus('not_configured');
        setAutoSaveMessage(response.message || 'Dữ liệu đã sẵn sàng; máy chủ cần cấu hình GOOGLE_APPS_SCRIPT_WRITE_URL để kích hoạt lưu đám mây.');
      } else {
        setAutoSaveStatus('failed');
        setAutoSaveMessage(response.message || 'Không thể lưu tự động kết quả tư vấn.');
      }
    } catch (err: any) {
      console.error('Lỗi khi tự động lưu kết quả tư vấn:', err);
      setAutoSaveStatus('failed');
      setAutoSaveMessage(err?.message || 'Lỗi mạng hoặc dịch vụ máy chủ không phản hồi.');
    }
  };

  // Tự động kích hoạt lưu kết quả khi vào Bước 4, và tự động cập nhật theo cùng mã phiếu khi học sinh chọn / đổi tổ hợp
  useEffect(() => {
    if (currentStep !== 4 || !consentSaveData || toHopTHPTLoading) {
      return;
    }
    if (lastSavedSignatureRef.current === currentSaveSignature) {
      return;
    }
    const isInitialSave = hasSavedForSlipRef.current !== effectiveSlipId;
    const delayMs = isInitialSave ? 0 : 450;
    const timer = window.setTimeout(() => {
      triggerAutoSaveConsultation();
    }, delayMs);
    return () => window.clearTimeout(timer);
  }, [currentStep, effectiveSlipId, currentSaveSignature, consentSaveData, toHopTHPTLoading]);

  // Sao chép báo cáo tư vấn chi tiết vào Clipboard
  const handleCopySummary = () => {
    const dominant = getDominantHolland();
    const wishesBreakdownText = recommendedGraduationElectives.wishesBreakdown
      .map((wb) => {
        const satStr = wb.satisfiedCombos.length > 0
          ? wb.satisfiedCombos.map((c) => `${c.code} (${c.rawSubjects.join(', ')})`).join('; ')
          : 'Không có tổ hợp nào thỏa mãn 100%';
        const partStr = wb.partialCombos.length > 0
          ? wb.partialCombos.map((c) => `${c.code} (thiếu ${c.missing.join(', ')})`).join('; ')
          : 'Không có';

        return `• NV${wb.order}: ${wb.majorName} – ${wb.schoolName}
  - Đánh giá: ${wb.matchLabel}
  - Tổ hợp đáp ứng đầy đủ (100%): ${satStr}
  - Tổ hợp chưa đáp ứng đủ: ${partStr}`;
      })
      .join('\n\n');

    const freqTableText = frequencyConsultation.frequencyTable
      .map(
        (r, idx) =>
          `  ${idx + 1}. ${r.subject}: NV1=${r.tanSuatNV1} | NV2=${r.tanSuatNV2} | NV3=${r.tanSuatNV3} | Tổng=${r.tongTanSuat} | Điểm ưu tiên=${r.diemUuTien}`
      )
      .join('\n');

    const schoolDisplayName = selectedSchool?.shortName || selectedSchool?.name || 'TRƯỜNG THPT';

    let combSection = '';
    const displayComb = activeChosenCombination || top3Combinations[0];
    if (displayComb) {
      combSection = `TỔ HỢP THPT ${activeChosenCombination ? 'LỰA CHỌN' : 'ĐỀ XUẤT TOP 1'} TẠI ${schoolDisplayName}:
- Mã tổ hợp: ${displayComb.comb.maToHopTHPT}${activeChosenRank ? ` (Xếp hạng TOP ${activeChosenRank})` : ' (TOP 1)'}
- 4 Môn lựa chọn: ${displayComb.electives.join(', ')}
- 02 Môn lựa chọn bổ sung: ${displayComb.additionalElectives.join(', ') || 'Không có'}
- 3 Chuyên đề: ${displayComb.topics.join(' · ') || 'Theo phân công của trường'}
- Nguyện vọng đáp ứng đầy đủ (môn học THPT): ${displayComb.thptSupportedWishesOrders.map((o) => `NV${o}`).join(', ') || 'Chưa có'}
- Nguyện vọng chưa đáp ứng: ${displayComb.thptUnsatisfiedWishesOrders.map((o) => `NV${o}`).join(', ') || 'Không có'}
- Lý do xếp hạng: ${displayComb.rankingReason}`;
    } else {
      const top4Electives = neededElectivesAnalysis.slice(0, 4).map(([name]) => name).join(', ') || 'Đang cập nhật theo trường THPT';
      combSection = `KHUNG MÔN HỌC THPT CẦN THIẾT (Do trường chưa cập nhật tổ hợp trên sheet TO_HOP_THPT):
- Môn bắt buộc THPT: Toán, Ngữ văn, Tiếng Anh, Lịch sử
- 4 Môn lựa chọn khuyến nghị: ${top4Electives}
- 3 Cụm chuyên đề định hướng: ${recommendedTopics.join(', ')}`;
    }

    let top3RankingSection = '';
    if (top3Combinations.length > 0) {
      top3RankingSection = `\nBẢNG XẾP HẠNG TOP 3 TỔ HỢP THPT TẠI ${schoolDisplayName}:
` + top3Combinations.map((item, idx) => {
        const isChosenTag = item.comb.maToHopTHPT === activeChosenCombination?.comb.maToHopTHPT ? ' [ĐÃ CHỌN]' : '';
        return `• ${item.rankTierLabel || `TOP ${idx + 1}`}: ${item.comb.maToHopTHPT}${isChosenTag}\n  - 4 Môn lựa chọn: ${item.electives.join(', ')}\n  - 3 Chuyên đề: ${item.topics.join(' · ') || 'Theo phân công trường'}\n  - NV đáp ứng đầy đủ: ${item.thptSupportedWishesOrders.map(o => `NV${o}`).join(', ') || 'Chưa có'}\n  - NV chưa đáp ứng: ${item.thptUnsatisfiedWishesOrders.map(o => `NV${o}`).join(', ') || 'Không có'}\n  - Lý do xếp hạng: ${item.rankingReason}`;
      }).join('\n');
    }

    const text = `=====================================================
KẾT QUẢ TƯ VẤN HƯỚNG NGHIỆP & TỔ HỢP THPT – EDUGUIDE AI
=====================================================
Mã phiếu tư vấn: ${effectiveSlipId}
Mã học sinh: ${effectiveStudentId}
Học sinh: ${studentName || 'Học sinh'}
Trường THPT: ${selectedSchool?.name || 'Trường THPT đã chọn'}
Nhóm tính cách Holland RIASEC: ${dominant.name} (Mã: ${dominant.code})

BẢNG THỐNG KÊ THAM KHẢO MỨC ĐỘ XUẤT HIỆN MÔN HỌC (TRỌNG SỐ NV1=3, NV2=2, NV3=1):
${freqTableText || '  Chưa có dữ liệu thống kê.'}

NGUYỆN VỌNG ĐẠI HỌC & ĐỐI CHIẾU TỔ HỢP XÉT TUYỂN:
${wishesBreakdownText}

CƠ CẤU MÔN HỌC THPT:
- 4 Môn bắt buộc: Toán, Ngữ văn, Tiếng Anh, Lịch sử
${combSection}
${top3RankingSection}

ĐỀ XUẤT 04 MÔN THI TỐT NGHIỆP DỰ KIẾN:
- 2 Môn thi bắt buộc: Toán, Ngữ văn
- 02 Môn thi tự chọn dự kiến: ${recommendedGraduationElectives.subject1} và ${recommendedGraduationElectives.subject2}
- Trạng thái đối chiếu môn học: ${recommendedGraduationElectives.statusBadgeText}
(${recommendedGraduationElectives.rationale})

TỔ HỢP XÉT TUYỂN ĐẠI HỌC CẦN CHUẨN BỊ:
${allVerifiedExamGroups.join(', ') || 'Đang cập nhật'}

LƯU Ý QUY CHẾ THI & TUYỂN SINH:
- Phân biệt rõ: Môn học THPT (học liên tục 3 năm) khác với 4 môn thi tốt nghiệp THPT từ năm 2025 (Toán, Văn bắt buộc + 2 môn tự chọn) và khác với tổ hợp xét tuyển 3 môn của trường đại học.
- EduGuide AI không khẳng định học sinh chắc chắn trúng tuyển; học sinh cần theo dõi đề án tuyển sinh chính thức hằng năm của trường đại học.
=====================================================
✨ Chúc các em học tập thật tốt, chọn đúng tổ hợp môn học sở trường, vững bước trên hành trình THPT và tự tin chinh phục ước mơ đại học tương lai! 🎓
=====================================================
EduGuide AI – Hướng nghiệp thông minh cho học sinh THPT`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full bg-slate-50 min-h-[calc(100vh-4.5rem)] py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-5 sm:space-y-6">
        
        {/* ========================================================= */}
        {/* BƯỚC 1: CHỌN TRƯỜNG THPT */}
        {/* ========================================================= */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
            
            {/* Header: Greeting & Title as requested */}
            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-black text-slate-950">
                Chào {studentName ? studentName : 'bạn'}! Chọn trường THPT mà bạn trúng tuyển
              </h2>
              <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                Mỗi trường THPT xây dựng các tổ hợp môn lựa chọn và cụm chuyên đề khác nhau theo chương trình GDPT 2018. 
                Hãy chọn đúng ngôi trường bạn vừa trúng tuyển để EduGuide AI tra cứu chính xác danh mục tổ hợp thực tế.
              </p>
            </div>

            {/* Thanh trạng thái kết nối API được ẩn khỏi giao diện học sinh (chỉ hiện cảnh báo khi lỗi ở bên dưới) */}

            {/* Google Apps Script API Connection Modal / Expandable Box */}
            {showApiModal && (
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span>Cấu hình Web App Google Apps Script</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowApiModal(false)}
                    className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Hệ thống truy xuất qua API trung gian backend <code className="font-mono font-bold text-blue-700 bg-white px-1.5 py-0.5 rounded border border-blue-200">/api/truong-thpt</code> để tránh hoàn toàn lỗi chặn CORS của trình duyệt. 
                  Yêu cầu 5 trường dữ liệu: <code className="font-mono text-slate-800">MaTruongTHPT</code>,{' '}
                  <code className="font-mono text-slate-800">TenTruong</code>,{' '}
                  <code className="font-mono text-slate-800">DiaChi</code>,{' '}
                  <code className="font-mono text-slate-800">AnhTruong</code>,{' '}
                  <code className="font-mono text-slate-800">LogoTruong</code>.
                </p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={customApiUrl}
                    onChange={(e) => setCustomApiUrl(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/30 text-slate-900 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleFetchFromApi()}
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-xs"
                  >
                    Tải dữ liệu API
                  </button>
                </div>
              </div>
            )}

            {/* Error Message when API fails */}
            {apiState === 'error' && apiErrorObj?.errorType === 'AUTH_REQUIRED' ? (
              <div className="p-5 bg-amber-50/90 border border-amber-300 rounded-2xl space-y-3.5 text-xs text-amber-950">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm sm:text-base text-amber-950">
                        Yêu cầu xác thực tài khoản Google
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-[10px] uppercase">
                        Xác thực quyền
                      </span>
                    </div>
                    <p className="text-amber-900 leading-relaxed font-medium">
                      {apiErrorObj.message}
                    </p>
                    {apiErrorObj.details && (
                      <div className="mt-2 p-3 bg-white/85 rounded-xl border border-amber-200 text-slate-700 leading-relaxed space-y-1.5">
                        <strong className="font-semibold text-slate-900 block">
                          Cách khắc phục để kết nối trực tiếp:
                        </strong>
                        <p>{apiErrorObj.details}</p>
                        <p className="text-[11px] text-slate-500">
                          <strong>Gợi ý:</strong> Trong Google Apps Script &gt; <em>Deploy</em> &gt; <em>Manage deployments</em> &gt; chỉnh sửa mục <strong>"Who has access"</strong> thành <strong>"Anyone"</strong> để học sinh và ứng dụng có thể đọc dữ liệu mà không bị chặn xác thực tài khoản.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-amber-200/80">
                  <button
                    type="button"
                    onClick={() => handleFetchFromApi()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Thử lại kết nối</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleUseOfficialList}
                    className="px-3.5 py-2 font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Dùng dữ liệu 20 trường THPT Đà Nẵng
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowApiModal(true)}
                    className="px-3.5 py-2 font-semibold text-amber-800 bg-amber-100/70 border border-amber-300 rounded-xl hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    Cập nhật lại URL API
                  </button>
                  {apiErrorObj.loginUrl && (
                    <a
                      href={apiErrorObj.loginUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3.5 py-2 font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Mở trang đăng nhập Google</span>
                    </a>
                  )}
                </div>
              </div>
            ) : apiState === 'error' ? (
              <div className="p-4 sm:p-5 bg-red-50 border border-red-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5 text-red-800">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <strong className="font-bold text-sm text-red-950 block">
                      Tải dữ liệu API thất bại:
                    </strong>
                    <p className="font-medium text-red-800">{apiErrorMessage}</p>
                    {apiErrorObj?.details && (
                      <p className="text-slate-600 text-[11px] mt-1">{apiErrorObj.details}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                  <button
                    type="button"
                    onClick={() => handleFetchFromApi()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Thử lại</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleUseOfficialList}
                    className="px-3.5 py-2 font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Dùng dữ liệu chính thức
                  </button>
                </div>
              </div>
            ) : null}

            {/* Big Search Bar with Magnifying Glass */}
            <div className="relative w-full">
              <Search className="w-5 h-5 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Nhập tên trường THPT của bạn..."
                value={schoolSearchQuery}
                onChange={(e) => setSchoolSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 text-sm sm:text-base bg-slate-50/70 hover:bg-white border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-slate-950 font-medium placeholder:text-slate-600 transition-all shadow-2xs"
              />
              {schoolSearchQuery && (
                <button
                  type="button"
                  onClick={() => setSchoolSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900 p-1 text-sm font-bold cursor-pointer"
                  aria-label="Xóa tìm kiếm"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Search Match Info */}
            {schoolSearchQuery.trim() && (
              <div className="text-xs sm:text-sm text-slate-800 font-medium flex items-center justify-between">
                <span>
                  Tìm thấy <strong className="text-blue-800 font-bold">{filteredSchools.length}</strong> trường THPT phù hợp với từ khóa "{schoolSearchQuery}":
                </span>
                <button
                  type="button"
                  onClick={() => setSchoolSearchQuery('')}
                  className="text-blue-700 hover:underline font-bold cursor-pointer"
                >
                  Xem toàn bộ danh sách
                </button>
              </div>
            )}

            {/* Gợi ý chọn trường khi chưa chọn */}
            {!currentSelectedTruong && (
              <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl text-xs sm:text-sm text-blue-950 font-medium flex items-center gap-2.5 shadow-2xs">
                <Info className="w-4 h-4 text-blue-700 shrink-0" />
                <span>
                  <strong>Hướng dẫn:</strong> Vui lòng nhấn trực tiếp vào thẻ trường THPT bạn đã trúng tuyển bên dưới để bắt đầu tư vấn.
                </span>
              </div>
            )}

            {/* School Cards Grid (1 card on mobile, 3 cards on desktop) */}
            {displayedSchools.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {displayedSchools.map((school) => {
                  const isSelected = Boolean(
                    currentSelectedTruong &&
                      (currentSelectedTruong.MaTruongTHPT === school.MaTruongTHPT ||
                        (selectedSchool &&
                          selectedSchool.name.toLowerCase() === school.TenTruong.toLowerCase()))
                  );

                  const processedPhotoUrl = getGoogleDriveImageUrl(school.AnhTruong, 'w1200');
                  const isPhotoFailed = !!failedImages[school.MaTruongTHPT];
                  const hasPhoto = Boolean(processedPhotoUrl && !isPhotoFailed);

                  const processedLogoUrl = getGoogleDriveImageUrl(school.LogoTruong, 'w400');
                  const isLogoFailed = !!failedLogos[school.MaTruongTHPT];
                  const hasLogo = Boolean(processedLogoUrl && !isLogoFailed);

                  return (
                    <div
                      key={school.MaTruongTHPT}
                      onClick={() => handleSelectTruong(school)}
                      className={`group relative rounded-2xl border text-left cursor-pointer transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? 'border-2 border-blue-600 bg-blue-50/30 shadow-md ring-2 ring-blue-600/20'
                          : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md'
                      }`}
                    >
                      <div>
                        {/* 1. Ảnh trường lấy từ cột AnhTruong (tỷ lệ 16:9, kích thước w1200) */}
                        <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                          {hasPhoto ? (
                            <img
                              src={processedPhotoUrl}
                              alt={school.TenTruong}
                              referrerPolicy="no-referrer"
                              loading="lazy"
                              className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-300"
                              onError={() => {
                                console.warn(
                                  `[EduGuide AI] Lỗi tải ảnh trường ${school.TenTruong} (${school.MaTruongTHPT}):`,
                                  {
                                    original: school.AnhTruong,
                                    converted: processedPhotoUrl,
                                  }
                                );
                                setFailedImages((prev) => ({ ...prev, [school.MaTruongTHPT]: true }));
                              }}
                            />
                          ) : (
                            /* Ảnh nền mặc định có biểu tượng trường học nếu chưa có ảnh hoặc lỗi tải */
                            <div className="school-default-bg w-full h-full bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100 flex flex-col items-center justify-center text-blue-600/70 p-4 text-center">
                              <div className="w-12 h-12 rounded-2xl bg-white/80 shadow-xs flex items-center justify-center mb-1.5 border border-blue-100">
                                <Building2 className="w-6 h-6 text-blue-600" />
                              </div>
                              <span className="text-[11px] font-semibold text-blue-800/80">
                                Trường THPT tại TP. Đà Nẵng
                              </span>
                            </div>
                          )}

                          {/* 2. Logo trường lấy từ cột LogoTruong (kích thước w400), hiển thị nhỏ ở góc ảnh */}
                          <div className="absolute top-2.5 left-2.5 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/95 backdrop-blur-md p-1 shadow-md border border-white/80 flex items-center justify-center overflow-hidden shrink-0">
                            {hasLogo ? (
                              <img
                                src={processedLogoUrl}
                                alt={`Logo ${school.TenTruong}`}
                                referrerPolicy="no-referrer"
                                loading="lazy"
                                className="w-full h-full object-contain"
                                onError={() => {
                                  console.warn(
                                    `[EduGuide AI] Lỗi tải logo trường ${school.TenTruong} (${school.MaTruongTHPT}):`,
                                    {
                                      original: school.LogoTruong,
                                      converted: processedLogoUrl,
                                    }
                                  );
                                  setFailedLogos((prev) => ({ ...prev, [school.MaTruongTHPT]: true }));
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <SchoolIcon className="w-5 h-5 text-blue-600" />
                              </div>
                            )}
                          </div>

                          {/* Dấu tích chọn ở góc trên-phải ảnh */}
                          <div className="absolute top-2.5 right-2.5 z-10">
                            {isSelected ? (
                              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md ring-2 ring-white">
                                <Check className="w-4 h-4 stroke-[3]" />
                              </div>
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-slate-900/25 backdrop-blur-xs border border-white/70 group-hover:bg-slate-900/40 transition-colors" />
                            )}
                          </div>
                        </div>

                        {/* 3. Tên trường và Địa chỉ bên dưới ảnh */}
                        <div className="p-4 space-y-2">
                          <h3 className="text-base sm:text-[17px] font-extrabold text-slate-950 leading-snug line-clamp-2 min-h-[2.6rem] group-hover:text-blue-800 transition-colors">
                            {school.TenTruong}
                          </h3>

                          <div className="flex items-start gap-1.5 text-xs sm:text-[13px] text-slate-700 font-medium pt-1.5 border-t border-slate-100">
                            <MapPin className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
                            <span className="line-clamp-2 leading-relaxed">{school.DiaChi}</span>
                          </div>
                        </div>
                      </div>

                      {/* Trạng thái lựa chọn ở chân thẻ */}
                      <div className="px-4 pb-3.5 pt-0 flex items-center justify-between text-xs sm:text-[13px]">
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 font-extrabold text-blue-800">
                            <Check className="w-4 h-4 text-blue-700 stroke-[2.5]" />
                            <span>Đã chọn trường này</span>
                          </span>
                        ) : (
                          <span className="text-slate-700 group-hover:text-blue-700 transition-colors text-xs font-semibold">
                            Nhấn để chọn
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Zero search results */
              <div className="py-12 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <SchoolIcon className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-slate-700">
                  Không tìm thấy trường THPT nào phù hợp với từ khóa "{schoolSearchQuery}"
                </p>
                <p className="text-xs text-slate-500">
                  Hãy thử tìm bằng tên viết tắt (ví dụ: Phan Châu Trinh, Trần Phú, Hòa Vang...)
                </p>
                <button
                  type="button"
                  onClick={() => setSchoolSearchQuery('')}
                  className="mt-2 px-4 py-1.5 text-xs font-semibold text-blue-700 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 cursor-pointer"
                >
                  Xóa bộ lọc tìm kiếm
                </button>
              </div>
            )}

            {/* 'Xem tất cả 20 trường' / 'Thu gọn' Button (When not searching) */}
            {!schoolSearchQuery.trim() && filteredSchools.length > 6 && (
              <div className="flex justify-center pt-1">
                <button
                  type="button"
                  onClick={() => setShowAllSchools(!showAllSchools)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100/80 border border-blue-200 rounded-xl transition-all cursor-pointer shadow-2xs"
                >
                  {showAllSchools ? (
                    <>
                      <span>Thu gọn danh sách</span>
                      <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Xem tất cả {filteredSchools.length} trường</span>
                      <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Selected School Confirmation Section */}
            {currentSelectedTruong && (
              <div className="p-4 sm:p-5 bg-blue-50/80 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-white border border-blue-200 p-1 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                    {currentSelectedTruong.LogoTruong && !failedLogos[currentSelectedTruong.MaTruongTHPT] ? (
                      <img
                        src={getGoogleDriveImageUrl(currentSelectedTruong.LogoTruong, 'w400')}
                        alt={`Logo ${currentSelectedTruong.TenTruong}`}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        className="w-full h-full object-contain"
                        onError={() => {
                          setFailedLogos((prev) => ({ ...prev, [currentSelectedTruong.MaTruongTHPT]: true }));
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-600 rounded-lg flex items-center justify-center text-white">
                        <SchoolIcon className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-blue-800 uppercase tracking-wider block">
                      Trường THPT bạn đã chọn:
                    </span>
                    <h3 className="text-base sm:text-lg font-extrabold text-blue-950 mt-0.5 leading-snug">
                      {currentSelectedTruong.TenTruong}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-800 font-medium mt-0.5">
                      {currentSelectedTruong.DiaChi}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200">
                    <Check className="w-3.5 h-3.5" />
                    <span>Đã ghi nhận</span>
                  </span>
                </div>
              </div>
            )}

            {/* Step 1 Navigation Controls: 'Quay lại' & 'Tiếp tục' */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onNavigateHome}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại trang chủ</span>
              </button>

              <button
                type="button"
                disabled={!currentSelectedTruong}
                onClick={() => onStepChange(2)}
                className={`inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs ${
                  currentSelectedTruong
                    ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-blue-600/25 active:scale-[0.99]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                <span>Tiếp tục (Khám phá Holland)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* BƯỚC 2: KHÁM PHÁ HOLLAND RIASEC (108 CÂU HỎI TỪ SHEET HOLLAND_CAU_HOI) */}
        {/* ========================================================= */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-8">
            
            {/* Header: Title */}
            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-black text-slate-950">
                {studentName ? `${studentName} ơi! ` : ''}Khám phá sở thích nghề nghiệp Holland
              </h2>
              <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                Trắc nghiệm sở thích nghề nghiệp John Holland gồm 108 câu hỏi giúp bạn thấu hiểu xu hướng tính cách, 
                phong cách làm việc và môi trường học tập lý tưởng nhất.
              </p>
            </div>

            {/* Trạng thái đang tải câu hỏi chạy nền (ẩn thông báo kết nối khỏi giao diện học sinh; chỉ hiện khi xảy ra lỗi) */}

            {/* Thông báo lỗi khi không thể tải câu hỏi từ API (Không dùng dữ liệu giả để thay thế) */}
            {hollandApiState === 'error' && (
              <div className="space-y-3">
                {hollandApiErrorObj?.errorType === 'AUTH_REQUIRED' ? (
                  <div className="p-5 bg-amber-50 border border-amber-300 rounded-2xl space-y-3 text-xs text-amber-950">
                    <div className="flex items-start gap-3">
                      <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold text-sm block">Yêu cầu xác thực tài khoản Google:</strong>
                        <p className="mt-1">{hollandApiErrorMessage}</p>
                        <p className="text-slate-600 mt-1">
                          Vui lòng cài đặt quyền Web App trong Apps Script thành <strong>"Anyone" (Bất kỳ ai)</strong> hoặc đăng nhập tài khoản có quyền.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-amber-200">
                      <input
                        type="url"
                        placeholder="https://script.google.com/macros/s/.../exec"
                        value={customApiUrl}
                        onChange={(e) => setCustomApiUrl(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          handleFetchHollandQuestions(customApiUrl);
                          handleFetchHollandCareers(customApiUrl);
                        }}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs cursor-pointer whitespace-nowrap"
                      >
                        Thử tải lại câu hỏi
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 bg-red-50 border border-red-200 rounded-2xl space-y-3 text-xs text-red-950">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold text-sm block">Chưa kết nối được dữ liệu từ sheet BO_108_CAU_HOI:</strong>
                        <p className="mt-1 font-medium">{hollandApiErrorMessage}</p>
                        {hollandApiErrorObj?.details && (
                          <p className="text-slate-700 mt-1 text-[11px] leading-relaxed">{hollandApiErrorObj.details}</p>
                        )}
                        <p className="text-red-700 text-[11px] mt-2 italic font-semibold">
                          * Lưu ý: Hệ thống không sử dụng bộ câu hỏi cũ hoặc dữ liệu giả định. Cần cập nhật Google Apps Script hỗ trợ đọc sheet BO_108_CAU_HOI (action=holland hoặc action=bo108CauHoi).
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-red-200">
                      <input
                        type="url"
                        placeholder="https://script.google.com/macros/s/.../exec"
                        value={customApiUrl}
                        onChange={(e) => setCustomApiUrl(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-red-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          handleFetchHollandQuestions(customApiUrl);
                          handleFetchHollandCareers(customApiUrl);
                        }}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xs cursor-pointer whitespace-nowrap"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Thử tải lại</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* PHẦN 1: MÀN HÌNH GIỚI THIỆU KHẢO SÁT HOLLAND */}
            {/* ========================================================= */}
            {hollandStep === 'intro' && (
              <div className="max-w-4xl mx-auto space-y-6">

                {/* Khung hướng dẫn làm bài trắc nghiệm chuẩn phong cách VLU */}
                <div className="p-5 sm:p-6 bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-sky-50/80 border border-blue-200 rounded-2xl space-y-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <h4 className="text-sm sm:text-base font-extrabold text-blue-950">
                        Hướng dẫn làm bài trắc nghiệm sở thích nghề nghiệp Holland:
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        Hệ thống gồm <strong>108 câu hỏi</strong> được chia thành <strong>6 nhóm tính cách RIASEC</strong> đặc trưng.
                      </p>
                    </div>
                  </div>

                  {/* 3 bước thao tác dễ dàng chuẩn VLU */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
                    <div className="p-4 rounded-xl bg-white border border-blue-100 shadow-2xs space-y-2 text-xs">
                      <div className="flex items-center gap-2 font-bold text-blue-950 text-sm">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black">1</span>
                        <span>Đọc lướt 3 cột</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed text-xs">
                        Mỗi nhóm gồm 3 cột khoa học: <strong>Tôi là người...</strong>, <strong>Tôi có thể...</strong>, <strong>Tôi thích...</strong> để bạn đọc lướt nhanh.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-blue-100 shadow-2xs space-y-2 text-xs">
                      <div className="flex items-center gap-2 font-bold text-blue-950 text-sm">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black">2</span>
                        <span>Tích chọn (✓) câu phù hợp</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed text-xs">
                        <strong>Tick vào tất cả các ô mô tả bạn thấy đúng với mình</strong> (có thể tick hoặc bỏ tick nhiều lần, câu không phù hợp bạn để trống).
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-blue-100 shadow-2xs space-y-2 text-xs">
                      <div className="flex items-center gap-2 font-bold text-blue-950 text-sm">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black">3</span>
                        <span>Xem kết quả &amp; Mã Holland</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed text-xs">
                        Sau khi hoàn thành 6 nhóm, hệ thống tự động tổng hợp số câu bạn đã chọn để xếp hạng Top 3 nhóm nổi trội nhất và gợi ý tổ hợp môn.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-white/90 rounded-xl border border-blue-200 text-xs sm:text-sm text-blue-950 flex items-center gap-2.5">
                    <Info className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                      <strong>Mẹo làm bài:</strong> Hãy trả lời tự nhiên theo sở thích thực tế của bạn, không có đáp án đúng hay sai!
                    </span>
                  </div>
                </div>

                {/* Nút bắt đầu khám phá */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => onStepChange(1)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Quay lại Bước 1 (Chọn trường THPT)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (hollandQuestions.length === 0) {
                        handleFetchHollandQuestions();
                      }
                      setHollandStep('test');
                      setHollandGroupIndex(0);
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <span>Bắt đầu tích chọn sở thích (108 câu)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* PHẦN 2: GIAO DIỆN LÀM BÀI KHẢO SÁT CHUẨN VLU (3 CỘT KHOA HỌC: TÔI LÀ NGƯỜI, TÔI CÓ THỂ, TÔI THÍCH) */}
            {/* ========================================================= */}
            {hollandStep === 'test' && (
              <div ref={testContainerRef} className="max-w-6xl mx-auto space-y-6 scroll-mt-24">
                {(() => {
                  const currentGroupKey = RIASEC_ORDER[hollandGroupIndex];
                  const currentGroupInfo = RIASEC_INFO_MAP[currentGroupKey];
                  const currentGroupQuestions = questionsByGroup[currentGroupKey] || [];
                  const aspectQuestions = categorizeGroupQuestionsByAspect(currentGroupQuestions);

                  const groupTickedCount = currentGroupQuestions.filter(
                    (q) => hollandAnswers[q.id] === 1
                  ).length;
                  const isCurrentGroupAllTicked = currentGroupQuestions.length > 0 && groupTickedCount === currentGroupQuestions.length;

                  // Render một cột trong bố cục 3 cột khoa học với checkbox tích chọn gọn gàng
                  const renderAspectColumn = (
                    colTitle: string,
                    colSubtitle: string,
                    icon: React.ReactNode,
                    qList: HollandQuestionItem[],
                    accentColor: string,
                    headerBg: string
                  ) => {
                    const colTicked = qList.filter((q) => hollandAnswers[q.id] === 1).length;
                    const colAllTicked = qList.length > 0 && colTicked === qList.length;

                    return (
                      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between overflow-hidden">
                        {/* Tiêu đề cột & Thao tác nhanh */}
                        <div className={`p-4 border-b border-slate-100 ${headerBg}`}>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0 ${accentColor}`}>
                                {icon}
                              </div>
                              <div>
                                <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">
                                  {colTitle}
                                </h4>
                                <span className="text-[11px] text-slate-500 font-medium block">
                                  {colSubtitle}
                                </span>
                              </div>
                            </div>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border shadow-2xs shrink-0 ${
                              colTicked > 0
                                ? 'bg-blue-100 text-blue-900 border-blue-200'
                                : 'bg-white/90 text-slate-600 border-slate-200'
                            }`}>
                              {colTicked}/{qList.length} đã chọn
                            </span>
                          </div>

                          {/* Nút chọn nhanh cả cột */}
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-[11px]">
                            <span className="text-slate-500 text-[10px] font-medium">Thao tác nhanh cột:</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleSelectAllInColumn(qList)}
                                className="px-2.5 py-0.5 font-bold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 rounded-md shadow-2xs cursor-pointer transition-colors text-[11px]"
                                title="Tick chọn tất cả câu trong cột này"
                              >
                                Chọn tất cả
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeselectAllInColumn(qList)}
                                className="px-2.5 py-0.5 font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-md shadow-2xs cursor-pointer transition-colors text-[11px]"
                                title="Bỏ tick tất cả câu trong cột này"
                              >
                                Bỏ chọn
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Danh sách các câu hỏi trong cột - dạng thẻ tick chọn gọn cơ bản */}
                        <div className="p-3 sm:p-4 space-y-2.5 flex-1 bg-slate-50/40">
                          {qList.length > 0 ? (
                            qList.map((q) => {
                              const isTicked = hollandAnswers[q.id] === 1;

                              return (
                                <div
                                  key={q.id}
                                  onClick={() => handleToggleQuestionTick(q.id)}
                                  className={`p-3 sm:p-3.5 rounded-xl border transition-all duration-150 cursor-pointer select-none flex items-start gap-3 ${
                                    isTicked
                                      ? 'bg-blue-50/90 border-blue-500 shadow-xs ring-1 ring-blue-500/20 text-blue-950'
                                      : 'bg-white border-slate-200 hover:bg-slate-50/80 hover:border-slate-300 text-slate-800'
                                  }`}
                                >
                                  {/* Ô checkbox tích chọn: to, rõ ràng, dễ nhấn trên điện thoại và máy tính */}
                                  <div
                                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all duration-150 ${
                                      isTicked
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-2xs'
                                        : 'bg-white border-slate-300 hover:border-blue-400'
                                    }`}
                                  >
                                    {isTicked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                  </div>

                                  {/* Nội dung câu mô tả gọn cơ bản */}
                                  <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between gap-1">
                                      <span
                                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                          isTicked ? 'bg-blue-200/70 text-blue-900 font-bold' : 'bg-slate-100 text-slate-500'
                                        }`}
                                      >
                                        Câu {q.stt}
                                      </span>
                                      {isTicked && (
                                        <span className="text-[10px] font-bold text-blue-700 flex items-center gap-0.5">
                                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                                          <span>Đã chọn</span>
                                        </span>
                                      )}
                                    </div>
                                    <p
                                      className={`text-xs sm:text-[13px] leading-relaxed ${
                                        isTicked ? 'font-semibold text-blue-950' : 'font-medium text-slate-800'
                                      }`}
                                    >
                                      {q.content}
                                    </p>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="py-6 text-center text-xs text-slate-400">
                              Chưa có câu hỏi trong cột này
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  };

                  return (
                    <div className="bg-[#f8faff] sm:bg-slate-50/70 p-4 sm:p-7 rounded-3xl border border-slate-200/90 shadow-2xs space-y-6">
                      
                      {/* 1. Thanh tiến trình & Đếm số câu đã chọn trên toàn bộ 108 câu */}
                      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-900 font-extrabold text-xs sm:text-sm border border-blue-200 self-start sm:self-auto">
                            <CheckCircle2 className="w-4 h-4 text-blue-700" />
                            <span>Nhóm {hollandGroupIndex + 1}/6: {currentGroupKey}</span>
                          </span>

                          <span className="font-bold text-slate-800 self-end sm:self-auto">
                            Tổng đã chọn: <strong className="text-blue-800 text-sm sm:text-base">{totalTickedCount}</strong>/108 câu
                          </span>
                        </div>

                        {/* Thanh tiến trình theo 6 nhóm */}
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/70 p-0.5">
                          <div
                            className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 rounded-full transition-all duration-200"
                            style={{ width: `${groupProgressPercent}%` }}
                          />
                        </div>

                        {/* Tabs 6 nhóm RIASEC */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1 border-t border-slate-100">
                          {RIASEC_ORDER.map((key, idx) => {
                            const info = RIASEC_INFO_MAP[key];
                            const gQuestions = questionsByGroup[key] || [];
                            const gTicked = gQuestions.filter((q) => hollandAnswers[q.id] === 1).length;
                            const isActive = idx === hollandGroupIndex;

                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => handleGoToGroup(idx)}
                                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                  isActive
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-600/30'
                                    : gTicked > 0
                                    ? 'bg-blue-50/80 text-blue-950 border-blue-200 hover:bg-blue-100'
                                    : 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span className={`w-5 h-5 rounded-md text-xs font-black flex items-center justify-center ${
                                    isActive ? 'bg-white/20 text-white' : `${info.barColor} text-white`
                                  }`}>
                                    {key}
                                  </span>
                                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${
                                    isActive
                                      ? 'bg-white/25 text-white'
                                      : gTicked > 0
                                      ? 'bg-blue-200 text-blue-950'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}>
                                    {gTicked > 0 ? `${gTicked} câu` : `0/18`}
                                  </span>
                                </div>
                                <span className="text-xs font-bold mt-1 line-clamp-1 leading-tight">
                                  {(hollandCareerMap[key]?.tenNhomHolland || hollandCareerMap[key]?.tenTiengViet || info.vietnameseName).split(/[\/–-]/)[0].trim()}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 2. Tiêu đề nhóm hiện tại & Thao tác nhanh cho toàn nhóm */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-base text-white shadow-xs shrink-0 ${currentGroupInfo.barColor}`}>
                              {currentGroupKey}
                            </span>
                            <div>
                              <span className="text-xs sm:text-[13px] text-slate-700 font-semibold block">
                                18 câu mô tả (6 câu / khía cạnh)
                              </span>
                              <h3 className="text-base sm:text-lg font-black text-slate-950 leading-tight">
                                {hollandCareerMap[currentGroupKey]
                                  ? `${hollandCareerMap[currentGroupKey]?.tenTiengAnh ? `${hollandCareerMap[currentGroupKey]?.tenTiengAnh} – ` : ''}${hollandCareerMap[currentGroupKey]?.tenNhomHolland || hollandCareerMap[currentGroupKey]?.tenTiengViet}`
                                  : `${currentGroupInfo.name} (${currentGroupInfo.vietnameseName})`}
                              </h3>
                            </div>
                          </div>

                          {/* Nút thao tác nhanh cả 18 câu trong nhóm */}
                          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                            <button
                              type="button"
                              onClick={() => handleSelectAllInGroup(currentGroupKey)}
                              className="px-3 py-1.5 text-xs sm:text-[13px] font-bold text-blue-800 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 cursor-pointer transition-colors"
                            >
                              Chọn tất cả (18 câu)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeselectAllInGroup(currentGroupKey)}
                              className="px-3 py-1.5 text-xs sm:text-[13px] font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                            >
                              Bỏ chọn tất cả
                            </button>
                          </div>
                        </div>

                        {(hollandCareerMap[currentGroupKey]?.moTa || hollandCareerMap[currentGroupKey]?.dacDiemNoiBat) && (
                          <p className="text-[13px] sm:text-sm text-slate-800 font-medium leading-relaxed border-t border-slate-100 pt-2.5">
                            {hollandCareerMap[currentGroupKey]?.moTa || hollandCareerMap[currentGroupKey]?.dacDiemNoiBat}
                          </p>
                        )}
                      </div>

                      {/* 3. BỐ CỤC 3 CỘT KHOA HỌC CHUẨN VLU (TÔI LÀ NGƯỜI, TÔI CÓ THỂ, TÔI THÍCH) */}
                      {currentGroupQuestions.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
                          {/* Cột 1: "Tôi là người..." */}
                          {renderAspectColumn(
                            'Tôi là người...',
                            'Đặc điểm tính cách & phong cách cá nhân',
                            <User className="w-4 h-4" />,
                            aspectQuestions.person,
                            'bg-blue-600',
                            'bg-blue-50/50'
                          )}

                          {/* Cột 2: "Tôi có thể..." */}
                          {renderAspectColumn(
                            'Tôi có thể...',
                            'Năng lực, khả năng & kỹ năng thực tế',
                            <Award className="w-4 h-4" />,
                            aspectQuestions.ability,
                            'bg-indigo-600',
                            'bg-indigo-50/50'
                          )}

                          {/* Cột 3: "Tôi thích..." */}
                          {renderAspectColumn(
                            'Tôi thích...',
                            'Sở thích hoạt động & môi trường ưa thích',
                            <Heart className="w-4 h-4" />,
                            aspectQuestions.interest,
                            'bg-rose-500',
                            'bg-rose-50/50'
                          )}
                        </div>
                      ) : (
                        <div className="py-12 text-center bg-white border border-slate-200 rounded-2xl space-y-3">
                          <p className="text-sm font-bold text-slate-700">
                            Chưa có câu hỏi nào được tải từ API Google Apps Script.
                          </p>
                          <button
                            type="button"
                            onClick={() => handleFetchHollandQuestions()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                          >
                            Tải lại dữ liệu 108 câu hỏi
                          </button>
                        </div>
                      )}

                      {/* 4. Thanh điều hướng: Nhóm trước và Nhóm tiếp theo / Hoàn thành */}
                      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => setHollandStep('intro')}
                            className="px-3.5 py-2.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                          >
                            Về giới thiệu
                          </button>
                          <button
                            type="button"
                            disabled={hollandGroupIndex <= 0}
                            onClick={handlePrevGroup}
                            className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl border transition-colors ${
                              hollandGroupIndex <= 0
                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 cursor-pointer'
                            }`}
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Nhóm trước</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          {hollandGroupIndex < 5 ? (
                            <button
                              type="button"
                              onClick={handleNextGroup}
                              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer active:scale-[0.99] transition-all"
                            >
                              <span>Tiếp theo: Nhóm {RIASEC_INFO_MAP[RIASEC_ORDER[hollandGroupIndex + 1]].vietnameseName.split('/')[0].trim()}</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setHollandStep('result');
                                setTimeout(scrollToTestTop, 40);
                              }}
                              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 text-xs sm:text-sm font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer transition-all active:scale-[0.99]"
                            >
                              <CheckCheck className="w-4 h-4" />
                              <span>Hoàn thành &amp; Xem kết quả phân tích RIASEC</span>
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })()}
              </div>
            )}

            {/* ========================================================= */}
            {/* PHẦN 3: KẾT QUẢ TÍNH ĐIỂM & TOP 3 NHÓM RIASEC TINH GỌN */}
            {/* ========================================================= */}
            {hollandStep === 'result' && (
              <div className="max-w-4xl mx-auto space-y-4">

                {/* 1. Banner kết quả tinh gọn: Mã Holland & Tổng điểm toàn bài */}
                <div className="p-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white rounded-2xl shadow-sm border border-blue-400/30">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-100 text-[10px] font-bold uppercase tracking-wider border border-blue-400/30">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        <span>Kết quả trắc nghiệm sở thích Holland</span>
                      </span>
                      <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                        Mã Holland của {studentName ? studentName : 'bạn'}: <span className="text-amber-300">{hollandCalcResult.hollandCode}</span>
                      </h3>
                      <p className="text-xs text-blue-100 font-medium">
                        Tổng điểm toàn bài: <strong className="text-white">{hollandCalcResult.totalExamScore}/{hollandCalcResult.maxExamScore}</strong> câu đã chọn
                      </p>
                    </div>

                    {/* 3 huy hiệu Top 1-2-3 tinh gọn */}
                    <div className="flex items-center gap-1.5 p-1.5 bg-white/15 backdrop-blur-md rounded-xl border border-white/25 self-start sm:self-auto shrink-0">
                      {hollandCalcResult.top3.map((g, idx) => (
                        <div
                          key={g.code}
                          className="flex flex-col items-center justify-center px-2.5 py-1.5 rounded-lg bg-white text-slate-900 shadow-2xs min-w-[66px]"
                        >
                          <span className="text-lg font-black text-blue-700 leading-none">
                            {g.code}
                          </span>
                          <span className="text-[10px] font-bold text-slate-700 mt-0.5">
                            Top {idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Top 3 nhóm nổi trội & Ngành nghề gợi ý (từ sheet TRA_CUU_NGANH_NGHE) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-600" />
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                      Top 3 nhóm nổi trội &amp; Ngành nghề gợi ý
                    </h3>
                  </div>

                  {/* Trạng thái tải hoặc lỗi API TRA_CUU_NGANH_NGHE */}
                  {hollandCareerApiState === 'loading' && (
                    <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center gap-2.5 text-xs text-blue-900">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
                      <span>Đang tải dữ liệu nhóm nghề từ sheet TRA_CUU_NGANH_NGHE...</span>
                    </div>
                  )}

                  {hollandCareerApiState === 'error' && (
                    <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-start justify-between gap-3 text-xs text-amber-950">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <strong className="font-bold block">Chưa kết nối được API TRA_CUU_NGANH_NGHE:</strong>
                          <p>{hollandCareerErrorObj?.message}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleFetchHollandCareers()}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shrink-0 cursor-pointer"
                      >
                        Thử lại
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {hollandCalcResult.top3.map((g, idx) => {
                      const rankNum = idx + 1;
                      const info = RIASEC_INFO_MAP[g.code];
                      const lookup = hollandCareerMap[g.code];
                      const isTop1 = rankNum === 1;
                      const isTop2 = rankNum === 2;

                      return (
                        <div
                          key={g.code}
                          className={`p-3.5 rounded-2xl border transition-all shadow-2xs flex flex-col justify-between space-y-2.5 ${
                            isTop1
                              ? 'border-amber-300 bg-gradient-to-b from-amber-50/40 via-white to-white'
                              : isTop2
                              ? 'border-blue-200 bg-gradient-to-b from-blue-50/30 via-white to-white'
                              : 'border-slate-200 bg-white'
                          }`}
                        >
                          <div className="space-y-2.5">
                            {/* Hàng 1: Top & Số câu + Phần trăm */}
                            <div className="flex items-center justify-between gap-1.5">
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                                isTop1
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : isTop2
                                  ? 'bg-blue-100 text-blue-900 border-blue-300'
                                  : 'bg-purple-100 text-purple-900 border-purple-300'
                              }`}>
                                Top {rankNum}
                              </span>
                              <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                {g.totalScore}/18 câu ({g.formattedPercentage})
                              </span>
                            </div>

                              {/* Hàng 2: Tên nhóm */}
                              <div className="flex items-center gap-2">
                                <span className={`w-7 h-7 rounded-lg text-white font-black text-xs flex items-center justify-center shrink-0 ${info.barColor}`}>
                                  {lookup?.maRIASEC || g.code}
                                </span>
                                <div className="min-w-0">
                                  <h4 className="text-sm font-extrabold text-slate-900 leading-tight truncate">
                                    {lookup?.tenNhomHolland || lookup?.tenTiengViet || info.vietnameseName}
                                  </h4>
                                  <span className="text-[11px] font-medium text-slate-500 block truncate">
                                    {lookup?.tenTiengAnh || info.name}
                                  </span>
                                </div>
                              </div>

                              {lookup ? (
                                <>
                                  {/* Mô tả ngắn */}
                                  {(lookup.moTa || lookup.dacDiemNoiBat) && (
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                      {lookup.moTa || lookup.dacDiemNoiBat}
                                    </p>
                                  )}

                                  {/* Ngành nghề gợi ý: Rút gọn khoa học */}
                                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                                    <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-blue-900 uppercase tracking-wide">
                                      <Briefcase className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                      <span>Ngành nghề gợi ý:</span>
                                    </div>
                                    {lookup.nganhNgheList.length > 0 ? (
                                      <div className="flex flex-wrap gap-1.5">
                                        {lookup.nganhNgheList.map((career, cIdx) => (
                                          <span
                                            key={cIdx}
                                            className="px-2 py-1 rounded-lg bg-blue-50/90 border border-blue-200 font-semibold text-blue-950 text-[11px] leading-snug"
                                          >
                                            {career}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-[11px] text-slate-700 leading-relaxed">
                                        {lookup.nganhNgheGoiY || lookup.nganhNghePhuHop}
                                      </p>
                                    )}
                                  </div>
                                </>
                              ) : (
                                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                                  {hollandCareerApiState === 'loading'
                                    ? `Đang tải ngành nghề nhóm ${g.code}...`
                                    : `Chưa có dữ liệu TRA_CUU_NGANH_NGHE cho nhóm ${g.code}.`}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* 4. Thông báo kết quả mang tính chất tham khảo */}
                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-2.5 text-xs text-slate-700">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed text-[11px] sm:text-xs">
                    <strong>Thông báo tham khảo:</strong> Kết quả trắc nghiệm sở thích nghề nghiệp Holland mang tính chất tham khảo khoa học, giúp bạn khám phá thế mạnh bản thân; không phải là kết luận bắt buộc về nghề nghiệp tương lai.
                  </p>
                </div>

                {/* 5. BỔ SUNG SỞ THÍCH MÔN HỌC (TÙY CHỌN) */}
                <div className="p-4 sm:p-5 bg-white border border-indigo-100 rounded-2xl shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <BookmarkCheck className="w-4 h-4 text-indigo-600" />
                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                          Những môn học em yêu thích (Tùy chọn bổ sung)
                        </h3>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 mt-1">
                        Chọn các môn học mà bạn yêu thích ở cấp THCS để EduGuide AI kết hợp gợi ý tổ hợp môn lớp 10 phù hợp nhất.
                      </p>
                    </div>

                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200 self-start sm:self-auto">
                      Đã chọn: {favoriteSubjects.length} môn
                    </span>
                  </div>

                  {/* Lưới chọn môn học trong DM_MON_HOC gọn gàng */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
                    {DM_MON_HOC.map((sub) => {
                      const isFav = favoriteSubjects.includes(sub.name);
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => handleToggleFavoriteSubject(sub.name)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isFav
                              ? 'border-indigo-600 bg-indigo-50/80 shadow-2xs ring-1 ring-indigo-600/20'
                              : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="text-xs font-bold text-slate-900 leading-snug">
                              {sub.name}
                            </span>
                            {isFav ? (
                              <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium mt-0.5">
                            {sub.category}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-[10px] text-slate-400 italic">
                    * Lưu ý: Không yêu cầu nhập điểm lớp 9 và không sử dụng điểm lớp 9 để tự động loại trừ ngành nghề.
                  </p>
                </div>

                {/* 6. Điều hướng sau khi hoàn thành khảo sát Bước 2 */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setHollandAnswers({});
                        setHollandGroupIndex(0);
                        setHollandStep('test');
                        setTimeout(scrollToTestTop, 40);
                      }}
                      className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Làm lại khảo sát
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHollandGroupIndex(0);
                        setHollandStep('test');
                        setTimeout(scrollToTestTop, 40);
                      }}
                      className="px-3.5 py-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      Xem lại các câu đã chọn
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onStepChange(3)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <span>Tiếp tục: Chọn nguyện vọng đại học</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

          </div>
        )}

        {/* ========================================================= */}
        {/* CHỌN NGUYỆN VỌNG ĐẠI HỌC (1 ĐẾN 3 NGUYỆN VỌNG ĐỘC LẬP) */}
        {/* ========================================================= */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-6">
            
            {/* Tiêu đề */}
            <div className="p-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white rounded-2xl shadow-sm space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/30 backdrop-blur-md text-blue-200 text-xs font-bold uppercase tracking-wider border border-blue-400/30">
                    <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
                    <span>Định hướng tuyển sinh đại học</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    Chọn nguyện vọng đại học cho {studentName ? studentName : 'bạn'}
                  </h2>
                  <p className="text-xs text-blue-200">
                    Mỗi học sinh chọn từ 1 đến 3 nguyện vọng độc lập. Mỗi nguyện vọng có thể thuộc một tỉnh/thành phố, một trường đại học và một ngành đào tạo khác nhau.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <span className="px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-md text-white border border-white/20 text-xs font-bold">
                    Đang có: {universityWishes.length}/3 nguyện vọng
                  </span>
                </div>
              </div>
            </div>

            {/* Cảnh báo trùng ngành tại cùng một trường */}
            {uniDuplicateWarning && (
              <div className="p-3.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs flex items-start gap-2.5 shadow-2xs">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed font-medium">
                  <strong>Chú ý:</strong> {uniDuplicateWarning}
                </p>
              </div>
            )}

            {/* Trạng thái đang tải API được ẩn khỏi giao diện học sinh; chỉ hiện thông báo khi xảy ra lỗi */}

            {uniApiState === 'error' && (
              <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-300 text-amber-950 space-y-3">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Chưa tải được dữ liệu Tuyển sinh Đại học từ Google Apps Script</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  {uniApiErrorMessage || 'Hệ thống cần kết nối API với action=tinhThanh, truongDH và chuongTrinh từ Google Sheets.'}
                </p>
                {uniApiErrorObj?.details && (
                  <p className="text-[11px] text-amber-700 font-mono bg-white/60 p-2 rounded-lg border border-amber-200">
                    {uniApiErrorObj.details}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleFetchUniversityData()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Thử tải lại dữ liệu Đại học</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowApiModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span>Cấu hình URL API</span>
                  </button>
                </div>
              </div>
            )}

            {/* DANH SÁCH CÁC THẺ NGUYỆN VỌNG (NGUYỆN VỌNG 1, NGUYỆN VỌNG 2, NGUYỆN VỌNG 3) */}
            <div className="space-y-5">
              {universityWishes.map((wish, index) => {
                // Lọc danh sách trường đại học theo tỉnh/thành phố đã chọn
                const filteredUniversities = wish.maTinh
                  ? truongDHList.filter(
                      (u) =>
                        u.maTinh.trim().toUpperCase() === wish.maTinh.trim().toUpperCase() ||
                        u.tenTinh?.trim().toLowerCase() === wish.tenTinh.trim().toLowerCase() ||
                        u.maTinh.trim().toLowerCase() === wish.tenTinh.trim().toLowerCase()
                    )
                  : [];

                // Chuẩn hóa mã trường & tên trường đang chọn để chỉ hiển thị đúng các ngành của trường đó
                const currentSchoolCode = (wish.maTruongDH || '').trim().toUpperCase();
                const normUniTitle = (s: string) =>
                  s
                    .toLowerCase()
                    .replace(/^trường\s+/i, '')
                    .replace(/đại học/g, 'đh')
                    .replace(/[–—-]/g, '-')
                    .replace(/\s+/g, ' ')
                    .trim();
                const currentSchoolNorm = normUniTitle(wish.tenTruongDH || '');

                // 1. Chỉ lọc danh sách ngành thuộc đúng trường đang chọn từ Google Sheets
                const rawSchoolMajors = currentSchoolCode
                  ? chuongTrinhList.filter((c) => {
                      const cCode = (c.maTruongDH || '').trim().toUpperCase();
                      if (cCode && cCode === currentSchoolCode) return true;

                      const cSchool = (c.tenTruong || c.rawItem?.TenTruong || c.rawItem?.Truong || '').trim();
                      if (cSchool && currentSchoolNorm && normUniTitle(cSchool) === currentSchoolNorm) {
                        return true;
                      }
                      return false;
                    })
                  : [];

                // Trong cùng một trường đại học, mỗi mã ngành chỉ xuất hiện DUY NHẤT một lần
                const schoolMajorsMap = new Map<string, ChuongTrinhItem>();
                rawSchoolMajors.forEach((m) => {
                  const majorCode = (m.maNganh || m.maChuongTrinh || '').trim().toUpperCase();
                  if (majorCode && !schoolMajorsMap.has(majorCode)) {
                    schoolMajorsMap.set(majorCode, m);
                  }
                });
                const schoolMajors = Array.from(schoolMajorsMap.values());

                const isWishComplete = wish.maTinh && wish.maTruongDH && wish.tenNganh;

                return (
                  <div
                    key={wish.id}
                    className={`rounded-2xl border-2 transition-all shadow-xs overflow-hidden ${
                      index === 0
                        ? 'border-blue-300 bg-white'
                        : index === 1
                        ? 'border-indigo-300 bg-white'
                        : 'border-purple-300 bg-white'
                    }`}
                  >
                    {/* Header thẻ Nguyện vọng */}
                    <div className={`p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      index === 0
                        ? 'bg-blue-50/80 border-blue-100'
                        : index === 1
                        ? 'bg-indigo-50/80 border-indigo-100'
                        : 'bg-purple-50/80 border-purple-100'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <span className={`w-7 h-7 rounded-lg text-white font-black text-xs flex items-center justify-center shadow-2xs ${
                          index === 0 ? 'bg-blue-600' : index === 1 ? 'bg-indigo-600' : 'bg-purple-600'
                        }`}>
                          NV{index + 1}
                        </span>
                        <div>
                          <h3 className="text-sm sm:text-base font-extrabold text-slate-950 leading-tight">
                            Nguyện vọng {index + 1} {index === 0 ? '(Bắt buộc)' : '(Tùy chọn)'}
                          </h3>
                          <span className="text-xs sm:text-[13px] text-slate-700 font-semibold">
                            {isWishComplete ? (
                              <span className="text-emerald-800 font-bold flex items-center gap-1">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                <span>Đã chọn: {wish.tenNganh} – {wish.tenVietTat || wish.tenTruongDH}</span>
                              </span>
                            ) : (
                              'Chọn Tỉnh/Thành phố → Trường Đại học → Ngành đào tạo'
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Nút điều khiển thứ tự và xóa */}
                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        {/* Di chuyển lên */}
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveWishUp(index)}
                          className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                            index === 0
                              ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                              : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50 cursor-pointer shadow-2xs'
                          }`}
                          title="Di chuyển nguyện vọng lên trên"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                          <span className="text-xs hidden sm:inline">Lên</span>
                        </button>

                        {/* Di chuyển xuống */}
                        <button
                          type="button"
                          disabled={index === universityWishes.length - 1}
                          onClick={() => handleMoveWishDown(index)}
                          className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                            index === universityWishes.length - 1
                              ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                              : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50 cursor-pointer shadow-2xs'
                          }`}
                          title="Di chuyển nguyện vọng xuống dưới"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                          <span className="text-xs hidden sm:inline">Xuống</span>
                        </button>

                        {/* Xóa nguyện vọng */}
                        {universityWishes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteWish(index)}
                            className="p-1.5 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-red-700 font-semibold transition-colors cursor-pointer shadow-2xs flex items-center gap-1 text-xs"
                            title="Xóa nguyện vọng này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="text-xs hidden sm:inline">Xóa</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Nội dung 3 ô chọn liên kết */}
                    <div className="p-4 sm:p-5 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        
                        {/* Ô 1: Tỉnh / Thành phố */}
                        <div className="space-y-1.5">
                          <label
                            htmlFor={`select-province-${wish.id}`}
                            className="text-xs sm:text-sm font-extrabold text-slate-950 flex items-center gap-1.5"
                          >
                            <MapPin className="w-3.5 h-3.5 text-blue-700" />
                            <span>1. Tỉnh / Thành phố:</span>
                          </label>
                          <select
                            id={`select-province-${wish.id}`}
                            value={wish.maTinh}
                            onChange={(e) => handleChangeProvince(index, e.target.value)}
                            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                          >
                            <option value="">-- Chọn Tỉnh / Thành phố --</option>
                            {tinhThanhList.length > 0 ? (
                              tinhThanhList.map((t) => (
                                <option key={t.maTinh} value={t.maTinh}>
                                  {t.tenTinh}
                                </option>
                              ))
                            ) : (
                              <option disabled value="empty">
                                Chưa có dữ liệu tỉnh thành (action=tinhThanh)
                              </option>
                            )}
                          </select>
                          <span className="text-xs text-slate-700 font-medium block">
                            Đổi tỉnh sẽ làm mới trường và ngành đã chọn.
                          </span>
                        </div>

                        {/* Ô 2: Trường Đại học (Lọc theo Tỉnh/Thành phố) */}
                        <div className="space-y-1.5">
                          <label
                            htmlFor={`select-university-${wish.id}`}
                            className="text-xs sm:text-sm font-extrabold text-slate-950 flex items-center gap-1.5"
                          >
                            <Building2 className="w-3.5 h-3.5 text-blue-700" />
                            <span>2. Trường Đại học:</span>
                          </label>
                          <select
                            id={`select-university-${wish.id}`}
                            disabled={!wish.maTinh}
                            value={wish.maTruongDH}
                            onChange={(e) => handleChangeUniversity(index, e.target.value)}
                            className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/30 ${
                              !wish.maTinh
                                ? 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed'
                                : 'bg-white border-slate-300 text-slate-950'
                            }`}
                          >
                            <option value="">
                              {!wish.maTinh
                                ? '-- Vui lòng chọn Tỉnh trước --'
                                : filteredUniversities.length === 0
                                ? '-- Không có trường ĐH nào trong tỉnh này --'
                                : '-- Chọn Trường Đại học --'}
                            </option>
                            {filteredUniversities.map((u) => (
                              <option key={u.maTruongDH} value={u.maTruongDH}>
                                {u.tenVietTat && u.tenVietTat !== u.tenTruongDH
                                  ? `${u.tenTruongDH} (${u.tenVietTat})`
                                  : u.tenTruongDH}
                              </option>
                            ))}
                          </select>
                          <span className="text-xs text-slate-700 font-medium block">
                            Lọc chính xác các trường ĐH tại {wish.tenTinh || 'tỉnh đã chọn'}.
                          </span>
                        </div>

                        {/* Ô 3: Ngành đào tạo (CHỈ hiển thị đúng các ngành của Trường Đại học đã chọn) */}
                        <div className="space-y-1.5">
                          <label
                            htmlFor={`select-major-${wish.id}`}
                            className="text-xs sm:text-sm font-extrabold text-slate-950 flex items-center gap-1.5"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                            <span>3. Ngành đào tạo:</span>
                          </label>
                          <select
                            id={`select-major-${wish.id}`}
                            disabled={!wish.maTruongDH || schoolMajors.length === 0}
                            value={wish.maChuongTrinh}
                            onChange={(e) => handleChangeMajor(index, e.target.value)}
                            className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/30 ${
                              !wish.maTruongDH || schoolMajors.length === 0
                                ? 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed'
                                : 'bg-white border-slate-300 text-slate-950'
                            }`}
                          >
                            <option value="">
                              {!wish.maTruongDH
                                ? '-- Vui lòng chọn Trường trước --'
                                : chuongTrinhList.length === 0
                                ? '-- Chưa có dữ liệu ngành từ Google Sheets --'
                                : schoolMajors.length > 0
                                ? `-- Chọn Ngành đào tạo (${schoolMajors.length} ngành của trường) --`
                                : getMajorEmptyReason(wish.maTruongDH, wish.tenTruongDH).dropdownLabel}
                            </option>

                            {schoolMajors.map((c) => {
                              const candidateMa = (c.maNganh || c.maChuongTrinh || '').trim();
                              const isTakenInOtherWish = universityWishes.some(
                                (otherW, otherIdx) =>
                                  otherIdx !== index &&
                                  otherW.maTruongDH.trim().toUpperCase() === wish.maTruongDH.trim().toUpperCase() &&
                                  (otherW.maChuongTrinh === c.maChuongTrinh ||
                                    (otherW.maNganh && otherW.maNganh.trim().toUpperCase() === candidateMa.toUpperCase()))
                              );

                              return (
                                <option
                                  key={c.maChuongTrinh}
                                  value={c.maChuongTrinh}
                                  disabled={isTakenInOtherWish}
                                >
                                  {c.tenNganh}
                                  {c.maNganh && c.maNganh !== c.tenNganh ? ` (Mã ngành: ${c.maNganh})` : ''}
                                  {isTakenInOtherWish ? ' [Đã chọn ở NV khác]' : ''}
                                </option>
                              );
                            })}
                          </select>

                          {wish.maTruongDH && schoolMajors.length === 0 && (
                            <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-950 mt-1 flex items-center gap-1.5">
                              <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                              <span className="text-xs font-medium">
                                {getMajorEmptyReason(wish.maTruongDH, wish.tenTruongDH).desc}
                              </span>
                            </div>
                          )}

                          <span className="text-xs text-slate-700 font-medium block">
                            Chỉ hiển thị đúng các ngành đào tạo của trường đã chọn.
                          </span>
                        </div>

                      </div>

                      {/* Chi tiết tổ hợp xét tuyển thực tế từ dữ liệu API */}
                      {wish.tenNganh && (
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/90 text-xs sm:text-[13px] space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-blue-950 text-sm">
                                {wish.tenNganh}
                              </span>
                              {wish.maNganh && (
                                <span className="font-mono text-xs font-bold bg-white border border-slate-300 px-2 py-0.5 rounded text-slate-800">
                                  Mã: {wish.maNganh}
                                </span>
                              )}
                            </div>
                            <span className="text-slate-800 font-semibold text-xs">
                              Trường: <strong>{wish.tenTruongDH}</strong> ({wish.tenTinh})
                            </span>
                          </div>

                          {/* Tổ hợp xét tuyển thực tế */}
                          <div className="flex items-center flex-wrap gap-1.5 pt-1.5 border-t border-slate-200/70">
                            <span className="font-bold text-slate-900 text-xs">
                              Tổ hợp môn xét tuyển (Dữ liệu tuyển sinh):
                            </span>
                            {wish.toHopXetTuyen && wish.toHopXetTuyen.length > 0 ? (
                              wish.toHopXetTuyen.map((combo, cIdx) => (
                                <span
                                  key={cIdx}
                                  className="px-2.5 py-0.5 bg-blue-100 text-blue-950 border border-blue-300 rounded-md font-extrabold text-xs"
                                >
                                  {combo}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-700 italic text-xs font-medium">
                                Đang cập nhật từ hệ thống tuyển sinh (không tự suy diễn tổ hợp)
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Nút thêm nguyện vọng (Tối đa 3) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="text-xs sm:text-[13px] text-slate-800 font-semibold">
                * Mỗi học sinh có thể đăng ký tối đa <strong>3 nguyện vọng</strong> độc lập. Có thể thay đổi thứ tự ưu tiên bằng nút Lên/Xuống.
              </div>

              {universityWishes.length < 3 && (
                <button
                  type="button"
                  onClick={handleAddWish}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-bold text-blue-800 bg-blue-50 border border-blue-300 hover:bg-blue-100 rounded-xl transition-all cursor-pointer shadow-2xs self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Thêm nguyện vọng ({universityWishes.length}/3)</span>
                </button>
              )}
            </div>

            {/* BẢNG TỔNG HỢP DANH SÁCH NGUYỆN VỌNG ĐÃ LẬP */}
            <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-950 flex items-center gap-1.5">
                  <BookmarkCheck className="w-4 h-4 text-blue-700" />
                  <span>Danh sách thứ tự ưu tiên nguyện vọng đại học:</span>
                </h4>
                <span className="text-xs font-extrabold text-blue-800 bg-white px-2.5 py-0.5 rounded-md border border-slate-300">
                  {universityWishes.filter((w) => w.tenNganh).length}/{universityWishes.length} đã hoàn tất
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {universityWishes.map((w, idx) => (
                  <div
                    key={w.id}
                    className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs sm:text-[13px] shadow-2xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className={`w-6 h-6 rounded-md text-white text-[11px] font-black flex items-center justify-center shrink-0 ${
                        idx === 0 ? 'bg-blue-600' : idx === 1 ? 'bg-indigo-600' : 'bg-purple-600'
                      }`}>
                        NV{idx + 1}
                      </span>
                      <span className="text-xs text-slate-700 font-semibold truncate">
                        {w.tenTinh || 'Chưa chọn tỉnh'}
                      </span>
                    </div>

                    <div className="font-extrabold text-slate-950 text-sm leading-snug truncate">
                      {w.tenNganh || '(Chưa chọn ngành)'}
                    </div>

                    <div className="text-xs text-blue-900 font-bold truncate">
                      {w.tenVietTat || w.tenTruongDH || '(Chưa chọn trường)'}
                    </div>

                    {w.toHopXetTuyen && w.toHopXetTuyen.length > 0 && (
                      <div className="flex items-center flex-wrap gap-1 pt-1.5 border-t border-slate-100 text-xs">
                        <span className="text-slate-700 font-semibold">Tổ hợp:</span>
                        <span className="font-extrabold text-blue-800">
                          {w.toHopXetTuyen.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Điều hướng Bước 3 */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => onStepChange(2)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay lại Khám phá Holland (Bước 2)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const hasFilledWish1 = universityWishes[0]?.tenNganh && universityWishes[0]?.maTruongDH;
                  if (!hasFilledWish1) {
                    alert('Vui lòng hoàn thành ít nhất Nguyện vọng 1 (chọn Tỉnh, Trường và Ngành đào tạo) trước khi tiếp tục!');
                    return;
                  }
                  triggerAutoSaveConsultation();
                  onStepChange(4);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 text-xs sm:text-sm font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-[0.99] cursor-pointer"
              >
                <span>Xem kết quả tư vấn tổ hợp (Bước 4)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* ========================================================= */}
        {/* BƯỚC 4: XEM KẾT QUẢ TƯ VẤN (RÚT GỌN CƠ BẢN NHẤT) */}
        {/* ========================================================= */}
        {currentStep === 4 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3.5 sm:p-7 space-y-5 sm:space-y-6">
            
            {/* 1. Header tóm tắt hồ sơ (Gọn đẹp, súc tích, dễ nhìn trên điện thoại) */}
            <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-4 sm:p-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/15 backdrop-blur-md rounded-full text-[11px] sm:text-xs font-bold text-blue-100">
                  <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                  <span>Báo cáo kết quả tư vấn tổ hợp môn THPT</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-white leading-snug">
                  Hồ sơ tư vấn: {studentName || 'Học sinh'}
                </h2>
                <div className="text-xs sm:text-sm text-blue-100 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <span>Trường: <strong className="text-white font-extrabold">{selectedSchool?.shortName || (selectedSchool?.name ? selectedSchool.name.replace(/^Trường\s+/, '') : 'THPT đã chọn')}</strong></span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto shrink-0">
                <div className="bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-xl text-center border border-white/20">
                  <span className="text-[10px] text-blue-100 block font-semibold uppercase">Nhóm Holland</span>
                  <span className="text-base sm:text-lg font-black text-white">{getDominantHolland().code}</span>
                </div>
                <div className="bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-xl text-center border border-white/20">
                  <span className="text-[10px] text-blue-100 block font-semibold uppercase">Nguyện vọng</span>
                  <span className="text-base sm:text-lg font-black text-white">{activeWishes.length} NV</span>
                </div>
              </div>
            </div>

            {/* THÔNG BÁO TỰ ĐỘNG LƯU KẾT QUẢ TƯ VẤN: Ẩn hoàn toàn trạng thái đang lưu / lưu thành công khỏi giao diện học sinh; vẫn tự động lưu đầy đủ vào 3 Google Sheets và chỉ hiện cảnh báo + nút Thử lại nếu thất bại */}

            {autoSaveStatus === 'not_configured' && (
              <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950 shadow-2xs">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 font-extrabold text-[11px] uppercase tracking-wide">
                        Chưa kết nối lưu trữ
                      </span>
                      <strong className="text-amber-950 text-xs sm:text-sm font-bold">
                        Máy chủ chưa cấu hình liên kết Google Sheets
                      </strong>
                    </div>
                    <p className="text-[11px] text-amber-900/90 leading-relaxed">
                      Dữ liệu tư vấn đã được chuẩn bị đầy đủ cho 3 sheet (<code className="font-mono font-semibold">KET_QUA_TU_VAN</code>, <code className="font-mono font-semibold">CHI_TIET_TU_VAN</code>, <code className="font-mono font-semibold">NGUYEN_VONG_HOC_SINH</code>). Cần thiết lập biến môi trường <code className="font-mono font-bold">GOOGLE_APPS_SCRIPT_WRITE_URL</code> trên máy chủ để kích hoạt lưu tự động.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    lastSavedSignatureRef.current = null;
                    triggerAutoSaveConsultation(true);
                  }}
                  className="self-start sm:self-auto px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  Thử kết nối lại
                </button>
              </div>
            )}

            {autoSaveStatus === 'failed' && (
              <div className="p-4 bg-rose-50/90 border border-rose-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-950 shadow-2xs">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-200 text-rose-900 font-extrabold text-[11px] uppercase tracking-wide">
                        Chưa kết nối lưu trữ
                      </span>
                      <strong className="text-rose-950 text-xs sm:text-sm font-bold">
                        Không thể kết nối đến máy chủ lưu trữ ({autoSaveMessage})
                      </strong>
                    </div>
                    <p className="text-[11px] text-rose-900/90 leading-relaxed">
                      Dữ liệu chưa được gửi đến Google Sheets. Kết quả tư vấn trên màn hình của học sinh vẫn hiển thị bình thường 100%.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    lastSavedSignatureRef.current = null;
                    triggerAutoSaveConsultation(true);
                  }}
                  className="self-start sm:self-auto px-3.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  Thử lại
                </button>
              </div>
            )}



            {/* Cảnh báo nạp dữ liệu nếu đang tải */}
            {toHopTHPTLoading && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2.5 text-xs text-blue-800">
                <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                <span>Đang đồng bộ dữ liệu tổ hợp môn THPT và tổ hợp xét tuyển đại học...</span>
              </div>
            )}

              {/* 2. TỔ HỢP MÔN HỌC TẠI TRƯỜNG THPT (TINH GỌN, Ý CHÍNH, KHÔNG TRÙNG LẶP) */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-2.5 gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-950 flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-700 shrink-0" />
                    <span>Tổ hợp môn học tại trường {selectedSchool?.name || 'THPT'}</span>
                  </h3>
                  <p className="text-xs text-slate-700 font-medium mt-0.5">
                    Hệ thống đề xuất <strong>Top {Math.min(3, top3Combinations.length)}</strong> tổ hợp phù hợp ·{' '}
                    {activeChosenCombination ? (
                      <span className="text-blue-800 font-bold">
                        Tổ hợp học sinh lựa chọn: <span className="font-mono">{activeChosenCombination.comb.maToHopTHPT}</span>
                      </span>
                    ) : (
                      <span className="text-slate-700">
                        Vui lòng nhấn <strong>&ldquo;Chọn tổ hợp này&rdquo;</strong> để chốt duy nhất 01 tổ hợp lựa chọn.
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto shrink-0">
                  <span className="text-xs font-extrabold text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    TOP {Math.min(3, top3Combinations.length)} Tổ hợp đề xuất
                  </span>
                  {activeChosenCombination && (
                    <span className="text-xs font-extrabold text-white bg-blue-600 px-3 py-1 rounded-full shadow-2xs">
                      ✓ Đã chọn: {activeChosenCombination.comb.maToHopTHPT}
                    </span>
                  )}
                </div>
              </div>

              {/* Thông báo nếu trường THPT không có tổ hợp nào chứa đủ cả 2 môn thi dự kiến */}
              {frequencyConsultation.thptFallbackNotice && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs sm:text-[13px] text-amber-950 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <p className="leading-relaxed font-semibold">
                    {frequencyConsultation.thptFallbackNotice}
                  </p>
                </div>
              )}

              {top3Combinations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
                  {top3Combinations.map((item, idx) => {
                    const rank = idx + 1;
                    const isChosen = activeChosenCombination?.comb.maToHopTHPT === item.comb.maToHopTHPT;
                    const isRecommendedTop1 = idx === 0;
                    const tierShortLabel =
                      rank === 1
                        ? 'Top 1: Phù hợp nhất'
                        : rank === 2
                        ? 'Top 2: Thay thế'
                        : 'Top 3: Dự phòng';

                    return (
                      <div
                        key={item.comb.maToHopTHPT}
                        className={`rounded-2xl transition-all flex flex-col justify-between space-y-3.5 ${
                          isChosen
                            ? 'p-4 sm:p-5 border-2 border-blue-600 bg-gradient-to-b from-blue-100/75 via-indigo-50/45 to-white shadow-lg ring-2 ring-blue-500/25'
                            : isRecommendedTop1
                            ? 'p-4 sm:p-5 border-2 border-amber-400/90 bg-gradient-to-b from-amber-50/40 via-white to-white hover:border-amber-500 shadow-sm'
                            : 'p-4 sm:p-5 border border-slate-300 bg-white hover:border-slate-400 shadow-2xs'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Header thẻ gọn - Phân biệt rõ Đề xuất hệ thống vs Lựa chọn của học sinh */}
                          <div className="flex items-center justify-between gap-1.5 flex-wrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                                isChosen
                                  ? 'bg-blue-600 text-white shadow-2xs'
                                  : isRecommendedTop1
                                  ? 'bg-amber-200/90 text-amber-950 border border-amber-300'
                                  : 'bg-slate-200 text-slate-900 border border-slate-300'
                              }`}>
                                {tierShortLabel}
                              </span>
                              <span className={`font-mono font-extrabold text-xs px-2.5 py-1 rounded-lg border ${
                                isChosen
                                  ? 'bg-indigo-700 text-white border-indigo-700 shadow-2xs'
                                  : 'bg-slate-100 text-slate-900 border-slate-300'
                              }`}>
                                {item.comb.maToHopTHPT}
                              </span>
                            </div>

                            {isChosen ? (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-blue-600 text-white shadow-2xs flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                <span>Học sinh chọn</span>
                              </span>
                            ) : isRecommendedTop1 ? (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-300/90 text-amber-950 border border-amber-400 shadow-2xs">
                                ★ Đề xuất nổi bật
                              </span>
                            ) : null}
                          </div>

                          {/* 4 môn học lựa chọn */}
                          <div className={`p-3 rounded-xl border space-y-2 ${
                            isChosen ? 'bg-blue-50/90 border-blue-300' : 'bg-slate-50 border-slate-200'
                          }`}>
                            <span className="text-[11px] font-black uppercase tracking-wider text-blue-950 flex items-center gap-1">
                              <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                              <span>4 Môn học lựa chọn (10–12)</span>
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                              {item.electives.map((e, i) => (
                                <div
                                  key={i}
                                  className={`px-2 py-2 rounded-lg text-xs sm:text-[13px] font-extrabold text-center flex items-center justify-center gap-1 leading-tight ${
                                    isChosen
                                      ? 'bg-blue-600 text-white shadow-xs'
                                      : 'bg-white text-slate-950 border border-slate-300'
                                  }`}
                                >
                                  <Check className={`w-3.5 h-3.5 shrink-0 ${isChosen ? 'text-blue-100' : 'text-blue-700'}`} />
                                  <span className="break-words">{e}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Chuyên đề học tập */}
                          <div className="text-xs sm:text-[13px] text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2">
                            <span className="font-extrabold text-slate-800 shrink-0">• Chuyên đề:</span>
                            <span className="font-semibold text-slate-900 sm:text-right leading-relaxed">
                              {item.topics.length > 0 ? item.topics.join(' · ') : 'Theo phân công trường'}
                            </span>
                          </div>

                        </div>

                        {/* Nút chọn tổ hợp (chỉ chọn duy nhất 01 tổ hợp, thao tác chạm dễ dàng trên điện thoại) */}
                        <button
                          type="button"
                          onClick={() => {
                            if (!isChosen) {
                              setChosenCombinationCode(item.comb.maToHopTHPT);
                            }
                          }}
                          className={`w-full min-h-[44px] py-2.5 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer ${
                            isChosen
                              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                              : 'bg-white hover:bg-blue-50 text-slate-900 border-2 border-slate-300 hover:border-blue-500'
                          }`}
                        >
                          {!isChosen && <Check className="w-4 h-4 text-slate-700" />}
                          <span>{isChosen ? '✓ Đã chọn' : 'Chọn tổ hợp này'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-xs sm:text-sm text-amber-950 space-y-1">
                  <strong>Trường {selectedSchool?.name || 'của bạn'} chưa cập nhật danh sách tổ hợp trên hệ thống.</strong>
                  <p className="text-xs text-amber-900 font-medium">
                    Bạn nên ưu tiên chọn tổ hợp chứa 02 môn thi dự kiến (<strong>{frequencyConsultation.projectedPair.join(', ')}</strong>) và các môn: <strong>{frequencyConsultation.nextPriorityCandidates.slice(0, 3).map((r) => r.subject).join(', ')}</strong>.
                  </p>
                </div>
              )}
            </div>

            {/* 3. KHUNG TỔNG HỢP CỐT LÕI (3 CỘT GỌN GÀNG, NỔI BẬT TRÊN ĐIỆN THOẠI) */}
            <div className="p-3.5 sm:p-5 bg-gradient-to-br from-blue-50/80 via-indigo-50/45 to-white border-2 border-blue-600 rounded-2xl shadow-xs space-y-3.5">
              <div className="border-b border-blue-200/70 pb-2.5">
                <h3 className="text-base sm:text-lg font-black text-blue-950 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block shrink-0"></span>
                  <span>Tổng hợp cơ cấu môn học THPT &amp; 04 môn thi tốt nghiệp dự kiến</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-3.5">
                {/* 1. Môn học bắt buộc */}
                <div className="p-3.5 sm:p-4 bg-white rounded-xl border border-emerald-300 shadow-2xs space-y-2.5 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0">1</span>
                      <strong className="text-xs sm:text-[13px] font-black text-emerald-950 uppercase">Môn bắt buộc (4 môn):</strong>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {COMPULSORY_THPT_CORE.map((sub, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-950 font-bold text-xs">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-emerald-100 text-xs text-emerald-950 font-semibold">
                    Toán &amp; Ngữ văn là 2 môn thi tốt nghiệp bắt buộc.
                  </div>
                </div>

                {/* 2. Môn tư vấn lựa chọn & 2 môn bổ sung */}
                <div className="p-3.5 sm:p-4 bg-white rounded-xl border-2 border-blue-400 shadow-2xs space-y-2.5 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1.5 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0">2</span>
                        <strong className="text-xs sm:text-[13px] font-black text-blue-950 uppercase">
                          4 Môn lựa chọn {activeChosenCombination ? '(Đã chọn)' : '(Đề xuất TOP 1)'}:
                        </strong>
                      </div>
                      {(activeChosenCombination || top3Combinations[0]) && (
                        <span className="text-[11px] font-mono font-extrabold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-300">
                          {(activeChosenCombination || top3Combinations[0]).comb.maToHopTHPT}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {((activeChosenCombination || top3Combinations[0])
                        ? (activeChosenCombination || top3Combinations[0]).electives
                        : neededElectivesAnalysis.slice(0, 4).map(([name]) => name)
                      ).map((sub, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-md bg-blue-50 border border-blue-300 text-blue-950 font-bold text-xs">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-blue-100 text-xs text-blue-950 font-semibold leading-relaxed">
                    <strong>Chuyên đề:</strong>{' '}
                    {(activeChosenCombination || top3Combinations[0])?.topics.length
                      ? (activeChosenCombination || top3Combinations[0]).topics.join(' · ')
                      : recommendedTopics.join(' · ') || 'Theo phân công trường'}
                  </div>
                </div>

                {/* 3. 04 Môn thi tốt nghiệp THPT dự kiến (2 bắt buộc + 2 tự chọn) */}
                <div className="p-3.5 sm:p-4 bg-gradient-to-br from-indigo-50/90 to-purple-50/85 rounded-xl border-2 border-indigo-500 shadow-xs space-y-2.5 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0">3</span>
                      <strong className="text-xs sm:text-[13px] font-black text-indigo-950 uppercase">04 Môn thi tốt nghiệp dự kiến:</strong>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap text-xs font-bold text-indigo-950">
                      <span className="px-2.5 py-1 rounded-md bg-white/95 border border-indigo-200">Bắt buộc: Toán</span>
                      <span className="px-2.5 py-1 rounded-md bg-white/95 border border-indigo-200">Bắt buộc: Ngữ văn</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                      <div className="p-2.5 bg-white rounded-lg border-2 border-indigo-400 text-center shadow-2xs">
                        <span className="text-[11px] font-extrabold text-indigo-800 uppercase block">Tự chọn 1</span>
                        <span className="text-sm sm:text-base font-black text-indigo-950 leading-tight block mt-0.5">{recommendedGraduationElectives.subject1}</span>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border-2 border-indigo-400 text-center shadow-2xs">
                        <span className="text-[11px] font-extrabold text-indigo-800 uppercase block">Tự chọn 2</span>
                        <span className="text-sm sm:text-base font-black text-indigo-950 leading-tight block mt-0.5">{recommendedGraduationElectives.subject2}</span>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`pt-2 border-t border-indigo-200 text-xs font-extrabold leading-snug ${
                      recommendedGraduationElectives.allWishesSatisfied ? 'text-emerald-900' : 'text-amber-900'
                    }`}
                  >
                    {recommendedGraduationElectives.allWishesSatisfied ? '✓ ' : '⚠️ '}
                    {recommendedGraduationElectives.statusBadgeText}
                  </div>
                </div>
              </div>

            </div>

            {/* 4. BẢNG ĐỐI CHIẾU CHO TỪNG NGUYỆN VỌNG ĐẠI HỌC */}
            <div className="space-y-3.5">
              <div className="border-b border-slate-200 pb-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-950 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-indigo-700 shrink-0" />
                    <span>Bảng đối chiếu tổ hợp xét tuyển theo từng nguyện vọng đại học</span>
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-700 mt-1 leading-relaxed">
                    Đối chiếu 04 môn thi dự kiến (<strong>Toán, Ngữ văn, {recommendedGraduationElectives.subject1}, {recommendedGraduationElectives.subject2}</strong>) với các tổ hợp xét tuyển trong CSDL · Chỉ là đối chiếu môn học, không phải xác nhận đủ điều kiện xét tuyển đại học.
                  </p>
                </div>
                <span
                  className={`text-xs font-extrabold px-3 py-1.5 rounded-full border self-start sm:self-auto shrink-0 ${
                    recommendedGraduationElectives.allWishesSatisfied
                      ? 'text-emerald-950 bg-emerald-50 border-emerald-300'
                      : 'text-amber-950 bg-amber-50 border-amber-300'
                  }`}
                >
                  {recommendedGraduationElectives.satisfiedWishesCount}/{activeWishes.length} NV đáp ứng đầy đủ
                </span>
              </div>

              {/* Bảng chi tiết đối chiếu (2 cột gọn đẹp, dễ đọc trên điện thoại) */}
              <div className="space-y-3">
                {recommendedGraduationElectives.wishesBreakdown.map((wb, bIdx) => {
                  const isNV1 = wb.order === 1;
                  const isFull = wb.matchLevel === 'FULL';
                  const isPartial = wb.matchLevel === 'PARTIAL';

                  return (
                    <div
                      key={wb.order || bIdx}
                      className={`p-3.5 sm:p-5 rounded-2xl border-2 transition-all space-y-3 shadow-2xs ${
                        isFull
                          ? isNV1
                            ? 'bg-emerald-50/55 border-emerald-400 ring-2 ring-emerald-500/15'
                            : 'bg-white border-emerald-300'
                          : isPartial
                          ? 'bg-amber-50/40 border-amber-300'
                          : 'bg-rose-50/30 border-rose-300'
                      }`}
                    >
                      {/* Tiêu đề nguyện vọng & mức độ phù hợp */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b pb-2.5 border-slate-200/80">
                        <div className="flex items-start sm:items-center gap-2.5">
                          <span className={`w-8 h-8 rounded-lg text-white font-black text-xs flex items-center justify-center shrink-0 ${
                            isNV1 ? 'bg-blue-600' : wb.order === 2 ? 'bg-indigo-600' : 'bg-purple-600'
                          }`}>
                            NV{wb.order}
                          </span>
                          <div className="min-w-0">
                            <h4 className="text-sm sm:text-base font-black text-slate-950 leading-snug">
                              {wb.majorName}
                            </h4>
                            <span className="text-xs font-bold text-blue-800 block mt-0.5">
                              {wb.schoolName}
                            </span>
                          </div>
                        </div>

                        {/* Badge Mức độ phù hợp */}
                        <div className="self-start sm:self-auto shrink-0">
                          {isFull ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-950 border border-emerald-300 shadow-2xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                              <span>ĐÁP ỨNG ĐẦY ĐỦ VỀ MÔN HỌC ({wb.satisfiedCombos.length} tổ hợp)</span>
                            </span>
                          ) : isPartial ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                              <span>ĐÁP ỨNG MỘT PHẦN</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-950 border border-rose-300 shadow-2xs">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                              <span>CHƯA ĐÁP ỨNG VỀ MÔN HỌC</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Chi tiết 2 khối: Tổ hợp có trong dữ liệu & Tổ hợp đáp ứng đầy đủ */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-[13px]">
                        {/* Cột 1: Các tổ hợp xét tuyển có trong dữ liệu */}
                        <div className="p-3.5 bg-white rounded-xl border border-slate-300 space-y-2">
                          <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                            Các tổ hợp trong CSDL ({wb.allCombos.length} tổ hợp):
                          </span>
                          {wb.allCombos.length > 0 ? (
                            <div className="space-y-2">
                              {wb.allCombos.map((c, i) => (
                                <div key={i} className="text-xs text-slate-900 flex items-start justify-between gap-2">
                                  <span className="font-extrabold text-blue-950 font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-300 shrink-0">
                                    {c.code}
                                  </span>
                                  <span className="text-slate-800 font-semibold text-right leading-snug">
                                    {c.rawSubjects.join(', ')}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-600 italic block">
                              Chưa có dữ liệu tổ hợp xét tuyển cho ngành này.
                            </span>
                          )}
                        </div>

                        {/* Cột 2: Tổ hợp xét tuyển được đáp ứng đầy đủ */}
                        <div className="p-3.5 bg-white rounded-xl border-2 border-emerald-300 space-y-2">
                          <span className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider block">
                            Tổ hợp đáp ứng đầy đủ ({wb.satisfiedCombos.length}):
                          </span>
                          {wb.satisfiedCombos.length > 0 ? (
                            <div className="space-y-2">
                              {wb.satisfiedCombos.map((c, i) => (
                                <div key={i} className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-300 text-xs text-emerald-950 font-bold space-y-0.5">
                                  <div className="flex items-center justify-between gap-2">
                                    <strong className="text-emerald-950 font-mono text-sm">{c.code}</strong>
                                    <span className="text-[11px] text-emerald-900 font-extrabold">✓ Đáp ứng đủ môn học</span>
                                  </div>
                                  <div className="text-xs text-emerald-900 font-semibold leading-snug">
                                    {c.rawSubjects.join(' · ')}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <span className="text-xs text-slate-700 font-medium italic block leading-relaxed">
                                Không có tổ hợp nào đủ 100% môn trong 4 môn thi tốt nghiệp dự kiến
                              </span>
                              {wb.thptCoveredComboCodes.length > 0 && (
                                <span className="text-[11px] text-blue-900 bg-blue-50 border border-blue-200 rounded-md px-2.5 py-1.5 block font-semibold leading-relaxed">
                                  Môn học THPT của tổ hợp đang xét có bao phủ {wb.thptCoveredComboCodes.join(', ')}, nhưng 2 môn thi tự chọn không thể dự thi đồng thời tất cả môn.
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>


            {/* 5. LỜI NHẮN TỪ EDUGUIDE AI */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-sky-50/90 rounded-2xl border border-blue-300 shadow-2xs flex items-start gap-3.5 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs hidden sm:flex mt-0.5">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div className="space-y-1.5 flex-1 text-center sm:text-left">
                <p className="text-sm sm:text-base font-black text-blue-950 flex items-center justify-center sm:justify-start gap-1.5">
                  <span>🎓 Lời nhắn từ EduGuide AI</span>
                  <span className="text-amber-500">★</span>
                </p>
                <p className="text-xs sm:text-sm text-blue-950 font-extrabold leading-relaxed">
                  Mỗi lựa chọn hôm nay là một bước khởi đầu cho tương lai! 🌟
                </p>
                <p className="text-xs sm:text-sm text-slate-900 font-semibold leading-relaxed">
                  Kết quả tư vấn chỉ mang tính chất tham khảo. Hãy cân nhắc sở thích, năng lực bản thân, định hướng nghề nghiệp và điều kiện thực tế để lựa chọn tổ hợp môn học phù hợp nhất.
                </p>
                <p className="text-xs sm:text-sm text-blue-950 font-bold leading-relaxed">
                  EduGuide AI chúc các em tự tin với lựa chọn của mình, học tập thật tốt, phát huy thế mạnh, vững bước trong hành trình 3 năm THPT và từng bước chinh phục ước mơ nghề nghiệp trong tương lai! 🎓✨
                </p>
              </div>
            </div>

            {/* 6. HÀNG NÚT ĐIỀU HƯỚNG & HÀNH ĐỘNG (Dễ bấm trên điện thoại) */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => onStepChange(3)}
                className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center"
              >
                ← Quay lại chỉnh sửa nguyện vọng
              </button>

              <div className="grid grid-cols-2 sm:flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-800 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-600 shrink-0" />
                      <span className="text-green-600">Đã sao chép!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-600 shrink-0" />
                      <span>Sao chép kết quả</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onStepChange(1)}
                  className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 shrink-0" />
                  <span>Làm lại từ đầu</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
