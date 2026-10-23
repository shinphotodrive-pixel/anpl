import { AugmentationParams, PlateType } from '../types/alpr';

export interface AugmentationExportPayload {
  version: string;
  exportedAt: string;
  source: string;
  profileName?: string;
  plateType?: PlateType;
  samplePlateText?: string;
  params: AugmentationParams;
  albumentationsConfig: {
    blurLimit: number;
    brightnessLimit: number;
    contrastLimit: number;
    noiseVariance: number;
    rotationLimit: number;
    perspectiveDistortion: number;
  };
}

/**
 * Exports AugmentationParams as a formatted JSON object and triggers a browser file download.
 */
export function downloadAugmentationJson(
  params: AugmentationParams,
  options?: {
    filename?: string;
    profileName?: string;
    plateType?: PlateType;
    samplePlateText?: string;
  }
): string {
  const payload: AugmentationExportPayload = {
    version: '2.4.0',
    exportedAt: new Date().toISOString(),
    source: 'ALPR Dataset Solutions Hub - Augmentation Simulator',
    profileName: options?.profileName || 'Custom Augmentation Configuration',
    plateType: options?.plateType,
    samplePlateText: options?.samplePlateText,
    params: {
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
    albumentationsConfig: {
      blurLimit: Math.max(3, Math.round(params.blur) * 2 + 1),
      brightnessLimit: Number(((params.brightness - 100) / 100).toFixed(2)),
      contrastLimit: Number(((params.contrast - 100) / 100).toFixed(2)),
      noiseVariance: params.noise * 2.5,
      rotationLimit: params.rotate,
      perspectiveDistortion: Number((Math.max(Math.abs(params.perspectiveX), Math.abs(params.perspectiveY)) / 100).toFixed(2)),
    },
  };

  const jsonString = JSON.stringify(payload, null, 2);

  try {
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .slice(0, 19);

    const safeProfileName = (options?.profileName || 'alpr_augmentation_params')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_');

    link.href = url;
    link.download = options?.filename || `${safeProfileName}_${timestamp}.json`;
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
