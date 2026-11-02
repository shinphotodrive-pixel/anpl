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
  Maximize2
} from 'lucide-react';

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
    }
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
    }
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
    }
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
    }
  }
];

export const CameraInterfaceSection: React.FC = () => {
  const [selectedInterfaceId, setSelectedInterfaceId] = useState<'mipi' | 'usb' | 'gmsl' | 'gige'>('mipi');
  
  // Wizard States
  const [wizardDistance, setWizardDistance] = useState<'short' | 'mid' | 'automotive' | 'long'>('mid');
  const [wizardLatency, setWizardLatency] = useState<'ultra' | 'normal' | 'network'>('normal');
  const [wizardHost, setWizardHost] = useState<'jetson' | 'pc' | 'server'>('pc');

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
              onClick={exportCsv}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all text-xs font-semibold shadow-md"
            >
              <Download className="w-4 h-4 text-indigo-400" />
              <span>비교표 CSV 내보내기</span>
            </button>
          </div>
        </div>

        {/* 4 Major Interfaces Quick Badges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2">
          {INTERFACE_SPECS.map((spec) => {
            const isSelected = selectedInterfaceId === spec.id;
            return (
              <div
                key={spec.id}
                onClick={() => setSelectedInterfaceId(spec.id)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  isSelected
                    ? `${spec.borderColor} bg-slate-800/95 ring-4 ring-indigo-500/20 scale-[1.02] shadow-xl`
                    : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600 hover:bg-slate-800'
                }`}
              >
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
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. The Core 4 Major Interfaces Comparison Table (As Requested from User Image) */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-slate-900 border-2 border-indigo-500/40 rounded-3xl overflow-hidden shadow-2xl">
          
          {/* Table Header Bar */}
          <div className="p-6 border-b border-slate-800 bg-slate-900/95 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <span>4대 주요 인터페이스 사양 정밀 비교표</span>
              </h2>
            </div>
            <div className="text-xs font-mono text-slate-400">
              물리적 계층 및 시스템 레이턴시
            </div>
          </div>

          {/* Table Body */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-950/90 text-slate-400 text-xs uppercase font-mono border-b border-slate-800">
                  <th className="py-4 px-5 font-bold">인터페이스</th>
                  <th className="py-4 px-5 font-bold">최대 대역폭</th>
                  <th className="py-4 px-5 font-bold">전송 거리</th>
                  <th className="py-4 px-5 font-bold">전원 공급</th>
                  <th className="py-4 px-5 font-bold">시스템 지연 (Latency)</th>
                  <th className="py-4 px-5 font-bold">주요 특징 & 최적 적용 분야</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 font-sans">
                {INTERFACE_SPECS.map((spec) => {
                  const isSelected = selectedInterfaceId === spec.id;
                  return (
                    <tr
                      key={spec.id}
                      onClick={() => setSelectedInterfaceId(spec.id)}
                      className={`transition-colors cursor-pointer ${
                        isSelected ? 'bg-indigo-950/30' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Column 1: Interface Name with Diagonal Arrow Icon */}
                      <td className="py-5 px-5 font-bold text-white whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <ArrowUpRight className="w-4 h-4 text-amber-400 shrink-0" />
                          <span className="text-white text-base">{spec.name}</span>
                        </div>
                      </td>

                      {/* Column 2: Max Bandwidth (Gold/Amber Text) */}
                      <td className="py-5 px-5 font-mono text-amber-400 font-semibold whitespace-nowrap">
                        {spec.bandwidth}
                      </td>

                      {/* Column 3: Distance (Cyan Text) */}
                      <td className="py-5 px-5 font-mono text-cyan-400 font-medium whitespace-nowrap">
                        {spec.distance}
                      </td>

                      {/* Column 4: Power Delivery */}
                      <td className="py-5 px-5 text-slate-300 whitespace-nowrap">
                        {spec.power}
                      </td>

                      {/* Column 5: Latency (Emerald Text) */}
                      <td className="py-5 px-5 font-mono text-emerald-400 font-medium whitespace-nowrap">
                        {spec.latency}
                      </td>

                      {/* Column 6: Key Features & Applications */}
                      <td className="py-5 px-5 text-slate-300 text-xs sm:text-sm leading-relaxed max-w-md">
                        {spec.keyFeaturesAndApplications}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-400 text-center">
            * 각 행을 클릭하면 하단에서 해당 인터페이스의 물리 계층(PHY) 아키텍처 및 핀맵 세부 공학 사양을 확인하실 수 있습니다.
          </div>
        </div>
      </div>

      {/* 3. Deep Architectural Details of Selected Interface */}
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

        </div>
      </div>

      {/* 4. Interactive Interface Selection Wizard */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          
          <div className="border-b border-slate-700/80 pb-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-lg">
              <Sliders className="w-5 h-5" />
              <span>내 프로젝트에 최적인 카메라 인터페이스 선정 마법사</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              요구 전송 거리, 허용 시스템 레이턴시, 호스트 하드웨어 환경을 선택하면 최적 인터페이스를 추천합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Question 1: Transmission Distance */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">1. 카메라 ↔ 프로세서 전송 거리</label>
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
                    className={`w-full p-2.5 rounded-xl text-xs font-semibold text-left border transition-all ${
                      wizardDistance === opt.id
                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2: Latency Tolerance */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">2. 요구 레이턴시(지연 시간)</label>
              <div className="space-y-2">
                {[
                  { id: 'ultra', label: '< 1 ms (실시간 제로 레이턴시)' },
                  { id: 'normal', label: '2 ~ 5 ms (표준 실시간 머신비전)' },
                  { id: 'network', label: '5 ~ 15 ms (원거리 모니터링 허용)' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setWizardLatency(opt.id as any)}
                    className={`w-full p-2.5 rounded-xl text-xs font-semibold text-left border transition-all ${
                      wizardLatency === opt.id
                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 3: Host Processor Platform */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">3. 호스트 시스템 프로세서</label>
              <div className="space-y-2">
                {[
                  { id: 'jetson', label: 'NVIDIA Jetson / 라즈베리파이 SoC' },
                  { id: 'pc', label: '표준 산업용 PC / 윈도우 워크스테이션' },
                  { id: 'server', label: '중앙 VMS 서버 / 클라우드 랙마운트' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setWizardHost(opt.id as any)}
                    className={`w-full p-2.5 rounded-xl text-xs font-semibold text-left border transition-all ${
                      wizardHost === opt.id
                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Recommendation Result */}
          <div className="p-6 rounded-2xl bg-slate-950 border-2 border-indigo-500/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2">
              <div className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-bold">
                ENGINEERING RECOMMENDATION
              </div>
              <div className="text-2xl font-black text-white flex items-center gap-2">
                <span className={wizardRecommendation.color}>{wizardRecommendation.name}</span>
                <span className="text-xs font-mono font-normal text-slate-400">({wizardRecommendation.fullName})</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {wizardRecommendation.keyFeaturesAndApplications}
              </p>
            </div>

            <button
              onClick={() => setSelectedInterfaceId(wizardRecommendation.id)}
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shrink-0 transition-all shadow-lg"
            >
              <span>상세 아키텍처 보기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
