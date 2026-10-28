import React, { useState, useEffect } from 'react';
import { 
  AugmentationParams, 
  PlateType, 
  PresetType,
  AugmentationProfile,
  HistoryConfigItem 
} from '../../types/alpr';
import { 
  Sparkles, 
  RotateCcw, 
  Wind, 
  Moon, 
  Tv, 
  Rotate3d, 
  CloudRain, 
  ShieldAlert, 
  SunMedium, 
  Shuffle,
  Power,
  Download,
  Check,
  Dices,
  History,
  FileJson,
  Bookmark,
  BookmarkPlus,
  Trash2,
  Copy,
  Plus,
  FolderHeart,
  FolderArchive
} from 'lucide-react';
import { downloadAugmentationJson } from '../../utils/exportConfig';
import { 
  getStoredCustomProfiles, 
  deleteCustomProfileFromStorage, 
  subscribeToCustomProfiles 
} from '../../data/presetProfiles';
import { RecentHistoryPanel } from './RecentHistoryPanel';
import { SavePresetModal } from './SavePresetModal';

interface SimulatorControlsProps {
  plateText: string;
  setPlateText: (text: string) => void;
  plateType: PlateType;
  setPlateType: (type: PlateType) => void;
  params: AugmentationParams;
  setParams: React.Dispatch<React.SetStateAction<AugmentationParams>>;
  showBBox: boolean;
  setShowBBox: (val: boolean) => void;
  activePreset: PresetType | 'custom';
  applyPreset: (preset: PresetType) => void;
  onRandomizePlate: () => void;
  onRandomizeParams: () => void;
  history: HistoryConfigItem[];
  onRestoreHistory: (item: HistoryConfigItem) => void;
  onClearHistory: () => void;
  onToggleHistoryDrawer?: () => void;
  onOpenExportModal?: () => void;
  onApplyCustomProfile?: (profile: AugmentationProfile) => void;
  activeProfileId?: string | null;
  onOpenBulkProcessor?: () => void;
}

