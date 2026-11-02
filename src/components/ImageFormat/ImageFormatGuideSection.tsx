import React, { useState, useMemo } from 'react';
import {
  FileImage,
  FileType,
  Layers,
  Cpu,
  Zap,
  Sparkles,
  ShieldCheck,
  Scale,
  FolderArchive,
  HardDrive,
  Gauge,
  Clock,
  ArrowRight,
  Sliders,
  Info,
  Eye,
  HelpCircle,
  Check,
  X,
  AlertTriangle,
  Database,
  Radio,
  FileCode,
  Share2,
  Terminal,
  Maximize2
} from 'lucide-react';

export interface FormatDetail {
  id: 'jpeg' | 'webp' | 'png' | 'raw';
  name: string;
  fullName: string;
  standard: string;
  ext: string;
  category: '손실 압축 (Lossy)' | '차세대 고효율 (Modern)' | '무손실 압축 (Lossless)' | '비압축 센서 원본 (Uncompressed)';
  color: string;
  badgeBg: string;
  borderColor: string;
  ringColor: string;
  tagColor: string;
  // Core Specs
  compressionType: string;
  algorithm: string;
  chromaSubsampling: string;
  bitDepth: string;
  alphaChannel: boolean;
  metadataSupport: string;
  hardwareEncoding: string;
  typicalCompressionRatio: string;
  fhdFileSizeKb: number; // typical FHD color image size in KB
  // Scores out of 10
  scoreFidelity: number;
  scoreCompression: number;
  scoreSpeed: number;
  scoreCompatibility: number;
  // Engineering Pros & Cons
  pros: string[];
  cons: string[];
  artifacts: string;
  // Key Technical Characteristics
  technicalDeepDive: {
    title: string;
    description: string;
    mathPrinciple: string;
  };
  // Applications / Use cases
  practicalApplications: {
    field: string;
    role: string;
    whyChosen: string;
    recommendedSettings: string;
  }[];
}

