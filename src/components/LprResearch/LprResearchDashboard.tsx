import React, { useState } from 'react';
import {
  AlertTriangle,
  Lightbulb,
  Search,
  Zap,
  Sliders,
  CheckCircle2,
  Workflow,
  Cpu,
  Eye,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Gauge,
  Camera,
  Compass,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

type TabKey = 'precautions' | 'considerations' | 'methods' | 'procedures' | 'simulator';

export const LprResearchDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useLocalStorage<TabKey>('lpr_research_active_tab', 'precautions');

  // Simulator state automatically persisted in localStorage
  const [pixelWidth, setPixelWidth] = useLocalStorage<number>('lpr_sim_pixel_width', 200);
  const [irExposure, setIrExposure] = useLocalStorage<number>('lpr_sim_ir_exposure', 50);
  const [simPlateText, setSimPlateText] = useLocalStorage<string>('lpr_sim_plate_text', '123가 4567');
  const [plateType, setPlateType] = useLocalStorage<'standard' | 'ev' | 'commercial'>('lpr_sim_plate_type', 'standard');

  // Pixel status calculation
  let pixelStatusText = '(최적 구간)';
  let pixelStatusColor = 'text-green-500 font-semibold';
  if (pixelWidth < 130) {
    pixelStatusText = '(특징 유실 - 너무 작음)';
    pixelStatusColor = 'text-rose-500 font-semibold';
  } else if (pixelWidth > 300) {
    pixelStatusText = '(노이즈 증폭 - 너무 큼)';
    pixelStatusColor = 'text-amber-500 font-semibold';
  }

  // Exposure calculation
  let halationOpacity = 0;
  let textOpacity = 1;
  let borderColor = '#111';
  let bgColor = '#ffffff';

  if (irExposure > 70) {
    // 과노출 (화이트아웃)
    const overExposure = (irExposure - 70) / 30; // 0 to 1
    halationOpacity = overExposure * 0.92;
    textOpacity = Math.max(0.08, 1 - overExposure);
    borderColor = `rgba(17, 17, 17, ${Math.max(0.12, 1 - overExposure)})`;
    bgColor = '#ffffff';
  } else if (irExposure < 30) {
    // 저조도 언더노출
    const underExposure = (30 - irExposure) / 30; // 0 to 1
    halationOpacity = 0;
    const underAlpha = Math.max(0.18, 1 - underExposure * 0.8);
    bgColor = plateType === 'ev' 
      ? `rgba(191, 219, 254, ${underAlpha})`
      : plateType === 'commercial'
      ? `rgba(254, 240, 138, ${underAlpha})`
      : `rgba(255, 255, 255, ${underAlpha})`;
    textOpacity = 1;
    borderColor = '#111';
  } else {
    // 정상 구간
    halationOpacity = 0;
    textOpacity = 1;
    borderColor = '#111';
    bgColor = plateType === 'ev' ? '#bfdbfe' : plateType === 'commercial' ? '#fef08a' : '#ffffff';
  }

  const tabs: { id: TabKey; label: string; icon: React.ElementType }[] = [
    { id: 'precautions', label: '1. 주의사항 (Precautions)', icon: AlertTriangle },
    { id: 'considerations', label: '2. 고려사항 (Considerations)', icon: Compass },
    { id: 'methods', label: '3. 인식 방법 (Methods)', icon: Cpu },
    { id: 'procedures', label: '4. 연구 절차 (Procedures)', icon: Workflow },
    { id: 'simulator', label: '5. 광학 튜닝 시뮬레이터', icon: Sliders },
  ];

  return (
    <section id="lpr-research" className="py-16 bg-slate-950 text-white border-b border-slate-800 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 mb-2 tracking-wider uppercase">
            <BookOpen className="w-4 h-4 text-sky-400" />
            <span>Intelligent Transportation Systems (ITS)</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>ALPR Research & Development Guideline</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                지능형 차량 번호판 인식(LPR) 연구 대시보드
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-4xl leading-relaxed">
                AI 학습 모델 및 데이터셋 준비 가이드라인: 빛 번짐/형태학적 오인식 주의사항, 픽셀 밀도·P-Iris 광학 고려사항,
                EasyOCR vs PaddleOCR AI 아키텍처 비교, MLOps 개발 파이프라인, 실시간 광학 튜닝 시뮬레이터를 제공합니다.
              </p>
            </div>

            <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-300 shrink-0">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span>연구 기준: <strong className="text-indigo-400">AI-Hub 표준</strong></span>
              <span className="text-slate-700">|</span>
              <span className="text-emerald-400 font-bold">EasyOCR & PaddleOCR</span>
            </div>
          </div>
        </div>

        {/* Dashboard Main Container (Sidebar + Content Panel) */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-72 shrink-0">
            <nav className="bg-slate-900 rounded-2xl border border-slate-800 p-2 space-y-1.5 shadow-xl">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{tab.label}</span>
                    </div>
                    <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'translate-x-0.5' : 'opacity-0'}`} />
                  </button>
                );
              })}
            </nav>

            {/* Quick Spec Advice Card */}
            <div className="mt-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs hidden lg:block">
              <div className="text-slate-400 font-semibold mb-2 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-sky-400" />
                <span>연구 가이드 핵심 요약</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                <li className="flex justify-between">
                  <span className="text-slate-400">최적 픽셀 폭:</span>
                  <strong className="text-emerald-400 font-mono">130 ~ 300 px</strong>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-400">IR 화이트아웃:</span>
                  <strong className="text-rose-400 font-mono">&gt; 70% 노출 시 발생</strong>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-400">산업 배포 추천:</span>
                  <strong className="text-indigo-400 font-mono">PaddleOCR (SVTR)</strong>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-400">목표 추론 속도:</span>
                  <strong className="text-amber-400 font-mono">&lt; 30 ms (30FPS+)</strong>
                </li>
              </ul>
            </div>
          </aside>

          {/* Tab Content Area */}
          <div className="flex-grow bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-xl min-h-[500px]">
            {/* Tab 1: 주의사항 (Precautions) */}
            {activeTab === 'precautions' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <h3 className="text-xl sm:text-2xl font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
                  <span>1. 데이터셋 및 학습 시 주의사항</span>
                  <span className="text-xs font-mono font-normal text-rose-400">Precautions</span>
                </h3>

                <div className="space-y-4">
                  {/* Item 1 */}
                  <div className="bg-rose-950/20 p-5 rounded-2xl border border-rose-900/40 hover:border-rose-700/60 transition-all">
                    <h4 className="font-bold text-base sm:text-lg text-rose-400 flex items-center gap-2 mb-2">
                      <span>💡</span>
                      <span>빛 번짐(Halation) 및 화이트아웃</span>
                    </h4>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed pl-7">
                      야간에 적외선(IR) 카메라나 강한 조명을 맞을 경우, 반사 필름이 부착된 신형 8자리 번호판(파란색 태극문양)이나 전기차 번호판이 빛을 강하게 반사합니다.
                      이로 인해 텍스트 획이 유실되고 하얗게 날아가는 현상이 발생하므로 <strong>노출(Exposure) 제어가 필수적</strong>입니다.
                    </p>
                  </div>

                  {/* Item 2 */}
                  <div className="bg-orange-950/20 p-5 rounded-2xl border border-orange-900/40 hover:border-orange-700/60 transition-all">
                    <h4 className="font-bold text-base sm:text-lg text-orange-400 flex items-center gap-2 mb-2">
                      <span>🔍</span>
                      <span>형태학적 오인식 (한국어 특성)</span>
                    </h4>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed pl-7">
                      한글 특유의 복잡한 획 구성으로 인해 <strong>'처'와 '퍼'</strong>, <strong>'고'와 '보'</strong>와 같은 글자들은 저해상도 환경이나 모션 블러 발생 시 형태가 뭉개져 OCR 엔진의 치명적인 오인식을 유발합니다. 
                      <strong>문맥 추론(RNN/Transformer)이 반드시 필요</strong>합니다.
                    </p>
                  </div>

                  {/* Item 3 */}
                  <div className="bg-amber-950/20 p-5 rounded-2xl border border-amber-900/40 hover:border-amber-700/60 transition-all">
                    <h4 className="font-bold text-base sm:text-lg text-amber-400 flex items-center gap-2 mb-2">
                      <span>⚡</span>
                      <span>엣지 환경의 처리 지연 (Bottleneck)</span>
                    </h4>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed pl-7">
                      라즈베리파이나 NPU가 없는 제약된 엣지 기기에서 무거운 모델(Attention-LSTM 등)을 구동하면 초당 프레임(FPS)이 5 미만으로 떨어집니다. 
                      시속 60km 이상으로 주행하는 차량을 놓치지 않으려면 <strong>모델 경량화(INT8 양자화 등)가 필수</strong>입니다.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: 고려사항 (Considerations) */}
            {activeTab === 'considerations' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <h3 className="text-xl sm:text-2xl font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
                  <span>2. 광학 및 데이터 고려사항</span>
                  <span className="text-xs font-mono font-normal text-sky-400">Considerations</span>
                </h3>

                <ul className="space-y-5">
                  <li className="flex gap-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-base">
                      1
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-white">최적의 픽셀 밀도 (Pixel Density) 확보</h4>
                      <p className="text-slate-300 text-xs sm:text-sm mt-1 leading-relaxed">
                        카메라 화면 내에서 번호판 영역이 폭 기준 <strong>130~300 픽셀</strong>을 차지할 때 최상의 OCR 성능이 발휘됩니다. 
                        너무 작으면 특징 추출이 불가하고, 너무 크면 모델 수용 영역(Receptive Field)을 벗어납니다.
                      </p>
                    </div>
                  </li>

                  <li className="flex gap-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-base">
                      2
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-white">이중 제어 광학 튜닝 (P-Iris & AGC)</h4>
                      <p className="text-slate-300 text-xs sm:text-sm mt-1 leading-relaxed">
                        자동 노출(Auto Exposure)에 의존하지 않고, 물리적인 조리개(P-Iris) 값을 고정하여 
                        난반사를 막은 뒤 부족한 밝기를 센서의 게인(AGC)으로 보완하는 하드웨어적 접근이 선행되어야 합니다.
                      </p>
                    </div>
                  </li>

                  <li className="flex gap-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-base">
                      3
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-white">데이터 일반화 (Generalization)</h4>
                      <p className="text-slate-300 text-xs sm:text-sm mt-1 leading-relaxed">
                        구형 1줄, 신형 8자리, 상용차 2줄형(노란색), 훼손된 건설기계(주황색) 번호판 등 
                        종횡비가 극도로 다른 데이터를 고정 텐서로 정규화할 때 비율 왜곡(Aspect Ratio Distortion)을 방지하는 패딩(Padding) 전략이 필요합니다.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            )}

            {/* Tab 3: 인식 방법 (Methods) */}
            {activeTab === 'methods' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <h3 className="text-xl sm:text-2xl font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
                  <span>3. 핵심 번호판 인식 모델 (AI 아키텍처)</span>
                  <span className="text-xs font-mono font-normal text-emerald-400">Methods</span>
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* EasyOCR */}
                  <div className="border border-indigo-900/40 rounded-2xl p-5 bg-indigo-950/10 space-y-3">
                    <h4 className="text-lg sm:text-xl font-bold text-indigo-400">연구/프로토타입용: EasyOCR</h4>
                    <ul className="text-xs sm:text-sm text-slate-300 space-y-2 list-disc pl-5 leading-relaxed">
                      <li><strong>탐지기:</strong> CRAFT (문자 중심점 확률 분포 활용)</li>
                      <li><strong>인식기:</strong> ResNet + Bi-LSTM + CTC</li>
                      <li><strong>장점:</strong> PyTorch 기반으로 구현이 매우 간편하며 기울어지거나 곡선 형태의 번호판 텍스트 탐지에 탁월합니다.</li>
                      <li><strong>단점:</strong> LSTM의 순차적 연산 병목으로 인해 엣지 환경에서 실시간(30FPS 이상) 처리가 어렵습니다.</li>
                    </ul>
                  </div>

                  {/* PaddleOCR */}
                  <div className="border border-emerald-900/40 rounded-2xl p-5 bg-emerald-950/10 space-y-3">
                    <h4 className="text-lg sm:text-xl font-bold text-emerald-400">산업/엣지 배포용: PaddleOCR</h4>
                    <ul className="text-xs sm:text-sm text-slate-300 space-y-2 list-disc pl-5 leading-relaxed">
                      <li><strong>탐지기:</strong> DBNet (미분 가능 이진화로 초고속 분할)</li>
                      <li><strong>인식기:</strong> SVTR (비전 트랜스포머 기반)</li>
                      <li><strong>장점:</strong> 트랜스포머의 병렬 처리로 속도가 압도적이며, TensorRT C++ 배포 등 산업용 파이프라인이 완비되어 있습니다.</li>
                      <li><strong>단점:</strong> 학습 파이프라인 구축 및 설정(Config) 진입 장벽이 다소 높습니다.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: 연구 절차 (Procedures) */}
            {activeTab === 'procedures' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <h3 className="text-xl sm:text-2xl font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
                  <span>4. 연구 및 시스템 개발 파이프라인</span>
                  <span className="text-xs font-mono font-normal text-indigo-400">Procedures</span>
                </h3>

                <div className="relative border-l-2 border-indigo-500/30 ml-4 sm:ml-6 space-y-8 pb-4">
                  <div className="relative pl-6 sm:pl-8">
                    <div className="absolute w-6 h-6 bg-indigo-500 rounded-full text-slate-950 flex items-center justify-center text-xs font-bold -left-[13px] top-0 border-4 border-slate-900 shadow">
                      1
                    </div>
                    <h4 className="font-bold text-base sm:text-lg text-white">데이터 구축 및 파싱</h4>
                    <p className="text-slate-300 text-xs sm:text-sm mt-1 leading-relaxed">
                      AI-Hub 등에서 확보한 원본 JSON 파일에서 번호판 4개 꼭짓점 좌표와 텍스트를 추출하여 <code className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-xs text-sky-300">train_label.txt</code> 형식으로 변환합니다.
                    </p>
                  </div>

                  <div className="relative pl-6 sm:pl-8">
                    <div className="absolute w-6 h-6 bg-indigo-500 rounded-full text-slate-950 flex items-center justify-center text-xs font-bold -left-[13px] top-0 border-4 border-slate-900 shadow">
                      2
                    </div>
                    <h4 className="font-bold text-base sm:text-lg text-white">데이터 증강 및 합성 (Synthetic Data)</h4>
                    <p className="text-slate-300 text-xs sm:text-sm mt-1 leading-relaxed">
                      좌우반전, 임의 회전(-10~10도)을 적용하고, 부족한 데이터는 <code className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-xs text-emerald-300">KoreanCarPlateGenerator</code> 스크립트로 인공 렌더링하여 데이터셋 불균형을 해소합니다.
                    </p>
                  </div>

                  <div className="relative pl-6 sm:pl-8">
                    <div className="absolute w-6 h-6 bg-indigo-500 rounded-full text-slate-950 flex items-center justify-center text-xs font-bold -left-[13px] top-0 border-4 border-slate-900 shadow">
                      3
                    </div>
                    <h4 className="font-bold text-base sm:text-lg text-white">전이 학습 (Transfer Learning)</h4>
                    <p className="text-slate-300 text-xs sm:text-sm mt-1 leading-relaxed">
                      사전 학습 모델의 하위 계층을 동결(Freeze)한 후 상단 분류기만 판별적 학습률로 훈련합니다. 이후 동결을 해제하여 End-to-End 파인튜닝을 수행합니다.
                    </p>
                  </div>

                  <div className="relative pl-6 sm:pl-8">
                    <div className="absolute w-6 h-6 bg-indigo-500 rounded-full text-slate-950 flex items-center justify-center text-xs font-bold -left-[13px] top-0 border-4 border-slate-900 shadow">
                      4
                    </div>
                    <h4 className="font-bold text-base sm:text-lg text-white">모델 경량화 및 엣지(Edge) 배포</h4>
                    <p className="text-slate-300 text-xs sm:text-sm mt-1 leading-relaxed">
                      완성된 모델을 ONNX 포맷으로 변환(Dynamic Shape 적용)하고, TensorRT를 이용해 FP16 또는 INT8로 양자화하여 라즈베리파이/젯슨 보드에 포팅합니다.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: 실시간 광학 튜닝 시뮬레이터 (Simulator) */}
            {activeTab === 'simulator' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white border-b border-slate-800 pb-2 flex flex-wrap items-center justify-between gap-2">
                    <span>5. 실시간 광학 튜닝 시뮬레이터</span>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>슬라이더 위치 자동 저장 (localStorage)</span>
                      </span>
                      <span className="text-xs font-mono font-normal text-amber-400">Optics Simulator</span>
                    </div>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-2">
                    아래 슬라이더를 조절하여 카메라 렌즈 화각에 따른 픽셀 수와 야간 IR 투광 시 발생하는 화이트아웃 현상을 시뮬레이션 해보세요. 슬라이더 설정값은 브라우저를 새로고침해도 유지됩니다.
                  </p>
                </div>

                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                  {/* Canvas Viewport */}
                  <div className="flex flex-col items-center mb-8">
                    <div className="h-36 flex items-center justify-center w-full bg-gray-900/90 rounded-xl overflow-hidden relative border border-slate-800">
                      {/* Simulated Plate */}
                      <div
                        id="sim-plate"
                        style={{
                          width: `${pixelWidth}px`,
                          height: `${pixelWidth * 0.25}px`,
                          fontSize: `${Math.max(10, pixelWidth * 0.12)}px`,
                          backgroundColor: bgColor,
                          borderColor: borderColor,
                          transition: 'all 0.25s ease'
                        }}
                        className="inline-flex items-center justify-center font-bold text-slate-900 border-[3px] rounded-lg relative overflow-hidden select-none shrink-0 shadow-lg"
                      >
                        <span
                          className="plate-text relative z-10 whitespace-nowrap tracking-wider font-bold transition-colors"
                          style={{
                            color: textOpacity < 1 ? `rgba(17, 17, 17, ${textOpacity})` : '#111'
                          }}
                        >
                          {simPlateText}
                        </span>
                        <div
                          id="sim-glow"
                          className="halation-glow absolute inset-0 bg-white pointer-events-none transition-opacity duration-200"
                          style={{ opacity: halationOpacity }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sliders Area */}
                  <div className="space-y-6">
                    {/* 픽셀 조절 */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5 text-xs sm:text-sm">
                        <label className="font-bold text-slate-200">번호판 픽셀 폭 (카메라 줌)</label>
                        <span id="px-val" className="font-bold font-mono text-indigo-400">
                          {pixelWidth} px <span className={pixelStatusColor}>{pixelStatusText}</span>
                        </span>
                      </div>
                      <input
                        type="range"
                        id="slider-px"
                        min="50"
                        max="400"
                        value={pixelWidth}
                        onChange={(e) => setPixelWidth(Number(e.target.value))}
                        className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                      <div className="flex justify-between text-xs text-slate-400 mt-1 font-mono">
                        <span>50px (인식 불가)</span>
                        <span className="text-emerald-400">130~300px (최적)</span>
                        <span>400px (초과)</span>
                      </div>
                    </div>

                    {/* 조도 조절 */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5 text-xs sm:text-sm">
                        <label className="font-bold text-slate-200">IR 조명 및 노출 강도 (야간)</label>
                        <span id="light-val" className="font-bold font-mono text-indigo-400">
                          {irExposure} %
                        </span>
                      </div>
                      <input
                        type="range"
                        id="slider-light"
                        min="0"
                        max="100"
                        value={irExposure}
                        onChange={(e) => setIrExposure(Number(e.target.value))}
                        className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                      <div className="flex justify-between text-xs text-slate-400 mt-1 font-mono">
                        <span>0% (언더노출)</span>
                        <span className="text-emerald-400">50% (정상)</span>
                        <span className="text-rose-400">100% (빛 번짐/화이트아웃)</span>
                      </div>
                    </div>

                    {/* Presets */}
                    <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-slate-400">차량 번호판 스타일:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setPlateType('standard');
                            setSimPlateText('123가 4567');
                          }}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
                            plateType === 'standard'
                              ? 'bg-indigo-600 text-white border-indigo-500'
                              : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                          }`}
                        >
                          표준 흰색 (123가 4567)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPlateType('ev');
                            setSimPlateText('56두 7890');
                          }}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
                            plateType === 'ev'
                              ? 'bg-blue-600 text-white border-blue-500'
                              : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                          }`}
                        >
                          친환경 전기차 (파란색)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPlateType('commercial');
                            setSimPlateText('서울 31바 1234');
                          }}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
                            plateType === 'commercial'
                              ? 'bg-yellow-600 text-slate-950 border-yellow-500 font-bold'
                              : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                          }`}
                        >
                          영업용 택시/버스 (노란색)
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setPixelWidth(200);
                          setIrExposure(50);
                          setSimPlateText('123가 4567');
                          setPlateType('standard');
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>기본값 초기화</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
