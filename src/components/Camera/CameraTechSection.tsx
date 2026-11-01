import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { 
  Camera, 
  Search, 
  Sliders, 
  Cpu, 
  Film, 
  Eye, 
  Sparkles, 
  BookOpen, 
  Layers, 
  Activity, 
  Gauge, 
  ShieldCheck, 
  Zap, 
  Info, 
  X, 
  Check, 
  RefreshCw, 
  SlidersHorizontal,
  Compass,
  BarChart3,
  Minimize2,
  Maximize2
} from 'lucide-react';

interface TermItem {
  id: string;
  nameKo: string;
  nameEn: string;
  category: 'exposure' | 'sensor' | 'af' | 'cinema' | 'lens' | 'computational';
  categoryLabel: string;
  badge: string;
  summary: string;
  description: string;
  formula?: string;
  formulaDesc?: string;
  advantages: string[];
  disadvantages: string[];
  practicalTip: string;
}

const TERMINOLOGY_DATA: TermItem[] = [
  {
    id: 'global-shutter',
    nameKo: '글로벌 셔터 (Global Shutter)',
    nameEn: 'Global Shutter CMOS Sensor',
    category: 'sensor',
    categoryLabel: '센서 공학',
    badge: '왜곡 제로',
    summary: '모든 화소의 전하 축적과 판독을 동시에 수행하여 고속 이동 피사체의 젤로 현상 및 플래시 밴딩을 100% 제거하는 차세대 셔터 방식.',
    description: '기존 롤링 셔터가 센서 라인을 위에서 아래로 순차 스캔하면서 발생하는 기하학적 왜곡(Jello effect)을 원천 차단합니다. 각 픽셀마다 아날로그 메모리 노드와 샘플/홀드 회로가 통합되어 있어, 전 픽셀이 동시에 노광을 시작하고 마칩니다. ALPR 및 고속 주행 차량 인식, 드론 매핑, 골프 스윙 분석에 필수적인 기술입니다.',
    formula: 'Δt_{skew} = 0 \\quad (\\text{전 픽셀 동시 노광})',
    formulaDesc: '노광 시차 델타 t가 0으로 고속 주행 차량의 번호판 왜곡(Skew)이 완전히 0이 됨',
    advantages: ['초고속 이동체의 젤로(Jello) 왜곡 완전 소멸', '기계식 셔터 마모 및 수명 한계 없음', '플래시 동조 속도 무제한 (1/80,000s 가능)', '실시간 차량 번호판 인식 정확도 극대화'],
    disadvantages: ['픽셀 내 저장 커패시터 공간 차지로 픽셀당 FWC(포화전자용량) 감소', '암전류(Dark Current) 및 읽기 노이즈 소폭 증가 가능성', '제조 단가 및 회로 집적 난이도 대폭 상승'],
    practicalTip: '시속 100km/h 이상 고속 주행 차량 ALPR 구축 시 롤링 셔터의 왜곡 보정 알고리즘보다 글로벌 셔터 하드웨어 센서 도입이 인식률을 15% 이상 직접 개선합니다.'
  },
  {
    id: 'rolling-shutter',
    nameKo: '롤링 셔터 (Rolling Shutter)',
    nameEn: 'Rolling Shutter CMOS',
    category: 'sensor',
    categoryLabel: '센서 공학',
    badge: '고화소·고감도',
    summary: '센서의 픽셀 라인을 상단에서 하단으로 라인 바이 라인(Line-by-line) 순차 주사하여 전하를 읽어내는 보편적 CMOS 방식.',
    description: '구조가 단순하여 픽셀 수광 면적을 최대화할 수 있고 저노이즈 및 고해상도 구현에 유리합니다. 단, 센서 스캔 시간(Readout Time, 보통 5ms~25ms) 동안 피사체가 움직이거나 카메라가 패닝하면 기울어짐 왜곡(Skewing)이나 블레이드 휨 현상이 발생합니다.',
    formula: 'T_{scan} = N_{lines} \\times \\tau_{row}',
    formulaDesc: '전체 판독 시간은 총 라인 수와 행 판독 시간의 곱으로 결정됨',
    advantages: ['픽셀 단위 추가 메모리가 없어 높은 FWC 및 우수한 저조도 SNR', '제조 공정 성숙 및 가격 경쟁력 우수', '초고해상도(60MP~100MP) 구현 용이'],
    disadvantages: ['고속 패닝 및 빠른 피사체 촬영 시 젤로/기울어짐 왜곡 발생', 'LED 플리커 및 인공 조명 밴딩 현상에 취약', '초고속 번호판 인식 시 문자 기울어짐 보정 필요'],
    practicalTip: '센서 판독 속도(Readout Speed)가 1/120s(약 8.3ms) 이하로 빠른 적층형 롤링 셔터를 선택하면 왜곡을 인간의 눈과 OCR 알고리즘이 무시할 수준으로 억제할 수 있습니다.'
  },
  {
    id: 'stacked-bsi',
    nameKo: '적층형 BSI 센서 (Stacked Back-Illuminated)',
    nameEn: 'Stacked Back-Illuminated CMOS Sensor',
    category: 'sensor',
    categoryLabel: '센서 공학',
    badge: '초고속 판독',
    summary: '수광 화소층(Pixel Layer)과 고속 로직 처리층(Logic Circuit)을 수직으로 2층 이상 적층하고 Cu-Cu 하이브리드 본딩으로 직결한 센서.',
    description: '전통적인 전면조사형(FSI)은 배선이 빛을 가렸으나, BSI(이면조사)는 기판 뒤쪽에서 빛을 받아 양자 효율(QE)을 극대화합니다. 적층형은 여기에 더해 고속 DRAM 버퍼와 병렬 ADC 로직을 화소 바로 아래에 적층하여 테라비트급 대역폭으로 신호를 초고속 전송합니다.',
    advantages: ['포토다이오드 개구율(Fill Factor) 거의 100%에 근접', '센서 스캔 타임 3ms~5ms 수준으로 극적 단축', '온센서 AI 프로세싱 및 블랙아웃 프리 고속 연사 지원'],
    disadvantages: ['고난이도 수직 관통 전극(TSV) 및 Cu-Cu 접합으로 인한 고비용', '발열 관리를 위한 세심한 히트싱크 설계 필수'],
    practicalTip: '야간 저조도 및 고속 연사가 모두 요구되는 지능형 교통 카메라의 표준 센서 아키텍처로 자리잡고 있습니다.'
  },
  {
    id: 'dti',
    nameKo: 'DTI (Deep Trench Isolation, 심층 트렌치 격벽)',
    nameEn: 'Deep Trench Isolation Technology',
    category: 'sensor',
    categoryLabel: '센서 공학',
    badge: '크로스토크 억제',
    summary: '인접 픽셀 사이에 미세한 물리적 절연 격벽 트렌치를 파서 광학적·전기적 신호 간섭(Crosstalk)을 차단하는 기술.',
    description: '고화소화로 픽셀 피치가 1.0㎛~2.0㎛ 수준으로 미세화되면 입사광이 비스듬히 들어와 옆 픽셀로 새거나 전하가 확산되어 색 번짐과 노이즈가 급증합니다. DTI는 실리콘 기판 깊숙이 절연 산화물 트렌치를 형성하여 광자를 온전히 본인 픽셀에 가두어 SNR과 색 순도를 향상시킵니다.',
    advantages: ['색 분리도(Color Crosstalk) 대폭 개선 및 높은 콘트라스트 달성', '마이크로 픽셀에서도 높은 SNR 유지', '광각 렌즈 주변부 빛 입사각 한계 극복'],
    disadvantages: ['트렌치 계면 결함으로 인한 암전류(Dark Current) 발생 위험', '공정 단계 추가로 인한 웨이퍼 단가 상승'],
    practicalTip: '야간에 고출력 적외선(IR) 조명을 사용할 때 인접 적색/적외선 파장 번짐을 막아 번호판 숫자 엣지를 선명하게 유지해 줍니다.'
  },
  {
    id: 'dcg',
    nameKo: '듀얼 컨버전 게인 (DCG / Dual Base ISO)',
    nameEn: 'Dual Conversion Gain / Dual Native ISO',
    category: 'cinema',
    categoryLabel: '영상/DR',
    badge: '광폭 DR',
    summary: '포토다이오드 뒤의 플로팅 디퓨전(FD) 커패시턴스를 2단으로 가변하여 저감도(고용량)와 고감도(저잡음)를 물리적으로 최적화하는 기술.',
    description: '밝은 환경(LCG: Low Conversion Gain)에서는 큰 커패시턴스를 연결하여 최대 전하(FWC)를 담아 하이라이트 날림을 방지하고, 어두운 환경(HCG: High Conversion Gain)에서는 작은 커패시턴스로 전환하여 전하당 전압 변환율을 극대화함으로써 판독 노이즈(Read Noise)를 극적으로 낮춥니다.',
    formula: 'V_{FD} = \\frac{Q}{C_{FD}} \\quad (C_{FD} \\text{ 가변})',
    formulaDesc: '플로팅 디퓨전 커패시턴스 C_FD를 스위칭하여 전하(Q)당 출력 전압을 전환',
    advantages: ['고감도 영역(예: ISO 3200) 진입 시 노이즈가 급감하는 역전 현상 구현', '밝은 낮과 어두운 밤 모두에서 14스탑 이상의 일관된 DR 확보', '소프트웨어 디지털 증폭 대비 우수한 SNR'],
    disadvantages: ['LCG/HCG 전환 경계 감도 지점에서 노이즈 곡선 불연속성 존재'],
    practicalTip: '야간 카메라 세팅 시 기본 감도(Base ISO) 바로 전 단계(예: ISO 2500)보다 HCG가 작동하는 두 번째 베이스 ISO(예: ISO 3200)로 설정하는 것이 노이즈가 훨씬 적습니다.'
  },
  {
    id: 'dr-boost',
    nameKo: 'DR Boost (다이내믹 레인지 부스트)',
    nameEn: 'Real-time Dual Readout DR Boost',
    category: 'cinema',
    categoryLabel: '영상/DR',
    badge: '15+ Stops',
    summary: '단일 노광 순간에 LCG(하이라이트 우선)와 HCG(섀도우 노이즈 억제) 두 개의 신호를 동시에 읽어 실시간 합성하는 온센서 HDR 기술.',
    description: '과거 HDR처럼 시간차를 두고 다중 노출(Multi-exposure)을 하는 것이 아니라, 단 한 번의 노광으로 생성된 동일 전하를 듀얼 아날로그 경로로 동시 판독 및 16-bit A/D 변환하여 실시간 픽셀 합성합니다. 움직이는 피사체에도 모션 고스팅(Ghosting) 아티팩트가 전혀 발생하지 않습니다.',
    advantages: ['고속 주행 차량에서도 모션 잔상(Ghosting) 없는 완벽한 하이다이내믹레인지', '하이라이트 계조와 암부 암소 노이즈 동시 해결', '최대 15스탑 이상의 시네마급 계조 표현력'],
    disadvantages: ['센서 발열 증가 및 전력 소비량 상승', '초고속 프레임레이트(예: 4K 120p)에서는 밴드위스 한계로 비활성화 가능성'],
    practicalTip: '터널 출입구, 헤드라이트 직사광, 역광 등 극한의 명암비 환경에서 번호판 흰색 반사판과 차체 음영을 모두 살리는 핵심 기술입니다.'
  },
  {
    id: 'shot-noise',
    nameKo: '광자 샷 노이즈 (Photon Shot Noise)',
    nameEn: 'Photon Shot Noise',
    category: 'exposure',
    categoryLabel: '광학/노출',
    badge: '양자 물리 한계',
    summary: '빛 자체가 입자(광자, Photon)로 불연속적으로 도달하기 때문에 발생하는 빛의 본질적 통계적 요동 노이즈.',
    description: '빛의 도착 확률은 포아송 분포(Poisson Distribution)를 따릅니다. 신호량(수광된 광자 수)이 $S$개일 때 샷 노이즈의 표준편차는 정확히 $\\sqrt{S}$가 됩니다. 이는 어떤 센서 제조사도 우회할 수 없는 순수 물리 법칙이며, 입사광이 적은 저조도일수록 전체 신호 대비 노이즈의 비율이 커집니다.',
    formula: '\\sigma_{shot} = \\sqrt{S}, \\quad \\text{SNR}_{shot} = \\frac{S}{\\sqrt{S}} = \\sqrt{S}',
    formulaDesc: '신호량이 4배 증가하면 SNR은 2배(\\sqrt{4}) 증가하여 노이즈가 절반으로 줄어듦',
    advantages: ['수학적으로 완벽히 예측 가능하여 센서 캘리브레이션의 기준 모델이 됨'],
    disadvantages: ['센서 기술로 제거 불가능하며, 오직 수광량(조리개 개방, 센서 대형화, 노출 시간)을 늘려야만 극복 가능'],
    practicalTip: '저조도 노이즈를 근본적으로 줄이는 유일한 해법은 광학계의 구경(Aperture)을 키우거나 고출력 조명으로 포톤 개속(Flux)을 증대시키는 것입니다.'
  },
  {
    id: 'read-noise',
    nameKo: '판독 노이즈 (Read Noise / Floor Noise)',
    nameEn: 'Sensor Read Noise',
    category: 'exposure',
    categoryLabel: '광학/노출',
    badge: '회로 잡음',
    summary: '포토다이오드에 저장된 전하를 전압으로 변환하고 디지털 값으로 양자화(ADC)하는 과정에서 칩 내부 회로가 추가하는 모든 전기적 잡음.',
    description: '리셋 노이즈(kTC 노이즈), 소스 팔로워 열잡음 및 플리커(1/f) 잡음, ADC 양자화 오차 등이 포함됩니다. 현대 최신 BSI 적층형 센서는 CDS(상관 이중 샘플링)와 열잡음 억제 기술을 통해 읽기 노이즈를 1.0 $e^-$ (전자 1개) 미만으로 낮추고 있습니다.',
    formula: '\\text{SNR}_{total} = \\frac{S}{\\sqrt{S + \\sigma_{read}^2 + \\sigma_{dark}^2}}',
    formulaDesc: '총 노이즈는 샷 노이즈와 판독 노이즈, 암전류 노이즈의 제곱합의 제곱근',
    advantages: ['최신 센서 설계 기술(CDS, 온칩 ADC)을 통해 지속적으로 개선 가능'],
    disadvantages: ['암부(Deep Shadow) 디테일을 뭉개고 암전류 패턴을 형성함'],
    practicalTip: 'ISO Invariant(불변성) 센서에서는 판독 노이즈가 매우 낮으므로 노출 부족으로 찍힌 RAW 파일을 후보정에서 밝혀도 화질 손실이 거의 없습니다.'
  },
  {
    id: 'iso-invariance',
    nameKo: 'ISO 불변성 (ISO Invariance)',
    nameEn: 'ISO Invariance Sensor Performance',
    category: 'exposure',
    categoryLabel: '광학/노출',
    badge: '디지털 게인',
    summary: '하드웨어 아날로그 증폭(카메라 ISO 올리기)과 소프트웨어 디지털 노출 올리기(RAW 현상에서 +EV 푸시)의 노이즈 결과가 완전히 동일한 센서 특성.',
    description: '센서 자체의 아날로그 읽기 노이즈(Read Noise)가 극도로 작을 때 나타납니다. 촬영 현장에서 하이라이트가 날아가는 것을 방지하기 위해 낮은 ISO(예: ISO 100~400)로 언더 노출 촬영한 후, 후처리에서 섀도우를 +4EV~+5EV 올려도 높은 ISO로 직접 찍은 것과 동일한 노이즈 레벨을 보여주며 오히려 하이라이트 계조는 온전히 보존됩니다.',
    advantages: ['하이라이트 클리핑 방지 및 최대 다이내믹 레인지 보존 극대화', '가변 노출 환경에서 ISO 셔터 다이얼 조작 부담 감소'],
    disadvantages: ['EVF/LCD 화면이 어둡게 보여 촬영 시 구도 확인이 어려울 수 있음 (디스플레이 게인 보정 필요)'],
    practicalTip: '야간 번호판 촬영 시 반사판 과노출 날림을 막기 위해 ISO를 낮춰 어둡게 찍은 후 신경망(AI) 모델 단에서 디지털 게인을 올리는 파이프라인 구성이 가능합니다.'
  },
  {
    id: 'dual-pixel-af',
    nameKo: '듀얼 픽셀 CMOS AF (Dual Pixel AF)',
    nameEn: 'Dual Pixel CMOS Phase Detection AF',
    category: 'af',
    categoryLabel: 'AF 기술',
    badge: '100% 위상차',
    summary: '센서의 모든 단일 마이크로 렌즈 아래에 좌/우 2개의 포토다이오드를 배치하여 전 화소에서 위상차 검출과 이미지 결상을 동시 수행하는 AF.',
    description: '별도의 전용 위상차 센서나 차폐 화소(Masked Pixel) 없이, 센서 유효 화소의 100%가 위상차 검출 센서로 동작합니다. 좌측 다이오드 신호(A)와 우측 다이오드 신호(B)의 시차를 비교하여 렌즈가 어느 방향으로 얼마나 초점이 빗나갔는지 즉시 계산하므로 워블링(Wobbling) 없이 한 번에 정확히 포커싱합니다.',
    advantages: ['화면 전체(수평 100% / 수직 100%) 어디서든 초점 검출 가능', '영상 녹화 시 부드럽고 끊김 없는 시네마틱 포커스 추적', '화소 결함 보간(Interpolation)에 의한 화질 손실 없음'],
    disadvantages: ['좌우 수평 방향의 콘트라스트 엣지만 감지하며, 수평선 패턴(수직 방향 위상차) 감지 불가', '판독 데이터량 2배 증가로 센서 발열 및 프로세서 연산량 증가'],
    practicalTip: '차량의 세로형 엣지(라디에이터 그릴, 번호판 좌우 테두리) 추적에 탁월하며 포커스 헌팅이 없습니다.'
  },
  {
    id: 'quad-pixel-af',
    nameKo: '쿼드 픽셀 크로스 AF (Cross Quad Pixel AF)',
    nameEn: 'Quad Pixel Cross Phase Detection AF',
    category: 'af',
    categoryLabel: 'AF 기술',
    badge: '전방위 크로스',
    summary: '단일 마이크로 렌즈 아래 4개(좌상, 우상, 좌하, 우하)의 포토다이오드를 2x2 격자로 배치하여 수평과 수직 모든 방향의 위상차를 검출하는 궁극의 AF.',
    description: '듀얼 픽셀 AF의 유일한 약점이었던 단일 축 검출 한계를 극복했습니다. (좌측 2개 vs 우측 2개) 비교로 수직선을 감지하고, (상단 2개 vs 하단 2개) 비교로 수평선을 감지하며, 대각선 방향 위상차까지 감지합니다. 피사체의 질감 방향과 관계없이 -6EV 이하의 극암부에서도 초고속 초점 락온이 가능합니다.',
    advantages: ['완벽한 크로스(Cross-type) 위상차 검출로 피사체 패턴 편향성 0%', '극저조도(-7EV 수준) 및 저콘트라스트 피사체 검출력 최고 수준', '피사체 모션 벡터를 픽셀 단위로 추출 가능'],
    disadvantages: ['초미세 공정 요구 및 센서 데이터 인터페이스 대역폭 극대화 필요', '단위 픽셀 면적 분할에 따른 포토다이오드 크기 축소'],
    practicalTip: '야간 빗길, 밋밋한 아스팔트, 수평 번호판 등 모든 조건에서 오작동 없는 전천후 초점 추적을 제공합니다.'
  },
  {
    id: 'mtf',
    nameKo: 'MTF 곡선 (Modulation Transfer Function)',
    nameEn: 'Modulation Transfer Function',
    category: 'lens',
    categoryLabel: '렌즈 광학',
    badge: '해상력 표준',
    summary: '렌즈가 피사체의 명암비(Contrast)와 미세 디테일(Resolution)을 이미지 센서에 얼마나 충실히 전달하는지를 공간주파수별로 수치화한 광학 지표.',
    description: '공간 주파수(Spatial Frequency, 보통 10 line pairs/mm 및 30 lp/mm)에서 원본 대비 전달된 콘트라스트의 비율(0~100%)을 센서 중심(0mm)부터 대각 코너(약 21.6mm)까지 곡선으로 나타냅니다. 방사선 방향(Sagittal: 실선)과 동심원 방향(Meridional: 점선)이 서로 일치하고 상단(80% 이상)에 위치할수록 주변부 수차와 왜곡이 없는 명품 렌즈입니다.',
    formula: '\\text{MTF}(f) = \\frac{C_{image}(f)}{C_{object}(f)} = \\frac{(I_{max}-I_{min})/(I_{max}+I_{min})}{(O_{max}-O_{min})/(O_{max}+O_{min})}',
    formulaDesc: '공간주파수 f에서의 콘트라스트 전달 비율(0%~100%)',
    advantages: ['감성적 표현이 아닌 엄밀한 물리학적 수치로 렌즈 해상력 비교 가능', '조리개값별 최적 샤프니스 구간(Sweet Spot) 식별'],
    disadvantages: ['플레어, 색수차 등의 종합 화질을 단일 수치로 모두 대변하지는 못함'],
    practicalTip: '번호판 문자의 얇은 획과 홀로그램 방범 패턴 인식을 위해서는 30 lp/mm 기준 MTF가 주변부에서도 최소 50% 이상 유지되는 산업용 머신비전 렌즈를 채택해야 합니다.'
  },
  {
    id: 'airy-disk',
    nameKo: '에어리 디스크 & 회절 한계 (Airy Disk & Diffraction)',
    nameEn: 'Airy Disk & Diffraction Limit',
    category: 'lens',
    categoryLabel: '렌즈 광학',
    badge: '광학 한계',
    summary: '점광원의 빛이 렌즈의 원형 조리개 구경을 통과할 때 빛의 파동성으로 인해 회절되어 형성되는 중심 원형 디스크와 동심원 고리 패턴.',
    description: '아무리 완벽하게 연마된 무수차 렌즈라도 빛의 파장 때문에 한 점으로 모이지 못하고 에어리 디스크 크기 이하로는 초점을 좁힐 수 없습니다. 조리개를 조일수록(F값이 커질수록) 에어리 디스크 지름이 커지며, 이 크기가 센서의 픽셀 피치보다 커지면 회절 블러(Diffraction Blur)가 발생하여 사진의 선명도가 급격히 떨어집니다.',
    formula: 'd_{airy} = 2.44 \\times \\lambda \\times N',
    formulaDesc: '\\lambda: 빛의 파장(녹색광 ~550nm), N: 조리개 F값. F16에서 d_{airy} \\approx 21.5\\mu m',
    advantages: ['광학계가 도달할 수 있는 물리적 최고 분해능 한계선(레일리 한계) 정의'],
    disadvantages: ['피사계 심도를 확보하기 위해 F값을 과도하게 조이면 전체 해상도가 뭉개짐'],
    practicalTip: '2.5㎛ 픽셀 피치 센서의 경우 F5.6 이상으로 조이면 에어리 디스크 지름(약 7.5㎛)이 픽셀 크기를 초과하여 회절이 시작되므로 F4.0~F5.6 구간이 해상력 스위트스팟입니다.'
  },
  {
    id: 'dof',
    nameKo: '피사계 심도 (Depth of Field, DOF)',
    nameEn: 'Depth of Field',
    category: 'exposure',
    categoryLabel: '광학/노출',
    badge: '초점 대역',
    summary: '초점을 맞춘 피사체 전후로 사람 눈이나 센서의 허용 착란원(CoC) 내에서 선명하다고 인정되는 공간적 깊이의 범위.',
    description: '조리개를 조일수록(F-number 증가), 초점 거리가 짧을수록(광각), 피사체와의 거리가 멀어질수록 심도가 깊어집니다(Pan Focus). 반대로 대구경 조리개(F1.2~F1.8)에 망원 렌즈를 쓰면 얕은 심도(Out of focus / Bokeh)가 형성됩니다.',
    formula: '\\text{Hyperfocal} \\; H = \\frac{f^2}{N \\cdot c}',
    formulaDesc: '과초점 거리 H에 초점을 맞추면 H/2 지점부터 무한대까지 전 구역이 팬포커스 심도에 들어옴',
    advantages: ['원하는 피사체만 분리 강조하거나 전 차선 차량을 팬포커스로 모두 선명하게 기록 가능'],
    disadvantages: ['심도를 너무 얕게 세팅하면 앞뒤로 이동하는 차량의 번호판 초점이 쉽게 빗나감'],
    practicalTip: '단속 카메라 렌즈는 초점 거리와 과초점 거리(Hyperfocal Distance)를 계산하여 1차선부터 3차선까지 차량 번호판이 항상 심도 대역 안에 머물도록 F4~F8로 설계합니다.'
  },
  {
    id: 'sync-is',
    nameKo: 'Sync IS (5축 바디 IBIS + 렌즈 OIS 협조 제어)',
    nameEn: 'Synchronized Image Stabilization',
    category: 'computational',
    categoryLabel: '컴퓨테이셔널',
    badge: '최대 8.5스탑',
    summary: '바디 내 센서 시프트 5축 흔들림 보정(IBIS)과 렌즈 내 자이로 보정 유닛(OIS)이 고속 버스로 통신하며 역할을 정밀 분담하는 하이브리드 손떨림 보정.',
    description: '망원 영역에서는 렌즈의 각도 흔들림(Pitch/Yaw)이 치명적이고, 광각 및 접사에서는 바디의 시프트(X/Y 평행 이동)와 롤(Roll 회전) 흔들림이 큽니다. Sync IS는 자이로 센서 데이터를 초당 수만 회 교환하여 Pitch/Yaw는 렌즈와 센서가 함께 제어하고, Roll과 X/Y 축은 센서가 담당하여 최대 8.5스탑의 보정 효과를 달성합니다.',
    advantages: ['삼각대 없이도 1초~2초 핸드헬드 장노출 선명 촬영 가능', '고속 주행 차량의 진동이 심한 지주대 마운트 환경에서 진동 블러 95% 이상 감쇄'],
    disadvantages: ['렌즈와 바디가 동일 제조사 규격 전용 프로토콜을 지원해야만 최고 성능 발휘'],
    practicalTip: '도로변 가로등이나 지주대는 대형 덤프트럭 통과 시 심한 저주파 진동을 겪는데, 하드웨어 Sync IS와 1/1000s 셔터스피드의 조합으로 진동을 완벽 상쇄할 수 있습니다.'
  },
  {
    id: 'pixel-shift',
    nameKo: '픽셀 시프트 고해상도 (Pixel Shift Multi-Shot)',
    nameEn: 'Pixel Shift Multi-Shot Resolution',
    category: 'computational',
    categoryLabel: '컴퓨테이셔널',
    badge: '1억~4억 화소',
    summary: 'IBIS 보정 기구를 이용하여 센서를 0.5~1픽셀 단위로 정밀 이동시키며 연속 촬영한 뒤 합성하여 베이어 디모자이크 오차를 0으로 만드는 기술.',
    description: '베이어 컬러 필터 센서는 각 픽셀이 R, G, B 중 하나의 색만 기록하고 주변 픽셀을 보간(Demosaicing)하여 가짜 색(모아레)과 해상력 손실이 발생합니다. 픽셀 시프트는 센서를 1픽셀씩 상하좌우로 4회 이동시켜 모든 픽셀 위치에서 R, G, B 순수 컬러 신호를 100% 캡처하며, 0.5픽셀 단위로 16회 이동 시 센서 물리 화소의 4배(예: 40MP -> 160MP) 초고해상도 이미지를 생성합니다.',
    advantages: ['가짜 색(False Color)과 무아레(Moiré) 100% 소멸', '완벽한 RGB 풀컬러 샘플링으로 렌즈 광학 한계에 도달하는 극상의 선예도'],
    disadvantages: ['움직이는 피사체 촬영 시 격자 아티팩트 발생(정적 피사체 또는 모션 감지 알고리즘 필수)'],
    practicalTip: '주차장 정지 차량의 미세 위변조 번호판 식별 및 국토교통부 표준 규격 정밀 계측 벤치마크에 이상적입니다.'
  },
  {
    id: 'live-nd',
    nameKo: '라이브 ND (Live Computational ND)',
    nameEn: 'Computational Live ND Filter',
    category: 'computational',
    categoryLabel: '컴퓨테이셔널',
    badge: '물리 필터 불필요',
    summary: '광학 유리 ND 필터를 장착하지 않고도, 고속 다중 프레임 노출을 센서 판독 단계에서 시간 가중치로 연속 누적 합성하여 장노출 효과를 모사하는 기술.',
    description: '센서가 초당 수십~수백 프레임을 고속 판독한 후 픽셀 단위로 실시간 러닝 평균(Running Average) 또는 가중 적분을 수행합니다. ND2부터 ND64(최대 ND128/ND1000)까지 전자식 메뉴 조작으로 감광 농도를 즉각 바꿀 수 있어, 대낮에도 렌즈 구경에 맞는 고가의 광학 ND 필터 없이 셔터스피드를 1초 이상으로 늘릴 수 있습니다.',
    advantages: ['물리적 필터 교체 번거로움 및 필터에 의한 색틀어짐(Color Cast) 전무', '뷰파인더 화면은 밝은 상태로 유지되어 피사체 추적 용이'],
    disadvantages: ['센서 포화(Saturation)가 발생하는 초과 노광에서는 순수 하드웨어 ND 필터를 100% 대체하기 어려움'],
    practicalTip: '일사량이 극단적으로 강한 한낮에 조리개를 활짝 개방하여 얕은 심도를 확보하거나 모션 블러를 의도적으로 통제할 때 탁월합니다.'
  },
  {
    id: 'log-gamma',
    nameKo: 'Log 감마 (Logarithmic Tone Curve)',
    nameEn: 'Log Gamma Profiles (S-Log3, C-Log, V-Log)',
    category: 'cinema',
    categoryLabel: '영상/DR',
    badge: '14+ Stops 계조',
    summary: '인간의 시각이 빛의 강도를 로그 스케일로 인지하는 원리에 맞추어 센서의 넓은 다이내믹 레인지를 효율적으로 양자화 압축하는 전달 함수.',
    description: '표준 Rec.709 감마는 약 6~8스탑의 밝기 정보만 담아 밝은 하늘이 하얗게 날아가고 암부가 뭉개집니다. Log 감마는 하이라이트와 섀도우 데이터를 완만한 로그 곡선에 분배하여 14스탑 이상의 센서 원천 다이내믹 레인지를 10-bit/12-bit 공간에 고스란히 담아냅니다. 촬영 원본은 물빠진 듯 보이지만 컬러 그레이딩(LUT 적용)을 통해 완벽한 톤을 살려냅니다.',
    formula: 'y = c \\cdot \\ln(a \\cdot x + b)',
    formulaDesc: '선형 광 센서 입력 x를 로그 공간 y로 매핑하여 하이라이트 압축',
    advantages: ['역광 및 헤드라이트 빛번짐 속에서도 번호판 문자와 주변 디테일 동시 수납', '포스트 프로덕션 컬러 그레이딩 관용도 극대화'],
    disadvantages: ['미리보기 시 룩업테이블(Display LUT) 필수, 암부 노이즈 밴딩 방지를 위한 정밀 노출 측정 필요'],
    practicalTip: '야간 단속 영상 보존 시 Rec.709 클리핑을 피하기 위해 Log 또는 HLG 프로파일로 레코딩하면 후처리에서 노출을 자유롭게 복구할 수 있습니다.'
  },
  {
    id: 'all-i-vs-long-gop',
    nameKo: 'ALL-Intra vs Long GOP 코덱',
    nameEn: 'ALL-Intra vs Long GOP Compression',
    category: 'cinema',
    categoryLabel: '영상/DR',
    badge: '압축 알고리즘',
    summary: '모든 프레임을 독립된 단일 정지영상(I-Frame)으로 압축하는 ALL-I 방식과, 프레임 간 차이(P/B-Frame)만 참조 압축하는 Long GOP 방식의 대조.',
    description: 'Long GOP(H.264/H.265)는 15~30프레임마다 키프레임 하나를 두고 움직임 벡터만 저장하여 파일 용량을 획기적으로 줄이지만, 특정 프레임을 탐색할 때 연산 부하가 크고 고속 차량 프레임에서 블록 아티팩트가 생깁니다. ALL-Intra는 모든 프레임이 독립 I-프레임이므로 용량(비트레이트)은 크지만(예: 400~800Mbps), 스크러빙 딜레이가 0이며 프레임 단위 캡처 화질이 완벽합니다.',
    advantages: ['ALL-I: 고속 차량 프레임 추출 시 압축 왜곡 0, NLE 편집 및 실시간 OCR 파이프라인 지연 최소', 'Long GOP: 저장 공간 및 네트워크 전송 대역폭 70% 절감'],
    disadvantages: ['ALL-I: 대용량 고속 CFexpress/SD V90 메모리 카드 필수', 'Long GOP: 빠른 움직임에서 모션 매크로블록 노이즈 발생'],
    practicalTip: '실시간 번호판 AI 분석 서버로 영상을 보낼 때는 ALL-I 코덱 또는 초저지연 I-프레임 위주 스트림을 공급해야 픽셀 블러에 의한 오인식을 차단할 수 있습니다.'
  },
  {
    id: 'chroma-subsampling',
    nameKo: '크로마 서브샘플링 (4:4:4 vs 4:2:2 vs 4:2:0)',
    nameEn: 'Chroma Subsampling Formats',
    category: 'cinema',
    categoryLabel: '영상/DR',
    badge: '색차 신호 압축',
    summary: '사람 눈이 밝기(Luma, Y)에 비해 색상(Chroma, Cb/Cr)의 변화에 둔감한 생체 특성을 이용하여 색차 해상도를 줄여 압축하는 기술.',
    description: '4:4:4는 밝기와 색상을 화소별 1:1로 온전히 저장합니다. 4:2:2는 수평 방향으로 색상 정보를 절반만 샘플링하며(방송/시네마 표준), 4:2:0은 수평과 수직 모두 절반씩 줄여 색상 해상도가 원본의 1/4에 불과합니다. 번호판의 녹색, 주황색, 파란색(친환경 전기차) 바탕과 글자 경계선에서 4:2:0은 색 번짐(Chroma Bleed)이 발생할 수 있습니다.',
    advantages: ['4:2:0: 데이터 전송량 50% 절감으로 인터넷 스트리밍 최적화', '4:2:2 / 4:4:4: 정밀 크로마키 합성 및 에지 디텍션 오차 0'],
    disadvantages: ['4:2:0 사용 시 파란색 전기차 번호판이나 빨간색 긴급차량 문자의 미세 경계선 분해능 저하'],
    practicalTip: '색상 기반 차량 차종 판별 및 번호판 유형(일반/전기차/영업용) 자동 분류 정확도를 높이려면 최소 10-bit 4:2:2 컬러 샘플링 입력을 권장합니다.'
  },
  {
    id: 'neural-ai-denoise',
    nameKo: '신경망 AI 디노이즈 & 초해상도 (Neural AI Imaging)',
    nameEn: 'Deep Learning Denoising & Super-Resolution',
    category: 'computational',
    categoryLabel: '컴퓨테이셔널',
    badge: '차세대 ISP',
    summary: '전통적인 수식 필터(바이래터럴, 웨이블릿) 대신 수백만 장의 노이즈-클린 쌍으로 학습된 딥러닝 NPU가 센서 RAW 단에서 노이즈만 선택 제거하는 기술.',
    description: '기존 ISP의 노이즈 감쇄는 미세 디테일과 텍스처까지 문질러 수채화 현상을 유발했습니다. AI 디노이징 모델(CNN/Transformer 기반)은 샷 노이즈와 판독 노이즈의 통계적 패턴을 구별하여, 문자의 날카로운 에지와 질감은 보존하면서 무작위 잡음만 지워냅니다. 센서 감도를 ISO 25,600 이상으로 올려도 ISO 800 수준의 선명도를 복원합니다.',
    advantages: ['수채화 먹통 현상 없는 극상의 엣지 보존 노이즈 제거', '원거리 저해상도 번호판의 초해상도(SR) 2x~4x 복원'],
    disadvantages: ['고성능 NPU 또는 GPU 하드웨어 가속 연산 자원 요구', '과도한 생성(Hallucination) 시 문자 오인식 위험 존재'],
    practicalTip: '야간 저조도 영상에서 AI 디노이저를 전처리 필터로 적용하면 Tesseract 및 YOLO OCR 인식률이 35% 이상 비약적으로 향상됩니다.'
  },
  {
    id: 'apd-filter',
    nameKo: 'APD 필터 (Apodization Filter)',
    nameEn: 'Apodization Optical Filter',
    category: 'lens',
    categoryLabel: '렌즈 광학',
    badge: '보케 스무딩',
    summary: '렌즈 조리개 근처에 배치되어 중심부는 투명하고 주변부로 갈수록 어두워지는 방사형 점진 감광 광학 요소.',
    description: '일반 렌즈의 빛망울(보케)은 가장자리에 딱딱한 고리선(Ring artifact)이 생기기 쉽습니다. APD 필터는 입사동 주변부의 빛 투과율을 점진적으로 감쇄시켜 빛망울의 경계선을 극도로 부드럽고 몽환적으로 녹여냅니다. 단, 실제 투과 T-스탑이 F-스탑보다 다소 어두워집니다.',
    advantages: ['가장자리 링 없는 완벽하게 부드러운 배경 흐림(Bokeh) 실현', '구면수차와 2선 보케 억제'],
    disadvantages: ['실제 광량 투과율(T-stop)이 0.5~1.5스탑 어두워짐'],
    practicalTip: '복잡한 배경 질감을 가진 도로 환경에서 차량 피사체를 배경 노이즈와 완벽히 광학 분리할 때 사용됩니다.'
  },
  {
    id: 'vcm-motor',
    nameKo: 'VCM 모터 (Voice Coil Motor / 리니어 구동계)',
    nameEn: 'Voice Coil Linear Actuator AF Motor',
    category: 'lens',
    categoryLabel: '렌즈 광학',
    badge: '마이크론 제어',
    summary: '스피커의 보이스 코일 원리를 응용하여 영구 자석과 전류의 로렌츠 힘으로 포커스 렌즈군을 직접 비접촉 직진 구동하는 리니어 모터.',
    description: '기어 연결 방식(기어드 스테핑 모터)과 달리 감속 기어가 없어 백래시(Backlash)가 0이며, 마찰음이 전혀 없는 초음파 무소음 고속 구동을 제공합니다. 초당 수백 회의 정밀 위치 보정을 수행하여 수백 그램 무게의 대구경 렌즈군을 10밀리초 이내에 마이크론(㎛) 단위 정밀도로 제어합니다.',
    advantages: ['기어 마모 없는 반영구적 신뢰성 및 완전 무소음', '초당 120fps 이상의 초고속 위상차 AF 추적 신호에 실시간 감응'],
    disadvantages: ['전원이 차단되면 렌즈군이 자유 이동하여 덜컹거림 방지 락 메커니즘 필요'],
    practicalTip: '단속 지점을 순간 통과하는 고속 차량의 초점을 찰나에 잡기 위한 필수 렌즈 하드웨어 규격입니다.'
  }
];

