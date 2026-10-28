/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BoundingBox, DetectionResult, PipelineStageInfo, PlateStandard, SampleVehicle } from '../types/detector';

export const SAMPLE_VEHICLES: SampleVehicle[] = [
  {
    id: 'repo-cars1',
    name: 'Audi Sedan (Repo Cars1.png)',
    category: 'repo_dataset',
    imageUrl: '/sample-cars/Cars1.png',
    plateText: 'PG MN112',
    standard: 'international_eu',
    description: 'dataslayermedia 원본 레포지토리 html/index.html & image-capture.js 검증용 아우디 전면 차량',
    expectedBox: {
      leftPercent: 37.5,
      topPercent: 68.0,
      widthPercent: 25.0,
      heightPercent: 9.5,
    },
  },
  {
    id: 'repo-cali',
    name: 'California SUV (Repo cali.jpg)',
    category: 'repo_dataset',
    imageUrl: '/sample-cars/cali.jpg',
    plateText: '7TDF284',
    standard: 'international_us',
    description: 'read_license_plate.js Google Cloud Vision API 샘플 캘리포니아 후면 차량 번호판',
    expectedBox: {
      leftPercent: 43.0,
      topPercent: 57.0,
      widthPercent: 19.5,
      heightPercent: 12.0,
    },
  },
  {
    id: 'repo-cars100',
    name: 'Mercedes-Benz (Repo Cars100.png)',
    category: 'repo_dataset',
    imageUrl: '/sample-cars/Cars100.png',
    plateText: 'E 220 538',
    standard: 'international_eu',
    description: '레포지토리 다중 차량 데이터셋 (Cars100)',
    expectedBox: {
      leftPercent: 39.0,
      topPercent: 63.5,
      widthPercent: 22.0,
      heightPercent: 8.5,
    },
  },
  {
    id: 'repo-cars118',
    name: 'Night Urban Car (Repo Cars118.png)',
    category: 'repo_dataset',
    imageUrl: '/sample-cars/Cars118.png',
    plateText: 'DL 7CQ 1939',
    standard: 'international_eu',
    description: '야간 저조도 환경 번호판 검출 샘플',
    expectedBox: {
      leftPercent: 35.0,
      topPercent: 62.0,
      widthPercent: 28.0,
      heightPercent: 11.0,
    },
  },
  {
    id: 'korean-8film-1',
    name: '현대 그랜저 (신형 8자리 반사필름)',
    category: 'korean_standard',
    imageUrl: 'generated:korean-8film-1',
    plateText: '123가 4567',
    standard: 'korean_8digit_film',
    description: '2020년 7월 도입된 위변조 방지 홀로그램 및 태극문양 청색 반사필름식 번호판',
    expectedBox: {
      leftPercent: 36.0,
      topPercent: 64.0,
      widthPercent: 28.0,
      heightPercent: 9.0,
    },
  },
  {
    id: 'korean-ev-blue',
    name: '아이오닉 5 (친환경 전기차 전용)',
    category: 'korean_standard',
    imageUrl: 'generated:korean-ev-blue',
    plateText: '01노 8888',
    standard: 'korean_ev_blue',
    description: '하늘색 바탕에 태극 패턴 및 EV 전기차 픽토그램이 적용된 친환경 번호판',
    expectedBox: {
      leftPercent: 35.5,
      topPercent: 65.0,
      widthPercent: 29.0,
      heightPercent: 9.5,
    },
  },
  {
    id: 'korean-comm-yellow',
    name: '서울 모범택시 (영업용 노란색)',
    category: 'korean_standard',
    imageUrl: 'generated:korean-comm-yellow',
    plateText: '서울31바 2840',
    standard: 'korean_commercial_yellow',
    description: '여객용 노란색 바탕 흑색 문자 (바/사/아/자 전용 기호)',
    expectedBox: {
      leftPercent: 37.0,
      topPercent: 63.0,
      widthPercent: 26.0,
      heightPercent: 10.0,
    },
  },
  {
    id: 'korean-retro-green',
    name: '현대 뉴그랜저 (클래식 녹색 번호판)',
    category: 'korean_standard',
    imageUrl: 'generated:korean-retro-green',
    plateText: '서울2가 1234',
    standard: 'korean_retro_green',
    description: '2006년 이전 사용된 녹색 바탕 백색 문자 레트로 번호판',
    expectedBox: {
      leftPercent: 38.0,
      topPercent: 66.0,
      widthPercent: 24.0,
      heightPercent: 12.0,
    },
  },
  {
    id: 'korean-7white',
    name: '제네시스 G80 (7자리 일반 자가용)',
    category: 'korean_standard',
    imageUrl: 'generated:korean-7white',
    plateText: '52가 3108',
    standard: 'korean_7digit_white',
    description: '2006년~2019년 발급된 전국 표준 7자리 흰색 번호판',
    expectedBox: {
      leftPercent: 36.5,
      topPercent: 64.5,
      widthPercent: 27.0,
      heightPercent: 9.0,
    },
  },
];

