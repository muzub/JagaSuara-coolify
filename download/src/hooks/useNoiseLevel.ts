
"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import type { NoiseLevel } from '@/types';

const QUIET_THRESHOLD_KEY = 'quietude_quietThreshold';
const MEDIUM_THRESHOLD_KEY = 'quietude_mediumThreshold';
const ALARM_SOUND_URL_KEY = 'quietude_alarmSoundUrl';
const ALARM_DELAY_SECONDS_KEY = 'quietude_alarmDelaySeconds';
const CUSTOM_ALARM_MESSAGE_KEY = 'quietude_customAlarmMessage';


const DEFAULT_QUIET_THRESHOLD = 25;
const DEFAULT_MEDIUM_THRESHOLD = 60;
const DEFAULT_ALARM_SOUND_URL = 'https://soundbible.com/grab.php?id=1598&type=mp3';
const DEFAULT_ALARM_DELAY_SECONDS = 2;
const DEFAULT_CUSTOM_ALARM_MESSAGE = "Mohon Tenang. Alarm akan berhenti jika suasana kembali tenang.";
const MIN_ALARM_DELAY_SECONDS_VALIDATION = 1;
const MAX_ALARM_DELAY_SECONDS_VALIDATION = 30;
const QUIET_STATE_SUSTAINED_DURATION_MS = 10000; // 10 seconds

