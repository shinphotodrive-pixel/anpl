import JSZip from 'jszip';
import { AugmentationParams } from '../types/alpr';

export interface ProcessedDatasetImage {
  id: string;
  filename: string;
  originalUrl: string;
  augmentedUrl: string;
  originalSize: string;
  width: number;
  height: number;
  status: 'completed' | 'error';
  ocrResult?: {
    detected: boolean;
    predictedText: string;
    confidence: number;
    latencyMs: number;
  };
}

export interface SavedDatasetRecord {
  id: string;
  name: string;
  createdAt: string;
  imageCount: number;
  params: AugmentationParams;
  totalSizeMb: string;
  avgConfidence: number;
  sampleThumbnails: string[];
}

const STORAGE_KEY = 'alpr_saved_datasets_history';
export const DATASETS_CHANGED_EVENT = 'alpr_datasets_changed';

export function getSavedDatasets(): SavedDatasetRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load saved datasets', err);
    return [];
  }
}

export function saveDatasetRecord(record: SavedDatasetRecord): SavedDatasetRecord[] {
  try {
    const current = getSavedDatasets();
    const updated = [record, ...current.filter(d => d.id !== record.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(DATASETS_CHANGED_EVENT, { detail: updated }));
    }
    return updated;
  } catch (err) {
    console.error('Failed to save dataset record', err);
    return getSavedDatasets();
  }
}

export function deleteDatasetRecord(id: string): SavedDatasetRecord[] {
  try {
    const current = getSavedDatasets();
    const updated = current.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(DATASETS_CHANGED_EVENT, { detail: updated }));
    }
    return updated;
  } catch (err) {
    console.error('Failed to delete dataset record', err);
    return getSavedDatasets();
  }
}

/**
 * Packs all augmented images, metadata, and pipeline reproduction script into a downloadable .zip archive
 */
export async function exportDatasetToZip(
  datasetName: string,
  images: ProcessedDatasetImage[],
  params: AugmentationParams,
  onProgress?: (percent: number) => void
): Promise<Blob> {
  const zip = new JSZip();
  const folderName = datasetName.trim().replace(/[^a-zA-Z0-9_-]/g, '_') || 'alpr_augmented_dataset';
  const root = zip.folder(folderName);
  const imagesFolder = root?.folder('images');
  const originalsFolder = root?.folder('originals');

  // 1. Add Augmented & Original Images
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const base64Aug = img.augmentedUrl.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
    const augFilename = img.filename.replace(/\.[^/.]+$/, '') + '_aug.jpg';
    imagesFolder?.file(augFilename, base64Aug, { base64: true });

    if (img.originalUrl && img.originalUrl.startsWith('data:image')) {
      const base64Orig = img.originalUrl.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
      const origFilename = img.filename;
      originalsFolder?.file(origFilename, base64Orig, { base64: true });
    }

    if (onProgress) {
      onProgress(Math.round(((i + 1) / (images.length * 2)) * 100));
    }
  }

  // 2. Add dataset_metadata.json
  const metadata = {
    dataset_name: datasetName,
    created_at: new Date().toISOString(),
    total_images: images.length,
    active_augmentation_params: params,
    images: images.map(img => ({
      original_filename: img.filename,
      augmented_filename: img.filename.replace(/\.[^/.]+$/, '') + '_aug.jpg',
      resolution: `${img.width}x${img.height}`,
      size: img.originalSize,
      ocr_evaluation: img.ocrResult ? {
        detected: img.ocrResult.detected,
        predicted_text: img.ocrResult.predictedText,
        confidence: img.ocrResult.confidence,
        latency_ms: img.ocrResult.latencyMs,
      } : null,
    })),
  };
  root?.file('dataset_metadata.json', JSON.stringify(metadata, null, 2));

  // 3. Add annotations.csv
  const csvHeader = 'id,original_filename,augmented_filename,detected,predicted_text,confidence\n';
  const csvRows = images.map((img, idx) => {
    const augFilename = img.filename.replace(/\.[^/.]+$/, '') + '_aug.jpg';
    return `${idx + 1},"${img.filename}","${augFilename}",${img.ocrResult?.detected ?? false},"${img.ocrResult?.predictedText ?? ''}",${img.ocrResult?.confidence ?? 0}`;
  }).join('\n');
  root?.file('annotations.csv', csvHeader + csvRows);

  // 4. Add reproduction python pipeline script
  const pythonScript = `# ALPR Augmentation Pipeline Reproduce Script
# Generated automatically by ALPR Solution Hub
import albumentations as A
import cv2
import os

transform = A.Compose([
    A.Blur(blur_limit=(${Math.max(3, params.blur * 2)}, ${Math.max(3, params.blur * 2)}), p=${params.blur > 0 ? 1.0 : 0.0}),
    A.RandomBrightnessContrast(brightness_limit=${((params.brightness - 100) / 100).toFixed(2)}, contrast_limit=${((params.contrast - 100) / 100).toFixed(2)}, p=1.0),
    A.GaussNoise(var_limit=(${params.noise * 5}, ${params.noise * 15}), p=${params.noise > 0 ? 1.0 : 0.0}),
    A.Rotate(limit=(${params.rotate}, ${params.rotate}), p=${params.rotate !== 0 ? 1.0 : 0.0}),
])

print("Applied transformation pipeline parameters: ${JSON.stringify(params)}")
`;
  root?.file('reproduce_pipeline.py', pythonScript);

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  }, (metadata) => {
    if (onProgress) {
      onProgress(50 + Math.round(metadata.percent / 2));
    }
  });
}

