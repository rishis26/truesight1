import React, { useState, useRef, useEffect } from 'react';
import { ThreatAnalysis } from '../types/threat';
import { exportAndDownload, createExport } from '../services/auditExport';
import { useTheme } from '../contexts/ThemeContext';

interface ExportButtonProps {
  analysis: ThreatAnalysis;
  inputText: string;
  className?: string;
  ipGeolocation?: any | null;
}

export function ExportButton({ analysis, inputText, className = '', ipGeolocation = null }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [position, setPosition] = useState<'left' | 'center'>('center');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { isDark } = useTheme();

  const handleExport = async (format: 'json' | 'text' | 'csv' | 'pdf') => {
    setIsExporting(true);
    setShowFormatMenu(false);
    
    try {
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (format === 'pdf') {
        // For PDF, we need to open the HTML in a new window for printing
        const { data } = createExport(analysis.id, inputText, analysis, null, 'pdf');
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(data);
          newWindow.document.close();
          // Auto-trigger print dialog
          setTimeout(() => {
            newWindow.print();
          }, 500);
        }
      } else {
        const enriched = { ...analysis } as any;
        if (ipGeolocation) {
          enriched.metadata = { ...enriched.metadata, ipGeolocation };
        }
        exportAndDownload(
          analysis.id,
          inputText,
          enriched,
          null,
          format
        );
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'json': return '📄';
      case 'text': return '📝';
      case 'csv': return '📊';
      case 'pdf': return '📋';
      default: return '📁';
    }
  };

  const getFormatDescription = (format: string) => {
    switch (format) {
      case 'json': return 'Machine-readable data';
      case 'text': return 'Human-readable report';
      case 'csv': return 'Spreadsheet data';
      case 'pdf': return 'Professional document';
      default: return '';
    }
  };

  // Calculate position when opening dropdown
  useEffect(() => {
    if (showFormatMenu && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const isMobile = viewportWidth < 768; // sm breakpoint
      const dropdownWidth = isMobile ? 256 : 288; // w-64 = 16rem = 256px, w-72 = 18rem = 288px
      
      // For mobile, always use left alignment to prevent cutoff
      if (isMobile) {
        setPosition('left');
      } else {
        // For desktop, check if centered dropdown would fit
        const centerX = rect.left + (rect.width / 2);
        const dropdownLeft = centerX - (dropdownWidth / 2);
        const dropdownRight = centerX + (dropdownWidth / 2);
        
        if (dropdownLeft < 16 || dropdownRight > viewportWidth - 16) {
          setPosition('left');
        } else {
          setPosition('center');
        }
      }
    }
  }, [showFormatMenu]);

  // Reset position when closing
  useEffect(() => {
    if (!showFormatMenu) {
      setPosition('center'); // Reset to default
    }
  }, [showFormatMenu]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        onClick={() => setShowFormatMenu(!showFormatMenu)}
        disabled={isExporting}
        className={`group flex items-center space-x-3 px-5 py-3 font-semibold rounded-2xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl active:translate-y-0 active:shadow-lg disabled:scale-100 disabled:shadow-none backdrop-blur-[12px] border
          ${isDark
            ? 'bg-gradient-to-br from-slate-500/10 via-slate-600/5 to-slate-700/10 hover:from-slate-500/20 hover:via-slate-600/10 hover:to-slate-700/20 text-slate-100 border-slate-400/30 hover:border-slate-400/50'
            : 'bg-gradient-to-br from-white/70 via-white/60 to-white/70 hover:from-white/80 hover:via-white/70 hover:to-white/80 text-gray-900 border-white/60 shadow-[0_10px_25px_rgba(0,0,0,0.05)]'}
        `}
      >
        {isExporting ? (
          <>
            <span className={`animate-spin h-5 w-5 border-2 ${isDark ? 'border-slate-200' : 'border-gray-500'} border-t-transparent rounded-full`} />
            <span className="text-sm font-semibold tracking-wide">Exporting...</span>
          </>
        ) : (
          <>
            <span className="text-lg group-hover:rotate-12 transition-transform duration-300">📥</span>
            <span className="text-sm font-semibold tracking-wide">Export Analysis</span>
            <span className={`transform transition-transform duration-200 ${isDark ? 'text-slate-300' : 'text-gray-500'} ${showFormatMenu ? 'rotate-180' : ''}`}>▼</span>
          </>
        )}
      </button>

      {showFormatMenu && !isExporting && (
        <div className={`absolute top-full mt-3 w-64 sm:w-72 backdrop-blur-[16px] rounded-2xl shadow-2xl overflow-hidden z-50 ${
          position === 'left' 
            ? 'right-0' 
            : 'left-1/2 transform -translate-x-1/2'
        } ${isDark ? 'bg-gradient-to-br from-slate-800/95 via-slate-900/95 to-slate-800/95 border border-slate-600/30' : 'bg-gradient-to-br from-white/95 via-white/98 to-white/95 border border-white/60'}`}>
          <div className="p-3">
            <div className={`text-xs font-bold uppercase tracking-wider px-3 py-2 border-b ${isDark ? 'text-slate-300 border-slate-600/30' : 'text-gray-600 border-gray-200'}`}>
              Choose Export Format
            </div>
            
            {(['json', 'text', 'csv', 'pdf'] as const).map((format) => (
              <button
                key={format}
                onClick={() => handleExport(format)}
                className={`w-full flex items-center space-x-4 px-4 py-4 text-left transition-all duration-200 group/format rounded-xl ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-gray-100/70'}`}
              >
                <span className="text-xl group-hover/format:scale-110 transition-transform duration-200">
                  {getFormatIcon(format)}
                </span>
                <div className="flex-1">
                  <div className={`font-semibold capitalize tracking-wide ${isDark ? 'text-slate-100' : 'text-gray-800'}`}>
                    {format.toUpperCase()}
                  </div>
                  <div className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    {getFormatDescription(format)}
                  </div>
                </div>
                <span className={`${isDark ? 'text-slate-500 group-hover/format:text-slate-300' : 'text-gray-400 group-hover/format:text-gray-600'} transition-colors duration-200`}>
                  →
                </span>
              </button>
            ))}
          </div>
          
          <div className={`p-3 ${isDark ? 'border-t border-slate-600/30 bg-slate-800/30' : 'border-t border-gray-200 bg-gray-50/60'}`}>
            <div className={`text-xs text-center font-medium ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              Complete audit log with all analysis data
            </div>
          </div>
        </div>
      )}

      {/* Backdrop to close menu */}
      {showFormatMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowFormatMenu(false)}
        />
      )}
    </div>
  );
}

// Hook for programmatic export
export function useExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportAnalysis = async (
    analysis: ThreatAnalysis,
    inputText: string,
    format: 'json' | 'text' | 'csv' = 'json'
  ) => {
    setIsExporting(true);
    
    try {
      const { data, filename } = createExport(analysis.id, inputText, analysis, null, format);
      
      const mimeTypes = {
        json: 'application/json',
        text: 'text/plain',
        csv: 'text/csv'
      };
      
      const blob = new Blob([data], { type: mimeTypes[format] });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      return { success: true, filename };
    } catch (error) {
      console.error('Export failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setIsExporting(false);
    }
  };

  return { exportAnalysis, isExporting };
}
