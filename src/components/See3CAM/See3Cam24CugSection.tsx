import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import {
  Camera,
  Layers,
  ShieldCheck,
  Zap,
  Sun,
  Table as TableIcon,
  Calculator,
  ShieldAlert,
  Cpu,
  Compass,
  Sliders,
  BarChart2,
  DollarSign,
  LineChart,
  Eye,
  CheckCircle,
  XCircle,
  AlertOctagon,
  CheckSquare,
  Activity,
  Play,
  Network,
  HardDrive,
  ListChecks,
  ExternalLink,
  X,
  FileText,
  Code,
  Shield,
  Check,
  Ban,
  Terminal,
  Settings,
  SlidersHorizontal,
  ChevronRight,
  Maximize2,
  Gauge,
  Thermometer,
  Radio,
  FileCode2,
  Copy
} from 'lucide-react';

interface CameraModel {
  id: string;
  name: string;
  sensor: string;
  res: string;
  pixel: string;
  interface: string;
  interfaceType: 'USB' | 'MIPI';
  fps: number;
  mfg: string;
  ndaa: boolean;
  ndaaText: string;
  price: number;
  priceText: string;
  software: string[];
  url: string;
  desc: string;
}

const CAMERAS_DATA: CameraModel[] = [
  {
    id: 'econ-24cug',
    name: 'e-con Systems See3CAM_24CUG (주력 모델)',
    sensor: 'onsemi AR0234CS (2.3 MP)',
    res: '1920 × 1200',
    pixel: '3.0 µm × 3.0 µm',
    interface: 'USB 3.1 Gen 1',
    interfaceType: 'USB',
    fps: 120,
    mfg: 'e-con Systems / 인도 & 미국',
    ndaa: true,
    ndaaText: '준수 (Compliant)',
    price: 199,
    priceText: '$199.00 (M12) / $249 (Enclosure)',
    software: ['e-CAMView', 'QtCAM', 'V4L2', 'GStreamer', 'OpenCV'],
    url: 'https://www.e-consystems.com/industrial-cameras/ar0234-usb3-global-shutter-camera.asp',
    desc: 'onsemi AR0234CS 센서와 온보드 하드웨어 ISP를 내장하여 자동 노출(AE) 및 자동 화이트 밸런스(AWB)를 호스트 CPU 자원 소모 없이 처리합니다. Full HD에서 65 fps, 720p HD에서 120 fps의 초고속 전송을 지원하며 외부 하드웨어 트리거 및 스트로브 제어를 완벽 지원합니다.'
  },
  {
    id: 'rpi-gs',
    name: 'Raspberry Pi Global Shutter Camera',
    sensor: 'Sony IMX296LQR-C (1.58 MP)',
    res: '1456 × 1088',
    pixel: '3.45 µm × 3.45 µm',
    interface: 'MIPI CSI-2',
    interfaceType: 'MIPI',
    fps: 60,
    mfg: 'Raspberry Pi Ltd. / 영국',
    ndaa: true,
    ndaaText: '준수 (Compliant)',
    price: 55,
    priceText: '$55.00',
    software: ['libcamera', 'rpicam-apps', 'Picamera2', 'Python'],
    url: 'https://www.raspberrypi.com/products/raspberry-pi-global-shutter-camera/',
    desc: '라즈베리파이 재단이 임베디드 저비용 고속 동체 포착을 위해 설계한 카메라 모듈입니다. MIPI CSI-2 인터페이스로 직접 통신하여 CPU 오버헤드를 극적으로 낮추며, 3.45µm 대형 픽셀 사이즈로 짧은 노출 시간 속에서도 높은 SNR을 보장합니다.'
  },
  {
    id: 'basler-ace2',
    name: 'Basler ace 2 a2A1920-160ucBAS',
    sensor: 'Sony IMX392 Pregius (2.3 MP)',
    res: '1920 × 1200',
    pixel: '3.45 µm × 3.45 µm',
    interface: 'USB 3.0 (USB3 Vision)',
    interfaceType: 'USB',
    fps: 160,
    mfg: 'Basler AG / 독일',
    ndaa: true,
    ndaaText: '준수 (Compliant)',
    price: 389,
    priceText: '약 €359 / $389 ~ $505',
    software: ['Basler pylon SDK', 'GenICam', 'C++', 'Python'],
    url: 'https://www.baslerweb.com/en/shop/a2a1920-160ucbas/',
    desc: '독일의 정밀 머신 비전 기술력이 집약된 산업 표준 카메라입니다. 풀 해상도 160 fps의 압도적 속도를 내며 광학적으로 격리된 M8 GPIO 핀으로 극저지연 하드웨어 스트로브 제어를 완벽 지원합니다.'
  },
  {
    id: 'flir-blackfly',
    name: 'Teledyne FLIR Blackfly S BFS-U3-16S2C-CS',
    sensor: 'Sony IMX273 (1.6 MP)',
    res: '1440 × 1080',
    pixel: '3.45 µm × 3.45 µm',
    interface: 'USB 3.1 Gen 1',
    interfaceType: 'USB',
    fps: 226,
    mfg: 'Teledyne FLIR / 캐나다 & 미국',
    ndaa: true,
    ndaaText: '준수 (Compliant)',
    price: 315,
    priceText: '$315.00 ~ $556.00',
    software: ['Spinnaker SDK', 'GenICam', 'OpenCV', 'Python'],
    url: 'https://www.teledynevisionsolutions.com/products/blackfly-s-usb3?vertical=machine+vision&segment=iis',
    desc: '29mm×29mm×30mm 초소형 폼팩터에서 최대 226 fps의 폭발적인 영상 획득을 제공합니다. TAA 및 NDAA 제889조를 완벽히 준수하며 Spinnaker SDK를 통해 정교한 버퍼링과 하드웨어 I/O를 제어합니다.'
  },
  {
    id: 'hikrobot-cs016',
    name: 'Hikrobot MV-CS016-10UC',
    sensor: 'Global Shutter CMOS (1.6 MP)',
    res: '1440 × 1080',
    pixel: '3.45 µm × 3.45 µm',
    interface: 'USB 3.0',
    interfaceType: 'USB',
    fps: 249,
    mfg: 'Hikrobot (하이크비전 계열) / 중국',
    ndaa: false,
    ndaaText: '비준수 (BANNED 금지)',
    price: 580,
    priceText: '약 €534 (~$580)',
    software: ['MVS (Machine Vision Software)', 'USB3 Vision'],
    url: 'https://www.ztec.dk/shop/hikrobot-306301893-hikrobot-mv-cs016-10um-41478',
    desc: '하드웨어 스펙 상 최대 249.1 fps를 냄에도 불구, 미국 연방 정부가 조달을 엄격히 금지한 항저우 하이크비전의 계열사 제품입니다. 도입 시 미국 연방 자금 사업 자격 박탈 및 Rip-and-Replace 철거 리스크가 발생하므로 영구 배제 대상입니다.'
  },
  {
    id: 'econ-27cug',
    name: 'e-con Systems See3CAM_27CUG (RGB-IR)',
    sensor: 'OmniVision OV2312 RGB-IR (2.0 MP)',
    res: '1600 × 1300',
    pixel: '3.0 µm × 3.0 µm',
    interface: 'USB 3.2 Gen 1 (Type-C)',
    interfaceType: 'USB',
    fps: 36,
    mfg: 'e-con Systems / 인도 & 미국',
    ndaa: true,
    ndaaText: '준수 (Compliant)',
    price: 229,
    priceText: '$229.00 (M12 Holder)',
    software: ['e-CAMView', 'UVC Standard', 'V4L2', 'GStreamer'],
    url: 'https://www.e-consystems.com/usb-cameras/2mp-ov2312-global-shutter-rgb-ir-camera.asp',
    desc: 'RGB 프레임과 IR 프레임을 물리적 필터 구동 없이 센서 레벨 CFA로 분리 스트리밍하는 혁신 솔루션입니다. 기계적 모터 고장이 발생하지 않으며 -40°C~+80°C 혹한/혹서 공장 구내도로 시스템에 최적화되어 있습니다.'
  }
];

