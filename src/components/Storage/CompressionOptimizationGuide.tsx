import React, { useState, useMemo } from 'react';
import {
  TrendingDown,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  FileText,
  Layers,
  Sparkles,
  Info,
  Scale,
  Gauge,
  HardDrive,
  Eye,
  Check,
  X,
  Zap,
  ArrowRight,
  Database
} from 'lucide-react';

interface QualityTier {
  id: string;
  name: string;
  format: 'RAW' | 'PNG' | 'WebP' | 'JPEG';
  qualityPercent: number;
  category: '무손실 기준' | '초고화질' | '권장 골디락스' | '경량 고효율' | '위험/과압축';
  fhdSizeKb: number;
  compressionRatioPct: number; // vs RAW (100%)
  storageSavingsPct: number; // 100 - compressionRatioPct
  psnrDb: number; // Peak Signal-to-Noise Ratio (dB)
  ssim: number; // Structural Similarity Index (0~1)
  ocrAccuracyPct: number; // Estimated OCR Success Rate on standard Korean plates
  encodeLatencyMs: number;
  color: string;
  badgeBg: string;
  borderColor: string;
  recommended: boolean;
  notes: string;
}

const QUALITY_TIERS: QualityTier[] = [
  {
    id: 'raw_24',
    name: '비압축 RAW 24-bit',
    format: 'RAW',
    qualityPercent: 100,
    category: '무손실 기준',
    fhdSizeKb: 6075,
    compressionRatioPct: 100.0,
    storageSavingsPct: 0.0,
    psnrDb: 99.9, // Infinite
    ssim: 1.000,
    ocrAccuracyPct: 99.95,
    encodeLatencyMs: 0.1,
    color: 'text-rose-400',
    badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    borderColor: 'border-rose-500/40',
    recommended: false,
    notes: '센서 ADC 물리 전압 원본 덤프. 압축 손실 0%, 법정 증거 및 AI 연구용. 일일 수십 GB 발생.'
  },
  {
    id: 'png_24',
    name: 'PNG 24-bit 무손실',
    format: 'PNG',
    qualityPercent: 100,
    category: '무손실 기준',
    fhdSizeKb: 3180,
    compressionRatioPct: 52.3,
    storageSavingsPct: 47.7,
    psnrDb: 99.9, // Infinite mathematically
    ssim: 1.000,
    ocrAccuracyPct: 99.95,
    encodeLatencyMs: 22.0,
    color: 'text-sky-400',
    badgeBg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    borderColor: 'border-sky-500/40',
    recommended: false,
    notes: '수학적 100% 무손실 복원. 번호판 텍스트 엣지가 칼선처럼 보존되나 실시간 전송에는 용량 과다.'
  },
  {
    id: 'webp_95',
    name: 'WebP 95% (초고품질)',
    format: 'WebP',
    qualityPercent: 95,
    category: '초고화질',
    fhdSizeKb: 490,
    compressionRatioPct: 8.1,
    storageSavingsPct: 91.9,
    psnrDb: 46.2,
    ssim: 0.994,
    ocrAccuracyPct: 99.92,
    encodeLatencyMs: 4.5,
    color: 'text-purple-400',
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    borderColor: 'border-purple-500/40',
    recommended: false,
    notes: '원시 무손실과 육안 구별 불가. 색차 왜곡 최소화, 고화질 클라우드 보관용.'
  },
  {
    id: 'webp_85',
    name: 'WebP 85% (차세대 골디락스)',
    format: 'WebP',
    qualityPercent: 85,
    category: '권장 골디락스',
    fhdSizeKb: 295,
    compressionRatioPct: 4.8,
    storageSavingsPct: 95.2,
    psnrDb: 41.5,
    ssim: 0.982,
    ocrAccuracyPct: 99.85,
    encodeLatencyMs: 3.2,
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    borderColor: 'border-emerald-500/50',
    recommended: true,
    notes: '최고의 압축 효율과 화질 밸런스. JPEG 90% 대비 30% 추가 용량 절감, OCR 인식률 99.8% 유지.'
  },
  {
    id: 'jpeg_95',
    name: 'JPEG 95% (초고품질)',
    format: 'JPEG',
    qualityPercent: 95,
    category: '초고화질',
    fhdSizeKb: 720,
    compressionRatioPct: 11.8,
    storageSavingsPct: 88.2,
    psnrDb: 43.8,
    ssim: 0.988,
    ocrAccuracyPct: 99.90,
    encodeLatencyMs: 0.9,
    color: 'text-blue-400',
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    borderColor: 'border-blue-500/40',
    recommended: false,
    notes: '고속도로 과속/신호위반 단속 증거용. 압축 아티팩트 거의 없음, 다만 파일 크기가 90% 대비 1.7배.'
  },
  {
    id: 'jpeg_90',
    name: 'JPEG 90% (ALPR 글로벌 표준)',
    format: 'JPEG',
    qualityPercent: 90,
    category: '권장 골디락스',
    fhdSizeKb: 420,
    compressionRatioPct: 6.9,
    storageSavingsPct: 93.1,
    psnrDb: 39.4,
    ssim: 0.971,
    ocrAccuracyPct: 99.78,
    encodeLatencyMs: 0.8,
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    borderColor: 'border-emerald-500/50',
    recommended: true,
    notes: '전 세계 ITS/CCTV 업계 표준 골디락스 포인트. HW ASIC 가속 최적화, OCR 인식률 손실 0.05%p 미만.'
  },
  {
    id: 'jpeg_80',
    name: 'JPEG 80% (주차 관제 표준)',
    format: 'JPEG',
    qualityPercent: 80,
    category: '경량 고효율',
    fhdSizeKb: 280,
    compressionRatioPct: 4.6,
    storageSavingsPct: 95.4,
    psnrDb: 35.8,
    ssim: 0.942,
    ocrAccuracyPct: 98.60,
    encodeLatencyMs: 0.8,
    color: 'text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    borderColor: 'border-amber-500/40',
    recommended: false,
    notes: '상업용 주차장 무인 차단기 표준. 대용량 입출차 트래픽에 유리하나 고속 주행 시 링잉 노이즈 시작.'
  },
  {
    id: 'jpeg_65',
    name: 'JPEG 65% (과압축/위험 경계)',
    format: 'JPEG',
    qualityPercent: 65,
    category: '위험/과압축',
    fhdSizeKb: 170,
    compressionRatioPct: 2.8,
    storageSavingsPct: 97.2,
    psnrDb: 31.2,
    ssim: 0.885,
    ocrAccuracyPct: 91.20,
    encodeLatencyMs: 0.7,
    color: 'text-rose-400',
    badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    borderColor: 'border-rose-500/40',
    recommended: false,
    notes: '극단적 대역폭 결핍 환경용. 8x8 블록 경계선 및 텍스트 번짐으로 OCR 인식률이 91% 수준으로 급락.'
  }
];

