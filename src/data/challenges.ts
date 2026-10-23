export interface ChallengeItem {
  id: string;
  category: 'environment' | 'hardware' | 'plate_condition' | 'imbalance';
  categoryLabel: string;
  title: string;
  description: string;
  errorRateWithoutAug: string; // e.g. "-38%"
  severity: 'high' | 'critical' | 'medium';
  typicalFailure: string;
  datasetSolution: string;
  recommendedAugmentation: string;
}

export const CHALLENGES_DATA: ChallengeItem[] = [
  {
    id: 'ch-1',
    category: 'environment',
    categoryLabel: '환경 및 기상',
    title: '야간 초저조도 & 가로등 암부',
    description: '조도 1 lux 미만의 심야 도로나 지하주차장 진입로에서 센서 게인이 급증하며 노이즈가 폭증하고 글자 윤곽이 뭉개짐',
    errorRateWithoutAug: '정확도 -42.5%',
    severity: 'critical',
    typicalFailure: '이진화(Binarization) 실패로 숫자 0, 8, 3 오인식 및 번호판 테두리 미검출',
    datasetSolution: '야간 실사 데이터셋 능동 샘플링 + RandomBrightnessContrast 하향 변환 + 3D 야간 조명 렌더링',
    recommendedAugmentation: 'A.RandomBrightnessContrast(brightness_limit=(-0.6, -0.3)), A.ISONoise',
  },
  {
    id: 'ch-2',
    category: 'hardware',
    categoryLabel: '카메라 및 광학계',
    title: '고속 이동에 의한 모션 블러 (Motion Blur)',
    description: '시속 80~140km/h로 주행하는 차량 셔터 스피드 부족으로 글자 획이 수평 방향으로 번짐',
    errorRateWithoutAug: '정확도 -37.8%',
    severity: 'critical',
    typicalFailure: '한글 모음/받침 소실로 "가"->"하", "1"->"7" 판독 실패',
    datasetSolution: '가상 모션 블러 커널(Directional PSF) 대량 합성 및 Deblur 전처리 필터 훈련',
    recommendedAugmentation: 'A.MotionBlur(blur_limit=(7, 15), p=0.85), A.Defocus',
  },
  {
    id: 'ch-3',
    category: 'hardware',
    categoryLabel: '카메라 및 광학계',
    title: '측면 및 고각도 원근 왜곡 (Extreme Angles)',
    description: '도로변 방범용 CCTV 또는 이동식 단속 차량이 비스듬한 각도(45°~75°)에서 촬영할 때 종횡비 왜곡',
    errorRateWithoutAug: '정확도 -29.2%',
    severity: 'high',
    typicalFailure: '문자 간격 중첩으로 글자 분할(Segmentation) 실패 및 누락',
    datasetSolution: 'Spatial Transformer Network (STN) 학습용 다각도 투영 변환(Perspective Transform) 데이터셋 주입',
    recommendedAugmentation: 'A.Perspective(scale=(0.08, 0.22)), A.Rotate(limit=25)',
  },
  {
    id: 'ch-4',
    category: 'environment',
    categoryLabel: '환경 및 기상',
    title: '태양광 직사 역광 및 헤드라이트 플레어',
    description: '일출/일몰 직사광선 또는 대향 차량의 고광도 LED 헤드라이트로 번호판 영역이 하얗게 포화(Saturation)',
    errorRateWithoutAug: '정확도 -31.4%',
    severity: 'high',
    typicalFailure: '포화된 영역의 문자 픽셀값 255 고정으로 특징점 완전 소실',
    datasetSolution: '고동적범위(HDR) 합성 노출 데이터 및 인공 렌즈 플레어 레이어 중첩 학습',
    recommendedAugmentation: 'A.RandomSunFlare, A.ColorJitter(contrast=1.5, brightness=0.4)',
  },
  {
    id: 'ch-5',
    category: 'plate_condition',
    categoryLabel: '번호판 상태',
    title: '진흙, 눈, 흙탕물 오염 및 부분 폐색 (Occlusion)',
    description: '화물차나 우천 후 주행 차량의 번호판 표면에 흙먼지가 튀어 글자의 30% 이상이 물리적으로 가려짐',
    errorRateWithoutAug: '정확도 -48.0%',
    severity: 'critical',
    typicalFailure: '가려진 획으로 인해 엉뚱한 한글 문자나 숫자로 변조 인식',
    datasetSolution: 'CutOut, CoarseDropout, 알파 채널 진흙 파티클 텍스처를 활용한 부분 가림 합성 증강',
    recommendedAugmentation: 'A.CoarseDropout(max_holes=5, max_height=20), A.MaskDropout',
  },
  {
    id: 'ch-6',
    category: 'plate_condition',
    categoryLabel: '번호판 상태',
    title: '신규 8자리 필름식 번호판 빛반사 & 훼손',
    description: '2019년 이후 도입된 태극문양 재귀반사식 필름 번호판의 코팅 벗겨짐 및 야간 IR 조명 반사 이상',
    errorRateWithoutAug: '정확도 -26.5%',
    severity: 'medium',
    typicalFailure: '좌측 파란색 홀로그램 영역을 영문 문자나 기호로 오인식',
    datasetSolution: '한국형 8자리 전용 템플릿 세분화 및 IR 적외선 카메라 파장 대역 가상 시뮬레이션 데이터셋 구축',
    recommendedAugmentation: '도메인 적응 어댑터(Domain Adaptation Adapter) + 한국형 필름 전용 데이터 5만 장',
  },
  {
    id: 'ch-7',
    category: 'imbalance',
    categoryLabel: '데이터셋 불균형',
    title: '특수 용도기호 및 영업용 번호판 데이터 극희소',
    description: '렌터카("하/허/호"), 영업용 노란색 번호판, 친환경 전기차 파란색, 외교/임시 번호판의 수집 빈도가 전체의 2% 미만',
    errorRateWithoutAug: '정확도 -35.0%',
    severity: 'high',
    typicalFailure: '일반 자가용 흰색 번호판 위주로 과적합되어 노란색/청색 번호판 배경 분리 실패',
    datasetSolution: '3D 생성 엔진(Blender)을 이용한 희귀 한글 음절 및 특수 색상 번호판 절차적(Procedural) 대량 합성',
    recommendedAugmentation: '합성 데이터 파이프라인에서 클래스 불균형 균등 샘플링(Balanced Class Sampling)',
  },
  {
    id: 'ch-8',
    category: 'environment',
    categoryLabel: '환경 및 기상',
    title: '폭우 및 짙은 안개로 인한 대기 산란 (Atmospheric Scattering)',
    description: '빗방울 굴절 및 안개 입자로 인한 전반적 대비(Contrast) 급감과 물방울 맺힘 왜곡',
    errorRateWithoutAug: '정확도 -33.1%',
    severity: 'medium',
    typicalFailure: '문자 에지 콘트라스트 약화로 경계선 추출 불발',
    datasetSolution: 'Dark Channel Prior 물리 기반 안개 합성 모델 및 빗방울 궤적 알파 블렌딩',
    recommendedAugmentation: 'A.RandomRain, A.RandomFog, A.CLAHE(clip_limit=3.0)',
  }
];
