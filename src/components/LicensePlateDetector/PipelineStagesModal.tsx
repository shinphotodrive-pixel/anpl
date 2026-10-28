/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { PipelineStageId, PipelineStageInfo, DetectionResult } from '../../types/detector';
import { PIPELINE_STAGES, applyPipelineStageFilter } from '../../utils/detectorPipeline';
import { Layers, Copy, Check, Terminal } from 'lucide-react';

interface PipelineStagesModalProps {
  sourceCanvas: HTMLCanvasElement | null;
  detectionResult: DetectionResult | null;
}

export const PipelineStagesModal: React.FC<PipelineStagesModalProps> = ({
  sourceCanvas,
  detectionResult,
}) => {
  const [selectedStageId, setSelectedStageId] = useState<PipelineStageId>('bilateral');
  const [copiedCode, setCopiedCode] = useState(false);
  const stageCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeStage = PIPELINE_STAGES.find((s) => s.id === selectedStageId) || PIPELINE_STAGES[0];

  useEffect(() => {
    if (!sourceCanvas || !stageCanvasRef.current || !detectionResult) return;
    applyPipelineStageFilter(
      sourceCanvas,
      stageCanvasRef.current,
      activeStage,
      detectionResult.box
    );
  }, [sourceCanvas, activeStage, detectionResult]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-700/50 flex items-center justify-center text-indigo-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              컴퓨터 비전 7단계 파이프라인 정밀 분석
              <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-1.5 py-0.5 rounded">
                OpenCV &amp; Deep Learning
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              차량 영상 입력부터 번호판 윤곽선 추출, 왜곡 보정, 문자 분할까지의 중간 처리 단계
            </p>
          </div>
        </div>
      </div>

      {/* Stage Stepper Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1.5 scrollbar-thin">
        {PIPELINE_STAGES.map((stage) => {
          const isSelected = stage.id === selectedStageId;
          return (
            <button
              key={stage.id}
              onClick={() => setSelectedStageId(stage.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                isSelected ? 'bg-indigo-800 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {stage.step}
              </span>
              <div className="text-left">
                <div className="font-semibold">{stage.nameKo}</div>
                <div className="text-[10px] opacity-75">{stage.name}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Stage Viewer & OpenCV Code */}
      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Rendered Stage Canvas */}
        <div className="lg:col-span-7 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>처리 결과 프리뷰</span>
            <span className="font-mono text-indigo-300">Stage {activeStage.step}: {activeStage.id}</span>
          </div>
          <div className="w-full aspect-[16/10] bg-slate-950 rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center relative shadow-inner">
            <canvas ref={stageCanvasRef} className="max-w-full max-h-full object-contain" />
          </div>
        </div>

        {/* Stage Description & Code */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800">
            <div className="text-xs font-semibold text-indigo-400 tracking-wider uppercase mb-1">
              Step {activeStage.step} 알고리즘 설명
            </div>
            <h4 className="text-base font-bold text-white mb-2">
              {activeStage.nameKo}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {activeStage.description}
            </p>
          </div>

          {/* OpenCV Equivalent Code Snippet */}
          <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-mono text-slate-300">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                Python OpenCV 파이프라인 코드
              </span>
              <button
                onClick={() => handleCopyCode(activeStage.opencvEquivalent)}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode ? '복사됨' : '복사'}
              </button>
            </div>
            <pre className="p-3 text-[11px] font-mono text-indigo-200 overflow-x-auto leading-relaxed bg-slate-950">
              <code>{activeStage.opencvEquivalent}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
