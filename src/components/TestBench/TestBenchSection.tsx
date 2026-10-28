import React, { useState } from 'react';
import { PRESET_TEST_CASES, TestCase } from '../../data/testBenchCases';
import { simulateOcrInference } from '../../utils/alprSimulator';
import { BatchProcessingTab } from './BatchProcessingTab';
import { AugmentationParams } from '../../types/alpr';
import { 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Zap, 
  Activity, 
  Layers, 
  RefreshCw, 
  BarChart3, 
  FileText, 
  Sliders, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Camera,
  Search
} from 'lucide-react';

interface TestBenchSectionProps {
  currentParams?: AugmentationParams;
}

export const TestBenchSection: React.FC<TestBenchSectionProps> = ({ currentParams }) => {
  const [activeTab, setActiveTab] = useState<'single' | 'batch_processing' | 'batch' | 'confusion'>('single');
  
  const defaultParams: AugmentationParams = {
    blur: 0,
    brightness: 100,
    contrast: 100,
    noise: 0,
    rotate: 0,
    perspectiveX: 0,
    perspectiveY: 0,
    rain: 0,
    fog: 0,
    dirt: 0,
    glare: 0,
  };

  const resolvedParams = currentParams || defaultParams;
  
  // Single Test State
  const [selectedCase, setSelectedCase] = useState<TestCase>(PRESET_TEST_CASES[0]);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognitionRunCount, setRecognitionRunCount] = useState(1);
  const [customPlateInput, setCustomPlateInput] = useState('');

  // Batch Test State
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchResults, setBatchResults] = useState<{
    testCase: TestCase;
    predicted: string;
    overallConfidence: number;
    isExactMatch: boolean;
    cer: number; // character error rate
    latency: number;
    detected: boolean;
  }[]>([]);

  // Calculate current single test result
  const currentPlate = customPlateInput.trim() || selectedCase.groundTruthPlate;
  const currentResult = simulateOcrInference(
    currentPlate,
    selectedCase.plateType,
    selectedCase.distortionParams
  );

  const isExactMatch = currentResult.detected && currentResult.predictedText === currentPlate;
  const mismatchCount = currentResult.charBreakdown.filter(c => c.isMismatch).length;
  const cer = currentPlate.length > 0 ? ((mismatchCount / currentPlate.length) * 100).toFixed(1) : '0';

  // Run single recognition simulation
  const handleRunSingleTest = () => {
    setIsRecognizing(true);
    setTimeout(() => {
      setIsRecognizing(false);
      setRecognitionRunCount(prev => prev + 1);
    }, 450);
  };

  // Run batch benchmark
  const handleRunBatchBenchmark = () => {
    setIsBatchRunning(true);
    setBatchProgress(0);
    setBatchResults([]);

    const results: typeof batchResults = [];
    let idx = 0;

    const interval = setInterval(() => {
      if (idx >= PRESET_TEST_CASES.length) {
        clearInterval(interval);
        setIsBatchRunning(false);
        setBatchProgress(100);
        return;
      }

      const tc = PRESET_TEST_CASES[idx];
      const res = simulateOcrInference(tc.groundTruthPlate, tc.plateType, tc.distortionParams);
      const isMatch = res.detected && res.predictedText === tc.groundTruthPlate;
      const errors = res.charBreakdown.filter(c => c.isMismatch).length;
      const charErrRate = Number(((errors / tc.groundTruthPlate.length) * 100).toFixed(1));

      results.push({
        testCase: tc,
        predicted: res.predictedText,
        overallConfidence: res.overallConfidence,
        isExactMatch: isMatch,
        cer: charErrRate,
        latency: res.latencyMs,
        detected: res.detected,
      });

      setBatchResults([...results]);
      idx++;
      setBatchProgress(Math.round((idx / PRESET_TEST_CASES.length) * 100));
    }, 250);
  };

  // Helper for difficulty badge
  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'easy':
        return <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">난이도: 보통</span>;
      case 'medium':
        return <span className="text-[10px] font-mono font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">난이도: 중급</span>;
      case 'hard':
        return <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">난이도: 고급</span>;
      case 'extreme':
      default:
        return <span className="text-[10px] font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">난이도: 극한</span>;
    }
  };

  // Confusion matrix items
  const confusionPairs = [
    { from: '1', to: '7', freq: '38.4%', condition: '수평 모션 블러 (Blur > 6px)', reason: '1의 수직 획 상단이 블러로 번져 7의 꺾쇠와 혼동' },
    { from: '가', to: '하', freq: '29.1%', condition: '우천 빗방울 및 결로', reason: '가운데 모음 획과 자음 경계가 수증기 산란으로 뭉개짐' },
    { from: '8', to: '0', freq: '24.7%', condition: '심야 초저조도 (0.5 lux 이하)', reason: '조도 부족으로 8의 중앙 교차점이 이진화(Binarization) 시 유실' },
    { from: '3', to: '5', freq: '18.2%', condition: '표면 진흙 오염 (Dirt > 50%)', reason: '3의 상단 곡선에 흙먼지가 덮여 5의 수평 바로 변조 오독' },
    { from: '허', to: '호', freq: '16.5%', condition: '3D 원근 사각 각도 (Tilt > 20°)', reason: '종횡비 압축으로 모음 "ㅓ"와 "ㅗ"의 방향 축소 왜곡' },
  ];

  return (
    <section id="testbench" className="py-20 bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 mb-2 font-mono uppercase tracking-wider">
            <Zap className="w-4 h-4 text-sky-400" />
            <span>ALPR Recognition Testing & Benchmark Lab</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            번호판 인식 실전 테스트 랩
          </h2>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            실제 현장 카메라에서 발생하는 극단적 도로 시나리오를 선택하거나 직접 번호를 입력하여 
            딥러닝 모델(YOLOv11 + CRNN)의 검출률, 문자 단위 인식률, 지연 시간(Latency)을 정밀 시험하세요.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 border-b border-slate-800 pb-4">
          <button
            onClick={() => setActiveTab('single')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'single'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>단일 샘플 실시간 시험 (Single Test)</span>
          </button>

          <button
            onClick={() => setActiveTab('batch_processing')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'batch_processing'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>배치 프로세서 (Batch Processor)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('batch');
              if (batchResults.length === 0) {
                handleRunBatchBenchmark();
              }
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'batch'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>시나리오 벤치마크 (Scenario Benchmark)</span>
          </button>

          <button
            onClick={() => setActiveTab('confusion')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'confusion'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>오인식 혼동 행렬 (Confusion Matrix)</span>
          </button>
        </div>

        {/* TAB 1: SINGLE SAMPLE TEST */}
        {activeTab === 'single' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Preset Test Scenarios Selector & Custom Plate Input */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    1. 현장 테스트 시나리오 선택 (6종)
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    선택: {selectedCase.scenarioName.split(' ')[0]}
                  </span>
                </div>

                <div className="space-y-2">
                  {PRESET_TEST_CASES.map((tc) => {
                    const isSelected = selectedCase.id === tc.id;
                    return (
                      <button
                        key={tc.id}
                        onClick={() => {
                          setSelectedCase(tc);
                          setCustomPlateInput('');
                        }}
                        className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-sky-500/15 border-sky-500/80 text-white shadow-sm'
                            : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{tc.scenarioName}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                            <span className="text-sky-300 font-semibold">{tc.groundTruthPlate}</span>
                            <span>·</span>
                            <span>{tc.environmentConditions}</span>
                          </div>
                        </div>

                        <div>
                          {getDifficultyBadge(tc.difficulty)}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom plate test override */}
                <div className="mt-4 pt-4 border-t border-slate-700/70">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    임의 번호판 직접 입력 테스트 (Custom Plate Override)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="예: 777가 7777, 서울 31 바 9999"
                      value={customPlateInput}
                      onChange={(e) => setCustomPlateInput(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    {customPlateInput && (
                      <button
                        onClick={() => setCustomPlateInput('')}
                        className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-xs text-slate-300"
                      >
                        원문 복원
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Run Test Button */}
              <button
                onClick={handleRunSingleTest}
                disabled={isRecognizing}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm py-3.5 px-6 rounded-xl shadow-lg shadow-sky-500/25 transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {isRecognizing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>딥러닝 추론 연산 중 (Inference Running)...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
                    <span>실시간 번호판 인식 시험 실행 (Run ALPR Test)</span>
                  </>
                )}
              </button>
            </div>

            {/* Right Column: Live Recognition Output & Diagnostic Telemetry */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
                {/* Status Bar */}
                <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-800 gap-2 mb-4">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-slate-400">TEST RUN #{recognitionRunCount}</span>
                    <span>·</span>
                    <span className="text-sky-400">FRAME: CAM_EDGE_STREAM</span>
                  </div>

                  <div>
                    {isExactMatch ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 rounded-lg text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>전체 일치 (Exact Match)</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-950/80 border border-rose-500/40 text-rose-400 rounded-lg text-xs font-bold">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{mismatchCount}개 글자 오인식 (CER: {cer}%)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ground Truth vs Prediction Comparison Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {/* Ground Truth */}
                  <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800">
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                      정답 라벨 (Ground Truth)
                    </span>
                    <div className="text-2xl font-black font-mono text-emerald-400 tracking-wider">
                      {currentPlate}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      참조 원본 텍스트 데이터
                    </span>
                  </div>

                  {/* AI Prediction */}
                  <div className={`p-4 rounded-xl border ${
                    isExactMatch 
                      ? 'bg-slate-900/90 border-slate-800' 
                      : 'bg-rose-950/30 border-rose-800/60'
                  }`}>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                      AI 판독 결과 (Prediction)
                    </span>
                    <div className={`text-2xl font-black font-mono tracking-wider ${
                      isExactMatch ? 'text-white' : 'text-rose-300'
                    }`}>
                      {currentResult.detected ? currentResult.predictedText : '검출 실패 (NaN)'}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      모델 예측 확신도: {currentResult.detected ? `${currentResult.overallConfidence}%` : '0%'}
                    </span>
                  </div>
                </div>

                {/* Character-by-Character Softmax Probability Breakdown */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800/80 mb-6">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                    <span className="font-semibold text-slate-300">개별 문자별 Softmax 확신도 및 오류 마커</span>
                    <span className="text-[11px] font-mono">단일 음절 신뢰도</span>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {currentResult.charBreakdown.map((item, idx) => {
                      if (item.expected === ' ') {
                        return <div key={idx} className="w-2 text-center text-slate-600">·</div>;
                      }
                      return (
                        <div
                          key={idx}
                          className={`flex flex-col items-center justify-center min-w-[50px] p-2 rounded-lg border text-center transition-all ${
                            item.isMismatch
                              ? 'bg-rose-950/70 border-rose-500 text-rose-300 shadow-md ring-1 ring-rose-500'
                              : item.confidence < 75
                                ? 'bg-amber-950/50 border-amber-500/60 text-amber-200'
                                : 'bg-slate-950 border-slate-700 text-white'
                          }`}
                        >
                          <span className="text-xl font-black font-mono leading-none mb-1">
                            {currentResult.detected ? item.predicted : '?'}
                          </span>
                          <span className="text-[10px] font-mono opacity-80 leading-none">
                            {currentResult.detected ? `${item.confidence}%` : '0%'}
                          </span>
                          {item.isMismatch && currentResult.detected && (
                            <span className="text-[9px] text-rose-400 font-bold border-t border-rose-500/40 mt-1 pt-0.5">
                              정답: {item.expected}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Performance Benchmark Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center mb-6">
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">YOLO 검출 지연</span>
                    <span className="text-sm font-mono font-bold text-white">8.2 ms</span>
                  </div>

                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">CRNN OCR 지연</span>
                    <span className="text-sm font-mono font-bold text-white">{currentResult.latencyMs} ms</span>
                  </div>

                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">추론 FPS</span>
                    <span className="text-sm font-mono font-bold text-emerald-400">
                      ~{Math.round(1000 / (8.2 + currentResult.latencyMs))} FPS
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">에지 선명도</span>
                    <span className="text-sm font-mono font-bold text-sky-400">
                      {currentResult.sharpnessScore} / 100
                    </span>
                  </div>
                </div>

                {/* Scenario Challenges & Prescribed Fix */}
                <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-sky-400 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>이 시나리오의 핵심 장애물 및 데이터셋 처방 솔루션</span>
                  </div>
                  <ul className="space-y-1 text-slate-300 pl-4 list-disc">
                    {selectedCase.expectedChallenges.map((ch, idx) => (
                      <li key={idx}>{ch}</li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                    💡 <strong>추천 증강: </strong>{currentResult.recommendedAugmentation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BATCH PROCESSING TAB (Upload custom batch & apply current augmentation config) */}
        {activeTab === 'batch_processing' && (
          <BatchProcessingTab currentParams={resolvedParams} />
        )}

        {/* TAB 3: SCENARIO BENCHMARK */}
        {activeTab === 'batch' && (
          <div className="space-y-6">
            {/* Top Control Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-slate-950 rounded-2xl border border-slate-800 gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-sky-400" />
                  <span>6대 극단적 도로 시나리오 자동 배치 벤치마크</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  모션 블러, 폭우, 심야 저조도, 사각 원근 각도, 극단적 진흙 오염 시나리오를 일괄 검증합니다.
                </p>
              </div>

              <button
                onClick={handleRunBatchBenchmark}
                disabled={isBatchRunning}
                className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-sky-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {isBatchRunning ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
                    <span>벤치마크 실행 중 ({batchProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                    <span>전체 배치 테스트 다시 실행</span>
                  </>
                )}
              </button>
            </div>

            {/* Progress Bar */}
            {isBatchRunning && (
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-sky-500 to-indigo-500 h-2 transition-all duration-200"
                  style={{ width: `${batchProgress}%` }}
                />
              </div>
            )}

            {/* Benchmark Summary Metrics */}
            {batchResults.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">번호판 완독률 (Word Accuracy)</span>
                  <div className="text-2xl font-black font-mono text-emerald-400">
                    {Math.round((batchResults.filter(r => r.isExactMatch).length / batchResults.length) * 100)}%
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    {batchResults.filter(r => r.isExactMatch).length} / {batchResults.length} 케이스 성공
                  </span>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">문자 단위 정확도 (Char Accuracy)</span>
                  <div className="text-2xl font-black font-mono text-sky-400">
                    {(100 - (batchResults.reduce((acc, r) => acc + r.cer, 0) / batchResults.length)).toFixed(1)}%
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    평균 CER {(batchResults.reduce((acc, r) => acc + r.cer, 0) / batchResults.length).toFixed(1)}%
                  </span>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">평균 판독 확신도</span>
                  <div className="text-2xl font-black font-mono text-indigo-400">
                    {Math.round(batchResults.reduce((acc, r) => acc + r.overallConfidence, 0) / batchResults.length)}%
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    Softmax Confidence 평균
                  </span>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">평균 지연 시간</span>
                  <div className="text-2xl font-black font-mono text-slate-200">
                    {(batchResults.reduce((acc, r) => acc + r.latency, 0) / batchResults.length).toFixed(1)} ms
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    실시간 엣지 파이프라인
                  </span>
                </div>
              </div>
            )}

            {/* Detailed Results Table */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="p-4 bg-slate-900 border-b border-slate-800 text-xs font-bold text-slate-300">
                시나리오별 테스트 판독 상세 리포트
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/60 border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase">
                    <tr>
                      <th className="p-3.5">시나리오 명</th>
                      <th className="p-3.5">난이도</th>
                      <th className="p-3.5">정답 (Ground Truth)</th>
                      <th className="p-3.5">예측 판독 (Prediction)</th>
                      <th className="p-3.5">확신도</th>
                      <th className="p-3.5">결과 판정</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {batchResults.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-3.5 font-medium text-white">
                          <div>{item.testCase.scenarioName}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{item.testCase.environmentConditions}</div>
                        </td>
                        <td className="p-3.5">
                          {getDifficultyBadge(item.testCase.difficulty)}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-emerald-400">
                          {item.testCase.groundTruthPlate}
                        </td>
                        <td className="p-3.5 font-mono font-bold">
                          <span className={item.isExactMatch ? 'text-white' : 'text-rose-400'}>
                            {item.predicted}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono">
                          {item.overallConfidence}%
                        </td>
                        <td className="p-3.5">
                          {item.isExactMatch ? (
                            <span className="flex items-center gap-1 text-emerald-400 font-bold text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>성공 (PASS)</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-rose-400 font-bold text-xs">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>오인식 (FAIL)</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CONFUSION MATRIX */}
        {activeTab === 'confusion' && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800">
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <Activity className="w-5 h-5 text-sky-400" />
                <span>한국형 번호판 5대 문자 혼동 행렬 (Confusion Matrix Patterns)</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                광학 왜곡(블러, 저조도, 오염, 사각) 환경에서 OCR 시퀀스 모델이 가장 자주 오독하는 
                문자 쌍의 원인과 데이터셋 기반 해결책을 제공합니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {confusionPairs.map((pair, idx) => (
                <div key={idx} className="p-5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    {/* Header: Confused pair */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-mono font-black text-base flex items-center justify-center">
                          {pair.from}
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-500" />
                        <span className="w-8 h-8 rounded-lg bg-rose-950 border border-rose-500/40 text-rose-400 font-mono font-black text-base flex items-center justify-center">
                          {pair.to}
                        </span>
                      </div>

                      <span className="text-xs font-mono font-bold text-rose-400">
                        오류 빈도: {pair.freq}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-sky-400 mb-1">
                      유발 환경: {pair.condition}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                      {pair.reason}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 text-[11px] text-slate-400">
                    <strong className="text-slate-200 block mb-0.5">💡 극복 데이터셋 전략:</strong>
                    <span>해당 혼동 음절에 맞춘 타깃 Albumentations 및 CutOut 증강 비중 25% 확충</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
