import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  AugmentationParams, 
  PlateType, 
  PresetType,
  AugmentationProfile,
  HistoryConfigItem 
} from '../../types/alpr';
import { simulateOcrInference } from '../../utils/alprSimulator';
import { PlateRenderer, ComparisonViewMode } from './PlateRenderer';
import { SimulatorControls } from './SimulatorControls';
import { InferenceAnalysis } from './InferenceAnalysis';
import { CodeViewer } from './CodeViewer';
import { Sliders, Code2, Cpu, History, Dices, FileJson, Bookmark, BookmarkPlus, FolderHeart, Columns, FolderArchive, X } from 'lucide-react';
import { PresetLibrary } from './PresetLibrary';
import { RecentHistoryPanel } from './RecentHistoryPanel';
import { JsonExportModal } from './JsonExportModal';
import { SavePresetModal } from './SavePresetModal';
import { BulkImageProcessor } from './BulkImageProcessor';
import { 
  generateRandomEdgeCase, 
  summarizeParams, 
  areParamsEqual 
} from '../../utils/randomizeAugmentation';

interface SimulatorViewProps {
  sharedParams?: AugmentationParams;
  setSharedParams?: React.Dispatch<React.SetStateAction<AugmentationParams>>;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({ sharedParams, setSharedParams }) => {
  const [plateText, setPlateText] = useState('123가 4567');
  const [plateType, setPlateType] = useState<PlateType>('white_8');
  const [showBBox, setShowBBox] = useState(true);
  const [activePreset, setActivePreset] = useState<PresetType>('original');
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ComparisonViewMode>('side-by-side');
  const [activeBottomTab, setActiveBottomTab] = useState<'metrics' | 'code' | 'presets' | 'bulk'>('metrics');
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSavePresetModalOpen, setIsSavePresetModalOpen] = useState(false);
  const [isBulkProcessorModalOpen, setIsBulkProcessorModalOpen] = useState(false);

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

  const [internalParams, setInternalParams] = useState<AugmentationParams>(defaultParams);
  const params = sharedParams ?? internalParams;
  const setParams = setSharedParams ?? setInternalParams;

  // Track the last 5 sets of parameters applied
  const [history, setHistory] = useState<HistoryConfigItem[]>(() => [
    {
      id: 'init_clean',
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      label: '기본 원본 (Clean Baseline)',
      params: { ...defaultParams },
      source: 'initial',
      summaryTags: ['원본 (Clean)'],
    },
  ]);

  const pushHistoryItem = (newItem: Omit<HistoryConfigItem, 'id' | 'timestamp'>) => {
    const formattedTime = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const entry: HistoryConfigItem = {
      ...newItem,
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: formattedTime,
    };
    setHistory((prev) => {
      if (prev.length > 0 && areParamsEqual(prev[0].params, entry.params)) {
        return prev;
      }
      return [entry, ...prev.filter((p) => !areParamsEqual(p.params, entry.params))].slice(0, 5);
    });
  };

  const handleSetParams: React.Dispatch<React.SetStateAction<AugmentationParams>> = (action) => {
    setActivePreset('custom');
    setActiveProfileId(null);
    setParams(action);
  };

