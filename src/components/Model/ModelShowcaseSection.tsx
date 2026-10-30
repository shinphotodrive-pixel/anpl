import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import {
  Brain,
  Cpu,
  Layers,
  Zap,
  CheckCircle2,
  XCircle,
  Code2,
  Terminal,
  Activity,
  Sliders,
  ShieldAlert,
  ArrowRight,
  Copy,
  Check,
  Eye,
  FileCode,
  HardDrive,
  Compass,
  TrendingUp,
  Workflow,
  Sparkles,
  Camera,
  Search,
  ScanLine,
  Maximize2,
  FileCheck,
  RefreshCw,
  X
} from 'lucide-react';

interface HardwareBenchmark {
  hardware: string;
  category: 'pc_gpu' | 'pc_cpu' | 'edge_sbc' | 'embedded';
  yolov8n_lprnet: { fps: number; latency: number; accuracy: number };
  picodet_crnn: { fps: number; latency: number; accuracy: number };
  opencv_dnn_cpu: { fps: number; latency: number; accuracy: number };
  recommendedPipeline: string;
  notes: string;
}

const HARDWARE_BENCHMARKS: HardwareBenchmark[] = [
  {
    hardware: 'NVIDIA Jetson Orin Nano (8GB)',
    category: 'embedded',
    yolov8n_lprnet: { fps: 78, latency: 12.8, accuracy: 99.4 },
    picodet_crnn: { fps: 62, latency: 16.1, accuracy: 99.7 },
    opencv_dnn_cpu: { fps: 28, latency: 35.7, accuracy: 97.8 },
    recommendedPipeline: 'ONNX Runtime (TensorRT EP) + FP16 양자화',
    notes: '산업용 스마트 주차관제/CCTV 카메라 일체형 시스템의 표준 레퍼런스'
  },
  {
    hardware: 'Intel Core i5-12400 (내장 UHD 730 / CPU Only)',
    category: 'pc_cpu',
    yolov8n_lprnet: { fps: 45, latency: 22.2, accuracy: 99.2 },
    picodet_crnn: { fps: 38, latency: 26.3, accuracy: 99.5 },
    opencv_dnn_cpu: { fps: 54, latency: 18.5, accuracy: 98.1 },
    recommendedPipeline: 'OpenCV DNN (OpenVINO Backend) 또는 ONNX Runtime (OpenVINO EP)',
    notes: '별도 외장 그래픽카드 없이 일반 산업용 IPC PC에서 4채널 동시 처리 가능'
  },
  {
    hardware: 'Raspberry Pi 5 (8GB ARM Cortex-A76)',
    category: 'edge_sbc',
    yolov8n_lprnet: { fps: 22, latency: 45.4, accuracy: 98.9 },
    picodet_crnn: { fps: 16, latency: 62.5, accuracy: 99.3 },
    opencv_dnn_cpu: { fps: 24, latency: 41.6, accuracy: 97.4 },
    recommendedPipeline: 'ONNX Runtime INT8 양자화 (ARM NEON 가속) + LPRNet',
    notes: '초저전력 단독형 번호판 인식 게이트웨이 및 이동식 단속기 구현'
  },
  {
    hardware: 'NVIDIA RTX 4060 (워커 서버 / 클라우드)',
    category: 'pc_gpu',
    yolov8n_lprnet: { fps: 240, latency: 4.1, accuracy: 99.6 },
    picodet_crnn: { fps: 185, latency: 5.4, accuracy: 99.8 },
    opencv_dnn_cpu: { fps: 95, latency: 10.5, accuracy: 98.2 },
    recommendedPipeline: 'TensorRT 8.6 + Dynamic Batching (16~32 채널 동시 LPR)',
    notes: '고속도로 톨게이트 8~16개 차로 통합 집중 관제 서버 최적화'
  }
];