// ==========================================
// Batch Job History Tracking & Metadata Logs
// ==========================================

export interface BatchJobItemResult {
  id: string;
  filename: string;
  resolution: string;
  status: 'completed' | 'error';
  originalText?: string;
  predictedText?: string;
  confidence: number;
  latencyMs?: number;
  detected: boolean;
  notes?: string;
}

export interface BatchJobRecord {
  id: string;
  name: string;
  createdAt: string; // ISO String
  timestampFormatted: string;
  durationMs: number;
  totalImages: number;
  successCount: number;
  failedCount: number;
  detectionRate: number; // 0 - 100
  avgConfidence: number; // 0 - 100
  avgLatencyMs: number;
  params: AugmentationParams;
  activeEffectsCount: number;
  summaryTags: string[];
  items: BatchJobItemResult[];
  sampleThumbnails?: string[];
  status: 'completed' | 'partial' | 'failed';
}

const STORAGE_KEY_JOBS = 'alpr_batch_job_history';
export const BATCH_JOBS_CHANGED_EVENT = 'alpr_batch_jobs_changed';

// Initial realistic seed jobs for instant rich exploration
const INITIAL_SEED_JOBS: BatchJobRecord[] = [
  {
    id: 'job_20261025_rain_night',
    name: '야간 빗길 과속 단속 카메라 증강 배치 #1',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    timestampFormatted: new Date(Date.now() - 3600000 * 2).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    durationMs: 1420,
    totalImages: 8,
    successCount: 7,
    failedCount: 1,
    detectionRate: 87.5,
    avgConfidence: 81,
    avgLatencyMs: 38,
    params: {
      blur: 4,
      brightness: 75,
      contrast: 130,
      noise: 28,
      rotate: -3,
      perspectiveX: 6,
      perspectiveY: 2,
      rain: 65,
      fog: 20,
      dirt: 15,
      glare: 10,
    },
    activeEffectsCount: 8,
    summaryTags: ['강우 65%', '모션블러 4px', '노이즈 28%', '대비 130%', '저조도 75%'],
    status: 'completed',
    items: [
      { id: 'item_1', filename: 'plate_ev_blue_01.png', resolution: '520x110', status: 'completed', originalText: '01가 1234', predictedText: '01가 1234', confidence: 92, latencyMs: 34, detected: true },
      { id: 'item_2', filename: 'plate_white_8digit_02.png', resolution: '520x110', status: 'completed', originalText: '123가 4567', predictedText: '123가 4567', confidence: 88, latencyMs: 36, detected: true },
      { id: 'item_3', filename: 'plate_commercial_yellow_03.png', resolution: '335x170', status: 'completed', originalText: '서울 31 바 1234', predictedText: '서울 31 바 1234', confidence: 84, latencyMs: 42, detected: true },
      { id: 'item_4', filename: 'plate_retro_green_04.png', resolution: '335x170', status: 'completed', originalText: '서울 1 가 1234', predictedText: '서울 1 가 1234', confidence: 79, latencyMs: 40, detected: true },
      { id: 'item_5', filename: 'plate_white_7digit_05.png', resolution: '520x110', status: 'completed', originalText: '12가 3456', predictedText: '12가 3456', confidence: 89, latencyMs: 35, detected: true },
      { id: 'item_6', filename: 'plate_taxi_yellow_06.png', resolution: '520x110', status: 'completed', originalText: '경기 31 바 9999', predictedText: '경기 31 바 9999', confidence: 76, latencyMs: 38, detected: true },
      { id: 'item_7', filename: 'plate_low_contrast_07.png', resolution: '520x110', status: 'completed', originalText: '52라 8821', predictedText: '52라 8821', confidence: 82, latencyMs: 39, detected: true },
      { id: 'item_8', filename: 'plate_heavy_blur_08.png', resolution: '520x110', status: 'completed', originalText: '77허 1024', predictedText: '77허 102?', confidence: 58, latencyMs: 44, detected: false, notes: '마지막 숫자 빗길 블러로 인한 신뢰도 미달' },
    ],
  },
  {
    id: 'job_20261025_cctv_glare',
    name: '지하주차장 출구 직사광 플레어 배치 #2',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    timestampFormatted: new Date(Date.now() - 3600000 * 5).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    durationMs: 980,
    totalImages: 6,
    successCount: 6,
    failedCount: 0,
    detectionRate: 100,
    avgConfidence: 89,
    avgLatencyMs: 32,
    params: {
      blur: 2,
      brightness: 135,
      contrast: 125,
      noise: 12,
      rotate: 0,
      perspectiveX: 0,
      perspectiveY: 0,
      rain: 0,
      fog: 10,
      dirt: 0,
      glare: 75,
    },
    activeEffectsCount: 5,
    summaryTags: ['역광 플레어 75%', '고조도 135%', '대비 125%', '노이즈 12%'],
    status: 'completed',
    items: [
      { id: 'item_c1', filename: 'cctv_gate_01.png', resolution: '520x110', status: 'completed', originalText: '345나 7890', predictedText: '345나 7890', confidence: 91, latencyMs: 31, detected: true },
      { id: 'item_c2', filename: 'cctv_gate_02.png', resolution: '520x110', status: 'completed', originalText: '68모 4321', predictedText: '68모 4321', confidence: 87, latencyMs: 33, detected: true },
      { id: 'item_c3', filename: 'cctv_gate_03.png', resolution: '520x110', status: 'completed', originalText: '서울 32 사 8812', predictedText: '서울 32 사 8812', confidence: 86, latencyMs: 35, detected: true },
      { id: 'item_c4', filename: 'cctv_gate_04.png', resolution: '520x110', status: 'completed', originalText: '210다 1199', predictedText: '210다 1199', confidence: 93, latencyMs: 30, detected: true },
      { id: 'item_c5', filename: 'cctv_gate_05.png', resolution: '520x110', status: 'completed', originalText: '09보 5543', predictedText: '09보 5543', confidence: 90, latencyMs: 32, detected: true },
      { id: 'item_c6', filename: 'cctv_gate_06.png', resolution: '520x110', status: 'completed', originalText: '82너 9012', predictedText: '82너 9012', confidence: 88, latencyMs: 33, detected: true },
    ],
  },
];

