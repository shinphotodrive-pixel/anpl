import React, { useState } from 'react';
import { AugmentationParams, PlateType } from '../../types/alpr';
import { 
  Columns, 
  Maximize2, 
  Split, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  TrendingDown
} from 'lucide-react';

export type ComparisonViewMode = 'single' | 'side-by-side' | 'split';

interface PlateRendererProps {
  plateText: string;
  plateType: PlateType;
  params: AugmentationParams;
  showBBox: boolean;
  detected: boolean;
  overallConfidence: number;
  sharpnessScore: number;
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
}) => {
  const [viewMode, setViewMode] = useState<ComparisonViewMode>('side-by-side');
  const [splitPosition, setSplitPosition] = useState<number>(50); // 0 to 100 for split wiper

  // Check if any distortion is applied
  const isDistorted = params.blur > 0 || params.noise > 0 || params.brightness !== 100 || 
                      params.rotate !== 0 || params.rain > 0 || params.dirt > 0 || params.glare > 0;

  const confidenceDrop = Math.max(0, Number((99.6 - overallConfidence).toFixed(1)));
  const sharpnessDrop = Math.max(0, 100 - sharpnessScore);

  return (
    <div className="flex flex-col gap-3">
      {/* View Mode Toolbar Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            번호판 시각화 뷰 모드
          </span>
          {isDistorted && (
            <span className="text-[11px] font-medium text-amber-600 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              <span>정확도 {confidenceDrop > 0 ? `-${confidenceDrop}%p` : '변화 없음'}</span>
            </span>
          )}
        </div>

        {/* View Switcher Buttons */}
        <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('side-by-side')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'side-by-side'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="원본과 증강본을 나란히 배치하여 비교"
          >
            <Columns className="w-3.5 h-3.5 text-sky-500" />
            <span>나란히 비교 (Side-by-Side)</span>
          </button>

          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'split'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="슬라이더를 좌우로 밀어서 Before / After 분할 비교"
          >
            <Split className="w-3.5 h-3.5 text-indigo-500" />
            <span>스플릿 슬라이더 (Split Wipe)</span>
          </button>

          <button
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

        {/* 1. SIDE-BY-SIDE MODE */}
        {viewMode === 'side-by-side' && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* Panel A: Clean Original Ground Truth */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-900/80 rounded-xl border border-slate-800/80 min-h-[220px] relative">
                <div className="absolute top-2.5 left-3 flex items-center gap-1.5 text-[10.5px] font-mono text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>원본 기준 (Original Baseline)</span>
                </div>
                <div className="absolute top-2.5 right-3 text-[10px] font-mono text-slate-400">
                  선명도 100/100
                </div>

                <div className="mt-4">
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

                <div className="mt-4 text-[11px] font-mono text-emerald-400/90 font-medium">
                  인식 확신도: 99.8% (Ground Truth 일치)
                </div>
              </div>

              {/* Panel B: Augmented Result */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-900/80 rounded-xl border border-slate-800/80 min-h-[220px] relative">
                <div className="absolute top-2.5 left-3 flex items-center gap-1.5 text-[10.5px] font-mono font-bold text-sky-400">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>증강 변환본 (Augmented Active)</span>
                </div>
                <div className="absolute top-2.5 right-3 text-[10px] font-mono text-slate-400">
                  선명도 {sharpnessScore}/100
                </div>

                <div className="mt-4">
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

                <div className="mt-4 text-[11px] font-mono font-medium flex items-center gap-1.5">
                  <span className={overallConfidence >= 80 ? 'text-emerald-400' : overallConfidence >= 50 ? 'text-amber-400' : 'text-rose-400'}>
                    인식 확신도: {detected ? `${overallConfidence}%` : '0% (검출 실패)'}
                  </span>
                  {confidenceDrop > 0 && (
                    <span className="text-[10px] text-rose-400 font-bold">
                      (-{confidenceDrop}%p)
                    </span>
                  )}
                </div>
              </div>
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
                <span className="text-[10px] text-slate-400 block">광학적 영향 요인</span>
                <span className="font-mono font-bold text-sky-400 truncate block">
                  {params.blur > 4 ? '모션 블러' : params.dirt > 40 ? '문자 가림' : params.glare > 50 ? '역광 포화' : params.rain > 40 ? '우천 왜곡' : '복합 왜곡'}
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
            <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-500 mb-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>CCTV_CAM [LIVE_STREAM]</span>
              </span>
              <span>ISO: {Math.round(100 + params.noise * 30)} · 1/{Math.max(100, Math.round(1000 - params.blur * 60))}s</span>
            </div>

            <PlateGraphic
              plateText={plateText}
              plateType={plateType}
              params={params}
              isOriginal={false}
              scale={1}
              showBBox={showBBox}
              detected={detected}
              confidence={overallConfidence}
            />

            <div className="mt-8 text-xs text-slate-400 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-sky-400" />
              <span>현재 설정된 8대 광학 파라미터가 모두 실시간 반영된 종합 시뮬레이션입니다.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
