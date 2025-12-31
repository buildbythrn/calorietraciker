'use client';

import { useState, useEffect } from 'react';
import { Heart, Zap, Target, Droplet, Dumbbell, Utensils, BarChart3 } from 'lucide-react';

export type PetType = 'dog' | 'cat' | 'bird' | 'fish' | 'bunny' | 'panda' | 'owl';
export type PetMood = 'happy' | 'hungry' | 'excited' | 'sleepy' | 'energetic';

interface PetMascotProps {
  petType: PetType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  mood?: PetMood;
  showIcon?: boolean;
  iconType?: 'food' | 'workout' | 'goal' | 'water' | 'analytics' | 'default';
}

const petColors: Record<PetType, { primary: string; secondary: string; accent: string }> = {
  dog: { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24' }, // Golden
  cat: { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a78bfa' }, // Purple
  bird: { primary: '#06b6d4', secondary: '#0891b2', accent: '#22d3ee' }, // Cyan
  fish: { primary: '#3b82f6', secondary: '#2563eb', accent: '#60a5fa' }, // Blue
  bunny: { primary: '#ec4899', secondary: '#db2777', accent: '#f472b6' }, // Pink
  panda: { primary: '#1f2937', secondary: '#111827', accent: '#374151' }, // Black/White
  owl: { primary: '#6366f1', secondary: '#4f46e5', accent: '#818cf8' }, // Indigo
};

const iconMap = {
  food: Utensils,
  workout: Dumbbell,
  goal: Target,
  water: Droplet,
  analytics: BarChart3,
  default: Heart,
};

export default function PetMascot({ 
  petType = 'dog',
  size = 'md',
  className = '',
  mood = 'happy',
  showIcon = true,
  iconType = 'default'
}: PetMascotProps) {
  const [isVisible, setIsVisible] = useState(false);
  const colors = petColors[petType];
  const Icon = iconMap[iconType];

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

  // Pet-specific features
  const getPetFeatures = () => {
    switch (petType) {
      case 'dog':
        return { ears: 'floppy', tail: true, snout: true };
      case 'cat':
        return { ears: 'pointed', tail: true, whiskers: true };
      case 'bird':
        return { beak: true, wings: true };
      case 'fish':
        return { fins: true, bubbles: true };
      case 'bunny':
        return { ears: 'long', tail: 'fluffy' };
      case 'panda':
        return { ears: 'round', patches: true };
      case 'owl':
        return { ears: 'feathers', eyes: 'large' };
      default:
        return {};
    }
  };

  const features = getPetFeatures();

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <div className={`pet-container pet-${petType} pet-mood-${mood} ${isVisible ? 'pet-enter' : ''}`}>
        <div className="pet-body">
          {/* Pet Head */}
          <div 
            className="pet-head"
            style={{
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
            }}
          >
            <div className="pet-face">
              {/* Ears */}
              {features.ears && (
                <>
                  <div 
                    className={`pet-ear pet-ear-left ${features.ears === 'floppy' ? 'floppy' : features.ears === 'long' ? 'long' : features.ears === 'round' ? 'round' : features.ears === 'feathers' ? 'feathers' : ''}`}
                    style={{ background: colors.primary }}
                  />
                  <div 
                    className={`pet-ear pet-ear-right ${features.ears === 'floppy' ? 'floppy' : features.ears === 'long' ? 'long' : features.ears === 'round' ? 'round' : features.ears === 'feathers' ? 'feathers' : ''}`}
                    style={{ background: colors.primary }}
                  />
                </>
              )}

              {/* Eyes */}
              <div className="pet-eyes">
                <div 
                  className={`pet-eye pet-eye-left ${features.eyes === 'large' ? 'large' : ''}`}
                />
                <div 
                  className={`pet-eye pet-eye-right ${features.eyes === 'large' ? 'large' : ''}`}
                />
              </div>

              {/* Snout/Beak */}
              {features.snout && (
                <div className="pet-snout" style={{ background: colors.accent }} />
              )}
              {features.beak && (
                <div className="pet-beak" style={{ background: '#fbbf24' }} />
              )}

              {/* Whiskers */}
              {features.whiskers && (
                <>
                  <div className="pet-whisker pet-whisker-left-1" />
                  <div className="pet-whisker pet-whisker-left-2" />
                  <div className="pet-whisker pet-whisker-right-1" />
                  <div className="pet-whisker pet-whisker-right-2" />
                </>
              )}

              {/* Smile */}
              <div className="pet-smile" />
            </div>

            {/* Panda patches */}
            {features.patches && (
              <>
                <div className="panda-patch panda-patch-left" />
                <div className="panda-patch panda-patch-right" />
              </>
            )}
          </div>

          {/* Pet Body */}
          <div 
            className="pet-torso"
            style={{
              background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.primary} 100%)`,
            }}
          >
            {showIcon && (
              <div className="pet-icon-container">
                <Icon 
                  className="pet-icon" 
                  size={iconSizes[size]}
                  style={{ color: colors.secondary }}
                />
              </div>
            )}

            {/* Wings for bird */}
            {features.wings && (
              <>
                <div className="pet-wing pet-wing-left" style={{ background: colors.accent }} />
                <div className="pet-wing pet-wing-right" style={{ background: colors.accent }} />
              </>
            )}

            {/* Fins for fish */}
            {features.fins && (
              <>
                <div className="pet-fin pet-fin-top" style={{ background: colors.accent }} />
                <div className="pet-fin pet-fin-bottom" style={{ background: colors.accent }} />
              </>
            )}
          </div>

          {/* Tail */}
          {features.tail && (
            <div 
              className={`pet-tail ${features.tail === 'fluffy' ? 'fluffy' : ''}`}
              style={{ background: colors.primary }}
            />
          )}

          {/* Bubbles for fish */}
          {features.bubbles && (
            <>
              <div className="pet-bubble pet-bubble-1" />
              <div className="pet-bubble pet-bubble-2" />
              <div className="pet-bubble pet-bubble-3" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

