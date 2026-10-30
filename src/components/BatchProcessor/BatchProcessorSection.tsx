import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AugmentationParams, PlateType } from '../../types/alpr';
import { BulkImageProcessor } from '../Simulator/BulkImageProcessor';
import { 
  applyAugmentationToCanvas, 
  generateSyntheticPlateImage, 
  detectPlateTypeFromText,
  DEFAULT_SAMPLE_PLATE_STRINGS 
} from '../../utils/batchProcessor';
import { simulateOcrInference } from '../../utils/alprSimulator';
import { exportDatasetToZip, ProcessedDatasetImage } from '../../utils/datasetStorage';
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
  Code2,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  Zap,
  Activity,
  Image as ImageIcon,
  Check,
  Cpu
} from 'lucide-react';

interface BatchProcessorSectionProps {
  currentParams: AugmentationParams;
  onScrollToSimulator?: () => void;
}

interface SyntheticBatchItem {
  id: string;
  index: number;
  text: string;
  plateType: PlateType;
  originalUrl: string;
  augmentedUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  ocrConfidence: number;
  ocrDetected: boolean;
  ocrLatencyMs: number;
  appliedParams: AugmentationParams;
}

// Procedural generator for synthetic Korean plate strings
const GENERATOR_PLATE_PATTERNS = [
  { text: '123가 4567', type: 'white_8' as PlateType },
  { text: '58조 8912', type: 'white_7' as PlateType },
  { text: 'EV 09다 8765', type: 'ev_blue' as PlateType },
  { text: '서울 31 바 1234', type: 'yellow_commercial' as PlateType },
  { text: '경기 72 사 5543', type: 'yellow_commercial' as PlateType },
  { text: '41너 6520', type: 'green_retro' as PlateType },
  { text: '345라 9876', type: 'white_8' as PlateType },
  { text: 'EV 77루 2468', type: 'ev_blue' as PlateType },
  { text: '89마 3321', type: 'white_7' as PlateType },
  { text: '201어 9988', type: 'white_8' as PlateType },
  { text: '365하 8899', type: 'white_8' as PlateType },
  { text: '인천 33 바 5678', type: 'yellow_commercial' as PlateType },
  { text: '62구 1122', type: 'white_7' as PlateType },
  { text: 'EV 15호 9012', type: 'ev_blue' as PlateType },
  { text: '540허 3410', type: 'white_8' as PlateType },
  { text: '충남 80 아 7788', type: 'yellow_commercial' as PlateType },
  { text: '24고 8821', type: 'white_7' as PlateType },
  { text: '111저 3333', type: 'white_8' as PlateType },
  { text: 'EV 88수 4321', type: 'ev_blue' as PlateType },
  { text: '부산 91 사 2244', type: 'yellow_commercial' as PlateType },
];

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

  // -------------------------------------------------------------
  // Real-time Synthetic Batch Generator with Simulated Processing Delay
  // -------------------------------------------------------------
  const [batchTargetCount, setBatchTargetCount] = useState<number>(10);
  const [simulatedDelayMs, setSimulatedDelayMs] = useState<number>(300); // 300ms default delay per image
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentStatusMessage, setCurrentStatusMessage] = useState<string>('대기 중: 합성 배치 생성을 시작하세요.');
  const [currentActivePlate, setCurrentActivePlate] = useState<SyntheticBatchItem | null>(null);
  const [generatedItems, setGeneratedItems] = useState<SyntheticBatchItem[]>([]);
  const [elapsedTimeSec, setElapsedTimeSec] = useState<number>(0);
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);

  const pauseRef = useRef<boolean>(false);
  const stopRef = useRef<boolean>(false);
  const timerRef = useRef<number | null>(null);

  // Sync ref with pause state
  useEffect(() => {
    pauseRef.current = isPaused;
  }, [isPaused]);

  // Elapsed time timer
  useEffect(() => {
    if (isGenerating && !isPaused) {
      const startTime = Date.now() - elapsedTimeSec * 1000;
      timerRef.current = window.setInterval(() => {
        setElapsedTimeSec(Number(((Date.now() - startTime) / 1000).toFixed(1)));
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isGenerating, isPaused]);

  // Estimated remaining time calculation
  const estimatedRemainingSec = useMemo(() => {
    if (!isGenerating || currentIndex === 0) return 0;
    const remainingCount = batchTargetCount - currentIndex;
    const secondsPerItem = simulatedDelayMs / 1000 + 0.05; // include canvas render overhead
    return Number((remainingCount * secondsPerItem).toFixed(1));
  }, [isGenerating, currentIndex, batchTargetCount, simulatedDelayMs]);

  // Processing speed (img/sec)
  const processingSpeed = useMemo(() => {
    if (elapsedTimeSec <= 0 || currentIndex <= 0) return 0;
    return Number((currentIndex / elapsedTimeSec).toFixed(1));
  }, [elapsedTimeSec, currentIndex]);

  // Start real-time synthetic batch generation
  const handleStartSyntheticBatch = async () => {
    setIsGenerating(true);
    setIsPaused(false);
    stopRef.current = false;
    pauseRef.current = false;
    setGenerationProgress(0);
    setCurrentIndex(0);
    setElapsedTimeSec(0);
    setGeneratedItems([]);

    const items: SyntheticBatchItem[] = [];

    for (let i = 0; i < batchTargetCount; i++) {
      if (stopRef.current) break;

      // Handle pause loop
      while (pauseRef.current && !stopRef.current) {
        await new Promise((r) => setTimeout(r, 200));
      }
      if (stopRef.current) break;

      const platePattern = GENERATOR_PLATE_PATTERNS[i % GENERATOR_PLATE_PATTERNS.length];
      const text = platePattern.text;
      const plateType = platePattern.type;

      // Update status indicator: Step 1 - Generating base synthetic plate
      setCurrentIndex(i + 1);
      setCurrentStatusMessage(`[${i + 1}/${batchTargetCount}] "${text}" 합성 번호판 베이스 캔버스 생성 중...`);
      setGenerationProgress(Math.round(((i + 0.2) / batchTargetCount) * 100));

      // Simulated processing delay stage 1
      await new Promise((r) => setTimeout(r, simulatedDelayMs * 0.4));

      // 1. Generate clean synthetic plate canvas
      const originalUrl = generateSyntheticPlateImage(text, plateType);

      // Update status indicator: Step 2 - Applying live optical augmentations
      setCurrentStatusMessage(`[${i + 1}/${batchTargetCount}] "${text}" 광학 왜곡 파라미터(블러·노이즈·원근) 실시간 주입 중...`);
      setGenerationProgress(Math.round(((i + 0.6) / batchTargetCount) * 100));

      // 2. Apply active augmentation params
      const augmentedUrl = await applyAugmentationToCanvas(originalUrl, currentParams);

      // Simulated processing delay stage 2 (OCR inference simulation)
      await new Promise((r) => setTimeout(r, simulatedDelayMs * 0.6));

      // 3. Simulate OCR inference
      const ocr = simulateOcrInference(text, plateType, currentParams);

      const newItem: SyntheticBatchItem = {
        id: `syn_${Date.now()}_${i}`,
        index: i + 1,
        text,
        plateType,
        originalUrl,
        augmentedUrl,
        status: 'completed',
        ocrConfidence: ocr.overallConfidence,
        ocrDetected: ocr.detected,
        ocrLatencyMs: ocr.latencyMs,
        appliedParams: { ...currentParams },
      };

      items.push(newItem);
      setCurrentActivePlate(newItem);
      setGeneratedItems([...items]);

      // Update status indicator: Step 3 - Completed item
      setCurrentStatusMessage(`[${i + 1}/${batchTargetCount}] "${text}" 증강 및 OCR 검증 완료 (신뢰도: ${ocr.overallConfidence}%)`);
      setGenerationProgress(Math.round(((i + 1) / batchTargetCount) * 100));
    }

    if (!stopRef.current) {
      setCurrentStatusMessage(`성공: 총 ${batchTargetCount}장의 합성 번호판 배치 생성 및 실시간 증강이 완료되었습니다.`);
    } else {
      setCurrentStatusMessage('작업이 사용자에 의해 중단되었습니다.');
    }

    setIsGenerating(false);
    setIsPaused(false);
  };

  const handlePauseResume = () => {
    setIsPaused((prev) => !prev);
    setCurrentStatusMessage(isPaused ? '생성 작업 재개 중...' : '작업 일시정지됨');
  };

  const handleStop = () => {
    stopRef.current = true;
    setIsGenerating(false);
    setIsPaused(false);
  };

  // Download all generated synthetic images as a ZIP
  const handleDownloadSyntheticZip = async () => {
    if (generatedItems.length === 0) return;
    try {
      setIsExportingZip(true);
      const datasetImages: ProcessedDatasetImage[] = generatedItems.map((item) => ({
        id: item.id,
        filename: `syn_plate_${String(item.index).padStart(4, '0')}_${item.text.replace(/\s+/g, '')}.jpg`,
        originalUrl: item.originalUrl,
        augmentedUrl: item.augmentedUrl,
        originalSize: '120 KB',
        width: 440,
        height: 120,
        status: 'completed',
        ocrResult: {
          detected: item.ocrDetected,
          predictedText: item.text,
          confidence: item.ocrConfidence,
          latencyMs: item.ocrLatencyMs,
        },
      }));

      const blob = await exportDatasetToZip(
        `Synthetic_ALPR_Batch_${generatedItems.length}`,
        datasetImages,
        currentParams
      );

      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `Synthetic_ALPR_Batch_${generatedItems.length}images.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Failed to export synthetic batch zip', err);
    } finally {
      setIsExportingZip(false);
    }
  };

  // Average confidence of completed batch
  const avgConfidence = useMemo(() => {
    if (generatedItems.length === 0) return 0;
    return Math.round(
      generatedItems.reduce((acc, curr) => acc + curr.ocrConfidence, 0) / generatedItems.length
    );
  }, [generatedItems]);

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
              업로드된 복수 번호판 이미지 또는 가상 합성 번호판에 현재 시뮬레이터 왜곡 파라미터(블러, 밝기, 대비, 노이즈, 원근 왜곡, 강우, 안개, 오염, 직사광)를 동시 일괄 적용하고,
              <strong>실시간 지연 시뮬레이션(Simulated Processing Delay)과 진행률(Progress Bar)</strong>을 통해 생성 경과를 모니터링합니다.
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

        {/* ------------------------------------------------------------------ */}
        {/* NEW FEATURE: Real-Time Synthetic Batch Generation Progress Monitor */}
        {/* ------------------------------------------------------------------ */}
        <div className="mb-10 bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
          {/* Header & Controls Bar */}
          <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>실시간 합성 이미지 배치 생성기 (Synthetic Batch Generator Monitor)</span>
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-md font-bold">
                  Simulated Processing Delay
                </span>
              </div>
              <p className="text-xs text-slate-300">
                원하는 장수를 선택하고 실행하면 각 번호판이 <strong>설정된 지연 속도(Delay)</strong>에 맞춰 실시간 합성·증강되며 진행 상태가 갱신됩니다.
              </p>
            </div>

            {/* Control Buttons & Speed Select */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Batch Size Selector */}
              <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-700 text-xs">
                <span className="text-slate-400 px-2 font-mono">수량:</span>
                {[5, 10, 20, 50].map((count) => (
                  <button
                    key={count}
                    disabled={isGenerating}
                    onClick={() => setBatchTargetCount(count)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      batchTargetCount === count
                        ? 'bg-sky-500 text-slate-950 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {count}장
                  </button>
                ))}
              </div>

              {/* Simulated Delay Speed Selector */}
              <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-700 text-xs">
                <Clock className="w-3.5 h-3.5 text-amber-400 ml-1.5" />
                <span className="text-slate-400 px-1 font-mono">지연:</span>
                {[
                  { label: '고속 (150ms)', val: 150 },
                  { label: '표준 (300ms)', val: 300 },
                  { label: '정밀 (600ms)', val: 600 },
                ].map((speed) => (
                  <button
                    key={speed.val}
                    disabled={isGenerating}
                    onClick={() => setSimulatedDelayMs(speed.val)}
                    className={`px-2 py-1 rounded-lg font-semibold transition-all ${
                      simulatedDelayMs === speed.val
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {speed.label}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {!isGenerating ? (
                  <button
                    onClick={handleStartSyntheticBatch}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-md shadow-emerald-500/25 transition-all active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                    <span>합성 배치 생성 실행 ({batchTargetCount}장)</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handlePauseResume}
                      className="flex items-center gap-1 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-sm transition-all"
                    >
                      {isPaused ? <Play className="w-3.5 h-3.5 fill-slate-950" /> : <Pause className="w-3.5 h-3.5" />}
                      <span>{isPaused ? '계속' : '일시정지'}</span>
                    </button>
                    <button
                      onClick={handleStop}
                      className="flex items-center gap-1 px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                    >
                      <span>중단</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar & Status Indicator HUD */}
          <div className="p-6 bg-slate-900 border-b border-slate-800 text-white space-y-4">
            {/* Status Indicator Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              {/* Left Status Badge & Message */}
              <div className="flex items-center gap-2.5">
                {/* State Badge */}
                <div className={`px-2.5 py-1 rounded-full font-mono text-[11px] font-bold flex items-center gap-1.5 border ${
                  isGenerating && !isPaused
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 animate-pulse'
                    : isPaused
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : generationProgress === 100
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {isGenerating && !isPaused ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin text-sky-400" />
                      <span>GENERATING (생성 및 증강 중)</span>
                    </>
                  ) : isPaused ? (
                    <>
                      <Pause className="w-3 h-3 text-amber-400" />
                      <span>PAUSED (일시정지)</span>
                    </>
                  ) : generationProgress === 100 ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>COMPLETED (완료됨)</span>
                    </>
                  ) : (
                    <>
                      <Activity className="w-3 h-3 text-slate-400" />
                      <span>IDLE (대기 상태)</span>
                    </>
                  )}
                </div>

                {/* Status Message Text */}
                <span className="text-slate-300 font-mono text-xs font-medium truncate max-w-xl">
                  {currentStatusMessage}
                </span>
              </div>

              {/* Right Performance Stats (Elapsed, ETA, Speed) */}
              <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400 bg-slate-950/70 px-3 py-1.5 rounded-xl border border-slate-800 shrink-0">
                <div>
                  <span className="text-slate-500 mr-1">경과:</span>
                  <strong className="text-white">{elapsedTimeSec.toFixed(1)}s</strong>
                </div>
                <span className="text-slate-700">|</span>
                <div>
                  <span className="text-slate-500 mr-1">남은시간:</span>
                  <strong className="text-amber-300">
                    {isGenerating ? `약 ${estimatedRemainingSec}s` : '0.0s'}
                  </strong>
                </div>
                <span className="text-slate-700">|</span>
                <div>
                  <span className="text-slate-500 mr-1">처리속도:</span>
                  <strong className="text-emerald-400">{processingSpeed} img/s</strong>
                </div>
              </div>
            </div>

            {/* Glowing Striped Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-sky-400" />
                  <span>진행률:</span>
                  <strong className="text-sky-400">{currentIndex} / {batchTargetCount} 장 완료</strong>
                </span>
                <span className="font-bold text-sm text-emerald-400">
                  {generationProgress}%
                </span>
              </div>

              {/* Bar Track */}
              <div className="relative w-full h-3.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-200 relative overflow-hidden ${
                    generationProgress === 100
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/30'
                      : 'bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 shadow-md shadow-sky-500/25'
                  }`}
                  style={{ width: `${generationProgress}%` }}
                >
                  {/* Animated Stripe Effect while processing */}
                  {isGenerating && !isPaused && (
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[size:1rem_1rem] animate-[progress-bar-stripes_1s_linear_infinite]" />
                  )}
                </div>
              </div>
            </div>

            {/* Real-time Currently Processing Plate Preview & Snapshot */}
            {currentActivePlate && (
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 mt-3 animate-in fade-in">
                {/* Plate Preview Images: Original -> Augmented */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="text-center">
                    <span className="text-[10px] font-mono text-slate-400 block mb-1">깨끗한 합성 원본</span>
                    <img
                      src={currentActivePlate.originalUrl}
                      alt="Original Synthetic Plate"
                      className="h-11 w-36 object-contain rounded-lg border border-slate-700 bg-white shadow-xs"
                    />
                  </div>

                  <div className="text-sky-400 font-bold text-xs">
                    ➔
                  </div>

                  <div className="text-center">
                    <span className="text-[10px] font-mono text-sky-400 block mb-1">실시간 광학 왜곡 증강</span>
                    <img
                      src={currentActivePlate.augmentedUrl}
                      alt="Augmented Plate"
                      className="h-11 w-36 object-contain rounded-lg border border-sky-500/50 bg-slate-900 shadow-md ring-2 ring-sky-500/20"
                    />
                  </div>
                </div>

                {/* Plate Meta & OCR Score */}
                <div className="flex items-center gap-4 text-xs font-mono w-full md:w-auto justify-between md:justify-end">
                  <div>
                    <span className="text-slate-400 text-[10px] block">인식 텍스트 (GT)</span>
                    <strong className="text-white text-sm">{currentActivePlate.text}</strong>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] block">가상 OCR 정확도</span>
                    <span className={`font-bold text-sm ${
                      currentActivePlate.ocrConfidence >= 85
                        ? 'text-emerald-400'
                        : currentActivePlate.ocrConfidence >= 65
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}>
                      {currentActivePlate.ocrConfidence}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Generated Batch Gallery & Action Buttons */}
          {generatedItems.length > 0 && (
            <div className="p-5 bg-slate-50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    생성된 합성 번호판 결과 목록 ({generatedItems.length}장)
                  </h4>
                  <span className="text-xs font-mono text-slate-500">
                    평균 OCR 신뢰도: <strong className="text-emerald-600">{avgConfidence}%</strong>
                  </span>
                </div>

                {/* Download Zip Action */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadSyntheticZip}
                    disabled={isExportingZip}
                    className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
                  >
                    {isExportingZip ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>ZIP 압축 중...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>생성 데이터셋 ZIP 다운로드 ({generatedItems.length}장)</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setGeneratedItems([]);
                      setCurrentActivePlate(null);
                      setGenerationProgress(0);
                      setCurrentIndex(0);
                    }}
                    className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
                  >
                    결과 비우기
                  </button>
                </div>
              </div>

              {/* Thumbnails Grid (Responsive 1/2/4 grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto p-1">
                {generatedItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between"
                  >
                    <div className="relative mb-2 bg-slate-900 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center p-1">
                      <img
                        src={item.augmentedUrl}
                        alt={item.text}
                        className="h-10 object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <strong className="text-slate-800 text-[11px] truncate max-w-[130px]">
                        {item.text}
                      </strong>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        item.ocrConfidence >= 85
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {item.ocrConfidence}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Folder/Files Upload Batch Processing Workspace */}
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
