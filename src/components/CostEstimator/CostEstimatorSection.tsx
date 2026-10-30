import React, { useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  Coins,
  HardDrive,
  Cpu,
  Server,
  Cloud,
  ArrowRight,
  Sparkles,
  Download,
  Copy,
  Check,
  RotateCcw,
  Info,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Layers,
  Zap,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  AlertCircle,
  FileText,
  FileDown,
  X
} from 'lucide-react';

interface StorageTier {
  id: string;
  name: string;
  provider: 'AWS' | 'GCP' | 'Azure' | 'OnPrem';
  costPerGbMonth: number; // in USD
  desc: string;
}

interface GpuInstance {
  id: string;
  name: string;
  vram: string;
  costPerHour: number; // in USD on-demand
  spotCostPerHour: number; // in USD spot
  throughputImgPerSec: number; // images generated or augmented per sec
  desc: string;
}

const STORAGE_TIERS: StorageTier[] = [
  { id: 'aws-s3-std', name: 'AWS S3 Standard', provider: 'AWS', costPerGbMonth: 0.023, desc: '고성능 즉시 접근, 멀티 AZ 복제 (가장 일반적)' },
  { id: 'aws-s3-it', name: 'AWS S3 Intelligent-Tiering', provider: 'AWS', costPerGbMonth: 0.0125, desc: '접근 빈도 자동 분석 최적화 (장기 보관 추천)' },
  { id: 'gcp-std', name: 'Google Cloud Storage Standard', provider: 'GCP', costPerGbMonth: 0.020, desc: '초고속 글로벌 네트워크, AI 파이프라인 친화' },
  { id: 'gcp-nearline', name: 'Google Cloud Nearline', provider: 'GCP', costPerGbMonth: 0.010, desc: '월 1회 이하 접근 백업 데이터셋용 (50% 절감)' },
  { id: 'azure-hot', name: 'Azure Blob Hot', provider: 'Azure', costPerGbMonth: 0.018, desc: '자주 접근하는 활성 학습 데이터셋용' },
  { id: 'onprem-nas', name: '로컬 온프레미스 NAS / RAID', provider: 'OnPrem', costPerGbMonth: 0.0035, desc: '하드웨어 4년 감가상각 + 전기료 환산치 (초기 구축 필요)' },
];

const GPU_INSTANCES: GpuInstance[] = [
  { id: 'rtx4090', name: 'NVIDIA RTX 4090 (24GB)', vram: '24GB', costPerHour: 0.45, spotCostPerHour: 0.22, throughputImgPerSec: 160, desc: 'Lambda/RunPod 클라우드 - 번호판 생성 및 경량 OCR 학습 가성비 최고' },
  { id: 'a10g', name: 'NVIDIA A10G (24GB, g5.xlarge)', vram: '24GB', costPerHour: 1.01, spotCostPerHour: 0.38, throughputImgPerSec: 120, desc: 'AWS 공식 표준 인스턴스 - 안정적인 파이프라인 연동' },
  { id: 'a100-80gb', name: 'NVIDIA A100 SXM (80GB)', vram: '80GB', costPerHour: 1.89, spotCostPerHour: 0.85, throughputImgPerSec: 320, desc: 'GCP a2-highgpu - 대규모 배치 및 2-Stage YOLO+CRNN 고속 학습' },
  { id: 'h100-80gb', name: 'NVIDIA H100 PCIe (80GB)', vram: '80GB', costPerHour: 3.40, spotCostPerHour: 1.65, throughputImgPerSec: 580, desc: '최상위 AI 가속기 - 초고속 생성 및 파운데이션 비전 모델 훈련' },
  { id: 'local-workstation', name: '로컬 전용 GPU 워크스테이션', vram: '24GB', costPerHour: 0.08, spotCostPerHour: 0.08, throughputImgPerSec: 140, desc: '보유 GPU 기준 순수 소비전력(450W) 전기료 환산 (150원/kWh)' },
];

const RESOLUTION_PRESETS = [
  { id: 'plate_crop', label: '번호판 크롭 패치 (640×160)', sizeKb: 65, desc: '정렬된 번호판 영역 (OCR 특화)' },
  { id: 'hd_720p', label: '720p HD (1280×720)', sizeKb: 180, desc: '주차장 / 입출차 차단기 화각' },
  { id: 'fhd_1080p', label: '1080p Full HD (1920×1080)', sizeKb: 360, desc: 'ITS 표준 고해상도 (기본 추천)' },
  { id: 'qhd_2k', label: '2K QHD (2560×1440)', sizeKb: 850, desc: '다차선 광각 도로 방범 모니터링' },
  { id: 'uhd_4k', label: '4K UHD (3840×2160)', sizeKb: 2200, desc: '초고화질 멀티레인 고속도로 단속' },
];

