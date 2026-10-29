import React, { useState } from 'react';
import {
  GraduationCap,
  Download,
  ExternalLink,
  Layers,
  Code2,
  CheckCircle2,
  Workflow,
  Sparkles,
  Database,
  Search,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Sliders,
  Copy,
  Check,
  Terminal,
  FileText,
  AlertTriangle,
  Lightbulb,
  Compass,
  Zap,
  FolderDown,
  Hash
} from 'lucide-react';

interface DatasetSource {
  id: string;
  title: string;
  provider: string;
  url: string;
  category: 'public' | 'community' | 'synthetic' | 'global';
  badge: string;
  badgeColor: string;
  imageCount: string;
  formats: string[];
  description: string;
  keyFeatures: string[];
  downloadSteps: string[];
}

const DATASET_SOURCES: DatasetSource[] = [
  {
    id: 'ai-hub-plates',
    title: '차량 및 번호판 이미지 AI 데이터셋',
    provider: 'AI-Hub (한국지능정보사회진흥원 NIA)',
    url: 'https://www.ai-hub.or.kr/aihubdata/data/view.do?currMenu=115&topMenu=100&aihubDataSe=realm&dataSetSn=172',
    category: 'public',
    badge: '국내 최대 공공 데이터',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    imageCount: '약 2,000,000+ 장',
    formats: ['JSON (BBox & 4-Point)', 'JPG/PNG 원천영상', '텍스트 라벨'],
    description: '대한민국 도로, 주차장, 톨게이트, 교차로 환경에서 촬영된 고화질 차량 전·후면 이미지 데이터셋입니다. 신형 8자리, 구형 7자리, 친환경 전기차(파란색), 영업용(노란색), 2줄형 번호판이 주야간 및 다양한 기후(우천, 안개, 역광) 조건으로 포함되어 있습니다.',
    keyFeatures: [
      '국토교통부 표준 규격 번호판 전 클래스(자가용/영업용/친환경/건설기계) 균형 수집',
      '사각 원근 왜곡(Perspective Skew) 보정을 위한 4점 폴리곤(Polygon) 꼭짓점 좌표 제공',
      '주간, 야간 IR 조명 환경, 악천후(비, 눈, 안개) 및 그림자 폐색 환경 포함',
      '개인정보보호 가이드라인을 준수한 연구용 정제 데이터셋'
    ],
    downloadSteps: [
      '1. AI-Hub(ai-hub.or.kr) 회원가입 및 본인 인증',
      '2. 데이터셋 검색: "차량 및 번호판 이미지" 또는 "CCTV 교통 데이터"',
      '3. 연구/개발 목적 활용 신청서 제출 (학술/기업 연구 무료 즉시 승인)',
      '4. AI-Hub 전용 다운로더(Agent) 설치 후 대용량 분할 압축파일 다운로드'
    ]
  },
  {
    id: 'ai-hub-cctv',
    title: '도시 교통 모니터링 CCTV 데이터',
    provider: 'AI-Hub (한국지능정보사회진흥원 NIA)',
    url: 'https://www.ai-hub.or.kr',
    category: 'public',
    badge: '교통 CCTV 실환경',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    imageCount: '약 500,000+ 클립/프레임',
    formats: ['JSON', 'MP4', 'FHD 정지영상'],
    description: '실제 지자체 도로변 방범 및 교통관제 폴(Pole) 카메라에서 촬영된 실시간 주행 차량 영상입니다. 고속 주행 모션 블러와 원거리 저해상도 환경의 번호판 탐지(Detection) 훈련에 최적입니다.',
    keyFeatures: [
      '시속 30~100km/h 주행 중인 차량의 실제 도로 프레임',
      '다양한 카메라 설치 높이(3m~7m)와 부감 시야각(Pan/Tilt) 반영',
      '차량 바운딩 박스 및 번호판 ROI 영역 2단계 어노테이션'
    ],
    downloadSteps: [
      '1. AI-Hub 로그인 후 "도시 교통 모니터링" 검색',
      '2. 데이터 신청 및 승인 완료 후 다운로드 키 발급',
      '3. 프레임 추출 스크립트 실행하여 학습용 BBox 크롭 데이터셋 생성'
    ]
  },
  {
    id: 'roboflow-alpr',
    title: 'Korean License Plate Dataset & ALPR Universe',
    provider: 'Roboflow Universe',
    url: 'https://universe.roboflow.com/search?q=korean+license+plate',
    category: 'community',
    badge: '원클릭 즉시 다운로드',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    imageCount: '약 25,000+ 장 (다수 프로젝트 통합)',
    formats: ['YOLOv8 PyTorch', 'COCO JSON', 'Pascal VOC XML', 'TensorFlow TFRecord'],
    description: '전 세계 컴퓨터 비전 개발자들이 업로드하고 라벨링한 오픈소스 한국형 번호판 데이터셋 허브입니다. 전처리 및 증강(Augmentation) 파이프라인이 웹상에서 완료되어 있어 가입 즉시 zip 다운로드하거나 Python API 코드로 1줄 로드할 수 있습니다.',
    keyFeatures: [
      'YOLOv5, YOLOv8, YOLOv11 포맷(txt) 즉시 내보내기 지원',
      'Python SDK: from roboflow import Roboflow 코드로 자동 다운로드',
      '웹 브라우저에서 바운딩 박스 라벨 시각화 및 라벨 오류 검수 가능',
      '기본 증강(Resize, Flip, Brightness, Blur) 적용 버전 제공'
    ],
    downloadSteps: [
      '1. Roboflow Universe 접속 및 "korean license plate" 검색',
      '2. 마음에 드는 프로젝트 선택 (예: Korean ALPR, Car-Plate-KR)',
      '3. "Export Dataset" 버튼 클릭 ➔ 형식 선택: YOLOv8 / COCO JSON',
      '4. 터미널 curl 코드 또는 python 코드를 복사하여 학습 환경에 즉시 로드'
    ]
  },
  {
    id: 'kaggle-alpr',
    title: 'Car License Plate Detection & Korean Plates',
    provider: 'Kaggle Datasets Hub',
    url: 'https://www.kaggle.com/datasets?search=license+plate+detection',
    category: 'community',
    badge: 'Jupyter 튜토리얼 포함',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    imageCount: '약 50,000+ 장',
    formats: ['CSV 메타데이터', 'PASCAL VOC (XML)', 'YOLO txt'],
    description: '캐글 커뮤니티에서 공유되는 다수의 자동차 번호판 검출 및 인식 데이터셋입니다. 수많은 머신러닝 엔지니어들의 전처리 EDA 코드 및 베이스라인 훈련 노트북(Notebook)이 함께 공개되어 있어 전이학습(Transfer Learning) 베이스라인 구축에 적합합니다.',
    keyFeatures: [
      'Kaggle API(kaggle datasets download -d ...)로 초고속 수령',
      '동반 공개된 수십 개의 우수 솔루션 노트북 및 전처리 파이프라인 참조 가능',
      '다국어 및 한국형 번호판 샘플 교차 검증용으로 활용'
    ],
    downloadSteps: [
      '1. Kaggle 계정 생성 및 API Token(kaggle.json) 다운로드',
      '2. 터미널에서 kaggle datasets download -d [dataset-name] 실행',
      '3. unzip 후 train/val/test 폴더 스플릿 확인'
    ]
  },
  {
    id: 'github-synthetic',
    title: 'Korean-Car-Plate-Generator (가상 번호판 합성기)',
    provider: 'GitHub Open Source Community',
    url: 'https://github.com/search?q=KoreanCarPlateGenerator',
    category: 'synthetic',
    badge: '100% 무한 합성 렌더러',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    imageCount: '무제한 (코드 실행 시 수백만 장 자동 생성)',
    formats: ['PIL / OpenCV PNG', 'Ground Truth TXT', 'JSON 좌표'],
    description: '국토교통부 표준 번호판 규격을 파이썬 코드로 완벽 재현한 오픈소스 합성 데이터 생성기입니다. 희귀 한글 음절(하, 허, 호, 바, 사, 아, 자, 배, 택시, 외교 등)과 친환경 하늘색 배경, 8자리 신형 태극 반사필름을 글꼴 폰트와 결합해 무한대로 합성할 수 있습니다.',
    keyFeatures: [
      '국토교통부 고시 표준 폰트(한길체, 모던고딕) 일체 포함',
      '원근 왜곡(Perspective), 렌즈 블러, 노이즈, 야간 할레이션 텍스처 자동 합성',
      '라벨링 오류 없는 100% 무결점 텍스트 Ground Truth 자동 생성',
      '데이터 불균형(희귀 문자) 문제를 단 1초 만에 해소'
    ],
    downloadSteps: [
      '1. git clone https://github.com/sanha9999/Korean_License_Plate_Generator.git',
      '2. pip install -r requirements.txt (Pillow, OpenCV, numpy)',
      '3. python generate.py --num_images 100000 --plate_type all 실행',
      '4. /output 폴더에 생성된 10만 장의 이미지와 라벨 텍스트 즉시 훈련에 투입'
    ]
  },
  {
    id: 'data-go-kr',
    title: '공공데이터포털 교통안전 차량 데이터',
    provider: '행정안전부 공공데이터포털 (data.go.kr)',
    url: 'https://www.data.go.kr',
    category: 'public',
    badge: '정부 공식 공공데이터',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    imageCount: '지자체별 수만 건 오픈 API / 파일',
    formats: ['Open API REST', 'CSV', '샘플 미디어'],
    description: '한국교통안전공단, 한국도로공사, 서울시 및 전국 지자체에서 개방하는 공영주차장 입출차 현황, 불법주정차 단속 및 버스전용차로 단속 관제 메타데이터입니다. 실제 ITS 관제 시스템 연동 테스트에 유용합니다.',
    keyFeatures: [
      '공공 API 키 발급을 통한 안정적인 공공 데이터 접근',
      '차량 통과 시간대별 조도 및 번호판 텍스트 패턴 분석 자료',
      '지자체별 번호판 인식 단속 성공률 및 통계 데이터 확인 가능'
    ],
    downloadSteps: [
      '1. data.go.kr 회원가입 및 일반 인증키 발급',
      '2. "불법주정차 단속" 또는 "공영주차장 차량" 검색',
      '3. 공공데이터 활용 신청 후 REST API 엔드포인트 연동'
    ]
  }
];

