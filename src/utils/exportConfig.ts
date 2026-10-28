import { AugmentationParams, PlateType } from '../types/alpr';

export type ExportJsonFormat = 'full_pipeline' | 'raw_params' | 'albumentations_serialized' | 'yolo_pipeline';

export interface AugmentationExportPayload {
  schema_version: string;
  exported_at: string;
  source: string;
  pipeline_id: string;
  profile_name?: string;
  target_domain: string;
  plate_spec?: {
    type?: PlateType;
    type_label?: string;
    sample_text?: string;
  };
  augmentation_params: AugmentationParams;
  albumentations_config: {
    blur_limit: number;
    brightness_limit: number;
    contrast_limit: number;
    noise_variance: number;
    rotation_limit: number;
    perspective_distortion: number;
    rain_drop_rate: number;
    fog_alpha_coef: number;
  };
  pytorch_v2_spec: {
    gaussian_blur: { kernel_size: number; sigma: [number, number] };
    color_jitter: { brightness: number; contrast: number };
    random_rotation: { degrees: [number, number] };
    random_perspective: { distortion_scale: number; p: number };
  };
  pipeline_integration_guide: {
    python_import: string;
    cli_arg: string;
  };
}

export interface ExportJsonOptions {
  filename?: string;
  profileName?: string;
  plateType?: PlateType;
  samplePlateText?: string;
  format?: ExportJsonFormat;
  indent?: number;
}

/**
 * Maps a PlateType to human-readable Korean label
 */
export function getPlateTypeLabel(type?: PlateType): string {
  switch (type) {
    case 'white_8':
      return '신형 8자리 반사필름 (KOR)';
    case 'white_7':
      return '일반 7자리 자가용 (백색)';
    case 'ev_blue':
      return '친환경 전기차 (청색)';
    case 'yellow_commercial':
      return '영업용 택시/화물/버스 (황색)';
    case 'green_retro':
      return '구형 자가용 (녹색)';
    default:
      return '표준 번호판';
  }
}

/**
 * Builds the export payload according to the chosen format
 */
