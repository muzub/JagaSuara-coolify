
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShieldCheck, UploadCloud, Link as LinkIcon, Play, Pause, Timer, Palette, Film, XCircle, MessageSquare, AlertTriangle, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { AnimationStyle, AnimationStyleId, AppTheme, AppThemeId } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const MIN_THRESHOLD = 0;
const MAX_THRESHOLD = 255;
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MIN_THRESHOLD_GAP = 15; 

const QUIET_THRESHOLD_KEY = 'quietude_quietThreshold';
const MEDIUM_THRESHOLD_KEY = 'quietude_mediumThreshold';
const ALARM_SOUND_URL_KEY = 'quietude_alarmSoundUrl';
const ALARM_DELAY_SECONDS_KEY = 'quietude_alarmDelaySeconds';
const ANIMATION_STYLE_KEY = 'quietude_animationStyle';
const APP_THEME_KEY = 'quietude_appTheme';
const CUSTOM_ALARM_MESSAGE_KEY = 'quietude_customAlarmMessage';

const DEFAULT_QUIET_THRESHOLD = 40; 
const DEFAULT_MEDIUM_THRESHOLD = 60; 
const DEFAULT_ALARM_SOUND_URL = '/sounds/ding.mp3'; 
const DEFAULT_ALARM_DELAY_SECONDS = 2;
const MIN_ALARM_DELAY_SECONDS = 1;
const MAX_ALARM_DELAY_SECONDS = 30;
const DEFAULT_ANIMATION_STYLE_ID: AnimationStyleId = 'classic';
const DEFAULT_APP_THEME_ID: AppThemeId = 'system';
const DEFAULT_CUSTOM_ALARM_MESSAGE = "Jaga suara, demi suasana nyaman yang kondusif bagi semua.";

const animationStyles: AnimationStyle[] = [
  { id: 'classic', name: 'Classic Glow' },
  { id: 'breathe', name: 'Subtle Breathe' },
  { id: 'spin-expand', name: 'Gentle Spin & Expand' },
  { id: 'focus-shift', name: 'Focus Shift' },
  { id: 'minimalist', name: 'Minimalist Pulse' },
];

const appThemes: AppTheme[] = [
  { id: 'system', name: 'System Preference' },
  { id: 'light', name: 'Light Mode' },
  { id: 'dark', name: 'Dark Mode' },
];


