import React, { useState, useMemo } from 'react';
import { 
  Gauge, 
  Cpu, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Sliders, 
  Info, 
  ArrowRight, 
  ShieldCheck, 
  HardDrive, 
  Download, 
  TrendingUp, 
  RefreshCw,
  ExternalLink,
  Table,
  Sparkles
} from 'lucide-react';

interface PresetData {
  resName: string;
  resLabel: string;
  width: number;
  height: number;
  fps: number;
  rawBandwidthGbps: number;
  recommendedUsb: string;
  usbMaxGbps: number;
  usableUsbGbps: number;
  utilizationRate: number;
  isSafe: boolean;
  notes: string;
}

const PRESET_TABLE: PresetData[] = [
  {
    resName: 'FHD (1080p)',
    resLabel: '1920 x 1080',
    width: 1920,
    height: 1080,
    fps: 30,
    rawBandwidthGbps: 1.49, // 1920 * 1080 * 24 * 30 / 1e9 = 1.493 Gbps
    recommendedUsb: 'USB 3.0 (USB 3.2 Gen 1)',
    usbMaxGbps: 5.0,
    usableUsbGbps: 4.0, // 80% rule
    utilizationRate: 37.3,
    isSafe: true,
    notes: '기본 1차로 ALPR 및 빌딩 주차 관제 표준. 대역폭 여유 넉넉함.'
  },
  {
    resName: 'FHD (1080p)',
    resLabel: '1920 x 1080',
    width: 1920,
    height: 1080,
    fps: 60,
    rawBandwidthGbps: 2.99, // 1920 * 1080 * 24 * 60 / 1e9 = 2.986 Gbps
    recommendedUsb: 'USB 3.0 (USB 3.2 Gen 1)',
    usbMaxGbps: 5.0,
    usableUsbGbps: 4.0,
    utilizationRate: 74.7,
    isSafe: true,
    notes: '고속도로 100km/h+ 단속 권장. 실효 대역폭(4.0 Gbps)의 약 75% 점유.'
  },
  {
    resName: 'QHD (1440p)',
    resLabel: '2560 x 1440',
    width: 2560,
    height: 1440,
    fps: 60,
    rawBandwidthGbps: 5.31, // 2560 * 1440 * 24 * 60 / 1e9 = 5.308 Gbps
    recommendedUsb: 'USB 3.1 (USB 3.2 Gen 2)',
    usbMaxGbps: 10.0,
    usableUsbGbps: 8.0,
    utilizationRate: 66.4,
    isSafe: true,
    notes: '2차로 동시 감시 머신비전. USB 3.0(5G) 실효 대역폭(4G) 초과로 USB 3.1 필수.'
  },
  {
    resName: 'UHD (4K)',
    resLabel: '3840 x 2160',
    width: 3840,
    height: 2160,
    fps: 30,
    rawBandwidthGbps: 5.97, // 3840 * 2160 * 24 * 30 / 1e9 = 5.972 Gbps
    recommendedUsb: 'USB 3.1 (USB 3.2 Gen 2)',
    usbMaxGbps: 10.0,
    usableUsbGbps: 8.0,
    utilizationRate: 74.6,
    isSafe: true,
    notes: '3차로 광역 교차로 감시. USB 3.1 10Gbps 포트 직결 필요.'
  },
  {
    resName: 'UHD (4K)',
    resLabel: '3840 x 2160',
    width: 3840,
    height: 2160,
    fps: 60,
    rawBandwidthGbps: 11.94, // 3840 * 2160 * 24 * 60 / 1e9 = 11.944 Gbps
    recommendedUsb: 'USB 3.2 (USB 3.2 Gen 2x2)',
    usbMaxGbps: 20.0,
    usableUsbGbps: 16.0,
    utilizationRate: 74.6,
    isSafe: true,
    notes: '초고속 다차선 단속 최고급 사양. USB 3.2 20Gbps 또는 Thunderbolt 필수.'
  }
];

interface UsbStandard {
  id: string;
  name: string;
  aliases: string;
  nominalGbps: number;
  effectiveGbps: number; // 80% rule
  encoding: string;
  color: string;
}