export function useNoiseLevel() {
  const [noiseLevel, setNoiseLevel] = useState<NoiseLevel>('Idle');
  const [currentVolume, setCurrentVolume] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  const [alarmMessage, setAlarmMessage] = useState<string | null>(null);

  const [quietThreshold, setQuietThreshold] = useState(DEFAULT_QUIET_THRESHOLD);
  const [mediumThreshold, setMediumThreshold] = useState(DEFAULT_MEDIUM_THRESHOLD);
  const [alarmTriggerDelayMs, setAlarmTriggerDelayMs] = useState(DEFAULT_ALARM_DELAY_SECONDS * 1000);
  const customAlarmMessageRef = useRef<string>(DEFAULT_CUSTOM_ALARM_MESSAGE);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  const noisyStateStartTimeRef = useRef<number | null>(null);
  const quietStateStartTimeRef = useRef<number | null>(null);
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null);
  const isAlarmCurrentlyPlayingRef = useRef<boolean>(false);
  const isPlayPendingRef = useRef<boolean>(false);
  const isMonitoringRef = useRef(isMonitoring);

  useEffect(() => {
    isMonitoringRef.current = isMonitoring;
    console.log(`[isMonitoringEffect] isMonitoring state changed to: ${isMonitoring}, isMonitoringRef.current is now: ${isMonitoringRef.current}`);
  }, [isMonitoring]);

  const stopAlarmSound = useCallback(() => {
    console.log('[stopAlarmSound] Attempting to stop alarm.');
    isPlayPendingRef.current = false;

    if (alarmAudioRef.current) {
      console.log('[stopAlarmSound] Audio element exists. Pausing, resetting src, loading, and nullifying.');
      alarmAudioRef.current.pause();
      alarmAudioRef.current.currentTime = 0;
      alarmAudioRef.current.removeAttribute('src'); 
      alarmAudioRef.current.load(); 
      alarmAudioRef.current = null;
    } else {
      console.log('[stopAlarmSound] No audio element to stop.');
    }
    isAlarmCurrentlyPlayingRef.current = false;
    // Only set alarmMessage to null if we are truly stopping, not just changing sound.
    // This might need refinement if stopAlarmSound is called during sound URL changes.
    setAlarmMessage(null); 
  }, [setAlarmMessage]);

  const playAlarmSound = useCallback(() => {
    if (isAlarmCurrentlyPlayingRef.current || isPlayPendingRef.current) {
      console.log('[playAlarmSound] Aborted: Alarm already playing or play pending.');
      return;
    }
    console.log('[playAlarmSound] Attempting to play alarm.');
    isPlayPendingRef.current = true;

    let soundUrl = DEFAULT_ALARM_SOUND_URL;
    if (typeof window !== 'undefined' && localStorage) {
      const storedUrl = localStorage.getItem(ALARM_SOUND_URL_KEY);
      soundUrl = (storedUrl && storedUrl.trim() !== '') ? storedUrl : DEFAULT_ALARM_SOUND_URL;
    }
    console.log(`[playAlarmSound] Using URL: ${soundUrl}`);
    
    const currentCustomMessage = customAlarmMessageRef.current || DEFAULT_CUSTOM_ALARM_MESSAGE;
    console.log(`[playAlarmSound] Using alarm message: "${currentCustomMessage}"`);


    if (alarmAudioRef.current) {
        console.log('[playAlarmSound] Existing audio object found. Cleaning up before creating a new one.');
        alarmAudioRef.current.pause();
        alarmAudioRef.current.removeAttribute('src');
        alarmAudioRef.current.load();
        alarmAudioRef.current = null;
    }

    console.log('[playAlarmSound] Creating new Audio object.');
    alarmAudioRef.current = new Audio(soundUrl);
    alarmAudioRef.current.loop = true;

    alarmAudioRef.current.oncanplaythrough = () => {
      console.log('[AudioEvent] oncanplaythrough: Audio can play through.');
    };
    alarmAudioRef.current.onloadeddata = () => {
      console.log('[AudioEvent] onloadeddata: Audio data loaded.');
    };
    alarmAudioRef.current.onended = () => { 
      console.log('[AudioEvent] onended: Audio ended (should not happen with loop=true).');
      isAlarmCurrentlyPlayingRef.current = false;
      isPlayPendingRef.current = false; 
      setAlarmMessage(null);
    };
    alarmAudioRef.current.onerror = (e) => {
      console.error("[AudioEvent] onerror: Alarm audio element error:", e, alarmAudioRef.current?.error);
      let errorDetail = "Unknown audio error.";
        if (alarmAudioRef.current?.error) {
            switch(alarmAudioRef.current.error.code) {
                case MediaError.MEDIA_ERR_ABORTED: errorDetail = "Playback aborted by user or script."; break;
                case MediaError.MEDIA_ERR_NETWORK: errorDetail = "A network error occurred causing the audio download to fail."; break;
                case MediaError.MEDIA_ERR_DECODE: errorDetail = "The audio playback was aborted due to a corruption problem or because the audio used features your browser did not support."; break;
                case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED: errorDetail = "The audio could not be loaded, either because the server or network failed or because the format is not supported."; break;
                default: errorDetail = `An unknown error occurred (code ${alarmAudioRef.current.error.code}).`;
            }
        }
      setError(`Alarm sound error: ${errorDetail} Check URL/file, network, CORS settings & console.`);
      isAlarmCurrentlyPlayingRef.current = false;
      isPlayPendingRef.current = false;
      setAlarmMessage(null); 
      if (alarmAudioRef.current) { 
           alarmAudioRef.current.pause();
           alarmAudioRef.current = null;
      }
    };

    console.log('[playAlarmSound] Initiating play command...');
    const playPromise = alarmAudioRef.current.play();

    if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log('[playAlarmSound] Playback started successfully via promise.');
          isAlarmCurrentlyPlayingRef.current = true;
          console.log(`[playAlarmSound] Setting alarm message to: "${currentCustomMessage}"`);
          setAlarmMessage(currentCustomMessage); // Set message when play is successful
        }).catch(playError => {
          console.error("[playAlarmSound] Error playing alarm sound via promise:", playError);
          setError(`Could not play alarm: ${playError.message}. Check browser autoplay policies & console.`);
          isAlarmCurrentlyPlayingRef.current = false;
          setAlarmMessage(null); // Clear message on error
          if (alarmAudioRef.current) { 
              alarmAudioRef.current.pause();
              alarmAudioRef.current = null;
          }
        }).finally(() => {
          console.log('[playAlarmSound] Play promise finished (finally block).');
          isPlayPendingRef.current = false; 
        });
    } else {
       // This case should ideally not happen with modern browsers for `audio.play()`
       console.warn('[playAlarmSound] Audio playback initiation did not return a promise. This is unexpected.');
       isPlayPendingRef.current = false; 
       isAlarmCurrentlyPlayingRef.current = false; 
       setAlarmMessage(null); // Clear message
       setError("Audio playback initiation issue (no promise).");
    }
  }, [setError, setAlarmMessage]);

  const loadSettingsFromLocalStorage = useCallback(() => {
    console.log('[Settings] Loading settings from localStorage.');
    if (typeof window !== 'undefined' && localStorage) {
      const storedQuiet = localStorage.getItem(QUIET_THRESHOLD_KEY);
      const storedMedium = localStorage.getItem(MEDIUM_THRESHOLD_KEY);
      const storedAlarmDelay = localStorage.getItem(ALARM_DELAY_SECONDS_KEY);
      const storedCustomMessage = localStorage.getItem(CUSTOM_ALARM_MESSAGE_KEY);

      let quietVal = DEFAULT_QUIET_THRESHOLD;
      if (storedQuiet) {
        const parsed = parseInt(storedQuiet, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 255) quietVal = parsed;
        else console.warn(`[Settings] Invalid quiet threshold in localStorage: ${storedQuiet}`);
      }
      setQuietThreshold(quietVal);
      console.log(`[Settings] Quiet threshold set to: ${quietVal}`);

      let mediumVal = DEFAULT_MEDIUM_THRESHOLD;
      if (storedMedium) {
        const parsed = parseInt(storedMedium, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 255) mediumVal = parsed;
        else console.warn(`[Settings] Invalid medium threshold in localStorage: ${storedMedium}`);
      }
      // Ensure medium is always greater than quiet
      if (mediumVal <= quietVal) {
        mediumVal = quietVal + 1 > 255 ? 255 : quietVal + 1;
        console.warn(`[Settings] Medium threshold was <= quiet. Adjusted to: ${mediumVal}`);
      }
      setMediumThreshold(mediumVal);
      console.log(`[Settings] Medium threshold set to: ${mediumVal}`);


      let delaySecondsVal = DEFAULT_ALARM_DELAY_SECONDS;
      if (storedAlarmDelay) {
        const parsed = parseInt(storedAlarmDelay, 10);
        if (!isNaN(parsed) && parsed >= MIN_ALARM_DELAY_SECONDS_VALIDATION && parsed <= MAX_ALARM_DELAY_SECONDS_VALIDATION) {
           delaySecondsVal = parsed;
        } else {
            console.warn(`[Settings] Invalid alarm delay in localStorage: ${storedAlarmDelay}. Using default of ${DEFAULT_ALARM_DELAY_SECONDS}s.`);
            delaySecondsVal = DEFAULT_ALARM_DELAY_SECONDS; // Fallback to defined default
        }
      } else {
        delaySecondsVal = DEFAULT_ALARM_DELAY_SECONDS; // Fallback if nothing stored
      }
      
      // Final validation for delaySecondsVal to ensure it's within bounds after all parsing
      if (isNaN(delaySecondsVal) || delaySecondsVal < MIN_ALARM_DELAY_SECONDS_VALIDATION || delaySecondsVal > MAX_ALARM_DELAY_SECONDS_VALIDATION) {
        console.warn(`[Settings] Parsed alarm delay ${delaySecondsVal} is invalid after all checks. Resetting to default ${DEFAULT_ALARM_DELAY_SECONDS}s.`);
        delaySecondsVal = DEFAULT_ALARM_DELAY_SECONDS;
      }
      setAlarmTriggerDelayMs(delaySecondsVal * 1000);
      console.log(`[Settings] Alarm trigger delay set to: ${delaySecondsVal * 1000}ms (Value: ${delaySecondsVal})`);


      if (storedCustomMessage && storedCustomMessage.trim() !== '') {
        customAlarmMessageRef.current = storedCustomMessage;
        console.log(`[Settings] Custom alarm message set to: "${customAlarmMessageRef.current}"`);
      } else {
        customAlarmMessageRef.current = DEFAULT_CUSTOM_ALARM_MESSAGE;
        console.log(`[Settings] Custom alarm message set to default: "${customAlarmMessageRef.current}"`);
      }
    }
  }, []);

  const stopLogic = useCallback(() => {
    console.log('[stopLogic] Stopping all monitoring logic.');
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
      console.log('[stopLogic] Cancelled animation frame.');
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
      console.log('[stopLogic] Stopped media stream tracks.');
    }
    if (sourceRef.current) {
      try {
        // Check if audioContext exists and is not closed before trying to disconnect
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            sourceRef.current.disconnect();
            console.log('[stopLogic] Disconnected source node.');
        } else {
            console.log('[stopLogic] Source node not disconnected, AudioContext closed or null.');
        }
      } catch (e) {
         // Catch any potential errors during disconnection, though less likely with the check
         console.warn('[stopLogic] Error disconnecting source node:', e);
      }
      sourceRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
       audioContextRef.current.close().then(() => {
         console.log('[stopLogic] AudioContext closed successfully.');
       }).catch(err => console.warn('[stopLogic] Error closing AudioContext:', err));
       audioContextRef.current = null; // Ensure it's nulled after attempting to close
    } else if (audioContextRef.current && audioContextRef.current.state === 'closed') {
        console.log('[stopLogic] AudioContext was already closed.');
        audioContextRef.current = null; // Still ensure it's nulled
    }
    analyserRef.current = null;
    dataArrayRef.current = null;
    setCurrentVolume(null); // Reset volume display

    // Reset alarm-related states/refs
    noisyStateStartTimeRef.current = null;
    quietStateStartTimeRef.current = null;
    stopAlarmSound(); // This will also clear alarm message and stop sound

  }, [stopAlarmSound, setCurrentVolume]); // Added setCurrentVolume to dependencies

  const processAudio = useCallback(() => {
    console.log(`[processAudio] Entered. isMonitoring(ref): ${isMonitoringRef.current}, AudioContextState: ${audioContextRef.current?.state}`);
    console.log(`[processAudio] Checking canProcess: isMonitoringRef.current=${isMonitoringRef.current}, analyserRef.current=${!!analyserRef.current}, dataArrayRef.current=${!!dataArrayRef.current}, audioContextRef.current=${!!audioContextRef.current}, audioContextRef.current.state=${audioContextRef.current?.state}`);
    
    const canProcess = isMonitoringRef.current &&
                       analyserRef.current &&
                       dataArrayRef.current &&
                       audioContextRef.current &&
                       audioContextRef.current.state === 'running';

    if (canProcess) {
      console.log('[processAudio] DEBUG: Top of canProcess block.');
      let averageVolume;
      try {
        console.log('[processAudio] DEBUG: About to call getByteFrequencyData.');
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        console.log(`[processAudio] DEBUG: dataArray after getByteFrequencyData (first 5): ${Array.from(dataArrayRef.current.slice(0,5))}`);

        let sum = 0;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          sum += dataArrayRef.current[i];
        }
        averageVolume = dataArrayRef.current.length > 0 ? sum / dataArrayRef.current.length : 0;
        console.log(`[processAudio] DEBUG: Calculated sum: ${sum}, averageVolume: ${averageVolume}`);

      } catch (e) {
        console.error('[processAudio] Error during audio data processing:', e);
        setError('Error processing audio data.');
        stopLogic(); 
        setNoiseLevel('Error'); // Explicitly set to Error
        return; // Stop further processing in this frame
      }
      
      // console.log(`[processAudio] Frame - avgVol: ${averageVolume.toFixed(2)}, QTh: ${quietThreshold}, MTh: ${mediumThreshold}`);
      setCurrentVolume(averageVolume);

      let newNoiseLevel: NoiseLevel = 'Quiet';
      if (averageVolume < quietThreshold) {
        newNoiseLevel = 'Quiet';
      } else if (averageVolume < mediumThreshold) {
        newNoiseLevel = 'Medium';
      } else {
        newNoiseLevel = 'Noisy';
      }
      // console.log(`[processAudio] Calculated newNoiseLevel: ${newNoiseLevel}`);

      setNoiseLevel(prevLevel => {
        if (prevLevel !== newNoiseLevel) {
          // console.log(`[processAudio] State WILL change from ${prevLevel} to ${newNoiseLevel}`);
          return newNoiseLevel;
        }
        // console.log(`[processAudio] State REMAINS ${prevLevel}`);
        return prevLevel;
      });
      
      // Schedule next frame only if still monitoring
      if (isMonitoringRef.current) {
        animationFrameIdRef.current = requestAnimationFrame(processAudio);
      } else {
        console.log('[processAudio] Monitoring stopped during frame. Not scheduling next frame.');
      }
    } else {
      console.log(`[processAudio] Conditions for main audio processing not met (canProcess is false). isMonitoring(ref): ${isMonitoringRef.current}, AudioContextState: ${audioContextRef.current?.state}, Analyser: ${!!analyserRef.current}, DataArray: ${!!dataArrayRef.current}`);
      // If monitoring is supposed to be active but context is not running, it's an error
      if (isMonitoringRef.current && audioContextRef.current && audioContextRef.current.state !== 'running') {
         console.warn("[processAudio] AudioContext is not running. This might lead to monitoring stopping or errors.");
         setError("Audio processing stopped: context not running. Please restart.");
         stopLogic(); // Stop everything if context is bad
         setNoiseLevel('Error'); // Set to Error state
         setCurrentVolume(null); // Reset volume display
      } else if (isMonitoringRef.current) {
        // If still monitoring but other conditions (analyser, dataArray) are missing, keep trying.
        console.log('[processAudio] Still monitoring, but refs/state not optimal for processing. Scheduling next frame.');
        animationFrameIdRef.current = requestAnimationFrame(processAudio);
      }
    }
  }, [quietThreshold, mediumThreshold, stopLogic, setError, setNoiseLevel, setCurrentVolume]);


  useEffect(() => {
    loadSettingsFromLocalStorage();
    const handleStorageChange = (event: StorageEvent) => {
      if (
        event.key === QUIET_THRESHOLD_KEY ||
        event.key === MEDIUM_THRESHOLD_KEY ||
        event.key === ALARM_DELAY_SECONDS_KEY ||
        event.key === ALARM_SOUND_URL_KEY ||
        event.key === CUSTOM_ALARM_MESSAGE_KEY
      ) {
        console.log(`[Settings] Storage changed for key: ${event.key}. Reloading settings.`);
        loadSettingsFromLocalStorage();
        // If alarm sound URL changes while alarm is playing, stop the current alarm.
        // The new sound will be picked up if the alarm condition re-triggers.
        if (event.key === ALARM_SOUND_URL_KEY && isAlarmCurrentlyPlayingRef.current) {
            console.log("[Settings] Alarm sound URL changed while alarm playing. Stopping current alarm.");
            stopAlarmSound(); // This should also clear the alarm message
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadSettingsFromLocalStorage, stopAlarmSound]); // Added stopAlarmSound to dependencies

  useEffect(() => {
    console.log(`[AlarmEffect] Current State - noiseLevel: ${noiseLevel}, isMonitoring: ${isMonitoring}, alarmPlaying: ${isAlarmCurrentlyPlayingRef.current}, alarmTriggerDelayMs: ${alarmTriggerDelayMs}`);

    let noisyTimerId: NodeJS.Timeout | null = null;
    let quietTimerId: NodeJS.Timeout | null = null;

    const clearAllIntervals = () => {
        if (noisyTimerId) clearInterval(noisyTimerId);
        if (quietTimerId) clearInterval(quietTimerId);
        noisyTimerId = null;
        quietTimerId = null;
    };

    if (isMonitoring) {
        if (noiseLevel === 'Noisy') {
            clearAllIntervals(); // Clear any existing quiet timer
            quietStateStartTimeRef.current = null; // Reset quiet timer start time

            if (noisyStateStartTimeRef.current === null) {
                noisyStateStartTimeRef.current = Date.now();
                console.log(`[AlarmEffect] Became Noisy. Initialized noisyStateStartTimeRef: ${noisyStateStartTimeRef.current}. Delay: ${alarmTriggerDelayMs}ms`);
            }

            // Use setInterval to periodically check if the noisy duration has been met
            noisyTimerId = setInterval(() => {
                if (!isMonitoringRef.current || noiseLevel !== 'Noisy' || noisyStateStartTimeRef.current === null) {
                    console.log(`[AlarmEffect Noisy Interval] Condition no longer met (monitoring: ${isMonitoringRef.current}, level: ${noiseLevel}). Clearing interval.`);
                    if(noisyTimerId) clearInterval(noisyTimerId); // Clear self
                    noisyStateStartTimeRef.current = null; // Reset if not noisy anymore or not monitoring
                    return;
                }

                const timeSpentNoisy = Date.now() - noisyStateStartTimeRef.current;
                console.log(`[AlarmEffect Noisy Interval] Checking. Time spent noisy: ${timeSpentNoisy}ms / ${alarmTriggerDelayMs}ms. Alarm playing: ${isAlarmCurrentlyPlayingRef.current}, Play pending: ${isPlayPendingRef.current}`);

                if (timeSpentNoisy >= alarmTriggerDelayMs && !isNaN(alarmTriggerDelayMs) && alarmTriggerDelayMs > 0) {
                    if (!isAlarmCurrentlyPlayingRef.current && !isPlayPendingRef.current) {
                        console.log('[AlarmEffect Noisy Interval] Noisy duration met. Calling playAlarmSound().');
                        playAlarmSound();
                    }
                }
            }, 250); // Check every 250ms

        } else if (noiseLevel === 'Quiet' || noiseLevel === 'Medium') {
            clearAllIntervals(); // Clear any existing noisy timer
            noisyStateStartTimeRef.current = null; // Reset noisy timer start time

            if (isAlarmCurrentlyPlayingRef.current) { // Only try to stop alarm if it's actually playing
                if (quietStateStartTimeRef.current === null) {
                    quietStateStartTimeRef.current = Date.now();
                    console.log(`[AlarmEffect] Became ${noiseLevel} while alarm playing. Initialized quietStateStartTimeRef: ${quietStateStartTimeRef.current}. Sustain: ${QUIET_STATE_SUSTAINED_DURATION_MS}ms`);
                }

                // Use setInterval to periodically check if quiet duration has been met
                quietTimerId = setInterval(() => {
                     if (!isMonitoringRef.current || !(noiseLevel === 'Quiet' || noiseLevel === 'Medium') || quietStateStartTimeRef.current === null || !isAlarmCurrentlyPlayingRef.current) {
                        console.log(`[AlarmEffect Quiet/Medium Interval] Condition no longer met (monitoring: ${isMonitoringRef.current}, level: ${noiseLevel}, alarm: ${isAlarmCurrentlyPlayingRef.current}). Clearing interval.`);
                        if(quietTimerId) clearInterval(quietTimerId); // Clear self
                        // quietStateStartTimeRef.current = null; // Reset if conditions not met, but careful not to reset if we are still trying to stop alarm
                        return;
                    }

                    const timeSpentQuietOrMedium = Date.now() - quietStateStartTimeRef.current;
                    console.log(`[AlarmEffect Quiet/Medium Interval] Checking. Time spent quiet/medium: ${timeSpentQuietOrMedium}ms / ${QUIET_STATE_SUSTAINED_DURATION_MS}ms`);
                    if (timeSpentQuietOrMedium >= QUIET_STATE_SUSTAINED_DURATION_MS) {
                        console.log(`[AlarmEffect Quiet/Medium Interval] Quiet/Medium duration met. Stopping alarm.`);
                        stopAlarmSound();
                        quietStateStartTimeRef.current = null; // Important: reset after stopping alarm
                        if(quietTimerId) clearInterval(quietTimerId); // Stop this interval explicitly
                    }
                }, 250); // Check every 250ms for quiet duration
            } else {
                // Alarm is not playing, no need for quiet timer or its start time
                quietStateStartTimeRef.current = null;
            }
        } else { // Idle, Initializing, Error
            clearAllIntervals();
            noisyStateStartTimeRef.current = null;
            quietStateStartTimeRef.current = null;
            if (isAlarmCurrentlyPlayingRef.current || isPlayPendingRef.current) {
                console.log(`[AlarmEffect] Noise level ${noiseLevel}. Alarm was active/pending. Stopping alarm.`);
                stopAlarmSound();
            }
        }
    } else { // Not monitoring
        clearAllIntervals();
        noisyStateStartTimeRef.current = null;
        quietStateStartTimeRef.current = null;
        if (isAlarmCurrentlyPlayingRef.current || isPlayPendingRef.current) {
            console.log('[AlarmEffect] Monitoring stopped. Stopping alarm.');
            stopAlarmSound();
        }
    }

    return () => {
        console.log('[AlarmEffect Cleanup] Clearing all intervals.');
        clearAllIntervals();
    };
// isMonitoringRef.current is used inside setInterval, but the effect should re-run when isMonitoring (state) changes.
// noiseLevel is the primary driver for logic inside.
// alarmTriggerDelayMs can change from settings.
}, [isMonitoring, noiseLevel, alarmTriggerDelayMs, playAlarmSound, stopAlarmSound]);


  const startMonitoring = useCallback(async () => {
    console.log('[startMonitoring] Attempting to start monitoring.');
    
    if (isMonitoringRef.current || isPlayPendingRef.current) { 
        console.log('[startMonitoring] Already monitoring or alarm play pending. Aborting.');
        return;
    }

    loadSettingsFromLocalStorage(); // Load settings at the start

    setIsMonitoring(true); // This will trigger the isMonitoringRef.current update via useEffect
    setNoiseLevel('Initializing');
    setCurrentVolume(null);
    setError(null);
    setAlarmMessage(null); // Clear any previous alarm message

    try {
      console.log('[startMonitoring] Requesting microphone access.');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      mediaStreamRef.current = stream;
      console.log('[startMonitoring] Microphone access granted.');

      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        console.log('[startMonitoring] Creating new AudioContext.');
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Attempt to resume context if suspended (e.g., due to browser policies)
      if (audioContextRef.current.state === 'suspended') {
        console.log('[startMonitoring] AudioContext is suspended. Attempting to resume.');
        await audioContextRef.current.resume();
      }
      console.log(`[startMonitoring] AudioContext state after resume attempt: ${audioContextRef.current.state}`);


      if (audioContextRef.current.state === 'running') {
        sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256; // Smaller FFT size for faster response, adjust as needed
        analyserRef.current.smoothingTimeConstant = 0.3; // Some smoothing

        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);

        sourceRef.current.connect(analyserRef.current);
        console.log('[startMonitoring] Audio pipeline connected.');
        
        console.log(`[startMonitoring] About to schedule processAudio. Current isMonitoring state (from React): ${isMonitoring}, noiseLevel state (from React): ${noiseLevel}`); // isMonitoring state might be stale here
        animationFrameIdRef.current = requestAnimationFrame(processAudio);
        console.log('[startMonitoring] Started audio processing.');
      } else {
        console.error(`[startMonitoring] AudioContext is not running after attempt to resume. State: ${audioContextRef.current.state}. Stopping.`);
        setError("Could not start audio processing. AudioContext not running.");
        stopLogic(); // This will set isMonitoring to false and noiseLevel to 'Error' or 'Idle'
        // No need to call setNoiseLevel('Error') here as stopLogic handles it
      }

    } catch (err) {
      console.error("[startMonitoring] Error accessing microphone or setting up audio:", err, (err as Error).stack);
      let errorMessage = "Microphone access denied or an unknown error occurred.";
      if (err instanceof Error) {
        if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          errorMessage = "No microphone found. Please connect a microphone.";
        } else if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          errorMessage = "Microphone permission denied. Please allow access in your browser settings.";
        } else {
            errorMessage = `Microphone error: ${err.message}`;
        }
      }
      setError(errorMessage);
      stopLogic(); // This will set isMonitoring to false and noiseLevel to 'Error' or 'Idle'
    }
  }, [loadSettingsFromLocalStorage, processAudio, stopLogic, isMonitoring, noiseLevel]); // Added isMonitoring and noiseLevel

  const stopMonitoring = useCallback(() => {
    console.log('[stopMonitoring] Attempting to stop monitoring. Call stack sample:');
    // console.error(new Error("Stop monitoring call stack").stack?.substring(0, 1000) + '...');
    stopLogic();
    setIsMonitoring(false); // Explicitly set monitoring to false
    setNoiseLevel('Idle'); // Reset to Idle
    setError(null); // Clear any errors
    setCurrentVolume(null);
  }, [stopLogic]); // Removed setCurrentVolume, setNoiseLevel, setError from deps as stopLogic handles them

  // Cleanup effect for when the component unmounts
  useEffect(() => {
    return () => {
      console.log('[useNoiseLevel Unmount/Cleanup] Running cleanup.');
      stopLogic(); // Ensure everything is stopped and cleaned up
      // Additional cleanup for alarmAudioRef if it exists and has event listeners
      if (alarmAudioRef.current) {
        alarmAudioRef.current.pause();
        alarmAudioRef.current.removeAttribute('src');
        alarmAudioRef.current.load(); // Reset the audio element
        // Remove event listeners if they were added directly
        alarmAudioRef.current.oncanplaythrough = null;
        alarmAudioRef.current.onloadeddata = null;
        alarmAudioRef.current.onended = null;
        alarmAudioRef.current.onerror = null;
        alarmAudioRef.current.loop = false; // Ensure loop is off
        alarmAudioRef.current = null;
      }
      isAlarmCurrentlyPlayingRef.current = false;
      isPlayPendingRef.current = false;
    };
  }, [stopLogic]); // stopLogic is the main cleanup orchestrator

  return {
    noiseLevel,
    currentVolume,
    error,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    alarmMessage,
    playAlarmSound, // For preview button
    stopAlarmSound  // For preview button
  };
}