export function buildExportObject(
  params: AugmentationParams,
  options?: ExportJsonOptions
): Record<string, unknown> {
  const format = options?.format || 'full_pipeline';
  const indent = options?.indent ?? 2;

  if (format === 'raw_params') {
    return {
      blur: params.blur,
      brightness: params.brightness,
      contrast: params.contrast,
      noise: params.noise,
      rotate: params.rotate,
      perspectiveX: params.perspectiveX,
      perspectiveY: params.perspectiveY,
      rain: params.rain,
      fog: params.fog,
      dirt: params.dirt,
      glare: params.glare,
    };
  }

  if (format === 'albumentations_serialized') {
    return {
      __version__: '1.4.15',
      transform: {
        __class_fullname__: 'Compose',
        p: 1.0,
        transforms: [
          ...(params.blur > 0 ? [{
            __class_fullname__: 'GaussianBlur',
            blur_limit: [Math.max(3, Math.round(params.blur) * 2 - 1), Math.max(3, Math.round(params.blur) * 2 + 1)],
            sigma_limit: [0.2, 2.0],
            p: 0.85,
          }] : []),
          ...((params.brightness !== 100 || params.contrast !== 100) ? [{
            __class_fullname__: 'RandomBrightnessContrast',
            brightness_limit: Number(((params.brightness - 100) / 100).toFixed(2)),
            contrast_limit: Number(((params.contrast - 100) / 100).toFixed(2)),
            p: 0.9,
          }] : []),
          ...(params.noise > 0 ? [{
            __class_fullname__: 'GaussNoise',
            var_limit: [10.0, Number((params.noise * 3.5).toFixed(1))],
            p: 0.75,
          }] : []),
          ...(params.rotate !== 0 ? [{
            __class_fullname__: 'Rotate',
            limit: [-Math.abs(params.rotate), Math.abs(params.rotate)],
            border_mode: 0,
            p: 0.8,
          }] : []),
          ...(params.perspectiveX !== 0 || params.perspectiveY !== 0 ? [{
            __class_fullname__: 'Perspective',
            scale: [0.05, Number((Math.max(Math.abs(params.perspectiveX), Math.abs(params.perspectiveY)) / 100).toFixed(2))],
            p: 0.8,
          }] : []),
          ...(params.rain > 0 ? [{
            __class_fullname__: 'RandomRain',
            drop_length: 20,
            drop_width: 1,
            blur_value: 3,
            p: Number((params.rain / 100).toFixed(2)),
          }] : []),
          ...(params.fog > 0 ? [{
            __class_fullname__: 'RandomFog',
            fog_coef_lower: 0.1,
            fog_coef_upper: Number((params.fog / 100).toFixed(2)),
            alpha_coef: 0.08,
            p: 0.8,
          }] : []),
        ],
        bbox_params: {
          format: 'albumentations',
          label_fields: ['category_id'],
          min_area: 100,
          min_visibility: 0.25,
        },
      },
    };
  }

  if (format === 'yolo_pipeline') {
    return {
      task: 'alpr_plate_detection_and_ocr',
      hsv_h: Number((Math.abs(params.contrast - 100) / 1000).toFixed(3)),
      hsv_s: 0.7,
      hsv_v: Number(((params.brightness / 100) * 0.4).toFixed(3)),
      degrees: params.rotate,
      translate: 0.1,
      scale: 0.5,
      shear: 0.0,
      perspective: Number((Math.max(Math.abs(params.perspectiveX), Math.abs(params.perspectiveY)) / 1000).toFixed(4)),
      flipud: 0.0,
      fliplr: 0.0,
      mosaic: 1.0,
      mixup: 0.15,
      copy_paste: 0.1,
      blur_p: Number((params.blur / 15).toFixed(2)),
      noise_std: Number((params.noise * 0.25).toFixed(2)),
      weather_drops: params.rain > 0 ? params.rain : 0,
      occlusion_ratio: Number((params.dirt / 100).toFixed(2)),
    };
  }

  // Default: 'full_pipeline'
  const payload: AugmentationExportPayload = {
    schema_version: '2.4.0',
    exported_at: new Date().toISOString(),
    source: 'ALPR Dataset Solutions Hub - Augmentation Simulator',
    pipeline_id: `aug_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    profile_name: options?.profileName || 'Custom Augmentation Configuration',
    target_domain: 'ALPR License Plate OCR & Object Detection Pipeline',
    plate_spec: {
      type: options?.plateType,
      type_label: getPlateTypeLabel(options?.plateType),
      sample_text: options?.samplePlateText,
    },
    augmentation_params: {
      blur: params.blur,
      brightness: params.brightness,
      contrast: params.contrast,
      noise: params.noise,
      rotate: params.rotate,
      perspectiveX: params.perspectiveX,
      perspectiveY: params.perspectiveY,
      rain: params.rain,
      fog: params.fog,
      dirt: params.dirt,
      glare: params.glare,
    },
    albumentations_config: {
      blur_limit: Math.max(3, Math.round(params.blur) * 2 + 1),
      brightness_limit: Number(((params.brightness - 100) / 100).toFixed(2)),
      contrast_limit: Number(((params.contrast - 100) / 100).toFixed(2)),
      noise_variance: params.noise * 2.5,
      rotation_limit: params.rotate,
      perspective_distortion: Number((Math.max(Math.abs(params.perspectiveX), Math.abs(params.perspectiveY)) / 100).toFixed(2)),
      rain_drop_rate: Number((params.rain / 100).toFixed(2)),
      fog_alpha_coef: Number((params.fog / 100).toFixed(2)),
    },
    pytorch_v2_spec: {
      gaussian_blur: {
        kernel_size: Math.max(3, Math.round(params.blur) * 2 + 1),
        sigma: [0.5, 2.0],
      },
      color_jitter: {
        brightness: Number((params.brightness / 100).toFixed(2)),
        contrast: Number((params.contrast / 100).toFixed(2)),
      },
      random_rotation: {
        degrees: [-Math.abs(params.rotate), Math.abs(params.rotate)],
      },
      random_perspective: {
        distortion_scale: Number((Math.max(Math.abs(params.perspectiveX), Math.abs(params.perspectiveY)) / 100).toFixed(2)),
        p: 0.7,
      },
    },
    pipeline_integration_guide: {
      python_import: 'import json; config = json.load(open("augmentation_config.json"))["augmentation_params"]',
      cli_arg: 'python train.py --aug-config augmentation_config.json --dataset ./data/alpr',
    },
  };

  return payload as unknown as Record<string, unknown>;
}

/**
 * Returns formatted JSON string for display and copying
 */
export function generatePipelineJson(
  params: AugmentationParams,
  options?: ExportJsonOptions
): string {
  const exportObj = buildExportObject(params, options);
  const indent = options?.indent ?? 2;
  return JSON.stringify(exportObj, null, indent);
}

/**
 * Exports AugmentationParams as a formatted JSON file and triggers a browser file download.
 */
export function downloadAugmentationJson(
  params: AugmentationParams,
  options?: ExportJsonOptions
): string {
  const jsonString = generatePipelineJson(params, options);

  try {
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .slice(0, 19);

    const formatTag = options?.format && options.format !== 'full_pipeline' ? `_${options.format}` : '';
    const safeProfileName = (options?.profileName || 'alpr_augmentation_params')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_');

    link.href = url;
    link.download = options?.filename || `${safeProfileName}${formatTag}_${timestamp}.json`;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up memory
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  } catch (err) {
    console.error('Failed to trigger file download', err);
  }

  return jsonString;
}