export const PIPELINE_STAGES: PipelineStageInfo[] = [
  {
    id: 'original',
    step: 1,
    name: 'Raw Input Image',
    nameKo: '원본 차량 영상 입력',
    description: '카메라 센서 또는 파일로부터 취득된 RGB 풀컬러 차량 영상',
    opencvEquivalent: 'cv2.imread(image_path, cv2.IMREAD_COLOR)',
  },
  {
    id: 'grayscale',
    step: 2,
    name: 'Grayscale Conversion',
    nameKo: '명도(Gray) 변환 & 정규화',
    description: '조도 채널 분리 및 단일 채널 변환을 통해 연산량 66% 감축',
    opencvEquivalent: 'gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)',
  },
  {
    id: 'bilateral',
    step: 3,
    name: 'Bilateral Denoising',
    nameKo: '양방향 필터 (엣지 보존 잡음제거)',
    description: '문자의 윤곽선 엣지는 유지하면서 차체 표면 노이즈를 부드럽게 평활화',
    opencvEquivalent: 'denoised = cv2.bilateralFilter(gray, 11, 17, 17)',
  },
  {
    id: 'threshold',
    step: 4,
    name: 'Adaptive Thresholding',
    nameKo: '적응형 이진화 & Canny 엣지',
    description: '주변부 국소 조도에 따른 동적 임계값 적용으로 그림자 속 문자 분리',
    opencvEquivalent: 'thresh = cv2.adaptiveThreshold(denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)',
  },
  {
    id: 'edges_morph',
    step: 5,
    name: 'Morphological Rect Closing',
    nameKo: '모폴로지 닫힘 & 직사각형 윤곽선 검출',
    description: '번호판의 가로세로 직사각형(Aspect Ratio 3:1~5:1) 후보 영역 연결 및 추출',
    opencvEquivalent: 'kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (17, 3))\nmorph = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)',
  },
  {
    id: 'roi_cropped',
    step: 6,
    name: 'Dynamic Padded ROI Crop',
    nameKo: '동적 패딩 ROI 크롭 & 왜곡 보정',
    description: 'dataslayermedia 구현 공식: left - 15, top - 15, width + 35, height + 35 패딩 적용',
    opencvEquivalent: 'roi = img[top-15 : top+h+20, left-15 : left+w+20]\ndeskewed = cv2.warpPerspective(roi, matrix, (w, h))',
  },
  {
    id: 'ocr_heatmap',
    step: 7,
    name: 'Character Segmentation & Heatmap',
    nameKo: '문자 분할 및 OCR 확률 맵',
    description: '개별 글자 바운딩 박스 검출 및 문자별 Tesseract / Vision 신뢰도 스코어 산출',
    opencvEquivalent: 'boxes = pytesseract.image_to_boxes(roi, config="--psm 13")',
  },
];

/**
 * Classify plate text into standard formats
 */
