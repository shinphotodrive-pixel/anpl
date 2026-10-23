export interface PipelineStep {
  id: number;
  phase: string;
  title: string;
  subtitle: string;
  badge: string;
  iconName: string;
  inputs: string[];
  outputs: string[];
  keyTools: string[];
  latencyOrSpeed: string;
  description: string;
  bestPractices: string[];
  pitfalls: string[];
}

export const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: 1,
    phase: '수집 단계',
    title: '지능형 영상 수집 & 프레임 트리거',
    subtitle: '도로 CCTV / 톨게이트 센서 스트림',
    badge: 'Ingestion',
    iconName: 'Camera',
    inputs: ['RTSP/ONVIF 고화질 비디오 스트림 (1080p~4K, 30fps)', '지자기/루프 센서 통과 트리거 신호'],
    outputs: ['차량 통과 시점 원본 프레임 (Keyframes)', '메타데이터 (타임스탬프, 카메라 ID, GPS 위치)'],
    keyTools: ['GStreamer', 'FFmpeg', 'ZeroMQ / Kafka', 'OpenCV VideoCapture'],
    latencyOrSpeed: '실시간 스트리밍 (지연 < 15ms)',
    description: '무의미한 빈 도로 영상을 버리고, 차량이 카메라 시야(FoV)에 진입한 순간을 모션 벡터 및 하드웨어 루프 센서로 감지하여 핵심 키프레임만 캡처합니다.',
    bestPractices: [
      '일조량 변화에 맞춘 카메라 자동 셔터 스피드(1/500s 이상 유지) 제어',
      '네트워크 대역폭 절약을 위한 H.265 하드웨어 가속 디코딩 적용'
    ],
    pitfalls: [
      '고속 주행 차량의 경우 1초에 30프레임 중 최적 앵글 프레임이 2~3장에 불과하므로 트리거 타이밍 오차 주의'
    ]
  },
  {
    id: 2,
    phase: '거버넌스',
    title: '실시간 비식별화 & 개인정보 보호',
    subtitle: '개인정보보호법 및 ISO 27001 컴플라이언스',
    badge: 'De-identification',
    iconName: 'Shield',
    inputs: ['캡처된 원본 차량 키프레임'],
    outputs: ['안면/보행자 비가역 블러 처리된 학습용 이미지', '암호화된 메타데이터'],
    keyTools: ['YOLOv8-Face', 'InsightFace', 'OpenCV Gaussian Blur', 'HashiCorp Vault'],
    latencyOrSpeed: '프레임당 8~12ms 처리',
    description: '차량 앞유리창 너머 운전자/동승자의 얼굴, 보행자, 타깃 외 배경에 찍힌 타 차량 번호판을 실시간으로 감지하여 가우시안 블러/모자이크 처리합니다.',
    bestPractices: [
      '학습 데이터셋 저장소에는 원본 얼굴 이미지가 절대 영구 저장되지 않도록 인메모리 파이프라인 구성',
      '비식별화 과정에서 타깃 번호판의 글자 획이 침범당하지 않도록 IoU 여유 마진 튜닝'
    ],
    pitfalls: [
      '안면 검출기가 오작동하여 번호판을 사람 얼굴로 오인하고 블러 처리하는 치명적 참사 방지 필터 필요'
    ]
  },
  {
    id: 3,
    phase: '품질 관리',
    title: '능동적 선별 (Active Learning) & 선별 큐',
    subtitle: '소프트맥스 엔트로피 & 확신도 평가',
    badge: 'Active Sampling',
    iconName: 'Filter',
    inputs: ['비식별화된 대량의 미라벨 이미지 (수백만 건)'],
    outputs: ['인간 검수자(Human-in-the-loop) 전송용 고난도 샘플 (전체의 3%)', '자동 통과된 양품 데이터'],
    keyTools: ['FiftyOne', 'ModAL', 'PyTorch Entropy Evaluator', 'Label Studio'],
    latencyOrSpeed: '초당 300+ 프레임 배치 선별',
    description: '사전 훈련된 경량 ALPR 모델을 통과시켜, 모델의 판독 확신도(Softmax Confidence)가 70% 이하이거나 1·2순위 문자 확률 격차가 매우 적은 헷갈리는 데이터만 정밀 선별합니다.',
    bestPractices: [
      '단순히 오인식 데이터만 뽑지 않고 임베딩 거리(Cosine distance)를 계산하여 중복 차량 제거',
      '라벨러에게 이전 예측값과 의심 영역을 하이라이트하여 검수 속도 3배 향상'
    ],
    pitfalls: [
      '불확실성만 고려할 경우 센서 불량으로 완전히 깨진 쓰레기 데이터(Noise)가 큐에 범람할 수 있어 사전 에지 필터 필수'
    ]
  },
  {
    id: 4,
    phase: '데이터 증강',
    title: '데이터 증강 & 3D 합성데이터 융합',
    subtitle: 'Sim-to-Real 도메인 확장 및 증폭',
    badge: 'Data Expansion',
    iconName: 'Sparkles',
    inputs: ['선별 정제된 실사 데이터', '3D Blender 가상 렌더링 번호판'],
    outputs: ['10배~50배로 확장된 강건한 다변화 학습 세트 (YOLO/OCR 포맷)'],
    keyTools: ['Albumentations', 'Blender Python API', 'Unity Perception', 'Imgaug'],
    latencyOrSpeed: 'GPU 가속 오프라인 배치 증강',
    description: '실사 데이터에 모션 블러, 저조도, 노이즈, 3D 원근 회전, 오염 마스크를 무작위 중첩하고, 실제 도로에선 극희소한 번호판(전기차, 영업용, 8자리 필름)을 3D 합성 데이터로 대량 혼합합니다.',
    bestPractices: [
      '실사 데이터 70% + 합성 데이터 30% 황금 비율로 훈련하여 Sim-to-Real 도메인 괴리 방지',
      'CutOut/CoarseDropout으로 글자 일부가 가려져도 전후 맥락으로 복원할 수 있도록 유도'
    ],
    pitfalls: [
      '너무 극단적인 회전(90도 이상)이나 왜곡은 실세계 물리 법칙을 위배하여 모델 수렴을 방해함'
    ]
  },
  {
    id: 5,
    phase: '모델 훈련',
    title: '2-Stage ALPR 모델 학습 & 도메인 적응',
    subtitle: 'YOLOv11 Detector + CRNN/SVTR OCR',
    badge: 'Deep Learning',
    iconName: 'Cpu',
    inputs: ['증강 완료된 정답 데이터셋 (Train / Val / Test 분할)'],
    outputs: ['최적화된 ONNX / TensorRT 가중치 파일', '성능 벤치마크 리포트 (mAP, Word Accuracy)'],
    keyTools: ['PyTorch', 'Ultralytics YOLO', 'PaddleOCR / MMOCR', 'TensorRT'],
    latencyOrSpeed: '멀티 GPU 분산 학습 (4~8시간)',
    description: '1단계(번호판 영역 탐지: YOLO)와 2단계(문자열 판독: CRNN/SVTR)를 분리하여 학습하거나 End-to-End 아키텍처를 학습합니다. 도메인 적응(DANN) 기법으로 주간 모델을 야간 환경에 맞춥니다.',
    bestPractices: [
      '한글 자모 분리 방식보다 완성형 75개 빈출 음절 + 10개 숫자 조합 사전 구축이 정확도에 유리',
      'FP16 / INT8 양자화(Quantization)를 거쳐도 인식 손실이 0.5% 미만이 되도록 보정(Calibration)'
    ],
    pitfalls: [
      '한국형 8자리 번호판의 앞 3자리 숫자 간격과 구형 7자리 간격 차이로 인한 정렬 오류 방지'
    ]
  },
  {
    id: 6,
    phase: '배포 & 운영',
    title: '엣지 임베디드 배포 & 지속적 피드백 루프',
    subtitle: 'NVIDIA Jetson / x86 IPC 현장 적용',
    badge: 'Edge MLOps',
    iconName: 'Server',
    inputs: ['양자화 완료된 경량 딥러닝 엔진 (.engine / .onnx)'],
    outputs: ['실시간 번호판 인식 결과 (< 30ms)', '오탐 의심 프레임 원격 클라우드 전송'],
    keyTools: ['NVIDIA DeepStream', 'Triton Inference Server', 'Docker / K3s', 'Prometheus & Grafana'],
    latencyOrSpeed: '엔드투엔드 파이프라인 지연 < 25ms',
    description: '고속도로 톨게이트나 주차 차단기 PC(NVIDIA Jetson Orin 또는 인텔 IPC)에 모델을 배포하고, 현장에서 인식률이 떨어지는 신규 에지 케이스 발생 시 자동으로 3단계 능동학습 큐로 재피드백합니다.',
    bestPractices: [
      '엣지 장비 온도 70도 이상 시 스로틀링 대비 경량 Fallback 모델 탑재',
      'A/B 테스트 및 카나리(Canary) 배포로 현장 오작동 위험 최소화'
    ],
    pitfalls: [
      '클라우드 의존적인 아키텍처는 통신 장애 시 톨게이트 마비를 유발하므로 100% 온디바이스 독립 구동 필수'
    ]
  }
];
