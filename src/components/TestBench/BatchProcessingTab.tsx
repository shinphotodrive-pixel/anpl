import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AugmentationParams, PlateType } from '../../types/alpr';
import { 
  BatchVariationItem, 
  BATCH_PRESETS, 
  DEFAULT_SAMPLE_PLATE_STRINGS, 
  detectPlateTypeFromText,
  generateSyntheticPlateImage, 
  applyAugmentationToCanvas,
  BatchPresetConfig
} from '../../utils/batchProcessor';
import { simulateOcrInference } from '../../utils/alprSimulator';
import { 
  Upload, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Download, 
  Copy, 
  Check, 
  Trash2, 
  Sparkles, 
  FileText, 
  Layers, 
  Search, 
  Sliders, 
  Eye, 
  Grid, 
  Columns, 
  Dices, 
  X,
  FileSpreadsheet,
  Code,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';

interface BatchProcessingTabProps {
  currentParams: AugmentationParams;
}

export const BatchProcessingTab: React.FC<BatchProcessingTabProps> = ({ currentParams }) => {
  // Input strings state (one per line)
  const [inputText, setInputText] = useState(DEFAULT_SAMPLE_PLATE_STRINGS.join('\n'));
  const [selectedPresetId, setSelectedPresetId] = useState<string>('motion_blur');
  const [selectedPlateType, setSelectedPlateType] = useState<PlateType | 'auto'>('auto');
  const [variationsPerString, setVariationsPerString] = useState<number>(1);
  
  // Results & Processing state
  const [generatedVariations, setGeneratedVariations] = useState<BatchVariationItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copiedScript, setCopiedScript] = useState(false);
  const [selectedModalItem, setSelectedModalItem] = useState<BatchVariationItem | null>(null);

  // Gallery filters & View mode
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'exact' | 'mismatch' | 'failed'>('all');
  const [galleryViewMode, setGalleryViewMode] = useState<'grid' | 'comparison' | 'compact'>('grid');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse lines into clean string array
  const textStrings = useMemo(() => {
    return inputText
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }, [inputText]);

  // Handle file upload (.txt, .csv, .json)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (file.name.endsWith('.json')) {
        try {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            const strings = parsed.map(item => typeof item === 'string' ? item : item.text || item.plate || item.groundTruth).filter(Boolean);
            setInputText(strings.join('\n'));
          }
        } catch {
          setInputText(content);
        }
      } else if (file.name.endsWith('.csv')) {
        const lines = content.split('\n').map(line => {
          const firstCol = line.split(',')[0]?.trim();
          return firstCol.replace(/^["']|["']$/g, '');
        }).filter(Boolean);
        setInputText(lines.join('\n'));
      } else {
        setInputText(content);
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Generate batch variations automatically
  const handleGenerateVariations = async () => {
    if (textStrings.length === 0) return;
    setIsProcessing(true);
    setProgress(0);

    // Get preset configuration
    let basePreset: BatchPresetConfig;
    if (selectedPresetId === 'current') {
      basePreset = {
        id: 'current',
        name: '현재 시뮬레이터 파라미터',
        category: '실시간',
        description: '시뮬레이터에서 설정된 현재 파라미터 조합',
        color: 'text-sky-400',
        badgeBg: 'bg-sky-950/70 text-sky-300 border-sky-800',
        params: currentParams,
      };
    } else {
      const found = BATCH_PRESETS.find(p => p.id === selectedPresetId);
      basePreset = found || BATCH_PRESETS[1]; // default motion blur
    }

    const totalTasks = textStrings.length * variationsPerString;
    let completedTasks = 0;
    const newItems: BatchVariationItem[] = [];

    for (let strIdx = 0; strIdx < textStrings.length; strIdx++) {
      const rawText = textStrings[strIdx];
      const pType: PlateType = selectedPlateType === 'auto' 
        ? detectPlateTypeFromText(rawText) 
        : selectedPlateType;

      // Generate base clean image
      const cleanImageUrl = generateSyntheticPlateImage(rawText, pType);

      for (let varIdx = 0; varIdx < variationsPerString; varIdx++) {
        // Compute parameters for this variation
        let varParams = { ...basePreset.params };
        let varLabel = basePreset.name;

        // If multiple variations requested, add progressive intensity
        if (variationsPerString > 1) {
          if (varIdx === 0) {
            // Variation 1: Moderate intensity (70%)
            varParams = {
              ...varParams,
              blur: Math.round(varParams.blur * 0.7),
              noise: Math.round(varParams.noise * 0.7),
              rain: Math.round(varParams.rain * 0.7),
              dirt: Math.round(varParams.dirt * 0.7),
              glare: Math.round(varParams.glare * 0.7),
            };
            varLabel = `${basePreset.name} (보통 왜곡)`;
          } else if (varIdx === 1) {
            // Variation 2: Strong / severe intensity (120%)
            varParams = {
              ...varParams,
              blur: Math.min(15, Math.round(varParams.blur * 1.3)),
              noise: Math.min(100, Math.round(varParams.noise * 1.3)),
              rain: Math.min(100, Math.round(varParams.rain * 1.3)),
              dirt: Math.min(100, Math.round(varParams.dirt * 1.3)),
              glare: Math.min(100, Math.round(varParams.glare * 1.3)),
            };
            varLabel = `${basePreset.name} (극심 왜곡)`;
          } else {
            // Variation 3: Combined stochastic angle
            varParams = {
              ...varParams,
              rotate: (varIdx % 2 === 0 ? 1 : -1) * 14,
              perspectiveX: 20,
            };
            varLabel = `${basePreset.name} (사각 복합)`;
          }
        }

        // Apply canvas transformation
        const augmentedDataUrl = await applyAugmentationToCanvas(cleanImageUrl, varParams);

        // Run simulated OCR inference
        const ocr = simulateOcrInference(rawText, pType, varParams);

        newItems.push({
          id: `var_${Date.now()}_${strIdx}_${varIdx}`,
          originalText: rawText,
          variationIndex: varIdx + 1,
          presetId: basePreset.id,
          presetName: varLabel,
          plateType: pType,
          originalUrl: cleanImageUrl,
          augmentedUrl: augmentedDataUrl,
          params: varParams,
          status: 'completed',
          ocrResult: {
            detected: ocr.detected,
            predictedText: ocr.predictedText,
            confidence: ocr.overallConfidence,
            latencyMs: ocr.latencyMs,
            mismatchCount: ocr.charBreakdown.filter(c => c.isMismatch).length,
            charBreakdown: ocr.charBreakdown,
          },
        });

        completedTasks++;
        setProgress(Math.round((completedTasks / totalTasks) * 100));
        // Small interval to let UI update smoothly
        if (completedTasks % 2 === 0) {
          await new Promise(r => setTimeout(r, 40));
        }
      }
    }

    setGeneratedVariations(newItems);
    setIsProcessing(false);
  };

  // Auto-run generation on first render if empty
  useEffect(() => {
    if (generatedVariations.length === 0) {
      handleGenerateVariations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtered gallery items
  const filteredVariations = useMemo(() => {
    return generatedVariations.filter(item => {
      // Search text filter
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesText = item.originalText.toLowerCase().includes(q) ||
          (item.ocrResult?.predictedText.toLowerCase().includes(q));
        if (!matchesText) return false;
      }

      // Status filter
      if (statusFilter === 'exact') {
        return item.ocrResult?.detected && item.ocrResult?.mismatchCount === 0;
      }
      if (statusFilter === 'mismatch') {
        return item.ocrResult?.detected && (item.ocrResult?.mismatchCount || 0) > 0;
      }
      if (statusFilter === 'failed') {
        return !item.ocrResult?.detected;
      }

      return true;
    });
  }, [generatedVariations, searchQuery, statusFilter]);

  // Gallery Statistics
  const totalCount = generatedVariations.length;
  const exactMatchCount = generatedVariations.filter(
    v => v.ocrResult?.detected && v.ocrResult?.mismatchCount === 0
  ).length;
  const exactMatchRate = totalCount > 0 ? ((exactMatchCount / totalCount) * 100).toFixed(1) : '0';
  const avgConfidence = totalCount > 0 
    ? Math.round(generatedVariations.reduce((acc, v) => acc + (v.ocrResult?.confidence || 0), 0) / totalCount)
    : 0;
  const avgLatency = totalCount > 0
    ? (generatedVariations.reduce((acc, v) => acc + (v.ocrResult?.latencyMs || 0), 0) / totalCount).toFixed(1)
    : '0';

  // Export JSON Dataset Manifest
  const handleExportJson = () => {
    const manifest = {
      generator: 'ALPR Data-Hub Batch Processor',
      generatedAt: new Date().toISOString(),
      presetUsed: selectedPresetId,
      totalVariations: generatedVariations.length,
      items: generatedVariations.map(item => ({
        id: item.id,
        groundTruth: item.originalText,
        plateType: item.plateType,
        presetName: item.presetName,
        augmentationParams: item.params,
        ocrResult: {
          detected: item.ocrResult?.detected,
          predictedText: item.ocrResult?.predictedText,
          confidence: item.ocrResult?.confidence,
          mismatchCount: item.ocrResult?.mismatchCount,
          latencyMs: item.ocrResult?.latencyMs,
        },
      })),
    };

    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alpr_batch_variations_${selectedPresetId}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export CSV Report
  const handleExportCsv = () => {
    const headers = ['ID', 'GroundTruth', 'PlateType', 'Preset', 'Predicted', 'Detected', 'Confidence(%)', 'Mismatches', 'Latency(ms)'];
    const rows = generatedVariations.map(item => [
      item.id,
      `"${item.originalText}"`,
      item.plateType,
      `"${item.presetName}"`,
      `"${item.ocrResult?.predictedText || ''}"`,
      item.ocrResult?.detected ? 'TRUE' : 'FALSE',
      item.ocrResult?.confidence || 0,
      item.ocrResult?.mismatchCount || 0,
      item.ocrResult?.latencyMs || 0,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alpr_batch_report_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy Python batch code
  const handleCopyPythonScript = () => {
    const selectedPresetObj = BATCH_PRESETS.find(p => p.id === selectedPresetId);
    const paramsToUse = selectedPresetId === 'current' ? currentParams : (selectedPresetObj?.params || currentParams);

    const pyScript = `# ALPR Batch Processor Generated Pipeline
import os
import cv2
import albumentations as A

# 선택된 프리셋(${selectedPresetId}) 파라미터 기반 Compose
batch_transform = A.Compose([
    ${paramsToUse.blur > 0 ? `A.MotionBlur(blur_limit=(${Math.max(3, paramsToUse.blur)}, ${paramsToUse.blur + 4}), p=0.9),` : ''}
    ${paramsToUse.brightness !== 100 || paramsToUse.contrast !== 100 ? `A.RandomBrightnessContrast(brightness_limit=(${((paramsToUse.brightness - 100)/100).toFixed(2)}, ${((paramsToUse.brightness - 100)/100).toFixed(2)}), contrast_limit=(${((paramsToUse.contrast - 100)/100).toFixed(2)}, ${((paramsToUse.contrast - 100)/100).toFixed(2)}), p=0.95),` : ''}
    ${paramsToUse.noise > 0 ? `A.GaussNoise(var_limit=(10.0, ${(paramsToUse.noise * 0.7).toFixed(1)}), p=0.85),` : ''}
    ${paramsToUse.rotate !== 0 ? `A.Rotate(limit=(${paramsToUse.rotate}, ${paramsToUse.rotate}), border_mode=cv2.BORDER_CONSTANT, p=0.9),` : ''}
    ${paramsToUse.rain > 0 ? `A.RandomRain(drop_length=15, p=0.7),` : ''}
    ${paramsToUse.dirt > 0 ? `A.CoarseDropout(num_holes_range=(3, 7), hole_height_range=(10, 25), hole_width_range=(10, 25), fill=0, p=0.8),` : ''}
    ${paramsToUse.glare > 0 ? `A.RandomSunFlare(flare_roi=(0, 0, 1, 0.4), num_flare_circles_range=(6, 10), p=0.85),` : ''}
])

plate_strings = ${JSON.stringify(textStrings, null, 2)}
print(f"총 {len(plate_strings)}개 문자열에 대한 증강 변형 생성 준비 완료")
`;

    navigator.clipboard.writeText(pyScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  // Download single image
  const handleDownloadSingleImage = (item: BatchVariationItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = item.augmentedUrl;
    a.download = `aug_${item.originalText.replace(/\s+/g, '_')}_${item.presetId}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Section: Batch Processor Header */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <Layers className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>텍스트 배치 프로세서 (Batch Processor: Text-to-Variations)</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-bold">
                  NEW
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              차량 번호판 텍스트 문자열 목록을 업로드하거나 입력하고, 환경 프리셋을 지정하여 
              <strong>다중 합성 번호판 영상 변형</strong>을 일괄 자동 생성합니다. 
              생성된 결과는 아래 스크롤 프리뷰 갤러리에서 실시간 AI OCR 판독률과 함께 확인할 수 있습니다.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.csv,.json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all active:scale-95 shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-sky-400" />
              <span>텍스트 파일 업로드 (.txt/.csv)</span>
            </button>

            <button
              onClick={() => setInputText(DEFAULT_SAMPLE_PLATE_STRINGS.join('\n'))}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all active:scale-95 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>샘플 10종 리셋</span>
            </button>

            <button
              onClick={() => {
                const randomChars = ['가', '나', '다', '라', '마', '거', '너', '더', '러', '머', '고', '노', '도', '로', '모', '구', '누', '두', '루', '무', '바', '사', '아', '자', '배', '하', '허', '호'];
                const generated = Array.from({ length: 8 }, () => {
                  const front = Math.floor(Math.random() * 900) + 100;
                  const char = randomChars[Math.floor(Math.random() * randomChars.length)];
                  const back = Math.floor(Math.random() * 9000) + 1000;
                  return `${front}${char} ${back}`;
                });
                setInputText(prev => `${prev}\n${generated.join('\n')}`);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all active:scale-95 shadow-2xs"
            >
              <Dices className="w-3.5 h-3.5 text-purple-400" />
              <span>+랜덤 8개 추가</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Control Matrix: Text Input Area & Preset Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Text Strings Input Area */}
        <div className="lg:col-span-5 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-400" />
              <span>1. 처리 대상 번호판 문자열 목록</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/60 font-bold">
                총 {textStrings.length}개 문자열
              </span>
              {textStrings.length > 0 && (
                <button
                  onClick={() => setInputText('')}
                  title="전체 비우기"
                  className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="한 줄에 하나의 번호판 문자열을 입력하세요. 예: 123가 4567"
              rows={9}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 tracking-wider leading-relaxed resize-none shadow-inner"
            />
            <span className="absolute bottom-2.5 right-3 text-[10px] text-slate-500 font-mono">
              줄바꿈(Enter)으로 구분
            </span>
          </div>

          {/* Quick info note */}
          <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>💡 .txt, .csv 파일 드래그 또는 상단 업로드 가능</span>
            <span className="text-slate-500">KOR / EV / 영업용 자동지원</span>
          </div>
        </div>

        {/* Right Column: Preset Selection & Generation Options */}
        <div className="lg:col-span-7 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-400" />
              <span>2. 증강 환경 프리셋 및 옵션 선택</span>
            </label>
            <span className="text-[11px] text-slate-400 font-mono">
              선택된 프리셋: <strong className="text-white">{BATCH_PRESETS.find(p => p.id === selectedPresetId)?.name || '현재 시뮬레이터'}</strong>
            </span>
          </div>

          {/* Preset Cards Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {/* Dynamic current params card */}
            <button
              onClick={() => setSelectedPresetId('current')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                selectedPresetId === 'current'
                  ? 'bg-sky-500/20 border-sky-400 text-white shadow-md ring-1 ring-sky-400/50'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-sky-300">현재 시뮬레이터 조합</span>
                <span className="text-[10px] font-mono px-1 bg-sky-950 text-sky-400 rounded">LIVE</span>
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-1">
                상단 시뮬레이터 실시간 튜닝값
              </p>
            </button>

            {/* Standard preset cards */}
            {BATCH_PRESETS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPresetId(preset.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-sky-500/20 border-sky-400 text-white shadow-md ring-1 ring-sky-400/50'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold ${preset.color}`}>{preset.name.split(' (')[0]}</span>
                    <span className="text-[9px] font-mono px-1 py-0.2 bg-slate-900 text-slate-400 rounded">
                      {preset.category}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-1">
                    {preset.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Secondary Options: Plate Type & Variations Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                번호판 양식 포맷
              </label>
              <select
                value={selectedPlateType}
                onChange={(e) => setSelectedPlateType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="auto">자동 감지 (문자열 기반 최적 양식 판별)</option>
                <option value="white_8">8자리 필름 (KOR 홀로그램)</option>
                <option value="white_7">7자리 일반 (백색 천공)</option>
                <option value="ev_blue">친환경 전기차 EV (청색 그라데이션)</option>
                <option value="yellow_commercial">영업용 번호판 (황색 택시/화물)</option>
                <option value="green_retro">구형 녹색 번호판</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                문자열당 변형 강도 단계
              </label>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { count: 1, label: '1개 (단일)' },
                  { count: 2, label: '2개 (중간/극한)' },
                  { count: 3, label: '3개 (복합 단계)' },
                ].map(opt => (
                  <button
                    key={opt.count}
                    type="button"
                    onClick={() => setVariationsPerString(opt.count)}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-all text-center ${
                      variationsPerString === opt.count
                        ? 'bg-sky-500/25 border-sky-400 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="pt-2">
            <button
              onClick={handleGenerateVariations}
              disabled={isProcessing || textStrings.length === 0}
              className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-sky-500/20 transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>배치 변형 자동 생성 중 ({progress}%)...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
                  <span>
                    총 {textStrings.length * variationsPerString}개 합성 번호판 변형 자동 생성 시작
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar during generation */}
      {isProcessing && (
        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 h-2.5 transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* 3. Summary Statistics Bar */}
      {generatedVariations.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 text-center">
            <span className="text-[11px] text-slate-400 block mb-0.5">총 생성된 변형 영상</span>
            <span className="text-xl font-black font-mono text-white">
              {totalCount} <span className="text-xs font-normal text-slate-400">장</span>
            </span>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 text-center">
            <span className="text-[11px] text-slate-400 block mb-0.5">완전 일치 판독률 (Exact Match)</span>
            <span className={`text-xl font-black font-mono ${
              Number(exactMatchRate) >= 80 ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {exactMatchRate}%
            </span>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 text-center">
            <span className="text-[11px] text-slate-400 block mb-0.5">평균 모델 확신도 (Softmax)</span>
            <span className="text-xl font-black font-mono text-sky-400">
              {avgConfidence}%
            </span>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 text-center">
            <span className="text-[11px] text-slate-400 block mb-0.5">평균 단일 추론 지연</span>
            <span className="text-xl font-black font-mono text-indigo-400">
              {avgLatency} <span className="text-xs font-normal text-slate-400">ms</span>
            </span>
          </div>
        </div>
      )}

      {/* 4. SCROLLABLE PREVIEW GALLERY */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col gap-4">
        {/* Gallery Header Bar: Title, Search, Filter Buttons, View Modes, and Export Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-slate-800 gap-4">
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-sky-400" />
              <span>스크롤 프리뷰 갤러리 (Scrollable Preview Gallery)</span>
              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {filteredVariations.length} / {totalCount}개
              </span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              생성된 각 변형 영상의 시각적 품질과 AI 모델 인식 결과(오독 문자 마커)를 스크롤하여 탐색하세요.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="번호 검색..."
                className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 w-32 sm:w-40"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2 py-1 text-[11px] font-semibold rounded transition-all ${
                  statusFilter === 'all' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setStatusFilter('exact')}
                className={`px-2 py-1 text-[11px] font-semibold rounded transition-all ${
                  statusFilter === 'exact' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-emerald-400'
                }`}
              >
                일치
              </button>
              <button
                onClick={() => setStatusFilter('mismatch')}
                className={`px-2 py-1 text-[11px] font-semibold rounded transition-all ${
                  statusFilter === 'mismatch' ? 'bg-rose-500 text-white font-bold' : 'text-slate-400 hover:text-rose-400'
                }`}
              >
                오독
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
              <button
                onClick={() => setGalleryViewMode('grid')}
                className={`p-1.5 rounded transition-all ${
                  galleryViewMode === 'grid' ? 'bg-slate-800 text-sky-400' : 'text-slate-500 hover:text-white'
                }`}
                title="카드 그리드 뷰"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setGalleryViewMode('comparison')}
                className={`p-1.5 rounded transition-all ${
                  galleryViewMode === 'comparison' ? 'bg-slate-800 text-sky-400' : 'text-slate-500 hover:text-white'
                }`}
                title="원본 vs 변형 나란히 뷰"
              >
                <Columns className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Export Actions */}
            <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
              <button
                onClick={handleExportJson}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-sky-300 border border-slate-800 rounded-lg text-xs font-semibold transition-all active:scale-95"
                title="JSON 데이터셋 매니페스트 다운로드"
              >
                <Download className="w-3 h-3 text-sky-400" />
                <span className="hidden sm:inline">JSON</span>
              </button>

              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-800 rounded-lg text-xs font-semibold transition-all active:scale-95"
                title="CSV 판독 리포트 다운로드"
              >
                <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
                <span className="hidden sm:inline">CSV</span>
              </button>

              <button
                onClick={handleCopyPythonScript}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-purple-300 border border-slate-800 rounded-lg text-xs font-semibold transition-all active:scale-95"
                title="파이썬 Albumentations 스크립트 복사"
              >
                {copiedScript ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Code className="w-3 h-3 text-purple-400" />
                )}
                <span className="hidden sm:inline">파이썬 코드</span>
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Gallery Container with Custom Scrollbar */}
        <div className="max-h-[640px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredVariations.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/40">
              <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-300">표시할 변형 영상이 없습니다.</p>
              <p className="text-xs text-slate-500 mt-1">
                검색어나 필터를 변경하거나 상단의 '배치 변형 자동 생성' 버튼을 클릭하세요.
              </p>
            </div>
          ) : galleryViewMode === 'grid' ? (
            /* GRID VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVariations.map((item, idx) => {
                const isExact = item.ocrResult?.detected && item.ocrResult?.mismatchCount === 0;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedModalItem(item)}
                    className="group bg-slate-900/90 rounded-xl border border-slate-800 hover:border-slate-700 p-3.5 transition-all hover:shadow-lg cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Top: Number, Preset Badge & Plate Type */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold text-slate-500">
                            #{idx + 1}
                          </span>
                          <span className="text-[10px] font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/60 truncate max-w-[130px]">
                            {item.presetName}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                          {item.plateType}
                        </span>
                      </div>

                      {/* Augmented Image Preview */}
                      <div className="relative aspect-[44/12] w-full rounded-lg overflow-hidden bg-slate-950 border border-slate-800 mb-3 group-hover:border-slate-600 transition-colors">
                        <img
                          src={item.augmentedUrl}
                          alt={item.originalText}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
                        <span className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-400 bg-slate-950/80 px-1 rounded">
                          {item.ocrResult?.latencyMs}ms
                        </span>
                      </div>

                      {/* Recognition Outcome & Ground Truth */}
                      <div className="space-y-1.5 mb-3">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-400 text-[11px]">정답:</span>
                          <strong className="text-white font-bold">{item.originalText}</strong>
                        </div>

                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-400 text-[11px]">예측:</span>
                          <span className={`font-bold ${isExact ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {item.ocrResult?.detected ? item.ocrResult?.predictedText : '검출 실패'}
                          </span>
                        </div>
                      </div>

                      {/* Character Breakdown Chips */}
                      {item.ocrResult?.charBreakdown && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {item.ocrResult.charBreakdown.map((ch, cIdx) => {
                            if (ch.expected === ' ') return null;
                            return (
                              <span
                                key={cIdx}
                                className={`text-[9px] font-mono px-1 py-0.5 rounded border leading-none ${
                                  ch.isMismatch
                                    ? 'bg-rose-950 border-rose-500 text-rose-300 font-bold'
                                    : 'bg-slate-950 border-slate-800 text-slate-300'
                                }`}
                              >
                                {ch.predicted}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Card Footer: Status Badge & Quick Actions */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      {isExact ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>일치 ({item.ocrResult?.confidence}%)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-950/60 border border-rose-800/80 px-2 py-0.5 rounded">
                          <AlertTriangle className="w-3 h-3" />
                          <span>오독 {item.ocrResult?.mismatchCount}자 ({item.ocrResult?.confidence}%)</span>
                        </span>
                      )}

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleDownloadSingleImage(item, e)}
                          title="이미지 다운로드"
                          className="p-1 text-slate-400 hover:text-sky-400 rounded hover:bg-slate-800 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(item.originalText);
                          }}
                          title="문자열 복사"
                          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* COMPARISON VIEW (Side by Side: Clean vs Augmented) */
            <div className="space-y-3">
              {filteredVariations.map((item, idx) => {
                const isExact = item.ocrResult?.detected && item.ocrResult?.mismatchCount === 0;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedModalItem(item)}
                    className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-slate-500">#{idx + 1}</span>
                      {/* Clean Original Plate */}
                      <div className="w-40 sm:w-48 aspect-[44/12] rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex-shrink-0">
                        <img src={item.originalUrl} alt="원본" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-slate-600 font-bold hidden sm:inline">➔</span>
                      {/* Augmented Plate */}
                      <div className="w-40 sm:w-48 aspect-[44/12] rounded-lg overflow-hidden border border-slate-700 bg-slate-950 flex-shrink-0">
                        <img src={item.augmentedUrl} alt="증강본" className="w-full h-full object-cover" />
                      </div>
                    </div>

                    <div className="flex-1 md:px-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-sky-400">{item.presetName}</span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded">
                          {item.plateType}
                        </span>
                      </div>
                      <div className="text-xs font-mono">
                        <span className="text-slate-400">정답: </span>
                        <strong className="text-white">{item.originalText}</strong>
                        <span className="text-slate-400 ml-3">예측: </span>
                        <strong className={isExact ? 'text-emerald-400' : 'text-rose-400'}>
                          {item.ocrResult?.detected ? item.ocrResult.predictedText : '미검출'}
                        </strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {isExact ? (
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>100% 일치</span>
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          <span>오독 {item.ocrResult?.mismatchCount}자</span>
                        </span>
                      )}

                      <button
                        onClick={(e) => handleDownloadSingleImage(item, e)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 5. Fullscreen Detailed Inspection Modal */}
      {selectedModalItem && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedModalItem(null)}
          />
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 z-10 space-y-5 animate-in fade-in-50 zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">
                  합성 번호판 변형 정밀 진단 (High-Res Inspection)
                </h3>
              </div>
              <button
                onClick={() => setSelectedModalItem(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Side by Side Large Images */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-1.5">
                  1. 표준 원본 (Clean Baseline)
                </span>
                <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-[44/12]">
                  <img src={selectedModalItem.originalUrl} alt="원본" className="w-full h-full object-cover" />
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-sky-400 block mb-1.5 flex items-center justify-between">
                  <span>2. {selectedModalItem.presetName}</span>
                  <span className="text-[10px] font-mono text-slate-400">지연: {selectedModalItem.ocrResult?.latencyMs}ms</span>
                </span>
                <div className="rounded-xl overflow-hidden border border-sky-800 bg-slate-950 aspect-[44/12]">
                  <img src={selectedModalItem.augmentedUrl} alt="증강본" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Inference Outcome Detail */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">정답 문자열: <strong className="text-white text-sm font-mono">{selectedModalItem.originalText}</strong></span>
                <span className="text-slate-400">모델 판독: <strong className="text-sky-300 text-sm font-mono">{selectedModalItem.ocrResult?.predictedText}</strong></span>
                <span className="text-slate-400">확신도: <strong className="text-emerald-400 text-sm font-mono">{selectedModalItem.ocrResult?.confidence}%</strong></span>
              </div>

              {/* Character by character analysis */}
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block mb-2">
                  개별 문자별 Softmax 확신도 및 일치 여부:
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedModalItem.ocrResult?.charBreakdown.map((ch, idx) => {
                    if (ch.expected === ' ') return null;
                    return (
                      <div
                        key={idx}
                        className={`px-3 py-1.5 rounded-lg border text-center font-mono ${
                          ch.isMismatch
                            ? 'bg-rose-950 border-rose-500 text-rose-300'
                            : 'bg-slate-900 border-slate-700 text-white'
                        }`}
                      >
                        <div className="text-base font-black">{ch.predicted}</div>
                        <div className="text-[9px] opacity-80">{ch.confidence}%</div>
                        {ch.isMismatch && (
                          <div className="text-[8px] text-rose-400 font-bold mt-0.5">정답: {ch.expected}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Applied Parameters readout */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80">
              <span className="text-[11px] text-slate-400 font-semibold block mb-1">
                적용된 증강 변환 파라미터:
              </span>
              <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                {Object.entries(selectedModalItem.params).map(([key, val]) => (
                  <span key={key} className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-300 rounded">
                    {key}: {val}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                onClick={(e) => handleDownloadSingleImage(selectedModalItem, e)}
                className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>합성 번호판 이미지 다운로드</span>
              </button>

              <button
                onClick={() => setSelectedModalItem(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-all"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
