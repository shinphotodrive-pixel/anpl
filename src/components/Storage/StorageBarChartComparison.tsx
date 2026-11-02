import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { 
  BarChart2, 
  Layers, 
  HardDrive, 
  Images, 
  TrendingDown, 
  Info, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export interface StorageChartDataPoint {
  name: string;
  resolution: string;
  megapixels: number;
  // Video metrics in TB
  h265Tb?: number;
  h264Tb?: number;
  mjpegTb?: number;
  // Photo metrics in MB or GB
  jpegMb?: number;
  webpMb?: number;
  pngMb?: number;
  rawMb?: number;
  jpegGb?: number;
  webpGb?: number;
  pngGb?: number;
  rawGb?: number;
  recommendedStorageTb?: number;
}

interface StorageBarChartComparisonProps {
  mode: 'video' | 'photo';
  title?: string;
  subtitle?: string;
  cameraCount?: number;
  retentionDays?: number;
  photoCount?: number;
  selectedResolutionId?: string;
  onSelectResolution?: (id: string) => void;
}

export const StorageBarChartComparison: React.FC<StorageBarChartComparisonProps> = ({
  mode,
  title,
  subtitle,
  cameraCount = 4,
  retentionDays = 30,
  photoCount = 1000,
  selectedResolutionId,
  onSelectResolution
}) => {
  const [photoUnit, setPhotoUnit] = useState<'MB' | 'GB'>('MB');
  const [activeSeries, setActiveSeries] = useState<string>('all');

  // Video Data Calculation for 6 major resolutions
  const videoData = useMemo(() => {
    const specs = [
      { id: 'hd', name: 'HD (720p)', res: '1280x720', mp: 0.92, h265Bitrate: 1.4, h264Bitrate: 2.5, mjpegBitrate: 15.0 },
      { id: 'fhd', name: 'FHD (1080p)', res: '1920x1080', mp: 2.07, h265Bitrate: 2.5, h264Bitrate: 4.5, mjpegBitrate: 28.0 },
      { id: '3m', name: '3M (QXGA)', res: '2048x1536', mp: 3.15, h265Bitrate: 3.5, h264Bitrate: 6.3, mjpegBitrate: 42.0 },
      { id: '5m', name: '5M (IMX264)', res: '2448x2048', mp: 5.01, h265Bitrate: 5.0, h264Bitrate: 9.0, mjpegBitrate: 65.0 },
      { id: '4k_uhd', name: '4K (2160p)', res: '3840x2160', mp: 8.29, h265Bitrate: 7.4, h264Bitrate: 13.3, mjpegBitrate: 105.0 },
      { id: '12m', name: '12M (산업용)', res: '4000x3000', mp: 12.0, h265Bitrate: 10.5, h264Bitrate: 18.9, mjpegBitrate: 150.0 }
    ];

    const secondsTotal = retentionDays * 24 * 3600;

    return specs.map(item => {
      // TB = (bitrate Mbps * 1e6 / 8 * seconds * cameraCount) / 1e12
      const h265Tb = ((item.h265Bitrate * 1e6 / 8) * secondsTotal * cameraCount) / (1024 * 1024 * 1024 * 1024);
      const h264Tb = ((item.h264Bitrate * 1e6 / 8) * secondsTotal * cameraCount) / (1024 * 1024 * 1024 * 1024);
      const mjpegTb = ((item.mjpegBitrate * 1e6 / 8) * secondsTotal * cameraCount) / (1024 * 1024 * 1024 * 1024);

      return {
        id: item.id,
        name: item.name,
        res: item.res,
        megapixels: item.mp,
        'H.265 (권장)': parseFloat(h265Tb.toFixed(2)),
        'H.264 (표준)': parseFloat(h264Tb.toFixed(2)),
        'MJPEG (독립)': parseFloat(mjpegTb.toFixed(2)),
        h265SavingsTb: parseFloat((h264Tb - h265Tb).toFixed(2)),
        h265SavingsPercent: Math.round(((h264Tb - h265Tb) / h264Tb) * 100)
      };
    });
  }, [cameraCount, retentionDays]);

  // Photo Data Calculation for 6 major resolutions
  const photoData = useMemo(() => {
    const specs = [
      { id: 'hd', name: 'HD (720p)', res: '1280x720', mp: 0.92, jpegKb: 185, webpKb: 130, pngKb: 1420, rawKb: 2700 },
      { id: 'fhd', name: 'FHD (1080p)', res: '1920x1080', mp: 2.07, jpegKb: 420, webpKb: 295, pngKb: 3180, rawKb: 6075 },
      { id: '3m', name: '3M (QXGA)', res: '2048x1536', mp: 3.15, jpegKb: 640, webpKb: 450, pngKb: 4850, rawKb: 9216 },
      { id: '5m', name: '5M (IMX264)', res: '2448x2048', mp: 5.01, jpegKb: 980, webpKb: 690, pngKb: 7850, rawKb: 14688 },
      { id: '4k_uhd', name: '4K (2160p)', res: '3840x2160', mp: 8.29, jpegKb: 1680, webpKb: 1180, pngKb: 12900, rawKb: 24300 },
      { id: '12m', name: '12M (산업용)', res: '4000x3000', mp: 12.0, jpegKb: 2450, webpKb: 1720, pngKb: 18800, rawKb: 35156 }
    ];

    return specs.map(item => {
      const jpegMb = (item.jpegKb * photoCount) / 1024;
      const webpMb = (item.webpKb * photoCount) / 1024;
      const pngMb = (item.pngKb * photoCount) / 1024;
      const rawMb = (item.rawKb * photoCount) / 1024;

      if (photoUnit === 'GB') {
        return {
          id: item.id,
          name: item.name,
          res: item.res,
          megapixels: item.mp,
          'JPEG 90%': parseFloat((jpegMb / 1024).toFixed(3)),
          'WebP': parseFloat((webpMb / 1024).toFixed(3)),
          'PNG 24bit': parseFloat((pngMb / 1024).toFixed(3)),
          'RAW 24bit': parseFloat((rawMb / 1024).toFixed(3))
        };
      }

      return {
        id: item.id,
        name: item.name,
        res: item.res,
        megapixels: item.mp,
        'JPEG 90%': Math.round(jpegMb),
        'WebP': Math.round(webpMb),
        'PNG 24bit': Math.round(pngMb),
        'RAW 24bit': Math.round(rawMb)
      };
    });
  }, [photoCount, photoUnit]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950/95 border border-slate-700/90 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md text-xs font-mono">
          <div className="font-bold text-white text-sm border-b border-slate-800 pb-1.5 mb-2 font-sans flex items-center justify-between gap-4">
            <span>{label}</span>
            <span className="text-slate-400 text-[11px] font-normal">{payload[0]?.payload?.res}</span>
          </div>

          <div className="space-y-1.5">
            {payload.map((entry: any, index: number) => (
              <div key={`item-${index}`} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span>{entry.name}:</span>
                </span>
                <span className="font-bold text-white font-mono">
                  {entry.value?.toLocaleString()} {mode === 'video' ? 'TB' : photoUnit}
                </span>
              </div>
            ))}
          </div>

          {mode === 'video' && payload[0]?.payload?.h265SavingsTb && (
            <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-emerald-400">
              <span>H.265 용량 절감:</span>
              <span className="font-bold font-mono">
                -{payload[0].payload.h265SavingsTb} TB ({payload[0].payload.h265SavingsPercent}%)
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-7 space-y-6 shadow-xl">
      {/* Component Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base sm:text-lg tracking-tight">
              {title || (mode === 'video' ? '해상도별 비디오 예상 스토리지 용량 비교 차트' : '해상도별 사진 스토리지 용량 비교 차트')}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {subtitle || (mode === 'video' 
                ? `카메라 ${cameraCount}대, ${retentionDays}일 24/7 보관 기준 해상도별 H.265 vs H.264 vs MJPEG 총 용량(TB)` 
                : `사진 ${photoCount.toLocaleString()}장 디렉토리 저장 시 해상도 및 포맷별 소요 용량 (${photoUnit})`)}
            </p>
          </div>
        </div>

        {/* Controls / Unit Switcher */}
        <div className="flex items-center gap-2">
          {mode === 'photo' && (
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-700 text-xs font-mono">
              <button
                onClick={() => setPhotoUnit('MB')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  photoUnit === 'MB'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                MB 단위
              </button>
              <button
                onClick={() => setPhotoUnit('GB')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  photoUnit === 'GB'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                GB 단위
              </button>
            </div>
          )}

          {mode === 'video' && (
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>H.265 적용 시 평균 -45% 절감</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Recharts Bar Chart Area */}
      <div className="w-full h-80 sm:h-96 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={(mode === 'video' ? videoData : photoData) as any[]}
            margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
            <XAxis 
              dataKey="name" 
              stroke="#94a3b8" 
              fontSize={11} 
              tickLine={false}
              tick={{ fill: '#cbd5e1' }}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={11} 
              tickLine={false}
              tick={{ fill: '#cbd5e1' }}
              unit={mode === 'video' ? ' TB' : ` ${photoUnit}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '10px' }}
              formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>}
            />

            {mode === 'video' ? (
              <>
                <Bar dataKey="H.265 (권장)" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="H.264 (표준)" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="MJPEG (독립)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </>
            ) : (
              <>
                <Bar dataKey="JPEG 90%" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="WebP" fill="#a855f7" radius={[6, 6, 0, 0]} />
                <Bar dataKey="PNG 24bit" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                <Bar dataKey="RAW 24bit" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer Info Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-300">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">최대 해상도 4K 대비 FHD:</span>
          <strong className="text-sky-400 font-mono font-bold">약 1/4 용량 수준</strong>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">
            {mode === 'video' ? 'H.265 vs H.264 절감량:' : 'JPEG vs RAW 압축비:'}
          </span>
          <strong className="text-emerald-400 font-mono font-bold">
            {mode === 'video' ? '평균 40~50% 절감' : '약 14배 (93% 절약)'}
          </strong>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">데이터 규격:</span>
          <span className="text-slate-300 font-mono">10진수(1TB=1000GB)</span>
        </div>
      </div>
    </div>
  );
};
