import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { 
  Lightbulb, 
  Zap, 
  Activity, 
  ShieldCheck, 
  Radio, 
  Search, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Eye, 
  Cpu, 
  Layers, 
  Sparkles,
  Info
} from 'lucide-react';

interface VendorDetail {
  title: string;
  tag: string;
  tagClass: string;
  items: { label: string; value: string }[];
  summary: string;
}

const vendorDetailsMap: Record<string, VendorDetail> = {
  geona: {
    title: '건아정보기술 KLED-STD-1000 상세 스펙',
    tag: '분리형 4K 특화',
    tagClass: 'bg-sky-500/20 text-sky-400 border border-sky-500/30',
    items: [
      { label: '연동 시스템', value: 'KATES-I9BH-INTP1 속도/신호위반 단속장비 연동' },
      { label: '카메라 센서', value: '8.9M Pixel (4096×2160, 4K 초고해상도) 센서 탑재' },
      { label: '광원 구조', value: '72개 High-Power LED 모듈 직접 집적 어레이' },
      { label: '조명 파장', value: '740nm 근적외선 (NIR) - CMOS 높은 QE 및 예방적 경고 적색광' },
      { label: '전원 및 구동', value: 'KMSTCTL2 SMPS (24V/150W), 인텔 i5 엣지 PC 내장, AC220V 팬틸트 구동' },
      { label: '팬틸트 제원', value: '최대 35kg 하중 지원 팬틸트 보드 내장, 원격 초점 제어' }
    ],
    summary: '듀얼 레이저 검지기가 다가오는 차량을 파악하면 이동 공간 데이터로 예측하여 최적 초점 위치에서 72개 LED를 마이크로초(µs) 단위로 펄스 발광합니다.'
  },
  seo: {
    title: '주식회사 세오 STVM-SVSD60 상세 스펙',
    tag: '엣지 AI 일체형',
    tagClass: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    items: [
      { label: '장비 유형', value: '검지기, AI 카메라, 제어기, 광학 조명 일체형 (All-In-One, 약 3,600만원)' },
      { label: '레이더 제원', value: '60GHz 고해상도 레이더 센서 (다차선 객체 3D 속도/위치 추적)' },
      { label: '동적 조명 제어', value: 'AI 유닛이 실시간 배경 조도 및 차량 반사율을 매 프레임 분석하여 광량 동적 조절' },
      { label: '보안 암호화', value: 'CUBE-HIDE 특허 암호화 칩셋 탑재 (통신 구간 원천 암호화)' },
      { label: '인식 신뢰도', value: '악천후 환경에서도 99% 이상 높은 번호판 식별률 유지' }
    ],
    summary: '고품질 조명으로 노이즈를 억제한 "클린 영상"을 확보하여 암호화 연산 병목(Overhead)을 극적으로 예방하고 99% 인식률을 달성합니다.'
  },
  unisecu: {
    title: '주식회사 유니시큐 UNI-SRE 시리즈 상세 스펙',
    tag: '스마트시티 융합',
    tagClass: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    items: [
      { label: '장비 유형', value: 'IP66 방수 뷸렛형 일체형 적외선 카메라 (UNI-SRE-89A / UNI-SRE-32A)' },
      { label: '자율 환경 반응', value: '조도 센서(CdS 포토다이오드) 내장으로 수동 조작 없는 Auto ON/OFF' },
      { label: '광학 기술', value: 'LightHunter 저조도 기술 + 2.7~13.5mm 전동 가변 초점 렌즈' },
      { label: 'Smart IR', value: '화각 줌 인/아웃에 연동되어 빔 방사각 자동 수축/확장 (근거리 타들어감 예방)' },
      { label: '스마트 횡단보도', value: '보행자 자동 인식, WDR 조도 균형을 통한 차량/사람 동시 정밀 분석' }
    ],
    summary: '보행자 자동 인식과 스마트 횡단보도 환경에서 WDR 조도 균형을 통해 차량 번호판과 보행자 신원을 동시에 정밀하게 포착합니다.'
  }
};

