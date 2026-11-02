import React, { useState, useMemo } from 'react';
import { 
  HardDrive, 
  Database, 
  Calculator, 
  Layers, 
  Sliders, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Server, 
  Clock, 
  Calendar, 
  Camera, 
  Video, 
  Image as ImageIcon, 
  ShieldCheck, 
  RefreshCw, 
  ArrowRight,
  TrendingDown,
  Table,
  Zap,
  Sparkles,
  BarChart2
} from 'lucide-react';
import { StorageBarChartComparison } from './StorageBarChartComparison';
import { CompressionOptimizationGuide } from './CompressionOptimizationGuide';

interface CodecConfig {
  id: string;
  name: string;
  category: 'video' | 'raw' | 'snapshot';
  description: string;
  // Base bitrate at 1080p 30fps in Mbps
  baseBitrate1080p30Mbps: number;
  compressionEfficiency: number; // vs H.264 baseline (1.0)
  color: string;
}

const CODEC_CONFIGS: CodecConfig[] = [
  { 
    id: 'h265_med', 
    name: 'H.265 / HEVC (표준 화질 - 권장)', 
    category: 'video', 
    description: 'H.264 대비 대역폭 및 스토리지 약 40~50% 절감. 최신 ITS 및 스마트 시티 NVR 표준 규격.', 
    baseBitrate1080p30Mbps: 2.5, 
    compressionEfficiency: 0.55,
    color: 'emerald'
  },
  { 
    id: 'h265_high', 
    name: 'H.265 / HEVC (고화질 - 디테일 중시)', 
    category: 'video', 
    description: '차량 번호판 및 탑승자 얼굴 세밀 식별을 위한 고품질 비트레이트 설정.', 
    baseBitrate1080p30Mbps: 4.0, 
    compressionEfficiency: 0.85,
    color: 'sky'
  },
  { 
    id: 'h264_med', 
    name: 'H.264 / AVC (표준 화질 - 높은 호환성)', 
    category: 'video', 
    description: '전 세계 거의 모든 NVR 및 웹 브라우저에서 라이선스 없이 하드웨어 가속 재생 가능.', 
    baseBitrate1080p30Mbps: 4.5, 
    compressionEfficiency: 1.0,
    color: 'blue'
  },
  { 
    id: 'h264_high', 
    name: 'H.264 / AVC (고화질)', 
    category: 'video', 
    description: '고속 주행 차량의 번호판 모션 블러 구간을 선명하게 기록하기 위한 고품질 모드.', 
    baseBitrate1080p30Mbps: 6.5, 
    compressionEfficiency: 1.45,
    color: 'indigo'
  },
  { 
    id: 'mjpeg', 
    name: 'MJPEG (프레임별 독립 압축)', 
    category: 'video', 
    description: '프레임 간 예측이 없어 찰나의 순간도 정밀 분석 가능하나 스토리지 소모량이 극도로 큼.', 
    baseBitrate1080p30Mbps: 28.0, 
    compressionEfficiency: 6.2,
    color: 'amber'
  },
  { 
    id: 'raw_rgb24', 
    name: '비압축 RAW 24-bit (무손실 연구용)', 
    category: 'raw', 
    description: '압축 손실 제로의 순수 센서 원본 데이터. AI 모델 학습용 정밀 계측 또는 단기 버퍼 전용.', 
    baseBitrate1080p30Mbps: 1493.0, // ~1.5 Gbps
    compressionEfficiency: 331.0,
    color: 'rose'
  },
  { 
    id: 'alpr_event_snapshot', 
    name: 'ALPR 이벤트 스냅샷 (전경+번호판)', 
    category: 'snapshot', 
    description: '차량 감지 시에만 고화질 JPEG(90% 퀄리티, 장당 약 450KB) 2장을 저장하는 이벤트 트리거 방식.', 
    baseBitrate1080p30Mbps: 0.15, // Calculated per vehicle event
    compressionEfficiency: 0.035,
    color: 'purple'
  }
];

interface ResolutionPreset {
  id: string;
  name: string;
  width: number;
  height: number;
  megapixels: number;
  pixelRatio: number; // relative to 1080p (1920x1080 = 1.0)
  useCase: string;
}

const RESOLUTION_PRESETS: ResolutionPreset[] = [
  { id: 'hd', name: 'HD (720p)', width: 1280, height: 720, megapixels: 0.92, pixelRatio: 0.444, useCase: '단일 차로 소형 주차장' },
  { id: 'fhd', name: 'FHD (1080p)', width: 1920, height: 1080, megapixels: 2.07, pixelRatio: 1.0, useCase: '국내 ITS 및 건물 관제 표준' },
  { id: '3m', name: '3M (QXGA)', width: 2048, height: 1536, megapixels: 3.15, pixelRatio: 1.517, useCase: '4:3 머신비전 전면 추적' },
  { id: '5m', name: '5M (Sony IMX264)', width: 2448, height: 2048, megapixels: 5.01, pixelRatio: 2.417, useCase: '고속도로 2차로 동시 단속' },
  { id: '4k_uhd', name: '4K UHD (2160p)', width: 3840, height: 2160, megapixels: 8.29, pixelRatio: 4.0, useCase: '3차로 다차선 광역 교차로' },
  { id: '12m', name: '12M (4000x3000)', width: 4000, height: 3000, megapixels: 12.0, pixelRatio: 5.787, useCase: '초광역 특수 감시 시스템' },
];

interface RaidMode {
  id: string;
  name: string;
  minDisks: number;
  efficiencyFormula: (n: number) => number; // Usable ratio
  faultTolerance: string;
  desc: string;
}

