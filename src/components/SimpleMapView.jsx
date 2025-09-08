import React from 'react';
import { GlassCard } from './ui/GlassCard';

const SimpleMapView = ({ heatmapData = [] }) => {
  // Filter valid data
  const validHeatmapData = heatmapData.filter(item => 
    item && 
    item.location && 
    item.coordinates && 
    typeof item.coordinates === 'object' &&
    typeof item.coordinates.lat === 'number' &&
    typeof item.coordinates.lng === 'number'
  );

  if (validHeatmapData.length === 0) {
    return (
      <GlassCard variant="medium" elevation={2} className="p-6" glow={true}>
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🗺️ Threat Location Heatmap
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            No location data available
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="medium" elevation={2} className="p-6" glow={true}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            🗺️ Threat Location Heatmap
          </h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {validHeatmapData.length} location{validHeatmapData.length !== 1 ? 's' : ''} detected
          </div>
        </div>
        
        {/* Simple list view of locations */}
        <div className="space-y-3">
          {validHeatmapData.map((item, index) => (
            <div 
              key={index}
              className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {item.location}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <div>
                      <span className="font-medium">Coordinates:</span><br />
                      {item.coordinates.lat.toFixed(4)}, {item.coordinates.lng.toFixed(4)}
                    </div>
                    <div>
                      <span className="font-medium">Risk Score:</span><br />
                      <span className={`font-bold ${
                        item.riskScore >= 80 ? 'text-red-600' :
                        item.riskScore >= 60 ? 'text-orange-600' :
                        item.riskScore >= 40 ? 'text-yellow-600' :
                        item.riskScore >= 20 ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        {item.riskScore}%
                      </span>
                    </div>
                  </div>
                  {item.time && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Time:</span> {item.time}
                    </div>
                  )}
                  {item.placeType && (
                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Type:</span> {item.placeType}
                    </div>
                  )}
                  {item.interpretation && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {item.interpretation}
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <div className={`w-4 h-4 rounded-full ${
                    item.riskScore >= 80 ? 'bg-red-600' :
                    item.riskScore >= 60 ? 'bg-red-500' :
                    item.riskScore >= 40 ? 'bg-orange-500' :
                    item.riskScore >= 20 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
            <span className="text-gray-600 dark:text-gray-300">Critical (80%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-600 dark:text-gray-300">High (60-79%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-gray-600 dark:text-gray-300">Medium (40-59%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-gray-600 dark:text-gray-300">Low (20-39%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-600 dark:text-gray-300">Very Low (0-19%)</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default SimpleMapView;
