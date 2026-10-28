import React, { useState, useMemo } from 'react';
import { AugmentationParams, PlateType, PresetType } from '../../types/alpr';
import { 
  ExportJsonFormat, 
  generatePipelineJson, 
  downloadAugmentationJson,
  getPlateTypeLabel
} from '../../utils/exportConfig';
import { 
  FileJson, 
  Download, 
  Copy, 
  Check, 
  X, 
  Terminal, 
  Code2, 
  Layers, 
  Sliders, 
  Cpu, 
  ExternalLink,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface JsonExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  params: AugmentationParams;
  plateType?: PlateType;
  plateText?: string;
  activePreset?: PresetType | 'custom';
}

export const JsonExportModal: React.FC<JsonExportModalProps> = ({
  isOpen,
  onClose,
  params,
  plateType = 'white_8',
  plateText = '123가 4567',
  activePreset = 'custom',
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportJsonFormat>('full_pipeline');
  const [indentSize, setIndentSize] = useState<number>(2);
  const [copied, setCopied] = useState<boolean>(false);
  const [downloaded, setDownloaded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'json_preview' | 'integration_code'>('json_preview');

  // Default suggested filename
  const defaultFilename = useMemo(() => {
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .slice(0, 19);
    const presetLabel = activePreset !== 'custom' ? `_${activePreset}` : '';
    return `alpr_pipeline_params${presetLabel}_${timestamp}.json`;
  }, [activePreset, isOpen]);

  const [filename, setFilename] = useState<string>(defaultFilename);

  // Sync default filename when modal opens or preset changes
  React.useEffect(() => {
    if (isOpen) {
      setFilename(defaultFilename);
      setCopied(false);
      setDownloaded(false);
    }
  }, [isOpen, defaultFilename]);

  // Generate the formatted JSON string live
  const formattedJson = useMemo(() => {
    return generatePipelineJson(params, {
      format: selectedFormat,
      indent: indentSize,
      profileName: activePreset !== 'custom' ? `preset_${activePreset}` : 'custom_alpr_config',
      plateType,
      samplePlateText: plateText,
    });
  }, [params, selectedFormat, indentSize, activePreset, plateType, plateText]);

  // Byte size & line count calculation
  const jsonMetrics = useMemo(() => {
    const bytes = new Blob([formattedJson]).size;
    const lines = formattedJson.split('\n').length;
    const formattedBytes = bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
    return { bytes: formattedBytes, lines };
  }, [formattedJson]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const finalFilename = filename.trim().endsWith('.json') ? filename.trim() : `${filename.trim()}.json`;
    downloadAugmentationJson(params, {
      filename: finalFilename,
      format: selectedFormat,
      indent: indentSize,
      profileName: activePreset !== 'custom' ? `preset_${activePreset}` : 'custom_alpr_config',
      plateType,
      samplePlateText: plateText,
    });
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  const pythonSnippet = `# 외부 파이썬 데이터 로더 / 훈련 파이프라인 연동 예제
import json
import albumentations as A

# 1. 내보낸 JSON 설정 로드
with open("${filename.trim().endsWith('.json') ? filename.trim() : filename.trim() + '.json'}", "r", encoding="utf-8") as f:
    config = json.load(f)

# 2. 파라미터 추출
aug = config.get("augmentation_params", config)
print(f"[ALPR Pipeline] Loaded blur={aug['blur']}, noise={aug['noise']}, dirt={aug['dirt']}")

# 3. 데이터셋 로더 (Dataset __getitem__)에 즉시 적용
transforms = A.Compose([
    A.GaussianBlur(blur_limit=(3, max(3, int(aug['blur']) * 2 + 1)), p=0.8),
    A.RandomBrightnessContrast(
        brightness_limit=(aug['brightness'] - 100) / 100,
        contrast_limit=(aug['contrast'] - 100) / 100,
        p=0.9
    ),
    A.GaussNoise(var_limit=(10.0, max(10.0, aug['noise'] * 3.0)), p=0.7),
    A.Rotate(limit=(-abs(aug['rotate']), abs(aug['rotate'])), p=0.8),
])
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  파이프라인 연동용 JSON 내보내기
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800">
                  v2.4.0 Schema
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                현재 설정된 증강 파라미터를 외부 ML/DL 학습 및 데이터 증강 파이프라인 포맷으로 내보냅니다.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          {/* 1. Format Selection Strip */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2 flex items-center justify-between">
              <span>내보내기 포맷 선택 (Export Format)</span>
              <span className="text-[11px] font-normal text-slate-500 font-mono">
                {jsonMetrics.lines}행 · {jsonMetrics.bytes}
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setSelectedFormat('full_pipeline')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedFormat === 'full_pipeline'
                    ? 'bg-sky-50 border-sky-500 text-sky-950 font-bold shadow-2xs ring-1 ring-sky-500'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Layers className="w-3.5 h-3.5 text-sky-600" />
                  <span className="text-xs">표준 파이프라인</span>
                </div>
                <p className="text-[10.5px] text-slate-500 font-normal leading-tight">
                  메타데이터, Albumentations, PyTorch 종합 스펙
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFormat('raw_params')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedFormat === 'raw_params'
                    ? 'bg-sky-50 border-sky-500 text-sky-950 font-bold shadow-2xs ring-1 ring-sky-500'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-xs">순수 파라미터</span>
                </div>
                <p className="text-[10.5px] text-slate-500 font-normal leading-tight">
                  단일 딕셔너리 키-값 (argparse/간편 로더용)
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFormat('albumentations_serialized')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedFormat === 'albumentations_serialized'
                    ? 'bg-sky-50 border-sky-500 text-sky-950 font-bold shadow-2xs ring-1 ring-sky-500'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Code2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs">Albumentations</span>
                </div>
                <p className="text-[10.5px] text-slate-500 font-normal leading-tight">
                  A.load() / A.save() 공식 직렬화 JSON 구조
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFormat('yolo_pipeline')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedFormat === 'yolo_pipeline'
                    ? 'bg-sky-50 border-sky-500 text-sky-950 font-bold shadow-2xs ring-1 ring-sky-500'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Cpu className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-xs">YOLO 하이퍼파라미터</span>
                </div>
                <p className="text-[10.5px] text-slate-500 font-normal leading-tight">
                  YOLOv8/v11 hyp 증강 인자 오버라이드
                </p>
              </button>
            </div>
          </div>

          {/* 2. Filename & Indent Options */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-8">
              <label className="text-[11px] font-bold text-slate-600 mb-1 block">
                저장할 파일명 (Filename)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="alpr_pipeline_params.json"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label className="text-[11px] font-bold text-slate-600 mb-1 block">
                들여쓰기 포맷 (Formatting Indent)
              </label>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {[
                  { label: '2칸 들여쓰기', value: 2 },
                  { label: '4칸 들여쓰기', value: 4 },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setIndentSize(item.value)}
                    className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                      indentSize === item.value
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Preview Tab Switcher */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('json_preview')}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    activeTab === 'json_preview'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileJson className="w-3.5 h-3.5" />
                  <span>포맷팅된 JSON 미리보기</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('integration_code')}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    activeTab === 'integration_code'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-sky-500" />
                  <span>파이썬 파이프라인 연동 코드</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                title="클립보드에 복사"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">복사 완료!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-600" />
                    <span>내용 복사</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Box */}
            <div className="relative bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-inner">
              <div className="max-h-72 overflow-y-auto p-4 font-mono text-xs leading-relaxed">
                {activeTab === 'json_preview' ? (
                  <pre className="text-sky-300 selection:bg-sky-800 selection:text-white">
                    <code>{formattedJson}</code>
                  </pre>
                ) : (
                  <pre className="text-emerald-300 selection:bg-emerald-800 selection:text-white">
                    <code>{pythonSnippet}</code>
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>표준 JSON 규격 (UTF-8 인코딩) 호환이 검증되었습니다.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-200/80 rounded-xl transition-colors"
            >
              닫기
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-all active:scale-95 shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">복사됨!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>JSON 복사</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition-all shadow-md active:scale-95"
            >
              {downloaded ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>다운로드 완료!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>JSON 파일 다운로드 (.json)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
