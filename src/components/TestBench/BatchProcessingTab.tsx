import React, { useState, useEffect, useRef } from 'react';
import { AugmentationParams } from '../../types/alpr';
import { 
  BatchItem, 
  generateSyntheticPlateImage, 
  applyAugmentationToCanvas 
} from '../../utils/batchProcessor';
import { simulateOcrInference } from '../../utils/alprSimulator';
import { 
  Upload, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Copy, 
  Check, 
  Trash2, 
  Sparkles, 
  FileImage, 
  Sliders, 
  Layers, 
  Cpu, 
  FolderDown,
  Eye,
  Info
} from 'lucide-react';

interface BatchProcessingTabProps {
  currentParams: AugmentationParams;
}

export const BatchProcessingTab: React.FC<BatchProcessingTabProps> = ({ currentParams }) => {
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copiedScript, setCopiedScript] = useState(false);
  const [selectedPreviewItem, setSelectedPreviewItem] = useState<BatchItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load default 5 samples on initial render
  useEffect(() => {
    loadDefaultSamples();
  }, []);

  const loadDefaultSamples = () => {
    const samples: BatchItem[] = [
      {
        id: 'sample-1',
        name: 'sample_01_8digit_white.jpg',
        originalUrl: generateSyntheticPlateImage('123가 4567', 'white'),
        size: '42.8 KB',
        groundTruth: '123가 4567',
        plateType: 'white_8',
        status: 'pending',
      },
      {
        id: 'sample-2',
        name: 'sample_02_7digit_white.jpg',
        originalUrl: generateSyntheticPlateImage('58조 8912', 'white'),
        size: '40.2 KB',
        groundTruth: '58조 8912',
        plateType: 'white_7',
        status: 'pending',
      },
      {
        id: 'sample-3',
        name: 'sample_03_commercial_yellow.jpg',
        originalUrl: generateSyntheticPlateImage('서울 31 바 1234', 'yellow'),
        size: '45.1 KB',
        groundTruth: '서울 31 바 1234',
        plateType: 'yellow_commercial',
        status: 'pending',
      },
      {
        id: 'sample-4',
        name: 'sample_04_eco_ev_blue.jpg',
        originalUrl: generateSyntheticPlateImage('EV 09다 8765', 'ev'),
        size: '43.6 KB',
        groundTruth: 'EV 09다 8765',
        plateType: 'ev_blue',
        status: 'pending',
      },
      {
        id: 'sample-5',
        name: 'sample_05_vintage_green.jpg',
        originalUrl: generateSyntheticPlateImage('41너 6520', 'green'),
        size: '39.4 KB',
        groundTruth: '41너 6520',
        plateType: 'green_retro',
        status: 'pending',
      },
    ];

    setBatchItems(samples);
  };

  // Handle User File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: BatchItem[] = [];
    Array.from(files).forEach((file, idx) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        // Infer default dummy plate label from filename or fallback
        const baseName = file.name.replace(/\.[^/.]+$/, '');
        const plateGuess = baseName.length >= 6 ? baseName : '123가 4567';

        const newItem: BatchItem = {
          id: `upload_${Date.now()}_${idx}`,
          name: file.name,
          originalUrl: url,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          groundTruth: plateGuess,
          plateType: 'white_8',
          status: 'pending',
        };

        setBatchItems((prev) => [...prev, newItem]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Clear batch
  const handleClearBatch = () => {
    setBatchItems([]);
    setSelectedPreviewItem(null);
  };

  // Run Batch Processing
  const handleRunBatch = async () => {
    if (batchItems.length === 0) return;
    setIsProcessing(true);
    setProgress(0);

    const updatedList = [...batchItems];

    for (let i = 0; i < updatedList.length; i++) {
      const item = updatedList[i];
      item.status = 'processing';
      setBatchItems([...updatedList]);

      // Apply Canvas Augmentations using active parameters
      const augDataUrl = await applyAugmentationToCanvas(item.originalUrl, currentParams);
      item.augmentedUrl = augDataUrl;

      // Simulate OCR inference on this augmented plate
      const ocr = simulateOcrInference(
        item.groundTruth,
        item.plateType as any,
        currentParams
      );

      item.ocrResult = {
        detected: ocr.detected,
        predictedText: ocr.predictedText,
        confidence: ocr.overallConfidence,
        latencyMs: ocr.latencyMs,
        mismatchCount: ocr.charBreakdown.filter(c => c.isMismatch).length,
      };

      item.status = 'completed';
      setProgress(Math.round(((i + 1) / updatedList.length) * 100));
      // Subtle delay for UI smooth animation
      await new Promise(r => setTimeout(r, 120));
      setBatchItems([...updatedList]);
    }

    setIsProcessing(false);
  };

  // Download single augmented image
  const handleDownloadItem = (item: BatchItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.augmentedUrl) return;
    const a = document.createElement('a');
    a.href = item.augmentedUrl;
    a.download = `augmented_${item.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Copy Python batch script
  const handleCopyPythonScript = () => {
    const pyScript = `# Albumentations 대용량 배치 증강 파이프라인 스크립트
import os
import cv2
import glob
import albumentations as A

# 시뮬레이터에서 설정된 현재 파라미터 기반 Compose
batch_transform = A.Compose([
    ${currentParams.blur > 0 ? `A.MotionBlur(blur_limit=(${Math.max(3, currentParams.blur)}, ${currentParams.blur + 4}), p=0.9),` : ''}
    ${currentParams.brightness !== 100 || currentParams.contrast !== 100 ? `A.RandomBrightnessContrast(brightness_limit=(${((currentParams.brightness - 100)/100).toFixed(2)}, ${((currentParams.brightness - 100)/100).toFixed(2)}), contrast_limit=(${((currentParams.contrast - 100)/100).toFixed(2)}, ${((currentParams.contrast - 100)/100).toFixed(2)}), p=0.95),` : ''}
    ${currentParams.noise > 0 ? `A.GaussNoise(var_limit=(10.0, ${(currentParams.noise * 0.7).toFixed(1)}), p=0.85),` : ''}
    ${currentParams.rotate !== 0 ? `A.Rotate(limit=(${currentParams.rotate}, ${currentParams.rotate}), border_mode=cv2.BORDER_CONSTANT, p=0.9),` : ''}
    ${currentParams.rain > 0 ? `A.RandomRain(drop_length=15, p=0.7),` : ''}
    ${currentParams.dirt > 0 ? `A.CoarseDropout(num_holes_range=(3, 7), hole_height_range=(10, 25), hole_width_range=(10, 25), fill=0, p=0.8),` : ''}
    ${currentParams.glare > 0 ? `A.RandomSunFlare(flare_roi=(0, 0, 1, 0.4), num_flare_circles_range=(6, 10), p=0.85),` : ''}
])

def process_batch(input_dir="./raw_plates", output_dir="./augmented_plates"):
    os.makedirs(output_dir, exist_ok=True)
    images = glob.glob(os.path.join(input_dir, "*.jpg"))
    print(f"총 {len(images)}개 이미지 증강 일괄 처리 시작...")
    
    for path in images:
        img = cv2.imread(path)
        augmented = batch_transform(image=img)['image']
        out_path = os.path.join(output_dir, f"aug_{os.path.basename(path)}")
        cv2.imwrite(out_path, augmented)
    print("배치 증강 완료!")

if __name__ == "__main__":
    process_batch()`;

    navigator.clipboard.writeText(pyScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const completedCount = batchItems.filter(b => b.status === 'completed').length;
  const avgConfidence = completedCount > 0 
    ? Math.round(batchItems.filter(b => b.ocrResult).reduce((acc, b) => acc + (b.ocrResult?.confidence || 0), 0) / completedCount)
    : 0;
  const exactMatchCount = batchItems.filter(b => b.ocrResult && b.ocrResult.mismatchCount === 0 && b.ocrResult.detected).length;

  return (
    <div className="space-y-6">
      {/* Top Bar: Current Augmentation Config Badge & Controls */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-white">
              배치 일괄 증강 처리 파이프라인 (Batch Augmentation Processor)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            시뮬레이터에서 튜닝된 <strong>현재 증강 파라미터</strong>를 업로드한 다중 이미지 세트에 일괄 적용하고 AI 판독 성능 변화를 측정합니다.
          </p>

          {/* Active parameters readout */}
          <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px] font-mono text-slate-300">
            <span className="text-slate-500 font-bold">적용 설정:</span>
            <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-blue-400">
              블러: {currentParams.blur}px
            </span>
            <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-amber-400">
              노이즈: {currentParams.noise}%
            </span>
            <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-indigo-400">
              조도: {currentParams.brightness}% / {currentParams.contrast}%
            </span>
            <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-emerald-400">
              각도: {currentParams.rotate}°
            </span>
            {currentParams.rain > 0 && (
              <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-cyan-400">
                강우: {currentParams.rain}%
              </span>
            )}
            {currentParams.dirt > 0 && (
              <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-stone-400">
                오염: {currentParams.dirt}%
              </span>
            )}
            {currentParams.glare > 0 && (
              <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-orange-400">
                플레어: {currentParams.glare}%
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept="image/*"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all"
          >
            <Upload className="w-3.5 h-3.5 text-sky-400" />
            <span>이미지 파일 업로드</span>
          </button>

          <button
            onClick={loadDefaultSamples}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all"
            title="기본 5종 번호판 샘플 불러오기"
          >
            <FileImage className="w-3.5 h-3.5 text-amber-400" />
            <span>샘플 5장 리셋</span>
          </button>

          {batchItems.length > 0 && (
            <button
              onClick={handleClearBatch}
              className="p-2 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700 rounded-xl transition-all"
              title="배치 목록 비우기"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleRunBatch}
            disabled={isProcessing || batchItems.length === 0}
            className="flex items-center gap-2 px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-sky-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
                <span>일괄 증강 연산 중 ({progress}%)...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                <span>배치 증강 일괄 적용 ({batchItems.length}장)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {isProcessing && (
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-sky-500 to-indigo-500 h-2 transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Batch Stats KPI Cards */}
      {completedCount > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">처리 완료 이미지</span>
            <div className="text-2xl font-black font-mono text-white">
              {completedCount} <span className="text-xs text-slate-500 font-normal">/ {batchItems.length}장</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">100% 캔버스 증강 완료</span>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">증강 후 완독 일치율</span>
            <div className="text-2xl font-black font-mono text-emerald-400">
              {Math.round((exactMatchCount / completedCount) * 100)}%
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">{exactMatchCount} / {completedCount}건 정확 일치</span>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">평균 판독 확신도</span>
            <div className="text-2xl font-black font-mono text-sky-400">
              {avgConfidence}%
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">광학 저하 감쇄 반영</span>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">평균 추론 소요 시간</span>
            <div className="text-2xl font-black font-mono text-indigo-400">
              {(batchItems.reduce((acc, b) => acc + (b.ocrResult?.latencyMs || 0), 0) / completedCount).toFixed(1)} ms
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">엣지 가속 처리</span>
          </div>
        </div>
      )}

      {/* Batch Items Grid */}
      {batchItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batchItems.map((item) => {
            const hasAugmented = Boolean(item.augmentedUrl);
            const isMatch = item.ocrResult && item.ocrResult.mismatchCount === 0 && item.ocrResult.detected;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedPreviewItem(item)}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-md hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Item Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-3">
                    <span className="text-xs font-mono font-bold text-slate-300 truncate max-w-[180px]">
                      {item.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {item.size}
                    </span>
                  </div>

                  {/* Dual Image Comparison Container */}
                  <div className="space-y-2 mb-3">
                    {/* Original Thumbnail */}
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                        <span>원본 (Original)</span>
                        <span className="text-emerald-400">Ground Truth: {item.groundTruth}</span>
                      </div>
                      <div className="bg-slate-900 rounded-lg p-1.5 flex items-center justify-center border border-slate-800 overflow-hidden">
                        <img
                          src={item.originalUrl}
                          alt="Original Plate"
                          className="max-h-14 object-contain rounded"
                        />
                      </div>
                    </div>

                    {/* Augmented Thumbnail (if processed) */}
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                        <span className="text-sky-400">증강 적용 (Augmented)</span>
                        {item.ocrResult && (
                          <span className={item.ocrResult.detected ? (isMatch ? 'text-emerald-400' : 'text-amber-400') : 'text-rose-400'}>
                            {item.ocrResult.detected ? `예측: ${item.ocrResult.predictedText}` : '검출 실패'}
                          </span>
                        )}
                      </div>

                      <div className="bg-slate-900 rounded-lg p-1.5 flex items-center justify-center border border-slate-800 overflow-hidden min-h-[58px]">
                        {hasAugmented ? (
                          <img
                            src={item.augmentedUrl}
                            alt="Augmented Plate"
                            className="max-h-14 object-contain rounded"
                          />
                        ) : (
                          <span className="text-[11px] text-slate-600 font-mono">
                            [일괄 증강 대기 중]
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Status & Download Action */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    {item.status === 'completed' && item.ocrResult ? (
                      <div className="flex items-center gap-1.5">
                        {isMatch ? (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>완독 성공 ({item.ocrResult.confidence}%)</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] text-rose-400 font-bold">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>{item.ocrResult.mismatchCount}글자 오독 ({item.ocrResult.confidence}%)</span>
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-mono">
                        {item.status === 'processing' ? '처리 연산 중...' : '준비 완료'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {hasAugmented && (
                      <button
                        onClick={(e) => handleDownloadItem(item, e)}
                        className="p-1.5 bg-slate-900 hover:bg-slate-800 text-sky-400 rounded-lg border border-slate-800 transition-colors"
                        title="증강된 이미지 파일(.jpg) 다운로드"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-slate-950 rounded-2xl border border-slate-800">
          <Upload className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-300">배치 처리할 이미지가 없습니다.</h4>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            직접 촬영된 차량 번호판 사진을 업로드하거나 기본 제공 샘플 5장을 불러오세요.
          </p>
          <button
            onClick={loadDefaultSamples}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-xl transition-all"
          >
            기본 샘플 5장 불러오기
          </button>
        </div>
      )}

      {/* Python Batch Automation Code Snippet */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Python 대용량 배치 증강 스크립트 (Albumentations Automation)
            </span>
          </div>

          <button
            onClick={handleCopyPythonScript}
            className="flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300"
          >
            {copiedScript ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">코드 복사 완료!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>파이썬 스크립트 복사</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-3">
          현재 웹 시뮬레이터에서 설정된 파라미터가 정확히 포함된 Python 스크립트입니다. 
          수만 장의 로컬 데이터셋 폴더에 그대로 실행할 수 있습니다.
        </p>

        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 overflow-x-auto text-xs font-mono text-sky-200 max-h-48 leading-relaxed">
          <pre>
            <code>{`# 시뮬레이터 파라미터가 주입된 Python 배치 처리
import albumentations as A
import cv2, glob, os

transform = A.Compose([
    ${currentParams.blur > 0 ? `A.MotionBlur(blur_limit=(${currentParams.blur}, ${currentParams.blur + 4}), p=0.9),` : ''}
    ${currentParams.noise > 0 ? `A.GaussNoise(var_limit=(10.0, ${(currentParams.noise * 0.7).toFixed(1)}), p=0.85),` : ''}
    ${currentParams.brightness !== 100 || currentParams.contrast !== 100 ? `A.RandomBrightnessContrast(brightness_limit=(${((currentParams.brightness-100)/100).toFixed(2)}, ${((currentParams.brightness-100)/100).toFixed(2)}), p=0.9),` : ''}
    ${currentParams.rotate !== 0 ? `A.Rotate(limit=(${currentParams.rotate}, ${currentParams.rotate}), p=0.9),` : ''}
    ${currentParams.rain > 0 ? `A.RandomRain(drop_length=15, p=0.7),` : ''}
    ${currentParams.dirt > 0 ? `A.CoarseDropout(fill=0, p=0.8),` : ''}
])`}</code>
          </pre>
        </div>
      </div>

      {/* Detailed Modal Zoom Preview */}
      {selectedPreviewItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
          onClick={() => setSelectedPreviewItem(null)}
        >
          <div 
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h4 className="text-sm font-bold text-white">{selectedPreviewItem.name}</h4>
                <span className="text-[11px] font-mono text-slate-400">정답: {selectedPreviewItem.groundTruth}</span>
              </div>
              <button
                onClick={() => setSelectedPreviewItem(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                닫기
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-mono text-slate-400 block mb-1">원본 (Ground Truth Image)</span>
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-center">
                  <img src={selectedPreviewItem.originalUrl} alt="Original" className="max-h-24 object-contain" />
                </div>
              </div>

              {selectedPreviewItem.augmentedUrl && (
                <div>
                  <span className="text-xs font-mono text-sky-400 block mb-1">증강 변환 결과 (Augmented Result)</span>
                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-center">
                    <img src={selectedPreviewItem.augmentedUrl} alt="Augmented" className="max-h-24 object-contain" />
                  </div>
                </div>
              )}

              {selectedPreviewItem.ocrResult && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">인식 결과:</span>
                    <span className="font-bold text-white">{selectedPreviewItem.ocrResult.predictedText}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">신뢰도:</span>
                    <span className="font-bold text-sky-400">{selectedPreviewItem.ocrResult.confidence}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">문자 오류 수:</span>
                    <span className={selectedPreviewItem.ocrResult.mismatchCount > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                      {selectedPreviewItem.ocrResult.mismatchCount}개 글자 불일치
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
