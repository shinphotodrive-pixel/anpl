import React from 'react';
import { AugmentationParams, HistoryConfigItem } from '../../types/alpr';
import { areParamsEqual } from '../../utils/randomizeAugmentation';
import { 
  History, 
  RotateCcw, 
  Trash2, 
  CheckCircle2, 
  Dices, 
  Sliders, 
  Sparkles, 
  BookmarkCheck,
  ChevronRight,
  Clock,
  X
} from 'lucide-react';

interface RecentHistoryPanelProps {
  history: HistoryConfigItem[];
  currentParams: AugmentationParams;
  onRestore: (item: HistoryConfigItem) => void;
  onClearHistory: () => void;
  isOpenSidePanel?: boolean;
  onCloseSidePanel?: () => void;
  isDrawer?: boolean;
}

export const RecentHistoryPanel: React.FC<RecentHistoryPanelProps> = ({
  history,
  currentParams,
  onRestore,
  onClearHistory,
  isOpenSidePanel = false,
  onCloseSidePanel,
  isDrawer = false,
}) => {
  const getSourceBadge = (source: HistoryConfigItem['source']) => {
    switch (source) {
      case 'random':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
            <Dices className="w-3 h-3 text-amber-600" />
            <span>랜덤 엣지케이스</span>
          </span>
        );
      case 'preset':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 bg-sky-100/80 px-2 py-0.5 rounded-md">
            <Sparkles className="w-3 h-3 text-sky-600" />
            <span>프리셋</span>
          </span>
        );
      case 'profile':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-md">
            <BookmarkCheck className="w-3 h-3 text-indigo-600" />
            <span>라이브러리</span>
          </span>
        );
      case 'manual':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
            <Sliders className="w-3 h-3 text-emerald-600" />
            <span>슬라이더 조정</span>
          </span>
        );
      case 'initial':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
            <span>기본 원본</span>
          </span>
        );
    }
  };

  const renderContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>최근 적용 파라미터 기록</span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 text-sky-700 bg-sky-50 border border-sky-200 rounded">
                {history.length}/5
              </span>
            </h4>
            <p className="text-[10px] text-slate-500">
              최근 5개의 증강 조합을 추적하며 즉시 이전 상태로 토글 복원합니다
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              title="최근 기록 모두 비우기"
              className="text-[11px] text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">비우기</span>
            </button>
          )}
          {isDrawer && onCloseSidePanel && (
            <button
              onClick={onCloseSidePanel}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              title="사이드 패널 닫기"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* History Items List */}
      {history.length === 0 ? (
        <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/70">
          <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-600">아직 기록된 파라미터가 없습니다.</p>
          <p className="text-[11px] text-slate-400 mt-1">
            프리셋을 클릭하거나 '무작위 증강(Randomize)'을 실행하면 자동으로 최근 5개가 기록됩니다.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 overflow-y-auto max-h-[380px] pr-1">
          {history.map((item, idx) => {
            const isActive = areParamsEqual(item.params, currentParams);
            return (
              <div
                key={item.id}
                className={`group relative p-3 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-sky-50/70 border-sky-300 shadow-xs ring-1 ring-sky-300/60'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs'
                }`}
              >
                {/* Top Row: Index + Badge + Timestamp + Status */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-[10px] font-extrabold text-slate-400">
                      #{idx + 1}
                    </span>
                    {getSourceBadge(item.source)}
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {item.timestamp}
                    </span>
                  </div>

                  {isActive && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 bg-white border border-sky-200 px-1.5 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3 text-sky-600" />
                      <span>현재 적용 중</span>
                    </span>
                  )}
                </div>

                {/* Label Title */}
                <div className="mb-2">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-sky-800 transition-colors">
                    {item.label}
                  </span>
                </div>

                {/* Tags breakdown */}
                <div className="flex flex-wrap gap-1 mb-2.5">
                  {item.summaryTags.slice(0, 5).map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200/70"
                    >
                      {tag}
                    </span>
                  ))}
                  {item.summaryTags.length > 5 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">
                      +{item.summaryTags.length - 5}
                    </span>
                  )}
                </div>

                {/* Action button */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: {item.id.slice(-6)}
                  </span>

                  <button
                    onClick={() => onRestore(item)}
                    disabled={isActive}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                      isActive
                        ? 'bg-slate-100 text-slate-400 cursor-default'
                        : 'bg-slate-900 hover:bg-sky-600 text-white shadow-2xs active:scale-95'
                    }`}
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{isActive ? '적용된 상태' : '이 설정으로 복원'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // If drawer mode (sliding side panel)
  if (isDrawer) {
    if (!isOpenSidePanel) return null;
    return (
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          onClick={onCloseSidePanel}
        />
        {/* Panel Sheet */}
        <div className="relative w-full max-w-md bg-white shadow-2xl h-full p-6 flex flex-col z-10 animate-in slide-in-from-right duration-200">
          {renderContent()}
        </div>
      </div>
    );
  }

  // Standard inline panel
  return (
    <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4">
      {renderContent()}
    </div>
  );
};
