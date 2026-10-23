import { AugmentationParams } from '../types/alpr';

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
  };
}

/**
 * Creates a canvas image data URL for a Korean license plate
 */
export function generateSyntheticPlateImage(
  plateText: string,
  plateType: 'white' | 'ev' | 'yellow' | 'green' = 'white'
): string {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 110;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  if (plateType === 'ev') {
    const grad = ctx.createLinearGradient(0, 0, 400, 0);
    grad.addColorStop(0, '#bae6fd');
    grad.addColorStop(0.5, '#e0f2fe');
    grad.addColorStop(1, '#bae6fd');
    ctx.fillStyle = grad;
  } else if (plateType === 'yellow') {
    ctx.fillStyle = '#fde047';
  } else if (plateType === 'green') {
    ctx.fillStyle = '#065f46';
  } else {
    ctx.fillStyle = '#ffffff';
  }
  ctx.fillRect(0, 0, 400, 110);

  // Border
  ctx.lineWidth = 6;
  ctx.strokeStyle = plateType === 'green' ? '#022c22' : plateType === 'ev' ? '#0284c7' : '#1e293b';
  ctx.strokeRect(3, 3, 394, 104);

  // Mounting bolts
  ctx.fillStyle = plateType === 'green' ? '#047857' : '#334155';
  ctx.beginPath();
  ctx.arc(28, 18, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(372, 18, 5, 0, Math.PI * 2);
  ctx.fill();

  // Hologram band for white 8-digit
  let textOffset = 0;
  if (plateType === 'white') {
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(6, 6, 42, 98);
    // National circle
    ctx.fillStyle = '#f87171';
    ctx.beginPath();
    ctx.arc(27, 24, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('KOR', 27, 44);
    ctx.fillStyle = '#93c5fd';
    ctx.font = '7px sans-serif';
    ctx.fillText('대한민국', 27, 60);
    textOffset = 22;
  } else if (plateType === 'ev') {
    ctx.fillStyle = 'rgba(2, 132, 199, 0.35)';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('⚡ EV', 28, 58);
    textOffset = 15;
  }

  // Text
  ctx.fillStyle = plateType === 'green' ? '#ffffff' : plateType === 'ev' ? '#0c4a6e' : '#0f172a';
  ctx.font = '900 46px "Noto Sans KR", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(plateText, 200 + textOffset, 55);

  return canvas.toDataURL('image/jpeg', 0.95);
}

/**
 * Applies AugmentationParams to an image using HTML5 Canvas
 */
export async function applyAugmentationToCanvas(
  imageUrl: string,
  params: AugmentationParams
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 400;
        canvas.height = img.height || 110;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imageUrl);
          return;
        }

        // 1. Build CSS Filter string
        const blurStr = params.blur > 0 ? `blur(${params.blur * 0.8}px)` : '';
        const brightnessStr = `brightness(${params.brightness / 100})`;
        const contrastStr = `contrast(${params.contrast / 100})`;
        const filterStr = [blurStr, brightnessStr, contrastStr].filter(Boolean).join(' ');
        ctx.filter = filterStr;

        // 2. Draw base image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.filter = 'none'; // reset filter for subsequent overlay passes

        // 3. Motion blur directional ghosting lines if blur > 2
        if (params.blur > 2) {
          ctx.save();
          ctx.globalAlpha = Math.min(0.35, params.blur * 0.03);
          ctx.drawImage(img, params.blur * 1.5, 0, canvas.width, canvas.height);
          ctx.drawImage(img, -params.blur * 1.5, 0, canvas.width, canvas.height);
          ctx.restore();
        }

        // 4. Noise Injection
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

        // 5. Rain Streaks Overlay
        if (params.rain > 0) {
          ctx.save();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.lineWidth = 1.2;
          const dropCount = Math.floor((params.rain / 100) * 120);
          for (let i = 0; i < dropCount; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const length = 10 + Math.random() * 18;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + length * 0.35, y + length);
            ctx.stroke();
          }
          ctx.restore();
        }

        // 6. Fog / Haze Overlay
        if (params.fog > 0) {
          ctx.save();
          ctx.fillStyle = `rgba(226, 232, 240, ${(params.fog / 100) * 0.55})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.restore();
        }

        // 7. Dirt / Mud Splatters
        if (params.dirt > 0) {
          ctx.save();
          ctx.fillStyle = 'rgba(67, 30, 8, 0.85)';
          const splatterCount = Math.floor((params.dirt / 100) * 7) + 2;
          for (let i = 0; i < splatterCount; i++) {
            const x = (canvas.width * 0.15) + Math.random() * (canvas.width * 0.7);
            const y = (canvas.height * 0.2) + Math.random() * (canvas.height * 0.6);
            const radiusX = (10 + Math.random() * 25) * (params.dirt / 80);
            const radiusY = (6 + Math.random() * 15) * (params.dirt / 80);
            ctx.beginPath();
            ctx.ellipse(x, y, radiusX, radiusY, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        // 8. Solar Glare / Lens Flare
        if (params.glare > 0) {
          ctx.save();
          const glareRadius = (canvas.width * 0.4) * (params.glare / 80);
          const grad = ctx.createRadialGradient(
            canvas.width * 0.85, canvas.height * 0.2, 5,
            canvas.width * 0.85, canvas.height * 0.2, glareRadius
          );
          grad.addColorStop(0, `rgba(255, 255, 255, ${Math.min(1, params.glare / 80)})`);
          grad.addColorStop(0.3, `rgba(254, 240, 138, ${Math.min(0.8, params.glare / 100)})`);
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