export function getBatchJobHistory(): BatchJobRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_JOBS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(INITIAL_SEED_JOBS));
      return INITIAL_SEED_JOBS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load batch job history', err);
    return INITIAL_SEED_JOBS;
  }
}

export function saveBatchJob(job: BatchJobRecord): BatchJobRecord[] {
  try {
    const current = getBatchJobHistory();
    const updated = [job, ...current.filter(j => j.id !== job.id)].slice(0, 50); // Keep last 50 jobs
    localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(BATCH_JOBS_CHANGED_EVENT, { detail: updated }));
    }
    return updated;
  } catch (err) {
    console.error('Failed to save batch job', err);
    return getBatchJobHistory();
  }
}

export function deleteBatchJob(id: string): BatchJobRecord[] {
  try {
    const current = getBatchJobHistory();
    const updated = current.filter(j => j.id !== id);
    localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(BATCH_JOBS_CHANGED_EVENT, { detail: updated }));
    }
    return updated;
  } catch (err) {
    console.error('Failed to delete batch job', err);
    return getBatchJobHistory();
  }
}

export function clearBatchJobHistory(): BatchJobRecord[] {
  try {
    localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify([]));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(BATCH_JOBS_CHANGED_EVENT, { detail: [] }));
    }
    return [];
  } catch (err) {
    console.error('Failed to clear batch jobs', err);
    return [];
  }
}

