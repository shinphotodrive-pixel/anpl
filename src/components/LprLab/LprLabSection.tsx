import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import {
  Cpu,
  LayoutDashboard,
  ShieldCheck,
  Workflow,
  Zap,
  MonitorPlay,
  Gauge,
  CheckCircle2,
  Car,
  Video,
  BarChart2,
  PieChart,
  GitCommit,
  Palette,
  Scale,
  AlertCircle,
  Layers,
  Calculator,
  Play,
  Square,
  ListOrdered,
  Sparkles
} from 'lucide-react';

interface PlateSpec {
  bg: string;
  border: string;
  textColor: string;
  text: string;
  region: string;
  target: string;
  date: string;
  badge: string;
  badgeBg: string;
  notes: string;
}

const plateSpecsMap: Record<string, PlateSpec> = {
  general: {
    bg: 'bg-white',
    border: 'border-slate-800',
    textColor: 'text-slate-900',
    text: '123가 4567',
    region: '',
    target: '일반 개인 소유 승용 차량',
    date: '표준형 (2006~현재 / 2019 8자리)',
    badge: '표준 흰색',
    badgeBg: 'bg-slate-200 text-slate-800',
    notes: '가장 흔한 규격입니다. 야간 IR 조명 통과 시 재귀반사 필름 부착 차량의 노출과다(Overexposure) 현상 대응 HDR 보정이 핵심입니다.'
  },
  corporate: {
    bg: 'bg-emerald-300',
    border: 'border-emerald-600',
    textColor: 'text-slate-900',
    text: '77법 8888',
    region: '',
    target: '8,000만 원 이상 고가 법인 승용차',
    date: '2024년 1월 1일 전면 신설',
    badge: '2024 연두색 신설',
    badgeBg: 'bg-emerald-700 text-white',
    notes: '2024년 신설 규격으로 기존 라벨링 데이터셋에 극소수 포함되어 있어, 3D 렌더링 기반 합성 데이터(Synthetic Data) 생성을 통한 사전 파이프라인 보강이 필수적입니다.'
  },
  commercial: {
    bg: 'bg-amber-300',
    border: 'border-amber-600',
    textColor: 'text-slate-900',
    text: '서울 31바 1234',
    region: '서울',
    target: '택시, 시외/시내버스, 노란색 화물차',
    date: '영업용 표준 규격',
    badge: '영업용 노랑',
    badgeBg: 'bg-amber-600 text-white',
    notes: '지역명(예: 서울, 경기)이 상단에 표기되거나 2줄 레이아웃으로 출력되므로 OCR 모델의 시퀀스 길이 디코딩 및 멀티라인 텍스트 정렬 분기가 요구됩니다.'
  },
  eco: {
    bg: 'bg-sky-400',
    border: 'border-sky-600',
    textColor: 'text-slate-900',
    text: '252수 9999',
    region: '',
    target: '순수 전기차(EV) 및 수소 연료 전지차',
    date: '친환경 차 전용 규격',
    badge: '친환경 파랑',
    badgeBg: 'bg-sky-700 text-white',
    notes: '하단 태극 문양 및 전용 픽셀 패턴 아이콘이 포함되어 일반 Bounding Box 검출 시 차체와의 경계선 오인식 억제가 필요합니다.'
  },
  diplomat: {
    bg: 'bg-blue-600',
    border: 'border-blue-900',
    textColor: 'text-white',
    text: '외교 001-101',
    region: '',
    target: '주한 대사관, 영사관 및 국제기구 차량',
    date: '외교 전용 규격',
    badge: '외교 특수',
    badgeBg: 'bg-blue-900 text-white',
    notes: '문자열에 "외교", "영사" 등 특수 단어 및 대시(-) 기호가 삽입되므로 OCR 디코더 단에 전용 사전을 등록해야 문맥 보정이 정확히 작동합니다.'
  }
};

interface LogEvent {
  id: string;
  time: string;
  plate: string;
  type: string;
  confidence: string;
}

interface SimulatedVehicle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  plate: string;
  isCorp: boolean;
  logged: boolean;
}

