import React from 'react';

interface ChipProps {
  label: string;
  variant: 'classification' | 'threat' | 'source';
  value: string;
  className?: string;
}

export function Chip({ label, variant, value, className = '' }: ChipProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'classification':
        return value === 'genuine' 
          ? 'bg-gradient-to-r from-red-50 to-red-100/80 text-red-800 border-red-300/60 shadow-sm hover:shadow-lg dark:from-red-900/20 dark:to-red-800/20 dark:text-red-200 dark:border-red-600/40' 
          : 'bg-gradient-to-r from-emerald-50 to-emerald-100/80 text-emerald-800 border-emerald-300/60 shadow-sm hover:shadow-lg dark:from-emerald-900/20 dark:to-emerald-800/20 dark:text-emerald-200 dark:border-emerald-600/40';
      case 'threat':
        switch (value) {
          case 'critical': return 'bg-gradient-to-r from-red-50 to-red-100/80 text-red-900 border-red-300/60 shadow-sm hover:shadow-lg dark:from-red-900/20 dark:to-red-800/20 dark:text-red-100 dark:border-red-600/40';
          case 'high': return 'bg-gradient-to-r from-orange-50 to-orange-100/80 text-orange-900 border-orange-300/60 shadow-sm hover:shadow-lg dark:from-orange-900/20 dark:to-orange-800/20 dark:text-orange-100 dark:border-orange-600/40';
          case 'medium': return 'bg-gradient-to-r from-amber-50 to-amber-100/80 text-amber-900 border-amber-300/60 shadow-sm hover:shadow-lg dark:from-amber-900/20 dark:to-amber-800/20 dark:text-amber-100 dark:border-amber-600/40';
          case 'low': return 'bg-gradient-to-r from-emerald-50 to-emerald-100/80 text-emerald-900 border-emerald-300/60 shadow-sm hover:shadow-lg dark:from-emerald-900/20 dark:to-emerald-800/20 dark:text-emerald-100 dark:border-emerald-600/40';
          default: return 'bg-gradient-to-r from-slate-50 to-slate-100/80 text-slate-800 border-slate-300/60 shadow-sm hover:shadow-lg dark:from-slate-800/20 dark:to-slate-700/20 dark:text-slate-200 dark:border-slate-600/40';
        }
      case 'source':
        return 'bg-gradient-to-r from-slate-50 to-slate-100/80 text-slate-700 border-slate-300/60 shadow-sm hover:shadow-lg dark:from-slate-800/20 dark:to-slate-700/20 dark:text-slate-300 dark:border-slate-600/40';
      default:
        return 'bg-gradient-to-r from-slate-50 to-slate-100/80 text-slate-700 border-slate-300/60 shadow-sm hover:shadow-lg dark:from-slate-800/20 dark:to-slate-700/20 dark:text-slate-300 dark:border-slate-600/40';
    }
  };

  return (
    <div 
      className={`inline-flex items-center px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:shadow-sm backdrop-blur-[8px] ${getVariantStyles()} ${className}`}
      role="status"
      aria-live="polite"
    >
      <span className="mr-2.5 text-xs opacity-75 font-medium tracking-wide uppercase">{label}:</span>
      <span className="font-bold capitalize tracking-wide">{value}</span>
    </div>
  );
}
