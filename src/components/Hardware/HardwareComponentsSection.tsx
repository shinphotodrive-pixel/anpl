import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Radio, 
  Server, 
  Zap, 
  Cpu, 
  CheckCircle2, 
  ExternalLink, 
  Layers, 
  Activity, 
  ShieldCheck, 
  Sliders, 
  ArrowRight, 
  Clock, 
  Sparkles,
  CircuitBoard,
  Cable,
  Thermometer,
  Eye,
  Maximize2,
  Info,
  X,
  FileText,
  Table,
  Power,
  Check,
  HelpCircle,
  Gauge
} from 'lucide-react';

interface ComponentSpecItem {
  label: string;
  value: string;
}

export interface QuickSpecSummary {
  resolutionOrFreq: { label: string; value: string };
  powerReq: { label: string; value: string };
  interfacePort: { label: string; value: string };
  operatingEnv: { label: string; value: string };
  keyHighlight: { label: string; value: string };
}

interface HardwareComponent {
  id: 'camera' | 'radar' | 'ipc' | 'led_board';
  title: string;
  model: string;
  category: string;
  tag: string;
  tagClass: string;
  icon: React.ElementType;
  officialUrl?: string;
  roleSummary: string;
  quickSummary: QuickSpecSummary;
  specs: ComponentSpecItem[];
  features: string[];
  interfaceWiring: {
    port: string;
    target: string;
    protocol: string;
    purpose: string;
  }[];
  alprImpact: string;
}

