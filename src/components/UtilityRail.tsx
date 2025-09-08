import React from 'react';
import { ThreatAnalysis } from '../types/threat';
import { GlassCard } from './ui/GlassCard';

interface UtilityRailProps {
  analyses: ThreatAnalysis[];
  activeTab: 'text' | 'files' | 'dashboard';
}

export function UtilityRail({ analyses, activeTab }: UtilityRailProps) {
  const recentAnalyses = analyses.slice(-5).reverse();
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const openHelp = () => window.open('https://support.google.com/maps/answer/144349?hl=en', '_blank');
  
  const getTips = () => {
    switch (activeTab) {
      case 'text':
        return [
          'Use Ctrl+Enter to quickly analyze text',
          'Longer text provides better analysis accuracy',
          'Check for specific threats, locations, and timing',
          'Review confidence scores and recommendations'
        ];
      case 'files':
        return [
          'Supported: .eml, .wav, .mp3, .pdf, .docx',
          'Max file size: 50MB per file',
          'Process up to 10 files simultaneously',
          'Audio files are transcribed automatically'
        ];
      case 'dashboard':
        return [
          'Monitor threat trends over time',
          'Click any analysis for detailed breakdown',
          'Track confidence score improvements',
          'Review recommended actions'
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Tips Section */}
      <GlassCard variant="medium" elevation={2} className="p-4 sm:p-6 group hover:scale-[1.02] transition-all duration-300 ease-out" glow={true}>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <span className="text-xl sm:text-2xl transform group-hover:rotate-12 transition-transform duration-300">💡</span>
            <h3 className="text-lg sm:text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">Tips</h3>
          </div>
          <ul className="space-y-2 sm:space-y-3">
            {getTips().map((tip, index) => (
              <li 
                key={index} 
                className="text-sm sm:text-sm text-gray-700 dark:text-gray-200 flex items-start leading-relaxed p-2 rounded-lg hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-200 ease-out transform hover:translate-x-1"
              >
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0 animate-pulse" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </GlassCard>

      {/* Limits Section */}
      <GlassCard variant="medium" elevation={2} className="p-4 sm:p-6 group hover:scale-[1.02] transition-all duration-300 ease-out" glow={true}>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <span className="text-xl sm:text-2xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">⚡</span>
            <h3 className="text-lg sm:text-lg font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">Limits</h3>
          </div>
          <div className="space-y-2 sm:space-y-3 text-sm sm:text-sm">
            {[
              { label: 'Max file size:', value: '50MB', icon: '📁' },
              { label: 'Max files:', value: '10', icon: '📊' }
            ].map((item, index) => (
              <div 
                key={index}
                className="flex justify-between items-center py-2 sm:py-3 px-2 sm:px-3 border-b border-gray-200 dark:border-gray-700 hover:bg-white/20 dark:hover:bg-gray-800/20 rounded-lg transition-all duration-200 ease-out transform hover:scale-[1.02] group/item"
              >
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <span className="text-xs sm:text-sm opacity-60 group-hover/item:opacity-100 transition-opacity duration-200">{item.icon}</span>
                  <span className="text-gray-700 dark:text-gray-200 group-hover/item:text-gray-900 dark:group-hover/item:text-white transition-colors duration-200">{item.label}</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors duration-200">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Recent Runs */}
      {recentAnalyses.length > 0 && (
        <GlassCard variant="medium" elevation={2} className="p-6 group hover:scale-[1.02] transition-all duration-300 ease-out" glow={true}>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl transform group-hover:rotate-180 transition-transform duration-500">🕒</span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">Recent Runs</h3>
            </div>
            <div className="space-y-3">
              {recentAnalyses.map((analysis, index) => (
                <div 
                  key={analysis.id} 
                  className="p-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-[4px] rounded-xl border border-white/30 dark:border-gray-600/30 hover:bg-white/70 dark:hover:bg-gray-800/70 hover:border-gray-300/50 dark:hover:border-gray-500/50 transition-all duration-300 ease-out transform hover:scale-[1.03] hover:shadow-lg cursor-pointer group/item"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 transform group-hover/item:scale-105 ${
                      analysis.classification === 'genuine' 
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800/50' 
                        : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800/50'
                    }`}>
                      {analysis.classification}
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors duration-200">{analysis.confidence}%</span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 capitalize group-hover/item:text-gray-800 dark:group-hover/item:text-gray-200 transition-colors duration-200">
                    {analysis.metadata.source} • {analysis.threatLevel}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Quick Actions */}
      <GlassCard variant="medium" elevation={2} className="p-4 sm:p-6 group hover:scale-[1.02] transition-all duration-300 ease-out" glow={true}>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <span className="text-xl sm:text-2xl transform group-hover:scale-110 transition-transform duration-300">🚀</span>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <button
              onClick={scrollToTop}
              className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border border-gray-200/50 dark:border-gray-600/30 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-800/30 dark:hover:to-gray-700/30 transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-md active:scale-95 group/btn"
            >
              <div className="text-center space-y-1 sm:space-y-2">
                <span className="text-lg sm:text-xl block transform group-hover/btn:scale-110 group-hover/btn:rotate-6 transition-all duration-300">✨</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-200 group-hover/btn:text-gray-900 dark:group-hover/btn:text-white transition-colors duration-200">New Analysis</span>
              </div>
            </button>
            <button
              onClick={() => alert('History feature coming soon. Tip: export your results to keep a permanent record.')} 
              className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border border-gray-200/50 dark:border-gray-600/30 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-800/30 dark:hover:to-gray-700/30 transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-md active:scale-95 group/btn"
            >
              <div className="text-center space-y-1 sm:space-y-2">
                <span className="text-lg sm:text-xl block transform group-hover/btn:scale-110 group-hover/btn:rotate-6 transition-all duration-300">📚</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-200 group-hover/btn:text-gray-900 dark:group-hover/btn:text-white transition-colors duration-200">View History</span>
              </div>
            </button>
            <button
              onClick={() => alert('Settings panel coming soon. For now, theme toggles are available in the header.')} 
              className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border border-gray-200/50 dark:border-gray-600/30 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-800/30 dark:hover:to-gray-700/30 transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-md active:scale-95 group/btn"
            >
              <div className="text-center space-y-1 sm:space-y-2">
                <span className="text-lg sm:text-xl block transform group-hover/btn:scale-110 group-hover/btn:rotate-6 transition-all duration-300">⚙️</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-200 group-hover/btn:text-gray-900 dark:group-hover/btn:text-white transition-colors duration-200">Settings</span>
              </div>
            </button>
            <button
              onClick={openHelp}
              className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border border-gray-200/50 dark:border-gray-600/30 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-800/30 dark:hover:to-gray-700/30 transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-md active:scale-95 group/btn"
            >
              <div className="text-center space-y-1 sm:space-y-2">
                <span className="text-lg sm:text-xl block transform group-hover/btn:scale-110 group-hover/btn:rotate-6 transition-all duration-300">❓</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-200 group-hover/btn:text-gray-900 dark:group-hover/btn:text-white transition-colors duration-200">Help</span>
              </div>
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}


