import React, { useState } from 'react';
import { CHALLENGES_DATA } from '../data/challenges';
import { Database, AlertTriangle, Search, Filter } from 'lucide-react';

export const ChallengeMatrix: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: '전체 (All)' },
    { id: 'environment', label: '환경 및 기상' },
    { id: 'hardware', label: '카메라 및 광학계' },
    { id: 'plate_condition', label: '번호판 상태/오염' },
    { id: 'imbalance', label: '데이터셋 불균형' },
  ];

  const filteredChallenges = CHALLENGES_DATA.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.typicalFailure.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="challenges" className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 mb-2">
            <Database className="w-4 h-4 text-sky-500" />
            <span>Real-World Edge Case Database</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            ALPR 현장 데이터 챌린지 매트릭스
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
            실제 도로 환경에서 ALPR 모델이 겪는 8대 주요 오류 유형과 원인, 
            그리고 이를 방어하기 위한 최적의 데이터셋 보강 기법을 비교 분석합니다.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1 w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="증상 또는 검색어 입력..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Challenge Cards Grid: 1 col mobile, 2 cols tablet (sm), 4 cols desktop (lg) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredChallenges.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Header Row: Category & Severity */}
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="font-semibold text-sky-600">{item.categoryLabel}</span>
                  <span className={`font-mono font-bold ${
                    item.severity === 'critical' ? 'text-rose-600' :
                    item.severity === 'high' ? 'text-amber-600' : 'text-slate-600'
                  }`}>
                    {item.severity.toUpperCase()}
                  </span>
                </div>

                {/* Title & Accuracy drop */}
                <h3 className="text-base font-bold text-slate-900 mb-1.5">
                  {item.title}
                </h3>
                <div className="inline-block text-xs font-mono font-bold text-rose-600 mb-3">
                  보정 전 성능 하락: {item.errorRateWithoutAug}
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {item.description}
                </p>

                {/* Typical Failure Symptom */}
                <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-xl mb-4 text-xs text-rose-900">
                  <strong className="block font-bold text-[11px] text-rose-700 mb-0.5">
                    현장 오작동 증상:
                  </strong>
                  <span>{item.typicalFailure}</span>
                </div>
              </div>

              {/* Solution Strategy */}
              <div className="pt-3 border-t border-slate-100 text-xs">
                <strong className="block font-bold text-slate-800 mb-1 text-[11px]">
                  💡 데이터셋 처방 솔루션:
                </strong>
                <p className="text-slate-600 leading-relaxed mb-2">
                  {item.datasetSolution}
                </p>
                <div className="bg-slate-900 text-sky-300 font-mono text-[10px] p-2 rounded-lg truncate">
                  {item.recommendedAugmentation}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredChallenges.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <Filter className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">일치하는 챌린지가 없습니다.</p>
            <p className="text-xs text-slate-400 mt-1">검색어를 지우거나 다른 카테고리를 선택하세요.</p>
          </div>
        )}
      </div>
    </section>
  );
};