const HARDWARE_COMPONENTS: HardwareComponent[] = [
  {
    id: 'camera',
    title: '머신비전 글로벌 셔터 카메라',
    model: 'TechNexion UVCS-AR0234-C-S83-IR',
    category: '영상 획득 유닛 (Imaging Sensor)',
    tag: 'Global Shutter · USB3',
    tagClass: 'bg-sky-500/20 text-sky-400 border border-sky-500/30',
    icon: Camera,
    officialUrl: 'https://www.technexion.com/shop/usb-vision/usb3-cameras/vcs/uvcs-ar0234-c-s83-ir/',
    roleSummary: 'onsemi AR0234 2.3MP 글로벌 셔터 센서를 탑재하여 고속 주행 차량의 롤링 왜곡(Jello effect) 및 모션 블러를 원천 차단하는 초소형 머신비전 카메라',
    quickSummary: {
      resolutionOrFreq: { label: '해상도 & 셔터', value: '1920×1200 (2.3MP) · 하드웨어 글로벌 셔터' },
      powerReq: { label: '전원 요구사항', value: 'DC 5V (USB-C VBUS) · 1.25W 이하 저전력' },
      interfacePort: { label: '데이터 인터페이스', value: 'USB 3.0 Type-C (5 Gbps UVC 표준)' },
      operatingEnv: { label: '동작 온도/규격', value: '-30°C ~ +70°C 옥외 산업용 규격 (18g)' },
      keyHighlight: { label: '광학 특화', value: '83° D-FOV M12 렌즈 + 650nm IR-Cut 필터' }
    },
    specs: [
      { label: '이미지 센서', value: 'onsemi AR0234CS 1/2.6" CMOS Global Shutter' },
      { label: '유효 해상도', value: '1920 (H) × 1200 (V), 약 230만 화소 (FHD+)' },
      { label: '픽셀 크기', value: '3.0 µm × 3.0 µm (고감도 Front Side Illuminated)' },
      { label: '셔터 방식', value: '하드웨어 글로벌 셔터 (전체 화소 동시 노출)' },
      { label: '광학 렌즈', value: 'S-Mount (M12) 교체형 렌즈, 83° D-FOV (화각 83도)' },
      { label: '광학 필터', value: '온보드 650nm IR-Cut 필터 탑재 (주간 색재현성)' },
      { label: '최대 프레임률', value: '1920×1200 @ 60fps (UYVY), 100fps (MJPEG), 120fps (720p)' },
      { label: '호스트 인터페이스', value: 'USB 3.0 Type-C (5 Gbps 고속 대역폭, UVC 지원)' },
      { label: '소비 전력', value: '1.25W 이하 (동작 시), 0.1W (대기 시) 저전력' },
      { label: '외형 치수 & 무게', value: '24.5 × 24.5 × 25.6 mm, 약 18g (보드 레벨 초소형)' },
      { label: '동작 온도', value: '-30°C ~ +70°C (혹한·혹서기 산업용 동작 규격)' },
      { label: '인증 규격', value: 'CE, FCC, RoHS, REACH, NDAA Section 889 준수' }
    ],
    features: [
      '글로벌 셔터: 100km/h 이상 고속 주행 차량의 번호판 글자가 사선으로 휘어지는 롤링 셔터 왜곡 제로',
      'USB3 Vision / UVC 호환: 별도 전용 프레임그래버 없이 리눅스/윈도우 산업용 PC에 단일 Type-C 케이블 직결',
      '하드웨어 ISP 내장: 노이즈 리덕션, 화이트 밸런스, 감마 보정을 온보드 하드웨어에서 전처리하여 호스트 CPU 부하 경감',
      '초소형 24.5mm 폼팩터: 협소한 옥외형 방수 하우징 및 지능형 가로등/신호기 암(Arm) 내부에 손쉬운 매립'
    ],
    interfaceWiring: [
      { port: 'USB Type-C', target: 'JECS-7360B 산업용 PC (USB 3.0)', protocol: 'USB 3.2 Gen1 (5Gbps) / UVC', purpose: '무압축 UYVY 비디오 스트림 전송 및 5V VBUS 전원 공급' },
      { port: 'GPIO Trigger In (옵션)', target: 'LED 제어보드 Trigger Out', protocol: '3.3V TTL / 하드웨어 펄스', purpose: '차량 진입 시 외부 스트로브 동기 노출 시작 트리거' }
    ],
    alprImpact: '일반 롤링 셔터 웹캠 대비 모션 블러를 95% 이상 억제하며, 시속 120km 고속 주행 시에도 번호판 테두리와 한글 음절 획이 칼날처럼 선명하게 캡처되어 OCR 오인식률을 0.8% 이하로 낮춥니다.'
  },
  {
    id: 'radar',
    title: '24GHz mmWave 고정밀 차량 감지 레이더',
    model: 'Hi-Link HLK-LD2451',
    category: '차량 검지 & 속도 측정 유닛 (Vehicle Detection)',
    tag: '24GHz FMCW · 100m 탐지',
    tagClass: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    icon: Radio,
    roleSummary: '24GHz FMCW 초고주파 밀리미터파로 최대 100m 거리에서 차량의 진입 여부, 주행 속도(1~240km/h), 방향을 폭우·안개 속에서도 전천후 감지하는 지능형 레이더 모듈',
    quickSummary: {
      resolutionOrFreq: { label: '동작 주파수', value: '24.00 GHz ~ 24.25 GHz FMCW 밀리미터파' },
      powerReq: { label: '전원 요구사항', value: 'DC 5V (동작 평균 107mA, 피크 300mA)' },
      interfacePort: { label: '트리거 & 통신', value: '2× GPIO (3.3V 초저지연 < 2ms) + UART (115200)' },
      operatingEnv: { label: '탐지 사양/온도', value: '최대 100m 거리 (1~240km/h) / -40°C ~ +85°C' },
      keyHighlight: { label: '환경 내구성', value: '우천·안개 100% 관통 + 스마트폰 BLE 무선 튜닝' }
    },
    specs: [
      { label: '레이더 기술', value: '24GHz FMCW (Frequency Modulated Continuous Wave)' },
      { label: '동작 주파수 대역', value: '24.00 GHz ~ 24.25 GHz (ISM 무선 인증 대역)' },
      { label: '최대 탐지 거리', value: '최대 100m (감도 및 게이트 구역 자유 설정 가능)' },
      { label: '속도 측정 범위', value: '1 km/h ~ 240 km/h (접근/이탈 방향 벡터 실시간 산출)' },
      { label: '거리 분해능', value: '약 1m 단위 거리 구분 및 위치 트래킹' },
      { label: '감지 각도 (FOV)', value: '수평 ±20° (또는 ±15°), 수직 16° (최대 3개 차선 커버)' },
      { label: '다중 타겟 추적', value: '최대 3대 차량의 거리·속도·각도 동시 독립 추적' },
      { label: '입력 전원', value: 'DC 5V (동작 평균 전류: 약 107mA, 피크 300mA)' },
      { label: '통신 인터페이스', value: 'UART (기본 115200 bps) + 2× GPIO (3.3V 하드웨어 트리거)' },
      { label: '무선 보조 기능', value: '내장 BLE 블루투스 (HLKRadarTool 스마트폰 앱으로 감도 튜닝)' },
      { label: '동작 온도', value: '-40°C ~ +85°C (혹한·혹서 극한 옥외 환경 내구성)' },
      { label: '보드 치수', value: '70 mm × 35 mm (콤팩트 안테나 일체형 PCB)' }
    ],
    features: [
      '광학 한계 극복: 폭우, 폭설, 짙은 스모그, 야간 암흑, 역광 등 광학 카메라가 무력화되는 환경에서도 밀리미터파로 100% 차량 검지',
      '초정밀 속도 및 도달 시간(TTC) 산출: 차량이 카메라 초점 지점(예: 12m 전방)에 도착하는 시간을 밀리초 단위로 정확히 예측하여 트리거링',
      '하드웨어 GPIO 직접 트리거: 복잡한 PC 소프트웨어 폴링 없이도 차량 검지 즉시 2개 GPIO 핀을 통해 LED 제어보드로 신호 즉시 인가 (< 2ms)',
      '스마트폰 BLE 무선 설정: 현장 폴대(Pole)에 설치한 후에도 사다리나 유선 케이블 연결 없이 지상에서 스마트폰 앱으로 감지 영역 및 차로 폭 교정'
    ],
    interfaceWiring: [
      { port: 'GPIO 1 (Trigger Out)', target: 'LED 제어보드 Opto In 1', protocol: '3.3V Logic Trigger Active High', purpose: '차량이 최적 촬영 구역 진입 시 즉시 하드웨어 캡처 트리거 신호 방출' },
      { port: 'UART TX/RX', target: 'JECS-7360B COM 포트 (RS-232/TTL 변환)', protocol: 'UART 115200 8-N-1', purpose: '실시간 차량 속도, 타겟 거리, 차선 위치 텔레메트리 데이터 전송' },
      { port: 'VCC / GND', target: '5V DC 정전압 스위칭 레귤레이터', protocol: 'DC 5V 500mA', purpose: '안정적인 레이더 구동 전원 공급' }
    ],
    alprImpact: '차량 검지 누락률(False Negative)을 0.01% 이하로 낮추며, 카메라를 24시간 상시 레코딩할 필요 없이 차량이 진입할 때만 정확하게 트리거하여 시스템 발열, 저장 공간, GPU 추론 부하를 80% 이상 절감합니다.'
  },
  {
    id: 'ipc',
    title: '고성능 무소음 팬리스 엣지 산업용 PC',
    model: 'JECS Company JECS-7360B',
    category: '엣지 컴퓨팅 & AI 추론 유닛 (Edge Controller)',
    tag: 'Intel Core i5 · Fanless · Dual LAN',
    tagClass: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
    icon: Server,
    roleSummary: '인텔 i5 코어 프로세서와 4개의 고속 USB 3.0 포트, 듀얼 기가비트 이더넷을 갖춘 고신뢰성 팬리스 알루미늄 샤시의 옥외 현장용 엣지 AI 컨트롤러',
    quickSummary: {
      resolutionOrFreq: { label: '프로세서 & GPU', value: 'Intel Core i5-7360U (최대 3.6GHz) + Iris Plus 640' },
      powerReq: { label: '전원 요구사항', value: 'DC 12V 5A 단일 입력 (산업용 락킹 전원 단자)' },
      interfacePort: { label: '확장 I/O 포트', value: '4× USB 3.0 (카메라 수신), 2× GbE LAN, 2× COM' },
      operatingEnv: { label: '냉각/동작환경', value: '팬리스(Fanless) 알루미늄 다이캐스팅 · -20°C ~ +60°C' },
      keyHighlight: { label: '엣지 AI 가속', value: 'Intel OpenVINO 기반 온프레미스 YOLO & OCR (< 22ms)' }
    },
    specs: [
      { label: '프로세서 (CPU)', value: 'Intel® Core™ i5-7360U (2코어/4스레드, 2.3GHz Base ~ 3.6GHz Turbo)' },
      { label: '내장 그래픽스', value: 'Intel® Iris® Plus Graphics 640 / HD 620 (OpenVINO / QSV 가속)' },
      { label: '시스템 메모리', value: 'DDR4 8GB / 16GB SO-DIMM 고속 메모리' },
      { label: '스토리지', value: 'M.2 NVMe / 2.5" SATA SSD (128GB / 256GB / 512GB)' },
      { label: '네트워크', value: '2 × Intel I211/I219 Gigabit Ethernet (10/100/1000 Mbps RJ45)' },
      { label: 'USB 포트', value: '4 × USB 3.0 (TechNexion 고속 카메라 대역폭 전용) + 2 × USB 2.0' },
      { label: '시리얼 포트', value: '2 × COM (RS-232/422/485 지원, 레이더 및 차단기 연동)' },
      { label: '디스플레이 출력', value: '1 × HDMI + 1 × DisplayPort (DP), 4K UHD 듀얼 모니터 지원' },
      { label: '전원 입력', value: 'DC 12V 5A 단일 전원 입력 (표준 산업용 락킹 단자)' },
      { label: '냉각 및 방열 구조', value: '완전 밀폐 팬리스(Fanless) 알루미늄 압출 방열 케이스' },
      { label: '확장 슬롯', value: 'Mini-PCIe / SIM 카드 슬롯 (LTE/5G 무선 모뎀 장착 가능)' },
      { label: '지원 OS', value: 'Ubuntu Linux 20.04/22.04 LTS, Windows 10 IoT Enterprise' }
    ],
    features: [
      '팬리스(Fanless) 무소음 무팬 구조: 회전 팬이 없어 도로변 분진, 매연, 진동 환경에서도 팬 고장으로 인한 시스템 다운타임 제로 (MTBF > 50,000시간)',
      '4개의 독립 USB 3.0 포트: TechNexion UVCS-AR0234 카메라의 1920×1200 60fps 무압축 데이터 스트림을 병목 없이 수신',
      '듀얼 기가비트 LAN: 로컬 카메라/센서망과 중앙 통합 교통관제센터(TMC) 백본 네트워크를 물리적으로 분리하여 보안 격리 구성',
      '엣지 AI 온프레미스 추론: YOLOv8-Nano / YOLOv11 모델을 Intel OpenVINO 프레임워크로 경량화 가속하여 프레임당 16~22ms 이내 번호판 영역 검출 및 한글 OCR 완료'
    ],
    interfaceWiring: [
      { port: 'USB 3.0 Port 1', target: 'TechNexion UVCS-AR0234 카메라', protocol: 'USB 3.2 Gen1 (5Gbps)', purpose: '고해상도 비디오 프레임 캡처 데이터 수신' },
      { port: 'COM 1 (RS-232/485)', target: 'HLK-LD2451 레이더 UART', protocol: 'Serial 115200bps', purpose: '차량 접근 속도 및 통계 데이터 수집' },
      { port: 'COM 2 (RS-485)', target: 'LED 제어보드 RS-485 단자', protocol: 'Modbus-RTU 9600bps', purpose: '현장 조도에 따른 LED 스트로브 광량 및 펄스폭 원격 제어' },
      { port: 'LAN 1 (Ethernet)', target: '지자체/주차 관제 중앙 서버', protocol: 'TCP/IP, MQTT, REST API', purpose: '인식된 차량 번호판 텍스트, 크롭 이미지, 통과 시간 암호화 전송' }
    ],
    alprImpact: '클라우드로 영상을 보낼 필요 없이 현장에서 25ms 이내에 즉각적인 번호판 인식을 완료하여 차단기 개방 지연을 없애며, 네트워크 단절 상황에서도 로컬 SSD에 100만 건 이상의 통과 기록을 안전하게 저장합니다.'
  },
  {
    id: 'led_board',
    title: '고속 스트로브 & 플래시 LED 제어보드',
    model: 'ALPR-STROBE-CTRL v2.4 (산업용)',
    category: '광학 동기화 & 전원 드라이버 유닛 (Optic Controller)',
    tag: 'µs Pulse · Optocoupler · Overdrive',
    tagClass: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    icon: Zap,
    roleSummary: '포토커플러 광절연 회로와 마이크로초(µs) 단위 정밀 PWM을 통해 레이더 신호 수신 즉시 카메라 셔터와 LED 스트로브 발광을 순간 동기화하는 핵심 제어기',
    quickSummary: {
      resolutionOrFreq: { label: '응답속도 & 펄스', value: '< 5µs 초고속 응답 · 50µs ~ 5000µs 가변 PWM' },
      powerReq: { label: '전원 요구사항', value: 'DC 12V ~ 24V 광대역 입력 (서지/역전압 보호)' },
      interfacePort: { label: '절연 & 통신', value: '2.5kV 포토커플러 광절연 + RS-485 Modbus-RTU' },
      operatingEnv: { label: '스트로브 부스트', value: '순간 250~400% 오버드라이브 펄스 (피크 10A)' },
      keyHighlight: { label: '광학 동기화', value: '2채널 (White/IR) 독립 제어 + NTC 과열 보호' }
    },
    specs: [
      { label: '제어 마이크로컨트롤러', value: '32-bit ARM Cortex-M4 (168MHz 고속 타이머 내장)' },
      { label: '트리거 입력 절연', value: '고속 포토커플러(Optocoupler) 2.5kV 광절연 입력' },
      { label: '트리거 응답 지연', value: '5 마이크로초(µs) 미만 (초고속 하드웨어 인터럽트)' },
      { label: '스트로브 펄스폭 조절', value: '50 µs ~ 5,000 µs (카메라 노출시간에 1:1 매칭 조절)' },
      { label: '오버드라이브 부스트', value: '순간 정격 250% ~ 400% 대전류 펄스 방출 (LED 수명 보호 회로)' },
      { label: '출력 채널 수', value: '독립 2채널 (CH1: 가시광 White LED / CH2: 850nm IR LED)' },
      { label: '채널당 최대 피크 전류', value: '최대 10A (순간 펄스 기준), 상시 2A 지원' },
      { label: '동기화 트리거 출력', value: '카메라 외부 셔터 트리거용 3.3V/5V TTL 펄스 출력 포트' },
      { label: '입력 동작 전원', value: 'DC 12V ~ 24V 광대역 입력 (서지 및 역전압 보호 회로)' },
      { label: '외부 제어 통신', value: 'RS-485 (Modbus-RTU) / 현장 수동 딥스위치(DIP Switch) 지원' },
      { label: '보호 회로', value: '과전류 차단, LED 과열 감지 서미스터(NTC), 과전압 클램핑' },
      { label: '설치 규격', value: 'DIN-Rail (35mm 표준 딘레일) 마운트 지원 산업용 케이스' }
    ],
    features: [
      '마이크로초 초정밀 동기화: 레이더의 차량 도달 신호를 수신하는 즉시 5µs 이내에 카메라의 노출 시작과 LED 점등을 완벽히 일치시켜 플래시 누락 방지',
      '순간 오버드라이브(Overdrive) 발광: 상시 켜져 있을 때보다 3~4배 강력한 순간 전류를 500µs 동안만 흘려보내 번호판 재귀반사지(반사필름)의 휘도를 극한으로 향상시키면서도 LED 발열과 노화를 방지',
      '듀얼 채널 독립 제어: 주간에는 화이트 LED 보조광을 사용하고, 심야에는 운전자 눈부심을 일으키지 않는 850nm 적외선(IR) 채널을 선택 점등',
      '포토커플러 절연: 옥외 유도뢰(번개), 모터, 전력선에서 유입되는 수천 볼트의 써지 노이즈를 빛으로 격리하여 산업용 PC와 카메라 메인보드를 완벽 보호'
    ],
    interfaceWiring: [
      { port: 'Trigger In (Opto 1)', target: 'HLK-LD2451 레이더 GPIO 1', protocol: 'Optocoupler Isolated DC 3.3~12V', purpose: '레이더의 차량 접근 판정 하드웨어 신호 수신' },
      { port: 'Camera Trigger Out', target: 'TechNexion 카메라 GPIO Shutter In', protocol: '3.3V TTL Pulse', purpose: 'LED 발광 시점과 카메라 글로벌 셔터 개방 동시 명령' },
      { port: 'High-Power Strobe Out', target: '고출력 White / IR LED 투광기 어레이', protocol: 'Pulse Modulated DC 24V / 5A', purpose: '노출 시간 동안만 번호판에 초고광량 순간 펄스 조명 방출' },
      { port: 'RS-485 (A/B)', target: 'JECS-7360B 산업용 PC COM 2', protocol: 'Modbus-RTU 9600bps', purpose: '계절/시간대별 조명 밝기 및 펄스 지속시간 원격 조정' }
    ],
    alprImpact: '야간 저조도 환경에서 셔터스피드를 1/2000초(500µs)의 초고속으로 설정해도 어둡지 않은 선명한 고대비 번호판 영상을 생성하여 야간 번호판 인식 성공률을 58%에서 99.4%로 끌어올립니다.'
  }
];

