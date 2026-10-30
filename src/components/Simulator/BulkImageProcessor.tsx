import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AugmentationParams, PlateType } from '../../types/alpr';
import { 
  applyAugmentationToCanvas, 
  generateSyntheticPlateImage, 
  detectPlateTypeFromText 
} from '../../utils/batchProcessor';
import { simulateOcrInference } from '../../utils/alprSimulator';
import { 
  exportDatasetToZip, 
  saveDatasetRecord, 
  getSavedDatasets, 
  deleteDatasetRecord, 
  ProcessedDatasetImage, 
  SavedDatasetRecord 
} from '../../utils/datasetStorage';
import { 
  Upload, 
  FolderUp, 
  FileArchive, 
  Play, 
  Check, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Trash2, 
  Sparkles, 
  Layers, 
  Grid, 
  Columns, 
  Table, 
  FolderHeart, 
  RefreshCw, 
  Eye, 
  Info, 
  Sliders, 
  FileText, 
  Image as ImageIcon,
  X,
  FileCheck2,
  Clock,
  ArrowRight,
  FolderArchive
} from 'lucide-react';

interface BulkImageProcessorProps {
  currentParams: AugmentationParams;
  onClose?: () => void;
  isModal?: boolean;
}

interface UploadedRawFile {
  id: string;
  file?: File;
  filename: string;
  sizeStr: string;
  previewUrl: string;
  width: number;
  height: number;
  inferredText?: string;
  inferredType?: PlateType;
}

// Built-in sample plate bundle for instant testing
const SAMPLE_FOLDER_FILES = [
  { name: 'car_01_123가4567.jpg', text: '123가 4567', type: 'white_8' as PlateType },
  { name: 'car_02_58조8912.jpg', text: '58조 8912', type: 'white_7' as PlateType },
  { name: 'ev_03_09다8765.jpg', text: 'EV 09다 8765', type: 'ev_blue' as PlateType },
  { name: 'taxi_04_31바1234.jpg', text: '서울 31 바 1234', type: 'yellow_commercial' as PlateType },
  { name: 'truck_05_72사5543.jpg', text: '경기 72 사 5543', type: 'yellow_commercial' as PlateType },
  { name: 'retro_06_41너6520.jpg', text: '41너 6520', type: 'green_retro' as PlateType },
  { name: 'rental_07_365하8899.jpg', text: '365하 8899', type: 'white_8' as PlateType },
  { name: 'fcev_08_77루2468.jpg', text: 'EV 77루 2468', type: 'ev_blue' as PlateType },
];

