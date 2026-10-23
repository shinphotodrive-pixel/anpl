import React from 'react';
import { Sliders, Sparkles, AlertCircle, ArrowDown } from 'lucide-react';

interface HeroProps {
  onScrollToSimulator: () => void;
  onScrollToSolutions: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onScrollToSimulator, onScrollToSolutions }) => {
  return (
    <div className="relative bg-slate-900 text-white overflow-hidden border-b border-slate-800">
      {/* Background ambient decorative grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      
      {/* Subtle radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-sky-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        {/* Kicker (clean unboxed text, no pill) */}
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-sky-400 mb-4 tracking-wider uppercase">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>Computer Vision & Intelligent Transportation Systems (ITS)</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>ALPR Dataset Architecture</span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
          번호판 인식(ALPR) <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-sky-300 to-indigo-300">
            데이터셋 한계 극복 가이드
          </span>
        </h1>

        {/* Description */}
        <p className="mt-6 max-w-3xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
          실제 도로 현장에서는 고속 주행 모션 블러, 심야 초저조도, 사각 원근 왜곡, 흙먼지 오염으로 인해 
          인식률이 최대 <strong className="text-amber-400 font-semibold">42.5%까지 급락</strong>합니다. 
          데이터 증강(Augmentation), 3D 합성 데이터, 능동적 학습(Active Learning)으로 이를 극복하는 파이프라인을 체험하세요.
        </p>

        {/* Clean unboxed metric row (per frontend-design constitution: NO PILLS) */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-y-3 gap-x-6 text-xs sm:text-sm text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-slate-300 font-medium">야간/우천 정확도 하락:</span>
            <span className="text-rose-400 font-mono font-semibold">-42.5%p</span>
          </div>
          <span aria-hidden="true" className="text-slate-700 hidden sm:inline">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-300 font-medium">능동학습 라벨링 절감:</span>
            <span className="text-emerald-400 font-mono font-semibold">최대 82%</span>
          </div>
          <span aria-hidden="true" className="text-slate-700 hidden sm:inline">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span className="text-slate-300 font-medium">합성 데이터 확장비:</span>
            <span className="text-sky-400 font-mono font-semibold">50x 배율</span>
          </div>
          <span aria-hidden="true" className="text-slate-700 hidden sm:inline">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-slate-300 font-medium">개인정보 비식별화:</span>
            <span className="text-purple-400 font-mono font-semibold">100% PII 통과</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onScrollToSimulator}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sliders className="w-4 h-4 text-slate-950" />
            <span>증강 시뮬레이터 시작</span>
          </button>

          <button
            onClick={onScrollToSolutions}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold px-6 py-3.5 rounded-xl transition-all hover:text-white"
          >
            <AlertCircle className="w-4 h-4 text-sky-400" />
            <span>4대 해결 전략 탐색</span>
            <ArrowDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
