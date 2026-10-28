import React, { useState, useEffect } from 'react';
import { AugmentationParams, AugmentationProfile, PlateType } from '../../types/alpr';
import { 
  BUILT_IN_PROFILES, 
  getStoredCustomProfiles, 
  saveCustomProfileToStorage, 
  deleteCustomProfileFromStorage,
  subscribeToCustomProfiles 
} from '../../data/presetProfiles';
import { 
  Bookmark, 
  Plus, 
  Check, 
  Copy, 
  Trash2, 
  Download, 
  Upload, 
  Sparkles, 
  CloudRain, 
  Moon, 
  Wind, 
  Rotate3d, 
  ShieldAlert, 
  X,
  Sliders,
  FolderHeart
} from 'lucide-react';

interface PresetLibraryProps {
  currentParams: AugmentationParams;
  currentPlateType: PlateType;
  onApplyProfile: (profile: AugmentationProfile) => void;
  activeProfileId: string | null;
}

export const PresetLibrary: React.FC<PresetLibraryProps> = ({
  currentParams,
  currentPlateType,
  onApplyProfile,
  activeProfileId,
}) => {
  const [customProfiles, setCustomProfiles] = useState<AugmentationProfile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // New Profile Form State
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileDesc, setNewProfileDesc] = useState('');
  const [newProfileCategory, setNewProfileCategory] = useState<'weather' | 'night' | 'motion' | 'camera' | 'condition' | 'custom'>('custom');

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedCurrentJson, setCopiedCurrentJson] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Load custom profiles from localStorage & subscribe to updates
  useEffect(() => {
    setCustomProfiles(getStoredCustomProfiles());
    const unsub = subscribeToCustomProfiles((profiles) => {
      setCustomProfiles(profiles);
    });
    return unsub;
  }, []);

  const allProfiles = [...customProfiles, ...BUILT_IN_PROFILES];

  const categories = [
    { id: 'all', label: '전체 (All)' },
    { id: 'custom', label: `내 프리셋 (${customProfiles.length})` },
    { id: 'weather', label: '악천후 (Heavy Rain/Fog)' },
    { id: 'night', label: '야간 저조도 (Low Light Night)' },
    { id: 'motion', label: '고속 주행 (Fast Motion)' },
    { id: 'camera', label: '원근/센서 (Camera/Sensor)' },
  ];

  const filteredProfiles = allProfiles.filter((p) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'custom') return !p.isBuiltIn;
    return p.category === selectedCategory;
  });

  const getProfileIcon = (category: string) => {
    switch (category) {
      case 'weather':
        return <CloudRain className="w-4 h-4 text-cyan-500" />;
      case 'night':
        return <Moon className="w-4 h-4 text-indigo-400" />;
      case 'motion':
        return <Wind className="w-4 h-4 text-blue-500" />;
      case 'camera':
        return <Rotate3d className="w-4 h-4 text-emerald-500" />;
      case 'condition':
        return <ShieldAlert className="w-4 h-4 text-amber-500" />;
      default:
        return <Bookmark className="w-4 h-4 text-purple-400" />;
    }
  };

  const handleSaveCurrentProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    const newProfile: AugmentationProfile = {
      id: `custom_${Date.now()}`,
      name: newProfileName.trim(),
      category: newProfileCategory,
      categoryLabel: newProfileCategory === 'weather' ? '악천후 기상' : 
                     newProfileCategory === 'night' ? '야간 저조도' : 
                     newProfileCategory === 'motion' ? '고속 주행' : 
                     newProfileCategory === 'camera' ? '카메라 각도' : '사용자 정의',
      description: newProfileDesc.trim() || '사용자가 저장한 커스텀 ALPR 증강 프로필',
      params: { ...currentParams },
      plateType: currentPlateType,
      isBuiltIn: false,
      createdAt: new Date().toLocaleDateString('ko-KR'),
    };

    const updated = saveCustomProfileToStorage(newProfile);
    setCustomProfiles(updated);
    setIsSaveModalOpen(false);
    setNewProfileName('');
    setNewProfileDesc('');
    onApplyProfile(newProfile);
  };

  const handleDeleteCustomProfile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteCustomProfileFromStorage(id);
    setCustomProfiles(updated);
    setDeleteConfirmId(null);
  };

  const handleCopyProfileJson = (profile: AugmentationProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    const configExport = {
      name: profile.name,
      description: profile.description,
      params: profile.params,
      exportedAt: new Date().toISOString(),
    };
    navigator.clipboard.writeText(JSON.stringify(configExport, null, 2));
    setCopiedId(profile.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyCurrentConfig = () => {
    const configExport = {
      name: 'Custom ALPR Configuration',
      params: currentParams,
      plateType: currentPlateType,
      exportedAt: new Date().toISOString(),
    };
    navigator.clipboard.writeText(JSON.stringify(configExport, null, 2));
    setCopiedCurrentJson(true);
    setTimeout(() => setCopiedCurrentJson(false), 2000);
  };

  const handleImportJson = () => {
    try {
      setJsonError(null);
      const parsed = JSON.parse(jsonInput);
      const targetParams = parsed.params || parsed;

      // Validate required keys
      if (typeof targetParams.blur !== 'number' || typeof targetParams.brightness !== 'number') {
        throw new Error('유효한 ALPR 파라미터(blur, brightness 등)가 포함된 JSON이어야 합니다.');
      }

      const importedProfile: AugmentationProfile = {
        id: `imported_${Date.now()}`,
        name: parsed.name || `가져온 프로필 (${new Date().toLocaleTimeString()})`,
        category: 'custom',
        categoryLabel: '외부 가져오기',
        description: parsed.description || 'JSON 파일에서 가져온 증강 파라미터',
        params: {
          blur: Number(targetParams.blur) || 0,
          brightness: Number(targetParams.brightness) || 100,
          contrast: Number(targetParams.contrast) || 100,
          noise: Number(targetParams.noise) || 0,
          rotate: Number(targetParams.rotate) || 0,
          perspectiveX: Number(targetParams.perspectiveX) || 0,
          perspectiveY: Number(targetParams.perspectiveY) || 0,
          rain: Number(targetParams.rain) || 0,
          fog: Number(targetParams.fog) || 0,
          dirt: Number(targetParams.dirt) || 0,
          glare: Number(targetParams.glare) || 0,
        },
        plateType: parsed.plateType || currentPlateType,
        isBuiltIn: false,
        createdAt: new Date().toLocaleDateString('ko-KR'),
      };

      const updated = saveCustomProfileToStorage(importedProfile);
      setCustomProfiles(updated);
      onApplyProfile(importedProfile);
      setIsJsonModalOpen(false);
      setJsonInput('');
    } catch (err: any) {
      setJsonError(err.message || 'JSON 파싱 오류가 발생했습니다.');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
              <FolderHeart className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              증강 프리셋 라이브러리 (Preset Profiles Library)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Heavy Rain(폭우), Low Light Night(심야 저조도), Fast Motion(고속 주행) 등 실세계 환경 프로필을 1초 만에 불러오거나 저장하세요.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsSaveModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>현재 설정 저장</span>
          </button>

          <button
            onClick={handleCopyCurrentConfig}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all"
            title="현재 슬라이더 파라미터를 JSON으로 복사"
          >
            {copiedCurrentJson ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">복사 완료!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>JSON 복사</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsJsonModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all"
            title="외부 JSON 프리셋 붙여넣기"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>JSON 불러오기</span>
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 mt-4 mb-5">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              selectedCategory === cat.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {filteredProfiles.map((profile) => {
          const isSelected = activeProfileId === profile.id;
          return (
            <div
              key={profile.id}
              onClick={() => onApplyProfile(profile)}
              className={`group p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between relative ${
                isSelected
                  ? 'bg-sky-50/70 border-sky-500 shadow-md ring-1 ring-sky-500'
                  : 'bg-slate-50/60 hover:bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div>
                {/* Header Row */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    {getProfileIcon(profile.category)}
                    <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase">
                      {profile.categoryLabel || profile.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {!profile.isBuiltIn && (
                      deleteConfirmId === profile.id ? (
                        <div className="flex items-center gap-1 text-[10px]" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteCustomProfile(profile.id, e)}
                            className="px-1.5 py-0.5 bg-rose-600 text-white font-bold rounded hover:bg-rose-700"
                          >
                            삭제
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(null);
                            }}
                            className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(profile.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded hover:bg-rose-50 transition-colors"
                          title="프리셋 삭제"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleCopyProfileJson(profile, e)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200/60 transition-colors"
                      title="JSON 복사"
                    >
                      {copiedId === profile.id ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Profile Title */}
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-sky-600 transition-colors mb-1">
                  {profile.name}
                </h4>

                {/* Description */}
                <p className="text-[11px] text-slate-500 leading-snug line-clamp-2 mb-3">
                  {profile.description}
                </p>
              </div>

              {/* Parameter Badges Row */}
              <div>
                <div className="flex flex-wrap gap-1 text-[9.5px] font-mono text-slate-600 border-t border-slate-200/60 pt-2 mb-2">
                  {profile.params.blur > 0 && (
                    <span className="px-1.5 py-0.5 bg-blue-100/70 text-blue-700 rounded font-bold">
                      블러 {profile.params.blur}px
                    </span>
                  )}
                  {profile.params.rain > 0 && (
                    <span className="px-1.5 py-0.5 bg-cyan-100/70 text-cyan-700 rounded font-bold">
                      강우 {profile.params.rain}%
                    </span>
                  )}
                  {profile.params.noise > 0 && (
                    <span className="px-1.5 py-0.5 bg-amber-100/70 text-amber-700 rounded font-bold">
                      노이즈 {profile.params.noise}%
                    </span>
                  )}
                  {profile.params.brightness !== 100 && (
                    <span className="px-1.5 py-0.5 bg-indigo-100/70 text-indigo-700 rounded font-bold">
                      조도 {profile.params.brightness}%
                    </span>
                  )}
                  {profile.params.dirt > 0 && (
                    <span className="px-1.5 py-0.5 bg-stone-200/70 text-stone-700 rounded font-bold">
                      오염 {profile.params.dirt}%
                    </span>
                  )}
                  {profile.params.glare > 0 && (
                    <span className="px-1.5 py-0.5 bg-orange-100/70 text-orange-700 rounded font-bold">
                      역광 {profile.params.glare}%
                    </span>
                  )}
                  {profile.params.rotate !== 0 && (
                    <span className="px-1.5 py-0.5 bg-emerald-100/70 text-emerald-700 rounded font-bold">
                      각도 {profile.params.rotate}°
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className={`font-semibold ${isSelected ? 'text-sky-600 font-bold' : 'text-slate-400 group-hover:text-slate-700'}`}>
                    {isSelected ? '✓ 현재 적용 중' : '클릭하여 불러오기 →'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Profile Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-sky-500" />
                <h4 className="text-sm font-bold text-slate-900">현재 증강 조합을 프리셋으로 저장</h4>
              </div>
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCurrentProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  프리셋 이름 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: Tunnel Exit High Glare, Winter Blizzard"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  카테고리 분류
                </label>
                <select
                  value={newProfileCategory}
                  onChange={(e) => setNewProfileCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="custom">사용자 정의 (Custom)</option>
                  <option value="weather">악천후 기상 (Heavy Rain/Fog/Snow)</option>
                  <option value="night">야간 저조도 (Low Light Night)</option>
                  <option value="motion">고속 주행 (Fast Motion Blur)</option>
                  <option value="camera">카메라 원근/각도 (Camera Perspective)</option>
                  <option value="condition">표면 오염 및 가림 (Dirt & Occlusion)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  설명 및 ITS 도로 환경 노트
                </label>
                <textarea
                  rows={2}
                  placeholder="예: 톨게이트 진입 50m 지점 강우 및 가로등 암부 시뮬레이션"
                  value={newProfileDesc}
                  onChange={(e) => setNewProfileDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Active Params Summary Preview */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                <span className="font-bold text-slate-700 block mb-1">저장될 활성 파라미터:</span>
                <div className="font-mono text-[10px] grid grid-cols-2 gap-1 text-slate-500">
                  <span>블러: {currentParams.blur}px</span>
                  <span>노이즈: {currentParams.noise}%</span>
                  <span>조도/대비: {currentParams.brightness}% / {currentParams.contrast}%</span>
                  <span>각도: {currentParams.rotate}°</span>
                  <span>강우/안개: {currentParams.rain}% / {currentParams.fog}%</span>
                  <span>오염/역광: {currentParams.dirt}% / {currentParams.glare}%</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JSON Import Modal */}
      {isJsonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-sky-500" />
                <h4 className="text-sm font-bold text-slate-900">JSON 파이프라인 설정 불러오기</h4>
              </div>
              <button
                onClick={() => setIsJsonModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              외부 파이썬 스크립트나 동료 개발자가 내보낸 JSON 설정을 붙여넣어 즉시 재현합니다.
            </p>

            <textarea
              rows={8}
              placeholder={`{\n  "name": "Heavy Snow & Low Contrast",\n  "params": {\n    "blur": 4,\n    "brightness": 70,\n    "contrast": 80,\n    "rain": 60,\n    "fog": 70\n  }\n}`}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full bg-slate-900 text-sky-200 font-mono p-3 rounded-xl border border-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed"
            />

            {jsonError && (
              <p className="text-xs text-rose-600 font-medium mt-2">
                ⚠️ {jsonError}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setIsJsonModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={handleImportJson}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                파라미터 로드
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
