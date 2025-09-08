import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-12 h-6 rounded-full transition-all duration-300 ease-out focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 backdrop-blur-[8px] bg-white/10 border border-white/20 hover:bg-white/20"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Toggle track */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-500/20" />
      
      {/* Toggle handle */}
      <div 
        className={`absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300 ease-out ${
          isDark 
            ? 'translate-x-6 bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg' 
            : 'translate-x-0.5 bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg'
        }`}
      >
        {/* Sun/Moon icon */}
        <div className="absolute inset-0 flex items-center justify-center text-white text-xs">
          {isDark ? '🌙' : '☀️'}
        </div>
      </div>
      
      {/* Background glow effect */}
      <div 
        className={`absolute inset-0 rounded-full transition-all duration-300 ${
          isDark 
            ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10' 
            : 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10'
        }`}
      />
    </button>
  );
}