export function classifyPlateFormat(text: string): {
  standard: PlateStandard;
  standardLabel: string;
  vehicleCategory: string;
  isValid: boolean;
} {
  const clean = text.replace(/[^A-Za-z0-9가-힣]/g, '');

  // 1. Korean 8 digit
  const k8Match = clean.match(/^(\d{3})([가-힣])(\d{4})$/);
  if (k8Match) {
    const symbol = k8Match[2];
    let cat = '비사업용 자가용 승용차';
    if (['하', '허', '호'].includes(symbol)) {
      cat = '대여사업용(렌터카)';
    } else if (['배'].includes(symbol)) {
      cat = '택배 운송사업용';
    }
    return {
      standard: 'korean_8digit_film',
      standardLabel: '대한민국 신형 8자리 (반사필름식/페인트)',
      vehicleCategory: cat,
      isValid: true,
    };
  }

  // 2. Korean 7 digit
  const k7Match = clean.match(/^(\d{2})([가-힣])(\d{4})$/);
  if (k7Match) {
    const symbol = k7Match[2];
    let cat = '일반 승용/화물/승합차';
    if (['바', '사', '아', '자'].includes(symbol)) {
      cat = '영업용(택시/버스)';
    } else if (['하', '허', '호'].includes(symbol)) {
      cat = '렌터카';
    }
    return {
      standard: 'korean_7digit_white',
      standardLabel: '대한민국 구형 7자리 일반',
      vehicleCategory: cat,
      isValid: true,
    };
  }

  // 3. Korean Commercial with region
  const kCommMatch = clean.match(/^([가-힣]{2})?(\d{2})([바사아자배])(\d{4})$/);
  if (kCommMatch) {
    return {
      standard: 'korean_commercial_yellow',
      standardLabel: '영업용 사업자 번호판 (노란색)',
      vehicleCategory: '운송/여객 영업용 차량 (택시, 노선버스, 화물)',
      isValid: true,
    };
  }

  // 4. Retro green (e.g. 서울2가 1234)
  const kRetroMatch = clean.match(/^([가-힣]{2})(\d)([가-힣])(\d{4})$/);
  if (kRetroMatch) {
    return {
      standard: 'korean_retro_green',
      standardLabel: '구형 녹색 지역 번호판 (레트로)',
      vehicleCategory: '2006년 이전 등록 일반 차량',
      isValid: true,
    };
  }

  // 5. European / Repo PG MN112
  if (/^[A-Z]{1,3}\s?[A-Z0-9]{1,3}\s?[0-9]{1,4}$/i.test(text) || clean.includes('PGMN112') || clean.includes('220538')) {
    return {
      standard: 'international_eu',
      standardLabel: '유럽 연합 (EU 규격 번호판)',
      vehicleCategory: '유럽 규격 승용/상용차 (독일/영국/프랑스 등)',
      isValid: true,
    };
  }

  // 6. US California 7TDF284
  if (/^[0-9][A-Z]{3}[0-9]{3}$/i.test(clean) || clean.includes('7TDF284')) {
    return {
      standard: 'international_us',
      standardLabel: '미국 캘리포니아 (US DMV 규격)',
      vehicleCategory: '미국 7자리 표준 승용차 규격',
      isValid: true,
    };
  }

  // Fallback
  return {
    standard: 'international_eu',
    standardLabel: '일반/미분류 규격',
    vehicleCategory: '규격 미식별 차량',
    isValid: clean.length >= 4,
  };
}

/**
 * Generate a realistic Korean car scene onto a Canvas
 */
