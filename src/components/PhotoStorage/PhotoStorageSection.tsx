import React, { useState, useMemo } from 'react';
import { 
  Images, 
  FolderArchive, 
  HardDrive, 
  Calculator, 
  Download, 
  Layers, 
  Sliders, 
  Info, 
  CheckCircle2, 
  FileText, 
  Zap, 
  Maximize2, 
  Table, 
  ShieldCheck, 
  RefreshCw,
  Server,
  Cloud,
  Clock,
  Sparkles,
  ExternalLink,
  ArrowRight,
  BarChart2
} from 'lucide-react';
import { StorageBarChartComparison } from '../Storage/StorageBarChartComparison';

interface PhotoResolutionSpec {
  id: string;
  name: string;
  subName: string;
  width: number;
  height: number;
  megapixels: number;
  aspectRatio: string;
  sampleImgUrl: string;
  useCase: string;
  // File size estimates in KB for standard color photo
  sizeEstimatesKb: {
    jpeg90: number; // 90% quality standard
    jpeg95: number; // 95% quality high
    jpeg80: number; // 80% quality compressed
    webp: number;   // WebP lossy
    png: number;    // PNG 24-bit lossless
    raw24: number;  // Uncompressed RAW 24-bit (width * height * 3 / 1024)
  };
  recommendedForALPR: boolean;
}

const PHOTO_RESOLUTIONS: PhotoResolutionSpec[] = [
  {
    id: 'hd',
    name: 'HD (720p)',
    subName: '1280 x 720 / 92만 화소',
    width: 1280,
    height: 720,
    megapixels: 0.92,
    aspectRatio: '16:9',
    sampleImgUrl: '/sample-cars/normal.jpg',
    useCase: '단일 차로 소형 주차장, 진출입 차단기 게이트 전용',
    sizeEstimatesKb: {
      jpeg90: 185,
      jpeg95: 310,
      jpeg80: 120,
      webp: 130,
      png: 1420,
      raw24: 2700 // 1280 * 720 * 3 / 1024 = 2,700 KB (2.64 MB)
    },
    recommendedForALPR: false
  },
  {
    id: 'fhd',
    name: 'FHD (1080p)',
    subName: '1920 x 1080 / 207만 화소',
    width: 1920,
    height: 1080,
    megapixels: 2.07,
    aspectRatio: '16:9',
    sampleImgUrl: '/sample-cars/Cars1.png',
    useCase: '국내 공공 ITS 및 빌딩 주차 관제 표준 해상도 (AR0234)',
    sizeEstimatesKb: {
      jpeg90: 420,
      jpeg95: 720,
      jpeg80: 280,
      webp: 295,
      png: 3180,
      raw24: 6075 // 1920 * 1080 * 3 / 1024 = 6,075 KB (5.93 MB)
    },
    recommendedForALPR: true
  },
  {
    id: '3m',
    name: '3M (QXGA)',
    subName: '2048 x 1536 / 315만 화소',
    width: 2048,
    height: 1536,
    megapixels: 3.15,
    aspectRatio: '4:3',
    sampleImgUrl: '/sample-cars/cali.jpg',
    useCase: '4:3 산업용 머신비전 카메라, 접근 차량 수직 추적 최적화',
    sizeEstimatesKb: {
      jpeg90: 640,
      jpeg95: 1100,
      jpeg80: 430,
      webp: 450,
      png: 4850,
      raw24: 9216 // 2048 * 1536 * 3 / 1024 = 9,216 KB (9.0 MB)
    },
    recommendedForALPR: false
  },
  {
    id: '5m',
    name: '5M (Sony IMX264)',
    subName: '2448 x 2048 / 501만 화소',
    width: 2448,
    height: 2048,
    megapixels: 5.01,
    aspectRatio: '1.2:1 (4:3.3)',
    sampleImgUrl: '/sample-cars/realtime.jpg',
    useCase: '고속도로 2차로 동시 단속 표준, ITS 하이웨이 톨게이트',
    sizeEstimatesKb: {
      jpeg90: 980,
      jpeg95: 1720,
      jpeg80: 660,
      webp: 690,
      png: 7850,
      raw24: 14688 // 2448 * 2048 * 3 / 1024 = 14,688 KB (14.34 MB)
    },
    recommendedForALPR: true
  },
  {
    id: '4k_uhd',
    name: '4K UHD (2160p)',
    subName: '3840 x 2160 / 829만 화소',
    width: 3840,
    height: 2160,
    megapixels: 8.29,
    aspectRatio: '16:9',
    sampleImgUrl: '/sample-cars/test-new.jpg',
    useCase: '3차로 다차선 동시 감시, 광역 교차로 꼬리물기·불법유턴 단속',
    sizeEstimatesKb: {
      jpeg90: 1680,
      jpeg95: 2950,
      jpeg80: 1120,
      webp: 1180,
      png: 12900,
      raw24: 24300 // 3840 * 2160 * 3 / 1024 = 24,300 KB (23.73 MB)
    },
    recommendedForALPR: true
  },
  {
    id: '12m',
    name: '12M (Industrial)',
    subName: '4000 x 3000 / 1200만 화소',
    width: 4000,
    height: 3000,
    megapixels: 12.0,
    aspectRatio: '4:3',
    sampleImgUrl: '/sample-cars/Cars100.png',
    useCase: '초광역 파노라마 도시 관제, 물류센터 컨테이너 인식',
    sizeEstimatesKb: {
      jpeg90: 2450,
      jpeg95: 4300,
      jpeg80: 1640,
      webp: 1720,
      png: 18800,
      raw24: 35156 // 4000 * 3000 * 3 / 1024 = 35,156 KB (34.33 MB)
    },
    recommendedForALPR: false
  }
];

