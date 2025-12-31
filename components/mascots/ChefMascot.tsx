'use client';

import { useState, useEffect } from 'react';
import { Utensils, Apple } from 'lucide-react';

interface ChefMascotProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ChefMascot({ size = 'md', className = '' }: ChefMascotProps) {
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
      <div className={`mascot-container chef-mascot ${isVisible ? 'mascot-enter' : ''}`}>
        <div className="mascot-body">
          {/* Chef Hat */}
          <div className="chef-hat">
            <div className="chef-hat-top"></div>
            <div className="chef-hat-band"></div>
          </div>
          
          {/* Head */}
          <div className="mascot-head chef-head">
            <div className="mascot-face">
              <div className="mascot-eyes">
                <div className="mascot-eye left-eye"></div>
                <div className="mascot-eye right-eye"></div>
              </div>
              <div className="mascot-smile"></div>
            </div>
          </div>
          
          {/* Body with apron */}
          <div className="mascot-torso chef-torso">
            <div className="chef-apron">
              <Utensils className="chef-icon" size={iconSizes[size]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

