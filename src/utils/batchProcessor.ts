import { AugmentationParams, PlateType } from '../types/alpr';

export interface BatchItem {
  id: string;
  name: string;
  originalUrl: string;
  augmentedUrl?: string;
  size: string;
  groundTruth: string;
  plateType: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  ocrResult?: {
    detected: boolean;
    predictedText: string;
    confidence: number;
    latencyMs: number;
    mismatchCount: number;
    charBreakdown?: {
      expected: string;
      predicted: string;
      confidence: number;
      isMismatch: boolean;
    }[];
  };
}

export interface BatchVariationItem {
  id: string;
  originalText: string;
  variationIndex: number;
  presetId: string;
  presetName: string;
  plateType: PlateType;
  originalUrl: string;
  augmentedUrl: string;
  params: AugmentationParams;
  status: 'pending' | 'processing' | 'completed' | 'error';
  ocrResult?: {
    detected: boolean;
    predictedText: string;
    confidence: number;
    latencyMs: number;
    mismatchCount: number;
    charBreakdown: {
      expected: string;
      predicted: string;
      confidence: number;
      isMismatch: boolean;
    }[];
  };
}

export interface BatchPresetConfig {
  id: string;
  name: string;
  category: string;
  description: string;
  color: string;
  badgeBg: string;
  params: AugmentationParams;
}