export const CompressionOptimizationGuide: React.FC = () => {
  // Interactive Simulator States
  const [selectedTierId, setSelectedTierId] = useState<string>('jpeg_90');
  const [simQuality, setSimQuality] = useState<number>(90);
  const [simFormat, setSimFormat] = useState<'jpeg' | 'webp'>('jpeg');
  
  // Cost & Storage Calculation States
  const [cameraCount, setCameraCount] = useState<number>(10);
  const [dailyVehiclesPerCam, setDailyVehiclesPerCam] = useState<number>(8000);
  const [retentionDays, setRetentionDays] = useState<number>(365); // 1 year retention

  const activeTier = useMemo(() => {
    return QUALITY_TIERS.find(t => t.id === selectedTierId) || QUALITY_TIERS[5];
  }, [selectedTierId]);

  // Dynamic Simulator Calculation based on continuous slider (50 ~ 100)
  const dynamicSimStats = useMemo(() => {
    const q = simQuality;
    // Non-linear size model vs Q
    // Q=100 -> ~1400KB, Q=90 -> 420KB, Q=80 -> 280KB, Q=60 -> 150KB
    let sizeKb = 0;
    let psnr = 0;
    let ssim = 0;
    let ocr = 0;

    if (simFormat === 'jpeg') {
      const qNorm = q / 100;
      sizeKb = Math.round(120 + 300 * Math.pow(qNorm, 2.8) + (q >= 90 ? (q - 90) * 35 : 0));
      psnr = +(28 + (q * 0.16) + (q >= 90 ? (q - 90) * 0.4 : 0)).toFixed(1);
      ssim = +(0.82 + (q * 0.0017) + (q >= 90 ? (q - 90) * 0.0015 : 0)).toFixed(3);
      if (q >= 90) ocr = +(99.6 + (q - 90) * 0.035).toFixed(2);
      else if (q >= 80) ocr = +(98.0 + (q - 80) * 0.16).toFixed(2);
      else if (q >= 70) ocr = +(94.0 + (q - 70) * 0.40).toFixed(2);
      else ocr = +(85.0 + (q - 50) * 0.45).toFixed(2);
    } else {
      // WebP format (typically 30% smaller, higher SSIM)
      const qNorm = q / 100;
      sizeKb = Math.round(85 + 210 * Math.pow(qNorm, 2.7) + (q >= 90 ? (q - 90) * 22 : 0));
      psnr = +(30 + (q * 0.165) + (q >= 90 ? (q - 90) * 0.45 : 0)).toFixed(1);
      ssim = +(0.85 + (q * 0.0015) + (q >= 90 ? (q - 90) * 0.0018 : 0)).toFixed(3);
      if (q >= 85) ocr = +(99.7 + (q - 85) * 0.015).toFixed(2);
      else if (q >= 75) ocr = +(98.5 + (q - 75) * 0.12).toFixed(2);
      else ocr = +(89.0 + (q - 50) * 0.38).toFixed(2);
    }

    let artifactLevel = '극도로 안전 (무결)';
    let artifactColor = 'text-emerald-400';
    if (q < 70) {
      artifactLevel = '위험 (인식률 급락 주의)';
      artifactColor = 'text-rose-400';
    } else if (q < 82) {
      artifactLevel = '주의 (미세 링잉 노이즈 발생)';
      artifactColor = 'text-amber-400';
    } else if (q < 90) {
      artifactLevel = '양호 (일반 관제 적합)';
      artifactColor = 'text-sky-400';
    }

    return {
      sizeKb,
      psnr,
      ssim,
      ocr: Math.min(99.95, ocr),
      artifactLevel,
      artifactColor
    };
  }, [simQuality, simFormat]);

  // Annual Storage & Hardware Cost Impact Calculator
  const annualSavingsComparison = useMemo(() => {
    const totalPhotos = cameraCount * dailyVehiclesPerCam * retentionDays;

    return QUALITY_TIERS.map((tier) => {
      const totalGb = (tier.fhdSizeKb * totalPhotos) / (1024 * 1024);
      const totalTb = totalGb / 1024;
      // 8TB Enterprise surveillance disk (approx 290,000 KRW each)
      // RAID 5 requires (Total TB / (8TB * 0.75)) rounded up + 1 hot spare
      const disksNeeded = Math.max(3, Math.ceil(totalTb / 6) + 1);
      const hardwareCostKrw = disksNeeded * 290000;

      return {
        ...tier,
        totalTb,
        disksNeeded,
        hardwareCostKrw
      };
    });
  }, [cameraCount, dailyVehiclesPerCam, retentionDays]);

  return (
    <div className="space-y-10 animate-fadeIn text-slate-100">
      
      {/* 1. Header & Executive Summary */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Image Compression Efficiency & Quality Degradation Trade-off Guide</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              이미지 파일 포맷별 압축 최적화 가이드
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>ALPR 번호판 인식 보존율 기반 검증</span>
          </div>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed max-w-4xl">
          차량 번호판 단속 및 방범 CCTV 시스템에서 무작정 화질을 올리면 스토리지 및 네트워크 대역폭 비용이 폭증하고, 
          반대로 압축률을 과도하게 높이면 고주파 엣지 링잉(Ringing) 및 블록 아티팩트로 인해 <strong>OCR 인식률이 급격히 저하</strong>됩니다. 
          아래 가이드는 <strong>PSNR(신호 대 잡음비)</strong>, <strong>SSIM(구조적 유사도)</strong>, <strong>인식 보존율</strong>을 
          기준으로 최적의 <strong>골디락스 존(Goldilocks Zone)</strong>을 도출합니다.
        </p>

        {/* 3 Core Rules Quick Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80">
            <div className="text-[11px] font-mono text-emerald-400 font-bold">규칙 1: 90% 변곡점의 법칙</div>
            <div className="text-xs text-slate-300 mt-1">
              JPEG 95% ➔ 90% 전환 시 파일 크기 <strong>-42% 급감</strong>, OCR 인식률 손실은 <strong>0.02%p 미만</strong>.
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80">
            <div className="text-[11px] font-mono text-amber-400 font-bold">규칙 2: 80% 위험 임계선</div>
            <div className="text-xs text-slate-300 mt-1">
              품질 80% 미만으로 내리면 블록 노이즈로 인해 숫자 <strong>'1'과 '7', '8'과 '0' 오인식률 급증</strong>.
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80">
            <div className="text-[11px] font-mono text-purple-400 font-bold">규칙 3: WebP 차세대 효율</div>
            <div className="text-xs text-slate-300 mt-1">
              WebP 85% 채택 시 동일 SSIM 화질에서 JPEG 90% 대비 <strong>30% 추가 용량 절감</strong>.
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Quality Loss Simulator */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
              <Sliders className="w-5 h-5" />
              <span>실시간 압축 품질(Quality) vs 화질 손실 시뮬레이터</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">슬라이더를 조절하여 압축 레벨에 따른 용량, PSNR, SSIM 및 예상 번호판 OCR 인식률 변화를 확인하세요.</p>
          </div>

          {/* Format Toggle */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setSimFormat('jpeg')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                simFormat === 'jpeg'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              JPEG (DCT 표준)
            </button>
            <button
              onClick={() => setSimFormat('webp')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                simFormat === 'webp'
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              WebP (차세대 고효율)
            </button>
          </div>
        </div>

        {/* Slider Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-6 space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-bold">
                <span className="text-white">압축 품질 계수 (Quality Factor)</span>
                <span className="font-mono text-xl text-amber-400 font-black">{simQuality}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="1"
                value={simQuality}
                onChange={(e) => setSimQuality(Number(e.target.value))}
                className="w-full accent-amber-500 h-2.5 bg-slate-700 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span className="text-rose-400">50% (위험)</span>
                <span className="text-amber-400">75% (경량)</span>
                <span className="text-emerald-400 font-bold">85%~90% (골디락스)</span>
                <span className="text-sky-400">95% (초고품질)</span>
                <span className="text-slate-300">100%</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { label: 'Q=95 (초고화질 단속)', q: 95 },
                { label: 'Q=90 (ALPR 글로벌 표준)', q: 90 },
                { label: 'Q=85 (WebP 권장)', q: 85 },
                { label: 'Q=80 (주차관제)', q: 80 },
                { label: 'Q=65 (한계치)', q: 65 },
              ].map((p) => (
                <button
                  key={p.q}
                  onClick={() => setSimQuality(p.q)}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                    simQuality === p.q
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                      : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Artifact Status Notice */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-700/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">왜곡 위험 상태:</span>
              <span className={`font-bold flex items-center gap-1.5 ${dynamicSimStats.artifactColor}`}>
                {simQuality >= 85 ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>{dynamicSimStats.artifactLevel}</span>
              </span>
            </div>
          </div>

          {/* Metric Gauge Cards (6 cols) */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            
            {/* Metric 1: Size */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700/80 space-y-1">
              <div className="text-[11px] font-mono text-slate-400">FHD 사진 1장 평균 용량</div>
              <div className="text-2xl font-black text-white font-mono">
                {dynamicSimStats.sizeKb} <span className="text-xs text-slate-400 font-normal">KB</span>
              </div>
              <div className="text-[11px] text-emerald-400 font-mono">
                RAW 대비 -{(100 - (dynamicSimStats.sizeKb / 6075) * 100).toFixed(1)}% 절감
              </div>
            </div>

            {/* Metric 2: OCR Recognition Rate */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700/80 space-y-1">
              <div className="text-[11px] font-mono text-slate-400">예상 번호판 OCR 판독 성공률</div>
              <div className={`text-2xl font-black font-mono ${dynamicSimStats.ocr >= 99.5 ? 'text-emerald-400' : dynamicSimStats.ocr >= 98.0 ? 'text-sky-400' : 'text-rose-400'}`}>
                {dynamicSimStats.ocr.toFixed(2)} <span className="text-xs text-slate-400 font-normal">%</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                기준 대비 {dynamicSimStats.ocr >= 99.7 ? '손실 거의 없음' : `오인식 증가 위험`}
              </div>
            </div>

            {/* Metric 3: PSNR */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700/80 space-y-1">
              <div className="text-[11px] font-mono text-slate-400">PSNR (신호 대 잡음비)</div>
              <div className="text-2xl font-black text-purple-400 font-mono">
                {dynamicSimStats.psnr} <span className="text-xs text-slate-400 font-normal">dB</span>
              </div>
              <div className="text-[11px] text-slate-400">
                {dynamicSimStats.psnr >= 40 ? '우수 (40dB+ 눈구별 불가)' : dynamicSimStats.psnr >= 35 ? '양호 (35dB+ 표준)' : '노이즈 인지가능'}
              </div>
            </div>

            {/* Metric 4: SSIM */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700/80 space-y-1">
              <div className="text-[11px] font-mono text-slate-400">SSIM (구조적 유사도)</div>
              <div className="text-2xl font-black text-sky-400 font-mono">
                {dynamicSimStats.ssim.toFixed(3)} <span className="text-xs text-slate-400 font-normal">/ 1.0</span>
              </div>
              <div className="text-[11px] text-slate-400">
                {dynamicSimStats.ssim >= 0.97 ? '구조 왜곡 극소' : '텍스트 윤곽 손상 시작'}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* 3. Comprehensive Quality Tier Comparison Table */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              포맷 및 품질 티어별 화질 손실 vs 압축 효율 전수 대조표
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              비압축 RAW부터 무손실 PNG, WebP 및 품질별 JPEG(95%~65%)의 정밀 공학 메트릭스
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-mono">
              ★ 권장 골디락스 티어
            </span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-700">
          <table className="w-full text-left text-xs sm:text-sm text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-xs border-b border-slate-700">
              <tr>
                <th className="py-3 px-4 font-semibold">품질 티어 규격</th>
                <th className="py-3 px-4 font-semibold">구분</th>
                <th className="py-3 px-4 font-semibold text-right">FHD 1장 크기</th>
                <th className="py-3 px-4 font-semibold text-right">스토리지 절감률</th>
                <th className="py-3 px-4 font-semibold text-right">PSNR (dB)</th>
                <th className="py-3 px-4 font-semibold text-right">SSIM (유사도)</th>
                <th className="py-3 px-4 font-semibold text-right">예상 OCR 인식률</th>
                <th className="py-3 px-4 font-semibold text-right">인코딩 지연</th>
                <th className="py-3 px-4 font-semibold">적합 용도 및 특징</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-sans">
              {QUALITY_TIERS.map((tier) => (
                <tr
                  key={tier.id}
                  onClick={() => setSelectedTierId(tier.id)}
                  className={`transition-colors cursor-pointer ${
                    tier.recommended
                      ? 'bg-emerald-950/20 hover:bg-emerald-950/40'
                      : selectedTierId === tier.id
                      ? 'bg-slate-700/40'
                      : 'hover:bg-slate-800/60'
                  }`}
                >
                  <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                    {tier.recommended && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse"></span>
                    )}
                    <span className={tier.color}>{tier.name}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${tier.badgeBg}`}>
                      {tier.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                    {tier.fhdSizeKb >= 1024
                      ? `${(tier.fhdSizeKb / 1024).toFixed(2)} MB`
                      : `${tier.fhdSizeKb} KB`}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-emerald-400 font-semibold">
                    {tier.storageSavingsPct === 0 ? '-' : `-${tier.storageSavingsPct.toFixed(1)}%`}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-purple-400">
                    {tier.psnrDb >= 99 ? '∞ (무손실)' : `${tier.psnrDb} dB`}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-sky-400">
                    {tier.ssim.toFixed(3)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold">
                    <span className={tier.ocrAccuracyPct >= 99.5 ? 'text-emerald-400' : tier.ocrAccuracyPct >= 98 ? 'text-amber-300' : 'text-rose-400'}>
                      {tier.ocrAccuracyPct.toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                    {tier.encodeLatencyMs} ms
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-300">
                    {tier.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Visual Artifacts Deep-Dive (4 Major Compression Distortions) */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="border-b border-slate-700/80 pb-4">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
            <AlertTriangle className="w-5 h-5" />
            <span>과압축 시 발생하는 4대 화질 왜곡 아티팩트(Artifacts) 및 OCR 영향</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            압축률을 무리하게 높일 때 번호판 문자 판독을 방해하는 물리적 신호 왜곡 현상
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Artifact 1: Blocking */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">1. 8x8 블록 노이즈 (Blocking)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">Q &lt; 75%</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              DCT 변환 단위를 8x8 픽셀 격자로 처리하기 때문에 고주파 계수가 0으로 버려지면 인접 블록 간 불연속 단차가 사각형 격자 형태로 드러납니다.
            </p>
            <div className="p-2.5 rounded-xl bg-slate-950 text-[11px] text-rose-300 border border-rose-900/40">
              <strong>OCR 영향:</strong> 번호판 외곽선 및 문자 수직/수평 획이 톱니 모양으로 깨져 문자 분할(Segmentation) 실패.
            </div>
          </div>

          {/* Artifact 2: Mosquito Ringing */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">2. 모스키토 링잉 (Ringing)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">Q &lt; 85%</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              급격한 명암 대비가 일어나는 글자 엣지(Edge) 주변에 물결 파문처럼 미세한 고스트 노이즈가 모기떼(Mosquito)처럼 번집니다.
            </p>
            <div className="p-2.5 rounded-xl bg-slate-950 text-[11px] text-amber-300 border border-amber-900/40">
              <strong>OCR 영향:</strong> 한글 받침 및 자음 '도/포/로'의 닫힌 루프 내부가 노이즈로 채워져 글자 오인식 유발.
            </div>
          </div>

          {/* Artifact 3: Chroma Subsampling Bleeding */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">3. 색상 번짐 (Chroma Bleed)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">4:2:0 서브샘플링</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              색차 성분(Cb/Cr)을 4픽셀당 1개만 샘플링하므로 녹색/노란색 번호판 바탕색이 흰색 글자 경계면으로 1~2픽셀 침범합니다.
            </p>
            <div className="p-2.5 rounded-xl bg-slate-950 text-[11px] text-purple-300 border border-purple-900/40">
              <strong>OCR 영향:</strong> 색상 임계처리(Color Thresholding) 시 글자 획의 두께가 얇아져 획 소실(Erosion) 발생.
            </div>
          </div>

          {/* Artifact 4: Over-smoothing */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">4. 과도한 스무딩 (Smoothing)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">WebP 저비트레이트</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              WebP의 인트라 프레임 디블록킹 필터가 과도하게 작동하면 블록은 안 생기지만 유화 물감처럼 텍스처 디테일이 뭉개집니다.
            </p>
            <div className="p-2.5 rounded-xl bg-slate-950 text-[11px] text-sky-300 border border-sky-900/40">
              <strong>OCR 영향:</strong> 야간 저조도 환경에서 번호판 음각/양각의 미세 그림자 경계선이 사라져 식별력 저하.
            </div>
          </div>

        </div>
      </div>

      {/* 5. 1-Year Storage & Hardware Cost Impact Calculator */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
          <div>
            <div className="flex items-center gap-2 text-sky-400 font-bold text-base">
              <HardDrive className="w-5 h-5" />
              <span>포맷/품질 선택에 따른 연간 스토리지 소요량 및 디스크 비용 비교</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              카메라 수량, 일일 통행량, 보관 일수에 따라 연간 필요한 감시용 전용 8TB HDD 수량 및 예산 산출
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-400 font-mono">
              연간 총 저장 사진 수: <strong className="text-white">{((cameraCount * dailyVehiclesPerCam * retentionDays) / 1000000).toFixed(1)}백만 장</strong>
            </div>
          </div>
        </div>

        {/* Input Parameters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-700">
          <div>
            <label className="text-xs text-slate-400 font-semibold block mb-1">카메라 채널 수 (대)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="64"
                value={cameraCount}
                onChange={(e) => setCameraCount(Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-sm font-bold text-white font-mono focus:outline-none focus:border-sky-500"
              />
              <span className="text-xs text-slate-400">대</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-semibold block mb-1">카메라당 일일 통행 차량 수</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1000"
                max="50000"
                step="1000"
                value={dailyVehiclesPerCam}
                onChange={(e) => setDailyVehiclesPerCam(Math.max(100, Number(e.target.value)))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-sm font-bold text-white font-mono focus:outline-none focus:border-sky-500"
              />
              <span className="text-xs text-slate-400">대/일</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-semibold block mb-1">법정 보관 일수 (Retention)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="30"
                max="1095"
                step="30"
                value={retentionDays}
                onChange={(e) => setRetentionDays(Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-sm font-bold text-white font-mono focus:outline-none focus:border-sky-500"
              />
              <span className="text-xs text-slate-400">일</span>
            </div>
          </div>
        </div>

        {/* 4 Representative Tiers Annual Comparison Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            annualSavingsComparison[0], // RAW
            annualSavingsComparison[4], // JPEG 95%
            annualSavingsComparison[5], // JPEG 90% (Standard)
            annualSavingsComparison[3], // WebP 85% (Modern)
          ].map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-2xl bg-slate-900 border-2 ${item.borderColor} space-y-3 flex flex-col justify-between`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`font-bold text-sm ${item.color}`}>{item.name}</span>
                  {item.recommended && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600">
                      추천
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400">{item.fhdSizeKb} KB / 장</div>
              </div>

              <div className="space-y-2 py-2 border-y border-slate-800">
                <div>
                  <div className="text-[11px] text-slate-400">연간 스토리지 총 소요량</div>
                  <div className="text-xl font-black text-white font-mono">
                    {item.totalTb >= 10
                      ? `${item.totalTb.toFixed(1)} TB`
                      : `${item.totalTb.toFixed(2)} TB`}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-400">필요 8TB HDD 수량 (RAID 5)</div>
                  <div className="text-base font-bold text-sky-400 font-mono">
                    {item.disksNeeded} 개 드라이브
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-400">예상 하드웨어 구매 비용</div>
                  <div className={`text-lg font-black font-mono ${item.color}`}>
                    약 {Math.round(item.hardwareCostKrw / 10000).toLocaleString()} 만원
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 leading-snug">
                {item.id === 'raw_24'
                  ? '무압축 물리 원본. 스토리지 비용 극대화.'
                  : item.id === 'jpeg_95'
                  ? 'JPEG 90% 대비 연간 1.7배 용량 추가 소모.'
                  : item.id === 'jpeg_90'
                  ? '가장 검증된 ALPR 표준. 최적의 가성비.'
                  : 'JPEG 90% 대비 30% 비용 추가 절감.'}
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
