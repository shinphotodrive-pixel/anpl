/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { LicensePlateDetectorSection } from './components/LicensePlateDetector/LicensePlateDetectorSection';
import { LightingDashboardSection } from './components/Lighting/LightingDashboardSection';
import { SimulatorView } from './components/Simulator/SimulatorView';
import { PresetLibrarySection } from './components/PresetLibrary/PresetLibrarySection';
import { TestBenchSection } from './components/TestBench/TestBenchSection';
import { SolutionsView } from './components/Solutions/SolutionsView';
import { ChallengeMatrix } from './components/ChallengeMatrix';
import { PipelineVisualizer } from './components/PipelineVisualizer';
import { RoiCalculator } from './components/RoiCalculator';
import { AugmentationParams, PlateType } from './types/alpr';
import { Footer } from './components/Footer';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('detector');

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

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleApplyPreset = (newParams: AugmentationParams, _plateType?: PlateType) => {
    setParams(newParams);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Sticky Header Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-grow">
        {/* Hero Section */}
        <Hero
          onScrollToDetector={() => scrollToSection('detector')}
          onScrollToLighting={() => scrollToSection('lighting')}
          onScrollToSimulator={() => scrollToSection('simulator')}
          onScrollToPresets={() => scrollToSection('presets')}
          onScrollToTestBench={() => scrollToSection('testbench')}
          onScrollToSolutions={() => scrollToSection('solutions')}
        />

        {/* 0. Dedicated License Plate Recognition Program (dataslayermedia/License-Plate-Detection) */}
        <LicensePlateDetectorSection />

        {/* 0.1 Dedicated Lighting & Optics Technical Analysis Dashboard ("조명") */}
        <LightingDashboardSection />

        {/* 1. Interactive Augmentation Simulator */}
        <SimulatorView sharedParams={params} setSharedParams={setParams} />

        {/* 2. Standard Environmental Preset Library */}
        <PresetLibrarySection currentParams={params} onApplyPreset={handleApplyPreset} />

        {/* 3. ALPR Recognition Testing & Benchmark Lab */}
        <TestBenchSection currentParams={params} />

        {/* 3. 4 Core Production Strategies */}
        <SolutionsView />

        {/* 4. ALPR Dataset Challenge Matrix */}
        <ChallengeMatrix />

        {/* 5. End-to-End MLOps Pipeline Visualizer */}
        <PipelineVisualizer />

        {/* 6. Dataset ROI & Cost Feasibility Calculator */}
        <RoiCalculator />
      </main>

      {/* Production Footer */}
      <Footer />
    </div>
  );
}
