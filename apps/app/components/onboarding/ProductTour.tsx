'use client';

import { useEffect } from 'react';
import introJs from 'intro.js';
import 'intro.js/introjs.css';

interface TourStep {
  element?: string;
  title?: string;
  intro: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface ProductTourProps {
  steps?: TourStep[];
  autoStart?: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
}

const defaultSteps: TourStep[] = [
  {
    title: 'Welcome to Meterr! 🚀',
    intro: 'Let\'s take a quick tour to help you save money on AI costs.',
  },
  {
    element: '.cost-dashboard',
    title: 'Real-Time Cost Tracking',
    intro: 'Monitor your AI spending across all providers in real-time. No more surprise bills!',
    position: 'bottom'
  },
  {
    element: '.quick-wins',
    title: 'Quick Win Detection',
    intro: 'We automatically identify opportunities to reduce costs without impacting performance.',
    position: 'right'
  },
  {
    element: '.model-comparison',
    title: 'Model Comparison',
    intro: 'Compare costs across different models to find the best value for your use case.',
    position: 'left'
  },
  {
    element: '.usage-alerts',
    title: 'Smart Alerts',
    intro: 'Get notified instantly when costs spike or approach budget limits.',
    position: 'top'
  },
  {
    element: '.export-reports',
    title: 'Export & Share',
    intro: 'Generate detailed reports for your team or finance department.',
    position: 'bottom'
  },
  {
    title: 'You\'re All Set! 🎉',
    intro: 'Start tracking your AI costs and saving money today. Need help? Click the help button anytime.',
  }
];

export function ProductTour({ 
  steps = defaultSteps, 
  autoStart = false,
  onComplete,
  onSkip
}: ProductTourProps) {
  
  useEffect(() => {
    if (autoStart) {
      startTour();
    }
  }, [autoStart]);

  const startTour = () => {
    const tour = introJs();
    
    tour.setOptions({
      steps: steps.map(step => ({
        ...step,
        element: step.element ? document.querySelector(step.element) : undefined,
      })),
      showProgress: true,
      showBullets: true,
      exitOnOverlayClick: false,
      exitOnEsc: true,
      nextLabel: 'Next →',
      prevLabel: '← Back',
      skipLabel: 'Skip',
      doneLabel: 'Get Started',
      tooltipClass: 'customTooltip',
      highlightClass: 'customHighlight',
      disableInteraction: false,
      showStepNumbers: true,
    });

    tour.oncomplete(() => {
      localStorage.setItem('meterr_tour_completed', 'true');
      onComplete?.();
    });

    tour.onexit(() => {
      onSkip?.();
    });

    tour.start();
    
    return tour;
  };

  return null;
}

export function TourTriggerButton() {
  const handleStartTour = () => {
    const tour = introJs();
    
    tour.setOptions({
      steps: defaultSteps.map(step => ({
        ...step,
        element: step.element ? document.querySelector(step.element) : undefined,
      })),
      showProgress: true,
      showBullets: true,
    });
    
    tour.start();
  };

  return (
    <button
      onClick={handleStartTour}
      className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Take Tour
    </button>
  );
}

export function useProductTour() {
  const hasCompletedTour = () => {
    return localStorage.getItem('meterr_tour_completed') === 'true';
  };

  const resetTour = () => {
    localStorage.removeItem('meterr_tour_completed');
  };

  const startTour = (customSteps?: TourStep[]) => {
    const tour = introJs();
    
    tour.setOptions({
      steps: (customSteps || defaultSteps).map(step => ({
        ...step,
        element: step.element ? document.querySelector(step.element) : undefined,
      })),
    });
    
    tour.start();
    return tour;
  };

  return {
    hasCompletedTour,
    resetTour,
    startTour,
  };
}