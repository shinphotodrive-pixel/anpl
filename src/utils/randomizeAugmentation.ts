import { AugmentationParams } from '../types/alpr';

export interface RandomScenarioResult {
  params: AugmentationParams;
  label: string;
  description: string;
}

const clamp = (val: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, Math.round(val)));
};

const randomBetween = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const summarizeParams = (params: AugmentationParams): string[] => {
  const tags: string[] = [];

  if (params.blur > 0) {
    tags.push(`블러 ${params.blur}px`);
  }
  if (params.brightness !== 100) {
    tags.push(`밝기 ${params.brightness}%`);
  }
  if (params.contrast !== 100) {
    tags.push(`대비 ${params.contrast}%`);
  }
  if (params.noise > 0) {
    tags.push(`노이즈 ${params.noise}%`);
  }
  if (params.rotate !== 0) {
    tags.push(`회전 ${params.rotate > 0 ? '+' : ''}${params.rotate}°`);
  }
  if (params.perspectiveX !== 0 || params.perspectiveY !== 0) {
    tags.push(`원근 ${params.perspectiveX}°/${params.perspectiveY}°`);
  }
  if (params.rain > 0) {
    tags.push(`강우 ${params.rain}%`);
  }
  if (params.fog > 0) {
    tags.push(`안개 ${params.fog}%`);
  }
  if (params.dirt > 0) {
    tags.push(`오염 ${params.dirt}%`);
  }
  if (params.glare > 0) {
    tags.push(`글레어 ${params.glare}%`);
  }

  return tags.length > 0 ? tags : ['원본 (Clean)'];
};

export const areParamsEqual = (a: AugmentationParams, b: AugmentationParams): boolean => {
  return (
    a.blur === b.blur &&
    a.brightness === b.brightness &&
    a.contrast === b.contrast &&
    a.noise === b.noise &&
    a.rotate === b.rotate &&
    a.perspectiveX === b.perspectiveX &&
    a.perspectiveY === b.perspectiveY &&
    a.rain === b.rain &&
    a.fog === b.fog &&
    a.dirt === b.dirt &&
    a.glare === b.glare
  );
};