// ----------------------------------------------------------------------
// Download Result Summaries for Past Batch Augmentations
// ----------------------------------------------------------------------

/**
 * Downloads a structured JSON report for a specific batch job containing full metadata,
 * execution stats, parameter snapshot, and per-image evaluation results.
 */
export function downloadJobSummaryJson(job: BatchJobRecord): void {
  const payload = {
    job_id: job.id,
    job_name: job.name,
    created_at_iso: job.createdAt,
    created_at_formatted: job.timestampFormatted,
    execution_duration_ms: job.durationMs,
    status: job.status,
    performance_metrics: {
      total_images_processed: job.totalImages,
      successful_detections: job.successCount,
      failed_detections: job.failedCount,
      detection_rate_percentage: job.detectionRate,
      average_confidence_percentage: job.avgConfidence,
      average_ocr_latency_ms: job.avgLatencyMs,
    },
    active_augmentation_parameters: job.params,
    active_effects_count: job.activeEffectsCount,
    summary_tags: job.summaryTags,
    items_breakdown: job.items.map(item => ({
      id: item.id,
      filename: item.filename,
      resolution: item.resolution,
      status: item.status,
      ground_truth_text: item.originalText || null,
      predicted_text: item.predictedText || null,
      confidence_score: item.confidence,
      detected: item.detected,
      latency_ms: item.latencyMs,
      notes: item.notes || null,
    })),
    engine_environment: {
      platform: 'ALPR Solution Hub Simulator',
      engine: 'Client-side HTML5 Canvas + ALPR Inference Simulator',
      exported_at: new Date().toISOString(),
    },
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8;' });
  triggerBrowserDownload(blob, `${job.id}_metadata_summary.json`);
}

/**
 * Downloads a comprehensive CSV spreadsheet with UTF-8 BOM encoding for seamless opening in Excel.
 */
export function downloadJobSummaryCsv(job: BatchJobRecord): void {
  const headers = [
    '항목ID',
    '파일명',
    '해상도',
    '처리상태',
    '원문텍스트(GT)',
    '인식텍스트(Pred)',
    '인식성공여부',
    '확신도(%)',
    '지연시간(ms)',
    '비고/오독원인'
  ];

  const rows = job.items.map(item => [
    `"${item.id}"`,
    `"${item.filename}"`,
    `"${item.resolution}"`,
    `"${item.status === 'completed' ? '완료' : '오류'}"`,
    `"${item.originalText || ''}"`,
    `"${item.predictedText || ''}"`,
    item.detected ? '성공' : '실패',
    item.confidence,
    item.latencyMs || 0,
    `"${item.notes || ''}"`
  ].join(','));

  // Prepend summary rows at top of CSV
  const summaryBlock = [
    `# 작업명,"${job.name}"`,
    `# 작업ID,"${job.id}"`,
    `# 수행일시,"${job.timestampFormatted}"`,
    `# 총 이미지 수,${job.totalImages}`,
    `# 인식 성공 수,${job.successCount}`,
    `# 인식률(%),${job.detectionRate}%`,
    `# 평균 신뢰도,${job.avgConfidence}%`,
    `# 소요시간(ms),${job.durationMs}ms`,
    `# 적용 파라미터,"${job.summaryTags.join(' / ')}"`,
    ''
  ].join('\n');

  const csvContent = summaryBlock + headers.join(',') + '\n' + rows.join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerBrowserDownload(blob, `${job.id}_metrics_report.csv`);
}

/**
 * Downloads a Markdown-formatted executive summary report for research documentation.
 */
export function downloadJobSummaryMarkdown(job: BatchJobRecord): void {
  const md = `# ALPR 배치 증강 및 추론 결과 보고서 (Batch Augmentation Job Report)

## 1. 작업 개요 (Executive Summary)
- **작업명 (Job Name)**: ${job.name}
- **작업 식별자 (Job ID)**: \`${job.id}\`
- **실행 일시 (Timestamp)**: ${job.timestampFormatted}
- **소요 시간 (Duration)**: ${(job.durationMs / 1000).toFixed(2)}초 (${job.durationMs}ms)
- **전체 상태 (Status)**: ${job.status.toUpperCase()}

## 2. 모델 추론 성능 지표 (Key Metrics)
| 지표 항목 (Metric) | 수치 (Value) | 평가 (Status) |
| :--- | :---: | :--- |
| 총 처리 이미지 수 | **${job.totalImages}장** | 완료 |
| OCR 인식 성공 수 | **${job.successCount}장** | ${job.successCount === job.totalImages ? '완전 일치' : '부분 성공'} |
| 인식 성공률 (Detection Rate) | **${job.detectionRate}%** | ${job.detectionRate >= 80 ? '양호' : '집중 보강 필요'} |
| 평균 확신도 (Avg Confidence) | **${job.avgConfidence}%** | - |
| 평균 추론 지연 (Avg Latency) | **${job.avgLatencyMs}ms** | 실시간 처리 가능 |

## 3. 적용된 증강 파라미터 (Applied Augmentation Parameters)
- **활성화된 효과 개수**: ${job.activeEffectsCount}개
- **요약 태그**: \`${job.summaryTags.join('` | `') || '기본 원본 (Clean Baseline)'}\`

### 상세 파라미터 설정값:
\`\`\`json
${JSON.stringify(job.params, null, 2)}
\`\`\`

## 4. 개별 이미지 처리 결과 상세 (Per-Item Evaluation)
| 번호 | 파일명 | 해상도 | 원문(GT) | 인식결과(Pred) | 성공여부 | 확신도 | 지연 |
| :--: | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
${job.items.map((it, idx) => `| ${idx + 1} | \`${it.filename}\` | ${it.resolution} | ${it.originalText || '-'} | **${it.predictedText || '-'}** | ${it.detected ? '✅ 성공' : '❌ 실패'} | ${it.confidence}% | ${it.latencyMs || 0}ms |`).join('\n')}