const RAID_MODES: RaidMode[] = [
  { id: 'none', name: '단일 디스크 (RAID 없음)', minDisks: 1, efficiencyFormula: () => 1.0, faultTolerance: '0대 (장애 복구 불가)', desc: '단일 드라이브 단순 저장. 디스크 고장 시 데이터 즉시 손실.' },
  { id: 'raid1', name: 'RAID 1 (미러링)', minDisks: 2, efficiencyFormula: () => 0.5, faultTolerance: '1대 허용', desc: '1:1 동일 복제. 스토리지 효율 50%, 최고 수준의 데이터 안정성.' },
  { id: 'raid5', name: 'RAID 5 (패리티 분산)', minDisks: 3, efficiencyFormula: (n) => (n - 1) / n, faultTolerance: '1대 허용', desc: 'NVR 및 NAS 표준 규격. 1대 고장 시 무중단 교체 가능.' },
  { id: 'raid6', name: 'RAID 6 (이중 패리티)', minDisks: 4, efficiencyFormula: (n) => (n - 2) / n, faultTolerance: '2대 허용', desc: '대규모 24/7 ITS 관제 센터 추천. 동시 2대 고장도 버팀.' },
  { id: 'raid10', name: 'RAID 10 (1+0 스트라이핑 미러)', minDisks: 4, efficiencyFormula: () => 0.5, faultTolerance: '그룹당 1대 허용', desc: '최고 속도 I/O 및 빠른 리빌드 보장. 고비용 아키텍처.' }
];

