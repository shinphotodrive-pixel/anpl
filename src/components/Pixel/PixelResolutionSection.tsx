import React, { useState, useMemo } from 'react';
import {
  Camera,
  Maximize,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
  Search,
  Filter,
  Eye,
  Layers,
  ArrowRight,
  Zap,
  HelpCircle,
  TrendingUp,
  Cpu,
  Monitor,
  HardDrive
} from 'lucide-react';

interface ResolutionItem {
  id: string;
  category: 'HD' | 'M' | 'K' | 'ITS';
  categoryLabel: string;
  name: string;
  subName?: string;
  width: number;
  height: number;
  megapixels: number;
  ratio: string;
  platePixels1Lane: number; // 3.5m FOV 기준 번호판(520mm) 픽셀 폭
  platePixels2Lane: number; // 7.0m FOV 기준 번호판(520mm) 픽셀 폭
  fpsTypical: string;
  typicalBandwidth: string; // H.265 @ 30fps
  bestUseCase: string;
  recommended: boolean;
  notes: string;
  color: string;
}

const RESOLUTION_DATA: ResolutionItem[] = [
  // HD 계열
  {
    id: 'hd',
    category: 'HD',
    categoryLabel: 'HD 계열',
    name: 'HD (720p)',
    subName: 'Standard High Definition',
    width: 1280,
    height: 720,
    megapixels: 0.92,
    ratio: '16:9',
    platePixels1Lane: 190,
    platePixels2Lane: 95,
    fpsTypical: '30 ~ 60 FPS',
    typicalBandwidth: '1.5 ~ 2.5 Mbps',
    bestUseCase: '단일 차로 저속 진입로, 주차 차단기 앞 3~5m 근거리 단속',
    recommended: false,
    notes: '2차로 감시 시 번호판 픽셀 폭(95px) 부족으로 야간/고속 OCR 판독률 급감.',
    color: 'emerald'
  },
  {
    id: 'fhd',
    category: 'HD',
    categoryLabel: 'HD 계열',
    name: 'FHD (1080p / 2M)',
    subName: 'Full High Definition',
    width: 1920,
    height: 1080,
    megapixels: 2.07,
    ratio: '16:9',
    platePixels1Lane: 285,
    platePixels2Lane: 142,
    fpsTypical: '30 ~ 60 FPS',
    typicalBandwidth: '3.0 ~ 4.5 Mbps',
    bestUseCase: '글로벌 표준 ALPR 카메라, 1~2차로 주차 관제, 하이패스 정산소',
    recommended: true,
    notes: '센서 수광량(픽셀 피치 ~3.0µm)과 연산량의 완벽한 밸런스로 가장 널리 채택되는 표준 규격.',
    color: 'blue'
  },
  {
    id: 'qhd',
    category: 'HD',
    categoryLabel: 'HD 계열',
    name: 'QHD (1440p / 4M)',
    subName: 'Quad High Definition (2K)',
    width: 2560,
    height: 1440,
    megapixels: 3.68,
    ratio: '16:9',
    platePixels1Lane: 380,
    platePixels2Lane: 190,
    fpsTypical: '30 FPS',
    typicalBandwidth: '5.0 ~ 8.0 Mbps',
    bestUseCase: '2차로 간선도로 과속·신호위반 단속, 주차장 광역 진출입',
    recommended: true,
    notes: '2차로 커버리지에서도 번호판 190px 확보 가능하여 고속 주행 차량 OCR 안정적.',
    color: 'sky'
  },

  // M (메가픽셀) 계열
  {
    id: '1_3m',
    category: 'M',
    categoryLabel: 'M (메가픽셀) 계열',
    name: '1.3M (SXGA)',
    subName: 'Super Extended Graphics Array',
    width: 1280,
    height: 1024,
    megapixels: 1.31,
    ratio: '5:4',
    platePixels1Lane: 190,
    platePixels2Lane: 95,
    fpsTypical: '60 ~ 90 FPS',
    typicalBandwidth: '2.0 ~ 3.0 Mbps',
    bestUseCase: '초기 세대 머신비전 ALPR, 공장 출입구 고속 검사',
    recommended: false,
    notes: '5:4 종횡비로 수직 시야가 우수하나 최신 AI 모델(16:9 패딩) 적용 시 레터박스 발생.',
    color: 'teal'
  },
  {
    id: '2m',
    category: 'M',
    categoryLabel: 'M (메가픽셀) 계열',
    name: '2M (UXGA / FHD)',
    subName: '2 MegaPixel Standard',
    width: 1920,
    height: 1080,
    megapixels: 2.07,
    ratio: '16:9',
    platePixels1Lane: 285,
    platePixels2Lane: 142,
    fpsTypical: '60 FPS',
    typicalBandwidth: '3.5 ~ 5.0 Mbps',
    bestUseCase: 'AR0234 글로벌 셔터 기반 고속 도로 단속 및 빌딩 LPR',
    recommended: true,
    notes: '1차로 단속 시 번호판 폭 285px 확보, 국토교통부 표준 권장 규격(130px)을 여유롭게 상회.',
    color: 'blue'
  },
  {
    id: '3m',
    category: 'M',
    categoryLabel: 'M (메가픽셀) 계열',
    name: '3M (QXGA)',
    subName: 'Quad Extended Graphics Array',
    width: 2048,
    height: 1536,
    megapixels: 3.15,
    ratio: '4:3',
    platePixels1Lane: 304,
    platePixels2Lane: 152,
    fpsTypical: '30 ~ 60 FPS',
    typicalBandwidth: '4.5 ~ 6.5 Mbps',
    bestUseCase: '4:3 산업용 머신비전 카메라, 접근 차량 수직 추적 최적화',
    recommended: false,
    notes: '세로 해상도가 1536px로 높아 전방 15m부터 5m까지 차량 번호판을 더 오랫동안 프레임에 유지.',
    color: 'indigo'
  },
  {
    id: '5m',
    category: 'M',
    categoryLabel: 'M (메가픽셀) 계열',
    name: '5M (Sony IMX264 / IMX250)',
    subName: '5 MegaPixel Machine Vision',
    width: 2448,
    height: 2048,
    megapixels: 5.01,
    ratio: '1.2:1 (약 4:3.3)',
    platePixels1Lane: 363,
    platePixels2Lane: 181,
    fpsTypical: '35 ~ 75 FPS',
    typicalBandwidth: '8.0 ~ 12.0 Mbps',
    bestUseCase: '고속도로 2~3차로 동시 단속 시스템, ITS 하이웨이 게이트',
    recommended: true,
    notes: '정사각형에 가까운 대형 센서로 2차로 전체를 커버하면서도 차로당 180px 이상 고해상도 유지.',
    color: 'purple'
  },
  {
    id: '8m',
    category: 'M',
    categoryLabel: 'M (메가픽셀) 계열',
    name: '8M (4K UHD)',
    subName: '8 MegaPixel Ultra HD',
    width: 3840,
    height: 2160,
    megapixels: 8.29,
    ratio: '16:9',
    platePixels1Lane: 570,
    platePixels2Lane: 285,
    fpsTypical: '30 FPS',
    typicalBandwidth: '12.0 ~ 20.0 Mbps',
    bestUseCase: '3차로 다차선 동시 감시, 광역 교차로 꼬리물기·불법유턴 단속',
    recommended: true,
    notes: '3개 차로(10.5m)를 동시 촬영해도 각 번호판이 190px씩 배정되어 단 1대의 카메라로 3차로 커버 가능.',
    color: 'indigo'
  },
  {
    id: '12m',
    category: 'M',
    categoryLabel: 'M (메가픽셀) 계열',
    name: '12M (4000x3000)',
    subName: '12 MegaPixel Industrial',
    width: 4000,
    height: 3000,
    megapixels: 12.0,
    ratio: '4:3',
    platePixels1Lane: 594,
    platePixels2Lane: 297,
    fpsTypical: '15 ~ 25 FPS',
    typicalBandwidth: '20.0 ~ 30.0 Mbps',
    bestUseCase: '광역 주정차 단속 차량 탑재형 카메라, 대규모 물류센터 게이트',
    recommended: false,
    notes: '고화소인 만큼 야간 센서 수광량이 줄어들며 강력한 IR 투광기(스트로브) 필수.',
    color: 'fuchsia'
  },

  // K 계열
  {
    id: '2k_dci',
    category: 'K',
    categoryLabel: 'K 계열',
    name: '2K DCI',
    subName: 'Digital Cinema Initiatives',
    width: 2048,
    height: 1080,
    megapixels: 2.21,
    ratio: '17:9',
    platePixels1Lane: 304,
    platePixels2Lane: 152,
    fpsTypical: '30 ~ 60 FPS',
    typicalBandwidth: '4.0 ~ 6.0 Mbps',
    bestUseCase: '시네마 및 특수 영상 분석, 와이드 도로 모니터링',
    recommended: false,
    notes: 'FHD 대비 수평이 넓어 갓길까지 포함한 2차로 도로 분석에 적합.',
    color: 'blue'
  },
  {
    id: '4k_uhd',
    category: 'K',
    categoryLabel: 'K 계열',
    name: '4K UHD (2160p)',
    subName: 'Ultra High Definition',
    width: 3840,
    height: 2160,
    megapixels: 8.29,
    ratio: '16:9',
    platePixels1Lane: 570,
    platePixels2Lane: 285,
    fpsTypical: '30 FPS',
    typicalBandwidth: '12.0 ~ 18.0 Mbps',
    bestUseCase: '차세대 스마트 ITS, 다중 차선 AI 동시 객체 검출(YOLOv8/v11)',
    recommended: true,
    notes: '초고해상도로 번호판뿐만 아니라 운전자 안전벨트 착용, 차량 제조사/차종 엠블럼까지 동시 식별 가능.',
    color: 'indigo'
  },
  {
    id: '4k_dci',
    category: 'K',
    categoryLabel: 'K 계열',
    name: '4K DCI',
    subName: 'Full 4K Cinema Standard',
    width: 4096,
    height: 2160,
    megapixels: 8.85,
    ratio: '19:10',
    platePixels1Lane: 608,
    platePixels2Lane: 304,
    fpsTypical: '24 ~ 30 FPS',
    typicalBandwidth: '15.0 ~ 22.0 Mbps',
    bestUseCase: '초광폭 교차로 및 특수 감시 시스템',
    recommended: false,
    notes: '전문 방송·영화 장비 규격으로 일반 NVR/VMS 연동 시 비표준 해상도 호환성 확인 필요.',
    color: 'violet'
  },
  {
    id: '8k_uhd',
    category: 'K',
    categoryLabel: 'K 계열',
    name: '8K UHD (4320p)',
    subName: 'Super Hi-Vision',
    width: 7680,
    height: 4320,
    megapixels: 33.18,
    ratio: '16:9',
    platePixels1Lane: 1140,
    platePixels2Lane: 570,
    fpsTypical: '15 ~ 30 FPS',
    typicalBandwidth: '40.0 ~ 80.0 Mbps',
    bestUseCase: '초광역 파노라마 도시 관제, 공항 활주로 및 항만 감시',
    recommended: false,
    notes: '초당 3,300만 화소 처리로 엣지 AI 추론 시 워크스테이션급 고성능 GPU(RTX 4090 / L40S) 필수.',
    color: 'pink'
  }
];

