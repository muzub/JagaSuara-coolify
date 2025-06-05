
"use client";

import React from 'react';
import { 
  Leaf, Activity, BellOff, Mic, AlertTriangle, LoaderCircle,
  Feather, Sun, Eye, CircleDot, Waves, Disc3, Crosshair, MoreHorizontal,
  Speaker, Wind, Focus, AlertCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NoiseLevel, AnimationStyleId } from '@/types';

interface NoiseDisplayProps {
  level: NoiseLevel;
  currentVolume?: number | null;
  animationStyle?: AnimationStyleId;
}

const getDisplayProperties = (
  currentLevel: NoiseLevel,
  _volume?: number | null, // volume parameter is no longer used for display text
  animStyle: AnimationStyleId = 'classic'
) => {

  let iconElement: JSX.Element;
  let text: string;
  let bgColorClass: string;
  let textColorClass: string;
  let borderColorClass: string;
  // let description: string; // Description removed

  // Default icons for Idle, Error, Initializing (consistent across styles)
  if (currentLevel === 'Initializing') {
    return {
      icon: <LoaderCircle size={96} className="animate-spin text-status-idle-fg" />,
      text: 'Initializing...',
      bgColorClass: 'bg-status-idle',
      textColorClass: 'text-status-idle-fg',
      borderColorClass: 'border-status-idle',
      // description: 'Getting ready to listen.', // Description removed
    };
  }
  if (currentLevel === 'Error') {
    return {
      icon: <AlertTriangle size={96} className="text-status-error-fg" />,
      text: 'Error',
      bgColorClass: 'bg-status-error',
      textColorClass: 'text-status-error-fg',
      borderColorClass: 'border-status-error',
      // description: 'Something went wrong.', // Description removed
    };
  }
  if (currentLevel === 'Idle') {
    return {
      icon: <Mic size={96} className="text-status-idle-fg" />,
      text: 'Idle',
      bgColorClass: 'bg-status-idle',
      textColorClass: 'text-status-idle-fg',
      borderColorClass: 'border-status-idle',
      // description: 'Click "Start Monitoring" to check the noise level.', // Description removed
    };
  }

  // Style-specific icons and properties for Quiet, Medium, Noisy
  switch (currentLevel) {
    case 'Quiet':
      bgColorClass = 'bg-status-quiet';
      textColorClass = 'text-status-quiet-fg';
      borderColorClass = 'border-status-quiet';
      // description = "It's peaceful. Great for focus!"; // Description removed
      text = 'Quiet';
      switch (animStyle) {
        case 'breathe':    iconElement = <Feather size={96} className={textColorClass} />; break;
        case 'spin-expand':iconElement = <Sun size={96} className={textColorClass} />; break;
        case 'focus-shift':iconElement = <Eye size={96} className={textColorClass} />; break;
        case 'minimalist': iconElement = <CircleDot size={96} className={textColorClass} />; break;
        case 'classic': default: iconElement = <Leaf size={96} className={textColorClass} />; break;
      }
      break;
    case 'Medium':
      bgColorClass = 'bg-status-medium';
      textColorClass = 'text-status-medium-fg';
      borderColorClass = 'border-status-medium';
      // description = 'Some background noise. Still manageable.'; // Description removed
      text = 'Medium';
      switch (animStyle) {
        case 'breathe':    iconElement = <Waves size={96} className={textColorClass} />; break;
        case 'spin-expand':iconElement = <Disc3 size={96} className={textColorClass} />; break;
        case 'focus-shift':iconElement = <Crosshair size={96} className={textColorClass} />; break;
        case 'minimalist': iconElement = <MoreHorizontal size={96} className={textColorClass} />; break;
        case 'classic': default: iconElement = <Activity size={96} className={textColorClass} />; break;
      }
      break;
    case 'Noisy':
      bgColorClass = 'bg-status-noisy';
      textColorClass = 'text-status-noisy-fg';
      borderColorClass = 'border-status-noisy';
      // description = "It's quite loud. Consider finding a quieter spot."; // Description removed
      text = 'Noisy';
      switch (animStyle) {
        case 'breathe':    iconElement = <Speaker size={96} className={textColorClass} />; break;
        case 'spin-expand':iconElement = <Wind size={96} className={textColorClass} />; break; 
        case 'focus-shift':iconElement = <Focus size={96} className={textColorClass} />; break;
        case 'minimalist': iconElement = <AlertCircle size={96} className={textColorClass} />; break;
        case 'classic': default: iconElement = <BellOff size={96} className={textColorClass} />; break;
      }
      break;
    default: // Fallback, should ideally not be reached due to prior checks
      iconElement = <Mic size={96} className="text-status-idle-fg" />;
      text = 'Idle';
      bgColorClass = 'bg-status-idle';
      textColorClass = 'text-status-idle-fg';
      borderColorClass = 'border-status-idle';
      // description = 'Click "Start Monitoring" to check the noise level.'; // Description removed
  }

  return {
    icon: iconElement, text, bgColorClass, textColorClass, borderColorClass, /*description,*/ // Description removed
  };
};


