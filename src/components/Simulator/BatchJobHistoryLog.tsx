import React, { useState, useMemo, useEffect } from 'react';
import { 
  BatchJobRecord, 
  getBatchJobHistory, 
  deleteBatchJob, 
  clearBatchJobHistory, 
  downloadJobSummaryJson, 
  downloadJobSummaryCsv, 
  downloadJobSummaryMarkdown, 
  downloadJobPipelinePy, 
  exportAllJobsAuditJson,
  BATCH_JOBS_CHANGED_EVENT 
} from '../../utils/datasetStorage';
import { 
  History, 
  Search, 
  Download, 
  FileJson, 
  FileSpreadsheet, 
  FileText, 
  Code2, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Sliders, 
  Copy, 
  Check, 
  X, 
  Filter, 
  ChevronRight,
  Sparkles,
  BarChart3,
  Layers,
  ArrowUpDown,
  RefreshCw
} from 'lucide-react';

interface BatchJobHistoryLogProps {
  onSelectJobForReplay?: (job: BatchJobRecord) => void;
}

export const BatchJobHistoryLog: React.FC<BatchJobHistoryLogProps> = ({ onSelectJobForReplay }) => {
  const [jobs, setJobs] = useState<BatchJobRecord[]>(() => getBatchJobHistory());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'has_errors'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'accuracy' | 'images'>('newest');
  const [selectedJobForModal, setSelectedJobForModal] = useState<BatchJobRecord | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'overview' | 'items' | 'json' | 'code'>('overview');
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  // Sync with global storage events
  useEffect(() => {
    const handleJobsChanged = (e: Event) => {
      const customEvent = e as CustomEvent<BatchJobRecord[]>;
      if (customEvent.detail) {
        setJobs(customEvent.detail);
      } else {
        setJobs(getBatchJobHistory());
      }
    };

    window.addEventListener(BATCH_JOBS_CHANGED_EVENT, handleJobsChanged);
    return () => {
      window.removeEventListener(BATCH_JOBS_CHANGED_EVENT, handleJobsChanged);
    };
  }, []);

  // Filtered & Sorted Jobs
  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = job.name.toLowerCase().includes(q);
          const matchId = job.id.toLowerCase().includes(q);
          const matchTags = job.summaryTags.some(t => t.toLowerCase().includes(q));
          const matchItems = job.items.some(i => i.filename.toLowerCase().includes(q) || (i.predictedText && i.predictedText.toLowerCase().includes(q)));
          if (!matchName && !matchId && !matchTags && !matchItems) {
            return false;
          }
        }

        // Status filter
        if (statusFilter === 'completed' && job.failedCount > 0) return false;
        if (statusFilter === 'has_errors' && job.failedCount === 0) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'accuracy') {
          return b.detectionRate - a.detectionRate;
        }
        if (sortBy === 'images') {
          return b.totalImages - a.totalImages;
        }
        // default newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [jobs, searchQuery, statusFilter, sortBy]);

  const handleDeleteJob = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteBatchJob(id);
    setJobs(updated);
    if (selectedJobForModal?.id === id) {
      setSelectedJobForModal(null);
    }
  };

  const handleClearAll = () => {
    clearBatchJobHistory();
    setJobs([]);
    setSelectedJobForModal(null);
    setConfirmClearAll(false);
  };

  const handleCopyJson = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleCopyCode = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Generate python code for modal
  const generateModalPyCode = (job: BatchJobRecord) => {
    const p = job.params;
    return `# Albumentations Pipeline Replication
# Batch Job: ${job.name} (${job.id})
# Executed: ${job.timestampFormatted}
import albumentations as A
import cv2

transform = A.Compose([
    A.Blur(blur_limit=(${Math.max(3, p.blur * 2)}, ${Math.max(3, p.blur * 2)}), p=${p.blur > 0 ? 1.0 : 0.0}),
    A.RandomBrightnessContrast(
        brightness_limit=${((p.brightness - 100) / 100).toFixed(2)},
        contrast_limit=${((p.contrast - 100) / 100).toFixed(2)},
        p=1.0
    ),
    A.GaussNoise(var_limit=(${p.noise * 5}, ${p.noise * 15}), p=${p.noise > 0 ? 1.0 : 0.0}),
    A.Rotate(limit=(${p.rotate}, ${p.rotate}), p=${p.rotate !== 0 ? 1.0 : 0.0}),
])

print("Replicating batch transformation: ${job.name}")
print("Config: ${JSON.stringify(p)}")
`;
  };

  // Aggregate stats
  const totalJobsCount = jobs.length;
  const totalImagesProcessed = jobs.reduce((sum, j) => sum + j.totalImages, 0);
  const avgOverallRate = totalJobsCount > 0
    ? Math.round(jobs.reduce((sum, j) => sum + j.detectionRate, 0) / totalJobsCount)
    : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner / Summary Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="text-xs text-slate-500 font-medium">총 배치 작업 기록</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">{totalJobsCount}</span>
            <span className="text-xs text-slate-500">건 완료됨</span>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="text-xs text-slate-500 font-medium">누적 증강 처리 이미지</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-sky-700 font-mono">{totalImagesProcessed}</span>
            <span className="text-xs text-slate-500">장 변환 및 평가</span>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="text-xs text-slate-500 font-medium">전체 평균 OCR 인식률</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className={`text-2xl font-black font-mono ${avgOverallRate >= 80 ? 'text-emerald-700' : 'text-amber-700'}`}>
              {avgOverallRate}%
            </span>
            <span className="text-xs text-slate-500">평균 신뢰도</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="작업명, 파라미터(빗길, 블러, 노이즈 등), 파일명 검색..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status filter */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                statusFilter === 'completed'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              성공 (100%)
            </button>
            <button
              onClick={() => setStatusFilter('has_errors')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                statusFilter === 'has_errors'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              미달/오류 포함
            </button>
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="newest">최신 실행순</option>
              <option value="accuracy">높은 인식률순</option>
              <option value="images">이미지 건수순</option>
            </select>
          </div>

          {/* Master Export & Clear */}
          {jobs.length > 0 && (
            <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
              <button
                type="button"
                onClick={() => exportAllJobsAuditJson(jobs)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-300 rounded-lg transition-all active:scale-95 shadow-2xs"
                title="모든 배치 작업 히스토리를 감사용 통합 JSON으로 다운로드"
              >
                <Download className="w-3.5 h-3.5 text-sky-600" />
                <span>전체 로그 백업</span>
              </button>

              {!confirmClearAll ? (
                <button
                  type="button"
                  onClick={() => setConfirmClearAll(true)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                  title="작업 기록 초기화"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 p-1 rounded-lg">
                  <span className="text-[11px] font-bold text-rose-700 px-1">전체 삭제?</span>
                  <button
                    onClick={handleClearAll}
                    className="px-2 py-0.5 text-[11px] font-bold bg-rose-600 text-white rounded hover:bg-rose-700"
                  >
                    확인
                  </button>
                  <button
                    onClick={() => setConfirmClearAll(false)}
                    className="px-1.5 py-0.5 text-[11px] text-slate-600 hover:text-slate-800"
                  >
                    취소
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div className="py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
          <History className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-700 mb-1">
            {jobs.length === 0 ? '기록된 배치 작업 내역이 없습니다.' : '검색 조건과 일치하는 배치 작업이 없습니다.'}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {jobs.length === 0 
              ? '폴더를 업로드하고 [현재 파라미터 적용 증강 시작]을 누르면 실행 기록과 상세 평가 메타데이터가 여기에 자동 보관됩니다.'
              : '검색어나 상태 필터를 재조정해보세요.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredJobs.map((job) => {
            const isPerfect = job.failedCount === 0;
            const rateColor = job.detectionRate >= 90
              ? 'text-emerald-700'
              : job.detectionRate >= 75
              ? 'text-sky-700'
              : 'text-amber-700';

            return (
              <div
                key={job.id}
                onClick={() => setSelectedJobForModal(job)}
                className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer flex flex-col gap-3 group"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${isPerfect ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                      {job.name}
                    </h4>
                    <span className="text-[11px] font-mono text-slate-400">
                      #{job.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {job.timestampFormatted}
                    </span>
                    <span>·</span>
                    <span className="font-mono text-[11px] text-slate-600">
                      {(job.durationMs / 1000).toFixed(2)}s 소요
                    </span>
                  </div>
                </div>

                {/* Metrics & Parameters Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 px-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-500 block">처리 수량</span>
                    <span className="font-bold font-mono text-slate-800 text-sm">
                      {job.totalImages}장
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">인식 성공률</span>
                    <span className={`font-bold font-mono text-sm ${rateColor}`}>
                      {job.detectionRate}% ({job.successCount}/{job.totalImages})
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">평균 확신도</span>
                    <span className="font-bold font-mono text-slate-800 text-sm">
                      {job.avgConfidence}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">평균 추론지연</span>
                    <span className="font-bold font-mono text-slate-800 text-sm">
                      {job.avgLatencyMs}ms
                    </span>
                  </div>
                </div>

                {/* Tags and Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-slate-400 font-medium">적용 효과:</span>
                    {job.summaryTags.length > 0 ? (
                      job.summaryTags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-mono text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded font-medium"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-500">기본 원본 (Clean Baseline)</span>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setSelectedJobForModal(job)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-all"
                      title="메타데이터 상세 및 개별 파일 로그 확인"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>상세 로그</span>
                    </button>

                    {/* Download Summary Dropdown or Direct Action */}
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                      <button
                        type="button"
                        onClick={() => downloadJobSummaryJson(job)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-sky-800 hover:bg-sky-50 transition-colors"
                        title="JSON 메타데이터 요약 다운로드"
                      >
                        <FileJson className="w-3.5 h-3.5 text-sky-600" />
                        <span>JSON</span>
                      </button>
                      <div className="w-[1px] h-4 bg-slate-200" />
                      <button
                        type="button"
                        onClick={() => downloadJobSummaryCsv(job)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-50 transition-colors"
                        title="CSV 메트릭 보고서 다운로드 (Excel 호환)"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                        <span>CSV</span>
                      </button>
                      <div className="w-[1px] h-4 bg-slate-200" />
                      <button
                        type="button"
                        onClick={() => downloadJobSummaryMarkdown(job)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors"
                        title="Markdown 연구 보고서 다운로드"
                      >
                        <span>MD</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteJob(job.id, e)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="이 작업 기록 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Metadata Inspector Modal */}
      {selectedJobForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-sky-100 text-sky-700 rounded-lg">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>{selectedJobForModal.name}</span>
                    <span className="text-[11px] font-mono text-slate-400">
                      ({selectedJobForModal.id})
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    실행 일시: {selectedJobForModal.timestampFormatted} · 소요 시간: {(selectedJobForModal.durationMs / 1000).toFixed(2)}초
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadJobSummaryJson(selectedJobForModal)}
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-300 rounded-lg transition-all"
                  title="JSON 다운로드"
                >
                  <Download className="w-3 h-3 text-sky-600" />
                  <span>JSON</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadJobSummaryCsv(selectedJobForModal)}
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-all"
                  title="CSV 다운로드"
                >
                  <Download className="w-3 h-3 text-emerald-600" />
                  <span>CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedJobForModal(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-1 px-6 border-b border-slate-200 bg-white text-xs font-semibold">
              <button
                onClick={() => setActiveModalTab('overview')}
                className={`py-3 px-3 border-b-2 transition-all ${
                  activeModalTab === 'overview'
                    ? 'border-sky-600 text-sky-700 font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>통계 및 파라미터 (Overview)</span>
              </button>
              <button
                onClick={() => setActiveModalTab('items')}
                className={`py-3 px-3 border-b-2 transition-all ${
                  activeModalTab === 'items'
                    ? 'border-sky-600 text-sky-700 font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>개별 파일 평가 로그 ({selectedJobForModal.items.length})</span>
              </button>
              <button
                onClick={() => setActiveModalTab('json')}
                className={`py-3 px-3 border-b-2 transition-all ${
                  activeModalTab === 'json'
                    ? 'border-sky-600 text-sky-700 font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>원시 JSON 메타데이터</span>
              </button>
              <button
                onClick={() => setActiveModalTab('code')}
                className={`py-3 px-3 border-b-2 transition-all ${
                  activeModalTab === 'code'
                    ? 'border-sky-600 text-sky-700 font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>파이썬 재현 코드</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {activeModalTab === 'overview' && (
                <div className="flex flex-col gap-6">
                  {/* Performance Metric Cards */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                      1. 모델 추론 성능 평가 지표
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-[11px] text-slate-500 font-medium block">인식 성공률</span>
                        <div className="mt-1 flex items-baseline gap-1.5">
                          <span className={`text-xl font-bold font-mono ${selectedJobForModal.detectionRate >= 80 ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {selectedJobForModal.detectionRate}%
                          </span>
                          <span className="text-[11px] text-slate-500">
                            ({selectedJobForModal.successCount}/{selectedJobForModal.totalImages})
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-[11px] text-slate-500 font-medium block">평균 신뢰도 점수</span>
                        <div className="mt-1 flex items-baseline gap-1.5">
                          <span className="text-xl font-bold font-mono text-slate-900">
                            {selectedJobForModal.avgConfidence}%
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-[11px] text-slate-500 font-medium block">평균 추론 지연시간</span>
                        <div className="mt-1 flex items-baseline gap-1.5">
                          <span className="text-xl font-bold font-mono text-slate-900">
                            {selectedJobForModal.avgLatencyMs}ms
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-[11px] text-slate-500 font-medium block">배치 실행 총 시간</span>
                        <div className="mt-1 flex items-baseline gap-1.5">
                          <span className="text-xl font-bold font-mono text-slate-900">
                            {(selectedJobForModal.durationMs / 1000).toFixed(2)}초
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Parameter Snapshot */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                      2. 적용된 8대 광학 및 환경 증강 파라미터 스냅샷
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                        <span className="text-slate-500">모션 블러:</span>
                        <strong className="text-slate-800">{selectedJobForModal.params.blur}px</strong>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                        <span className="text-slate-500">조도(밝기):</span>
                        <strong className="text-slate-800">{selectedJobForModal.params.brightness}%</strong>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                        <span className="text-slate-500">대비:</span>
                        <strong className="text-slate-800">{selectedJobForModal.params.contrast}%</strong>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                        <span className="text-slate-500">가우시안 노이즈:</span>
                        <strong className="text-slate-800">{selectedJobForModal.params.noise}%</strong>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                        <span className="text-slate-500">강우(Rain):</span>
                        <strong className="text-slate-800">{selectedJobForModal.params.rain}%</strong>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                        <span className="text-slate-500">안개(Fog):</span>
                        <strong className="text-slate-800">{selectedJobForModal.params.fog}%</strong>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                        <span className="text-slate-500">렌즈 오염(Dirt):</span>
                        <strong className="text-slate-800">{selectedJobForModal.params.dirt}%</strong>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                        <span className="text-slate-500">역광(Glare):</span>
                        <strong className="text-slate-800">{selectedJobForModal.params.glare}%</strong>
                      </div>
                    </div>
                  </div>

                  {/* Summary Export Options */}
                  <div className="p-4 bg-sky-50/60 border border-sky-100 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <h5 className="text-xs font-bold text-sky-950">
                        결과 요약 보고서 파일 내보내기 (Download Result Summaries)
                      </h5>
                      <p className="text-[11px] text-sky-800 mt-0.5">
                        이 과거 배치 작업의 평가 결과, 신뢰도 통계 및 재현 코드를 원하는 포맷으로 즉시 다운로드할 수 있습니다.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => downloadJobSummaryJson(selectedJobForModal)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-sky-800 bg-white hover:bg-sky-50 border border-sky-300 rounded-lg transition-all shadow-2xs"
                      >
                        <FileJson className="w-3.5 h-3.5 text-sky-600" />
                        <span>JSON 요약</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadJobSummaryCsv(selectedJobForModal)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-white hover:bg-emerald-50 border border-emerald-300 rounded-lg transition-all shadow-2xs"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                        <span>CSV 메트릭</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadJobSummaryMarkdown(selectedJobForModal)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-all shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-600" />
                        <span>마크다운 보고서</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeModalTab === 'items' && (
                <div className="flex flex-col gap-4">
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">#</th>
                          <th className="py-2.5 px-3">파일명</th>
                          <th className="py-2.5 px-3">해상도</th>
                          <th className="py-2.5 px-3">원문(GT)</th>
                          <th className="py-2.5 px-3">인식결과(Pred)</th>
                          <th className="py-2.5 px-3">상태</th>
                          <th className="py-2.5 px-3 text-right">확신도</th>
                          <th className="py-2.5 px-3 text-right">지연</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedJobForModal.items.map((it, idx) => (
                          <tr key={it.id || idx} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-mono font-medium text-slate-800">
                              {it.filename}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-500">{it.resolution}</td>
                            <td className="py-2.5 px-3 font-medium text-slate-600">{it.originalText || '-'}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">{it.predictedText || '-'}</td>
                            <td className="py-2.5 px-3">
                              {it.detected ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>일치</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700">
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  <span>미달</span>
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold">
                              <span className={it.confidence >= 80 ? 'text-emerald-700' : 'text-amber-700'}>
                                {it.confidence}%
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                              {it.latencyMs || 0}ms
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeModalTab === 'json' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      전체 메타데이터 JSON 구조체 (Schema & Audit Log)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyJson(JSON.stringify(selectedJobForModal, null, 2))}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      {copiedJson ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600 font-bold">복사 완료!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>클립보드 복사</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto max-h-[380px] leading-relaxed">
                    {JSON.stringify(selectedJobForModal, null, 2)}
                  </pre>
                </div>
              )}

              {activeModalTab === 'code' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      파이썬 Albumentations 파이프라인 재현 코드
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => downloadJobPipelinePy(selectedJobForModal)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-sky-600" />
                        <span>.py 파일 저장</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(generateModalPyCode(selectedJobForModal))}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        {copiedCode ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600 font-bold">복사 완료!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>코드 복사</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto max-h-[380px] leading-relaxed">
                    {generateModalPyCode(selectedJobForModal)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