const USB_STANDARDS: UsbStandard[] = [
  { id: 'usb2', name: 'USB 2.0 (High-Speed)', aliases: 'USB 2.0', nominalGbps: 0.48, effectiveGbps: 0.384, encoding: 'NRZI (실효 ~35-40MB/s)', color: 'amber' },
  { id: 'usb3_0', name: 'USB 3.0 / USB 3.1 Gen 1', aliases: 'USB 3.2 Gen 1x1 (SuperSpeed 5Gbps)', nominalGbps: 5.0, effectiveGbps: 4.0, encoding: '8b/10b (오버헤드 20%)', color: 'blue' },
  { id: 'usb3_1', name: 'USB 3.1 Gen 2', aliases: 'USB 3.2 Gen 2x1 (SuperSpeed+ 10Gbps)', nominalGbps: 10.0, effectiveGbps: 8.0, encoding: '128b/132b (오버헤드 ~3%)', color: 'indigo' },
  { id: 'usb3_2', name: 'USB 3.2 Gen 2x2', aliases: 'Dual-Lane SuperSpeed 20Gbps', nominalGbps: 20.0, effectiveGbps: 16.0, encoding: '128b/132b x 2-lane', color: 'purple' },
  { id: 'usb4', name: 'USB4 / Thunderbolt 4', aliases: 'Next-Gen 40Gbps', nominalGbps: 40.0, effectiveGbps: 32.0, encoding: 'PCIe 3.0/4.0 Tunneling', color: 'emerald' },
];

interface ColorFormat {
  id: string;
  name: string;
  bpp: number;
  compressionRatio: number; // multiplier vs 24-bit RGB (1.0 = 100%)
  description: string;
  lossless: boolean;
}

const COLOR_FORMATS: ColorFormat[] = [
  { id: 'rgb24', name: '비압축 RGB24 / BGR24 (원본)', bpp: 24, compressionRatio: 1.0, description: '순수 24비트 비압축 풀컬러. 크로마 서브샘플링 없는 최고 화질.', lossless: true },
  { id: 'raw12', name: 'RAW 12-bit (Bayer CFA)', bpp: 12, compressionRatio: 0.5, description: '센서 픽셀당 12비트 Bayer 패턴. ISP 전송 전 원시 데이터.', lossless: true },
  { id: 'raw8', name: 'RAW 8-bit / Mono 8 (흑백)', bpp: 8, compressionRatio: 0.333, description: '야간 IR 850nm 흑백 단속 또는 8비트 Bayer 센서.', lossless: true },
  { id: 'yuv422', name: 'YUV422 / UYVY (16-bit)', bpp: 16, compressionRatio: 0.667, description: '색차 신호 수평 1/2 압축. 대역폭 33.3% 절감, ALPR 최적.', lossless: false },
  { id: 'yuv420', name: 'YUV420 / NV12 (12-bit)', bpp: 12, compressionRatio: 0.5, description: '색차 수평/수직 1/2 압축. 대역폭 50% 절감, 일반 비디오 표준.', lossless: false },
  { id: 'mjpeg', name: 'MJPEG 하드웨어 압축', bpp: 1.5, compressionRatio: 0.0625, description: '프레임별 JPEG 압축(약 1/16 압축). USB 2.0으로도 1080p 60fps 가능.', lossless: false },
  { id: 'h264', name: 'H.264 / AVC 온보드 압축', bpp: 0.25, compressionRatio: 0.0104, description: 'GOP 기반 고압축(수십 Mbps 수준). 초저대역폭 네트워크/USB 스트리밍.', lossless: false },
  { id: 'h265', name: 'H.265 / HEVC 초고압축', bpp: 0.15, compressionRatio: 0.00625, description: 'H.264 대비 50% 추가 절감. 4K 고화질 영상도 20~40 Mbps 내 전송.', lossless: false },
];

