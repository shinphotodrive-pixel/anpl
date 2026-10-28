/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { BoundingBox, DetectionResult, SampleVehicle } from '../../types/detector';
import { renderKoreanVehicleToCanvas } from '../../utils/detectorPipeline';
import { Eye, EyeOff, ZoomIn, Crosshair, Grid, Scan } from 'lucide-react';

interface DetectorCanvasProps {
  currentVehicle: SampleVehicle | null;
  uploadedImageSrc: string | null;
  webcamVideoRef: React.RefObject<HTMLVideoElement | null>;
  isWebcamActive: boolean;
  detectionResult: DetectionResult | null;
  isProcessing: boolean;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

export const DetectorCanvas: React.FC<DetectorCanvasProps> = ({
  currentVehicle,
  uploadedImageSrc,
  webcamVideoRef,
  isWebcamActive,
  detectionResult,
  isProcessing,
  onCanvasReady,
}) => {
  const mainCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const roiCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // HUD display toggles
  const [showBoundingBox, setShowBoundingBox] = useState(true);
  const [showPaddedCrop, setShowPaddedCrop] = useState(true);
  const [showCharLines, setShowCharLines] = useState(true);
  const [showCrosshair, setShowCrosshair] = useState(true);
  const [showScanlines, setShowScanlines] = useState(true);

  // Render main canvas when input changes
  useEffect(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (isWebcamActive && webcamVideoRef.current) {
      let animId: number;
      const renderVideo = () => {
        if (webcamVideoRef.current && webcamVideoRef.current.readyState >= 2) {
          canvas.width = webcamVideoRef.current.videoWidth || 640;
          canvas.height = webcamVideoRef.current.videoHeight || 480;
          ctx.drawImage(webcamVideoRef.current, 0, 0, canvas.width, canvas.height);
          if (onCanvasReady) onCanvasReady(canvas);
        }
        animId = requestAnimationFrame(renderVideo);
      };
      animId = requestAnimationFrame(renderVideo);
      return () => cancelAnimationFrame(animId);
    } else if (uploadedImageSrc) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        canvas.width = img.naturalWidth || 800;
        canvas.height = img.naturalHeight || 600;
        ctx.drawImage(img, 0, 0);
        if (onCanvasReady) onCanvasReady(canvas);
      };
      img.src = uploadedImageSrc;
    } else if (currentVehicle) {
      if (currentVehicle.imageUrl.startsWith('generated:')) {
        canvas.width = 800;
        canvas.height = 540;
        renderKoreanVehicleToCanvas(ctx, currentVehicle, 800, 540);
        if (onCanvasReady) onCanvasReady(canvas);
      } else {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          canvas.width = img.naturalWidth || 800;
          canvas.height = img.naturalHeight || 600;
          ctx.drawImage(img, 0, 0);
          if (onCanvasReady) onCanvasReady(canvas);
        };
        img.src = currentVehicle.imageUrl;
      }
    }
  }, [currentVehicle, uploadedImageSrc, isWebcamActive, webcamVideoRef, onCanvasReady]);

  // Render cropped ROI canvas
  useEffect(() => {
    const mainCanvas = mainCanvasRef.current;
    const roiCanvas = roiCanvasRef.current;
    if (!mainCanvas || !roiCanvas || !detectionResult) return;

    const roiCtx = roiCanvas.getContext('2d');
    if (!roiCtx) return;

    const box = showPaddedCrop ? detectionResult.paddedBox : detectionResult.box;
    roiCanvas.width = Math.max(1, box.width);
    roiCanvas.height = Math.max(1, box.height);

    roiCtx.drawImage(
      mainCanvas,
      box.left, box.top, box.width, box.height,
      0, 0, box.width, box.height
    );
  }, [detectionResult, showPaddedCrop]);

  return (
    <div className="flex flex-col gap-4">
      {/* HUD Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300">
        <div className="flex items-center gap-1.5 font-medium text-slate-200">
          <Scan className="w-4 h-4 text-emerald-400" />
          <span>ALPR Computer Vision HUD 오버레이</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowBoundingBox(!showBoundingBox)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
              showBoundingBox
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            {showBoundingBox ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            바운딩 박스
          </button>

          <button
            type="button"
            onClick={() => setShowPaddedCrop(!showPaddedCrop)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
              showPaddedCrop
                ? 'bg-sky-950/80 border-sky-500/50 text-sky-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ZoomIn className="w-3.5 h-3.5" />
            동적 패딩 (-15/+35)
          </button>

          <button
            type="button"
            onClick={() => setShowCharLines(!showCharLines)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
              showCharLines
                ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            문자 분할선
          </button>

          <button
            type="button"
            onClick={() => setShowCrosshair(!showCrosshair)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
              showCrosshair
                ? 'bg-indigo-950/80 border-indigo-500/50 text-indigo-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            조준선
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/10] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center group">
        <canvas
          ref={mainCanvasRef}
          className="max-w-full max-h-full object-contain"
        />

        {/* Scanlines Effect */}
        {showScanlines && (
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-40" />
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center z-30">
            <div className="w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-emerald-400 font-semibold text-sm tracking-wide animate-pulse">
              번호판 객체 검출 및 OCR 판독 파이프라인 연산 중...
            </p>
            <span className="text-xs text-slate-400 mt-1">
              Bilateral Filter &gt; Canny Contours &gt; Padded ROI &gt; Tesseract Engine
            </span>
          </div>
        )}

        {/* Bounding Box HUD Overlay */}
        {detectionResult && showBoundingBox && mainCanvasRef.current && (
          (() => {
            const canvas = mainCanvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const scaleX = rect.width / canvas.width;
            const scaleY = rect.height / canvas.height;

            const box = detectionResult.box;
            const screenLeft = (canvas.offsetLeft || 0) + box.left * scaleX;
            const screenTop = (canvas.offsetTop || 0) + box.top * scaleY;
            const screenWidth = box.width * scaleX;
            const screenHeight = box.height * scaleY;

            return (
              <div
                style={{
                  position: 'absolute',
                  left: `${screenLeft}px`,
                  top: `${screenTop}px`,
                  width: `${screenWidth}px`,
                  height: `${screenHeight}px`,
                }}
                className="pointer-events-none border-2 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)] z-20 transition-all duration-200"
              >
                {/* Corner Calipers */}
                <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-emerald-300" />
                <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-emerald-300" />
                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-emerald-300" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-emerald-300" />

                {/* Crosshairs */}
                {showCrosshair && (
                  <>
                    <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-emerald-400/40" />
                    <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-emerald-400/40" />
                  </>
                )}

                {/* Character split lines */}
                {showCharLines && (
                  <div className="absolute inset-0 flex justify-between px-1 pointer-events-none">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-full w-[1px] bg-emerald-400/25 border-dashed" />
                    ))}
                  </div>
                )}

                {/* Tag Badge */}
                <div className="absolute -top-7 left-0 flex items-center gap-1.5 bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow">
                  <span>PLATE</span>
                  <span className="text-emerald-200 font-extrabold">{detectionResult.cleanedText}</span>
                  <span className="text-[9px] bg-emerald-950/70 text-emerald-300 px-1 rounded">
                    {(detectionResult.confidence * 100).toFixed(1)}%
                  </span>
                </div>

                {/* Coordinates Badge */}
                <div className="absolute -bottom-5 right-0 text-[9px] font-mono text-emerald-400/90 bg-slate-950/80 px-1 rounded border border-emerald-500/30">
                  [{box.left.toFixed(0)}, {box.top.toFixed(0)}, {box.width.toFixed(0)}x{box.height.toFixed(0)}]
                </div>
              </div>
            );
          })()
        )}

        {/* Dynamic Padded Crop Box Overlay */}
        {detectionResult && showPaddedCrop && mainCanvasRef.current && (
          (() => {
            const canvas = mainCanvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const scaleX = rect.width / canvas.width;
            const scaleY = rect.height / canvas.height;

            const pBox = detectionResult.paddedBox;
            const pLeft = (canvas.offsetLeft || 0) + pBox.left * scaleX;
            const pTop = (canvas.offsetTop || 0) + pBox.top * scaleY;
            const pWidth = pBox.width * scaleX;
            const pHeight = pBox.height * scaleY;

            return (
              <div
                style={{
                  position: 'absolute',
                  left: `${pLeft}px`,
                  top: `${pTop}px`,
                  width: `${pWidth}px`,
                  height: `${pHeight}px`,
                }}
                className="pointer-events-none border border-sky-400/60 border-dashed z-10"
              >
                <div className="absolute -bottom-5 left-0 text-[9px] font-mono text-sky-400/90 bg-slate-950/80 px-1 rounded border border-sky-500/30">
                  ROI Margin Padding (+35px)
                </div>
              </div>
            );
          })()
        )}
      </div>

      {/* Plate Cropped ROI Zoom Bar */}
      {detectionResult && (
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800 shadow-inner flex items-center justify-center min-w-[140px] h-[52px]">
              <canvas ref={roiCanvasRef} className="max-h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-200">ROI 크롭 영역 (Isolated Plate)</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-1 rounded">
                  {detectionResult.box.width} x {detectionResult.box.height} px
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                dataslayermedia 패딩 알고리즘 적용: 가로세로 왜곡 보정 및 노이즈 필터링 입력용 ROI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-right">
            <div>
              <div className="text-[11px] text-slate-400">검출 소요 시간</div>
              <div className="text-sm font-mono font-bold text-emerald-400">
                {detectionResult.inferenceTimeMs.total} ms
              </div>
            </div>
            <div className="h-7 w-[1px] bg-slate-800" />
            <div>
              <div className="text-[11px] text-slate-400">종합 신뢰도</div>
              <div className="text-sm font-mono font-bold text-sky-400">
                {(detectionResult.confidence * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
