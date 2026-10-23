import { AugmentationParams, CharConfidence, PlateType, SimulationResult } from '../types/alpr';

// Character confusion map for realistic OCR distortion
const CONFUSION_MAP: Record<string, string[]> = {
  '1': ['7', 'I', 'l'],
  '7': ['1', 'T'],
  '0': ['8', 'O', 'D'],
  '8': ['0', 'B', '3'],
  '6': ['8', '5', 'G'],
  '5': ['6', 'S'],
  '2': ['Z', '7'],
  '3': ['8', 'E'],
  '4': ['A', '9'],
  '9': ['4', 'P', '8'],
  '가': ['하', '거', '카'],
  '하': ['가', '허', '호'],
  '거': ['가', '겨', '고'],
  '나': ['다', '너', '라'],
  '다': ['나', '라', '더'],
  '라': ['다', '나', '러'],
  '마': ['머', '모', '바'],
  '바': ['마', '버', '배'],
  '서': ['셔', '소', '어'],
  '어': ['서', '여', '오'],
  '저': ['적', '조', '주'],
  '고': ['구', '오', '교'],
  '노': ['도', '로', '누'],
  '도': ['노', '동', '두'],
  '호': ['하', '허', '오'],
  '허': ['호', '하', '헌'],
};

export function simulateOcrInference(
  plateText: string,
  plateType: PlateType,
  params: AugmentationParams
): SimulationResult {
  // Normalize plate text
  const cleanText = plateText.trim();
  const chars = Array.from(cleanText);

  // 1. Calculate degradation penalty factors (0 to 1)
  const blurFactor = Math.min(1, params.blur / 12);
  const brightnessDist = Math.abs(params.brightness - 100);
  const brightnessFactor = brightnessDist > 40 ? Math.min(1, (brightnessDist - 40) / 60) : 0;
  const noiseFactor = params.noise / 100;
  const angleFactor = Math.min(1, (Math.abs(params.rotate) + Math.abs(params.perspectiveX) * 0.7 + Math.abs(params.perspectiveY) * 0.7) / 60);
  const weatherFactor = Math.min(1, (params.rain * 0.6 + params.fog * 0.4) / 100);
  const dirtFactor = params.dirt / 100;
  const glareFactor = params.glare / 100;

  // Composite distortion score: 0 (perfect clean) to 1 (extreme distortion)
  const totalDistortion = Math.min(
    1,
    blurFactor * 0.35 +
    brightnessFactor * 0.25 +
    noiseFactor * 0.2 +
    angleFactor * 0.25 +
    weatherFactor * 0.2 +
    dirtFactor * 0.35 +
    glareFactor * 0.3
  );

  // Detection confidence (YOLO / plate localization)
  // Usually plate detection is more robust than character OCR
  const detectionPenalty = (totalDistortion * 0.7) + (angleFactor * 0.2) + (glareFactor * 0.15);
  const detectionScore = Math.max(0, Math.min(99.6, 99.4 - detectionPenalty * 85));
  const detected = detectionScore > 35;

  // Sharpness score proxy (like Laplacian variance)
  const sharpnessScore = Math.max(5, Math.round(100 - (blurFactor * 60 + noiseFactor * 25 + weatherFactor * 15)));

  // Simulated latency (harder distorted images take longer in NMS & OCR beam search)
  const baseLatency = 14.5;
  const extraLatency = Math.round(totalDistortion * 32 + (params.noise > 40 ? 12 : 0));
  const latencyMs = Number((baseLatency + extraLatency + Math.random() * 2).toFixed(1));

  // 2. Character-level OCR simulation
  const charBreakdown: CharConfidence[] = [];
  let predictedAccumulator = '';
  let sumConfidence = 0;

  chars.forEach((char, idx) => {
    if (char === ' ') {
      charBreakdown.push({
        expected: ' ',
        predicted: ' ',
        confidence: 100,
        isMismatch: false,
      });
      predictedAccumulator += ' ';
      sumConfidence += 100;
      return;
    }

    // Determine position-based vulnerability
    // Middle Korean syllable and edge digits are usually more prone to errors
    const isKoreanChar = /[가-힣]/.test(char);
    const isEdgeChar = idx === 0 || idx === chars.length - 1;
    const charVulnerability = (isKoreanChar ? 1.3 : 1.0) * (isEdgeChar ? 1.15 : 1.0);

    // If dirt or glare is active, some characters get heavily occluded
    let localDistortion = totalDistortion * charVulnerability;
    if (dirtFactor > 0.3 && (idx % 3 === 1 || idx === Math.floor(chars.length / 2))) {
      localDistortion += dirtFactor * 0.45;
    }
    if (glareFactor > 0.4 && idx >= chars.length - 3) {
      localDistortion += glareFactor * 0.5;
    }

    localDistortion = Math.min(0.99, localDistortion);

    // Confidence for this character
    let charConf = Math.max(12, Math.round(99 - localDistortion * 88));

    // Determine if OCR makes an error
    const mismatchThreshold = 0.42; // Above this distortion, error rate rises
    const shouldMismatch = localDistortion > mismatchThreshold && Math.random() < (localDistortion - 0.25) * 1.5;

    let predicted = char;
    if (shouldMismatch) {
      const candidates = CONFUSION_MAP[char];
      if (candidates && candidates.length > 0) {
        predicted = candidates[Math.floor(Math.random() * candidates.length)];
      } else if (/[0-9]/.test(char)) {
        predicted = String((Number(char) + 3) % 10);
      } else {
        predicted = '?';
      }
      charConf = Math.min(charConf, Math.floor(Math.random() * 25) + 35);
    }

    const isMismatch = predicted !== char;
    charBreakdown.push({
      expected: char,
      predicted,
      confidence: charConf,
      isMismatch,
    });
    predictedAccumulator += predicted;
    sumConfidence += charConf;
  });

  const overallConfidence = chars.length > 0 ? Math.round(sumConfidence / chars.length) : 0;

  // 3. Failure diagnosis and recommended augmentation
  let failureReason: string | null = null;
  let recommendedAugmentation = '기본 데이터셋 품질이 양호합니다.';

  if (!detected) {
    failureReason = '객체 검출(YOLO) 신뢰도 임계값(0.35) 미달: 번호판 경계 검출 실패';
    recommendedAugmentation = 'YOLO Backbone에 극단적 저조도 및 고각도 회전 증강(A.Perspective & A.RandomBrightnessContrast) 데이터셋 비율 25% 이상 확충 필요';
  } else if (charBreakdown.some(c => c.isMismatch)) {
    const errorCount = charBreakdown.filter(c => c.isMismatch).length;
    if (params.blur > 4) {
      failureReason = `모션 블러(Motion Blur)로 인한 획 뭉침 현상 (${errorCount}개 문자 판독 오인식)`;
      recommendedAugmentation = 'Albumentations의 MotionBlur, Defocus, GlassBlur 증강을 데이터셋 파이프라인에 추가하고 De-blurring 전처리 모듈 검토 권장';
    } else if (params.dirt > 40) {
      failureReason = `번호판 표면 오염 및 가림(Occlusion)으로 인한 특징점 소실 (${errorCount}개 문자)`;
      recommendedAugmentation = 'CutOut, CoarseDropout, 합성 진흙 스플래터 레이어를 활용한 부분 폐색(Occlusion) 데이터 증강 필수';
    } else if (params.glare > 45) {
      failureReason = `태양광/헤드라이트 역광 반사(Solar Glare/Overexposure)로 텍스처 포화 (${errorCount}개 문자)`;
      recommendedAugmentation = 'A.RandomSunFlare, A.ColorJitter 및 합성 조명 셰이더를 통한 극단적 고광도 데이터 학습 데이터셋 보강';
    } else if (angleFactor > 0.5) {
      failureReason = `사각/카메라 각도(Perspective Yaw/Pitch)로 인한 문자 종횡비 압축 왜곡`;
      recommendedAugmentation = 'Spatial Transformer Network (STN) 정규화 레이어 적용 및 다양한 3D 시점 합성 데이터셋(3D Synthetic Dataset) 주입';
    } else if (params.rain > 40 || params.fog > 40) {
      failureReason = `악천후(강우/안개)로 인한 에지 콘트라스트 급감`;
      recommendedAugmentation = 'A.RandomRain, A.RandomFog 증강과 함께 CLAHE(적응형 히스토그램 평활화) 전처리 적용';
    } else {
      failureReason = `복합적 노이즈 및 조도 불균형으로 인한 신뢰도 저하 (${errorCount}개 문자)`;
      recommendedAugmentation = '가우시안 노이즈(GaussNoise) 및 ISO 노이즈(ISONoise) 증강 파이프라인 도입 필요';
    }
  } else if (overallConfidence < 75) {
    failureReason = '인식 성공하였으나 확신도(Confidence)가 75% 미만으로 경계선 상태';
    recommendedAugmentation = '능동적 학습(Active Learning) 파이프라인으로 확신도 50~75% 구간의 프레임을 자동 샘플링하여 추가 학습 필요';
  }

  // 4. Generate Albumentations Python script matching the active parameters
  const albumentationsCode = generateAlbumentationsCode(params);

  return {
    detected,
    overallConfidence,
    predictedText: predictedAccumulator,
    charBreakdown,
    latencyMs,
    failureReason,
    recommendedAugmentation,
    albumentationsCode,
    sharpnessScore,
  };
}