export const BandwidthSection: React.FC = () => {
  // Calculator Interactive State
  const [customWidth, setCustomWidth] = useState<number>(1920);
  const [customHeight, setCustomHeight] = useState<number>(1080);
  const [customFps, setCustomFps] = useState<number>(60);
  const [selectedFormatId, setSelectedFormatId] = useState<string>('rgb24');
  const [safetyMarginPercent, setSafetyMarginPercent] = useState<number>(80); // 80% effective rule
  const [activeTabSub, setActiveTabSub] = useState<'calculator' | 'matrix' | 'compression' | 'overhead'>('calculator');

  // Selected Color Format
  const currentFormat = useMemo(() => {
    return COLOR_FORMATS.find(f => f.id === selectedFormatId) || COLOR_FORMATS[0];
  }, [selectedFormatId]);

  // Calculations
  // Total pixels per frame
  const totalPixels = customWidth * customHeight;
  
  // Uncompressed 24-bit bandwidth in Gbps
  const rawRgbGbps = useMemo(() => {
    return (totalPixels * 24 * customFps) / 1_000_000_000;
  }, [totalPixels, customFps]);

  // Actual bandwidth with chosen format
  const actualBandwidthGbps = useMemo(() => {
    return (totalPixels * currentFormat.bpp * customFps) / 1_000_000_000;
  }, [totalPixels, currentFormat, customFps]);

  const actualBandwidthMbps = useMemo(() => {
    return actualBandwidthGbps * 1000;
  }, [actualBandwidthGbps]);

  // Savings percentage vs RAW 24-bit
  const bandwidthSavingsPercent = useMemo(() => {
    if (rawRgbGbps === 0) return 0;
    return Math.max(0, Math.round(((rawRgbGbps - actualBandwidthGbps) / rawRgbGbps) * 100));
  }, [rawRgbGbps, actualBandwidthGbps]);

  // Recommended USB evaluation
  const evaluation = useMemo(() => {
    for (const usb of USB_STANDARDS) {
      const effectiveLimit = usb.nominalGbps * (safetyMarginPercent / 100);
      if (actualBandwidthGbps <= effectiveLimit) {
        return {
          usb,
          safe: true,
          ratio: (actualBandwidthGbps / usb.nominalGbps) * 100,
          effectiveRatio: (actualBandwidthGbps / effectiveLimit) * 100,
          status: '정상 작동 (안정적)',
          color: 'emerald'
        };
      }
    }
    // Exceeded all USB specs
    return {
      usb: USB_STANDARDS[USB_STANDARDS.length - 1],
      safe: false,
      ratio: (actualBandwidthGbps / 40.0) * 100,
      effectiveRatio: (actualBandwidthGbps / 32.0) * 100,
      status: 'USB 대역폭 초과 (Thunderbolt 4 / PCIe / CoaXPress 필요)',
      color: 'rose'
    };
  }, [actualBandwidthGbps, safetyMarginPercent]);

  // Quick preset resolution handlers
  const applyPreset = (w: number, h: number, f: number) => {
    setCustomWidth(w);
    setCustomHeight(h);
    setCustomFps(f);
  };

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* 1. Header Banner */}
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-xs font-semibold text-sky-400 uppercase tracking-wider">
          <Gauge className="w-3.5 h-3.5" />
          <span>Camera Interface Bandwidth & USB Specification Lab</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          카메라 대역폭 & USB 규격 가이드
        </h1>
        <p className="text-slate-400 text-base sm:text-lg max-w-4xl leading-relaxed">
          비압축 24비트 RGB 원본부터 YUV422 색차 압축, H.264/MJPEG 인코딩까지 해상도와 FPS에 따른 실시간 대역폭을 연산하고, 
          USB 프로토콜 오버헤드(80% 실효 전송 룰)를 고려한 최적 인터페이스를 검증합니다.
        </p>

        {/* Core Metric Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <div className="text-[11px] font-mono text-slate-400">FHD 30 FPS 비압축</div>
            <div className="text-xl sm:text-2xl font-black text-sky-400 font-mono mt-1">1.5 Gbps</div>
            <div className="text-[11px] text-slate-400 mt-0.5">최소 권장: USB 3.0 (5G)</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <div className="text-[11px] font-mono text-slate-400">4K 60 FPS 비압축</div>
            <div className="text-xl sm:text-2xl font-black text-purple-400 font-mono mt-1">11.9 Gbps</div>
            <div className="text-[11px] text-slate-400 mt-0.5">최소 권장: USB 3.2 (20G)</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <div className="text-[11px] font-mono text-slate-400">YUV422 대역폭 절감</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1">-33.3%</div>
            <div className="text-[11px] text-slate-400 mt-0.5">24비트 → 16비트 색차 감소</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <div className="text-[11px] font-mono text-slate-400">실효 전송 한계 룰</div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono mt-1">약 80%</div>
            <div className="text-[11px] text-slate-400 mt-0.5">오버헤드 대비 상위 규격 권장</div>
          </div>
        </div>
      </div>

      {/* 2. Sub Navigation Tabs */}
      <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'calculator', label: '실시간 대역폭 계산기', icon: Sliders },
          { id: 'matrix', label: '비압축 표준 규격 매트릭스', icon: Table },
          { id: 'compression', label: '압축 전송 & 색상 포맷 비교', icon: Layers },
          { id: 'overhead', label: '실효 전송 속도 (80% 룰)', icon: Info },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTabSub === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTabSub(tab.id as any)}
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

      <div className="max-w-7xl mx-auto">
        {/* SUB-VIEW 1: Interactive Bandwidth Calculator */}
        {activeTabSub === 'calculator' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Controls Column (5 cols) */}
              <div className="lg:col-span-5 bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-7 space-y-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">파라미터 설정</h3>
                      <p className="text-xs text-slate-400">해상도, FPS 및 전송 색상 포맷 지정</p>
                    </div>
                  </div>
                  <button
                    onClick={() => applyPreset(1920, 1080, 60)}
                    className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-mono hover:underline"
                  >
                    <RefreshCw className="w-3 h-3" /> 초기화
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">원클릭 표준 해상도 프리셋</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => applyPreset(1920, 1080, 30)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                        customWidth === 1920 && customHeight === 1080 && customFps === 30
                          ? 'bg-sky-500 text-slate-950 font-bold border-sky-400'
                          : 'bg-slate-900/60 border-slate-700 hover:bg-slate-700/60 text-slate-300'
                      }`}
                    >
                      FHD 30 FPS
                    </button>
                    <button
                      onClick={() => applyPreset(1920, 1080, 60)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                        customWidth === 1920 && customHeight === 1080 && customFps === 60
                          ? 'bg-sky-500 text-slate-950 font-bold border-sky-400'
                          : 'bg-slate-900/60 border-slate-700 hover:bg-slate-700/60 text-slate-300'
                      }`}
                    >
                      FHD 60 FPS
                    </button>
                    <button
                      onClick={() => applyPreset(2560, 1440, 60)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                        customWidth === 2560 && customHeight === 1440 && customFps === 60
                          ? 'bg-sky-500 text-slate-950 font-bold border-sky-400'
                          : 'bg-slate-900/60 border-slate-700 hover:bg-slate-700/60 text-slate-300'
                      }`}
                    >
                      QHD 60 FPS
                    </button>
                    <button
                      onClick={() => applyPreset(3840, 2160, 30)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                        customWidth === 3840 && customHeight === 2160 && customFps === 30
                          ? 'bg-sky-500 text-slate-950 font-bold border-sky-400'
                          : 'bg-slate-900/60 border-slate-700 hover:bg-slate-700/60 text-slate-300'
                      }`}
                    >
                      4K 30 FPS
                    </button>
                    <button
                      onClick={() => applyPreset(3840, 2160, 60)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                        customWidth === 3840 && customHeight === 2160 && customFps === 60
                          ? 'bg-sky-500 text-slate-950 font-bold border-sky-400'
                          : 'bg-slate-900/60 border-slate-700 hover:bg-slate-700/60 text-slate-300'
                      }`}
                    >
                      4K 60 FPS
                    </button>
                    <button
                      onClick={() => applyPreset(1920, 1080, 120)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                        customWidth === 1920 && customHeight === 1080 && customFps === 120
                          ? 'bg-sky-500 text-slate-950 font-bold border-sky-400'
                          : 'bg-slate-900/60 border-slate-700 hover:bg-slate-700/60 text-slate-300'
                      }`}
                    >
                      FHD 120 FPS
                    </button>
                  </div>
                </div>

                {/* Resolution Inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">가로 해상도 (Width px)</label>
                    <input
                      type="number"
                      min={640}
                      max={7680}
                      step={16}
                      value={customWidth}
                      onChange={(e) => setCustomWidth(Math.max(320, parseInt(e.target.value) || 1920))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">세로 해상도 (Height px)</label>
                    <input
                      type="number"
                      min={480}
                      max={4320}
                      step={16}
                      value={customHeight}
                      onChange={(e) => setCustomHeight(Math.max(240, parseInt(e.target.value) || 1080))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* FPS Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium">프레임 속도 (FPS)</span>
                    <span className="font-mono text-sky-400 font-bold text-sm">{customFps} FPS</span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={120}
                    step={5}
                    value={customFps}
                    onChange={(e) => setCustomFps(parseInt(e.target.value))}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>15 FPS</span>
                    <span>30 FPS</span>
                    <span>60 FPS</span>
                    <span>90 FPS</span>
                    <span>120 FPS</span>
                  </div>
                </div>

                {/* Color Format Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">전송 색상 포맷 & 압축 방식</label>
                  <select
                    value={selectedFormatId}
                    onChange={(e) => setSelectedFormatId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
                  >
                    {COLOR_FORMATS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.bpp} bpp) {f.lossless ? '[무손실]' : '[압축/서브샘플링]'}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/60">
                    {currentFormat.description}
                  </p>
                </div>

                {/* Safety Margin Slider */}
                <div className="space-y-2 pt-2 border-t border-slate-700/60">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium flex items-center gap-1">
                      <span>실효 대역폭 안전 한계치</span>
                      <span className="text-[10px] text-slate-500 font-mono">(기본 80%)</span>
                    </span>
                    <span className="font-mono text-amber-400 font-bold">{safetyMarginPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min={60}
                    max={95}
                    step={5}
                    value={safetyMarginPercent}
                    onChange={(e) => setSafetyMarginPercent(parseInt(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400">
                    * USB 패킷 오버헤드(헤더, 핸드셰이크, 인코딩 손실)로 인해 최대 대역폭의 80%를 넘으면 프레임 드랍이 발생합니다.
                  </p>
                </div>

              </div>

              {/* Real-time Calculation & Evaluation Column (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Main Results Card */}
                <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-700/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/80 pb-4">
                    <div>
                      <span className="text-xs font-mono text-slate-400">실시간 연산 결과</span>
                      <h4 className="text-2xl font-black text-white flex items-center gap-2 mt-0.5">
                        <span>{actualBandwidthGbps.toFixed(2)} Gbps</span>
                        <span className="text-sm font-normal text-slate-400">
                          ({actualBandwidthMbps.toFixed(0)} Mbps)
                        </span>
                      </h4>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono text-slate-400">비압축 24비트 대비 절감</span>
                      <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                        {bandwidthSavingsPercent > 0 ? `-${bandwidthSavingsPercent}% 절약` : '0% (원본 24비트)'}
                      </div>
                    </div>
                  </div>

                  {/* Recommended USB Interface Banner */}
                  <div className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    evaluation.safe 
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${evaluation.safe ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {evaluation.safe ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                      </div>
                      <div>
                        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">최소 권장 인터페이스</div>
                        <div className="text-lg font-black text-white">{evaluation.usb.name}</div>
                        <div className="text-xs text-slate-300">{evaluation.usb.aliases}</div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <div className="text-[11px] font-mono text-slate-400">인터페이스 대역폭</div>
                      <div className="text-lg font-black text-sky-400 font-mono">{evaluation.usb.nominalGbps} Gbps</div>
                      <div className="text-[11px] text-amber-300 font-mono">
                        실효 한계: {(evaluation.usb.nominalGbps * (safetyMarginPercent / 100)).toFixed(1)} Gbps
                      </div>
                    </div>
                  </div>

                  {/* Bandwidth Utilization Meter */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-300">
                        {evaluation.usb.name} 대역폭 점유율: 
                        <strong className="text-white ml-1">{evaluation.ratio.toFixed(1)}%</strong>
                      </span>
                      <span className={`font-bold ${evaluation.ratio > safetyMarginPercent ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {evaluation.ratio > safetyMarginPercent ? '안전치 초과 (위험)' : '안전 범위 (권장)'}
                      </span>
                    </div>

                    {/* Multi-tier progress bar */}
                    <div className="relative w-full h-4 rounded-full bg-slate-950 border border-slate-700 overflow-hidden">
                      {/* Safety threshold line */}
                      <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-20 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                        style={{ left: `${safetyMarginPercent}%` }}
                        title={`안전 실효 한계 (${safetyMarginPercent}%)`}
                      />
                      {/* Actual fill */}
                      <div 
                        className={`h-full transition-all duration-500 rounded-full ${
                          evaluation.ratio > safetyMarginPercent
                            ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600'
                            : 'bg-gradient-to-r from-sky-500 via-emerald-400 to-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, evaluation.ratio)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>0%</span>
                      <span className="text-amber-400 font-semibold">{safetyMarginPercent}% (실효 임계치)</span>
                      <span>100% ({evaluation.usb.nominalGbps} Gbps)</span>
                    </div>
                  </div>

                  {/* Formula Breakdown Card */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-sky-400" />
                      <span>이론 대역폭 산출 공식</span>
                    </div>
                    <div className="font-mono text-xs text-sky-300 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 break-all">
                      {customWidth.toLocaleString()} px × {customHeight.toLocaleString()} px × {currentFormat.bpp} bit × {customFps} FPS = {((totalPixels * currentFormat.bpp * customFps) / 1e9).toFixed(3)} Gbps
                    </div>
                    <div className="text-[11px] text-slate-400">
                      * 1 Byte = 8 bits, 1 Gbps = 1,000,000,000 bps (10진 표기 머신비전 전송 표준)
                    </div>
                  </div>

                </div>

                {/* Interface Comparison Horizontal Cards */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">주요 USB 규격별 지원 여부 진단</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {USB_STANDARDS.slice(0, 4).map((usb) => {
                      const effectiveLimit = usb.nominalGbps * (safetyMarginPercent / 100);
                      const isFit = actualBandwidthGbps <= effectiveLimit;
                      const isBarelyFit = actualBandwidthGbps > effectiveLimit && actualBandwidthGbps <= usb.nominalGbps;
                      return (
                        <div
                          key={usb.id}
                          className={`p-3.5 rounded-2xl border transition-all ${
                            isFit
                              ? 'bg-slate-800/80 border-emerald-500/40 text-slate-200'
                              : isBarelyFit
                              ? 'bg-slate-800/80 border-amber-500/50 text-slate-200'
                              : 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-75'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-white">{usb.name}</span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                              isFit
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : isBarelyFit
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}>
                              {isFit ? '지원 가능' : isBarelyFit ? '경계치 (불안정)' : '대역폭 부족'}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                            <span>공칭 {usb.nominalGbps} Gbps</span>
                            <span>실효 {effectiveLimit.toFixed(1)} Gbps</span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1">{usb.encoding}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* SUB-VIEW 2: Presets Matrix Table (Matches user's prompt directly) */}
        {activeTabSub === 'matrix' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">비압축 원본(24비트 RGB) 대역폭 및 권장 USB 매트릭스</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    크로마 서브샘플링 및 손실 압축이 없는 순수 24비트 비압축 비디오 전송 기준
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>80% 실효 대역폭 룰 적용</span>
                </div>
              </div>

              {/* Responsive Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-700/90 shadow-inner">
                <table className="w-full text-left text-sm text-slate-200">
                  <thead className="bg-slate-900/90 text-xs uppercase text-slate-400 font-mono border-b border-slate-700">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">해상도</th>
                      <th className="py-3.5 px-4 font-semibold text-center">FPS</th>
                      <th className="py-3.5 px-4 font-semibold text-right">필요 대역폭</th>
                      <th className="py-3.5 px-4 font-semibold text-center">권장 USB 규격</th>
                      <th className="py-3.5 px-4 font-semibold text-right">인터페이스 대역폭</th>
                      <th className="py-3.5 px-4 font-semibold text-right">실효 여유율</th>
                      <th className="py-3.5 px-4 font-semibold">ITS / ALPR 적용 특이사항</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono text-xs sm:text-sm">
                    {PRESET_TABLE.map((row, idx) => (
                      <tr 
                        key={idx}
                        className="hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-sans font-bold text-white flex flex-col">
                          <span>{row.resName}</span>
                          <span className="text-[11px] text-slate-400 font-mono font-normal">{row.resLabel}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-sky-400">
                          {row.fps}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                          {row.rawBandwidthGbps} Gbps
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-sky-950/80 border border-sky-600/50 text-sky-300 font-sans font-semibold text-xs">
                            {row.recommendedUsb}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-300">
                          {row.usbMaxGbps} Gbps
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="text-emerald-400 font-bold">{row.utilizationRate}% 점유</span>
                          <span className="text-[11px] text-slate-400 block font-normal">
                            (실효 {row.usableUsbGbps}G 중)
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-sans text-xs text-slate-300">
                          {row.notes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Descriptive Explanations from User Brief */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-700/80 space-y-2">
                  <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                    <HardDrive className="w-4 h-4" />
                    <span>비압축 데이터 기준</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    위 표의 필요 대역폭은 크로마 서브샘플링이나 손실 압축이 없는 순수 24비트 컬러 포맷(RGB888 / BGR24)을 
                    전송할 때 발생하는 이론적인 데이터양입니다. 머신비전 엣지 OCR 및 딥러닝 추론 시 화질 손실 없이 최고 정확도를 보장합니다.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-700/80 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>압축 전송을 통한 대역폭 절약</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    YUV422(16비트) 색상 포맷을 적용하면 요구 대역폭이 30%가량(정확히 33.3%) 감소합니다. 
                    카메라 자체에서 H.264나 MJPEG 방식으로 압축 전송할 경우 수십 Mbps 수준으로 대폭 축소되어 
                    480Mbps 속도의 USB 2.0으로도 1080p 60fps나 4K 영상 전송이 가능해집니다.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-700/80 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>실효 전송 속도 고려 (80% 룰)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    USB 규격 상의 인터페이스 대역폭은 프로토콜 오버헤드를 포함한 수치이므로, 실제 유효 데이터 전송 속도는 
                    표기된 최대 대역폭의 약 80% 수준으로 제한됩니다. 따라서 필요 대역폭이 인터페이스 대역폭의 80%에 근접한다면 
                    한 단계 상위 규격의 USB 연결을 사용하는 것이 안정적입니다.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SUB-VIEW 3: Compression & Color Formats */}
        {activeTabSub === 'compression' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-slate-700/80 pb-4">
                <h3 className="text-xl font-bold text-white tracking-tight">전송 색상 포맷별 대역폭 절감 심층 분석</h3>
                <p className="text-xs text-slate-400 mt-1">
                  동일한 1080p 60 FPS 영상 전송 시 포맷별 데이터양 및 USB 2.0 / USB 3.0 호환성
                </p>
              </div>

              {/* Color Format Visual Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    format: 'RGB24 / BGR24',
                    bpp: '24 bpp',
                    ratio: '100% (기준)',
                    bw1080p60: '2.99 Gbps',
                    minUsb: 'USB 3.0 (5 Gbps)',
                    loss: '무손실 (최고)',
                    color: 'border-blue-500/60 bg-blue-500/10 text-blue-300',
                    desc: '픽셀당 Red/Green/Blue 각 8비트 완전 보존. 압축 아티팩트가 없어 차량 번호판 글자 경계선 왜곡 제로.'
                  },
                  {
                    format: 'YUV422 (UYVY)',
                    bpp: '16 bpp',
                    ratio: '66.7% (-33.3% 절약)',
                    bw1080p60: '1.99 Gbps',
                    minUsb: 'USB 3.0 (5 Gbps)',
                    loss: '색차 1/2 서브샘플링',
                    color: 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300',
                    desc: '인간의 시각이 밝기(Y)에 민감하고 색차(U, V)에 둔감한 특성 활용. 번호판 OCR 인식률 저하 없이 대역폭 33% 즉시 절감.'
                  },
                  {
                    format: 'MJPEG (하드웨어 압축)',
                    bpp: '~1.5 bpp',
                    ratio: '6.2% (-93.8% 절약)',
                    bw1080p60: '186 Mbps',
                    minUsb: 'USB 2.0 (480 Mbps)',
                    loss: '손실 DCT 인코딩',
                    color: 'border-amber-500/60 bg-amber-500/10 text-amber-300',
                    desc: '카메라 ISP에서 프레임별 독립 JPEG 압축. 480Mbps 구형 USB 2.0 포트로도 1080p 60fps 부드럽게 전송 가능.'
                  },
                  {
                    format: 'H.264 / AVC (GOP)',
                    bpp: '~0.25 bpp',
                    ratio: '1.0% (-99.0% 절약)',
                    bw1080p60: '31 Mbps',
                    minUsb: 'USB 2.0 (480 Mbps)',
                    loss: '시간축 예측 압축',
                    color: 'border-purple-500/60 bg-purple-500/10 text-purple-300',
                    desc: 'I/P/B 프레임 움직임 예측 압축. 대역폭이 극단적으로 절감되나 1~2프레임 압축 지연(Latency)이 발생할 수 있음.'
                  }
                ].map((item, idx) => (
                  <div key={idx} className={`p-5 rounded-2xl border-2 flex flex-col justify-between ${item.color}`}>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-base">{item.format}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                          {item.bpp}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-300">대역폭 배율: {item.ratio}</div>
                      <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                        {item.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-700/60 space-y-1 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400">1080p 60fps:</span>
                        <span className="text-white font-bold">{item.bw1080p60}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">최소 인터페이스:</span>
                        <span className="text-sky-300 font-bold">{item.minUsb}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Technical Comparison Note */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 flex items-start gap-3">
                <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed space-y-1">
                  <div className="font-bold text-white">머신비전 ALPR에서의 최적 포맷 선택 가이드</div>
                  <div>
                    초고속 주행 차량의 번호판 OCR을 위해서는 블록 왜곡(Block Artifact)이 발생하는 H.264보다 
                    <strong> 비압축 RGB24</strong> 또는 <strong>YUV422(UYVY)</strong>를 USB 3.0/3.1로 전송하는 것이 가장 권장됩니다. 
                    다만 케이블 길이가 5m를 초과하거나 산업용 PC 포트가 부족한 환경에서는 카메라 온보드 MJPEG 하드웨어 인코딩을 통해 
                    USB 2.0으로 안정적인 스트리밍을 구현할 수 있습니다.
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SUB-VIEW 4: Protocol Overhead & 80% Rule */}
        {activeTabSub === 'overhead' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-slate-700/80 pb-4">
                <h3 className="text-xl font-bold text-white tracking-tight">USB 실효 대역폭 80% 룰 & 프로토콜 오버헤드 메커니즘</h3>
                <p className="text-xs text-slate-400 mt-1">
                  공칭 대역폭(Nominal Bandwidth)과 실제 전송 속도(Effective Throughput)의 차이 및 안정화 가이드
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Overhead Factors Card */}
                <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-4">
                  <h4 className="font-bold text-white text-base flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <span>실효 전송 속도를 깎아먹는 4대 오버헤드 요인</span>
                  </h4>
                  <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-sky-400 flex items-center justify-center shrink-0 font-mono font-bold text-[10px]">1</span>
                      <div>
                        <strong className="text-white">물리 계층 라인 인코딩 손실:</strong> USB 3.0은 8b/10b 인코딩을 사용하여 8비트 데이터마다 2비트 오버헤드가 발생(무려 20% 대역폭이 제어 신호로 소모). USB 3.1부터는 128b/132b로 약 3% 수준으로 개선됨.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-sky-400 flex items-center justify-center shrink-0 font-mono font-bold text-[10px]">2</span>
                      <div>
                        <strong className="text-white">USB 프로토콜 패킷 오버헤드:</strong> UVC(USB Video Class) 페이로드 헤더, CRC 체크섬, ACK/NAK 토큰 패킷, 프레임 분할 오버헤드가 누적됩니다.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-sky-400 flex items-center justify-center shrink-0 font-mono font-bold text-[10px]">3</span>
                      <div>
                        <strong className="text-white">호스트 컨트롤러(xHCI) 스케줄링 딜레이:</strong> OS의 USB 드라이버 스케줄링 간격(125µs 마이크로프레임)과 DMA 메모리 전송 인터럽트 지연.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-sky-400 flex items-center justify-center shrink-0 font-mono font-bold text-[10px]">4</span>
                      <div>
                        <strong className="text-white">동일 USB 허브/루트 버스 대역폭 분할:</strong> 마우스, 키보드, 24GHz 레이더 센서 등이 같은 USB 루트 허브를 공유할 경우 가용 대역폭이 분할됩니다.
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Practical Engineering Guidelines */}
                <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-4">
                  <h4 className="font-bold text-white text-base flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span>현장 엔지니어를 위한 안정적 구축 지침</span>
                  </h4>
                  <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                      <strong className="text-emerald-300 block mb-1">✓ 80% 안전 임계치 초과 시 즉시 상위 규격 승격</strong>
                      필요 대역폭이 USB 3.0(5Gbps)의 80%인 4.0Gbps를 초과할 경우(예: QHD 60fps 5.3Gbps, 4K 30fps 6.0Gbps), 주저 없이 <strong>USB 3.1 Gen 2(10Gbps)</strong> 또는 <strong>USB 3.2(20Gbps)</strong> 컨트롤러 카드를 장착해야 합니다.
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                      <strong className="text-sky-300 block mb-1">✓ 독립 PCIe xHCI 호스트 컨트롤러 카드 사용</strong>
                      메인보드 내장 USB 포트는 여러 포트가 단일 루트 허브 대역폭을 공유합니다. 4-채널 독립 컨트롤러(예: Renesas µPD720202 4-칩 카드)를 사용하면 포트당 온전한 5G/10G를 보장받습니다.
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                      <strong className="text-purple-300 block mb-1">✓ 산업용 나사 잠금형(Screw-Lock) USB 3.0 케이블</strong>
                      고속 데이터 전송 시 차량 진동으로 인한 미세 접촉 불량은 패킷 재전송을 유발하여 실효 대역폭을 50% 이하로 급락시킵니다.
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
};