const ksTableData = [
  {
    category: '광속 유지율 및 에이징',
    criteria: '정격 수명의 25%(최대 6,000시간) 도달 시 초기 광속의 70%(또는 50%) 이상을 반드시 유지',
    basis: 'KS 인증 기준',
    highlight: '70% 이상 유지'
  },
  {
    category: '열적 안정화 조건',
    criteria: '전원 인가 후 최소 15분 대기, 시간당 온도 상승폭 5 K 이하 안정화 후 색온도 및 광학 측정',
    basis: '측정 프로토콜 (KS A 0076)',
    highlight: '온도 상승폭 5 K 이하'
  },
  {
    category: '조광 제어 (Dimming)',
    criteria: '200Hz PWM 제어 시 광출력 주파수 60Hz 이상 유지, 정상 광도의 40~70% 안정적 디밍 출동',
    basis: '도로교통공단 규격',
    highlight: '40~70% 안정 디밍'
  },
  {
    category: '가속도 진동 시험',
    criteria: '10~150Hz 범위, 3축, 4.905 m/s² (0.5g) 가속도 진폭, 축당 20 스위프 사이클 후 이상 없을 것',
    basis: '내환경 시험 기준',
    highlight: '4.905 m/s² (0.5g)'
  },
  {
    category: '광학적 흔들림 (조사각)',
    criteria: '진동 및 가혹 시험 전/후 빔 이동 방향 상방향 1.0~1.5 mrad 이내 유지 (조사 편차 극소화)',
    basis: '튜닝 광원 기준',
    highlight: '1.0~1.5 mrad 이내'
  },
  {
    category: '이동식 배터리 안전성',
    criteria: '소비전류 오차 ±20% 이내, 셀 당 전압 1.0V 이하 과방전 시 자동 차단 및 사용자 경고 회로 작동',
    basis: '장비 규격서',
    highlight: '과방전 자동 차단'
  }
];

