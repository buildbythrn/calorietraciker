'use client';

import { useState, useEffect } from 'react';
import { Dumbbell } from 'lucide-react';

interface TrainerMascotProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'default' | 'celebrate' | 'motivate';
}

export default function TrainerMascot({ 
  size = 'md', 
  className = '',
  variant = 'default'
}: TrainerMascotProps) {
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
      <div className={`mascot-container trainer-mascot ${variant} ${isVisible ? 'mascot-enter' : ''}`}>
        <div className="mascot-body">
          {/* Headband */}
          <div className="trainer-headband"></div>
          
          {/* Head */}
          <div className="mascot-head trainer-head">
            <div className="mascot-face">
              <div className="mascot-eyes">
                <div className="mascot-eye left-eye"></div>
                <div className="mascot-eye right-eye"></div>
              </div>
              <div className="mascot-smile"></div>
            </div>
          </div>
          
          {/* Body with tank top */}
          <div className="mascot-torso trainer-torso">
            <div className="trainer-tank">
              <Dumbbell className="trainer-icon" size={iconSizes[size]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