---
*Generated by ALPR Solution Hub - Client-side Synthetic Data Augmentation Pipeline*
`;

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
  triggerBrowserDownload(blob, `${job.id}_executive_summary.md`);
}

/**
 * Downloads the Python Albumentations reproduction script for this job.
 */
export function downloadJobPipelinePy(job: BatchJobRecord): void {
  const p = job.params;
  const py = `# Reproduce Pipeline Script for Job: ${job.name} (${job.id})
# Generated by ALPR Solution Hub
import albumentations as A
import cv2

transform = A.Compose([
    A.Blur(blur_limit=(${Math.max(3, p.blur * 2)}, ${Math.max(3, p.blur * 2)}), p=${p.blur > 0 ? 1.0 : 0.0}),
    A.RandomBrightnessContrast(
        brightness_limit=${((p.brightness - 100) / 100).toFixed(2)},
        contrast_limit=${((p.contrast - 100) / 100).toFixed(2)},
        p=1.0
    ),
    A.GaussNoise(var_limit=(${p.noise * 5}, ${p.noise * 15}), p=${p.noise > 0 ? 1.0 : 0.0}),
    A.Rotate(limit=(${p.rotate}, ${p.rotate}), p=${p.rotate !== 0 ? 1.0 : 0.0}),
])

print("Ready to run reproduction on batch job: ${job.name}")
print("Parameters: ${JSON.stringify(p)}")
`;

  const blob = new Blob([py], { type: 'text/x-python;charset=utf-8;' });
  triggerBrowserDownload(blob, `${job.id}_pipeline.py`);
}

/**
 * Exports all batch job history records as a unified JSON audit log.
 */
export function exportAllJobsAuditJson(jobs: BatchJobRecord[]): void {
  const auditLog = {
    exported_at: new Date().toISOString(),
    total_logged_jobs: jobs.length,
    overall_images_processed: jobs.reduce((sum, j) => sum + j.totalImages, 0),
    jobs,
  };

  const blob = new Blob([JSON.stringify(auditLog, null, 2)], { type: 'application/json;charset=utf-8;' });
  triggerBrowserDownload(blob, `alpr_batch_jobs_audit_log_${Date.now()}.json`);
}

function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