export const BATCH_PRESETS: BatchPresetConfig[] = [
  {
    id: 'original',
    name: '표준 원본 (Clean Baseline)',
    category: '기준선',
    description: '어떠한 환경 왜곡도 적용되지 않은 깨끗한 표준 원본 영상',
    color: 'text-slate-200',
    badgeBg: 'bg-slate-800 text-slate-300 border-slate-700',
    params: {
      blur: 0,
      brightness: 100,
      contrast: 100,
      noise: 0,
      rotate: 0,
      perspectiveX: 0,
      perspectiveY: 0,
      rain: 0,
      fog: 0,
      dirt: 0,
      glare: 0,
    },
  },
  {
    id: 'motion_blur',
    name: '모션 블러 (Motion Blur)',
    category: '속도',
    description: '고속도로 주행 시 차량의 횡방향 움직임으로 인한 에지 번짐 및 번짐 궤적',
    color: 'text-blue-400',
    badgeBg: 'bg-blue-950/70 text-blue-300 border-blue-800',
    params: {
      blur: 7,
      brightness: 100,
      contrast: 105,
      noise: 15,
      rotate: 0,
      perspectiveX: 0,
      perspectiveY: 0,
      rain: 0,
      fog: 0,
      dirt: 0,
      glare: 0,
    },
  },
  {
    id: 'low_light',
    name: '심야 저조도 (Night Low Light)',
    category: '조도',
    description: '소등된 심야 도로 또는 가로등 음영 지역의 극저조도 및 증폭 노이즈',
    color: 'text-indigo-400',
    badgeBg: 'bg-indigo-950/70 text-indigo-300 border-indigo-800',
    params: {
      blur: 1,
      brightness: 35,
      contrast: 135,
      noise: 55,
      rotate: 0,
      perspectiveX: 0,
      perspectiveY: 0,
      rain: 0,
      fog: 0,
      dirt: 0,
      glare: 0,
    },
  },
  {
    id: 'severe_weather',
    name: '악천후 폭우·안개 (Heavy Rain & Fog)',
    category: '기상',
    description: '시간당 30mm+ 폭우 빗줄기와 수막 물보라, 짙은 해무로 인한 대비 급감',
    color: 'text-cyan-400',
    badgeBg: 'bg-cyan-950/70 text-cyan-300 border-cyan-800',
    params: {
      blur: 2,
      brightness: 75,
      contrast: 85,
      noise: 20,
      rotate: 0,
      perspectiveX: 0,
      perspectiveY: 0,
      rain: 80,
      fog: 65,
      dirt: 15,
      glare: 30,
    },
  },
  {
    id: 'sensor_noise',
    name: 'CCTV 센서 노이즈 (Sensor Grain)',
    category: '하드웨어',
    description: '노후 CCTV 및 저가형 센서의 게인 증폭으로 인한 심각한 컬러 그레인',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-950/70 text-amber-300 border-amber-800',
    params: {
      blur: 3,
      brightness: 90,
      contrast: 110,
      noise: 85,
      rotate: 0,
      perspectiveX: 0,
      perspectiveY: 0,
      rain: 0,
      fog: 0,
      dirt: 10,
      glare: 0,
    },
  },
  {
    id: 'perspective_tilt',
    name: '사각 각도 왜곡 (Perspective Tilt)',
    category: '기하학',
    description: '건물 외벽 고각도 방범 카메라 또는 지하주차장 진입로의 3D 사각',
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-950/70 text-emerald-300 border-emerald-800',
    params: {
      blur: 1,
      brightness: 100,
      contrast: 100,
      noise: 0,
      rotate: -15,
      perspectiveX: 25,
      perspectiveY: 15,
      rain: 0,
      fog: 0,
      dirt: 0,
      glare: 0,
    },
  },
  {
    id: 'dirt_occlusion',
    name: '진흙·먼지 가림 (Dirt & Mud)',
    category: '물리 오염',
    description: '공사구역 및 비포장 도로 주행 후 번호판 특정 문자가 흙탕물로 차폐된 상태',
    color: 'text-stone-300',
    badgeBg: 'bg-stone-900 text-stone-300 border-stone-700',
    params: {
      blur: 1,
      brightness: 90,
      contrast: 110,
      noise: 25,
      rotate: 0,
      perspectiveX: 0,
      perspectiveY: 0,
      rain: 0,
      fog: 0,
      dirt: 85,
      glare: 0,
    },
  },
  {
    id: 'glare_flare',
    name: '직사광선 역광 (Solar Glare Flare)',
    category: '광학',
    description: '정오 또는 일몰 직사광선이 렌즈에 직접 닿아 번호판 획이 표백되는 현상',
    color: 'text-orange-400',
    badgeBg: 'bg-orange-950/70 text-orange-300 border-orange-800',
    params: {
      blur: 2,
      brightness: 135,
      contrast: 130,
      noise: 15,
      rotate: 0,
      perspectiveX: 0,
      perspectiveY: 0,
      rain: 0,
      fog: 0,
      dirt: 0,
      glare: 90,
    },
  },
  {
    id: 'random_edge',
    name: '무작위 엣지케이스 (Stochastic Edge Cases)',
    category: '랜덤',
    description: '각 텍스트마다 예측 불가능한 복합 악조건 파라미터 무작위 배정',
    color: 'text-purple-400',
    badgeBg: 'bg-purple-950/70 text-purple-300 border-purple-800',
    params: {
      blur: 6,
      brightness: 55,
      contrast: 125,
      noise: 60,
      rotate: 12,
      perspectiveX: 20,
      perspectiveY: 10,
      rain: 50,
      fog: 40,
      dirt: 50,
      glare: 40,
    },
  },
];

export const DEFAULT_SAMPLE_PLATE_STRINGS = [
  '123가 4567',
  '58조 8912',
  '345라 9876',
  '서울 31 바 1234',
  'EV 09다 8765',
  '41너 6520',
  '89마 3321',
  '77고 4419',
  '201어 9988',
  '경기 72 사 5543',
];

/**
 * Detects appropriate PlateType from Korean text string heuristics
 */
