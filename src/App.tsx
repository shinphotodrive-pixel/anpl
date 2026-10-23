/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SimulatorView } from './components/Simulator/SimulatorView';
import { SolutionsView } from './components/Solutions/SolutionsView';
import { ChallengeMatrix } from './components/ChallengeMatrix';
import { PipelineVisualizer } from './components/PipelineVisualizer';
import { RoiCalculator } from './components/RoiCalculator';
import { Footer } from './components/Footer';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('simulator');

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Sticky Header Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-grow">
        {/* Hero Section */}
        <Hero
          onScrollToSimulator={() => scrollToSection('simulator')}
          onScrollToSolutions={() => scrollToSection('solutions')}
        />

        {/* 1. Interactive Augmentation Simulator */}
        <SimulatorView />

        {/* 2. 4 Core Production Strategies */}
        <SolutionsView />

        {/* 3. ALPR Dataset Challenge Matrix */}
        <ChallengeMatrix />

        {/* 4. End-to-End MLOps Pipeline Visualizer */}
        <PipelineVisualizer />

        {/* 5. Dataset ROI & Cost Feasibility Calculator */}
        <RoiCalculator />
      </main>

      {/* Production Footer */}
      <Footer />
    </div>
  );
}
