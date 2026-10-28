import { AugmentationProfile, AugmentationParams } from '../types/alpr';

export const BUILT_IN_PROFILES: AugmentationProfile[] = [
  {
    id: 'heavy_rain',
    name: 'Heavy Rain (집중호우 & 물보라)',
    category: 'weather',
    categoryLabel: '악천후 기상',
    description: '강한 빗줄기와 대기 중 수증기로 번호판 대비가 급감하고 굴절 왜곡이 일어나는 폭우 환경',
    params: {
      blur: 2,
      brightness: 75,
      contrast: 85,
      noise: 20,
      rotate: 0,
      perspectiveX: 0,
      perspectiveY: 0,
      rain: 85,
      fog: 65,
      dirt: 15,
      glare: 0,
    },
    plateType: 'white_8',
    isBuiltIn: true,
  },
  {
    id: 'low_light_night',
    name: 'Night City (심야 도심 초저조도)',
    category: 'night',
    categoryLabel: '야간 저조도',
    description: '가로등 없는 0.3lux 이하 암흑 도로에서 센서 증폭으로 노이즈가 급증하고 문자 윤곽이 소실되는 환경',
    params: {
      blur: 1,
      brightness: 28,
      contrast: 140,
      noise: 65,
      rotate: 0,
      perspectiveX: 0,
      perspectiveY: 0,
      rain: 0,
      fog: 0,
      dirt: 10,
      glare: 20,
    },
    plateType: 'white_8',
    isBuiltIn: true,
  },
  {
    id: 'fast_motion',
    name: 'Highway Motion (고속도로 140km/h 질주)',
    category: 'motion',
    categoryLabel: '고속 주행',
    description: '시속 100~140km/h 고속 질주 차량의 셔터 스피드 부족으로 수평 획이 심하게 번져 오인식이 급증하는 환경',
    params: {
      blur: 11,
      brightness: 100,
      contrast: 110,
      noise: 15,
      rotate: -4,
      perspectiveX: 4,
      perspectiveY: 2,
      rain: 0,
      fog: 0,
      dirt: 0,
      glare: 0,
    },
    plateType: 'white_8',
    isBuiltIn: true,
  },
  {
    id: 'highway_toll_angled',
    name: 'Tollgate Perspective (톨게이트 45° 사각)',
    category: 'camera',
    categoryLabel: '원근 각도',
    description: '차선 진입로 및 톨게이트 측면 기둥에 설치된 광각 카메라에서 촬영된 3D 기하 왜곡 환경',
    params: {
      blur: 1,
      brightness: 105,
      contrast: 100,
      noise: 0,
      rotate: -20,
      perspectiveX: 28,
      perspectiveY: 18,
      rain: 0,
      fog: 0,
      dirt: 0,
      glare: 25,
    },
    plateType: 'white_8',
    isBuiltIn: true,
  },
  {
    id: 'offroad_mud_splatter',
    name: 'Off-road Mud (진흙 오염 & 문자 폐색)',
    category: 'condition',
    categoryLabel: '표면 오염',
    description: '화물차나 비포장 도로를 주행한 차량의 번호판 글자 획이 흙탕물로 부분 폐색(Occlusion)된 환경',
    params: {
      blur: 0,
      brightness: 90,
      contrast: 115,
      noise: 10,
      rotate: 0,
      perspectiveX: 0,
      perspectiveY: 0,
      rain: 0,
      fog: 0,
      dirt: 90,
      glare: 0,
    },
    plateType: 'yellow_commercial',
    isBuiltIn: true,
  },
  {
    id: 'tunnel_glare',
    name: 'Tunnel Glare (터널 출구 역광 & 상향등)',
    category: 'night',
    categoryLabel: '역광 플레어',
    description: '어두운 터널 출구 직사광선 또는 대향 차량의 고광도 LED 상향등으로 번호판 텍스처가 백색 포화되는 환경',
    params: {
      blur: 0,
      brightness: 140,
      contrast: 130,
      noise: 15,
      rotate: 0,
      perspectiveX: 0,
      perspectiveY: 0,
      rain: 0,
      fog: 0,
      dirt: 0,
      glare: 95,
    },
    plateType: 'ev_blue',
    isBuiltIn: true,
  },
  {
    id: 'dense_winter_fog',
    name: 'Dense Winter Fog (동절기 짙은 안개 & 습기)',
    category: 'weather',
    categoryLabel: '악천후 기상',
    description: '가시거리 50m 이하의 농무 상태로 에지 선명도가 떨어지고 카메라 렌즈 표면 결로가 발생한 환경',
    params: {
      blur: 3,
      brightness: 80,
      contrast: 70,
      noise: 25,
      rotate: 0,
      perspectiveX: 0,
      perspectiveY: 0,
      rain: 25,
      fog: 90,
      dirt: 20,
      glare: 10,
    },
    plateType: 'white_8',
    isBuiltIn: true,
  },
  {
    id: 'low_cctv_grain',
    name: 'Low-spec CCTV Sensor (노후 방범 CCTV)',
    category: 'camera',
    categoryLabel: '센서 노이즈',
    description: '저가형 이미지 센서와 높은 압축률로 아티팩트와 극심한 ISO 입상 노이즈가 발생하는 환경',
    params: {
      blur: 3,
      brightness: 90,
      contrast: 110,
      noise: 90,
      rotate: 0,
      perspectiveX: 0,
      perspectiveY: 0,
      rain: 0,
      fog: 0,
      dirt: 10,
      glare: 0,
    },
    plateType: 'green_retro',
    isBuiltIn: true,
  },
];

