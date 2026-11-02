import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Car, 
  Menu, 
  X, 
  Sliders, 
  Layers, 
  Database, 
  Calculator, 
  GitBranch, 
  Zap, 
  Bookmark, 
  ScanLine, 
  Lightbulb, 
  Cpu, 
  FolderArchive, 
  CircuitBoard, 
  BookOpen, 
  GraduationCap, 
  Brain,
  Home,
  ChevronLeft,
  ChevronRight,
  Coins,
  CheckSquare,
  Camera,
  Maximize,
  SlidersHorizontal,
  Radio,
  Gauge,
  HardDrive,
  Images,
  FileType,
  Cable,
  Sun,
  Moon,
  Search,
  ArrowRight,
  CornerDownLeft,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  keywords?: string[];
  description?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: '홈 (전체 개요)', icon: Home, badge: '메인', keywords: ['home', '홈', '메인', '대시보드', '개요', '목차'], description: '플랫폼 전체 모듈 개요 및 퀵 스타트 가이드' },
  { id: 'detector', label: '번호판 인식 프로그램', icon: ScanLine, badge: '실시간', keywords: ['인식', '검출', 'detector', '번호판', '실시간', '웹캠', 'ocr', 'alpr'], description: '실시간 웹캠/동영상 차량 번호판 검출 및 OCR 인식 엔진' },
  { id: 'lpr-lab', label: 'LPR Lab', icon: Cpu, badge: '딥러닝', keywords: ['lab', '딥러닝', '연구실', '파이프라인'], description: '차세대 딥러닝 LPR 인식 모델 심층 연구 랩' },
  { id: 'hardware', label: '구성품', icon: CircuitBoard, badge: '하드웨어', keywords: ['하드웨어', 'hardware', '구성품', 'jetson', '센서', '렌즈', '조명'], description: '시스템 하드웨어 BOM 및 컴포넌트 규격' },
  { id: 'lpr-research', label: 'LPR 연구(Research)', icon: BookOpen, badge: '연구', keywords: ['research', '연구', '논문', '특허', '아키텍처'], description: '최신 딥러닝 번호판 인식 연구 논문 및 기술 분석' },
  { id: 'training', label: '학습', icon: GraduationCap, badge: '200만장', keywords: ['학습', 'training', '200만장', '데이터셋', 'loss'], description: '200만 장 차량 번호판 학습 파이프라인 및 손실 함수' },
  { id: 'models', label: '모델', icon: Brain, badge: 'ONNX/DNN', keywords: ['모델', 'models', 'onnx', 'dnn', 'yolo', 'lprnet', 'tensorrt'], description: 'ONNX 및 TensorRT 경량화 추론 엔진 모델 쇼케이스' },
  { id: 'lighting', label: '조명', icon: Lightbulb, badge: '광학', keywords: ['조명', 'lighting', '광학', 'ir', '적외선', '850nm', '940nm', '스트로브'], description: '850nm/940nm 적외선 스트로브 조명 및 광학 동기화' },
  { id: 'camera', label: '카메라', icon: Camera, badge: '센서/광학', keywords: ['카메라', 'camera', '광학', '센서', 'mtf', 'mtf 곡선', '롤링셔터', '글로벌셔터', '렌즈 faq'], description: '카메라 광학 센서 분석, MTF 곡선 시뮬레이터, 렌즈 FAQ' },
  { id: 'camera-6', label: '카메라 6종', icon: SlidersHorizontal, badge: '글로벌셔터', keywords: ['카메라 6종', 'camera-6', '글로벌셔터', 'basler', 'flir', 'econ', '라즈베리파이', '모션블러'], description: '24GHz 레이더 동기화 글로벌 셔터 카메라 6종 비교' },
  { id: 'see3cam-24cug', label: 'See3CAM_24CUG', icon: Radio, badge: 'AR0234CS', keywords: ['see3cam', 'ar0234', 'ar0234cs', '120fps', 'isp', '레이더', '글로벌셔터'], description: 'AR0234CS 글로벌 셔터, 120 FPS, 온보드 ISP 심층 분석' },
  { id: 'pixel', label: '픽셀', icon: Maximize, badge: '해상도', keywords: ['픽셀', 'pixel', '해상도', 'hd', 'fhd', '3m', '5m', '4k', '12m', 'ppm'], description: '카메라 해상도 비율 시각화 및 번호판 차로별 PPM 계산기' },
  { id: 'bandwidth', label: '대역폭', icon: Gauge, badge: 'USB 전송', keywords: ['대역폭', 'bandwidth', 'usb', 'usb3', '80% rule', 'yuv422', 'h264'], description: '비압축 24비트 비디오 전송 대역폭 및 USB 80% 실효 전송 규격' },
  { id: 'interface', label: '인터페이스', icon: Cable, badge: '4대 규격', keywords: ['인터페이스', 'interface', 'mipi', 'usb', 'gmsl', 'gmsl2', 'gige', '10gige', '레이턴시'], description: '4대 인터페이스(MIPI, USB 3.0, GMSL2, GigE) 사양 정밀 비교' },
  { id: 'storage', label: '스토리지', icon: HardDrive, badge: '용량 계산', keywords: ['스토리지', 'storage', 'nvr', '계산기', 'h265', 'h264', 'raid', '압축최적화', 'psnr', 'ssim'], description: 'NVR 스토리지 용량 계산기 및 압축 최적화 가이드' },
  { id: 'photo', label: '사진', icon: Images, badge: '1000장 계산', keywords: ['사진', 'photo', '1000장', '디렉토리', '슬랙', '클러스터', 'recharts'], description: '해상도별 1,000장 디렉토리 저장 스토리지 계산기 및 슬랙 분석' },
  { id: 'format', label: '포맷', icon: FileType, badge: '특징/응용', keywords: ['포맷', 'format', 'jpeg', 'webp', 'png', 'raw', '골디락스', '화질'], description: '이미지 사진 포맷별 특징 및 6대 실무 현장 적용 가이드' },
  { id: 'simulator', label: '증강 시뮬레이터', icon: Sliders, badge: '시뮬', keywords: ['시뮬레이터', 'simulator', '증강', '블러', '노이즈', '우천', '안개', '왜곡'], description: '11종 실시간 환경 악조건 번호판 증강 시뮬레이터' },
  { id: 'batch', label: '배치 처리기', icon: FolderArchive, badge: '대량', keywords: ['배치', 'batch', '대량', '처리기', '변환'], description: '대량 번호판 이미지 일괄 변환 및 증강 처리기' },
  { id: 'validator', label: '데이터 검증기', icon: CheckSquare, badge: 'YOLO/VOC', keywords: ['검증기', 'validator', '데이터검증', 'yolo', 'voc', '바운딩박스'], description: 'YOLO 및 Pascal VOC 라벨링 무결성 검증 도구' },
  { id: 'presets', label: '프리셋 라이브러리', icon: Bookmark, badge: '표준', keywords: ['프리셋', 'presets', '라이브러리', '표준', '한국번호판'], description: '한국 및 글로벌 표준 번호판 규격 프리셋 라이브러리' },
  { id: 'testbench', label: '인식 테스트 랩', icon: Zap, badge: '검증', keywords: ['테스트', 'testbench', '랩', '인식테스트', '벤치마크'], description: '알고리즘 인식률 실시간 벤치마크 테스트 랩' },
  { id: 'solutions', label: '4대 해결 전략', icon: Layers, badge: '전략', keywords: ['전략', 'solutions', '해결전략', '반사', '야간'], description: '빛반사, 오염, 번짐 극복 4대 핵심 엔지니어링 전략' },
  { id: 'challenges', label: '챌린지 매트릭스', icon: Database, badge: '매트릭스', keywords: ['챌린지', 'challenges', '매트릭스', '환경'], description: '현장 번호판 인식 장애 요인별 대응 챌린지 매트릭스' },
  { id: 'pipeline', label: 'MLOps 파이프라인', icon: GitBranch, badge: '파이프라인', keywords: ['파이프라인', 'pipeline', 'mlops', '배포', 'ci/cd'], description: '지속적 데이터 수집-학습-배포 MLOps 자동화' },
  { id: 'roi', label: '데이터셋 ROI 계산기', icon: Calculator, badge: '비용', keywords: ['roi', '비용', '계산기', '데이터셋', '경제성'], description: '자체 데이터셋 구축 비용 및 경제성 분석 ROI 계산기' },
  { id: 'cost-estimator', label: '비용 추정기', icon: Coins, badge: 'GPU/스토리지', keywords: ['견적', '비용', 'cost', 'gpu', '서버', '인프라'], description: 'AI 모델 훈련용 GPU 및 스토리지 인프라 비용 견적기' },
];

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme, isDark } = useTheme();

  // Global Quick Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentItem = NAV_ITEMS.find((item) => item.id === activeTab) || NAV_ITEMS[0];
  const CurrentIcon = currentItem.icon;

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    setIsSearchOpen(false);
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const scrollTabs = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Filtered Search Results
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return NAV_ITEMS.filter((item) => {
      const matchLabel = item.label.toLowerCase().includes(q);
      const matchBadge = item.badge?.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchKeywords = item.keywords?.some((k) => k.toLowerCase().includes(q));
      return matchLabel || matchBadge || matchDesc || matchKeywords;
    });
  }, [searchQuery]);

  // Reset selected index on query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Global Keyboard Shortcut: Cmd+K / Ctrl+K or / to open search
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if already inside an input or textarea (unless Cmd+K)
      const isInput = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA';
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
        searchInputRef.current?.focus();
      } else if (!isInput && e.key === '/') {
        e.preventDefault();
        setIsSearchOpen(true);
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search input keyboard navigation (ArrowUp, ArrowDown, Enter)
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (filteredItems.length ? (prev + 1) % filteredItems.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (filteredItems.length ? (prev - 1 + filteredItems.length) % filteredItems.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems.length > 0) {
        const target = filteredItems[selectedIndex] || filteredItems[0];
        handleNavClick(target.id);
      }
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
      searchInputRef.current?.blur();
    }
  };

  // Recommended Quick Search Terms
  const POPULAR_SEARCH_TAGS = [
    { label: '인터페이스', id: 'interface' },
    { label: '스토리지 계산기', id: 'storage' },
    { label: '사진 1,000장', id: 'photo' },
    { label: '포맷 가이드 (JPEG/RAW)', id: 'format' },
    { label: '글로벌셔터 6종', id: 'camera-6' },
    { label: 'See3CAM_24CUG', id: 'see3cam-24cug' },
    { label: '대역폭 & USB', id: 'bandwidth' },
    { label: 'MTF 곡선', id: 'camera' },
  ];

  return (
    <nav className="bg-white/95 dark:bg-slate-900/98 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 text-slate-800 dark:text-white shadow-xs dark:shadow-xl transition-colors duration-200">
      {/* 1. Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center gap-2 sm:gap-4">
          {/* Logo & Brand */}
          <div 
            onClick={() => handleNavClick('home')} 
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0"
            title="메인 홈으로 이동"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-500 flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Car className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors">
                  ALPR Data-Hub
                </span>
                <span className="text-[9px] sm:text-[10px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950 border border-sky-200 dark:border-sky-800/80 px-1.5 py-0.2 rounded">
                  v2.5
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden xl:block">
                지능형 차량 번호판 인식 & AI 데이터셋 통합 플랫폼
              </p>
            </div>
          </div>

          {/* Center: Global Search Input Box & Current Tab Badge */}
          <div className="flex items-center gap-2.5 flex-1 max-w-md lg:max-w-lg justify-center mx-1 sm:mx-3">
            
            {/* Interactive Search Bar */}
            <div ref={searchContainerRef} className="relative w-full">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 dark:text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="탭 및 기능 검색... (Ctrl+K)"
                  className="w-full pl-9 pr-12 sm:pr-14 py-1.5 text-xs rounded-xl bg-slate-100 hover:bg-slate-200/60 focus:bg-white dark:bg-slate-800/90 dark:hover:bg-slate-800 dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700/80 focus:border-sky-500 dark:focus:border-sky-400 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 transition-all outline-none shadow-xs"
                />
                {searchQuery ? (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-2.5 p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    title="검색어 지우기"
                  >
                    <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                ) : (
                  <div className="absolute right-2.5 hidden sm:flex items-center gap-0.5 pointer-events-none">
                    <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700/80 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-600">
                      ⌘K
                    </kbd>
                  </div>
                )}
              </div>

              {/* Search Dropdown Floating Panel */}
              {isSearchOpen && (
                <div className="absolute left-0 right-0 sm:left-auto sm:right-auto sm:w-[480px] top-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                  
                  {/* Results List Mode */}
                  {searchQuery.trim() ? (
                    <div>
                      <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        <span>검색 결과: <strong className="text-sky-500">{filteredItems.length}</strong>건</span>
                        <span className="hidden sm:inline">↑↓ 이동 | Enter 선택 | ESC 닫기</span>
                      </div>

                      {filteredItems.length > 0 ? (
                        <div className="max-h-[360px] overflow-y-auto p-1.5 space-y-1">
                          {filteredItems.map((item, idx) => {
                            const Icon = item.icon;
                            const isHighlighted = idx === selectedIndex;
                            return (
                              <button
                                key={item.id}
                                onClick={() => handleNavClick(item.id)}
                                onMouseEnter={() => setSelectedIndex(idx)}
                                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                                  isHighlighted
                                    ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className={`p-1.5 rounded-lg ${isHighlighted ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-sky-500'}`}>
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-xs sm:text-sm font-bold truncate flex items-center gap-1.5">
                                      <span>{item.label}</span>
                                      {item.badge && (
                                        <span className={`text-[10px] font-mono font-normal px-1.5 py-0.2 rounded-md ${
                                          isHighlighted
                                            ? 'bg-slate-950/20 text-slate-950'
                                            : 'bg-slate-150 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                                        }`}>
                                          {item.badge}
                                        </span>
                                      )}
                                    </div>
                                    {item.description && (
                                      <p className={`text-[11px] truncate mt-0.5 ${isHighlighted ? 'text-slate-900/80 font-normal' : 'text-slate-500 dark:text-slate-400'}`}>
                                        {item.description}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="shrink-0 ml-2">
                                  <ArrowRight className={`w-4 h-4 ${isHighlighted ? 'text-slate-950' : 'text-slate-400'}`} />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-6 text-center space-y-2">
                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            ‘<strong>{searchQuery}</strong>’에 대한 검색 결과가 없습니다.
                          </p>
                          <p className="text-[11px] text-slate-400">
                            추천 검색어: 인터페이스, 스토리지, 대역폭, 포맷, 4K, 글로벌셔터, MTF
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Empty Query Mode: Popular Shortcuts */
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>빠른 탭 바로가기 & 추천 키워드</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {POPULAR_SEARCH_TAGS.map((tag) => (
                          <button
                            key={tag.id}
                            onClick={() => handleNavClick(tag.id)}
                            className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1"
                          >
                            <span>{tag.label}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                          </button>
                        ))}
                      </div>
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-mono flex justify-between">
                        <span>전체 25대 모듈 실시간 검색 지원</span>
                        <span>단축키: Ctrl+K / / 키</span>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* Current Page Indicator Badge (User's Referenced Badge) */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 text-xs shrink-0" title="현재 활성화된 탭">
              <span className="text-slate-500 dark:text-slate-400 font-mono">현재 탭:</span>
              <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold">
                <CurrentIcon className="w-3.5 h-3.5" />
                <span className="max-w-[120px] truncate">{currentItem.label}</span>
              </span>
            </div>

          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => handleNavClick('home')}
              className={`hidden md:flex items-center gap-1.5 text-xs px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'home'
                  ? 'bg-sky-50 dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 border border-sky-200 dark:border-sky-500/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>전체 홈</span>
            </button>

            <button
              onClick={() => handleNavClick('simulator')}
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs px-2.5 sm:px-3 py-1.5 rounded-lg transition-all shadow-md shadow-sky-500/25 active:scale-95 shrink-0"
            >
              시뮬레이터
            </button>

            {/* Global Light/Dark Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 active:scale-95 shrink-0 shadow-2xs"
              title={isDark ? '라이트 모드로 전환 (Switch to Light Mode)' : '다크 모드로 전환 (Switch to Dark Mode)'}
              aria-label="화면 테마 변경"
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden md:inline text-[11px] text-amber-300 font-semibold">라이트</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-sky-600" />
                  <span className="hidden md:inline text-[11px] text-slate-700 font-semibold">다크</span>
                </>
              )}
            </button>

            {/* Mobile menu toggle */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1.5 rounded-lg focus:outline-none"
                aria-label="메뉴 열기"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Desktop Horizontal Tab Bar (Scrollable with Arrow Buttons) */}
      <div className="hidden md:block bg-slate-50 dark:bg-slate-950/90 border-t border-slate-200 dark:border-slate-800/80 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 flex items-center relative">
          {/* Scroll Left Button */}
          <button
            onClick={() => scrollTabs('left')}
            className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 shrink-0 mr-1 transition-colors"
            title="왼쪽 탭 스크롤"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Scrollable Tab Strip */}
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-1 overflow-x-auto py-2 scroll-smooth no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 ${
                    isActive
                      ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/25 scale-[1.02]'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Scroll Right Button */}
          <button
            onClick={() => scrollTabs('right')}
            className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 shrink-0 ml-1 transition-colors"
            title="오른쪽 탭 스크롤"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 pt-3 pb-5 space-y-2 max-h-[80vh] overflow-y-auto shadow-lg">
          {/* Mobile Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="메뉴 및 기능 검색..."
              className="w-full pl-9 pr-9 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile Theme Toggle Card */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">화면 테마</span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs"
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>라이트 모드로 전환</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-sky-600" />
                  <span>다크 모드로 전환</span>
                </>
              )}
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 px-1 py-1 uppercase tracking-wider flex items-center justify-between">
            <span>{searchQuery.trim() ? `검색 결과 (${filteredItems.length}건)` : `전체 ${NAV_ITEMS.length}대 모듈`}</span>
            {searchQuery.trim() && (
              <button onClick={() => setSearchQuery('')} className="text-sky-500 text-[10px] underline">
                초기화
              </button>
            )}
          </div>

          {(searchQuery.trim() ? filteredItems : NAV_ITEMS).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold ${
                  isActive
                    ? 'bg-sky-500 text-slate-950 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-slate-950/20 text-slate-900' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
};
