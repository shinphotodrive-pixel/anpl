import React from 'react';
import { AugmentationParams } from '../../types/alpr';
import { BulkImageProcessor } from '../Simulator/BulkImageProcessor';
import { 
  FolderArchive, 
  Sliders, 
  Layers, 
  Sparkles, 
  Eye, 
  Download, 
  CloudRain, 
  SunMedium, 
  RotateCw, 
  ShieldAlert, 
  ExternalLink,
  Code2
} from 'lucide-react';

interface BatchProcessorSectionProps {
  currentParams: AugmentationParams;
  onScrollToSimulator?: () => void;
}

export const BatchProcessorSection: React.FC<BatchProcessorSectionProps> = ({
  currentParams,
  onScrollToSimulator,
}) => {
  // Format param values for the HUD
  const isDefaultClean = 
    currentParams.blur === 0 &&
    currentParams.brightness === 100 &&
    currentParams.contrast === 100 &&
    currentParams.noise === 0 &&
    currentParams.rotate === 0 &&
    currentParams.perspectiveX === 0 &&
    currentParams.perspectiveY === 0 &&
    currentParams.rain === 0 &&
    currentParams.fog === 0 &&
    currentParams.dirt === 0 &&
    currentParams.glare === 0;

  return (
    <section id="batch" className="py-16 bg-slate-100/80 border-b border-slate-200 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-600 mb-2 tracking-wider uppercase">
              <FolderArchive className="w-4 h-4" />
              <span>ALPR Batch Augmentation Pipeline</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="font-mono text-slate-500">HTML5 Canvas Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              다중 이미지 배치 증강 프로세서 (Batch Augmentation Processor)
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-3xl leading-relaxed">
              업로드된 복수 번호판 이미지 세트에 현재 시뮬레이터에 적용된 왜곡 파라미터(블러, 밝기, 대비, 노이즈, 원근 왜곡, 강우, 안개, 오염, 직사광)를 동시 일괄 적용하고,
              가상 OCR 인식률 검증 및 훈련용 ZIP 데이터셋으로 즉시 추출합니다.
            </p>
          </div>

          {onScrollToSimulator && (
            <button
              onClick={onScrollToSimulator}
              className="flex items-center gap-2 self-start md:self-auto px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 shadow-2xs hover:border-sky-500 transition-all"
            >
              <Sliders className="w-3.5 h-3.5 text-sky-600" />
              <span>증강 슬라이더 파라미터 조절</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </button>
          )}
        </div>

        {/* Live Active Parameters HUD */}
        <div className="mb-8 bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm bg-sky-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-200 tracking-wide uppercase">
                현재 일괄 적용 대기 중인 증강 파라미터 (Active Augmentation Vector)
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {isDefaultClean ? (
                <span className="text-amber-400 font-semibold">⚠️ 기본 원본 상태 (왜곡 없음)</span>
              ) : (
                <span className="text-sky-300 font-semibold">✓ 커스텀 왜곡 벡터 활성화됨</span>
              )}
            </div>
          </div>

          {/* Parameters Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {/* Blur */}
            <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block font-medium">모션 블러</span>
              <div className="text-sm font-bold font-mono text-white mt-0.5">
                {currentParams.blur} <span className="text-[10px] text-slate-400">px</span>
              </div>
            </div>

            {/* Brightness */}
            <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block font-medium">밝기 (조도)</span>
              <div className="text-sm font-bold font-mono text-white mt-0.5">
                {currentParams.brightness} <span className="text-[10px] text-slate-400">%</span>
              </div>
            </div>

            {/* Contrast */}
            <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block font-medium">명암 대비</span>
              <div className="text-sm font-bold font-mono text-white mt-0.5">
                {currentParams.contrast} <span className="text-[10px] text-slate-400">%</span>
              </div>
            </div>

            {/* Noise */}
            <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block font-medium">ISO 노이즈</span>
              <div className="text-sm font-bold font-mono text-white mt-0.5">
                {currentParams.noise} <span className="text-[10px] text-slate-400">%</span>
              </div>
            </div>

            {/* Rotate / Skew */}
            <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block font-medium">원근·회전</span>
              <div className="text-sm font-bold font-mono text-white mt-0.5">
                {currentParams.rotate}° / {currentParams.perspectiveX}°
              </div>
            </div>

            {/* Weather (Rain / Fog) */}
            <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block font-medium">기상 (강우/안개)</span>
              <div className="text-sm font-bold font-mono text-white mt-0.5">
                {currentParams.rain}% / {currentParams.fog}%
              </div>
            </div>

            {/* Dirt */}
            <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block font-medium">진흙 오염</span>
              <div className="text-sm font-bold font-mono text-white mt-0.5">
                {currentParams.dirt} <span className="text-[10px] text-slate-400">%</span>
              </div>
            </div>

            {/* Glare */}
            <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block font-medium">역광 플레어</span>
              <div className="text-sm font-bold font-mono text-white mt-0.5">
                {currentParams.glare} <span className="text-[10px] text-slate-400">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Batch Processing Workspace */}
        <div className="mb-10">
          <BulkImageProcessor
            currentParams={currentParams}
            isModal={false}
          />
        </div>

        {/* Engineering Best Practices & Dataset Guidelines */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1.5">
              1. 데이터셋 밸런싱 비율 권장
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              정상 조도(Clean) 40%, 악천후(비/안개) 25%, 모션 블러 20%, 물리 오염 및 역광 15% 비율로 배치 증강을 혼합 구성할 때 YOLOv8/v11 검출 모델의 과적합(Overfitting)을 최소화할 수 있습니다.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <Code2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1.5">
              2. Albumentations 파이프라인 동기화
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              ZIP 내보내기 시 자동 생성되는 <code className="font-mono text-indigo-600 font-semibold">params.py</code> 스크립트는 PyTorch / TensorFlow DataLoader에 즉시 결합 가능한 Python Albumentations 코드를 포함합니다.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1.5">
              3. 개인정보(PII) 비식별화 보존
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              클라이언트 측 HTML5 캔버스에서 모든 영상 처리가 100% 로컬 샌드박스로 실행되므로, 실제 차량 번호판 원본 영상이 외부 클라우드 서버로 무단 전송되지 않아 개인정보보호법을 준수합니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
