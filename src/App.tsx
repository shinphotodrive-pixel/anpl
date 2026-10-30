/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar, NAV_ITEMS } from './components/Navbar';
import { HomeView } from './components/Home/HomeView';
import { LicensePlateDetectorSection } from './components/LicensePlateDetector/LicensePlateDetectorSection';
import { LprLabSection } from './components/LprLab/LprLabSection';
import { HardwareComponentsSection } from './components/Hardware/HardwareComponentsSection';
import { LprResearchDashboard } from './components/LprResearch/LprResearchDashboard';
import { PlateTrainingSection } from './components/Training/PlateTrainingSection';
import { ModelShowcaseSection } from './components/Model/ModelShowcaseSection';
import { LightingDashboardSection } from './components/Lighting/LightingDashboardSection';
import { SimulatorView } from './components/Simulator/SimulatorView';
import { BatchProcessorSection } from './components/BatchProcessor/BatchProcessorSection';
import { DataValidatorSection } from './components/DataValidator/DataValidatorSection';
import { PresetLibrarySection } from './components/PresetLibrary/PresetLibrarySection';
import { TestBenchSection } from './components/TestBench/TestBenchSection';
import { SolutionsView } from './components/Solutions/SolutionsView';
import { ChallengeMatrix } from './components/ChallengeMatrix';
import { PipelineVisualizer } from './components/PipelineVisualizer';
import { RoiCalculator } from './components/RoiCalculator';
import { CostEstimatorSection } from './components/CostEstimator/CostEstimatorSection';
import { AugmentationParams, PlateType } from './types/alpr';
import { Home, ArrowLeft, ArrowRight, ChevronRight, Layers } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');

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

  const navigateToTab = (id: string) => {
    setActiveTab(id);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleApplyPreset = (newParams: AugmentationParams, _plateType?: PlateType) => {
    setParams(newParams);
  };

  // Pagination navigation helper for single-page tab views
  const moduleItems = NAV_ITEMS.filter((item) => item.id !== 'home');
  const currentModuleIndex = moduleItems.findIndex((item) => item.id === activeTab);
  const currentItem = NAV_ITEMS.find((item) => item.id === activeTab) || NAV_ITEMS[0];
  const CurrentIcon = currentItem.icon;
  const prevTab = currentModuleIndex > 0 ? moduleItems[currentModuleIndex - 1] : null;
  const nextTab = currentModuleIndex >= 0 && currentModuleIndex < moduleItems.length - 1 ? moduleItems[currentModuleIndex + 1] : null;

  // Render the selected tab's content exclusively (Single page per tab, no giant vertical scrolling)
  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView onNavigate={navigateToTab} />;

      case 'detector':
        return <LicensePlateDetectorSection />;

      case 'lpr-lab':
        return <LprLabSection />;

      case 'hardware':
        return <HardwareComponentsSection />;

      case 'lpr-research':
        return <LprResearchDashboard />;

      case 'training':
        return <PlateTrainingSection />;

      case 'models':
        return <ModelShowcaseSection />;

      case 'lighting':
        return <LightingDashboardSection />;

      case 'simulator':
        return <SimulatorView sharedParams={params} setSharedParams={setParams} />;

      case 'batch':
        return (
          <BatchProcessorSection
            currentParams={params}
            onScrollToSimulator={() => navigateToTab('simulator')}
          />
        );

      case 'validator':
        return <DataValidatorSection />;

      case 'presets':
        return <PresetLibrarySection currentParams={params} onApplyPreset={handleApplyPreset} />;

      case 'testbench':
        return <TestBenchSection currentParams={params} />;

      case 'solutions':
        return <SolutionsView />;

      case 'challenges':
        return <ChallengeMatrix />;

      case 'pipeline':
        return <PipelineVisualizer />;

      case 'roi':
        return <RoiCalculator />;

      case 'cost-estimator':
        return <CostEstimatorSection />;

      default:
        return <HomeView onNavigate={navigateToTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Sticky Header Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={navigateToTab} />

      {/* Main Content Area - Renders exactly one page per selected tab */}
      <main className="flex-grow">
        {/* Module Breadcrumb & Pagination Bar for non-home pages */}
        {activeTab !== 'home' && (
          <div className="bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 py-3 px-4 sm:px-6 lg:px-8 sticky top-14 md:top-24 z-40 backdrop-blur-sm shadow-xs dark:shadow-md transition-colors duration-200">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
              {/* Breadcrumb Left */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateToTab('home')}
                  className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1 font-medium text-slate-500 dark:text-slate-400 hover:underline transition-colors"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>홈 (전체 개요)</span>
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />
                <span className="text-sky-600 dark:text-sky-400 font-bold flex items-center gap-1.5">
                  <CurrentIcon className="w-4 h-4" />
                  <span>{currentItem.label}</span>
                </span>
                {currentModuleIndex >= 0 && (
                  <span className="text-slate-400 dark:text-slate-500 font-mono text-xs hidden sm:inline">
                    ({currentModuleIndex + 1} / {moduleItems.length})
                  </span>
                )}
              </div>

              {/* Prev / Next Shortcuts Right */}
              <div className="flex items-center gap-2">
                {prevTab && (
                  <button
                    onClick={() => navigateToTab(prevTab.id)}
                    className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs border border-slate-200 dark:border-transparent"
                    title={`이전: ${prevTab.label}`}
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span className="hidden md:inline">이전:</span> {prevTab.label}
                  </button>
                )}
                {nextTab && (
                  <button
                    onClick={() => navigateToTab(nextTab.id)}
                    className="flex items-center gap-1 text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/70 border border-sky-200 dark:border-sky-800/70 hover:bg-sky-100 dark:hover:bg-sky-900/70 transition-colors text-xs font-semibold"
                    title={`다음: ${nextTab.label}`}
                  >
                    <span className="hidden md:inline">다음:</span> {nextTab.label}
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab Page Content */}
        <div key={activeTab} className="animate-fadeIn">
          {renderActiveTabContent()}
        </div>

        {/* Bottom Pagination Bar for non-home pages */}
        {activeTab !== 'home' && (
          <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 px-4 transition-colors duration-200">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              {prevTab ? (
                <button
                  onClick={() => navigateToTab(prevTab.id)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium transition-all hover:scale-[1.01] border border-slate-200 dark:border-transparent"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>이전 탭: {prevTab.label}</span>
                </button>
              ) : (
                <div className="hidden sm:block" />
              )}

              <button
                onClick={() => navigateToTab('home')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 transition-all hover:scale-[1.01]"
              >
                <Layers className="w-4 h-4 text-sky-500" />
                <span>전체 17대 모듈 홈으로</span>
              </button>

              {nextTab ? (
                <button
                  onClick={() => navigateToTab(nextTab.id)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-sky-600/25 transition-all hover:scale-[1.01]"
                >
                  <span>다음 탭: {nextTab.label}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="hidden sm:block" />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