export const CostEstimatorSection: React.FC = () => {
  // Exchange rate USD -> KRW
  const [currency, setCurrency] = useState<'KRW' | 'USD'>('KRW');
  const exchangeRate = 1350;

  // Configuration state
  const [datasetSize, setDatasetSize] = useState<number>(100000); // 100k images default
  const [selectedResolution, setSelectedResolution] = useState<string>('fhd_1080p');
  const [compressionRatio, setCompressionRatio] = useState<number>(1.0); // 0.6 = WebP, 1.0 = JPG, 3.2 = PNG
  const [includeAnnotations, setIncludeAnnotations] = useState<boolean>(true);
  const [annotationSizeKb, setAnnotationSizeKb] = useState<number>(15); // JSON bbox + polygon

  // Cloud Storage state
  const [selectedStorage, setSelectedStorage] = useState<string>('aws-s3-std');
  const [storageMonths, setStorageMonths] = useState<number>(12); // 12 months retention
  const [egressDownloadsPerMonth, setEgressDownloadsPerMonth] = useState<number>(1); // full download per month

  // GPU Compute state
  const [selectedGpu, setSelectedGpu] = useState<string>('rtx4090');
  const [useSpotInstance, setUseSpotInstance] = useState<boolean>(true);
  const [pipelineType, setPipelineType] = useState<'generation' | 'training' | 'full'>('full');
  const [trainingEpochs, setTrainingEpochs] = useState<number>(150);

  // Copy status
  const [copied, setCopied] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportCopied, setReportCopied] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  // Calculations
  const calculations = useMemo(() => {
    // 1. Storage Size
    const resPreset = RESOLUTION_PRESETS.find(r => r.id === selectedResolution) || RESOLUTION_PRESETS[2];
    const imageSizeBytes = resPreset.sizeKb * 1024 * compressionRatio;
    const metaSizeBytes = includeAnnotations ? annotationSizeKb * 1024 : 0;
    const totalBytesPerSample = imageSizeBytes + metaSizeBytes;
    
    const totalBytes = totalBytesPerSample * datasetSize;
    const totalGb = totalBytes / (1024 * 1024 * 1024);
    const totalTb = totalGb / 1024;

    // 2. Storage Cost
    const storageTier = STORAGE_TIERS.find(s => s.id === selectedStorage) || STORAGE_TIERS[0];
    const monthlyStorageCostUsd = totalGb * storageTier.costPerGbMonth;
    const totalStorageCostUsd = monthlyStorageCostUsd * storageMonths;

    // 3. Egress Network Cost (Avg $0.08 per GB on public cloud, $0 for onprem)
    const egressRatePerGb = storageTier.provider === 'OnPrem' ? 0.0 : 0.08;
    const monthlyEgressCostUsd = totalGb * egressDownloadsPerMonth * egressRatePerGb;
    const totalEgressCostUsd = monthlyEgressCostUsd * storageMonths;

    // 4. GPU Compute Hours & Cost
    const gpu = GPU_INSTANCES.find(g => g.id === selectedGpu) || GPU_INSTANCES[0];
    const hourlyGpuRate = useSpotInstance ? gpu.spotCostPerHour : gpu.costPerHour;

    // Generation / Augmentation time
    const generationHours = datasetSize / (gpu.throughputImgPerSec * 3600);

    // Training time estimate (approx 0.00008 hours per image-epoch on YOLO+CRNN)
    const baseHoursPer10kPerEpoch = 0.035 * (160 / gpu.throughputImgPerSec);
    const trainingHours = (datasetSize / 10000) * trainingEpochs * baseHoursPer10kPerEpoch;

    let totalGpuHours = 0;
    if (pipelineType === 'generation') {
      totalGpuHours = generationHours;
    } else if (pipelineType === 'training') {
      totalGpuHours = trainingHours;
    } else {
      totalGpuHours = generationHours + trainingHours;
    }

    const totalGpuCostUsd = totalGpuHours * hourlyGpuRate;

    // Total Project Cost
    const grandTotalUsd = totalStorageCostUsd + totalEgressCostUsd + totalGpuCostUsd;

    // Local Workstation comparison (buying an RTX 4090 PC + 4TB SSD ≈ $2,600 one-time)
    const onPremHardwareInvestUsd = 2600;
    const onPremPowerRunningCostUsd = totalGpuHours * 0.08 + totalTb * 0.0035 * storageMonths;
    const localTcoUsd = onPremHardwareInvestUsd + onPremPowerRunningCostUsd;

    return {
      totalGb,
      totalTb,
      monthlyStorageCostUsd,
      totalStorageCostUsd,
      monthlyEgressCostUsd,
      totalEgressCostUsd,
      generationHours,
      trainingHours,
      totalGpuHours,
      hourlyGpuRate,
      totalGpuCostUsd,
      grandTotalUsd,
      localTcoUsd,
      onPremHardwareInvestUsd,
      storageTier,
      gpu,
      resPreset
    };
  }, [
    datasetSize,
    selectedResolution,
    compressionRatio,
    includeAnnotations,
    annotationSizeKb,
    selectedStorage,
    storageMonths,
    egressDownloadsPerMonth,
    selectedGpu,
    useSpotInstance,
    pipelineType,
    trainingEpochs
  ]);

  // Currency helper
  const formatCost = (usd: number) => {
    if (currency === 'KRW') {
      const krw = Math.round(usd * exchangeRate);
      return `₩${krw.toLocaleString()}`;
    }
    return `$${usd.toFixed(2)}`;
  };

  // Preset quick-setters
  const applyPreset = (size: number, res: string, storage: string, gpu: string, spot: boolean) => {
    setDatasetSize(size);
    setSelectedResolution(res);
    setSelectedStorage(storage);
    setSelectedGpu(gpu);
    setUseSpotInstance(spot);
  };

  // Copy quote summary to clipboard
  const handleCopyQuote = () => {
    const text = `[ALPR Dataset Cloud Storage & GPU Compute Cost Estimate]
-------------------------------------------------------------
- 데이터셋 규모: ${datasetSize.toLocaleString()} 장 (${calculations.totalGb.toFixed(1)} GB / ${calculations.totalTb.toFixed(2)} TB)
- 이미지 해상도: ${calculations.resPreset.label}
- 클라우드 스토리지: ${calculations.storageTier.name} (${storageMonths}개월 보관)
  * 스토리지 총 비용: ${formatCost(calculations.totalStorageCostUsd)} (월 ${formatCost(calculations.monthlyStorageCostUsd)})
  * 네트워크 송신(Egress) 비용: ${formatCost(calculations.totalEgressCostUsd)}
- GPU 연산 인스턴스: ${calculations.gpu.name} (${useSpotInstance ? '스팟 할인 60%' : '온디맨드'})
  * 총 연산 시간: ${calculations.totalGpuHours.toFixed(1)} 시간 (${(calculations.totalGpuHours / 24).toFixed(1)} 일)
  * GPU 연산 비용: ${formatCost(calculations.totalGpuCostUsd)}
-------------------------------------------------------------
★ 총 소요 예상 비용: ${formatCost(calculations.grandTotalUsd)}
(환율 기준: 1 USD = ${exchangeRate.toLocaleString()} KRW)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Recharts: Operational cost trend data across project scales (Small -> Medium -> Large -> Mega)
  const scaleTrendData = useMemo(() => {
    const scales = [
      { key: '10k', scale: 10000, label: '1만 (소규모 PoC)', tier: 'Small' },
      { key: '50k', scale: 50000, label: '5만 (시험 배포)', tier: 'Small' },
      { key: '100k', scale: 100000, label: '10만 (중규모 상용)', tier: 'Medium' },
      { key: '250k', scale: 250000, label: '25만 (지자체 단속)', tier: 'Medium' },
      { key: '500k', scale: 500000, label: '50만 (광역 ITS)', tier: 'Large' },
      { key: '1m', scale: 1000000, label: '100만 (전국망)', tier: 'Large' },
      { key: '2m', scale: 2000000, label: '200만 (AI-Hub급)', tier: 'Mega' },
    ];

    const resPreset = RESOLUTION_PRESETS.find(r => r.id === selectedResolution) || RESOLUTION_PRESETS[2];
    const storageTier = STORAGE_TIERS.find(s => s.id === selectedStorage) || STORAGE_TIERS[0];
    const gpu = GPU_INSTANCES.find(g => g.id === selectedGpu) || GPU_INSTANCES[0];
    const hourlyGpuRate = useSpotInstance ? gpu.spotCostPerHour : gpu.costPerHour;
    const egressRatePerGb = storageTier.provider === 'OnPrem' ? 0.0 : 0.08;

    const imageSizeBytes = resPreset.sizeKb * 1024 * compressionRatio;
    const metaSizeBytes = includeAnnotations ? annotationSizeKb * 1024 : 0;
    const totalBytesPerSample = imageSizeBytes + metaSizeBytes;

    const factor = currency === 'KRW' ? exchangeRate : 1;

    return scales.map((item) => {
      const totalBytes = totalBytesPerSample * item.scale;
      const totalGb = totalBytes / (1024 * 1024 * 1024);
      const totalTb = totalGb / 1024;

      const storageCostUsd = totalGb * storageTier.costPerGbMonth * storageMonths;
      const egressCostUsd = totalGb * egressDownloadsPerMonth * egressRatePerGb * storageMonths;
      const storageTotalUsd = storageCostUsd + egressCostUsd;

      const genHours = item.scale / (gpu.throughputImgPerSec * 3600);
      const baseHoursPer10kPerEpoch = 0.035 * (160 / gpu.throughputImgPerSec);
      const trainHours = (item.scale / 10000) * trainingEpochs * baseHoursPer10kPerEpoch;

      let gpuHours = 0;
      if (pipelineType === 'generation') gpuHours = genHours;
      else if (pipelineType === 'training') gpuHours = trainHours;
      else gpuHours = genHours + trainHours;

      const gpuCostUsd = gpuHours * hourlyGpuRate;
      const totalCostUsd = storageTotalUsd + gpuCostUsd;

      // On-premise workstation comparison
      const onPremPowerRunningCostUsd = gpuHours * 0.08 + totalTb * 0.0035 * storageMonths;
      const localTcoUsd = 2600 + onPremPowerRunningCostUsd;

      return {
        scale: item.scale,
        label: item.label,
        tier: item.tier,
        '총 운영 비용': Math.round(totalCostUsd * factor),
        'GPU 연산비': Math.round(gpuCostUsd * factor),
        '스토리지/전송비': Math.round(storageTotalUsd * factor),
        '로컬 워크스테이션 TCO': Math.round(localTcoUsd * factor),
      };
    });
  }, [
    selectedResolution,
    compressionRatio,
    includeAnnotations,
    annotationSizeKb,
    selectedStorage,
    storageMonths,
    egressDownloadsPerMonth,
    selectedGpu,
    useSpotInstance,
    pipelineType,
    trainingEpochs,
    currency,
    exchangeRate
  ]);

  const yAxisCostFormatter = (val: number) => {
    if (currency === 'KRW') {
      if (val >= 100000000) return `₩${(val / 100000000).toFixed(1)}억`;
      if (val >= 10000) return `₩${Math.round(val / 10000).toLocaleString()}만`;
      return `₩${val.toLocaleString()}`;
    }
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`;
    return `$${val}`;
  };

  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-slate-700 p-3.5 rounded-2xl shadow-2xl backdrop-blur-md text-xs space-y-2 min-w-[240px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-white text-sm">{label}</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-sky-400 font-mono font-medium">
              규모별 추이
            </span>
          </div>
          <div className="space-y-1.5 pt-1">
            {payload.map((entry: any, index: number) => (
              <div key={`entry-${index}`} className="flex items-center justify-between gap-4 text-[11px]">
                <span className="flex items-center gap-2" style={{ color: entry.color }}>
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                  <span className="font-medium text-slate-300">{entry.name}:</span>
                </span>
                <span className="font-mono font-bold text-white">
                  {currency === 'KRW' ? `₩${entry.value.toLocaleString()}` : `$${entry.value.toLocaleString()}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Full Executive Summary Report Text
  const summaryReportText = useMemo(() => {
    const dateStr = new Date().toISOString().slice(0, 10);
    return `================================================================================
           차량 번호판(ALPR) 데이터셋 생성 및 학습 비용 추정 요약 보고서
                     (ALPR Cost Estimator Summary Report)
================================================================================
생성 일시: ${dateStr}
기준 모델: 국토교통부 표준 2-Stage (YOLOv8 Plate Detection + CRNN/LPRNet OCR)
적용 환율: 1 USD = ${exchangeRate.toLocaleString()} KRW
표시 통화: ${currency === 'KRW' ? '원화 (KRW)' : '달러 (USD)'}

--------------------------------------------------------------------------------
[1] 핵심 요약 (EXECUTIVE SUMMARY)
--------------------------------------------------------------------------------
- 데이터셋 목표 규모: ${datasetSize.toLocaleString()} 장 (${calculations.totalGb.toFixed(1)} GB / ${calculations.totalTb.toFixed(2)} TB)
- 이미지 해상도 규격: ${calculations.resPreset.label} (${calculations.resPreset.sizeKb} KB/장)
- 총 인프라 예상 비용: ${formatCost(calculations.grandTotalUsd)}
  * 클라우드 스토리지 보관비: ${formatCost(calculations.totalStorageCostUsd)} (${storageMonths}개월)
  * 네트워크 송신(Egress)비: ${formatCost(calculations.totalEgressCostUsd)}
  * GPU 연산 인스턴스 비용: ${formatCost(calculations.totalGpuCostUsd)} (${calculations.totalGpuHours.toFixed(1)} 시간)

--------------------------------------------------------------------------------
[2] 클라우드 스토리지 세부 사양 (STORAGE SPECIFICATION)
--------------------------------------------------------------------------------
- 선택 스토리지: ${calculations.storageTier.name} (${calculations.storageTier.provider})
- 스토리지 단가: $${calculations.storageTier.costPerGbMonth.toFixed(4)} / GB / 월
- 보관 유지 기간: ${storageMonths} 개월
- 단일 샘플 용량: ${(calculations.resPreset.sizeKb * compressionRatio + (includeAnnotations ? annotationSizeKb : 0)).toFixed(1)} KB (어노테이션 ${includeAnnotations ? '포함' : '미포함'})
- 총 저장 용량: ${calculations.totalGb.toFixed(2)} GB (${calculations.totalTb.toFixed(3)} TB)
- 월별 스토리지 기본료: ${formatCost(calculations.monthlyStorageCostUsd)} / 월
- 월별 전체 다운로드(Egress) 횟수: 월 ${egressDownloadsPerMonth} 회
- 네트워크 송신 총 비용: ${formatCost(calculations.totalEgressCostUsd)}
- 스토리지 총 비용 합계: ${formatCost(calculations.totalStorageCostUsd + calculations.totalEgressCostUsd)}

--------------------------------------------------------------------------------
[3] GPU 연산 및 딥러닝 훈련 세부 사양 (GPU COMPUTE SPECIFICATION)
--------------------------------------------------------------------------------
- 선택 가속기: ${calculations.gpu.name} (${calculations.gpu.vram} VRAM)
- 인스턴스 유형: ${useSpotInstance ? '스팟(Spot) 인스턴스 (약 60% 할인 적용)' : '온디맨드(On-Demand) 정규 인스턴스'}
- 시간당 연산 단가: $${calculations.hourlyGpuRate.toFixed(2)} / 시간 (${(calculations.hourlyGpuRate * exchangeRate).toLocaleString()} 원/h)
- 파이프라인 범위: ${pipelineType === 'generation' ? '합성 데이터 생성/증강만' : pipelineType === 'training' ? '모델 학습만' : '데이터 생성 + 2-Stage 모델 전체 학습'}
- 학습 설정 에포크: ${trainingEpochs} Epochs
- 세부 소요 시간:
  * 합성 데이터 생성 시간: ${calculations.generationHours.toFixed(1)} 시간 (${(calculations.generationHours / 24).toFixed(1)} 일)
  * 신경망 모델 학습 시간: ${calculations.trainingHours.toFixed(1)} 시간 (${(calculations.trainingHours / 24).toFixed(1)} 일)
  * 총 GPU 연산 시간: ${calculations.totalGpuHours.toFixed(1)} 시간 (${(calculations.totalGpuHours / 24).toFixed(1)} 기계-일)
- GPU 연산 총 비용 합계: ${formatCost(calculations.totalGpuCostUsd)}

--------------------------------------------------------------------------------
[4] TCO 재무 비교 및 투자 타당성 (CAPEX vs OPEX)
--------------------------------------------------------------------------------
- 옵션 A [퍼블릭 클라우드 활용 (RunPod + S3)]: ${formatCost(calculations.grandTotalUsd)}
  * 초기 하드웨어 투자비(CAPEX) 0원, 탄력적 사용
- 옵션 B [로컬 워크스테이션 구매 (RTX 4090 PC)]: ${formatCost(calculations.localTcoUsd)}
  * 하드웨어 구매비(${formatCost(calculations.onPremHardwareInvestUsd)}) + 전기료/유지보수
- 투자 의사결정 제언(Recommendation):
  ${calculations.grandTotalUsd < calculations.localTcoUsd
    ? `-> 현재 프로젝트 규모에서는 퍼블릭 클라우드를 활용하는 것이 로컬 장비 구매 대비 약 ${formatCost(calculations.localTcoUsd - calculations.grandTotalUsd)} 더 경제적입니다.`
    : `-> 연산량이 많은 대형 프로젝트입니다. 로컬 워크스테이션(RTX 4090)을 직접 구축하는 것이 장기적으로 약 ${formatCost(calculations.grandTotalUsd - calculations.localTcoUsd)} 절감됩니다.`}

--------------------------------------------------------------------------------
[5] 비용 절감 4대 실행 지침 (COST OPTIMIZATION TIPS)
--------------------------------------------------------------------------------
1. WebDataset (tar) 샤딩: 낱개 파일 대신 1GB 단위 tar로 패키징하여 S3 GET 요청 비용 90% 절감
2. 스팟 인스턴스 체크포인트: 자동 저장 체크포인트를 설정하여 스팟 인스턴스로 60% 이상 할인
3. 콜드 스토리지 아카이빙: 학습 완료 즉시 원천 데이터셋을 Glacier/Nearline으로 이동하여 75% 절감
4. 온더플라이(On-The-Fly) 로컬 증강: 로컬 PC 메모리 상에서 실시간 증강하여 클라우드 업로드 대역폭 최소화

================================================================================
Generated by ALPR Dataset Architecture Suite | All Rights Reserved.
`;
  }, [datasetSize, calculations, storageMonths, compressionRatio, includeAnnotations, annotationSizeKb, egressDownloadsPerMonth, useSpotInstance, pipelineType, trainingEpochs, currency, exchangeRate]);

  // Download Plain-text Report (.txt)
  const handleDownloadTextReport = () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const blob = new Blob([summaryReportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ALPR_Cost_Summary_Report_${datasetSize}_images_${dateStr}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download PDF Report (.pdf) with jsPDF
  const handleDownloadPdfReport = () => {
    try {
      setIsGeneratingPdf(true);
      const doc = new jsPDF();
      const dateStr = new Date().toISOString().slice(0, 10);
      
      // Top header banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 32, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.text('ALPR DATASET & CLOUD INFRASTRUCTURE COST REPORT', 14, 15);
      
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(`Generated on: ${dateStr} | Architecture: 2-Stage YOLOv8 + CRNN | Target: ${datasetSize.toLocaleString()} Images`, 14, 23);

      // Section 1: Executive Summary Box
      doc.setDrawColor(203, 213, 225);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 38, 182, 32, 3, 3, 'FD');

      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('1. EXECUTIVE COST SUMMARY', 20, 46);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`* Total Dataset Scale: ${datasetSize.toLocaleString()} samples (${calculations.totalGb.toFixed(1)} GB / ${calculations.totalTb.toFixed(2)} TB)`, 20, 53);
      doc.text(`* Cloud Storage Total (${storageMonths} mo): ${formatCost(calculations.totalStorageCostUsd)} (Egress: ${formatCost(calculations.totalEgressCostUsd)})`, 20, 59);
      doc.text(`* GPU Compute Total: ${formatCost(calculations.totalGpuCostUsd)} (${calculations.totalGpuHours.toFixed(1)} GPU-hours required)`, 20, 65);

      // Total Cost Pill inside Summary
      doc.setFillColor(16, 185, 129); // emerald-500
      doc.roundedRect(125, 42, 65, 24, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL OPERATIONAL COST', 129, 49);
      doc.setFontSize(12);
      doc.text(formatCost(calculations.grandTotalUsd), 129, 59);

      // Section 2: Storage Configuration Breakdown
      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('2. CLOUD STORAGE SPECIFICATION & CHARGES', 14, 80);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      
      const storageLines = [
        `Provider / Tier: ${calculations.storageTier.name} (${calculations.storageTier.provider})`,
        `Unit Storage Rate: $${calculations.storageTier.costPerGbMonth.toFixed(4)} / GB / month`,
        `Storage Retention: ${storageMonths} months retention window`,
        `Image Resolution: ${calculations.resPreset.label}`,
        `Total Volume: ${calculations.totalGb.toFixed(2)} GB (${calculations.totalTb.toFixed(3)} TB)`,
        `Monthly Storage Base Fee: ${formatCost(calculations.monthlyStorageCostUsd)}`,
        `Network Egress Downloads: ${egressDownloadsPerMonth} full cycle(s)/mo -> ${formatCost(calculations.totalEgressCostUsd)}`
      ];
      let y = 87;
      storageLines.forEach(line => {
        doc.text(`- ${line}`, 18, y);
        y += 5.5;
      });

      // Section 3: GPU Compute Breakdown
      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('3. GPU COMPUTE & MODEL TRAINING CHARGES', 14, 134);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);

      const gpuLines = [
        `Selected Accelerator: ${calculations.gpu.name} (${calculations.gpu.vram} VRAM)`,
        `Pricing Model: ${useSpotInstance ? 'Spot Instance (~60% discounted)' : 'On-Demand Regular'}`,
        `Hourly Rate: $${calculations.hourlyGpuRate.toFixed(2)} / hour`,
        `Pipeline Scope: ${pipelineType.toUpperCase()} (Synthetic Gen: ${calculations.generationHours.toFixed(1)}h, Train: ${calculations.trainingHours.toFixed(1)}h)`,
        `Training Epochs: ${trainingEpochs} epochs (YOLOv8 Plate Detector + CRNN LPR OCR)`,
        `Total GPU Hours: ${calculations.totalGpuHours.toFixed(1)} hours (${(calculations.totalGpuHours / 24).toFixed(1)} machine-days)`,
        `GPU Compute Total Cost: ${formatCost(calculations.totalGpuCostUsd)}`
      ];
      y = 141;
      gpuLines.forEach(line => {
        doc.text(`- ${line}`, 18, y);
        y += 5.5;
      });

      // Section 4: TCO & Financial Analysis
      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('4. TCO ANALYSIS: MANAGED CLOUD VS ON-PREMISE WORKSTATION', 14, 188);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`Option A [Public Cloud Managed]: ${formatCost(calculations.grandTotalUsd)} (Flexible, zero upfront CAPEX)`, 18, 195);
      doc.text(`Option B [On-Premises RTX 4090 Workstation]: ${formatCost(calculations.localTcoUsd)} (Hardware Purchase $2,600 + Electricity)`, 18, 201);
      
      const recText = calculations.grandTotalUsd < calculations.localTcoUsd
        ? `Recommendation: Cloud infrastructure is more cost-efficient by ${formatCost(calculations.localTcoUsd - calculations.grandTotalUsd)}.`
        : `Recommendation: On-premise workstation purchase breaks even and saves ${formatCost(calculations.grandTotalUsd - calculations.localTcoUsd)}.`;
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129);
      doc.text(`* ${recText}`, 18, 209);

      // Section 5: Optimization Tips
      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('5. COST REDUCTION BEST PRACTICES', 14, 222);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text('1) WebDataset Sharding: Package images into 1GB tar shards to reduce S3 GET requests by 90%.', 18, 229);
      doc.text('2) Spot Instance Checkpoints: Set periodic checkpoints to leverage 60-70% spot discounts safely.', 18, 235);
      doc.text('3) Lifecycle Transition: Move raw datasets to Cold/Glacier archive immediately after training.', 18, 241);
      doc.text('4) On-the-fly Local Augmentation: Augment in memory to avoid cloud network egress overhead.', 18, 247);

      // Footer
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(148, 163, 184);
      doc.text('Fixed currency rate: 1 USD = 1,350 KRW. Generated by ALPR Dataset Architecture Suite.', 14, 280);

      doc.save(`ALPR_Cost_Summary_Report_${datasetSize}_images_${dateStr}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleCopyFullReport = () => {
    navigator.clipboard.writeText(summaryReportText);
    setReportCopied(true);
    setTimeout(() => setReportCopied(false), 2500);
  };

  return (
    <section id="cost-estimator" className="py-16 bg-slate-950 text-white border-b border-slate-800 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-2 tracking-wider uppercase font-mono">
            <Coins className="w-4 h-4 text-emerald-400" />
            <span>ALPR Dataset Infrastructure & Cloud Cost Calculator</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-400">AWS / GCP / RunPod TCO Model</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                데이터셋 생성 및 학습 비용 추정기 (Cost Estimator)
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-4xl leading-relaxed">
                로컬 또는 클라우드 환경에서 번호판 합성 데이터셋을 대량 생성하고 딥러닝(YOLOv8 + CRNN)을 학습시킬 때 소요되는
                <strong>클라우드 스토리지(S3/GCS) 보관 비용</strong>과 <strong>GPU 연산 인스턴스 비용</strong>을 실시간 계산하고 TCO를 비교합니다.
              </p>
            </div>

            {/* Currency Toggle & Quick Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setCurrency('KRW')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    currency === 'KRW' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  원화 (₩ KRW)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    currency === 'USD' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  달러 ($ USD)
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopyQuote}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all hover:scale-[1.02] cursor-pointer"
                title="견적서 복사"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copied ? '견적 복사완료' : '견적서 복사'}</span>
              </button>

              {/* Generate Summary Report Button */}
              <button
                type="button"
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                title="요약 보고서 생성 (PDF / TXT)"
              >
                <FileText className="w-4 h-4 text-slate-950" />
                <span>요약 보고서 생성 (Generate Summary Report)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Scenario Preset Pills */}
        <div className="mb-8 p-4 bg-slate-900/90 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="font-mono text-slate-400 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>실무 표준 시나리오 프리셋:</span>
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => applyPreset(10000, 'plate_crop', 'onprem-nas', 'local-workstation', true)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
            >
              소규모 PoC (1만 장, 로컬 검증)
            </button>
            <button
              onClick={() => applyPreset(100000, 'fhd_1080p', 'aws-s3-std', 'rtx4090', true)}
              className="px-3 py-1.5 rounded-lg bg-sky-950 border border-sky-800/80 text-sky-300 font-semibold transition-colors"
            >
              중규모 상용화 (10만 장, 1080p) ★추천
            </button>
            <button
              onClick={() => applyPreset(1000000, 'fhd_1080p', 'aws-s3-it', 'a100-80gb', true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-800/80 text-emerald-300 font-semibold transition-colors"
            >
              대규모 ITS 전국망 (100만 장, S3)
            </button>
            <button
              onClick={() => applyPreset(2000000, 'qhd_2k', 'gcp-std', 'h100-80gb', true)}
              className="px-3 py-1.5 rounded-lg bg-purple-950 border border-purple-800/80 text-purple-300 font-semibold transition-colors"
            >
              초대규모 AI-Hub급 (200만 장, 2K)
            </button>
          </div>
        </div>

        {/* 4 Summary Highlight Cards (Responsive 1 col mobile, 2 cols tablet, 4 cols desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {/* Card 1: Total Data Volume */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span>총 데이터셋 용량</span>
              <HardDrive className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {calculations.totalGb < 1024
                ? `${calculations.totalGb.toFixed(1)} GB`
                : `${calculations.totalTb.toFixed(2)} TB`}
            </div>
            <p className="mt-2 text-xs text-slate-400">
              이미지 {datasetSize.toLocaleString()} 장 + 어노테이션
            </p>
          </div>

          {/* Card 2: Cloud Storage Cost */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span>스토리지 총 비용 ({storageMonths}개월)</span>
              <Cloud className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight">
              {formatCost(calculations.totalStorageCostUsd)}
            </div>
            <p className="mt-2 text-xs text-slate-400">
              월 평균 {formatCost(calculations.monthlyStorageCostUsd)} / 월
            </p>
          </div>

          {/* Card 3: GPU Compute Cost */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span>GPU 연산/학습 비용</span>
              <Cpu className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 tracking-tight">
              {formatCost(calculations.totalGpuCostUsd)}
            </div>
            <p className="mt-2 text-xs text-slate-400">
              총 {calculations.totalGpuHours.toFixed(1)} 시간 소요 ({formatCost(calculations.hourlyGpuRate)}/h)
            </p>
          </div>

          {/* Card 4: Grand Total */}
          <div className="bg-gradient-to-br from-emerald-950/80 via-slate-900 to-sky-950/60 border border-emerald-500/40 rounded-2xl p-5 relative overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between text-xs font-mono text-emerald-300 font-bold mb-2">
              <span>예상 총 소요 비용 (Total)</span>
              <Coins className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {formatCost(calculations.grandTotalUsd)}
            </div>
            <p className="mt-2 text-xs text-emerald-300/80">
              스토리지 + 전송 + GPU 연산 종합 합계
            </p>
          </div>
        </div>

        {/* Project Scale Cost Trend Line Chart (Recharts) */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-2xl mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1 font-mono">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Scalability & Cost Curve Analysis</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                프로젝트 규모별 운영 비용 추이 트렌드 (Project Scale Cost Trend)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                데이터셋 수량(1만 ~ 200만 장) 확장에 따른 클라우드 스토리지, GPU 연산 및 총비용 선형 증가 곡선과 온프레미스 BEP 비교
              </p>
            </div>

            {/* Quick scale selection pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400 mr-1 hidden md:inline">규모 즉시 선택:</span>
              {[
                { scale: 10000, label: '1만 (PoC)' },
                { scale: 100000, label: '10만 (상용)' },
                { scale: 500000, label: '50만 (광역)' },
                { scale: 1000000, label: '100만 (전국)' },
                { scale: 2000000, label: '200만 (AI-Hub)' }
              ].map(btn => (
                <button
                  key={btn.scale}
                  onClick={() => setDatasetSize(btn.scale)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    datasetSize === btn.scale
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recharts Container */}
          <div className="h-80 sm:h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={scaleTrendData}
                margin={{ top: 15, right: 25, left: 10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
                <XAxis
                  dataKey="label"
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  dy={10}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={yAxisCostFormatter}
                  dx={-5}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                  iconType="circle"
                />
                <Line
                  type="monotone"
                  dataKey="총 운영 비용"
                  stroke="#10b981"
                  strokeWidth={3}
                  activeDot={{ r: 7, stroke: '#34d399', strokeWidth: 2 }}
                  dot={{ r: 4, stroke: '#10b981', fill: '#064e3b' }}
                />
                <Line
                  type="monotone"
                  dataKey="GPU 연산비"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={{ r: 3.5, stroke: '#a855f7', fill: '#581c87' }}
                />
                <Line
                  type="monotone"
                  dataKey="스토리지/전송비"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={{ r: 3.5, stroke: '#38bdf8', fill: '#0c4a6e' }}
                />
                <Line
                  type="monotone"
                  dataKey="로컬 워크스테이션 TCO"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 3, stroke: '#f59e0b', fill: '#78350f' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Scale Highlights & Analysis Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800 text-xs">
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <div className="text-[11px] text-slate-400">소규모 PoC (1만 장)</div>
              <div className="text-sm font-bold text-white mt-1">
                {scaleTrendData[0] ? formatCost(scaleTrendData[0]['총 운영 비용'] / (currency === 'KRW' ? exchangeRate : 1)) : '-'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">클라우드가 압도적 유리</div>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <div className="text-[11px] text-slate-400">중규모 상용 (10만 장)</div>
              <div className="text-sm font-bold text-sky-400 mt-1">
                {scaleTrendData[2] ? formatCost(scaleTrendData[2]['총 운영 비용'] / (currency === 'KRW' ? exchangeRate : 1)) : '-'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">상용화 최적 표준 구간</div>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <div className="text-[11px] text-slate-400">대규모 ITS (100만 장)</div>
              <div className="text-sm font-bold text-purple-400 mt-1">
                {scaleTrendData[5] ? formatCost(scaleTrendData[5]['총 운영 비용'] / (currency === 'KRW' ? exchangeRate : 1)) : '-'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">워크스테이션 BEP 근접</div>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <div className="text-[11px] text-slate-400">초대규모 AI-Hub (200만 장)</div>
              <div className="text-sm font-bold text-emerald-400 mt-1">
                {scaleTrendData[6] ? formatCost(scaleTrendData[6]['총 운영 비용'] / (currency === 'KRW' ? exchangeRate : 1)) : '-'}
              </div>
              <div className="text-[10px] text-emerald-400/80 mt-0.5">전국망 공공 표준 규모</div>
            </div>
          </div>
        </div>

        {/* Main Interactive Controls & Breakdown (2 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Left Column: Parameter Sliders & Selectors (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Box 1: Dataset Volume & Image Specs */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
                <HardDrive className="w-5 h-5 text-sky-400" />
                <span>1. 데이터셋 규모 및 이미지 포맷 설정</span>
              </h3>

              {/* Dataset Size Slider */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-300">생성할 번호판 이미지 수량:</span>
                  <strong className="text-sky-400 font-mono text-sm">
                    {datasetSize.toLocaleString()} 장
                  </strong>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="2000000"
                  step="5000"
                  value={datasetSize}
                  onChange={(e) => setDatasetSize(Number(e.target.value))}
                  className="w-full accent-sky-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>5,000 장</span>
                  <span>50만 장</span>
                  <span>100만 장</span>
                  <span>200만 장</span>
                </div>
              </div>

              {/* Resolution Select */}
              <div className="space-y-2 mb-6">
                <label className="block text-xs font-semibold text-slate-300">
                  이미지 해상도 규격:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {RESOLUTION_PRESETS.map((res) => (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() => setSelectedResolution(res.id)}
                      className={`text-left p-3 rounded-xl border text-xs transition-all ${
                        selectedResolution === res.id
                          ? 'bg-sky-950/70 border-sky-500 text-white shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span>{res.label}</span>
                        <span className="font-mono text-[10px] text-slate-400">~{res.sizeKb} KB</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">{res.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Compression Format & Annotations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800/80">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    압축/저장 포맷:
                  </label>
                  <select
                    value={compressionRatio}
                    onChange={(e) => setCompressionRatio(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                  >
                    <option value={0.65}>WebP (고효율 압축, 용량 35% 절감)</option>
                    <option value={1.0}>JPEG Q90 (산업 표준, 기본값)</option>
                    <option value={3.2}>무압축 PNG (무손실 원본, 용량 3.2배)</option>
                    <option value={0.9}>WebDataset / Tar (샤딩 패키지, I/O 최적화)</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeAnnotations}
                      onChange={(e) => setIncludeAnnotations(e.target.checked)}
                      className="accent-sky-500 rounded"
                    />
                    <span>4점 폴리곤 & BBox 메타데이터 (+15KB/장)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Box 2: Cloud Storage & Egress Config */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
                <Cloud className="w-5 h-5 text-emerald-400" />
                <span>2. 클라우드 스토리지 제공자 및 보관 기간</span>
              </h3>

              {/* Storage Provider Selection */}
              <div className="space-y-2 mb-5">
                <label className="block text-xs font-semibold text-slate-300">
                  스토리지 티어 선택:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {STORAGE_TIERS.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setSelectedStorage(st.id)}
                      className={`text-left p-3 rounded-xl border text-xs transition-all ${
                        selectedStorage === st.id
                          ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/30'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>{st.name}</span>
                        <span className="font-mono text-emerald-400 text-[11px]">
                          ${st.costPerGbMonth}/GB/mo
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {st.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Retention Months & Egress Downloads */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800/80">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-300">클라우드 보관 기간:</span>
                    <strong className="text-emerald-400 font-mono">{storageMonths} 개월</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="36"
                    value={storageMonths}
                    onChange={(e) => setStorageMonths(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>1개월</span>
                    <span>12개월 (1년)</span>
                    <span>36개월 (3년)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-300">월간 전체 다운로드(Egress):</span>
                    <strong className="text-emerald-400 font-mono">{egressDownloadsPerMonth} 회 / 월</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={egressDownloadsPerMonth}
                    onChange={(e) => setEgressDownloadsPerMonth(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>0회 (로컬 캐시)</span>
                    <span>1회 (월간 훈련)</span>
                    <span>5회 (다중 노드)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Box 3: GPU Instance & Compute Pipeline */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-purple-400" />
                  <span>3. GPU 가속기 및 연산 파이프라인</span>
                </h3>

                {/* Spot Instance Toggle */}
                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-purple-300 font-semibold">
                  <input
                    type="checkbox"
                    checked={useSpotInstance}
                    onChange={(e) => setUseSpotInstance(e.target.checked)}
                    className="accent-purple-500 rounded"
                  />
                  <span>스팟/Preemptible 60% 할인 적용</span>
                </label>
              </div>

              {/* GPU Select */}
              <div className="space-y-2 mb-5">
                <label className="block text-xs font-semibold text-slate-300">
                  GPU 인스턴스 선택:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {GPU_INSTANCES.map((gpu) => (
                    <button
                      key={gpu.id}
                      type="button"
                      onClick={() => setSelectedGpu(gpu.id)}
                      className={`text-left p-3 rounded-xl border text-xs transition-all ${
                        selectedGpu === gpu.id
                          ? 'bg-purple-950/60 border-purple-500 text-white shadow-sm ring-1 ring-purple-500/30'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>{gpu.name}</span>
                        <span className="font-mono text-purple-400 text-[11px]">
                          ${useSpotInstance ? gpu.spotCostPerHour : gpu.costPerHour}/h
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {gpu.desc}
                      </div>
                      <div className="mt-2 text-[10px] font-mono text-slate-500">
                        초당 {gpu.throughputImgPerSec}장 합성/증강
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pipeline Type & Epochs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800/80">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    연산 범위:
                  </label>
                  <select
                    value={pipelineType}
                    onChange={(e) => setPipelineType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="full">전체 파이프라인 (합성 생성 + YOLO/CRNN 학습)</option>
                    <option value="generation">합성 데이터 생성 & 증강만</option>
                    <option value="training">딥러닝 모델 훈련(Training)만</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-300">학습 에포크 (Epochs):</span>
                    <strong className="text-purple-400 font-mono">{trainingEpochs} 에포크</strong>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    step="25"
                    value={trainingEpochs}
                    onChange={(e) => setTrainingEpochs(Number(e.target.value))}
                    className="w-full accent-purple-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>50 ep</span>
                    <span>150 ep (추천)</span>
                    <span>500 ep</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Cost Analysis & TCO Comparison (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Cost Breakdown Ledger Card */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl">
              <h3 className="text-base font-bold text-white flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <span className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  <span>비용 명세 내역서 (Itemized Ledger)</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {currency} 기준
                </span>
              </h3>

              <div className="space-y-3.5 text-xs">
                {/* Line 1: Storage */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-200">클라우드 스토리지 보관비</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {calculations.totalGb.toFixed(1)} GB × {calculations.storageTier.name} × {storageMonths}개월
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold font-mono text-white text-sm">
                      {formatCost(calculations.totalStorageCostUsd)}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      (월 {formatCost(calculations.monthlyStorageCostUsd)})
                    </div>
                  </div>
                </div>

                {/* Line 2: Egress */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-200">네트워크 데이터 송신 (Egress)</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      월 {egressDownloadsPerMonth}회 전체 전송 × {storageMonths}개월
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold font-mono text-white text-sm">
                      {formatCost(calculations.totalEgressCostUsd)}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      (월 {formatCost(calculations.monthlyEgressCostUsd)})
                    </div>
                  </div>
                </div>

                {/* Line 3: GPU Compute */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-200">GPU 인스턴스 연산비</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {calculations.gpu.name} ({calculations.totalGpuHours.toFixed(1)}시간)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold font-mono text-purple-400 text-sm">
                      {formatCost(calculations.totalGpuCostUsd)}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      ({formatCost(calculations.hourlyGpuRate)}/h)
                    </div>
                  </div>
                </div>

                {/* Divider & Total */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="font-bold text-slate-300 text-sm">총 예상 인프라 비용:</span>
                  <span className="font-black font-mono text-xl text-emerald-400">
                    {formatCost(calculations.grandTotalUsd)}
                  </span>
                </div>
              </div>
            </div>

            {/* TCO Comparison: Public Cloud vs Local Workstation */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800 mb-4">
                <TrendingDown className="w-5 h-5 text-sky-400" />
                <span>TCO 비교: 퍼블릭 클라우드 vs 로컬 워크스테이션</span>
              </h3>

              <div className="space-y-4 text-xs">
                {/* Cloud Option */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sky-400 flex items-center gap-1.5">
                      <Cloud className="w-4 h-4" />
                      <span>옵션 A: 퍼블릭 클라우드 종량제 (AWS/GCP/RunPod)</span>
                    </span>
                    <span className="font-mono font-bold text-sm text-white">
                      {formatCost(calculations.grandTotalUsd)}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    초기 투자비 $0. 필요한 시간만큼 인스턴스를 띄우고 즉시 정지 가능. 유지보수 및 하드웨어 고장 리스크 제로.
                  </p>
                </div>

                {/* On-Prem Option */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <Server className="w-4 h-4" />
                      <span>옵션 B: 로컬 전용 워크스테이션 구매 (온프레미스)</span>
                    </span>
                    <span className="font-mono font-bold text-sm text-white">
                      {formatCost(calculations.localTcoUsd)}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    하드웨어 구매비({formatCost(calculations.onPremHardwareInvestUsd)}) + 전기료. 
                    연중 24시간 연속 학습 및 수십 차례 재학습 파이프라인 가동 시 1년 내 클라우드 대비 비용 손익분기점(BEP) 달성.
                  </p>
                </div>

                {/* Decision Insight */}
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs leading-relaxed flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    {calculations.grandTotalUsd < calculations.localTcoUsd ? (
                      <span>
                        현재 프로젝트 규모에서는 <strong>퍼블릭 클라우드(RunPod + S3)</strong>를 활용하는 것이 
                        약 <strong className="text-white">{formatCost(calculations.localTcoUsd - calculations.grandTotalUsd)}</strong> 더 경제적입니다.
                      </span>
                    ) : (
                      <span>
                        연산량이 많은 대형 프로젝트입니다. <strong>로컬 워크스테이션(RTX 4090 데스크톱)</strong>을 직접 구축하는 것이 
                        장기적으로 약 <strong className="text-white">{formatCost(calculations.grandTotalUsd - calculations.localTcoUsd)}</strong> 절감됩니다.
                      </span>
                    )}
                  </div>
                </div>

                {/* Report Download Quick Trigger */}
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">종합 사양 및 산출서 내보내기:</span>
                  <button
                    type="button"
                    onClick={() => setShowReportModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>요약 보고서(PDF/TXT) 생성</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 4 Cost Optimization Tips */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>데이터셋 인프라 비용 절감 4대 원칙</span>
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>WebDataset / Tar 샤딩</strong>: 낱개 파일 대신 1GB 단위 tar로 묶어 S3 GET 요청 비용과 파일 I/O 병목을 90% 절감.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>스팟 인스턴스(Spot)</strong>: GPU 학습 시 중단 복구 체크포인트를 설정하고 스팟 인스턴스를 사용하여 60~70% 할인.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>라이프사이클 수명 정책</strong>: 훈련 완료 후 원천 데이터셋을 Nearline / Glacier 아카이브로 자동 이동하여 스토리지 75% 절감.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>로컬 증강 파이프라인</strong>: 로컬 PC에서 Albumentations로 On-the-fly 증강하여 클라우드 업로드 대역폭 최소화.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    데이터셋 인프라 비용 추정 요약 보고서
                  </h3>
                  <p className="text-xs text-slate-400">
                    현재 설정된 스토리지, GPU 연산 및 TCO 종합 견적서 (PDF / TXT 즉시 다운로드)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics Bar in Modal */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-slate-950/40 border-b border-slate-800 text-xs">
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                <div className="text-slate-400 text-[11px]">데이터셋 규모</div>
                <div className="text-sm font-bold text-sky-400 mt-0.5">{datasetSize.toLocaleString()} 장</div>
                <div className="text-[10px] text-slate-500">{calculations.totalGb.toFixed(1)} GB ({calculations.totalTb.toFixed(2)} TB)</div>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                <div className="text-slate-400 text-[11px]">스토리지 ({storageMonths}개월)</div>
                <div className="text-sm font-bold text-amber-400 mt-0.5">{formatCost(calculations.totalStorageCostUsd)}</div>
                <div className="text-[10px] text-slate-500">{calculations.storageTier.name}</div>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                <div className="text-slate-400 text-[11px]">GPU 연산 비용</div>
                <div className="text-sm font-bold text-indigo-400 mt-0.5">{formatCost(calculations.totalGpuCostUsd)}</div>
                <div className="text-[10px] text-slate-500">{calculations.totalGpuHours.toFixed(1)}h 소요</div>
              </div>
              <div className="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/40">
                <div className="text-emerald-300 text-[11px]">총 예상 비용 (Grand Total)</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">{formatCost(calculations.grandTotalUsd)}</div>
                <div className="text-[10px] text-emerald-400/80">{currency === 'KRW' ? '원화 기준' : '달러 기준'}</div>
              </div>
            </div>

            {/* Modal Body: Report Preview */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 font-mono text-xs text-slate-300 leading-relaxed bg-slate-950/70">
              <pre className="whitespace-pre-wrap font-mono text-[11px] sm:text-xs text-slate-300 selection:bg-emerald-500/30 selection:text-emerald-200">
                {summaryReportText}
              </pre>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCopyFullReport}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                >
                  {reportCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                  <span>{reportCopied ? '전체 복사됨!' : '텍스트 복사'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleDownloadTextReport}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <Download className="w-4 h-4 text-sky-400" />
                  <span>텍스트 (.txt) 다운로드</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPdfReport}
                  disabled={isGeneratingPdf}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  <FileDown className="w-4 h-4 text-slate-950" />
                  <span>{isGeneratingPdf ? 'PDF 생성 중...' : 'PDF 보고서 다운로드 (.pdf)'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