interface ImageFormatOption {
  id: 'jpeg90' | 'jpeg95' | 'jpeg80' | 'webp' | 'png' | 'raw24';
  name: string;
  ext: string;
  description: string;
  lossless: boolean;
  color: string;
}

const IMAGE_FORMATS: ImageFormatOption[] = [
  { id: 'jpeg90', name: 'JPEG (표준 90% 퀄리티 - 권장)', ext: '.jpg', description: '화질 손실 없이 파일 크기를 85~90% 압축. 국내외 ALPR 단속 스냅샷 표준 규격.', lossless: false, color: 'emerald' },
  { id: 'jpeg95', name: 'JPEG (고화질 95% 퀄리티)', ext: '.jpg', description: '압축 아티팩트를 극소화하여 번호판 미세 볼트 및 위조 홀로그램 정밀 감식.', lossless: false, color: 'sky' },
  { id: 'jpeg80', name: 'JPEG (고압축 80% 퀄리티)', ext: '.jpg', description: '대역폭과 디스크 용량을 최우선 절약할 때 사용하는 컴팩트 규격.', lossless: false, color: 'blue' },
  { id: 'webp', name: 'WebP (현대적 손실 압축)', ext: '.webp', description: '동일 화질 기준 JPEG 대비 약 25~30% 추가 용량 절감. 최신 클라우드 표준.', lossless: false, color: 'purple' },
  { id: 'png', name: 'PNG (24비트 무손실 압축)', ext: '.png', description: '손실 없는 완벽한 원본 복원. 번호판 텍스트 외곽선이 100% 선명하나 용량이 큼.', lossless: true, color: 'amber' },
  { id: 'raw24', name: '비압축 RAW 24-bit (순수 픽셀)', ext: '.raw / .bmp', description: '센서 픽셀당 3바이트(RGB) 무압축. AI 모델 훈련용 정밀 계측 전용.', lossless: true, color: 'rose' },
];