const FORMAT_DATA: FormatDetail[] = [
  {
    id: 'jpeg',
    name: 'JPEG / JPG',
    fullName: 'Joint Photographic Experts Group (ISO/IEC 10918-1)',
    standard: '국제 표준 ISO/IEC 10918-1 / ITU-T T.81',
    ext: '.jpg / .jpeg',
    category: '손실 압축 (Lossy)',
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    borderColor: 'border-emerald-500/40',
    ringColor: 'ring-emerald-500/20',
    tagColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
    compressionType: '손실 압축 (Lossy Transform Coding)',
    algorithm: '8x8 이산 코사인 변환 (DCT) + 양자화 테이블(Quantization Matrix) + 허프만(Huffman) 부호화',
    chromaSubsampling: 'YUV 4:2:0 (기본) / YUV 4:2:2 / YUV 4:4:4 지원',
    bitDepth: '채널당 8-bit (24-bit TrueColor, 1,677만 색상)',
    alphaChannel: false,
    metadataSupport: 'EXIF 2.32, IPTC, XMP (카메라 셔터속도, ISO, GPS, 촬영일시)',
    hardwareEncoding: '초고속 완벽 지원 (Nvidia NVENC, Intel QSV, 온보드 Ambarella/HiSilicon DSP ASIC)',
    typicalCompressionRatio: '10:1 ~ 20:1 (원본 비압축 대비 5~10% 수준)',
    fhdFileSizeKb: 420,
    scoreFidelity: 8.5,
    scoreCompression: 8.8,
    scoreSpeed: 9.9,
    scoreCompatibility: 10.0,
    pros: [
      '전 세계 모든 OS, 브라우저, 임베디드 칩셋에서 100% 네이티브 하드웨어 디코딩/인코딩 지원',
      '카메라 내부 SoC(ASIC)에서 1ms 미만의 지연 시간(Zero-latency)으로 초고속 압축 완료',
      '품질(Quality 1~100) 조절이 매우 유연하여 대역폭 제약 환경에 신속히 적응',
      'EXIF 표준 메타데이터를 완벽 지원하여 번호판 단속 위치, 셔터스피드, 센서 게인 값 보존 용이'
    ],
    cons: [
      '알파 채널(투명 배경) 미지원으로 번호판 마스킹 오버레이 처리 시 독립 투명화 불가',
      '반복 저장(Re-saving) 시 세대 손실(Generation Loss) 누적으로 화질 열화 발생',
      '압축률을 과도하게 높일 경우 8x8 블록 아티팩트 및 번호판 글자 경계 링잉(Ringing) 노이즈 발생',
      '8-bit 색상 심도 제한으로 역광/야간 HDR 암부 복원 시 밴딩(Banding) 현상 발생'
    ],
    artifacts: '8x8 블록 경계선 왜곡(Blocking), 고주파 텍스트 윤곽 고스트 링잉(Mosquito Noise)',
    technicalDeepDive: {
      title: 'DCT 공간 주파수 분해 및 심리 시각적 양자화(Quantization)',
      description: '사람의 눈이 밝기(휘도 Y) 변화에는 극도로 민감하지만 색상(색차 Cb/Cr)과 고주파 세밀 패턴에는 둔감하다는 심리 시각적 특성을 이용합니다. 이미지를 8x8 픽셀 블록으로 나누고 DCT를 통해 저주파(기본 명암)와 고주파(미세 텍셀)로 분리한 뒤, 고주파 계수를 거칠게 반올림(Quantization)하여 데이터양을 90% 이상 줄입니다.',
      mathPrinciple: 'F(u,v) = 1/4 C(u)C(v) ∑∑ f(x,y) cos[(2x+1)uπ/16] cos[(2y+1)vπ/16]'
    },
    practicalApplications: [
      {
        field: '고속도로 ALPR 현장 단속 (ITS Enforcement)',
        role: '카메라 에지(Edge)에서 중앙 관제 센터로의 실시간 위반 차량 사진 전송',
        whyChosen: '카메라 내장 하드웨어 ISP에서 60fps로 번호판을 검출하는 즉시 0.8ms 만에 JPEG 90%로 압축하여 LTE/5G 무선망 트래픽과 전송 지연을 최소화합니다.',
        recommendedSettings: 'Quality 90%, Chroma 4:2:2 (글자 윤곽 엣지 보존용)'
      },
      {
        field: '공영/민영 주차장 무인 차단기 관제 (Parking Gate)',
        role: '입출차 차량 번호판 캡처 및 주차 정산기/키오스크 영수증 표출',
        whyChosen: '하루 수만 대의 차량이 입출차하는 환경에서 저가형 임베디드 리눅스 보드에서도 CPU 점유율 1% 미만으로 가볍게 저장 및 브라우저 표출 가능.',
        recommendedSettings: 'Quality 85%, Chroma 4:2:0 (~250 KB/장)'
      },
      {
        field: 'CCTV VMS 이벤트 스냅샷 아카이빙',
        role: '움직임 검출 및 침입 이벤트 발생 시 NVR 디스크에 정지 영상 덤프',
        whyChosen: '수백 대 카메라의 스냅샷을 표준 파일시스템에 저장할 때 인덱싱 호환성과 범용 뷰어 지원 보장.',
        recommendedSettings: 'Quality 85~90%, 자동 Inode 분할 디렉토리 저장'
      }
    ]
  },
  {
    id: 'webp',
    name: 'WebP',
    fullName: 'Web Picture Format (Google 오픈소스 규격)',
    standard: 'Google WebP Specification (VP8/VP8L 비디오 코덱 기반)',
    ext: '.webp',
    category: '차세대 고효율 (Modern)',
    color: 'text-purple-400',
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    borderColor: 'border-purple-500/40',
    ringColor: 'ring-purple-500/20',
    tagColor: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
    compressionType: '손실 / 무손실 하이브리드 지원 (Lossy & Lossless)',
    algorithm: 'VP8 인트라 프레임 블록 예측(Predictive Coding) + 산술 부호화(Arithmetic Coding)',
    chromaSubsampling: 'YUV 4:2:0 (손실) / RGB 무손실 지원',
    bitDepth: '채널당 8-bit (손실) + 8-bit 알파 채널(투명도 지원)',
    alphaChannel: true,
    metadataSupport: 'EXIF, XMP 메타데이터 지원 (ICC 색상 프로파일 포함)',
    hardwareEncoding: '최신 GPU(RTX 40/50 시리즈, Apple Silicon) 및 최신 SoC에서 가속 지원 확대 중',
    typicalCompressionRatio: '15:1 ~ 30:1 (동일 화질 기준 JPEG 대비 25~34% 추가 절감)',
    fhdFileSizeKb: 295,
    scoreFidelity: 9.0,
    scoreCompression: 9.8,
    scoreSpeed: 8.6,
    scoreCompatibility: 9.2,
    pros: [
      '동일한 시각적 품질(SSIM 지수) 기준 표준 JPEG 대비 25~34% 더 적은 용량 달성',
      '손실 압축 상태에서도 8-bit 알파 채널(투명 배경)을 완벽히 지원',
      '모던 웹 브라우저(Chrome, Safari, Edge, Firefox) 100% 네이티브 렌더링 지원',
      '블록 경계 디블록킹(Deblocking) 필터가 내장되어 낮은 비트레이트에서도 깍두기 왜곡 억제'
    ],
    cons: [
      '구형 레거시 임베디드 CCTV 카메라(2018년 이전 칩셋)에서는 하드웨어 인코더 부재로 CPU 부하 발생',
      '과거 Windows 기본 사진 뷰어 및 일부 산업용 VMS 소프트웨어에서 플러그인 필요',
      '인코딩 연산 복잡도(Complexity)가 JPEG 대비 약 1.5~2배 높아 초당 수백 프레임 압축 시 CPU 부하 고려 필요'
    ],
    artifacts: '극단적 저비트레이트 시 블록 대신 유화풍 블러링(Smoothing) 현상 발생',
    technicalDeepDive: {
      title: '공간 예측 코딩(Spatial Prediction) 및 컨텍스트 적응형 부호화',
      description: 'WebP의 손실 압축은 VP8 비디오 코덱의 키프레임 압축 기술을 계승했습니다. 이미 인코딩된 주변 하위 블록들로부터 현재 블록의 픽셀 방향성(수평, 수직, DC, 트루모션 등 4가지 모드)을 수학적으로 예측하고, 실제 값과의 오차(Residual) 잔차만을 이산 코사인 변환하여 산술 부호화하므로 불필요한 반복 정보가 극단적으로 제거됩니다.',
      mathPrinciple: 'Residual(x,y) = Original(x,y) - Predictor_Mode(x,y)'
    },
    practicalApplications: [
      {
        field: '클라우드 웹/모바일 ALPR 관제 포털 (Cloud Dashboard)',
        role: '웹 브라우저 및 스마트폰 앱에 실시간 차량 통행 사진 스트리밍 표출',
        whyChosen: 'AWS S3 클라우드 아웃바운드 트래픽(Egress Cost)을 30% 절감하고, 모바일 LTE 접속 환경에서 대시보드 로딩 지연을 1초 미만으로 단축.',
        recommendedSettings: 'Lossy Quality 85%, Method 4 (압축률과 인코딩 속도 밸런스)'
      },
      {
        field: '번호판 검출 영역(ROI) 알파 마스킹 오버레이',
        role: '단속 위반 차량 사진 위에 번호판 하이라이트 박스를 반투명 레이어로 합성',
        whyChosen: 'JPEG에서는 불가능한 알파 채널 투명도를 손실 압축의 초경량 용량(100KB 미만)으로 구현 가능.',
        recommendedSettings: 'Quality 90% with Alpha Quality 100%'
      },
      {
        field: '대규모 ITS 이미지 빅데이터 레이크 (Big Data Lake)',
        role: '수천만 장의 연간 차량 통행 기록 아카이빙 스토리지 절감',
        whyChosen: '연간 100TB 이상의 스토리지를 68TB 수준으로 줄여 서버 하드디스크 구매 비용 수천만 원 절약.',
        recommendedSettings: 'Lossy Quality 80%, Multithreaded Encoding'
      }
    ]
  },
  {
    id: 'png',
    name: 'PNG',
    fullName: 'Portable Network Graphics (ISO/IEC 15948)',
    standard: 'W3C Recommendation / ISO/IEC 15948:2004',
    ext: '.png',
    category: '무손실 압축 (Lossless)',
    color: 'text-sky-400',
    badgeBg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    borderColor: 'border-sky-500/40',
    ringColor: 'ring-sky-500/20',
    tagColor: 'bg-sky-950/80 text-sky-300 border-sky-700/60',
    compressionType: '무손실 압축 (Lossless Compression)',
    algorithm: '2D 예측 필터(None, Sub, Up, Average, Paeth) + Deflate(LZ77 + 허프만 코딩)',
    chromaSubsampling: 'RGB 4:4:4 (색차 손실 전혀 없음)',
    bitDepth: '채널당 8-bit 또는 16-bit (최대 48-bit RGB + 16-bit Alpha = 64-bit RGBA)',
    alphaChannel: true,
    metadataSupport: 'tEXt, zTXt, iTXt 청크 (텍스트 메타데이터 및 타임스탬프)',
    hardwareEncoding: '소프트웨어 Deflate 기반 (인코딩 연산량이 커서 고해상도 처리 시 속도 제한)',
    typicalCompressionRatio: '2:1 ~ 4:1 (비압축 대비 약 30~50% 수준 크기)',
    fhdFileSizeKb: 3180,
    scoreFidelity: 10.0,
    scoreCompression: 5.5,
    scoreSpeed: 6.8,
    scoreCompatibility: 10.0,
    pros: [
      '100% 수학적 무손실 압축: 원본 센서의 단 1픽셀도 왜곡이나 아티팩트 없이 원본 그대로 복원',
      '문자, 기호, 번호판 폰트 엣지(High-frequency Edge)가 칼처럼 선명하게 유지',
      '완벽한 8-bit / 16-bit 알파 채널 지원으로 정밀한 세그멘테이션 마스크(Ground Truth) 저장 가능',
      '수백 번 열고 다시 저장해도 화질 손상(Generation Loss)이 0%'
    ],
    cons: [
      '자연 풍경/실사 차량 사진에서 파일 크기가 JPEG 대비 5~8배로 급증하여 전송 대역폭 부담',
      'Deflate 압축 알고리즘 특성상 인코딩 시간이 길어 고속 60fps 연속 실시간 전송 부적합',
      '카메라 내부 DSP에서 하드웨어 인코더를 지원하지 않는 경우가 많아 메인 CPU 자원 소모'
    ],
    artifacts: '압축 아티팩트 전무 (수학적 100% 원본 픽셀 보존)',
    technicalDeepDive: {
      title: 'Paeth 예측 필터링 및 Deflate(LZ77) 엔트로피 부호화',
      description: 'PNG는 인접한 픽셀끼리 색상이 비슷하다는 연속성을 활용합니다. 가로(Left), 세로(Above), 대각선(UpperLeft)의 세 픽셀을 참조하여 현재 픽셀 값을 추정하는 5가지 바이트 필터(Paeth 필터)를 적용해 값의 편차를 0 주변으로 밀집시킵니다. 그 후 LZ77 사전식 중복 제거와 허프만 코딩을 결합한 Deflate 알고리즘으로 압축합니다.',
      mathPrinciple: 'p = a + b - c; pa = |p - a|; pb = |p - b|; pc = |p - c|; (최소 편차 픽셀 채택)'
    },
    practicalApplications: [
      {
        field: '딥러닝 세그멘테이션 마스크 데이터셋 (AI Ground Truth)',
        role: 'YOLOv8-Seg, DeepLabV3+용 차량 번호판/문자 단위 픽셀 마스크(Ground Truth) 레이블링',
        whyChosen: '마스크 이미지의 경계선이 1픽셀이라도 번지거나 손실되면 학습 손실함수(IoU Loss)가 왜곡되므로 100% 무손실 보존 필수.',
        recommendedSettings: 'PNG-8 (색상 팔레트 모드) 또는 PNG-24 with Alpha'
      },
      {
        field: '번호판 OCR 템플릿 매칭 & 글자 골든 폰트 (OCR Template)',
        role: '대한민국 8자리/7자리 번호판 서체 정밀 대조용 기준 글리프 보관',
        whyChosen: '글자 획의 굵기(Stroke width)와 곡률 반경이 손상 없이 보존되어 전통적 영상처리(OpenCV MatchTemplate) 정확도 극대화.',
        recommendedSettings: 'PNG 8-bit Grayscale'
      },
      {
        field: '고정밀 머신비전 부품 치수 검사 (Industrial Inspection)',
        role: '공장 라인에서 자동차 번호판 볼트 및 차대 번호 각인 미세 균열/스크래치 검사',
        whyChosen: '서브픽셀(Sub-pixel) 단위 0.01mm 오차 측정이 필요한 정밀 계측에서는 손실 압축의 링잉 노이즈가 치명적 결함으로 오인될 수 있음.',
        recommendedSettings: 'PNG 16-bit Lossless'
      }
    ]
  },
  {
    id: 'raw',
    name: 'RAW (센서 원본)',
    fullName: 'Uncompressed Sensor RAW / Bayer Pattern CFA Data',
    standard: '제조사 전용 규격(Sony, Onsemi, Basler) 또는 Adobe DNG 규격',
    ext: '.raw / .dng / .bin',
    category: '비압축 센서 원본 (Uncompressed)',
    color: 'text-rose-400',
    badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    borderColor: 'border-rose-500/40',
    ringColor: 'ring-rose-500/20',
    tagColor: 'bg-rose-950/80 text-rose-300 border-rose-700/60',
    compressionType: '비압축 또는 무손실 압축 (Raw ADC Readings)',
    algorithm: 'CMOS 포토다이오드 아날로그-디지털 변환(ADC) 전압 원시 데이터 덤프',
    chromaSubsampling: 'Bayer RGGB / BGGR CFA (디모자이킹 이전의 순수 광자 수 카운트)',
    bitDepth: '채널당 10-bit, 12-bit, 14-bit, 16-bit (최대 65,536 단계 계조)',
    alphaChannel: false,
    metadataSupport: '카메라 센서 레지스터, 노출시간(us), 아날로그 게인(dB), 렌즈 F값 전수 기록',
    hardwareEncoding: '센서 DMA 직접 전송 (CPU 압축 연산 전혀 없음)',
    typicalCompressionRatio: '1:1 (압축률 0%, 최대 용량 점유)',
    fhdFileSizeKb: 6075,
    scoreFidelity: 10.0,
    scoreCompression: 1.0,
    scoreSpeed: 9.5,
    scoreCompatibility: 4.5,
    pros: [
      '카메라 ISP(디모자이킹, 감마 보정, 화이트밸런스, 노이즈제거) 이전의 완벽한 순수 물리 광학 데이터',
      '10~14비트 광역 다이내믹 레인지(HDR): 야간 강한 헤드라이트나 그림자 속 번호판 문자를 사후 노출 보정으로 100% 복구 가능',
      '법정 단속 증거물로서 무결성(Integrity) 및 변조 불가성 입증에 가장 강력한 원본 증거력 확보',
      '디모자이킹 알고리즘(AHD, VNG, AI 디모자이킹)을 오프라인 서버에서 최고 성능 모델로 적용 가능'
    ],
    cons: [
      '용량이 표준 JPEG 대비 14~20배에 달해 대용량 NVMe SSD 또는 고속 10Gbps 광케이블 필수',
      '일반 브라우저나 OS에서 직접 열리지 않으며, DNG 컨버터나 전용 SDK 라이브러리(libraw) 필수',
      'LTE 무선 통신망을 통한 실시간 전송 불가능 (로컬 저장 후 일괄 백업 방식만 허용)'
    ],
    artifacts: '압축 아티팩트 제로 (순수 센서 아날로그 전압 신호)',
    technicalDeepDive: {
      title: 'Bayer 컬러 필터 어레이(CFA)와 아날로그-디지털 변환(ADC)',
      description: '카메라 센서의 포토다이오드는 빛의 세기(명암)만 감지할 수 있습니다. 센서 위에 Red, Green, Blue 컬러 필터를 2x2 패턴(RGGB)으로 배치하여 각 화소별로 한 가지 색상 광자 전압만을 측정합니다. 일반 카메라는 이를 보간(Demosaicing)하여 24비트 RGB로 변환하지만, RAW 파일은 보간 이전의 12/14비트 원시 센서 전압을 그대로 파일로 덤프합니다.',
      mathPrinciple: 'Pixel_Value = ADC_Quantize( ∫ Photodiode_Charge · Analog_Gain dt )'
    },
    practicalApplications: [
      {
        field: '경찰청/도로교통공단 법정 단속 증거물 보존 (Legal Forensics)',
        role: '과속 단속 및 음주 뺑소니 사건의 법정 제출용 원본 무결성 증거 데이터 저장',
        whyChosen: '형사소송법상 디지털 증거의 원본성과 위변조 부존재를 입증할 수 있는 유일한 원시 포맷이며, SHA-256 전자서명과 결합하여 법적 효력 극대화.',
        recommendedSettings: 'Adobe DNG (무손실 압축 옵션) + 센서 레지스터 덤프'
      },
      {
        field: '차세대 ALPR 딥러닝 AI 파운데이션 모델 훈련 (AI Training)',
        role: 'YOLOv9, LPRNet, Transformer 기반 비전 인식 모델의 골든 데이터셋 구축',
        whyChosen: '손실 압축된 데이터로 학습하면 모델이 JPEG 아티팩트에 오버피팅되지만, RAW 데이터셋으로 학습하면 다양한 조도 환경에 강인한 범용 가중치 생성 가능.',
        recommendedSettings: '12-bit Raw Bayer 덤프'
      },
      {
        field: '터널 출구 극단적 역광 사후 이미지 복원 (Post-Processing)',
        role: '주간 터널 출구 직사광선(100,000 Lux)과 터널 내부 암부(10 Lux) 차량 동시 식별',
        whyChosen: '8-bit JPEG에서는 번호판이 화이트아웃(클리핑)되어 영구 유실되지만, 14-bit RAW는 사후 소프트웨어 톤매핑으로 글자를 선명하게 살려냄.',
        recommendedSettings: 'Dual Gain HDR Raw (14-bit)'
      }
    ]
  }
];

