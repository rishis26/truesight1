import React from 'react';

interface ConfidenceMeterProps {
  confidence: number;
  showLabels?: boolean;
}

export function ConfidenceMeter({ confidence, showLabels = true }: ConfidenceMeterProps) {
  const getRegionColor = (value: number) => {
    if (value >= 90) return 'bg-red-500';
    if (value >= 70) return 'bg-orange-500';
    if (value >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getRegionLabel = (value: number) => {
    if (value >= 90) return 'Critical';
    if (value >= 70) return 'High';
    if (value >= 50) return 'Medium';
    return 'Low';
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Confidence Level</span>
        <span className="text-sm text-gray-600">{confidence}%</span>
      </div>
      
      <div className="relative">
        {/* Background track */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          {/* Confidence bar */}
          <div
            className={`h-3 rounded-full transition-all duration-1000 ${getRegionColor(confidence)}`}
            style={{ width: `${confidence}%` }}
          />
        </div>
        
        {/* Ticks and labels positioned by percentage */}
        {showLabels && (
          <div className="relative mt-2 h-5 text-xs text-gray-500">
            {[
              { label: '0%', pos: 0 },
              { label: '50%', pos: 50 },
              { label: '70%', pos: 70 },
              { label: '90%', pos: 90 },
              { label: '100%', pos: 100 }
            ].map(tick => (
              <div
                key={tick.label}
                className="absolute -translate-x-1/2 left-0 flex flex-col items-center"
                style={{ left: `${tick.pos}%` }}
              >
                <div className="w-px h-2 bg-gray-300 mb-1" />
                <span>{tick.label}</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Region labels */}
        {showLabels && (
          <div className="flex justify-between mt-1 text-xs font-medium">
            <span className="text-green-600">Low</span>
            <span className="text-yellow-600">Medium</span>
            <span className="text-orange-600">High</span>
            <span className="text-red-600">Critical</span>
          </div>
        )}
      </div>
    </div>
  );
}
