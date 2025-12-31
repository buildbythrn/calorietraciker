'use client';

import { useState, useEffect } from 'react';
import { Dumbbell, Flame, Heart, Zap } from 'lucide-react';

interface FitFlowMascotProps {
  variant?: 'default' | 'celebrate' | 'wave' | 'workout' | 'encourage';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function FitFlowMascot({ 
  variant = 'default', 
  size = 'md',
  className = '' 
}: FitFlowMascotProps) {
  const [currentAnimation, setCurrentAnimation] = useState(variant);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    setCurrentAnimation(variant);
  }, [variant]);

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
      <div 
        className={`mascot-container ${isVisible ? 'mascot-enter' : ''} ${currentAnimation}`}
      >
        {/* Main mascot body - a friendly fitness character */}
        <div className="mascot-body">
          {/* Head */}
          <div className="mascot-head">
            <div className="mascot-face">
              <div className="mascot-eyes">
                <div className="mascot-eye left-eye"></div>
                <div className="mascot-eye right-eye"></div>
              </div>
              <div className="mascot-smile"></div>
            </div>
          </div>
          
          {/* Body */}
          <div className="mascot-torso">
            {/* Icon overlay based on variant */}
            {currentAnimation === 'workout' && (
              <Dumbbell 
                className="mascot-icon workout-icon" 
                size={iconSizes[size]}
              />
            )}
            {currentAnimation === 'celebrate' && (
              <Flame 
                className="mascot-icon celebrate-icon" 
                size={iconSizes[size]}
              />
            )}
            {currentAnimation === 'encourage' && (
              <Heart 
                className="mascot-icon encourage-icon" 
                size={iconSizes[size]}
              />
            )}
            {currentAnimation === 'default' && (
              <Zap 
                className="mascot-icon default-icon" 
                size={iconSizes[size]}
              />
            )}
          </div>
        </div>

        {/* Floating particles for celebrate variant */}
        {currentAnimation === 'celebrate' && (
          <>
            <div className="particle particle-1"></div>
            <div className="particle particle-2"></div>
            <div className="particle particle-3"></div>
            <div className="particle particle-4"></div>
          </>
        )}
      </div>
    </div>
  );
}