export const CameraTechSection: React.FC = () => {
  // Sub-tabs: dashboard, exposure, sensor, cinema, lens, computational, dictionary
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'exposure' | 'sensor' | 'cinema' | 'lens' | 'computational' | 'dictionary'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTerm, setSelectedTerm] = useState<TermItem | null>(null);

  // Simulator State: ISO Invariance & Noise Calculator
  const [photons, setPhotons] = useState<number>(5000); // 100 ~ 50000
  const [iso, setIso] = useState<number>(800); // 100 ~ 25600
  const [digitalPushEv, setDigitalPushEv] = useState<number>(0); // 0 ~ 5
  const [sensorType, setSensorType] = useState<'traditional' | 'iso_invariant'>('iso_invariant');

  // Chart References
  const noiseChartRef = useRef<HTMLCanvasElement | null>(null);
  const noiseChartInstance = useRef<Chart | null>(null);

  const afRadarChartRef = useRef<HTMLCanvasElement | null>(null);
  const afRadarChartInstance = useRef<Chart | null>(null);

  const mtfChartRef = useRef<HTMLCanvasElement | null>(null);
  const mtfChartInstance = useRef<Chart | null>(null);

  const codecChartRef = useRef<HTMLCanvasElement | null>(null);
  const codecChartInstance = useRef<Chart | null>(null);

  // Calculations for ISO Invariance & Noise
  // Shot noise = sqrt(photons)
  const shotNoise = Math.sqrt(photons);
  // Base read noise in electrons (typical 1.5 e- for invariant, 4.0 e- for traditional)
  const baseReadNoise = sensorType === 'iso_invariant' ? 1.2 : 3.5;
  // If traditional, raising ISO via analog amp raises signal before downstream read noise, but pushes sensor floor
  const analogGain = iso / 100;
  const effectiveReadNoise = sensorType === 'iso_invariant' 
    ? baseReadNoise * Math.pow(2, digitalPushEv) 
    : (baseReadNoise / Math.sqrt(analogGain)) * Math.pow(2, digitalPushEv);
  const totalNoise = Math.sqrt(shotNoise * shotNoise + effectiveReadNoise * effectiveReadNoise);
  const signal = photons * Math.pow(2, digitalPushEv);
  const snrDb = totalNoise > 0 ? (20 * Math.log10(signal / totalNoise)).toFixed(1) : '0';
  const dynamicRangeStops = Math.max(0, 14.5 - Math.log2(iso / 100) * 0.7 - digitalPushEv * 0.9).toFixed(1);

  // Initialize or update Noise Chart
  useEffect(() => {
    if (activeSubTab !== 'dashboard') return;
    if (!noiseChartRef.current) return;

    if (noiseChartInstance.current) {
      noiseChartInstance.current.destroy();
    }

    const isoLevels = [100, 200, 400, 800, 1600, 3200, 6400, 12800, 25600];
    const shotNoiseData = isoLevels.map(() => shotNoise.toFixed(1));
    const readNoiseData = isoLevels.map((lvl) => {
      const g = lvl / 100;
      return sensorType === 'iso_invariant' 
        ? (baseReadNoise * 1.5).toFixed(1)
        : (baseReadNoise * Math.sqrt(g) * 0.5).toFixed(1);
    });
    const snrData = isoLevels.map((lvl) => {
      const g = lvl / 100;
      const rn = sensorType === 'iso_invariant' ? baseReadNoise : baseReadNoise * Math.sqrt(g) * 0.5;
      const tn = Math.sqrt(shotNoise * shotNoise + rn * rn);
      return (20 * Math.log10((photons * (lvl / iso)) / tn)).toFixed(1);
    });

    const ctx = noiseChartRef.current.getContext('2d');
    if (!ctx) return;

    noiseChartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: isoLevels.map((l) => `ISO ${l}`),
        datasets: [
          {
            label: '광자 샷 노이즈 (Shot Noise - Photon Statistical)',
            data: shotNoiseData.map(Number),
            borderColor: '#38bdf8',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            borderWidth: 2,
            tension: 0.2,
            yAxisID: 'y'
          },
          {
            label: '판독 노이즈 (Read Noise - Circuit Electronic)',
            data: readNoiseData.map(Number),
            borderColor: '#f43f5e',
            backgroundColor: 'rgba(244, 63, 94, 0.15)',
            borderWidth: 2,
            borderDash: [4, 4],
            tension: 0.2,
            yAxisID: 'y'
          },
          {
            label: '신호 대 잡음비 (SNR dB - 우측 축)',
            data: snrData.map(Number),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 3,
            tension: 0.3,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { boxWidth: 12, font: { size: 11 } }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: { display: true, text: '노이즈 레벨 (e⁻ RMS)', font: { size: 11 } },
            grid: { color: 'rgba(148, 163, 184, 0.15)' }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: { display: true, text: 'SNR (dB)', font: { size: 11 } },
            grid: { drawOnChartArea: false }
          },
          x: {
            grid: { color: 'rgba(148, 163, 184, 0.15)' }
          }
        }
      }
    });

    return () => {
      if (noiseChartInstance.current) {
        noiseChartInstance.current.destroy();
      }
    };
  }, [activeSubTab, photons, iso, sensorType]);

  // Initialize Autofocus Radar Chart
  useEffect(() => {
    if (activeSubTab !== 'dashboard') return;
    if (!afRadarChartRef.current) return;

    if (afRadarChartInstance.current) {
      afRadarChartInstance.current.destroy();
    }

    const ctx = afRadarChartRef.current.getContext('2d');
    if (!ctx) return;

    afRadarChartInstance.current = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['초점 검출 속도', '정밀도 & 샤프니스', '저조도(-5EV) 검출', '크로스(전방위) 대응', '동영상 연속 추적'],
        datasets: [
          {
            label: '콘트라스트 검출 AF (CDAF)',
            data: [45, 95, 40, 50, 35],
            borderColor: '#94a3b8',
            backgroundColor: 'rgba(148, 163, 184, 0.2)',
            borderWidth: 1.5,
            pointRadius: 3
          },
          {
            label: '센서 차폐 위상차 AF (Masked PDAF)',
            data: [85, 75, 70, 60, 75],
            borderColor: '#38bdf8',
            backgroundColor: 'rgba(56, 189, 248, 0.2)',
            borderWidth: 2,
            pointRadius: 3
          },
          {
            label: '듀얼 픽셀 CMOS AF (Dual Pixel)',
            data: [92, 92, 88, 70, 95],
            borderColor: '#818cf8',
            backgroundColor: 'rgba(129, 140, 248, 0.2)',
            borderWidth: 2,
            pointRadius: 3
          },
          {
            label: '크로스 쿼드 픽셀 AF (Quad Pixel)',
            data: [99, 98, 97, 99, 98],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.25)',
            borderWidth: 2.5,
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { boxWidth: 12, font: { size: 11 } }
          }
        },
        scales: {
          r: {
            min: 20,
            max: 100,
            ticks: { stepSize: 20, font: { size: 9 } },
            grid: { color: 'rgba(148, 163, 184, 0.2)' },
            angleLines: { color: 'rgba(148, 163, 184, 0.2)' }
          }
        }
      }
    });

    return () => {
      if (afRadarChartInstance.current) {
        afRadarChartInstance.current.destroy();
      }
    };
  }, [activeSubTab]);

  // Initialize MTF Curve Chart in Lens Tab
  useEffect(() => {
    if (activeSubTab !== 'lens') return;
    if (!mtfChartRef.current) return;

    if (mtfChartInstance.current) {
      mtfChartInstance.current.destroy();
    }

    const distances = [0, 3, 6, 9, 12, 15, 18, 21.6]; // mm from sensor center
    const s10 = [98, 97, 95, 93, 90, 86, 82, 78]; // Sagittal 10 lp/mm (Contrast)
    const m10 = [98, 96, 94, 91, 87, 82, 75, 70]; // Meridional 10 lp/mm
    const s30 = [88, 86, 84, 80, 75, 68, 62, 54]; // Sagittal 30 lp/mm (Resolution)
    const m30 = [88, 85, 81, 74, 66, 58, 48, 38]; // Meridional 30 lp/mm

    const ctx = mtfChartRef.current.getContext('2d');
    if (!ctx) return;

    mtfChartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: distances.map((d) => `${d}mm`),
        datasets: [
          {
            label: '10 lp/mm Sagittal (방사선 콘트라스트)',
            data: s10,
            borderColor: '#2563eb',
            borderWidth: 2.5,
            tension: 0.3
          },
          {
            label: '10 lp/mm Meridional (동심원 콘트라스트)',
            data: m10,
            borderColor: '#3b82f6',
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.3
          },
          {
            label: '30 lp/mm Sagittal (미세 해상력)',
            data: s30,
            borderColor: '#ef4444',
            borderWidth: 2.5,
            tension: 0.3
          },
          {
            label: '30 lp/mm Meridional (동심원 해상력)',
            data: m30,
            borderColor: '#f87171',
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 14, font: { size: 11 } } },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          y: {
            min: 0,
            max: 100,
            title: { display: true, text: '전달 콘트라스트 (%)', font: { size: 11 } },
            grid: { color: 'rgba(148, 163, 184, 0.15)' }
          },
          x: {
            title: { display: true, text: '센서 중심에서의 거리 (풀프레임 대각선 21.6mm 코너)', font: { size: 11 } },
            grid: { color: 'rgba(148, 163, 184, 0.15)' }
          }
        }
      }
    });

    return () => {
      if (mtfChartInstance.current) {
        mtfChartInstance.current.destroy();
      }
    };
  }, [activeSubTab]);

  // Initialize Codec Chart in Cinema Tab
  useEffect(() => {
    if (activeSubTab !== 'cinema') return;
    if (!codecChartRef.current) return;

    if (codecChartInstance.current) {
      codecChartInstance.current.destroy();
    }

    const ctx = codecChartRef.current.getContext('2d');
    if (!ctx) return;

    codecChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['ALL-Intra (ProRes 422 HQ)', 'ALL-Intra H.264/H.265', 'Long GOP H.265 (High Bitrate)', 'Long GOP H.264 (Standard)'],
        datasets: [
          {
            label: '비트레이트 (Mbps - 높을수록 화질 우수/용량 큼)',
            data: [750, 400, 150, 50],
            backgroundColor: '#3b82f6',
            borderRadius: 6
          },
          {
            label: 'NLE 편집 및 AI 프레임 추출 지연 (ms - 낮을수록 빠름)',
            data: [8, 15, 65, 95],
            backgroundColor: '#f59e0b',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } }
        },
        scales: {
          y: {
            grid: { color: 'rgba(148, 163, 184, 0.15)' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });

    return () => {
      if (codecChartInstance.current) {
        codecChartInstance.current.destroy();
      }
    };
  }, [activeSubTab]);

  // Filter terms by search query and category
  const filteredTerms = TERMINOLOGY_DATA.filter((term) => {
    const matchesSearch = 
      term.nameKo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || term.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-blue-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2.5 bg-blue-600/90 text-white rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center">
                <Camera className="w-6 h-6" />
              </span>
              <span className="text-xs font-bold tracking-wider uppercase text-blue-300 bg-blue-950/80 border border-blue-700/50 px-2.5 py-0.5 rounded-full">
                MiriCam Opto-Sensor Lab
              </span>
              <span className="text-xs font-medium px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full">
                정밀 물리 계측 V3.2
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              카메라 광학·센서 기술 전문 용어 &amp; 성능 분석 플랫폼
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              글로벌 셔터, 쿼드 픽셀 AF, 적층형 BSI, 듀얼 컨버전 게인(DCG), MTF 곡선, 광자 샷 노이즈 등 
              초정밀 광학 센서 기술과 30여 개 핵심 용어의 물리적 메커니즘을 시뮬레이터와 인터랙티브 차트로 완벽 분석합니다.
            </p>
          </div>

          {/* Quick Search in Banner */}
          <div className="w-full md:w-80 shrink-0">
            <label className="text-[11px] font-semibold text-slate-300 mb-1.5 block">
              용어 즉시 검색 (Global Quick Search)
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="예: 글로벌 셔터, MTF, DTI, ISO..."
                className="w-full bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 4 Core Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 sm:p-3.5 border border-slate-700/60">
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>다이내믹 레인지 (DR)</span>
              <Gauge className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-white mt-1">15.2+ EV</div>
            <div className="text-[10px] text-blue-300 font-mono mt-0.5">DCG / Dual Gain HCG</div>
          </div>
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 sm:p-3.5 border border-slate-700/60">
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>하이브리드 Sync IS</span>
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-white mt-1">최대 8.5 Stops</div>
            <div className="text-[10px] text-emerald-300 font-mono mt-0.5">5-Axis IBIS + OIS 협조</div>
          </div>
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 sm:p-3.5 border border-slate-700/60">
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>위상차 AF 커버리지</span>
              <Eye className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-white mt-1">100% Quad Cross</div>
            <div className="text-[10px] text-amber-300 font-mono mt-0.5">-7.0 EV 극암부 검출</div>
          </div>
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 sm:p-3.5 border border-slate-700/60">
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>글로벌 셔터 스큐 왜곡</span>
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-white mt-1">0% (Zero Jello)</div>
            <div className="text-[10px] text-indigo-300 font-mono mt-0.5">동시 전하 축적 &amp; 1/80000s</div>
          </div>
        </div>
      </div>

      {/* 2. Sub-tab Navigation */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-2 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scroll-smooth">
          <button
            onClick={() => setActiveSubTab('dashboard')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
              activeSubTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>대시보드 &amp; 노이즈 시뮬레이터</span>
          </button>

          <button
            onClick={() => setActiveSubTab('exposure')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
              activeSubTab === 'exposure'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>광학 물리 &amp; 노출/노이즈 공식</span>
          </button>

          <button
            onClick={() => setActiveSubTab('sensor')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
              activeSubTab === 'sensor'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>센서 아키텍처 &amp; AF 혁신</span>
          </button>

          <button
            onClick={() => setActiveSubTab('cinema')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
              activeSubTab === 'cinema'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>시네마 워크플로우 &amp; DR Boost</span>
          </button>

          <button
            onClick={() => setActiveSubTab('lens')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
              activeSubTab === 'lens'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>렌즈 광학 &amp; MTF 분석기</span>
          </button>

          <button
            onClick={() => setActiveSubTab('computational')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
              activeSubTab === 'computational'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>컴퓨테이셔널 이미징 &amp; AI</span>
          </button>

          <button
            onClick={() => setActiveSubTab('dictionary')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
              activeSubTab === 'dictionary'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>용어 통합 사전 ({TERMINOLOGY_DATA.length})</span>
          </button>
        </div>
      </div>

      {/* 3. Sub-Tab Content Rendering */}

      {/* ============================================================== */}
      {/* TAB 1: DASHBOARD & NOISE SIMULATOR */}
      {/* ============================================================== */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Top: ISO Invariance & Noise Interactive Simulator */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg">
                    <SlidersHorizontal className="w-4 h-4" />
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    ISO Invariance (ISO 불변성) &amp; 노이즈 상호작용 시뮬레이터
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  광자 입사량(수광 신호)과 ISO 감도 증폭, 디지털 RAW 푸시 게인을 조절하여 샷 노이즈와 판독 노이즈의 비중 및 최종 SNR(dB)을 실시간 검증합니다.
                </p>
              </div>

              {/* Sensor Architecture Switch */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium">
                <button
                  onClick={() => setSensorType('iso_invariant')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    sensorType === 'iso_invariant'
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  최신 ISO 불변성 센서 (초저 판독노이즈)
                </button>
                <button
                  onClick={() => setSensorType('traditional')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    sensorType === 'traditional'
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  전통적 아날로그 가변 게인 센서
                </button>
              </div>
            </div>

            {/* Slider Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              {/* Slider 1: Photons */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    기초 광자 수광량 (Photons S)
                  </span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    {photons.toLocaleString()} e⁻
                  </span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="40000"
                  step="200"
                  value={photons}
                  onChange={(e) => setPhotons(Number(e.target.value))}
                  className="w-full accent-blue-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>심야 저조도 (200)</span>
                  <span>주간 순광 (40,000)</span>
                </div>
              </div>

              {/* Slider 2: ISO */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    하드웨어 감도 (Camera ISO)
                  </span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    ISO {iso}
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="25600"
                  step="100"
                  value={iso}
                  onChange={(e) => setIso(Number(e.target.value))}
                  className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Base ISO 100</span>
                  <span>HCG ISO 25600</span>
                </div>
              </div>

              {/* Slider 3: Digital Push EV */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    RAW 후처리 밝기 증폭 (+EV Push)
                  </span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    +{digitalPushEv} EV ({Math.pow(2, digitalPushEv)}배)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="1"
                  value={digitalPushEv}
                  onChange={(e) => setDigitalPushEv(Number(e.target.value))}
                  className="w-full accent-emerald-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>원본 노출 (0 EV)</span>
                  <span>극단적 암부 인양 (+5 EV)</span>
                </div>
              </div>
            </div>

            {/* Calculated Results Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 p-3.5 rounded-xl">
                <span className="text-[11px] font-semibold text-sky-800 dark:text-sky-300">
                  샷 노이즈 (√S)
                </span>
                <div className="text-xl font-mono font-bold text-sky-600 dark:text-sky-400 mt-1">
                  ±{shotNoise.toFixed(1)} e⁻
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  빛의 양자적 통계 요동
                </span>
              </div>

              <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-3.5 rounded-xl">
                <span className="text-[11px] font-semibold text-rose-800 dark:text-rose-300">
                  판독 회로 노이즈 (σ_read)
                </span>
                <div className="text-xl font-mono font-bold text-rose-600 dark:text-rose-400 mt-1">
                  ±{effectiveReadNoise.toFixed(2)} e⁻
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {sensorType === 'iso_invariant' ? '불변 센서: 초저 고정' : '아날로그 게인 연동'}
                </span>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-3.5 rounded-xl">
                <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                  최종 신호 대 잡음비 (SNR)
                </span>
                <div className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {snrDb} dB
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  20 log₁₀(Signal / Noise)
                </span>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-3.5 rounded-xl">
                <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                  유효 다이내믹 레인지 (DR)
                </span>
                <div className="text-xl font-mono font-bold text-amber-600 dark:text-amber-400 mt-1">
                  {dynamicRangeStops} EV
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  하이라이트~섀도우 스탑 수
                </span>
              </div>
            </div>

            {/* Chart Container 1 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>ISO별 노이즈 구성 성분 &amp; SNR 변화 추이 (Chart.js Interactive Line Plot)</span>
                <span className="text-[11px] text-slate-500 font-mono">감도 100~25600 시뮬레이션</span>
              </div>
              <div className="h-72 w-full bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <canvas ref={noiseChartRef} />
              </div>
            </div>
          </div>

          {/* Bottom Grid: AF Architecture Radar Chart + High Speed Shutter Distortion Simulation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* AF Architecture Radar Comparison */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <Compass className="w-4 h-4" />
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    4대 오토포커스(AF) 아키텍처 다차원 성능 비교 (Radar Chart)
                  </h3>
                </div>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono">
                  CDAF vs PDAF vs Dual/Quad
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                속도, 정밀도, 저조도 검출력, 크로스(수평+수직) 대응력, 영상 추적 안정성의 5개 차원을 레이더 차트로 비교합니다.
              </p>
              <div className="h-72 w-full bg-slate-50 dark:bg-slate-950/40 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                <canvas ref={afRadarChartRef} />
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 p-3 rounded-lg leading-relaxed">
                💡 <strong className="text-slate-800 dark:text-slate-200">핵심 포인트:</strong> 크로스 쿼드 픽셀 AF는 모든 마이크로렌즈 아래 4개 다이오드를 탑재하여 수평선과 수직선을 모두 판별, -7EV의 칠흑 같은 어둠 속에서도 헌팅 없이 0.02초 만에 초점을 잡습니다.
              </div>
            </div>

            {/* High-speed Global Shutter vs Rolling Shutter Interactive Demonstration */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-lg">
                    <Zap className="w-4 h-4" />
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    글로벌 셔터 vs 롤링 셔터 고속 차량 왜곡(Jello) 시각화
                  </h3>
                </div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                  120km/h 주행 모의
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Rolling Shutter Mock */}
                <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 p-4 rounded-xl text-center space-y-3">
                  <div className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    일반 롤링 셔터 (20ms 스캔)
                  </div>
                  
                  {/* Skewed License Plate Mock */}
                  <div className="h-28 flex items-center justify-center overflow-hidden">
                    <div 
                      className="bg-white dark:bg-slate-800 border-2 border-slate-400 dark:border-slate-600 px-4 py-2 rounded shadow-md text-slate-900 dark:text-white font-mono font-extrabold text-sm tracking-wider"
                      style={{ transform: 'skewX(-24deg) scale(0.95)' }}
                    >
                      <div className="text-[9px] text-slate-400">대한민국 KOR</div>
                      <div className="text-lg text-rose-600 dark:text-rose-400 font-bold">52가 3108</div>
                      <div className="text-[9px] text-rose-500">기울어짐 (Skew) 24°</div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-600 dark:text-slate-400 text-left">
                    ⚠️ 상단 라인과 하단 라인 판독 시차로 인해 문자가 우측으로 심하게 찌그러져 OCR 모델의 폰트 인식률이 32% 급락합니다.
                  </p>
                </div>

                {/* Global Shutter Mock */}
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 p-4 rounded-xl text-center space-y-3">
                  <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    글로벌 셔터 (동시 노광 0ms 시차)
                  </div>

                  {/* Perfect License Plate Mock */}
                  <div className="h-28 flex items-center justify-center overflow-hidden">
                    <div className="bg-white dark:bg-slate-800 border-2 border-emerald-500 px-4 py-2 rounded shadow-md text-slate-900 dark:text-white font-mono font-extrabold text-sm tracking-wider">
                      <div className="text-[9px] text-slate-400">대한민국 KOR</div>
                      <div className="text-lg text-emerald-600 dark:text-emerald-400 font-bold">52가 3108</div>
                      <div className="text-[9px] text-emerald-600 font-semibold">완벽한 직교 (0° 왜곡)</div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-600 dark:text-slate-400 text-left">
                    ✅ 전 픽셀이 1/80,000초 동안 동시에 노광되어 시속 200km/h 주행 차량도 정지된 것처럼 선명하게 캡처됩니다.
                  </p>
                </div>
              </div>

              {/* Shutter Formula Card */}
              <div className="bg-slate-100 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono">
                <span className="text-slate-500 dark:text-slate-400">기하학적 스큐 각도 계산식:</span>
                <div className="text-slate-800 dark:text-slate-200 font-bold mt-1">
                  θ = arctan( v_object × T_readout / H_sensor )
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  v=33.3m/s(120km/h), T=20ms 일 때 약 0.66m 이동하여 극심한 평행사변형 왜곡 발생
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: OPTICS PHYSICS & EXPOSURE NOISE */}
      {/* ============================================================== */}
      {activeSubTab === 'exposure' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Physics Card 1: Aperture & DOF Formula */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <span className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl font-bold">
                  F/N
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    조리개 F값, 유효 구경 &amp; 피사계 심도 (DOF)
                  </h3>
                  <span className="text-xs text-slate-500">기하 광학(Geometric Optics)의 핵심 원리</span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs space-y-2">
                <div className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                  F = f / D
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  f: 렌즈 초점 거리 (Focal Length, mm)<br />
                  D: 조리개 입사동 유효 직경 (Entrance Pupil Diameter, mm)
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 font-bold">
                  DOF ≈ 2 · u² · N · c / f²
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  u: 피사체 거리, N: F값, c: 허용 착란원 직경 (Circle of Confusion)
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                조리개 F값이 1.4배 증가할 때마다(F1.4 → F2.0 → F2.8) 렌즈 입사 면적은 정확히 1/2로 줄어들어 광량이 1스탑 감소합니다. 
                차량 번호판 단속 카메라의 경우 1차선부터 3차선까지 차량이 앞뒤로 이동해도 초점이 유지되어야 하므로 과초점 거리(Hyperfocal) 계산을 통해 F4.0~F8.0 대역을 기본값으로 운용합니다.
              </p>
            </div>

            {/* Physics Card 2: Airy Disk & Diffraction Limit */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <span className="p-2 bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl font-bold">
                  λ
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    에어리 디스크 (Airy Disk) &amp; 파동 회절 한계
                  </h3>
                  <span className="text-xs text-slate-500">빛의 파동성에 따른 물리적 분해능 한계선</span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs space-y-2">
                <div className="text-rose-600 dark:text-rose-400 font-bold text-sm">
                  d_airy = 2.44 × λ × N
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  λ: 가시광선 기준 파장 (~550nm 녹색광)<br />
                  N: 조리개 수치 (F-Number)
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-amber-600 dark:text-amber-400 font-bold">
                  Rayleigh Criterion = 1.22 × λ / D
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  두 점광원이 분리되어 보이기 위한 최소 분해 각도
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                조리개를 너무 많이 조이면(F16, F22) 에어리 디스크 지름이 20㎛ 이상으로 커지며 현대 고화소 센서의 미세 화소 피치(2.0㎛~3.5㎛)를 넘어서게 되어 
                오히려 초점이 뭉개지는 회절 블러(Diffraction Blur)가 발생합니다. 최고 선예도를 위한 스위트 스팟은 F4.0~F5.6입니다.
              </p>
            </div>

            {/* Physics Card 3: Photon Shot Noise & Poisson Process */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <span className="p-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold">
                  √S
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    광자 샷 노이즈 (Photon Shot Noise) 수학적 모델
                  </h3>
                  <span className="text-xs text-slate-500">포아송 확률 과정(Poisson Distribution)</span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs space-y-2">
                <div className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  P(k; λ) = (λ^k · e^(-λ)) / k!
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  평균 광자 수 S에 대해 분산 Var(S) = S, 표준편차 σ_shot = √S
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-emerald-500 font-bold">
                  SNR_shot = S / √S = √S
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  신호량이 10,000개일 때 노이즈는 100개(1%), 신호가 100개일 땐 노이즈 10개(10%)
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                빛 자체가 불연속적인 광자 알갱이로 도달하기 때문에 발생하는 근원적 노이즈입니다. 
                신호량이 적은 야간 저조도에서는 전체 신호 대비 노이즈 비중이 급격히 커지므로, 외부 적외선(IR) 스트로브 조명이나 센서 수광 면적 증대가 노이즈 극복의 유일한 정답입니다.
              </p>
            </div>

            {/* Physics Card 4: Sensor Total Noise & Read Noise Formula */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <span className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold">
                  SNR
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    센서 총 노이즈 &amp; 켈빈 색온도(Kelvin) 스펙트럼
                  </h3>
                  <span className="text-xs text-slate-500">신호 대 잡음비(SNR) 종합 계산식</span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs space-y-2">
                <div className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                  Noise_total = √( S + σ_read² + σ_dark² + σ_ADC² )
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  S: 광자 샷 노이즈 제곱, σ_read: 회로 판독 잡음, σ_dark: 암전류 열잡음
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-sky-500 font-bold">
                  Plank Radiation: B(λ, T) = (2hc²/λ⁵) / (e^(hc/λkT) - 1)
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  색온도 3000K(할로겐) vs 5500K(태양광) vs 850nm IR 조명 스펙트럼
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                밝은 하이라이트 영역에서는 광자 샷 노이즈가 지배적이고, 어두운 암부(Shadow) 영역에서는 회로 판독 노이즈가 화질을 결정합니다. 
                야간 단속 시스템에서는 850nm 파장의 고출력 적외선 플래시를 사용하여 가시광 눈부심 없이 센서의 QE(양자 효율)를 최대한 활용합니다.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: SENSOR ARCHITECTURE & AF INNOVATION */}
      {/* ============================================================== */}
      {activeSubTab === 'sensor' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Sensor Arch 1: Global Shutter Pixel Architecture */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-0.5 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-md">
                  센서 아키텍처
                </span>
                <span className="text-[11px] font-mono text-slate-400">Memory Node</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                픽셀 병렬 메모리 노드 글로벌 셔터
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                각 화소마다 포토다이오드(PD) 바로 옆에 빛을 차폐한 아날로그 전하 보관소(Memory Node)를 내장합니다. 노광 종료 신호와 동시에 모든 픽셀의 전하가 메모리 노드로 동시 전송된 후 천천히 A/D 변환되므로, 고속 이동체에서도 롤링 왜곡이 0%입니다.
              </p>
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 font-mono">
                구조: MicroLens → ColorFilter → PD → TX1 → StorageNode → TX2 → FloatingDiffusion
              </div>
            </div>

            {/* Sensor Arch 2: Stacked BSI & Cu-Cu Direct Bonding */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-md">
                  반도체 접합 혁신
                </span>
                <span className="text-[11px] font-mono text-slate-400">Cu-Cu Hybrid</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                적층형 BSI &amp; Cu-Cu 하이브리드 본딩
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                화소 층과 하단 로직 층을 구리(Cu) 전극 패드로 직접 분자 접합합니다. 기존 관통전극(TSV) 방식보다 접합 밀도가 수십 배 높아 수백만 개의 병렬 ADC와 온센서 DRAM 버퍼를 화소 직하단에 배치하여 초당 1,000프레임 이상의 초고속 스캔을 구현합니다.
              </p>
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 font-mono">
                대역폭: 수 Tbps 극초고속 데이터 전송, 롤링 스캔 타임 3.8ms 달성
              </div>
            </div>

            {/* Sensor Arch 3: Deep Trench Isolation */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded-md">
                  광학 간섭 차단
                </span>
                <span className="text-[11px] font-mono text-slate-400">DTI Barrier</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                DTI (심층 트렌치 격벽) 크로스토크 제어
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                인접한 픽셀과 픽셀 사이에 실리콘 산화물(SiO₂) 절연 트렌치 격벽을 깊게 형성하여, 비스듬히 입사하는 광자가 옆 픽셀로 침범해 발생하는 색 섞임(Color Crosstalk)과 전하 누설을 완벽 차단합니다. 1.0㎛대 초미세 픽셀에서도 순도 높은 선명도를 제공합니다.
              </p>
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 font-mono">
                효과: 크로스토크 60% 이상 감쇄, 주변부 광각 비네팅 억제
              </div>
            </div>

          </div>

          {/* Deep Comparison Table: AF Technologies */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              오토포커스(AF) 세대별 아키텍처 상세 비교 명세표
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 text-slate-700 dark:text-slate-300">
                    <th className="py-3 px-4 font-bold">AF 방식</th>
                    <th className="py-3 px-4 font-bold">검출 원리</th>
                    <th className="py-3 px-4 font-bold">검출 방향</th>
                    <th className="py-3 px-4 font-bold">저조도 한계</th>
                    <th className="py-3 px-4 font-bold">화질 영향</th>
                    <th className="py-3 px-4 font-bold">차량 인식 적합도</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">콘트라스트 검출 (CDAF)</td>
                    <td className="py-3 px-4">초점면을 앞뒤로 흔들며(Wobbling) 최대 명암비 지점 탐색</td>
                    <td className="py-3 px-4">전방위 (명암만 확인)</td>
                    <td className="py-3 px-4 font-mono">-2.0 EV</td>
                    <td className="py-3 px-4 text-emerald-600 font-semibold">화질 손실 0%</td>
                    <td className="py-3 px-4 text-rose-500 font-bold">부적합 (초점 헌팅 및 지연 심함)</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">차폐 위상차 (Masked PDAF)</td>
                    <td className="py-3 px-4">센서 일부 화소를 금속 마스크로 가려 좌/우 시차 비교</td>
                    <td className="py-3 px-4">단일 축 (주로 수직선)</td>
                    <td className="py-3 px-4 font-mono">-4.0 EV</td>
                    <td className="py-3 px-4 text-amber-600">차폐 화소 주변 보간 필요</td>
                    <td className="py-3 px-4 text-amber-500 font-bold">보통 (가로선 패턴 오작동 가능)</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">듀얼 픽셀 CMOS AF</td>
                    <td className="py-3 px-4">전 화소 마이크로렌즈 아래 좌/우 2개 다이오드 신호 비교</td>
                    <td className="py-3 px-4">수평 방향 위상차</td>
                    <td className="py-3 px-4 font-mono">-5.5 EV</td>
                    <td className="py-3 px-4 text-emerald-600 font-semibold">손실 없음 (전 화소 결상)</td>
                    <td className="py-3 px-4 text-blue-500 font-bold">우수 (빠른 락온 및 부드러운 추적)</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 bg-emerald-50/30 dark:bg-emerald-950/20">
                    <td className="py-3 px-4 font-bold text-emerald-700 dark:text-emerald-300">크로스 쿼드 픽셀 AF</td>
                    <td className="py-3 px-4">마이크로렌즈당 4개(2x2) 다이오드로 수평+수직 교차 위상차 계산</td>
                    <td className="py-3 px-4 font-semibold text-emerald-600">완벽한 전방위 크로스</td>
                    <td className="py-3 px-4 font-mono text-emerald-600 font-bold">-7.0 EV 극암부</td>
                    <td className="py-3 px-4 text-emerald-600 font-semibold">손실 없음 (4-PD 합산 결상)</td>
                    <td className="py-3 px-4 text-emerald-600 font-bold">최고 (야간 도로 전천후 추적)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: CINEMA WORKFLOW & DR */}
      {/* ============================================================== */}
      {activeSubTab === 'cinema' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Cinema Tech 1: Dual Conversion Gain & DR Boost */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <span className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold">
                  DCG
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Dual Conversion Gain &amp; Real-time DR Boost
                  </h3>
                  <span className="text-xs text-slate-500">15+ 스탑 시네마 다이내믹 레인지의 원천</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                밝은 주간에는 <strong>LCG (Low Conversion Gain)</strong> 경로로 전환하여 높은 포화 전자 용량(FWC)을 유지해 
                하늘과 헤드라이트의 하이라이트가 하얗게 타버리는 것을 막습니다. 
                어두운 야간에는 <strong>HCG (High Conversion Gain)</strong> 경로로 전환하여 전하당 전압 변환율을 극대화해 판독 노이즈를 1 e⁻ 미만으로 억제합니다.
              </p>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  ⚡ 실시간 DR Boost 동시 판독 (Single Exposure Dual Readout):
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                  동일한 단일 노광 프레임에서 LCG(하이라이트 우선)와 HCG(노이즈 억제) 2개 아날로그 라인을 동시에 16-bit A/D 변환하여 실시간 합성합니다. 
                  모션 고스팅(Ghosting)이 전혀 없는 완벽한 하이다이내믹 레인지를 출력합니다.
                </div>
              </div>
            </div>

            {/* Cinema Tech 2: Log Profiles */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <span className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl font-bold">
                  LOG
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Log 감마 커브 (S-Log3, C-Log, V-Log, Apple Log)
                  </h3>
                  <span className="text-xs text-slate-500">인간 시각 특성에 맞춘 비선형 계조 보존</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                표준 Rec.709는 선형 센서 신호를 클리핑하여 8스탑 이상의 밝은 디테일을 모두 버립니다. 
                Log 프로파일은 수학적 로그 곡선을 통해 14스탑 이상의 센서 계조를 10-bit(0~1023) 코드값에 균등 분배합니다. 
                야간에 강한 역광이나 터널 입구에서도 번호판 번호와 차체 디테일을 동시에 손실 없이 보존합니다.
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-blue-600">S-Log3:</span> 18% 중간 회색을 41% IRE에 정밀 매핑, 암부 계조 유지력 최상
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-indigo-600">V-Log:</span> 센서 원천 다이내믹 레인지 전체를 16스탑 이상 수납
                </div>
              </div>
            </div>

          </div>

          {/* Codec Comparison Chart: ALL-I vs Long GOP */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Film className="w-5 h-5 text-amber-500" />
                  비디오 압축 코덱 성능 분석: ALL-Intra vs Long GOP (H.264 / H.265 / ProRes)
                </h3>
                <span className="text-xs text-slate-500">
                  비트레이트(대역폭)와 NLE 편집 / AI 실시간 프레임 디코딩 지연(Latency)의 상관관계
                </span>
              </div>
              <span className="text-xs font-mono text-amber-600 dark:text-amber-400 font-bold">
                I-Frame Only vs GOP
              </span>
            </div>

            <div className="h-64 w-full bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <canvas ref={codecChartRef} />
            </div>

            {/* Chroma Subsampling Visual Explanation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white">4:4:4 풀 샘플링</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  모든 픽셀마다 밝기(Y)와 색차(Cb, Cr)를 1:1로 온전히 기록. 크로마 번짐 0%. 번호판 파란색/초록색 폰트 테두리가 칼같이 살아남.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">4:2:2 방송 표준 (권장)</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  수평 색상 해상도만 1/2로 줄이고 수직은 100% 보존. 고속 차량의 엣지 분해능을 완벽히 유지하면서 데이터 용량을 효율화함.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400">4:2:0 소비자용 압축</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  가로/세로 모두 절반으로 줄여 색 해상도가 25%에 불과함. 전기차 파란 번호판과 흰색 반사판 경계선에서 색 번짐(Bleeding) 유발 가능.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: LENS OPTICS & MTF ANALYZER */}
      {/* ============================================================== */}
      {activeSubTab === 'lens' && (
        <div className="space-y-6">
          {/* MTF Curve Interactive Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  동적 MTF 곡선 분석기 (Modulation Transfer Function Analyzer)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  센서 중심(0mm)부터 대각선 모서리(21.6mm)까지 10 lp/mm(명암비) 및 30 lp/mm(미세 선예도) 전달률 그래프
                </p>
              </div>
              <span className="text-xs font-mono px-3 py-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800">
                F4.0 Sweet-Spot 시뮬레이션
              </span>
            </div>

            <div className="h-72 w-full bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <canvas ref={mtfChartRef} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900/50">
                <span className="font-bold text-blue-800 dark:text-blue-300">
                  10 lp/mm 곡선 (파란색): 콘트라스트 및 전체적 선명도
                </span>
                <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  센서 중심부에서 98%, 주변부 21.6mm에서도 75% 이상을 유지하여 차량 윤곽선 및 번호판 사각 프레임의 높은 콘트라스트를 보장합니다.
                </p>
              </div>

              <div className="p-3.5 bg-rose-50/50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/50">
                <span className="font-bold text-rose-800 dark:text-rose-300">
                  30 lp/mm 곡선 (빨간색): 미세 해상력 &amp; 글자 분해능
                </span>
                <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Sagittal(실선)과 Meridional(점선)의 간격이 좁을수록 비점수차(Astigmatism)가 적어 번호판 숫자의 얇은 획이 흐려지지 않습니다.
                </p>
              </div>
            </div>
          </div>

          {/* Lens Components: APD, VCM, 4 Optical Aberrations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Component 1: APD Filter */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <span className="text-xs font-bold px-2 py-0.5 bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 rounded-md">
                광학 요소
              </span>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">
                APD (Apodization) 필터 &amp; 스무드 보케
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                조리개 부근에 동심원형으로 가장자리가 어두워지는 점진 감광 ND 필터를 배치하여 보케 경계선의 단단한 링 아티팩트를 소멸시키고 극도로 부드러운 배경 분리를 구현합니다.
              </p>
            </div>

            {/* Component 2: VCM Linear Motor */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <span className="text-xs font-bold px-2 py-0.5 bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 rounded-md">
                구동 메커니즘
              </span>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">
                VCM (Voice Coil Motor) 리니어 액추에이터
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                기어 없이 로렌츠 전자기력으로 무마찰 초고속 직진 구동하여 백래시(Backlash)가 0이며, 마이크론 단위의 정밀도로 무소음 초점 렌즈군을 1/120초 단위로 추적 제어합니다.
              </p>
            </div>

            {/* Component 3: 4 Major Aberrations */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <span className="text-xs font-bold px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 rounded-md">
                수차 보정
              </span>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">
                비점수차 &amp; 색수차 (ED / 비구면)
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                초저분산(ED) 글래스와 정밀 비구면(Aspherical) 렌즈를 조합하여 파장별 굴절률 차이로 생기는 보라색/녹색 테두리 색수차(Fringing)와 방사선 방향 초점 불일치를 교정합니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: COMPUTATIONAL IMAGING & AI */}
      {/* ============================================================== */}
      {activeSubTab === 'computational' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Tech 1: 5-Axis IBIS & Sync IS */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <span className="p-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold">
                  8.5 EV
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    5축 센서 시프트 IBIS &amp; Sync IS 협조 제어
                  </h3>
                  <span className="text-xs text-slate-500">지주대 진동 및 차량 풍압 완벽 상쇄</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                센서를 지탱하는 자기부상 보이스코일 유닛이 5축(Pitch, Yaw, Roll, X-shift, Y-shift)으로 초당 수만 회 실시간 반대 방향으로 이동합니다. 
                특히 렌즈 내 광학 OIS와 고속 통신하여 망원 화각의 큰 각도 흔들림은 렌즈가, 회전(Roll)과 평행 이동은 센서가 나누어 분담함으로써 
                도로변 대형 화물차 통과 시 발생하는 극심한 저주파 진동을 95% 이상 흡수합니다.
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-emerald-600">Pitch / Yaw:</span> 렌즈 광학군 + 센서 듀얼 협력 보정
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-blue-600">Roll / X, Y:</span> 바디 센서 시프트 독점 보정 (렌즈 불가능 축)
                </div>
              </div>
            </div>

            {/* Tech 2: Pixel Shift Multi-Shot Resolution */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <span className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl font-bold">
                  4x-16x
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    픽셀 시프트 고해상도 합성 (Pixel Shift Resolution)
                  </h3>
                  <span className="text-xs text-slate-500">베이어 디모자이크 오차 제로 &amp; 풀컬러 캡처</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                센서 액추에이터를 정확히 1픽셀 또는 0.5픽셀 단위로 이동시키며 4회~16회 연속 촬영합니다. 
                모든 픽셀 위치에서 R, G, B 순수 컬러 신호를 각각 받아 가짜 색(Moiré)과 지퍼링 아티팩트를 100% 제거하며, 
                물리 화소 수의 4배(예: 45MP → 180MP)에 달하는 초정밀 계측용 이미지를 생성합니다.
              </p>

              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900/50 text-xs text-slate-700 dark:text-slate-300">
                🔍 <strong>실무 적용:</strong> 국토교통부 표준 규격 위변조 방지 홀로그램 패턴 및 미세 문자 스크래치 판독에 필수적인 기술입니다.
              </div>
            </div>

            {/* Tech 3: Computational Live ND Filter */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <span className="p-2 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-xl font-bold">
                  ND
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    컴퓨테이셔널 라이브 ND (Live Electronic ND)
                  </h3>
                  <span className="text-xs text-slate-500">물리 필터 없는 온칩 다중 노출 러닝 적분</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                센서 고속 판독 신호를 소프트웨어 단계에서 연속 누적 평균(Running Average)하여 물리적 광학 유리 필터 없이 ND2부터 ND64까지의 감광 장노출 효과를 모사합니다. 
                필터로 인한 색 틀어짐(Color Cast)이나 주변부 비네팅 없이 대낮에도 조리개를 활짝 열어둘 수 있습니다.
              </p>
            </div>

            {/* Tech 4: Neural AI Denoise & Super Resolution */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <span className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold">
                  AI
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    신경망 NPU 디노이즈 &amp; 초해상도 (Super-Resolution)
                  </h3>
                  <span className="text-xs text-slate-500">RAW 도메인 딥러닝 ISP 화질 재구성</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                RGB 변환 이전의 순수 베이어 RAW 단계에서 딥러닝 트랜스포머/CNN 모델을 통과시켜 
                글자의 날카로운 에지와 질감은 그대로 유지하면서 통계적 샷 노이즈와 회로 판독 노이즈만 선택 소거합니다. 
                야간 저조도 환경에서 OCR 모델의 글자 오인식률을 30% 이상 낮춥니다.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 7: COMPREHENSIVE TERMINOLOGY DICTIONARY */}
      {/* ============================================================== */}
      {activeSubTab === 'dictionary' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'all', label: '전체 (All)' },
                { id: 'exposure', label: '광학/노출' },
                { id: 'sensor', label: '센서 공학' },
                { id: 'af', label: 'AF 기술' },
                { id: 'cinema', label: '영상/DR' },
                { id: 'lens', label: '렌즈 광학' },
                { id: 'computational', label: '컴퓨테이셔널' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Counter */}
            <div className="text-xs text-slate-500 font-mono shrink-0">
              검색 결과: <strong className="text-blue-600 dark:text-blue-400">{filteredTerms.length}</strong>개 용어
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTerms.map((term) => (
              <div
                key={term.id}
                onClick={() => setSelectedTerm(term)}
                className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-500/80 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 rounded-md border border-blue-200 dark:border-blue-800/80">
                      {term.categoryLabel}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {term.badge}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {term.nameKo}
                    </h4>
                    <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                      {term.nameEn}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {term.summary}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-semibold">
                  <span>상세 분석 &amp; 수식 보기</span>
                  <Info className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Term Detail Modal */}
      {selectedTerm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-full">
                    {selectedTerm.categoryLabel}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">
                    {selectedTerm.badge}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {selectedTerm.nameKo}
                </h3>
                <p className="text-xs font-mono text-slate-500 mt-0.5">
                  {selectedTerm.nameEn}
                </p>
              </div>

              <button
                onClick={() => setSelectedTerm(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                심층 물리 원리 &amp; 기술 설명
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedTerm.description}
              </p>
            </div>

            {/* Mathematical Formula if available */}
            {selectedTerm.formula && (
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 font-mono">
                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase">
                  광학 / 물리 수학 공식
                </span>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedTerm.formula}
                </div>
                {selectedTerm.formulaDesc && (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {selectedTerm.formulaDesc}
                  </div>
                )}
              </div>
            )}

            {/* Advantages & Disadvantages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900/50 space-y-2">
                <h5 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  핵심 강점 &amp; 장점
                </h5>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                  {selectedTerm.advantages.map((adv, idx) => (
                    <li key={idx} className="leading-relaxed">{adv}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-rose-50/50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/50 space-y-2">
                <h5 className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-rose-600" />
                  한계점 &amp; 트레이드오프
                </h5>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                  {selectedTerm.disadvantages.map((dis, idx) => (
                    <li key={idx} className="leading-relaxed">{dis}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Practical Tip */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/60 space-y-1 text-xs">
              <span className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                💡 실무 엔지니어링 팁 (ALPR &amp; 머신비전 최적화)
              </span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedTerm.practicalTip}
              </p>
            </div>

            {/* Modal Close Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedTerm(null)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md shadow-blue-600/20"
              >
                확인 및 닫기
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
