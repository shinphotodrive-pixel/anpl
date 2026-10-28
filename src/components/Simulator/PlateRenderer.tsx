import React, { useState, useMemo } from 'react';
import { AugmentationParams, PlateType } from '../../types/alpr';
import { 
  Columns, 
  Maximize2, 
  Split, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  TrendingDown, 
  LayoutGrid, 
  ArrowUpRight, 
  ShieldCheck, 
  Camera,
  ToggleLeft,
  ToggleRight,
  Eye,
  ArrowRight,
  Sliders
} from 'lucide-react';
import { simulateOcrInference } from '../../utils/alprSimulator';

export type ComparisonViewMode = 'side-by-side' | 'split' | 'thumbnail' | 'single';

export interface SamplePlateItem {
  id: string;
  text: string;
  type: PlateType;
  label: string;
  desc: string;
}

export const THUMBNAIL_SAMPLE_PLATES: SamplePlateItem[] = [
  { id: 'sample-1', text: '123가 4567', type: 'white_8', label: '8자리 필름 (KOR)', desc: '자가용 승용차' },
  { id: 'sample-2', text: '58조 8912', type: 'white_7', label: '7자리 일반', desc: '자가용 승용차' },
  { id: 'sample-3', text: 'EV 09다 8765', type: 'ev_blue', label: '친환경 전기차 (EV)', desc: '전기차 전용 블루 번호판' },
  { id: 'sample-4', text: '서울 31 바 1234', type: 'yellow_commercial', label: '영업용 택시', desc: '황색 바탕 택시 전용' },
  { id: 'sample-5', text: '경기 72 사 5543', type: 'yellow_commercial', label: '영업용 화물/버스', desc: '대형 화물/노선버스' },
  { id: 'sample-6', text: '41너 6520', type: 'green_retro', label: '구형 녹색', desc: '2006년 이전 녹색 번호판' },
  { id: 'sample-7', text: '365하 8899', type: 'white_8', label: '대여사업용 (렌터카)', desc: '대여사업용 (하/허/호)' },
  { id: 'sample-8', text: 'EV 77루 2468', type: 'ev_blue', label: '친환경 수소차 (FCEV)', desc: '친환경 수소차 번호판' },
];

interface PlateRendererProps {
  plateText: string;
  plateType: PlateType;
  params: AugmentationParams;
  showBBox: boolean;
  detected: boolean;
  overallConfidence: number;
  sharpnessScore: number;
  onSelectPlate?: (text: string, type: PlateType) => void;
  viewMode?: ComparisonViewMode;
  onViewModeChange?: (mode: ComparisonViewMode) => void;
}

// Clean default parameters for original baseline
const ORIGINAL_PARAMS: AugmentationParams = {
  blur: 0,
  brightness: 100,
  contrast: 100,
  noise: 0,
  rotate: 0,
  perspectiveX: 0,
  perspectiveY: 0,
  rain: 0,
  fog: 0,
  dirt: 0,
  glare: 0,
};

// Reusable Plate Graphic Component
interface PlateGraphicProps {
  plateText: string;
  plateType: PlateType;
  params: AugmentationParams;
  isOriginal?: boolean;
  scale?: number;
  showBBox?: boolean;
  detected?: boolean;
  confidence?: number;
}

