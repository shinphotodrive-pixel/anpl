import React, { useState } from 'react';
import {
  ArrowUpRight,
  Cable,
  Cpu,
  Layers,
  Zap,
  Clock,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  Download,
  Sliders,
  Sparkles,
  Info,
  Radio,
  Server,
  Activity,
  AlertTriangle,
  ArrowRight,
  Maximize2,
  X,
  FileText,
  Search,
  Check,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export interface PinoutItem {
  pin: string;
  name: string;
  type: string;
  description: string;
}

export interface InterfaceSpec {
  id: 'mipi' | 'usb' | 'gmsl' | 'gige';
  name: string;
  fullName: string;
  standard: string;
  bandwidth: string;
  bandwidthValueGbps: number;
  distance: string;
  distanceMeters: number;
  power: string;
  latency: string;
  latencyMs: number;
  keyFeaturesAndApplications: string;
  color: string;
  badgeBg: string;
  borderColor: string;
  architecture: {
    phyLayer: string;
    protocol: string;
    connector: string;
    hostProcessor: string;
    pros: string[];
    cons: string[];
    bestUseCases: string[];
  };
  electricalSpecs: {
    differentialImpedance: string;
    signalSwing: string;
    maxJitter: string;
    cableType: string;
    powerConsumption: string;
  };
  pinout: PinoutItem[];
  connectorPartNumbers: {
    cameraSide: string;
    hostSide: string;
    cablePart: string;
  };
  troubleshootingTips: string[];
}

export const INTERFACE_SPECS: InterfaceSpec[] = [
  {
    id: 'mipi',
    name: 'MIPI CSI-2 (4-Lane)',
    fullName: 'Mobile Industry Processor Interface - Camera Serial Interface 2',
    standard: 'MIPI Alliance D-PHY v2.0 / C-PHY v1.2',
    bandwidth: '최대 10 Gbps (2.5 Gbps/lane)',
    bandwidthValueGbps: 10.0,
    distance: '< 30 cm',
    distanceMeters: 0.3,
    power: '미지원 (캐리어 보드 공유)',
    latency: '< 1 ms (최저 지연)',
    latencyMs: 0.8,
    keyFeaturesAndApplications: '호스트 프로세서(NVIDIA Jetson) 직결 초저지연 임베디드 로봇',
    color: 'text-rose-400',
    badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    borderColor: 'border-rose-500/40',
    architecture: {
      phyLayer: 'D-PHY (차동 신호 라인 클록 1쌍 + 데이터 4쌍)',
      protocol: 'CSI-2 패킷 패킷화 (RAW8, RAW10, RAW12, YUV422)',
      connector: '15-pin / 22-pin FPC (플랫 리본 케이블) 또는 Micro-Coax',
      hostProcessor: 'NVIDIA Jetson AGX Orin / Xavier, NXP i.MX8, Raspberry Pi SoC',
      pros: [
        '별도의 프로토콜 변환 브리지 없이 SoC ISP 엔진으로 DMA 직결 전송',
        '시스템 레이턴시 1ms 미만의 실시간 극저지연 및 제로 CPU 오버헤드',
        '초경량·초소형 임베디드 폼팩터 및 최저 소비 전력'
      ],
      cons: [
        'FPC 리본 케이블 전송 거리가 최대 20~30cm로 극도로 제한됨',
        '모터나 인버터 등 산업용 EMI(전자파 간섭) 노이즈에 매우 취약',
        '보드 설계 시 정밀 임피던스 매칭(100Ω 차동) 배선 설계 필수'
      ],
      bestUseCases: [
        '자율주행 모바일 로봇(AMR) 내부 탑재형 온보드 비전',
        '초소형 드론 짐벌 카메라 및 엣지 AI 추론 박스',
        '휴대형 번호판 단속 PDA 및 스마트 글래스'
      ]
    },
    electricalSpecs: {
      differentialImpedance: '100 Ω ± 10% (High-Speed 차동 신호)',
      signalSwing: 'HS: 140~270 mV (차동) / LP: 1.2V 단일 신호',
      maxJitter: '< 0.3 UI (Unit Interval at 2.5 Gbps)',
      cableType: '차폐 FPC (Shielded Flexible Flat Cable) 또는 Micro-Coaxial 케이블',
      powerConsumption: '0.15 W ~ 0.3 W (초저전력 전송단)'
    },
    pinout: [
      { pin: '1~2', name: 'GND', type: 'Ground', description: '차동 신호 귀환 경로 접지' },
      { pin: '3~4', name: 'CAM_D0_P / N', type: 'Diff Data', description: 'Lane 0 고속 비디오 데이터 차동쌍 (2.5 Gbps)' },
      { pin: '5~6', name: 'CAM_D1_P / N', type: 'Diff Data', description: 'Lane 1 고속 비디오 데이터 차동쌍 (2.5 Gbps)' },
      { pin: '7~8', name: 'CAM_CLK_P / N', type: 'Diff Clock', description: 'D-PHY 동기화 고속 클록 차동쌍 (1.25 GHz DDR)' },
      { pin: '9~10', name: 'CAM_D2_P / N', type: 'Diff Data', description: 'Lane 2 고속 비디오 데이터 차동쌍' },
      { pin: '11~12', name: 'CAM_D3_P / N', type: 'Diff Data', description: 'Lane 3 고속 비디오 데이터 차동쌍' },
      { pin: '13~14', name: 'I2C_SCL / SDA', type: 'Control', description: '카메라 센서 레지스터 제어 (Fast-mode Plus 1MHz)' },
      { pin: '15', name: 'CAM_PWDN / RST', type: 'GPIO', description: '센서 하드웨어 전원 차단 및 리셋 제어' }
    ],
    connectorPartNumbers: {
      cameraSide: 'Hirose DF40C-30DP-0.4V(51) 또는 Molex 503480-1500 (0.5mm 피치)',
      hostSide: 'NVIDIA Jetson 260-pin SODIMM 또는 Samtec QSH/QTH 시리즈',
      cablePart: 'Custom Shielded FPC 0.5mm Pitch with EMI Silver Film'
    },
    troubleshootingTips: [
      '길이 30cm 초과 시 고속 클록 지터로 인한 MIPI 패킷 CRC 에러 발생 → SerDes(GMSL/FPD-Link) 변환 적용 필수',
      'FPC 케이블 절곡 시 최소 곡률 반경(R > 2.0mm) 유지하여 차동 임피던스 불연속 방지',
      'I2C 풀업 저항값(1.8kΩ~2.2kΩ) 확인: 상승 시간이 300ns 초과할 경우 카메라 부팅 인식 실패'
    ]
  },
  {
    id: 'usb',
    name: 'USB 3.0 / 3.1 Gen1',
    fullName: 'Universal Serial Bus 3.0 SuperSpeed (UVC)',
    standard: 'USB-IF USB 3.2 Gen 1x1 / UVC 1.5 Specification',
    bandwidth: '5 Gbps ~ 10 Gbps',
    bandwidthValueGbps: 5.0,
    distance: '3m ~ 5m',
    distanceMeters: 5.0,
    power: 'USB VBUS (5V, 900mA)',
    latency: '2 ~ 5 ms (UVC 스택)',
    latencyMs: 3.5,
    keyFeaturesAndApplications: 'UVC 플러그 앤 플레이, PC 기반 비전 검사기, 빠른 알고리즘 검증',
    color: 'text-sky-400',
    badgeBg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    borderColor: 'border-sky-500/40',
    architecture: {
      phyLayer: 'USB 3.0 SuperSpeed 차동 차폐 트위스트 페어 (STP)',
      protocol: 'USB Video Class (UVC) Bulk / Isochronous 스트리밍',
      connector: 'USB Type-A, Micro-B with Screw Lock, USB Type-C',
      hostProcessor: '범용 x86-64 산업용 PC (Intel/AMD), 일반 윈도우/리눅스 PC',
      pros: [
        '드라이버 설치가 불필요한 표준 UVC(Plug & Play) 완벽 호환',
        '단일 케이블로 비디오 스트림 전송과 5V 900mA 전원 공급 동시 해결',
        '기존 PC 및 노트북에서 손쉽게 비전 알고리즘 프로토타이핑 가능'
      ],
      cons: [
        '케이블 길이가 3m(패시브) ~ 5m로 제한 (초과 시 액티브 리피터 필수)',
        '스크류 락이 없을 경우 산업 현장 진동에 의해 커넥터 접촉 불량 위험',
        'OS 커널 UVC 소프트웨어 드라이버 스택 경유로 2~5ms 레이턴시 발생'
      ],
      bestUseCases: [
        '스마트 팩토리 컨베이어 벨트 부품 외관 검사 머신비전',
        '주차장 차량 번호판 인식(LPR) 차단기 연동 카메라',
        '연구실 및 연구개발팀의 신속한 딥러닝 비전 알고리즘 검증'
      ]
    },
    electricalSpecs: {
      differentialImpedance: '90 Ω ± 7% (SuperSpeed 차동 신호 라인)',
      signalSwing: 'SuperSpeed: 800~1200 mV (P-P 차동) / USB 2.0 D+/D-: 400 mV',
      maxJitter: '< 0.28 UI (5.0 Gbps 기준 총 지터)',
      cableType: '산업용 내굴곡(High-Flex) 차폐 트위스트 페어 케이블 (AWG 28/24)',
      powerConsumption: '5V @ 900mA (최대 4.5W VBUS 버스 파워)'
    },
    pinout: [
      { pin: 'Pin 1', name: 'VBUS (+5V)', type: 'Power', description: '최대 900mA 전원 공급 (USB 3.0 사양)' },
      { pin: 'Pin 2~3', name: 'USB D- / D+', type: 'Diff USB 2.0', description: '하위 호환 및 제어/디스크립터 열거 신호' },
      { pin: 'Pin 4', name: 'GND', type: 'Ground', description: '전원 및 공통 접지' },
      { pin: 'Pin 5~6', name: 'StdA_SSRX- / SSRX+', type: 'Diff SuperSpeed', description: '호스트 수신 고속 데이터 스트림 차동쌍' },
      { pin: 'Pin 7', name: 'GND_DRAIN', type: 'Shield Ground', description: '드레인 와이어 EMI 차폐 접지' },
      { pin: 'Pin 8~9', name: 'StdA_SSTX- / SSTX+', type: 'Diff SuperSpeed', description: '호스트 송신 고속 제어 차동쌍' }
    ],
    connectorPartNumbers: {
      cameraSide: 'USB 3.0 Micro-B Female with Dual M2 Screw Locks 또는 USB Type-C Dual-Lock',
      hostSide: 'Standard Industrial PC USB 3.0 Type-A 또는 PCIe xHCI 확장 카드',
      cablePart: 'Igus Chainflex CF.BUS.042 또는 Newnex Industrial Locking USB 3.0 Cable'
    },
    troubleshootingTips: [
      '5m 이상 케이블 사용 시 USB 패킷 드롭 및 장치 디스커넥트 발생 → 광학 액티브 케이블(AOC) 적용',
      'PC 후면 메인보드 직결 포트 권장: 전면 패널 연장선 사용 시 신호 감쇠로 USB 2.0 강제 다운그레이드 위험',
      '스크류 락(Screw Lock) 고정 단자를 사용하여 산업 현장 설비 진동에 의한 순간 접촉 불량 예방'
    ]
  },
  {
    id: 'gmsl',
    name: 'GMSL2 (SerDes)',
    fullName: 'Gigabit Multimedia Serial Link 2 (Maxim / Analog Devices)',
    standard: 'Automotive SerDes Alliance (ASA) / GMSL2 Protocol',
    bandwidth: '6 Gbps (단방향 동축)',
    bandwidthValueGbps: 6.0,
    distance: '최대 15 m',
    distanceMeters: 15.0,
    power: '지원 (Power over Coax)',
    latency: '< 2 ms (직렬화 회로)',
    latencyMs: 1.8,
    keyFeaturesAndApplications: '차량 ADAS, 옥외 AMR, 내진동 FAKRA 전장 커넥터, 다채널 카메라 동기화',
    color: 'text-purple-400',
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    borderColor: 'border-purple-500/40',
    architecture: {
      phyLayer: '단일 동축 케이블 (Coaxial 50Ω) 기가비트 SerDes 직렬화',
      protocol: 'GMSL2 프레임 패킷화 + 양방향 제어 채널 (I2C/UART/GPIO)',
      connector: '차량용 FAKRA / Mini-FAKRA (Rosenberger HFM) 내진동 방수 잠금형',
      hostProcessor: 'NVIDIA DRIVE Orin, Jetson GMSL Deserializer 보드, TI TDA4x',
      pros: [
        '단 1가닥의 얇은 동축 케이블로 초고화질 비디오, I2C 제어, PoC 전원 동시 전송',
        '최대 15m의 넉넉한 전송 거리와 차량용 전장 EMC/EMI 완벽 통과',
        '하드웨어 레벨 프레임 동기화(Frame Sync)로 다채널 서라운드 뷰 오차 1us 미만 제어'
      ],
      cons: [
        '카메라에 Serializer 칩, 호스트에 Deserializer 칩셋이 필수 탑재되어 단가 상승',
        '일반 PC에는 직결이 불가능하며 전용 디시리얼라이저 캐리어 보드 필요',
        '특수 전장용 케이블 및 커넥터 전용 툴체인 요구'
      ],
      bestUseCases: [
        '고속도로 자율주행 차량 ADAS 및 서라운드 뷰 모니터링 (SVM)',
        '도로교통공단 과속/신호위반 단속 차량 탑재형 다채널 카메라',
        '옥외 가혹 환경(진동, 우천, 극저온) 자율주행 중장비 및 농기계'
      ]
    },
    electricalSpecs: {
      differentialImpedance: '50 Ω 단일 종단 동축 (Single-Ended Coax 50Ω)',
      signalSwing: '고속 포워드 채널: 400 mV ~ 800 mV (PAM4 / NRZ 변조)',
      maxJitter: '< 0.15 UI (전장용 고신뢰성 SerDes 클록)',
      cableType: 'RG-174 / RTK-031 차량용 이중 차폐 동축 케이블 (Max 15m)',
      powerConsumption: '카메라 단 0.8W (MAX9295 Serializer 칩셋 포함)'
    },
    pinout: [
      { pin: 'Center Conductor', name: 'SERIAL_DATA + PoC_DC', type: 'RF + DC Power', description: '6Gbps 고속 비디오 데이터 + 12V/24V PoC 전원 중첩' },
      { pin: 'Inner Shield', name: 'GND_SHIELD', type: 'RF Ground', description: '50Ω 특성 임피던스 차폐 외피' },
      { pin: 'Back-Channel', name: 'UART / I2C / GPIO', type: 'Bidirectional Control', description: '센서 레지스터 제어 및 FSYNC 동기화 펄스 반송' }
    ],
    connectorPartNumbers: {
      cameraSide: 'Rosenberger FAKRA Code-Z (Water Blue) 또는 Mini-FAKRA HFM Male',
      hostSide: 'NVIDIA GMSL2 8-Channel Deserializer Board (MAX96712)',
      cablePart: 'Amphenol / Rosenberger Automotive RTK-031 50Ω Coaxial Cable Assembly'
    },
    troubleshootingTips: [
      'PoC 인덕터(Choke Inductor) 사양 확인: 고속 RF 신호가 DC 전원 공급단으로 누설되지 않도록 47µH SRF 고주파 특성 준수',
      '차량 진동 시 FAKRA 클립의 물리적 결합 찰칵(Click) 소리 확인 (오결합 시 간헐적 비트 에러 발생)',
      '다채널 카메라 시리얼 번호 매핑: 호스트 MAX96712 Deserializer의 I2C Alias 어드레스 충돌 방지 설정'
    ]
  },
  {
    id: 'gige',
    name: 'GigE / 10GigE',
    fullName: 'Gigabit Ethernet Vision (AIA GigE Vision Standard)',
    standard: 'AIA GigE Vision 2.1 / IEEE 802.3ab (1G), 802.3an (10G)',
    bandwidth: '1 Gbps (GigE) / 10 Gbps (10G)',
    bandwidthValueGbps: 10.0,
    distance: '100 m 이상 (Cat6/Cat6e)',
    distanceMeters: 100.0,
    power: '지원 (Power over Ethernet)',
    latency: '5 ~ 15 ms (네트워크 패킷화)',
    latencyMs: 8.0,
    keyFeaturesAndApplications: '공장 전역 컨베이어 감시, 인더스트리 4.0 분산 비전, 초장거리 비압축 전송',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    borderColor: 'border-amber-500/40',
    architecture: {
      phyLayer: '1000BASE-T / 10GBASE-T 트위스트 페어 UTP/STP 이더넷',
      protocol: 'GigE Vision Stream Protocol (GVSP / UDP/IP) + GenICam',
      connector: 'RJ45 with Horizontal/Vertical Screw Locks 또는 M12 X-Coded',
      hostProcessor: '이더넷 NIC 카드를 탑재한 모든 표준 서버, NVR, 산업용 워크스테이션',
      pros: [
        '리피터 없이 표준 Cat6 이더넷 케이블로 100m 초장거리 무손실 전송 가능',
        'PoE (Power over Ethernet) 지원으로 별도 전원 배선 없이 원거리 설치 간소화',
        '네트워크 스위치 허브를 통한 수십~수백 대 카메라의 분산 토폴로지 구축'
      ],
      cons: [
        '네트워크 패킷 분할 및 소켓 버퍼링으로 인해 5~15ms의 레이턴시 발생',
        '호스트 PC CPU가 네트워크 UDP 패킷 재조립 처리에 CPU 자원을 소모 (점보 프레임 필수)',
        '표준 GigE(1 Gbps)의 경우 고해상도 고프레임 전송 시 대역폭 병목 (10GigE 검토 필요)'
      ],
      bestUseCases: [
        '대규모 물류 센터 컨베이어 라인 및 컨테이너 번호판/바코드 인식',
        '스마트 시티 교차로 다지점 방범 및 ITS 광역 교통 모니터링',
        '철도 선로 및 터널 구조물 원거리 안전 정밀 진단'
      ]
    },
    electricalSpecs: {
      differentialImpedance: '100 Ω 차동 (Cat6 4쌍 트위스트 페어)',
      signalSwing: 'PAM-5 5레벨 신호 (1000BASE-T) / ±1.0V 차동 전압',
      maxJitter: 'IEEE 802.3ab 표준 규격 준수 (< 1.4 ns)',
      cableType: 'Cat6 / Cat6A 산업용 이중 차폐 STP 케이블 (S/FTP 차폐)',
      powerConsumption: 'PoE 48V 공급 (IEEE 802.3af Class 2/3, 약 5~10W)'
    },
    pinout: [
      { pin: 'Pin 1~2', name: 'BI_DA+ / BI_DA-', type: 'Diff Pair A', description: '기가비트 양방향 데이터 트위스트 페어 1 + PoE V+' },
      { pin: 'Pin 3~6', name: 'BI_DB+ / BI_DB-', type: 'Diff Pair B', description: '기가비트 양방향 데이터 트위스트 페어 2 + PoE V-' },
      { pin: 'Pin 4~5', name: 'BI_DC+ / BI_DC-', type: 'Diff Pair C', description: '기가비트 양방향 데이터 트위스트 페어 3' },
      { pin: 'Pin 7~8', name: 'BI_DD+ / BI_DD-', type: 'Diff Pair D', description: '기가비트 양방향 데이터 트위스트 페어 4' }
    ],
    connectorPartNumbers: {
      cameraSide: 'Amphenol RJ45 with Dual Screw Lock 또는 Phoenix Contact M12 X-Coded 8-pin IP67',
      hostSide: 'Intel I350-T4 Quad-port GigE NIC 또는 10GBASE-T X550 NIC',
      cablePart: 'Harting Industrial Cat6A Dual-Shielded Patch Cable with M12/RJ45'
    },
    troubleshootingTips: [
      'NIC 카드에서 점보 프레임(Jumbo Frames MTU 9000 bytes) 설정 필수 (기본 1500 설정 시 CPU 점유율 급증 및 프레임 드롭 발생)',
      '네트워크 스위치 통과 시 비관리형 허브 금지: IGMP 스누핑 및 QoS 지원 관리형 스위치 사용 권장',
      'PoE 전원 공급 시 전력 예산(Power Budget) 계산: 장거리 전압 강하를 고려하여 포트당 최소 15.4W 여유 확보'
    ]
  }
];

// Detailed descriptions for wizard buttons
const WIZARD_DISTANCE_DETAILS: Record<string, { title: string; desc: string; cable: string; limit: string }> = {
  short: {
    title: '30cm 이하 (보드 내부 직결)',
    desc: 'SoC 캐리어 보드와 센서가 동일 섀시 내에 위치하는 형태입니다. D-PHY 차동 신호가 FPC 리본 케이블로 직결되어 드라이버 오버헤드 없이 제로 레이턴시 DMA 전송을 달성합니다.',
    cable: '15/22-pin Shielded FPC (최소 곡률 반경 R > 2mm)',
    limit: '길이 30cm 초과 시 클록 지터 및 신호 감쇠로 패킷 CRC 에러 급증'
  },
  mid: {
    title: '3m ~ 5m (PC 옆 거치형)',
    desc: '산업용 PC 또는 워크스테이션 인근에 카메라를 브래킷으로 거치하는 가장 일반적인 검사기 구성입니다. 표준 USB 3.0 케이블로 비디오 스트림과 5V 900mA 전원을 단일 케이블로 전송합니다.',
    cable: 'USB 3.0 SuperSpeed High-Flex STP (AWG 28/24 with M2 Screw Lock)',
    limit: '5m 초과 시 신호 무결성 저하로 USB 2.0으로 강제 다운그레이드됨'
  },
  automotive: {
    title: '5m ~ 15m (차량 전장 / 로봇 섀시)',
    desc: '차량 엔진룸, 범퍼, 루프랙 등 가혹한 전자파(EMI) 노이즈와 고진동 환경을 통과하는 구조입니다. 동축 케이블 1가닥으로 초고화질 영상과 12V/24V PoC 전원을 직렬화 전송합니다.',
    cable: '차량용 50Ω RTK-031 / RG-174 Coaxial with FAKRA/Mini-FAKRA',
    limit: '일반 PC에는 직결 불가하며 전용 Deserializer 보드(MAX96712 등) 필요'
  },
  long: {
    title: '100m 이상 (공장 전역 네트워크)',
    desc: '물류 센터 컨베이어 라인, 스마트 교차로 등 넓은 건물 전역에 카메라를 분산 배치하는 토폴로지입니다. 리피터 없이 표준 Cat6 이더넷 케이블로 장거리 전송하며 PoE로 전원을 일괄 공급합니다.',
    cable: 'Cat6 / Cat6A S/FTP 이중 차폐 이더넷 케이블 with M12 X-Code',
    limit: 'UDP 패킷화 및 소켓 스택 경유로 5~15ms의 레이턴시 및 점보 프레임 설정 필수'
  }
};

const WIZARD_LATENCY_DETAILS: Record<string, { title: string; desc: string; buffer: string; impact: string }> = {
  ultra: {
    title: '< 1 ms (실시간 극저지연)',
    desc: '카메라 센서의 픽셀 출력이 호스트 SoC의 GPU/NVDLA 메모리로 직접 DMA 전송(Zero-copy)됩니다. 운영체제 커널의 소프트웨어 버퍼링을 거치지 않아 시스템 지연이 1ms 미만으로 제한됩니다.',
    buffer: '하드웨어 ISP 링 버퍼 직결 (OS 스택 경유 제로)',
    impact: '100km/h 이상 고속 주행 차량의 번호판 모션 블러 없는 찰나의 캡처에 필수'
  },
  normal: {
    title: '2 ~ 5 ms (표준 머신비전)',
    desc: 'USB UVC 스택 또는 SerDes 프레임 그래버 드라이버를 통해 프레임이 전달됩니다. 1~2 프레임 분량의 커널 링 버퍼가 형성되며 표준 실시간 제어에 충분한 성능을 제공합니다.',
    buffer: 'OS UVC 커널 큐 버퍼 (1~2 프레임 드라이버 지연)',
    impact: '주차장 차단기 연동, 부품 외관 불량 검출, 스마트 톨게이트 표준'
  },
  network: {
    title: '5 ~ 15 ms (원거리 모니터링 허용)',
    desc: 'GigE Vision GVSP 프로토콜에 의해 비디오가 수천 개의 UDP 패킷으로 분할되어 전송됩니다. 스위칭 허브 큐잉과 소켓 버퍼링으로 인해 5~15ms의 지연이 발생하나 대규모 분산 처리가 가능합니다.',
    buffer: '이더넷 NIC 소켓 링 버퍼 및 UDP 재조립 버퍼',
    impact: '광역 CCTV 통합 관제, 컨베이어 물류 추적, 교통 관제 센터 저장'
  }
};

const WIZARD_HOST_DETAILS: Record<string, { title: string; desc: string; pcie: string; driver: string }> = {
  jetson: {
    title: 'NVIDIA Jetson / 라즈베리파이 SoC',
    desc: '저전력 임베디드 AI 플랫폼으로 D-PHY CSI-2 하드웨어 수신단과 Deep Learning 가속기(TensorRT)가 내장되어 있습니다. MIPI 직결 또는 GMSL SerDes 모듈과 최적의 성능을 냅니다.',
    pcie: '온칩 CSI-2 리시버 + NVENC 하드웨어 인코더',
    driver: 'V4L2 (Video4Linux2) 커널 드라이버 및 JetPack ISP 파이프라인'
  },
  pc: {
    title: '표준 산업용 PC / 윈도우 워크스테이션',
    desc: 'Intel/AMD x86-64 CPU와 전용 외장 GPU를 탑재한 범용 머신비전 플랫폼입니다. USB 3.0 포트가 기본 탑재되어 드라이버 개발 없이 플러그 앤 플레이로 즉시 프로토타이핑이 가능합니다.',
    pcie: 'xHCI USB 3.0/3.1 컨트롤러 또는 PCIe Gen3/Gen4 확장 슬롯',
    driver: '표준 Microsoft UVC 드라이버 / DirectShow / OpenCV 호환'
  },
  server: {
    title: '중앙 VMS 서버 / 클라우드 랙마운트',
    desc: '다채널 고용량 비디오 저장을 위한 랙마운트 엔터프라이즈 서버입니다. 멀티포트 이더넷 NIC 카드와 대규모 RAID 스토리지 어레이가 구축되어 GigE/10GigE 네트워크 카메라 수십 대를 동시 수용합니다.',
    pcie: '10Gbps SFP+ / 10GBASE-T 멀티채널 NIC 카드',
    driver: 'AIA GigE Vision 드라이버 (eBUS / Pleora SDK) 및 RTSP/ONVIF'
  }
};

export const CameraInterfaceSection: React.FC = () => {
  const [selectedInterfaceId, setSelectedInterfaceId] = useState<'mipi' | 'usb' | 'gmsl' | 'gige'>('mipi');
  
  // Wizard States
  const [wizardDistance, setWizardDistance] = useState<'short' | 'mid' | 'automotive' | 'long'>('mid');
  const [wizardLatency, setWizardLatency] = useState<'ultra' | 'normal' | 'network'>('normal');
  const [wizardHost, setWizardHost] = useState<'jetson' | 'pc' | 'server'>('pc');

  // Detail Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalTab, setModalTab] = useState<'arch' | 'pinout' | 'connectors' | 'troubleshoot'>('arch');

  const activeSpec = INTERFACE_SPECS.find(item => item.id === selectedInterfaceId) || INTERFACE_SPECS[0];

  // Wizard Recommendation Engine
  const wizardRecommendation = React.useMemo(() => {
    if (wizardDistance === 'short' || wizardLatency === 'ultra' || wizardHost === 'jetson') {
      return INTERFACE_SPECS[0]; // MIPI
    }
    if (wizardDistance === 'automotive') {
      return INTERFACE_SPECS[2]; // GMSL2
    }
    if (wizardDistance === 'long' || wizardHost === 'server') {
      return INTERFACE_SPECS[3]; // GigE
    }
    return INTERFACE_SPECS[1]; // USB 3.0
  }, [wizardDistance, wizardLatency, wizardHost]);

  // Export CSV Report
  const exportCsv = () => {
    const headers = ['인터페이스', '최대 대역폭', '전송 거리', '전원 공급', '시스템 지연(Latency)', '주요 특징 및 최적 적용 분야'];
    const rows = INTERFACE_SPECS.map(s => [
      `"${s.name}"`,
      `"${s.bandwidth}"`,
      `"${s.distance}"`,
      `"${s.power}"`,
      `"${s.latency}"`,
      `"${s.keyFeaturesAndApplications}"`
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Camera_Interface_Comparison.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* 1. Header Section */}
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
          <Cable className="w-3.5 h-3.5" />
          <span>Camera Hardware Interface & Physical Layer Comparison</span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              카메라 인터페이스 규격 가이드
            </h1>
            <p className="text-slate-400 text-base sm:text-lg max-w-3xl mt-2 leading-relaxed">
              임베디드 비전부터 자율주행 전장, 산업용 PC, 장거리 공장 네트워크까지 
              <strong> 4대 주요 카메라 인터페이스(MIPI CSI-2, USB 3.0, GMSL2, GigE)</strong>의 
              대역폭, 전송 거리, 전원 공급 방식 및 물리 계층 레이턴시를 정밀 비교합니다.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setModalTab('arch');
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all text-xs font-bold shadow-lg shadow-indigo-600/30"
            >
              <Maximize2 className="w-4 h-4" />
              <span>전체 엔지니어링 세부 모달 열기</span>
            </button>
            <button
              onClick={exportCsv}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all text-xs font-semibold shadow-md"
            >
              <Download className="w-4 h-4 text-indigo-400" />
              <span>CSV 내보내기</span>
            </button>
          </div>
        </div>

        {/* 4 Major Interfaces Quick Badges / Buttons */}
        <div className="space-y-2 pt-2">
          <div className="text-xs font-bold text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>인터페이스 선택 버튼 (클릭 시 하단에 세부 공학 사양이 즉시 연동 표시됩니다)</span>
            </span>
            <span className="text-[11px] text-indigo-400 font-mono">선택됨: {activeSpec.name}</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {INTERFACE_SPECS.map((spec) => {
              const isSelected = selectedInterfaceId === spec.id;
              return (
                <button
                  key={spec.id}
                  onClick={() => setSelectedInterfaceId(spec.id)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-left relative overflow-hidden group ${
                    isSelected
                      ? `${spec.borderColor} bg-slate-800/95 ring-4 ring-indigo-500/30 scale-[1.02] shadow-xl`
                      : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[9px] font-mono font-bold flex items-center gap-1">
                      <Check className="w-2.5 h-2.5" />
                      <span>활성 선택</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-white text-sm sm:text-base">
                      <ArrowUpRight className={`w-4 h-4 ${spec.color}`} />
                      <span>{spec.name}</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-1">{spec.fullName}</div>
                  <div className="mt-3 flex items-baseline justify-between text-xs font-mono">
                    <span className="text-amber-400 font-semibold">{spec.bandwidth.split(' ')[0]} {spec.bandwidth.split(' ')[1]}</span>
                    <span className="text-cyan-400">{spec.distance}</span>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400 group-hover:text-indigo-300">
                    <span>{spec.standard.split(' ')[0]} 규격</span>
                    <span className="flex items-center gap-1 font-bold text-indigo-400">
                      세부내용 보기 <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. The Core 4 Major Interfaces Comparison Table */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-slate-900 border-2 border-indigo-500/40 rounded-3xl overflow-hidden shadow-2xl">
          
          {/* Table Header Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/95 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>4대 주요 인터페이스 사양 정밀 비교표</span>
              </h2>
            </div>
            <div className="text-xs font-mono text-slate-400">
              물리적 계층 및 시스템 레이턴시
            </div>
          </div>

          {/* Table Body (Compact Rows) */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-950/90 text-slate-400 text-xs uppercase font-mono border-b border-slate-800">
                  <th className="py-2.5 px-4 font-bold whitespace-nowrap">인터페이스</th>
                  <th className="py-2.5 px-4 font-bold whitespace-nowrap">최대 대역폭</th>
                  <th className="py-2.5 px-4 font-bold whitespace-nowrap">전송 거리</th>
                  <th className="py-2.5 px-4 font-bold whitespace-nowrap">전원 공급</th>
                  <th className="py-2.5 px-4 font-bold whitespace-nowrap">시스템 지연 (Latency)</th>
                  <th className="py-2.5 px-4 font-bold">주요 특징 & 최적 적용 분야</th>
                  <th className="py-2.5 px-4 font-bold text-center whitespace-nowrap">세부 공학 액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 font-sans">
                {INTERFACE_SPECS.map((spec) => {
                  const isSelected = selectedInterfaceId === spec.id;
                  return (
                    <tr
                      key={spec.id}
                      onClick={() => setSelectedInterfaceId(spec.id)}
                      className={`transition-colors cursor-pointer group ${
                        isSelected ? 'bg-indigo-950/60 ring-1 ring-inset ring-indigo-500/50' : 'hover:bg-slate-800/50'
                      }`}
                    >
                      {/* Column 1: Interface Name with Diagonal Arrow Icon */}
                      <td className="py-2.5 px-4 font-bold text-white whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <ArrowUpRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className={`text-xs sm:text-sm font-semibold ${isSelected ? 'text-indigo-300 font-bold' : 'text-white'}`}>
                            {spec.name}
                          </span>
                        </div>
                      </td>

                      {/* Column 2: Max Bandwidth (Gold/Amber Text) */}
                      <td className="py-2.5 px-4 font-mono text-amber-400 font-semibold text-xs sm:text-sm whitespace-nowrap">
                        {spec.bandwidth}
                      </td>

                      {/* Column 3: Distance (Cyan Text) */}
                      <td className="py-2.5 px-4 font-mono text-cyan-400 font-medium text-xs sm:text-sm whitespace-nowrap">
                        {spec.distance}
                      </td>

                      {/* Column 4: Power Delivery */}
                      <td className="py-2.5 px-4 text-slate-300 text-xs sm:text-sm whitespace-nowrap">
                        {spec.power}
                      </td>

                      {/* Column 5: Latency (Emerald Text) */}
                      <td className="py-2.5 px-4 font-mono text-emerald-400 font-medium text-xs sm:text-sm whitespace-nowrap">
                        {spec.latency}
                      </td>

                      {/* Column 6: Key Features & Applications */}
                      <td className="py-2.5 px-4 text-slate-300 text-xs sm:text-sm leading-snug">
                        {spec.keyFeaturesAndApplications}
                      </td>

                      {/* Column 7: Dedicated Detail Button */}
                      <td className="py-2.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInterfaceId(spec.id);
                            setIsModalOpen(true);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 hover:border-slate-600'
                          }`}
                          title="정밀 핀맵 및 하드웨어 사양 팝업 열기"
                        >
                          세부 사양 확인
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="py-2.5 px-4 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <span>* 각 행 또는 버튼을 클릭하면 하단에서 해당 인터페이스의 물리 계층(PHY) 아키텍처 및 핀맵 세부 공학 사양을 확인하실 수 있습니다.</span>
            <span className="text-indigo-400 font-mono font-semibold">현재 선택: {activeSpec.name} ({activeSpec.standard})</span>
          </div>
        </div>
      </div>

      {/* 3. Deep Architectural Details of Selected Interface (Changes Live with Selection) */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-8 shadow-xl">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-700/80 pb-6">
            <div>
              <div className="flex items-center gap-3">
                <span className={`text-2xl sm:text-3xl font-black ${activeSpec.color}`}>
                  {activeSpec.name}
                </span>
                <span className={`text-xs font-mono px-3 py-1 rounded-full border ${activeSpec.badgeBg}`}>
                  {activeSpec.standard}
                </span>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>전체 화면 상세 모달</span>
                </button>
              </div>
              <p className="text-slate-300 text-sm mt-1">
                {activeSpec.fullName}
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-700">
                <div className="text-slate-400 text-[10px]">대역폭</div>
                <div className="text-amber-400 font-bold text-sm">{activeSpec.bandwidth.split(' ')[0]} {activeSpec.bandwidth.split(' ')[1]}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-700">
                <div className="text-slate-400 text-[10px]">전송거리</div>
                <div className="text-cyan-400 font-bold text-sm">{activeSpec.distance}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-700">
                <div className="text-slate-400 text-[10px]">레이턴시</div>
                <div className="text-emerald-400 font-bold text-sm">{activeSpec.latency.split(' ')[0]} {activeSpec.latency.split(' ')[1]}</div>
              </div>
            </div>
          </div>

          {/* 4 Architectural Spec Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-1">
              <div className="text-[11px] font-mono text-slate-400">물리 계층 (PHY Layer)</div>
              <div className="text-xs sm:text-sm font-bold text-white">{activeSpec.architecture.phyLayer}</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-1">
              <div className="text-[11px] font-mono text-slate-400">데이터 프로토콜 규격</div>
              <div className="text-xs sm:text-sm font-bold text-sky-400">{activeSpec.architecture.protocol}</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-1">
              <div className="text-[11px] font-mono text-slate-400">표준 하드웨어 커넥터</div>
              <div className="text-xs sm:text-sm font-bold text-amber-400">{activeSpec.architecture.connector}</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-1">
              <div className="text-[11px] font-mono text-slate-400">호스트 프로세서 및 칩셋</div>
              <div className="text-xs sm:text-sm font-bold text-purple-400">{activeSpec.architecture.hostProcessor}</div>
            </div>
          </div>

          {/* Electrical Physical Layer Specifications Bar */}
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30">
            <div className="text-xs font-bold text-indigo-400 mb-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>전기적 신호 물성 사양 (Electrical & Physical Specifications)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">차동 임피던스:</span>
                <span className="text-white font-mono font-semibold">{activeSpec.electricalSpecs.differentialImpedance}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">신호 진폭 (Swing):</span>
                <span className="text-amber-400 font-mono font-semibold">{activeSpec.electricalSpecs.signalSwing}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">최대 허용 지터:</span>
                <span className="text-cyan-400 font-mono font-semibold">{activeSpec.electricalSpecs.maxJitter}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">케이블 규격:</span>
                <span className="text-slate-200 font-mono font-semibold">{activeSpec.electricalSpecs.cableType}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">소비 전력 (PHY):</span>
                <span className="text-emerald-400 font-mono font-semibold">{activeSpec.electricalSpecs.powerConsumption}</span>
              </div>
            </div>
          </div>

          {/* Pros, Cons, and Use Cases 3-Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Pros */}
            <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>주요 공학적 장점 (Advantages)</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-200">
                {activeSpec.architecture.pros.map((pro, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>물리적 제약 및 고려사항 (Constraints)</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-200">
                {activeSpec.architecture.cons.map((con, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Best Use Cases */}
            <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>최적 실무 적용 분야 (Best Applications)</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-200">
                {activeSpec.architecture.bestUseCases.map((useCase, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">★</span>
                    <span>{useCase}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Quick Pinout & Wiring Preview */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                <Layers className="w-4 h-4" />
                <span>대표 하드웨어 핀맵 및 신호 할당 (Pinout & Signal Map)</span>
              </div>
              <button
                onClick={() => {
                  setModalTab('pinout');
                  setIsModalOpen(true);
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                전체 핀맵 크게 보기 <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <th className="py-1.5 px-3 font-mono">핀 번호</th>
                    <th className="py-1.5 px-3 font-mono">신호 명칭</th>
                    <th className="py-1.5 px-3 font-mono">신호 유형</th>
                    <th className="py-1.5 px-3">기능 및 공학 설명</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {activeSpec.pinout.slice(0, 4).map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="py-1.5 px-3 font-mono text-amber-400 font-semibold">{p.pin}</td>
                      <td className="py-1.5 px-3 font-mono text-cyan-400 font-bold">{p.name}</td>
                      <td className="py-1.5 px-3 text-slate-400">{p.type}</td>
                      <td className="py-1.5 px-3 text-slate-300">{p.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Interactive Interface Selection Wizard (With Instant Detail Content on Every Button Selection) */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          
          <div className="border-b border-slate-700/80 pb-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-lg">
              <Sliders className="w-5 h-5" />
              <span>내 프로젝트에 최적인 카메라 인터페이스 선정 마법사</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              아래의 <strong>모든 버튼을 클릭</strong>하면 해당 요구조건에 대한 구체적인 공학 세부 내용(케이블 물성, 대역폭 한계, 레이턴시 원리)이 즉시 표출됩니다.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Question 1: Transmission Distance */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>1. 카메라 ↔ 프로세서 전송 거리</span>
                <span className="text-[10px] text-amber-400 font-mono">선택됨: {WIZARD_DISTANCE_DETAILS[wizardDistance]?.title.split(' ')[0]}</span>
              </label>
              <div className="space-y-2">
                {[
                  { id: 'short', label: '30cm 이하 (보드 내부 직결)' },
                  { id: 'mid', label: '3m ~ 5m (PC 옆 거치)' },
                  { id: 'automotive', label: '5m ~ 15m (차량 전장/로봇 섀시)' },
                  { id: 'long', label: '100m 이상 (공장 전역 네트워크)' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setWizardDistance(opt.id as any)}
                    className={`w-full p-2.5 rounded-xl text-xs font-semibold text-left border transition-all flex items-center justify-between ${
                      wizardDistance === opt.id
                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md ring-2 ring-amber-400/30'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600 hover:bg-slate-800'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {wizardDistance === opt.id && <Check className="w-3.5 h-3.5 text-slate-950" />}
                  </button>
                ))}
              </div>

              {/* Instant Detail Box for Distance Button */}
              {WIZARD_DISTANCE_DETAILS[wizardDistance] && (
                <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1.5 animate-fadeIn">
                  <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    <span>{WIZARD_DISTANCE_DETAILS[wizardDistance].title} 세부 사양</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {WIZARD_DISTANCE_DETAILS[wizardDistance].desc}
                  </p>
                  <div className="pt-1.5 border-t border-amber-500/20 text-[10px] text-slate-400 space-y-0.5 font-mono">
                    <div><span className="text-amber-400 font-semibold">케이블:</span> {WIZARD_DISTANCE_DETAILS[wizardDistance].cable}</div>
                    <div><span className="text-rose-400 font-semibold">한계:</span> {WIZARD_DISTANCE_DETAILS[wizardDistance].limit}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Question 2: Latency Tolerance */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>2. 요구 레이턴시(지연 시간)</span>
                <span className="text-[10px] text-cyan-400 font-mono">선택됨: {WIZARD_LATENCY_DETAILS[wizardLatency]?.title.split(' ')[0]}</span>
              </label>
              <div className="space-y-2">
                {[
                  { id: 'ultra', label: '< 1 ms (실시간 제로 레이턴시)' },
                  { id: 'normal', label: '2 ~ 5 ms (표준 실시간 머신비전)' },
                  { id: 'network', label: '5 ~ 15 ms (원거리 모니터링 허용)' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setWizardLatency(opt.id as any)}
                    className={`w-full p-2.5 rounded-xl text-xs font-semibold text-left border transition-all flex items-center justify-between ${
                      wizardLatency === opt.id
                        ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md ring-2 ring-cyan-400/30'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600 hover:bg-slate-800'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {wizardLatency === opt.id && <Check className="w-3.5 h-3.5 text-slate-950" />}
                  </button>
                ))}
              </div>

              {/* Instant Detail Box for Latency Button */}
              {WIZARD_LATENCY_DETAILS[wizardLatency] && (
                <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-1.5 animate-fadeIn">
                  <div className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{WIZARD_LATENCY_DETAILS[wizardLatency].title} 세부 사양</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {WIZARD_LATENCY_DETAILS[wizardLatency].desc}
                  </p>
                  <div className="pt-1.5 border-t border-cyan-500/20 text-[10px] text-slate-400 space-y-0.5 font-mono">
                    <div><span className="text-cyan-400 font-semibold">버퍼링:</span> {WIZARD_LATENCY_DETAILS[wizardLatency].buffer}</div>
                    <div><span className="text-emerald-400 font-semibold">영향:</span> {WIZARD_LATENCY_DETAILS[wizardLatency].impact}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Question 3: Host Processor Platform */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>3. 호스트 시스템 프로세서</span>
                <span className="text-[10px] text-purple-400 font-mono">선택됨: {WIZARD_HOST_DETAILS[wizardHost]?.title.split(' ')[0]}</span>
              </label>
              <div className="space-y-2">
                {[
                  { id: 'jetson', label: 'NVIDIA Jetson / 라즈베리파이 SoC' },
                  { id: 'pc', label: '표준 산업용 PC / 윈도우 워크스테이션' },
                  { id: 'server', label: '중앙 VMS 서버 / 클라우드 랙마운트' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setWizardHost(opt.id as any)}
                    className={`w-full p-2.5 rounded-xl text-xs font-semibold text-left border transition-all flex items-center justify-between ${
                      wizardHost === opt.id
                        ? 'bg-purple-500 text-white font-bold border-purple-400 shadow-md ring-2 ring-purple-400/30'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600 hover:bg-slate-800'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {wizardHost === opt.id && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>

              {/* Instant Detail Box for Host Button */}
              {WIZARD_HOST_DETAILS[wizardHost] && (
                <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-1.5 animate-fadeIn">
                  <div className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>{WIZARD_HOST_DETAILS[wizardHost].title} 세부 사양</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {WIZARD_HOST_DETAILS[wizardHost].desc}
                  </p>
                  <div className="pt-1.5 border-t border-purple-500/20 text-[10px] text-slate-400 space-y-0.5 font-mono">
                    <div><span className="text-purple-400 font-semibold">인터페이스:</span> {WIZARD_HOST_DETAILS[wizardHost].pcie}</div>
                    <div><span className="text-indigo-400 font-semibold">드라이버:</span> {WIZARD_HOST_DETAILS[wizardHost].driver}</div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Recommendation Result */}
          <div className="p-6 rounded-2xl bg-slate-950 border-2 border-indigo-500/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2">
              <div className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-bold">
                ENGINEERING RECOMMENDATION (선택 조건 맞춤 분석 결과)
              </div>
              <div className="text-2xl font-black text-white flex items-center gap-2">
                <span className={wizardRecommendation.color}>{wizardRecommendation.name}</span>
                <span className="text-xs font-mono font-normal text-slate-400">({wizardRecommendation.fullName})</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {wizardRecommendation.keyFeaturesAndApplications}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => {
                  setSelectedInterfaceId(wizardRecommendation.id);
                  setModalTab('arch');
                  setIsModalOpen(true);
                }}
                className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/30"
              >
                <span>추천 인터페이스 정밀 사양 모달</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 5. Comprehensive Engineering Detail Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
          <div className="bg-slate-900 border-2 border-indigo-500/60 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border ${activeSpec.badgeBg}`}>
                  <Cable className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`text-xl sm:text-2xl font-black ${activeSpec.color}`}>
                      {activeSpec.name}
                    </h3>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                      {activeSpec.standard}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{activeSpec.fullName}</p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs Header */}
            <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-800 bg-slate-950/40 overflow-x-auto text-xs font-semibold">
              {[
                { id: 'arch', label: '물리 계층 & 아키텍처' },
                { id: 'pinout', label: '전체 핀맵 & 신호 회로' },
                { id: 'connectors', label: '추천 커넥터 품번 & 케이블' },
                { id: 'troubleshoot', label: '현장 노이즈 & 트러블슈팅' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setModalTab(tab.id as any)}
                  className={`px-4 py-2.5 border-b-2 transition-all whitespace-nowrap ${
                    modalTab === tab.id
                      ? 'border-indigo-500 text-indigo-400 font-bold bg-indigo-500/10 rounded-t-lg'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200 text-xs sm:text-sm">
              
              {/* Tab 1: Architecture */}
              {modalTab === 'arch' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                      <span className="text-slate-400 text-xs block mb-1">최대 대역폭</span>
                      <span className="text-amber-400 font-mono font-bold text-base">{activeSpec.bandwidth}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                      <span className="text-slate-400 text-xs block mb-1">최대 전송 거리</span>
                      <span className="text-cyan-400 font-mono font-bold text-base">{activeSpec.distance}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                      <span className="text-slate-400 text-xs block mb-1">시스템 지연(Latency)</span>
                      <span className="text-emerald-400 font-mono font-bold text-base">{activeSpec.latency}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                      <span className="text-slate-400 text-xs block mb-1">전원 공급</span>
                      <span className="text-indigo-400 font-mono font-bold text-base">{activeSpec.power}</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="font-bold text-white text-base flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>전기적 신호 물성 세부 파라미터</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">차동 임피던스:</span>
                        <span className="font-mono text-white font-bold">{activeSpec.electricalSpecs.differentialImpedance}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">신호 스윙 전압:</span>
                        <span className="font-mono text-amber-400 font-bold">{activeSpec.electricalSpecs.signalSwing}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">최대 허용 지터:</span>
                        <span className="font-mono text-cyan-400 font-bold">{activeSpec.electricalSpecs.maxJitter}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">권장 케이블 물성:</span>
                        <span className="font-mono text-slate-200 font-bold">{activeSpec.electricalSpecs.cableType}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">PHY 소비 전력:</span>
                        <span className="font-mono text-emerald-400 font-bold">{activeSpec.electricalSpecs.powerConsumption}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700">
                      <h5 className="font-bold text-emerald-400 mb-2">공학적 장점</h5>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {activeSpec.architecture.pros.map((p, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-400">✓</span> {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700">
                      <h5 className="font-bold text-rose-400 mb-2">설계 시 주의사항 및 한계</h5>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {activeSpec.architecture.cons.map((c, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-rose-400">✕</span> {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Pinout */}
              {modalTab === 'pinout' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-white text-sm flex items-center gap-2">
                        <Layers className="w-4 h-4 text-cyan-400" />
                        <span>{activeSpec.name} 표준 하드웨어 핀 배열 및 신호 정의</span>
                      </h4>
                      <span className="text-[11px] font-mono text-slate-400">총 {activeSpec.pinout.length}개 신호 그룹</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 font-mono uppercase">
                            <th className="py-2.5 px-3">핀 번호</th>
                            <th className="py-2.5 px-3">신호 명칭</th>
                            <th className="py-2.5 px-3">유형 (Type)</th>
                            <th className="py-2.5 px-3">공학적 상세 동작 및 전압 규격</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {activeSpec.pinout.map((p, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/40">
                              <td className="py-2.5 px-3 font-mono text-amber-400 font-bold">{p.pin}</td>
                              <td className="py-2.5 px-3 font-mono text-cyan-400 font-bold">{p.name}</td>
                              <td className="py-2.5 px-3 text-slate-300 font-mono text-[11px]">{p.type}</td>
                              <td className="py-2.5 px-3 text-slate-200">{p.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Connectors */}
              {modalTab === 'connectors' && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <Cable className="w-4 h-4 text-indigo-400" />
                      <span>산업용 검증 커넥터 및 케이블 권장 품번 (BOM Guide)</span>
                    </h4>
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row justify-between gap-2">
                        <div>
                          <div className="text-[11px] text-slate-400 font-mono">카메라 모듈 측 커넥터 (Camera End)</div>
                          <div className="text-sm font-mono font-bold text-amber-400 mt-0.5">{activeSpec.connectorPartNumbers.cameraSide}</div>
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row justify-between gap-2">
                        <div>
                          <div className="text-[11px] text-slate-400 font-mono">호스트 시스템 / 캐리어 보드 측 커넥터 (Host End)</div>
                          <div className="text-sm font-mono font-bold text-sky-400 mt-0.5">{activeSpec.connectorPartNumbers.hostSide}</div>
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row justify-between gap-2">
                        <div>
                          <div className="text-[11px] text-slate-400 font-mono">권장 산업용 케이블 어셈블리 (Cable Assembly)</div>
                          <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">{activeSpec.connectorPartNumbers.cablePart}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Troubleshooting */}
              {modalTab === 'troubleshoot' && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>현장 EMI/EMC 노이즈 대책 및 트러블슈팅 가이드</span>
                    </h4>
                    <div className="space-y-2">
                      {activeSpec.troubleshootingTips.map((tip, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                          <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-xs sm:text-sm text-slate-200 leading-relaxed">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">
                ALPR Hardware Engineering Reference v2.5
              </span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
              >
                닫기
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