export default function AdminPage() {
  const { toast } = useToast();
  const router = useRouter();

  const [quietThreshold, setQuietThreshold] = useState(DEFAULT_QUIET_THRESHOLD);
  const [mediumThreshold, setMediumThreshold] = useState(DEFAULT_MEDIUM_THRESHOLD); 
  const [alarmSoundUrl, setAlarmSoundUrl] = useState(DEFAULT_ALARM_SOUND_URL);
  const [alarmDelaySeconds, setAlarmDelaySeconds] = useState(DEFAULT_ALARM_DELAY_SECONDS);
  const [fileName, setFileName] = useState<string | null>(null);
  const [selectedAnimationStyle, setSelectedAnimationStyle] = useState<AnimationStyleId>(DEFAULT_ANIMATION_STYLE_ID);
  const [selectedAppTheme, setSelectedAppTheme] = useState<AppThemeId>(DEFAULT_APP_THEME_ID);
  const [customAlarmMessage, setCustomAlarmMessage] = useState(DEFAULT_CUSTOM_ALARM_MESSAGE);


  const [isClient, setIsClient] = useState(false);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

  const [isFullAlarmPreviewPlaying, setIsFullAlarmPreviewPlaying] = useState(false);
  const fullPreviewAudioRef = useRef<HTMLAudioElement | null>(null);


  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined' && localStorage) {
      const storedQuiet = localStorage.getItem(QUIET_THRESHOLD_KEY);
      const storedMedium = localStorage.getItem(MEDIUM_THRESHOLD_KEY);
      const storedAlarmUrl = localStorage.getItem(ALARM_SOUND_URL_KEY);
      const storedAlarmDelay = localStorage.getItem(ALARM_DELAY_SECONDS_KEY);
      const storedAnimationStyle = localStorage.getItem(ANIMATION_STYLE_KEY) as AnimationStyleId | null;
      const storedAppTheme = localStorage.getItem(APP_THEME_KEY) as AppThemeId | null;
      const storedCustomAlarmMessage = localStorage.getItem(CUSTOM_ALARM_MESSAGE_KEY);

      let quietVal = DEFAULT_QUIET_THRESHOLD;
      if (storedQuiet) {
        const parsed = parseInt(storedQuiet, 10);
        if (!isNaN(parsed) && parsed >= MIN_THRESHOLD && parsed <= MAX_THRESHOLD) quietVal = parsed;
      }
      
      let mediumVal = DEFAULT_MEDIUM_THRESHOLD;
      if (storedMedium) {
         const parsed = parseInt(storedMedium, 10);
        if (!isNaN(parsed) && parsed >= MIN_THRESHOLD && parsed <= MAX_THRESHOLD) mediumVal = parsed;
      }

      if (mediumVal < quietVal + MIN_THRESHOLD_GAP) {
        mediumVal = Math.min(MAX_THRESHOLD, quietVal + MIN_THRESHOLD_GAP);
      }
       if (quietVal > mediumVal - MIN_THRESHOLD_GAP) {
        quietVal = Math.max(MIN_THRESHOLD, mediumVal - MIN_THRESHOLD_GAP);
      }

      setQuietThreshold(quietVal);
      setMediumThreshold(mediumVal);


      if (storedAlarmUrl) {
        setAlarmSoundUrl(storedAlarmUrl);
        if (storedAlarmUrl.startsWith('data:audio')) {
          setFileName("Uploaded custom sound");
        } else if (storedAlarmUrl === DEFAULT_ALARM_SOUND_URL) {
          setFileName(null); // Ensure filename is null for default
        }
      } else {
        setAlarmSoundUrl(DEFAULT_ALARM_SOUND_URL); // Set default if nothing stored
        setFileName(null);
      }

      if (storedAlarmDelay) {
        const parsedDelay = parseInt(storedAlarmDelay, 10);
         if (!isNaN(parsedDelay) && parsedDelay >= MIN_ALARM_DELAY_SECONDS && parsedDelay <= MAX_ALARM_DELAY_SECONDS) {
            setAlarmDelaySeconds(parsedDelay);
        } else {
            setAlarmDelaySeconds(DEFAULT_ALARM_DELAY_SECONDS); 
        }
      } else {
        setAlarmDelaySeconds(DEFAULT_ALARM_DELAY_SECONDS);
      }

      if (storedAnimationStyle && animationStyles.some(style => style.id === storedAnimationStyle)) {
        setSelectedAnimationStyle(storedAnimationStyle);
      }
      if (storedAppTheme && appThemes.some(theme => theme.id === storedAppTheme)) {
        setSelectedAppTheme(storedAppTheme);
      }
      if (storedCustomAlarmMessage) {
        setCustomAlarmMessage(storedCustomAlarmMessage);
      } else {
        setCustomAlarmMessage(DEFAULT_CUSTOM_ALARM_MESSAGE);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (previewAudio) {
        previewAudio.pause();
        setPreviewAudio(null);
        setIsPreviewPlaying(false);
      }
    };
  }, [previewAudio]);

  useEffect(() => {
    return () => {
      if (fullPreviewAudioRef.current) {
        fullPreviewAudioRef.current.pause();
        fullPreviewAudioRef.current.removeAttribute('src');
        fullPreviewAudioRef.current.load();
        fullPreviewAudioRef.current = null;
        setIsFullAlarmPreviewPlaying(false);
      }
    };
  }, []);


   useEffect(() => {
    if (previewAudio) {
        previewAudio.pause();
        previewAudio.currentTime = 0;
        setPreviewAudio(null); 
        setIsPreviewPlaying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alarmSoundUrl]); 


  const handleQuietThresholdChange = (value: number[]) => {
    const newQuietThreshold = value[0];
    if (newQuietThreshold >= MIN_THRESHOLD && newQuietThreshold <= MAX_THRESHOLD) {
      setQuietThreshold(newQuietThreshold);
      if (mediumThreshold < newQuietThreshold + MIN_THRESHOLD_GAP) {
        setMediumThreshold(Math.min(MAX_THRESHOLD, newQuietThreshold + MIN_THRESHOLD_GAP));
      }
    }
  };

  const handleMediumThresholdChange = (value: number[]) => {
    const newMediumThreshold = value[0];
     if (newMediumThreshold >= MIN_THRESHOLD && newMediumThreshold <= MAX_THRESHOLD) {
      setMediumThreshold(newMediumThreshold);
      if (quietThreshold > newMediumThreshold - MIN_THRESHOLD_GAP) {
        setQuietThreshold(Math.max(MIN_THRESHOLD, newMediumThreshold - MIN_THRESHOLD_GAP));
      }
    }
  };

  const handleQuietInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(event.target.value, 10);
    if (isNaN(value) && event.target.value === '') {
        value = MIN_THRESHOLD; 
    } else if (isNaN(value)) {
        return; 
    }

    value = Math.max(MIN_THRESHOLD, Math.min(MAX_THRESHOLD, value));

    setQuietThreshold(value);
    if (mediumThreshold < value + MIN_THRESHOLD_GAP) {
      setMediumThreshold(Math.min(MAX_THRESHOLD, value + MIN_THRESHOLD_GAP));
    }
  };

  const handleMediumInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(event.target.value, 10);
     if (isNaN(value) && event.target.value === '') {
        value = quietThreshold + MIN_THRESHOLD_GAP; 
        if (value > MAX_THRESHOLD) value = MAX_THRESHOLD;
    } else if (isNaN(value)) {
        return; 
    }
    
    value = Math.max(MIN_THRESHOLD, Math.min(MAX_THRESHOLD, value));

    setMediumThreshold(value);
    if (quietThreshold > value - MIN_THRESHOLD_GAP) {
      setQuietThreshold(Math.max(MIN_THRESHOLD, value - MIN_THRESHOLD_GAP));
    }
  };


  const handleAlarmDelaySecondsChange = (value: number[]) => {
    const newDelay = value[0];
    if (newDelay >= MIN_ALARM_DELAY_SECONDS && newDelay <= MAX_ALARM_DELAY_SECONDS) {
      setAlarmDelaySeconds(newDelay);
    }
  };

  const handleAlarmDelayInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value >= MIN_ALARM_DELAY_SECONDS && value <= MAX_ALARM_DELAY_SECONDS) {
      setAlarmDelaySeconds(value);
    } else if (event.target.value === '') {
      setAlarmDelaySeconds(MIN_ALARM_DELAY_SECONDS); 
    }
  };

  const handleAlarmUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAlarmSoundUrl(event.target.value);
    setFileName(null); 
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({ title: "File too large", description: `Please select a file smaller than ${MAX_FILE_SIZE_MB}MB.`, variant: "destructive" });
        event.target.value = ''; 
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        setAlarmSoundUrl(dataUri);
        setFileName(file.name);
        toast({ title: "File loaded", description: `"${file.name}" will be used for alarms.` });
      };
      reader.onerror = () => {
          toast({ title: "Error reading file", description: "Could not load the selected file.", variant: "destructive" });
          event.target.value = ''; 
          setFileName(null);
      }
      reader.readAsDataURL(file);
    }
  };

  const handleUseDefaultSound = () => {
    setAlarmSoundUrl(DEFAULT_ALARM_SOUND_URL);
    setFileName(null);
    toast({ title: "Alarm Sound Reset", description: "Using default alarm sound." });
  };

  const handlePreviewToggle = () => {
    if (isFullAlarmPreviewPlaying && fullPreviewAudioRef.current) { 
      fullPreviewAudioRef.current.pause();
      fullPreviewAudioRef.current.currentTime = 0;
      setIsFullAlarmPreviewPlaying(false);
    }

    if (isPreviewPlaying && previewAudio) {
      previewAudio.pause();
      previewAudio.currentTime = 0;
      setIsPreviewPlaying(false);
    } else {
      if (!alarmSoundUrl) {
        toast({ title: "No sound selected", description: "Please enter a URL or upload a file.", variant: "destructive" });
        return;
      }

      const audio = new Audio(alarmSoundUrl);
      audio.oncanplaythrough = () => {
        audio.play().catch(err => {
          console.error("Error playing preview:", err);
          toast({ title: "Playback Error", description: "Could not play the audio. Check URL/file or browser permissions.", variant: "destructive" });
          setIsPreviewPlaying(false);
        });
      };
      audio.onended = () => {
        setIsPreviewPlaying(false);
      };
      audio.onerror = (e) => {
        console.error("Error loading audio for preview:", e);
        let description = "Could not load the audio. Ensure the URL is correct and accessible, or the file is valid.";
        if (typeof e === 'object' && e !== null && 'message' in e && typeof e.message === 'string') {
            if (e.message.includes("MEDIA_ERR_SRC_NOT_SUPPORTED")) {
                description = "Audio format not supported or URL invalid.";
            }
        }
        toast({ title: "Audio Load Error", description, variant: "destructive" });
        setIsPreviewPlaying(false);
        setPreviewAudio(null); 
      };

      setPreviewAudio(audio);
      setIsPreviewPlaying(true);
    }
  };

  const handleFullAlarmPreviewToggle = () => {
    if (isPreviewPlaying && previewAudio) { 
        previewAudio.pause();
        previewAudio.currentTime = 0;
        setIsPreviewPlaying(false);
    }

    if (isFullAlarmPreviewPlaying && fullPreviewAudioRef.current) {
      fullPreviewAudioRef.current.pause();
      fullPreviewAudioRef.current.removeAttribute('src'); 
      fullPreviewAudioRef.current.load(); 
      setIsFullAlarmPreviewPlaying(false);
    } else {
      if (!alarmSoundUrl) {
        toast({ title: "No sound selected", description: "Please enter a URL or upload a file for the alarm.", variant: "destructive" });
        return;
      }
      if (!customAlarmMessage.trim()) {
        toast({ title: "No message set", description: "Please enter a custom alarm message.", variant: "destructive" });
        return;
      }

      const audio = fullPreviewAudioRef.current || new Audio();
      if (!fullPreviewAudioRef.current) {
          fullPreviewAudioRef.current = audio;
      }
      
      audio.src = alarmSoundUrl;
      audio.loop = true;

      audio.oncanplaythrough = () => {
        audio.play().catch(err => {
          console.error("Error playing full alarm preview:", err);
          toast({ title: "Playback Error", description: "Could not play the alarm simulation. Check URL/file or browser permissions.", variant: "destructive" });
          setIsFullAlarmPreviewPlaying(false);
        });
      };
      audio.onerror = (e) => {
        console.error("Error loading audio for full alarm preview:", e);
        toast({ title: "Audio Load Error", description: "Could not load the audio for alarm simulation. Ensure the URL is correct and accessible, or the file is valid.", variant: "destructive" });
        setIsFullAlarmPreviewPlaying(false);
      };
      
      audio.load(); 
      setIsFullAlarmPreviewPlaying(true);
    }
  };


  const handleSaveChanges = () => {
    let finalQuiet = quietThreshold;
    let finalMedium = mediumThreshold;

    if (finalMedium < finalQuiet + MIN_THRESHOLD_GAP) {
        finalMedium = Math.min(MAX_THRESHOLD, finalQuiet + MIN_THRESHOLD_GAP);
    }
    if (finalQuiet > finalMedium - MIN_THRESHOLD_GAP) {
        finalQuiet = Math.max(MIN_THRESHOLD, finalMedium - MIN_THRESHOLD_GAP);
    }
    
    setQuietThreshold(finalQuiet);
    setMediumThreshold(finalMedium);

    if (typeof window !== 'undefined' && localStorage) {
      localStorage.setItem(QUIET_THRESHOLD_KEY, finalQuiet.toString());
      localStorage.setItem(MEDIUM_THRESHOLD_KEY, finalMedium.toString());
      localStorage.setItem(ALARM_SOUND_URL_KEY, alarmSoundUrl);
      localStorage.setItem(ALARM_DELAY_SECONDS_KEY, alarmDelaySeconds.toString());
      localStorage.setItem(ANIMATION_STYLE_KEY, selectedAnimationStyle);
      localStorage.setItem(APP_THEME_KEY, selectedAppTheme);
      localStorage.setItem(CUSTOM_ALARM_MESSAGE_KEY, customAlarmMessage);
    }
    if (previewAudio && isPreviewPlaying) {
      previewAudio.pause();
      setIsPreviewPlaying(false);
    }
    if (fullPreviewAudioRef.current && isFullAlarmPreviewPlaying) {
      fullPreviewAudioRef.current.pause();
      setIsFullAlarmPreviewPlaying(false);
    }

    const selectedAnimStyleName = animationStyles.find(s => s.id === selectedAnimationStyle)?.name || selectedAnimationStyle;
    const selectedThemeName = appThemes.find(t => t.id === selectedAppTheme)?.name || selectedAppTheme;

    toast({
      title: "Settings Saved",
      description: `Thresholds: ${finalQuiet}/${finalMedium}. Alarm: ${fileName || (alarmSoundUrl === DEFAULT_ALARM_SOUND_URL ? 'Default Sound' : (alarmSoundUrl.startsWith('data:') ? 'Custom Uploaded Sound' : alarmSoundUrl))}, Delay: ${alarmDelaySeconds}s. Animation: ${selectedAnimStyleName}. Theme: ${selectedThemeName}. Message: "${customAlarmMessage.substring(0,30)}..."`,
    });
    router.push('/');
  };

  const handleCancel = () => {
    if (previewAudio && isPreviewPlaying) {
      previewAudio.pause();
      setIsPreviewPlaying(false);
    }
    if (fullPreviewAudioRef.current && isFullAlarmPreviewPlaying) {
      fullPreviewAudioRef.current.pause();
      setIsFullAlarmPreviewPlaying(false);
    }
    router.push('/');
  };

  if (!isClient) {
    return null; 
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto shadow-xl overflow-hidden">
        <CardHeader className="text-center bg-card p-6">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4 mx-auto w-fit">
             <ShieldCheck size={48} className="text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Admin Settings</CardTitle>
          <CardDescription>Manage noise levels, alarm, and application appearance.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 p-6 md:p-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground border-b pb-2">Noise Thresholds</h3>
            <div className="space-y-6 pt-2">
              <div className="space-y-2">
                <Label htmlFor="quiet-threshold" className="text-base font-medium">Quiet Threshold</Label>
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <Slider
                    id="quiet-threshold"
                    value={[quietThreshold]}
                    max={MAX_THRESHOLD}
                    step={1}
                    className="flex-1"
                    aria-label="Quiet threshold slider"
                    onValueChange={handleQuietThresholdChange}
                  />
                  <Input
                    type="number"
                    value={quietThreshold}
                    onChange={handleQuietInputChange}
                    className="w-20 text-center"
                    min={MIN_THRESHOLD}
                    max={MAX_THRESHOLD}
                    aria-label="Quiet threshold input"
                  />
                </div>
                <p className="text-sm text-muted-foreground">Maximum average volume (0-255) to be considered 'Quiet'.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="medium-threshold" className="text-base font-medium">Medium Threshold</Label>
                 <div className="flex items-center space-x-2 sm:space-x-4">
                  <Slider
                    id="medium-threshold"
                    value={[mediumThreshold]}
                    max={MAX_THRESHOLD}
                    step={1}
                    className="flex-1"
                    aria-label="Medium threshold slider"
                    onValueChange={handleMediumThresholdChange}
                  />
                  <Input
                    type="number"
                    value={mediumThreshold}
                    onChange={handleMediumInputChange}
                    className="w-20 text-center"
                    min={MIN_THRESHOLD}
                    max={MAX_THRESHOLD}
                    aria-label="Medium threshold input"
                  />
                </div>
                <p className="text-sm text-muted-foreground">Maximum average volume (0-255) to be considered 'Medium'. Above this is 'Noisy'. Min {MIN_THRESHOLD_GAP} units above Quiet.</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground border-b pb-2">Alarm Configuration</h3>
            <div className="space-y-2 pt-2">
              <Label htmlFor="alarm-url" className="text-base font-medium">Alarm Sound URL</Label>
              <div className="flex items-center space-x-2">
                <LinkIcon className="h-5 w-5 text-muted-foreground" />
                <Input
                  id="alarm-url"
                  type="text"
                  value={alarmSoundUrl.startsWith('data:audio') ? '(Uploaded File - Custom Sound)' : alarmSoundUrl}
                  onChange={handleAlarmUrlChange}
                  placeholder="Enter audio URL or upload a file"
                  className="flex-1"
                  aria-label="Alarm sound URL"
                  readOnly={alarmSoundUrl.startsWith('data:audio')}
                />
              </div>
               {fileName && <p className="text-sm text-muted-foreground">Using uploaded file: {fileName}</p>}
               {!fileName && alarmSoundUrl === DEFAULT_ALARM_SOUND_URL && (
                  <p className="text-sm text-muted-foreground">Currently using default alarm sound ({DEFAULT_ALARM_SOUND_URL}).</p>
               )}
                {!fileName && alarmSoundUrl !== DEFAULT_ALARM_SOUND_URL && !alarmSoundUrl.startsWith('data:audio') && (
                  <p className="text-sm text-muted-foreground">Using custom URL: {alarmSoundUrl}</p>
                )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex-1 space-y-2">
                    <Label htmlFor="alarm-file-upload" className="text-base font-medium">Upload Custom Alarm Sound</Label>
                    <div className="flex items-center space-x-2">
                        <UploadCloud className="h-5 w-5 text-muted-foreground" />
                        <Input
                        id="alarm-file-upload"
                        type="file"
                        accept="audio/mpeg, audio/ogg, audio/wav, audio/mp3"
                        onChange={handleFileChange}
                        className="flex-1"
                        aria-label="Upload custom alarm sound"
                        />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Or upload an audio file (MP3, OGG, WAV - Max {MAX_FILE_SIZE_MB}MB).
                    </p>
                </div>
                <Button onClick={handleUseDefaultSound} variant="outline" className="sm:ml-auto mt-2 sm:mt-6">
                    <RotateCcw className="mr-2 h-4 w-4" /> Use Default Sound
                </Button>
            </div>

            <div className="space-y-2">
                <Label htmlFor="alarm-delay" className="text-base font-medium">Alarm Delay (Seconds)</Label>
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <Timer className="h-5 w-5 text-muted-foreground" />
                    <Slider
                        id="alarm-delay-slider"
                        value={[alarmDelaySeconds]}
                        min={MIN_ALARM_DELAY_SECONDS}
                        max={MAX_ALARM_DELAY_SECONDS}
                        step={1}
                        className="flex-1"
                        aria-label="Alarm delay slider"
                        onValueChange={handleAlarmDelaySecondsChange}
                    />
                    <Input
                        type="number"
                        id="alarm-delay-input"
                        value={alarmDelaySeconds}
                        onChange={handleAlarmDelayInputChange}
                        className="w-20 text-center"
                        min={MIN_ALARM_DELAY_SECONDS}
                        max={MAX_ALARM_DELAY_SECONDS}
                        aria-label="Alarm delay input"
                    />
                </div>
                <p className="text-sm text-muted-foreground">
                    Delay before alarm sounds when 'Noisy' ({MIN_ALARM_DELAY_SECONDS}-{MAX_ALARM_DELAY_SECONDS}s). Default is {DEFAULT_ALARM_DELAY_SECONDS}s.
                </p>
            </div>
            <div className="space-y-2 pt-2">
                <Label htmlFor="custom-alarm-message" className="text-base font-medium flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5 text-muted-foreground" /> Custom Alarm Message
                </Label>
                <Textarea
                    id="custom-alarm-message"
                    value={customAlarmMessage}
                    onChange={(e) => setCustomAlarmMessage(e.target.value)}
                    placeholder="Enter custom message shown when alarm is active"
                    className="flex-1"
                    aria-label="Custom alarm message"
                    rows={3}
                />
                <p className="text-sm text-muted-foreground">
                    This message will be displayed on the homepage when the alarm is active.
                </p>
            </div>
            <div className="pt-2 space-x-2">
              <Button onClick={handlePreviewToggle} variant="outline" disabled={!alarmSoundUrl}>
                {isPreviewPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                {isPreviewPlaying ? 'Stop Sound' : 'Preview Sound'}
              </Button>
              <Button onClick={handleFullAlarmPreviewToggle} variant="outline" disabled={!alarmSoundUrl || !customAlarmMessage.trim()}>
                {isFullAlarmPreviewPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                {isFullAlarmPreviewPlaying ? 'Stop Simulation' : 'Simulate Alarm'}
              </Button>
            </div>

            {isFullAlarmPreviewPlaying && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Alarm Simulation Active</AlertTitle>
                <AlertDescription>
                  {customAlarmMessage}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground border-b pb-2">Appearance Settings</h3>
            <div className="space-y-6 pt-2">
              <div className="space-y-2">
                <Label htmlFor="app-theme" className="text-base font-medium flex items-center">
                  <Palette className="mr-2 h-5 w-5 text-muted-foreground" /> Application Theme
                </Label>
                <Select value={selectedAppTheme} onValueChange={(value) => setSelectedAppTheme(value as AppThemeId)}>
                  <SelectTrigger id="app-theme" className="w-full" aria-label="Application theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {appThemes.map(theme => (
                      <SelectItem key={theme.id} value={theme.id}>{theme.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">Choose the overall color scheme for the application.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="animation-style" className="text-base font-medium flex items-center">
                  <Film className="mr-2 h-5 w-5 text-muted-foreground" /> Noise Display Animation
                </Label>
                <Select value={selectedAnimationStyle} onValueChange={(value) => setSelectedAnimationStyle(value as AnimationStyleId)}>
                  <SelectTrigger id="animation-style" className="w-full" aria-label="Noise display animation style">
                    <SelectValue placeholder="Select animation style" />
                  </SelectTrigger>
                  <SelectContent>
                    {animationStyles.map(style => (
                      <SelectItem key={style.id} value={style.id}>{style.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">Select the animation style for the noise level indicator.</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex justify-end pt-6 space-x-4">
            <Button
              variant="outline"
              size="lg"
              className="text-base px-8 py-3"
              onClick={handleCancel}
            >
              <XCircle className="mr-2 h-5 w-5" />
              Cancel
            </Button>
            <Button
              size="lg"
              className="text-base px-8 py-3"
              onClick={handleSaveChanges}
            >
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

