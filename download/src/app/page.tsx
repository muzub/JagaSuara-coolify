
"use client";

import React, { useState, useEffect } from 'react';
import { useNoiseLevel } from '@/hooks/useNoiseLevel';
import NoiseDisplay from '@/components/NoiseDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MicOff, Settings, Play, BellRing, BellOff } from 'lucide-react';
import type { AnimationStyleId } from '@/types';
import Link from 'next/link';

const ANIMATION_STYLE_KEY = 'quietude_animationStyle';
const DEFAULT_ANIMATION_STYLE_ID: AnimationStyleId = 'classic';

export default function Home() {
  const { 
    noiseLevel, 
    error, 
    isMonitoring, 
    startMonitoring, 
    stopMonitoring, 
    alarmMessage,
    playAlarmSound, // Added
    stopAlarmSound  // Added
  } = useNoiseLevel();
  const [animationStyle, setAnimationStyle] = useState<AnimationStyleId>(DEFAULT_ANIMATION_STYLE_ID);
  const [isClient, setIsClient] = useState(false);
  const [isPreviewingAlarm, setIsPreviewingAlarm] = useState(false);


  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined' && localStorage) {
        const storedAnimationStyle = localStorage.getItem(ANIMATION_STYLE_KEY) as AnimationStyleId | null;
        if (storedAnimationStyle) {
            setAnimationStyle(storedAnimationStyle);
        }
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === ANIMATION_STYLE_KEY && event.newValue) {
        setAnimationStyle(event.newValue as AnimationStyleId);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleToggleAlarmPreview = () => {
    if (isMonitoring) return; // Don't allow preview if actual monitoring is active

    if (isPreviewingAlarm) {
      stopAlarmSound(); // This will also clear alarmMessage from the hook
      setIsPreviewingAlarm(false);
    } else {
      // Ensure settings are loaded before playing, especially custom message and sound URL
      // The hook's playAlarmSound already loads from localStorage.
      playAlarmSound(); // This will set alarmMessage in the hook
      setIsPreviewingAlarm(true);
    }
  };

  const handleStartMonitoring = () => {
    if (isPreviewingAlarm) {
      stopAlarmSound();
      setIsPreviewingAlarm(false);
    }
    startMonitoring();
  };

  const handleStopMonitoring = () => {
    if (isPreviewingAlarm) {
        stopAlarmSound();
        setIsPreviewingAlarm(false);
    }
    stopMonitoring();
  };


  if (!isClient) {
    return null; 
  }

  return (
    <div className="flex flex-col items-center justify-center flex-grow bg-background selection:bg-primary/20 selection:text-primary p-4 min-h-screen">
      <Card className="w-full max-w-md shadow-2xl rounded-3xl overflow-hidden bg-card/80 backdrop-blur-md border-border/20">
        <CardHeader className="p-6 pt-8 text-center">
          <CardTitle className="text-4xl font-bold text-primary">JagaSuara</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <NoiseDisplay level={noiseLevel} animationStyle={animationStyle} />
        </CardContent>
        <div className="p-6 pb-8 bg-transparent">
          {error && (
            <div role="alert" className="w-full p-3 mb-4 text-sm text-destructive-foreground bg-destructive/90 rounded-lg text-center shadow">
              {error}
            </div>
          )}
          {/* Display alarm message if active (either real or preview) */}
          {alarmMessage && (
            <div 
              role="alert" 
              className="w-full p-4 mb-4 text-center bg-destructive/10 text-destructive rounded-lg shadow-md border border-destructive/20"
            >
              <p className="font-semibold text-base md:text-lg">{alarmMessage.split('.')[0]}.</p>
              {alarmMessage.split('.')[1] && <p className="text-xs md:text-sm">{alarmMessage.split('.')[1].trim()}</p>}
            </div>
          )}
        </div>
      </Card>

      <div className="fixed bottom-8 right-8 z-50 flex items-center space-x-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleAlarmPreview}
          disabled={isMonitoring}
          aria-label={isPreviewingAlarm ? "Stop Alarm Preview" : "Start Alarm Preview"}
          className="w-12 h-12 hover:bg-transparent focus-visible:bg-transparent"
        >
          {isPreviewingAlarm ? (
            <BellOff className="h-6 w-6 opacity-10" />
          ) : (
            <BellRing className="h-6 w-6 opacity-10" />
          )}
        </Button>
        
        {!isMonitoring ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleStartMonitoring}
            disabled={noiseLevel === 'Initializing'}
            aria-label="Start Monitoring"
            className="w-12 h-12 hover:bg-transparent focus-visible:bg-transparent"
          >
            <Play className="h-6 w-6 opacity-10" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleStopMonitoring}
            aria-label="Stop Monitoring"
            className="w-12 h-12 hover:bg-transparent focus-visible:bg-transparent"
          >
            <MicOff className="h-6 w-6 opacity-10" />
          </Button>
        )}

        <Link href="/admin" passHref legacyBehavior>
          <Button variant="ghost" size="icon" aria-label="Admin Settings" className="w-16 h-16 hover:bg-transparent focus-visible:bg-transparent">
            <Settings className="h-8 w-8 opacity-10" />
          </Button>
        </Link>
      </div>
      
      <footer className="absolute bottom-6 text-center text-xs text-muted-foreground/70">
        <p>&copy; {new Date().getFullYear()} JagaSuara.</p>
      </footer>
    </div>
  );
}