export const ModelShowcaseSection: React.FC = () => {
  // Navigation Tabs: Overview, Inference Engines, YOLO & INT8, LPR OCR, Super-Resolution, Korean Regex, Hardware Benchmark, Production Code
  const [activeTab, setActiveTab] = useState<
    'overview' | 'engine' | 'yolo' | 'ocr' | 'enhancement' | 'korean' | 'benchmarks' | 'code'
  >('overview');

  const [copiedCodeKey, setCopiedCodeKey] = useState<string | null>(null);
  const [selectedHw, setSelectedHw] = useState<number>(0);
  const [archModalOpen, setArchModalOpen] = useState<boolean>(false);

  // Tab 1: Pipeline Simulator State
  const [pipelineScenario, setPipelineScenario] = useState<'sunny' | 'night' | 'blurry'>('sunny');

  // Tab 3: Quantization Metric Switcher
  const [quantMetric, setQuantMetric] = useState<'fps' | 'latency' | 'vram'>('fps');

  // Tab 5: Image Enhancement Simulator State
  const [enhanceMode, setEnhanceMode] = useState<'raw' | 'clahe' | 'sr'>('sr');

  // Tab 6: Korean Regex Validator State
  const [regexInput, setRegexInput] = useState<string>('123O가4568');

  // Canvas Refs for Chart.js
  const engineChartRef = useRef<HTMLCanvasElement | null>(null);
  const engineChartInstance = useRef<Chart | null>(null);

  const quantChartRef = useRef<HTMLCanvasElement | null>(null);
  const quantChartInstance = useRef<Chart | null>(null);

  const ocrChartRef = useRef<HTMLCanvasElement | null>(null);
  const ocrChartInstance = useRef<Chart | null>(null);

  const superResChartRef = useRef<HTMLCanvasElement | null>(null);
  const superResChartInstance = useRef<Chart | null>(null);

  const trajectoryChartRef = useRef<HTMLCanvasElement | null>(null);
  const trajectoryChartInstance = useRef<Chart | null>(null);

  const handleCopyCode = (key: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeKey(key);
    setTimeout(() => setCopiedCodeKey(null), 2000);
  };

  // ----------------------------------------------------
  // Chart 1: Engine Comparison Chart (Tab 'engine')
  // ----------------------------------------------------
  useEffect(() => {
    if (activeTab === 'engine' && engineChartRef.current) {
      if (engineChartInstance.current) {
        engineChartInstance.current.destroy();
      }
      const ctx = engineChartRef.current.getContext('2d');
      if (ctx) {
        engineChartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Raspberry Pi 5 (CPU)', 'ARM Cortex-A53 (CPU)', 'Jetson Orin NX (GPU CUDA)'],
            datasets: [
              {
                label: 'OpenCV 5 DNN (ms)',
                data: [13.6, 45.2, 8.5],
                backgroundColor: '#f59e0b',
                borderRadius: 6
              },
              {
                label: 'ONNX Runtime / TensorRT (ms)',
                data: [30.7, 88.0, 3.49],
                backgroundColor: '#6366f1',
                borderRadius: 6
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                labels: { color: '#94a3b8', font: { size: 12 } }
              },
              tooltip: {
                callbacks: {
                  label: (context) => `${context.dataset.label}: ${context.parsed.y} ms`
                }
              }
            },
            scales: {
              x: {
                ticks: { color: '#94a3b8', font: { size: 11 } },
                grid: { color: 'rgba(148, 163, 184, 0.1)' }
              },
              y: {
                beginAtZero: true,
                title: { display: true, text: '지연 시간 Latency (ms - 낮을수록 우수)', color: '#94a3b8' },
                ticks: { color: '#94a3b8', font: { size: 11 } },
                grid: { color: 'rgba(148, 163, 184, 0.1)' }
              }
            }
          }
        });
      }
    }
    return () => {
      if (engineChartInstance.current) {
        engineChartInstance.current.destroy();
        engineChartInstance.current = null;
      }
    };
  }, [activeTab]);

  // ----------------------------------------------------
  // Chart 2: Quantization Chart (Tab 'yolo')
  // ----------------------------------------------------
  useEffect(() => {
    if (activeTab === 'yolo' && quantChartRef.current) {
      if (quantChartInstance.current) {
        quantChartInstance.current.destroy();
      }
      const ctx = quantChartRef.current.getContext('2d');
      if (ctx) {
        let dataset1Data = [30, 50, 63];
        let dataset2Data = [28, 48, 65];
        let yTitle = '초당 프레임 수 (FPS)';

        if (quantMetric === 'latency') {
          dataset1Data = [21.9, 7.3, 3.49];
          dataset2Data = [22.5, 7.8, 3.61];
          yTitle = '지연 시간 (ms)';
        } else if (quantMetric === 'vram') {
          dataset1Data = [2.1, 1.2, 0.8];
          dataset2Data = [2.3, 1.3, 0.85];
          yTitle = 'VRAM 메모리 (GB)';
        }

        quantChartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['FP32 (PyTorch)', 'FP16 (TensorRT)', 'INT8 (TensorRT)'],
            datasets: [
              {
                label: 'YOLOv8 Nano',
                data: dataset1Data,
                backgroundColor: '#10b981',
                borderRadius: 6
              },
              {
                label: 'YOLOv8 Small',
                data: dataset2Data,
                backgroundColor: '#f59e0b',
                borderRadius: 6
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                labels: { color: '#94a3b8', font: { size: 12 } }
              }
            },
            scales: {
              x: {
                ticks: { color: '#94a3b8', font: { size: 11 } },
                grid: { color: 'rgba(148, 163, 184, 0.1)' }
              },
              y: {
                beginAtZero: true,
                title: { display: true, text: yTitle, color: '#94a3b8' },
                ticks: { color: '#94a3b8', font: { size: 11 } },
                grid: { color: 'rgba(148, 163, 184, 0.1)' }
              }
            }
          }
        });
      }
    }
    return () => {
      if (quantChartInstance.current) {
        quantChartInstance.current.destroy();
        quantChartInstance.current = null;
      }
    };
  }, [activeTab, quantMetric]);

  // ----------------------------------------------------
  // Chart 3: OCR Comparison Radar Chart (Tab 'ocr')
  // ----------------------------------------------------
  useEffect(() => {
    if (activeTab === 'ocr' && ocrChartRef.current) {
      if (ocrChartInstance.current) {
        ocrChartInstance.current.destroy();
      }
      const ctx = ocrChartRef.current.getContext('2d');
      if (ctx) {
        ocrChartInstance.current = new Chart(ctx, {
          type: 'radar',
          data: {
            labels: ['추론 속도', '기울임 강건성 (STN)', '경량성 (파일 크기)', '다국어 확장성', '라인 정확도'],
            datasets: [
              {
                label: 'LPRNet',
                data: [95, 96, 98, 40, 85],
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.25)',
                borderWidth: 2,
                pointBackgroundColor: '#f59e0b'
              },
              {
                label: 'PP-OCRv4 Mobile',
                data: [80, 85, 90, 95, 92],
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.25)',
                borderWidth: 2,
                pointBackgroundColor: '#6366f1'
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                labels: { color: '#94a3b8', font: { size: 12 } }
              }
            },
            scales: {
              r: {
                angleLines: { color: 'rgba(148, 163, 184, 0.2)' },
                grid: { color: 'rgba(148, 163, 184, 0.15)' },
                pointLabels: { color: '#cbd5e1', font: { size: 11, weight: 'bold' } },
                suggestedMin: 0,
                suggestedMax: 100,
                ticks: { backdropColor: 'transparent', color: '#94a3b8' }
              }
            }
          }
        });
      }
    }
    return () => {
      if (ocrChartInstance.current) {
        ocrChartInstance.current.destroy();
        ocrChartInstance.current = null;
      }
    };
  }, [activeTab]);

  // ----------------------------------------------------
  // Chart 4: Super Resolution Chart (Tab 'enhancement')
  // ----------------------------------------------------
  useEffect(() => {
    if (activeTab === 'enhancement' && superResChartRef.current) {
      if (superResChartInstance.current) {
        superResChartInstance.current.destroy();
      }
      const ctx = superResChartRef.current.getContext('2d');
      if (ctx) {
        superResChartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['PSNR (dB)', 'SSIM (x100)', 'YOLO mAP@0.5 (%)', 'OCR 정확도 (%)'],
            datasets: [
              {
                label: '적용 전 (열화 이미지)',
                data: [22.1, 68, 62.1, 65.4],
                backgroundColor: '#94a3b8',
                borderRadius: 6
              },
              {
                label: 'Real-ESRGAN 적용 후',
                data: [26.31, 80, 85.36, 91.16],
                backgroundColor: '#10b981',
                borderRadius: 6
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                labels: { color: '#94a3b8', font: { size: 12 } }
              }
            },
            scales: {
              x: {
                ticks: { color: '#94a3b8', font: { size: 11 } },
                grid: { color: 'rgba(148, 163, 184, 0.1)' }
              },
              y: {
                beginAtZero: true,
                ticks: { color: '#94a3b8', font: { size: 11 } },
                grid: { color: 'rgba(148, 163, 184, 0.1)' }
              }
            }
          }
        });
      }
    }
    return () => {
      if (superResChartInstance.current) {
        superResChartInstance.current.destroy();
        superResChartInstance.current = null;
      }
    };
  }, [activeTab]);

  // ----------------------------------------------------
  // Chart 5: Trajectory Smoothing Chart (Tab 'korean')
  // ----------------------------------------------------
  useEffect(() => {
    if (activeTab === 'korean' && trajectoryChartRef.current) {
      if (trajectoryChartInstance.current) {
        trajectoryChartInstance.current.destroy();
      }
      const ctx = trajectoryChartRef.current.getContext('2d');
      if (ctx) {
        trajectoryChartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['단일 프레임 (1F)', '2프레임 시계열', '3프레임 연관', '4프레임 보정', '5프레임 다수결 통합'],
            datasets: [
              {
                label: '문자 인식 정확도 (%)',
                data: [29.9, 34.2, 38.0, 40.5, 42.3],
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                fill: true,
                tension: 0.35,
                pointRadius: 5,
                pointBackgroundColor: '#f59e0b'
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                labels: { color: '#94a3b8', font: { size: 12 } }
              }
            },
            scales: {
              x: {
                ticks: { color: '#94a3b8', font: { size: 11 } },
                grid: { color: 'rgba(148, 163, 184, 0.1)' }
              },
              y: {
                suggestedMin: 20,
                suggestedMax: 50,
                title: { display: true, text: '성능 반등 (%)', color: '#94a3b8' },
                ticks: { color: '#94a3b8', font: { size: 11 } },
                grid: { color: 'rgba(148, 163, 184, 0.1)' }
              }
            }
          }
        });
      }
    }
    return () => {
      if (trajectoryChartInstance.current) {
        trajectoryChartInstance.current.destroy();
        trajectoryChartInstance.current = null;
      }
    };
  }, [activeTab]);

  // ----------------------------------------------------
  // Korean Plate Regex Parsing Logic
  // ----------------------------------------------------
  const regexResult = (() => {
    const input = regexInput.trim();
    if (!input) {
      return {
        raw: '(빈 값)',
        format: '-',
        corrected: '-',
        status: 'WAITING',
        statusText: '입력 대기중'
      };
    }

    const pattern8 = /^(\d{2,3})([O0-9])([가-힣])(\d{4})$/;
    const pattern7 = /^(\d{2})([가-힣])(\d{4})$/;
    const patternRegion = /^([가-힣]{2})(\d{2})([가-힣])(\d{4})$/;

    let corrected = input;
    let format = '알 수 없는 규격';
    let isValid = false;

    if (pattern8.test(input)) {
      format = '신형 8자리 비사업용 (RPA3)';
      const match = input.match(pattern8);
      if (match) {
        const numPart1 = match[1];
        let possO = match[2];
        const hangul = match[3];
        const numPart2 = match[4];
        if (possO === 'O') possO = '0';
        corrected = `${numPart1}${possO}${hangul} ${numPart2}`;
        isValid = true;
      }
    } else if (input.includes('O') || input.includes('B')) {
      const temp = input.replace(/O/g, '0').replace(/B/g, '8');
      if (pattern8.test(temp)) {
        format = '신형 8자리 (휴리스틱 자동 교정 적용)';
        const match = temp.match(pattern8);
        if (match) {
          corrected = `${match[1]}${match[2]}${match[3]} ${match[4]}`;
          isValid = true;
        }
      }
    }

    if (!isValid && pattern7.test(input)) {
      format = '구형 7자리 일반 (RPA1/2)';
      const match = input.match(pattern7);
      if (match) {
        corrected = `${match[1]}${match[2]} ${match[3]}`;
        isValid = true;
      }
    }

    if (!isValid && patternRegion.test(input)) {
      format = '지역명이 포함된 영업용/특수 번호판';
      const match = input.match(patternRegion);
      if (match) {
        corrected = `${match[1]} ${match[2]}${match[3]} ${match[4]}`;
        isValid = true;
      }
    }

    return {
      raw: input,
      format,
      corrected,
      status: isValid ? 'PASSED' : 'WARNING',
      statusText: isValid ? 'PASSED (자동 교정 및 규격 일치)' : 'WARNING (정규표현식 검증 실패)'
    };
  })();

  const sampleOpencvDnnCode = `# ========================================================
# 1. OpenCV DNN 모듈 기반 초경량 번호판 검출 및 인식 파이프라인
# 의존성: opencv-python (PyTorch, TensorFlow 완전 불필요!)
# ========================================================
import cv2
import numpy as np

# 1) OpenCV DNN ONNX 가중치 로드 (C++/Python 동일 문법)
detector_net = cv2.dnn.readNetFromONNX("models/plate_yolov8n.onnx")
recognizer_net = cv2.dnn.readNetFromONNX("models/lprnet_korean.onnx")

# 2) 백엔드 및 타겟 가속 설정 (Intel CPU OpenVINO 가속 or CUDA)
detector_net.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCV)
detector_net.setPreferableTarget(cv2.dnn.DNN_TARGET_CPU)

def detect_and_recognize(frame):
    # 3) 입력 영상 Blob 생성 (1/255.0 스케일링, 640x640 정규화)
    blob = cv2.dnn.blobFromImage(frame, 1/255.0, (640, 640), swapRB=True, crop=False)
    detector_net.setInput(blob)
    outputs = detector_net.forward()
    
    # 4) NMS 후처리 및 번호판 영역 크롭 (Perspective Rectification 포함)
    boxes, confidences = postprocess_yolo(outputs, frame.shape)
    indices = cv2.dnn.NMSBoxes(boxes, confidences, score_threshold=0.5, nms_threshold=0.45)
    
    results = []
    for i in indices:
        x, y, w, h = boxes[i]
        plate_roi = frame[y:y+h, x:x+w]
        
        # 5) LPRNet 전처리 (94x24 또는 128x32 크기 정규화)
        rec_blob = cv2.dnn.blobFromImage(plate_roi, 1/127.5, (94, 24), mean=(127.5, 127.5, 127.5), swapRB=True)
        recognizer_net.setInput(rec_blob)
        preds = recognizer_net.forward() # Shape: (1, 68_classes, 18_timestamps)
        
        # 6) CTC Greedy 디코딩 및 문법 마스킹(Syntax Regex Constraint)
        plate_text = ctc_decode_with_grammar(preds)
        results.append({"bbox": (x, y, w, h), "text": plate_text, "conf": confidences[i]})
        
    return results`;

  const sampleOnnxRuntimeCode = `# ========================================================
# 2. ONNX Runtime (ORT) 고성능 추론 엔진 (INT8 양자화 & TensorRT EP)
# ========================================================
import onnxruntime as ort
import numpy as np
import cv2

providers = [
    ('CUDAExecutionProvider', {
        'device_id': 0,
        'arena_extend_strategy': 'kNextPowerOfTwo',
        'gpu_mem_limit': 2 * 1024 * 1024 * 1024,
    }),
    'CPUExecutionProvider'
]

session_options = ort.SessionOptions()
session_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
det_session = ort.InferenceSession("models/plate_nano_int8.onnx", session_options, providers=providers)
rec_session = ort.InferenceSession("models/svtr_korean_int8.onnx", session_options, providers=providers)

def infer_lpr_pipeline(image_path):
    img = cv2.imread(image_path)
    input_tensor = preprocess_letterbox(img, (640, 640))
    input_name = det_session.get_inputs()[0].name
    
    detections = det_session.run(None, {input_name: input_tensor})[0]
    plate_patch = warp_perspective_plate(img, detections[0][:4])
    rec_input = preprocess_rec(plate_patch, (32, 128))
    rec_out = rec_session.run(None, {rec_session.get_inputs()[0].name: rec_input})[0]
    
    return decode_korean_plate_grammar(rec_out)`;

  const sampleCppCode = `// ========================================================
// 3. 산업용 C++ 배포 파이프라인 (무의존성 OpenCV C++ dnn::Net)
// ========================================================
#include <opencv2/opencv.hpp>
#include <opencv2/dnn.hpp>
#include <iostream>

class FastLPREngine {
private:
    cv::dnn::Net detNet;
    cv::dnn::Net recNet;
public:
    FastLPREngine(const std::string& detOnnx, const std::string& recOnnx) {
        detNet = cv::dnn::readNetFromONNX(detOnnx);
        recNet = cv::dnn::readNetFromONNX(recOnnx);
        
        detNet.setPreferableBackend(cv::dnn::DNN_BACKEND_INFERENCE_ENGINE);
        detNet.setPreferableTarget(cv::dnn::DNN_TARGET_CPU);
    }
    
    std::string recognize(const cv::Mat& frame) {
        cv::Mat blob;
        cv::dnn::blobFromImage(frame, 1/255.0, cv::Size(640, 640), cv::Scalar(), true, false);
        detNet.setInput(blob);
        cv::Mat outs = detNet.forward();
        
        cv::Mat alignedPlate = alignPerspectiveCorners(frame, outs);
        cv::Mat recBlob;
        cv::dnn::blobFromImage(alignedPlate, 1/128.0, cv::Size(94, 24), cv::Scalar(127.5, 127.5, 127.5), true);
        recNet.setInput(recBlob);
        cv::Mat logits = recNet.forward();
        
        return decodeGrammarSyntax(logits);
    }
};`;

  return (
    <section id="models" className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-xs sm:text-sm font-semibold text-amber-300 backdrop-blur-sm">
              <Brain className="w-4 h-4 text-amber-400" />
              <span>ITS 지능형 교통 시스템 · ANPR 엣지 AI 모델 심층 분석 시스템</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              OpenCV 5 DNN, TensorRT INT8, LPRNet & 한국형 규격 후처리
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              OpenCV 5 그래프 기반 엔진부터 TensorRT INT8 양자화, LPRNet vs PP-OCRv4 Mobile, Real-ESRGAN 초해상화, 그리고 한국 국토교통부 표준 문법 Regex 자동 교정까지{' '}
              <strong className="text-amber-300">온디바이스 99.8%+ 고정밀 ANPR 솔루션</strong>을 완벽히 구축합니다.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2.5">
            <div className="px-3 py-1.5 bg-slate-800/90 text-emerald-400 rounded-xl border border-slate-700/80 flex items-center gap-2 text-xs font-semibold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>온디바이스 99%+ 실현</span>
            </div>
            <button
              onClick={() => setArchModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>💡 핵심 권고안 요약</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs (Scrollable) */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
        {[
          { id: 'overview', label: '📌 파이프라인 시뮬레이터', icon: Workflow },
          { id: 'engine', label: '⚡ 추론 엔진 (OpenCV vs ONNX)', icon: Cpu },
          { id: 'yolo', label: '🎯 YOLO 탐지 & INT8 양자화', icon: Zap },
          { id: 'ocr', label: '🔤 LPR OCR (LPRNet vs PP-OCR)', icon: Layers },
          { id: 'enhancement', label: '🔬 저조도·초해상화 (Real-ESRGAN)', icon: Eye },
          { id: 'korean', label: '🇰🇷 한국형 규격 & Regex 검증', icon: FileCheck },
          { id: 'benchmarks', label: '📊 실측 벤치마크', icon: Activity },
          { id: 'code', label: '💻 실전 배포 코드', icon: Code2 }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/25'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: OVERVIEW & PIPELINE SIMULATOR
         ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Key Metrics Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-xs text-slate-500 font-medium">YOLOv8 INT8 속도</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                65 FPS <span className="text-xs text-emerald-500 font-normal">↑2.1x</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Jetson Orin NX 기준 (3.49ms)</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-xs text-slate-500 font-medium">OpenCV 5 연산자 지원</div>
              <div className="text-2xl font-black text-amber-500 mt-1">
                80%+ <span className="text-xs text-amber-600 dark:text-amber-400 font-normal">(과거 22%)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">그래프 기반 엔진 및 HAL 적용</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-xs text-slate-500 font-medium">PP-OCRv4 Mobile 크기</div>
              <div className="text-2xl font-black text-indigo-500 mt-1">6.8 MB</div>
              <p className="text-[11px] text-slate-500 mt-0.5">83.28% 라인 인식 정확도</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-xs text-slate-500 font-medium">초해상화 정확도 상승</div>
              <div className="text-2xl font-black text-emerald-500 mt-1">+25.76%</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Real-ESRGAN 전처리 후 OCR</p>
            </div>
          </div>

          {/* Interactive ANPR Pipeline Simulator Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <span>🎮</span> 대화형 ANPR 파이프라인 시뮬레이터 (Interactive Pipeline Simulator)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  주행 및 광학 조건을 선택하여 각 파이프라인 모듈의 모드와 예상 지연시간을 확인하세요.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">환경 프리셋:</span>
                <button
                  onClick={() => setPipelineScenario('sunny')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    pipelineScenario === 'sunny'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  주간 정상
                </button>
                <button
                  onClick={() => setPipelineScenario('night')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    pipelineScenario === 'night'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  야간 헤드라이트
                </button>
                <button
                  onClick={() => setPipelineScenario('blurry')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    pipelineScenario === 'blurry'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  원거리/저해상도
                </button>
              </div>
            </div>

            {/* 5-Step Pipeline Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* Step 1 */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
                    <span>단계 1</span>
                    <span className="text-amber-500 font-mono">0.2ms</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">프레임 캡처 & 전처리</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    기본 RGB 캡처 및 직렬화 차단 단일 메모리 블롭 생성.
                  </p>
                </div>
                <div className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-mono font-semibold text-center">
                  Standard Pass
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
                    <span>단계 2</span>
                    <span className="text-amber-500 font-mono">
                      {pipelineScenario === 'sunny' ? '0.0ms' : pipelineScenario === 'night' ? '1.8ms' : '14.5ms'}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">광학 보정 / 초해상화</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {pipelineScenario === 'sunny'
                      ? '조도 균일 상태로 전처리 생략 (Bypass).'
                      : pipelineScenario === 'night'
                      ? 'CLAHE + Retinex 히스토그램 동적 명암비 평활화.'
                      : 'Real-ESRGAN 4x 초경량 딥러닝 픽셀 재건.'}
                  </p>
                </div>
                <div
                  className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold text-center ${
                    pipelineScenario === 'sunny'
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      : pipelineScenario === 'night'
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                      : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300'
                  }`}
                >
                  {pipelineScenario === 'sunny' ? 'Bypass' : pipelineScenario === 'night' ? 'CLAHE + Retinex' : 'Real-ESRGAN 4x'}
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
                    <span>단계 3</span>
                    <span className="text-amber-500 font-mono">3.5ms</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">번호판 탐지 (LPD)</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    YOLOv8n TensorRT INT8 기반 ROI 바운딩 박스 추출.
                  </p>
                </div>
                <div className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded font-mono font-semibold text-center">
                  YOLOv8 INT8
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
                    <span>단계 4</span>
                    <span className="text-amber-500 font-mono">
                      {pipelineScenario === 'sunny' ? '5.0ms' : pipelineScenario === 'night' ? '5.2ms' : '5.5ms'}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">문자 인식 (LPR OCR)</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    STN 기반 기울임 보정 및 1D-Conv CTC 시퀀스 인식.
                  </p>
                </div>
                <div className="text-[10px] bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded font-mono font-semibold text-center">
                  LPRNet + STN
                </div>
              </div>

              {/* Step 5 */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
                    <span>단계 5</span>
                    <span className="text-amber-500 font-mono">
                      {pipelineScenario === 'sunny' ? '0.6ms' : pipelineScenario === 'night' ? '0.8ms' : '1.1ms'}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">Regex & 궤적 후처리</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    한국 8자리/7자리 문법 매핑 및 시계열 보정.
                  </p>
                </div>
                <div className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded font-mono font-semibold text-center">
                  Regex Mapping
                </div>
              </div>
            </div>

            {/* Live Result Bar */}
            <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-slate-400 font-medium">시뮬레이션 출력 결과:</span>
                <span className="font-mono text-lg font-black text-amber-400 bg-slate-950 px-3 py-1 rounded border border-slate-800">
                  {pipelineScenario === 'sunny'
                    ? '123가 4568'
                    : pipelineScenario === 'night'
                    ? '77나 1004'
                    : '380러 9281'}
                </span>
                <span className="bg-emerald-950 text-emerald-400 px-2.5 py-1 rounded border border-emerald-800 font-semibold">
                  {pipelineScenario === 'sunny'
                    ? '정상 인식 (신뢰도 99.4%)'
                    : pipelineScenario === 'night'
                    ? '조도 보정 후 성공 (98.1%)'
                    : '초해상화 복원 성공 (96.8%)'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <div>
                  총 지연시간:{' '}
                  <strong className="text-amber-400 text-sm">
                    {pipelineScenario === 'sunny' ? '9.3 ms' : pipelineScenario === 'night' ? '11.5 ms' : '24.8 ms'}
                  </strong>
                </div>
                <div>
                  예상 프레임률:{' '}
                  <strong className="text-emerald-400 text-sm">
                    {pipelineScenario === 'sunny' ? '107.5 FPS' : pipelineScenario === 'night' ? '86.9 FPS' : '40.3 FPS'}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: INFERENCE ENGINES (OpenCV 5 DNN vs ONNX/TensorRT)
         ========================================================================= */}
      {activeTab === 'engine' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-amber-500" />
              <span>추론 런타임 엔진 구조 비교: OpenCV 5 DNN vs ONNX Runtime / TensorRT</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              OpenCV 5는 기존 레이어 연속 방식에서 탈피하여 <strong>'그래프 기반 추론 엔진'</strong>으로 전면 재설계되었습니다.
              형상 추론, 상수 폴딩, 메모리 재사용을 전역 최적화하고 하드웨어 추상화 계층(HAL)을 도입함으로써,
              CPU 단독 임베디드 장비에서 기존 ONNX Runtime 대비 2배 이상의 빠른 추론 속도를 달성합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Chart 1: Latency Comparison */}
            <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">하드웨어별 지연시간(Latency) 비교</h3>
                <span className="text-[11px] text-slate-500 font-mono">YOLOv8 Nano (ms)</span>
              </div>
              <div className="h-72 w-full">
                <canvas ref={engineChartRef}></canvas>
              </div>
              <p className="text-[11px] text-slate-500 text-center italic">
                * CPU 환경에서는 OpenCV 5의 전전처리 통합 직렬화 차단 효과로 우위를 보이며, GPU 환경에서는 TensorRT/ONNX Runtime이 텐서 코어 레이어 융합을 통해 최고 속도를 달성함.
              </p>
            </div>

            {/* Comparison Table */}
            <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
                런타임 특성 정밀 비교표
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                      <th className="p-2.5">비교 지표</th>
                      <th className="p-2.5">OpenCV 5 DNN</th>
                      <th className="p-2.5">ONNX Runtime / TensorRT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900 dark:text-white">추론 백엔드</td>
                      <td className="p-2.5">CPU, OpenCL, CUDA</td>
                      <td className="p-2.5">CPU, CUDA, TensorRT, DirectML</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900 dark:text-white">ONNX 호환성</td>
                      <td className="p-2.5 text-amber-600 dark:text-amber-400 font-medium">80%+ (그래프 통합)</td>
                      <td className="p-2.5 text-emerald-600 dark:text-emerald-400 font-medium">100% (네이티브 지원)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900 dark:text-white">시스템 의존성</td>
                      <td className="p-2.5 text-emerald-600 dark:text-emerald-400 font-medium">Zero-dependency (단일)</td>
                      <td className="p-2.5">별도 라이브러리 및 전처리 필요</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900 dark:text-white">메모리 점유율</td>
                      <td className="p-2.5 text-emerald-600 dark:text-emerald-400 font-medium">경량 (경량화 빌드 시 45MB)</td>
                      <td className="p-2.5">보통~큼 (GPU 드라이버 종속)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900 dark:text-white">INT8 양자화</td>
                      <td className="p-2.5">부분적 (QDQ 지원 확장 중)</td>
                      <td className="p-2.5 text-emerald-600 dark:text-emerald-400 font-medium">FP16, INT8 보정 완벽 지원</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/30 p-3.5 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-300 space-y-1">
                <span className="font-bold flex items-center gap-1">💡 아키텍처 배포 제언:</span>
                <p className="text-[11px] leading-relaxed">
                  자원이 극히 제한된 소형 ARM SoC 디바이스(Raspberry Pi, NXP i.MX8M)에는 <strong>OpenCV 5 DNN</strong> 단일 파이프라인이 유리하며,
                  시속 100km+ 다채널 초고속 관제가 필요한 엣지 GPU 서버(NVIDIA Jetson Orin)에는 <strong>ONNX Export → TensorRT INT8 양자화</strong> 접근법이 권장됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: YOLO & INT8 QUANTIZATION
         ========================================================================= */}
      {activeTab === 'yolo' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>차량 및 번호판 탐지(LPD): 초경량 YOLO 및 TensorRT INT8 양자화</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              YOLOv8/v10/v11은 Anchor-free 구조와 C2f 모듈을 적용하여 소형 번호판 객체 탐지에 최적화되어 있습니다.
              특히 TensorRT 사후 훈련 양자화(PTQ)를 적용하여 FP32 부동소수점을 8비트 정수(INT8)로 변환하면 mAP 손실을 1% 내외로 방지하면서 추론 프레임 속도를 2배 이상 끌어올릴 수 있습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Chart 2: Quantization Chart */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Jetson Orin NX (8GB) 정밀도별 벤치마크
                </h3>
                <div className="flex items-center gap-1 text-xs">
                  <button
                    onClick={() => setQuantMetric('fps')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      quantMetric === 'fps'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    FPS (처리량)
                  </button>
                  <button
                    onClick={() => setQuantMetric('latency')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      quantMetric === 'latency'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    지연시간 (ms)
                  </button>
                  <button
                    onClick={() => setQuantMetric('vram')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      quantMetric === 'vram'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    VRAM (GB)
                  </button>
                </div>
              </div>

              <div className="h-72 w-full">
                <canvas ref={quantChartRef}></canvas>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 text-[10px]">FP32 (PyTorch)</span>
                  <p className="font-bold text-slate-800 dark:text-white text-sm mt-0.5">30 FPS / 21.9ms</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 text-[10px]">FP16 (TensorRT)</span>
                  <p className="font-bold text-amber-500 text-sm mt-0.5">50 FPS / 7.3ms</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">INT8 (TensorRT)</span>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">65 FPS / 3.49ms</p>
                </div>
              </div>
            </div>

            {/* Raspberry Pi 5 Highlight Card */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                  <span>🍓</span> Raspberry Pi 5 (CPU 전용) INT8 양자화 성과
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  외장 GPU가 없는 초저가 임베디드 환경에서도 YOLOv11 Nano 모델에 NCNN/TFLite 사후 훈련 INT8 양자화를 적용한 결과 혁신적인 성능 향상이 입증되었습니다.
                </p>
                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">FP32 원본 속도:</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-200">5.12 FPS (195.38 ms)</span>
                  </div>
                  <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold">INT8 양자화 적용 후:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      12.98 FPS (77.03 ms) <span className="text-[10px] bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 px-1 rounded ml-1">↑146%</span>
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  * 고가의 GPU 보드 없이도 저속 ADAS 및 스마트 주차 차단기 엣지 구축 가능.
                </p>
              </div>

              {/* NMS-Free YOLOv11 Card */}
              <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                  <span>⚡</span> NMS-Free YOLOv11 아키텍처 혁신
                </h4>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  YOLOv11은 비-최대 억제(NMS) 후처리 연산을 네트워크 내부에 내재화하여, CPU 추론 지연을 유발하던 포스트 프로세싱 오버헤드를 완벽히 제거했습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: LPR OCR (LPRNet vs PP-OCRv4)
         ========================================================================= */}
      {activeTab === 'ocr' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-500" />
              <span>광학 문자 인식(LPR): LPRNet vs PP-OCRv4 Mobile 모델 분석</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              과거의 개별 문자 분할(Segmentation) 방식의 오류를 타파하기 위해 최신 LPR 아키텍처는 문자열 전체를 한 번에 복원하는 End-to-End CTC(Connectionist Temporal Classification) 구조를 사용합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
                LPRNet vs PP-OCRv4 Mobile 모델 특성 비교
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* LPRNet Card */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">LPRNet</h4>
                    <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded">
                      번호판 전용
                    </span>
                  </div>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc list-inside">
                    <li><strong>특징:</strong> RNN/LSTM 완전히 배제. 1D Conv + CTC 기반 극초경량.</li>
                    <li><strong>기울임 보정:</strong> 내장 공간 변환 네트워크(STN) 탑재로 비스듬한 번호판 강건성(96.4%+).</li>
                    <li><strong>한계점:</strong> '0'과 'O', '5'와 'S' 간의 휴리스틱 구분 혼동 경향.</li>
                    <li><strong>적용 권장:</strong> 단일 행의 명확한 번호판 빠른 속도 판독.</li>
                  </ul>
                </div>

                {/* PP-OCRv4 Card */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">PP-OCRv4 Mobile</h4>
                    <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-bold px-2 py-0.5 rounded">
                      범용 텍스트
                    </span>
                  </div>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc list-inside">
                    <li><strong>특징:</strong> Light-Transformer + CNN 융합. 모델 크기 단 6.8MB (영어/숫자).</li>
                    <li><strong>라인 정확도:</strong> 83.28% 엄격 라인 정확도 (서버급 모델 육박).</li>
                    <li><strong>장점:</strong> 다국어, 특수 기호, 2열 다층 번호판 유연 대응.</li>
                    <li><strong>적용 권장:</strong> 버스 측면 문구, 대형차량 다층 번호판 등 복합 ITS.</li>
                  </ul>
                </div>
              </div>

              {/* Chart 3: Radar Chart */}
              <div className="pt-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs mb-2">
                  모델 성능 다각도 다이어그램 (Radar Chart)
                </h4>
                <div className="h-72 w-full">
                  <canvas ref={ocrChartRef}></canvas>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                  <span>🧠</span> LPRNet의 STN (Spatial Transformer Network)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  LPRNet 내부의 STN 서브네트워크는 입력된 번호판의 기하학적 왜곡(기울어짐, 회전, 투시 변형)을 별도의 사전 정렬 알고리즘 없이 신경망 내부에서 자율적으로 아핀 변환(Affine Transformation)시켜 수평으로 펴주는 역할을 수행합니다.
                </p>
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 rounded-xl text-xs text-amber-900 dark:text-amber-300 font-medium">
                  기울어진 45도 각도 촬영에서도 96.4% 이상의 OCR 신뢰도 유지.
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                  <span>🔄</span> Paddle2ONNX 변환 시 유의사항
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  PP-OCRv4 파이프라인(.pdparams)을 ONNX로 변환할 때 특정 커널(oneDNN brgemm) 미지원으로 인한 메모리 누수 또는 멀티스레드 지연(장당 2000ms 오버헤드) 이슈가 발생할 수 있으므로 패치 적용이 필수적입니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: SUPER-RESOLUTION & CLAHE (Real-ESRGAN)
         ========================================================================= */}
      {activeTab === 'enhancement' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-500" />
              <span>악천후 및 저조도 환경 극복: 전처리 보정 및 Real-ESRGAN 초해상화</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              야간 헤드라이트 반사, 안개, 원거리 촬영 시 번호판 픽셀 밀도가 30x10 수준으로 붕괴되는 현상을 극복하기 위해 CLAHE 히스토그램 보정 및 Real-ESRGAN 딥러닝 초해상화(Super-Resolution) 모델을 적용합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Chart 4: Super Resolution Accuracy Impact */}
            <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Real-ESRGAN 적용 전/후 다운스트림 성능 향상
              </h3>
              <div className="h-72 w-full">
                <canvas ref={superResChartRef}></canvas>
              </div>
              <p className="text-[11px] text-slate-500 text-center italic">
                * Real-ESRGAN 적용 후 PSNR +4.21 dB, SSIM +0.12 상승하며, 탐지 정확도(mAP) +23.26%, OCR 인식률 +25.76% 급증.
              </p>
            </div>

            {/* Interactive Before/After Visual Simulation Tool */}
            <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
                🖼️ 초해상화 & 조도 보정 대화형 비교 시뮬레이터
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">전처리 모드 선택:</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setEnhanceMode('raw')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                        enhanceMode === 'raw'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      원본 (열화)
                    </button>
                    <button
                      onClick={() => setEnhanceMode('clahe')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                        enhanceMode === 'clahe'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      CLAHE 보정
                    </button>
                    <button
                      onClick={() => setEnhanceMode('sr')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                        enhanceMode === 'sr'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Real-ESRGAN 4x
                    </button>
                  </div>
                </div>

                {/* Simulated Visual Canvas Frame */}
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-4 min-h-[190px] relative overflow-hidden">
                  <div
                    className={`px-7 py-3.5 rounded-xl border-2 text-center font-mono transition-all duration-300 ${
                      enhanceMode === 'raw'
                        ? 'bg-slate-900 text-slate-600 border-slate-700 blur-[2px] scale-90'
                        : enhanceMode === 'clahe'
                        ? 'bg-slate-900 text-amber-300 border-amber-500/50 blur-[0.5px] scale-95'
                        : 'bg-slate-950 text-emerald-400 border-emerald-500 shadow-xl shadow-emerald-500/20 scale-100'
                    }`}
                  >
                    <div className="text-[10px] font-bold tracking-widest uppercase opacity-80">KOREA VEHICLE</div>
                    <div className="text-2xl sm:text-3xl font-black tracking-wider mt-0.5">52가 8282</div>
                  </div>

                  {/* Live Indicator Overlay */}
                  <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                    <div>
                      PSNR:{' '}
                      <span className="text-amber-400 font-bold">
                        {enhanceMode === 'raw' ? '22.1 dB' : enhanceMode === 'clahe' ? '24.5 dB' : '26.31 dB (+4.21dB)'}
                      </span>
                    </div>
                    <div>
                      SSIM:{' '}
                      <span className="text-amber-400 font-bold">
                        {enhanceMode === 'raw' ? '0.68' : enhanceMode === 'clahe' ? '0.74' : '0.80 (+0.12)'}
                      </span>
                    </div>
                    <div>
                      OCR 인식 여부:{' '}
                      <span
                        className={`font-bold ${
                          enhanceMode === 'raw'
                            ? 'text-rose-400'
                            : enhanceMode === 'clahe'
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {enhanceMode === 'raw' ? '불가 (Fail)' : enhanceMode === 'clahe' ? '부분 성공 (72%)' : '완벽 복원 (98.8%)'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <span className="font-bold text-slate-800 dark:text-white">💡 OCR Perceptual Loss (인지 손실) 훈련 기법:</span>
                  <p className="text-[11px] leading-relaxed">
                    단순히 인간의 눈에 깨끗해 보이는 이미지를 넘어, OCR 신경망(CRNN)의 Feature Loss를 손실 함수에 결합하여 학습시킴으로써 텍스트 모서리와 자음/모음 세부 구조가 왜곡 없이 복원되도록 보장합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: KOREAN LICENSE PLATE & REGEX VALIDATOR
         ========================================================================= */}
      {activeTab === 'korean' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-amber-500" />
              <span>대한민국 차량 번호판 특화 인식률 향상 및 후처리 검증 엔진</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              대한민국 번호판은 8자리(RPA3), 7자리(RPA1/2), 친환경 파란색, 사업용 노란색 등 규격이 다양하며 한글-숫자 불균형이 존재합니다.
              딥러닝 출력의 시각적 오류('O'→'0', 'B'→'8')를 정규표현식(Regex)과 위치별 교정 매핑 테이블로 최종 보정합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Interactive Regex Validator */}
            <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
                🧪 대화형 한국형 번호판 Regex 후처리 검증기
              </h3>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    OCR 원시 예측 텍스트 입력 (오류 포함 가능):
                  </label>
                  <input
                    type="text"
                    value={regexInput}
                    onChange={(e) => setRegexInput(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                    placeholder="예: 123O가4568"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    예: 123O가4568 (숫자 자리에 알파벳 O 오인식)
                  </span>
                </div>

                {/* Pre-set Test Cases */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-slate-500 text-[11px]">테스트 예시:</span>
                  {[
                    '123O가4568',
                    '12가3456',
                    '서울12가3456',
                    '99B가1234'
                  ].map((testStr) => (
                    <button
                      key={testStr}
                      onClick={() => setRegexInput(testStr)}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-[11px] font-mono text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                    >
                      {testStr}
                    </button>
                  ))}
                </div>

                {/* Validation Result Box */}
                <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl space-y-2.5 font-mono border border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">원본 입력:</span>
                    <span className="text-slate-200 font-bold">{regexResult.raw}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">규격 판별:</span>
                    <span className="text-amber-400 font-bold">{regexResult.format}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">위치 치환 교정:</span>
                    <span className="text-emerald-400 font-bold text-sm">{regexResult.corrected}</span>
                  </div>
                  <div className="border-t border-slate-800 pt-2.5 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">검증 상태:</span>
                    <span
                      className={`px-2.5 py-0.5 rounded border font-semibold ${
                        regexResult.status === 'PASSED'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border-rose-800'
                      }`}
                    >
                      {regexResult.statusText}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trajectory Smoothing Chart & Synthetic Data */}
            <div className="lg:col-span-6 space-y-4">
              {/* Trajectory Chart */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  비디오 스트림 다수결 보팅(Majority Vote) 인식률 정밀 향상
                </h3>
                <div className="h-64 w-full">
                  <canvas ref={trajectoryChartRef}></canvas>
                </div>
                <p className="text-[11px] text-slate-500 text-center">
                  * 폐색(Occlusion)이나 프레임 드랍 발생 시 5프레임 시계열 보상 통합을 통해 인식률이 29.9%에서 42.3%로 대폭 반등.
                </p>
              </div>

              {/* Synthetic Data Card */}
              <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 text-xs">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>🎨</span> 한글-숫자 클래스 불균형 GAN 합성 데이터(Synthetic Data) 극복
                </h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                  번호판 1개당 숫자는 6~7개 포함되나 한글은 단 1개만 출현하여 편향이 발생합니다.
                  GAN 및 렌더링 엔진으로 대량의 한국 규격 가상 데이터셋을 생성하여 희귀 한글 기호 인식 능력을 완벽 보완합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 7: HARDWARE BENCHMARKS
         ========================================================================= */}
      {activeTab === 'benchmarks' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Hardware Execution Benchmark</span>
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  하드웨어 디바이스별 실측 추론 속도(FPS/Latency) 및 정확도
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  임베디드 단말기부터 산업용 IPC, 고성능 GPU 서버까지의 실제 벤치마크 데이터를 확인하세요.
                </p>
              </div>
            </div>

            {/* Hardware Selector Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
              {HARDWARE_BENCHMARKS.map((hw, idx) => (
                <button
                  key={hw.hardware}
                  onClick={() => setSelectedHw(idx)}
                  className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                    selectedHw === idx
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
                    TARGET #{idx + 1}
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                    {hw.hardware}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2">
                    권장: {hw.recommendedPipeline.split(' ')[0]}
                  </div>
                </button>
              ))}
            </div>

            {/* Detailed Selected Benchmark View */}
            {HARDWARE_BENCHMARKS[selectedHw] && (
              <div className="mt-8 p-6 rounded-2xl bg-slate-900 text-white border border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <div className="text-xs text-amber-400 font-mono">선택된 하드웨어 플랫폼</div>
                    <div className="text-xl font-bold text-white mt-1">
                      {HARDWARE_BENCHMARKS[selectedHw].hardware}
                    </div>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium">
                    {HARDWARE_BENCHMARKS[selectedHw].notes}
                  </div>
                </div>

                {/* 3 Model Pipelines Comparison Table */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
                    <div className="text-xs text-slate-400 font-medium">파이프라인 A (추천 조합)</div>
                    <div className="text-base font-bold text-white mt-1">YOLOv8n + LPRNet</div>
                    <div className="text-xs text-emerald-400 mt-0.5">최적 밸런스 (속도+인식률)</div>
                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-700/60">
                        <span className="text-slate-400">초당 프레임:</span>
                        <span className="font-mono font-bold text-amber-400 text-sm">
                          {HARDWARE_BENCHMARKS[selectedHw].yolov8n_lprnet.fps} FPS
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-700/60">
                        <span className="text-slate-400">프레임당 지연:</span>
                        <span className="font-mono text-slate-200">
                          {HARDWARE_BENCHMARKS[selectedHw].yolov8n_lprnet.latency} ms
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-400">종합 인식률:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {HARDWARE_BENCHMARKS[selectedHw].yolov8n_lprnet.accuracy}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
                    <div className="text-xs text-slate-400 font-medium">파이프라인 B (고정밀)</div>
                    <div className="text-base font-bold text-white mt-1">PP-PicoDet + CRNN/SVTR</div>
                    <div className="text-xs text-indigo-400 mt-0.5">야간/원거리 노이즈 극복형</div>
                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-700/60">
                        <span className="text-slate-400">초당 프레임:</span>
                        <span className="font-mono font-bold text-amber-400 text-sm">
                          {HARDWARE_BENCHMARKS[selectedHw].picodet_crnn.fps} FPS
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-700/60">
                        <span className="text-slate-400">프레임당 지연:</span>
                        <span className="font-mono text-slate-200">
                          {HARDWARE_BENCHMARKS[selectedHw].picodet_crnn.latency} ms
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-400">종합 인식률:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {HARDWARE_BENCHMARKS[selectedHw].picodet_crnn.accuracy}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
                    <div className="text-xs text-slate-400 font-medium">파이프라인 C (초경량 무의존성)</div>
                    <div className="text-base font-bold text-white mt-1">OpenCV DNN Native C++</div>
                    <div className="text-xs text-amber-400 mt-0.5">추가 설치 없이 즉시 배포</div>
                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-700/60">
                        <span className="text-slate-400">초당 프레임:</span>
                        <span className="font-mono font-bold text-amber-400 text-sm">
                          {HARDWARE_BENCHMARKS[selectedHw].opencv_dnn_cpu.fps} FPS
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-700/60">
                        <span className="text-slate-400">프레임당 지연:</span>
                        <span className="font-mono text-slate-200">
                          {HARDWARE_BENCHMARKS[selectedHw].opencv_dnn_cpu.latency} ms
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-400">종합 인식률:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {HARDWARE_BENCHMARKS[selectedHw].opencv_dnn_cpu.accuracy}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-2">
                  <div className="text-slate-400">
                    권장 추론 엔진 & 세팅: <span className="text-amber-300 font-semibold">{HARDWARE_BENCHMARKS[selectedHw].recommendedPipeline}</span>
                  </div>
                  <div className="text-slate-400 font-mono">
                    테스트 해상도: 1920x1080 (FHD 30fps 비디오 스트림)
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 8: EXECUTABLE CODE SNIPPETS
         ========================================================================= */}
      {activeTab === 'code' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-xs uppercase tracking-wider mb-2">
                <Code2 className="w-3.5 h-3.5" />
                <span>Production Source Codes</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                프로덕션 즉시 투입 가능한 Python / C++ 추론 파이프라인
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                OpenCV DNN, ONNX Runtime INT8, C++ 네이티브 배포 스크립트를 클릭 한 번으로 복사하여 프로젝트에 활용하세요.
              </p>
            </div>

            <div className="space-y-6 mt-6">
              {/* Snippet 1 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-lg">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-mono font-bold text-slate-200">
                      python_opencv_dnn_lpr.py (순수 OpenCV 의존성 제로)
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyCode('opencv_dnn', sampleOpencvDnnCode)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors cursor-pointer"
                  >
                    {copiedCodeKey === 'opencv_dnn' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">복사됨!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>코드 복사</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 overflow-x-auto text-xs font-mono text-slate-300 leading-relaxed max-h-96">
                  <pre>{sampleOpencvDnnCode}</pre>
                </div>
              </div>

              {/* Snippet 2 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-lg">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-mono font-bold text-slate-200">
                      python_onnxruntime_int8_pipeline.py (INT8 양자화 & TensorRT EP)
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyCode('onnx_runtime', sampleOnnxRuntimeCode)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors cursor-pointer"
                  >
                    {copiedCodeKey === 'onnx_runtime' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">복사됨!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>코드 복사</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 overflow-x-auto text-xs font-mono text-slate-300 leading-relaxed max-h-96">
                  <pre>{sampleOnnxRuntimeCode}</pre>
                </div>
              </div>

              {/* Snippet 3 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-lg">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-mono font-bold text-slate-200">
                      fast_lpr_engine.cpp (산업용 임베디드 C++ 무의존성 클래스)
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyCode('cpp_code', sampleCppCode)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors cursor-pointer"
                  >
                    {copiedCodeKey === 'cpp_code' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">복사됨!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>코드 복사</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 overflow-x-auto text-xs font-mono text-slate-300 leading-relaxed max-h-96">
                  <pre>{sampleCppCode}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Architecture Modal */}
      {archModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>ANPR 아키텍처 종합 권고사항 요약</span>
              </h3>
              <button
                onClick={() => setArchModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <strong className="text-slate-900 dark:text-white text-xs block">1. 추론 런타임 이원화 전략</strong>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  소형 단독 엣지에는 의존성 없는 OpenCV 5 DNN, 고성능 GPU 관제망에는 TensorRT INT8 양자화를 채택하여 처리량 극대화.
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <strong className="text-slate-900 dark:text-white text-xs block">2. 초경량 End-to-End OCR 선정</strong>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  단일 행 번호판은 LPRNet(STN 포함), 다국어/2열 혼재 환경은 6.8MB의 PP-OCRv4 Mobile을 적용하여 오버헤드 최소화.
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <strong className="text-slate-900 dark:text-white text-xs block">3. Real-ESRGAN 초해상화 전처리 결합</strong>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  저조도 및 결손 픽셀 환경에서 Real-ESRGAN 전처리를 구동하여 OCR 인식 정확도를 +25.76% 동반 상승시킴.
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <strong className="text-slate-900 dark:text-white text-xs block">4. 한국형 규격 Regex 후처리 오인식 차단</strong>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  위치별 정규표현식 교정 매핑 및 시계열 다수결 보팅을 통해 99%+ 신뢰도를 완성.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setArchModalOpen(false)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                확인 및 닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