export const See3Cam24CugSection: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'deepdive' | 'matrix' | 'physics' | 'ndaa' | 'engineering' | 'recommender'>('deepdive');

  // Filter state for matrix
  const [ndaaFilter, setNdaaFilter] = useState<'ALL' | 'COMPLIANT' | 'BANNED'>('ALL');
  const [interfaceFilter, setInterfaceFilter] = useState<'ALL' | 'USB' | 'MIPI'>('ALL');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'fps-desc'>('price-asc');

  // Modal state
  const [selectedCamera, setSelectedCamera] = useState<CameraModel | null>(null);

  // Deep-dive Interactive Demo State
  const [activeResolutionMode, setActiveResolutionMode] = useState<'fhd_65' | 'hd_120' | 'vga_120'>('fhd_65');
  const [simExposureUs, setSimExposureUs] = useState<number>(250);
  const [simGainDb, setSimGainDb] = useState<number>(6);
  const [simHardwareIsp, setSimHardwareIsp] = useState<boolean>(true);
  const [simTriggerMode, setSimTriggerMode] = useState<'free_run' | 'hw_slave'>('hw_slave');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Physics Calculator State
  const [speedKmh, setSpeedKmh] = useState<number>(30);
  const [exposureUs, setExposureUs] = useState<number>(200);
  const [pixelResolutionMm, setPixelResolutionMm] = useState<number>(1.0);
  const [triggerLatencyMs, setTriggerLatencyMs] = useState<number>(1);

  // NDAA Auditor Checklist State
  const [auditQ1, setAuditQ1] = useState<boolean>(false);
  const [auditQ2, setAuditQ2] = useState<boolean>(false);
  const [auditQ3, setAuditQ3] = useState<boolean>(true);

  // Recommendation Engine State
  const [recSpeed, setRecSpeed] = useState<'low' | 'mid' | 'high'>('low');
  const [recNdaa, setRecNdaa] = useState<'must' | 'optional'>('must');
  const [recLighting, setRecLighting] = useState<'ir_strobe' | 'rgb_ir_dual'>('ir_strobe');
  const [recBudget, setRecBudget] = useState<'budget' | 'mid' | 'high'>('mid');

  // Canvas Waveform ref & state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animProgressRef = useRef<number>(0);
  const animTimerRef = useRef<number | null>(null);

  // Chart Canvas Refs
  const fpsChartRef = useRef<HTMLCanvasElement | null>(null);
  const priceChartRef = useRef<HTMLCanvasElement | null>(null);
  const physicsChartRef = useRef<HTMLCanvasElement | null>(null);
  const busChartRef = useRef<HTMLCanvasElement | null>(null);

  // Chart Instances
  const fpsChartInstance = useRef<Chart | null>(null);
  const priceChartInstance = useRef<Chart | null>(null);
  const physicsChartInstance = useRef<Chart | null>(null);
  const busChartInstance = useRef<Chart | null>(null);

  // Filtered cameras
  const filteredCameras = CAMERAS_DATA.filter((item) => {
    if (ndaaFilter === 'COMPLIANT' && !item.ndaa) return false;
    if (ndaaFilter === 'BANNED' && item.ndaa) return false;
    if (interfaceFilter !== 'ALL' && item.interfaceType !== interfaceFilter) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'fps-desc') return b.fps - a.fps;
    return 0;
  });

  // Physics Calculations
  const vMms = (speedKmh * 1000000) / 3600;
  const vMs = speedKmh / 3.6;
  const tSec = exposureUs / 1000000;
  const blurMm = vMms * tSec;
  const blurPx = blurMm / pixelResolutionMm;
  const tMaxSec = (1.0 * pixelResolutionMm) / vMms;
  const tMaxUs = Math.round(tMaxSec * 1000000);
  const latDistMm = vMs * triggerLatencyMs;

  // Waveform Drawer
  const drawWaveform = (ctx: CanvasRenderingContext2D, w: number, h: number, progress: number) => {
    ctx.clearRect(0, 0, w, h);

    // Background Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const y1 = h * 0.25; // Radar
    const y2 = h * 0.55; // Camera Shutter (AR0234CS)
    const y3 = h * 0.85; // Strobe Out (850nm LED)

    const triggerX = w * 0.3;
    const shutterX = triggerX + 5; // <1us latency
    const strobeWidth = w * 0.25;

    // Line 1: Radar Signal (Amber)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, y1);
    if (progress * w > triggerX) {
      ctx.lineTo(triggerX, y1);
      ctx.lineTo(triggerX, y1 - 25);
      ctx.lineTo(Math.min(progress * w, triggerX + strobeWidth), y1 - 25);
      if (progress * w > triggerX + strobeWidth) {
        ctx.lineTo(triggerX + strobeWidth, y1);
        ctx.lineTo(w, y1);
      }
    } else {
      ctx.lineTo(progress * w, y1);
    }
    ctx.stroke();

    // Line 2: Camera Opto-Coupler Shutter Integration (Emerald)
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, y2);
    if (progress * w > shutterX) {
      ctx.lineTo(shutterX, y2);
      ctx.lineTo(shutterX, y2 - 25);
      ctx.lineTo(Math.min(progress * w, shutterX + strobeWidth), y2 - 25);
      if (progress * w > shutterX + strobeWidth) {
        ctx.lineTo(shutterX + strobeWidth, y2);
        ctx.lineTo(w, y2);
      }
    } else {
      ctx.lineTo(progress * w, y2);
    }
    ctx.stroke();

    // Line 3: IR Strobe LED Output (Blue)
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, y3);
    if (progress * w > shutterX) {
      ctx.lineTo(shutterX, y3);
      ctx.lineTo(shutterX, y3 - 25);
      ctx.lineTo(Math.min(progress * w, shutterX + strobeWidth), y3 - 25);
      if (progress * w > shutterX + strobeWidth) {
        ctx.lineTo(shutterX + strobeWidth, y3);
        ctx.lineTo(w, y3);
      }
    } else {
      ctx.lineTo(progress * w, y3);
    }
    ctx.stroke();

    // Pulse Sync Marker Line
    if (progress * w > triggerX) {
      ctx.strokeStyle = '#ef4444';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(triggerX, 10);
      ctx.lineTo(triggerX, h - 10);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  };

  const triggerPulseSim = () => {
    animProgressRef.current = 0;
    if (animTimerRef.current) clearInterval(animTimerRef.current);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || 700;
    canvas.height = canvas.parentElement?.clientHeight || 200;

    animTimerRef.current = window.setInterval(() => {
      animProgressRef.current += 0.02;
      if (animProgressRef.current > 1.0) {
        animProgressRef.current = 1.0;
        if (animTimerRef.current) clearInterval(animTimerRef.current);
      }
      drawWaveform(ctx, canvas.width, canvas.height, animProgressRef.current);
    }, 20);
  };

  // Recommendation engine solver
  const getRecommendation = () => {
    let selected = CAMERAS_DATA[0]; // Default See3CAM_24CUG
    let matchScore = '99%';
    let reasonText = '';

    if (recLighting === 'rgb_ir_dual') {
      selected = CAMERAS_DATA[5]; // e-con See3CAM_27CUG
      matchScore = '99%';
      reasonText =
        '주야간 물리적 IR-Cut 필터 구동 고장 문제를 원천 차단하는 RGB-IR 듀얼 프레임 독립 분리 솔루션입니다. 극한의 온도(-40°C~+80°C) 환경 공장 구내도로 유지보수 효율성을 극대화합니다.';
    } else if (recBudget === 'budget' && recNdaa === 'must') {
      selected = CAMERAS_DATA[1]; // Raspberry Pi GS
      matchScore = '95%';
      reasonText =
        '대당 $55의 독보적 가성비와 임베디드 MIPI CSI-2 직접 연결을 지원하는 영국 제조 NDAA 완벽 준수 카메라 모듈입니다. 에지 컴퓨팅 밀폐 인클로저 내장형으로 최적입니다.';
    } else if (recSpeed === 'high') {
      selected = CAMERAS_DATA[3]; // Teledyne FLIR
      matchScore = '97%';
      reasonText =
        '초당 226 프레임(FPS)의 폭발적인 초고속 동체 판독 능력을 가진 북미 제조 TAA/NDAA 준수 하이엔드 카메라입니다.';
    } else {
      selected = CAMERAS_DATA[0]; // See3CAM_24CUG
      matchScore = '99%';
      reasonText =
        'onsemi AR0234CS 센서 기반으로 온보드 하드웨어 ISP(Auto Exposure / Auto White Balance)를 내장하여 호스트 CPU 부하가 전혀 없으며, $199대의 합리적 가격과 120 FPS 고속 글로벌 셔터를 완벽 지원하는 최고 균형 솔루션입니다.';
    }

    return { selected, matchScore, reasonText };
  };

  const recResult = getRecommendation();

  // Initialize Charts for Active Tab
  useEffect(() => {
    if (activeSubTab === 'matrix') {
      if (fpsChartRef.current) {
        if (fpsChartInstance.current) fpsChartInstance.current.destroy();
        const ctx = fpsChartRef.current.getContext('2d');
        if (ctx) {
          fpsChartInstance.current = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: CAMERAS_DATA.map((c) => c.name.split(' ')[0] + ' ' + (c.name.split(' ')[1] || '')),
              datasets: [
                {
                  label: '최대 프레임 레이트 (FPS)',
                  data: CAMERAS_DATA.map((c) => c.fps),
                  backgroundColor: CAMERAS_DATA.map((c) =>
                    c.id === 'econ-24cug' ? '#f59e0b' : c.ndaa ? '#2563eb' : '#dc2626'
                  ),
                  borderRadius: 6
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { y: { title: { display: true, text: 'FPS (Frames Per Second)' } } }
            }
          });
        }
      }

      if (priceChartRef.current) {
        if (priceChartInstance.current) priceChartInstance.current.destroy();
        const ctx = priceChartRef.current.getContext('2d');
        if (ctx) {
          priceChartInstance.current = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: CAMERAS_DATA.map((c) => c.name.split(' ')[0] + ' ' + (c.name.split(' ')[1] || '')),
              datasets: [
                {
                  label: '카메라 모듈 가격 ($ USD)',
                  data: CAMERAS_DATA.map((c) => c.price),
                  backgroundColor: CAMERAS_DATA.map((c) => (c.id === 'econ-24cug' ? '#f59e0b' : '#059669')),
                  borderRadius: 6
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { y: { title: { display: true, text: 'USD ($)' } } }
            }
          });
        }
      }
    }

    if (activeSubTab === 'physics') {
      if (physicsChartRef.current) {
        if (physicsChartInstance.current) physicsChartInstance.current.destroy();
        const ctx = physicsChartRef.current.getContext('2d');
        if (ctx) {
          const speeds = [10, 30, 50, 70, 90, 110, 130, 150];
          const blurData = speeds.map((vKmh) => {
            const vMmsVal = (vKmh * 1000000) / 3600;
            const blurMmVal = vMmsVal * (exposureUs / 1000000);
            return parseFloat((blurMmVal / pixelResolutionMm).toFixed(2));
          });

          physicsChartInstance.current = new Chart(ctx, {
            type: 'line',
            data: {
              labels: speeds,
              datasets: [
                {
                  label: '계산된 픽셀 번짐 수 (px)',
                  data: blurData,
                  borderColor: '#d97706',
                  backgroundColor: 'rgba(217, 119, 6, 0.1)',
                  fill: true,
                  tension: 0.3
                },
                {
                  label: 'ANPR 임계 한계선 (1.0 px)',
                  data: [1, 1, 1, 1, 1, 1, 1, 1],
                  borderColor: '#dc2626',
                  borderDash: [5, 5],
                  fill: false,
                  pointRadius: 0
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: 'top' } },
              scales: {
                x: { title: { display: true, text: '차량 속도 (km/h)' } },
                y: { title: { display: true, text: '번짐 픽셀 (px)' }, min: 0 }
              }
            }
          });
        }
      }
    }

    if (activeSubTab === 'engineering') {
      setTimeout(() => {
        triggerPulseSim();
      }, 100);

      if (busChartRef.current) {
        if (busChartInstance.current) busChartInstance.current.destroy();
        const ctx = busChartRef.current.getContext('2d');
        if (ctx) {
          busChartInstance.current = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: ['See3CAM USB 3.1 Gen1', 'MIPI CSI-2 (2-lane)', 'USB 3.2 Gen2', 'GigE (1Gbps)'],
              datasets: [
                {
                  label: '최대 전송 대역폭 (Gbps)',
                  data: [5.0, 2.5, 10.0, 1.0],
                  backgroundColor: ['#f59e0b', '#8b5cf6', '#059669', '#64748b'],
                  borderRadius: 6
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { y: { title: { display: true, text: 'Gbps (Gigabits per second)' } } }
            }
          });
        }
      }
    }

    return () => {
      if (fpsChartInstance.current) fpsChartInstance.current.destroy();
      if (priceChartInstance.current) priceChartInstance.current.destroy();
      if (physicsChartInstance.current) physicsChartInstance.current.destroy();
      if (busChartInstance.current) busChartInstance.current.destroy();
      if (animTimerRef.current) clearInterval(animTimerRef.current);
    };
  }, [activeSubTab]);

  // Update physics chart when slider changes
  useEffect(() => {
    if (activeSubTab === 'physics' && physicsChartInstance.current) {
      const speeds = [10, 30, 50, 70, 90, 110, 130, 150];
      const blurData = speeds.map((vKmh) => {
        const vMmsVal = (vKmh * 1000000) / 3600;
        const blurMmVal = vMmsVal * (exposureUs / 1000000);
        return parseFloat((blurMmVal / pixelResolutionMm).toFixed(2));
      });
      physicsChartInstance.current.data.datasets[0].data = blurData;
      physicsChartInstance.current.update();
    }
  }, [speedKmh, exposureUs, pixelResolutionMm, activeSubTab]);

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased pb-20">
      
      {/* Top Banner Header */}
      <header className="bg-slate-950 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10 ring-4 ring-amber-500/10">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-extrabold text-xl text-white tracking-tight">
                  e-con Systems See3CAM_24CUG
                </h1>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] px-2.5 py-0.5 rounded-full font-mono font-bold">
                  onsemi AR0234CS · 120 FPS · Onboard ISP
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded-full font-mono">
                  NDAA 준수
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                24GHz 레이더 동기화 글로벌 셔터 산업용 카메라 및 MiriCam 통합 엔지니어링 포털
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <a
              href="https://www.e-consystems.com/industrial-cameras/ar0234-usb3-global-shutter-camera.asp"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-amber-600/20 transition active:scale-95"
            >
              <span>공식 e-con 제품 페이지</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* KPI Stats Bar */}
      <section className="bg-slate-900/60 border-b border-slate-800 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
              <div className="text-[10px] text-slate-400 font-mono">센서 모델</div>
              <div className="text-sm font-bold text-white mt-0.5">onsemi AR0234CS</div>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
              <div className="text-[10px] text-slate-400 font-mono">해상도 / 픽셀</div>
              <div className="text-sm font-bold text-amber-400 mt-0.5">2.3 MP (3.0 µm BSI)</div>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
              <div className="text-[10px] text-slate-400 font-mono">최대 속도 (720p/FHD)</div>
              <div className="text-sm font-bold text-blue-400 mt-0.5">120 FPS / 65 FPS</div>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
              <div className="text-[10px] text-slate-400 font-mono">내장 프로세서</div>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">온보드 하드웨어 ISP</div>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
              <div className="text-[10px] text-slate-400 font-mono">인터페이스</div>
              <div className="text-sm font-bold text-purple-400 mt-0.5">USB 3.1 Gen 1 (5Gbps)</div>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
              <div className="text-[10px] text-slate-400 font-mono">기준 단가 (M12)</div>
              <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">$199.00</div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Sub-Tabs */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-6 overflow-x-auto text-xs sm:text-sm font-semibold no-scrollbar">
            {[
              { id: 'deepdive', label: 'See3CAM_24CUG 심층 연구실', icon: Camera },
              { id: 'matrix', label: '카메라 6종 비교 매트릭스', icon: TableIcon },
              { id: 'physics', label: 'ANPR 광학 & 모션블러 계산기', icon: Calculator },
              { id: 'ndaa', label: 'NDAA 규제 & 공급망 검증', icon: ShieldAlert },
              { id: 'engineering', label: '하드웨어 트리거 & 에지 아키텍처', icon: Cpu },
              { id: 'recommender', label: '맞춤 추천 엔진', icon: Compass }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={`py-3.5 px-1 inline-flex items-center space-x-2 whitespace-nowrap transition-all border-b-2 ${
                    isActive
                      ? 'border-amber-500 text-amber-400 font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* ========================================================================= */}
        {/* SUBTAB: SEE3CAM_24CUG DEEP-DIVE LAB */}
        {/* ========================================================================= */}
        {activeSubTab === 'deepdive' && (
          <div className="space-y-8">
            
            {/* Overview Card */}
            <div className="bg-slate-800/60 p-6 sm:p-8 rounded-3xl border border-slate-700/80 shadow-xl space-y-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-700 pb-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-semibold text-amber-400 mb-2 font-mono uppercase tracking-wider">
                    <Zap className="w-3.5 h-3.5" />
                    <span>e-con Systems Flagship Industrial Global Shutter</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    See3CAM_24CUG 하드웨어 아키텍처 &amp; ALPR 최적화 연구
                  </h2>
                  <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-3xl leading-relaxed">
                    onsemi 사의 1/2.6" 광학 포맷 AR0234CS 센서를 탑재하여 3.0µm BSI 픽셀의 높은 양자 효율(QE)을 달성하였으며, 전용 온보드 ISP가 호스트 CPU의 개입 없이 노출 제어 및 화이트 밸런스를 독립 수행하여 24GHz 레이더 기반 엣지 임베디드(NVIDIA Jetson, Raspberry Pi 5)에 가장 최적화된 산업용 카메라입니다.
                  </p>
                </div>

                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700 text-right min-w-[200px]">
                  <div className="text-[11px] text-slate-400 font-mono">M12 렌즈 홀더 / Enclosure</div>
                  <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">$199.00</div>
                  <div className="text-[10px] text-emerald-400 font-medium mt-1">NDAA Section 889 준수</div>
                </div>
              </div>

              {/* 4 Feature Highlights Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-700 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Gauge className="w-4 h-4" />
                    <span className="font-bold text-xs">최대 120 FPS 고속 포착</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    1280×720 HD 해상도에서 120 fps, 1920×1200 FHD에서 65 fps 무손실 YUV422/MJPEG/RAW 스트리밍으로 150km/h 과속 차량도 선명 포착.
                  </p>
                </div>

                <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-700 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Cpu className="w-4 h-4" />
                    <span className="font-bold text-xs">온보드 하드웨어 ISP 내장</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    자동 노출(AE), 자동 화이트 밸런스(AWB), 블랙 레벨 보정을 카메라 내부 전용 칩셋에서 처리하여 엣지 컴퓨터 CPU 사용률을 1% 미만으로 억제.
                  </p>
                </div>

                <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-700 space-y-2">
                  <div className="flex items-center gap-2 text-blue-400">
                    <Radio className="w-4 h-4" />
                    <span className="font-bold text-xs">하드웨어 외부 트리거 GPIO</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    8핀 전용 헤더를 통해 24GHz 레이더 진입 펄스 신호와 &lt;1µs 단위로 직접 동기화되며, 동기 850nm IR 스트로브 LED 발광 신호를 동시 제어.
                  </p>
                </div>

                <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-700 space-y-2">
                  <div className="flex items-center gap-2 text-purple-400">
                    <Thermometer className="w-4 h-4" />
                    <span className="font-bold text-xs">-30°C ~ +70°C 산업용 신뢰성</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    혹한 및 혹서의 도로변 함체 환경에서도 연속 가동 보장. 잠금형 USB Type-C / Micro-B 커넥터로 차량 진동에 의한 탈락 방지.
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Control & Simulation Bench */}
            <div className="bg-slate-800/60 p-6 rounded-3xl border border-slate-700/80 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">See3CAM_24CUG 현장 구동 파라미터 시뮬레이터</h3>
                    <p className="text-xs text-slate-400">해상도 모드, 노출 시간, 아날로그 게인 및 트리거 모드 실시간 조정</p>
                  </div>
                </div>
                <span className="text-xs bg-slate-900 text-amber-400 px-3 py-1 rounded-full border border-slate-700 font-mono font-bold">
                  USB 3.1 Gen 1 Active
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Control Panel */}
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">1. 해상도 및 프레임 레이트 모드</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'fhd_65', label: '1920×1200', sub: '65 FPS (Full)' },
                        { id: 'hd_120', label: '1280×720', sub: '120 FPS (HD)' },
                        { id: 'vga_120', label: '640×480', sub: '120 FPS (VGA)' }
                      ].map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setActiveResolutionMode(m.id as any)}
                          className={`p-2.5 rounded-xl border text-center transition ${
                            activeResolutionMode === m.id
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow'
                              : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="font-mono text-xs">{m.label}</div>
                          <div className="text-[10px] opacity-80 mt-0.5">{m.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-slate-300 font-semibold">2. 전자 셔터 노출 시간 (Exposure)</label>
                      <span className="font-mono font-bold text-amber-400">{simExposureUs} µs</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="1500"
                      value={simExposureUs}
                      step="25"
                      onChange={(e) => setSimExposureUs(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>50 µs (초고속 주행)</span>
                      <span>250 µs (권장 ANPR)</span>
                      <span>1500 µs (야간 저조도)</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-slate-300 font-semibold">3. 센서 아날로그 게인 (Gain)</label>
                      <span className="font-mono font-bold text-blue-400">+{simGainDb} dB</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="24"
                      value={simGainDb}
                      step="1"
                      onChange={(e) => setSimGainDb(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">4. 트리거 작동 모드</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setSimTriggerMode('hw_slave')}
                        className={`p-2.5 rounded-xl border text-center transition ${
                          simTriggerMode === 'hw_slave'
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                            : 'bg-slate-900 border-slate-700 text-slate-400'
                        }`}
                      >
                        <div className="font-bold text-xs">HW 트리거 슬레이브</div>
                        <div className="text-[10px] opacity-80 mt-0.5">24GHz 레이더 동기</div>
                      </button>
                      <button
                        onClick={() => setSimTriggerMode('free_run')}
                        className={`p-2.5 rounded-xl border text-center transition ${
                          simTriggerMode === 'free_run'
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                            : 'bg-slate-900 border-slate-700 text-slate-400'
                        }`}
                      >
                        <div className="font-bold text-xs">자유 실행 (Free-Run)</div>
                        <div className="text-[10px] opacity-80 mt-0.5">상시 비디오 스트림</div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Simulated Output & Number Plate OCR Feasibility */}
                <div className="lg:col-span-2 bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 shadow-inner">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                      <span className="text-xs font-mono text-slate-400">See3CAM_24CUG 가상 번호판 캡처 프리뷰</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600/40 text-[10px] font-mono">
                        Global Shutter: 왜곡 0%
                      </span>
                    </div>

                    {/* Virtual Captured Plate View */}
                    <div className="h-28 bg-slate-900 rounded-xl flex items-center justify-center relative overflow-hidden border border-slate-800">
                      <div
                        className="bg-slate-200 text-slate-950 font-mono font-black px-5 py-2.5 rounded-md border-3 border-blue-600 tracking-widest text-lg shadow-xl transition-all"
                        style={{
                          filter: `blur(${Math.max(0, (simExposureUs - 300) / 400)}px)`,
                          opacity: Math.max(0.6, 1 - simGainDb * 0.015)
                        }}
                      >
                        123가 4567
                      </div>

                      {/* Info Overlays */}
                      <div className="absolute top-2 left-2 text-[10px] font-mono text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                        FPS: {activeResolutionMode === 'fhd_65' ? '65 fps' : '120 fps'} · Shutter: {simExposureUs}µs
                      </div>
                      <div className="absolute bottom-2 right-2 text-[10px] font-mono text-emerald-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                        {simTriggerMode === 'hw_slave' ? 'HW Opto Pin Triggered (<1µs)' : 'Free Running Stream'}
                      </div>
                    </div>
                  </div>

                  {/* V4L2 Command Generator */}
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono font-bold">
                        <Terminal className="w-3.5 h-3.5" />
                        <span>Linux V4L2 파이프라인 구동 명령어 (Jetson / RPi)</span>
                      </div>
                      <button
                        onClick={() =>
                          handleCopyCode(
                            `v4l2-ctl -d /dev/video0 --set-fmt-video=width=${
                              activeResolutionMode === 'fhd_65' ? 1920 : activeResolutionMode === 'hd_120' ? 1280 : 640
                            },height=${
                              activeResolutionMode === 'fhd_65' ? 1200 : activeResolutionMode === 'hd_120' ? 720 : 480
                            },pixelformat=UYVY --set-ctrl=exposure_time_absolute=${simExposureUs} --set-ctrl=gain=${simGainDb}`
                          )
                        }
                        className="text-[11px] text-slate-300 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 flex items-center gap-1 transition"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedCode ? '복사됨!' : '명령어 복사'}</span>
                      </button>
                    </div>
                    <pre className="text-[11px] font-mono text-emerald-300 bg-slate-950 p-2.5 rounded-lg overflow-x-auto border border-slate-800">
                      <code>
                        v4l2-ctl -d /dev/video0 --set-fmt-video=width=
                        {activeResolutionMode === 'fhd_65' ? 1920 : activeResolutionMode === 'hd_120' ? 1280 : 640}
                        ,height=
                        {activeResolutionMode === 'fhd_65' ? 1200 : activeResolutionMode === 'hd_120' ? 720 : 480}
                        ,pixelformat=UYVY --set-ctrl=exposure_time_absolute={simExposureUs} --set-ctrl=gain={simGainDb}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* GPIO & Hardware Wiring Guide */}
            <div className="bg-slate-800/60 p-6 rounded-3xl border border-slate-700/80 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-amber-500" />
                <span>See3CAM_24CUG 8-Pin GPIO 헤더 및 24GHz 레이더 결선도</span>
              </h3>
              <p className="text-xs text-slate-400">
                카메라 후면의 8핀 외부 인터페이스 커넥터를 사용하여 레이더의 차량 진입 감지 디지털 출력 신호를 입력받고, 외부 850nm IR 조명 스트로브를 제어합니다.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono pt-2">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                  <span className="text-amber-400 font-bold">Pin 1: VBUS_5V</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">외부 보조 전원 (옵션 5V)</p>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                  <span className="text-emerald-400 font-bold">Pin 3: EXT_TRIGGER_IN</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">24GHz 레이더 진입 펄스 입력 (3.3V LVTTL)</p>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                  <span className="text-blue-400 font-bold">Pin 4: STROBE_OUT</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">850nm IR LED 발광 트리거 출력</p>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                  <span className="text-slate-400 font-bold">Pin 8: GND</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">공통 시스템 접지 (Signal Ground)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB: CAMERA COMPARISON MATRIX */}
        {/* ========================================================================= */}
        {activeSubTab === 'matrix' && (
          <div className="space-y-6">
            <div className="bg-slate-800/60 p-6 rounded-3xl border border-slate-700/80 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Sliders className="w-5 h-5 text-amber-500" />
                  <span>미리캠 LPR 카메라 6종 종합 사양 및 하드웨어 매트릭스</span>
                </h2>
                <span className="text-xs bg-slate-900/80 text-slate-300 px-3 py-1 rounded-full border border-slate-700 font-medium">
                  실시간 동적 필터링 적용
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                본 섹션에서는 미리캠의 24GHz 레이더 특허 기반 과속 차량 단속 시스템에 연동 가능한 글로벌 셔터 카메라 6종의 광학 센서, 인터페이스, 프레임 레이트, 가격 및 미국 국방수권법(NDAA Section 889) 적합성을 다각도로 분석합니다. 원하는 조건을 선택하여 최적의 사양을 선별하십시오.
              </p>
            </div>

            {/* Filters Bar */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-md">
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">NDAA 준수 여부</label>
                  <select
                    value={ndaaFilter}
                    onChange={(e) => setNdaaFilter(e.target.value as any)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-amber-500 font-medium"
                  >
                    <option value="ALL">전체 보기 (6종)</option>
                    <option value="COMPLIANT">NDAA 준수 장비만 (5종)</option>
                    <option value="BANNED">규제 대상 금지 장비만 (1종)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">인터페이스 타입</label>
                  <select
                    value={interfaceFilter}
                    onChange={(e) => setInterfaceFilter(e.target.value as any)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-amber-500 font-medium"
                  >
                    <option value="ALL">전체 인터페이스</option>
                    <option value="USB">USB 3.0 / 3.1 / 3.2</option>
                    <option value="MIPI">MIPI CSI-2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">정렬 기준</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-amber-500 font-medium"
                  >
                    <option value="price-asc">가격 낮은 순</option>
                    <option value="price-desc">가격 높은 순</option>
                    <option value="fps-desc">최대 프레임 속도(FPS) 순</option>
                  </select>
                </div>
              </div>

              <div className="text-xs text-slate-400">
                표시 중: <span className="font-mono font-bold text-amber-400">{filteredCameras.length}</span> 개 모델
              </div>
            </div>

            {/* Table */}
            <div className="bg-slate-900 rounded-2xl border border-slate-700/80 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-800 text-slate-300 border-b border-slate-700">
                      <th className="p-3.5 font-bold min-w-[160px]">카메라 모델명</th>
                      <th className="p-3.5 font-bold">이미지 센서 사양</th>
                      <th className="p-3.5 font-bold">인터페이스 / 속도</th>
                      <th className="p-3.5 font-bold">제조사 / 제조국</th>
                      <th className="p-3.5 font-bold text-center">NDAA 준수</th>
                      <th className="p-3.5 font-bold font-mono">추정 가격</th>
                      <th className="p-3.5 font-bold text-center">상세 정보</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {filteredCameras.map((item) => (
                      <tr
                        key={item.id}
                        className={`transition ${
                          item.id === 'econ-24cug'
                            ? 'bg-amber-500/10 hover:bg-amber-500/20 border-l-4 border-l-amber-500'
                            : 'hover:bg-slate-800/50'
                        }`}
                      >
                        <td className="p-3.5 font-bold text-white flex items-center gap-2">
                          {item.id === 'econ-24cug' && (
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                          )}
                          <span>{item.name}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-mono font-semibold text-slate-200">{item.sensor}</span>
                          <br />
                          <span className="text-[11px] text-slate-400">{item.res} ({item.pixel})</span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-mono text-slate-300">{item.interface}</span>
                          <br />
                          <span className="font-bold text-blue-400 font-mono">{item.fps} FPS</span>
                        </td>
                        <td className="p-3.5 text-slate-400">{item.mfg}</td>
                        <td className="p-3.5 text-center">
                          {item.ndaa ? (
                            <span className="px-2 py-0.5 rounded font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 text-[11px] inline-flex items-center space-x-1">
                              <Check className="w-3 h-3" />
                              <span>준수</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded font-bold bg-rose-950/80 text-rose-400 border border-rose-500/30 text-[11px] inline-flex items-center space-x-1">
                              <Ban className="w-3 h-3" />
                              <span>금지</span>
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-white">{item.priceText}</td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => setSelectedCamera(item)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-600 transition"
                          >
                            상세보기
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                    <BarChart2 className="w-4 h-4 text-blue-400" />
                    <span>카메라별 최대 프레임 레이트 (FPS) 비교</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">고속 동체 포착 성능 기준</span>
                </div>
                <div className="h-72 relative">
                  <canvas ref={fpsChartRef}></canvas>
                </div>
              </div>

              <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>카메라 모듈별 가격 비교 (USD $)</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">렌즈/하우징 옵션 제외</span>
                </div>
                <div className="h-72 relative">
                  <canvas ref={priceChartRef}></canvas>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB: OPTICAL PHYSICS CALCULATOR */}
        {/* ========================================================================= */}
        {activeSubTab === 'physics' && (
          <div className="space-y-6">
            <div className="bg-slate-800/60 p-6 rounded-3xl border border-slate-700/80 shadow-sm space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-amber-500" />
                <span>ANPR 모션 블러(Motion Blur) &amp; 허용 노출 시간 물리 시뮬레이터</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                차량 번호판 인식(ANPR)의 성공 여부는 물리적 속도로 인한 픽셀 번짐 현상을 수학적으로 제어하는 것에 달려 있습니다. 아래 시뮬레이터를 통해 차량 속도(v)와 카메라 노출 시간(t), 트리거 지연 시간(Jitter)에 따른 번짐 크기 및 이동 거리를 계산해 보세요.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950 text-white rounded-2xl space-y-2 border border-slate-800 shadow-md">
                <span className="text-xs text-amber-400 font-mono font-bold">[수식 1] 모션 블러 거리 계산</span>
                <p className="text-lg font-mono font-bold text-emerald-400">b = v × t</p>
                <p className="text-xs text-slate-300">
                  b: 모션 블러 거리(mm), v: 차량 이동 속도(mm/s), t: 센서 노출 시간(초)
                </p>
              </div>

              <div className="p-4 bg-slate-950 text-white rounded-2xl space-y-2 border border-slate-800 shadow-md">
                <span className="text-xs text-amber-400 font-mono font-bold">[수식 2] 최대 허용 노출 시간 계산</span>
                <p className="text-lg font-mono font-bold text-amber-400">t_max = (n_allowed × p_obj) / v</p>
                <p className="text-xs text-slate-300">
                  n_allowed: 허용 픽셀 번짐 수(보통 1px), p_obj: 픽셀당 실물 해상도(mm/pixel)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/80 shadow-sm space-y-5">
                <h3 className="font-bold text-white text-sm flex items-center space-x-2 border-b border-slate-700 pb-3">
                  <Sliders className="w-4 h-4 text-amber-500" />
                  <span>현장 주행 조건 파라미터 설정</span>
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="font-medium text-slate-300">차량 주행 속도 (km/h)</label>
                      <span className="font-mono font-bold text-blue-400">{speedKmh} km/h</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="150"
                      value={speedKmh}
                      step="5"
                      onChange={(e) => setSpeedKmh(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>10 km/h (구내)</span>
                      <span>80 km/h (일반)</span>
                      <span>150 km/h (고속)</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="font-medium text-slate-300">카메라 노출 시간 (µs)</label>
                      <span className="font-mono font-bold text-emerald-400">
                        {exposureUs} µs (1/{Math.round(1000000 / exposureUs)}s)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="2000"
                      value={exposureUs}
                      step="10"
                      onChange={(e) => setExposureUs(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="font-medium text-slate-300">픽셀 당 실물 해상도 (mm/px)</label>
                      <span className="font-mono font-bold text-purple-400">{pixelResolutionMm.toFixed(1)} mm/px</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="3.0"
                      value={pixelResolutionMm}
                      step="0.1"
                      onChange={(e) => setPixelResolutionMm(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="font-medium text-slate-300">트리거 지연 시간 (Trigger Latency)</label>
                      <span className="font-mono font-bold text-amber-400">{triggerLatencyMs} ms</span>
                    </div>
                    <select
                      value={triggerLatencyMs}
                      onChange={(e) => setTriggerLatencyMs(parseFloat(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs"
                    >
                      <option value="1">1 ms (머신비전 GPIO 직결 / 라즈베리파이 CSI-2)</option>
                      <option value="50">50 ms (일반 교통 전용 IP 카메라)</option>
                      <option value="200">200 ms (일반 네트워크 CCTV / 소프트웨어 트리거)</option>
                    </select>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl space-y-3 font-mono text-xs border border-slate-800">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-slate-400">초당 이동 거리:</span>
                    <span className="text-white font-bold">{vMs.toFixed(2)} m/s</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-slate-400">발생 모션 블러 거리:</span>
                    <span className="text-emerald-400 font-bold">{blurMm.toFixed(2)} mm</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-slate-400">픽셀 번짐 수 (Pixel Smear):</span>
                    <span className="text-amber-400 font-bold">{blurPx.toFixed(2)} px</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-slate-400">1px 이하 유지 위한 최적 노출:</span>
                    <span className="text-blue-400 font-bold">{tMaxUs} µs</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">트리거 지연 시 이동 거리:</span>
                    <span className="text-rose-400 font-bold">
                      {(latDistMm / 10).toFixed(2)} cm ({latDistMm.toFixed(1)} mm)
                    </span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/80 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                      <LineChart className="w-4 h-4 text-emerald-400" />
                      <span>속도 변화에 따른 픽셀 번짐(Motion Blur) 영향 시각화</span>
                    </h3>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded font-bold border ${
                        blurPx <= 1.0
                          ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30'
                          : blurPx <= 2.5
                          ? 'bg-amber-950/80 text-amber-400 border-amber-500/30'
                          : 'bg-rose-950/80 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {blurPx <= 1.0
                        ? '선명함 (ANPR OCR 인식 우수)'
                        : blurPx <= 2.5
                        ? '미세 번짐 (조명 보정 필요)'
                        : '심한 모션 블러 (OCR 판독 불가)'}
                    </span>
                  </div>
                  <div className="h-72 relative">
                    <canvas ref={physicsChartRef}></canvas>
                  </div>
                </div>

                <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/80 shadow-sm space-y-3">
                  <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-amber-400" />
                    <span>글로벌 셔터 vs 롤링 셔터 기하학 왜곡(Jello Effect) 비교 체감</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-2">
                      <span className="text-xs font-bold text-emerald-400 flex items-center justify-center space-x-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>글로벌 셔터 (See3CAM_24CUG 탑재)</span>
                      </span>
                      <div className="h-20 bg-slate-900 rounded-lg flex items-center justify-center relative overflow-hidden border border-slate-800">
                        <div className="bg-slate-200 text-slate-950 font-mono font-black px-3 py-1 rounded border-2 border-blue-600 tracking-widest text-sm shadow">
                          123가 4567
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400">전체 픽셀 동시 노출으로 고속 이동 시 왜곡 없음</p>
                    </div>

                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-2">
                      <span className="text-xs font-bold text-rose-400 flex items-center justify-center space-x-1">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>롤링 셔터 (Rolling Shutter)</span>
                      </span>
                      <div className="h-20 bg-slate-900 rounded-lg flex items-center justify-center relative overflow-hidden border border-slate-800">
                        <div className="bg-slate-200 text-slate-950 font-mono font-black px-3 py-1 rounded border-2 border-rose-600 tracking-widest text-sm skew-x-12 shadow">
                          123가 4567
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400">행(Row) 단위 순차 판독으로 사선 기하학 젤로 왜곡 발생</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB: NDAA REGULATION */}
        {/* ========================================================================= */}
        {activeSubTab === 'ndaa' && (
          <div className="space-y-6">
            <div className="bg-slate-800/60 p-6 rounded-3xl border border-slate-700/80 shadow-sm space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                <span>글로벌 공급망 보안과 NDAA 제889조 &amp; FAR 규정 심층 검증</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                미국 2019 회계연도 국방수권법(NDAA) Section 889 및 연방조달규정(FAR) 52.204-25는 안보 위험 중국 통신 및 영상 감시 모듈의 조달을 엄격히 금지합니다. e-con Systems는 인도 및 미국 법인 기반으로 전 제품 NDAA Section 889를 완벽 준수합니다.
              </p>
            </div>

            <div className="bg-rose-950/60 text-white p-6 rounded-2xl border border-rose-900 shadow-md space-y-4">
              <div className="flex items-center space-x-3 border-b border-rose-900/80 pb-3">
                <div className="p-2 bg-rose-600 rounded-lg text-white">
                  <AlertOctagon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-rose-200">NDAA Section 889 명시적 금지 5대 중국 기업 및 자회사</h3>
                  <p className="text-xs text-rose-300">외부 상표 변경(White-Labeling) 및 OEM 부품 탑재 제품도 법적 규제 대상 포함</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2 text-xs">
                <div className="bg-rose-900/40 p-3 rounded-xl border border-rose-800 text-center space-y-1">
                  <p className="font-bold text-white text-sm">Huawei</p>
                  <p className="text-[11px] text-rose-300">화웨이 &amp; HiSilicon</p>
                </div>
                <div className="bg-rose-900/40 p-3 rounded-xl border border-rose-800 text-center space-y-1">
                  <p className="font-bold text-white text-sm">ZTE</p>
                  <p className="text-[11px] text-rose-300">ZTE Corporation</p>
                </div>
                <div className="bg-rose-900/40 p-3 rounded-xl border border-rose-800 text-center space-y-1">
                  <p className="font-bold text-white text-sm">Hytera</p>
                  <p className="text-[11px] text-rose-300">하이트라 통신</p>
                </div>
                <div className="bg-rose-900/60 p-3 rounded-xl border-2 border-amber-500 text-center space-y-1 shadow-md">
                  <p className="font-bold text-amber-300 font-black text-sm">Hikvision</p>
                  <p className="text-[11px] text-rose-200 font-semibold">하이크비전 &amp; Hikrobot</p>
                </div>
                <div className="bg-rose-900/40 p-3 rounded-xl border border-rose-800 text-center space-y-1">
                  <p className="font-bold text-white text-sm">Dahua</p>
                  <p className="text-[11px] text-rose-300">다후아 테크놀로지</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/80 shadow-sm space-y-5">
              <h3 className="font-bold text-white text-base flex items-center space-x-2">
                <CheckSquare className="w-5 h-5 text-emerald-400" />
                <span>See3CAM_24CUG 기반 프로젝트 NDAA 규제 위험도 자가 진단 시뮬레이터</span>
              </h3>

              <div className="space-y-3 text-xs">
                <label className="flex items-start space-x-3 p-3 bg-slate-900/80 rounded-xl border border-slate-700 cursor-pointer hover:bg-slate-900 transition">
                  <input
                    type="checkbox"
                    checked={auditQ1}
                    onChange={(e) => setAuditQ1(e.target.checked)}
                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                  />
                  <div>
                    <span className="font-bold text-slate-200">
                      질문 1. 선택한 카메라의 제조사 또는 메인 이미지 SoC가 Hikvision/Hikrobot, Dahua 또는 HiSilicon 제조품인가요?
                    </span>
                    <p className="text-slate-400 mt-0.5">See3CAM_24CUG는 onsemi(미국) 센서 탑재로 해당 없음(안전)</p>
                  </div>
                </label>

                <label className="flex items-start space-x-3 p-3 bg-slate-900/80 rounded-xl border border-slate-700 cursor-pointer hover:bg-slate-900 transition">
                  <input
                    type="checkbox"
                    checked={auditQ2}
                    onChange={(e) => setAuditQ2(e.target.checked)}
                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                  />
                  <div>
                    <span className="font-bold text-slate-200">
                      질문 2. 해당 카메라 시스템이 설치되는 공장/사업장이 미국 연방 정부나 미군, 방위산업체와 1차/하도급 계약을 맺고 있나요?
                    </span>
                    <p className="text-slate-400 mt-0.5">FAR 52.204-25에 의해 별도의 VLAN 분리망이라도 규제 장비 부착 시 계약 즉시 해지 대상</p>
                  </div>
                </label>

                <label className="flex items-start space-x-3 p-3 bg-slate-900/80 rounded-xl border border-slate-700 cursor-pointer hover:bg-slate-900 transition">
                  <input
                    type="checkbox"
                    checked={auditQ3}
                    onChange={(e) => setAuditQ3(e.target.checked)}
                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                  />
                  <div>
                    <span className="font-bold text-slate-200">
                      질문 3. 공급업체로부터 서명된 'NDAA 준수 선언서(Compliance Statement)' 및 FCC ID 검증 조사를 완료하셨나요?
                    </span>
                    <p className="text-slate-400 mt-0.5">e-con Systems 공식 준수 선언서 및 TAA 보증서 발급 가능</p>
                  </div>
                </label>
              </div>

              {auditQ1 && auditQ2 ? (
                <div className="p-4 bg-rose-950/80 border border-rose-500/40 rounded-xl flex items-center space-x-4 shadow">
                  <div className="p-3 bg-rose-600 text-white rounded-lg">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-rose-300 text-sm">CRITICAL RISK: 연방조달법(FAR 52.204-25) 제재 위반 위험 발생!</h4>
                    <p className="text-xs text-rose-200 mt-0.5">
                      Hikvision/Hikrobot 등 금지 중국 칩셋 카메라가 연방 계약 관련 공장에 탑재될 경우 전체 시설의 조달 계약 해지 및 강제 철거 손실이 발생합니다.
                    </p>
                  </div>
                </div>
              ) : auditQ1 ? (
                <div className="p-4 bg-amber-950/80 border border-amber-500/40 rounded-xl flex items-center space-x-4 shadow">
                  <div className="p-3 bg-amber-600 text-white rounded-lg">
                    <AlertOctagon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-300 text-sm">WARNING: NDAA Section 889 비준수 장비 사용 중</h4>
                    <p className="text-xs text-amber-200 mt-0.5">
                      준수 카메라인 e-con Systems See3CAM_24CUG, Basler, FLIR로 교체를 권장합니다.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-emerald-950/80 border border-emerald-500/40 rounded-xl flex items-center space-x-4 shadow">
                  <div className="p-3 bg-emerald-600 text-white rounded-lg">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-300 text-sm">See3CAM_24CUG: NDAA 규제 무결성 안전 상태</h4>
                    <p className="text-xs text-emerald-200 mt-0.5">
                      미국 국방수권법 Section 889 및 FAR 조달 규정을 100% 준수하며 방산 및 글로벌 공장 진입에 문제 없습니다.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB: HARDWARE TRIGGER & ARCHITECTURE */}
        {/* ========================================================================= */}
        {activeSubTab === 'engineering' && (
          <div className="space-y-6">
            <div className="bg-slate-800/60 p-6 rounded-3xl border border-slate-700/80 shadow-sm space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-amber-500" />
                <span>하드웨어 스트로브 트리거링 &amp; 에지 컴퓨팅 통신 파이프라인</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                과속 차량 ANPR의 무결점 캡처를 위해서는 소프트웨어 지연(Jitter)을 방지하는 마이크로초(µs) 단위의 옵토커플러(Opto-coupler) 하드웨어 트리거 회로와 에지 디바이스 간 인터페이스 대역폭 설계가 필수적입니다.
              </p>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">마스터-슬레이브 마이크로초(µs) 하드웨어 펄스 동기화 실시간 파형</h3>
                    <p className="text-xs text-slate-400">24GHz 레이더 진입 펄스 → See3CAM 센서 노출 → IR 스트로브 LED 발광 동기화</p>
                  </div>
                </div>
                <button
                  onClick={triggerPulseSim}
                  className="bg-amber-600 hover:bg-amber-500 text-white text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 font-bold shadow-lg shadow-amber-600/20 transition active:scale-95 self-start sm:self-auto"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>트리거 펄스 인가</span>
                </button>
              </div>

              <div className="w-full h-48 bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden">
                <canvas ref={canvasRef} className="w-full h-full block"></canvas>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1 font-mono">
                <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                  <span className="text-amber-400 font-bold">1. Radar Sensor Out (Rising Edge)</span>
                  <p className="text-slate-300 text-[11px] mt-0.5">24GHz 레이더 차량 감지 신호 인가 (0V → +12V)</p>
                </div>
                <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                  <span className="text-emerald-400 font-bold">2. Camera Opto In &amp; Integration</span>
                  <p className="text-slate-300 text-[11px] mt-0.5">See3CAM GPIO 핀 광학 결합 통과, &lt;1µs 노출 전개</p>
                </div>
                <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                  <span className="text-blue-400 font-bold">3. Strobe Light Pulse Out</span>
                  <p className="text-slate-300 text-[11px] mt-0.5">카메라 Pulse Out → 100µs 동기 850nm IR LED 발광</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                    <Network className="w-4 h-4 text-purple-400" />
                    <span>카메라 인터페이스별 최대 데이터 대역폭 비교</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">Gbps 단위</span>
                </div>
                <div className="h-72 relative">
                  <canvas ref={busChartRef}></canvas>
                </div>
              </div>

              <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/80 shadow-sm space-y-4">
                <h3 className="font-bold text-white text-sm flex items-center space-x-2 border-b border-slate-700 pb-3">
                  <HardDrive className="w-4 h-4 text-blue-400" />
                  <span>에지 인터페이스 방식별 미리캠 통합 평가</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30">
                    <div className="flex items-center justify-between font-bold text-amber-300 mb-1">
                      <span>USB 3.1 Gen 1 (e-con See3CAM_24CUG)</span>
                      <span className="text-amber-400 font-mono">5 Gbps Bandwidth</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      범용 플러그 앤 플레이 및 온보드 ISP 하드웨어 내장. 케이블 길이 최대 3~5m 확보 가능하여 24GHz 레이더 분리형 박스 구성에 최적.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700">
                    <div className="flex items-center justify-between font-bold text-white mb-1">
                      <span>MIPI CSI-2 (Raspberry Pi GS Camera)</span>
                      <span className="text-emerald-400 font-mono">CPU Overhead &lt; 2%</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                      센서 직결 통신 방식으로 초저지연을 제공하나, 물리적 FPC 케이블 길이가 30cm 이내로 제한됨. 단일 밀폐 함체형에 적합.
                    </p>
                  </div>

                  <div className="p-3 bg-purple-950/50 rounded-xl border border-purple-800/80">
                    <div className="flex items-center justify-between font-bold text-purple-300 mb-1">
                      <span>RGB-IR Dual Streaming (See3CAM_27CUG)</span>
                      <span className="text-purple-400 font-mono">OV2312 CFA Frame Split</span>
                    </div>
                    <p className="text-purple-200/90 leading-relaxed">
                      물리적 IR-Cut 필터 모터 구동부가 없어 -40°C~+80°C 기계식 고장률 0%.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB: RECOMMENDATION ENGINE */}
        {/* ========================================================================= */}
        {activeSubTab === 'recommender' && (
          <div className="space-y-6">
            <div className="bg-slate-800/60 p-6 rounded-3xl border border-slate-700/80 shadow-sm space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Compass className="w-5 h-5 text-amber-500" />
                <span>미리캠 현장 조건별 맞춤 카메라 선정 추천 엔진</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                설치 환경의 도로 환경, 예산 구조, 주야간 조도 요구 조건 및 규제 기준을 선택하시면 시스템 통합 설계에 가장 적합한 모델을 즉시 매칭해 드립니다.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/80 shadow-sm space-y-5">
                <h3 className="font-bold text-white text-sm border-b border-slate-700 pb-3 flex items-center space-x-2">
                  <ListChecks className="w-4 h-4 text-amber-500" />
                  <span>설치 환경 파라미터 선택</span>
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">1. 타깃 도로 속도 환경</label>
                    <select
                      value={recSpeed}
                      onChange={(e) => setRecSpeed(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-medium"
                    >
                      <option value="low">공장/학교 구내 도로 (30 km/h 이하)</option>
                      <option value="mid">시가지 도로 / 진입로 (50 ~ 80 km/h)</option>
                      <option value="high">고속 주행 도로 (100 km/h 이상)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-300 mb-1">2. NDAA 미국 국방수권법 적용 여부</label>
                    <select
                      value={recNdaa}
                      onChange={(e) => setRecNdaa(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-medium"
                    >
                      <option value="must">필수 (글로벌 공장, 방산, 연방 계약 사업장)</option>
                      <option value="optional">상관없음 (국내 일반 민간 사업장)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-300 mb-1">3. 주야간 조도 변화 대응 방식</label>
                    <select
                      value={recLighting}
                      onChange={(e) => setRecLighting(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-medium"
                    >
                      <option value="ir_strobe">외부 IR 스트로브 조명 연동</option>
                      <option value="rgb_ir_dual">기계식 모터 없는 RGB-IR 듀얼 센서 선호</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-300 mb-1">4. 시스템 예산 범위 (대당 카메라 모듈)</label>
                    <select
                      value={recBudget}
                      onChange={(e) => setRecBudget(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-medium"
                    >
                      <option value="budget">초저가 초경량 모듈 ($100 이하)</option>
                      <option value="mid">중범위 산업용 모듈 ($150 ~ $300) - 권장</option>
                      <option value="high">하이엔드 하이프레임 모듈 ($350 이상)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 bg-slate-950 text-white p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-6 shadow-md">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-widest">
                      Recommended Camera Selection
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs px-3 py-1 rounded-full font-mono font-bold">
                      적합도 {recResult.matchScore}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-white">{recResult.selected.name}</h3>
                    <p className="text-xs text-amber-300 font-mono">
                      {recResult.selected.mfg} / {recResult.selected.sensor} / {recResult.selected.fps} FPS / {recResult.selected.ndaaText}
                    </p>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-4 rounded-xl border border-slate-800">
                    {recResult.reasonText}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                    <div className="p-2 bg-slate-900 rounded border border-slate-800 text-center">
                      <span className="text-slate-400 block text-[10px]">센서</span>
                      <span className="font-bold text-white">{recResult.selected.sensor.split(' ')[1]}</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800 text-center">
                      <span className="text-slate-400 block text-[10px]">최대 속도</span>
                      <span className="font-bold text-emerald-400">{recResult.selected.fps} FPS</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800 text-center">
                      <span className="text-slate-400 block text-[10px]">NDAA 준수</span>
                      <span className="font-bold text-emerald-400">{recResult.selected.ndaaText}</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800 text-center">
                      <span className="text-slate-400 block text-[10px]">예상 단가</span>
                      <span className="font-bold text-amber-400">{recResult.selected.priceText.split(' ')[0]}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <span className="text-xs text-slate-400">상세 조달 파트너 및 구매 페이지 연결</span>
                  <a
                    href={recResult.selected.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center space-x-1.5 transition shadow-lg shadow-amber-600/20"
                  >
                    <span>제조사 공식 조달 페이지 방문</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Modal Drawer */}
      {selectedCamera && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-700 flex flex-col max-h-[90vh]">
            <div className="p-5 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">{selectedCamera.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">{selectedCamera.sensor} / {selectedCamera.mfg}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCamera(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">센서 해상도</span>
                  <span className="font-bold text-white text-sm">{selectedCamera.res}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">픽셀 크기</span>
                  <span className="font-bold text-white text-sm">{selectedCamera.pixel}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">최대 프레임 속도</span>
                  <span className="font-bold text-blue-400 text-sm">{selectedCamera.fps} FPS</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white text-xs flex items-center space-x-1">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span>상세 분석 심층 설명</span>
                </h4>
                <p className="text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
                  {selectedCamera.desc}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white text-xs flex items-center space-x-1">
                  <Code className="w-4 h-4 text-purple-400" />
                  <span>지원 소프트웨어 &amp; 드라이버 프레임워크</span>
                </h4>
                <div className="flex flex-wrap gap-1.5 font-mono">
                  {selectedCamera.software.map((sw) => (
                    <span
                      key={sw}
                      className="px-2.5 py-1 bg-slate-800 text-slate-200 rounded-md font-medium text-[11px] border border-slate-700"
                    >
                      {sw}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-amber-950/40 border border-amber-500/30 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-amber-400 font-bold block">공식 구입처 단가</span>
                  <span className="text-lg font-extrabold text-amber-300 font-mono">{selectedCamera.priceText}</span>
                </div>
                <a
                  href={selectedCamera.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center space-x-1 transition shadow"
                >
                  <span>공식 구매 사이트 이동</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedCamera(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-4 py-2 rounded-lg font-medium transition"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-slate-800 text-xs text-slate-500 text-center">
        <p>㈜아이티에스뱅크 (ITS Bank) '미리캠(MiriCam)' ANPR 광학 아키텍처 보고서 · e-con Systems See3CAM_24CUG Integration Guide</p>
      </footer>
    </div>
  );
};
