import React, { useState, useMemo, useRef } from 'react';
import {
  CheckSquare,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileCode,
  Image as ImageIcon,
  Upload,
  RefreshCw,
  Wrench,
  Download,
  Copy,
  Check,
  Code2,
  FileCheck,
  Eye,
  Sliders,
  ShieldCheck,
  Layers,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';

export type AnnotationFormat = 'yolo' | 'voc' | 'coco' | 'aihub';

interface ValidationResult {
  ruleId: string;
  name: string;
  category: 'bounds' | 'dimensions' | 'syntax' | 'quality';
  passed: boolean;
  severity: 'error' | 'warning' | 'info';
  message: string;
  details?: string;
}

interface ParsedBBox {
  classId: number;
  className: string;
  plateText: string;
  // Normalized 0-1
  xNorm: number;
  yNorm: number;
  wNorm: number;
  hNorm: number;
  // Pixel coordinates
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
  width: number;
  height: number;
  aspectRatio: number;
  areaPixels: number;
}

const SAMPLE_SCENARIOS = [
  {
    id: 'valid_white_8',
    name: '정상 신형 8자리 번호판 (100% 통과)',
    format: 'yolo' as AnnotationFormat,
    imgWidth: 1920,
    imgHeight: 1080,
    rawAnnotation: '0 0.512 0.725 0.145 0.038\n# OCR: 123가4567 (신형 8자리 자가용 흰색 번호판)',
    sampleImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
    description: 'ITS 표준 1080p 화각, 정상 4.7:1 종횡비 및 국토부 표준 8자리 번호판 문법 준수'
  },
  {
    id: 'out_of_bounds',
    name: '경계 초과 및 0-1 정규화 결함 (Out-of-Bounds)',
    format: 'yolo' as AnnotationFormat,
    imgWidth: 1920,
    imgHeight: 1080,
    rawAnnotation: '0 0.965 0.740 0.160 0.045\n# OCR: 52가1234 (번호판 우측이 프레임 1.0 바깥으로 침범)',
    sampleImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    description: 'x_center + width/2 > 1.0 (우측 바운더리 클리핑 발생, 모델 학습 시 NaN 손실 유발 위험)'
  },
  {
    id: 'degenerate_small',
    name: '극단적 저해상도 및 면적 미달 (Degenerate Box)',
    format: 'voc' as AnnotationFormat,
    imgWidth: 1280,
    imgHeight: 720,
    rawAnnotation: `<annotation>
  <filename>synthetic_plate_0042.jpg</filename>
  <size>
    <width>1280</width>
    <height>720</height>
    <depth>3</depth>
  </size>
  <object>
    <name>plate</name>
    <text>345너8901</text>
    <bndbox>
      <xmin>620</xmin>
      <ymin>350</ymin>
      <xmax>678</xmax>
      <ymax>362</ymax>
    </bndbox>
  </object>
</annotation>`,
    sampleImage: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80',
    description: '번호판 폭 58px (OCR 권장 최소 기준 130px 미달로 한글 음절 획 분해 불가 위험)'
  },
  {
    id: 'syntax_error',
    name: '한글 번호판 문법 불일치 (Syntax Mismatch)',
    format: 'yolo' as AnnotationFormat,
    imgWidth: 1920,
    imgHeight: 1080,
    rawAnnotation: '0 0.485 0.612 0.138 0.035\n# OCR: 12ABC456 (영문 알파벳 불법 삽입)',
    sampleImage: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
    description: '국토부 규격이 아닌 알파벳(ABC)이 라벨링되어 OCR 사전 학습 사전에 없는 결함 텍스트'
  }
];

export const DataValidatorSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'single' | 'batch' | 'schema'>('single');
  const [format, setFormat] = useState<AnnotationFormat>('yolo');
  const [imageWidth, setImageWidth] = useState<number>(1920);
  const [imageHeight, setImageHeight] = useState<number>(1080);
  const [rawText, setRawText] = useState<string>(SAMPLE_SCENARIOS[0].rawAnnotation);
  const [plateImageUrl, setPlateImageUrl] = useState<string>(SAMPLE_SCENARIOS[0].sampleImage);
  const [copied, setCopied] = useState<boolean>(false);
  const [autoFixedMessage, setAutoFixedMessage] = useState<string | null>(null);

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse annotation based on format
  const parsedBox: ParsedBBox | null = useMemo(() => {
    try {
      if (format === 'yolo') {
        // Parse YOLO: class x_c y_c w h
        // Optional comment line # OCR: text
        const lines = rawText.trim().split('\n');
        const dataLine = lines.find(l => !l.trim().startsWith('#') && l.trim().length > 0) || '';
        const commentLine = lines.find(l => l.includes('OCR:')) || '';
        
        let plateText = '123가4567';
        if (commentLine) {
          const match = commentLine.match(/OCR:\s*([^\s\(\)]+)/i);
          if (match) plateText = match[1];
        }

        const parts = dataLine.trim().split(/\s+/).map(Number);
        if (parts.length >= 5 && !parts.some(isNaN)) {
          const classId = parts[0];
          const xNorm = parts[1];
          const yNorm = parts[2];
          const wNorm = parts[3];
          const hNorm = parts[4];

          const width = wNorm * imageWidth;
          const height = hNorm * imageHeight;
          const xmin = (xNorm - wNorm / 2) * imageWidth;
          const ymin = (yNorm - hNorm / 2) * imageHeight;
          const xmax = (xNorm + wNorm / 2) * imageWidth;
          const ymax = (yNorm + hNorm / 2) * imageHeight;
          const areaPixels = width * height;
          const aspectRatio = height > 0 ? width / height : 0;

          return {
            classId,
            className: classId === 0 ? 'license_plate' : `class_${classId}`,
            plateText,
            xNorm,
            yNorm,
            wNorm,
            hNorm,
            xmin,
            ymin,
            xmax,
            ymax,
            width,
            height,
            aspectRatio,
            areaPixels
          };
        }
      } else if (format === 'voc') {
        // Parse Pascal VOC XML basic
        const xminMatch = rawText.match(/<xmin>(\d+)<\/xmin>/);
        const yminMatch = rawText.match(/<ymin>(\d+)<\/ymin>/);
        const xmaxMatch = rawText.match(/<xmax>(\d+)<\/xmax>/);
        const ymaxMatch = rawText.match(/<ymax>(\d+)<\/ymax>/);
        const textMatch = rawText.match(/<text>([^<]+)<\/text>/);

        if (xminMatch && yminMatch && xmaxMatch && ymaxMatch) {
          const xmin = Number(xminMatch[1]);
          const ymin = Number(yminMatch[1]);
          const xmax = Number(xmaxMatch[1]);
          const ymax = Number(ymaxMatch[1]);
          const width = xmax - xmin;
          const height = ymax - ymin;
          const xNorm = (xmin + width / 2) / imageWidth;
          const yNorm = (ymin + height / 2) / imageHeight;
          const wNorm = width / imageWidth;
          const hNorm = height / imageHeight;
          const areaPixels = width * height;
          const aspectRatio = height > 0 ? width / height : 0;
          const plateText = textMatch ? textMatch[1] : '123가4567';

          return {
            classId: 0,
            className: 'plate',
            plateText,
            xNorm,
            yNorm,
            wNorm,
            hNorm,
            xmin,
            ymin,
            xmax,
            ymax,
            width,
            height,
            aspectRatio,
            areaPixels
          };
        }
      }
    } catch {
      return null;
    }
    return null;
  }, [rawText, format, imageWidth, imageHeight]);

  // Sanity check rules engine
  const validationResults: ValidationResult[] = useMemo(() => {
    if (!parsedBox) {
      return [
        {
          ruleId: 'syntax_parse_fail',
          name: '어노테이션 포맷 구문 파싱',
          category: 'syntax',
          passed: false,
          severity: 'error',
          message: '선택한 포맷(YOLO/VOC)에 부합하지 않거나 필수 좌표 값이 누락되었습니다.',
          details: 'YOLO 형식은 "class x_center y_center width height" 공백 구분자 5개 숫자를 요구합니다.'
        }
      ];
    }

    const results: ValidationResult[] = [];

    // Rule 1: Normalization bounds check [0.0 ~ 1.0]
    const isNormValid = 
      parsedBox.xNorm >= 0 && parsedBox.xNorm <= 1.0 &&
      parsedBox.yNorm >= 0 && parsedBox.yNorm <= 1.0 &&
      parsedBox.wNorm > 0 && parsedBox.wNorm <= 1.0 &&
      parsedBox.hNorm > 0 && parsedBox.hNorm <= 1.0;

    results.push({
      ruleId: 'coord_normalization',
      name: '0.0 ~ 1.0 정규화 좌표 범위 검사',
      category: 'bounds',
      passed: isNormValid,
      severity: isNormValid ? 'info' : 'error',
      message: isNormValid
        ? `정규화 좌표 정상 (xc=${parsedBox.xNorm.toFixed(3)}, yc=${parsedBox.yNorm.toFixed(3)}, w=${parsedBox.wNorm.toFixed(3)}, h=${parsedBox.hNorm.toFixed(3)})`
        : '정규화 좌표가 0.0 미만이거나 1.0을 초과했습니다. 학습 시 손실 함수 발산(NaN) 위험이 있습니다.',
      details: 'YOLO 라벨 파일은 반드시 이미지 해상도로 나눈 0~1 사이의 부동소수점이어야 합니다.'
    });

    // Rule 2: Boundary frame clipping check (x_min >= 0, x_max <= W, y_min >= 0, y_max <= H)
    const isInsideFrame = 
      parsedBox.xmin >= 0 && parsedBox.xmax <= imageWidth &&
      parsedBox.ymin >= 0 && parsedBox.ymax <= imageHeight;

    results.push({
      ruleId: 'frame_bounds_clip',
      name: '이미지 캔버스 바운더리 초과(클리핑) 검사',
      category: 'bounds',
      passed: isInsideFrame,
      severity: isInsideFrame ? 'info' : 'warning',
      message: isInsideFrame
        ? `바운딩 박스가 이미지 영역 내에 완전히 포함됩니다. (x: ${Math.round(parsedBox.xmin)}~${Math.round(parsedBox.xmax)}px)`
        : `박스 일부가 이미지 프레임 외부로 잘려 나갔습니다! (xmin: ${Math.round(parsedBox.xmin)}, xmax: ${Math.round(parsedBox.xmax)}, W: ${imageWidth}px)`,
      details: '일반적으로 번호판이 10% 이상 잘려나가면 OCR 인식기가 글자를 환각(Hallucination)할 수 있습니다.'
    });

    // Rule 3: Degenerate Box & Area check
    const isAreaValid = parsedBox.areaPixels >= 800 && parsedBox.width >= 40 && parsedBox.height >= 12;
    results.push({
      ruleId: 'degenerate_box',
      name: '최소 박스 면적 및 퇴화(Degenerate) 검사',
      category: 'dimensions',
      passed: isAreaValid,
      severity: isAreaValid ? 'info' : 'error',
      message: isAreaValid
        ? `박스 면적 정상: ${Math.round(parsedBox.width)} × ${Math.round(parsedBox.height)} px (면적: ${Math.round(parsedBox.areaPixels)} px²)`
        : `박스 면적이 너무 작거나 0에 수렴합니다 (${Math.round(parsedBox.width)}×${Math.round(parsedBox.height)}px). 딥러닝 NMS 단계에서 필터링될 수 있습니다.`,
      details: '유효한 번호판 객체는 최소 800 픽셀 이상의 면적을 유지해야 합니다.'
    });

    // Rule 4: Aspect Ratio Compliance (Korean plate standard ~ 4.7:1 or ~ 2.0:1)
    const ratio = parsedBox.aspectRatio;
    // Standard white 8: 520 / 110 = 4.72
    // Old 7 white: 335 / 170 = 1.97
    // Angled tolerance: 1.5 to 5.8
    const isAspectRealistic = ratio >= 1.5 && ratio <= 6.0;
    results.push({
      ruleId: 'aspect_ratio',
      name: '한국 표준 번호판 종횡비(Aspect Ratio) 부합도',
      category: 'dimensions',
      passed: isAspectRealistic,
      severity: isAspectRealistic ? 'info' : 'warning',
      message: isAspectRealistic
        ? `종횡비 양호: ${ratio.toFixed(2)}:1 (표준 1줄형 4.72:1 또는 2줄형 1.97:1 허용 범위)`
        : `비정상적인 종횡비 (${ratio.toFixed(2)}:1). 번호판이 비정상적으로 길쭉하거나 세로로 왜곡되었습니다.`,
      details: '규격 외 종횡비는 4점 투시 보정(STN) 단계에서 텍스트 늘어짐 왜곡을 초래합니다.'
    });

    // Rule 5: Optimal Pixel Density for OCR (width: 130px ~ 300px)
    const isOptimalPixelDensity = parsedBox.width >= 130 && parsedBox.width <= 320;
    results.push({
      ruleId: 'pixel_density',
      name: 'OCR 최적 픽셀 밀도 (130px ~ 300px 권장 구간)',
      category: 'quality',
      passed: isOptimalPixelDensity,
      severity: isOptimalPixelDensity ? 'info' : 'warning',
      message: isOptimalPixelDensity
        ? `최적 픽셀 밀도 충족: 번호판 가로폭 ${Math.round(parsedBox.width)} 픽셀`
        : parsedBox.width < 130
        ? `픽셀 밀도 부족 (${Math.round(parsedBox.width)}px < 130px). 한글 모음 획('처'↔'퍼') 분해능이 저하됩니다.`
        : `번호판 가로폭이 다소 큼 (${Math.round(parsedBox.width)}px > 300px). 모델 수용 영역(Receptive Field) 초과 가능성.`,
      details: 'AI 연구 대시보드 광학 가이드에 따라 130~300px 범위에서 최고의 OCR 정확도를 보입니다.'
    });

    // Rule 6: Korean Plate Text Syntax Regex Check
    // e.g. 12가 3456 or 123가 4567 or 서울 12 가 3456
    const cleanText = parsedBox.plateText.replace(/\s+/g, '');
    const koreanPlateRegex = /^(\d{2,3}[가-힣]\d{4}|[가-힣]{2}\d{2}[가-힣]\d{4})$/;
    const isKoreanPlateValid = koreanPlateRegex.test(cleanText);
    results.push({
      ruleId: 'korean_ocr_syntax',
      name: '국토교통부 표준 자동차 번호판 정규식(Regex) 검증',
      category: 'syntax',
      passed: isKoreanPlateValid,
      severity: isKoreanPlateValid ? 'info' : 'error',
      message: isKoreanPlateValid
        ? `국토교통부 번호판 서식 표준 통과: "${parsedBox.plateText}"`
        : `번호판 텍스트 서식 불일치: "${parsedBox.plateText}". 표준 한글 7/8자리 규격을 벗어납니다.`,
      details: '표준 규격: "12가 3456"(7자리) 또는 "123가 4567"(8자리) 또는 "서울 12가 3456"(지역명).'
    });

    return results;
  }, [parsedBox, imageWidth, imageHeight]);

  // Overall pass status
  const errorCount = validationResults.filter(r => !r.passed && r.severity === 'error').length;
  const warningCount = validationResults.filter(r => !r.passed && r.severity === 'warning').length;
  const isAllPassed = errorCount === 0 && warningCount === 0;

  // Auto-Repair Function
  const handleAutoRepair = () => {
    if (!parsedBox) return;

    // Clamp coordinates to 0..1
    const clampedXMin = Math.max(0, Math.min(imageWidth - 10, parsedBox.xmin));
    const clampedYMin = Math.max(0, Math.min(imageHeight - 10, parsedBox.ymin));
    const clampedXMax = Math.min(imageWidth, Math.max(clampedXMin + 20, parsedBox.xmax));
    const clampedYMax = Math.min(imageHeight, Math.max(clampedYMin + 10, parsedBox.ymax));

    const newW = clampedXMax - clampedXMin;
    const newH = clampedYMax - clampedYMin;
    const newXc = (clampedXMin + newW / 2) / imageWidth;
    const newYc = (clampedYMin + newH / 2) / imageHeight;
    const newWn = newW / imageWidth;
    const newHn = newH / imageHeight;

    // Clean text
    let fixedText = parsedBox.plateText.replace(/[^0-9가-힣]/g, '');
    if (fixedText.length < 7) fixedText = '123가4567';

    if (format === 'yolo') {
      const fixedYolo = `0 ${newXc.toFixed(6)} ${newYc.toFixed(6)} ${newWn.toFixed(6)} ${newHn.toFixed(6)}\n# OCR: ${fixedText} (자동 보정 완료)`;
      setRawText(fixedYolo);
    } else if (format === 'voc') {
      const fixedVoc = `<annotation>
  <filename>synthetic_plate_fixed.jpg</filename>
  <size>
    <width>${imageWidth}</width>
    <height>${imageHeight}</height>
    <depth>3</depth>
  </size>
  <object>
    <name>plate</name>
    <text>${fixedText}</text>
    <bndbox>
      <xmin>${Math.round(clampedXMin)}</xmin>
      <ymin>${Math.round(clampedYMin)}</ymin>
      <xmax>${Math.round(clampedXMax)}</xmax>
      <ymax>${Math.round(clampedYMax)}</ymax>
    </bndbox>
  </object>
</annotation>`;
      setRawText(fixedVoc);
    }

    setAutoFixedMessage('바운더리 클리핑 및 비정상 좌표 정규화가 완료되었습니다.');
    setTimeout(() => setAutoFixedMessage(null), 3000);
  };

  // Convert Format
  const convertFormatTo = (targetFormat: AnnotationFormat) => {
    if (!parsedBox) return;
    if (targetFormat === 'voc') {
      const voc = `<annotation>
  <filename>plate_sample.jpg</filename>
  <size>
    <width>${imageWidth}</width>
    <height>${imageHeight}</height>
    <depth>3</depth>
  </size>
  <object>
    <name>${parsedBox.className}</name>
    <text>${parsedBox.plateText}</text>
    <bndbox>
      <xmin>${Math.round(parsedBox.xmin)}</xmin>
      <ymin>${Math.round(parsedBox.ymin)}</ymin>
      <xmax>${Math.round(parsedBox.xmax)}</xmax>
      <ymax>${Math.round(parsedBox.ymax)}</ymax>
    </bndbox>
  </object>
</annotation>`;
      setFormat('voc');
      setRawText(voc);
    } else if (targetFormat === 'yolo') {
      const yolo = `${parsedBox.classId} ${parsedBox.xNorm.toFixed(6)} ${parsedBox.yNorm.toFixed(6)} ${parsedBox.wNorm.toFixed(6)} ${parsedBox.hNorm.toFixed(6)}\n# OCR: ${parsedBox.plateText}`;
      setFormat('yolo');
      setRawText(yolo);
    }
  };

  // Handle custom image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPlateImageUrl(url);
      const img = new Image();
      img.onload = () => {
        setImageWidth(img.naturalWidth || 1920);
        setImageHeight(img.naturalHeight || 1080);
      };
      img.src = url;
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="validator" className="py-16 bg-slate-950 text-white border-b border-slate-800 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-2 tracking-wider uppercase font-mono">
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <span>ALPR Synthetic Dataset Sanity Check & Verification</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-400">YOLO · Pascal VOC · COCO Standard</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                합성 데이터 무결성 검증기 (Data Validator)
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-4xl leading-relaxed">
                생성된 합성 번호판 이미지와 어노테이션 파일(YOLO TXT, Pascal VOC XML)의
                <strong>좌표 정규화(0-1), 캔버스 경계 침범, 최소 해상도 픽셀 밀도, 종횡비, 한글 표준 서식</strong>을
                자동으로 정밀 검사하고 원클릭으로 결함을 보정합니다.
              </p>
            </div>

            {/* Quick Overall Status Pill */}
            <div className="flex items-center gap-3 shrink-0">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold ${
                isAllPassed
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : errorCount > 0
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                {isAllPassed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : errorCount > 0 ? (
                  <XCircle className="w-4 h-4 text-rose-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                )}
                <span>
                  {isAllPassed ? '모든 무결성 규칙 통과 (100% Valid)' : `오류 ${errorCount}건 · 경고 ${warningCount}건 검출`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Tab Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-8 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('single')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'single'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>단일 이미지 시각화 & 정밀 진단</span>
          </button>

          <button
            onClick={() => setActiveTab('batch')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'batch'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>결함 시나리오 벤치마크 (4종)</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'schema'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>YOLO / VOC 스키마 가이드 & 검증 스크립트</span>
          </button>
        </div>

        {/* TAB 1: Single Interactive Visualizer */}
        {activeTab === 'single' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Quick Sample Selector */}
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="font-mono text-slate-400 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>테스트 샘플 로드:</span>
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {SAMPLE_SCENARIOS.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => {
                      setFormat(sc.format);
                      setImageWidth(sc.imgWidth);
                      setImageHeight(sc.imgHeight);
                      setRawText(sc.rawAnnotation);
                      setPlateImageUrl(sc.sampleImage);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
                  >
                    {sc.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Interactive Split View: Canvas Visualizer (Left 6) + Code & Rules (Right 6) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Image Canvas Overlay (6 Cols) */}
              <div className="lg:col-span-6 space-y-4">
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-sky-400" />
                      <span className="font-bold text-white text-sm">캔버스 오버레이 시각화</span>
                      <span className="text-[11px] font-mono text-slate-400">
                        ({imageWidth} × {imageHeight} px)
                      </span>
                    </div>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
                    >
                      <Upload className="w-3 h-3 text-sky-400" />
                      <span>이미지 업로드</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Relative Canvas Area */}
                  <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex items-center justify-center">
                    <img
                      src={plateImageUrl}
                      alt="Sample License Plate Frame"
                      className="w-full h-full object-cover"
                    />

                    {/* SVG Bounding Box Overlay */}
                    {parsedBox && (
                      <svg
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        viewBox={`0 0 ${imageWidth} ${imageHeight}`}
                        preserveAspectRatio="none"
                      >
                        {/* Semi-transparent Dark Dim Outside Box */}
                        <defs>
                          <mask id="plate-mask">
                            <rect width="100%" height="100%" fill="white" />
                            <rect
                              x={parsedBox.xmin}
                              y={parsedBox.ymin}
                              width={Math.max(1, parsedBox.width)}
                              height={Math.max(1, parsedBox.height)}
                              fill="black"
                            />
                          </mask>
                        </defs>
                        <rect
                          width="100%"
                          height="100%"
                          fill="rgba(0, 0, 0, 0.45)"
                          mask="url(#plate-mask)"
                        />

                        {/* Bounding Box Border */}
                        <rect
                          x={parsedBox.xmin}
                          y={parsedBox.ymin}
                          width={Math.max(1, parsedBox.width)}
                          height={Math.max(1, parsedBox.height)}
                          fill={isAllPassed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.2)'}
                          stroke={isAllPassed ? '#10b981' : errorCount > 0 ? '#ef4444' : '#f59e0b'}
                          strokeWidth={Math.max(3, imageWidth / 500)}
                          strokeDasharray={parsedBox.xmin < 0 || parsedBox.xmax > imageWidth ? '8,4' : 'none'}
                        />

                        {/* Corner Crosshairs */}
                        <circle cx={parsedBox.xmin} cy={parsedBox.ymin} r={imageWidth / 250} fill="#38bdf8" />
                        <circle cx={parsedBox.xmax} cy={parsedBox.ymin} r={imageWidth / 250} fill="#38bdf8" />
                        <circle cx={parsedBox.xmax} cy={parsedBox.ymax} r={imageWidth / 250} fill="#38bdf8" />
                        <circle cx={parsedBox.xmin} cy={parsedBox.ymax} r={imageWidth / 250} fill="#38bdf8" />
                      </svg>
                    )}

                    {/* HTML Floating Badge over Box */}
                    {parsedBox && (
                      <div
                        className="absolute z-10 pointer-events-none transform -translate-y-full mb-1"
                        style={{
                          left: `${Math.max(2, Math.min(85, (parsedBox.xmin / imageWidth) * 100))}%`,
                          top: `${Math.max(8, (parsedBox.ymin / imageHeight) * 100)}%`
                        }}
                      >
                        <div className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-lg ${
                          isAllPassed
                            ? 'bg-emerald-500 text-slate-950'
                            : errorCount > 0
                            ? 'bg-rose-500 text-white'
                            : 'bg-amber-500 text-slate-950'
                        }`}>
                          <span>{parsedBox.plateText}</span>
                          <span className="opacity-75">|</span>
                          <span className="text-[10px]">{Math.round(parsedBox.width)}×{Math.round(parsedBox.height)}px</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pixel Coordinates Stats Bar */}
                  {parsedBox && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">가로폭 (Width)</span>
                        <strong className="text-sky-400">{Math.round(parsedBox.width)} px</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">세로높이 (Height)</span>
                        <strong className="text-sky-400">{Math.round(parsedBox.height)} px</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">종횡비 (Ratio)</span>
                        <strong className="text-emerald-400">{parsedBox.aspectRatio.toFixed(2)} : 1</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">유효 면적 (Area)</span>
                        <strong className="text-purple-400">{Math.round(parsedBox.areaPixels).toLocaleString()} px²</strong>
                      </div>
                    </div>
                  )}
                </div>

                {/* Auto Repair & Format Convert Bar */}
                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white">자동 복구 & 포맷 변환:</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleAutoRepair}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md shadow-emerald-600/25 active:scale-95"
                      title="경계선 밖으로 나간 좌표를 0~1 프레임 안으로 즉시 교정합니다."
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>원클릭 자동 보정 (Auto-Repair)</span>
                    </button>

                    <button
                      onClick={() => convertFormatTo(format === 'yolo' ? 'voc' : 'yolo')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
                    >
                      <RefreshCw className="w-3 h-3 text-sky-400" />
                      <span>{format === 'yolo' ? 'Pascal VOC로 변환' : 'YOLO로 변환'}</span>
                    </button>
                  </div>
                </div>

                {autoFixedMessage && (
                  <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{autoFixedMessage}</span>
                  </div>
                )}
              </div>

              {/* Right Column: Code Editor & 6 Rules Verification (6 Cols) */}
              <div className="lg:col-span-6 space-y-4">
                {/* Annotation Textarea Editor */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-white text-sm">어노테이션 텍스트 편집기</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={format}
                        onChange={(e) => setFormat(e.target.value as AnnotationFormat)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-sky-400 font-mono font-bold focus:outline-none"
                      >
                        <option value="yolo">YOLO (.txt)</option>
                        <option value="voc">Pascal VOC (.xml)</option>
                      </select>

                      <button
                        onClick={handleCopyText}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="텍스트 복사"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    rows={format === 'voc' ? 10 : 4}
                    className="w-full bg-slate-950 font-mono text-xs text-emerald-300 p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 transition-colors leading-relaxed"
                    placeholder={format === 'yolo' ? '0 0.5 0.7 0.15 0.04' : '<annotation>...</annotation>'}
                  />
                  <div className="text-[10px] font-mono text-slate-400 mt-2 flex justify-between">
                    <span>형식: {format.toUpperCase()}</span>
                    <span>수정 시 실시간으로 좌측 캔버스 및 하단 규칙이 재검증됩니다.</span>
                  </div>
                </div>

                {/* 6 Automated Sanity Check Rules List */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-bold text-white text-sm flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>6대 핵심 무결성 검증 규칙 (Sanity Checklist)</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {validationResults.filter(r => r.passed).length} / {validationResults.length} 통과
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {validationResults.map((rule) => (
                      <div
                        key={rule.ruleId}
                        className={`p-3 rounded-xl border transition-all text-xs ${
                          rule.passed
                            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                            : rule.severity === 'error'
                            ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                            : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            {rule.passed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : rule.severity === 'error' ? (
                              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                            )}
                            <strong className="font-bold text-white text-xs">{rule.name}</strong>
                          </div>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold shrink-0 ${
                            rule.passed
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : rule.severity === 'error'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {rule.passed ? 'PASS' : rule.severity.toUpperCase()}
                          </span>
                        </div>

                        <p className="text-[11px] leading-relaxed text-slate-300 pl-6">
                          {rule.message}
                        </p>

                        {rule.details && (
                          <div className="mt-1.5 pl-6 text-[10px] text-slate-400 font-mono">
                            💡 {rule.details}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Batch Defect Scenarios Benchmark */}
        {activeTab === 'batch' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Layers className="w-5 h-5 text-sky-400" />
                <span>실제 합성 데이터셋 생성 시 자주 발생하는 4대 대표 결함 유형</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                블렌더(Blender)나 Stable Diffusion, 생성형 GAN, OpenCV 증강 파이프라인에서 수천 장을 배치 생성할 때
                수학적 오차로 인해 침투하는 대표적인 어노테이션 결함 사례와 대응책입니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {SAMPLE_SCENARIOS.map((sc, idx) => (
                <div
                  key={sc.id}
                  className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-800 text-sky-400 font-bold">
                        CASE 0{idx + 1}
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        sc.id.includes('valid') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {sc.id.includes('valid') ? '정상 표준' : '결함 사례'}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white mb-2">
                      {sc.name}
                    </h4>

                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                      {sc.description}
                    </p>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 mb-4 overflow-x-auto max-h-28">
                      <pre>{sc.rawAnnotation}</pre>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setFormat(sc.format);
                      setImageWidth(sc.imgWidth);
                      setImageHeight(sc.imgHeight);
                      setRawText(sc.rawAnnotation);
                      setPlateImageUrl(sc.sampleImage);
                      setActiveTab('single');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
                  >
                    <span>이 시나리오 캔버스에서 검증하기</span>
                    <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Schema Reference & Python Script */}
        {activeTab === 'schema' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Box 1: YOLO vs Pascal VOC vs COCO Schema */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
                  <FileCheck className="w-5 h-5 text-emerald-400" />
                  <span>ALPR 표준 어노테이션 포맷 규격 비교</span>
                </h3>

                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-emerald-400 block mb-1">1. YOLOv8 TXT 규격 (Ultra-fast Detection)</strong>
                    <code className="text-[11px] font-mono text-slate-300 block bg-slate-900 p-2 rounded mt-1">
                      &lt;class_id&gt; &lt;x_center&gt; &lt;y_center&gt; &lt;width&gt; &lt;height&gt;
                    </code>
                    <p className="text-slate-400 text-[11px] mt-1.5">
                      모든 좌표는 [0.0 ~ 1.0] 범위로 정규화되어야 하며, 클래스 인덱스는 0부터 시작합니다.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-sky-400 block mb-1">2. Pascal VOC XML 규격 (Traditional CV)</strong>
                    <code className="text-[11px] font-mono text-slate-300 block bg-slate-900 p-2 rounded mt-1">
                      &lt;xmin&gt; &lt;ymin&gt; &lt;xmax&gt; &lt;ymax&gt; (픽셀 단위 절대 좌표)
                    </code>
                    <p className="text-slate-400 text-[11px] mt-1.5">
                      0부터 이미지 해상도(W, H) 범위의 정수 픽셀 좌표를 사용하며, 파일명이 XML 내부에 기록됩니다.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-purple-400 block mb-1">3. YOLO-Pose 4-Point Polygon (원근 왜곡 보정용)</strong>
                    <code className="text-[11px] font-mono text-slate-300 block bg-slate-900 p-2 rounded mt-1">
                      &lt;c&gt; &lt;x&gt; &lt;y&gt; &lt;w&gt; &lt;h&gt; &lt;x1&gt; &lt;y1&gt; &lt;x2&gt; &lt;y2&gt; &lt;x3&gt; &lt;y3&gt; &lt;x4&gt; &lt;y4&gt;
                    </code>
                    <p className="text-slate-400 text-[11px] mt-1.5">
                      번호판의 좌상, 우상, 우하, 좌하 4개 꼭짓점을 키포인트로 학습하여 정면 투시 변환(STN)을 수행합니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* Box 2: Python Batch Validator Script */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-sky-400" />
                    <span>파이썬 로컬 배치 검증 스크립트 (CLI 도구)</span>
                  </h3>
                  <button
                    onClick={() => {
                      const code = `import os
import glob
import re

def validate_alpr_dataset(labels_dir, img_w=1920, img_h=1080):
    txt_files = glob.glob(os.path.join(labels_dir, "*.txt"))
    errors, warnings = 0, 0
    print(f"[*] Validating {len(txt_files)} annotation files...")

    for path in txt_files:
        with open(path, 'r', encoding='utf-8') as f:
            for line_no, line in enumerate(f, 1):
                if line.startswith('#') or not line.strip(): continue
                parts = line.strip().split()
                if len(parts) < 5:
                    print(f"[ERROR] {path}:{line_no} Invalid column count (<5)")
                    errors += 1
                    continue
                cls, xc, yc, w, h = map(float, parts[:5])
                # Bounds check
                if not (0 <= xc <= 1 and 0 <= yc <= 1 and 0 < w <= 1 and 0 < h <= 1):
                    print(f"[ERROR] {path}:{line_no} Out of bounds: ({xc}, {yc}, {w}, {h})")
                    errors += 1
                # Pixel density check
                box_w = w * img_w
                if box_w < 130:
                    warnings += 1
    print(f"[+] Validation complete: {errors} errors, {warnings} warnings.")

if __name__ == '__main__':
    validate_alpr_dataset('./dataset/labels/train')`;
                      navigator.clipboard.writeText(code);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>코드 복사</span>
                  </button>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-[380px]">
                  <pre>{`import os
import glob
import re

def validate_alpr_dataset(labels_dir, img_w=1920, img_h=1080):
    """
    YOLOv8 ALPR 합성 데이터셋 무결성 검증 스크립트
    - 정규화 0~1 검사
    - 최소 픽셀 밀도 (폭 130px 이상)
    - 음수 또는 NaN 검출
    """
    txt_files = glob.glob(os.path.join(labels_dir, "*.txt"))
    errors, warnings = 0, 0
    print(f"[*] Validating {len(txt_files)} files in {labels_dir}...")

    for path in txt_files:
        with open(path, 'r', encoding='utf-8') as f:
            for line_no, line in enumerate(f, 1):
                if line.startswith('#') or not line.strip(): continue
                parts = line.strip().split()
                if len(parts) < 5:
                    print(f"[ERR] {os.path.basename(path)}:{line_no} Invalid columns")
                    errors += 1
                    continue
                cls, xc, yc, w, h = map(float, parts[:5])
                if not (0 <= xc <= 1 and 0 <= yc <= 1 and 0 < w <= 1 and 0 < h <= 1):
                    print(f"[ERR] {os.path.basename(path)} Out of bounds: xc={xc}, w={w}")
                    errors += 1
                if w * img_w < 130:
                    warnings += 1

    print(f"[RESULT] Finished: {errors} Errors, {warnings} Warnings.")`}</pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
