/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BoundingBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

export type PlateStandard = 
  | 'korean_8digit_film'     // 신형 8자리 반사필름 (123가 4567)
  | 'korean_8digit_paint'    // 신형 8자리 비천공 페인트
  | 'korean_7digit_white'    // 구형 7자리 일반 자가용 (12가 3456)
  | 'korean_commercial_yellow' // 영업용 노란색 번호판 (서울31바 1234)
  | 'korean_ev_blue'         // 전기차/수소차 친환경 청색
  | 'korean_retro_green'     // 구형 녹색 2줄/1줄 번호판
  | 'international_eu'       // 유럽/국제 규격 (독일/영국 등)
  | 'international_us';      // 미국 캘리포니아 등 주 번호판

export interface CharacterDetection {
  char: string;
  confidence: number;
  box?: BoundingBox;
}

export interface DetectionResult {
  rawText: string;
  cleanedText: string;
  confidence: number;
  standard: PlateStandard;
  standardLabel: string;
  vehicleCategory: string;
  isValidFormat: boolean;
  box: BoundingBox;
  paddedBox: BoundingBox;
  inferenceTimeMs: {
    localization: number;
    preprocessing: number;
    ocr: number;
    total: number;
  };
  characters: CharacterDetection[];
  cloudVisionMatches: string[];
  tesseractConfidence: number;
  sourceEngine: 'tesseract_worker' | 'cloud_vision_sim' | 'hybrid';
}

export interface SampleVehicle {
  id: string;
  name: string;
  category: 'repo_dataset' | 'korean_standard' | 'challenging';
  imageUrl: string;
  plateText: string;
  standard: PlateStandard;
  description: string;
  expectedBox: {
    leftPercent: number;
    topPercent: number;
    widthPercent: number;
    heightPercent: number;
  };
}

export type PipelineStageId = 
  | 'original'
  | 'grayscale'
  | 'bilateral'
  | 'threshold'
  | 'edges_morph'
  | 'roi_cropped'
  | 'ocr_heatmap';

export interface PipelineStageInfo {
  id: PipelineStageId;
  step: number;
  name: string;
  nameKo: string;
  description: string;
  opencvEquivalent: string;
}