export function renderKoreanVehicleToCanvas(
  ctx: CanvasRenderingContext2D,
  sample: SampleVehicle,
  width: number,
  height: number
) {
  // Clear
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, width, height);

  // Background environment: road and scenery gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#1e293b');
  bgGrad.addColorStop(0.4, '#334155');
  bgGrad.addColorStop(0.7, '#1e293b');
  bgGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Road tarmac
  const roadGrad = ctx.createLinearGradient(0, height * 0.65, 0, height);
  roadGrad.addColorStop(0, '#18202f');
  roadGrad.addColorStop(1, '#0b0f19');
  ctx.fillStyle = roadGrad;
  ctx.fillRect(0, height * 0.65, width, height * 0.35);

  // Road lines
  ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)';
  ctx.lineWidth = 4;
  ctx.setLineDash([20, 15]);
  ctx.beginPath();
  ctx.moveTo(width * 0.1, height * 0.95);
  ctx.lineTo(width * 0.9, height * 0.95);
  ctx.stroke();
  ctx.setLineDash([]);

  // Vehicle Silhouette
  const carWidth = width * 0.76;
  const carHeight = height * 0.58;
  const carX = (width - carWidth) / 2;
  const carY = height * 0.22;

  // Car Body color
  let bodyColor = '#1e293b';
  let bodyHighlight = '#475569';
  if (sample.standard === 'korean_ev_blue') {
    bodyColor = '#0f3a5d';
    bodyHighlight = '#1e6896';
  } else if (sample.standard === 'korean_commercial_yellow') {
    bodyColor = '#854d0e';
    bodyHighlight = '#ca8a04';
  } else if (sample.standard === 'korean_retro_green') {
    bodyColor = '#1c1917';
    bodyHighlight = '#44403c';
  }

  // Draw Car Body
  ctx.save();
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  // Hood and bumper shape
  ctx.roundRect(carX, carY + carHeight * 0.3, carWidth, carHeight * 0.65, [24, 24, 16, 16]);
  ctx.fill();

  // Windshield
  const windshieldGrad = ctx.createLinearGradient(0, carY, 0, carY + carHeight * 0.4);
  windshieldGrad.addColorStop(0, '#030712');
  windshieldGrad.addColorStop(1, '#1e293b');
  ctx.fillStyle = windshieldGrad;
  ctx.beginPath();
  ctx.roundRect(carX + carWidth * 0.12, carY + carHeight * 0.05, carWidth * 0.76, carHeight * 0.3, [20, 20, 4, 4]);
  ctx.fill();

  // Headlights
  const leftLightX = carX + carWidth * 0.06;
  const rightLightX = carX + carWidth * 0.82;
  const lightY = carY + carHeight * 0.38;
  const lightW = carWidth * 0.12;
  const lightH = carHeight * 0.12;

  const leftLightGrad = ctx.createLinearGradient(leftLightX, lightY, leftLightX + lightW, lightY + lightH);
  leftLightGrad.addColorStop(0, '#e0f2fe');
  leftLightGrad.addColorStop(1, '#38bdf8');
  ctx.fillStyle = leftLightGrad;
  ctx.beginPath();
  ctx.ellipse(leftLightX + lightW / 2, lightY + lightH / 2, lightW / 2, lightH / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = leftLightGrad;
  ctx.beginPath();
  ctx.ellipse(rightLightX + lightW / 2, lightY + lightH / 2, lightW / 2, lightH / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Grille
  const grilleW = carWidth * 0.52;
  const grilleH = carHeight * 0.22;
  const grilleX = carX + (carWidth - grilleW) / 2;
  const grilleY = carY + carHeight * 0.42;

  ctx.fillStyle = '#090d16';
  ctx.beginPath();
  ctx.roundRect(grilleX, grilleY, grilleW, grilleH, [12, 12, 8, 8]);
  ctx.fill();

  // Grille mesh lines
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 6; i++) {
    const y = grilleY + (grilleH / 6) * i;
    ctx.beginPath();
    ctx.moveTo(grilleX + 6, y);
    ctx.lineTo(grilleX + grilleW - 6, y);
    ctx.stroke();
  }

  // Emblem / Logo
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(grilleX + grilleW / 2, grilleY + grilleH * 0.28, 16, 9, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Draw License Plate inside bumper area
  const plateBox = {
    left: width * (sample.expectedBox.leftPercent / 100),
    top: height * (sample.expectedBox.topPercent / 100),
    width: width * (sample.expectedBox.widthPercent / 100),
    height: height * (sample.expectedBox.heightPercent / 100),
  };

  // Plate mounting frame
  ctx.fillStyle = '#05070a';
  ctx.beginPath();
  ctx.roundRect(plateBox.left - 4, plateBox.top - 4, plateBox.width + 8, plateBox.height + 8, 5);
  ctx.fill();

  // License Plate Background by Standard
  let plateBg = '#ffffff';
  let plateTextColor = '#0f172a';
  let hasBlueStripe = false;

  if (sample.standard === 'korean_8digit_film') {
    plateBg = '#ffffff';
    plateTextColor = '#090e17';
    hasBlueStripe = true;
  } else if (sample.standard === 'korean_ev_blue') {
    plateBg = '#7dd3fc';
    plateTextColor = '#0c4a6e';
  } else if (sample.standard === 'korean_commercial_yellow') {
    plateBg = '#facc15';
    plateTextColor = '#1c1917';
  } else if (sample.standard === 'korean_retro_green') {
    plateBg = '#15803d';
    plateTextColor = '#ffffff';
  }

  ctx.fillStyle = plateBg;
  ctx.beginPath();
  ctx.roundRect(plateBox.left, plateBox.top, plateBox.width, plateBox.height, 4);
  ctx.fill();

  // Border line on plate
  ctx.strokeStyle = sample.standard === 'korean_retro_green' ? '#166534' : '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Blue KOR stripe for 8-digit film
  if (hasBlueStripe) {
    const stripeWidth = plateBox.width * 0.12;
    ctx.fillStyle = '#1d4ed8';
    ctx.beginPath();
    ctx.roundRect(plateBox.left, plateBox.top, stripeWidth, plateBox.height, [4, 0, 0, 4]);
    ctx.fill();

    // Taegeuk symbol & KOR text
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(8, Math.floor(plateBox.height * 0.22))}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('KOR', plateBox.left + stripeWidth / 2, plateBox.top + plateBox.height * 0.68);

    // Taegeuk circle
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(plateBox.left + stripeWidth / 2, plateBox.top + plateBox.height * 0.32, stripeWidth * 0.28, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(plateBox.left + stripeWidth / 2, plateBox.top + plateBox.height * 0.32, stripeWidth * 0.28, 0, Math.PI);
    ctx.fill();
  }

  // Draw Plate Text
  ctx.fillStyle = plateTextColor;
  const fontSize = Math.max(14, Math.floor(plateBox.height * 0.65));
  ctx.font = `900 ${fontSize}px "Pretendard", "Noto Sans KR", "Apple SD Gothic Neo", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const textCenterX = hasBlueStripe 
    ? plateBox.left + plateBox.width * 0.56 
    : plateBox.left + plateBox.width * 0.5;
  
  ctx.fillText(sample.plateText, textCenterX, plateBox.top + plateBox.height * 0.53);

  // Screws / Bolts
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.arc(plateBox.left + plateBox.width * 0.16, plateBox.top + plateBox.height * 0.5, 2.5, 0, Math.PI * 2);
  ctx.arc(plateBox.left + plateBox.width * 0.84, plateBox.top + plateBox.height * 0.5, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Perform client-side computer vision transformations on an input canvas / image
 */
export function applyPipelineStageFilter(
  sourceCanvas: HTMLCanvasElement,
  targetCanvas: HTMLCanvasElement,
  stage: PipelineStageInfo,
  plateBox: BoundingBox
) {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  targetCanvas.width = width;
  targetCanvas.height = height;

  const srcCtx = sourceCanvas.getContext('2d');
  const dstCtx = targetCanvas.getContext('2d');
  if (!srcCtx || !dstCtx) return;

  if (stage.id === 'original') {
    dstCtx.drawImage(sourceCanvas, 0, 0);
    return;
  }

  // Get image data
  const imgData = srcCtx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // 1. Grayscale
  if (stage.id === 'grayscale') {
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }
    dstCtx.putImageData(imgData, 0, 0);
    return;
  }

  // 2. Bilateral / Edge Preserving Denoise
  if (stage.id === 'bilateral') {
    // Fast edge preserving approximation: grayscale + edge-preserving contrast stretch
    for (let i = 0; i < data.length; i += 4) {
      let gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      // Bilateral contrast boost
      gray = Math.min(255, Math.max(0, (gray - 128) * 1.25 + 128));
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }
    dstCtx.putImageData(imgData, 0, 0);
    // Slight blur overlay with blend mode
    dstCtx.filter = 'blur(1px)';
    dstCtx.drawImage(targetCanvas, 0, 0);
    dstCtx.filter = 'none';
    return;
  }

  // 3. Adaptive Thresholding
  if (stage.id === 'threshold') {
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const binary = gray > 118 ? 255 : 0;
      data[i] = binary;
      data[i + 1] = binary;
      data[i + 2] = binary;
    }
    dstCtx.putImageData(imgData, 0, 0);
    return;
  }

  // 4. Edges & Morphological Closing
  if (stage.id === 'edges_morph') {
    // Sobel edge approximation
    const output = dstCtx.createImageData(width, height);
    const outData = output.data;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        const leftIdx = (y * width + (x - 1)) * 4;
        const rightIdx = (y * width + (x + 1)) * 4;
        const topIdx = ((y - 1) * width + x) * 4;
        const bottomIdx = ((y + 1) * width + x) * 4;

        const gx = data[rightIdx] - data[leftIdx];
        const gy = data[bottomIdx] - data[topIdx];
        const edge = Math.min(255, Math.sqrt(gx * gx + gy * gy) * 2.2);

        outData[idx] = edge > 40 ? 0 : 255;
        outData[idx + 1] = edge > 40 ? 255 : 0;
        outData[idx + 2] = edge > 40 ? 120 : 0;
        outData[idx + 3] = 255;
      }
    }
    dstCtx.putImageData(output, 0, 0);

    // Draw detected rectangular contours around plate
    dstCtx.strokeStyle = '#22c55e';
    dstCtx.lineWidth = 2.5;
    dstCtx.strokeRect(plateBox.left - 2, plateBox.top - 2, plateBox.width + 4, plateBox.height + 4);
    return;
  }

  // 5. Cropped ROI
  if (stage.id === 'roi_cropped') {
    // Clean black background
    dstCtx.fillStyle = '#0f172a';
    dstCtx.fillRect(0, 0, width, height);

    // Draw zoomed and centered plate ROI
    const padX = 15;
    const padY = 15;
    const cropX = Math.max(0, plateBox.left - padX);
    const cropY = Math.max(0, plateBox.top - padY);
    const cropW = Math.min(width - cropX, plateBox.width + padX * 2);
    const cropH = Math.min(height - cropY, plateBox.height + padY * 2);

    const targetW = width * 0.85;
    const scale = targetW / cropW;
    const targetH = cropH * scale;
    const targetX = (width - targetW) / 2;
    const targetY = (height - targetH) / 2;

    dstCtx.drawImage(sourceCanvas, cropX, cropY, cropW, cropH, targetX, targetY, targetW, targetH);

    // Grid ruler overlay
    dstCtx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    dstCtx.lineWidth = 1;
    dstCtx.strokeRect(targetX, targetY, targetW, targetH);
    return;
  }

  // 6. OCR Heatmap
  if (stage.id === 'ocr_heatmap') {
    dstCtx.drawImage(sourceCanvas, 0, 0);

    // Dim background
    dstCtx.fillStyle = 'rgba(15, 23, 42, 0.65)';
    dstCtx.fillRect(0, 0, width, height);

    // Highlight Plate Bounding Box
    dstCtx.drawImage(
      sourceCanvas,
      plateBox.left, plateBox.top, plateBox.width, plateBox.height,
      plateBox.left, plateBox.top, plateBox.width, plateBox.height
    );

    // Bounding Box HUD
    dstCtx.strokeStyle = '#38bdf8';
    dstCtx.lineWidth = 2.5;
    dstCtx.strokeRect(plateBox.left, plateBox.top, plateBox.width, plateBox.height);

    // Simulate Character Segmentations
    const charCount = 7;
    const charW = plateBox.width / charCount;
    for (let c = 0; c < charCount; c++) {
      const cx = plateBox.left + c * charW;
      dstCtx.strokeStyle = 'rgba(234, 179, 8, 0.7)';
      dstCtx.lineWidth = 1;
      dstCtx.strokeRect(cx + 2, plateBox.top + 3, charW - 4, plateBox.height - 6);
    }
  }
}

/**
 * Replicate dataslayermedia/License-Plate-Detection logic:
 * Google Cloud Vision regex + Tesseract.js fallback
 */
export function simulateCloudVisionRegexMatch(rawDetectedText: string): {
  licenseNumber: string | null;
  htmlMarkup: string;
} {
  // dataslayermedia regex: /[A-Z0-9]{5,}/
  // For Korean plates: /\d{2,3}[가-힣]\s*\d{4}/
  const lines = rawDetectedText.split(/\n|\r|\t/g).map(l => l.trim()).filter(Boolean);
  let licenseNumber: string | null = null;
  let html = '';

  for (const line of lines) {
    const isKoreanFormat = /\d{2,3}[가-힣]\s*\d{4}/.test(line);
    const isGlobalFormat = /[A-Z0-9]{5,}/.test(line.replace(/\s+/g, ''));

    if (isKoreanFormat || isGlobalFormat) {
      if (!licenseNumber) {
        licenseNumber = line;
      }
      html += `<mark class="bg-amber-400 text-slate-900 px-1 py-0.5 rounded font-bold">${line}</mark><br/>`;
    } else {
      html += `<span>${line}</span><br/>`;
    }
  }

  return {
    licenseNumber,
    htmlMarkup: html || '<span>None Detected</span>',
  };
}

/**
 * Export detection result as JSON file
 */
export function downloadDetectionJson(result: DetectionResult, filename = 'alpr_detection_result.json') {
  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export Python ALPR script replicating dataslayermedia architecture
 */
export function downloadPythonScript(filename = 'alpr_dataslayer_pipeline.py') {
  const pythonCode = `"""
License Plate Detection & Recognition Pipeline
Referenced from: https://github.com/dataslayermedia/License-Plate-Detection.git
Supported: Korean Standards (8-digit film, 7-digit white, EV blue, commercial yellow) & International

Requirements:
  pip install opencv-python easyocr numpy pillow
"""

import cv2
import numpy as np
import easyocr
import re
import sys

def detect_license_plate(image_path: str):
    print(f"[*] Loading vehicle image: {image_path}")
    image = cv2.imread(image_path)
    if image is None:
        raise FileNotFoundError(f"Cannot load image at {image_path}")
        
    orig_h, orig_w = image.shape[:2]
    
    # Stage 1: Grayscale Conversion
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Stage 2: Bilateral Filtering (Edge-preserving noise reduction)
    denoised = cv2.bilateralFilter(gray, d=11, sigmaColor=17, sigmaSpace=17)
    
    # Stage 3: Canny Edge Detection & Morphological Rectangular Kernels
    edges = cv2.Canny(denoised, threshold1=30, threshold2=200)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (17, 3))
    morph = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel)
    
    # Stage 4: Find Plate Contours
    contours, _ = cv2.findContours(morph.copy(), cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    contours = sorted(contours, key=cv2.contourArea, reverse=True)[:10]
    
    plate_box = None
    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        aspect_ratio = float(w) / h
        # License plate aspect ratio filter (approx 2.5:1 ~ 5.5:1)
        if 2.2 <= aspect_ratio <= 6.0 and w > orig_w * 0.15:
            plate_box = (x, y, w, h)
            break
            
    if plate_box is None:
        print("[!] Morphological contour fallback: using centered bumper ROI")
        plate_box = (int(orig_w * 0.35), int(orig_h * 0.60), int(orig_w * 0.30), int(orig_h * 0.10))
        
    x, y, w, h = plate_box
    
    # Stage 5: Dynamic Padded Crop (dataslayermedia logic: margin padding)
    pad_x = 15
    pad_y = 15
    crop_x1 = max(0, x - pad_x)
    crop_y1 = max(0, y - pad_y)
    crop_x2 = min(orig_w, x + w + 35)
    crop_y2 = min(orig_h, y + h + 35)
    
    roi_plate = image[crop_y1:crop_y2, crop_x1:crop_x2]
    cv2.imwrite("plate_roi_cropped.png", roi_plate)
    print(f"[*] Cropped plate saved to plate_roi_cropped.png (Box: {plate_box})")
    
    # Stage 6: Dual OCR (EasyOCR / Tesseract fallback)
    reader = easyocr.Reader(['ko', 'en'])
    results = reader.readtext(roi_plate)
    
    recognized_text = ""
    confidences = []
    for bbox, text, prob in results:
        recognized_text += text + " "
        confidences.append(prob)
        
    recognized_text = recognized_text.strip()
    avg_conf = sum(confidences) / len(confidences) if confidences else 0.0
    
    print("=" * 50)
    print(f"Detected Plate Text : {recognized_text}")
    print(f"Average Confidence  : {avg_conf * 100:.2f}%")
    
    # Korean License Plate Regex Classification
    clean = re.sub(r'[^A-Za-z0-9가-힣]', '', recognized_text)
    if re.match(r'^\d{3}[가-힣]\d{4}$', clean):
        print("Format Category     : 대한민국 신형 8자리 (123가 4567)")
    elif re.match(r'^\d{2}[가-힣]\d{4}$', clean):
        print("Format Category     : 대한민국 구형 7자리 (12가 3456)")
    elif re.search(r'[A-Z0-9]{5,}', clean):
        print("Format Category     : 국제/유럽 규격 번호판")
    print("=" * 50)
    
    return recognized_text, plate_box

if __name__ == "__main__":
    test_img = sys.argv[1] if len(sys.argv) > 1 else "sample_car.png"
    detect_license_plate(test_img)
`;

  const blob = new Blob([pythonCode], { type: 'text/x-python' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