export const PixelResolutionSection: React.FC = () => {
  // State for interactive features
  const [selectedResId, setSelectedResId] = useState<string>('fhd');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Interactive ALPR Calculator State
  const [calcResolutionId, setCalcResolutionId] = useState<string>('fhd');
  const [laneWidthMeters, setLaneWidthMeters] = useState<number>(3.5); // 1-lane = 3.5m, 2-lane = 7.0m, etc.
  const [distanceMeters, setDistanceMeters] = useState<number>(12); // Distance to camera in meters
  const [lensFocalLengthMm, setLensFocalLengthMm] = useState<number>(16); // 8mm, 12mm, 16mm, 25mm

  const activeRes = RESOLUTION_DATA.find((r) => r.id === selectedResId) || RESOLUTION_DATA[1];
  const calcRes = RESOLUTION_DATA.find((r) => r.id === calcResolutionId) || RESOLUTION_DATA[1];

  // Calculate ALPR Plate Metrics:
  // Standard Korean License Plate: Width = 520mm (0.52m), Height = 110mm (0.11m)
  // Pixels per meter (PPM) = Horizontal_Resolution / Total_FOV_Width_in_Meters
  const ppm = useMemo(() => {
    return Math.round(calcRes.width / laneWidthMeters);
  }, [calcRes.width, laneWidthMeters]);

  // Plate width in pixels = PPM * 0.52
  const plateWidthPx = useMemo(() => {
    return Math.round(ppm * 0.52);
  }, [ppm]);

  // Plate OCR suitability assessment
  const plateQuality = useMemo(() => {
    if (plateWidthPx >= 200) {
      return {
        level: '최적 (Optimal)',
        color: 'text-emerald-500 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/30',
        badge: '인식률 99.8%+',
        desc: '국토교통부 표준 권고치(130px)를 대폭 상회. 야간, 우천, 고속 주행(100km/h+) 환경에서도 극도로 안정적인 OCR 인식.'
      };
    } else if (plateWidthPx >= 130) {
      return {
        level: '표준 적합 (Standard)',
        color: 'text-sky-500 dark:text-sky-400',
        bg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-500/30',
        badge: '인식률 98.5%~99.5%',
        desc: '공공 ITS 및 주차 관제 표준 규격 완벽 충족. 일반 주광 및 적정 IR 조명 하에서 오류 없이 판독 가능.'
      };
    } else if (plateWidthPx >= 90) {
      return {
        level: '경계치 (Marginal)',
        color: 'text-amber-500 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-500/30',
        badge: '인식률 90%~95%',
        desc: '한글 형태학적 유사 문자(바/하/마/거/어 등) 오인식 위험 증가. 딥러닝 초해상도(SR) 복원 네트워크 연동 권장.'
      };
    } else {
      return {
        level: '인식 불가 위험 (Critical)',
        color: 'text-rose-500 dark:text-rose-400',
        bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-500/30',
        badge: '인식률 80% 미만',
        desc: '번호판 문자 획이 뭉개져 OCR 불가능. 화각(FOV)을 좁히거나 카메라 해상도를 상위 등급(FHD/5M/4K)으로 업그레이드 필요.'
      };
    }
  }, [plateWidthPx]);

  // Filtered table data
  const filteredData = useMemo(() => {
    return RESOLUTION_DATA.filter((item) => {
      const matchesCategory =
        categoryFilter === 'all' ||
        (categoryFilter === 'HD' && item.category === 'HD') ||
        (categoryFilter === 'M' && item.category === 'M') ||
        (categoryFilter === 'K' && item.category === 'K') ||
        (categoryFilter === 'REC' && item.recommended);

      const matchesSearch =
        searchQuery.trim() === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.bestUseCase.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${item.width}x${item.height}`.includes(searchQuery);

      return matchesCategory && matchesSearch;
    });
  }, [categoryFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 pt-8">

        {/* Header Section (from user's HTML source) */}
        <header className="text-center space-y-4 pt-4 pb-2">
          <div className="inline-flex items-center justify-center p-3.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30 mb-1 ring-4 ring-blue-500/20">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-semibold text-blue-400 uppercase tracking-wider">
              <Maximize className="w-3.5 h-3.5" />
              <span>Camera Resolution & Pixel Standard Specification Guide</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              카메라 픽셀 & 해상도 가이드
            </h1>
          </div>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            HD, FHD부터 메가픽셀(M), 4K까지 다양한 카메라 해상도 규격과 총 화소 수를 한눈에 비교해 보세요.
          </p>

          {/* Quick Stats Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-slate-300 font-medium">HD 계열 (720p / 1080p / 1440p)</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              <span className="text-slate-300 font-medium">M 계열 (2M / 3M / 5M / 8M / 12M)</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              <span className="text-slate-300 font-medium">K 계열 (2K / 4K UHD / 8K)</span>
            </div>
          </div>
        </header>

        {/* Visual Size Comparison (해상도 비율 시각화 - Core Feature from User Source) */}
        <section className="bg-slate-800/60 border border-slate-700/80 p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Maximize className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">해상도 비율 시각화</h2>
                <p className="text-xs text-slate-400">동일 프레임 면적 대비 각 해상도의 유효 픽셀 크기 중첩 비교</p>
              </div>
            </div>

            {/* Quick interactive selector buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 font-medium mr-1">규격 선택:</span>
              {[
                { id: 'hd', label: 'HD (100만)', border: 'border-emerald-500/50 text-emerald-400' },
                { id: 'fhd', label: 'FHD / 2M (200만)', border: 'border-blue-500/50 text-blue-400' },
                { id: '5m', label: '5M (500만)', border: 'border-purple-500/50 text-purple-400' },
                { id: '4k_uhd', label: '4K / 8M (800만)', border: 'border-indigo-500/50 text-indigo-400' }
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setSelectedResId(btn.id)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                    selectedResId === btn.id
                      ? 'bg-white text-slate-900 font-bold shadow-md scale-105'
                      : `bg-slate-800/80 hover:bg-slate-700 ${btn.border}`
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Nested Comparative Canvas Box */}
          <div className="relative w-full aspect-video min-h-[380px] sm:min-h-[420px] bg-slate-950 rounded-2xl border-2 border-slate-700/90 overflow-hidden shadow-inner">
            
            {/* 4K Box (8M) - 100% width, 100% height */}
            <div
              onClick={() => setSelectedResId('4k_uhd')}
              className={`absolute inset-0 bg-indigo-500/15 border-t-2 border-r-2 border-indigo-500 transition-all duration-300 cursor-pointer ${
                selectedResId === '4k_uhd' ? 'ring-4 ring-indigo-400/40 bg-indigo-500/30' : 'hover:bg-indigo-500/25'
              }`}
            >
              {/* 4K Label Card placed in TOP-RIGHT corner - 100% separated from 5M/FHD/HD on the left */}
              <div className="absolute top-3 right-3 max-w-[240px] sm:max-w-xs bg-slate-900/95 backdrop-blur-md border border-indigo-500/60 rounded-xl p-2.5 sm:p-3 shadow-xl pointer-events-none z-20">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-indigo-400 font-bold text-sm sm:text-base tracking-tight">4K UHD (8M)</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950/90 text-indigo-300 border border-indigo-700/80">100% 기준</span>
                </div>
                <div className="text-indigo-200/90 text-[11px] sm:text-xs font-mono mt-0.5">3840 x 2160 / 829만 화소 (16:9)</div>
                <div className="text-indigo-300/70 text-[10px] mt-0.5 hidden sm:block">3차로(10.5m) 동시 고화질 광역 감시</div>
              </div>
            </div>
            
            {/* 5M Box - 63.7% width, 94.8% height */}
            <div
              onClick={() => setSelectedResId('5m')}
              className={`absolute bottom-0 left-0 w-[64%] h-[95%] bg-purple-500/20 border-t-2 border-r-2 border-purple-500 transition-all duration-300 cursor-pointer z-10 hidden sm:block ${
                selectedResId === '5m' ? 'ring-4 ring-purple-400/40 bg-purple-500/35' : 'hover:bg-purple-500/30'
              }`}
            >
              {/* 5M Dimension badge on top border */}
              <div className="absolute -top-3.5 right-2 px-1.5 py-0.5 rounded bg-purple-950 border border-purple-500/60 text-[10px] font-mono text-purple-300 shadow">
                2448 x 2048 (5M)
              </div>

              {/* 5M Label Card placed in TOP-LEFT of 5M box */}
              <div className="absolute top-3 left-3 max-w-[220px] sm:max-w-[250px] bg-slate-900/95 backdrop-blur-md border border-purple-500/60 rounded-xl p-2.5 sm:p-3 shadow-xl pointer-events-none z-20">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-purple-400 font-bold text-xs sm:text-sm tracking-tight">5M (머신비전)</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950/90 text-purple-300 border border-purple-700/80">1.2:1</span>
                </div>
                <div className="text-purple-200/90 text-[10px] sm:text-xs font-mono mt-0.5">2448 x 2048 / 501만 화소</div>
                <div className="text-purple-300/70 text-[10px] mt-0.5 hidden sm:block">고속도로 2차로 동시 단속 표준 (IMX264)</div>
              </div>
            </div>

            {/* 2M / FHD Box - 50% width, 50% height */}
            <div
              onClick={() => setSelectedResId('fhd')}
              className={`absolute bottom-0 left-0 w-[50%] h-[50%] bg-blue-500/25 border-t-2 border-r-2 border-blue-500 transition-all duration-300 cursor-pointer z-20 ${
                selectedResId === 'fhd' ? 'ring-4 ring-blue-400/40 bg-blue-500/40' : 'hover:bg-blue-500/35'
              }`}
            >
              {/* FHD Dimension badge on top border */}
              <div className="absolute -top-3.5 right-2 px-1.5 py-0.5 rounded bg-blue-950 border border-blue-500/60 text-[10px] font-mono text-blue-300 shadow">
                1920 x 1080 (FHD)
              </div>

              {/* FHD Label Card placed in TOP-LEFT of FHD box (middle vertical tier) */}
              <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 max-w-[190px] sm:max-w-[220px] bg-slate-900/95 backdrop-blur-md border border-blue-500/60 rounded-xl p-2 sm:p-2.5 shadow-xl pointer-events-none z-20">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-blue-400 font-bold text-xs sm:text-sm tracking-tight">FHD (2M)</span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-blue-950/90 text-blue-300 border border-blue-700/80">업계 표준</span>
                </div>
                <div className="text-blue-200/90 text-[10px] sm:text-[11px] font-mono mt-0.5">1920 x 1080 / 207만 화소</div>
                <div className="text-blue-300/70 text-[9px] mt-0.5 hidden md:block">1~2차로 주차 관제 / 글로벌 셔터</div>
              </div>
            </div>

            {/* HD Box - 33.3% width, 33.3% height */}
            <div
              onClick={() => setSelectedResId('hd')}
              className={`absolute bottom-0 left-0 w-[33.3%] h-[33.3%] bg-emerald-500/30 border-t-2 border-r-2 border-emerald-400 transition-all duration-300 cursor-pointer z-30 ${
                selectedResId === 'hd' ? 'ring-4 ring-emerald-400/50 bg-emerald-500/50' : 'hover:bg-emerald-500/45'
              }`}
            >
              {/* HD Dimension badge on top border */}
              <div className="absolute -top-3.5 right-1.5 px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/60 text-[10px] font-mono text-emerald-300 shadow">
                1280 x 720 (HD)
              </div>

              {/* HD Label Card placed in BOTTOM-LEFT of HD box */}
              <div className="absolute bottom-2 left-2 sm:bottom-2.5 sm:left-2.5 max-w-[150px] sm:max-w-[170px] bg-slate-900/95 backdrop-blur-md border border-emerald-500/60 rounded-xl p-1.5 sm:p-2 shadow-xl pointer-events-none z-30">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-emerald-300 font-bold text-xs sm:text-sm tracking-tight">HD</span>
                  <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-700/80">100만</span>
                </div>
                <div className="text-emerald-200/90 text-[9px] sm:text-[10px] font-mono mt-0.5">1280 x 720 (16:9)</div>
              </div>
            </div>

            {/* Visual scale guide label in bottom-right (away from all boxes) */}
            <div className="absolute bottom-3 right-3 z-40 bg-slate-900/95 border border-slate-700/90 px-3 py-1.5 rounded-xl text-[11px] text-slate-300 backdrop-blur-md flex items-center gap-1.5 shadow-lg pointer-events-none">
              <Eye className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">박스 영역을 클릭하면 하단 상세 제원이 즉시 전환됩니다</span>
              <span className="sm:hidden">박스 클릭 시 상세 전환</span>
            </div>
          </div>
          
          <p className="text-xs text-slate-400 text-center font-medium">
            * 위 시각화는 16:9 및 4:3 비율의 대략적인 면적(총 픽셀 수)을 비교하기 위한 예시입니다. 클릭하여 각 규격의 상세 제원을 확인할 수 있습니다.
          </p>

          {/* Active Selected Card Info Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-700">
            <div>
              <div className="text-[11px] text-slate-400 font-mono">선택된 규격</div>
              <div className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                <span>{activeRes.name}</span>
                {activeRes.recommended && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    추천
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400">{activeRes.subName}</div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 font-mono">해상도 & 총 화소수</div>
              <div className="text-base font-bold text-sky-400 font-mono mt-0.5">
                {activeRes.width.toLocaleString()} x {activeRes.height.toLocaleString()}
              </div>
              <div className="text-xs text-slate-300">
                약 {activeRes.megapixels}M (약 {Math.round(activeRes.megapixels * 100)}만 화소) · {activeRes.ratio}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 font-mono">ALPR 번호판 픽셀 폭 (1차로 3.5m)</div>
              <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                {activeRes.platePixels1Lane} px
              </div>
              <div className="text-xs text-slate-400">
                2차로(7m) 감시 시: <span className="text-slate-200 font-mono">{activeRes.platePixels2Lane} px</span>
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 font-mono">주 활용처 & 대역폭</div>
              <div className="text-xs font-semibold text-slate-200 mt-0.5 line-clamp-1">
                {activeRes.bestUseCase}
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                비트레이트: {activeRes.typicalBandwidth}
              </div>
            </div>
          </div>
        </section>

        {/* Interactive ALPR Pixels-Per-Meter (PPM) & Plate Width Calculator */}
        <section className="bg-slate-800/60 border border-slate-700/80 p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">ALPR 픽셀 밀도 (PPM) & 번호판 유효 폭 시뮬레이터</h2>
                <p className="text-xs text-slate-400">카메라 해상도와 차로 폭에 따라 국토교통부 표준(130px) 충족 여부를 실시간 산출합니다</p>
              </div>
            </div>
            <div className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300">
              한국 표준 번호판 규격: 520mm x 110mm
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Calculator Controls (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Select Camera Resolution */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>카메라 해상도 규격</span>
                  <span className="text-slate-400 font-mono">{calcRes.width} x {calcRes.height} px</span>
                </label>
                <select
                  value={calcResolutionId}
                  onChange={(e) => setCalcResolutionId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
                >
                  {RESOLUTION_DATA.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.width}x{r.height}) - 약 {r.megapixels}M
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Lane FOV Coverage */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
                  <span>차로 감시 폭 (Horizontal Field of View)</span>
                  <span className="text-sky-400 font-mono font-bold">{laneWidthMeters.toFixed(1)} m ({laneWidthMeters <= 3.5 ? '1개 차로' : laneWidthMeters <= 7.0 ? '2개 차로' : laneWidthMeters <= 10.5 ? '3개 차로' : '4개 차로'})</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { m: 3.5, label: '1차로 (3.5m)' },
                    { m: 7.0, label: '2차로 (7.0m)' },
                    { m: 10.5, label: '3차로 (10.5m)' },
                    { m: 14.0, label: '4차로 (14.0m)' }
                  ].map((preset) => (
                    <button
                      key={preset.m}
                      type="button"
                      onClick={() => setLaneWidthMeters(preset.m)}
                      className={`py-2 px-1 text-xs rounded-lg border font-medium transition-all text-center ${
                        laneWidthMeters === preset.m
                          ? 'bg-blue-600 border-blue-500 text-white font-bold shadow-md'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fine tuning slider */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>정밀 화각 조절:</span>
                  <span className="font-mono text-slate-300">{laneWidthMeters.toFixed(2)} m</span>
                </div>
                <input
                  type="range"
                  min="2.0"
                  max="16.0"
                  step="0.5"
                  value={laneWidthMeters}
                  onChange={(e) => setLaneWidthMeters(parseFloat(e.target.value))}
                  className="w-full accent-blue-500 bg-slate-700 h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* Quick Summary Pill */}
              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700/80 text-xs text-slate-300 space-y-1">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">미터당 픽셀(PPM):</span>
                  <span className="text-white font-bold">{ppm.toLocaleString()} PPM</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">실측 번호판 폭(520mm):</span>
                  <span className="text-sky-400 font-bold">{plateWidthPx} px</span>
                </div>
              </div>
            </div>

            {/* Dynamic Results & Simulated Plate Visual (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className={`p-5 rounded-2xl border transition-all ${plateQuality.bg}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">OCR 판독 가능성 진단</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${plateQuality.color} bg-slate-900/60`}>
                      {plateQuality.badge}
                    </span>
                  </div>
                  <span className={`text-base font-extrabold ${plateQuality.color}`}>
                    {plateQuality.level}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 my-3">
                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                    <div className="text-[11px] text-slate-400 font-mono">획득 번호판 픽셀 폭</div>
                    <div className="text-2xl font-black text-white font-mono mt-0.5 flex items-baseline gap-1">
                      <span>{plateWidthPx}</span>
                      <span className="text-xs text-slate-400 font-normal">px</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      최소 기준(130px) 대비: <span className={plateWidthPx >= 130 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {plateWidthPx >= 130 ? `+${plateWidthPx - 130}px 충족` : `${130 - plateWidthPx}px 부족`}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                    <div className="text-[11px] text-slate-400 font-mono">수평 미터당 픽셀 (PPM)</div>
                    <div className="text-2xl font-black text-sky-400 font-mono mt-0.5 flex items-baseline gap-1">
                      <span>{ppm}</span>
                      <span className="text-xs text-slate-400 font-normal">PPM</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      1cm당 약 {(ppm / 100).toFixed(1)}개 화소 할당
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {plateQuality.desc}
                </p>
              </div>

              {/* Real-time simulated license plate visual representation */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-blue-400" />
                    실시간 번호판 가상 렌더링 (실제 픽셀 폭 시뮬레이션)
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">폭 {plateWidthPx}px</span>
                </div>

                {/* Simulated Plate Card with scaling */}
                <div className="h-24 bg-slate-900 rounded-xl border border-slate-800/80 flex items-center justify-center overflow-hidden p-2">
                  <div
                    style={{
                      width: `${Math.min(Math.max(plateWidthPx, 80), 380)}px`,
                      filter: plateWidthPx < 110 ? 'blur(1.2px)' : plateWidthPx < 140 ? 'blur(0.5px)' : 'none'
                    }}
                    className="h-14 bg-white text-slate-900 rounded-md border-2 border-slate-800 shadow-md flex items-center justify-between px-3 relative transition-all"
                  >
                    {/* Hologram stripe */}
                    <div className="w-2 h-10 bg-gradient-to-b from-blue-600 via-sky-400 to-indigo-700 rounded-sm opacity-90 mr-2 flex-shrink-0"></div>
                    {/* Plate characters */}
                    <div className="flex-1 text-center font-black tracking-wider select-none text-base sm:text-xl font-mono text-slate-950">
                      123가 4567
                    </div>
                    <div className="text-[9px] font-bold text-blue-800 border border-blue-800/40 rounded px-1 flex-shrink-0">
                      KOR
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>← 520mm 실측 규격 →</span>
                  <span>{plateWidthPx < 130 ? '⚠️ 해상도 부족으로 번호판 글자 경계 블러링 발생' : '✓ 글자 경계 엣지 선명도 정상 확보'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data Table Section (카메라 픽셀 표현 방법 별 해상도 상세 표 - Core from User Source) */}
        <section className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/80 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Layers className="w-5 h-5" />
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  카메라 픽셀 표현 방법 별 해상도 상세 표
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                HD 계열, M (메가픽셀) 계열, K 계열 및 ITS 산업 규격별 해상도, 화소수, 종횡비, ALPR 픽셀 폭 완벽 비교
              </p>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="규격명 or 해상도 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full sm:w-44 font-medium"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700">
                {[
                  { id: 'all', label: '전체' },
                  { id: 'HD', label: 'HD 계열' },
                  { id: 'M', label: 'M 계열' },
                  { id: 'K', label: 'K 계열' },
                  { id: 'REC', label: '추천 규격' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setCategoryFilter(f.id)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                      categoryFilter === f.id
                        ? 'bg-blue-600 text-white shadow font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-2xl border border-slate-700 bg-slate-950/60 shadow-inner">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-900/90 text-slate-300 font-semibold border-b border-slate-700 font-mono text-[11px] sm:text-xs">
                <tr>
                  <th className="py-3.5 px-4">구분 / 계열</th>
                  <th className="py-3.5 px-4">규격 명칭</th>
                  <th className="py-3.5 px-4">해상도 (가로 x 세로)</th>
                  <th className="py-3.5 px-4 text-center">총 화소수</th>
                  <th className="py-3.5 px-4 text-center">종횡비</th>
                  <th className="py-3.5 px-4 text-center">1차로 번호판 폭</th>
                  <th className="py-3.5 px-4">주요 적용 분야 및 ALPR 특성</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredData.map((item) => {
                  const isSelected = selectedResId === item.id;
                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedResId(item.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-900/30 font-medium'
                          : 'hover:bg-slate-850 hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Category Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                            item.category === 'HD'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : item.category === 'M'
                              ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                              : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                          }`}
                        >
                          {item.categoryLabel}
                        </span>
                      </td>

                      {/* Name */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{item.name}</span>
                          {item.recommended && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/40">
                              추천
                            </span>
                          )}
                        </div>
                        {item.subName && (
                          <div className="text-[11px] text-slate-400 font-mono">{item.subName}</div>
                        )}
                      </td>

                      {/* Resolution */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-sky-400 whitespace-nowrap">
                        {item.width.toLocaleString()} x {item.height.toLocaleString()}
                      </td>

                      {/* Megapixels */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-200 whitespace-nowrap">
                        약 {item.megapixels}M
                        <div className="text-[10px] text-slate-400 font-normal">
                          ({(item.megapixels * 100).toFixed(0)}만 화소)
                        </div>
                      </td>

                      {/* Aspect Ratio */}
                      <td className="py-3.5 px-4 text-center font-mono text-slate-300 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-xs">
                          {item.ratio}
                        </span>
                      </td>

                      {/* ALPR Plate Pixels */}
                      <td className="py-3.5 px-4 text-center font-mono whitespace-nowrap">
                        <span
                          className={`font-bold px-2 py-0.5 rounded ${
                            item.platePixels1Lane >= 200
                              ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/30'
                              : item.platePixels1Lane >= 130
                              ? 'text-sky-400 bg-sky-950/40 border border-sky-500/30'
                              : 'text-rose-400 bg-rose-950/40 border border-rose-500/30'
                          }`}
                        >
                          {item.platePixels1Lane} px
                        </span>
                      </td>

                      {/* Description & Use Case */}
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="font-medium text-slate-200 line-clamp-1">{item.bestUseCase}</div>
                        <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">{item.notes}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Quick comparison legend */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-700/60">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span>최적 (200px+)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                <span>표준 충족 (130~199px)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                <span>주의 (130px 미만)</span>
              </span>
            </div>
            <span>* 1차로 3.5m FOV 기준 국토교통부 표준 번호판 520mm 폭 환산치</span>
          </div>
        </section>

        {/* Engineering Notes Section (엔지니어링 참고 사항 - Core from User Source) */}
        <section className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center gap-2.5 border-b border-slate-700/80 pb-4">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">엔지니어링 참고 사항 (Engineering Insights)</h2>
              <p className="text-xs text-slate-400">카메라 해상도 선정 시 하드웨어 엔지니어가 반드시 숙지해야 할 4대 핵심 원칙</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Note 1: Megapixel vs Video Resolution */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-700/80 space-y-2.5">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <Monitor className="w-4 h-4" />
                <span>1. 메가픽셀(M)과 비디오 규격(HD/4K)의 차이점</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white">메가픽셀(MegaPixel)</strong>은 센서가 보유한 가로 x 세로 총 물리적 수광 화소 수(1M = 100만 화소)를 의미하며, 
                <strong className="text-white"> 비디오 표준(HD/FHD/4K)</strong>은 방송 및 디스플레이에서 사용되는 16:9 고정 주사선 규격입니다.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                동일한 200만 화소라도 산업용 머신비전 센서(1600x1200, 4:3)와 CCTV 비디오 센서(1920x1080, 16:9)는 상하/좌우 시야각이 크게 달라지므로 렌즈 마운트 설계 시 센서의 광학 규격(Optical Format)을 반드시 확인해야 합니다.
              </p>
            </div>

            {/* Note 2: 4:3 vs 16:9 Aspect Ratio in ALPR */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-700/80 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>2. ALPR 현장에서 4:3 센서가 유리한 이유</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                차량 번호판 카메라는 위에서 아래로 진입하는 차량을 감시하므로 <strong className="text-white">수직 시야각(Vertical FOV)</strong>이 길수록 번호판이 화면에 머무는 시간(Frame Duration)이 길어집니다.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                16:9 규격(FHD)은 세로가 1080px로 좁아 차량이 고속(100km/h)으로 지날 때 5~8 프레임만 포착되지만, 4:3 규격(5M 2448x2048 또는 3M 2048x1536)은 세로가 2배 가까이 길어 15~20 프레임 이상 다중 샷을 확보하여 인식 실패율을 70% 이상 낮춥니다.
              </p>
            </div>

            {/* Note 3: Pixel Pitch vs Light Sensitivity */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-700/80 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Zap className="w-4 h-4" />
                <span>3. 고화소(4K/8M)의 역설: 야간 노이즈와 픽셀 피치</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                동일한 센서 다이 크기(예: 1/2.8인치)에서 화소 수를 2M에서 8M(4K)으로 늘리면 단위 픽셀 크기(Pixel Pitch)가 2.9µm에서 1.4µm로 급감합니다.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                픽셀 크기가 작아지면 수광량이 1/4로 줄어들어 야간 고속 셔터(1/1000초) 환경에서 샷 노이즈(Shot Noise)가 폭증합니다. 따라서 야간 조명 투과율이 낮은 환경에서는 4K 대신 픽셀 피치가 큰 2M(FHD) 또는 1/1.8인치 대형 5M 글로벌 셔터 센서가 훨씬 선명한 이미지를 제공합니다.
              </p>
            </div>

            {/* Note 4: Bandwidth & AI Inference Latency */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-700/80 space-y-2.5">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                <Cpu className="w-4 h-4" />
                <span>4. 엣지 AI 추론 연산량 및 VMS 스토리지 부하</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                4K 영상 스트림(3840x2160)은 FHD(1920x1080) 대비 데이터 용량과 AI 객체 검출(YOLO) 입력 텐서 연산량이 4배로 증가합니다.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                엣지 장치(JECS-7360B, Jetson Orin 등)에서 30fps 실시간 추론을 유지하려면 2M 해상도로 직접 추론하거나, 4K 카메라를 사용하더라도 ROI(차량 영역)만 동적 크롭하여 추론 모델에 전달하는 2-Stage 최적화 파이프라인이 필수적입니다.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