export const PhotoStorageSection: React.FC = () => {
  // State for Calculator
  const [selectedResId, setSelectedResId] = useState<string>('fhd');
  const [selectedFormatId, setSelectedFormatId] = useState<'jpeg90' | 'jpeg95' | 'jpeg80' | 'webp' | 'png' | 'raw24'>('jpeg90');
  const [photoCount, setPhotoCount] = useState<number>(1000); // 1,000 photos default as requested
  const [clusterSizeKb, setClusterSizeKb] = useState<number>(4); // 4KB cluster standard
  const [activeSubView, setActiveSubView] = useState<'gallery' | 'calculator' | 'chart' | 'matrix' | 'filesystem'>('gallery');
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Active Resolution & Format
  const activeRes = useMemo(() => {
    return PHOTO_RESOLUTIONS.find(r => r.id === selectedResId) || PHOTO_RESOLUTIONS[1];
  }, [selectedResId]);

  const activeFormat = useMemo(() => {
    return IMAGE_FORMATS.find(f => f.id === selectedFormatId) || IMAGE_FORMATS[0];
  }, [selectedFormatId]);

  // Calculations for Photo Storage
  const calculations = useMemo(() => {
    // 1 image size in KB
    const singleImageKb = activeRes.sizeEstimatesKb[selectedFormatId];
    const singleImageMb = singleImageKb / 1024;

    // Net Image Data Size for N photos
    const totalNetKb = singleImageKb * photoCount;
    const totalNetMb = totalNetKb / 1024;
    const totalNetGb = totalNetMb / 1024;
    const totalNetTb = totalNetGb / 1024;

    // Filesystem Cluster Slack Overhead (4KB cluster allocation)
    // In ext4/NTFS, every file occupies integer multiple of cluster size (e.g., 4KB)
    const clustersPerFile = Math.ceil(singleImageKb / clusterSizeKb);
    const allocatedKbPerFile = clustersPerFile * clusterSizeKb;
    const slackLossKbPerFile = allocatedKbPerFile - singleImageKb;
    
    // Directory Index Metadata Overhead (Linux ext4 inode 256 bytes + dentry ~100 bytes = ~356 bytes/file)
    const inodeOverheadKb = (photoCount * 0.35) / 1024; // in MB

    // Total Size on Disk
    const totalOnDiskMb = (allocatedKbPerFile * photoCount) / 1024;
    const totalOnDiskGb = totalOnDiskMb / 1024;
    const clusterSlackLossMb = (slackLossKbPerFile * photoCount) / 1024;

    // Network / Transfer Duration Estimates
    // 1 Gbps LAN (~100 MB/s real), USB 3.0 (~350 MB/s real), 10Gbps NVMe (~1,000 MB/s real)
    const transferSec1Gbps = totalNetMb / 100;
    const transferSecUsb3 = totalNetMb / 350;
    const transferSecNvme = totalNetMb / 1000;

    // Cloud S3 Standard Storage Cost ($0.023 / GB / month)
    const monthlyS3CostUsd = totalNetGb * 0.023;
    const monthlyS3CostKrw = monthlyS3CostUsd * 1400;

    return {
      singleImageKb,
      singleImageMb,
      totalNetMb,
      totalNetGb,
      totalNetTb,
      allocatedKbPerFile,
      clusterSlackLossMb,
      totalOnDiskMb,
      totalOnDiskGb,
      inodeOverheadKb,
      transferSec1Gbps,
      transferSecUsb3,
      transferSecNvme,
      monthlyS3CostKrw
    };
  }, [activeRes, selectedFormatId, photoCount, clusterSizeKb]);

  // Export CSV Report
  const exportCsvReport = () => {
    const headers = ['항목', '설정값', '단위'];
    const rows = [
      ['해상도 규격', `${activeRes.name} (${activeRes.width}x${activeRes.height})`, 'px'],
      ['총 화소 수', `${activeRes.megapixels}M (${activeRes.aspectRatio})`, '화소'],
      ['이미지 포맷', activeFormat.name, '-'],
      ['사진 저장 수량', photoCount.toLocaleString(), '장'],
      ['사진 1장당 평균 용량', calculations.singleImageKb.toLocaleString(), 'KB'],
      ['사진 1장당 용량(MB)', calculations.singleImageMb.toFixed(2), 'MB'],
      ['디렉토리 순수 데이터 용량(MB)', calculations.totalNetMb.toFixed(2), 'MB'],
      ['디렉토리 순수 데이터 용량(GB)', calculations.totalNetGb.toFixed(3), 'GB'],
      ['4KB 클러스터 슬랙 낭비량', calculations.clusterSlackLossMb.toFixed(2), 'MB'],
      ['실제 디스크 점유 용량(Size on Disk)', calculations.totalOnDiskGb.toFixed(3), 'GB'],
      ['1Gbps LAN 전송 예상 소요 시간', `${calculations.transferSec1Gbps.toFixed(1)} 초`, '초'],
      ['USB 3.0 복사 소요 시간', `${calculations.transferSecUsb3.toFixed(1)} 초`, '초'],
      ['AWS S3 클라우드 월간 보관료', `${Math.round(calculations.monthlyS3CostKrw).toLocaleString()} 원/월`, '원']
    ];

    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...rows.map(r => r.map(c => `"${c}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Photo_Storage_${activeRes.id}_${photoCount}photos.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* 1. Header Banner */}
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
          <Images className="w-3.5 h-3.5" />
          <span>Resolution-based Photo Storage & 1,000-Image Directory Capacity Calculator</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              사진 스토리지 계산기
            </h1>
            <p className="text-slate-400 text-base sm:text-lg max-w-3xl mt-1 leading-relaxed">
              해상도별(HD, FHD, 3M, 5M, 4K, 12M) 대표 차량 사진을 기반으로, 
              <strong> 1,000장의 이미지를 디렉토리에 저장할 때 소요되는 실제 스토리지 용량(MB/GB)</strong>과 
              파일시스템 클러스터 슬랙(Cluster Slack) 오버헤드를 정밀 산출합니다.
            </p>
          </div>

          <button
            onClick={exportCsvReport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all text-xs font-semibold shrink-0 shadow-md"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>사진 용량 리포트 CSV 내보내기</span>
          </button>
        </div>

        {/* 1,000-Photo Core Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <div className="text-[11px] font-mono text-slate-400">FHD (1080p) 1,000장 JPEG</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1">약 420 MB</div>
            <div className="text-[11px] text-slate-400 mt-0.5">장당 420 KB (표준 JPEG 90%)</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <div className="text-[11px] font-mono text-slate-400">5M 머신비전 1,000장 JPEG</div>
            <div className="text-xl sm:text-2xl font-black text-purple-400 font-mono mt-1">약 980 MB</div>
            <div className="text-[11px] text-slate-400 mt-0.5">장당 980 KB (IMX264 2448x2048)</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <div className="text-[11px] font-mono text-slate-400">4K UHD (8M) 1,000장 JPEG</div>
            <div className="text-xl sm:text-2xl font-black text-sky-400 font-mono mt-1">약 1.68 GB</div>
            <div className="text-[11px] text-slate-400 mt-0.5">장당 1.68 MB (3840x2160)</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <div className="text-[11px] font-mono text-slate-400">4K UHD 1,000장 RAW(24비트)</div>
            <div className="text-xl sm:text-2xl font-black text-rose-400 font-mono mt-1">약 23.7 GB</div>
            <div className="text-[11px] text-slate-400 mt-0.5">비압축 24.3 MB/장 (무손실 원본)</div>
          </div>
        </div>
      </div>

      {/* 2. Sub Tabs Navigation */}
      <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'gallery', label: '해상도별 대표 사진 & 1,000장 스토리지 갤러리', icon: Images },
          { id: 'calculator', label: '인터랙티브 사진 스토리지 계산기', icon: Calculator },
          { id: 'chart', label: '해상도별 용량 비교 차트 (Recharts)', icon: BarChart2 },
          { id: 'matrix', label: '1,000장 규격별 용량 비교 매트릭스', icon: Table },
          { id: 'filesystem', label: '파일시스템 클러스터 슬랙(Slack) 분석', icon: HardDrive },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubView(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 font-bold scale-[1.02]'
                  : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/70'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Main View Switch */}
      <div className="max-w-7xl mx-auto">
        
        {/* SUB-VIEW 1: Visual Gallery (해상도별 실제 이미지 사진 각 1장씩 포함 + 1000장 스토리지 카드) */}
        {activeSubView === 'gallery' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Gallery Header Note */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/60 p-5 rounded-2xl border border-slate-700/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <FolderArchive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">해상도별 대표 사진 1장 & 1,000장 디렉토리 저장 시뮬레이션</h3>
                  <p className="text-xs text-slate-400">각 카드를 클릭하여 고해상도 원본 사진과 1,000장 저장 시 디스크 점유 용량을 확인하세요.</p>
                </div>
              </div>

              {/* Format Switcher Pills */}
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                <span className="text-[11px] text-slate-400 px-2 font-mono">포맷:</span>
                {(['jpeg90', 'webp', 'png', 'raw24'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setSelectedFormatId(fmt)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      selectedFormatId === fmt
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {fmt === 'jpeg90' ? 'JPEG' : fmt === 'webp' ? 'WebP' : fmt === 'png' ? 'PNG' : 'RAW'}
                  </button>
                ))}
              </div>
            </div>

            {/* 6 Resolution Cards Grid with Real Photos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PHOTO_RESOLUTIONS.map((res) => {
                const singleKb = res.sizeEstimatesKb[selectedFormatId];
                const singleMb = singleKb / 1024;
                const batch1000Mb = (singleKb * 1000) / 1024;
                const batch1000Gb = batch1000Mb / 1024;
                const isSelected = selectedResId === res.id;

                return (
                  <div
                    key={res.id}
                    onClick={() => setSelectedResId(res.id)}
                    className={`group bg-slate-800/90 rounded-3xl border-2 overflow-hidden shadow-xl transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-500 ring-4 ring-emerald-500/20 scale-[1.02]'
                        : 'border-slate-700/80 hover:border-slate-600 hover:scale-[1.01]'
                    }`}
                  >
                    {/* Image Preview Container */}
                    <div className="relative aspect-video bg-slate-950 overflow-hidden">
                      <img
                        src={res.sampleImgUrl}
                        alt={res.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      
                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white font-bold text-xs shadow-md">
                          {res.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 font-mono text-[10px]">
                          {res.megapixels}M ({res.aspectRatio})
                        </span>
                      </div>

                      <div className="absolute top-3 right-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setZoomedImage(res.sampleImgUrl);
                          }}
                          className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white backdrop-blur-sm border border-slate-700 transition-colors"
                          title="사진 확대 보기"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Bottom Image Overlay Bar */}
                      <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-mono text-[11px]">{res.width} × {res.height} px</span>
                        <span className="text-emerald-400 font-mono font-bold">1장: {singleKb >= 1024 ? `${singleMb.toFixed(2)} MB` : `${singleKb} KB`}</span>
                      </div>
                    </div>

                    {/* Card Body Details */}
                    <div className="p-5 space-y-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-white text-base">{res.name}</h4>
                          {res.recommendedForALPR && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              ITS 추천
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {res.useCase}
                        </p>
                      </div>

                      {/* 1,000-Photo Directory Box Highlight */}
                      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-mono flex items-center gap-1.5">
                            <FolderArchive className="w-3.5 h-3.5 text-sky-400" />
                            <span>1,000장 디렉토리 저장 시:</span>
                          </span>
                          <span className="text-emerald-400 font-bold font-mono text-sm">
                            {batch1000Gb >= 1.0 ? `${batch1000Gb.toFixed(2)} GB` : `${Math.round(batch1000Mb)} MB`}
                          </span>
                        </div>

                        {/* Format Bar Meter */}
                        <div className="space-y-1">
                          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-sky-400 rounded-full"
                              style={{ width: `${Math.min(100, (singleKb / 25000) * 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                            <span>{activeFormat.name.split(' ')[0]} 규격</span>
                            <span>10,000장: {(batch1000Gb * 10).toFixed(1)} GB</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                        <span>클러스터 슬랙: 약 {((singleKb % 4) * 1000 / 1024).toFixed(1)} MB</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedResId(res.id);
                          }}
                          className="px-2 py-0.5 rounded bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white font-semibold flex items-center gap-1 transition-colors text-[10px]"
                        >
                          <span>세부내용 보기</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Card Deep Engineering Detail Panel */}
            <div className="p-6 rounded-3xl bg-slate-900/95 border-2 border-emerald-500/50 shadow-2xl space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-white">{activeRes.name}</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {activeRes.width} × {activeRes.height} ({activeRes.megapixels}M)
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600/40">
                        선택 포맷: {activeFormat.name.split(' ')[0]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{activeRes.useCase}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block font-mono">1,000장 디렉토리 저장 용량</span>
                  <span className="text-xl font-mono font-bold text-emerald-400">
                    {((activeRes.sizeEstimatesKb[selectedFormatId] * 1000) / 1024 / 1024).toFixed(2)} GB
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                  <span className="text-slate-400 text-[10px] block">사진 1장 순수 파일 크기:</span>
                  <span className="text-amber-400 font-bold text-sm">
                    {activeRes.sizeEstimatesKb[selectedFormatId] >= 1024
                      ? `${(activeRes.sizeEstimatesKb[selectedFormatId] / 1024).toFixed(2)} MB`
                      : `${activeRes.sizeEstimatesKb[selectedFormatId]} KB`}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                  <span className="text-slate-400 text-[10px] block">비압축 24비트 대비 압축률:</span>
                  <span className="text-sky-400 font-bold text-sm">
                    {(100 - (activeRes.sizeEstimatesKb[selectedFormatId] / activeRes.sizeEstimatesKb.raw24) * 100).toFixed(1)}% 절감
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                  <span className="text-slate-400 text-[10px] block">1,000장 전송 시간 (1Gbps):</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    {(((activeRes.sizeEstimatesKb[selectedFormatId] * 1000) / 1024) / 100).toFixed(1)} 초
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                  <span className="text-slate-400 text-[10px] block">4KB 클러스터 슬랙 손실:</span>
                  <span className="text-rose-400 font-bold text-sm">
                    약 {(((activeRes.sizeEstimatesKb[selectedFormatId] % 4) * 1000) / 1024).toFixed(2)} MB
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <strong>공학적 분석:</strong> {activeRes.name} 해상도({activeRes.width}x{activeRes.height})에서 {activeFormat.name.split(' ')[0]} 포맷으로 저장 시, 1,000장의 사진은 약 {((activeRes.sizeEstimatesKb[selectedFormatId] * 1000) / 1024 / 1024).toFixed(2)} GB의 디스크 공간을 차지합니다. 리눅스 ext4 파일시스템에서는 약 350KB의 디렉토리 Inode 메타데이터가 추가로 소비되며, AI 추론 시 VRAM에는 비압축 {((activeRes.width * activeRes.height * 3) / (1024 * 1024)).toFixed(1)} MB 크기로 디코딩되어 메모리에 적재됩니다.
              </div>
            </div>

            {/* Quick Action Banner to open Calculator */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-800/90 via-slate-800/90 to-emerald-950/40 border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Calculator className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">수량 및 압축 포맷을 세밀하게 조절하고 싶으신가요?</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    100장부터 1,000,000장까지의 대용량 데이터셋 디렉토리 저장 공간과 파일시스템 오버헤드를 즉시 계산합니다.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveSubView('calculator')}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 shrink-0"
              >
                인터랙티브 계산기 열기
              </button>
            </div>

          </div>
        )}

        {/* SUB-VIEW 2: Interactive Photo Storage Calculator */}
        {activeSubView === 'calculator' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Controls (5 cols) */}
              <div className="lg:col-span-5 bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-7 space-y-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">사진 저장 파라미터</h3>
                      <p className="text-xs text-slate-400">해상도, 포맷 및 디렉토리 저장 장수 설정</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedResId('fhd');
                      setSelectedFormatId('jpeg90');
                      setPhotoCount(1000);
                      setClusterSizeKb(4);
                    }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono hover:underline"
                  >
                    <RefreshCw className="w-3 h-3" /> 초기화
                  </button>
                </div>

                {/* 1. Resolution Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>사진 해상도 선택</span>
                    <span className="text-[11px] font-mono text-emerald-400">
                      {activeRes.width} x {activeRes.height} ({activeRes.megapixels}M)
                    </span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {PHOTO_RESOLUTIONS.map((res) => (
                      <button
                        key={res.id}
                        onClick={() => setSelectedResId(res.id)}
                        className={`p-2 rounded-xl text-xs font-medium border text-center transition-all ${
                          selectedResId === res.id
                            ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-md'
                            : 'bg-slate-900/70 border-slate-700 hover:bg-slate-700/60 text-slate-300'
                        }`}
                      >
                        <div className="font-bold truncate">{res.name}</div>
                        <div className="text-[10px] opacity-75 font-mono">{res.megapixels}M</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Image Format Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">이미지 압축 포맷</label>
                  <select
                    value={selectedFormatId}
                    onChange={(e) => setSelectedFormatId(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    {IMAGE_FORMATS.map((fmt) => (
                      <option key={fmt.id} value={fmt.id}>
                        {fmt.name} ({fmt.ext}) {fmt.lossless ? '[무손실]' : '[손실 압축]'}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/60 leading-relaxed">
                    {activeFormat.description}
                  </p>
                </div>

                {/* 3. Photo Count Slider & Presets */}
                <div className="space-y-3 pt-2 border-t border-slate-700/60">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium">저장할 사진 수량 (Image Count)</span>
                    <span className="font-mono text-emerald-400 font-bold text-sm">
                      {photoCount.toLocaleString()} 장
                    </span>
                  </div>

                  {/* Preset Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: '100장', value: 100 },
                      { label: '1,000장 (기본)', value: 1000 },
                      { label: '5,000장', value: 5000 },
                      { label: '10,000장', value: 10000 },
                      { label: '50,000장', value: 50000 },
                      { label: '100,000장', value: 100000 },
                    ].map((btn) => (
                      <button
                        key={btn.value}
                        onClick={() => setPhotoCount(btn.value)}
                        className={`px-2.5 py-1 text-xs rounded-lg border font-mono transition-all ${
                          photoCount === btn.value
                            ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                            : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  <input
                    type="range"
                    min={100}
                    max={100000}
                    step={100}
                    value={photoCount}
                    onChange={(e) => setPhotoCount(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>100장</span>
                    <span>1,000장</span>
                    <span>10,000장</span>
                    <span>50,000장</span>
                    <span>100,000장</span>
                  </div>
                </div>

                {/* 4. Filesystem Cluster Size */}
                <div className="space-y-2 pt-2 border-t border-slate-700/60">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium">파일시스템 클러스터 할당 단위</span>
                    <span className="font-mono text-sky-400 font-bold">{clusterSizeKb} KB</span>
                  </div>
                  <select
                    value={clusterSizeKb}
                    onChange={(e) => setClusterSizeKb(parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white"
                  >
                    <option value={4}>4 KB (NTFS / ext4 / APFS 표준 기본값)</option>
                    <option value={8}>8 KB (대용량 미디어 드라이브)</option>
                    <option value={16}>16 KB (ZFS / Btrfs 권장)</option>
                    <option value={64}>64 KB (exFAT SD카드)</option>
                  </select>
                  <p className="text-[10px] text-slate-400">
                    * 클러스터 크기보다 작은 잔여 바이트는 '슬랙 공간(Slack Space)'으로 남아 디스크가 낭비됩니다.
                  </p>
                </div>

              </div>

              {/* Calculated Results & Sizing (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Main Results Card */}
                <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-700/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
                  
                  {/* Top Stats */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/80 pb-4">
                    <div>
                      <span className="text-xs font-mono text-slate-400">
                        {activeRes.name} 사진 {photoCount.toLocaleString()}장 디렉토리 저장 공간
                      </span>
                      <h4 className="text-3xl sm:text-4xl font-black text-white flex items-center gap-3 mt-1">
                        <span className="text-emerald-400 font-mono">
                          {calculations.totalNetGb >= 1.0 
                            ? `${calculations.totalNetGb.toFixed(2)} GB` 
                            : `${calculations.totalNetMb.toFixed(1)} MB`}
                        </span>
                        <span className="text-xs font-normal px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                          순수 이미지 크기
                        </span>
                      </h4>
                      <div className="text-xs text-slate-400 mt-1">
                        실제 디스크 점유(Size on Disk): <strong className="text-slate-200 font-mono">
                          {calculations.totalOnDiskGb >= 1.0 
                            ? `${calculations.totalOnDiskGb.toFixed(2)} GB` 
                            : `${calculations.totalOnDiskMb.toFixed(1)} MB`}
                        </strong> (클러스터 슬랙 낭비: {calculations.clusterSlackLossMb.toFixed(1)} MB)
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-xs font-mono text-slate-400">사진 1장당 평균 크기</span>
                      <div className="text-xl font-black text-sky-400 font-mono mt-0.5">
                        {calculations.singleImageKb >= 1024 
                          ? `${calculations.singleImageMb.toFixed(2)} MB` 
                          : `${calculations.singleImageKb.toLocaleString()} KB`}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {activeRes.width} × {activeRes.height} ({activeRes.megapixels}M)
                      </div>
                    </div>
                  </div>

                  {/* Representative Photo Card embedded */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
                    <img 
                      src={activeRes.sampleImgUrl} 
                      alt={activeRes.name}
                      className="w-full sm:w-36 h-24 object-cover rounded-xl border border-slate-700 shrink-0" 
                    />
                    <div className="space-y-1.5 w-full text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{activeRes.name} 실제 번호판 촬영 사진</span>
                        <span className="font-mono text-emerald-400 text-xs font-semibold">{activeFormat.name.split(' ')[0]} 포맷</span>
                      </div>
                      <div className="text-slate-400 text-[11px]">{activeRes.useCase}</div>
                      <div className="flex flex-wrap items-center gap-3 text-slate-300 font-mono text-[11px] pt-1">
                        <span>해상도: {activeRes.width}x{activeRes.height}</span>
                        <span>화소: {activeRes.megapixels}M</span>
                        <span>화면비: {activeRes.aspectRatio}</span>
                      </div>
                    </div>
                  </div>

                  {/* Transfer Duration & Performance Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-sky-400" />
                        <span>1Gbps LAN 전송 시간</span>
                      </div>
                      <div className="text-base font-bold text-white font-mono mt-1">
                        {calculations.transferSec1Gbps < 1 
                          ? '1초 미만' 
                          : `${calculations.transferSec1Gbps.toFixed(1)} 초`}
                      </div>
                      <div className="text-[10px] text-slate-500">실효 전송 약 100 MB/s</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                        <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                        <span>USB 3.0 복사 시간</span>
                      </div>
                      <div className="text-base font-bold text-white font-mono mt-1">
                        {calculations.transferSecUsb3 < 1 
                          ? '1초 미만' 
                          : `${calculations.transferSecUsb3.toFixed(1)} 초`}
                      </div>
                      <div className="text-[10px] text-slate-500">실효 전송 약 350 MB/s</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                        <Cloud className="w-3.5 h-3.5 text-purple-400" />
                        <span>AWS S3 월간 보관료</span>
                      </div>
                      <div className="text-base font-bold text-white font-mono mt-1">
                        약 {Math.round(calculations.monthlyS3CostKrw).toLocaleString()} 원/월
                      </div>
                      <div className="text-[10px] text-slate-500">Standard Tier ($0.023/GB)</div>
                    </div>
                  </div>

                  {/* Storage Media Recommendations */}
                  <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-300 leading-relaxed space-y-1">
                      <div className="font-bold text-white">
                        {photoCount.toLocaleString()}장 저장 시 추천 미디어 사양
                      </div>
                      <div>
                        {calculations.totalNetGb < 2 ? (
                          <span>일반 32GB/64GB 고속 MicroSD(U3 V30) 또는 NVR 내부 eMMC 메모리로 여유롭게 저장 가능합니다.</span>
                        ) : calculations.totalNetGb < 50 ? (
                          <span>128GB~256GB SATA SSD 또는 USB 3.0 외장 SSD 저장을 추천합니다.</span>
                        ) : (
                          <span>1TB 이상의 NVMe M.2 SSD 또는 24/7 엔터프라이즈 감시용 NAS HDD(WD Purple/SkyHawk) 배열이 필요합니다.</span>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Embedded Recharts Comparative Bar Chart */}
              <div className="mt-8 pt-6 border-t border-slate-700/80">
                <StorageBarChartComparison
                  mode="photo"
                  photoCount={photoCount}
                  selectedResolutionId={selectedResId}
                  onSelectResolution={setSelectedResId}
                />
              </div>

            </div>
          </div>
        )}

        {/* SUB-VIEW 2.5: Recharts Interactive Visual Bar Chart */}
        {activeSubView === 'chart' && (
          <div className="space-y-6 animate-fadeIn">
            <StorageBarChartComparison
              mode="photo"
              photoCount={photoCount}
              selectedResolutionId={selectedResId}
              onSelectResolution={setSelectedResId}
            />
          </div>
        )}

        {/* SUB-VIEW 3: Matrix Table (1000 photos across resolutions & formats) */}
        {activeSubView === 'matrix' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">해상도별 1,000장 디렉토리 저장 공간 매트릭스</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    동일한 1,000장의 번호판 사진을 각 포맷별로 디렉토리에 보관할 때 소요되는 스토리지 용량 비교 (MB / GB)
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-emerald-400">
                  <FolderArchive className="w-4 h-4" />
                  <span>1,000장 배치 기준</span>
                </div>
              </div>

              {/* Responsive Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-700 shadow-inner">
                <table className="w-full text-left text-sm text-slate-200">
                  <thead className="bg-slate-900/90 text-xs uppercase text-slate-400 font-mono border-b border-slate-700">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">해상도 규격</th>
                      <th className="py-3.5 px-4 font-semibold text-center">화소 수</th>
                      <th className="py-3.5 px-4 font-semibold text-right">JPEG 90% (1,000장)</th>
                      <th className="py-3.5 px-4 font-semibold text-right">WebP (1,000장)</th>
                      <th className="py-3.5 px-4 font-semibold text-right">PNG 24비트 (1,000장)</th>
                      <th className="py-3.5 px-4 font-semibold text-right">비압축 RAW (1,000장)</th>
                      <th className="py-3.5 px-4 font-semibold">추천 저장 매체</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono text-xs sm:text-sm">
                    {PHOTO_RESOLUTIONS.map((res) => {
                      const jpeg1000Mb = (res.sizeEstimatesKb.jpeg90 * 1000) / 1024;
                      const webp1000Mb = (res.sizeEstimatesKb.webp * 1000) / 1024;
                      const png1000Mb = (res.sizeEstimatesKb.png * 1000) / 1024;
                      const raw1000Mb = (res.sizeEstimatesKb.raw24 * 1000) / 1024;

                      return (
                        <tr key={res.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="py-3.5 px-4 font-sans font-bold text-white flex flex-col">
                            <span>{res.name}</span>
                            <span className="text-[11px] text-slate-400 font-mono font-normal">{res.width} × {res.height}</span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-sky-400">
                            {res.megapixels}M
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                            {jpeg1000Mb >= 1024 ? `${(jpeg1000Mb / 1024).toFixed(2)} GB` : `${Math.round(jpeg1000Mb)} MB`}
                          </td>
                          <td className="py-3.5 px-4 text-right text-purple-400">
                            {webp1000Mb >= 1024 ? `${(webp1000Mb / 1024).toFixed(2)} GB` : `${Math.round(webp1000Mb)} MB`}
                          </td>
                          <td className="py-3.5 px-4 text-right text-amber-300">
                            {(png1000Mb / 1024).toFixed(2)} GB
                          </td>
                          <td className="py-3.5 px-4 text-right text-rose-400 font-bold">
                            {(raw1000Mb / 1024).toFixed(2)} GB
                          </td>
                          <td className="py-3.5 px-4 font-sans text-xs text-slate-300">
                            {res.id === 'hd' ? '32GB SD카드' : res.id === 'fhd' ? '64GB SD카드 / SSD' : res.id === '5m' ? '128GB SSD' : '256GB+ NVMe SSD'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Explanatory notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-1">
                  <div className="font-bold text-white">JPEG 90%가 ALPR 표준인 이유:</div>
                  <div className="text-slate-400 leading-relaxed">
                    RAW 대비 용량이 <strong>약 1/14(7%) 수준</strong>으로 축소되면서도 차량 번호판 문자의 고주파 엣지(Edge)가 왜곡 없이 완벽 보존되어, OCR 인식률에 미치는 영향이 0.05%p 미만으로 극도로 낮습니다.
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-1">
                  <div className="font-bold text-white">무손실(PNG/RAW)이 필요한 경우:</div>
                  <div className="text-slate-400 leading-relaxed">
                    AI 딥러닝 모델(YOLOv8, LPRNet) 초기 훈련용 골든 데이터셋 구축, 도로교통공단 법정 단속 검증용 원본 증거 자료 보존 시에는 무압축 RAW 24-bit 전송을 활용합니다.
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SUB-VIEW 4: Filesystem Slack & Inode Analysis */}
        {activeSubView === 'filesystem' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-slate-700/80 pb-4">
                <h3 className="text-xl font-bold text-white tracking-tight">파일시스템 클러스터 슬랙(Slack Space) & 아이노드(Inode) 메커니즘</h3>
                <p className="text-xs text-slate-400 mt-1">
                  순수 파일 크기(Size)와 실제 디스크 할당 크기(Size on Disk)의 차이 및 대량 이미지 디렉토리 최적화
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <HardDrive className="w-4 h-4" />
                    <span>클러스터 슬랙(Slack) 공간</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    Linux(ext4)와 Windows(NTFS)는 4KB 단위 클러스터 블록으로 디스크를 할당합니다. 
                    예를 들어 422KB 크기의 JPEG 파일은 106개의 클러스터(424KB)를 차지하므로, 
                    마지막 클러스터의 2KB는 빈 공간으로 남아 낭비됩니다.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-2">
                  <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                    <FileText className="w-4 h-4" />
                    <span>아이노드(Inode) 고갈 주의</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    디렉토리에 수백만 장의 이미지를 저장할 경우 디스크 용량이 남아있더라도 
                    파일시스템의 Inode 번호가 먼저 고갈되어 쓰기 오류가 발생할 수 있습니다. 
                    ALPR 시스템 구축 시 <code className="text-sky-300">mkfs.ext4 -i 4096</code> 옵션으로 고밀도 Inode 생성이 필수적입니다.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-2">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                    <FolderArchive className="w-4 h-4" />
                    <span>디렉토리 계층 분할 (Hashing)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    단일 폴더에 10,000장 이상의 파일을 직접 넣으면 파일 열기(POSIX open) 시 O(N) 탐색 지연이 발생합니다. 
                    <code className="text-purple-300">/년/월/일/시/차로/</code> 단위로 서브 디렉토리를 분할하여 
                    폴더당 파일 수를 1,000~2,000장 이내로 유지해야 합니다.
                  </p>
                </div>
              </div>

              {/* Cluster Size Comparison Box */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-700/80 space-y-3">
                <div className="font-bold text-white text-sm">
                  클러스터 크기별 1,000장 저장 시 슬랙 공간 낭비율 비교
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                    <span className="text-slate-400 block text-[11px]">4KB 클러스터 (기본)</span>
                    <strong className="text-emerald-400 text-sm block mt-1">슬랙 낭비 약 2 MB</strong>
                    <span className="text-[10px] text-slate-500">낭비율 0.5% 미만 (최적)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                    <span className="text-slate-400 block text-[11px]">8KB 클러스터</span>
                    <strong className="text-sky-400 text-sm block mt-1">슬랙 낭비 약 4 MB</strong>
                    <span className="text-[10px] text-slate-500">낭비율 약 1.0%</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                    <span className="text-slate-400 block text-[11px]">16KB 클러스터</span>
                    <strong className="text-amber-400 text-sm block mt-1">슬랙 낭비 약 8 MB</strong>
                    <span className="text-[10px] text-slate-500">낭비율 약 1.9%</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                    <span className="text-slate-400 block text-[11px]">64KB exFAT 클러스터</span>
                    <strong className="text-rose-400 text-sm block mt-1">슬랙 낭비 약 32 MB</strong>
                    <span className="text-[10px] text-slate-500">낭비율 7.6% (비효율)</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Modal: Fullscreen Photo Zoom View */}
      {zoomedImage && (
        <div 
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-5xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src={zoomedImage} 
              alt="Zoomed Sample" 
              className="max-h-[80vh] w-auto object-contain mx-auto" 
            />
            <div className="p-4 bg-slate-900/90 text-center text-xs text-slate-300">
              클릭하면 창이 닫힙니다. (실제 해상도 원본 사진 뷰어)
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
