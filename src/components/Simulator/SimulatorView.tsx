import React, { useState, useMemo } from 'react';
import { 
  AugmentationParams, 
  PlateType, 
  PresetType 
} from '../../types/alpr';
import { simulateOcrInference } from '../../utils/alprSimulator';
import { PlateRenderer } from './PlateRenderer';
import { SimulatorControls } from './SimulatorControls';
import { InferenceAnalysis } from './InferenceAnalysis';
import { CodeViewer } from './CodeViewer';
import { Sliders, Code2, Cpu } from 'lucide-react';

export const SimulatorView: React.FC = () => {
  const [plateText, setPlateText] = useState('123가 4567');
  const [plateType, setPlateType] = useState<PlateType>('white_8');
  const [showBBox, setShowBBox] = useState(true);
  const [activePreset, setActivePreset] = useState<PresetType>('original');
  const [activeBottomTab, setActiveBottomTab] = useState<'metrics' | 'code'>('metrics');

  const defaultParams: AugmentationParams = {
    blur: 0,
    brightness: 100,
    contrast: 100,
    noise: 0,
    rotate: 0,
    perspectiveX: 0,
    perspectiveY: 0,
    rain: 0,
    fog: 0,
    dirt: 0,
    glare: 0,
  };

  const [params, setParams] = useState<AugmentationParams>(defaultParams);

  const handleSetParams: React.Dispatch<React.SetStateAction<AugmentationParams>> = (action) => {
    setActivePreset('custom');
    setParams(action);
  };

  // Apply quick preset
  const applyPreset = (preset: PresetType) => {
    setActivePreset(preset);
    switch (preset) {
      case 'original':
        setParams(defaultParams);
        break;
      case 'motion_blur':
        setParams({
          ...defaultParams,
          blur: 7,
          contrast: 105,
          noise: 15,
        });
        break;
      case 'low_light':
        setParams({
          ...defaultParams,
          brightness: 35,
          contrast: 135,
          noise: 55,
          blur: 1,
        });
        break;
      case 'sensor_noise':
        setParams({
          ...defaultParams,
          noise: 85,
          brightness: 90,
          contrast: 110,
        });
        break;
      case 'perspective_tilt':
        setParams({
          ...defaultParams,
          rotate: -15,
          perspectiveX: 25,
          perspectiveY: 15,
        });
        break;
      case 'severe_weather':
        setParams({
          ...defaultParams,
          rain: 80,
          fog: 65,
          brightness: 75,
          contrast: 85,
        });
        break;
      case 'dirt_occlusion':
        setParams({
          ...defaultParams,
          dirt: 85,
          contrast: 110,
        });
        break;
      case 'glare_flare':
        setParams({
          ...defaultParams,
          glare: 90,
          brightness: 135,
          contrast: 125,
        });
        break;
    }
  };

  // Random plate generator
  const handleRandomizePlate = () => {
    const koreanChars = ['가', '나', '다', '라', '마', '거', '너', '더', '러', '머', '버', '서', '어', '저', '고', '노', '도', '로', '모', '보', '소', '오', '조', '구', '누', '두', '하', '허', '호'];
    const randomChar = koreanChars[Math.floor(Math.random() * koreanChars.length)];
    const frontNum = Math.floor(Math.random() * 900) + 100; // 100 ~ 999
    const backNum = String(Math.floor(Math.random() * 9000) + 1000); // 1000 ~ 9999

    if (plateType === 'yellow_commercial') {
      const regions = ['서울', '경기', '인천', '부산', '대구'];
      const reg = regions[Math.floor(Math.random() * regions.length)];
      const commChar = ['바', '사', '아', '자', '배'][Math.floor(Math.random() * 5)];
      setPlateText(`${reg} 31 ${commChar} ${backNum}`);
    } else if (plateType === 'green_retro') {
      const regions = ['서울', '경기', '대전', '부산'];
      const reg = regions[Math.floor(Math.random() * regions.length)];
      setPlateText(`${reg} 1 ${randomChar} ${backNum}`);
    } else if (plateType === 'white_7') {
      const shortFront = Math.floor(Math.random() * 90) + 10;
      setPlateText(`${shortFront}${randomChar} ${backNum}`);
    } else {
      setPlateText(`${frontNum}${randomChar} ${backNum}`);
    }
  };

  // Run simulated inference whenever plate or params change
  const inferenceResult = useMemo(() => {
    return simulateOcrInference(plateText, plateType, params);
  }, [plateText, plateType, params]);

  return (
    <section id="simulator" className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 mb-2">
            <Sliders className="w-4 h-4 text-sky-500" />
            <span>Interactive Data Augmentation Simulator</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            데이터 증강(Augmentation) 시뮬레이터
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
            제한된 원본 이미지를 수학적·광학적 변환을 거쳐 수십 배의 가상 환경으로 증폭합니다. 
            슬라이더를 조절하여 실제 AI 모델의 인식률 변동과 문자 오독 현상을 실시간으로 관찰하세요.
          </p>
        </div>

        {/* 2-Column Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Visual Canvas Stage */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <PlateRenderer
              plateText={plateText}
              plateType={plateType}
              params={params}
              showBBox={showBBox}
              detected={inferenceResult.detected}
              overallConfidence={inferenceResult.overallConfidence}
            />

            {/* Quick Helper Note */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed shadow-sm">
              <strong className="text-slate-800 font-semibold block mb-1">
                💡 실세계 현장 데이터의 가치:
              </strong>
              일반 도로 주행 중에는 맑은 주간 데이터가 90% 이상을 차지합니다. 
              증강 파이프라인(Augmentation Pipeline)을 적용하지 않으면 모델이 특정 날씨와 각도에 과적합(Overfitting)되어 실제 단속 현장에서 오인식 사고를 유발합니다.
            </div>
          </div>

          {/* Right Column: Controls Panel */}
          <div className="lg:col-span-7">
            <SimulatorControls
              plateText={plateText}
              setPlateText={setPlateText}
              plateType={plateType}
              setPlateType={setPlateType}
              params={params}
              setParams={handleSetParams}
              showBBox={showBBox}
              setShowBBox={setShowBBox}
              activePreset={activePreset}
              applyPreset={applyPreset}
              onRandomizePlate={handleRandomizePlate}
            />
          </div>
        </div>

        {/* Bottom Section: Tabs for Inference Analysis vs Code Viewer */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveBottomTab('metrics')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeBottomTab === 'metrics'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>실시간 모델 추론 진단 (Live Diagnostics)</span>
            </button>

            <button
              onClick={() => setActiveBottomTab('code')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeBottomTab === 'code'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>파이썬 증강 코드 생성기 (Albumentations / PyTorch)</span>
            </button>
          </div>

          {activeBottomTab === 'metrics' ? (
            <InferenceAnalysis result={inferenceResult} expectedText={plateText} />
          ) : (
            <CodeViewer 
              albumentationsCode={inferenceResult.albumentationsCode} 
              params={params} 
            />
          )}
        </div>
      </div>
    </section>
  );
};
