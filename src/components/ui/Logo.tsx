import React from 'react';
import { BRAND_CONFIG } from '../../utils/branding';

interface LogoProps {
  variant?: 'logo' | 'nameLogo';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Logo({ 
  variant = 'nameLogo', 
  size = 'md', 
  className = ''
}: LogoProps) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-20'
  };

  const renderLogo = () => {
    switch (variant) {
      case 'logo':
        return (
          <img 
            src={BRAND_CONFIG.logos.logo.file} 
            alt={BRAND_CONFIG.logos.logo.alt}
            className={`${sizeClasses[size]} w-auto object-contain ${className}`}
          />
        );

      case 'nameLogo':
      default:
        return (
          <img 
            src={BRAND_CONFIG.logos.nameLogo.file} 
            alt={BRAND_CONFIG.logos.nameLogo.alt}
            className={`${sizeClasses[size]} w-auto object-contain ${className}`}
          />
        );
    }
  };

  return (
    <div className="flex items-center justify-center">
      {renderLogo()}
    </div>
  );
}

// Simple logo component for headers/navigation
export function LogoSimple({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <img 
        src="/logo/logo.png" 
        alt="trueSight Logo"
        className={`${sizeClasses[size]} w-auto object-contain`}
      />
      <img 
        src="/logo/name_logo.png" 
        alt="trueSight Name Logo"
        className={`${sizeClasses[size]} w-auto object-contain hidden sm:block`}
      />
    </div>
  );
}