export const SimulatorControls: React.FC<SimulatorControlsProps> = ({
  plateText,
  setPlateText,
  plateType,
  setPlateType,
  params,
  setParams,
  showBBox,
  setShowBBox,
  activePreset,
  applyPreset,
  onRandomizePlate,
  onRandomizeParams,
  history,
  onRestoreHistory,
  onClearHistory,
  onToggleHistoryDrawer,
  onOpenExportModal,
  onApplyCustomProfile,
  activeProfileId,
  onOpenBulkProcessor,
}) => {
  const presets = [
    { id: 'original' as PresetType, label: '원본 (Clean)', icon: Sparkles, color: 'text-sky-500' },
    { id: 'motion_blur' as PresetType, label: '모션 블러', icon: Wind, color: 'text-blue-500' },
    { id: 'low_light' as PresetType, label: '심야 저조도', icon: Moon, color: 'text-indigo-500' },
    { id: 'sensor_noise' as PresetType, label: 'CCTV 노이즈', icon: Tv, color: 'text-amber-500' },
    { id: 'perspective_tilt' as PresetType, label: '사각 각도', icon: Rotate3d, color: 'text-emerald-500' },
    { id: 'severe_weather' as PresetType, label: '악천후 기상', icon: CloudRain, color: 'text-cyan-500' },
    { id: 'dirt_occlusion' as PresetType, label: '오염/가림', icon: ShieldAlert, color: 'text-stone-500' },
    { id: 'glare_flare' as PresetType, label: '역광 플레어', icon: SunMedium, color: 'text-orange-500' },
  ];

  const plateTypes: { id: PlateType; label: string }[] = [
    { id: 'white_8', label: '8자리 필름 (KOR)' },
    { id: 'white_7', label: '7자리 일반 (백색)' },
    { id: 'ev_blue', label: '친환경 EV (청색)' },
    { id: 'yellow_commercial', label: '영업용 (황색)' },
    { id: 'green_retro', label: '구형 (녹색)' },
  ];

  const [downloaded, setDownloaded] = useState(false);
  const [presetViewTab, setPresetViewTab] = useState<'builtin' | 'my_presets'>('builtin');
  const [customProfiles, setCustomProfiles] = useState<AugmentationProfile[]>(() => getStoredCustomProfiles());
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [copiedProfileId, setCopiedProfileId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Subscribe to storage updates across components
  useEffect(() => {
    const unsubscribe = subscribeToCustomProfiles((profiles) => {
      setCustomProfiles(profiles);
    });
    return unsubscribe;
  }, []);

  const handleApplyProfile = (profile: AugmentationProfile) => {
    if (onApplyCustomProfile) {
      onApplyCustomProfile(profile);
    } else {
      setParams(profile.params);
      if (profile.plateType) {
        setPlateType(profile.plateType);
      }
    }
  };

  const handleDeleteProfile = (profileId: string) => {
    deleteCustomProfileFromStorage(profileId);
    setDeleteConfirmId(null);
  };

  const handleCopyProfile = (profile: AugmentationProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    const configData = {
      name: profile.name,
      category: profile.category,
      description: profile.description,
      params: profile.params,
      exportedAt: new Date().toISOString(),
    };
    navigator.clipboard.writeText(JSON.stringify(configData, null, 2));
    setCopiedProfileId(profile.id);
    setTimeout(() => setCopiedProfileId(null), 2000);
  };

  const handleDownloadJson = () => {
    downloadAugmentationJson(params, {
      plateType,
      samplePlateText: plateText,
      profileName: activePreset !== 'custom' ? `alpr_preset_${activePreset}` : 'custom_alpr_config',
    });
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  const updateParam = (key: keyof AugmentationParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const handleResetAll = () => {
    applyPreset('original');
  };

  // Helper to count active effects
  const activeCount = [
    params.blur > 0,
    params.brightness !== 100 || params.contrast !== 100,
    params.noise > 0,
    params.rotate !== 0 || params.perspectiveX !== 0,
    params.rain > 0 || params.fog > 0,
    params.dirt > 0,
    params.glare > 0,
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-6">
      {/* 1. Plate Customization Bar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <span>1. 차량 번호판 양식 및 테스트 문자</span>
          </label>
          <button
            onClick={onRandomizePlate}
            className="flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700 font-medium px-2 py-1 rounded hover:bg-sky-50 transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>무작위 번호</span>
          </button>
        </div>

        {/* Plate type tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded-xl mb-3">
          {plateTypes.map((pt) => (
            <button
              key={pt.id}
              onClick={() => setPlateType(pt.id)}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all truncate text-center ${
                plateType === pt.id
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/70 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {pt.label}
            </button>
          ))}
        </div>

        {/* Text Input & Options */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={plateText}
              onChange={(e) => setPlateText(e.target.value)}
              placeholder="예: 123가 4567"
              maxLength={14}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono tracking-wider"
            />
          </div>

          <label className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 text-xs font-medium text-slate-700 select-none">
            <input
              type="checkbox"
              checked={showBBox}
              onChange={(e) => setShowBBox(e.target.checked)}
              className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
            />
            <span>AI 인식 HUD 박스</span>
          </label>
        </div>
      </div>

      {/* 2. Quick Preset Buttons & My Presets */}
      <div className="border-t border-slate-100 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              2. 환경 프리셋 (Presets)
            </span>
            <span className="text-[11px] font-mono font-medium text-slate-500">
              · 활성 효과: <strong className="text-sky-600">{activeCount}개</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <button
              type="button"
              onClick={() => setIsSaveModalOpen(true)}
              className="flex items-center gap-1.5 text-xs text-sky-900 bg-sky-50 hover:bg-sky-100 border border-sky-300 font-bold px-2.5 py-1 rounded-lg transition-all active:scale-95 shadow-2xs group"
              title="현재 파라미터 설정을 '내 프리셋' 로컬 저장소에 저장"
            >
              <BookmarkPlus className="w-3.5 h-3.5 text-sky-600 group-hover:scale-110 transition-transform" />
              <span>내 프리셋 저장</span>
            </button>

            <button
              type="button"
              onClick={onRandomizeParams}
              className="flex items-center gap-1 text-xs text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 font-bold px-2.5 py-1 rounded-lg transition-all active:scale-95 shadow-2xs group"
              title="다양한 악조건 엣지케이스(폭우, 야간 모션블러, CCTV 각도, 오염 등) 무작위 파라미터 생성"
            >
              <Dices className="w-3.5 h-3.5 text-amber-600 group-hover:rotate-45 transition-transform" />
              <span>랜덤 증강</span>
            </button>

            {onOpenBulkProcessor && (
              <button
                type="button"
                onClick={onOpenBulkProcessor}
                className="flex items-center gap-1.5 text-xs text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 font-bold px-2.5 py-1 rounded-lg transition-all active:scale-95 shadow-2xs group"
                title="이미지 폴더를 업로드하여 현재 파라미터로 일괄 증강 및 새 데이터셋 생성"
              >
                <FolderArchive className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span>폴더 일괄 증강</span>
              </button>
            )}

            {onOpenExportModal ? (
              <div className="flex items-center rounded-lg border border-sky-200/90 overflow-hidden shadow-2xs bg-sky-50">
                <button
                  type="button"
                  onClick={onOpenExportModal}
                  className="flex items-center gap-1.5 text-xs text-sky-800 hover:text-sky-950 font-bold px-2.5 py-1 transition-all active:scale-95 hover:bg-sky-100"
                  title="외부 데이터 파이프라인 연동용 JSON 내보내기 및 포맷 설정 모달 열기"
                >
                  <FileJson className="w-3.5 h-3.5 text-sky-600" />
                  <span>JSON 내보내기</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="px-1.5 py-1 text-sky-700 hover:text-sky-900 border-l border-sky-200 hover:bg-sky-100 transition-colors"
                  title="기본 설정으로 즉시 파일 다운로드"
                >
                  {downloaded ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Download className="w-3.5 h-3.5 text-sky-600" />
                  )}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleDownloadJson}
                className="flex items-center gap-1 text-xs text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/90 font-bold px-2.5 py-1 rounded-lg transition-all active:scale-95 shadow-2xs"
                title="현재 증강 파라미터를 JSON 파일로 다운로드"
              >
                {downloaded ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">다운로드됨!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-sky-600" />
                    <span>JSON 다운로드</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handleResetAll}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 font-medium px-2 py-1 rounded hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>초기화</span>
            </button>
          </div>
        </div>

        {/* Tab switch between Built-in Presets vs My Presets */}
        <div className="flex items-center gap-1.5 mb-3 bg-slate-100/90 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setPresetViewTab('builtin')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
              presetViewTab === 'builtin'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            <span>기본 환경 프리셋 ({presets.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setPresetViewTab('my_presets')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
              presetViewTab === 'my_presets'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-purple-600" />
            <span>내 프리셋 (My Presets)</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
              presetViewTab === 'my_presets' ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-700'
            }`}>
              {customProfiles.length}
            </span>
          </button>
        </div>

        {/* Built-in Presets Grid */}
        {presetViewTab === 'builtin' ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {presets.map((preset) => {
              const Icon = preset.icon;
              const isActive = activePreset === preset.id && !activeProfileId;
              return (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isActive ? 'bg-slate-800 text-sky-400' : 'bg-slate-100 ' + preset.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate">{preset.label}</span>
                </button>
              );
            })}
          </div>
        ) : (
          /* My Presets (Local Storage) Grid */
          <div className="space-y-2.5">
            {customProfiles.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-2">
                  <Bookmark className="w-5 h-5" />
                </div>
                <h5 className="text-xs font-bold text-slate-800">
                  저장된 내 프리셋이 없습니다
                </h5>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1 mb-3">
                  자주 사용하는 증강 파라미터 조합을 로컬 저장소에 저장하여 언제든 1초 만에 불러오세요.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg shadow-2xs transition-all active:scale-95"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>현재 파라미터를 내 프리셋으로 저장</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {customProfiles.map((profile) => {
                  const isActive = activeProfileId === profile.id;
                  const isConfirmingDelete = deleteConfirmId === profile.id;

                  return (
                    <div
                      key={profile.id}
                      onClick={() => handleApplyProfile(profile)}
                      className={`group p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between relative ${
                        isActive
                          ? 'bg-sky-50/80 border-sky-500 shadow-sm ring-1 ring-sky-500'
                          : 'bg-white hover:bg-slate-50/80 border-slate-200 hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      <div>
                        {/* Top info and actions */}
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 mb-2">
                          <span className="text-[10px] font-mono font-bold text-slate-500 px-1.5 py-0.5 bg-slate-100 rounded">
                            {profile.categoryLabel || profile.category || '사용자 정의'}
                          </span>

                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={(e) => handleCopyProfile(profile, e)}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors"
                              title="JSON 설정 복사"
                            >
                              {copiedProfileId === profile.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {isConfirmingDelete ? (
                              <div className="flex items-center gap-1 text-[10px]">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProfile(profile.id)}
                                  className="px-1.5 py-0.5 bg-rose-600 text-white font-bold rounded hover:bg-rose-700"
                                >
                                  삭제
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
                                >
                                  취소
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(profile.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                                title="프리셋 삭제"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Profile Name & Date */}
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <h5 className="text-xs font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1">
                            {profile.name}
                          </h5>
                          {profile.createdAt && (
                            <span className="text-[9px] font-mono text-slate-500 shrink-0">
                              {profile.createdAt}
                            </span>
                          )}
                        </div>

                        {profile.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-1 mb-2">
                            {profile.description}
                          </p>
                        )}
                      </div>

                      {/* Parameter summary pills */}
                      <div className="pt-2 border-t border-slate-100/80">
                        <div className="flex flex-wrap gap-1 text-[9.5px] font-mono mb-2">
                          {profile.params.blur > 0 && (
                            <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                              블러 {profile.params.blur}px
                            </span>
                          )}
                          {profile.params.rain > 0 && (
                            <span className="px-1.5 py-0.2 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded">
                              강우 {profile.params.rain}%
                            </span>
                          )}
                          {profile.params.noise > 0 && (
                            <span className="px-1.5 py-0.2 bg-amber-50 text-amber-700 border border-amber-200 rounded">
                              노이즈 {profile.params.noise}%
                            </span>
                          )}
                          {profile.params.brightness !== 100 && (
                            <span className="px-1.5 py-0.2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded">
                              밝기 {profile.params.brightness}%
                            </span>
                          )}
                          {profile.params.glare > 0 && (
                            <span className="px-1.5 py-0.2 bg-orange-50 text-orange-700 border border-orange-200 rounded">
                              역광 {profile.params.glare}%
                            </span>
                          )}
                          {profile.params.dirt > 0 && (
                            <span className="px-1.5 py-0.2 bg-stone-100 text-stone-700 border border-stone-200 rounded">
                              오염 {profile.params.dirt}%
                            </span>
                          )}
                          {(profile.params.rotate !== 0 || profile.params.perspectiveX !== 0) && (
                            <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                              각도/원근
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-1">
                          <span className={`font-semibold flex items-center gap-1 ${
                            isActive ? 'text-sky-600 font-bold' : 'text-slate-500 group-hover:text-slate-900'
                          }`}>
                            {isActive ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-sky-600" />
                                <span>현재 적용 중</span>
                              </>
                            ) : (
                              <span>클릭하여 로드 (Apply) →</span>
                            )}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApplyProfile(profile);
                            }}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-colors ${
                              isActive
                                ? 'bg-sky-600 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {isActive ? '적용됨' : '불러오기'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2.5 Recent Parameters History Tracking */}
      <div className="border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-sky-600" />
              <span>최근 파라미터 히스토리</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              최근 {history.length} / 5개
            </span>
          </div>

          {onToggleHistoryDrawer && (
            <button
              onClick={onToggleHistoryDrawer}
              className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1"
            >
              <span>사이드패널로 보기</span>
            </button>
          )}
        </div>

        <RecentHistoryPanel
          history={history}
          currentParams={params}
          onRestore={onRestoreHistory}
          onClearHistory={onClearHistory}
        />
      </div>

      {/* 3. Range Sliders for Each Transformation Effect */}
      <div className="border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>3. 효과별 개별 강도 조절 슬라이더 (Dynamic Range Sliders)</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              각 효과의 슬라이더를 실시간으로 조절하여 세부 강도(블러 반경, 노이즈 밀도 등)를 직접 미세조정하세요.
            </p>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="space-y-3.5">
          {/* Effect 1: Motion Blur Slider */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 transition-colors hover:border-slate-300">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Wind className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900">모션 블러 반경 (Motion Blur Radius)</span>
                  <span className="text-[10px] text-slate-500 ml-1.5 hidden sm:inline">
                    {params.blur === 0 ? '정차 상태' : params.blur <= 4 ? '도심 저속 주행' : params.blur <= 9 ? '고속도로 주행' : '초고속 주행 왜곡'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-800">
                  {params.blur} px
                </span>
                <button
                  onClick={() => updateParam('blur', params.blur > 0 ? 0 : 7)}
                  className={`p-1 rounded text-xs transition-colors ${params.blur > 0 ? 'text-blue-600 hover:bg-blue-100' : 'text-slate-400 hover:bg-slate-200'}`}
                  title={params.blur > 0 ? '효과 끄기' : '기본 블러 적용'}
                >
                  <Power className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="16"
              step="1"
              value={params.blur}
              onChange={(e) => updateParam('blur', Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />

            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
              <span>0px (클린)</span>
              <div className="flex gap-1.5">
                <button onClick={() => updateParam('blur', 0)} className="hover:text-slate-700">[0px]</button>
                <button onClick={() => updateParam('blur', 4)} className="hover:text-slate-700">[4px]</button>
                <button onClick={() => updateParam('blur', 8)} className="hover:text-slate-700">[8px]</button>
                <button onClick={() => updateParam('blur', 14)} className="hover:text-slate-700">[14px]</button>
              </div>
              <span>16px (초고속)</span>
            </div>
          </div>

          {/* Effect 2: Sensor Noise & Grain Slider */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 transition-colors hover:border-slate-300">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Tv className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900">센서 노이즈 & 그레인 (Noise Density)</span>
                  <span className="text-[10px] text-slate-500 ml-1.5 hidden sm:inline">
                    {params.noise === 0 ? 'ISO 100 표준' : params.noise <= 30 ? 'ISO 800 약노이즈' : params.noise <= 70 ? 'ISO 3200 고감도' : 'ISO 12800+ 극단'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-800">
                  {params.noise}%
                </span>
                <button
                  onClick={() => updateParam('noise', params.noise > 0 ? 0 : 65)}
                  className={`p-1 rounded text-xs transition-colors ${params.noise > 0 ? 'text-amber-600 hover:bg-amber-100' : 'text-slate-400 hover:bg-slate-200'}`}
                  title={params.noise > 0 ? '효과 끄기' : '기본 노이즈 적용'}
                >
                  <Power className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="2"
              value={params.noise}
              onChange={(e) => updateParam('noise', Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />

            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
              <span>0% (Clean)</span>
              <div className="flex gap-1.5">
                <button onClick={() => updateParam('noise', 0)} className="hover:text-slate-700">[0%]</button>
                <button onClick={() => updateParam('noise', 25)} className="hover:text-slate-700">[25%]</button>
                <button onClick={() => updateParam('noise', 60)} className="hover:text-slate-700">[60%]</button>
                <button onClick={() => updateParam('noise', 90)} className="hover:text-slate-700">[90%]</button>
              </div>
              <span>100% (저가 CCTV)</span>
            </div>
          </div>

          {/* Effect 3: Low Light & Illumination Slider */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 transition-colors hover:border-slate-300">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Moon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900">조도 / 밝기 (Brightness Exposure)</span>
                  <span className="text-[10px] text-slate-500 ml-1.5 hidden sm:inline">
                    {params.brightness < 50 ? '심야 암흑 (0.5 lux)' : params.brightness < 90 ? '지하주차장/터널' : params.brightness <= 110 ? '주간 표준' : '과노출 (Overexposure)'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-800">
                  {params.brightness}%
                </span>
                <button
                  onClick={() => {
                    updateParam('brightness', params.brightness === 100 ? 35 : 100);
                    updateParam('contrast', params.brightness === 100 ? 135 : 100);
                  }}
                  className={`p-1 rounded text-xs transition-colors ${params.brightness !== 100 ? 'text-indigo-600 hover:bg-indigo-100' : 'text-slate-400 hover:bg-slate-200'}`}
                  title={params.brightness !== 100 ? '표준 밝기로 복원' : '심야 저조도 적용'}
                >
                  <Power className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <input
              type="range"
              min="20"
              max="150"
              step="2"
              value={params.brightness}
              onChange={(e) => updateParam('brightness', Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />

            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
              <span>20% (심야 0.2lux)</span>
              <div className="flex gap-1.5">
                <button onClick={() => updateParam('brightness', 30)} className="hover:text-slate-700">[30% 심야]</button>
                <button onClick={() => updateParam('brightness', 60)} className="hover:text-slate-700">[60% 어둠]</button>
                <button onClick={() => updateParam('brightness', 100)} className="hover:text-slate-700">[100% 표준]</button>
                <button onClick={() => updateParam('brightness', 140)} className="hover:text-slate-700">[140% 과노출]</button>
              </div>
              <span>150% (강한 빛)</span>
            </div>

            {/* Sub-slider for Contrast */}
            <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between gap-3 text-[11px] text-slate-600">
              <span className="font-medium text-slate-700 flex-shrink-0">대비 (Contrast):</span>
              <input
                type="range"
                min="50"
                max="180"
                step="5"
                value={params.contrast}
                onChange={(e) => updateParam('contrast', Number(e.target.value))}
                className="w-full accent-indigo-400 cursor-pointer"
              />
              <span className="font-mono font-bold text-slate-800 w-10 text-right">{params.contrast}%</span>
            </div>
          </div>

          {/* Effect 4: Perspective & Tilt Angle Slider */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 transition-colors hover:border-slate-300">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Rotate3d className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900">카메라 설치 각도 & 왜곡 (Perspective Angle)</span>
                  <span className="text-[10px] text-slate-500 ml-1.5 hidden sm:inline">
                    {params.rotate === 0 ? '정면 수직 (0°)' : params.rotate < 0 ? '좌측 사각 촬영' : '우측 사각 촬영'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-800">
                  {params.rotate}°
                </span>
                <button
                  onClick={() => {
                    updateParam('rotate', params.rotate !== 0 ? 0 : -15);
                    updateParam('perspectiveX', params.rotate !== 0 ? 0 : 20);
                    updateParam('perspectiveY', params.rotate !== 0 ? 0 : 15);
                  }}
                  className={`p-1 rounded text-xs transition-colors ${params.rotate !== 0 ? 'text-emerald-600 hover:bg-emerald-100' : 'text-slate-400 hover:bg-slate-200'}`}
                  title={params.rotate !== 0 ? '정면 각도로 복원' : '사각 각도 적용'}
                >
                  <Power className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <input
              type="range"
              min="-30"
              max="30"
              step="1"
              value={params.rotate}
              onChange={(e) => {
                const val = Number(e.target.value);
                updateParam('rotate', val);
                updateParam('perspectiveX', Math.round(val * 0.8));
                updateParam('perspectiveY', Math.round(val * 0.5));
              }}
              className="w-full accent-emerald-600 cursor-pointer"
            />

            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
              <span>-30° (좌측 갓길)</span>
              <div className="flex gap-1.5">
                <button onClick={() => { updateParam('rotate', -20); updateParam('perspectiveX', -16); updateParam('perspectiveY', -10); }} className="hover:text-slate-700">[-20°]</button>
                <button onClick={() => { updateParam('rotate', 0); updateParam('perspectiveX', 0); updateParam('perspectiveY', 0); }} className="hover:text-slate-700">[0° 정면]</button>
                <button onClick={() => { updateParam('rotate', 20); updateParam('perspectiveX', 16); updateParam('perspectiveY', 10); }} className="hover:text-slate-700">[+20°]</button>
              </div>
              <span>+30° (우측 측면)</span>
            </div>
          </div>

          {/* Effect 5: Severe Weather (Rain & Fog) Slider */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 transition-colors hover:border-slate-300">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-cyan-100 text-cyan-600 flex items-center justify-center">
                  <CloudRain className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900">악천후 강우 강도 (Precipitation & Rain)</span>
                  <span className="text-[10px] text-slate-500 ml-1.5 hidden sm:inline">
                    {params.rain === 0 ? '맑음' : params.rain <= 30 ? '가랑비' : params.rain <= 70 ? '보통 비' : '호우/폭우'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-800">
                  {params.rain}%
                </span>
                <button
                  onClick={() => {
                    const nextVal = params.rain > 0 ? 0 : 80;
                    updateParam('rain', nextVal);
                    updateParam('fog', Math.round(nextVal * 0.7));
                  }}
                  className={`p-1 rounded text-xs transition-colors ${params.rain > 0 ? 'text-cyan-600 hover:bg-cyan-100' : 'text-slate-400 hover:bg-slate-200'}`}
                  title={params.rain > 0 ? '날씨 효과 끄기' : '비/안개 적용'}
                >
                  <Power className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={params.rain}
              onChange={(e) => {
                const val = Number(e.target.value);
                updateParam('rain', val);
                updateParam('fog', Math.round(val * 0.7));
              }}
              className="w-full accent-cyan-600 cursor-pointer"
            />

            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
              <span>0% (맑음)</span>
              <div className="flex gap-1.5">
                <button onClick={() => { updateParam('rain', 0); updateParam('fog', 0); }} className="hover:text-slate-700">[0% 맑음]</button>
                <button onClick={() => { updateParam('rain', 40); updateParam('fog', 25); }} className="hover:text-slate-700">[40% 비]</button>
                <button onClick={() => { updateParam('rain', 85); updateParam('fog', 60); }} className="hover:text-slate-700">[85% 폭우]</button>
              </div>
              <span>100% (호우경보)</span>
            </div>
          </div>

          {/* Effect 6: Dirt & Mud Occlusion Slider */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 transition-colors hover:border-slate-300">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-stone-200 text-stone-700 flex items-center justify-center">
                  <ShieldAlert className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900">표면 진흙/먼지 오염도 (Dirt & Occlusion Coverage)</span>
                  <span className="text-[10px] text-slate-500 ml-1.5 hidden sm:inline">
                    {params.dirt === 0 ? '깨끗한 번호판' : params.dirt <= 40 ? '약한 먼지 튐' : '문자 획 가림 및 폐색'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-800">
                  {params.dirt}%
                </span>
                <button
                  onClick={() => updateParam('dirt', params.dirt > 0 ? 0 : 85)}
                  className={`p-1 rounded text-xs transition-colors ${params.dirt > 0 ? 'text-stone-700 hover:bg-stone-200' : 'text-slate-400 hover:bg-slate-200'}`}
                  title={params.dirt > 0 ? '오염 제거' : '진흙 오염 적용'}
                >
                  <Power className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={params.dirt}
              onChange={(e) => updateParam('dirt', Number(e.target.value))}
              className="w-full accent-stone-700 cursor-pointer"
            />

            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
              <span>0% (청결)</span>
              <div className="flex gap-1.5">
                <button onClick={() => updateParam('dirt', 0)} className="hover:text-slate-700">[0% 청결]</button>
                <button onClick={() => updateParam('dirt', 35)} className="hover:text-slate-700">[35% 먼지]</button>
                <button onClick={() => updateParam('dirt', 85)} className="hover:text-slate-700">[85% 진흙 가림]</button>
              </div>
              <span>100% (심각한 오염)</span>
            </div>
          </div>

          {/* Effect 7: Glare & Lens Flare Slider */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 transition-colors hover:border-slate-300">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center">
                  <SunMedium className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900">역광 및 전조등 플레어 (Glare & Bloom Intensity)</span>
                  <span className="text-[10px] text-slate-500 ml-1.5 hidden sm:inline">
                    {params.glare === 0 ? '반사 없음' : params.glare <= 45 ? '은은한 반사광' : '상향등 직사 텍스처 소실'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-800">
                  {params.glare}%
                </span>
                <button
                  onClick={() => updateParam('glare', params.glare > 0 ? 0 : 90)}
                  className={`p-1 rounded text-xs transition-colors ${params.glare > 0 ? 'text-orange-600 hover:bg-orange-100' : 'text-slate-400 hover:bg-slate-200'}`}
                  title={params.glare > 0 ? '플레어 끄기' : '역광 플레어 적용'}
                >
                  <Power className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={params.glare}
              onChange={(e) => updateParam('glare', Number(e.target.value))}
              className="w-full accent-orange-500 cursor-pointer"
            />

            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
              <span>0% (없음)</span>
              <div className="flex gap-1.5">
                <button onClick={() => updateParam('glare', 0)} className="hover:text-slate-700">[0%]</button>
                <button onClick={() => updateParam('glare', 40)} className="hover:text-slate-700">[40% 반사]</button>
                <button onClick={() => updateParam('glare', 90)} className="hover:text-slate-700">[90% 상향등]</button>
              </div>
              <span>100% (완전 포화)</span>
            </div>
          </div>
        </div>

        {/* 4. Export JSON File Banner */}
        <div className="mt-5 p-4 bg-gradient-to-r from-sky-50 to-indigo-50/60 border border-sky-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <Download className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-900 block">
                현재 증강 파라미터(AugmentationParams) JSON 파일 다운로드
              </span>
              <span className="text-[11px] text-slate-500 block truncate">
                조정한 8개 증강 수치를 .json 파일로 저장하여 Python 파이프라인에서 즉시 불러오기
              </span>
            </div>
          </div>

          <button
            onClick={handleDownloadJson}
            className="flex-shrink-0 flex items-center justify-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
          >
            {downloaded ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>다운로드 완료!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>JSON 파일 다운로드</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Save to My Presets Modal */}
      <SavePresetModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        currentParams={params}
        currentPlateType={plateType}
        onSaveSuccess={(savedProfile) => {
          setPresetViewTab('my_presets');
          handleApplyProfile(savedProfile);
        }}
      />
    </div>
  );
};
