
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
import { ShieldCheck, UploadCloud, Link as LinkIcon, Play, Pause, Timer, Palette, Film, XCircle, MessageSquare, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { AnimationStyle, AnimationStyleId, AppTheme, AppThemeId } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const MIN_THRESHOLD = 0;
const MAX_THRESHOLD = 255;
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const QUIET_THRESHOLD_KEY = 'quietude_quietThreshold';
const MEDIUM_THRESHOLD_KEY = 'quietude_mediumThreshold';
const ALARM_SOUND_URL_KEY = 'quietude_alarmSoundUrl';
const ALARM_DELAY_SECONDS_KEY = 'quietude_alarmDelaySeconds';
const ANIMATION_STYLE_KEY = 'quietude_animationStyle';
const APP_THEME_KEY = 'quietude_appTheme';
const CUSTOM_ALARM_MESSAGE_KEY = 'quietude_customAlarmMessage';


const DEFAULT_ALARM_SOUND_URL = 'https://soundbible.com/grab.php?id=1598&type=mp3';
const DEFAULT_ALARM_DELAY_SECONDS = 2; // Changed from 5 to 2
const MIN_ALARM_DELAY_SECONDS = 1;
const MAX_ALARM_DELAY_SECONDS = 30;
const DEFAULT_ANIMATION_STYLE_ID: AnimationStyleId = 'classic';
const DEFAULT_APP_THEME_ID: AppThemeId = 'system';
const DEFAULT_CUSTOM_ALARM_MESSAGE = "Mohon Tenang. Alarm akan berhenti jika suasana kembali tenang.";

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

  const [quietThreshold, setQuietThreshold] = useState(25);
  const [mediumThreshold, setMediumThreshold] = useState(60);
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


      if (storedQuiet) setQuietThreshold(parseInt(storedQuiet, 10));
      if (storedMedium) setMediumThreshold(parseInt(storedMedium, 10));
      if (storedAlarmUrl) {
        setAlarmSoundUrl(storedAlarmUrl);
        if (storedAlarmUrl.startsWith('data:audio')) {
          setFileName("Uploaded custom sound");
        }
      }
      if (storedAlarmDelay) setAlarmDelaySeconds(parseInt(storedAlarmDelay, 10));
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
    // Cleanup for single play preview
    return () => {
      if (previewAudio) {
        previewAudio.pause();
        setPreviewAudio(null);
        setIsPreviewPlaying(false);
      }
    };
  }, [previewAudio]);

  useEffect(() => {
    // Cleanup for full alarm simulation preview
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
    const newThreshold = value[0];
    if (newThreshold >= MIN_THRESHOLD && newThreshold <= MAX_THRESHOLD) {
      setQuietThreshold(newThreshold);
      if (newThreshold >= mediumThreshold) {
        setMediumThreshold(Math.min(MAX_THRESHOLD, newThreshold + 1));
      }
    }
  };

  const handleMediumThresholdChange = (value: number[]) => {
    const newThreshold = value[0];
     if (newThreshold >= MIN_THRESHOLD && newThreshold <= MAX_THRESHOLD) {
      setMediumThreshold(newThreshold);
      if (newThreshold <= quietThreshold) {
        setQuietThreshold(Math.max(MIN_THRESHOLD, newThreshold - 1));
      }
    }
  };

  const handleQuietInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value >= MIN_THRESHOLD && value <= MAX_THRESHOLD) {
      setQuietThreshold(value);
      if (value >= mediumThreshold) {
        setMediumThreshold(Math.min(MAX_THRESHOLD, value + 1));
      }
    } else if (event.target.value === '') {
      setQuietThreshold(0); // Or some other appropriate default for empty input
    }
  };

  const handleMediumInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value >= MIN_THRESHOLD && value <= MAX_THRESHOLD) {
      setMediumThreshold(value);
      if (value <= quietThreshold) {
        setQuietThreshold(Math.max(MIN_THRESHOLD, value - 1));
      }
    } else if (event.target.value === '') {
      setMediumThreshold(0); // Or some other appropriate default for empty input
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
      setAlarmDelaySeconds(MIN_ALARM_DELAY_SECONDS); // Default for empty input
    }
  };

  const handleAlarmUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAlarmSoundUrl(event.target.value);
    setFileName(null); // Clear file name if URL is manually changed
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({ title: "File too large", description: `Please select a file smaller than ${MAX_FILE_SIZE_MB}MB.`, variant: "destructive" });
        event.target.value = ''; // Clear the input
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
          event.target.value = ''; // Clear the input
          setFileName(null);
      }
      reader.readAsDataURL(file);
    }
  };

  const handlePreviewToggle = () => {
    if (isFullAlarmPreviewPlaying && fullPreviewAudioRef.current) { // Stop full preview if active
      fullPreviewAudioRef.current.pause();
      fullPreviewAudioRef.current.currentTime = 0;
      // No need to nullify fullPreviewAudioRef.current here, just stop it
      setIsFullAlarmPreviewPlaying(false);
    }

    if (isPreviewPlaying && previewAudio) {
      previewAudio.pause();
      previewAudio.currentTime = 0;
      setIsPreviewPlaying(false);
      // No need to nullify previewAudio here, just stop it
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
          setIsPreviewPlaying(false); // Ensure state is reset on error
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
        setPreviewAudio(null); // Nullify on error to allow re-creation
      };

      setPreviewAudio(audio);
      setIsPreviewPlaying(true);
    }
  };

  const handleFullAlarmPreviewToggle = () => {
    if (isPreviewPlaying && previewAudio) { // Stop single preview if active
        previewAudio.pause();
        previewAudio.currentTime = 0;
        setIsPreviewPlaying(false);
        // No need to nullify previewAudio here
    }

    if (isFullAlarmPreviewPlaying && fullPreviewAudioRef.current) {
      fullPreviewAudioRef.current.pause();
      fullPreviewAudioRef.current.removeAttribute('src'); // Important for re-use
      fullPreviewAudioRef.current.load(); // Reset
      // fullPreviewAudioRef.current = null; // Don't nullify if we might reuse it
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

      // Use existing audio ref if available, otherwise create new
      const audio = fullPreviewAudioRef.current || new Audio();
      if (!fullPreviewAudioRef.current) {
          fullPreviewAudioRef.current = audio;
      }
      
      audio.src = alarmSoundUrl; // Set src every time
      audio.loop = true;

      audio.oncanplaythrough = () => {
        audio.play().catch(err => {
          console.error("Error playing full alarm preview:", err);
          toast({ title: "Playback Error", description: "Could not play the alarm simulation. Check URL/file or browser permissions.", variant: "destructive" });
          setIsFullAlarmPreviewPlaying(false);
          // Don't nullify fullPreviewAudioRef.current here
        });
      };
      audio.onerror = (e) => {
        console.error("Error loading audio for full alarm preview:", e);
        toast({ title: "Audio Load Error", description: "Could not load the audio for alarm simulation. Ensure the URL is correct and accessible, or the file is valid.", variant: "destructive" });
        setIsFullAlarmPreviewPlaying(false);
        // Consider nullifying if error is severe: fullPreviewAudioRef.current = null;
      };
      
      audio.load(); // Explicitly load
      setIsFullAlarmPreviewPlaying(true);
    }
  };


  const handleSaveChanges = () => {
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.setItem(QUIET_THRESHOLD_KEY, quietThreshold.toString());
      localStorage.setItem(MEDIUM_THRESHOLD_KEY, mediumThreshold.toString());
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
      description: `Thresholds: ${quietThreshold}/${mediumThreshold}. Alarm: ${fileName || (alarmSoundUrl.startsWith('data:') ? 'Custom' : alarmSoundUrl)}, Delay: ${alarmDelaySeconds}s. Animation: ${selectedAnimStyleName}. Theme: ${selectedThemeName}. Message: "${customAlarmMessage.substring(0,30)}..."`,
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
    return null; // Or a loading spinner
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
                <p className="text-sm text-muted-foreground">Maximum average volume (0-255) to be considered 'Medium'. Above this is 'Noisy'.</p>
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
                  value={alarmSoundUrl.startsWith('data:audio') ? '(Uploaded File - Data URI)' : alarmSoundUrl}
                  onChange={handleAlarmUrlChange}
                  placeholder="Enter audio URL or upload a file"
                  className="flex-1"
                  aria-label="Alarm sound URL"
                  readOnly={alarmSoundUrl.startsWith('data:audio')}
                />
              </div>
               {fileName && <p className="text-sm text-muted-foreground">Current file: {fileName}</p>}
               {!alarmSoundUrl.startsWith('data:audio') && alarmSoundUrl === DEFAULT_ALARM_SOUND_URL && (
                  <p className="text-sm text-muted-foreground">Using default alarm sound.</p>
               )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="alarm-file-upload" className="text-base font-medium">Upload Custom Alarm Sound</Label>
              <div className="flex items-center space-x-2">
                <UploadCloud className="h-5 w-5 text-muted-foreground" />
                <Input
                  id="alarm-file-upload"
                  type="file"
                  accept="audio/mpeg, audio/ogg, audio/wav"
                  onChange={handleFileChange}
                  className="flex-1"
                  aria-label="Upload custom alarm sound"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Or upload an audio file (MP3, OGG, WAV - Max {MAX_FILE_SIZE_MB}MB). This will override the URL.
              </p>
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
                    Delay before alarm sounds when 'Noisy' ({MIN_ALARM_DELAY_SECONDS}-{MAX_ALARM_DELAY_SECONDS}s).
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

