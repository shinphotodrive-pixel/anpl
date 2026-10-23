import React, { useState } from 'react';
import { Calculator, DollarSign, Clock, TrendingUp, Sparkles } from 'lucide-react';

export const RoiCalculator: React.FC = () => {
  const [monthlyFrames, setMonthlyFrames] = useState<number>(200000);
  const [costPerImage, setCostPerImage] = useState<number>(180); // KRW per image
  const [activeSamplingRate, setActiveSamplingRate] = useState<number>(4); // 4%
  const [syntheticRatio, setSyntheticRatio] = useState<number>(30); // 30% synthetic injection

  // Calculations
  const annualTotalFrames = monthlyFrames * 12;
  const legacyAnnualCost = annualTotalFrames * costPerImage;
  
  // With Active Learning, only activeSamplingRate% needs manual human labeling
  const activeAnnualFrames = Math.round(annualTotalFrames * (activeSamplingRate / 100));
  const activeAnnualCost = activeAnnualFrames * costPerImage;
  
  // Synthetic data infrastructure / generation cost amortized (estimated ~₩5,000,000/year compute)
  const syntheticComputeCost = 5000000;
  const newAnnualCost = activeAnnualCost + syntheticComputeCost;
  
  const annualSavings = Math.max(0, legacyAnnualCost - newAnnualCost);
  const savingsPct = Math.round((annualSavings / legacyAnnualCost) * 100);

  // Time savings: assuming 45 seconds per manual bounding box + transcription
  const hoursSaved = Math.round(((annualTotalFrames - activeAnnualFrames) * 45) / 3600);

  // Projected mAP boost
  const projectedAccuracyBoost = (
    12.5 + (syntheticRatio * 0.25) + ((10 - activeSamplingRate) * 0.4)
  ).toFixed(1);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <section id="roi" className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 mb-2">
            <Calculator className="w-4 h-4 text-sky-500" />
            <span>Economic Feasibility & ROI Estimator</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            데이터셋 ROI & 비용 절감 계산기
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
            전수 수동 라벨링 대비 능동적 학습(Active Learning)과 3D 합성 데이터를 도입했을 때 
            기업이 절감할 수 있는 연간 라벨링 예산과 검수 소요 시간을 시뮬레이션합니다.
          </p>
        </div>

        {/* 2-Column Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Controls Column */}
          <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span>파이프라인 운영 변수 설정</span>
            </h3>

            <div className="space-y-6">
              {/* Slider 1: Monthly Frames */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-2">
                  <span>월간 수집 영상 프레임 수</span>
                  <span className="font-mono text-sky-600 text-sm font-bold">
                    {monthlyFrames.toLocaleString()}장 / 월
                  </span>
                </div>
                <input
                  type="range"
                  min="20000"
                  max="1000000"
                  step="20000"
                  value={monthlyFrames}
                  onChange={(e) => setMonthlyFrames(Number(e.target.value))}
                  className="w-full accent-sky-500"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>2만 장</span>
                  <span>50만 장</span>
                  <span>100만 장</span>
                </div>
              </div>

              {/* Slider 2: Per-image Labeling Cost */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-2">
                  <span>기존 건당 수동 라벨링 비용 (크라우드소싱)</span>
                  <span className="font-mono text-sky-600 text-sm font-bold">
                    ₩{costPerImage}원 / 건
                  </span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="400"
                  step="10"
                  value={costPerImage}
                  onChange={(e) => setCostPerImage(Number(e.target.value))}
                  className="w-full accent-sky-500"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>₩80 (단순 BBox)</span>
                  <span>₩200 (BBox + OCR 문자)</span>
                  <span>₩400 (특수차량 정밀 검수)</span>
                </div>
              </div>

              {/* Slider 3: Active Learning Sampling Rate */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-2">
                  <span>능동적 학습(Active Learning) 불확실성 선별율</span>
                  <span className="font-mono text-emerald-600 text-sm font-bold">
                    상위 {activeSamplingRate}% 만 선별
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="1"
                  value={activeSamplingRate}
                  onChange={(e) => setActiveSamplingRate(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  모델이 헷갈리는 하위 70% 이하 확신도 데이터만 작업자에게 할당하여 전수 검수를 대체합니다.
                </p>
              </div>

              {/* Slider 4: Synthetic Injection Ratio */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-2">
                  <span>3D 합성 데이터(Synthetic Data) 혼합 비중</span>
                  <span className="font-mono text-purple-600 text-sm font-bold">
                    전체의 {syntheticRatio}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={syntheticRatio}
                  onChange={(e) => setSyntheticRatio(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  비식별화 문제 없는 가상 3D 렌더링 번호판을 주입하여 희소 데이터 커버리지를 보강합니다.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400">
              * 산출 기준: 1일 8시간 작업 기준 및 한국 지능정보사회진흥원(NIA) 평균 공수 단가 기반
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-6 bg-slate-900 text-white p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <div>
                  <span className="text-xs font-mono text-sky-400 uppercase tracking-wider block">
                    Annual Feasibility Output
                  </span>
                  <h3 className="text-xl font-bold text-white mt-0.5">
                    연간 비용 절감 및 생산성 분석
                  </h3>
                </div>
                <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-mono font-bold">
                  {savingsPct}% 비용 절감
                </div>
              </div>

              {/* Massive Net Savings Card */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-850 p-6 rounded-2xl border border-slate-700/80 mb-6">
                <span className="text-xs text-slate-400 font-medium block mb-1">
                  연간 순수 절감 비용 (Net Annual Savings)
                </span>
                <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-300 font-mono tracking-tight">
                  {formatCurrency(annualSavings)}
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-700/60 pt-3">
                  <span>기존 전수 라벨링: {formatCurrency(legacyAnnualCost)}</span>
                  <span className="text-sky-400 font-semibold">솔루션 적용 후: {formatCurrency(newAnnualCost)}</span>
                </div>
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2 text-sky-400 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-medium text-slate-300">절약된 라벨링 시간</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-white mt-1">
                    {hoursSaved.toLocaleString()}
                    <span className="text-xs text-slate-400 font-normal ml-1">시간</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    연간 약 {Math.round(hoursSaved / 160)}인월(Man-Month)의 인건비 절약
                  </p>
                </div>

                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2 text-indigo-400 mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs font-medium text-slate-300">예상 mAP 정확도 상승</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                    +{projectedAccuracyBoost}%p
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    난이도 높은 코너케이스 집중 학습으로 성능 점프
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Insight */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-start gap-2.5 text-xs text-slate-300">
              <Sparkles className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
              <span>
                능동적 학습은 비용 절감뿐만 아니라, 엔지니어가 엣지 케이스를 체계적으로 모니터링할 수 있는 지속 가능한 AI 운영 환경을 보장합니다.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
