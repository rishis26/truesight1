import React, { useEffect, useRef, useState } from 'react';
import { GlassCard } from './GlassCard';

interface ShortcutsPopoverProps {
  shortcuts: Array<{ key: string; description: string }>;
}

export function ShortcutsPopover({ shortcuts }: ShortcutsPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<'right' | 'left' | 'center'>('center');
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close when clicking anywhere outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  // Calculate position when opening
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const popoverWidth = 288; // w-72 = 18rem = 288px
      
      // Since the button is in the top-right corner, prioritize left positioning
      // Check if there's enough space to the left of the button
      if (rect.left - popoverWidth - 16 >= 0) {
        setPosition('left');
      } else if (rect.right + popoverWidth + 16 <= viewportWidth) {
        setPosition('right');
      } else {
        // If neither left nor right works, try center but with left offset
        const centerX = rect.left + (rect.width / 2);
        const popoverLeft = centerX - (popoverWidth / 2);
        const popoverRight = centerX + (popoverWidth / 2);
        
        if (popoverLeft >= 16 && popoverRight <= viewportWidth - 16) {
          setPosition('center');
        } else {
          // Force left positioning as last resort
          setPosition('left');
        }
      }
    }
  }, [isOpen]);

  // Reset position when closing
  useEffect(() => {
    if (!isOpen) {
      setPosition('center'); // Reset to default
    }
  }, [isOpen]);

  return (
    <div className="relative hidden sm:block" ref={containerRef}>
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="inline-flex items-center space-x-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-all duration-300 ease-out hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-2xl px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:shadow-lg"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="h-4 w-4 text-gray-500 dark:text-gray-400">⌨️</span>
        <span>Shortcuts</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Popover with glass styling */}
          <GlassCard 
            variant="medium" 
            elevation={3} 
            className={`absolute w-72 z-50 p-6 ${
              position === 'center'
                ? 'left-1/2 top-full mt-2 transform -translate-x-1/2 -translate-x-12'
                : position === 'right' 
                ? 'left-full top-0 ml-2' 
                : 'right-full top-0 mr-2'
            }`} 
            glow={true}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Keyboard Shortcuts</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                <span className="h-5 w-5">✖️</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {shortcuts.map((shortcut, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 hover:bg-white/30 dark:hover:bg-gray-800/30 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed font-medium">{shortcut.description}</span>
                  <kbd className="px-3 py-2 bg-white/50 dark:bg-gray-700/50 backdrop-blur-[4px] rounded-lg text-xs font-mono text-gray-800 dark:text-gray-200 border border-white/30 dark:border-gray-600/30 font-semibold shadow-sm">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
          </GlassCard>
        </>
      )}
    </div>
  );
}
