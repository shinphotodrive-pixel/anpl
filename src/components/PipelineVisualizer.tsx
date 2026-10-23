import React, { useState } from 'react';
import { PIPELINE_STEPS, PipelineStep } from '../data/pipeline';
import { 
  GitBranch, 
  Camera, 
  Shield, 
  Filter, 
  Sparkles, 
  Cpu, 
  Server, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Wrench 
} from 'lucide-react';

export const PipelineVisualizer: React.FC = () => {
  const [activeStepId, setActiveStepId] = useState<number>(1);

  const activeStep = PIPELINE_STEPS.find(s => s.id === activeStepId) || PIPELINE_STEPS[0];

  const getStepIcon = (name: string) => {
    switch (name) {
      case 'Camera':
        return <Camera className="w-5 h-5" />;
      case 'Shield':
        return <Shield className="w-5 h-5" />;
      case 'Filter':
        return <Filter className="w-5 h-5" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5" />;
      case 'Server':
      default:
        return <Server className="w-5 h-5" />;
    }
  };

  return (
    <section id="pipeline" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 mb-2">
            <GitBranch className="w-4 h-4 text-sky-500" />
            <span>End-to-End MLOps Pipeline</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            ALPR 실전 데이터 파이프라인 아키텍처
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
            엣지 카메라 수집부터 비식별화, 능동적 샘플링, 3D 합성, 모델 배포에 이르는 
            엔터프라이즈 레벨의 6단계 파이프라인을 인터랙티브하게 탐색하세요.
          </p>
        </div>

        {/* Pipeline Horizontal Flow Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-8 p-1.5 bg-slate-100 rounded-2xl">
          {PIPELINE_STEPS.map((step) => {
            const isSelected = activeStepId === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStepId(step.id)}
                className={`flex flex-col items-center p-3 rounded-xl text-center transition-all ${
                  isSelected
                    ? 'bg-white shadow-md text-slate-900 border border-slate-200/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 ${
                  isSelected ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {getStepIcon(step.iconName)}
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Step 0{step.id}
                </span>
                <span className="text-xs font-semibold truncate w-full mt-0.5">
                  {step.title.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Step Detailed Canvas */}
        <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center flex-shrink-0">
                {getStepIcon(activeStep.iconName)}
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
                  <span>PHASE 0{activeStep.id}: {activeStep.phase}</span>
                  <span>·</span>
                  <span>{activeStep.badge}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                  {activeStep.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">{activeStep.subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-4 py-2 rounded-xl text-xs font-mono text-slate-300">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>처리 지연: {activeStep.latencyOrSpeed}</span>
            </div>
          </div>

          {/* Description */}
          <div className="py-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">단계 설명 및 미션</h4>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              {activeStep.description}
            </p>
          </div>

          {/* Inputs & Outputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
            {/* Input Artifacts */}
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                입력 데이터 (Input Artifacts)
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {activeStep.inputs.map((inItem, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <ArrowRight className="w-3.5 h-3.5 text-sky-400 flex-shrink-0 mt-0.5" />
                    <span>{inItem}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Output Artifacts */}
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                출력 데이터 (Output Artifacts)
              </span>
              <ul className="space-y-1.5 text-xs text-emerald-300">
                {activeStep.outputs.map((outItem, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{outItem}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Best Practices vs Pitfalls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
            <div className="p-4 bg-emerald-950/30 rounded-xl border border-emerald-900/50">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>성공을 위한 엔지니어링 모범사례 (Best Practices)</span>
              </span>
              <ul className="space-y-1.5 text-xs text-emerald-200">
                {activeStep.bestPractices.map((bp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{bp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-rose-950/30 rounded-xl border border-rose-900/50">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>주의해야 할 치명적 함정 (Common Pitfalls)</span>
              </span>
              <ul className="space-y-1.5 text-xs text-rose-200">
                {activeStep.pitfalls.map((pf, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{pf}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Tools stack */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-medium text-slate-400">주요 사용 도구 스택:</span>
              <div className="flex flex-wrap gap-1.5">
                {activeStep.keyTools.map((tool, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[11px] font-mono text-slate-300">
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            {/* Stepper Next Button */}
            {activeStepId < 6 ? (
              <button
                onClick={() => setActiveStepId(activeStepId + 1)}
                className="flex items-center gap-1 text-xs font-bold text-sky-400 hover:text-sky-300"
              >
                <span>다음 단계 (Step 0{activeStepId + 1})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setActiveStepId(1)}
                className="flex items-center gap-1 text-xs font-bold text-sky-400 hover:text-sky-300"
              >
                <span>처음 단계로 이동</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
