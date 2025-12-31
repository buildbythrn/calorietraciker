'use client';

import { useState, useEffect } from 'react';
import { Target, TrendingUp } from 'lucide-react';

interface CoachMascotProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'default' | 'encourage' | 'goal';
}

export default function CoachMascot({ 
  size = 'md', 
  className = '',
  variant = 'default'
}: CoachMascotProps) {
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
      <div className={`mascot-container coach-mascot ${variant} ${isVisible ? 'mascot-enter' : ''}`}>
        <div className="mascot-body">
          {/* Cap */}
          <div className="coach-cap">
            <div className="coach-cap-bill"></div>
          </div>
          
          {/* Head */}
          <div className="mascot-head coach-head">
            <div className="mascot-face">
              <div className="mascot-eyes">
                <div className="mascot-eye left-eye"></div>
                <div className="mascot-eye right-eye"></div>
              </div>
              <div className="mascot-smile"></div>
            </div>
          </div>
          
          {/* Body with shirt */}
          <div className="mascot-torso coach-torso">
            <div className="coach-shirt">
              {variant === 'goal' ? (
                <Target className="coach-icon" size={iconSizes[size]} />
              ) : (
                <TrendingUp className="coach-icon" size={iconSizes[size]} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