export const PlateTrainingSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'datasets' | 'procedure' | 'methods' | 'code' | 'checklist'>('overview');
  const [datasetFilter, setDatasetFilter] = useState<'all' | 'public' | 'community' | 'synthetic'>('all');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const filteredDatasets = DATASET_SOURCES.filter(d => {
    if (datasetFilter === 'all') return true;
    return d.category === datasetFilter;
  });

  return (
    <section id="training" className="py-16 bg-slate-950 text-white border-b border-slate-800 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-2 tracking-wider uppercase">
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            <span>ALPR Deep Learning Model Training & Dataset Pipeline</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="font-mono text-slate-400">Computer Vision Curriculum</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                차량 번호판 AI 모델 학습 절차, 방법 및 데이터셋 소스
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-4xl leading-relaxed">
                원천 이미지 수집 및 레이블링 규격부터 데이터 증강, 2-Stage/End-to-End 신경망 훈련, 손실 함수 최적화, 엣지 경량화 배포,
                그리고 실제 번호판 이미지를 무료로 다운로드할 수 있는 국내외 6대 핵심 데이터셋 허브를 총망라합니다.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-300 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>공공 데이터: <strong className="text-emerald-400">200만+ 장</strong></span>
              </div>
              <span className="text-slate-700">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-sky-400 font-bold">2-Stage 파이프라인</span>
                <span>(YOLO + CRNN)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-8 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'overview'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>학습 파이프라인 개요</span>
          </button>

          <button
            onClick={() => setActiveTab('datasets')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'datasets'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FolderDown className="w-4 h-4" />
            <span>번호판 사진 다운로드 사이트 (6선)</span>
          </button>

          <button
            onClick={() => setActiveTab('procedure')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'procedure'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Workflow className="w-4 h-4" />
            <span>6단계 상세 학습 절차</span>
          </button>

          <button
            onClick={() => setActiveTab('methods')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'methods'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>모델 아키텍처 & 알고리즘</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'code'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>실전 학습 스크립트 코드</span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'checklist'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>학습 성공 체크리스트</span>
          </button>
        </div>

        {/* Tab 1: Overview (학습 파이프라인 전체 조망) */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* 3 Core Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-4">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">1. 데이터 구축 및 불균형 극복</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  AI-Hub 200만 장 공공 데이터와 Python 합성 렌더러를 결합하여 신형 8자리, 친환경 전기차, 2줄 영업용 번호판의 클래스 불균형을 해결하고 4점 폴리곤 사각 왜곡 좌표를 구축합니다.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-emerald-400 font-bold">
                  핵심: 실사 70% + 합성 30% 혼합
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center mb-4">
                  <Workflow className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">2. 2-Stage 검출 & 인식 분리</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  YOLOv8/v11으로 번호판 위치를 초고속(100FPS+)으로 찾고, 투영 변환(Warping)으로 반듯하게 펴준 뒤, CRNN 또는 SVTR 트랜스포머 OCR로 한글 음절과 숫자를 최종 판독합니다.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-sky-400 font-bold">
                  구조: YOLOv8-Nano ➔ STN ➔ CRNN
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-4">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">3. 엣지 가속화 및 경량화 배포</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  PyTorch 가중치(.pt)를 ONNX Dynamic Shape로 변환한 후 NVIDIA TensorRT INT8 양자화나 Intel OpenVINO를 적용하여 산업용 PC에서 프레임당 20ms 이내 실시간 추론을 보장합니다.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-indigo-400 font-bold">
                  지연: &lt; 25ms (초당 40~60 FPS 보장)
                </div>
              </div>
            </div>

            {/* End-to-End Pipeline Interactive Flow */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span>표준 ALPR AI 모델 엔드투엔드(End-to-End) 학습 파이프라인</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mb-6">
                실무 현장에서 99.2% 이상의 인식 정확도를 달성하기 위한 데이터 수집부터 배포까지의 흐름도입니다.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-6 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] font-mono text-emerald-400 font-bold mb-1">PHASE 1</div>
                  <h4 className="font-bold text-white text-sm mb-1">데이터 수집</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">AI-Hub, Roboflow, 합성 렌더러로 50만 장 확보</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] font-mono text-sky-400 font-bold mb-1">PHASE 2</div>
                  <h4 className="font-bold text-white text-sm mb-1">라벨링 정규화</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">YOLO txt 박스 및 사각 4점 폴리곤 꼭짓점 추출</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] font-mono text-indigo-400 font-bold mb-1">PHASE 3</div>
                  <h4 className="font-bold text-white text-sm mb-1">도메인 증강</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">모션 블러, 야간 IR 화이트아웃, 비/안개 오염 합성</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] font-mono text-amber-400 font-bold mb-1">PHASE 4</div>
                  <h4 className="font-bold text-white text-sm mb-1">검출기 학습</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">YOLOv8-Nano / Small 300 에포크 사전훈련</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] font-mono text-purple-400 font-bold mb-1">PHASE 5</div>
                  <h4 className="font-bold text-white text-sm mb-1">OCR 인식기 학습</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">CRNN + CTC Loss / SVTR 트랜스포머 파인튜닝</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 bg-emerald-950/20">
                  <div className="text-[10px] font-mono text-emerald-300 font-bold mb-1">PHASE 6</div>
                  <h4 className="font-bold text-white text-sm mb-1">TensorRT 배포</h4>
                  <p className="text-emerald-200 text-[11px] leading-relaxed">INT8 양자화 및 산업용 PC 엣지 임베딩</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Datasets (번호판 사진을 얻을 수 있는 사이트) */}
        {activeTab === 'datasets' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header & Filter Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <FolderDown className="w-6 h-6 text-emerald-400" />
                  <span>번호판 학습 사진을 얻을 수 있는 사이트 (6대 데이터셋 허브)</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  합법적인 무료 공공 데이터셋, 커뮤니티 오픈소스 저장소 및 무한 합성기 링크와 다운로드 가이드입니다.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => setDatasetFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                    datasetFilter === 'all' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  전체 (6)
                </button>
                <button
                  type="button"
                  onClick={() => setDatasetFilter('public')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                    datasetFilter === 'public' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  정부/공공 (3)
                </button>
                <button
                  type="button"
                  onClick={() => setDatasetFilter('community')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                    datasetFilter === 'community' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  커뮤니티 (2)
                </button>
                <button
                  type="button"
                  onClick={() => setDatasetFilter('synthetic')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                    datasetFilter === 'synthetic' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  합성기 (1)
                </button>
              </div>
            </div>

            {/* Datasets Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredDatasets.map((ds) => (
                <div
                  key={ds.id}
                  className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl"
                >
                  <div>
                    {/* Top Meta */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                          {ds.provider}
                        </div>
                        <h4 className="text-lg font-bold text-white mt-0.5">
                          {ds.title}
                        </h4>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-md border shrink-0 ${ds.badgeColor}`}>
                        {ds.badge}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                      {ds.description}
                    </p>

                    {/* Scale & Format Spec Badges */}
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-2 mb-4 font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">데이터 규모:</span>
                        <strong className="text-emerald-400 font-bold">{ds.imageCount}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">제공 형식:</span>
                        <span className="text-sky-300 font-semibold">{ds.formats.join(', ')}</span>
                      </div>
                    </div>

                    {/* Key Features */}
                    <div className="space-y-1.5 mb-5">
                      <span className="text-xs font-bold text-slate-400 block mb-1">핵심 특장점:</span>
                      {ds.keyFeatures.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>

                    {/* Step by Step Download Guide */}
                    <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs mb-5">
                      <span className="text-xs font-bold text-amber-300 block mb-2 flex items-center gap-1.5">
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                        <span>다운로드 및 데이터 수령 절차:</span>
                      </span>
                      <ol className="space-y-1.5 text-[11px] text-slate-300 font-mono">
                        {ds.downloadSteps.map((step, idx) => (
                          <li key={idx} className="text-slate-300 pl-1">{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  {/* External Visit Button */}
                  <a
                    href={ds.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
                  >
                    <span>데이터셋 웹사이트 바로가기</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: 6단계 상세 학습 절차 (Procedure) */}
        {activeTab === 'procedure' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="pb-4 border-b border-slate-800">
              <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <Workflow className="w-6 h-6 text-emerald-400" />
                <span>번호판 인식 AI 모델 6단계 표준 학습 절차</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                데이터 전처리, 기하학적/광학 증강, 2-Stage 모델 훈련, 손실 함수 최적화, 오인식 검수, 경량화 배포 가이드
              </p>
            </div>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-sm">
                    1
                  </span>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-white">데이터 수집 & 레이블링 포맷 정규화</h4>
                    <span className="text-xs text-slate-400 font-mono">Data Ingestion & Ground Truth Normalization</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 leading-relaxed">
                    <strong className="text-emerald-400 block mb-1">검출용 포맷 (YOLO txt):</strong>
                    <code className="text-slate-300 font-mono block mb-2">&lt;class_id&gt; &lt;x_center&gt; &lt;y_center&gt; &lt;width&gt; &lt;height&gt;</code>
                    0부터 1까지 정규화된 좌표로 차량 전면/후면 이미지 내에서 번호판 외곽 박스를 지정합니다.
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 leading-relaxed">
                    <strong className="text-sky-400 block mb-1">사각 왜곡 보정용 포맷 (4-Point Polygon):</strong>
                    <code className="text-slate-300 font-mono block mb-2">[x1, y1, x2, y2, x3, y3, x4, y4, "123가4567"]</code>
                    좌상단, 우상단, 우하단, 좌하단의 4개 꼭짓점을 부여하여 Perspective Warp를 통해 1:4 종횡비로 반듯하게 펴주는 정렬 훈련을 지원합니다.
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-xl bg-sky-500 text-slate-950 font-black flex items-center justify-center text-sm">
                    2
                  </span>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-white">현장 환경 극복 데이터 증강 (Augmentation)</h4>
                    <span className="text-xs text-slate-400 font-mono">Albumentations & Optical Perturbation</span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  일반적인 좌우반전(Horizontal Flip)은 번호판 글자 순서가 뒤집히므로 <strong>절대 적용해서는 안 되며</strong>, 다음의 특화 증강 기법을 적용해야 합니다:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-amber-400 font-bold block mb-1">원근 왜곡 (Perspective)</span>
                    <span className="text-slate-400 text-[11px]">카메라 설치 각도에 따른 ±15도 상하좌우 회전 및 사다리꼴 왜곡 시뮬레이션</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-rose-400 font-bold block mb-1">모션 블러 & 디포커스</span>
                    <span className="text-slate-400 text-[11px]">시속 100km+ 고속 주행 시 셔터 속도 부족으로 생기는 5~15px 방향성 선형 블러</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-sky-400 font-bold block mb-1">야간 IR 화이트아웃</span>
                    <span className="text-slate-400 text-[11px]">신형 반사필름 번호판에 강한 조명이 닿을 때 획이 날아가는 가우시안 할레이션 오버레이</span>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-xl bg-indigo-500 text-white font-black flex items-center justify-center text-sm">
                    3
                  </span>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-white">2-Stage 파이프라인 분할 훈련 (Detector + OCR)</h4>
                    <span className="text-xs text-slate-400 font-mono">YOLOv8 Detection ➔ Alignment ➔ CRNN / SVTR</span>
                  </div>
                </div>
                <div className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-indigo-400">Stage 1 - 번호판 검출기:</strong>
                    <span className="ml-2 text-slate-300">YOLOv8-Nano 모델을 640×640 해상도에서 300 에포크 훈련하여 전체 도로 영상에서 5ms 이내에 번호판 BBox를 크롭합니다.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-sky-400">Stage 2 - 수평 정렬 (Warping):</strong>
                    <span className="ml-2 text-slate-300">크롭된 번호판의 4개 꼭짓점을 기준으로 OpenCV `getPerspectiveTransform`을 수행하여 256×64 고정 크기로 수평 보정합니다.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-emerald-400">Stage 3 - 문자 인식기 (OCR):</strong>
                    <span className="ml-2 text-slate-300">정렬된 이미지를 CRNN(CNN+BiLSTM) 또는 PaddleOCR SVTR에 입력하여 한글 자모 및 숫자 시퀀스를 디코딩합니다.</span>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm">
                    4
                  </span>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-white">손실 함수 및 하이퍼파라미터 최적화</h4>
                    <span className="text-xs text-slate-400 font-mono">Loss Function Formulation & Scheduler</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-amber-400 block mb-1">OCR 손실 함수: CTC Loss</strong>
                    <p className="text-slate-400 leading-relaxed font-sans text-[11px]">
                      문자의 위치 정렬(Alignment) 정보가 없는 가변 길이 텍스트 라벨에 대해 모든 가능한 정렬 경로의 확률 합을 최대화하여 음절을 정렬합니다.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-emerald-400 block mb-1">학습률 스케줄러: CosineAnnealingLR</strong>
                    <p className="text-slate-400 leading-relaxed font-sans text-[11px]">
                      초기 lr 1e-3에서 시작하여 코사인 곡선을 따라 1e-6까지 부드럽게 감쇄시키며, AdamW 옵티마이저(weight_decay=1e-4)로 과적합을 억제합니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-xl bg-purple-500 text-white font-black flex items-center justify-center text-sm">
                    5
                  </span>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-white">오인식 분석 (Error Analysis) & 혼동 행렬</h4>
                    <span className="text-xs text-slate-400 font-mono">Confusion Matrix & Character Recognition Rate</span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3">
                  단 1글자만 틀려도 차주가 달라지므로 전체 일치율(Exact Match) 98% 이상을 목표로 합니다.
                  특히 한국어 특성상 획이 뭉개지는 <strong>'처'↔'퍼', '고'↔'보', '구'↔'두'</strong>에 대해 가상 합성 데이터를 5만 장 추가 주입하여 재학습(Hard Negative Mining)을 수행합니다.
                </p>
              </div>

              {/* Step 6 */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-xl bg-rose-500 text-white font-black flex items-center justify-center text-sm">
                    6
                  </span>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-white">ONNX & TensorRT INT8 경량화 엣지 배포</h4>
                    <span className="text-xs text-slate-400 font-mono">Edge Deployment & Quantization</span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  훈련된 모델을 ONNX 형식으로 익스포트한 후, JECS-7360B나 NVIDIA Jetson의 가속 엔진(TensorRT / OpenVINO)으로 FP16 또는 INT8 양자화를 적용합니다.
                  이를 통해 메모리 사용량을 75% 절감하고 추론 속도를 3배 이상 향상시킵니다.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: AI 모델 아키텍처 비교 (Methods) */}
        {activeTab === 'methods' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="pb-4 border-b border-slate-800">
              <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <Cpu className="w-6 h-6 text-emerald-400" />
                <span>번호판 인식 딥러닝 아키텍처 비교 & 벤치마크</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                검출기(Detector)와 문자 인식기(Recognizer), 그리고 1-Stage End-to-End 방식의 성능 비교
              </p>
            </div>

            {/* Architecture Comparison Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-300 border-b border-slate-800">
                    <th className="p-3.5 font-bold text-slate-400">모델명 / 아키텍처</th>
                    <th className="p-3.5 font-bold text-sky-400">담당 역할</th>
                    <th className="p-3.5 font-bold text-emerald-400">추론 속도 (FPS)</th>
                    <th className="p-3.5 font-bold text-indigo-400">정확도 (mAP / CRR)</th>
                    <th className="p-3.5 font-bold text-amber-400">엣지 NPU 가속성</th>
                    <th className="p-3.5 font-bold text-slate-300">추천 시나리오</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-900/60 font-mono text-[11px]">
                  <tr className="hover:bg-slate-800/40">
                    <td className="p-3.5 font-sans font-bold text-white">YOLOv8-Nano / Small</td>
                    <td className="p-3.5 text-sky-300">번호판 영역 탐지 (BBox)</td>
                    <td className="p-3.5 text-emerald-300 font-bold">120+ FPS (8.3ms)</td>
                    <td className="p-3.5 text-indigo-300">mAP50: 98.9%</td>
                    <td className="p-3.5 text-amber-300">최상 (TensorRT 완벽)</td>
                    <td className="p-3.5 font-sans text-slate-300">실시간 도로/주차관제 1단계 검출</td>
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="p-3.5 font-sans font-bold text-white">CRNN (ResNet + BiLSTM + CTC)</td>
                    <td className="p-3.5 text-sky-300">문자 인식 (Sequence OCR)</td>
                    <td className="p-3.5 text-emerald-300 font-bold">75+ FPS (13.2ms)</td>
                    <td className="p-3.5 text-indigo-300">CRR: 99.1%</td>
                    <td className="p-3.5 text-amber-300">우수 (ONNX 배포 용이)</td>
                    <td className="p-3.5 font-sans text-slate-300">일반 1줄/신형 8자리 번호판 OCR</td>
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="p-3.5 font-sans font-bold text-white">PaddleOCR SVTR (Vision Transformer)</td>
                    <td className="p-3.5 text-sky-300">문자 인식 (Patch Tokenizer)</td>
                    <td className="p-3.5 text-emerald-300 font-bold">90+ FPS (11.0ms)</td>
                    <td className="p-3.5 text-indigo-300">CRR: 99.4%</td>
                    <td className="p-3.5 text-amber-300">최상 (C++ 추론 엔진 제공)</td>
                    <td className="p-3.5 font-sans text-slate-300">악천후 및 기울어진 번호판 산업용</td>
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="p-3.5 font-sans font-bold text-white">LPRNet (End-to-End Lightweight)</td>
                    <td className="p-3.5 text-sky-300">경량 단일단계 번호판 OCR</td>
                    <td className="p-3.5 text-emerald-300 font-bold">150+ FPS (6.5ms)</td>
                    <td className="p-3.5 text-indigo-300">CRR: 96.8%</td>
                    <td className="p-3.5 text-amber-300">극상 (초소형 모델 &lt; 2MB)</td>
                    <td className="p-3.5 font-sans text-slate-300">초저전력 MCU/라즈베리파이 환경</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Why 2-Stage Pipeline */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <h4 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>왜 현업에서는 1-Stage보다 2-Stage 파이프라인(YOLO + OCR)을 선호하는가?</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                차량 번호판은 전체 1920×1080 FHD 화면에서 약 2~4% 면적만을 차지합니다. 전체 화면에서 직접 OCR을 수행하면 
                엄청난 계산 낭비와 배경 오인식이 발생합니다. <strong>YOLO로 번호판 영역만 1차 정밀 크롭(Crop)</strong>하고, 
                사각 왜곡을 펴준 뒤 OCR 네트워크로 넘기는 2-Stage 방식이 정확도와 속도 면에서 산업 표준으로 채택되고 있습니다.
              </p>
            </div>
          </div>
        )}

        {/* Tab 5: 실전 학습 스크립트 코드 (Code) */}
        {activeTab === 'code' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="pb-4 border-b border-slate-800">
              <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <Code2 className="w-6 h-6 text-emerald-400" />
                <span>실전 번호판 AI 모델 훈련 파이썬 스크립트</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                YOLOv8 번호판 탐지기 학습, PyTorch CRNN OCR 학습, 한글 번호판 가상 합성기 코드 예제
              </p>
            </div>

            <div className="space-y-6">
              {/* Code Block 1: YOLOv8 Training */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
                <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
                    <Terminal className="w-4 h-4" />
                    <span>train_plate_detector_yolo.py (YOLOv8 검출기 훈련)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyCode('yolo', `# 1. YOLOv8 번호판 검출기 학습 스크립트
from ultralytics import YOLO

def train_plate_detector():
    # 사전 학습된 YOLOv8-nano 백본 로드
    model = YOLO('yolov8n.pt')

    # 번호판 데이터셋 학습 실행
    results = model.train(
        data='dataset_plates.yaml',
        epochs=150,
        imgsz=640,
        batch=32,
        device=0, # GPU ID
        workers=8,
        optimizer='AdamW',
        lr0=0.001,
        lrf=0.01,
        mosaic=1.0, # Mosaic 증강
        degrees=10.0, # 회전 증강
        perspective=0.0005, # 원근 왜곡 증강
        project='runs/plate_detect',
        name='yolov8n_kr_plate',
        save=True
    )

    # 최고 가중치로 ONNX 익스포트
    model.export(format='onnx', dynamic=True, simplify=True)
    print("YOLOv8 Plate Detector Exported to ONNX!")

if __name__ == '__main__':
    train_plate_detector()`)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition-colors"
                  >
                    {copiedCodeId === 'yolo' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">복사 완료!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>코드 복사</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto bg-slate-950/60 leading-relaxed">
{`# 1. YOLOv8 번호판 검출기 학습 스크립트
from ultralytics import YOLO

def train_plate_detector():
    # 사전 학습된 YOLOv8-nano 백본 로드
    model = YOLO('yolov8n.pt')

    # 번호판 데이터셋 학습 실행
    results = model.train(
        data='dataset_plates.yaml',
        epochs=150,
        imgsz=640,
        batch=32,
        device=0, # GPU ID
        workers=8,
        optimizer='AdamW',
        lr0=0.001,
        lrf=0.01,
        mosaic=1.0,         # Mosaic 증강 활성화
        degrees=10.0,       # 임의 회전 각도 (-10° ~ +10°)
        perspective=0.0005, # 사각 원근 왜곡 증강
        project='runs/plate_detect',
        name='yolov8n_kr_plate',
        save=True
    )

    # 최고 가중치로 ONNX 익스포트 (C++ / TensorRT 배포용)
    model.export(format='onnx', dynamic=True, simplify=True)
    print("YOLOv8 Plate Detector Exported to ONNX!")

if __name__ == '__main__':
    train_plate_detector()`}
                </pre>
              </div>

              {/* Code Block 2: CRNN OCR Training */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
                <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono text-sky-400 font-bold">
                    <Terminal className="w-4 h-4" />
                    <span>train_plate_ocr_crnn.py (PyTorch CRNN + CTC Loss 훈련)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyCode('crnn', `# 2. CRNN + CTC Loss 번호판 문자 인식기 학습
import torch
import torch.nn as nn
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingLR

class CRNN(nn.Module):
    def __init__(self, num_classes):
        super(CRNN, self).__init__()
        # CNN Feature Extractor (ResNet Style)
        self.cnn = nn.Sequential(
            nn.Conv2d(3, 64, kernel_size=3, padding=1), nn.BatchNorm2d(64), nn.ReLU(),
            nn.MaxPool2d(2, 2), # 32x128
            nn.Conv2d(64, 128, kernel_size=3, padding=1), nn.BatchNorm2d(128), nn.ReLU(),
            nn.MaxPool2d(2, 2), # 16x64
            nn.Conv2d(128, 256, kernel_size=3, padding=1), nn.BatchNorm2d(256), nn.ReLU(),
            nn.MaxPool2d((2, 1)), # 8x64
            nn.Conv2d(256, 512, kernel_size=3, padding=1), nn.BatchNorm2d(512), nn.ReLU(),
            nn.MaxPool2d((2, 1)), # 4x64
            nn.Conv2d(512, 512, kernel_size=2), nn.BatchNorm2d(512), nn.ReLU() # 1x63
        )
        # Bi-LSTM Sequence Model
        self.rnn = nn.LSTM(512, 256, bidirectional=True, num_layers=2, batch_first=True)
        self.fc = nn.Linear(512, num_classes) # 한국어 자모 + 숫자 + Blank Token

    def forward(self, x):
        feat = self.cnn(x) # [B, 512, 1, W]
        feat = feat.squeeze(2).permute(0, 2, 1) # [B, W, 512]
        out, _ = self.rnn(feat)
        logits = self.fc(out) # [B, W, num_classes]
        return logits.log_softmax(2)`)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition-colors"
                  >
                    {copiedCodeId === 'crnn' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">복사 완료!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>코드 복사</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto bg-slate-950/60 leading-relaxed">
{`# 2. CRNN + CTC Loss 번호판 문자 인식기 모델 구조
import torch
import torch.nn as nn

class CRNN(nn.Module):
    def __init__(self, num_classes):
        super(CRNN, self).__init__()
        # CNN 백본 특징 추출기 (256x64 크롭 번호판 입력)
        self.cnn = nn.Sequential(
            nn.Conv2d(3, 64, kernel_size=3, padding=1), nn.BatchNorm2d(64), nn.ReLU(),
            nn.MaxPool2d(2, 2), # 32x128
            nn.Conv2d(64, 128, kernel_size=3, padding=1), nn.BatchNorm2d(128), nn.ReLU(),
            nn.MaxPool2d(2, 2), # 16x64
            nn.Conv2d(128, 256, kernel_size=3, padding=1), nn.BatchNorm2d(256), nn.ReLU(),
            nn.MaxPool2d((2, 1)), # 8x64
            nn.Conv2d(256, 512, kernel_size=3, padding=1), nn.BatchNorm2d(512), nn.ReLU(),
            nn.MaxPool2d((2, 1)), # 4x64
            nn.Conv2d(512, 512, kernel_size=2), nn.BatchNorm2d(512), nn.ReLU() # 1x63
        )
        # Bi-LSTM 시퀀스 모델링 (양방향 문맥 고려: '처'/'퍼', '고'/'보' 구별)
        self.rnn = nn.LSTM(512, 256, bidirectional=True, num_layers=2, batch_first=True)
        self.fc = nn.Linear(512, num_classes) # 숫자 + 한글 음절셋 + CTC Blank 토큰

    def forward(self, x):
        feat = self.cnn(x)                       # [B, 512, 1, W]
        feat = feat.squeeze(2).permute(0, 2, 1) # [B, W, 512]
        out, _ = self.rnn(feat)
        logits = self.fc(out)                    # [B, W, num_classes]
        return logits.log_softmax(2)             # CTC Loss 입력 포맷`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: 학습 성공 체크리스트 (Checklist) */}
        {activeTab === 'checklist' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="pb-4 border-b border-slate-800">
              <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <span>현장 배포 99%+ 성공을 위한 번호판 학습 체크리스트</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                실제 도로 현장 투입 전 반드시 검증해야 할 필수 품질 체크포인트입니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>데이터셋 무결성 체크</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-2 list-disc pl-5 leading-relaxed">
                  <li><strong>좌우반전(Horizontal Flip) 금지:</strong> 번호판 텍스트 방향이 반전되어 오학습되므로 증강 파이프라인에서 반드시 비활성화</li>
                  <li><strong>신형 8자리 vs 구형 7자리 비율:</strong> 현행 도로 비율(8자리 약 65%, 7자리 약 30%, 기타 5%)에 부합하는 가중치 배분</li>
                  <li><strong>특수 목적 번호판 수집:</strong> 친환경 전기차(하늘색), 영업용(노란색 택시/버스), 건설기계(주황색) 최소 각 1만 장 이상 확보</li>
                  <li><strong>개인정보 비식별화(PII):</strong> 원본 차량 운전자 얼굴 마스킹 처리 및 개인정보보호법 컴플라이언스 준수</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>광학 & 물리 환경 체크</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-2 list-disc pl-5 leading-relaxed">
                  <li><strong>카메라 노출 속도(Shutter Speed):</strong> 1/1000s~1/2000s 초고속 노출 환경 데이터셋 수집 (모션 블러 억제)</li>
                  <li><strong>야간 IR 재귀반사지 할레이션:</strong> 적외선 조명 반사로 번호판 전체가 하얗게 타는 현상에 대응한 고감마/HDR 훈련 데이터 포함</li>
                  <li><strong>픽셀 해상도 골디락스:</strong> 검출된 번호판 폭이 130~300px 범위를 벗어나지 않도록 광학 줌(Zoom) 최적화</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>모델 평가 및 오답 분석</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-2 list-disc pl-5 leading-relaxed">
                  <li><strong>완전 일치율(Exact Match) 98.0%+ 달성:</strong> 1문자만 오인식되어도 통행료/주차료 부과 대상이 바뀌므로 전수 일치 필수</li>
                  <li><strong>한글 헷갈림 행렬(Confusion Matrix):</strong> '처'↔'퍼', '고'↔'보', '구'↔'두'의 상호 혼동률 0.5% 미만 검증</li>
                  <li><strong>문자 단위 인식률(CRR):</strong> Character Recognition Rate 99.5% 이상 달성 확인</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>엣지(Edge) 배포 및 처리 지연</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-2 list-disc pl-5 leading-relaxed">
                  <li><strong>초당 처리 프레임(FPS):</strong> 엣지 산업용 PC에서 최소 30 FPS, 고속도로 60 FPS 보장 (종단간 33ms 이내)</li>
                  <li><strong>TensorRT / OpenVINO 변환:</strong> FP16 및 INT8 양자화 시 정확도 하락폭 0.3% 이내 방어 확인</li>
                  <li><strong>로컬 오프라인 무중단 구동:</strong> 클라우드 인터넷 단절 시에도 엣지에서 100% 로컬 추론 동작 보장</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
