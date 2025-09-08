import React from 'react';
import { GlassCard } from './GlassCard';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'red' | 'green' | 'orange';
  description?: string;
  trend?: 'up' | 'down' | 'stable';
}

export function KpiCard({ title, value, icon, color, description, trend }: KpiCardProps) {
  const colorClasses = {
    blue: 'text-blue-600',
    red: 'text-red-600',
    green: 'text-green-600',
    orange: 'text-orange-600'
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      case 'stable': return '→';
      default: return null;
    }
  };

  return (
    <GlassCard variant="low" elevation={1} className="p-4 sm:p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 sm:mb-2 leading-relaxed">{title}</p>
          <div className="flex items-center gap-2 sm:gap-3">
            <p className={`text-3xl sm:text-5xl font-bold ${colorClasses[color]} leading-tight`}>{value}</p>
            {trend && (
              <span className="text-sm sm:text-base text-gray-500">{getTrendIcon()}</span>
            )}
          </div>
          {description && (
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed max-w-[70ch]">{description}</p>
          )}
        </div>
        <span className="ml-3 inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-xl sm:text-2xl text-gray-500">
          {icon}
        </span>
      </div>
    </GlassCard>
  );
}
