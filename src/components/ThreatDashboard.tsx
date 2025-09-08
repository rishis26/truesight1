import React, { useState } from 'react';
import { ThreatAnalysis } from '../types/threat';
import { KpiCard } from './ui/KpiCard';
import { GlassCard } from './ui/GlassCard';
import { ExportButton } from './ExportButton';

interface ThreatDashboardProps {
  analyses: ThreatAnalysis[];
}

export function ThreatDashboard({ analyses }: ThreatDashboardProps) {
  const [selectedAnalysis, setSelectedAnalysis] = useState<ThreatAnalysis | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8); // Sized for 1366×768 without vertical scroll

  const stats = {
    total: analyses.length,
    genuine: analyses.filter(a => a.classification === 'genuine').length,
    hoax: analyses.filter(a => a.classification === 'hoax').length,
    uncertain: analyses.filter(a => a.classification === 'uncertain').length,
    avgConfidence: analyses.length > 0 
      ? Math.round(analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length)
      : 0
  };

  // IP Geo Metadata rollups (if present on any analyses)
  const ipFlags = analyses.reduce((acc, a) => {
    const g: any = (a as any).metadata?.ipGeolocation;
    if (!g) return acc;
    return {
      any: true,
      proxy: acc.proxy || !!g.proxy,
      mobile: acc.mobile || !!g.mobile,
      hosting: acc.hosting || !!g.hosting
    };
  }, { any: false, proxy: false, mobile: false, hosting: false });

  // Severity distribution
  const severityDistribution = {
    critical: analyses.filter(a => a.threatLevel === 'critical').length,
    high: analyses.filter(a => a.threatLevel === 'high').length,
    medium: analyses.filter(a => a.threatLevel === 'medium').length,
    low: analyses.filter(a => a.threatLevel === 'low').length
  };

  // Source breakdown
  const sourceBreakdown = {
    text: analyses.filter(a => a.metadata.source === 'text').length,
    email: analyses.filter(a => a.metadata.source === 'email').length,
    audio: analyses.filter(a => a.metadata.source === 'audio').length,
    document: analyses.filter(a => a.metadata.source === 'document').length
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'email': return <span className="h-4 w-4">📧</span>;
      case 'audio': return <span className="h-4 w-4">🎧</span>;
      case 'document': return <span className="h-4 w-4">📄</span>;
      default: return <span className="h-4 w-4">📄</span>;
    }
  };

  // Extract location data from analyses
  const extractLocationData = (analysis: ThreatAnalysis) => {
    if (!analysis || !analysis.summary) return [];
    
    const locations = [];
    // Handle case where summary might be an array or other type
    const summaryText = Array.isArray(analysis.summary) 
      ? analysis.summary.join(' ') 
      : String(analysis.summary);
    const summary = summaryText.toLowerCase();
    
    // Look for coordinates in the summary text
    const coordPattern = /(\d+\.\d+)[°\s]*[NS]?[,\s]+(\d+\.\d+)[°\s]*[EW]?/g;
    const timePattern = /(\d{1,2}):(\d{2})/g;
    
    let match;
    let locationIndex = 0;
    
    while ((match = coordPattern.exec(summary)) !== null) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      
      // Extract location name from context around coordinates
      const contextStart = Math.max(0, match.index - 100);
      const contextEnd = Math.min(summary.length, match.index + 100);
      const context = summary.substring(contextStart, contextEnd);
      
      // Look for location names near coordinates
      let locationName = `Location ${locationIndex + 1}`;
      if (context.includes('taj mahal')) locationName = 'Taj Mahal Palace Hotel, Mumbai';
      else if (context.includes('gateway')) locationName = 'Gateway of India, Mumbai';
      else if (context.includes('phoenix') || context.includes('marketcity')) locationName = 'Phoenix MarketCity Mall, Mumbai';
      else if (context.includes('bse') || context.includes('dalal')) locationName = 'BSE Building, Dalal Street';
      else if (context.includes('basement') || context.includes('parking')) locationName = 'Hotel Basement Parking';
      
      // Extract time if available
      const timeMatch = timePattern.exec(context);
      const time = timeMatch ? `${timeMatch[1]}:${timeMatch[2]}` : undefined;
      
      // Determine risk score based on analysis confidence and threat level
      let riskScore = analysis.confidence;
      if (analysis.threatLevel === 'critical') riskScore = Math.max(riskScore, 90);
      else if (analysis.threatLevel === 'high') riskScore = Math.max(riskScore, 70);
      else if (analysis.threatLevel === 'medium') riskScore = Math.max(riskScore, 50);
      else if (analysis.threatLevel === 'low') riskScore = Math.max(riskScore, 30);
      
      locations.push({
        location: locationName,
        coordinates: { lat, lng },
        placeType: context.includes('hotel') ? 'hospitality' : 
                  context.includes('mall') ? 'commercial' :
                  context.includes('monument') ? 'monument' :
                  context.includes('parking') ? 'parking' : 'unknown',
        riskScore: Math.min(100, riskScore),
        time: time,
        interpretation: `Risk level: ${analysis.threatLevel} - ${summaryText.substring(0, 100)}...`
      });
      
      locationIndex++;
    }
    
    return locations;
  };

  // Get all location data from analyses
  const allLocationData = analyses
    .map(analysis => extractLocationData(analysis))
    .flat()
    .filter(Boolean);

  // Add some test location data if none found (for demonstration)
  if (allLocationData.length === 0 && analyses.length > 0) {
    allLocationData.push({
      location: 'Test Location - Mumbai',
      coordinates: { lat: 19.0760, lng: 72.8777 },
      placeType: 'commercial',
      riskScore: 85,
      time: '14:30',
      interpretation: 'Test location for demonstration purposes'
    });
  }

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700';
      case 'high': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700';
      case 'low': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700';
      default: return 'bg-gray-100 dark:bg-gray-800/30 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700';
    }
  };

  // Pagination
  const totalPages = Math.ceil(analyses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAnalyses = analyses.slice(startIndex, endIndex);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4 sm:space-y-8">
      {/* Header */}
      <GlassCard variant="medium" elevation={2} className="p-4 sm:p-8" glow={true}>
        <div className="text-center">
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">Threat Analysis Dashboard</h2>
          <p className="text-base sm:text-xl text-gray-600 dark:text-gray-300">Real-time monitoring and analysis of potential threats</p>
        </div>
      </GlassCard>

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8">
        <KpiCard
          title="Total Analyzed"
          value={stats.total}
          icon="🛡️"
          color="blue"
          description="Total number of analyses performed"
        />
        <KpiCard
          title="Genuine Threats"
          value={stats.genuine}
          icon="⚠️"
          color="red"
          description="Confirmed genuine threats detected"
        />
        <KpiCard
          title="Hoaxes Detected"
          value={stats.hoax}
          icon="⚠️"
          color="orange"
          description="Count of identified hoax reports"
        />
        <KpiCard
          title="Avg Confidence"
          value={`${stats.avgConfidence}%`}
          icon="📈"
          color="blue"
          description="Average confidence across all analyses"
        />
      </div>

      {/* Location Heatmap removed as requested */}

      {/* Row 2: Severity Distribution and Source Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-8">
        {/* Severity Distribution */}
        <GlassCard variant="medium" elevation={2} className="p-4 sm:p-6" glow={true}>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">Severity Distribution</h3>
          <div className="space-y-3 sm:space-y-4">
            {Object.entries(severityDistribution).map(([level, count]) => (
              <div key={level} className="flex items-center justify-between p-2 sm:p-3 hover:bg-white/30 dark:hover:bg-gray-800/30 rounded-lg transition-colors duration-200">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <span className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${
                    level === 'critical' ? 'bg-red-500' :
                    level === 'high' ? 'bg-orange-500' :
                    level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <span className="text-xs sm:text-sm font-medium capitalize text-gray-900 dark:text-white">{level}</span>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <div className="w-20 sm:w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
                    <div
                      className={`h-1.5 sm:h-2 rounded-full transition-all duration-500 ${
                        level === 'critical' ? 'bg-red-500' :
                        level === 'high' ? 'bg-orange-500' :
                        level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 w-6 sm:w-8 text-right font-medium">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Source Breakdown */}
        <GlassCard variant="medium" elevation={2} className="p-4 sm:p-6" glow={true}>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">Source Breakdown</h3>
          <div className="space-y-3 sm:space-y-4">
            {Object.entries(sourceBreakdown).map(([source, count]) => (
              <div key={source} className="flex items-center justify-between p-2 sm:p-3 hover:bg-white/30 dark:hover:bg-gray-800/30 rounded-lg transition-colors duration-200">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  {getSourceIcon(source)}
                  <span className="text-xs sm:text-sm font-medium capitalize text-gray-900 dark:text-white">{source}</span>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <div className="w-20 sm:w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
                    <div
                      className="h-1.5 sm:h-2 rounded-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 w-6 sm:w-8 text-right font-medium">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Row 2.5: IP Geolocation Signals (if any) */}
      {/* Removed IP Geolocation Signals section as requested */}

      {/* Row 3: Recent Analyses Table */}
      {analyses.length > 0 && (
        <GlassCard variant="medium" elevation={2} className="overflow-hidden" glow={true}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Analysis</h3>
          </div>
          
          {/* Sticky Header */}
          <div className="sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 z-10">
            <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-gray-700 dark:text-gray-300">
              <div className="col-span-3">Classification</div>
              <div className="col-span-2">Source</div>
              <div className="col-span-2">Threat Level</div>
              <div className="col-span-2">Confidence</div>
              <div className="col-span-2">Timestamp</div>
              <div className="col-span-1">Actions</div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {currentAnalyses.map((analysis) => (
              <div 
                key={analysis.id}
                className="grid grid-cols-12 gap-4 p-4 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-200"
              >
                <div className="col-span-3">
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      analysis.classification === 'genuine' 
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' 
                        : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                    }`}>
                      {analysis.classification}
                    </span>
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center space-x-2">
                    {getSourceIcon(analysis.metadata.source)}
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{analysis.metadata.source}</span>
                  </div>
                </div>
                <div className="col-span-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getThreatColor(analysis.threatLevel)}`}>
                    {analysis.threatLevel.toUpperCase()}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{analysis.confidence}%</span>
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(analysis.metadata.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="col-span-1">
                  <button
                    onClick={() => setSelectedAnalysis(analysis)}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm font-medium focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-lg px-3 py-1 hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-all duration-200"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {startIndex + 1}-{Math.min(endIndex, analyses.length)} of {analyses.length} results
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-white dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-white dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </GlassCard>
      )}

      {/* Detailed Analysis Modal */}
      {selectedAnalysis && (
        <div className="fixed inset-0 bg-white/10 dark:bg-white/10 backdrop-blur-xl [background-image:radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.12),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(56,189,248,0.12),transparent_40%)] flex items-center justify-center p-4 z-50">
          <GlassCard variant="glass" elevation={3} className="max-w-4xl w-full max-h-[90vh] overflow-y-auto" glow={true}>
            {/* Enhanced Header with Back Button and Actions */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-gray-800/50 dark:to-gray-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setSelectedAnalysis(null)}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 group"
                  >
                    <span className="h-5 w-5 group-hover:scale-110 transition-transform">←</span>
                    <span className="text-sm font-medium">Back to Dashboard</span>
                  </button>
                  <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Detailed Analysis
                  </h3>
                </div>
                <div className="flex items-center space-x-3">
                  <ExportButton analysis={selectedAnalysis} inputText={selectedAnalysis.metadata.inputText || 'N/A'} />
                  <button
                    onClick={() => setSelectedAnalysis(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                  >
                    <span className="h-6 w-6">✖️</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-8">
              {/* Enhanced Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">Classification</p>
                  <p className="text-xl font-bold capitalize text-blue-900 dark:text-blue-100">{selectedAnalysis.classification}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl border border-green-200 dark:border-green-700">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">Confidence</p>
                  <p className="text-xl font-bold text-green-900 dark:text-green-100">{selectedAnalysis.confidence}%</p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-xl border border-red-200 dark:border-red-700">
                  <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Threat Level</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold border ${getThreatColor(selectedAnalysis.threatLevel)}`}>
                    {selectedAnalysis.threatLevel.toUpperCase()}
                  </span>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl border border-purple-200 dark:border-purple-700">
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">Source</p>
                  <div className="flex items-center space-x-2">
                    {getSourceIcon(selectedAnalysis.metadata.source)}
                    <span className="capitalize text-purple-900 dark:text-purple-100 font-semibold">{selectedAnalysis.metadata.source}</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Summary */}
              <div className="bg-gradient-to-br from-white/90 via-blue-50/30 to-purple-50/20 dark:from-gray-800/20 dark:via-gray-800/10 dark:to-gray-900/30 backdrop-blur-[8px] border border-gray-200/60 dark:border-gray-600/30 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center">
                  <span className="mr-2">📋</span>
                  Analysis Summary
                </h4>
                <div className="text-base text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-line font-medium">
                  {selectedAnalysis.summary}
                </div>
              </div>

              {/* Enhanced Analysis Factors */}
              {selectedAnalysis.reasons.length > 0 && (
                <div className="bg-gradient-to-br from-white/90 via-amber-50/30 to-orange-50/20 dark:from-gray-800/20 dark:via-gray-800/10 dark:to-gray-900/30 backdrop-blur-[8px] border border-gray-200/60 dark:border-gray-600/30 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent flex items-center">
                    <span className="mr-2">🔍</span>
                    Analysis Factors
                  </h4>
                  <ul className="space-y-3">
                    {selectedAnalysis.reasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start space-x-3 p-3 hover:bg-white/50 dark:hover:bg-gray-800/30 rounded-lg transition-all duration-200 group">
                        <span className="w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mt-2 flex-shrink-0 group-hover:scale-125 transition-transform" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Enhanced Recommended Actions */}
              {selectedAnalysis.recommendations.length > 0 && (
                <div className="bg-gradient-to-br from-white/90 via-emerald-50/30 to-teal-50/20 dark:from-gray-800/20 dark:via-gray-800/10 dark:to-gray-900/30 backdrop-blur-[8px] border border-gray-200/60 dark:border-gray-600/30 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center">
                    <span className="mr-2">✅</span>
                    Recommended Actions
                  </h4>
                  <ul className="space-y-3">
                    {selectedAnalysis.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start space-x-3 p-3 hover:bg-white/50 dark:hover:bg-gray-800/30 rounded-lg transition-all duration-200 group">
                        <span className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full mt-2 flex-shrink-0 group-hover:scale-125 transition-transform" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}