export const generateRandomEdgeCase = (): RandomScenarioResult => {
  const scenarios: (() => RandomScenarioResult)[] = [
    // 1. 야간 고속 질주
    () => ({
      label: '야간 고속 질주 블러',
      description: '어두운 야간 도로에서 시속 100km+ 주행 시 발생하는 광학 궤적과 센서 노이즈',
      params: {
        blur: randomBetween(7, 12),
        brightness: randomBetween(25, 45),
        contrast: randomBetween(125, 155),
        noise: randomBetween(40, 65),
        rotate: randomBetween(-10, 10),
        perspectiveX: randomBetween(-15, 15),
        perspectiveY: 0,
        rain: 0,
        fog: 0,
        dirt: randomBetween(0, 20),
        glare: 0,
      },
    }),

    // 2. 폭우 및 노면 물보라
    () => ({
      label: '폭우 및 노면 물보라',
      description: '시간당 30mm+ 집중호우로 인한 수막 번짐과 저조도 빗줄기 왜곡',
      params: {
        blur: randomBetween(2, 5),
        brightness: randomBetween(65, 85),
        contrast: randomBetween(75, 95),
        noise: randomBetween(20, 45),
        rotate: randomBetween(-5, 5),
        perspectiveX: 0,
        perspectiveY: 0,
        rain: randomBetween(75, 95),
        fog: randomBetween(50, 75),
        dirt: randomBetween(15, 40),
        glare: randomBetween(20, 50),
      },
    }),

    // 3. 태양 직사광선 역광 플레어
    () => ({
      label: '태양 직사광선 역광 플레어',
      description: '일몰 또는 정오 직사광선이 카메라 렌즈에 직접 닿아 번호판 획이 표백되는 현상',
      params: {
        blur: randomBetween(1, 4),
        brightness: randomBetween(130, 150),
        contrast: randomBetween(135, 170),
        noise: randomBetween(10, 30),
        rotate: 0,
        perspectiveX: randomBetween(-10, 10),
        perspectiveY: 0,
        rain: 0,
        fog: 0,
        dirt: randomBetween(0, 20),
        glare: randomBetween(80, 100),
      },
    }),

    // 4. 비포장 진흙 오염 및 흙먼지
    () => ({
      label: '비포장 진흙 가림 및 비산',
      description: '건설 현장 및 비포장 도로 주행 후 번호판 특정 숫자가 흙탕물로 차폐된 상태',
      params: {
        blur: randomBetween(1, 3),
        brightness: randomBetween(75, 95),
        contrast: randomBetween(105, 125),
        noise: randomBetween(25, 55),
        rotate: randomBetween(-8, 8),
        perspectiveX: randomBetween(-10, 10),
        perspectiveY: 0,
        rain: 0,
        fog: 0,
        dirt: randomBetween(70, 95),
        glare: 0,
      },
    }),

    // 5. CCTV 급경사 사각 원근 왜곡
    () => ({
      label: 'CCTV 급경사 사각 원근 왜곡',
      description: '건물 외벽 고각도 방범 카메라 또는 지하주차장 진입로의 극심한 기하학적 사각',
      params: {
        blur: randomBetween(2, 6),
        brightness: randomBetween(80, 110),
        contrast: randomBetween(110, 130),
        noise: randomBetween(30, 55),
        rotate: randomBetween(-22, 22),
        perspectiveX: Math.random() > 0.5 ? randomBetween(25, 38) : randomBetween(-38, -25),
        perspectiveY: randomBetween(15, 30),
        rain: 0,
        fog: 0,
        dirt: 0,
        glare: 0,
      },
    }),

    // 6. 노후 저가형 CCTV 센서 노이즈
    () => ({
      label: '노후 CCTV 센서 열화 및 노이즈',
      description: '소등된 주차타워 저조도 환경에서 센서 게인 증폭으로 인한 심각한 컬러 노이즈',
      params: {
        blur: randomBetween(3, 7),
        brightness: randomBetween(40, 65),
        contrast: randomBetween(120, 150),
        noise: randomBetween(80, 100),
        rotate: randomBetween(-5, 5),
        perspectiveX: 0,
        perspectiveY: 0,
        rain: 0,
        fog: 0,
        dirt: randomBetween(10, 30),
        glare: 0,
      },
    }),

    // 7. 짙은 해무 및 저시정 안개
    () => ({
      label: '짙은 해무 및 시정 악화',
      description: '시정거리 50m 이하의 농무 상태로 에지 선명도가 급락하고 대비가 소실된 환경',
      params: {
        blur: randomBetween(4, 7),
        brightness: randomBetween(90, 115),
        contrast: randomBetween(55, 75),
        noise: randomBetween(25, 45),
        rotate: 0,
        perspectiveX: 0,
        perspectiveY: 0,
        rain: randomBetween(15, 35),
        fog: randomBetween(80, 100),
        dirt: 0,
        glare: randomBetween(10, 30),
      },
    }),

    // 8. 극한 복합 다중 파괴 엣지케이스
    () => ({
      label: '극한 복합 악조건 스트레스 테스트',
      description: '야간 + 폭우 + 고속 회전 + 진흙 오염이 복합 작용하는 ALPR 한계 시험 조건',
      params: {
        blur: randomBetween(5, 10),
        brightness: randomBetween(30, 60),
        contrast: randomBetween(85, 140),
        noise: randomBetween(50, 85),
        rotate: randomBetween(-18, 18),
        perspectiveX: randomBetween(-25, 25),
        perspectiveY: randomBetween(0, 20),
        rain: randomBetween(50, 85),
        fog: randomBetween(40, 70),
        dirt: randomBetween(45, 80),
        glare: randomBetween(35, 75),
      },
    }),
  ];

  const pick = scenarios[Math.floor(Math.random() * scenarios.length)]();
  
  // Ensure all values are clamped to valid ranges
  return {
    label: pick.label,
    description: pick.description,
    params: {
      blur: clamp(pick.params.blur, 0, 15),
      brightness: clamp(pick.params.brightness, 20, 150),
      contrast: clamp(pick.params.contrast, 50, 180),
      noise: clamp(pick.params.noise, 0, 100),
      rotate: clamp(pick.params.rotate, -30, 30),
      perspectiveX: clamp(pick.params.perspectiveX, -40, 40),
      perspectiveY: clamp(pick.params.perspectiveY, -40, 40),
      rain: clamp(pick.params.rain, 0, 100),
      fog: clamp(pick.params.fog, 0, 100),
      dirt: clamp(pick.params.dirt, 0, 100),
      glare: clamp(pick.params.glare, 0, 100),
    },
  };
};