  // Debounced auto-snapshot of manual slider adjustments
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activePreset === 'custom' && !activeProfileId) {
        setHistory((prev) => {
          if (prev.length > 0 && areParamsEqual(prev[0].params, params)) {
            return prev;
          }
          const tags = summarizeParams(params);
          const formattedTime = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const entry: HistoryConfigItem = {
            id: `hist_${Date.now()}_manual`,
            timestamp: formattedTime,
            label: `사용자 조정 (${tags.slice(0, 2).join(', ')})`,
            params: { ...params },
            source: 'manual',
            summaryTags: tags,
          };
          return [entry, ...prev.filter((p) => !areParamsEqual(p.params, entry.params))].slice(0, 5);
        });
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [params, activePreset, activeProfileId]);

  const handleApplyProfile = (profile: AugmentationProfile) => {
    setActiveProfileId(profile.id);
    setActivePreset('custom');
    setParams(profile.params);
    if (profile.plateType) {
      setPlateType(profile.plateType);
    }
    pushHistoryItem({
      label: `라이브러리: ${profile.name}`,
      params: profile.params,
      source: 'profile',
      summaryTags: summarizeParams(profile.params),
    });
  };

  // Apply quick preset and record history
  const applyPreset = (preset: PresetType) => {
    setActivePreset(preset);
    setActiveProfileId(null);
    let newParams = defaultParams;
    let label = '원본 (Clean)';

    switch (preset) {
      case 'original':
        newParams = defaultParams;
        label = '프리셋: 원본 (Clean)';
        break;
      case 'motion_blur':
        newParams = {
          ...defaultParams,
          blur: 7,
          contrast: 105,
          noise: 15,
        };
        label = '프리셋: 모션 블러';
        break;
      case 'low_light':
        newParams = {
          ...defaultParams,
          brightness: 35,
          contrast: 135,
          noise: 55,
          blur: 1,
        };
        label = '프리셋: 심야 저조도';
        break;
      case 'sensor_noise':
        newParams = {
          ...defaultParams,
          noise: 85,
          brightness: 90,
          contrast: 110,
        };
        label = '프리셋: CCTV 노이즈';
        break;
      case 'perspective_tilt':
        newParams = {
          ...defaultParams,
          rotate: -15,
          perspectiveX: 25,
          perspectiveY: 15,
        };
        label = '프리셋: 사각 각도';
        break;
      case 'severe_weather':
        newParams = {
          ...defaultParams,
          rain: 80,
          fog: 65,
          brightness: 75,
          contrast: 85,
        };
        label = '프리셋: 악천후 기상';
        break;
      case 'dirt_occlusion':
        newParams = {
          ...defaultParams,
          dirt: 85,
          contrast: 110,
        };
        label = '프리셋: 오염/가림';
        break;
      case 'glare_flare':
        newParams = {
          ...defaultParams,
          glare: 90,
          brightness: 135,
          contrast: 125,
        };
        label = '프리셋: 역광 플레어';
        break;
    }

    setParams(newParams);
    pushHistoryItem({
      label,
      params: newParams,
      source: 'preset',
      summaryTags: summarizeParams(newParams),
    });
  };

  // Generate a randomized edge-case configuration for stress testing
  const handleRandomizeParams = () => {
    const scenario = generateRandomEdgeCase();
    setActivePreset('custom');
    setActiveProfileId(null);
    setParams(scenario.params);
    pushHistoryItem({
      label: `랜덤: ${scenario.label}`,
      params: scenario.params,
      source: 'random',
      summaryTags: summarizeParams(scenario.params),
    });
  };

  // Restore previous configuration from history
  const handleRestoreHistory = (item: HistoryConfigItem) => {
    setActivePreset('custom');
    setActiveProfileId(null);
    setParams(item.params);
  };

  const handleClearHistory = () => {
    setHistory([]);
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

        {/* Preset Library (Save, Load, Export/Import Profiles) */}
        <PresetLibrary
          currentParams={params}
          currentPlateType={plateType}
          onApplyProfile={handleApplyProfile}
          activeProfileId={activeProfileId}
        />

        {/* 2-Column Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Visual Canvas Stage with Side-by-Side Comparison */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <PlateRenderer
              plateText={plateText}
              plateType={plateType}
              params={params}
              showBBox={showBBox}
              detected={inferenceResult.detected}
              overallConfidence={inferenceResult.overallConfidence}
              sharpnessScore={inferenceResult.sharpnessScore}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onSelectPlate={(selectedText, selectedType) => {
                setPlateText(selectedText);
                setPlateType(selectedType);
              }}
            />

            {/* Quick Helper Note */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed shadow-sm">
              <strong className="text-slate-800 font-semibold block mb-1">
                💡 실시간 Before/After 비교 & 다각도 뷰 스위처:
              </strong>
              <strong>[Before/After 나란히]</strong> 토글을 켜면 원본 번호판(Before)과 현재 증강된 번호판(After)이 나란히 배치되어 슬라이더 조절 시 실시간 광학 변화량(블러, 밝기, 노이즈, 기하왜곡 등)과 OCR 확신도 변동을 즉각 비교 분석할 수 있습니다.
              또한 <strong>[스플릿 슬라이더]</strong>나 <strong>[썸네일 미리보기]</strong>(8종 규격 동시 검증)로도 전환할 수 있습니다.
            </div>

            {/* Quick Action & History Bar */}
            <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 text-xs shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-sky-100 text-sky-700 flex items-center justify-center">
                  <History className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-slate-800">최근 파라미터 히스토리</span>
                  <span className="text-[11px] font-mono text-slate-500 ml-1.5 hidden sm:inline">
                    최근 {history.length} / 5개 기록 중
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsBulkProcessorModalOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-all active:scale-95 shadow-2xs"
                  title="이미지 폴더 업로드 및 현재 파라미터 일괄 증강 / 새 데이터셋 ZIP 생성"
                >
                  <FolderArchive className="w-3.5 h-3.5 text-emerald-600" />
                  <span>폴더 일괄 증강</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode(prev => prev === 'side-by-side' ? 'single' : 'side-by-side')}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg border transition-all active:scale-95 shadow-2xs ${
                    viewMode === 'side-by-side'
                      ? 'bg-sky-600 border-sky-600 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                  title="원본(Before)과 실시간 증강본(After) 나란히 비교 모드 토글"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Before/After 비교 {viewMode === 'side-by-side' ? 'ON' : 'OFF'}</span>
                </button>

                <button
                  onClick={() => setIsSavePresetModalOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-all active:scale-95 shadow-2xs"
                  title="현재 파라미터를 '내 프리셋' 로컬 저장소에 저장"
                >
                  <BookmarkPlus className="w-3.5 h-3.5 text-purple-600" />
                  <span>내 프리셋 저장</span>
                </button>

                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-all active:scale-95 shadow-2xs"
                  title="현재 파라미터를 JSON 파일로 내보내기 (외부 데이터 파이프라인 연동)"
                >
                  <FileJson className="w-3.5 h-3.5 text-sky-600" />
                  <span>JSON 내보내기</span>
                </button>

                <button
                  onClick={handleRandomizeParams}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-all active:scale-95 shadow-2xs"
                  title="랜덤 엣지케이스 증강 생성"
                >
                  <Dices className="w-3.5 h-3.5 text-amber-600" />
                  <span>랜덤 증강</span>
                </button>

                <button
                  onClick={() => setIsHistoryDrawerOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all active:scale-95 shadow-2xs"
                  title="최근 5개 파라미터 기록 사이드패널 열기"
                >
                  <History className="w-3.5 h-3.5 text-slate-600" />
                  <span>히스토리</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Controls Panel */}
          <div className="lg:col-span-6">
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
              onRandomizeParams={handleRandomizeParams}
              history={history}
              onRestoreHistory={handleRestoreHistory}
              onClearHistory={handleClearHistory}
              onToggleHistoryDrawer={() => setIsHistoryDrawerOpen(prev => !prev)}
              onOpenExportModal={() => setIsExportModalOpen(true)}
              onApplyCustomProfile={handleApplyProfile}
              activeProfileId={activeProfileId}
              onOpenBulkProcessor={() => setIsBulkProcessorModalOpen(true)}
            />
          </div>
        </div>

        {/* Bottom Section: Tabs for Inference Analysis vs Code Viewer vs Preset Library */}
        <div className="mt-8">
          <div className="flex flex-wrap items-center gap-2 mb-4 border-b border-slate-200 pb-2">
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
              <span>파이썬 증강 코드 & JSON 파이프라인 생성기</span>
            </button>

            <button
              onClick={() => setActiveBottomTab('presets')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeBottomTab === 'presets'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
              }`}
            >
              <FolderHeart className="w-3.5 h-3.5" />
              <span>환경 프리셋 & 내 프로필 라이브러리 (Presets & Profiles)</span>
            </button>

            <button
              onClick={() => setActiveBottomTab('bulk')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeBottomTab === 'bulk'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
              }`}
            >
              <FolderArchive className="w-3.5 h-3.5 text-emerald-400" />
              <span>폴더 대량 증강 & 데이터셋 생성기 (Batch Augmentor)</span>
            </button>
          </div>

          {activeBottomTab === 'metrics' ? (
            <InferenceAnalysis result={inferenceResult} expectedText={plateText} />
          ) : activeBottomTab === 'code' ? (
            <CodeViewer 
              albumentationsCode={inferenceResult.albumentationsCode} 
              params={params} 
              onOpenExportModal={() => setIsExportModalOpen(true)}
            />
          ) : activeBottomTab === 'presets' ? (
            <PresetLibrary
              currentParams={params}
              currentPlateType={plateType}
              onApplyProfile={handleApplyProfile}
              activeProfileId={activeProfileId}
            />
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <BulkImageProcessor currentParams={params} />
            </div>
          )}
        </div>
      </div>

      {/* Slide-over Side Panel for Recent History */}
      <RecentHistoryPanel
        history={history}
        currentParams={params}
        onRestore={handleRestoreHistory}
        onClearHistory={handleClearHistory}
        isDrawer={true}
        isOpenSidePanel={isHistoryDrawerOpen}
        onCloseSidePanel={() => setIsHistoryDrawerOpen(false)}
      />

      {/* Dedicated Pipeline JSON Export Modal */}
      <JsonExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        params={params}
        plateType={plateType}
        plateText={plateText}
        activePreset={activePreset}
      />

      {/* Save to My Presets Modal */}
      <SavePresetModal
        isOpen={isSavePresetModalOpen}
        onClose={() => setIsSavePresetModalOpen(false)}
        currentParams={params}
        currentPlateType={plateType}
        onSaveSuccess={(savedProfile) => {
          handleApplyProfile(savedProfile);
        }}
      />

      {/* Bulk Image Processor Modal */}
      {isBulkProcessorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                  <FolderArchive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    대량 폴더 증강 및 새 데이터셋 생성 (Bulk Dataset Augmentor)
                  </h3>
                  <p className="text-xs text-slate-500">
                    업로드한 폴더 이미지에 현재 시뮬레이터 파라미터를 일괄 적용하여 검증 및 ZIP 데이터셋 패키지로 내보냅니다.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBulkProcessorModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
                title="닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto flex-1">
              <BulkImageProcessor
                currentParams={params}
                onClose={() => setIsBulkProcessorModalOpen(false)}
                isModal={true}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