export function detectPlateTypeFromText(text: string): PlateType {
  const clean = text.trim();
  if (clean.includes('EV') || clean.startsWith('친환경') || clean.includes('전기')) {
    return 'ev_blue';
  }
  const commercialChars = ['바', '사', '아', '자', '배'];
  const hasCommercialChar = commercialChars.some(c => clean.includes(c));
  const regions = ['서울', '경기', '인천', '부산', '대구', '대전', '광주', '울산', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주', '세종'];
  const hasRegion = regions.some(r => clean.includes(r));

  if (hasCommercialChar || (hasRegion && clean.includes('바'))) {
    return 'yellow_commercial';
  }
  if (hasRegion && !clean.includes('31') && !clean.includes('72')) {
    return 'green_retro';
  }
  // Check digit count
  const numbersOnly = clean.replace(/[^0-9]/g, '');
  if (numbersOnly.length === 8 || clean.length >= 8) {
    return 'white_8';
  }
  if (numbersOnly.length === 7 || clean.length === 7) {
    return 'white_7';
  }
  return 'white_8';
}

/**
 * Creates a canvas image data URL for a Korean license plate
 */
export function generateSyntheticPlateImage(
  plateText: string,
  plateTypeInput: PlateType | 'white' | 'ev' | 'yellow' | 'green' = 'white_8'
): string {
  // Normalize plate type
  let normalizedType: PlateType = 'white_8';
  if (plateTypeInput === 'white') normalizedType = 'white_8';
  else if (plateTypeInput === 'ev') normalizedType = 'ev_blue';
  else if (plateTypeInput === 'yellow') normalizedType = 'yellow_commercial';
  else if (plateTypeInput === 'green') normalizedType = 'green_retro';
  else normalizedType = plateTypeInput as PlateType;

  const canvas = document.createElement('canvas');
  canvas.width = 440;
  canvas.height = 120;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  if (normalizedType === 'ev_blue') {
    const grad = ctx.createLinearGradient(0, 0, 440, 0);
    grad.addColorStop(0, '#bae6fd');
    grad.addColorStop(0.5, '#e0f2fe');
    grad.addColorStop(1, '#bae6fd');
    ctx.fillStyle = grad;
  } else if (normalizedType === 'yellow_commercial') {
    ctx.fillStyle = '#fde047';
  } else if (normalizedType === 'green_retro') {
    ctx.fillStyle = '#065f46';
  } else {
    // white_8 or white_7
    ctx.fillStyle = '#ffffff';
  }
  ctx.fillRect(0, 0, 440, 120);

  // Border
  ctx.lineWidth = 6;
  ctx.strokeStyle = normalizedType === 'green_retro' 
    ? '#022c22' 
    : normalizedType === 'ev_blue' 
      ? '#0284c7' 
      : '#1e293b';
  ctx.strokeRect(3, 3, 434, 114);

  // Mounting bolts
  ctx.fillStyle = normalizedType === 'green_retro' ? '#047857' : '#334155';
  ctx.beginPath();
  ctx.arc(32, 20, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(408, 20, 5, 0, Math.PI * 2);
  ctx.fill();

  let textOffset = 0;

  // Embellishments for 8-digit KOR
  if (normalizedType === 'white_8') {
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(6, 6, 46, 108);
    // National circle
    ctx.fillStyle = '#f87171';
    ctx.beginPath();
    ctx.arc(29, 28, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('KOR', 29, 52);
    ctx.fillStyle = '#93c5fd';
    ctx.font = '8px sans-serif';
    ctx.fillText('대한민국', 29, 70);
    textOffset = 24;
  } else if (normalizedType === 'ev_blue') {
    ctx.fillStyle = 'rgba(2, 132, 199, 0.45)';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('⚡ EV', 30, 62);
    textOffset = 18;
  }

  // Plate Text
  ctx.fillStyle = normalizedType === 'green_retro' 
    ? '#ffffff' 
    : normalizedType === 'ev_blue' 
      ? '#0c4a6e' 
      : '#0f172a';
  ctx.font = '900 48px "Noto Sans KR", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(plateText, 220 + textOffset, 60);

  return canvas.toDataURL('image/jpeg', 0.95);
}

/**
 * Applies AugmentationParams to an image using HTML5 Canvas
 */
export async function applyAugmentationToCanvas(
  imageUrl: string,
  params: AugmentationParams
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 440;
        canvas.height = img.height || 120;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imageUrl);
          return;
        }

        ctx.save();

        // 1. Perspective and rotation transforms
        if (params.rotate !== 0 || params.perspectiveX !== 0 || params.perspectiveY !== 0) {
          ctx.translate(canvas.width / 2, canvas.height / 2);
          const rad = (params.rotate * Math.PI) / 180;
          ctx.rotate(rad);
          const skewX = (params.perspectiveX / 100) * 0.35;
          const skewY = (params.perspectiveY / 100) * 0.2;
          ctx.transform(1, skewY, skewX, 1, 0, 0);
          ctx.translate(-canvas.width / 2, -canvas.height / 2);
        }

        // 2. Build CSS Filter string
        const blurStr = params.blur > 0 ? `blur(${params.blur * 0.75}px)` : '';
        const brightnessStr = `brightness(${params.brightness / 100})`;
        const contrastStr = `contrast(${params.contrast / 100})`;
        const filterStr = [blurStr, brightnessStr, contrastStr].filter(Boolean).join(' ');
        ctx.filter = filterStr;

        // 3. Draw base image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.filter = 'none';

        // 4. Directional Motion Blur Ghosting
        if (params.blur > 2) {
          ctx.save();
          ctx.globalAlpha = Math.min(0.4, params.blur * 0.035);
          ctx.drawImage(img, params.blur * 1.6, 0, canvas.width, canvas.height);
          ctx.drawImage(img, -params.blur * 1.6, 0, canvas.width, canvas.height);
          ctx.restore();
        }

        ctx.restore();

        // 5. Sensor Noise Injection
        if (params.noise > 0) {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;
          const noiseFactor = (params.noise / 100) * 85;
          for (let i = 0; i < data.length; i += 4) {
            const rand = (Math.random() - 0.5) * noiseFactor;
            data[i] = Math.min(255, Math.max(0, data[i] + rand));
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + rand));
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + rand));
          }
          ctx.putImageData(imgData, 0, 0);
        }

        // 6. Rain Streaks Overlay
        if (params.rain > 0) {
          ctx.save();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.lineWidth = 1.3;
          const dropCount = Math.floor((params.rain / 100) * 140);
          for (let i = 0; i < dropCount; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const length = 12 + Math.random() * 20;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + length * 0.35, y + length);
            ctx.stroke();
          }
          ctx.restore();
        }

        // 7. Fog / Haze Overlay
        if (params.fog > 0) {
          ctx.save();
          ctx.fillStyle = `rgba(226, 232, 240, ${(params.fog / 100) * 0.58})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.restore();
        }

        // 8. Dirt / Mud Splatters
        if (params.dirt > 0) {
          ctx.save();
          ctx.fillStyle = 'rgba(67, 30, 8, 0.88)';
          const splatterCount = Math.floor((params.dirt / 100) * 8) + 2;
          for (let i = 0; i < splatterCount; i++) {
            const x = (canvas.width * 0.12) + Math.random() * (canvas.width * 0.76);
            const y = (canvas.height * 0.18) + Math.random() * (canvas.height * 0.64);
            const radiusX = (10 + Math.random() * 28) * (params.dirt / 80);
            const radiusY = (6 + Math.random() * 16) * (params.dirt / 80);
            ctx.beginPath();
            ctx.ellipse(x, y, radiusX, radiusY, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        // 9. Solar Glare / Lens Flare
        if (params.glare > 0) {
          ctx.save();
          const glareRadius = (canvas.width * 0.42) * (params.glare / 80);
          const grad = ctx.createRadialGradient(
            canvas.width * 0.85, canvas.height * 0.2, 5,
            canvas.width * 0.85, canvas.height * 0.2, glareRadius
          );
          grad.addColorStop(0, `rgba(255, 255, 255, ${Math.min(1, params.glare / 80)})`);
          grad.addColorStop(0.3, `rgba(254, 240, 138, ${Math.min(0.85, params.glare / 100)})`);
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.restore();
        }

        resolve(canvas.toDataURL('image/jpeg', 0.92));
      } catch (err) {
        console.error('Canvas augmentation error', err);
        resolve(imageUrl);
      }
    };
    img.onerror = () => {
      resolve(imageUrl);
    };
    img.src = imageUrl;
  });
}
