import React from 'react';
import { AugmentationParams, PlateType } from '../../types/alpr';

interface PlateRendererProps {
  plateText: string;
  plateType: PlateType;
  params: AugmentationParams;
  showBBox: boolean;
  detected: boolean;
  overallConfidence: number;
}

export const PlateRenderer: React.FC<PlateRendererProps> = ({
  plateText,
  plateType,
  params,
  showBBox,
  detected,
  overallConfidence,
}) => {
  // Plate styling config based on type
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
          badgeText: '영업용 (택시/버스)',
          boltColor: 'bg-amber-950',
        };
      case 'green_retro':
        return {
          containerClass: 'bg-emerald-800 border-emerald-950 text-white',
          hasHologram: false,
          isEV: false,
          badgeText: '구형 녹색 번호판',
          boltColor: 'bg-emerald-950',
        };
      case 'white_7':
        return {
          containerClass: 'bg-white border-slate-900 text-slate-900',
          hasHologram: false,
          isEV: false,
          badgeText: '일반 7자리 승용',
          boltColor: 'bg-slate-700',
        };
      case 'white_8':
      default:
        return {
          containerClass: 'bg-white border-slate-900 text-slate-900',
          hasHologram: true,
          isEV: false,
          badgeText: '8자리 필름식 번호판',
          boltColor: 'bg-slate-700',
        };
    }
  };

  const plateConfig = getPlateStyles();

  // Compute CSS filter string
  const blurVal = params.blur > 0 ? `blur(${params.blur}px)` : '';
  const brightnessVal = `brightness(${params.brightness / 100})`;
  const contrastVal = `contrast(${params.contrast / 100})`;
  const filterStyle = [blurVal, brightnessVal, contrastVal].filter(Boolean).join(' ');

  // Compute 3D transform
  const transformStyle = `perspective(800px) rotateX(${params.perspectiveX}deg) rotateY(${params.perspectiveY}deg) rotateZ(${params.rotate}deg)`;

  // Bounding box color based on detection & confidence
  const bboxColor = !detected 
    ? 'border-rose-500 text-rose-500 bg-rose-500/10'
    : overallConfidence >= 80 
      ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
      : overallConfidence >= 50
        ? 'border-amber-500 text-amber-400 bg-amber-500/10'
        : 'border-rose-500 text-rose-400 bg-rose-500/10';

  return (
    <div className="relative w-full flex flex-col items-center justify-center p-8 min-h-[320px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl select-none">
      {/* Asphalt & Street Camera Background Environment Simulation */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
      
      {/* CCTV HUD Crosshairs & Metadata */}
      <div className="absolute top-3 left-4 flex items-center gap-2 text-[11px] font-mono text-slate-500">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>CAM-04 [HIGHWAY_GATE]</span>
        <span>·</span>
        <span>FPS: 30.0</span>
      </div>

      <div className="absolute top-3 right-4 text-[11px] font-mono text-slate-500">
        <span>ISO: {Math.round(100 + params.noise * 30)}</span>
        <span className="ml-2">EXP: 1/{Math.max(100, Math.round(1000 - params.blur * 60))}s</span>
      </div>

      {/* Plate 3D Stage */}
      <div 
        className="relative transition-transform duration-200 ease-out z-10"
        style={{ transform: transformStyle }}
      >
        {/* Actual License Plate Card */}
        <div
          className={`relative flex items-center justify-center rounded-lg border-4 shadow-2xl overflow-hidden transition-all duration-150 ${plateConfig.containerClass}`}
          style={{
            width: '350px',
            height: '84px',
            filter: filterStyle,
          }}
        >
          {/* Two Mounting Bolts */}
          <div className={`absolute top-2 left-6 w-2.5 h-2.5 rounded-full ${plateConfig.boltColor} shadow-inner border border-slate-400/40`} />
          <div className={`absolute top-2 right-6 w-2.5 h-2.5 rounded-full ${plateConfig.boltColor} shadow-inner border border-slate-400/40`} />

          {/* Holographic strip for Korean 8-digit reflective film plate */}
          {plateConfig.hasHologram && (
            <div className="absolute left-0 top-0 bottom-0 w-11 bg-gradient-to-b from-blue-700 via-blue-600 to-blue-800 border-r border-blue-900 flex flex-col items-center justify-between py-1.5 px-1 shadow-sm overflow-hidden">
              {/* National Emblem Taegeuk & KOR */}
              <div className="flex flex-col items-center">
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-400 to-rose-400 flex items-center justify-center border border-white/40 shadow-inner">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/70" />
                </div>
                <span className="text-[7.5px] font-bold text-white tracking-widest mt-0.5">KOR</span>
              </div>

              {/* Holographic laser watermark simulation */}
              <div className="text-[6.5px] text-blue-200/60 font-mono tracking-tighter text-center scale-90 leading-tight">
                대한민국
              </div>

              <div className="w-4 h-2 bg-gradient-to-r from-sky-300 to-blue-200 rounded-[2px] opacity-80" />
            </div>
          )}

          {/* EV Blue Plate watermark graphics */}
          {plateConfig.isEV && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-700/30 font-bold text-xs flex flex-col items-center pointer-events-none">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 2v11h3v9l7-12h-4l3-8z" />
              </svg>
              <span className="text-[8px] font-extrabold tracking-tight">EV</span>
            </div>
          )}

          {/* License Plate Text */}
          <div 
            className={`font-black tracking-wider flex items-center justify-center ${
              plateConfig.hasHologram ? 'ml-10' : ''
            }`}
            style={{
              fontSize: '2.4rem',
              letterSpacing: '0.08em',
              textShadow: '0 1px 1px rgba(0,0,0,0.15)',
            }}
          >
            {plateText}
          </div>

          {/* Rain / Water Streaks Overlay (driven by rain slider) */}
          {params.rain > 0 && (
            <div 
              className="absolute inset-0 pointer-events-none z-20"
              style={{
                backgroundImage: 'repeating-linear-gradient(110deg, transparent, transparent 12px, rgba(255,255,255,0.4) 13px, transparent 16px)',
                opacity: Math.min(0.95, params.rain / 100),
              }}
            />
          )}

          {/* Fog / Haze Overlay (driven by fog slider) */}
          {params.fog > 0 && (
            <div 
              className="absolute inset-0 pointer-events-none bg-slate-200/70 z-20"
              style={{ opacity: (params.fog / 100) * 0.85 }}
            />
          )}

          {/* Dirt / Mud Splatters (driven by dirt slider) */}
          {params.dirt > 0 && (
            <div 
              className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
              style={{ opacity: Math.min(1, params.dirt / 85) }}
            >
              {/* Mud splatter spots */}
              <div 
                className="absolute top-2 left-16 bg-amber-950/80 rounded-full blur-[1.5px] rotate-12 transition-all duration-100" 
                style={{ width: `${14 + (params.dirt * 0.4)}px`, height: `${8 + (params.dirt * 0.25)}px` }}
              />
              <div 
                className="absolute bottom-1 right-20 bg-amber-950/85 rounded-full blur-[1.2px] -rotate-6 transition-all duration-100" 
                style={{ width: `${16 + (params.dirt * 0.5)}px`, height: `${10 + (params.dirt * 0.3)}px` }}
              />
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-900/75 rounded-full blur-[2px] transition-all duration-100" 
                style={{ width: `${8 + (params.dirt * 0.35)}px`, height: `${6 + (params.dirt * 0.25)}px` }}
              />
              <div 
                className="absolute top-1 right-8 bg-amber-950/70 rounded-full blur-[1px] transition-all duration-100" 
                style={{ width: `${6 + (params.dirt * 0.25)}px`, height: `${6 + (params.dirt * 0.25)}px` }}
              />
              {params.dirt > 40 && (
                <div 
                  className="absolute bottom-3 left-28 bg-amber-950/70 rounded-full blur-[1.5px] rotate-45 transition-all duration-100" 
                  style={{ width: `${10 + (params.dirt * 0.3)}px`, height: `${7 + (params.dirt * 0.2)}px` }}
                />
              )}
            </div>
          )}

          {/* Glare / Lens Flare Bloom (driven by glare slider) */}
          {params.glare > 0 && (
            <div 
              className="absolute pointer-events-none z-20 transition-all duration-100"
              style={{
                top: '-35px',
                right: '-25px',
                width: `${120 + (params.glare * 1.5)}px`,
                height: `${120 + (params.glare * 1.5)}px`,
                background: 'radial-gradient(circle, rgba(255,255,255,0.98) 0%, rgba(255,255,180,0.65) 35%, transparent 70%)',
                opacity: Math.min(1, params.glare / 90),
              }}
            />
          )}

          {/* Sensor Grain & Noise Texture (driven by noise slider) */}
          {params.noise > 0 && (
            <div 
              className="absolute inset-0 pointer-events-none z-20 mix-blend-overlay transition-opacity duration-100"
              style={{
                backgroundImage: `url('data:image/svg+xml,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E')`,
                opacity: Math.min(0.9, (params.noise / 100) * 0.85),
              }}
            />
          )}

          {/* Motion blur streak lines (driven by blur slider) */}
          {params.blur > 1 && (
            <div 
              className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-100"
              style={{
                background: 'repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(255,255,255,0.18) 4px, transparent 6px)',
                opacity: Math.min(0.75, (params.blur / 16) * 0.9),
              }}
            />
          )}
        </div>

        {/* Real-time AI Model Bounding Box & Label Overlay */}
        {showBBox && (
          <div 
            className={`absolute -inset-2.5 rounded-lg border-2 pointer-events-none z-30 transition-all ${bboxColor}`}
          >
            {/* Corner brackets */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-current" />
            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-current" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-current" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-current" />

            {/* YOLO Label Tag */}
            <div className="absolute -top-6 left-0 flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 border border-current shadow">
              <span>{detected ? 'PLATE: KOR' : 'NO_DETECTION'}</span>
              <span>·</span>
              <span>{detected ? `${overallConfidence}%` : '0%'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Active Plate Subtitle / Badge */}
      <div className="mt-8 z-10 flex items-center gap-3 text-xs text-slate-400">
        <span className="font-medium text-slate-300">{plateConfig.badgeText}</span>
        <span aria-hidden="true" className="text-slate-700">·</span>
        <span>실시간 CSS 3D 셰이더 & 증강 렌더링</span>
      </div>
    </div>
  );
};