export function generateAlbumentationsCode(params: AugmentationParams): string {
  const transforms: string[] = [];

  if (params.blur > 0) {
    const ksize = Math.max(3, Math.round(params.blur * 1.5) * 2 + 1);
    transforms.push(`    # 1. 고속 주행 차량 모션 블러 시뮬레이션
    A.MotionBlur(blur_limit=(${ksize}, ${ksize + 4}), p=0.85)`);
  }

  if (params.brightness !== 100 || params.contrast !== 100) {
    const bLim = ((params.brightness - 100) / 100).toFixed(2);
    const cLim = ((params.contrast - 100) / 100).toFixed(2);
    transforms.push(`    # 2. 야간 저조도 및 고대비 조명 환경 재현
    A.RandomBrightnessContrast(
        brightness_limit=(${bLim}, ${bLim}),
        contrast_limit=(${cLim}, ${cLim}),
        p=0.9
    )`);
  }

  if (params.noise > 0) {
    const varLim = (params.noise * 0.8).toFixed(1);
    transforms.push(`    # 3. 저가형 CCTV 센서 노이즈 및 ISO 입자 시뮬레이션
    A.GaussNoise(var_limit=(10.0, ${varLim}), p=0.75)`);
  }

  if (params.rotate !== 0 || params.perspectiveX !== 0 || params.perspectiveY !== 0) {
    transforms.push(`    # 4. 방범/단속 카메라 설치 각도 왜곡 (Perspective & Rotation)
    A.Perspective(scale=(0.05, 0.18), keep_size=True, p=0.8),
    A.Rotate(limit=(${params.rotate}, ${params.rotate}), border_mode=0, p=0.7)`);
  }

  if (params.rain > 0 || params.fog > 0) {
    transforms.push(`    # 5. 악천후 (비/눈/안개) 날씨 도메인 적응
    A.RandomRain(slant_lower=-10, slant_upper=10, drop_length=20, drop_width=1, p=0.6),
    A.RandomFog(fog_coef_lower=0.2, fog_coef_upper=0.6, alpha_coef=0.08, p=0.5)`);
  }

  if (params.dirt > 0) {
    transforms.push(`    # 6. 번호판 흙탕물/먼지 오염 및 부분 가림 (Coarse Dropout)
    A.CoarseDropout(
        num_holes_range=(2, 6),
        hole_height_range=(8, 24),
        hole_width_range=(8, 24),
        fill=0,
        p=0.7
    )`);
  }

  if (params.glare > 0) {
    transforms.push(`    # 7. 태양광 역광 및 대향차 헤드라이트 플레어
    A.RandomSunFlare(
        flare_roi=(0, 0, 1, 0.5),
        angle_range=(0, 1),
        num_flare_circles_range=(6, 10),
        p=0.8
    )`);
  }

  if (transforms.length === 0) {
    return `# 현재 원본 상태 (모든 증강 파라미터가 비활성화됨)
import albumentations as A
import cv2

transform = A.Compose([
    # 정규화 및 표준 입력 전처리
    A.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
])`;
  }

  return `import albumentations as A
import cv2

# ALPR 실시간 파이프라인용 맞춤형 증강 Compose
alpr_transform = A.Compose([
${transforms.join(',\n\n')}
])

# 학습 데이터셋 로더 적용 예시:
# augmented = alpr_transform(image=license_plate_image)
# train_image = augmented['image']`;
}
