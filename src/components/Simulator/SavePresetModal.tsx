import React, { useState, useEffect } from 'react';
import { AugmentationParams, AugmentationProfile, PlateType } from '../../types/alpr';
import { 
  Bookmark, 
  X, 
  Sparkles, 
  Check, 
  Sliders, 
  CloudRain, 
  Moon, 
  Wind, 
  Rotate3d, 
  ShieldAlert, 
  Tag
} from 'lucide-react';
import { saveCustomProfileToStorage, suggestProfileName } from '../../data/presetProfiles';

interface SavePresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentParams: AugmentationParams;
  currentPlateType: PlateType;
  onSaveSuccess?: (savedProfile: AugmentationProfile) => void;
}

export const SavePresetModal: React.FC<SavePresetModalProps> = ({
  isOpen,
  onClose,
  currentParams,
  currentPlateType,
  onSaveSuccess,
}) => {
  const [profileName, setProfileName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'weather' | 'night' | 'motion' | 'camera' | 'condition' | 'custom'>('custom');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setProfileName(suggestProfileName(currentParams));
      setDescription('');
      // Auto-detect sensible category
      if (currentParams.rain > 30 || currentParams.fog > 30) {
        setCategory('weather');
      } else if (currentParams.brightness < 60) {
        setCategory('night');
      } else if (currentParams.blur >= 6) {
        setCategory('motion');
      } else if (Math.abs(currentParams.perspectiveX) > 10 || Math.abs(currentParams.perspectiveY) > 10 || Math.abs(currentParams.rotate) > 10) {
        setCategory('camera');
      } else if (currentParams.dirt > 20) {
        setCategory('condition');
      } else {
        setCategory('custom');
      }
      setSavedSuccess(false);
    }
  }, [isOpen, currentParams]);

  if (!isOpen) return null;

  const quickNameChips = [
    '폭우 고속도로 (Heavy Rain Highway)',
    '심야 도심 초저조도 (Midnight Low-Light)',
    '톨게이트 45° 사각 (Tollgate Angle)',
    '오프로드 진흙 가림 (Mud Occlusion)',
    '터널 출구 역광 (Tunnel Glare)',
    '고속 140km/h 횡블러 (Motion Blur)',
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = profileName.trim();
    if (!trimmedName) return;

    const categoryLabels: Record<string, string> = {
      weather: '악천후 기상',
      night: '야간 저조도',
      motion: '고속 주행',
      camera: '카메라 각도',
      condition: '표면 오염',
      custom: '사용자 정의',
    };

    const newProfile: AugmentationProfile = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: trimmedName,
      category,
      categoryLabel: categoryLabels[category] || '사용자 정의',
      description: description.trim() || '사용자가 저장한 커스텀 ALPR 증강 파라미터 프로필',
      params: { ...currentParams },
      plateType: currentPlateType,
      isBuiltIn: false,
      createdAt: new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    };

    saveCustomProfileToStorage(newProfile);
    setSavedSuccess(true);

    if (onSaveSuccess) {
      onSaveSuccess(newProfile);
    }

    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center border border-sky-200 shadow-2xs">
              <Bookmark className="w-5 h-5 fill-sky-200" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>내 프리셋 저장 (Save to My Presets)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-sky-50 text-sky-700 border border-sky-200 rounded-full font-bold">
                  Local Storage
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                현재 8대 광학 파라미터 조합을 브라우저 로컬 저장소에 영구 보관하고 언제든 원클릭 로드합니다.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Preset Name Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800">
                프리셋 이름 (Preset Name) <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setProfileName(suggestProfileName(currentParams))}
                className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 hover:underline"
              >
                <Sparkles className="w-3 h-3 text-sky-500" />
                <span>파라미터 기반 자동 추천</span>
              </button>
            </div>
            <input
              type="text"
              required
              placeholder="예: 야간 고속도로 폭우 140km/h"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all shadow-2xs"
            />

            {/* Quick Name Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[10px] font-bold text-slate-600 mr-1 flex items-center">
                추천 이름:
              </span>
              {quickNameChips.map((chip) => (
                <button
                  type="button"
                  key={chip}
                  onClick={() => setProfileName(chip)}
                  className="text-[10px] bg-slate-100 hover:bg-sky-50 hover:text-sky-700 border border-slate-200/80 px-2 py-0.5 rounded-md text-slate-600 transition-colors"
                >
                  {chip.split(' (')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              카테고리 분류 (Category)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'custom', label: '사용자 정의', icon: Bookmark, color: 'text-purple-600' },
                { id: 'weather', label: '악천후 기상', icon: CloudRain, color: 'text-cyan-600' },
                { id: 'night', label: '야간 저조도', icon: Moon, color: 'text-indigo-600' },
                { id: 'motion', label: '고속 주행', icon: Wind, color: 'text-blue-600' },
                { id: 'camera', label: '카메라 각도', icon: Rotate3d, color: 'text-emerald-600' },
                { id: 'condition', label: '표면 오염', icon: ShieldAlert, color: 'text-amber-600' },
              ].map((cat) => {
                const IconComponent = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategory(cat.id as any)}
                    className={`flex items-center gap-1.5 p-2 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-slate-900 border-slate-900 text-white shadow-2xs font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-400' : cat.color}`} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              설명 및 도로 ITS 시나리오 메모 (선택 사항)
            </label>
            <textarea
              rows={2}
              placeholder="예: 야간 빗길 과속 단속 카메라 설치 시 획 뭉개짐 검증용"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all shadow-2xs"
            />
          </div>

          {/* Active Parameters Live Preview */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-sky-600" />
                <span>저장되는 파라미터 값 스냅샷:</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                8대 광학 파라미터
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
              <span className={`px-2 py-0.5 rounded font-bold ${currentParams.blur > 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                블러 {currentParams.blur}px
              </span>
              <span className={`px-2 py-0.5 rounded font-bold ${currentParams.brightness !== 100 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                밝기 {currentParams.brightness}%
              </span>
              <span className={`px-2 py-0.5 rounded font-bold ${currentParams.contrast !== 100 ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'}`}>
                대비 {currentParams.contrast}%
              </span>
              <span className={`px-2 py-0.5 rounded font-bold ${currentParams.noise > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                노이즈 {currentParams.noise}%
              </span>
              <span className={`px-2 py-0.5 rounded font-bold ${currentParams.rain > 0 ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-100 text-slate-500'}`}>
                강우 {currentParams.rain}%
              </span>
              <span className={`px-2 py-0.5 rounded font-bold ${currentParams.fog > 0 ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'}`}>
                안개 {currentParams.fog}%
              </span>
              <span className={`px-2 py-0.5 rounded font-bold ${currentParams.dirt > 0 ? 'bg-stone-200 text-stone-700' : 'bg-slate-100 text-slate-500'}`}>
                오염 {currentParams.dirt}%
              </span>
              <span className={`px-2 py-0.5 rounded font-bold ${currentParams.glare > 0 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'}`}>
                역광 {currentParams.glare}%
              </span>
              {(currentParams.rotate !== 0 || currentParams.perspectiveX !== 0 || currentParams.perspectiveY !== 0) && (
                <span className="px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-700">
                  원근/회전 ({currentParams.rotate}°, {currentParams.perspectiveX}°, {currentParams.perspectiveY}°)
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={savedSuccess}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 ${
                savedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-sky-600 hover:bg-sky-500 text-white'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>내 프리셋 저장 완료!</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>내 프리셋에 저장 (Save Preset)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
