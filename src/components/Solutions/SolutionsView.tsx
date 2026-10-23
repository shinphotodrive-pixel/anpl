import React, { useState } from 'react';
import { SOLUTIONS_DATA, SolutionItem } from '../../data/solutions';
import { 
  Bot, 
  SearchCheck, 
  Globe, 
  ShieldCheck, 
  Check, 
  Copy, 
  X, 
  ChevronRight, 
  TrendingUp, 
  Wrench, 
  CheckCircle2, 
  AlertCircle,
  Layers
} from 'lucide-react';

export const SolutionsView: React.FC = () => {
  const [selectedSolution, setSelectedSolution] = useState<SolutionItem | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const getIcon = (name: string) => {
    switch (name) {
      case 'Bot':
        return <Bot className="w-6 h-6" />;
      case 'SearchCheck':
        return <SearchCheck className="w-6 h-6" />;
      case 'Globe':
        return <Globe className="w-6 h-6" />;
      case 'ShieldCheck':
      default:
        return <ShieldCheck className="w-6 h-6" />;
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <section id="solutions" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 mb-2">
            <Layers className="w-4 h-4 text-sky-500" />
            <span>4 Core Production Engineering Strategies</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            데이터셋 문제 핵심 해결 방안
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
            실제 상용 번호판 인식 시스템(ALPR) 구축 시 비용과 정확도, 컴플라이언스를 동시에 만족시키는 
            4가지 실전 MLOps 아키텍처 전략입니다. 카드를 클릭하여 세부 아키텍처와 샘플 코드를 확인하세요.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {SOLUTIONS_DATA.map((sol) => (
            <div
              key={sol.id}
              onClick={() => setSelectedSolution(sol)}
              className="group bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 hover:border-slate-300 p-7 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden"
            >
              {/* Top Bar with Number & Tag */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${sol.colorScheme.iconBg} ${sol.colorScheme.iconText}`}>
                    {getIcon(sol.iconName)}
                  </div>
                  
                  {/* Clean unboxed text metadata (No pill) */}
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <span className="font-mono text-slate-400 font-bold">{sol.number}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-700">{sol.tag}</span>
                  </div>
                </div>

                {/* Card Title */}
                <h3 className="text-xl font-bold text-slate-900 mb-2.5 group-hover:text-sky-600 transition-colors flex items-center justify-between">
                  <span>{sol.title}</span>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </h3>

                {/* Short Description */}
                <p className="text-slate-600 text-sm leading-relaxed mb-6 font-normal">
                  {sol.shortDesc}
                </p>

                {/* Key Bullet Points */}
                <div className="space-y-2 mb-6">
                  {sol.pros.slice(0, 2).map((pro, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                      <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{pro}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-500 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-sky-500" />
                  <span>{sol.benchmarkImpact.split('&')[0]}</span>
                </span>
                <span className="text-sky-600 font-semibold group-hover:underline">
                  상세 가이드 보기 →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deep Dive Modal */}
      {selectedSolution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div 
            className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
                  {getIcon(selectedSolution.iconName)}
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs text-sky-400 font-mono">
                    <span>STRATEGY {selectedSolution.number}</span>
                    <span>·</span>
                    <span>{selectedSolution.tag}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-0.5">
                    {selectedSolution.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedSolution(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Executive Summary */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">개요 및 핵심 필요성</h4>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {selectedSolution.summary}
                </p>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  <strong className="text-slate-700 font-semibold">도입 당위성: </strong>
                  {selectedSolution.whyItMatters}
                </p>
              </div>

              {/* Core Techniques */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">3대 핵심 구현 기법</h4>
                <div className="space-y-2.5">
                  {selectedSolution.keyTechniques.map((tech, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 text-xs shadow-xs">
                      <div className="font-bold text-slate-900 mb-0.5 text-xs flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                        <span>{tech.name}</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed pl-3">{tech.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pros vs Cons Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <h5 className="text-xs font-bold text-emerald-900 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>핵심 강점 (Advantages)</span>
                  </h5>
                  <ul className="space-y-1.5 text-xs text-emerald-800">
                    {selectedSolution.pros.map((p, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-100">
                  <h5 className="text-xs font-bold text-amber-900 mb-2 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>주의 사항 및 한계 (Trade-offs)</span>
                  </h5>
                  <ul className="space-y-1.5 text-xs text-amber-800">
                    {selectedSolution.cons.map((c, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommended Stack */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-slate-400" />
                  <span>추천 엔지니어링 도구 스택</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSolution.recommendedTools.map((tool, idx) => (
                    <span 
                      key={idx} 
                      className="px-2.5 py-1 text-xs font-mono font-medium bg-slate-100 border border-slate-200 rounded-lg text-slate-700"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* Production Code Snippet */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    실전 프로덕션 코드 구현 샘플
                  </h4>
                  <button
                    onClick={() => handleCopy(selectedSolution.codeSnippet)}
                    className="flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">복사됨!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>코드 복사</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 overflow-x-auto text-xs font-mono text-sky-200 max-h-56">
                  <pre>
                    <code>{selectedSolution.codeSnippet}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                실제 시스템 구축 시 파이프라인 단계별 연계 적용을 권장합니다.
              </span>
              <button
                onClick={() => setSelectedSolution(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