export const ImageFormatGuideSection: React.FC = () => {
  const [selectedFormatId, setSelectedFormatId] = useState<'jpeg' | 'webp' | 'png' | 'raw'>('jpeg');
  const [activeTab, setActiveTab] = useState<'overview' | 'comparison' | 'applications' | 'simulator' | 'wizard'>('overview');

  // Interactive Simulator Controls
  const [simResolution, setSimResolution] = useState<'fhd' | '5m' | '4k'>('fhd');
  const [simBatchCount, setSimBatchCount] = useState<number>(1000);
  const [simNetworkSpeedMbps, setSimNetworkSpeedMbps] = useState<number>(100); // 100Mbps LTE

  // Decision Wizard States
  const [wizardPriority, setWizardPriority] = useState<'bandwidth' | 'legal' | 'web' | 'ai_train'>('bandwidth');

  const selectedFormat = useMemo(() => {
    return FORMAT_DATA.find(f => f.id === selectedFormatId) || FORMAT_DATA[0];
  }, [selectedFormatId]);

  // Simulator Calculations
  const simCalculations = useMemo(() => {
    const resMultipliers = {
      fhd: 1.0,
      '5m': 2.33,
      '4k': 4.0
    };
    const mult = resMultipliers[simResolution];

    return FORMAT_DATA.map((fmt) => {
      const singleFileKb = fmt.fhdFileSizeKb * mult;
      const singleFileMb = singleFileKb / 1024;
      const batchMb = (singleFileKb * simBatchCount) / 1024;
      const batchGb = batchMb / 1024;
      // Transfer time in seconds = (Total Bits) / (Network Speed in bps)
      const transferSec = (batchMb * 8) / simNetworkSpeedMbps;
      // Relative size vs JPEG
      const ratioVsJpeg = (singleFileKb / (FORMAT_DATA[0].fhdFileSizeKb * mult)) * 100;

      return {
        ...fmt,
        singleFileKb,
        singleFileMb,
        batchMb,
        batchGb,
        transferSec,
        ratioVsJpeg
      };
    });
  }, [simResolution, simBatchCount, simNetworkSpeedMbps]);

  // Wizard Recommendation
  const wizardRecommendation = useMemo(() => {
    switch (wizardPriority) {
      case 'bandwidth':
        return {
          recommendedFormat: FORMAT_DATA[0], // JPEG
          alternative: FORMAT_DATA[1], // WebP
          title: '초고속 도로 단속 및 LTE 대역폭 최적화 시스템',
          reason: '실시간 60 FPS 단속 환경에서는 임베디드 카메라 내부의 하드웨어 JPEG ASIC 코덱을 활용해 0.8ms 만에 인코딩하는 것이 가장 안전하며, 대역폭을 극소화하려면 WebP(Quality 85%)를 병행 검토하세요.',
          optimalSettings: 'JPEG Quality 88~90%, YUV 4:2:2 서브샘플링, 타임스탬프 EXIF 번들'
        };
      case 'web':
        return {
          recommendedFormat: FORMAT_DATA[1], // WebP
          alternative: FORMAT_DATA[0], // JPEG
          title: '웹/모바일 클라우드 관제 대시보드 및 실시간 포털',
          reason: '모던 브라우저에서 100% 네이티브 지원되며, 동일 화질 기준 JPEG 대비 30%의 네트워크 전송 요금(Egress)을 절감할 수 있는 WebP가 최적입니다.',
          optimalSettings: 'WebP Lossy Quality 85%, Effort Level 4, 알파 마스크 분리 적용'
        };
      case 'legal':
        return {
          recommendedFormat: FORMAT_DATA[3], // RAW
          alternative: FORMAT_DATA[2], // PNG
          title: '경찰청/법정 제출용 위변조 불가 단속 증거 보존',
          reason: '디지털 증거 무결성을 입증하기 위해 센서의 아날로그 전압 원시 데이터인 RAW 포맷을 보존하고, SHA-256 해시값 및 타임스탬프를 블록체인/전자서명으로 밀봉해야 합니다.',
          optimalSettings: 'Adobe DNG Lossless, 12-bit Bayer CFA, SHA-256 해시 검증 파일 첨부'
        };
      case 'ai_train':
        return {
          recommendedFormat: FORMAT_DATA[2], // PNG
          alternative: FORMAT_DATA[3], // RAW
          title: 'AI 딥러닝(YOLO/LPRNet) 번호판 인식 모델 학습 및 마스크 레이블링',
          reason: '손실 압축으로 인한 고주파 엣지 뭉개짐이나 링잉 노이즈가 없는 무손실 PNG(마스크 레이블링)와 무압축 RAW(골든 원본)를 결합하여 모델의 강인성을 극대화합니다.',
          optimalSettings: '원본 학습용: PNG-24 무손실 또는 12-bit RAW / 세그멘테이션 마스크: PNG-8 팔레트'
        };
    }
  }, [wizardPriority]);

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* 1. Header Banner */}
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400 uppercase tracking-wider">
          <FileType className="w-3.5 h-3.5" />
          <span>Image Format Engineering Specification & Practical Application Guide</span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              이미지 사진 포맷별 특징 및 적용(응용) 가이드
            </h1>
            <p className="text-slate-400 text-base sm:text-lg max-w-3xl mt-2 leading-relaxed">
              머신비전, 도로 교통 단속(ITS/ALPR), 웹 관제 및 AI 딥러닝 시스템에 필수적인 
              <strong> 4대 이미지 포맷(JPEG, WebP, PNG, RAW)</strong>의 압축 원리, 화질 왜곡 특성, 
              스토리지 점유율 및 실제 현장 적용 사례를 체계적으로 비교 분석합니다.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>4대 포맷 실무 규격 탑재</span>
            </span>
          </div>
        </div>

        {/* 4 Major Format Quick Badges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2">
          {FORMAT_DATA.map((fmt) => {
            const isSelected = selectedFormatId === fmt.id;
            return (
              <div
                key={fmt.id}
                onClick={() => setSelectedFormatId(fmt.id)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  isSelected
                    ? `${fmt.borderColor} bg-slate-800/95 ring-4 ${fmt.ringColor} scale-[1.02] shadow-xl`
                    : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-lg font-black ${fmt.color}`}>{fmt.name}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${fmt.tagColor}`}>
                    {fmt.id === 'jpeg' ? '범용 표준' : fmt.id === 'webp' ? '차세대 고효율' : fmt.id === 'png' ? '무손실 투명도' : '센서 무압축'}
                  </span>
                </div>
                <div className="text-xs text-slate-300 font-medium line-clamp-1">{fmt.category}</div>
                <div className="mt-3 flex items-baseline justify-between text-xs">
                  <span className="text-slate-400">FHD 평균 크기:</span>
                  <span className="font-mono font-bold text-white">
                    {fmt.fhdFileSizeKb >= 1024 
                      ? `${(fmt.fhdFileSizeKb / 1024).toFixed(2)} MB` 
                      : `${fmt.fhdFileSizeKb} KB`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Sub-Tabs Navigation */}
      <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'overview', label: '포맷별 상세 기술 특징', icon: FileImage },
          { id: 'applications', label: '실무 현장 적용(응용) 사례 6종', icon: Layers },
          { id: 'comparison', label: '인터랙티브 스펙 비교 매트릭스', icon: Scale },
          { id: 'simulator', label: '화질 vs 용량 트레이드오프 시뮬레이터', icon: Sliders },
          { id: 'wizard', label: '포맷 결정 트리 (추천 마법사)', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 font-bold scale-[1.02]'
                  : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/70'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Main Views */}
      <div className="max-w-7xl mx-auto">
        
        {/* VIEW 1: Overview & Technical Deep Dive */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Format Selector Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">포맷 선택:</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {FORMAT_DATA.map((fmt) => (
                    <button
                      key={fmt.id}
                      onClick={() => setSelectedFormatId(fmt.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedFormatId === fmt.id
                          ? 'bg-white text-slate-900 shadow-md scale-105'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
                      }`}
                    >
                      {fmt.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-xs text-slate-400 font-mono">
                확장자: <span className="text-amber-400 font-bold">{selectedFormat.ext}</span> | {selectedFormat.standard}
              </div>
            </div>

            {/* Selected Format Detail Card */}
            <div className="bg-slate-800/90 border border-slate-700/90 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl">
              
              {/* Header Title with Scores */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-700/80 pb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className={`text-3xl font-black ${selectedFormat.color}`}>
                      {selectedFormat.name}
                    </h2>
                    <span className={`text-xs font-mono px-3 py-1 rounded-full border ${selectedFormat.badgeBg}`}>
                      {selectedFormat.category}
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm mt-2 font-medium">
                    {selectedFormat.fullName}
                  </p>
                </div>

                {/* Radar Scores Grid */}
                <div className="grid grid-cols-4 gap-2 sm:gap-3 bg-slate-900/90 p-3 rounded-2xl border border-slate-700">
                  <div className="text-center px-2">
                    <div className="text-[10px] text-slate-400">화질 무결성</div>
                    <div className="text-base font-black text-emerald-400 font-mono mt-0.5">
                      {selectedFormat.scoreFidelity} <span className="text-[10px] text-slate-500">/ 10</span>
                    </div>
                  </div>
                  <div className="text-center px-2 border-l border-slate-800">
                    <div className="text-[10px] text-slate-400">압축 효율</div>
                    <div className="text-base font-black text-purple-400 font-mono mt-0.5">
                      {selectedFormat.scoreCompression} <span className="text-[10px] text-slate-500">/ 10</span>
                    </div>
                  </div>
                  <div className="text-center px-2 border-l border-slate-800">
                    <div className="text-[10px] text-slate-400">인코딩 속도</div>
                    <div className="text-base font-black text-sky-400 font-mono mt-0.5">
                      {selectedFormat.scoreSpeed} <span className="text-[10px] text-slate-500">/ 10</span>
                    </div>
                  </div>
                  <div className="text-center px-2 border-l border-slate-800">
                    <div className="text-[10px] text-slate-400">범용 호환성</div>
                    <div className="text-base font-black text-amber-400 font-mono mt-0.5">
                      {selectedFormat.scoreCompatibility} <span className="text-[10px] text-slate-500">/ 10</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Core Technical Parameters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-1">
                  <div className="text-[11px] text-slate-400 font-mono">압축 방식 & 알고리즘</div>
                  <div className="text-sm font-bold text-white">{selectedFormat.compressionType}</div>
                  <div className="text-[11px] text-slate-400 leading-tight pt-1">{selectedFormat.algorithm}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-1">
                  <div className="text-[11px] text-slate-400 font-mono">색차 서브샘플링 & 색상 심도</div>
                  <div className="text-sm font-bold text-sky-400">{selectedFormat.chromaSubsampling}</div>
                  <div className="text-[11px] text-slate-400 leading-tight pt-1">{selectedFormat.bitDepth}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-1">
                  <div className="text-[11px] text-slate-400 font-mono">알파 채널(투명도) & 메타데이터</div>
                  <div className="text-sm font-bold flex items-center gap-1.5">
                    {selectedFormat.alphaChannel ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Check className="w-4 h-4" /> 투명 배경 지원
                      </span>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-1">
                        <X className="w-4 h-4 text-rose-400" /> 불투명만 지원
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 leading-tight pt-1">{selectedFormat.metadataSupport}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-1">
                  <div className="text-[11px] text-slate-400 font-mono">하드웨어 가속 & 압축 비율</div>
                  <div className="text-sm font-bold text-amber-400">{selectedFormat.typicalCompressionRatio}</div>
                  <div className="text-[11px] text-slate-400 leading-tight pt-1">{selectedFormat.hardwareEncoding}</div>
                </div>
              </div>

              {/* Technical Deep Dive Math Box */}
              <div className="p-6 rounded-2xl bg-slate-950/90 border border-slate-700 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Terminal className="w-4 h-4" />
                  <span>공학적 핵심 원리: {selectedFormat.technicalDeepDive.title}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  {selectedFormat.technicalDeepDive.description}
                </p>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-sky-300 overflow-x-auto">
                  수학적 모델 수식: {selectedFormat.technicalDeepDive.mathPrinciple}
                </div>
              </div>

              {/* Pros & Cons Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pros */}
                <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle2Icon className="w-4 h-4" />
                    <span>주요 공학적 장점 (Advantages)</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-200">
                    {selectedFormat.pros.map((pro, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cons & Artifacts */}
                <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>한계점 및 아티팩트 왜곡 특성 (Limitations)</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-200">
                    {selectedFormat.cons.map((con, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold">✕</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2 border-t border-rose-900/40 text-[11px] text-rose-300">
                    <strong>특유 왜곡 현상:</strong> {selectedFormat.artifacts}
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* VIEW 2: Practical Applications (적용/응용) */}
        {activeTab === 'applications' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Header intro */}
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
                <Layers className="w-5 h-5" />
                <span>현장 실무 포맷 적용(응용) 가이드라인 6대 분야</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                ALPR(차량 번호판 인식), ITS 고속도로 단속, VMS 보안 관제, 법정 증거 보존, AI 딥러닝 학습 등 
                실제 프로젝트 환경의 네트워크 대역폭, 스토리지 비용, 법적 효력에 따른 최적 포맷 채택 기준입니다.
              </p>
            </div>

            {/* 6 Real-World Application Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Scenario 1: ALPR High-speed Highway */}
              <div className="p-6 rounded-3xl bg-slate-800/90 border border-slate-700 hover:border-emerald-500/50 transition-all space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono">
                    추천: JPEG (90%)
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">LTE/5G 무선망</span>
                </div>
                <h3 className="text-lg font-bold text-white">고속도로 ALPR 현장 실시간 단속</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  카메라가 150km/h로 주행하는 차량을 캡처한 즉시 LTE 무선망을 통해 중앙 관제 센터로 전송해야 합니다. 
                  카메라 SoC 내장 하드웨어 JPEG 코덱으로 0.8ms 만에 인코딩하여 지연 없이 전송합니다.
                </p>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                  <div className="text-slate-400">권장 파라미터:</div>
                  <div className="font-mono text-emerald-300 font-semibold">Q=90, 4:2:2 Subsampling (~450KB)</div>
                </div>
              </div>

              {/* Scenario 2: Web & Mobile Dashboard */}
              <div className="p-6 rounded-3xl bg-slate-800/90 border border-slate-700 hover:border-purple-500/50 transition-all space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs font-bold font-mono">
                    추천: WebP (85%)
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">Cloud Egress 절감</span>
                </div>
                <h3 className="text-lg font-bold text-white">웹 & 모바일 실시간 관제 대시보드</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  수천 명의 관제 요원이 웹 브라우저나 스마트폰으로 입출차 차량 사진을 조회합니다. 
                  동일 화질 기준 JPEG 대비 30% 적은 트래픽으로 클라우드 CDN Egress 비용을 획기적으로 낮춥니다.
                </p>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                  <div className="text-slate-400">권장 파라미터:</div>
                  <div className="font-mono text-purple-300 font-semibold">WebP Lossy Q=85, Effort 4 (~290KB)</div>
                </div>
              </div>

              {/* Scenario 3: Legal Forensics & Police Evidence */}
              <div className="p-6 rounded-3xl bg-slate-800/90 border border-slate-700 hover:border-rose-500/50 transition-all space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-bold font-mono">
                    추천: RAW (12/14-bit)
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">법정 증거 무결성</span>
                </div>
                <h3 className="text-lg font-bold text-white">경찰청/법정 단속 증거물 무결성 보존</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  음주 뺑소니 및 과속 단속의 법정 제출 증거물입니다. 압축으로 인한 왜곡이나 위변조 의혹을 차단하기 위해 
                  센서의 Bayer CFA 원시 전압 데이터를 SHA-256 전자서명과 함께 로컬 SSD에 보존합니다.
                </p>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                  <div className="text-slate-400">권장 파라미터:</div>
                  <div className="font-mono text-rose-300 font-semibold">DNG Lossless + SHA-256 Checksum</div>
                </div>
              </div>

              {/* Scenario 4: AI Model Training Dataset */}
              <div className="p-6 rounded-3xl bg-slate-800/90 border border-slate-700 hover:border-sky-500/50 transition-all space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-bold font-mono">
                    추천: PNG 24-bit / RAW
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">골든 데이터셋</span>
                </div>
                <h3 className="text-lg font-bold text-white">AI 딥러닝 번호판 인식 모델 훈련</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  YOLOv8, LPRNet 등 딥러닝 모델을 훈련할 때는 손실 압축 아티팩트에 모델이 오버피팅되지 않도록 
                  100% 무손실 PNG 또는 무압축 RAW 이미지를 마스터 골든셋으로 관리합니다.
                </p>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                  <div className="text-slate-400">권장 파라미터:</div>
                  <div className="font-mono text-sky-300 font-semibold">PNG-24 무손실 압축 (RGB 4:4:4)</div>
                </div>
              </div>

              {/* Scenario 5: Plate Mask & Alpha Overlay */}
              <div className="p-6 rounded-3xl bg-slate-800/90 border border-slate-700 hover:border-indigo-500/50 transition-all space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs font-bold font-mono">
                    추천: PNG-8 / WebP Alpha
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">투명 배경 마스킹</span>
                </div>
                <h3 className="text-lg font-bold text-white">개인정보 보호 번호판 마스킹 및 오버레이</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  일반 대중 공개용 영상이나 보험사 제출용 자료에서 번호판 외의 탑승자 얼굴을 블러링 처리하거나, 
                  투명 배경 위에 번호판 영역만 패치(Patch)로 잘라내어 독립 저장할 때 알파 채널을 활용합니다.
                </p>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                  <div className="text-slate-400">권장 파라미터:</div>
                  <div className="font-mono text-indigo-300 font-semibold">RGBA 32-bit (8-bit Alpha Channel)</div>
                </div>
              </div>

              {/* Scenario 6: Parking Gate Kiosk & Receipt */}
              <div className="p-6 rounded-3xl bg-slate-800/90 border border-slate-700 hover:border-amber-500/50 transition-all space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold font-mono">
                    추천: JPEG (80%)
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">경량 트래픽</span>
                </div>
                <h3 className="text-lg font-bold text-white">주차 정산기 키오스크 및 모바일 카카오 알림톡</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  차량 운전자에게 카카오 알림톡이나 문자 메시지로 입차 증빙 사진을 푸시할 때, 
                  통신사 전송 용량 규격(1MB 이하, 최적 200KB)에 맞춰 가볍게 전송합니다.
                </p>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                  <div className="text-slate-400">권장 파라미터:</div>
                  <div className="font-mono text-amber-300 font-semibold">Q=80, 1280x720 리사이즈 (~180KB)</div>
                </div>
              </div>

            </div>

            {/* Practical Application Decision Matrix Table */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
              <h3 className="text-lg font-bold text-white">실무 응용 분야별 포맷 적합도 매트릭스</h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-700">
                <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-mono border-b border-slate-700 text-xs">
                    <tr>
                      <th className="py-3 px-4 font-semibold">실무 응용 분야</th>
                      <th className="py-3 px-4 font-semibold text-center">JPEG</th>
                      <th className="py-3 px-4 font-semibold text-center">WebP</th>
                      <th className="py-3 px-4 font-semibold text-center">PNG</th>
                      <th className="py-3 px-4 font-semibold text-center">RAW</th>
                      <th className="py-3 px-4 font-semibold">핵심 이유 및 선정 코멘트</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr className="hover:bg-slate-800/50">
                      <td className="py-3.5 px-4 font-bold text-white">고속도로 ALPR 실시간 전송</td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-400">최적 (◎)</td>
                      <td className="py-3.5 px-4 text-center text-purple-400">우수 (○)</td>
                      <td className="py-3.5 px-4 text-center text-slate-500">부적합 (▲)</td>
                      <td className="py-3.5 px-4 text-center text-rose-500">불가 (✕)</td>
                      <td className="py-3.5 px-4 text-xs text-slate-400">0.8ms HW ASIC 인코딩 지연 시간 필수</td>
                    </tr>
                    <tr className="hover:bg-slate-800/50">
                      <td className="py-3.5 px-4 font-bold text-white">웹/모바일 클라우드 대시보드</td>
                      <td className="py-3.5 px-4 text-center text-emerald-400">우수 (○)</td>
                      <td className="py-3.5 px-4 text-center font-bold text-purple-400">최적 (◎)</td>
                      <td className="py-3.5 px-4 text-center text-slate-500">부적합 (▲)</td>
                      <td className="py-3.5 px-4 text-center text-rose-500">불가 (✕)</td>
                      <td className="py-3.5 px-4 text-xs text-slate-400">30% Egress 트래픽 및 CDN 비용 절감</td>
                    </tr>
                    <tr className="hover:bg-slate-800/50">
                      <td className="py-3.5 px-4 font-bold text-white">법정 단속 증거물 보존</td>
                      <td className="py-3.5 px-4 text-center text-slate-400">조건부 (△)</td>
                      <td className="py-3.5 px-4 text-center text-slate-500">부적합 (▲)</td>
                      <td className="py-3.5 px-4 text-center text-sky-400">우수 (○)</td>
                      <td className="py-3.5 px-4 text-center font-bold text-rose-400">최적 (◎)</td>
                      <td className="py-3.5 px-4 text-xs text-slate-400">형소법상 원본성 입증 및 센서 CFA 보존</td>
                    </tr>
                    <tr className="hover:bg-slate-800/50">
                      <td className="py-3.5 px-4 font-bold text-white">AI 딥러닝 골든 데이터셋</td>
                      <td className="py-3.5 px-4 text-center text-slate-400">증강용 (△)</td>
                      <td className="py-3.5 px-4 text-center text-slate-400">증강용 (△)</td>
                      <td className="py-3.5 px-4 text-center font-bold text-sky-400">최적 (◎)</td>
                      <td className="py-3.5 px-4 text-center font-bold text-rose-400">최적 (◎)</td>
                      <td className="py-3.5 px-4 text-xs text-slate-400">고주파 엣지 왜곡 없는 마스터 학습 자료</td>
                    </tr>
                    <tr className="hover:bg-slate-800/50">
                      <td className="py-3.5 px-4 font-bold text-white">번호판 마스킹/알파 오버레이</td>
                      <td className="py-3.5 px-4 text-center text-rose-500">불가 (✕)</td>
                      <td className="py-3.5 px-4 text-center font-bold text-purple-400">우수 (○)</td>
                      <td className="py-3.5 px-4 text-center font-bold text-sky-400">최적 (◎)</td>
                      <td className="py-3.5 px-4 text-center text-rose-500">불가 (✕)</td>
                      <td className="py-3.5 px-4 text-xs text-slate-400">8-bit/16-bit Alpha 투명 채널 필수</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* VIEW 3: Comparison Matrix Table */}
        {activeTab === 'comparison' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-slate-700/80 pb-4">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  이미지 포맷 4종 전방위 공학 스펙 비교 매트릭스
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  압축 알고리즘, 인코딩 속도, 색상 심도, 투명도 지원, 아티팩트 왜곡 특성을 한눈에 비교합니다.
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-700">
                <table className="w-full text-left text-xs sm:text-sm text-slate-200">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-xs border-b border-slate-700">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">비교 항목</th>
                      <th className="py-3.5 px-4 font-semibold text-emerald-400">JPEG</th>
                      <th className="py-3.5 px-4 font-semibold text-purple-400">WebP</th>
                      <th className="py-3.5 px-4 font-semibold text-sky-400">PNG</th>
                      <th className="py-3.5 px-4 font-semibold text-rose-400">RAW (Bayer)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-sans">
                    <tr className="hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-bold text-white font-mono">압축 유형</td>
                      <td className="py-3 px-4 text-emerald-300">손실 (Lossy)</td>
                      <td className="py-3 px-4 text-purple-300">손실 / 무손실 하이브리드</td>
                      <td className="py-3 px-4 text-sky-300">무손실 (Lossless)</td>
                      <td className="py-3 px-4 text-rose-300">비압축 (Uncompressed)</td>
                    </tr>
                    <tr className="hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-bold text-white font-mono">핵심 알고리즘</td>
                      <td className="py-3 px-4">8x8 DCT + 양자화 + 허프만</td>
                      <td className="py-3 px-4">VP8 예측 코딩 + 산술 부호화</td>
                      <td className="py-3 px-4">Paeth 필터 + Deflate (LZ77)</td>
                      <td className="py-3 px-4">ADC 전압 센서 덤프</td>
                    </tr>
                    <tr className="hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-bold text-white font-mono">색차 서브샘플링</td>
                      <td className="py-3 px-4">4:2:0 / 4:2:2</td>
                      <td className="py-3 px-4">4:2:0 (손실) / 4:4:4 (무손실)</td>
                      <td className="py-3 px-4">RGB 4:4:4 (손실 없음)</td>
                      <td className="py-3 px-4 font-mono">Bayer RGGB CFA</td>
                    </tr>
                    <tr className="hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-bold text-white font-mono">색상 심도 (Bit Depth)</td>
                      <td className="py-3 px-4">채널당 8-bit (24-bit TrueColor)</td>
                      <td className="py-3 px-4">채널당 8-bit</td>
                      <td className="py-3 px-4">8-bit / 16-bit (최대 48-bit)</td>
                      <td className="py-3 px-4 text-rose-300 font-bold">10-bit / 12-bit / 14-bit HDR</td>
                    </tr>
                    <tr className="hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-bold text-white font-mono">알파 채널(투명도)</td>
                      <td className="py-3 px-4 text-rose-400 font-bold">미지원 (✕)</td>
                      <td className="py-3 px-4 text-emerald-400 font-bold">지원 (8-bit Alpha)</td>
                      <td className="py-3 px-4 text-emerald-400 font-bold">지원 (8/16-bit Alpha)</td>
                      <td className="py-3 px-4 text-rose-400 font-bold">미지원 (✕)</td>
                    </tr>
                    <tr className="hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-bold text-white font-mono">FHD 1장당 용량</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-300">약 420 KB (기준 100%)</td>
                      <td className="py-3 px-4 font-mono font-bold text-purple-300">약 295 KB (-30%)</td>
                      <td className="py-3 px-4 font-mono font-bold text-sky-300">약 3,180 KB (+650%)</td>
                      <td className="py-3 px-4 font-mono font-bold text-rose-300">약 6,075 KB (+1340%)</td>
                    </tr>
                    <tr className="hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-bold text-white font-mono">1,000장 디스크 점유</td>
                      <td className="py-3 px-4 font-mono text-emerald-300">약 420 MB</td>
                      <td className="py-3 px-4 font-mono text-purple-300">약 295 MB</td>
                      <td className="py-3 px-4 font-mono text-sky-300">약 3.18 GB</td>
                      <td className="py-3 px-4 font-mono text-rose-300">약 6.07 GB</td>
                    </tr>
                    <tr className="hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-bold text-white font-mono">하드웨어 ASIC 가속</td>
                      <td className="py-3 px-4 text-emerald-300 font-bold">100% 전 기종 완벽 지원</td>
                      <td className="py-3 px-4 text-purple-300">최신 GPU/SoC 지원</td>
                      <td className="py-3 px-4 text-slate-400">주로 소프트웨어 CPU 연산</td>
                      <td className="py-3 px-4 text-sky-300">DMA 직결 (무연산)</td>
                    </tr>
                    <tr className="hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-bold text-white font-mono">인코딩 지연 시간</td>
                      <td className="py-3 px-4 font-mono text-emerald-300">&lt; 1.0 ms (초고속)</td>
                      <td className="py-3 px-4 font-mono text-purple-300">약 2.5 ~ 5.0 ms</td>
                      <td className="py-3 px-4 font-mono text-amber-300">약 15 ~ 30 ms</td>
                      <td className="py-3 px-4 font-mono text-sky-300">&lt; 0.1 ms (DMA 전송)</td>
                    </tr>
                    <tr className="hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-bold text-white font-mono">특유 압축 왜곡</td>
                      <td className="py-3 px-4 text-slate-300">8x8 블록 노이즈, 링잉</td>
                      <td className="py-3 px-4 text-slate-300">과도 압축 시 유화 스무딩</td>
                      <td className="py-3 px-4 text-emerald-400 font-bold">왜곡 전무 (100% 무결)</td>
                      <td className="py-3 px-4 text-emerald-400 font-bold">왜곡 전무 (센서 원본)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: Interactive Simulator (화질 vs 용량 트레이드오프) */}
        {activeTab === 'simulator' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Control Bar */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 space-y-6 shadow-xl">
              <div className="border-b border-slate-700/80 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">화질 vs 전송 대역폭/스토리지 트레이드오프 시뮬레이터</h3>
                  <p className="text-xs text-slate-400 mt-0.5">해상도, 저장 수량, 네트워크 회선 속도 변경 시 포맷별 소요 용량 및 전송 시간 실시간 연산</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                {/* 1. Resolution */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>입력 카메라 해상도</span>
                    <span className="font-mono text-amber-400">{simResolution.toUpperCase()}</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'fhd', label: 'FHD (2M)' },
                      { id: '5m', label: '5M (IMX264)' },
                      { id: '4k', label: '4K (8M)' }
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => setSimResolution(btn.id as any)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all ${
                          simResolution === btn.id
                            ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md'
                            : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Photo Batch Count */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>저장 사진 수량 (배치)</span>
                    <span className="font-mono text-emerald-400 font-bold">{simBatchCount.toLocaleString()} 장</span>
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="10000"
                    step="100"
                    value={simBatchCount}
                    onChange={(e) => setSimBatchCount(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>100장</span>
                    <span>1,000장</span>
                    <span>5,000장</span>
                    <span>10,000장</span>
                  </div>
                </div>

                {/* 3. Network Bandwidth */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>현장 통신 회선 속도</span>
                    <span className="font-mono text-sky-400 font-bold">{simNetworkSpeedMbps} Mbps</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { speed: 20, label: '20M (LTE)' },
                      { speed: 100, label: '100M (5G)' },
                      { speed: 1000, label: '1G (LAN)' }
                    ].map((btn) => (
                      <button
                        key={btn.speed}
                        onClick={() => setSimNetworkSpeedMbps(btn.speed)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all ${
                          simNetworkSpeedMbps === btn.speed
                            ? 'bg-sky-500 text-slate-950 font-bold border-sky-400 shadow-md'
                            : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Calculated Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {simCalculations.map((item) => (
                <div
                  key={item.id}
                  className={`p-6 rounded-3xl bg-slate-800/90 border-2 ${item.borderColor} space-y-4 shadow-xl flex flex-col justify-between`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-xl font-black ${item.color}`}>{item.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                        {item.ratioVsJpeg.toFixed(0)}% vs JPEG
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">{item.category}</div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-slate-700/80">
                    <div>
                      <div className="text-[11px] text-slate-400 font-mono">1장당 평균 용량</div>
                      <div className="text-lg font-black text-white font-mono mt-0.5">
                        {item.singleFileMb >= 1
                          ? `${item.singleFileMb.toFixed(2)} MB`
                          : `${Math.round(item.singleFileKb)} KB`}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] text-slate-400 font-mono">{simBatchCount.toLocaleString()}장 디스크 점유</div>
                      <div className={`text-2xl font-black font-mono mt-0.5 ${item.color}`}>
                        {item.batchGb >= 1
                          ? `${item.batchGb.toFixed(2)} GB`
                          : `${Math.round(item.batchMb)} MB`}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] text-slate-400 font-mono">{simNetworkSpeedMbps}Mbps 전송 예상 시간</div>
                      <div className="text-sm font-bold text-slate-200 font-mono mt-0.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>
                          {item.transferSec < 60
                            ? `${item.transferSec.toFixed(1)} 초`
                            : `${(item.transferSec / 60).toFixed(1)} 분 (${Math.round(item.transferSec)}초)`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-700/60 leading-relaxed">
                    <strong>추천 환경:</strong> {item.id === 'jpeg' ? '실시간 도로 단속 전송' : item.id === 'webp' ? '웹 대시보드 및 CDN 절감' : item.id === 'png' ? 'AI 레이블링/마스크' : '법정 증거/센서 연구'}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* VIEW 5: Format Decision Tree Wizard */}
        {activeTab === 'wizard' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-slate-700/80 pb-4">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-lg">
                  <Sparkles className="w-5 h-5" />
                  <span>내 시스템에 가장 적합한 이미지 포맷 추천 마법사</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  프로젝트의 핵심 비즈니스 요구사항을 선택하면 가장 이상적인 이미지 포맷과 권장 인코딩 세팅값을 제시합니다.
                </p>
              </div>

              {/* Priority Selector Pills */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">프로젝트 최우선 순위 선택:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { id: 'bandwidth', label: '1. LTE 대역폭 & 실시간 단속 전송', desc: '초고속 단속 및 모바일 무선망 트래픽 최소화' },
                    { id: 'web', label: '2. 웹/클라우드 대시보드 로딩 속도', desc: 'CDN 비용 절감 및 모바일 관제 브라우징' },
                    { id: 'legal', label: '3. 법정 단속 증거력 & 변조 방지', desc: '형사소송법 원본성 입증 및 센서 물리 데이터 보존' },
                    { id: 'ai_train', label: '4. AI 딥러닝 골든 모델 훈련', desc: '고주파 엣지 무손실 보존 및 픽셀 마스크' }
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => setWizardPriority(btn.id as any)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        wizardPriority === btn.id
                          ? 'bg-amber-500/10 border-amber-500 text-white ring-2 ring-amber-500/30'
                          : 'bg-slate-900/80 border-slate-700/80 text-slate-400 hover:text-white hover:border-slate-600'
                      }`}
                    >
                      <div className="font-bold text-sm text-amber-300">{btn.label}</div>
                      <div className="text-xs text-slate-400 mt-1 leading-snug">{btn.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Wizard Recommendation Result Box */}
              <div className="p-6 rounded-2xl bg-slate-900 border-2 border-amber-500/50 space-y-6 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                      ENGINEERING RECOMMENDATION
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                      {wizardRecommendation.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 font-mono">최적 추천 포맷</div>
                      <div className={`text-2xl font-black ${wizardRecommendation.recommendedFormat.color}`}>
                        {wizardRecommendation.recommendedFormat.name}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <CheckCircle2Icon className="w-4 h-4 text-emerald-400" />
                      <span>포맷 채택 핵심 이유 (Why Chosen)</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                      {wizardRecommendation.reason}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-amber-400" />
                      <span>현장 권장 인코딩 파라미터 (Optimal Settings)</span>
                    </h4>
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 font-mono text-xs text-amber-300 space-y-1 leading-relaxed">
                      {wizardRecommendation.optimalSettings}
                    </div>
                    <div className="text-xs text-slate-400 pt-1">
                      <strong>차선 대체 포맷:</strong> {wizardRecommendation.alternative.name} ({wizardRecommendation.alternative.category})
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
};

// CheckCircle helper
function CheckCircle2Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