const NoiseDisplay: React.FC<NoiseDisplayProps> = ({ level, currentVolume, animationStyle = 'classic' }) => {
  
  const getAnimationClass = (currentLevel: NoiseLevel, style: AnimationStyleId): string => {
    if (currentLevel === 'Idle' || currentLevel === 'Error' || currentLevel === 'Initializing') return '';

    switch (style) {
      case 'classic':
        if (currentLevel === 'Quiet') return 'animate-quiet-state';
        if (currentLevel === 'Medium') return 'animate-medium-state';
        if (currentLevel === 'Noisy') return 'animate-noisy-state';
        break;
      case 'breathe':
        if (currentLevel === 'Quiet') return 'animate-quiet-breathe';
        if (currentLevel === 'Medium') return 'animate-medium-breathe-pulse';
        if (currentLevel === 'Noisy') return 'animate-noisy-shake';
        break;
      case 'spin-expand':
        if (currentLevel === 'Quiet') return 'animate-quiet-slow-spin';
        if (currentLevel === 'Medium') return 'animate-medium-pulse-expand-circle';
        if (currentLevel === 'Noisy') return 'animate-noisy-fast-spin-alert';
        break;
      case 'focus-shift':
        if (currentLevel === 'Quiet') return 'animate-quiet-focus-shadow';
        if (currentLevel === 'Medium') return 'animate-medium-border-throb';
        if (currentLevel === 'Noisy') return 'animate-noisy-vibrate-glow';
        break;
      case 'minimalist':
        if (currentLevel === 'Quiet') return 'animate-quiet-opacity-fade';
        if (currentLevel === 'Medium') return 'animate-medium-scale-subtle-icon-container'; 
        if (currentLevel === 'Noisy') return 'animate-noisy-border-flash-minimal';
        break;
      default:
        return '';
    }
    return '';
  };

  const { icon, text: displayText, bgColorClass, textColorClass, borderColorClass, /*description*/ } = getDisplayProperties(level, currentVolume, animationStyle); // description removed
  const selectedAnimationClass = getAnimationClass(level, animationStyle);

  return (
    <div className="flex flex-col items-center justify-center text-center p-6">
      <div
        className={cn(
          'relative w-64 h-64 md:w-80 md:h-80 rounded-full flex flex-col items-center justify-center transition-all duration-500 ease-in-out shadow-2xl border-4',
          bgColorClass,
          borderColorClass, 
          selectedAnimationClass
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-20 text-8xl overflow-hidden">
         {React.cloneElement(icon, { size: 160, className: cn(textColorClass, 'opacity-30') })}
        </div>
        <div className="z-10 flex flex-col items-center justify-center">
          <div className="noise-icon-wrapper"> {/* Wrapper for icon-specific animations */}
            {icon}
          </div>
          <p className={cn('mt-1 text-4xl font-bold tracking-tight', textColorClass)}>{displayText.toUpperCase()}</p>
        </div>
      </div>
      {/* <p className="mt-6 text-lg text-muted-foreground max-w-xs whitespace-nowrap truncate">{description}</p> */} {/* Description p tag removed */}
    </div>
  );
};

export default NoiseDisplay;
