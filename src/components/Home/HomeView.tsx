import React from 'react';
import { Hero } from '../Hero';
import { 
  ScanLine, 
  Cpu, 
  CircuitBoard, 
  BookOpen, 
  GraduationCap, 
  Brain,
  Lightbulb, 
  Sliders, 
  FolderArchive, 
  Bookmark, 
  Zap, 
  Layers, 
  Database, 
  GitBranch, 
  Calculator,
  Coins,
  CheckSquare,
  Camera,
  Maximize,
  SlidersHorizontal,
  Radio,
  Gauge,
  HardDrive,
  Images,
  FileType,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (tabId: string) => void;
}

interface ModuleCard {
  id: string;
  title: string;
  subTitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'vision' | 'research' | 'simulation' | 'benchmark';
  color: string;
  badge: string;
  stats?: string;
}

const MODULE_CARDS: ModuleCard[] = [
  {
    id: 'detector',
    title: '번호판 인식 프로그램',
    subTitle: 'dataslayermedia ALPR Engine',
    description: '실시간 웹캠 스트리밍 및 동영상/이미지 파일에서 번호판을 검출하고 즉시 OCR 인식하는 실시간 파이프라인.',
    icon: ScanLine,
    category: 'vision',
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-400',
    badge: '실시간 검출',
    stats: '초당 30+ FPS'
  },
  {
    id: 'lpr-lab',
    title: 'LPR Deep Learning Lab',
    subTitle: 'Super-Resolution & De-glare',
    description: '반사 번호판의 빛번짐(Halation) 제거 및 다중 프레임 초해상도(SR) 복원 딥러닝 연구 실험실.',
    icon: Cpu,
    category: 'research',
    color: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/40 text-indigo-400',
    badge: '딥러닝 랩',
    stats: 'PSNR 32.4dB'
  },
  {
    id: 'hardware',
    title: '하드웨어 구성품 아키텍처',
    subTitle: 'Edge Hardware Specification',
    description: 'AR0234 글로벌 셔터 카메라, 24GHz 레이더, JECS-7360B 산업용 PC, LED 제어보드 상세 기술 사양 및 인터페이스.',
    icon: CircuitBoard,
    category: 'vision',
    color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/40 text-cyan-400',
    badge: '하드웨어 스펙',
    stats: '4대 핵심 장비'
  },
  {
    id: 'lpr-research',
    title: 'LPR 연구(Research) 대시보드',
    subTitle: 'Considerations & Optical Simulator',
    description: '빛번짐, 한글 형태학적 오인식, 엣지 지연 주의사항, 최적 픽셀 밀도(130~300px), 4단계 연구 절차 및 광학 시뮬레이터.',
    icon: BookOpen,
    category: 'research',
    color: 'from-violet-500/20 to-purple-500/10 border-violet-500/40 text-violet-400',
    badge: '연구 가이드',
    stats: '5대 연구 지침'
  },
  {
    id: 'training',
    title: '번호판 AI 모델 학습 가이드',
    subTitle: 'AI-Hub 200만장 & 2-Stage Training',
    description: '국내외 6대 번호판 이미지 다운로드 허브(AI-Hub, Roboflow 등), 2-Stage(YOLO+CRNN) 훈련 절차 및 파이썬 코드.',
    icon: GraduationCap,
    category: 'research',
    color: 'from-emerald-500/20 to-green-500/10 border-emerald-500/40 text-emerald-300',
    badge: '데이터셋 허브',
    stats: '200만+ 장 공공 데이터'
  },
  {
    id: 'models',
    title: 'AI 모델 및 엣지 추론 엔진',
    subTitle: 'OpenCV DNN vs ONNX Runtime & 99.8% 달성 기법',
    description: 'PyTorch 없는 OpenCV DNN C++/Python 무의존성 배포, 초경량 ONNX(YOLOv8n, LPRNet 1.9MB) 양자화, 형태학적 오인식 방지 및 장단점 심층 분석.',
    icon: Brain,
    category: 'research',
    color: 'from-indigo-500/20 to-cyan-500/10 border-indigo-500/40 text-indigo-400',
    badge: 'ONNX/DNN',
    stats: '1.9MB 초경량 모델'
  },
  {
    id: 'lighting',
    title: '조명 및 광학 기술 분석',
    subTitle: 'Illumination & Exposure Control',
    description: '주간/야간/역광 조명 조건별 인식률 비교, 가시광선 vs 850nm IR LED 특성, P-Iris 조리개 및 스트로브 동기화 분석.',
    icon: Lightbulb,
    category: 'vision',
    color: 'from-amber-500/20 to-orange-500/10 border-amber-500/40 text-amber-400',
    badge: '광학 분석',
    stats: 'IR 850nm 동기화'
  },
  {
    id: 'camera',
    title: '카메라 광학 & 센서 분석 플랫폼',
    subTitle: 'MiriCam Opto-Sensor Lab',
    description: '글로벌 셔터 vs 롤링 셔터 왜곡 제어, 쿼드 픽셀 AF, 적층형 BSI, DCG 및 30+개 광학 센서 전문 용어 심층 분석.',
    icon: Camera,
    category: 'vision',
    color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/40 text-blue-400',
    badge: '광학·센서 분석',
    stats: '30+ 전문 용어 & 차트'
  },
  {
    id: 'camera-6',
    title: '글로벌 셔터 카메라 6종 비교 분석',
    subTitle: 'MiriCam 6-Camera Global Shutter Suite',
    description: '24GHz 레이더 동기화 글로벌 셔터 카메라 6종(Basler, FLIR, e-con, 라즈베리파이 등), 모션 블러 계산기, NDAA 규제 감사 및 추천 엔진.',
    icon: SlidersHorizontal,
    category: 'vision',
    color: 'from-amber-500/20 to-orange-500/10 border-amber-500/40 text-amber-400',
    badge: '글로벌셔터 6종',
    stats: '6종 스펙 & NDAA 감사'
  },
  {
    id: 'see3cam-24cug',
    title: 'See3CAM_24CUG 심층 분석 랩',
    subTitle: 'e-con Systems AR0234CS USB 3.1 Global Shutter Lab',
    description: 'onsemi AR0234CS 2.3MP 글로벌 셔터, 120 FPS, 온보드 ISP, 24GHz 레이더 펄스 동기화 인터페이스, 실시간 번호판 가상 뷰어 및 V4L2 명령 생성기.',
    icon: Radio,
    category: 'vision',
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-300',
    badge: 'AR0234 플래그십',
    stats: '120 FPS & 하드웨어 ISP'
  },
  {
    id: 'pixel',
    title: '카메라 해상도 및 픽셀 규격 가이드',
    subTitle: 'Resolution & Pixel Standard Guide',
    description: 'HD, FHD(2M)부터 5M, 4K(8M)까지 해상도 비율 시각화, 차로별 번호판 유효 픽셀 폭(PPM) 및 머신비전 규격 상세 분석.',
    icon: Maximize,
    category: 'vision',
    color: 'from-indigo-500/20 to-blue-500/10 border-indigo-500/40 text-indigo-400',
    badge: '픽셀·해상도',
    stats: '12종 해상도 & PPM 계산기'
  },
  {
    id: 'bandwidth',
    title: '카메라 대역폭 & USB 규격 가이드',
    subTitle: 'Video Bandwidth & USB Interface Lab',
    description: '비압축 24비트 RGB, YUV422 색차 압축, H.264/MJPEG 포맷별 요구 대역폭 실시간 연산 및 USB 3.0/3.1/3.2 80% 실효 전송 규격 검증.',
    icon: Gauge,
    category: 'vision',
    color: 'from-sky-500/20 to-blue-500/10 border-sky-500/40 text-sky-400',
    badge: '대역폭·USB',
    stats: '80% 실효 룰 & 계산기'
  },
  {
    id: 'storage',
    title: '카메라 스토리지 용량 계산기',
    subTitle: 'NVR Capacity & Retention Estimator',
    description: '해상도(HD~4K), 코덱(H.265, H.264, MJPEG, RAW), FPS, 채널 수 및 보관 일수에 따른 스토리지 소요량(TB) 산출 및 감시용 HDD/RAID 추천.',
    icon: HardDrive,
    category: 'vision',
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-400',
    badge: '스토리지 계산',
    stats: '보관일수 & RAID 견적'
  },
  {
    id: 'photo',
    title: '사진 스토리지 계산기',
    subTitle: 'Resolution Photo & 1,000-Image Directory Capacity',
    description: '해상도별(HD~12M) 대표 차량 사진 1장씩 수록 및 1,000장 디렉토리 저장 시 실소요 용량(MB/GB)과 4KB 클러스터 슬랙(Slack) 오버헤드 산출.',
    icon: Images,
    category: 'vision',
    color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/40 text-purple-400',
    badge: '1000장 디렉토리',
    stats: '6대 해상도 사진 & 슬랙 분석'
  },
  {
    id: 'format',
    title: '이미지 사진 포맷별 특징 및 적용 가이드',
    subTitle: 'JPEG · WebP · PNG · RAW Technical & Application Lab',
    description: 'JPEG(손실 DCT/표준), WebP(차세대 고효율), PNG(무손실 투명도), RAW(센서 원본 24비트)의 핵심 기술 특성과 ITS/ALPR 실무 6대 현장 응용 가이드.',
    icon: FileType,
    category: 'vision',
    color: 'from-amber-500/20 to-orange-500/10 border-amber-500/40 text-amber-400',
    badge: '포맷 비교/응용',
    stats: '4대 포맷 & 실무 적용 매트릭스'
  },
  {
    id: 'simulator',
    title: '증강 시뮬레이터 (Simulator)',
    subTitle: 'Interactive Augmentation Engine',
    description: '모션 블러, 저조도, 흙먼지 폐색, 우천, 안개, 사각 원근 왜곡 등 11개 환경 파라미터를 실시간 조절하고 인식률을 즉시 검증.',
    icon: Sliders,
    category: 'simulation',
    color: 'from-sky-500/20 to-cyan-500/10 border-sky-500/40 text-sky-400',
    badge: '인터랙티브',
    stats: '11종 실시간 증강'
  },
  {
    id: 'batch',
    title: '배치 일괄 처리기 (Batch)',
    subTitle: 'Multi-Image Batch Augmentation',
    description: '현재 설정된 증강 파라미터를 사용자가 업로드한 여러 장의 이미지에 동시에 적용하고 일괄 미리보기 및 ZIP 다운로드.',
    icon: FolderArchive,
    category: 'simulation',
    color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/40 text-blue-400',
    badge: '대량 증강',
    stats: 'ZIP 일괄 내보내기'
  },
  {
    id: 'validator',
    title: '합성 데이터 무결성 검증기',
    subTitle: 'YOLO & Pascal VOC Sanity Validator',
    description: '생성된 합성 이미지 및 어노테이션 파일의 정규화(0-1), 프레임 경계 초과, 최소 해상도 픽셀 밀도, 종횡비 자동 검증 및 원클릭 복구.',
    icon: CheckSquare,
    category: 'simulation',
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-400',
    badge: '어노테이션 검증',
    stats: '6대 무결성 체크'
  },
  {
    id: 'presets',
    title: '표준 환경 프리셋 라이브러리',
    subTitle: 'Standard Environmental Presets',
    description: '야간 폭우, 터널 진출입 역광, 고속도로 모션 블러, 황사 흙먼지 오염 등 실제 도로 환경 8종 원클릭 로드.',
    icon: Bookmark,
    category: 'simulation',
    color: 'from-teal-500/20 to-emerald-500/10 border-teal-500/40 text-teal-400',
    badge: '원클릭 프리셋',
    stats: '8개 표준 시나리오'
  },
  {
    id: 'testbench',
    title: '인식 테스트 & 벤치마크 랩',
    subTitle: 'ALPR Character Accuracy Lab',
    description: "증강된 영상에 대해 문자 단위 신뢰도, 형태학적 오인식('고'↔'보', '바'↔'하') 원인 분석 및 개선 권장사항 제시.",
    icon: Zap,
    category: 'benchmark',
    color: 'from-yellow-500/20 to-amber-500/10 border-yellow-500/40 text-yellow-400',
    badge: '정확도 벤치마크',
    stats: '글자별 Confidence'
  },
  {
    id: 'solutions',
    title: '4대 핵심 해결 전략',
    subTitle: 'Synthetic Data & Active Learning',
    description: '합성 데이터(Synthetic), 능동 학습(Active Learning), 도메인 적응(Domain Adaptation), 멀티모달 센서 융합 전략.',
    icon: Layers,
    category: 'benchmark',
    color: 'from-pink-500/20 to-rose-500/10 border-pink-500/40 text-pink-400',
    badge: '솔루션 가이드',
    stats: '비용 82% 절감'
  },
  {
    id: 'challenges',
    title: 'ALPR 챌린지 매트릭스',
    subTitle: 'Real-world Road Obstacle Analysis',
    description: '기상 악화, 심야 조도, 왜곡 각도, 센서 노이즈 등 실제 도로 현장에서 발생하는 6대 실패 요인 심층 분석.',
    icon: Database,
    category: 'benchmark',
    color: 'from-red-500/20 to-orange-500/10 border-red-500/40 text-red-400',
    badge: '환경 매트릭스',
    stats: '인식 실패 요인 6종'
  },
  {
    id: 'pipeline',
    title: 'End-to-End MLOps 파이프라인',
    subTitle: 'Continuous Learning Architecture',
    description: '엣지 데이터 수집부터 능동 라벨링, 자동 증강, 모델 재학습, CI/CD 배포까지의 6단계 지속 학습 파이프라인.',
    icon: GitBranch,
    category: 'benchmark',
    color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/40 text-purple-400',
    badge: 'MLOps 흐름',
    stats: '6단계 지속 파이프라인'
  },
  {
    id: 'roi',
    title: '데이터셋 ROI & 비용 계산기',
    subTitle: 'Dataset Cost Feasibility Calculator',
    description: '수작업 라벨링 비용 대비 데이터 증강 및 합성 기법 도입 시 절감되는 개발 비용 및 인식률 향상 시뮬레이션.',
    icon: Calculator,
    category: 'benchmark',
    color: 'from-emerald-500/20 to-cyan-500/10 border-emerald-500/40 text-emerald-400',
    badge: '경제성 분석',
    stats: '투자 대비 효과 산출'
  },
  {
    id: 'cost-estimator',
    title: '데이터셋 비용 추정기',
    subTitle: 'Cloud Storage & GPU Compute Estimator',
    description: '로컬/클라우드 환경에서 대량 데이터셋 생성 시 발생하는 S3/GCS 스토리지 보관비, 송신비, GPU 연산비를 실시간 산출하고 TCO를 비교.',
    icon: Coins,
    category: 'benchmark',
    color: 'from-amber-500/20 to-emerald-500/10 border-amber-500/40 text-amber-300',
    badge: 'GPU/스토리지 비용',
    stats: '클라우드 vs 로컬 TCO'
  }
];

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Hero Section */}
      <Hero
        onScrollToDetector={() => onNavigate('detector')}
        onScrollToLprLab={() => onNavigate('lpr-lab')}
        onScrollToHardware={() => onNavigate('hardware')}
        onScrollToLprResearch={() => onNavigate('lpr-research')}
        onScrollToTraining={() => onNavigate('training')}
        onScrollToModels={() => onNavigate('models')}
        onScrollToLighting={() => onNavigate('lighting')}
        onScrollToCamera={() => onNavigate('camera')}
        onScrollToCameraSix={() => onNavigate('camera-6')}
        onScrollToSee3Cam={() => onNavigate('see3cam-24cug')}
        onScrollToPixel={() => onNavigate('pixel')}
        onScrollToBandwidth={() => onNavigate('bandwidth')}
        onScrollToStorage={() => onNavigate('storage')}
        onScrollToPhoto={() => onNavigate('photo')}
        onScrollToSimulator={() => onNavigate('simulator')}
        onScrollToBatch={() => onNavigate('batch')}
        onScrollToPresets={() => onNavigate('presets')}
        onScrollToTestBench={() => onNavigate('testbench')}
        onScrollToSolutions={() => onNavigate('solutions')}
      />

      {/* Module Hub Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-xs font-semibold text-sky-600 dark:text-sky-400 mb-3 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ALPR Complete Suite Directory</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            ALPR 24대 핵심 모듈 전체 둘러보기
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            원하시는 메뉴 탭을 선택하시면 스크롤 없이 해당 페이지로 독립 전환되어 상세 연구 자료 및 인터랙티브 툴을 사용하실 수 있습니다.
          </p>
        </div>

        {/* Grid of 24 Modules: 1 col mobile, 2 cols tablet (sm), 4 cols desktop (lg) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {MODULE_CARDS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`group relative bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 transition-all duration-200 cursor-pointer shadow-xs dark:shadow-xl hover:shadow-md dark:hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-between`}
              >
                <div>
                  {/* Top Bar inside card */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                      {item.badge}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    {item.title}
                  </h3>
                  <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-2">
                    {item.subTitle}
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  {item.stats ? (
                    <span className="text-slate-500 dark:text-slate-400 font-mono font-medium">
                      {item.stats}
                    </span>
                  ) : <span />}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate(item.id);
                    }}
                    className="inline-flex items-center gap-1.5 font-bold text-sky-600 dark:text-sky-400 group-hover:text-sky-500 dark:group-hover:text-sky-300 transition-colors"
                  >
                    <span>페이지 열기</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