export const LightingDashboardSection: React.FC = () => {
  const [subTab, setSubTab] = useState<'tab1' | 'tab2' | 'tab3' | 'tab4'>('tab1');
  const [selectedVendor, setSelectedVendor] = useState<'geona' | 'seo' | 'unisecu'>('geona');
  const [ksSearch, setKsSearch] = useState('');

  // Simulator controls
  const [simWeather, setSimWeather] = useState<'clear' | 'fog'>('clear');
  const [simPlate, setSimPlate] = useState<'film' | 'paint'>('film');
  const [simSmartIr, setSimSmartIr] = useState<boolean>(true);
  const [simExir, setSimExir] = useState<boolean>(true);

  // Canvas refs
  const xenonChartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lumenChartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const radarChartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const simCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Chart instances refs
  const xenonChartInst = useRef<Chart | null>(null);
  const lumenChartInst = useRef<Chart | null>(null);
  const radarChartInst = useRef<Chart | null>(null);

  // 1. Xenon vs LED Chart
  useEffect(() => {
    if (subTab !== 'tab1') return;
    const canvas = xenonChartCanvasRef.current;
    if (!canvas) return;

    if (xenonChartInst.current) {
      xenonChartInst.current.destroy();
      xenonChartInst.current = null;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    xenonChartInst.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['기본 수명 (x1000 시간)', '전력 효율성 (지수)', '연속발광 지연시간 (상대값)', '펄스 제어 정밀도 (지수)'],
        datasets: [
          {
            label: '구형 제논 (Xenon)',
            data: [5, 30, 95, 40],
            backgroundColor: 'rgba(239, 68, 68, 0.75)',
            borderColor: 'rgb(239, 68, 68)',
            borderWidth: 1.5,
            borderRadius: 4
          },
          {
            label: '최신 고출력 LED 스트로보',
            data: [50, 90, 5, 98],
            backgroundColor: 'rgba(14, 165, 233, 0.85)',
            borderColor: 'rgb(14, 165, 233)',
            borderWidth: 1.5,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            position: 'top', 
            labels: { 
              color: '#94a3b8', 
              font: { size: 12, weight: 'bold' },
              padding: 16
            } 
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#f8fafc',
            bodyColor: '#cbd5e1',
            borderColor: '#334155',
            borderWidth: 1,
            padding: 10
          }
        },
        scales: {
          y: { 
            beginAtZero: true, 
            max: 100, 
            grid: { color: 'rgba(51, 65, 85, 0.4)' },
            ticks: { color: '#94a3b8', font: { size: 11 } } 
          },
          x: { 
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { size: 11 } } 
          }
        }
      }
    });

    return () => {
      if (xenonChartInst.current) {
        xenonChartInst.current.destroy();
        xenonChartInst.current = null;
      }
    };
  }, [subTab]);

  // 2. Lumen Maintenance Chart
  useEffect(() => {
    if (subTab !== 'tab2') return;
    const canvas = lumenChartCanvasRef.current;
    if (!canvas) return;

    if (lumenChartInst.current) {
      lumenChartInst.current.destroy();
      lumenChartInst.current = null;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    lumenChartInst.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['0시간 (초기)', '1,000시간', '2,500시간', '4,000시간', '6,000시간 (KS인증점)', '10,000시간'],
        datasets: [
          {
            label: 'LED 광속 유지율 (%)',
            data: [100, 96, 91, 86, 81, 74],
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            borderWidth: 3,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: 'rgb(16, 185, 129)',
            pointRadius: 4
          },
          {
            label: 'KS 최소 적합 기준선 (70%)',
            data: [70, 70, 70, 70, 70, 70],
            borderColor: 'rgb(239, 68, 68)',
            borderDash: [6, 4],
            borderWidth: 2,
            fill: false,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            position: 'top', 
            labels: { 
              color: '#94a3b8', 
              font: { size: 12, weight: 'bold' },
              padding: 16
            } 
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#f8fafc',
            bodyColor: '#cbd5e1',
            borderColor: '#334155',
            borderWidth: 1
          }
        },
        scales: {
          y: { 
            min: 50, 
            max: 105, 
            grid: { color: 'rgba(51, 65, 85, 0.4)' },
            ticks: { 
              color: '#94a3b8', 
              font: { size: 11 },
              callback: (val) => `${val}%`
            } 
          },
          x: { 
            grid: { color: 'rgba(51, 65, 85, 0.2)' },
            ticks: { color: '#94a3b8', font: { size: 11 } } 
          }
        }
      }
    });

    return () => {
      if (lumenChartInst.current) {
        lumenChartInst.current.destroy();
        lumenChartInst.current = null;
      }
    };
  }, [subTab]);

  // 3. Vendor Radar Chart
  useEffect(() => {
    if (subTab !== 'tab3') return;
    const canvas = radarChartCanvasRef.current;
    if (!canvas) return;

    if (radarChartInst.current) {
      radarChartInst.current.destroy();
      radarChartInst.current = null;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    radarChartInst.current = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['다차로 커버리지', 'AI 센서 융합도', '파장/광량 제어', '설치/단일 함체성', '보안/암호화'],
        datasets: [
          {
            label: '건아정보기술 KLED-STD-1000',
            data: [98, 82, 90, 75, 80],
            borderColor: 'rgb(14, 165, 233)',
            backgroundColor: 'rgba(14, 165, 233, 0.2)',
            borderWidth: 2,
            pointBackgroundColor: 'rgb(14, 165, 233)'
          },
          {
            label: '주식회사 세오 STVM-SVSD60',
            data: [88, 98, 95, 95, 99],
            borderColor: 'rgb(168, 85, 247)',
            backgroundColor: 'rgba(168, 85, 247, 0.2)',
            borderWidth: 2,
            pointBackgroundColor: 'rgb(168, 85, 247)'
          },
          {
            label: '유니시큐 UNI-SRE 시리즈',
            data: [80, 88, 88, 90, 82],
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderWidth: 2,
            pointBackgroundColor: 'rgb(16, 185, 129)'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            position: 'top', 
            labels: { 
              color: '#94a3b8', 
              font: { size: 11, weight: 'bold' },
              padding: 12
            } 
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#f8fafc',
            bodyColor: '#cbd5e1',
            borderColor: '#334155',
            borderWidth: 1
          }
        },
        scales: {
          r: {
            angleLines: { color: 'rgba(71, 85, 105, 0.5)' },
            grid: { color: 'rgba(71, 85, 105, 0.4)' },
            pointLabels: { 
              color: '#cbd5e1', 
              font: { size: 11, weight: 'bold' } 
            },
            suggestedMin: 50,
            suggestedMax: 100,
            ticks: { 
              display: true, 
              color: '#64748b', 
              backdropColor: 'transparent', 
              font: { size: 9 }, 
              stepSize: 10 
            }
          }
        }
      }
    });

    return () => {
      if (radarChartInst.current) {
        radarChartInst.current.destroy();
        radarChartInst.current = null;
      }
    };
  }, [subTab]);

  // 4. Simulator Calculation & Canvas Rendering
  const computeSimulation = () => {
    let power = 100;
    let pulseMs = 4.5;
    let isBlooming = false;
    const isBackscatter = (simWeather === 'fog');
    let recSuccess = true;

    if (simPlate === 'film') {
      if (!simSmartIr && !simExir) {
        isBlooming = true;
        recSuccess = false;
      } else if (simSmartIr && !simExir) {
        power = 40;
        pulseMs = 1.2;
        isBlooming = false;
        recSuccess = true;
      } else if (!simSmartIr && simExir) {
        power = 60;
        pulseMs = 2.0;
        isBlooming = false;
        recSuccess = true;
      } else {
        power = 35;
        pulseMs = 1.0;
        isBlooming = false;
        recSuccess = true;
      }
    } else {
      power = 75;
      pulseMs = 3.0;
      isBlooming = false;
      recSuccess = true;
    }

    if (isBackscatter && !simSmartIr) {
      recSuccess = false;
    }

    return { power, pulseMs, isBlooming, isBackscatter, recSuccess };
  };

  const simResult = computeSimulation();

  useEffect(() => {
    if (subTab !== 'tab4') return;
    const canvas = simCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { isBlooming, isBackscatter } = simResult;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dark vehicle background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Car Body & Grill Silhouette
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(70, 20, 340, 140);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(95, 32, 290, 95);

    // Headlights simulation
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(115, 65, 14, 0, Math.PI * 2);
    ctx.arc(365, 65, 14, 0, Math.PI * 2);
    ctx.fill();

    // Plate Background
    ctx.fillStyle = (simPlate === 'film') ? '#f8fafc' : '#cbd5e1';
    ctx.fillRect(160, 88, 160, 38);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.strokeRect(160, 88, 160, 38);

    // Emblem / Hologram mark on film
    if (simPlate === 'film') {
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(162, 90, 8, 34);
    }

    // Blooming Overlay vs Crisp Text
    if (isBlooming) {
      const grad = ctx.createRadialGradient(240, 107, 6, 240, 107, 85);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.85)');
      grad.addColorStop(0.7, 'rgba(255, 200, 200, 0.4)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(240, 107, 85, 0, Math.PI * 2);
      ctx.fill();

      // Warning text
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('[IR BLOOMING / SATURATION WARNING]', 120, 60);
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 16px "Pretendard", "Noto Sans KR", sans-serif';
      ctx.fillText('123가 4567', 190, 113);
    }

    // Backscatter particles (Fog/Rain)
    if (isBackscatter) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      for (let i = 0; i < 45; i++) {
        const rx = (i * 23 + 17) % canvas.width;
        const ry = (i * 37 + 11) % canvas.height;
        ctx.beginPath();
        ctx.arc(rx, ry, (i % 3) + 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Camera Sensor OSD / HUD
    ctx.fillStyle = '#10b981';
    ctx.font = '10px monospace';
    ctx.fillText('FPS: 60 | RAW IR BUFFER | ISO 200', 12, 16);
    if (simSmartIr) {
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('SMART-IR: ACTIVE [µs PULSE]', 300, 16);
    }
  }, [subTab, simWeather, simPlate, simSmartIr, simExir]);

  // Filtered KS table
  const filteredKsData = ksTableData.filter(row => {
    if (!ksSearch.trim()) return true;
    const term = ksSearch.toLowerCase();
    return (
      row.category.toLowerCase().includes(term) ||
      row.criteria.toLowerCase().includes(term) ||
      row.basis.toLowerCase().includes(term)
    );
  });

  return (
    <section id="lighting" className="py-16 bg-slate-950 text-slate-100 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
                <Lightbulb className="w-5 h-5" />
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                무인교통단속장비 광학·조명 기술분석 대시보드
              </h2>
            </div>
            <p className="text-sm text-slate-400 pl-1">
              지능형 교통 시스템(ITS) LED 스트로보 & 적외선 광학 아키텍처 보고서
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl self-start md:self-auto shadow-inner">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
            <span className="text-slate-300 font-mono font-medium">ITS 광학 규격 v2.4 연동중</span>
          </div>
        </div>

        {/* Top 4 KPI Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">광원 수명 비교</span>
              <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 text-sm">💡</span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-sky-400 tracking-tight">50,000+ 시간</div>
              <p className="text-xs text-slate-400 mt-1">LED (제논 대비 5~25배 연장)</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">전력 절감 효과</span>
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm">⚡</span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-emerald-400 tracking-tight">60% ~ 75%↓</div>
              <p className="text-xs text-slate-400 mt-1">제논 스트로보 대비 전력 감축</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">핵심 IR 파장 대역</span>
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-sm">🔬</span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-amber-400 tracking-tight">740nm / 850nm</div>
              <p className="text-xs text-slate-400 mt-1">근적외선(NIR) 고효율 촬상</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">현장 번호판 인식률</span>
              <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 text-sm">🚘</span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-purple-400 tracking-tight">99% vs 23%</div>
              <p className="text-xs text-slate-400 mt-1">정상/AI 제어 vs 야간·악천후</p>
            </div>
          </div>
        </div>

        {/* Main Tabbed Container */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Sub Navigation Bar */}
          <div className="border-b border-slate-800 bg-slate-900/90 px-4 sm:px-6">
            <nav className="flex space-x-2 sm:space-x-6 overflow-x-auto text-sm font-semibold scrollbar-none" aria-label="Tabs">
              <button
                onClick={() => setSubTab('tab1')}
                className={`py-4 border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
                  subTab === 'tab1'
                    ? 'border-sky-500 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>1. 기술 패러다임 (제논 vs LED)</span>
              </button>

              <button
                onClick={() => setSubTab('tab2')}
                className={`py-4 border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
                  subTab === 'tab2'
                    ? 'border-sky-500 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>2. KS & 경찰청 성능규격</span>
              </button>

              <button
                onClick={() => setSubTab('tab3')}
                className={`py-4 border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
                  subTab === 'tab3'
                    ? 'border-sky-500 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span>3. 주요 3사 장비 스펙 비교</span>
              </button>

              <button
                onClick={() => setSubTab('tab4')}
                className={`py-4 border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
                  subTab === 'tab4'
                    ? 'border-sky-500 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>4. 현장 난제 & AI 시뮬레이터</span>
              </button>
            </nav>
          </div>

          {/* Sub Tab Content */}
          <div className="p-5 sm:p-7">
            
            {/* TAB 1: Xenon vs LED */}
            {subTab === 'tab1' && (
              <div className="space-y-6">
                <div className="bg-sky-950/40 border border-sky-800/50 rounded-xl p-4 text-xs sm:text-sm text-sky-200 leading-relaxed flex items-start gap-3">
                  <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-sky-300 font-bold">개요:</strong> 본 섹션은 기존 제논(Xenon) 방전관 조명에서 초고휘도 LED 스트로보 및 적외선(IR) 시스템으로의 물리적·광학적 패러다임 전환 원인을 설명합니다. 재충전 시간(Recovery Time) 소요 및 발열 한계를 극복하고 카메라 글로벌 셔터와 µs 단위로 동기화되는 현대 LED 광학계의 핵심 특성을 비교합니다.
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  {/* Left: Bar Chart */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4">
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <span>📊</span> 제논 방전관 vs LED 어레이 핵심 정량 비교
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      제논 조명은 강력한 순간 발광에도 불구하고 내장 커패시터 재충전 지연과 짧은 수명(2,000~10,000h)이 걸림돌이었습니다. 반면 고출력 LED는 재충전 지연이 없어 다차로 연속 속도 위반 차량을 프레임 누락 없이 수집할 수 있습니다.
                    </p>
                    <div className="relative w-full h-[320px] sm:h-[350px]">
                      <canvas ref={xenonChartCanvasRef} />
                    </div>
                  </div>

                  {/* Right: Optical Spectrum & Epilepsy Zone */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <Eye className="w-5 h-5 text-amber-400" />
                      <span>파장 대역 선택 및 광과민성 안전 프로토콜</span>
                    </h3>

                    <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2 pb-3 border-b border-slate-800">
                        <span className="font-bold text-slate-300">광과민성 발작 위험 대역 (Epilepsy Risk Zone)</span>
                        <span className="bg-red-500/20 text-red-400 border border-red-500/30 font-bold px-2.5 py-1 rounded-md self-start sm:self-auto">
                          3Hz ~ 30Hz (특히 15~20Hz)
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-400 leading-relaxed">
                        인구 4,000명 중 1명 꼴로 나타나는 광과민성 간질 환자를 보호하기 위해 가시광선 스트로보는 위험 대역을 필히 회피합니다. 현대 교통 단속 조명은 육안 인지도를 차단한 적외선(IR) 대역으로 전면 전환되었습니다.
                      </p>

                      <div className="space-y-3 pt-1">
                        <div className="text-xs font-semibold text-slate-300">대표 파장 대역별 광학 특성 비교:</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
                            <div className="font-bold text-amber-400 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-amber-400" />
                              740nm 근적외선 (NIR)
                            </div>
                            <div className="text-slate-400 text-[11px] leading-relaxed">
                              CMOS 센서 양자효율(QE) 매우 높음. 희미한 적색 광원으로 운전자 심리적 과속 억제 효과 제공.
                            </div>
                          </div>

                          <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
                            <div className="font-bold text-sky-400 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-sky-400" />
                              850nm / 940nm 적외선
                            </div>
                            <div className="text-slate-400 text-[11px] leading-relaxed">
                              육안으로 완전히 불가시 영역. 운전자 눈부심 제로. 번호판 명암비(Contrast) 확보 특화.
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                        <span>펄스 제어 폭: <strong className="text-white font-mono">1 ~ 5ms</strong></span>
                        <span>PWM 주파수: <strong className="text-emerald-400 font-mono">&gt; 3,000Hz (플리커 차단)</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: KS & Police Specs */}
            {subTab === 'tab2' && (
              <div className="space-y-6">
                <div className="bg-sky-950/40 border border-sky-800/50 rounded-xl p-4 text-xs sm:text-sm text-sky-200 leading-relaxed flex items-start gap-3">
                  <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-sky-300 font-bold">개요:</strong> 대한민국 경찰청, 도로교통공단 및 국가기술표준원(KS)이 적용하는 무인교통단속장비 조명 시스템의 내환경성, 전기적, 광학적 신뢰성 검사 기준입니다. 영하 20℃~영상 50℃의 가혹한 환경 및 상시 진동 속에서도 일관된 광도를 보장하기 위한 상세 규격을 정밀 매트릭스로 제시합니다.
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Table with Search */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <h3 className="font-bold text-white text-base flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-sky-400" />
                        <span>KS 및 경찰청 종합 시험 규격 검증 매트릭스</span>
                      </h3>
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={ksSearch}
                          onChange={(e) => setKsSearch(e.target.value)}
                          placeholder="규격 항목 / 내용 검색..."
                          className="text-xs pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 w-full sm:w-56"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/60">
                      <table className="w-full text-left text-xs text-slate-300 border-collapse">
                        <thead className="bg-slate-900/90 text-slate-200 font-bold border-b border-slate-800">
                          <tr>
                            <th className="p-3.5">평가 항목</th>
                            <th className="p-3.5">대한민국 규격 세부 기준 (KS / 경찰청)</th>
                            <th className="p-3.5">관련 근거</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80">
                          {filteredKsData.length > 0 ? (
                            filteredKsData.map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-900/60 transition">
                                <td className="p-3.5 font-semibold text-sky-400 whitespace-nowrap align-top">
                                  {row.category}
                                </td>
                                <td className="p-3.5 leading-relaxed text-slate-300">
                                  {row.criteria}
                                </td>
                                <td className="p-3.5 text-slate-400 whitespace-nowrap align-top font-mono text-[11px]">
                                  {row.basis}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="p-6 text-center text-slate-500">
                                검색 조건과 일치하는 규격 항목이 없습니다.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Right: Line Chart for Lumen Maintenance */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <Activity className="w-5 h-5 text-emerald-400" />
                      <span>광속 유지율 추이 (시간 경과)</span>
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      KS 규격 기준 6,000시간 가동 시 초기 광속 대비 70% 이상의 광량을 유지해야 최종 적합 판정을 받게 됩니다.
                    </p>
                    <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                      <div className="relative w-full h-[300px] sm:h-[340px]">
                        <canvas ref={lumenChartCanvasRef} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: 3 Major Vendors Comparison */}
            {subTab === 'tab3' && (
              <div className="space-y-6">
                <div className="bg-sky-950/40 border border-sky-800/50 rounded-xl p-4 text-xs sm:text-sm text-sky-200 leading-relaxed flex items-start gap-3">
                  <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-sky-300 font-bold">개요:</strong> 국내 무인교통단속 시장을 주도하는 대표 3사(건아정보기술, 주식회사 세오, 주식회사 유니시큐)의 특화 광학 시스템 및 기술 아키텍처를 세부 비교합니다. 다차로 분리형, 엣지 컴퓨팅 일체형, 스마트시티 융합형 등 각 사의 독자적인 설계 철학을 정밀 분석합니다.
                  </div>
                </div>

                {/* 3 Vendor Selection Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Vendor 1 */}
                  <div
                    onClick={() => setSelectedVendor('geona')}
                    className={`cursor-pointer p-5 rounded-xl border-2 transition shadow-sm ${
                      selectedVendor === 'geona'
                        ? 'border-sky-500 bg-sky-950/20'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-400 bg-sky-950/80 border border-sky-800 px-2 py-0.5 rounded">
                        분리형 다차로 특화
                      </span>
                      <span className="text-xs font-mono font-extrabold text-slate-500">01</span>
                    </div>
                    <h4 className="font-bold text-white text-lg mt-2">건아정보기술</h4>
                    <p className="text-xs font-mono text-slate-400">KLED-STD-1000</p>
                    <ul className="mt-4 text-xs text-slate-300 space-y-1.5">
                      <li>• 8.9MP (4K) 카메라 연동 (최대 3차로)</li>
                      <li>• 72개 High-Power LED 모듈 어레이</li>
                      <li>• 740nm NIR 파장 (심리적 과속 억제)</li>
                      <li>• 듀얼 레이저 비매설 검지 동기화</li>
                    </ul>
                  </div>

                  {/* Vendor 2 */}
                  <div
                    onClick={() => setSelectedVendor('seo')}
                    className={`cursor-pointer p-5 rounded-xl border-2 transition shadow-sm ${
                      selectedVendor === 'seo'
                        ? 'border-purple-500 bg-purple-950/20'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-400 bg-purple-950/80 border border-purple-800 px-2 py-0.5 rounded">
                        엣지 AI 일체형
                      </span>
                      <span className="text-xs font-mono font-extrabold text-slate-500">02</span>
                    </div>
                    <h4 className="font-bold text-white text-lg mt-2">주식회사 세오</h4>
                    <p className="text-xs font-mono text-slate-400">STVM-SVSD60</p>
                    <ul className="mt-4 text-xs text-slate-300 space-y-1.5">
                      <li>• All-In-One 단일 함체 (약 3,600만원)</li>
                      <li>• 60GHz 레이더 + AI 매 프레임 광량 동적제어</li>
                      <li>• CUBE-HIDE 통신 구간 암호화 특허</li>
                      <li>• 노이즈 억제로 암호화 오버헤드 최소화</li>
                    </ul>
                  </div>

                  {/* Vendor 3 */}
                  <div
                    onClick={() => setSelectedVendor('unisecu')}
                    className={`cursor-pointer p-5 rounded-xl border-2 transition shadow-sm ${
                      selectedVendor === 'unisecu'
                        ? 'border-emerald-500 bg-emerald-950/20'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded">
                        스마트시티 융합
                      </span>
                      <span className="text-xs font-mono font-extrabold text-slate-500">03</span>
                    </div>
                    <h4 className="font-bold text-white text-lg mt-2">주식회사 유니시큐</h4>
                    <p className="text-xs font-mono text-slate-400">UNI-SRE 시리즈</p>
                    <ul className="mt-4 text-xs text-slate-300 space-y-1.5">
                      <li>• 자율 환경 반응형 (CdS 포토다이오드)</li>
                      <li>• IP66 밀폐형 뷸렛 폼팩터</li>
                      <li>• LightHunter + Varifocal Smart IR</li>
                      <li>• 보행자/스마트 횡단보도 WDR 발광</li>
                    </ul>
                  </div>
                </div>

                {/* Radar Chart & Detail Specs */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center pt-2">
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4">
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <Radio className="w-5 h-5 text-sky-400" />
                      <span>3사 광학·시스템 레이더 성능 비교</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      각 제조사는 커버리지, 센서 융합도, 보안성, 설치 유연성 등에서 서로 다른 특화 강점을 지니고 있습니다.
                    </p>
                    <div className="relative w-full h-[320px] sm:h-[350px]">
                      <canvas ref={radarChartCanvasRef} />
                    </div>
                  </div>

                  {/* Active Vendor Detail Card */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h4 className="font-bold text-white text-base">
                        {vendorDetailsMap[selectedVendor].title}
                      </h4>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded ${vendorDetailsMap[selectedVendor].tagClass}`}>
                        {vendorDetailsMap[selectedVendor].tag}
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs text-slate-300">
                      {vendorDetailsMap[selectedVendor].items.map((it, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                          <span className="text-slate-400 font-semibold sm:w-28 shrink-0">• {it.label}:</span>
                          <span className="text-slate-200">{it.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 bg-slate-900/60 p-3.5 rounded-lg border border-slate-800">
                      <span className="text-xs font-bold text-sky-400 block mb-1">핵심 매커니즘:</span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {vendorDetailsMap[selectedVendor].summary}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Challenges & AI Simulator */}
            {subTab === 'tab4' && (
              <div className="space-y-6">
                <div className="bg-sky-950/40 border border-sky-800/50 rounded-xl p-4 text-xs sm:text-sm text-sky-200 leading-relaxed flex items-start gap-3">
                  <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-sky-300 font-bold">개요:</strong> 실제 아스팔트 도로 위에서 발생하는 야간/악천후 시 인식률 저하(23%까지 급락) 문제 및 신형 반사필름 번호판 도입에 따른 적외선 과노출(IR Blooming) 딜레마를 분석합니다. 하단의 실시간 시뮬레이터를 조작하여 Smart IR 및 EXIR 기술의 반사광 억제 메커니즘을 가상으로 실험할 수 있습니다.
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Simulator Settings */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 space-y-4">
                      <h4 className="font-bold text-white text-sm flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-sky-400" />
                        <span>현장 환경 및 카메라 설정 조절</span>
                      </h4>

                      {/* Weather Select */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">기상 조건 (Weather)</label>
                        <select
                          value={simWeather}
                          onChange={(e) => setSimWeather(e.target.value as 'clear' | 'fog')}
                          className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        >
                          <option value="clear">맑음 (Clear Night) - 유효 광량 99%</option>
                          <option value="fog">짙은 안개/우천 (Fog/Rain) - 빛 산란 백스캐터 발생</option>
                        </select>
                      </div>

                      {/* Plate Material Select */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">번호판 재질 (Plate Type)</label>
                        <select
                          value={simPlate}
                          onChange={(e) => setSimPlate(e.target.value as 'film' | 'paint')}
                          className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        >
                          <option value="paint">구형 페인트 도장 (3~12 cd/lx·m²)</option>
                          <option value="film">신형 반사필름 (20~30 cd/lx·m² 초고반사)</option>
                        </select>
                      </div>

                      {/* Toggles */}
                      <div className="pt-2 border-t border-slate-800 space-y-3">
                        <div className="text-xs font-semibold text-slate-300">광학 기술 억제 솔루션:</div>
                        <label className="flex items-center space-x-2.5 text-xs cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={simSmartIr}
                            onChange={(e) => setSimSmartIr(e.target.checked)}
                            className="w-4 h-4 rounded text-sky-600 bg-slate-900 border-slate-700 focus:ring-sky-500"
                          />
                          <span className="text-slate-300 font-medium">Smart IR (Auto-Dimming µs 펄스 제어)</span>
                        </label>
                        <label className="flex items-center space-x-2.5 text-xs cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={simExir}
                            onChange={(e) => setSimExir(e.target.checked)}
                            className="w-4 h-4 rounded text-sky-600 bg-slate-900 border-slate-700 focus:ring-sky-500"
                          />
                          <span className="text-slate-300 font-medium">EXIR 구조 (발광부/수광부 분리 격벽)</span>
                        </label>
                      </div>

                      {/* Overexposure Note */}
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300 leading-relaxed">
                        <strong className="text-amber-400">과노출 원인:</strong> 신형 반사필름은 반사 성능이 6배 높아 고출력 IR을 전반사시켜 이미지 센서 픽셀이 하얗게 번지는 Blooming 현상을 유발합니다.
                      </div>
                    </div>
                  </div>

                  {/* Right: Real-time Canvas Simulator */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
                        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <Eye className="w-4 h-4 text-sky-400" />
                          <span>가상 IR 카메라 센서 프레임 버퍼 (Frame Simulation)</span>
                        </span>
                        
                        {/* Status Badge */}
                        {simResult.isBlooming ? (
                          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            <XCircle className="w-3.5 h-3.5" />
                            과노출 판독 불가 (Blooming Fail)
                          </span>
                        ) : simResult.isBackscatter && !simSmartIr ? (
                          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            안개 빛 산란 판독 실패 (23% Baseline)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            정상 픽셀 수집 (인식률 99.2%)
                          </span>
                        )}
                      </div>

                      {/* Canvas Container */}
                      <div className="flex items-center justify-center py-5 bg-slate-950 rounded-lg border border-slate-800/80 relative overflow-hidden shadow-inner">
                        <canvas
                          ref={simCanvasRef}
                          width={480}
                          height={180}
                          className="max-w-full h-auto border border-slate-800 rounded shadow-2xl"
                        />
                      </div>

                      {/* Telemetry Readouts */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono pt-1">
                        <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block text-[10px] uppercase">IR LED Output</span>
                          <strong className="text-emerald-400 text-sm">{simResult.power}% Power</strong>
                        </div>
                        <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block text-[10px] uppercase">Pulse Width</span>
                          <strong className="text-emerald-400 text-sm">{simResult.pulseMs} ms</strong>
                        </div>
                        <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block text-[10px] uppercase">Plate Reflectance</span>
                          <strong className="text-amber-400 text-sm">
                            {simPlate === 'film' ? 'High (28 cd)' : 'Normal (8 cd)'}
                          </strong>
                        </div>
                        <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block text-[10px] uppercase">Backscatter Level</span>
                          <strong className="text-sky-400 text-sm">
                            {simResult.isBackscatter ? 'High (Rain/Fog)' : 'Low (1%)'}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Section Conclusion / Adaptive Optics Vision */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-3.5 shadow-lg">
          <div className="flex items-center gap-2.5 text-white">
            <Sparkles className="w-5 h-5 text-sky-400" />
            <h3 className="text-lg font-bold">
              결론 및 차세대 지능형 적응 광학(Adaptive Optics) 진화 방향
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            무인교통단속장비용 LED 조명은 단순한 보조 전등을 넘어 엣지 AI, 레이더, 암호화 칩셋과 유기적으로 연동되는 ITS 지능형 광학 인프라로 발전했습니다. 향후 C-ITS 및 자율주행 시대를 맞아, 광학 시스템은 LiDAR 및 기상 센서와 실시간 연동되어 1프레임 앞의 안개·우천·반사율 변화를 예측하고 PWM 발광 펄스를 미세 조율하는 <strong className="text-white font-semibold">지능형 적응 광학(Adaptive Optics)</strong>으로 진화할 것입니다. 또한 국가 인증 규격 역시 정적인 실험실 테스트에서 실도로 기반의 동적 인증 프로토콜로 혁신되어야 할 것입니다.
          </p>
        </div>

      </div>
    </section>
  );
};
