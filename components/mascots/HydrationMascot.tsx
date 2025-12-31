'use client';

import { useState, useEffect } from 'react';
import { Droplet } from 'lucide-react';

interface HydrationMascotProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function HydrationMascot({ size = 'md', className = '' }: HydrationMascotProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const iconSizes = {
    sm: 20,
    md: 28,
    lg: 36,
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <div className={`mascot-container hydration-mascot ${isVisible ? 'mascot-enter' : ''}`}>
        <div className="mascot-body">
          {/* Head with water drop */}
          <div className="mascot-head hydration-head">
            <div className="mascot-face">
              <div className="mascot-eyes">
                <div className="mascot-eye left-eye"></div>
                <div className="mascot-eye right-eye"></div>
              </div>
              <div className="mascot-smile"></div>
            </div>
            <div className="water-drop-decoration">
              <Droplet size={iconSizes[size] * 0.4} />
            </div>
          </div>
          
          {/* Body with water bottle */}
          <div className="mascot-torso hydration-torso">
            <div className="water-bottle">
              <Droplet className="hydration-icon" size={iconSizes[size]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