export const StorageCalculatorSection: React.FC = () => {
  // Calculator States
  const [selectedResId, setSelectedResId] = useState<string>('fhd');
  const [selectedCodecId, setSelectedCodecId] = useState<string>('h265_med');
  const [fps, setFps] = useState<number>(30);
  const [cameraCount, setCameraCount] = useState<number>(4);
  const [hoursPerDay, setHoursPerDay] = useState<number>(24); // 24 = 24/7 continuous
  const [retentionDays, setRetentionDays] = useState<number>(30); // 30 days standard
  
  // ALPR Event Snapshot specific states
  const [vehiclesPerDayPerLane, setVehiclesPerDayPerLane] = useState<number>(12000);
  const [snapshotsPerVehicle, setSnapshotsPerVehicle] = useState<number>(2); // 1 crop plate + 1 overview
  const [snapshotSizeKb, setSnapshotSizeKb] = useState<number>(450); // 450 KB average JPEG
  
  // RAID & Drive States
  const [selectedRaidId, setSelectedRaidId] = useState<string>('raid5');
  const [diskCount, setDiskCount] = useState<number>(4);
  const [driveCapacityTb, setDriveCapacityTb] = useState<number>(8); // 8TB surveillance drive
  const [driveUnitCostKrw, setDriveUnitCostKrw] = useState<number>(290000); // 290,000 KRW for 8TB WD Purple

  // Sub tab view: calculator, chart, matrix, event_vs_video, drive_guide, compression_guide
  const [activeSubTab, setActiveSubTab] = useState<'calculator' | 'chart' | 'matrix' | 'event_vs_video' | 'drive_guide' | 'compression_guide'>('calculator');

  // Selected Resolution & Codec objects
  const activeRes = useMemo(() => {
    return RESOLUTION_PRESETS.find(r => r.id === selectedResId) || RESOLUTION_PRESETS[1];
  }, [selectedResId]);

  const activeCodec = useMemo(() => {
    return CODEC_CONFIGS.find(c => c.id === selectedCodecId) || CODEC_CONFIGS[0];
  }, [selectedCodecId]);

  const activeRaid = useMemo(() => {
    return RAID_MODES.find(r => r.id === selectedRaidId) || RAID_MODES[2];
  }, [selectedRaidId]);

  // Calculations
  const calculations = useMemo(() => {
    let singleCameraBitrateMbps = 0;
    let singleCameraDailyBytes = 0;

    if (activeCodec.category === 'snapshot') {
      // Event-based Snapshot calculation
      const totalPhotosPerDay = vehiclesPerDayPerLane * snapshotsPerVehicle;
      singleCameraDailyBytes = totalPhotosPerDay * snapshotSizeKb * 1024; // in bytes
      // Equivalent average bitrate over operating hours
      const secondsOperating = hoursPerDay * 3600;
      singleCameraBitrateMbps = (singleCameraDailyBytes * 8) / secondsOperating / 1_000_000;
    } else if (activeCodec.id === 'raw_rgb24') {
      // Uncompressed 24-bit RAW
      const bpp = 24;
      singleCameraBitrateMbps = (activeRes.width * activeRes.height * bpp * fps) / 1_000_000;
      const secondsOperating = hoursPerDay * 3600;
      singleCameraDailyBytes = (singleCameraBitrateMbps * 1_000_000 / 8) * secondsOperating;
    } else {
      // Video Stream (H.265, H.264, MJPEG)
      // Bitrate scales with pixel count and FPS
      const pixelRatio = activeRes.pixelRatio;
      const fpsRatio = fps / 30;
      // Bitrate scaling is sub-linear for modern codecs (inter-frame redundancy improves with higher resolutions)
      const nonLinearPixelFactor = Math.pow(pixelRatio, 0.78);
      const nonLinearFpsFactor = Math.pow(fpsRatio, 0.85);
      
      singleCameraBitrateMbps = activeCodec.baseBitrate1080p30Mbps * nonLinearPixelFactor * nonLinearFpsFactor;
      const secondsOperating = hoursPerDay * 3600;
      singleCameraDailyBytes = (singleCameraBitrateMbps * 1_000_000 / 8) * secondsOperating;
    }

    // Daily Metrics
    const totalDailyGb = (singleCameraDailyBytes * cameraCount) / (1024 * 1024 * 1024);
    const totalDailyTb = totalDailyGb / 1024;

    // Retention Period Storage Required (Net Raw Data)
    const netStorageRequiredGb = totalDailyGb * retentionDays;
    const netStorageRequiredTb = netStorageRequiredGb / 1024;

    // Storage Overhead Factor:
    // Filesystem formatting (ext4/NTFS/ZFS takes ~7-10%) + 15% safety margin to prevent disk fragmentation & performance throttling
    const safetyOverheadMultiplier = 1.20; // 20% extra
    const recommendedNetTb = netStorageRequiredTb * safetyOverheadMultiplier;

    // RAID Usable Capacity
    const raidMinDisks = activeRaid.minDisks;
    const actualDisks = Math.max(raidMinDisks, diskCount);
    const raidEfficiency = activeRaid.efficiencyFormula(actualDisks);
    const totalRawDisksTb = actualDisks * driveCapacityTb;
    const usableRaidTb = totalRawDisksTb * raidEfficiency * 0.91; // 0.91 for decimal TB to binary TiB formatting

    // Capacity Satisfaction
    const isSufficient = usableRaidTb >= recommendedNetTb;
    const sufficiencyPercentage = (usableRaidTb / recommendedNetTb) * 100;
    const shortageTb = Math.max(0, recommendedNetTb - usableRaidTb);

    // Minimum Disks Required to meet recommended storage
    const minDisksRequired = Math.ceil(recommendedNetTb / (driveCapacityTb * raidEfficiency * 0.91));

    // Estimated Cost
    const totalHardwareCostKrw = actualDisks * driveUnitCostKrw;

    return {
      singleCameraBitrateMbps,
      singleCameraBitrateMBps: singleCameraBitrateMbps / 8,
      singleCameraDailyGb: singleCameraDailyBytes / (1024 * 1024 * 1024),
      totalDailyGb,
      totalDailyTb,
      netStorageRequiredTb,
      recommendedNetTb,
      actualDisks,
      raidEfficiency,
      totalRawDisksTb,
      usableRaidTb,
      isSufficient,
      sufficiencyPercentage,
      shortageTb,
      minDisksRequired,
      totalHardwareCostKrw
    };
  }, [
    activeRes, 
    activeCodec, 
    fps, 
    cameraCount, 
    hoursPerDay, 
    retentionDays, 
    vehiclesPerDayPerLane, 
    snapshotsPerVehicle, 
    snapshotSizeKb,
    activeRaid, 
    diskCount, 
    driveCapacityTb, 
    driveUnitCostKrw
  ]);

  // Export Summary to CSV
  const exportStorageReportCsv = () => {
    const headers = [
      '항목', '설정값', '단위'
    ];
    const rows = [
      ['해상도', `${activeRes.name} (${activeRes.width}x${activeRes.height})`, 'px'],
      ['비디오 코덱 / 포맷', activeCodec.name, '-'],
      ['프레임 속도 (FPS)', fps, 'FPS'],
      ['카메라 수량', cameraCount, '대'],
      ['일일 녹화 시간', hoursPerDay, '시간/일'],
      ['보관 기간 (Retention)', retentionDays, '일'],
      ['카메라 1대당 비트레이트', calculations.singleCameraBitrateMbps.toFixed(2), 'Mbps'],
      ['카메라 1대당 일일 용량', calculations.singleCameraDailyGb.toFixed(2), 'GB/일'],
      ['전체 카메라 일일 용량', calculations.totalDailyGb.toFixed(2), 'GB/일'],
      ['순수 필요 저장 공간', calculations.netStorageRequiredTb.toFixed(2), 'TB'],
      ['권장 스토리지 (20% 여유 포함)', calculations.recommendedNetTb.toFixed(2), 'TB'],
      ['선택 RAID 모드', activeRaid.name, '-'],
      ['장착 디스크 수량 및 용량', `${calculations.actualDisks} x ${driveCapacityTb}TB`, '드라이브'],
      ['실제 가용 용량 (RAID 적용)', calculations.usableRaidTb.toFixed(2), 'TB'],
      ['용량 충족 여부', calculations.isSufficient ? '적합 (충족)' : '용량 부족', '-'],
      ['예상 하드웨어 디스크 비용', calculations.totalHardwareCostKrw.toLocaleString(), '원']
    ];

    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ALPR_Storage_Calculation_${activeRes.id}_${retentionDays}days.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* 1. Header Banner */}
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-xs font-semibold text-sky-400 uppercase tracking-wider">
          <HardDrive className="w-3.5 h-3.5" />
          <span>Camera Storage Capacity & Retention Period Calculator</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              스토리지 용량 계산기
            </h1>
            <p className="text-slate-400 text-base sm:text-lg max-w-3xl mt-1 leading-relaxed">
              카메라 해상도(HD, FHD, 5M, 4K), 압축 코덱(H.265, H.264, MJPEG, RAW), FPS, 채널 수 및 보관 일수에 따라 
              필요한 스토리지 용량(TB)을 산출하고 RAID 배열 및 감시용 전용 드라이브 구성을 추천합니다.
            </p>
          </div>

          <button
            onClick={exportStorageReportCsv}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all text-xs font-semibold shrink-0 shadow-md"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>견적 리포트 CSV 내보내기</span>
          </button>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <div className="text-[11px] font-mono text-slate-400">FHD H.265 30일 보관 (1대)</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1">약 810 GB</div>
            <div className="text-[11px] text-slate-400 mt-0.5">2.5 Mbps 24/7 연속 녹화</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <div className="text-[11px] font-mono text-slate-400">4K UHD H.265 30일 보관 (1대)</div>
            <div className="text-xl sm:text-2xl font-black text-sky-400 font-mono mt-1">약 2.4 TB</div>
            <div className="text-[11px] text-slate-400 mt-0.5">7.4 Mbps 고화질 스트림</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <div className="text-[11px] font-mono text-slate-400">H.265 스토리지 절감율</div>
            <div className="text-xl sm:text-2xl font-black text-purple-400 font-mono mt-1">최대 45% 절감</div>
            <div className="text-[11px] text-slate-400 mt-0.5">H.264 대비 용량 반감</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <div className="text-[11px] font-mono text-slate-400">권장 안전 여유 마진</div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono mt-1">+20% 여유</div>
            <div className="text-[11px] text-slate-400 mt-0.5">FS 포맷 및 단편화 방지</div>
          </div>
        </div>
      </div>

      {/* 2. Sub Tabs Navigation */}
      <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'calculator', label: '인터랙티브 스토리지 계산기', icon: Calculator },
          { id: 'compression_guide', label: '압축 최적화 가이드 (포맷별 화질/효율)', icon: Sliders },
          { id: 'chart', label: '해상도별 용량 비교 차트 (Recharts)', icon: BarChart2 },
          { id: 'matrix', label: '해상도 & 보관일수 매트릭스', icon: Table },
          { id: 'event_vs_video', label: '연속 녹화 vs ALPR 이벤트 스냅샷 비교', icon: Layers },
          { id: 'drive_guide', label: '감시용 전용 드라이브 & RAID 가이드', icon: Server },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/25 font-bold scale-[1.02]'
                  : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/70'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Sub Tab Content */}
      <div className="max-w-7xl mx-auto">
        
        {/* VIEW 1: Interactive Storage Calculator */}
        {activeSubTab === 'calculator' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Parameter Sliders & Selectors (5 cols) */}
              <div className="lg:col-span-5 bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-7 space-y-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">카메라 파라미터</h3>
                      <p className="text-xs text-slate-400">해상도, 코덱, 채널 및 보관 기간 설정</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedResId('fhd');
                      setSelectedCodecId('h265_med');
                      setFps(30);
                      setCameraCount(4);
                      setRetentionDays(30);
                      setHoursPerDay(24);
                    }}
                    className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-mono hover:underline"
                  >
                    <RefreshCw className="w-3 h-3" /> 초기화
                  </button>
                </div>

                {/* 1. Resolution Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>카메라 해상도</span>
                    <span className="text-[11px] font-mono text-sky-400 font-normal">
                      {activeRes.width} x {activeRes.height} ({activeRes.megapixels}M)
                    </span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {RESOLUTION_PRESETS.map((res) => (
                      <button
                        key={res.id}
                        onClick={() => setSelectedResId(res.id)}
                        className={`p-2 rounded-xl text-xs font-medium border text-center transition-all ${
                          selectedResId === res.id
                            ? 'bg-sky-500 text-slate-950 font-bold border-sky-400 shadow-md'
                            : 'bg-slate-900/70 border-slate-700 hover:bg-slate-700/60 text-slate-300'
                        }`}
                      >
                        <div className="font-bold truncate">{res.name}</div>
                        <div className="text-[10px] opacity-75 font-mono">{res.megapixels}M</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Codec Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">비디오 코덱 / 압축 규격</label>
                  <select
                    value={selectedCodecId}
                    onChange={(e) => setSelectedCodecId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
                  >
                    {CODEC_CONFIGS.map((codec) => (
                      <option key={codec.id} value={codec.id}>
                        {codec.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/60 leading-relaxed">
                    {activeCodec.description}
                  </p>
                </div>

                {/* Conditional Settings: Event Snapshot vs Video Stream */}
                {activeCodec.category === 'snapshot' ? (
                  /* Snapshot Parameters */
                  <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/40 space-y-4">
                    <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4" />
                      <span>ALPR 이벤트 트리거 파라미터</span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">차로당 일일 통과 차량 수</span>
                        <span className="font-mono text-purple-300 font-bold">
                          {vehiclesPerDayPerLane.toLocaleString()} 대/일
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1000}
                        max={50000}
                        step={1000}
                        value={vehiclesPerDayPerLane}
                        onChange={(e) => setVehiclesPerDayPerLane(parseInt(e.target.value))}
                        className="w-full accent-purple-500 cursor-pointer"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block mb-1">차량당 사진 수</span>
                        <select
                          value={snapshotsPerVehicle}
                          onChange={(e) => setSnapshotsPerVehicle(parseInt(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                        >
                          <option value={1}>1장 (번호판 크롭)</option>
                          <option value={2}>2장 (전경 + 번호판)</option>
                          <option value={3}>3장 (입차+출차+차량)</option>
                        </select>
                      </div>

                      <div>
                        <span className="text-slate-400 block mb-1">장당 평균 크기</span>
                        <select
                          value={snapshotSizeKb}
                          onChange={(e) => setSnapshotSizeKb(parseInt(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                        >
                          <option value={250}>250 KB (고압축)</option>
                          <option value={450}>450 KB (표준 JPEG 90%)</option>
                          <option value={800}>800 KB (고화질 JPEG 95%)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Frame Rate (FPS) Slider for Video */
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-medium">프레임 속도 (FPS)</span>
                      <span className="font-mono text-sky-400 font-bold text-sm">{fps} FPS</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={60}
                      step={5}
                      value={fps}
                      onChange={(e) => setFps(parseInt(e.target.value))}
                      className="w-full accent-sky-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>10 FPS (주차장)</span>
                      <span>30 FPS (일반 ITS)</span>
                      <span>60 FPS (고속도로)</span>
                    </div>
                  </div>
                )}

                {/* 3. Number of Cameras */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium">카메라 수량 (채널)</span>
                    <span className="font-mono text-sky-400 font-bold text-sm">{cameraCount} 대</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={64}
                    step={1}
                    value={cameraCount}
                    onChange={(e) => setCameraCount(parseInt(e.target.value))}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>1대 (단일)</span>
                    <span>4대 (소형)</span>
                    <span>16대 (중형)</span>
                    <span>32대 (대형)</span>
                    <span>64대 (광역)</span>
                  </div>
                </div>

                {/* 4. Operating Hours & Retention Days */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-700/60">
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">일일 녹화 시간</label>
                    <select
                      value={hoursPerDay}
                      onChange={(e) => setHoursPerDay(parseInt(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value={8}>8시간 (주간 영업 시간)</option>
                      <option value={12}>12시간 (반일)</option>
                      <option value={24}>24시간 (24/7 연속 녹화)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">보관 기간 (일수)</label>
                    <select
                      value={retentionDays}
                      onChange={(e) => setRetentionDays(parseInt(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value={7}>7일 (1주 단기)</option>
                      <option value={14}>14일 (2주)</option>
                      <option value={30}>30일 (1개월 표준)</option>
                      <option value={60}>60일 (2개월)</option>
                      <option value={90}>90일 (3개월 법정 권장)</option>
                      <option value={180}>180일 (반년)</option>
                      <option value={365}>365일 (1년 장기 보관)</option>
                    </select>
                  </div>
                </div>

                {/* 5. RAID & Hardware Specs */}
                <div className="space-y-3 pt-3 border-t border-slate-700/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-sky-400" />
                      <span>RAID 모드 및 디스크 구성</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">NVR / NAS 스토리지</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">RAID 레벨</label>
                      <select
                        value={selectedRaidId}
                        onChange={(e) => setSelectedRaidId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white"
                      >
                        {RAID_MODES.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">디스크 수량</label>
                      <select
                        value={diskCount}
                        onChange={(e) => setDiskCount(parseInt(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-mono text-white"
                      >
                        {[1, 2, 4, 6, 8, 12, 16, 24].map((count) => (
                          <option key={count} value={count}>
                            {count} 베이 (Bay)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">드라이브 1개 용량</label>
                      <select
                        value={driveCapacityTb}
                        onChange={(e) => setDriveCapacityTb(parseInt(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-mono text-white"
                      >
                        <option value={4}>4 TB (소형 NVR)</option>
                        <option value={8}>8 TB (가장 인기 규격)</option>
                        <option value={12}>12 TB (기업용 표준)</option>
                        <option value={16}>16 TB (대용량)</option>
                        <option value={20}>20 TB (초고밀도)</option>
                        <option value={24}>24 TB (최신 플래그십)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">개당 예상 단가 (원)</label>
                      <input
                        type="number"
                        step={10000}
                        value={driveUnitCostKrw}
                        onChange={(e) => setDriveUnitCostKrw(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-mono text-white"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Calculated Results & Sizing Diagnosis (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Total Storage Requirement Card */}
                <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-700/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
                  
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/80 pb-4">
                    <div>
                      <span className="text-xs font-mono text-slate-400">총 필요 스토리지 용량 ({retentionDays}일 보관)</span>
                      <h4 className="text-3xl sm:text-4xl font-black text-white flex items-center gap-3 mt-1">
                        <span className="text-sky-400 font-mono">
                          {calculations.recommendedNetTb.toFixed(2)} TB
                        </span>
                        <span className="text-xs font-normal px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300">
                          20% 여유 마진 포함
                        </span>
                      </h4>
                      <div className="text-xs text-slate-400 mt-1">
                        순수 원본 데이터: <strong className="text-slate-200 font-mono">{calculations.netStorageRequiredTb.toFixed(2)} TB</strong> (
                        일일 생성량: {calculations.totalDailyGb.toFixed(1)} GB/일)
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-xs font-mono text-slate-400">카메라 1대당 비트레이트</span>
                      <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">
                        {calculations.singleCameraBitrateMbps.toFixed(2)} Mbps
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        초당 {calculations.singleCameraBitrateMBps.toFixed(2)} MB/s 전송
                      </div>
                    </div>
                  </div>

                  {/* Sizing Status Banner */}
                  <div className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    calculations.isSufficient 
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${calculations.isSufficient ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {calculations.isSufficient ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                      </div>
                      <div>
                        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">스토리지 배열 평가 결과</div>
                        <div className="text-lg font-black text-white">
                          {calculations.isSufficient ? '용량 충족 (적합)' : '용량 부족 경고'}
                        </div>
                        <div className="text-xs text-slate-300">
                          {calculations.isSufficient 
                            ? `설정된 보관 일수(${retentionDays}일)를 ${calculations.sufficiencyPercentage.toFixed(0)}% 수준으로 여유롭게 충족합니다.` 
                            : `최소 ${calculations.shortageTb.toFixed(1)} TB가 부족합니다. 드라이브 수량 또는 용량을 늘려주세요.`}
                        </div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <div className="text-[11px] font-mono text-slate-400">실제 가용 용량 (RAID 적용)</div>
                      <div className="text-xl font-black text-white font-mono">
                        {calculations.usableRaidTb.toFixed(2)} TB
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        장착 총 용량: {calculations.totalRawDisksTb} TB
                      </div>
                    </div>
                  </div>

                  {/* Storage Utilization Gauge */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-300">
                        스토리지 가용 공간 점유율: 
                        <strong className="text-white ml-1 font-bold">
                          {((calculations.recommendedNetTb / calculations.usableRaidTb) * 100).toFixed(1)}%
                        </strong>
                      </span>
                      <span className={calculations.isSufficient ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {calculations.isSufficient ? '안전 권장 범위' : '오버플로우 위험'}
                      </span>
                    </div>

                    <div className="w-full h-4 rounded-full bg-slate-950 border border-slate-700 overflow-hidden relative">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          calculations.isSufficient
                            ? 'bg-gradient-to-r from-sky-500 via-emerald-400 to-emerald-500'
                            : 'bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600'
                        }`}
                        style={{ width: `${Math.min(100, (calculations.recommendedNetTb / calculations.usableRaidTb) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>0 TB</span>
                      <span>권장 필요량: {calculations.recommendedNetTb.toFixed(1)} TB</span>
                      <span>가용 한계: {calculations.usableRaidTb.toFixed(1)} TB</span>
                    </div>
                  </div>

                  {/* Hardware Breakdown Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-700/80">
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-mono">선택 RAID 구성</div>
                      <div className="text-sm font-bold text-white mt-0.5">{activeRaid.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{activeRaid.faultTolerance}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-mono">디스크 장착 구성</div>
                      <div className="text-sm font-bold text-sky-400 font-mono mt-0.5">
                        {calculations.actualDisks}개 × {driveCapacityTb}TB
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">효율: {(calculations.raidEfficiency * 100).toFixed(0)}%</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-mono">최소 권장 베이 수</div>
                      <div className="text-sm font-bold text-purple-400 font-mono mt-0.5">
                        최소 {calculations.minDisksRequired} 베이
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">({driveCapacityTb}TB 기준)</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-mono">예상 디스크 비용</div>
                      <div className="text-sm font-bold text-amber-400 font-mono mt-0.5">
                        약 {(calculations.totalHardwareCostKrw / 10000).toLocaleString()}만원
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">개당 {driveUnitCostKrw.toLocaleString()}원</div>
                    </div>
                  </div>

                </div>

                {/* Practical Engineering Recommendations Card */}
                <div className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-3">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <Info className="w-4 h-4 text-sky-400" />
                    <span>ALPR 스토리지 사이징 현장 엔지니어 팁</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                    <li className="flex items-start gap-1.5">
                      <span className="text-sky-400 font-bold">•</span>
                      <span>
                        <strong>20% 추가 여유 마진의 이유:</strong> NVR 스토리지 점유율이 90%를 초과하면 파일시스템(XFS/ext4) 인덱싱 지연 및 드라이브 헤드 단편화로 연속 쓰기 속도가 급락하여 프레임 드랍이 발생합니다.
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-sky-400 font-bold">•</span>
                      <span>
                        <strong>H.265 코덱 전환 권장:</strong> 5M 및 4K 해상도 환경에서는 H.264 대비 H.265 적용 시 디스크 비용이 수백만 원 단위로 절감되므로, H.265 하드웨어 인코딩을 지원하는 카메라를 적극 권장합니다.
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-sky-400 font-bold">•</span>
                      <span>
                        <strong>감시 전용 드라이브(AllFrame / ImagePerfect) 필수:</strong> 일반 PC용 데스크톱 HDD는 8시간/일 쓰기에 맞춰져 있어, 24/7 지속 쓰기 환경에서 1년 내 베어링 및 헤드 고장률이 3배 이상 폭증합니다.
                      </span>
                    </li>
                  </ul>
                </div>

              </div>

            </div>

            {/* Recharts Resolution Bar Chart Comparison Component */}
            <StorageBarChartComparison
              mode="video"
              cameraCount={cameraCount}
              retentionDays={retentionDays}
              selectedResolutionId={selectedResId}
              onSelectResolution={setSelectedResId}
            />

            {/* Quick Callout to Compression Optimization Guide */}
            <div className="bg-gradient-to-r from-emerald-950/40 via-slate-800 to-sky-950/40 p-6 rounded-3xl border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>이미지 파일 포맷별 압축 효율과 화질 손실 최적화 가이드</span>
                </div>
                <p className="text-xs text-slate-300">
                  JPEG(95%~65%), WebP(95%~75%), PNG, RAW 포맷별 PSNR/SSIM 지표, 번호판 OCR 인식 보존율 및 1년 스토리지 비용 비교를 확인하세요.
                </p>
              </div>
              <button
                onClick={() => setActiveSubTab('compression_guide')}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shrink-0 transition-all shadow-md"
              >
                <span>압축 최적화 가이드 열기</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* VIEW: Dedicated Resolution Storage Bar Chart (Recharts) */}
        {activeSubTab === 'chart' && (
          <div className="space-y-6 animate-fadeIn">
            <StorageBarChartComparison
              mode="video"
              cameraCount={cameraCount}
              retentionDays={retentionDays}
              selectedResolutionId={selectedResId}
              onSelectResolution={setSelectedResId}
            />
          </div>
        )}

        {/* VIEW 2: Resolution & Retention Matrix Table */}
        {activeSubTab === 'matrix' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">해상도별 보관 기간(일수) 스토리지 비교 매트릭스</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    카메라 1대 기준, 24시간 연속 녹화(H.265 표준 30 FPS vs H.264 표준 30 FPS) 시 필요 용량 비교 (GB / TB)
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>H.265 적용 시 평균 45% 용량 절감</span>
                </div>
              </div>

              {/* Matrix Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-700 shadow-inner">
                <table className="w-full text-left text-sm text-slate-200">
                  <thead className="bg-slate-900/90 text-xs uppercase text-slate-400 font-mono border-b border-slate-700">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">해상도 규격</th>
                      <th className="py-3.5 px-4 font-semibold text-center">비트레이트 (H.265 / H.264)</th>
                      <th className="py-3.5 px-4 font-semibold text-right">1일 (24h)</th>
                      <th className="py-3.5 px-4 font-semibold text-right">7일 (1주)</th>
                      <th className="py-3.5 px-4 font-semibold text-right">30일 (1개월)</th>
                      <th className="py-3.5 px-4 font-semibold text-right">90일 (3개월)</th>
                      <th className="py-3.5 px-4 font-semibold">추천 드라이브 사양 (카메라 4대 30일 기준)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono text-xs sm:text-sm">
                    {[
                      { res: 'HD (720p)', h265Rate: '1.4 Mbps', h264Rate: '2.5 Mbps', d1: '15 GB', d7: '105 GB', d30: '450 GB', d90: '1.35 TB', rec: '4TB 단일 or RAID 1' },
                      { res: 'FHD (1080p)', h265Rate: '2.5 Mbps', h264Rate: '4.5 Mbps', d1: '27 GB', d7: '189 GB', d30: '810 GB', d90: '2.43 TB', rec: '8TB 2~4베이 (RAID 5 권장)' },
                      { res: '3M (QXGA 4:3)', h265Rate: '3.5 Mbps', h264Rate: '6.3 Mbps', d1: '38 GB', d7: '265 GB', d30: '1.13 TB', d90: '3.40 TB', rec: '8TB 4베이 (RAID 5)' },
                      { res: '5M (머신비전)', h265Rate: '5.0 Mbps', h264Rate: '9.0 Mbps', d1: '54 GB', d7: '378 GB', d30: '1.62 TB', d90: '4.86 TB', rec: '12TB 4베이 (RAID 5)' },
                      { res: '4K UHD (8M)', h265Rate: '7.4 Mbps', h264Rate: '13.3 Mbps', d1: '80 GB', d7: '560 GB', d30: '2.40 TB', d90: '7.20 TB', rec: '16TB 4~8베이 (RAID 6 권장)' },
                      { res: '12M (산업용)', h265Rate: '10.5 Mbps', h264Rate: '18.9 Mbps', d1: '113 GB', d7: '794 GB', d30: '3.40 TB', d90: '10.2 TB', rec: '20TB 8베이 엔터프라이즈 NVR' }
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 px-4 font-sans font-bold text-white">
                          {row.res}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono">
                          <span className="text-emerald-400 font-bold">{row.h265Rate}</span>
                          <span className="text-slate-500 mx-1">/</span>
                          <span className="text-blue-400">{row.h264Rate}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-300 font-bold">{row.d1}</td>
                        <td className="py-3.5 px-4 text-right text-slate-300 font-bold">{row.d7}</td>
                        <td className="py-3.5 px-4 text-right text-sky-400 font-bold">{row.d30}</td>
                        <td className="py-3.5 px-4 text-right text-purple-400 font-bold">{row.d90}</td>
                        <td className="py-3.5 px-4 font-sans text-xs text-slate-300">
                          {row.rec}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Explanatory note */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-300 leading-relaxed space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-sky-400" />
                  <span>비트레이트 및 스토리지 공식 산출 기준</span>
                </div>
                <div>
                  * 위 수치는 VBR(가변 비트레이트) 평균값 기준이며 도로의 야간 노이즈(어두울 때 센서 게인 상승으로 압축 효율 저하)와 우천 환경을 고려한 실전 필드 수치입니다.
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VIEW 3: Event-Based Snapshot vs 24/7 Continuous Recording */}
        {activeSubTab === 'event_vs_video' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-slate-700/80 pb-4">
                <h3 className="text-xl font-bold text-white tracking-tight">ALPR 이벤트 스냅샷 vs 24/7 연속 녹화 스토리지 효율 비교</h3>
                <p className="text-xs text-slate-400 mt-1">
                  차량 번호판 단속 전용 시스템에서 영상 스트림 녹화 대신 이벤트 사진 저장 시 발생하는 스토리지 절감 효과
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Method 1: Continuous 24/7 Video */}
                <div className="p-6 rounded-2xl bg-slate-900/90 border-2 border-slate-700/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                        <Video className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base">24/7 연속 비디오 녹화 (Video Stream)</h4>
                        <span className="text-[11px] text-slate-400">FHD 30 FPS H.265 기준</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono">기존 CCTV 방식</span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                    <div className="flex justify-between py-1.5 border-b border-slate-800">
                      <span className="text-slate-400">일일 생성 용량:</span>
                      <strong className="text-white font-mono">약 27.0 GB / 일</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800">
                      <span className="text-slate-400">30일 보관 시 용량 (4대):</span>
                      <strong className="text-white font-mono">약 3.24 TB</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800">
                      <span className="text-slate-400">1년 보관 시 용량 (4대):</span>
                      <strong className="text-amber-400 font-mono">약 39.4 TB</strong>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300 pt-2">
                    <div className="font-bold text-white">장점:</div>
                    <div className="text-slate-400">• 차량 진입 전후의 맥락, 신호 위반, 차선 변경 등 사고 상황 완벽 재생 가능.</div>
                    <div className="font-bold text-white pt-2">단점:</div>
                    <div className="text-slate-400">• 차가 지나가지 않는 심야 시간에도 디스크를 지속 소모하여 NVR 비용 급증.</div>
                  </div>
                </div>

                {/* Method 2: Event-Based ALPR Snapshot */}
                <div className="p-6 rounded-2xl bg-slate-900/90 border-2 border-emerald-500/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base">ALPR 이벤트 스냅샷 저장 (Snapshot Trigger)</h4>
                        <span className="text-[11px] text-slate-400">24GHz 레이더/AI 감지 시에만 저장</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">스마트 ITS 방식</span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                    <div className="flex justify-between py-1.5 border-b border-slate-800">
                      <span className="text-slate-400">일일 생성 용량 (12,000대/일, 사진 2장):</span>
                      <strong className="text-emerald-400 font-mono">약 10.8 GB / 일</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800">
                      <span className="text-slate-400">30일 보관 시 용량 (4차로):</span>
                      <strong className="text-emerald-400 font-mono">약 1.30 TB (-60% 절감)</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800">
                      <span className="text-slate-400">1년 보관 시 용량 (4차로):</span>
                      <strong className="text-emerald-400 font-mono">약 15.8 TB (-23.6 TB 절감)</strong>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300 pt-2">
                    <div className="font-bold text-white">장점:</div>
                    <div className="text-slate-400">• 스토리지 요구량 60% 이상 절감 및 데이터베이스(SQL) 검색 속도 초고속화.</div>
                    <div className="font-bold text-white pt-2">최적 권장 아키텍처 (하이브리드):</div>
                    <div className="text-slate-400">• 번호판 사진 + 메타데이터는 1년 영구 보관, 연속 비디오는 7일 후 덮어쓰기 순환.</div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* VIEW 4: Surveillance HDD & RAID Guide */}
        {activeSubTab === 'drive_guide' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-slate-700/80 pb-4">
                <h3 className="text-xl font-bold text-white tracking-tight">감시용 전용 드라이브(Surveillance HDD) 및 RAID 설계 지침</h3>
                <p className="text-xs text-slate-400 mt-1">
                  일반 데스크톱 HDD와 감시 전용 드라이브의 차이 및 무중단 ITS 관제 센터 구축 규격
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Spec 1: AllFrame / ImagePerfect */}
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-3">
                  <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                    <HardDrive className="w-4 h-4" />
                    <span>ATA 스트리밍 명령어 펌웨어</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    일반 HDD는 읽기 오류 발생 시 재시도(Retry)로 쓰기 버퍼가 멈추며 프레임이 손실됩니다. 
                    <strong> WD Purple (AllFrame)</strong> 및 <strong>Seagate SkyHawk (ImagePerfect)</strong>는 
                    비디오 패킷 누락을 방지하고 최대 64대 카메라 동시 스트림을 무결점으로 저장합니다.
                  </p>
                </div>

                {/* Spec 2: Workload Rating */}
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Clock className="w-4 h-4" />
                    <span>연간 워크로드 (180~550 TB/yr)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    일반 PC용 드라이브는 연간 55 TBW 기준 설계이나, NVR 전용 드라이브는 연간 <strong>180~550 TBW</strong>의 
                    가혹한 24/7 연속 쓰기를 견디며 MTBF(평균 무고장 시간) 150만~250만 시간을 보장합니다.
                  </p>
                </div>

                {/* Spec 3: RV Sensors */}
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-3">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                    <Server className="w-4 h-4" />
                    <span>회전 진동 센서 (RV Sensors)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    4베이 이상의 랙마운트 섀시에서는 인접 드라이브들의 고속 회전 진동(Rotational Vibration)으로 
                    헤드가 트랙을 이탈할 수 있습니다. 엔터프라이즈 감시용 드라이브에는 RV 센서가 내장되어 진동을 능동 상쇄합니다.
                  </p>
                </div>

              </div>

              {/* RAID Comparison Table */}
              <div className="pt-4 space-y-3">
                <h4 className="font-bold text-white text-sm">ITS 관제 센터 추천 RAID 배열 비교</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-700/80 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-emerald-400 text-sm">RAID 5 (표준)</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">추천 (3~8베이)</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      1개 디스크 분량 패리티 분산. 가용 용량 (N-1)/N. 가성비와 안정성의 최고 균형으로 일반 ALPR NVR 기본 구성.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-700/80 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sky-400 text-sm">RAID 6 (고신뢰)</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-700">대규모 ITS (8베이+)</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      이중 패리티 분산. 디스크 2대 동시 고장 시에도 데이터 무손실. 16TB+ 대용량 리빌드 중 2차 고장 위험 완벽 방지.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-700/80 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-purple-400 text-sm">RAID 10 (초고속)</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-700">초고속 I/O 딥러닝</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      1+0 미러링+스트라이핑. 용량 효율은 50%로 낮으나 패리티 연산 부하가 전혀 없어 실시간 수십 채널 4K 녹화 및 AI 추론에 최적.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VIEW 5: Compression Optimization Guide (압축 최적화 가이드) */}
        {activeSubTab === 'compression_guide' && (
          <CompressionOptimizationGuide />
        )}

      </div>

    </div>
  );
};
