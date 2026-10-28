export type PlateType = 'white_8' | 'white_7' | 'ev_blue' | 'yellow_commercial' | 'green_retro';

export type PresetType = 
  | 'original' 
  | 'motion_blur' 
  | 'low_light' 
  | 'sensor_noise' 
  | 'perspective_tilt' 
  | 'severe_weather'
  | 'dirt_occlusion'
  | 'glare_flare'
  | 'custom';

export interface AugmentationParams {
  blur: number; // 0 to 15 px
  brightness: number; // 20% to 150% (100 = normal)
  contrast: number; // 50% to 180% (100 = normal)
  noise: number; // 0 to 100%
  rotate: number; // -30 to 30 deg
  perspectiveX: number; // -40 to 40 deg
  perspectiveY: number; // -40 to 40 deg
  rain: number; // 0 to 100%
  fog: number; // 0 to 100%
  dirt: number; // 0 to 100%
  glare: number; // 0 to 100%
}

export interface AugmentationProfile {
  id: string;
  name: string;
  category: 'weather' | 'night' | 'motion' | 'camera' | 'condition' | 'custom';
  categoryLabel?: string;
  description: string;
  params: AugmentationParams;
  plateType?: PlateType;
  isBuiltIn?: boolean;
  createdAt?: string;
}

export interface CharConfidence {
  expected: string;
  predicted: string;
  confidence: number;
  isMismatch: boolean;
}

export interface SimulationResult {
  detected: boolean;
  overallConfidence: number;
  predictedText: string;
  charBreakdown: CharConfidence[];
  latencyMs: number;
  failureReason: string | null;
  recommendedAugmentation: string;
  albumentationsCode: string;
  sharpnessScore: number; // 0 - 100 proxy
}

export interface PlateTemplate {
  id: PlateType;
  name: string;
  badge: string;
  defaultText: string;
  description: string;
  bgStyle: string;
  textColor: string;
  borderColor: string;
}

export interface HistoryConfigItem {
  id: string;
  timestamp: string;
  label: string;
  params: AugmentationParams;
  source: 'preset' | 'random' | 'profile' | 'manual' | 'initial';
  summaryTags: string[];
}

