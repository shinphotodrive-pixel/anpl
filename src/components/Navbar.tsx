import React, { useState, useRef } from 'react';
import { 
  Car, 
  Menu, 
  X, 
  Sliders, 
  Layers, 
  Database, 
  Calculator, 
  GitBranch, 
  Zap, 
  Bookmark, 
  ScanLine, 
  Lightbulb, 
  Cpu, 
  FolderArchive, 
  CircuitBoard, 
  BookOpen, 
  GraduationCap, 
  Brain,
  Home,
  ChevronLeft,
  ChevronRight,
  Coins,
  CheckSquare,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: '홈 (전체 개요)', icon: Home, badge: '메인' },
  { id: 'detector', label: '번호판 인식 프로그램', icon: ScanLine, badge: '실시간' },
  { id: 'lpr-lab', label: 'LPR Lab', icon: Cpu, badge: '딥러닝' },
  { id: 'hardware', label: '구성품', icon: CircuitBoard, badge: '하드웨어' },
  { id: 'lpr-research', label: 'LPR 연구(Research)', icon: BookOpen, badge: '연구' },
  { id: 'training', label: '학습', icon: GraduationCap, badge: '200만장' },
  { id: 'models', label: '모델', icon: Brain, badge: 'ONNX/DNN' },
  { id: 'lighting', label: '조명', icon: Lightbulb, badge: '광학' },
  { id: 'simulator', label: '증강 시뮬레이터', icon: Sliders, badge: '시뮬' },
  { id: 'batch', label: '배치 처리기', icon: FolderArchive, badge: '대량' },
  { id: 'validator', label: '데이터 검증기', icon: CheckSquare, badge: 'YOLO/VOC' },
  { id: 'presets', label: '프리셋 라이브러리', icon: Bookmark, badge: '표준' },
  { id: 'testbench', label: '인식 테스트 랩', icon: Zap, badge: '검증' },
  { id: 'solutions', label: '4대 해결 전략', icon: Layers, badge: '전략' },
  { id: 'challenges', label: '챌린지 매트릭스', icon: Database, badge: '매트릭스' },
  { id: 'pipeline', label: 'MLOps 파이프라인', icon: GitBranch, badge: '파이프라인' },
  { id: 'roi', label: '데이터셋 ROI 계산기', icon: Calculator, badge: '비용' },
  { id: 'cost-estimator', label: '비용 추정기', icon: Coins, badge: 'GPU/스토리지' },
];

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme, isDark } = useTheme();

  const currentItem = NAV_ITEMS.find((item) => item.id === activeTab) || NAV_ITEMS[0];
  const CurrentIcon = currentItem.icon;

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const scrollTabs = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <nav className="bg-white/95 dark:bg-slate-900/98 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 text-slate-800 dark:text-white shadow-xs dark:shadow-xl transition-colors duration-200">
      {/* 1. Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          {/* Logo & Brand */}
          <div 
            onClick={() => handleNavClick('home')} 
            className="flex items-center gap-3 cursor-pointer group shrink-0"
            title="메인 홈으로 이동"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-500 flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors">
                  ALPR Data-Hub
                </span>
                <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950 border border-sky-200 dark:border-sky-800/80 px-1.5 py-0.2 rounded">
                  v2.4
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden lg:block">
                지능형 차량 번호판 인식 & AI 데이터셋 통합 플랫폼
              </p>
            </div>
          </div>

          {/* Current Page Indicator Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-mono">현재 탭:</span>
            <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold">
              <CurrentIcon className="w-3.5 h-3.5" />
              <span>{currentItem.label}</span>
            </span>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleNavClick('home')}
              className={`hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'home'
                  ? 'bg-sky-50 dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 border border-sky-200 dark:border-sky-500/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>전체 홈</span>
            </button>

            <button
              onClick={() => handleNavClick('simulator')}
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all shadow-md shadow-sky-500/25 active:scale-95 shrink-0"
            >
              시뮬레이터
            </button>

            {/* Global Light/Dark Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 active:scale-95 shrink-0 shadow-2xs"
              title={isDark ? '라이트 모드로 전환 (Switch to Light Mode)' : '다크 모드로 전환 (Switch to Dark Mode)'}
              aria-label="화면 테마 변경"
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden md:inline text-[11px] text-amber-300 font-semibold">라이트</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-sky-600" />
                  <span className="hidden md:inline text-[11px] text-slate-700 font-semibold">다크</span>
                </>
              )}
            </button>

            {/* Mobile menu toggle */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1.5 rounded-lg focus:outline-none"
                aria-label="메뉴 열기"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Desktop Horizontal Tab Bar (Scrollable with Arrow Buttons) */}
      <div className="hidden md:block bg-slate-50 dark:bg-slate-950/90 border-t border-slate-200 dark:border-slate-800/80 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 flex items-center relative">
          {/* Scroll Left Button */}
          <button
            onClick={() => scrollTabs('left')}
            className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 shrink-0 mr-1 transition-colors"
            title="왼쪽 탭 스크롤"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Scrollable Tab Strip */}
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-1 overflow-x-auto py-2 scroll-smooth no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 ${
                    isActive
                      ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/25 scale-[1.02]'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Scroll Right Button */}
          <button
            onClick={() => scrollTabs('right')}
            className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 shrink-0 ml-1 transition-colors"
            title="오른쪽 탭 스크롤"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 pt-3 pb-5 space-y-1 max-h-[80vh] overflow-y-auto shadow-lg">
          {/* Mobile Theme Toggle Card */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-3">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">화면 테마</span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs"
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>라이트 모드로 전환</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-sky-600" />
                  <span>다크 모드로 전환</span>
                </>
              )}
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 px-3 py-1 uppercase tracking-wider mb-1">
            전체 16대 모듈 바로가기
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold ${
                  isActive
                    ? 'bg-sky-500 text-slate-950 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-slate-950/20 text-slate-900' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
};
