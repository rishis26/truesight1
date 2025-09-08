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
    <GlassCard variant="low" elevation={1} className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2 leading-relaxed">{title}</p>
          <p className={`text-3xl font-bold ${colorClasses[color]} leading-tight`}>{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-2 leading-relaxed max-w-[70ch]">{description}</p>
          )}
        </div>
        <span className="text-2xl text-gray-400">{icon}</span>
      </div>
      
      {/* Sparkline placeholder with glass styling */}
      <div className="flex items-center justify-between">
        <div className="flex-1 h-8 bg-white/10 backdrop-blur-[4px] rounded overflow-hidden border border-white/20">
          <div className="h-full w-full bg-gradient-to-r from-gray-200/30 to-gray-300/30 opacity-50" />
        </div>
        {trend && (
          <span className="ml-3 text-lg text-gray-500">{getTrendIcon()}</span>
        )}
      </div>
    </GlassCard>
  );
}
