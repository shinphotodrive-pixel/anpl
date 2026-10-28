import React, { useState } from 'react';
import { AugmentationParams } from '../../types/alpr';
import { Copy, Check, Terminal, Code2, FileJson, Download, ExternalLink } from 'lucide-react';
import { generatePipelineJson, downloadAugmentationJson } from '../../utils/exportConfig';

interface CodeViewerProps {
  albumentationsCode: string;
  params: AugmentationParams;
  onOpenExportModal?: () => void;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ 
  albumentationsCode, 
  params,
  onOpenExportModal 
}) => {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [frameworkTab, setFrameworkTab] = useState<'albumentations' | 'pytorch' | 'opencv' | 'json'>('albumentations');

  const handleCopy = () => {
    navigator.clipboard.writeText(getCodeContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPytorchCode = () => {
    return `# PyTorch Torchvision v2 ALPR 증강 파이프라인
import torch
from torchvision.transforms import v2

transforms = v2.Compose([
    v2.ToImage(),
    ${params.blur > 0 ? `v2.GaussianBlur(kernel_size=${Math.max(3, Math.round(params.blur) * 2 + 1)}, sigma=(0.5, 2.0)),` : '# 블러 비활성화'}
    ${params.brightness !== 100 || params.contrast !== 100 ? `v2.ColorJitter(brightness=${(params.brightness / 100).toFixed(2)}, contrast=${(params.contrast / 100).toFixed(2)}),` : '# 색상 조정 비활성화'}
    ${params.rotate !== 0 ? `v2.RandomRotation(degrees=(-${Math.abs(params.rotate)}, ${Math.abs(params.rotate)})),` : '# 회전 비활성화'}
    ${params.perspectiveX !== 0 ? `v2.RandomPerspective(distortion_scale=0.2, p=0.7),` : '# 원근 변환 비활성화'}
    v2.ToDtype(torch.float32, scale=True),
    v2.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])`;
  };

  const getOpencvCode = () => {
    return `# OpenCV Python 직접 전처리 및 왜곡 파이프라인
import cv2
import numpy as np

def apply_alpr_transforms(image):
    # 1. 밝기 및 대비 조정
    alpha = ${ (params.contrast / 100).toFixed(2) } # 대비 계수
    beta = ${ Math.round((params.brightness - 100) * 0.8) }  # 밝기 바이어스
    adjusted = cv2.convertScaleAbs(image, alpha=alpha, beta=beta)
    
    ${params.blur > 0 ? `# 2. 모션 블러 커널 (수평 주행 시뮬레이션)
    size = ${Math.max(3, Math.round(params.blur) * 2 + 1)}
    kernel_motion = np.zeros((size, size))
    kernel_motion[int((size - 1) / 2), :] = np.ones(size) / size
    adjusted = cv2.filter2D(adjusted, -1, kernel_motion)` : '# 블러 생략'}
    
    ${params.noise > 0 ? `# 3. 가우시안 노이즈 주입
    gauss = np.random.normal(0, ${ (params.noise * 0.35).toFixed(1) }, adjusted.shape).astype('uint8')
    adjusted = cv2.add(adjusted, gauss)` : '# 노이즈 생략'}
    
    return adjusted`;
  };

  const getJsonCode = () => {
    return generatePipelineJson(params, {
      format: 'full_pipeline',
      indent: 2,
    });
  };

  const getCodeContent = () => {
    switch (frameworkTab) {
      case 'pytorch':
        return getPytorchCode();
      case 'opencv':
        return getOpencvCode();
      case 'json':
        return getJsonCode();
      case 'albumentations':
      default:
        return albumentationsCode;
    }
  };

  const handleDownloadDirectJson = () => {
    downloadAugmentationJson(params, {
      profileName: 'alpr_augmentation_pipeline',
    });
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
      {/* Code Bar Header */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-mono font-bold text-slate-200">
            현재 슬라이더 매칭 파이프라인 코드 자동 생성
          </span>
        </div>

        {/* Framework Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setFrameworkTab('albumentations')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              frameworkTab === 'albumentations'
                ? 'bg-sky-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Albumentations
          </button>
          <button
            onClick={() => setFrameworkTab('pytorch')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              frameworkTab === 'pytorch'
                ? 'bg-sky-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            PyTorch v2
          </button>
          <button
            onClick={() => setFrameworkTab('opencv')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              frameworkTab === 'opencv'
                ? 'bg-sky-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            OpenCV
          </button>
          <button
            onClick={() => setFrameworkTab('json')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
              frameworkTab === 'json'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileJson className="w-3 h-3" />
            <span>파이프라인 JSON</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          {frameworkTab === 'json' && (
            <button
              onClick={handleDownloadDirectJson}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-2xs"
              title="JSON 파일 즉시 다운로드"
            >
              {downloaded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>다운로드됨!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-white" />
                  <span>JSON 다운로드</span>
                </>
              )}
            </button>
          )}

          {onOpenExportModal && (
            <button
              onClick={onOpenExportModal}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 transition-colors"
              title="포맷 선택 및 세부 설정 내보내기 모달 열기"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>포맷 옵션</span>
            </button>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all border border-slate-700"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">복사 완료!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>코드 복사</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Text Body */}
      <div className="p-4 overflow-x-auto max-h-72">
        <pre className="text-xs font-mono text-sky-200 leading-relaxed">
          <code>{getCodeContent()}</code>
        </pre>
      </div>

      {/* Footer tip */}
      <div className="bg-slate-950/70 px-4 py-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Code2 className="w-3.5 h-3.5 text-sky-400" />
          <span>파이썬 훈련 루프(PyTorch Dataset.__getitem__)에 바로 붙여넣어 사용 가능합니다.</span>
        </span>
        <span className="font-mono text-slate-500">Python 3.10+ / Albumentations 1.4+</span>
      </div>
    </div>
  );
};