export const BulkImageProcessor: React.FC<BulkImageProcessorProps> = ({
  currentParams,
  onClose,
  isModal = false,
}) => {
  const [rawFiles, setRawFiles] = useState<UploadedRawFile[]>([]);
  const [processedImages, setProcessedImages] = useState<ProcessedDatasetImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [currentProcessingName, setCurrentProcessingName] = useState<string>('');
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [datasetName, setDatasetName] = useState(() => `ALPR_Dataset_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Gallery view and filters
  const [viewMode, setViewMode] = useState<'grid' | 'comparison' | 'table'>('comparison');
  const [activeTab, setActiveTab] = useState<'processor' | 'saved_datasets'>('processor');
  const [savedDatasets, setSavedDatasets] = useState<SavedDatasetRecord[]>(() => getSavedDatasets());

  const folderInputRef = useRef<HTMLInputElement>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);

  // Helper to format file size
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Load sample folder bundle on demand
  const handleLoadSampleFolder = () => {
    const samples: UploadedRawFile[] = SAMPLE_FOLDER_FILES.map((sample, idx) => {
      const dataUrl = generateSyntheticPlateImage(sample.text, sample.type);
      return {
        id: `sample_${idx}_${Date.now()}`,
        filename: sample.name,
        sizeStr: '42.8 KB',
        previewUrl: dataUrl,
        width: 440,
        height: 120,
        inferredText: sample.text,
        inferredType: sample.type,
      };
    });
    setRawFiles(samples);
    setProcessedImages([]);
    setProcessProgress(0);
  };

  // Handle uploaded files (either folder or multiple files)
  const handleFilesAdded = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const validFiles = Array.from(fileList).filter(file => file.type.startsWith('image/'));
    if (validFiles.length === 0) return;

    const newRawFiles: UploadedRawFile[] = [];

    for (const file of validFiles) {
      const url = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      // Get dimensions
      const { width, height } = await new Promise<{ width: number; height: number }>((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.src = url;
      });

      // Try inferring text from filename if possible
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      const inferredType = detectPlateTypeFromText(nameWithoutExt);

      newRawFiles.push({
        id: `raw_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        file,
        filename: file.name,
        sizeStr: formatBytes(file.size),
        previewUrl: url,
        width,
        height,
        inferredText: nameWithoutExt,
        inferredType,
      });
    }

    setRawFiles(prev => [...prev, ...newRawFiles]);
    setProcessedImages([]);
  };

  // Run Bulk Augmentation on all uploaded images using active AugmentationParams
  const handleRunBulkAugmentation = async () => {
    if (rawFiles.length === 0) return;

    setIsProcessing(true);
    setProcessProgress(0);
    const results: ProcessedDatasetImage[] = [];

    for (let i = 0; i < rawFiles.length; i++) {
      const raw = rawFiles[i];
      setCurrentProcessingName(raw.filename);
      // Simulated processing delay per image
      await new Promise((r) => setTimeout(r, 220));

      try {
        // 1. Apply active AugmentationParams using Canvas
        const augmentedUrl = await applyAugmentationToCanvas(raw.previewUrl, currentParams);

        // 2. Perform Simulated OCR Inference
        const textToEvaluate = raw.inferredText || '123가 4567';
        const typeToEvaluate = raw.inferredType || 'white_8';
        const ocr = simulateOcrInference(textToEvaluate, typeToEvaluate, currentParams);

        results.push({
          id: `proc_${raw.id}`,
          filename: raw.filename,
          originalUrl: raw.previewUrl,
          augmentedUrl,
          originalSize: raw.sizeStr,
          width: raw.width,
          height: raw.height,
          status: 'completed',
          ocrResult: {
            detected: ocr.detected,
            predictedText: ocr.predictedText,
            confidence: ocr.overallConfidence,
            latencyMs: ocr.latencyMs,
          },
        });
      } catch (err) {
        console.error('Failed to augment image', raw.filename, err);
        results.push({
          id: `proc_${raw.id}`,
          filename: raw.filename,
          originalUrl: raw.previewUrl,
          augmentedUrl: raw.previewUrl,
          originalSize: raw.sizeStr,
          width: raw.width,
          height: raw.height,
          status: 'error',
        });
      }

      setProcessProgress(Math.round(((i + 1) / rawFiles.length) * 100));
    }

    setProcessedImages(results);
    setIsProcessing(false);
  };

  // Download entire dataset as a clean ZIP package
  const handleExportZip = async () => {
    if (processedImages.length === 0) return;
    try {
      setIsExporting(true);
      setExportProgress(10);
      const blob = await exportDatasetToZip(
        datasetName,
        processedImages,
        currentParams,
        (p) => setExportProgress(p)
      );

      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${datasetName || 'alpr_dataset'}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      // Auto record into saved dataset history
      handleSaveDatasetToStorage();
    } catch (err) {
      console.error('Failed to export dataset zip', err);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  // Save dataset record to localStorage
  const handleSaveDatasetToStorage = () => {
    if (processedImages.length === 0) return;

    const avgConfidence = Math.round(
      processedImages.reduce((sum, item) => sum + (item.ocrResult?.confidence || 0), 0) /
      (processedImages.length || 1)
    );

    const record: SavedDatasetRecord = {
      id: `ds_${Date.now()}`,
      name: datasetName.trim() || 'ALPR Custom Dataset',
      createdAt: new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      imageCount: processedImages.length,
      params: { ...currentParams },
      totalSizeMb: (processedImages.length * 0.12).toFixed(1),
      avgConfidence,
      sampleThumbnails: processedImages.slice(0, 4).map(p => p.augmentedUrl),
    };

    const updated = saveDatasetRecord(record);
    setSavedDatasets(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDeleteSavedDataset = (id: string) => {
    const updated = deleteDatasetRecord(id);
    setSavedDatasets(updated);
  };

  // Quick download for individual augmented image
  const handleDownloadSingleImage = (img: ProcessedDatasetImage) => {
    const a = document.createElement('a');
    a.href = img.augmentedUrl;
    a.download = img.filename.replace(/\.[^/.]+$/, '') + '_aug.jpg';
    a.click();
  };

  // Active parameters diff tags
  const activeParamPills = useMemo(() => {
    const list: string[] = [];
    if (currentParams.blur > 0) list.push(`블러 ${currentParams.blur}px`);
    if (currentParams.brightness !== 100) list.push(`밝기 ${currentParams.brightness}%`);
    if (currentParams.contrast !== 100) list.push(`대비 ${currentParams.contrast}%`);
    if (currentParams.noise > 0) list.push(`노이즈 ${currentParams.noise}%`);
    if (currentParams.rain > 0) list.push(`강우 ${currentParams.rain}%`);
    if (currentParams.fog > 0) list.push(`안개 ${currentParams.fog}%`);
    if (currentParams.dirt > 0) list.push(`오염 ${currentParams.dirt}%`);
    if (currentParams.glare > 0) list.push(`역광 ${currentParams.glare}%`);
    if (currentParams.rotate !== 0 || currentParams.perspectiveX !== 0) list.push(`각도/원근`);
    return list;
  }, [currentParams]);

  // Statistics
  const successCount = processedImages.filter(p => p.ocrResult?.detected).length;
  const avgConfidence = processedImages.length > 0
    ? Math.round(processedImages.reduce((sum, p) => sum + (p.ocrResult?.confidence || 0), 0) / processedImages.length)
    : 0;

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${isModal ? 'max-w-6xl w-full' : ''}`}>
      {/* Top Header */}
      <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/70">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
              <FolderArchive className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>폴더 일괄 증강 & 새 데이터셋 생성기 (Bulk Dataset Creator)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-sky-100 text-sky-800 rounded-md font-bold">
                  Client-side Pipeline
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                로컬 이미지 폴더를 업로드하여 현재 시뮬레이터에 활성화된 8대 광학 파라미터를 일괄 적용하고 새 데이터셋(.zip)으로 다운로드합니다.
              </p>
            </div>
          </div>
        </div>

        {/* Tab & Action Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('processor')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'processor'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>일괄 증강 작업</span>
            </button>
            <button
              onClick={() => setActiveTab('saved_datasets')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'saved_datasets'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FolderHeart className="w-3.5 h-3.5 text-purple-600" />
              <span>저장된 데이터셋 ({savedDatasets.length})</span>
            </button>
          </div>

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {activeTab === 'processor' ? (
        <div className="p-5 flex flex-col gap-6">
          {/* Active Augmentation Parameter Banner */}
          <div className="p-3.5 bg-slate-900 text-white rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
                <Sliders className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  현재 시뮬레이터에 적용 중인 활성 파라미터가 모든 이미지에 일괄 주입됩니다
                </span>
                <span className="text-[11px] text-slate-400">
                  우측 메인 슬라이더에서 조절한 광학 왜곡 수치가 HTML5 캔버스를 통해 각 이미지에 그대로 렌더링됩니다.
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
              {activeParamPills.length === 0 ? (
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  기본 원본 (Clean Baseline)
                </span>
              ) : (
                activeParamPills.map((pill, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 font-bold">
                    {pill}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Folder & Files Upload Zone */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
            {/* Upload Area */}
            <div 
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFilesAdded(e.dataTransfer.files);
              }}
              className={`md:col-span-7 flex flex-col justify-between p-6 rounded-2xl border-2 border-dashed transition-all text-center ${
                isDragging
                  ? 'border-sky-500 bg-sky-50/80 scale-[1.01]'
                  : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-sky-400'
              }`}
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                  <FolderUp className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  번호판 이미지 폴더 업로드 (Upload Folder of Images)
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                  차량 번호판 사진들이 들어있는 폴더를 선택하거나 여러 장의 이미지 파일을 드래그하여 올려주세요.
                </p>

                {/* Hidden File Inputs */}
                <input
                  type="file"
                  ref={folderInputRef}
                  // @ts-expect-error webkitdirectory standard attribute for folder picker
                  webkitdirectory="true"
                  directory=""
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFilesAdded(e.target.files)}
                />

                <input
                  type="file"
                  ref={filesInputRef}
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFilesAdded(e.target.files)}
                />

                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => folderInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
                  >
                    <FolderUp className="w-4 h-4" />
                    <span>폴더 선택하기 (Folder)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => filesInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition-all active:scale-95"
                  >
                    <Upload className="w-4 h-4 text-slate-500" />
                    <span>파일 개별 선택</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLoadSampleFolder}
                    className="flex items-center gap-1.5 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl border border-purple-200 transition-all active:scale-95"
                    title="8종의 실무 한국형 번호판 샘플 폴더를 즉시 로드합니다"
                  >
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>샘플 번호판 폴더 로드 (8장)</span>
                  </button>
                </div>
              </div>

              {rawFiles.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-mono">
                  <span>준비된 원본 이미지: <strong className="text-slate-900">{rawFiles.length}장</strong></span>
                  <button
                    onClick={() => {
                      setRawFiles([]);
                      setProcessedImages([]);
                    }}
                    className="text-rose-600 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>목록 비우기</span>
                  </button>
                </div>
              )}
            </div>

            {/* Dataset Configuration & Trigger */}
            <div className="md:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-3">
                  새 데이터셋 설정 (Dataset Output Spec)
                </span>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      생성될 데이터셋 명칭 (Dataset Name)
                    </label>
                    <input
                      type="text"
                      value={datasetName}
                      onChange={(e) => setDatasetName(e.target.value)}
                      placeholder="예: ALPR_Augmented_RainBlur_v1"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                    />
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5 text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">패키지 형식:</span>
                      <strong className="text-slate-800 font-mono">ZIP (이미지 + JSON + CSV)</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">출력 해상도:</span>
                      <strong className="text-slate-800 font-mono">원문 비율 보존 (100% Quality)</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">포함 메타데이터:</span>
                      <span className="font-mono text-sky-600 font-bold">annotations.csv, params.py</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200/80 mt-4 space-y-2">
                <button
                  type="button"
                  onClick={handleRunBulkAugmentation}
                  disabled={rawFiles.length === 0 || isProcessing}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 ${
                    rawFiles.length === 0
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : isProcessing
                        ? 'bg-sky-400 text-white cursor-wait'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>일괄 증강 처리 중 ({processProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 text-sky-400 fill-sky-400" />
                      <span>{rawFiles.length > 0 ? `${rawFiles.length}장 일괄 증강 실행` : '폴더를 먼저 업로드하세요'}</span>
                    </>
                  )}
                </button>

                {/* Real-time Processing Progress Bar & Status Indicator */}
                {isProcessing && (
                  <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-white space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="flex items-center gap-1.5 text-sky-400">
                        <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                        <span>생성 중: <strong className="text-white truncate max-w-[150px] inline-block align-bottom">{currentProcessingName}</strong></span>
                      </span>
                      <span className="font-bold text-emerald-400">{processProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 transition-all duration-200"
                        style={{ width: `${processProgress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>상태: 캔버스 광학 왜곡 주입 및 OCR 지연 시뮬레이션 중</span>
                      <span className="text-sky-300">지연: ~220ms/장</span>
                    </div>
                  </div>
                )}

                {processedImages.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleExportZip}
                      disabled={isExporting}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
                    >
                      {isExporting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>압축 중 ({exportProgress}%)...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>새 데이터셋 ZIP 다운로드</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveDatasetToStorage}
                      className="flex items-center gap-1 px-3 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl border border-purple-200 transition-all active:scale-95"
                      title="데이터셋 메타데이터를 내 보관함에 영구 저장"
                    >
                      {savedSuccess ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">저장됨!</span>
                        </>
                      ) : (
                        <>
                          <FolderHeart className="w-3.5 h-3.5 text-purple-600" />
                          <span>보관함 저장</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results Gallery Section */}
          {processedImages.length > 0 && (
            <div className="border-t border-slate-200 pt-5">
              {/* Results Summary Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">처리 완료:</span>
                    <strong className="text-slate-900 font-bold font-mono">{processedImages.length}장 생성됨</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">인식 성공률:</span>
                    <strong className="text-emerald-600 font-bold font-mono">{successCount} / {processedImages.length} ({Math.round((successCount / processedImages.length) * 100)}%)</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">평균 모델 확신도:</span>
                    <strong className="text-sky-600 font-bold font-mono">{avgConfidence}%</strong>
                  </div>
                </div>

                {/* Gallery View Switcher */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs">
                  <button
                    onClick={() => setViewMode('comparison')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded font-semibold transition-all ${
                      viewMode === 'comparison'
                        ? 'bg-slate-900 text-white font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Columns className="w-3 h-3" />
                    <span>Before/After 비교</span>
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded font-semibold transition-all ${
                      viewMode === 'grid'
                        ? 'bg-slate-900 text-white font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Grid className="w-3 h-3" />
                    <span>그리드</span>
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded font-semibold transition-all ${
                      viewMode === 'table'
                        ? 'bg-slate-900 text-white font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Table className="w-3 h-3" />
                    <span>목록 상세</span>
                  </button>
                </div>
              </div>

              {/* View 1: Before / After Comparison Cards */}
              {viewMode === 'comparison' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {processedImages.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2.5">
                          <span className="text-xs font-bold text-slate-800 font-mono truncate max-w-[200px]">
                            {item.filename}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {item.width}x{item.height} · {item.originalSize}
                          </span>
                        </div>

                        {/* Dual Images: Before vs After */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {/* Original Before */}
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-mono font-bold text-emerald-600 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>BEFORE 원본</span>
                            </span>
                            <div className="h-24 bg-slate-950 rounded-lg p-1.5 flex items-center justify-center overflow-hidden border border-slate-800">
                              <img
                                src={item.originalUrl}
                                alt="Original"
                                className="max-h-full max-w-full object-contain rounded"
                              />
                            </div>
                          </div>

                          {/* Augmented After */}
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-mono font-bold text-sky-600 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-sky-500" />
                              <span>AFTER 일괄증강</span>
                            </span>
                            <div className="h-24 bg-slate-950 rounded-lg p-1.5 flex items-center justify-center overflow-hidden border border-slate-800">
                              <img
                                src={item.augmentedUrl}
                                alt="Augmented"
                                className="max-h-full max-w-full object-contain rounded"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer: OCR Result and Individual Download */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          {item.ocrResult?.detected ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>인식: "{item.ocrResult.predictedText}" ({item.ocrResult.confidence}%)</span>
                            </span>
                          ) : (
                            <span className="text-rose-600 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-rose-500" />
                              <span>경계 검출 불가</span>
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDownloadSingleImage(item)}
                          className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-sky-600 px-2 py-0.5 rounded hover:bg-slate-100 transition-colors"
                          title="이 증강 이미지 단일 파일로 다운로드"
                        >
                          <Download className="w-3 h-3" />
                          <span>다운로드</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* View 2: Compact Grid */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {processedImages.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-2xs hover:border-slate-300 flex flex-col justify-between"
                    >
                      <div className="h-28 bg-slate-950 rounded-lg p-1.5 flex items-center justify-center overflow-hidden mb-2 relative group">
                        <img
                          src={item.augmentedUrl}
                          alt="Augmented"
                          className="max-h-full max-w-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => handleDownloadSingleImage(item)}
                          className="absolute bottom-2 right-2 p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-md shadow-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-[11px]">
                        <span className="font-bold text-slate-800 font-mono truncate block">
                          {item.filename}
                        </span>
                        <div className="flex items-center justify-between text-[10px] font-mono mt-1 text-slate-500">
                          <span>{item.ocrResult?.confidence}% 확신도</span>
                          <span className={item.ocrResult?.detected ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                            {item.ocrResult?.detected ? '✓ 인식 성공' : '⚠ 오독'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* View 3: Table Detailed View */}
              {viewMode === 'table' && (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3">파일명</th>
                        <th className="p-3">원본 미리보기</th>
                        <th className="p-3">증강 결과 (Active)</th>
                        <th className="p-3">OCR 예측 결과</th>
                        <th className="p-3">확신도</th>
                        <th className="p-3 text-right">작업</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {processedImages.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-mono font-bold text-slate-800">
                            {item.filename}
                            <span className="block text-[10px] text-slate-400 font-normal">
                              {item.width}x{item.height}
                            </span>
                          </td>
                          <td className="p-3">
                            <img src={item.originalUrl} alt="orig" className="h-8 max-w-[100px] object-contain rounded bg-slate-900 p-0.5" />
                          </td>
                          <td className="p-3">
                            <img src={item.augmentedUrl} alt="aug" className="h-8 max-w-[100px] object-contain rounded bg-slate-900 p-0.5" />
                          </td>
                          <td className="p-3 font-mono font-bold">
                            {item.ocrResult?.detected ? (
                              <span className="text-emerald-700">{item.ocrResult.predictedText}</span>
                            ) : (
                              <span className="text-rose-600">미검출</span>
                            )}
                          </td>
                          <td className="p-3 font-mono font-bold text-sky-600">
                            {item.ocrResult?.confidence}%
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleDownloadSingleImage(item)}
                              className="text-xs text-sky-600 hover:text-sky-800 font-bold hover:underline"
                            >
                              다운로드
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Saved Datasets History Tab */
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                저장된 데이터셋 보관함 (Saved Datasets Library)
              </h4>
              <p className="text-xs text-slate-500">
                이 브라우저에서 일괄 증강 생성하여 보관한 데이터셋 이력입니다.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('processor')}
              className="px-3 py-1.5 bg-sky-600 text-white text-xs font-bold rounded-lg hover:bg-sky-500 transition-colors"
            >
              + 새 데이터셋 만들기
            </button>
          </div>

          {savedDatasets.length === 0 ? (
            <div className="p-10 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl">
              <FolderArchive className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h5 className="text-xs font-bold text-slate-700">저장된 데이터셋이 없습니다</h5>
              <p className="text-[11px] text-slate-500 mt-1 mb-3">
                이미지 폴더를 일괄 증강한 후 [보관함 저장]을 눌러 보관하세요.
              </p>
              <button
                onClick={() => setActiveTab('processor')}
                className="px-3.5 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl"
              >
                일괄 증강 작업으로 이동
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedDatasets.map((ds) => (
                <div
                  key={ds.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                      <div className="flex items-center gap-1.5">
                        <FolderHeart className="w-4 h-4 text-purple-600" />
                        <h5 className="text-xs font-bold text-slate-900 font-mono truncate max-w-[200px]">
                          {ds.name}
                        </h5>
                      </div>
                      <button
                        onClick={() => handleDeleteSavedDataset(ds.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="데이터셋 기록 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-3 font-mono">
                      <span>이미지: <strong className="text-slate-800">{ds.imageCount}장</strong></span>
                      <span>생성일: {ds.createdAt}</span>
                      <span>평균 확신도: <strong className="text-sky-600">{ds.avgConfidence}%</strong></span>
                    </div>

                    {/* Sample thumbnails */}
                    {ds.sampleThumbnails && ds.sampleThumbnails.length > 0 && (
                      <div className="grid grid-cols-4 gap-1.5 mb-3 bg-slate-950 p-2 rounded-lg">
                        {ds.sampleThumbnails.map((thumb, idx) => (
                          <div key={idx} className="h-12 flex items-center justify-center overflow-hidden">
                            <img src={thumb} alt="sample" className="max-h-full max-w-full object-contain" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[10px] font-mono text-slate-400">
                      ZIP 파일 규격: images/ + metadata.json
                    </span>
                    <button
                      onClick={() => setActiveTab('processor')}
                      className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1"
                    >
                      <span>새로 생성하기 →</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