const PlateGraphic: React.FC<PlateGraphicProps> = ({
  plateText,
  plateType,
  params,
  isOriginal = false,
  scale = 1,
  showBBox = true,
  detected = true,
  confidence = 99,
}) => {
  const getPlateStyles = () => {
    switch (plateType) {
      case 'ev_blue':
        return {
          containerClass: 'bg-gradient-to-r from-sky-200 via-sky-100 to-sky-200 border-sky-600 text-sky-950',
          hasHologram: false,
          isEV: true,
          badgeText: '친환경 전기차',
          boltColor: 'bg-sky-700',
        };
      case 'yellow_commercial':
        return {
          containerClass: 'bg-gradient-to-b from-amber-300 via-amber-300 to-yellow-400 border-amber-900 text-slate-900',
          hasHologram: false,
          isEV: false,
          badgeText: '영업용 (황색)',
          boltColor: 'bg-amber-950',
        };
      case 'green_retro':
        return {
          containerClass: 'bg-emerald-800 border-emerald-950 text-white',
          hasHologram: false,
          isEV: false,
          badgeText: '구형 (녹색)',
          boltColor: 'bg-emerald-950',
        };
      case 'white_7':
        return {
          containerClass: 'bg-white border-slate-900 text-slate-900',
          hasHologram: false,
          isEV: false,
          badgeText: '일반 7자리',
          boltColor: 'bg-slate-700',
        };
      case 'white_8':
      default:
        return {
          containerClass: 'bg-white border-slate-900 text-slate-900',
          hasHologram: true,
          isEV: false,
          badgeText: '8자리 필름 (KOR)',
          boltColor: 'bg-slate-700',
        };
    }
  };

  const plateConfig = getPlateStyles();

  // CSS filters
  const blurVal = params.blur > 0 ? `blur(${params.blur * scale}px)` : '';
  const brightnessVal = `brightness(${params.brightness / 100})`;
  const contrastVal = `contrast(${params.contrast / 100})`;
  const filterStyle = [blurVal, brightnessVal, contrastVal].filter(Boolean).join(' ');

  // 3D transform
  const transformStyle = isOriginal
    ? 'perspective(800px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)'
    : `perspective(800px) rotateX(${params.perspectiveX}deg) rotateY(${params.perspectiveY}deg) rotateZ(${params.rotate}deg)`;

  const bboxColor = !detected 
    ? 'border-rose-500 text-rose-500 bg-rose-500/10'
    : confidence >= 80 
      ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
      : confidence >= 50
        ? 'border-amber-500 text-amber-400 bg-amber-500/10'
        : 'border-rose-500 text-rose-400 bg-rose-500/10';

  const baseWidth = 340 * scale;
  const baseHeight = 82 * scale;
  const fontSize = `${2.3 * scale}rem`;

  return (
    <div 
      className="relative transition-transform duration-200 ease-out z-10 select-none"
      style={{ transform: transformStyle }}
    >
      <div
        className={`relative flex items-center justify-center rounded-lg border-4 shadow-xl overflow-hidden transition-all duration-150 ${plateConfig.containerClass}`}
        style={{
          width: `${baseWidth}px`,
          height: `${baseHeight}px`,
          filter: filterStyle,
        }}
      >
        {/* Mounting Bolts */}
        <div 
          className={`absolute ${plateConfig.boltColor} rounded-full shadow-inner border border-slate-400/40`}
          style={{ top: `${8 * scale}px`, left: `${20 * scale}px`, width: `${9 * scale}px`, height: `${9 * scale}px` }} 
        />
        <div 
          className={`absolute ${plateConfig.boltColor} rounded-full shadow-inner border border-slate-400/40`}
          style={{ top: `${8 * scale}px`, right: `${20 * scale}px`, width: `${9 * scale}px`, height: `${9 * scale}px` }} 
        />

        {/* Hologram for 8-digit reflective film */}
        {plateConfig.hasHologram && (
          <div 
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-b from-blue-700 via-blue-600 to-blue-800 border-r border-blue-900 flex flex-col items-center justify-between shadow-sm overflow-hidden"
            style={{ width: `${40 * scale}px`, padding: `${5 * scale}px ${3 * scale}px` }}
          >
            <div className="flex flex-col items-center">
              <div 
                className="rounded-full bg-gradient-to-tr from-blue-400 to-rose-400 flex items-center justify-center border border-white/40 shadow-inner"
                style={{ width: `${18 * scale}px`, height: `${18 * scale}px` }}
              >
                <div className="rounded-full bg-white/70" style={{ width: `${8 * scale}px`, height: `${8 * scale}px` }} />
              </div>
              <span className="font-bold text-white tracking-widest mt-0.5" style={{ fontSize: `${7 * scale}px` }}>KOR</span>
            </div>
            <div className="text-blue-200/60 font-mono tracking-tighter text-center leading-tight" style={{ fontSize: `${6 * scale}px` }}>
              대한민국
            </div>
            <div className="bg-gradient-to-r from-sky-300 to-blue-200 rounded-[2px] opacity-80" style={{ width: `${14 * scale}px`, height: `${6 * scale}px` }} />
          </div>
        )}

        {/* EV Badge */}
        {plateConfig.isEV && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-700/30 font-bold flex flex-col items-center pointer-events-none">
            <svg style={{ width: `${22 * scale}px`, height: `${22 * scale}px` }} viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 2v11h3v9l7-12h-4l3-8z" />
            </svg>
            <span style={{ fontSize: `${7 * scale}px` }} className="font-extrabold tracking-tight">EV</span>
          </div>
        )}

        {/* License Plate String */}
        <div 
          className={`font-black tracking-wider flex items-center justify-center ${
            plateConfig.hasHologram ? (scale < 0.9 ? 'ml-8' : 'ml-10') : ''
          }`}
          style={{
            fontSize,
            letterSpacing: '0.07em',
            textShadow: '0 1px 1px rgba(0,0,0,0.12)',
          }}
        >
          {plateText}
        </div>

        {/* Rain Overlays */}
        {params.rain > 0 && !isOriginal && (
          <div 
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              backgroundImage: 'repeating-linear-gradient(110deg, transparent, transparent 12px, rgba(255,255,255,0.4) 13px, transparent 16px)',
              opacity: Math.min(0.95, params.rain / 100),
            }}
          />
        )}

        {/* Fog Overlay */}
        {params.fog > 0 && !isOriginal && (
          <div 
            className="absolute inset-0 pointer-events-none bg-slate-200/70 z-20"
            style={{ opacity: (params.fog / 100) * 0.85 }}
          />
        )}

        {/* Dirt Overlay */}
        {params.dirt > 0 && !isOriginal && (
          <div 
            className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
            style={{ opacity: Math.min(1, params.dirt / 85) }}
          >
            <div 
              className="absolute top-2 left-16 bg-amber-950/80 rounded-full blur-[1.5px] rotate-12" 
              style={{ width: `${(14 + params.dirt * 0.35) * scale}px`, height: `${(8 + params.dirt * 0.2) * scale}px` }}
            />
            <div 
              className="absolute bottom-1 right-20 bg-amber-950/85 rounded-full blur-[1.2px] -rotate-6" 
              style={{ width: `${(16 + params.dirt * 0.45) * scale}px`, height: `${(10 + params.dirt * 0.25) * scale}px` }}
            />
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-900/75 rounded-full blur-[2px]" 
              style={{ width: `${(8 + params.dirt * 0.3) * scale}px`, height: `${(6 + params.dirt * 0.2) * scale}px` }}
            />
            <div 
              className="absolute top-1 right-8 bg-amber-950/70 rounded-full blur-[1px]" 
              style={{ width: `${(6 + params.dirt * 0.25) * scale}px`, height: `${(6 + params.dirt * 0.25) * scale}px` }}
            />
          </div>
        )}

        {/* Glare Overlay */}
        {params.glare > 0 && !isOriginal && (
          <div 
            className="absolute pointer-events-none z-20"
            style={{
              top: '-35px',
              right: '-25px',
              width: `${(120 + params.glare * 1.4) * scale}px`,
              height: `${(120 + params.glare * 1.4) * scale}px`,
              background: 'radial-gradient(circle, rgba(255,255,255,0.98) 0%, rgba(255,255,180,0.65) 35%, transparent 70%)',
              opacity: Math.min(1, params.glare / 90),
            }}
          />
        )}

        {/* Noise Overlay */}
        {params.noise > 0 && !isOriginal && (
          <div 
            className="absolute inset-0 pointer-events-none z-20 mix-blend-overlay"
            style={{
              backgroundImage: `url('data:image/svg+xml,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E')`,
              opacity: Math.min(0.9, (params.noise / 100) * 0.85),
            }}
          />
        )}

        {/* Blur Streaks */}
        {params.blur > 1 && !isOriginal && (
          <div 
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              background: 'repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(255,255,255,0.18) 4px, transparent 6px)',
              opacity: Math.min(0.75, (params.blur / 16) * 0.9),
            }}
          />
        )}
      </div>

      {/* AI Model Bounding Box */}
      {showBBox && (
        <div 
          className={`absolute -inset-2 rounded-lg border-2 pointer-events-none z-30 transition-all ${bboxColor}`}
        >
          <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-current" />
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-current" />
          <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-current" />
          <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-current" />

          <div className="absolute -top-5 left-0 flex items-center gap-1 px-1.5 py-0.2 bg-slate-900 border border-current rounded text-[9.5px] font-mono font-bold shadow">
            <span>{isOriginal ? 'GROUND_TRUTH' : (detected ? 'AUG_PLATE' : 'NO_DET')}</span>
            <span>·</span>
            <span>{confidence}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

export const PlateRenderer: React.FC<PlateRendererProps> = ({
  plateText,
  plateType,
  params,
  showBBox,
  detected,
  overallConfidence,
  sharpnessScore,
  onSelectPlate,
  viewMode: controlledViewMode,
  onViewModeChange,
}) => {
  const [internalViewMode, setInternalViewMode] = useState<ComparisonViewMode>('side-by-side');
  const viewMode = controlledViewMode ?? internalViewMode;
  const setViewMode = (mode: ComparisonViewMode) => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    } else {
      setInternalViewMode(mode);
    }
  };

  const [splitPosition, setSplitPosition] = useState<number>(50); // 0 to 100 for split wiper
  const [peekOriginal, setPeekOriginal] = useState<boolean>(false);

  // Check if any distortion is applied
  const isDistorted = params.blur > 0 || params.noise > 0 || params.brightness !== 100 || 
                      params.contrast !== 100 || params.rotate !== 0 || params.perspectiveX !== 0 ||
                      params.perspectiveY !== 0 || params.rain > 0 || params.fog > 0 || 
                      params.dirt > 0 || params.glare > 0;

  const confidenceDrop = Math.max(0, Number((99.6 - overallConfidence).toFixed(1)));
  const sharpnessDrop = Math.max(0, 100 - sharpnessScore);

  // Live OCR inference calculation for detailed character prediction comparison
  const liveInference = useMemo(() => {
    return simulateOcrInference(plateText, plateType, params);
  }, [plateText, plateType, params]);

  // Real-time parameter differences against baseline
  const activeParamDiffs = useMemo(() => {
    const diffs: { label: string; from: string; to: string; delta: string; color: string }[] = [];

    if (params.blur > 0) {
      diffs.push({
        label: '블러 (Blur)',
        from: '0px',
        to: `${params.blur}px`,
        delta: `+${params.blur}px`,
        color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      });
    }

    if (params.brightness !== 100) {
      const diff = params.brightness - 100;
      diffs.push({
        label: '밝기 (Brightness)',
        from: '100%',
        to: `${params.brightness}%`,
        delta: `${diff > 0 ? '+' : ''}${diff}%`,
        color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      });
    }

    if (params.contrast !== 100) {
      const diff = params.contrast - 100;
      diffs.push({
        label: '대비 (Contrast)',
        from: '100%',
        to: `${params.contrast}%`,
        delta: `${diff > 0 ? '+' : ''}${diff}%`,
        color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      });
    }

    if (params.noise > 0) {
      diffs.push({
        label: '노이즈 (Noise)',
        from: '0%',
        to: `${params.noise}%`,
        delta: `+${params.noise}%`,
        color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      });
    }

    if (params.rain > 0) {
      diffs.push({
        label: '강우 (Rain)',
        from: '0%',
        to: `${params.rain}%`,
        delta: `+${params.rain}%`,
        color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      });
    }

    if (params.fog > 0) {
      diffs.push({
        label: '안개 (Fog)',
        from: '0%',
        to: `${params.fog}%`,
        delta: `+${params.fog}%`,
        color: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      });
    }

    if (params.dirt > 0) {
      diffs.push({
        label: '오염 (Dirt)',
        from: '0%',
        to: `${params.dirt}%`,
        delta: `+${params.dirt}%`,
        color: 'bg-stone-500/20 text-stone-300 border-stone-500/30',
      });
    }

    if (params.glare > 0) {
      diffs.push({
        label: '역광 (Glare)',
        from: '0%',
        to: `${params.glare}%`,
        delta: `+${params.glare}%`,
        color: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      });
    }

    if (params.rotate !== 0 || params.perspectiveX !== 0 || params.perspectiveY !== 0) {
      diffs.push({
        label: '기하 회전/원근',
        from: '0° / 0°',
        to: `${params.rotate}° / (${params.perspectiveX}°, ${params.perspectiveY}°)`,
        delta: `${params.rotate !== 0 ? `회전 ${params.rotate}° ` : ''}${params.perspectiveX !== 0 ? `원근X ${params.perspectiveX}°` : ''}`,
        color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      });
    }

    return diffs;
  }, [params]);

  // Compute live multi-plate simulation results for Thumbnail Preview mode
  const thumbnailResults = useMemo(() => {
    return THUMBNAIL_SAMPLE_PLATES.map((sample) => {
      const sim = simulateOcrInference(sample.text, sample.type, params);
      const isExactMatch = sim.detected && sim.predictedText === sample.text;
      return {
        ...sample,
        sim,
        isExactMatch,
      };
    });
  }, [params]);

  const totalSamples = thumbnailResults.length;
  const matchCount = thumbnailResults.filter((r) => r.isExactMatch).length;
  const detectedCount = thumbnailResults.filter((r) => r.sim.detected).length;
  const avgConfidence = Math.round(
    thumbnailResults.reduce((acc, r) => acc + (r.sim.detected ? r.sim.overallConfidence : 0), 0) / (totalSamples || 1)
  );

  return (
    <div className="flex flex-col gap-3">
      {/* View Mode Toolbar Header with Before/After Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            시뮬레이터 뷰
          </span>

          {/* Dedicated Before/After Side-by-Side Toggle Switch */}
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'side-by-side' ? 'single' : 'side-by-side')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border transition-all active:scale-95 shadow-2xs ${
              viewMode === 'side-by-side'
                ? 'bg-sky-500/15 border-sky-500/40 text-sky-700 font-extrabold'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
            title="원본(Before)과 실시간 증강본(After) 나란히 비교 모드 토글"
          >
            {viewMode === 'side-by-side' ? (
              <ToggleRight className="w-4 h-4 text-sky-600" />
            ) : (
              <ToggleLeft className="w-4 h-4 text-slate-400" />
            )}
            <span>Before / After 비교 {viewMode === 'side-by-side' ? 'ON' : 'OFF'}</span>
          </button>

          {isDistorted && (
            <span className="text-[11px] font-medium text-amber-600 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              <span>확신도 {confidenceDrop > 0 ? `-${confidenceDrop}%p` : '변화 없음'}</span>
            </span>
          )}
        </div>

        {/* View Switcher Buttons */}
        <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setViewMode('side-by-side')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'side-by-side'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="원본과 증강본을 나란히 배치하여 비교"
          >
            <Columns className="w-3.5 h-3.5 text-sky-500" />
            <span>Before/After 나란히</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'split'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="슬라이더를 좌우로 밀어서 Before / After 분할 비교"
          >
            <Split className="w-3.5 h-3.5 text-indigo-500" />
            <span>스플릿 슬라이더</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('thumbnail')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'thumbnail'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="8종의 규격별 번호판 샘플에 현재 파라미터를 동시 적용한 썸네일 그리드"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-emerald-500" />
            <span>썸네일 미리보기</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('single')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'single'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="현재 증강된 단일 번호판 크게 보기"
          >
            <Maximize2 className="w-3.5 h-3.5 text-slate-600" />
            <span>단일 뷰</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Container */}
      <div className="relative w-full bg-slate-950 rounded-2xl border border-slate-800 p-5 shadow-2xl overflow-hidden">
        {/* Street camera background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        {/* 1. SIDE-BY-SIDE (BEFORE / AFTER) MODE */}
        {viewMode === 'side-by-side' && (
          <div className="flex flex-col gap-5">
            {/* Real-time Status Badge Banner */}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-slate-200">실시간 Before / After 나란히 비교</span>
                <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                  (슬라이더 조절 시 실시간 렌더링 동기화)
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span className="text-slate-400">적용된 증강:</span>
                <span className={`px-2 py-0.5 rounded-md font-bold ${activeParamDiffs.length > 0 ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'bg-slate-800 text-slate-400'}`}>
                  {activeParamDiffs.length}개 광학 파라미터
                </span>
              </div>
            </div>

            {/* Side-by-Side Dual Plate Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch relative">
              {/* Panel A: Clean Original Ground Truth (BEFORE) */}
              <div className="flex flex-col items-center justify-between p-4 bg-slate-900/90 rounded-xl border-2 border-emerald-500/30 min-h-[235px] relative shadow-lg">
                <div className="w-full flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-bold">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase">
                      BEFORE
                    </span>
                    <span>원본 기준 (Original)</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    선명도: 100% · 노이즈: 0%
                  </span>
                </div>

                <div className="my-auto py-3">
                  <PlateGraphic
                    plateText={plateText}
                    plateType={plateType}
                    params={ORIGINAL_PARAMS}
                    isOriginal={true}
                    scale={0.82}
                    showBBox={showBBox}
                    detected={true}
                    confidence={99.8}
                  />
                </div>

                <div className="w-full pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Ground Truth: "{plateText}"</span>
                  </span>
                  <span className="text-slate-400 shrink-0">
                    인식 확신도: <strong className="text-emerald-400">99.8%</strong>
                  </span>
                </div>
              </div>

              {/* Panel B: Augmented Result (AFTER) */}
              <div className={`flex flex-col items-center justify-between p-4 bg-slate-900/90 rounded-xl border-2 min-h-[235px] relative shadow-lg ${
                isDistorted ? 'border-sky-500/50' : 'border-slate-800'
              }`}>
                <div className="w-full flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-sky-400 font-bold">
                    <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-extrabold uppercase">
                      AFTER
                    </span>
                    <span>실시간 증강 (Augmented)</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    선명도: {sharpnessScore}% · 확신도: {detected ? `${overallConfidence}%` : '0%'}
                  </span>
                </div>

                <div className="my-auto py-3">
                  <PlateGraphic
                    plateText={plateText}
                    plateType={plateType}
                    params={params}
                    isOriginal={false}
                    scale={0.82}
                    showBBox={showBBox}
                    detected={detected}
                    confidence={overallConfidence}
                  />
                </div>

                <div className="w-full pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-1.5 truncate">
                    {detected ? (
                      liveInference.predictedText === plateText ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>예측 일치: "{liveInference.predictedText}"</span>
                        </span>
                      ) : (
                        <span className="text-amber-400 font-bold flex items-center gap-1 truncate">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>오독 감지: "{liveInference.predictedText}"</span>
                        </span>
                      )
                    ) : (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>검출 실패 (Detected: False)</span>
                      </span>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-1">
                    <span className={overallConfidence >= 80 ? 'text-emerald-400 font-bold' : overallConfidence >= 50 ? 'text-amber-400 font-bold' : 'text-rose-400 font-bold'}>
                      {detected ? `${overallConfidence}%` : '0%'}
                    </span>
                    {confidenceDrop > 0 && (
                      <span className="text-[10px] text-rose-400 font-bold">
                        (-{confidenceDrop}%p)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time Parameter Changes Breakdown Strip */}
            <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-sky-400" />
                  <span>실시간 광학 파라미터 변화량 (Real-time Parameter Deltas)</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {activeParamDiffs.length > 0 ? `${activeParamDiffs.length}개 항목 원본과 상이` : '원본과 100% 동일'}
                </span>
              </div>

              {activeParamDiffs.length === 0 ? (
                <div className="text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 text-center font-mono">
                  ✨ 현재 파라미터가 원본과 동일합니다. 우측 슬라이더를 조절하면 변화 수치가 실시간 집계됩니다.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {activeParamDiffs.map((diff, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-slate-950/70 border border-slate-800 rounded-lg flex flex-col justify-between"
                    >
                      <span className="text-[10px] text-slate-400 truncate">{diff.label}</span>
                      <div className="flex items-center justify-between mt-1 text-[11px] font-mono">
                        <span className="text-slate-400 line-through text-[10px]">{diff.from}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="text-slate-100 font-bold">{diff.to}</span>
                        <span className={`px-1 py-0.2 rounded text-[10px] font-bold border ${diff.color}`}>
                          {diff.delta}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comparison Metrics Diff Strip */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 bg-slate-950/60 rounded-lg">
                <span className="text-[10px] text-slate-400 block">확신도 변동</span>
                <span className={`font-mono font-bold ${confidenceDrop > 25 ? 'text-rose-400' : confidenceDrop > 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  99.8% → {detected ? `${overallConfidence}%` : '0%'}
                </span>
              </div>

              <div className="p-2 bg-slate-950/60 rounded-lg">
                <span className="text-[10px] text-slate-400 block">에지 선명도 감쇄</span>
                <span className="font-mono font-bold text-slate-200">
                  100 → {sharpnessScore} <span className="text-slate-400 font-normal">(-{sharpnessDrop})</span>
                </span>
              </div>

              <div className="p-2 bg-slate-950/60 rounded-lg">
                <span className="text-[10px] text-slate-400 block">검출 상태 (YOLO)</span>
                <span className={`font-mono font-bold ${detected ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {detected ? '바운딩 성공' : '경계 미검출'}
                </span>
              </div>

              <div className="p-2 bg-slate-950/60 rounded-lg">
                <span className="text-[10px] text-slate-400 block">광학적 주 영향 요인</span>
                <span className="font-mono font-bold text-sky-400 truncate block">
                  {params.blur > 4 ? '모션 블러' : params.dirt > 40 ? '문자 가림' : params.glare > 50 ? '역광 포화' : params.rain > 40 ? '우천 왜곡' : params.noise > 40 ? '센서 노이즈' : activeParamDiffs.length > 0 ? activeParamDiffs[0].label : '정상 광학'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 2. SPLIT WIPER COMPARISON MODE */}
        {viewMode === 'split' && (
          <div className="flex flex-col items-center justify-center p-4">
            <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-3 px-2">
              <span className="flex items-center gap-1 text-emerald-400 font-mono font-bold">
                ◀ 원본 기준 (Original)
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                경계 분할 위치: {splitPosition}%
              </span>
              <span className="flex items-center gap-1 text-sky-400 font-mono font-bold">
                증강 변환본 (Augmented) ▶
              </span>
            </div>

            {/* Split Plate Viewport */}
            <div className="relative overflow-hidden rounded-xl border-2 border-slate-700 max-w-[360px] w-full min-h-[140px] flex items-center justify-center bg-slate-900 p-4">
              {/* Layer 1: Augmented Background */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <PlateGraphic
                  plateText={plateText}
                  plateType={plateType}
                  params={params}
                  isOriginal={false}
                  scale={0.9}
                  showBBox={false}
                />
              </div>

              {/* Layer 2: Clean Original clipped by splitPosition */}
              <div 
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ width: `${splitPosition}%` }}
              >
                <div className="w-[360px] h-full flex items-center justify-center">
                  <PlateGraphic
                    plateText={plateText}
                    plateType={plateType}
                    params={ORIGINAL_PARAMS}
                    isOriginal={true}
                    scale={0.9}
                    showBBox={false}
                  />
                </div>
              </div>

              {/* Split Line Handle */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-sky-400 z-30 pointer-events-none shadow-[0_0_8px_#38bdf8]"
                style={{ left: `${splitPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center text-[10px] font-bold shadow-lg">
                  ↔
                </div>
              </div>
            </div>

            {/* Split Position Slider Bar */}
            <div className="w-full max-w-[360px] mt-4 flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={splitPosition}
                onChange={(e) => setSplitPosition(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-ew-resize"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              슬라이더를 좌우로 드래그하여 글자 획 단위의 왜곡 및 블러 침범 경계를 정밀 확인하세요.
            </p>
          </div>
        )}

        {/* 3. SINGLE FULL FOCUS VIEW */}
        {viewMode === 'single' && (
          <div className="flex flex-col items-center justify-center p-4 min-h-[250px]">
            <div className="w-full flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-400 gap-2 mb-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>CCTV_CAM [LIVE_STREAM]</span>
              </span>

              {/* Quick Peek Original Toggle */}
              <button
                type="button"
                onMouseDown={() => setPeekOriginal(true)}
                onMouseUp={() => setPeekOriginal(false)}
                onMouseLeave={() => setPeekOriginal(false)}
                onTouchStart={() => setPeekOriginal(true)}
                onTouchEnd={() => setPeekOriginal(false)}
                onClick={() => setPeekOriginal(prev => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg border transition-all active:scale-95 ${
                  peekOriginal
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-800'
                }`}
                title="누르고 있는 동안 깨끗한 원본(Before)을 임시 표시합니다"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{peekOriginal ? '✓ 원본(Before) 표시 중' : '원본(Before) 임시 보기 (Hold)'}</span>
              </button>

              <span>ISO: {Math.round(100 + params.noise * 30)} · 1/{Math.max(100, Math.round(1000 - params.blur * 60))}s</span>
            </div>

            <PlateGraphic
              plateText={plateText}
              plateType={plateType}
              params={peekOriginal ? ORIGINAL_PARAMS : params}
              isOriginal={peekOriginal}
              scale={1}
              showBBox={showBBox}
              detected={peekOriginal ? true : detected}
              confidence={peekOriginal ? 99.8 : overallConfidence}
            />

            <div className="mt-8 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between w-full gap-2">
              <div className="flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>
                  {peekOriginal ? '현재 원본(Before)을 임시 프리뷰하고 있습니다.' : '현재 설정된 8대 광학 파라미터가 모두 실시간 반영된 종합 시뮬레이션입니다.'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewMode('side-by-side')}
                className="text-xs font-bold text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1 shrink-0"
              >
                <span>Before / After 나란히 비교로 전환 →</span>
              </button>
            </div>
          </div>
        )}

        {/* 4. THUMBNAIL PREVIEW GRID MODE */}
        {viewMode === 'thumbnail' && (
          <div className="flex flex-col gap-4">
            {/* Thumbnail Header Stats Strip */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-100">
                      다중 번호판 실시간 증강 썸네일 그리드
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-mono">
                      {THUMBNAIL_SAMPLE_PLATES.length}개 규격 동시 투영
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    현재 적용된 모든 증강 파라미터가 8종의 차종/규격별 번호판에 실시간으로 동시 렌더링됩니다.
                  </p>
                </div>
              </div>

              {/* Summary Metrics Badges */}
              <div className="flex items-center gap-2 font-mono">
                <div className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block font-sans">인식 일치율</span>
                  <span className={`text-xs font-bold ${
                    matchCount === totalSamples 
                      ? 'text-emerald-400' 
                      : matchCount >= totalSamples / 2 
                        ? 'text-amber-400' 
                        : 'text-rose-400'
                  }`}>
                    {matchCount}/{totalSamples} ({Math.round((matchCount / (totalSamples || 1)) * 100)}%)
                  </span>
                </div>

                <div className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block font-sans">바운딩 검출</span>
                  <span className="text-xs font-bold text-slate-200">
                    {detectedCount}/{totalSamples}
                  </span>
                </div>

                <div className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block font-sans">평균 확신도</span>
                  <span className={`text-xs font-bold ${
                    avgConfidence >= 80 ? 'text-emerald-400' : avgConfidence >= 50 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {avgConfidence}%
                  </span>
                </div>
              </div>
            </div>

            {/* Responsive Grid of Thumbnails */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[580px] overflow-y-auto pr-1">
              {thumbnailResults.map((sample) => (
                <div
                  key={sample.id}
                  className={`bg-slate-900/85 border rounded-xl p-3 flex flex-col justify-between transition-all hover:border-slate-600 shadow-sm ${
                    sample.isExactMatch 
                      ? 'border-slate-800' 
                      : !sample.sim.detected 
                        ? 'border-rose-900/60 bg-rose-950/15' 
                        : 'border-amber-900/60 bg-amber-950/15'
                  }`}
                >
                  {/* Card Top: Label & Status */}
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-200">
                        {sample.label}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({sample.desc})
                      </span>
                    </div>

                    {/* Inference Match Tag */}
                    {!sample.sim.detected ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-rose-950/70 border border-rose-800 text-rose-400">
                        <AlertTriangle className="w-3 h-3" />
                        <span>미검출</span>
                      </span>
                    ) : sample.isExactMatch ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800 text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>일치 {sample.sim.overallConfidence}%</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-amber-950/70 border border-amber-800 text-amber-300">
                        <AlertTriangle className="w-3 h-3" />
                        <span>오독: "{sample.sim.predictedText}" ({sample.sim.overallConfidence}%)</span>
                      </span>
                    )}
                  </div>

                  {/* Thumbnail Plate Canvas Viewport */}
                  <div className="relative bg-slate-950/90 rounded-lg p-3 min-h-[95px] flex items-center justify-center overflow-hidden border border-slate-800/80 my-1">
                    <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:12px_12px] opacity-25 pointer-events-none" />
                    
                    <PlateGraphic
                      plateText={sample.text}
                      plateType={sample.type}
                      params={params}
                      isOriginal={false}
                      scale={0.52}
                      showBBox={showBBox}
                      detected={sample.sim.detected}
                      confidence={sample.sim.overallConfidence}
                    />
                  </div>

                  {/* Card Bottom: Ground Truth & Quick Load Button */}
                  <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-slate-800/60">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                      <span className="text-slate-500">GT:</span>
                      <span className="text-slate-200 font-bold">{sample.text}</span>
                    </div>

                    {onSelectPlate && (
                      <button
                        onClick={() => onSelectPlate(sample.text, sample.type)}
                        className="flex items-center gap-1 px-2.5 py-1 text-[10.5px] font-medium text-sky-400 hover:text-sky-300 bg-sky-950/60 hover:bg-sky-900/60 border border-sky-800/70 rounded-lg transition-all active:scale-95"
                        title="이 번호판 텍스트와 규격을 메인 시뮬레이터로 로드"
                      >
                        <span>시뮬레이터 로드</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
              <span className="flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-sky-400" />
                <span>우측 컨트롤러에서 파라미터나 프리셋을 변경하면 모든 썸네일에 실시간 반영됩니다.</span>
              </span>
              <span className="text-slate-500 font-mono">
                {detectedCount === totalSamples ? '전체 바운딩 박스 검출 성공' : `${totalSamples - detectedCount}개 샘플 검출 실패`}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
