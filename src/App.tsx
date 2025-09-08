import React from 'react';
import { useState } from 'react';
import { TextAnalyzer } from './components/TextAnalyzer';
import { FileUpload } from './components/FileUpload';
import { ThreatDashboard } from './components/ThreatDashboard';
import { UtilityRail } from './components/UtilityRail';
import { ThreatAnalysis } from './types/threat';
import { GlassCard } from './components/ui/GlassCard';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { ThemeToggle } from './components/ui/ThemeToggle';
import { LogoSimple } from './components/ui/Logo';
// import { ConfigPanel } from './components/ConfigPanel';

function AppContent() {
  const [activeTab, setActiveTab] = useState<'text' | 'files' | 'dashboard'>('text');
  const [analyses, setAnalyses] = useState<ThreatAnalysis[]>([]);
  const { isDark } = useTheme();
  const [prevTab, setPrevTab] = useState<'text' | 'files' | 'dashboard'>('text');
  const [hasMounted, setHasMounted] = useState(false);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleAnalysisComplete = (analysis: ThreatAnalysis) => {
    console.log('Analysis completed:', analysis);
    setAnalyses(prev => [...prev, analysis]);
  };

  const tabs = [
    { id: 'text' as const, label: 'Text Analysis', icon: () => <span className="h-5 w-5 text-gray-500 dark:text-gray-400">⌨</span> },
    { id: 'files' as const, label: 'File Upload', icon: () => <span className="h-5 w-5 text-gray-500 dark:text-gray-400">📁</span> },
    { id: 'dashboard' as const, label: 'Dashboard', icon: () => <span className="h-5 w-5 text-gray-500 dark:text-gray-400">📊</span> }
  ];

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-500 motion-safe:animate-page-enter ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100'
    }`}>
      {/* Glass Header */}
      <GlassCard variant="medium" elevation={2} className="border-0 rounded-none shadow-none motion-safe:animate-fade-in" glow={true}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="hidden sm:block">
                <LogoSimple size="lg" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  trueSight
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                  Advanced Threat Detection & Analysis
                </p>
              </div>
              <div className="sm:hidden flex items-center space-x-2">
                <img 
                  src="/logo/logo.png" 
                  alt="trueSight Logo"
                  className="h-8 w-auto object-contain"
                />
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  trueSight
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 sm:space-x-6">
              <div className="hidden sm:flex items-center space-x-3 px-4 py-2 bg-white/20 dark:bg-gray-800/20 backdrop-blur-[8px] rounded-xl border border-white/30 dark:border-gray-600/30">
                <span className="text-sm text-gray-800 dark:text-gray-100 leading-relaxed font-medium">
                  {analyses.length} analyses completed
                </span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </div>
              <div className="sm:hidden flex items-center space-x-2 px-3 py-1.5 bg-white/20 dark:bg-gray-800/20 backdrop-blur-[8px] rounded-lg border border-white/30 dark:border-gray-600/30">
                <span className="text-xs text-gray-800 dark:text-gray-100 font-medium">
                  {analyses.length}
                </span>
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Glass Navigation Tabs */}
      <GlassCard variant="low" elevation={1} className="border-0 rounded-none shadow-none border-t border-gray-200/50 dark:border-gray-700/50 motion-safe:animate-slide-in-up" glow={true}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-2 sm:space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon as any;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setPrevTab(activeTab);
                    setActiveTab(tab.id);
                  }}
                  className={`flex items-center space-x-2 sm:space-x-3 py-4 sm:py-5 px-4 sm:px-6 border-b-2 font-semibold text-sm sm:text-base transition-all duration-500 ease-out whitespace-nowrap transform hover:scale-110 hover:-translate-y-1 ${
                    activeTab === tab.id
                      ? 'border-gray-500 text-gray-900 dark:text-white scale-110 -translate-y-1 shadow-lg'
                      : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  <Icon />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </GlassCard>

      {/* Main Content with responsive layout */}
      <main className="flex-grow max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8">
          {/* Main content area - appears first on mobile, main area on desktop */}
          <div className="col-span-1 lg:col-span-9 order-1">
            <div className="relative overflow-hidden">
              {activeTab === 'text' && (
                <div className={`${hasMounted ? 'motion-safe:animate-slide-in-up lg:motion-safe:animate-tab-enter-left motion-safe:animate-fade-in' : ''}`}>
                  <TextAnalyzer onAnalysisComplete={handleAnalysisComplete} />
                </div>
              )}
              {activeTab === 'files' && (
                <div className={`${activeTab === 'files' && prevTab === 'text' ? 'lg:motion-safe:animate-tab-enter-right' : ''} ${activeTab === 'files' && prevTab === 'dashboard' ? 'lg:motion-safe:animate-tab-enter-left' : ''} motion-safe:animate-slide-in-up motion-safe:animate-fade-in`}>
                  <FileUpload onAnalysisComplete={handleAnalysisComplete} />
                </div>
              )}
              {activeTab === 'dashboard' && (
                <div className={`${activeTab === 'dashboard' ? 'lg:motion-safe:animate-tab-enter-right motion-safe:animate-slide-in-up motion-safe:animate-fade-in' : ''}`}>
                  <ThreatDashboard analyses={analyses} />
                </div>
              )}
            </div>
          </div>
          
          {/* Utility rail - appears second on mobile, sidebar on desktop */}
          <div className="col-span-1 lg:col-span-3 order-2">
            <UtilityRail analyses={analyses} activeTab={activeTab} />
          </div>
        </div>
      </main>

      {/* Glass Footer - Fixed positioning */}
      <footer className="mt-auto">
        <GlassCard variant="low" elevation={1} className="border-0 rounded-none shadow-none border-t border-gray-200/50 dark:border-gray-700/50" glow={true}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <p className="text-sm text-gray-800 dark:text-gray-100 leading-relaxed font-medium">
                © 2025 trueSight. AUTHORITY OF ACCURACY.
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                <span className="font-medium">Privacy Protected</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </footer>

      {/* Configuration Panel removed as requested */}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
