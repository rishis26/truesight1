import React, { useEffect, useRef, useState } from 'react';
import { ThreatAnalysis } from '../types/threat';
import { aiAnalysisService } from '../services/aiAnalysis';
import { GlassCard } from './ui/GlassCard';
import { ConfidenceMeter } from './ui/ConfidenceMeter';
import { Chip } from './ui/Chip';
import { ShortcutsPopover } from './ui/ShortcutsPopover';
import { ExportButton } from './ExportButton';
import IPGeolocation from './IPGeolocation.jsx';

interface TextAnalyzerProps {
  onAnalysisComplete: (analysis: ThreatAnalysis) => void;
}

export function TextAnalyzer({ onAnalysisComplete }: TextAnalyzerProps) {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ThreatAnalysis | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const [ipGeo, setIpGeo] = useState<any | null>(null);
  const ipGeoRef = useRef<any>(null);

  const resizeTextArea = () => {
    const el = textAreaRef.current;
    if (!el) return;
    const maxPx = Math.round(window.innerHeight * 0.6);
    el.style.height = 'auto';
    const next = Math.min(el.scrollHeight, maxPx);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > maxPx ? 'auto' : 'hidden';
  };

  useEffect(() => {
    resizeTextArea();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const analysis = await aiAnalysisService.analyzeText(text, { source: 'text' });
      setResult(analysis);
      onAnalysisComplete(analysis);
    } catch (err) {
      console.error('Analysis error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setText('');
    setResult(null);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleAnalyze();
    } else if (e.key === 'Escape') {
      handleClear();
    }
  };

  const shortcuts = [
    { key: 'Ctrl/Cmd + Enter', description: 'Analyze text' },
    { key: 'Esc', description: 'Clear text' },
    { key: 'Alt + R', description: 'Focus results' }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <GlassCard variant="medium" elevation={2} className="p-4 sm:p-8 transform transition-all duration-1000 ease-out animate-in slide-in-from-bottom-8 fade-in" glow={true}>
        <div className="space-y-4 sm:space-y-6">
          <div className="relative">
            <div className="text-center space-y-2">
              <h1 className="text-3xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Text Analysis</h1>
              <p className="text-lg sm:text-lg text-gray-600 dark:text-gray-300">Analyze text for threat indicators</p>
            </div>
            <div className="absolute top-0 right-0">
              <ShortcutsPopover shortcuts={shortcuts} />
            </div>
          </div>

          <div className="space-y-4">
            <label htmlFor="text-input" className="block text-lg sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
              Enter text to analyze
            </label>
            <textarea
              id="text-input"
              ref={textAreaRef}
              value={text}
              onChange={(e) => { setText(e.target.value); resizeTextArea(); }}
              onKeyDown={handleKeyDown}
              placeholder="Paste email content, message text, or suspicious communication here..."
              className="w-full min-h-32 sm:min-h-48 max-h-[60vh] px-3 sm:px-4 py-2.5 sm:py-3 text-gray-900 dark:text-gray-100 bg-white/90 dark:bg-gray-800/90 backdrop-blur-[8px] border border-gray-300 dark:border-gray-600 rounded-xl resize-none transition-all duration-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 placeholder-gray-600 dark:placeholder-gray-400 text-base sm:text-base overflow-hidden no-scrollbar"
            />
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm sm:text-sm space-y-1 sm:space-y-0">
              <span className="text-gray-700 dark:text-gray-200 font-medium">{text.length} characters</span>
              <span className="text-gray-600 dark:text-gray-300">Longer text provides better accuracy</span>
            </div>
            
            {/* IP Geolocation (Optional) */}
            <IPGeolocation ref={ipGeoRef} onResult={(data: any) => setIpGeo(data)} />

            <div className="flex flex-col space-y-4 pt-2">
              <div className="flex justify-center">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAnalyze();
                      try { ipGeoRef.current?.locateIfValid?.(); } catch {}
                    }}
                    disabled={!text.trim() || isAnalyzing}
                    className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl active:scale-95 focus:ring-4 focus:ring-emerald-500/50 focus:ring-offset-2 text-lg shadow-lg"
                  >
                    <span className="relative z-10 flex items-center">
                      {isAnalyzing ? (
                        <>
                          <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-3" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <span className="mr-3 text-xl group-hover:rotate-12 transition-transform duration-300">🔍</span>
                          Analyze Text
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-2xl blur opacity-0 group-hover:opacity-25 transition-opacity duration-300"></div>
                  </button>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClear();
                    }}
                    className="px-6 py-4 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 font-semibold rounded-2xl transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:shadow-lg border border-gray-200 dark:border-gray-600"
                  >
                    Clear
                  </button>
                </div>
              </div>
              
              <div className="flex justify-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Ctrl+Enter to analyze</span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {error && (
        <GlassCard variant="low" elevation={1} className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20">
          <div className="flex items-center justify-between p-4">
            <span className="text-red-700 dark:text-red-300 font-medium">{error}</span>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">×</button>
          </div>
        </GlassCard>
      )}

      {result && (
        <GlassCard variant="high" elevation={3} className="p-4 sm:p-8" glow={true}>
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-2xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Analysis Results</h2>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 flex-1">
                <Chip label="Classification" variant="classification" value={result.classification} />
                <Chip label="Threat Level" variant="threat" value={result.threatLevel} />
              </div>
              <ExportButton analysis={result} inputText={text} ipGeolocation={ipGeo} />
            </div>
            
            {/* Summary Section */}
            <div className="bg-gradient-to-br from-white/90 via-blue-50/30 to-purple-50/20 dark:from-gray-800/20 dark:via-gray-800/10 dark:to-gray-900/30 backdrop-blur-[8px] border border-gray-200/60 dark:border-gray-600/30 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-lg sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Summary</h3>
              <div className="text-base sm:text-base text-gray-700 dark:text-gray-200 leading-relaxed font-medium whitespace-pre-line">
                {result.summary}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-white/90 via-amber-50/30 to-orange-50/20 dark:from-gray-800/20 dark:via-gray-800/10 dark:to-gray-900/30 backdrop-blur-[8px] border border-gray-200/60 dark:border-gray-600/30 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <ConfidenceMeter confidence={result.confidence} />
            </div>

            {/* More details - dimensions */}
            <div className="bg-gradient-to-br from-white/90 via-emerald-50/30 to-teal-50/20 dark:from-gray-800/20 dark:via-gray-800/10 dark:to-gray-900/30 backdrop-blur-[8px] border border-gray-200/60 dark:border-gray-600/30 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <button
                onClick={() => setShowDetails(v => !v)}
                className="w-full flex items-center justify-between px-4 sm:px-6 py-3 text-left"
              >
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">More details</span>
                <span className="text-gray-600 dark:text-gray-300 font-medium">{showDetails ? 'Hide' : 'Show'}</span>
              </button>
              {showDetails && result.dimensions && (
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {Object.entries(result.dimensions).map(([key, value], index) => (
                    <div key={key} className="group p-4 rounded-xl border border-gray-200/60 dark:border-gray-600/30 bg-gradient-to-br from-white/90 to-gray-50/80 dark:from-gray-800/20 dark:to-gray-900/30 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 hover:-translate-y-1" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 capitalize group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{key.replace(/_/g,' ')}</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{value}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 via-orange-500 to-red-500 shadow-sm transition-all duration-700 ease-out" style={{ width: `${value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-lg sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Key Indicators</h3>
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {result.reasons.map((reason: string, index: number) => (
                  <div key={index} className="group flex items-start space-x-3 p-4 bg-gradient-to-r from-white/70 to-gray-50/50 dark:from-gray-800/20 dark:to-gray-900/30 backdrop-blur-[4px] border border-gray-200/60 dark:border-gray-600/30 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]" style={{ animationDelay: `${index * 100}ms` }}>
                    <span className="text-blue-500 dark:text-blue-400 mt-1 font-bold group-hover:scale-110 transition-transform">•</span>
                    <span className="text-base sm:text-base text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}