const STORAGE_KEY = 'alpr_custom_augmentation_profiles';
export const PROFILES_CHANGED_EVENT = 'alpr_custom_profiles_changed';

export function getStoredCustomProfiles(): AugmentationProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Provide an initial starter profile so users immediately see how My Presets works
      const initialStarters: AugmentationProfile[] = [
        {
          id: 'custom_sample_1',
          name: '야간 빗길 과속 단속 (Night Rain Dash)',
          category: 'weather',
          categoryLabel: '악천후 기상',
          description: '빗줄기와 야간 노이즈, 미세 모션블러가 결합된 실무 엣지케이스',
          params: {
            blur: 4,
            brightness: 55,
            contrast: 120,
            noise: 35,
            rotate: -2,
            perspectiveX: 6,
            perspectiveY: 2,
            rain: 65,
            fog: 30,
            dirt: 10,
            glare: 15,
          },
          plateType: 'white_8',
          isBuiltIn: false,
          createdAt: '기본 제공',
        },
        {
          id: 'custom_sample_2',
          name: '지하주차장 광각 사각 (Underground CCTV)',
          category: 'camera',
          categoryLabel: '카메라 각도',
          description: '출차 경사로 천장 CCTV에서 촬영된 상향 3D 원근 왜곡과 플레어',
          params: {
            blur: 1,
            brightness: 85,
            contrast: 130,
            noise: 25,
            rotate: 8,
            perspectiveX: -18,
            perspectiveY: 15,
            rain: 0,
            fog: 0,
            dirt: 5,
            glare: 45,
          },
          plateType: 'white_8',
          isBuiltIn: false,
          createdAt: '기본 제공',
        }
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialStarters));
      return initialStarters;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Failed to load custom profiles from storage', err);
    return [];
  }
}

function notifyStorageChanged(profiles: AugmentationProfile[]) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PROFILES_CHANGED_EVENT, { detail: profiles }));
  }
}

export function saveCustomProfileToStorage(profile: AugmentationProfile): AugmentationProfile[] {
  try {
    const current = getStoredCustomProfiles();
    const updated = [profile, ...current.filter(p => p.id !== profile.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    notifyStorageChanged(updated);
    return updated;
  } catch (err) {
    console.error('Failed to save profile to storage', err);
    return getStoredCustomProfiles();
  }
}

export function deleteCustomProfileFromStorage(profileId: string): AugmentationProfile[] {
  try {
    const current = getStoredCustomProfiles();
    const updated = current.filter(p => p.id !== profileId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    notifyStorageChanged(updated);
    return updated;
  } catch (err) {
    console.error('Failed to delete profile from storage', err);
    return getStoredCustomProfiles();
  }
}

export function subscribeToCustomProfiles(callback: (profiles: AugmentationProfile[]) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  
  const handleEvent = (e: Event) => {
    const customEvent = e as CustomEvent<AugmentationProfile[]>;
    if (customEvent.detail) {
      callback(customEvent.detail);
    } else {
      callback(getStoredCustomProfiles());
    }
  };

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback(getStoredCustomProfiles());
    }
  };

  window.addEventListener(PROFILES_CHANGED_EVENT, handleEvent);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    window.removeEventListener(PROFILES_CHANGED_EVENT, handleEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
}

export function suggestProfileName(params: AugmentationParams): string {
  const parts: string[] = [];
  if (params.rain > 40) parts.push('폭우');
  else if (params.rain > 0) parts.push('우천');

  if (params.fog > 40) parts.push('짙은안개');

  if (params.blur >= 7) parts.push('고속블러');
  else if (params.blur > 0) parts.push('초점흐림');

  if (params.brightness < 50) parts.push('심야저조도');
  else if (params.brightness > 120) parts.push('고노출');

  if (params.glare >= 40) parts.push('헤드라이트역광');
  if (params.dirt >= 35) parts.push('흙먼지오염');

  if (Math.abs(params.perspectiveX) > 15 || Math.abs(params.perspectiveY) > 15) {
    parts.push('CCTV사각');
  } else if (Math.abs(params.rotate) >= 10) {
    parts.push('기울임각도');
  }

  if (params.noise >= 50) parts.push('센서노이즈');

  if (parts.length === 0) {
    return '표준 커스텀 파라미터';
  }
  return parts.slice(0, 3).join(' ') + ' 프로필';
}
