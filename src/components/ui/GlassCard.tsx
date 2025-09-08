import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface GlassCardProps {
  children: React.ReactNode;
  variant?: 'low' | 'medium' | 'high' | 'glass';
  className?: string;
  elevation?: 1 | 2 | 3;
  glow?: boolean;
}

export function GlassCard({ children, variant = 'low', className = '', elevation = 1, glow = false }: GlassCardProps) {
  const { isDark } = useTheme();

  const getGlassStyles = () => {
    if (isDark) {
      switch (variant) {
        case 'glass':
          return 'backdrop-blur-[30px] bg-white/10 border-white/20 shadow-[0_8px_40px_rgba(0,0,0,0.35)]';
        case 'low':
          return 'backdrop-blur-[20px] bg-gray-900/60 border-gray-700/50 shadow-[0_4px_20px_rgba(0,0,0,0.3)]';
        case 'medium':
          return 'backdrop-blur-[24px] bg-gray-900/70 border-gray-600/60 shadow-[0_8px_30px_rgba(0,0,0,0.4)]';
        case 'high':
          return 'backdrop-blur-[28px] bg-gray-900/80 border-gray-500/70 shadow-[0_12px_40px_rgba(0,0,0,0.5)]';
        default:
          return 'backdrop-blur-[20px] bg-gray-900/60 border-gray-700/50 shadow-[0_4px_20px_rgba(0,0,0,0.3)]';
      }
    } else {
      switch (variant) {
        case 'glass':
          return 'backdrop-blur-[30px] bg-white/60 border-white/40 shadow-[0_8px_40px_rgba(0,0,0,0.08)]';
        case 'low':
          return 'backdrop-blur-[20px] bg-white/70 border-gray-200/50 shadow-[0_4px_20px_rgba(0,0,0,0.06)]';
        case 'medium':
          return 'backdrop-blur-[24px] bg-white/80 border-gray-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.08)]';
        case 'high':
          return 'backdrop-blur-[28px] bg-white/90 border-gray-200/70 shadow-[0_12px_40px_rgba(0,0,0,0.1)]';
        default:
          return 'backdrop-blur-[20px] bg-white/70 border-gray-200/50 shadow-[0_4px_20px_rgba(0,0,0,0.06)]';
      }
    }
  };

  const getElevationStyles = () => {
    if (isDark) {
      switch (elevation) {
        case 1:
          return 'hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:-translate-y-1';
        case 2:
          return 'hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] hover:-translate-y-1';
        case 3:
          return 'hover:shadow-[0_16px_50px_rgba(0,0,0,0.7)] hover:-translate-y-1';
        default:
          return 'hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:-translate-y-1';
      }
    } else {
      switch (elevation) {
        case 1:
          return 'hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] hover:-translate-y-1';
        case 2:
          return 'hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] hover:-translate-y-1';
        case 3:
          return 'hover:shadow-[0_16px_50px_rgba(0,0,0,0.15)] hover:-translate-y-1';
        default:
          return 'hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] hover:-translate-y-1';
      }
    }
  };

  const getGlowEffect = () => {
    if (!glow) return '';
    
    if (isDark) {
      return 'before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-blue-500/8 before:via-purple-500/8 before:to-pink-500/8 before:blur-2xl before:-z-10';
    } else {
      return 'before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-blue-400/6 before:via-indigo-400/6 before:to-purple-400/6 before:blur-2xl before:-z-10';
    }
  };

  // Fallback for browsers without backdrop-filter support
  const fallbackStyles = isDark 
    ? 'bg-gray-800 border-gray-600' 
    : 'bg-white border-gray-200';

  return (
    <div className={`relative ${getGlowEffect()}`}>
      <div 
        className={`
          ${getGlassStyles()} 
          ${getElevationStyles()}
          border rounded-2xl transition-all duration-300 ease-out
          active:translate-y-0 active:scale-[0.98]
          ${className}
          [@supports_not_(backdrop-filter:blur(1px))]:${fallbackStyles}
        `}
      >
        {children}
      </div>
    </div>
  );
}
