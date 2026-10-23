import React, { useState } from 'react';
import { AugmentationParams, AugmentationProfile, PlateType } from '../../types/alpr';
import { BUILT_IN_PROFILES } from '../../data/presetProfiles';
import { 
  Bookmark, 
  Sparkles, 
  CloudRain, 
  Moon, 
  Wind, 
  Rotate3d, 
  ShieldAlert, 
  SunMedium, 
  Check, 
  Copy, 
  ArrowRight, 
  Sliders, 
  Code2, 
  Layers, 
  AlertTriangle,
  Zap
} from 'lucide-react';

interface PresetLibrarySectionProps {
  currentParams: AugmentationParams;
  onApplyPreset: (params: AugmentationParams, plateType?: PlateType, name?: string) => void;
}

export const PresetLibrarySection: React.FC<PresetLibrarySectionProps> = ({
  currentParams,
  onApplyPreset,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [appliedId, setAppliedId] = useState<string | null>(null);

  // We select the top 5 core environmental presets prominently
  const corePresets = BUILT_IN_PROFILES.slice(0, 5);

  const getProfileIcon = (category: string) => {
    switch (category) {
      case 'weather':
        return <CloudRain className="w-5 h-5 text-cyan-400" />;
      case 'night':
        return <Moon className="w-5 h-5 text-indigo-400" />;
      case 'motion':
        return <Wind className="w-5 h-5 text-sky-400" />;
      case 'camera':
        return <Rotate3d className="w-5 h-5 text-emerald-400" />;
      case 'condition':
      default:
        return <ShieldAlert className="w-5 h-5 text-amber-400" />;
    }
  };

  const getImpactBadge = (id: string) => {
    switch (id) {
      case 'heavy_rain':
        return { drop: '-38.2%p', level: '심각', cer: '24.5%' };
      case 'low_light_night':
        return { drop: '-42.5%p', level: '치명적', cer: '31.0%' };
      case 'fast_motion':
        return { drop: '-37.8%p', level: '심각', cer: '26.2%' };
      case 'highway_toll_angled':
        return { drop: '-29.2%p', level: '높음', cer: '18.4%' };
      case 'offroad_mud_splatter':
      default:
        return { drop: '-48.0%p', level: '치명적', cer: '35.8%' };
    }
  };

  const handleApply = (profile: AugmentationProfile) => {
    onApplyPreset(profile.params, profile.plateType, profile.name);
    setAppliedId(profile.id);

    // Smoothly scroll to simulator so user sees the immediate effect
    const simulatorElement = document.getElementById('simulator');
    if (simulatorElement) {
      simulatorElement.scrollIntoView({ behavior: 'smooth' });
    }

    setTimeout(() => setAppliedId(null), 3000);
  };

  const handleCopyJson = (profile: AugmentationProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    const configData = {
      presetName: profile.name,
      description: profile.description,
      params: profile.params,
      exportedAt: new Date().toISOString(),
    };
    navigator.clipboard.writeText(JSON.stringify(configData, null, 2));
    setCopiedId(profile.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section id="presets" className="py-20 bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 mb-2 font-mono uppercase tracking-wider">
            <Bookmark className="w-4 h-4 text-sky-400" />
            <span>Environmental Preset Library</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            환경 프리셋 라이브러리 (Preset Library)
          </h2>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            원클릭으로 8대 증강 파라미터를 동시 주입하여 실세계 복합 도로 환경
            <strong className="text-sky-300">('Heavy Rain', 'Night City', 'Highway Motion' 등)</strong>을 
            즉시 재현하고 모델의 내구성을 실시간 검증하세요.
          </p>
        </div>

        {/* 5 Core Standard Presets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {corePresets.map((profile) => {
            const impact = getImpactBadge(profile.id);
            const isApplied = appliedId === profile.id;

            return (
              <div
                key={profile.id}
                className="bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl group relative overflow-hidden"
              >
                {/* Background glow hint */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-sky-500/10 transition-colors" />

                <div>
                  {/* Top Header Row */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                        {getProfileIcon(profile.category)}
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                          {profile.categoryLabel}
                        </span>
                        <h3 className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">
                          {profile.name.split(' (')[0]}
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleCopyJson(profile, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
                      title="JSON 설정 복사"
                    >
                      {copiedId === profile.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Subtitle & Description */}
                  <div className="text-xs text-sky-300/90 font-medium mb-1.5">
                    {profile.name.includes('(') ? `(${profile.name.split('(')[1]}` : ''}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {profile.description}
                  </p>

                  {/* Parameters Parameter Breakdown Chips */}
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800/80 mb-4">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5 font-bold">
                      동시 주입 파라미터 조합 (Combined Parameters)
                    </span>
                    <div className="flex flex-wrap gap-1 text-[10px] font-mono">
                      {profile.params.blur > 0 && (
                        <span className="px-2 py-0.5 bg-blue-950/70 border border-blue-500/40 text-blue-300 rounded font-bold">
                          블러: {profile.params.blur}px
                        </span>
                      )}
                      {profile.params.rain > 0 && (
                        <span className="px-2 py-0.5 bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 rounded font-bold">
                          강우: {profile.params.rain}%
                        </span>
                      )}
                      {profile.params.fog > 0 && (
                        <span className="px-2 py-0.5 bg-slate-800 border border-slate-600 text-slate-300 rounded font-bold">
                          안개: {profile.params.fog}%
                        </span>
                      )}
                      {profile.params.noise > 0 && (
                        <span className="px-2 py-0.5 bg-amber-950/70 border border-amber-500/40 text-amber-300 rounded font-bold">
                          노이즈: {profile.params.noise}%
                        </span>
                      )}
                      {profile.params.brightness !== 100 && (
                        <span className="px-2 py-0.5 bg-indigo-950/70 border border-indigo-500/40 text-indigo-300 rounded font-bold">
                          조도: {profile.params.brightness}%
                        </span>
                      )}
                      {profile.params.contrast !== 100 && (
                        <span className="px-2 py-0.5 bg-indigo-950/70 border border-indigo-500/40 text-indigo-300 rounded font-bold">
                          대비: {profile.params.contrast}%
                        </span>
                      )}
                      {profile.params.dirt > 0 && (
                        <span className="px-2 py-0.5 bg-stone-900 border border-stone-600 text-stone-300 rounded font-bold">
                          오염: {profile.params.dirt}%
                        </span>
                      )}
                      {profile.params.glare > 0 && (
                        <span className="px-2 py-0.5 bg-orange-950/70 border border-orange-500/40 text-orange-300 rounded font-bold">
                          역광: {profile.params.glare}%
                        </span>
                      )}
                      {profile.params.rotate !== 0 && (
                        <span className="px-2 py-0.5 bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 rounded font-bold">
                          각도: {profile.params.rotate}°
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Impact Statistics */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-4 px-1">
                    <span className="flex items-center gap-1 text-rose-400 font-mono font-bold">
                      <AlertTriangle className="w-3 h-3" />
                      <span>예상 정확도 하락: {impact.drop}</span>
                    </span>
                    <span className="font-mono text-slate-500">
                      평균 CER: {impact.cer}
                    </span>
                  </div>
                </div>

                {/* Apply Button */}
                <button
                  onClick={() => handleApply(profile)}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                    isApplied
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md shadow-sky-500/20 active:scale-98'
                  }`}
                >
                  {isApplied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>시뮬레이터 적용 완료!</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-slate-950" />
                      <span>시뮬레이터에 즉시 적용 (Apply)</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </>
                  )}
                </button>
              </div>
            );
          })}

          {/* 6th Card: Additional Presets & Custom Configuration */}
          <div className="bg-slate-950/70 rounded-2xl border border-dashed border-slate-800 p-6 flex flex-col justify-between items-center text-center">
            <div className="my-auto">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center mx-auto mb-3">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">
                맞춤형 프리셋 생성 & 세부 조절
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mb-4">
                시뮬레이터의 8개 슬라이더를 직접 움직여 새로운 환경을 조합하고, 
                '현재 설정 저장' 버튼으로 나만의 프리셋을 무제한 보관하세요.
              </p>
            </div>

            <button
              onClick={() => {
                const simulatorElement = document.getElementById('simulator');
                if (simulatorElement) {
                  simulatorElement.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span>증강 시뮬레이터로 이동하여 세부 튜닝</span>
            </button>
          </div>
        </div>

        {/* Python Pipeline Code Export Helper Bar */}
        <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center flex-shrink-0">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block">
                Albumentations & PyTorch 배치 파이프라인 연동 지원
              </span>
              <span className="text-slate-400 text-[11px]">
                프리셋을 적용하면 하단 '파이썬 증강 코드 생성기'에 동일한 Albumentations Compose 파이프라인이 즉시 생성됩니다.
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              const simulatorElement = document.getElementById('simulator');
              if (simulatorElement) {
                simulatorElement.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 font-semibold rounded-xl text-xs border border-slate-700 transition-colors whitespace-nowrap"
          >
            코드 생성기 확인하기 →
          </button>
        </div>
      </div>
    </section>
  );
};
