import React from 'react';
import { SimulationResult } from '../../types/alpr';
import { CheckCircle2, AlertTriangle, XCircle, Cpu, Zap, Activity, Info } from 'lucide-react';

interface InferenceAnalysisProps {
  result: SimulationResult;
  expectedText: string;
}

export const InferenceAnalysis: React.FC<InferenceAnalysisProps> = ({ result, expectedText }) => {
  const isPerfect = result.detected && !result.charBreakdown.some(c => c.isMismatch) && result.overallConfidence >= 80;
  const isWarning = result.detected && (result.charBreakdown.some(c => c.isMismatch) || result.overallConfidence < 80);
  const isFailed = !result.detected;

  return (
    <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col gap-6">
      {/* Header & Overall Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-base text-white">실시간 모델 추론 및 취약점 진단 (OCR Diagnostics)</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            YOLOv11 앵커 검출기 + CRNN 시퀀스 인식 엔진 가상 추론 결과
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {isPerfect && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 rounded-lg text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>판독 성공 (Optimal)</span>
            </div>
          )}
          {isWarning && !isFailed && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-950/80 border border-amber-500/40 text-amber-400 rounded-lg text-xs font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <span>오인식 발생 (Warning)</span>
            </div>
          )}
          {isFailed && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-950/80 border border-rose-500/40 text-rose-400 rounded-lg text-xs font-semibold">
              <XCircle className="w-4 h-4" />
              <span>검출 실패 (Failed)</span>
            </div>
          )}
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-3">
          <span className="text-[11px] text-slate-400 font-medium block">인식 확신도 (Confidence)</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className={`text-2xl font-black font-mono ${
              result.overallConfidence >= 80 ? 'text-emerald-400' :
              result.overallConfidence >= 50 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {result.detected ? `${result.overallConfidence}%` : '0%'}
            </span>
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-3">
          <span className="text-[11px] text-slate-400 font-medium block">추론 소요 시간 (Latency)</span>
          <div className="mt-1 flex items-baseline gap-1">
            <Zap className="w-4 h-4 text-sky-400" />
            <span className="text-2xl font-black font-mono text-white">{result.latencyMs}</span>
            <span className="text-xs text-slate-400">ms</span>
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-3">
          <span className="text-[11px] text-slate-400 font-medium block">에지 선명도 (Sharpness)</span>
          <div className="mt-1 flex items-baseline gap-1">
            <Activity className="w-4 h-4 text-indigo-400" />
            <span className="text-2xl font-black font-mono text-white">{result.sharpnessScore}</span>
            <span className="text-xs text-slate-400">/100</span>
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-3">
          <span className="text-[11px] text-slate-400 font-medium block">문자 오인식 수 (Errors)</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className={`text-2xl font-black font-mono ${
              result.charBreakdown.filter(c => c.isMismatch).length === 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {result.detected ? result.charBreakdown.filter(c => c.isMismatch).length : '-'}
            </span>
            <span className="text-xs text-slate-400">글자</span>
          </div>
        </div>
      </div>

      {/* Character Breakdown View */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
          <span className="font-semibold text-slate-300">문자별 세부 인식 및 정답 대조 (Ground Truth vs Prediction)</span>
          <span className="font-mono text-[11px]">단일 글자별 Softmax 확률</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {result.charBreakdown.map((item, idx) => {
            if (item.expected === ' ') {
              return <div key={idx} className="w-3 text-center text-slate-600">·</div>;
            }
            return (
              <div 
                key={idx}
                className={`flex flex-col items-center justify-center min-w-[46px] p-2 rounded-lg border text-center transition-all ${
                  item.isMismatch
                    ? 'bg-rose-950/60 border-rose-500/80 text-rose-300'
                    : item.confidence < 75
                      ? 'bg-amber-950/50 border-amber-500/60 text-amber-200'
                      : 'bg-slate-900 border-slate-700/80 text-white'
                }`}
              >
                {/* Predicted character */}
                <span className="text-xl font-black font-mono leading-none mb-1">
                  {result.detected ? item.predicted : '?'}
                </span>

                {/* Accuracy percentage */}
                <span className="text-[10px] font-mono opacity-80 leading-none">
                  {result.detected ? `${item.confidence}%` : '0%'}
                </span>

                {/* If mismatch, show ground truth label */}
                {item.isMismatch && result.detected && (
                  <span className="text-[9px] text-rose-400 font-bold border-t border-rose-500/40 mt-1 pt-0.5">
                    원문: {item.expected}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Root-cause Diagnostic Box */}
      {result.failureReason && (
        <div className="flex items-start gap-3 p-3.5 bg-rose-950/40 border border-rose-800/50 rounded-xl text-xs text-rose-200">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-rose-300 block mb-0.5">원인 진단 (Root Cause Diagnosis):</strong>
            <p className="leading-relaxed">{result.failureReason}</p>
          </div>
        </div>
      )}

      {/* Prescribed Solution Box */}
      <div className="flex items-start gap-3 p-3.5 bg-sky-950/40 border border-sky-800/50 rounded-xl text-xs text-sky-200">
        <Info className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold text-sky-300 block mb-0.5">데이터셋 엔지니어링 처방 (Prescribed Strategy):</strong>
          <p className="leading-relaxed">{result.recommendedAugmentation}</p>
        </div>
      </div>
    </div>
  );
};