export const HardwareComponentsSection: React.FC = () => {
  const [selectedCompId, setSelectedCompId] = useState<'camera' | 'radar' | 'ipc' | 'led_board'>('camera');
  const [hoveredCardId, setHoveredCardId] = useState<'camera' | 'radar' | 'ipc' | 'led_board' | null>(null);
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);
  const [modalActiveTab, setModalActiveTab] = useState<'camera' | 'radar' | 'ipc' | 'led_board' | 'matrix'>('camera');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState<number>(0);
  const [simVehicleSpeed, setSimVehicleSpeed] = useState<number>(85); // km/h

  const selectedComponent = HARDWARE_COMPONENTS.find(c => c.id === selectedCompId) || HARDWARE_COMPONENTS[0];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSpecModalOpen) {
        setIsSpecModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpecModalOpen]);

  const openSpecModal = (tabId: 'camera' | 'radar' | 'ipc' | 'led_board' | 'matrix') => {
    setModalActiveTab(tabId);
    setIsSpecModalOpen(true);
  };

  // Run hardware trigger sequence simulation
  const handleRunSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimulationStep(1); // Step 1: Radar detection

    setTimeout(() => {
      setSimulationStep(2); // Step 2: Trigger Conditioning to LED Board
    }, 450);

    setTimeout(() => {
      setSimulationStep(3); // Step 3: Synchronized Strobe + Global Shutter
    }, 900);

    setTimeout(() => {
      setSimulationStep(4); // Step 4: USB3 Transfer to JECS-7360B
    }, 1400);

    setTimeout(() => {
      setSimulationStep(5); // Step 5: YOLO & OCR Edge Inference Completed!
    }, 2000);

    setTimeout(() => {
      setIsSimulating(false);
    }, 3200);
  };

  return (
    <section id="hardware" className="py-16 bg-slate-950 text-white border-b border-slate-800 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 mb-2 tracking-wider uppercase">
            <CircuitBoard className="w-4 h-4 text-sky-400" />
            <span>ALPR System Hardware Architecture & BOM</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="font-mono text-slate-400">Edge Machine Vision Stack</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                ALPR 4대 핵심 하드웨어 구성품 (Hardware Architecture)
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-4xl leading-relaxed">
                고속 도로(120km/h+) 및 주야간 극한 환경에서 롤링 왜곡과 모션 블러 없는 선명한 번호판 영상을 획득하고,
                온프레미스 딥러닝 엣지 추론을 수행하기 위해 상호 연동되는 4대 필수 산업용 하드웨어의 기술 제원 및 통합 배선 구성입니다.
              </p>
            </div>

            {/* Quick Actions & Spec Summary Trigger */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => openSpecModal('matrix')}
                className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Table className="w-3.5 h-3.5" />
                <span>4대 기술 사양 비교표 보기</span>
              </button>

              <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>응답 지연: <strong className="text-emerald-400">&lt; 28ms</strong></span>
                </div>
                <span className="text-slate-700">|</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sky-400 font-bold">100% 팬리스</span>
                  <span>옥외 구동</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Components Interactive Navigation Cards with Quick Spec Tooltips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {HARDWARE_COMPONENTS.map((comp) => {
            const Icon = comp.icon;
            const isSelected = comp.id === selectedCompId;
            const isHovered = hoveredCardId === comp.id;

            return (
              <div
                key={comp.id}
                onMouseEnter={() => setHoveredCardId(comp.id)}
                onMouseLeave={() => setHoveredCardId(null)}
                className="relative"
              >
                <div
                  onClick={() => setSelectedCompId(comp.id)}
                  className={`text-left p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer h-full ${
                    isSelected
                      ? 'bg-slate-900 border-sky-500 shadow-lg shadow-sky-500/10 ring-1 ring-sky-500/40'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-sky-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${comp.tagClass}`}>
                        {comp.tag}
                      </span>
                    </div>

                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      {comp.category}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-0.5">
                      {comp.title}
                    </h3>
                    <p className="text-xs font-mono text-sky-400 mt-1 truncate font-medium">
                      {comp.model}
                    </p>

                    {/* Quick Summary Badges (Always Visible on Card) */}
                    <div className="mt-3.5 space-y-1.5 pt-3 border-t border-slate-800/80">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Gauge className="w-3 h-3 text-sky-400 shrink-0" />
                          <span>{comp.quickSummary.resolutionOrFreq.label}:</span>
                        </span>
                        <strong className="text-slate-200 font-mono text-[10px] truncate max-w-[140px]">
                          {comp.quickSummary.resolutionOrFreq.value}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Power className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>전원 요구:</span>
                        </span>
                        <strong className="text-amber-300 font-mono text-[10px] truncate max-w-[140px]">
                          {comp.quickSummary.powerReq.value}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openSpecModal(comp.id);
                      }}
                      className="flex items-center gap-1 text-[11px] font-medium text-sky-400 hover:text-sky-300 py-0.5 px-1.5 rounded hover:bg-sky-950/60 transition-colors"
                      title={`${comp.title} 상세 사양서 보기`}
                    >
                      <FileText className="w-3 h-3" />
                      <span>상세 사양</span>
                    </button>

                    <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                      <span>선택</span>
                      <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-sky-400 translate-x-1' : 'text-slate-500'}`} />
                    </div>
                  </div>
                </div>

                {/* Floating Quick-Spec Tooltip / Popover (Shows on Hover/Focus) */}
                {isHovered && (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2.5 w-72 sm:w-80 z-30 pointer-events-auto bg-slate-900/98 backdrop-blur-xl border border-sky-500/50 rounded-xl p-3.5 shadow-2xl shadow-sky-950/80 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-start justify-between gap-2 pb-2 mb-2.5 border-b border-slate-800">
                      <div>
                        <div className="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-wider">
                          {comp.category}
                        </div>
                        <div className="text-xs font-bold text-white leading-tight">
                          {comp.title}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {comp.model}
                        </div>
                      </div>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border font-semibold shrink-0 ${comp.tagClass}`}>
                        QUICK SPEC
                      </span>
                    </div>

                    {/* Tooltip Spec Key-Values */}
                    <div className="space-y-2 text-[11px]">
                      <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/80">
                        <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                          <Gauge className="w-3 h-3 text-sky-400" />
                          <span>{comp.quickSummary.resolutionOrFreq.label}</span>
                        </div>
                        <div className="font-mono font-semibold text-white mt-0.5 text-[11px]">
                          {comp.quickSummary.resolutionOrFreq.value}
                        </div>
                      </div>

                      <div className="bg-amber-950/20 p-2 rounded-lg border border-amber-800/40">
                        <div className="text-[10px] text-amber-400 font-medium flex items-center gap-1">
                          <Power className="w-3 h-3 text-amber-400" />
                          <span>전원 입력 사양</span>
                        </div>
                        <div className="font-mono font-semibold text-amber-200 mt-0.5 text-[11px]">
                          {comp.quickSummary.powerReq.value}
                        </div>
                      </div>

                      <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/80">
                        <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                          <Cable className="w-3 h-3 text-emerald-400" />
                          <span>인터페이스 & 프로토콜</span>
                        </div>
                        <div className="font-mono font-semibold text-emerald-300 mt-0.5 text-[11px]">
                          {comp.quickSummary.interfacePort.value}
                        </div>
                      </div>

                      <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/80">
                        <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                          <Thermometer className="w-3 h-3 text-indigo-400" />
                          <span>동작 보증 환경</span>
                        </div>
                        <div className="font-mono font-semibold text-indigo-200 mt-0.5 text-[11px]">
                          {comp.quickSummary.operatingEnv.value}
                        </div>
                      </div>
                    </div>

                    {/* Tooltip Footer Link */}
                    <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">클릭하여 세부 사양서 열기</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openSpecModal(comp.id);
                        }}
                        className="text-sky-400 font-bold hover:underline flex items-center gap-0.5"
                      >
                        <span>상세 사양 모달</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    {/* Little arrow at bottom */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2 h-2 bg-slate-900 border-r border-b border-sky-500/50 rotate-45" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Component Detailed Inspector */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 mb-10 shadow-xl">
          {/* Top Title & Links */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-slate-800 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
                <selectedComponent.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-slate-400">{selectedComponent.category}</span>
                  <span className="text-slate-600">·</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${selectedComponent.tagClass}`}>
                    {selectedComponent.tag}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {selectedComponent.title}
                </h3>
                <p className="text-sm font-mono text-sky-300 font-semibold mt-0.5">
                  모델명: {selectedComponent.model}
                </p>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
                  {selectedComponent.roleSummary}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start shrink-0">
              <button
                type="button"
                onClick={() => openSpecModal(selectedComponent.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 hover:border-slate-600 text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
              >
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                <span>상세 기술 사양서 팝업</span>
              </button>

              {selectedComponent.officialUrl && (
                <a
                  href={selectedComponent.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  <span>제조사 공식 데이터시트</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Spec Highlights Bar (5 Key Highlights) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-6 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
              <span className="text-[10px] text-slate-400 font-medium block flex items-center gap-1 mb-0.5">
                <Gauge className="w-3 h-3 text-sky-400" />
                <span>{selectedComponent.quickSummary.resolutionOrFreq.label}</span>
              </span>
              <strong className="text-slate-100 font-mono text-[11px] block truncate">
                {selectedComponent.quickSummary.resolutionOrFreq.value}
              </strong>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-amber-900/30 text-xs">
              <span className="text-[10px] text-amber-400 font-medium block flex items-center gap-1 mb-0.5">
                <Power className="w-3 h-3 text-amber-400" />
                <span>{selectedComponent.quickSummary.powerReq.label}</span>
              </span>
              <strong className="text-amber-200 font-mono text-[11px] block truncate">
                {selectedComponent.quickSummary.powerReq.value}
              </strong>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
              <span className="text-[10px] text-slate-400 font-medium block flex items-center gap-1 mb-0.5">
                <Cable className="w-3 h-3 text-emerald-400" />
                <span>{selectedComponent.quickSummary.interfacePort.label}</span>
              </span>
              <strong className="text-emerald-300 font-mono text-[11px] block truncate">
                {selectedComponent.quickSummary.interfacePort.value}
              </strong>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
              <span className="text-[10px] text-slate-400 font-medium block flex items-center gap-1 mb-0.5">
                <Thermometer className="w-3 h-3 text-indigo-400" />
                <span>{selectedComponent.quickSummary.operatingEnv.label}</span>
              </span>
              <strong className="text-indigo-200 font-mono text-[11px] block truncate">
                {selectedComponent.quickSummary.operatingEnv.value}
              </strong>
            </div>

            <div className="col-span-2 sm:col-span-1 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
              <span className="text-[10px] text-slate-400 font-medium block flex items-center gap-1 mb-0.5">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>{selectedComponent.quickSummary.keyHighlight.label}</span>
              </span>
              <strong className="text-purple-300 font-mono text-[11px] block truncate">
                {selectedComponent.quickSummary.keyHighlight.value}
              </strong>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Full Specifications Table (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-sky-400" />
                  <span>하드웨어 정밀 기술 사양 (Technical Specifications)</span>
                </h4>
                <div className="bg-slate-950/70 rounded-xl border border-slate-800 divide-y divide-slate-800/80 overflow-hidden text-xs">
                  {selectedComponent.specs.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 sm:px-3.5 hover:bg-slate-800/40 transition-colors">
                      <span className="text-slate-400 font-medium text-[11px] sm:text-xs sm:w-1/3">{item.label}</span>
                      <strong className="text-slate-100 font-mono text-[11px] sm:text-xs sm:w-2/3 sm:text-right mt-0.5 sm:mt-0 break-words">
                        {item.value}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* ALPR System Impact Card */}
              <div className="mt-5 p-4 rounded-xl bg-sky-950/40 border border-sky-800/50">
                <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>ALPR 시스템 인식률 기여도 (System Significance)</span>
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  {selectedComponent.alprImpact}
                </p>
              </div>
            </div>

            {/* Right Column: Key Features & Hardware Pinout / Wiring (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Core Features */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>핵심 설계 특장점 (Key Capabilities)</span>
                </h4>
                <div className="space-y-2.5">
                  {selectedComponent.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/90 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-slate-200 leading-relaxed">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hardware Wiring & Pinout */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Cable className="w-3.5 h-3.5 text-amber-400" />
                  <span>하드웨어 인터페이스 배선도 (Wiring & Protocol)</span>
                </h4>
                <div className="space-y-2">
                  {selectedComponent.interfaceWiring.map((wire, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80 mb-1.5">
                        <span className="text-amber-300 font-bold">{wire.port}</span>
                        <span className="text-slate-400 text-[10px]">→ {wire.target}</span>
                      </div>
                      <div className="text-[11px] text-slate-300 flex items-center justify-between">
                        <span className="text-slate-400">프로토콜:</span>
                        <span className="text-sky-300 font-semibold">{wire.protocol}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {wire.purpose}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive ALPR Hardware Interconnection & Timing Sequence Simulator */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 animate-pulse" />
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>4대 구성품 상호 연동 및 하드웨어 타이밍 시뮬레이터</span>
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                차량 감지(HLK-LD2451) → 하드웨어 광절연(LED 제어보드) → 스트로브/글로벌 셔터 동기 노출(AR0234) → USB3 전송 및 엣지 AI 추론(JECS-7360B)의 전 과정을 실시간 시뮬레이션합니다.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400 font-medium">가상 주행 속도:</span>
                <select
                  value={simVehicleSpeed}
                  onChange={(e) => setSimVehicleSpeed(Number(e.target.value))}
                  disabled={isSimulating}
                  className="bg-slate-900 text-sky-400 font-mono font-bold rounded px-1.5 py-0.5 border border-slate-700 text-xs focus:outline-none"
                >
                  <option value={50}>50 km/h (일반 도로)</option>
                  <option value={85}>85 km/h (도시 고속)</option>
                  <option value={120}>120 km/h (고속도로)</option>
                  <option value={160}>160 km/h (초고속 과속)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 ${
                  isSimulating
                    ? 'bg-sky-400 text-slate-950 cursor-wait'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                }`}
              >
                <Activity className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
                <span>{isSimulating ? '하드웨어 시퀀스 실행 중...' : '트리거 시퀀스 발송 시험'}</span>
              </button>
            </div>
          </div>

          {/* 5-Step Hardware Flowchart */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
            {/* Step 1 */}
            <div className={`p-4 rounded-xl border transition-all ${
              simulationStep >= 1 ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200' : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">STEP 1</span>
                <Radio className={`w-4 h-4 ${simulationStep >= 1 ? 'text-emerald-400 animate-pulse' : 'text-slate-600'}`} />
              </div>
              <h5 className="text-xs font-bold text-white mb-1">1. 레이더 차량 탐지</h5>
              <p className="text-[11px] leading-relaxed text-slate-300">
                <strong>HLK-LD2451</strong>가 24GHz FMCW로 {simVehicleSpeed}km/h 접근 차량의 15m 지점 도달을 감지하고 GPIO 3.3V 트리거 펄스 방출
              </p>
              <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-emerald-400 font-bold">
                소요 지연: 2.1 ms
              </div>
            </div>

            {/* Step 2 */}
            <div className={`p-4 rounded-xl border transition-all ${
              simulationStep >= 2 ? 'bg-amber-950/40 border-amber-500 text-amber-200' : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">STEP 2</span>
                <Zap className={`w-4 h-4 ${simulationStep >= 2 ? 'text-amber-400 animate-bounce' : 'text-slate-600'}`} />
              </div>
              <h5 className="text-xs font-bold text-white mb-1">2. 광절연 & 신호 분배</h5>
              <p className="text-[11px] leading-relaxed text-slate-300">
                <strong>LED 제어보드</strong>의 포토커플러가 레이더 신호를 노이즈 없이 수신하여 스트로브 발광 드라이버 및 카메라 셔터 동시 명령
              </p>
              <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-amber-400 font-bold">
                광절연 지연: 5.0 µs
              </div>
            </div>

            {/* Step 3 */}
            <div className={`p-4 rounded-xl border transition-all ${
              simulationStep >= 3 ? 'bg-sky-950/40 border-sky-500 text-sky-200' : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">STEP 3</span>
                <Camera className={`w-4 h-4 ${simulationStep >= 3 ? 'text-sky-400 animate-pulse' : 'text-slate-600'}`} />
              </div>
              <h5 className="text-xs font-bold text-white mb-1">3. 스트로브 & 셔터 동기</h5>
              <p className="text-[11px] leading-relaxed text-slate-300">
                <strong>LED 보드</strong>가 800µs 순간 오버드라이브 발광하는 동안 <strong>AR0234 글로벌 셔터</strong>가 전 화소 동시 캡처 (블러 제로)
              </p>
              <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-sky-400 font-bold">
                노출 동기: 800 µs
              </div>
            </div>

            {/* Step 4 */}
            <div className={`p-4 rounded-xl border transition-all ${
              simulationStep >= 4 ? 'bg-indigo-950/40 border-indigo-500 text-indigo-200' : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">STEP 4</span>
                <Cable className={`w-4 h-4 ${simulationStep >= 4 ? 'text-indigo-400 animate-pulse' : 'text-slate-600'}`} />
              </div>
              <h5 className="text-xs font-bold text-white mb-1">4. USB 3.0 초고속 전송</h5>
              <p className="text-[11px] leading-relaxed text-slate-300">
                1920×1200 무압축 비디오 프레임이 5Gbps USB Type-C 버스를 통해 <strong>JECS-7360B</strong> 산업용 PC 메모리로 DMA 다이렉트 전송
              </p>
              <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-indigo-400 font-bold">
                전송 지연: 4.8 ms
              </div>
            </div>

            {/* Step 5 */}
            <div className={`p-4 rounded-xl border transition-all ${
              simulationStep >= 5 ? 'bg-purple-950/40 border-purple-500 text-purple-200' : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">STEP 5</span>
                <Server className={`w-4 h-4 ${simulationStep >= 5 ? 'text-purple-400 animate-bounce' : 'text-slate-600'}`} />
              </div>
              <h5 className="text-xs font-bold text-white mb-1">5. 엣지 AI 추론 & 저장</h5>
              <p className="text-[11px] leading-relaxed text-slate-300">
                <strong>JECS-7360B i5</strong> 프로세서가 OpenVINO 기반 YOLOv8 번호판 탐지 및 한글 OCR 완료 후 통제 서버/차단기로 결과 전송
              </p>
              <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-purple-400 font-bold">
                AI 추론: 18.2 ms
              </div>
            </div>
          </div>

          {/* Simulation Status Live Readout */}
          <div className="mt-5 p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-slate-400">시뮬레이션 상태:</span>
              {simulationStep === 0 && <span className="text-slate-400 font-mono">트리거 대기 중 (Idle)</span>}
              {simulationStep === 1 && <span className="text-emerald-400 font-bold font-mono">1/5: HLK-LD2451 레이더 24GHz FMCW 타겟 포착...</span>}
              {simulationStep === 2 && <span className="text-amber-400 font-bold font-mono">2/5: LED 제어보드 포토커플러 광절연 펄스 생성 중...</span>}
              {simulationStep === 3 && <span className="text-sky-400 font-bold font-mono">3/5: TechNexion AR0234 글로벌 셔터 + LED 스트로브 순간 점등!</span>}
              {simulationStep === 4 && <span className="text-indigo-400 font-bold font-mono">4/5: USB 3.0 버스를 통한 FHD 프레임 캡처 수신 중...</span>}
              {simulationStep === 5 && <span className="text-purple-300 font-bold font-mono">✓ 5/5: JECS-7360B 엣지 YOLO 추론 성공! 번호판 "123가 4567" 99.8% 식별 완료</span>}
            </div>

            <div className="font-mono text-[11px] text-slate-400">
              총 소요 사이클 타임: <strong className="text-white font-bold">{simulationStep === 5 ? '25.9 ms' : simulationStep > 0 ? '측정 중...' : '25.9 ms (예상)'}</strong>
            </div>
          </div>
        </div>

        {/* System Deployment & Integration Architecture Diagram */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1.5">
              산업용 신뢰성 & 옥외 방수 기준
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              모든 구성품은 IP66/IP67 등급 옥외 폴대(Pole) 하우징 내부에 수납되며, -30°C 혹한기 히터 및 +70°C 내부 순환 열전도 설계로 4계절 무중단 24시간 가동을 보장합니다.
            </p>
          </div>

          <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1.5">
              전원 공급 아키텍처 (Power Distribution)
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              AC 220V 상용 전원을 입력받아 산업용 MeanWell SMPS를 통해 JECS-7360B용 DC 12V와 LED 스트로브용 DC 24V를 분리 공급하며, 레이더와 카메라는 각각 5V 정전압 공급을 받습니다.
            </p>
          </div>

          <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
              <Activity className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1.5">
              유지보수 및 원격 진단 (Remote Maintenance)
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              JECS-7360B의 보조 기가비트 LAN 또는 LTE 모뎀을 통해 원격 SSH 진단, 카메라 노출 파라미터 미세 조정, 레이더 감도 교정 및 딥러닝 AI 모델 가중치(Weights)의 무중단 OTA 배포가 가능합니다.
            </p>
          </div>
        </div>

        {/* Detailed Hardware Technical Specifications Modal / Dialog */}
        {isSpecModalOpen && (
          <div 
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
            onClick={() => setIsSpecModalOpen(false)}
          >
            <div 
              className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col my-auto overflow-hidden animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/80 shrink-0">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 mb-1 tracking-wider uppercase">
                    <FileText className="w-4 h-4 text-sky-400" />
                    <span>ALPR Hardware Technical Datasheet</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="text-slate-400">정밀 기술 사양 상세 분석서</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    ALPR 4대 핵심 하드웨어 상세 기술 사양서
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    카메라(AR0234), 레이더(HLK-LD2451), 산업용 PC(JECS-7360B), 고속 LED 제어보드의 전원·주파수·인터페이스 상세 제원
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSpecModalOpen(false)}
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
                  aria-label="닫기"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Tabs Navigation */}
              <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 overflow-x-auto shrink-0">
                {HARDWARE_COMPONENTS.map((comp) => {
                  const Icon = comp.icon;
                  const isTabActive = modalActiveTab === comp.id;
                  return (
                    <button
                      key={comp.id}
                      type="button"
                      onClick={() => setModalActiveTab(comp.id)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        isTabActive
                          ? 'bg-sky-500 text-slate-950 shadow-md'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{comp.title.split(' ')[0]} ({comp.model.split(' ')[0]})</span>
                    </button>
                  );
                })}

                <div className="h-4 w-px bg-slate-800 mx-1 shrink-0" />

                <button
                  type="button"
                  onClick={() => setModalActiveTab('matrix')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    modalActiveTab === 'matrix'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-indigo-300 hover:text-white hover:bg-slate-800 border border-indigo-500/30'
                  }`}
                >
                  <Table className="w-3.5 h-3.5 text-indigo-400" />
                  <span>4종 종합 비교 매트릭스</span>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 overflow-y-auto flex-grow space-y-6">
                {modalActiveTab === 'matrix' ? (
                  /* 4-Component Side-by-Side Comparison Matrix */
                  <div>
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Table className="w-4 h-4 text-sky-400" />
                        <span>ALPR 4대 핵심 구성품 기술 사양 종합 비교 매트릭스</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        해상도, 주파수, 전원 요구사항, 물리 인터페이스, 지연시간, 동작 온도를 한눈에 비교할 수 있습니다.
                      </p>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-800">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-950 text-slate-300 border-b border-slate-800">
                            <th className="p-3 font-semibold text-slate-400 w-1/5 min-w-[140px]">비교 항목</th>
                            <th className="p-3 font-semibold text-sky-400 w-1/5 min-w-[170px]">
                              1. 카메라 (TechNexion AR0234)
                            </th>
                            <th className="p-3 font-semibold text-emerald-400 w-1/5 min-w-[170px]">
                              2. 레이더 (HLK-LD2451)
                            </th>
                            <th className="p-3 font-semibold text-indigo-400 w-1/5 min-w-[170px]">
                              3. 산업용 PC (JECS-7360B)
                            </th>
                            <th className="p-3 font-semibold text-amber-400 w-1/5 min-w-[170px]">
                              4. LED 제어보드 (Strobe)
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80 bg-slate-900/60 font-mono text-[11px]">
                          <tr className="hover:bg-slate-800/40">
                            <td className="p-3 font-sans font-bold text-slate-300">장비 범주 및 모델</td>
                            <td className="p-3 text-white font-semibold">UVCS-AR0234-C-S83-IR</td>
                            <td className="p-3 text-white font-semibold">Hi-Link HLK-LD2451</td>
                            <td className="p-3 text-white font-semibold">JECS-7360B IPC</td>
                            <td className="p-3 text-white font-semibold">ALPR-STROBE-CTRL v2.4</td>
                          </tr>
                          <tr className="hover:bg-slate-800/40">
                            <td className="p-3 font-sans font-bold text-slate-300">핵심 기술 / 해상도 / 주파수</td>
                            <td className="p-3 text-sky-300">
                              1920×1200 (2.3MP)<br />
                              <span className="font-sans text-[10px] text-slate-400">하드웨어 글로벌 셔터</span>
                            </td>
                            <td className="p-3 text-emerald-300">
                              24.00 ~ 24.25 GHz<br />
                              <span className="font-sans text-[10px] text-slate-400">FMCW 밀리미터파 도플러</span>
                            </td>
                            <td className="p-3 text-indigo-300">
                              Intel Core i5-7360U<br />
                              <span className="font-sans text-[10px] text-slate-400">2.3GHz~3.6GHz / Iris 640</span>
                            </td>
                            <td className="p-3 text-amber-300">
                              32-bit ARM Cortex-M4<br />
                              <span className="font-sans text-[10px] text-slate-400">50µs~5000µs PWM 펄스</span>
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-800/40 bg-amber-950/10">
                            <td className="p-3 font-sans font-bold text-amber-400">전원 입력 요구사양</td>
                            <td className="p-3 text-slate-200">
                              DC 5V (USB-C VBUS)<br />
                              <strong className="text-emerald-400">&lt; 1.25W</strong> (초저전력)
                            </td>
                            <td className="p-3 text-slate-200">
                              DC 5V 정전압<br />
                              <strong className="text-emerald-400">107mA (평균) / 300mA</strong>
                            </td>
                            <td className="p-3 text-slate-200">
                              DC 12V 5A 단일 입력<br />
                              <strong className="text-indigo-400">약 25W~45W</strong> (산업용 락킹)
                            </td>
                            <td className="p-3 text-slate-200">
                              DC 12V ~ 24V 광대역<br />
                              <strong className="text-amber-400">순간 피크 10A / 대기 0.2A</strong>
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-800/40">
                            <td className="p-3 font-sans font-bold text-slate-300">주요 인터페이스</td>
                            <td className="p-3 text-slate-300">
                              USB 3.0 Type-C (5Gbps)<br />
                              + GPIO Shutter In (3.3V)
                            </td>
                            <td className="p-3 text-slate-300">
                              2× GPIO (3.3V Logic)<br />
                              + UART (115200bps) + BLE
                            </td>
                            <td className="p-3 text-slate-300">
                              4× USB 3.0, 2× GbE LAN,<br />
                              2× COM (RS-232/485)
                            </td>
                            <td className="p-3 text-slate-300">
                              2.5kV 포토커플러 In,<br />
                              RS-485 Modbus, TTL Out
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-800/40">
                            <td className="p-3 font-sans font-bold text-slate-300">신호 응답 및 지연시간</td>
                            <td className="p-3 text-emerald-300">동시 노출 (블러 0)</td>
                            <td className="p-3 text-emerald-300">&lt; 2.1 ms (차량 즉시 검지)</td>
                            <td className="p-3 text-purple-300">&lt; 18.2 ms (YOLO + OCR 추론)</td>
                            <td className="p-3 text-amber-300">&lt; 5 µs (초고속 하드웨어 인터럽트)</td>
                          </tr>
                          <tr className="hover:bg-slate-800/40">
                            <td className="p-3 font-sans font-bold text-slate-300">동작 보증 온도</td>
                            <td className="p-3 text-slate-300">-30°C ~ +70°C</td>
                            <td className="p-3 text-slate-300">-40°C ~ +85°C (극한 옥외)</td>
                            <td className="p-3 text-slate-300">-20°C ~ +60°C (팬리스)</td>
                            <td className="p-3 text-slate-300">-30°C ~ +75°C</td>
                          </tr>
                          <tr className="hover:bg-slate-800/40">
                            <td className="p-3 font-sans font-bold text-slate-300">방열 및 기구 폼팩터</td>
                            <td className="p-3 font-sans text-slate-300">24.5mm 보드 레벨 초소형</td>
                            <td className="p-3 font-sans text-slate-300">70×35mm 안테나 일체형 PCB</td>
                            <td className="p-3 font-sans text-slate-300">팬리스 알루미늄 다이캐스팅</td>
                            <td className="p-3 font-sans text-slate-300">35mm DIN-Rail 마운트 산업용</td>
                          </tr>
                          <tr className="hover:bg-slate-800/40">
                            <td className="p-3 font-sans font-bold text-sky-400">ALPR 시스템 핵심 기여</td>
                            <td className="p-3 font-sans text-slate-300 leading-relaxed">
                              시속 120km 고속 주행 시 롤링 셔터 왜곡 완전 제거로 OCR 정확도 99.2% 유지
                            </td>
                            <td className="p-3 font-sans text-slate-300 leading-relaxed">
                              폭우·안개 속에서도 차량 검지 누락 방지 및 카메라 24시간 레코딩 부하 제거
                            </td>
                            <td className="p-3 font-sans text-slate-300 leading-relaxed">
                              클라우드 전송 없이 현장에서 25ms 내 번호판 탐지·인식 및 차단기 즉시 개방
                            </td>
                            <td className="p-3 font-sans text-slate-300 leading-relaxed">
                              야간 500µs 초고속 셔터 구동을 위한 300% 순간 오버드라이브 발광 및 서지 격리
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  /* Single Selected Component Full Spec Sheet */
                  (() => {
                    const activeComp = HARDWARE_COMPONENTS.find(c => c.id === modalActiveTab) || selectedComponent;
                    const CompIcon = activeComp.icon;

                    return (
                      <div className="space-y-6">
                        {/* Component Overview Banner */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
                          <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
                              <CompIcon className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="text-[11px] font-semibold text-slate-400">{activeComp.category}</div>
                              <h4 className="text-lg font-black text-white">{activeComp.title}</h4>
                              <div className="text-xs font-mono text-sky-400 font-bold">{activeComp.model}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-mono px-2.5 py-1 rounded border font-bold ${activeComp.tagClass}`}>
                              {activeComp.tag}
                            </span>
                            {activeComp.officialUrl && (
                              <a
                                href={activeComp.officialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-lg shadow transition-all"
                              >
                                <span>공식 웹페이지</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>

                        {/* 4 Core Summary Stat Boxes */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                            <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-1 font-medium">
                              <Gauge className="w-3.5 h-3.5 text-sky-400" />
                              <span>{activeComp.quickSummary.resolutionOrFreq.label}</span>
                            </span>
                            <strong className="text-white font-mono text-xs block leading-snug">
                              {activeComp.quickSummary.resolutionOrFreq.value}
                            </strong>
                          </div>

                          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40">
                            <span className="text-[11px] text-amber-400 flex items-center gap-1 mb-1 font-medium">
                              <Power className="w-3.5 h-3.5 text-amber-400" />
                              <span>{activeComp.quickSummary.powerReq.label}</span>
                            </span>
                            <strong className="text-amber-200 font-mono text-xs block leading-snug">
                              {activeComp.quickSummary.powerReq.value}
                            </strong>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                            <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-1 font-medium">
                              <Cable className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{activeComp.quickSummary.interfacePort.label}</span>
                            </span>
                            <strong className="text-emerald-300 font-mono text-xs block leading-snug">
                              {activeComp.quickSummary.interfacePort.value}
                            </strong>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                            <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-1 font-medium">
                              <Thermometer className="w-3.5 h-3.5 text-indigo-400" />
                              <span>{activeComp.quickSummary.operatingEnv.label}</span>
                            </span>
                            <strong className="text-indigo-200 font-mono text-xs block leading-snug">
                              {activeComp.quickSummary.operatingEnv.value}
                            </strong>
                          </div>
                        </div>

                        {/* Detailed Specs Table */}
                        <div>
                          <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                            <Sliders className="w-3.5 h-3.5 text-sky-400" />
                            <span>전체 기술 세부 사양 (Full Datasheet)</span>
                          </h5>
                          <div className="bg-slate-950/90 rounded-xl border border-slate-800 divide-y divide-slate-800/80 overflow-hidden text-xs">
                            {activeComp.specs.map((item, idx) => (
                              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 sm:px-4 hover:bg-slate-800/30 transition-colors">
                                <span className="text-slate-400 font-medium sm:w-1/3">{item.label}</span>
                                <strong className="text-slate-100 font-mono sm:w-2/3 sm:text-right mt-0.5 sm:mt-0 break-words">
                                  {item.value}
                                </strong>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Interface Wiring Pinout */}
                        <div>
                          <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                            <Cable className="w-3.5 h-3.5 text-amber-400" />
                            <span>물리 인터페이스 & 배선 핀아웃 규격</span>
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {activeComp.interfaceWiring.map((wire, idx) => (
                              <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-mono">
                                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 mb-1.5">
                                  <span className="text-amber-300 font-bold">{wire.port}</span>
                                  <span className="text-slate-400 text-[10px]">연결: {wire.target}</span>
                                </div>
                                <div className="text-[11px] text-slate-300 flex items-center justify-between">
                                  <span className="text-slate-400 font-sans">프로토콜:</span>
                                  <span className="text-sky-300 font-semibold">{wire.protocol}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-sans mt-1">
                                  {wire.purpose}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* ALPR System Significance */}
                        <div className="p-4 rounded-xl bg-sky-950/40 border border-sky-800/50">
                          <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5 mb-1">
                            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                            <span>ALPR 시스템 인식률 및 실무 최적화 기여도</span>
                          </span>
                          <p className="text-xs text-slate-200 leading-relaxed">
                            {activeComp.alprImpact}
                          </p>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 px-6 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shrink-0">
                <div className="text-slate-400 text-[11px] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>산업용 무정전 24시간 가동 기준 (CE, FCC, RoHS, NDAA 준수)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSpecModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors self-end sm:self-auto"
                >
                  닫기 (ESC)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
