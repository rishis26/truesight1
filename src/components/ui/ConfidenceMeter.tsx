import React from 'react';

interface ConfidenceMeterProps {
  confidence: number;
  showLabels?: boolean;
  animated?: boolean;
}

export function ConfidenceMeter({ confidence, showLabels = true, animated = true }: ConfidenceMeterProps) {
  const animationDuration = animated ? 'duration-500' : 'duration-0';

  // Determine which chip to highlight based on nearest 25% segment
  const segmentIndex = Math.min(4, Math.floor(confidence / 25));
  const highlightedLabel = segmentIndex === 0 ? 'Low' : segmentIndex === 1 ? 'Medium' : segmentIndex === 2 ? 'High' : 'Critical';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-100">Confidence Level</span>
        <span className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-100/90">{confidence}%</span>
      </div>

      <div className="relative">
        {/* Track */}
        <div className="relative w-full h-3.5 sm:h-4 rounded-full overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),inset_0_-1px_1px_rgba(255,255,255,0.2)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),inset_0_-1px_1px_rgba(0,0,0,0.2)]">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:bg-white/10 border border-gray-200/60 dark:border-white/10 rounded-full" />

          {/* Gradient fill clipped by width with soft highlight */}
          <div
            className={`absolute top-0 left-0 h-full rounded-full transition-all ${animationDuration} ease-out`}
            style={{ width: `${confidence}%` }}
          >
            <div className="absolute inset-0 rounded-full shadow-[0_0_0_1px_rgba(0,0,0,0.05)]" style={{ backgroundImage: 'linear-gradient(90deg, #10b981 0%, #f59e0b 25%, #f97316 50%, #ef4444 75%, #dc2626 100%)' }} />
            <div className="absolute inset-0 rounded-full pointer-events-none bg-gradient-to-b from-white/60 via-white/20 to-transparent opacity-30" />
            <div className="absolute inset-0 rounded-full pointer-events-none bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-40" />
          </div>
        </div>

        {/* Percent marks BELOW the bar */}
        {showLabels && (
          <div className="relative mt-3 h-6 sm:h-7">
            {[0, 20, 40, 60, 80, 100].map((pos) => {
              const transform = pos === 0 ? 'translateX(0%)' : pos === 100 ? 'translateX(-100%)' : 'translateX(-50%)';
              return (
                <div
                  key={`pct-${pos}`}
                  className="absolute left-0 top-0 flex flex-col items-center pointer-events-none"
                  style={{ left: `${pos}%`, transform }}
                >
                  <div className="w-px h-3 bg-gradient-to-b from-gray-400 to-gray-500 dark:from-white/25 dark:to-white/40" />
                  <span className="text-[10px] sm:text-[11px] mt-1 text-gray-600 dark:text-gray-400 font-medium">{pos}%</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Legend (keywords) centered BETWEEN ticks at 12.5%, 37.5%, 62.5%, 87.5% */}
        {showLabels && (
          <div className="relative mt-2 h-6 sm:h-7">
            {[
              { label: 'Low', color: 'text-green-500', left: 12.5 },
              { label: 'Medium', color: 'text-yellow-500', left: 37.5 },
              { label: 'High', color: 'text-orange-500', left: 62.5 },
              { label: 'Critical', color: 'text-red-500', left: 87.5 }
            ].map((chip) => {
              const isActive = highlightedLabel === chip.label;
              return (
                <div
                  key={chip.label}
                  className="absolute left-0 top-0 w-0 flex justify-center"
                  style={{ left: `${chip.left}%`, transform: 'translateX(-50%)' }}
                >
                  <span className={`relative text-sm leading-none transition-all duration-300 ${isActive ? chip.color + ' font-semibold scale-110' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'}`}>
                    {chip.label}
                    {isActive && (
                      <span className="absolute left-1/2 -translate-x-1/2 -bottom-1 h-0.5 w-8 rounded-full bg-current opacity-70 shadow-sm" />
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