export const LprLabSection: React.FC = () => {
  const [subTab, setSubTab] = useState<'dashboard' | 'legal' | 'pipeline' | 'edge' | 'demo'>('dashboard');

  // Tab 1: Charts
  const ocrChartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const plateDistChartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const ocrChartInst = useRef<Chart | null>(null);
  const plateDistChartInst = useRef<Chart | null>(null);

  // Tab 2: Plate visualizer
  const [selectedPlateKey, setSelectedPlateKey] = useState<'general' | 'corporate' | 'commercial' | 'eco' | 'diplomat'>('general');

  // Tab 3: Pipeline Simulators
  const [zeroDceAlpha, setZeroDceAlpha] = useState<number>(60);
  const toneCurveCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isWarped, setIsWarped] = useState<boolean>(false);
  const perspectiveCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [beamSize, setBeamSize] = useState<string>('3');

  // Tab 4: Edge Physics Calculator
  const [speedKmH, setSpeedKmH] = useState<number>(100);
  const [latencyMs, setLatencyMs] = useState<number>(50);

  // Tab 5: Live Road Canvas & Event Logs
  const liveCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isAutoSim, setIsAutoSim] = useState<boolean>(false);
  const [logs, setLogs] = useState<LogEvent[]>([
    {
      id: 'init-1',
      time: '12:00:01',
      plate: '52가 3491',
      type: '일반 승용',
      confidence: '0.982'
    }
  ]);
  const vehiclesRef = useRef<SimulatedVehicle[]>([]);
  const animFrameIdRef = useRef<number | null>(null);
  const autoSimTimerRef = useRef<NodeJS.Timeout | null>(null);

  // -------------------------------------------------------------
  // TAB 1: Chart Initializations
  // -------------------------------------------------------------
  useEffect(() => {
    if (subTab !== 'dashboard') return;

    // Chart 1: OCR Benchmark
    const canvas1 = ocrChartCanvasRef.current;
    if (canvas1) {
      if (ocrChartInst.current) {
        ocrChartInst.current.destroy();
        ocrChartInst.current = null;
      }
      const ctx1 = canvas1.getContext('2d');
      if (ctx1) {
        ocrChartInst.current = new Chart(ctx1, {
          type: 'bar',
          data: {
            labels: ['LPRNet (Pure CNN)', 'EasyOCR (CRNN)', 'PaddleOCR (Light)', 'PARSeq (ViT+XLNet)'],
            datasets: [
              {
                label: '추론 속도 (FPS)',
                data: [65, 18, 52, 28],
                backgroundColor: 'rgba(99, 102, 241, 0.75)',
                borderColor: 'rgb(99, 102, 241)',
                borderWidth: 1.5,
                borderRadius: 4,
                yAxisID: 'y'
              },
              {
                label: '복합 악천후 인식률 (%)',
                data: [82.5, 91.2, 97.4, 99.4],
                backgroundColor: 'rgba(16, 185, 129, 0.75)',
                borderColor: 'rgb(16, 185, 129)',
                borderWidth: 1.5,
                borderRadius: 4,
                yAxisID: 'y1'
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: '#94a3b8', font: { size: 10 } }
              },
              y: {
                type: 'linear',
                position: 'left',
                title: { display: true, text: 'FPS (속도)', color: '#818cf8', font: { size: 10 } },
                grid: { color: 'rgba(51, 65, 85, 0.3)' },
                ticks: { color: '#94a3b8', font: { size: 10 } },
                max: 80
              },
              y1: {
                type: 'linear',
                position: 'right',
                title: { display: true, text: '정확도 (%)', color: '#34d399', font: { size: 10 } },
                min: 75,
                max: 100,
                grid: { drawOnChartArea: false },
                ticks: { color: '#94a3b8', font: { size: 10 } }
              }
            },
            plugins: {
              legend: {
                position: 'bottom',
                labels: { color: '#cbd5e1', boxWidth: 12, font: { size: 11, weight: 'bold' } }
              },
              tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleColor: '#f8fafc',
                bodyColor: '#cbd5e1',
                borderColor: '#334155',
                borderWidth: 1
              }
            }
          }
        });
      }
    }

    // Chart 2: Plate Category Donut Chart
    const canvas2 = plateDistChartCanvasRef.current;
    if (canvas2) {
      if (plateDistChartInst.current) {
        plateDistChartInst.current.destroy();
        plateDistChartInst.current = null;
      }
      const ctx2 = canvas2.getContext('2d');
      if (ctx2) {
        plateDistChartInst.current = new Chart(ctx2, {
          type: 'doughnut',
          data: {
            labels: ['일반 승용 (흰색)', '2024 연두색 법인', '영업용 (노랑)', '친환경 (파랑)', '3D 합성 데이터 (합성)'],
            datasets: [
              {
                data: [55, 10, 12, 13, 10],
                backgroundColor: ['#64748b', '#10b981', '#f59e0b', '#0284c7', '#a855f7'],
                borderColor: '#0f172a',
                borderWidth: 2
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { color: '#cbd5e1', boxWidth: 12, font: { size: 10 } }
              },
              tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleColor: '#f8fafc',
                bodyColor: '#cbd5e1',
                borderColor: '#334155',
                borderWidth: 1,
                callbacks: {
                  label: (ctx) => ` ${ctx.label}: ${ctx.raw}%`
                }
              }
            }
          }
        });
      }
    }

    return () => {
      if (ocrChartInst.current) {
        ocrChartInst.current.destroy();
        ocrChartInst.current = null;
      }
      if (plateDistChartInst.current) {
        plateDistChartInst.current.destroy();
        plateDistChartInst.current = null;
      }
    };
  }, [subTab]);

  // -------------------------------------------------------------
  // TAB 3: Tone Curve Simulator (Canvas)
  // -------------------------------------------------------------
  useEffect(() => {
    if (subTab !== 'pipeline') return;
    const canvas = toneCurveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Draw grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < w; x += 30) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = 0; y < h; y += 30) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    // Draw Linear Baseline (y=x)
    ctx.strokeStyle = '#64748b';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(30, h - 20);
    ctx.lineTo(w - 20, 20);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Zero-DCE Enhanced Curve: LE_n(I) = I + alpha * I * (1 - I)
    const alpha = (zeroDceAlpha / 100) * 2.5;
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const xNorm = i / 100;
      let yNorm = xNorm + alpha * xNorm * (1 - xNorm);
      yNorm = Math.min(1, yNorm);

      const px = 30 + xNorm * (w - 50);
      const py = h - 20 - yNorm * (h - 40);

      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }, [subTab, zeroDceAlpha]);

  // -------------------------------------------------------------
  // TAB 3: Perspective Warp Rectification Canvas
  // -------------------------------------------------------------
  useEffect(() => {
    if (subTab !== 'pipeline') return;
    const canvas = perspectiveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    if (!isWarped) {
      // Skewed Trapezoid Plate
      const p1 = { x: w * 0.25, y: h * 0.3 };
      const p2 = { x: w * 0.8, y: h * 0.15 };
      const p3 = { x: w * 0.7, y: h * 0.85 };
      const p4 = { x: w * 0.2, y: h * 0.75 };

      // Fill polygon
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Keypoints
      [p1, p2, p3, p4].forEach((p, idx) => {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.fillText(`K${idx + 1}`, p.x - 12, p.y - 8);
      });
    } else {
      // Rectified Plate
      const rx = w * 0.2;
      const ry = h * 0.25;
      const rw = w * 0.6;
      const rh = h * 0.5;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(rx, ry, rw, rh);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.strokeRect(rx, ry, rw, rh);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('52가 3491', rx + rw * 0.25, ry + rh * 0.65);
    }
  }, [subTab, isWarped]);

  // -------------------------------------------------------------
  // TAB 4: Displacement Calculation
  // -------------------------------------------------------------
  const speedMS = speedKmH / 3.6;
  const latencySec = latencyMs / 1000;
  const distMeters = speedMS * latencySec;

  const getDisplacementEvaluation = () => {
    if (distMeters < 0.5) {
      return {
        text: '평가: 머신비전 (1ms) 레벨 - 타깃 위치 오차 거의 없음 (최상)',
        className: 'text-emerald-400'
      };
    } else if (distMeters < 2.0) {
      return {
        text: '평가: 교통 전용 IP 카메라 (30~50ms) - 바운딩 박스 추적 안정권 내 포착',
        className: 'text-indigo-300'
      };
    } else {
      return {
        text: '평가: 일반 감시 IP 카메라 (200ms↑) - 차량이 화면 밖으로 이탈하거나 크롭 이탈 위험 고조',
        className: 'text-rose-400'
      };
    }
  };

  // -------------------------------------------------------------
  // TAB 5: Live Road Animation & Simulation
  // -------------------------------------------------------------
  const spawnVehicle = (type: 'normal' | 'corporate' = 'normal') => {
    const isCorp = type === 'corporate';
    const plateStr = isCorp
      ? `77법 ${Math.floor(Math.random() * 8999 + 1000)}`
      : `${Math.floor(Math.random() * 89 + 10)}가 ${Math.floor(Math.random() * 8999 + 1000)}`;

    const canvas = liveCanvasRef.current;
    const h = canvas ? canvas.height : 256;

    const car: SimulatedVehicle = {
      x: -80,
      y: h / 2 - 16,
      width: 70,
      height: 32,
      speed: Math.random() * 2 + 3,
      plate: plateStr,
      isCorp: isCorp,
      logged: false
    };
    vehiclesRef.current.push(car);
  };

  const handleToggleAutoSim = () => {
    setIsAutoSim((prev) => !prev);
  };

  useEffect(() => {
    if (isAutoSim) {
      autoSimTimerRef.current = setInterval(() => {
        const type = Math.random() > 0.4 ? 'normal' : 'corporate';
        spawnVehicle(type);
      }, 2500);
    } else {
      if (autoSimTimerRef.current) {
        clearInterval(autoSimTimerRef.current);
        autoSimTimerRef.current = null;
      }
    }
    return () => {
      if (autoSimTimerRef.current) {
        clearInterval(autoSimTimerRef.current);
        autoSimTimerRef.current = null;
      }
    };
  }, [isAutoSim]);

  useEffect(() => {
    if (subTab !== 'demo') return;
    const canvas = liveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;

    const render = () => {
      if (!isMounted) return;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Road Background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, w, h);

      // Lane line
      ctx.strokeStyle = '#334155';
      ctx.setLineDash([15, 15]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Camera Detection Trap line
      const trapX = w * 0.55;
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(trapX, 0);
      ctx.lineTo(trapX, h);
      ctx.stroke();

      // Cars
      for (let i = vehiclesRef.current.length - 1; i >= 0; i--) {
        const v = vehiclesRef.current[i];
        v.x += v.speed;

        // Car Body
        ctx.fillStyle = v.isCorp ? '#059669' : '#3b82f6';
        ctx.fillRect(v.x, v.y, v.width, v.height);

        // Plate Bounding Box
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(v.x + 10, v.y + 8, 24, 14);

        // Check Trigger Line
        if (v.x > trapX && !v.logged) {
          v.logged = true;
          const timeStr = new Date().toLocaleTimeString('ko-KR', { hour12: false });
          const newLog: LogEvent = {
            id: String(Date.now() + Math.random()),
            time: timeStr,
            plate: v.plate,
            type: v.isCorp ? '2024 연두색' : '일반 승용',
            confidence: (Math.random() * 0.05 + 0.94).toFixed(3)
          };
          setLogs((prev) => [newLog, ...prev.slice(0, 19)]);
        }

        // Out of screen
        if (v.x > w + 100) {
          vehiclesRef.current.splice(i, 1);
        }
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      isMounted = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [subTab]);

  const activePlate = plateSpecsMap[selectedPlateKey];

  return (
    <section id="lpr-lab" className="py-16 bg-slate-950 text-slate-100 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/30">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  LPR Deep Learning Research Lab
                </h2>
                <span className="hidden sm:inline-flex text-[11px] font-semibold text-indigo-400 bg-indigo-950/80 border border-indigo-800/80 px-2 py-0.5 rounded">
                  엔드투엔드 파이프라인
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                차량 번호판 인식(LPR) 엔드투엔드 설계 & 실시간 웹 관제 가이드
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 shadow-sm">
              <span className="w-2 h-2 mr-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              2026 규정 & YOLO11 적용
            </span>
          </div>
        </div>

        {/* 5-Tab Navigation Strip */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-1.5">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto text-xs font-semibold scrollbar-none" aria-label="LPR Lab Tabs">
            <button
              onClick={() => setSubTab('dashboard')}
              className={`px-3 py-2.5 rounded-lg whitespace-nowrap flex items-center space-x-1.5 transition ${
                subTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>대시보드 & 종합 개요</span>
            </button>

            <button
              onClick={() => setSubTab('legal')}
              className={`px-3 py-2.5 rounded-lg whitespace-nowrap flex items-center space-x-1.5 transition ${
                subTab === 'legal'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>법적 규제 & 번호판 규격</span>
            </button>

            <button
              onClick={() => setSubTab('pipeline')}
              className={`px-3 py-2.5 rounded-lg whitespace-nowrap flex items-center space-x-1.5 transition ${
                subTab === 'pipeline'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Workflow className="w-4 h-4" />
              <span>4단계 딥러닝 파이프라인</span>
            </button>

            <button
              onClick={() => setSubTab('edge')}
              className={`px-3 py-2.5 rounded-lg whitespace-nowrap flex items-center space-x-1.5 transition ${
                subTab === 'edge'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>엣지 최적화 & 물리학</span>
            </button>

            <button
              onClick={() => setSubTab('demo')}
              className={`px-3 py-2.5 rounded-lg whitespace-nowrap flex items-center space-x-1.5 transition ${
                subTab === 'demo'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <MonitorPlay className="w-4 h-4" />
              <span>웹 MSA & 실시간 관제 데모</span>
            </button>
          </nav>
        </div>

        {/* TAB 1: DASHBOARD & OVERVIEW */}
        {subTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="relative z-10 max-w-3xl space-y-2">
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider border border-indigo-400/30">
                  System Executive Overview
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold leading-tight">
                  지능형 차량 번호판 인식(LPR) 연구 종합 대시보드
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  본 시스템은 저조도 전처리(Zero-DCE), 정밀 객체 검출(YOLO11 + Pose 변환), 시계열 추적(ByteTrack), 문맥 기반 OCR(PARSeq/PaddleOCR)을 통합한 엔드투엔드 LPR 솔루션입니다. 물리적 제약 및 개인정보 규제를 완벽히 준수하며 실시간 엣지 배포를 지원합니다.
                </p>
              </div>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 shadow-sm flex items-center space-x-3">
                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg">
                  <Gauge className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">추론 지연 시간</p>
                  <p className="text-xl font-bold text-white font-mono">&lt; 15 ms</p>
                  <p className="text-[11px] text-emerald-400">TensorRT INT8 기준</p>
                </div>
              </div>

              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 shadow-sm flex items-center space-x-3">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">인식 정밀도 (Recall)</p>
                  <p className="text-xl font-bold text-white font-mono">99.4 %</p>
                  <p className="text-[11px] text-emerald-400">악천후/왜곡 환경 포함</p>
                </div>
              </div>

              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 shadow-sm flex items-center space-x-3">
                <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">지원 번호판 규격</p>
                  <p className="text-xl font-bold text-white font-mono">5 종</p>
                  <p className="text-[11px] text-amber-400">2024 연두색 법인차 포함</p>
                </div>
              </div>

              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 shadow-sm flex items-center space-x-3">
                <div className="p-3 bg-sky-500/10 text-sky-400 rounded-lg">
                  <Video className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">실시간 처리 프레임</p>
                  <p className="text-xl font-bold text-white font-mono">60 FPS</p>
                  <p className="text-[11px] text-sky-400">FastAPI 스트리밍 연동</p>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: OCR Benchmark */}
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                    <BarChart2 className="w-4 h-4 text-indigo-400" />
                    <span>OCR 모델별 추론 속도 vs 정확도 트레이드오프</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    LPRNet, EasyOCR, PaddleOCR, PARSeq 아키텍처의 연산 속도(FPS) 및 복합 환경 문자 인식 정확도 비교.
                  </p>
                </div>
                <div className="relative w-full h-[320px]">
                  <canvas ref={ocrChartCanvasRef} />
                </div>
              </div>

              {/* Chart 2: Plate Category Distribution */}
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                    <PieChart className="w-4 h-4 text-indigo-400" />
                    <span>국내 차량 번호판 표준 구성비 및 3D 합성 필요도</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    실제 도로 수집 데이터의 클래스 불균형과 3D 합성(Synthetic Data) 데이터 보완 비중.
                  </p>
                </div>
                <div className="relative w-full h-[320px]">
                  <canvas ref={plateDistChartCanvasRef} />
                </div>
              </div>
            </div>

            {/* 4-Stage Architecture Flow Cards */}
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm">
              <h4 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
                <GitCommit className="w-4 h-4 text-indigo-400" />
                <span>엔드투엔드 4단계 추론 파이프라인 개요</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400">Stage 01</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">DCE-Net</span>
                  </div>
                  <h5 className="text-xs font-bold text-white">지능형 저조도 전처리</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Zero-DCE 기반 고차 톤 맵핑 곡선 추정으로 야간/악천후 노이즈 억제 및 RGB 색상 보정.
                  </p>
                </div>

                <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400">Stage 02</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">YOLO11 + Pose</span>
                  </div>
                  <h5 className="text-xs font-bold text-white">탐지 및 원근 왜곡 보정</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    C3k2 블록으로 미세 객체 탐지. 4개 코너 키포인트 회귀 분석 및 Perspective Transform 평면화.
                  </p>
                </div>

                <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400">Stage 03</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">ByteTrack</span>
                  </div>
                  <h5 className="text-xs font-bold text-white">시계열 다중 객체 추적</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Kalman Filter + 2단계 IoU 매칭. SciPy 선형 보간으로 가림 현상 극복 및 최적 키프레임 보팅.
                  </p>
                </div>

                <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400">Stage 04</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">PARSeq / CTC</span>
                  </div>
                  <h5 className="text-xs font-bold text-white">광학 문자 인식 (OCR)</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    ViT + XLNet 문맥 디코더 및 Beam Search 적용. 번호판 문법 제약(Grammar Constraints) 결합.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LEGAL & PLATE STANDARDS */}
        {subTab === 'legal' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm space-y-1">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <span>법적 규제, 개인정보 비식별화 및 번호판 규격 진화</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                LPR 시스템 구축 시 기술적 알고리즘과 더불어 개인정보보호위원회(PIPC) 가이드라인 준수가 필수적입니다. 또한 2024년 새로 도입된 연두색 법인 번호판을 비롯해 다양한 번호판 배경색과 제반 제약을 학습 파이프라인에 반영해야 합니다.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Interactive Plate Visualizer */}
              <div className="lg:col-span-6 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-white mb-1 flex items-center space-x-2">
                    <Palette className="w-4 h-4 text-indigo-400" />
                    <span>대한민국 번호판 종류별 대화형 뷰어 및 기술적 이슈</span>
                  </h4>
                  <p className="text-xs text-slate-400 mb-4">
                    버튼을 클릭하면 해당 번호판의 visual 스펙과 모델 반응 특성을 확인할 수 있습니다.
                  </p>

                  {/* Buttons */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button
                      onClick={() => setSelectedPlateKey('general')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        selectedPlateKey === 'general'
                          ? 'bg-indigo-600 text-white shadow'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      일반 승용차
                    </button>
                    <button
                      onClick={() => setSelectedPlateKey('corporate')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        selectedPlateKey === 'corporate'
                          ? 'bg-emerald-600 text-white shadow'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      연두색 (8천만원↑ 법인)
                    </button>
                    <button
                      onClick={() => setSelectedPlateKey('commercial')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        selectedPlateKey === 'commercial'
                          ? 'bg-amber-600 text-white shadow'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      영업용 (노랑)
                    </button>
                    <button
                      onClick={() => setSelectedPlateKey('eco')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        selectedPlateKey === 'eco'
                          ? 'bg-sky-600 text-white shadow'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      친환경 (파랑)
                    </button>
                    <button
                      onClick={() => setSelectedPlateKey('diplomat')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        selectedPlateKey === 'diplomat'
                          ? 'bg-blue-700 text-white shadow'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      외교용 (특수)
                    </button>
                  </div>

                  {/* Rendered Plate UI Box */}
                  <div
                    className={`w-full h-36 rounded-xl border-4 ${activePlate.border} ${activePlate.bg} flex flex-col items-center justify-center shadow-lg p-3 relative transition-all duration-300`}
                  >
                    {activePlate.region && (
                      <span className="text-xs font-bold text-slate-800 tracking-widest block mb-0.5">
                        {activePlate.region}
                      </span>
                    )}
                    <div className={`text-3xl font-extrabold font-mono tracking-wider ${activePlate.textColor}`}>
                      {activePlate.text}
                    </div>
                    <span
                      className={`absolute bottom-2 right-3 text-[10px] px-2 py-0.5 rounded font-bold ${activePlate.badgeBg}`}
                    >
                      {activePlate.badge}
                    </span>
                  </div>

                  {/* Plate Details */}
                  <div className="mt-4 p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                      <span className="font-bold text-slate-400">적용 대상</span>
                      <span className="text-indigo-400 font-semibold">{activePlate.target}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                      <span className="font-bold text-slate-400">규격 도입 시기</span>
                      <span className="text-slate-300 font-mono">{activePlate.date}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 block mb-1">인공지능 모델 학습 고려사항</span>
                      <p className="text-slate-300 leading-relaxed">{activePlate.notes}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: PIPC & GDPR Compliance Table */}
              <div className="lg:col-span-6 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-white mb-1 flex items-center space-x-2">
                    <Scale className="w-4 h-4 text-indigo-400" />
                    <span>개인정보보호위원회(PIPC) & GDPR 법적 컴플라이언스</span>
                  </h4>
                  <p className="text-xs text-slate-400 mb-3">
                    영상 수집부터 보존 기한까지 연구자/개발자가 이행해야 할 필수 규제 항목.
                  </p>

                  <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/60">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-slate-200 border-b border-slate-800">
                          <th className="p-3 font-bold">규제 항목</th>
                          <th className="p-3 font-bold">법적 요구사항 (2024~2026)</th>
                          <th className="p-3 font-bold">기술적 대응 방안</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-300">
                        <tr>
                          <td className="p-3 font-bold text-white">실시간 비식별화</td>
                          <td className="p-3">타인 얼굴 및 미인식 번호판 마스킹/블러 의무화</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                              Edge Auto-Blur
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3 font-bold text-white">데이터 보존 기한</td>
                          <td className="p-3">주행/관제 원본 영상 통상 1년 후 즉시 파기</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] font-bold">
                              Auto-TTL Cron Job
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3 font-bold text-white">가명정보 처리</td>
                          <td className="p-3">차량 등록번호 결합 통한 재식별 방지 조치</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                              Hash Salt Encryption
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3 font-bold text-white">적대적 보안 공격</td>
                          <td className="p-3">번호판 스티커/패치에 의한 인공지능 오작동 방지</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold">
                              Adversarial Training
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">
                      <strong>연구용 데이터셋 주의사항:</strong> AI Hub 등 공공 데이터 활용 시 라벨링 바운딩 박스를 제외한 나머지 보행자 영역은 반드시 비식별화(가명 처리)된 상태로 훈련 서버에 저장을 완료해야 합니다.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: 4-STAGE DL PIPELINE */}
        {subTab === 'pipeline' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm space-y-1">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <span>딥러닝 4단계 파이프라인 심층 분석 및 대화형 시뮬레이터</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                야간 영상 복원(Zero-DCE), YOLO11-Pose 키포인트 기반 원근 보정, ByteTrack 시계열 궤적 안정화, CTC/PARSeq 문맥 디코딩 프로세스를 대화형으로 탐색할 수 있습니다.
              </p>
            </div>

            {/* Stages 1 & 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Stage 1: Zero-DCE Tone Curve Slider */}
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                    <span>Zero-DCE 저조도 톤 맵핑 곡선 시뮬레이터</span>
                  </h4>
                  <span className="text-[11px] font-mono text-indigo-400">DCE-Net Light Curves</span>
                </div>
                <p className="text-xs text-slate-400">
                  슬라이더를 조절하여 어두운 야간 도로 입력 이미지의 픽셀 조도 개선 곡선(LE_n) 변화를 확인하세요.
                </p>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
                  <canvas ref={toneCurveCanvasRef} width={460} height={140} className="w-full max-w-[460px] h-[140px] block" />
                  <div className="w-full mt-3 flex items-center space-x-3">
                    <span className="text-xs text-slate-400 font-mono">조도 계수 (α):</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={zeroDceAlpha}
                      onChange={(e) => setZeroDceAlpha(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold font-mono text-indigo-400 w-10 text-right">
                      {(zeroDceAlpha / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stage 2: YOLO11-Pose Perspective Warp */}
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                    <span>YOLO11-Pose 모서리 키포인트 원근 보정 시뮬레이터</span>
                  </h4>
                  <span className="text-[11px] font-mono text-indigo-400">Perspective Transform</span>
                </div>
                <p className="text-xs text-slate-400">
                  측면 카메라 조영 각도에 의해 기울어진 번호판 4개 키포인트를 직사각형 평면으로 복원합니다.
                </p>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
                  <canvas ref={perspectiveCanvasRef} width={460} height={140} className="w-full max-w-[460px] h-[140px] block" />
                  <div className="w-full mt-3 flex justify-between items-center">
                    <button
                      onClick={() => setIsWarped(!isWarped)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow"
                    >
                      {isWarped ? '원근 복원 초기화' : '원근 보정(Unwarping) 실행'}
                    </button>
                    <span className={`text-xs font-mono ${isWarped ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {isWarped ? '상태: Perspective Transform 적용 완료 (정면 View)' : '상태: 왜곡된 입사각 35°'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stages 3 & 4 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Stage 3: ByteTrack */}
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">3</span>
                  <span>ByteTrack 다중 객체 추적 & SciPy 선형 보간 메커니즘</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  칼만 필터(Kalman Filter) 상태 벡터 x = [x, y, a, h, v_x, v_y, v_a, v_h]^T를 활용하여 프레임 가림(Occlusion) 시 궤적 파편화를 방지하고 최적 Keyframe을 선정합니다.
                </p>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono space-y-2 text-slate-300">
                  <div className="flex justify-between items-center">
                    <span>[Step 1] High Score Tracklet Association</span>
                    <span className="text-emerald-400 font-bold">IoU &gt; 0.6</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>[Step 2] Low Score Association (BYTE)</span>
                    <span className="text-indigo-400 font-bold">BYTE Recovered</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-800 pt-2">
                    <span>[Step 3] SciPy 1D Linear Interpolation</span>
                    <span className="text-amber-400 font-bold">Missing Frame Fill</span>
                  </div>
                </div>
              </div>

              {/* Stage 4: CTC Beam Search */}
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">4</span>
                  <span>CTC Loss & Beam Search 시퀀스 디코더 시뮬레이터</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  탐욕 탐색(Greedy Search) 대신 빔 크기(Beam Size)를 적용하여 한국어 번호판 문법 제약(Grammar) 기반의 단일 오인식을 수정합니다.
                </p>

                <div className="flex items-center space-x-2 pt-1">
                  <label className="text-xs text-slate-300 font-bold">Beam Size (K):</label>
                  <select
                    value={beamSize}
                    onChange={(e) => setBeamSize(e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-slate-200 rounded px-2.5 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="1">K = 1 (Greedy Search)</option>
                    <option value="3">K = 3 (Optimal Beam)</option>
                    <option value="5">K = 5 (High Grammar Check)</option>
                  </select>
                </div>

                <div className="p-3.5 bg-slate-950 text-slate-200 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
                  <p className="text-slate-500">// Output Sequence Path Prediction:</p>
                  {beamSize === '1' && (
                    <p className="text-rose-400 font-bold">Greedy Search: "52하 3491" (오인식: 빈 토큰 처리 실패)</p>
                  )}
                  {beamSize === '3' && (
                    <p className="text-emerald-400 font-bold">Beam Search (K=3): "52가 3491" (Prob: 0.942) [Grammar Corrected]</p>
                  )}
                  {beamSize === '5' && (
                    <p className="text-indigo-400 font-bold">Beam Search (K=5): "52가 3491" (Prob: 0.958) [High Confidence]</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: EDGE OPTIMIZATION & PHYSICS */}
        {subTab === 'edge' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm space-y-1">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-indigo-400" />
                <span>하드웨어 물리 제약 물리 계산기 & TensorRT/OpenVINO 최적화</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                차량 속도(km/h)와 카메라 셔터 지연(Latency, ms) 간의 물리적 변위 거리(d = v · t)를 계산하고 TensorRT INT8 양자화 캘리브레이션 성과를 대조합니다.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Shutter Latency Displacement Calculator */}
              <div className="lg:col-span-5 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Gauge className="w-4 h-4 text-indigo-400" />
                    <span>속도별 카메라 지연시간에 따른 이동 거리 계산기</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    차량 주행 속도와 카메라/엣지 장비의 트리거 지연 시간을 입력하세요.
                  </p>

                  <div className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold text-slate-300">차량 속도:</span>
                        <span className="font-mono font-bold text-indigo-400">{speedKmH} km/h</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="220"
                        value={speedKmH}
                        onChange={(e) => setSpeedKmH(Number(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold text-slate-300">카메라 셔터 지연시간:</span>
                        <span className="font-mono font-bold text-indigo-400">{latencyMs} ms</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="300"
                        value={latencyMs}
                        onChange={(e) => setLatencyMs(Number(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Calculated Result Display */}
                  <div className="p-4 bg-indigo-950/80 border border-indigo-800/60 text-white rounded-xl shadow-inner space-y-1">
                    <p className="text-xs text-indigo-300">1프레임/지연 당 차량 물리 이동 거리 (d):</p>
                    <p className="text-3xl font-extrabold font-mono text-emerald-400">
                      {distMeters.toFixed(2)} m
                    </p>
                    <p className={`text-xs ${getDisplacementEvaluation().className}`}>
                      {getDisplacementEvaluation().text}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: TensorRT / OpenVINO Benchmark Table */}
              <div className="lg:col-span-7 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-white mb-1 flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-indigo-400" />
                    <span>엣지 가속 엔진 및 정밀도(Quantization) 비교표</span>
                  </h4>
                  <p className="text-xs text-slate-400 mb-3">
                    NVIDIA Jetson Orin / Intel NUC 환경에서의 FP32, FP16, INT8 성능 벤치마크.
                  </p>

                  <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/60">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-slate-200 border-b border-slate-800">
                          <th className="p-3 font-bold">최적화 엔진</th>
                          <th className="p-3 font-bold">가중치 정밀도</th>
                          <th className="p-3 font-bold">메모리 점유율</th>
                          <th className="p-3 font-bold">추론 속도(FPS)</th>
                          <th className="p-3 font-bold">정확도 손실</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                        <tr>
                          <td className="p-3 font-bold text-white font-sans">PyTorch Standard</td>
                          <td className="p-3">FP32</td>
                          <td className="p-3">100% (Baseline)</td>
                          <td className="p-3">18 FPS</td>
                          <td className="p-3 text-slate-500">0.0%</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-bold text-indigo-400 font-sans">NVIDIA TensorRT</td>
                          <td className="p-3">FP16</td>
                          <td className="p-3">50% (-50%)</td>
                          <td className="p-3 font-bold text-white">42 FPS</td>
                          <td className="p-3 text-emerald-400">&lt; 0.1%</td>
                        </tr>
                        <tr className="bg-indigo-950/30">
                          <td className="p-3 font-bold text-indigo-300 font-sans">TensorRT + KL Calib</td>
                          <td className="p-3 font-bold text-indigo-300">INT8</td>
                          <td className="p-3 font-bold text-indigo-300">25% (-75%)</td>
                          <td className="p-3 font-bold text-emerald-400">85 FPS</td>
                          <td className="p-3 font-bold text-emerald-400">&lt; 0.8%</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-bold text-sky-400 font-sans">Intel OpenVINO</td>
                          <td className="p-3">INT8</td>
                          <td className="p-3">28% (-72%)</td>
                          <td className="p-3 text-white">64 FPS</td>
                          <td className="p-3 text-emerald-400">&lt; 0.9%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                    <p className="font-bold text-white">INT8 캘리브레이션 핵심 레시피:</p>
                    <p className="leading-relaxed text-slate-400">
                      Kullback-Leibler (KL) Divergence 알고리즘을 사용하여 주야간, 우천시, 희귀 번호판 표본이 균형 있게 포함된 500~1000장의 대표 캘리브레이션 세트를 통과시켜 활성화 스케일링 팩터를 도출합니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: WEB MSA & LIVE DEMO SIMULATION */}
        {subTab === 'demo' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm space-y-1">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <MonitorPlay className="w-5 h-5 text-indigo-400" />
                <span>FastAPI + Streamlit 마이크로서비스 관제 센터 실시간 데모</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                FastAPI 백엔드의 <code className="font-mono bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded text-indigo-400">StreamingResponse(multipart/x-mixed-replace)</code>와 Streamlit 대시보드를 시뮬레이션합니다. 아래 버튼을 통해 실시간 차량 검출 이벤트를 발생시켜 보세요.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Road Canvas */}
              <div className="lg:col-span-7 bg-slate-900/90 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between space-y-3 shadow-xl">
                <div className="flex justify-between items-center text-xs text-slate-300">
                  <span className="font-bold flex items-center space-x-1.5 text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>LIVE STREAM: http://localhost:8000/video_feed</span>
                  </span>
                  <span className="font-mono text-slate-400">Streamlit Component Active</span>
                </div>

                <div className="relative w-full h-64 bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
                  <canvas ref={liveCanvasRef} width={640} height={256} className="w-full h-full block" />
                </div>

                {/* Simulation Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => spawnVehicle('normal')}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition shadow"
                  >
                    <Car className="w-4 h-4" />
                    <span>일반 차량 진입</span>
                  </button>
                  <button
                    onClick={() => spawnVehicle('corporate')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition shadow"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>연두색 법인차 진입</span>
                  </button>
                  <button
                    onClick={handleToggleAutoSim}
                    className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs py-2.5 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition shadow"
                  >
                    {isAutoSim ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isAutoSim ? '자동 트래픽 중지' : '자동 트래픽 시작'}</span>
                  </button>
                </div>
              </div>

              {/* Event Log Table */}
              <div className="lg:col-span-5 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-bold text-white flex items-center space-x-1.5">
                      <ListOrdered className="w-4 h-4 text-indigo-400" />
                      <span>실시간 OCR 인식 이벤트 로그</span>
                    </h4>
                    <button
                      onClick={() => setLogs([])}
                      className="text-[11px] text-slate-400 hover:text-slate-200 transition"
                    >
                      초기화
                    </button>
                  </div>

                  <div className="overflow-y-auto max-h-64 border border-slate-800 rounded-xl bg-slate-950/60">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-slate-200 sticky top-0 border-b border-slate-800">
                          <th className="p-2">시각</th>
                          <th className="p-2">인식된 번호판</th>
                          <th className="p-2">종류</th>
                          <th className="p-2">신뢰도</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                        {logs.length > 0 ? (
                          logs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-900/60 transition">
                              <td className="p-2 text-slate-400">{log.time}</td>
                              <td className="p-2 font-bold text-white">{log.plate}</td>
                              <td className="p-2">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    log.type === '2024 연두색'
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-slate-800 text-slate-300'
                                  }`}
                                >
                                  {log.type}
                                </span>
                              </td>
                              <td className="p-2 text-emerald-400 font-bold">{log.confidence}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="p-6 text-center text-slate-500 font-sans">
                              아직 감지된 차량 이벤트가 없습니다. 왼쪽 버튼으로 차량을 발생시켜 보세요.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex justify-between items-center">
                  <span>FastAPI WebSocket / Polling 상태:</span>
                  <span className="text-emerald-400 font-bold flex items-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                    Connected (200 OK)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section Footer */}
        <div className="border-t border-slate-800/80 pt-4 text-center text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-400">딥러닝 기반 차량 번호판 인식(LPR) 시스템 엔지니어링 가이드</p>
          <p>Zero-DCE · YOLO11 · Pose Estimation · ByteTrack · PARSeq · TensorRT · FastAPI · Streamlit</p>
        </div>

      </div>
    </section>
  );
};
