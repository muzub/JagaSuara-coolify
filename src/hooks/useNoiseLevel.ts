
"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import type { NoiseLevel } from '@/types';

const QUIET_THRESHOLD_KEY = 'quietude_quietThreshold';
const MEDIUM_THRESHOLD_KEY = 'quietude_mediumThreshold';
const ALARM_SOUND_URL_KEY = 'quietude_alarmSoundUrl';
const ALARM_DELAY_SECONDS_KEY = 'quietude_alarmDelaySeconds';
const CUSTOM_ALARM_MESSAGE_KEY = 'quietude_customAlarmMessage';

const DEFAULT_QUIET_THRESHOLD = 40;
const DEFAULT_MEDIUM_THRESHOLD = 60;
const DEFAULT_ALARM_SOUND_URL = '/sounds/ding.mp3'; 
const DEFAULT_ALARM_DELAY_SECONDS = 2;
const DEFAULT_CUSTOM_ALARM_MESSAGE = "Jaga suara, demi suasana nyaman yang kondusif bagi semua.";
const MIN_ALARM_DELAY_SECONDS_VALIDATION = 1;
const MAX_ALARM_DELAY_SECONDS_VALIDATION = 30;
const QUIET_STATE_SUSTAINED_DURATION_MS = 10000; // 10 seconds
const MIN_THRESHOLD_GAP = 15;
const MAX_THRESHOLD = 255;
const MIN_THRESHOLD = 0;

export function useNoiseLevel() {
  const [noiseLevel, setNoiseLevel] = useState<NoiseLevel>('Idle');
  const [currentVolume, setCurrentVolume] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  const [alarmMessage, setAlarmMessage] = useState<string | null>(null);

  const quietThresholdRef = useRef(DEFAULT_QUIET_THRESHOLD);
  const mediumThresholdRef = useRef(DEFAULT_MEDIUM_THRESHOLD);
  
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
  }, [isMonitoring]);

  const loadSettingsFromLocalStorage = useCallback(() => {
    console.log('[Settings] Attempting to load settings from localStorage.');
    if (typeof window !== 'undefined' && localStorage) {
      const storedQuietStr = localStorage.getItem(QUIET_THRESHOLD_KEY);
      const storedMediumStr = localStorage.getItem(MEDIUM_THRESHOLD_KEY);
      const storedAlarmDelay = localStorage.getItem(ALARM_DELAY_SECONDS_KEY);
      const storedCustomMessage = localStorage.getItem(CUSTOM_ALARM_MESSAGE_KEY);

      console.log(`[Settings] Raw from localStorage - quiet: "${storedQuietStr}", medium: "${storedMediumStr}", delay: "${storedAlarmDelay}", customMessage: "${storedCustomMessage}"`);

      let quietVal = DEFAULT_QUIET_THRESHOLD;
      if (storedQuietStr) {
        const parsed = parseInt(storedQuietStr, 10);
        if (!isNaN(parsed) && parsed >= MIN_THRESHOLD && parsed <= MAX_THRESHOLD) quietVal = parsed;
        else console.warn(`[Settings] Invalid quiet threshold in localStorage: ${storedQuietStr}`);
      }
      console.log(`[Settings] Parsed quietVal (before gap adjust): ${quietVal}`);
      

      let mediumVal = DEFAULT_MEDIUM_THRESHOLD;
      if (storedMediumStr) {
        const parsed = parseInt(storedMediumStr, 10);
        if (!isNaN(parsed) && parsed >= MIN_THRESHOLD && parsed <= MAX_THRESHOLD) mediumVal = parsed;
        else console.warn(`[Settings] Invalid medium threshold in localStorage: ${storedMediumStr}`);
      }
      console.log(`[Settings] Parsed mediumVal (before gap adjust): ${mediumVal}`);
      
      if (mediumVal < quietVal + MIN_THRESHOLD_GAP) {
        mediumVal = Math.min(MAX_THRESHOLD, quietVal + MIN_THRESHOLD_GAP);
      }
       if (quietVal > mediumVal - MIN_THRESHOLD_GAP) {
        quietVal = Math.max(MIN_THRESHOLD, mediumVal - MIN_THRESHOLD_GAP);
      }
      console.log(`[Settings] Final quietVal (after gap adjust): ${quietVal}, mediumVal (after gap adjust): ${mediumVal}`);

      quietThresholdRef.current = quietVal;
      mediumThresholdRef.current = mediumVal;
      console.log(`[Settings] Refs updated: quietThresholdRef.current=${quietThresholdRef.current}, mediumThresholdRef.current=${mediumThresholdRef.current}`);
      

      let delaySecondsVal = DEFAULT_ALARM_DELAY_SECONDS;
      if (storedAlarmDelay) {
        const parsed = parseInt(storedAlarmDelay, 10);
        if (!isNaN(parsed) && parsed >= MIN_ALARM_DELAY_SECONDS_VALIDATION && parsed <= MAX_ALARM_DELAY_SECONDS_VALIDATION) {
           delaySecondsVal = parsed;
        } else {
            console.warn(`[Settings] Invalid alarm delay in localStorage: "${storedAlarmDelay}". Using default of ${DEFAULT_ALARM_DELAY_SECONDS}s.`);
            delaySecondsVal = DEFAULT_ALARM_DELAY_SECONDS;
        }
      } else {
        delaySecondsVal = DEFAULT_ALARM_DELAY_SECONDS;
      }
      setAlarmTriggerDelayMs(delaySecondsVal * 1000);
      console.log(`[Settings] Alarm trigger delay set to: ${delaySecondsVal * 1000}ms (Raw value: ${delaySecondsVal})`);

      if (storedCustomMessage && storedCustomMessage.trim() !== '') {
        customAlarmMessageRef.current = storedCustomMessage;
      } else {
        customAlarmMessageRef.current = DEFAULT_CUSTOM_ALARM_MESSAGE;
      }
      console.log(`[Settings] Custom alarm message ref set to: "${customAlarmMessageRef.current}"`);
    }
  }, []);


  const stopAlarmSound = useCallback(() => {
    console.log('[stopAlarmSound] Attempting to stop alarm.');
    isPlayPendingRef.current = false;

    if (alarmAudioRef.current) {
      console.log('[stopAlarmSound] Audio element exists. Pausing, resetting src, loading, and nullifying.');
      alarmAudioRef.current.pause();
      alarmAudioRef.current.currentTime = 0;
      if (alarmAudioRef.current.src && alarmAudioRef.current.src !== '') {
          alarmAudioRef.current.removeAttribute('src');
          alarmAudioRef.current.load(); 
      }
      alarmAudioRef.current = null; 
    } else {
      console.log('[stopAlarmSound] No audio element to stop.');
    }
    isAlarmCurrentlyPlayingRef.current = false;
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
        if (alarmAudioRef.current.src && alarmAudioRef.current.src !== '') {
            alarmAudioRef.current.removeAttribute('src');
            alarmAudioRef.current.load();
        }
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
    setAlarmMessage(currentCustomMessage || DEFAULT_CUSTOM_ALARM_MESSAGE);
    const playPromise = alarmAudioRef.current.play();

    if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log('[playAlarmSound] Playback started successfully via promise.');
          isAlarmCurrentlyPlayingRef.current = true;
        }).catch(playError => {
          console.error("[playAlarmSound] Error playing alarm sound via promise:", playError);
          setError(`Could not play alarm: ${playError.message}. Check browser autoplay policies & console.`);
          isAlarmCurrentlyPlayingRef.current = false;
          setAlarmMessage(null); 
          if (alarmAudioRef.current) {
              alarmAudioRef.current.pause();
              alarmAudioRef.current = null;
          }
        }).finally(() => {
          console.log('[playAlarmSound] Play promise finished (finally block).');
          isPlayPendingRef.current = false;
        });
    } else {
       console.warn('[playAlarmSound] Audio playback initiation did not return a promise. This is unexpected.');
       isPlayPendingRef.current = false;
       isAlarmCurrentlyPlayingRef.current = false;
       setAlarmMessage(null);
       setError("Audio playback initiation issue (no promise).");
    }
  }, [setError, setAlarmMessage]);


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
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            sourceRef.current.disconnect();
            console.log('[stopLogic] Disconnected source node.');
        } else {
            console.log('[stopLogic] Source node not disconnected, AudioContext closed or null.');
        }
      } catch (e) {
         console.warn('[stopLogic] Error disconnecting source node:', e);
      }
      sourceRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
       audioContextRef.current.close().then(() => {
         console.log('[stopLogic] AudioContext closed successfully.');
       }).catch(err => console.warn('[stopLogic] Error closing AudioContext:', err));
       audioContextRef.current = null;
    } else if (audioContextRef.current && audioContextRef.current.state === 'closed') {
        console.log('[stopLogic] AudioContext was already closed.');
        audioContextRef.current = null;
    }
    analyserRef.current = null;
    dataArrayRef.current = null;
    setCurrentVolume(null);

    noisyStateStartTimeRef.current = null;
    quietStateStartTimeRef.current = null;
    stopAlarmSound();

  }, [stopAlarmSound, setCurrentVolume]);

  const processAudio = useCallback(() => {
    const canProcess = isMonitoringRef.current &&
                       analyserRef.current &&
                       dataArrayRef.current &&
                       audioContextRef.current &&
                       audioContextRef.current.state === 'running';
    
    console.log(`[processAudio] Checking canProcess: isMonitoringRef.current=${isMonitoringRef.current}, analyserRef.current=${!!analyserRef.current}, dataArrayRef.current=${!!dataArrayRef.current}, audioContextRef.current=${!!audioContextRef.current}, audioContextRef.current.state=${audioContextRef.current?.state}`);

    if (canProcess) {
      console.log('[processAudio] DEBUG: Top of canProcess block.');
      console.log(`[processAudio] USING THRESHOLDS (REFS) - QTh: ${quietThresholdRef.current}, MTh: ${mediumThresholdRef.current}.`);
      
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
        setNoiseLevel('Error');
        return;
      }

      setCurrentVolume(averageVolume);

      let newNoiseLevel: NoiseLevel = 'Quiet';
      if (averageVolume < quietThresholdRef.current) {
        newNoiseLevel = 'Quiet';
      } else if (averageVolume < mediumThresholdRef.current) {
        newNoiseLevel = 'Medium';
      } else {
        newNoiseLevel = 'Noisy';
      }
      
      console.log(`[processAudio] Frame - avgVol: ${averageVolume.toFixed(2)}, QTh(ref): ${quietThresholdRef.current}, MTh(ref): ${mediumThresholdRef.current}, newLvl: ${newNoiseLevel}`);

      setNoiseLevel(prevLevel => {
        if (prevLevel !== newNoiseLevel) {
          console.log(`[processAudio] State WILL change from ${prevLevel} to ${newNoiseLevel}`);
          return newNoiseLevel;
        }
        console.log(`[processAudio] State REMAINS ${prevLevel} (new calculated: ${newNoiseLevel})`);
        return prevLevel;
      });

      if (isMonitoringRef.current) { 
        animationFrameIdRef.current = requestAnimationFrame(processAudio);
      } else {
        console.log('[processAudio] Monitoring stopped during frame (isMonitoringRef is false). Not scheduling next frame.');
      }
    } else {
      console.log(`[processAudio] Conditions for audio processing not met. isMonitoring(ref): ${isMonitoringRef.current}, AudioContextState: ${audioContextRef.current?.state}, Analyser: ${!!analyserRef.current}, DataArray: ${!!dataArrayRef.current}`);
      if (isMonitoringRef.current && audioContextRef.current && audioContextRef.current.state !== 'running') {
         console.warn("[processAudio] AudioContext is not running. This might lead to monitoring stopping or errors.");
         setError("Audio processing stopped: context not running. Please restart.");
         stopLogic();
         setNoiseLevel('Error');
         setCurrentVolume(null);
      } else if (isMonitoringRef.current) {
        console.log('[processAudio] Still monitoring (isMonitoringRef is true), but other refs/state not optimal for processing. Scheduling next frame anyway.');
        animationFrameIdRef.current = requestAnimationFrame(processAudio);
      }
    }
  }, [stopLogic, setError, setNoiseLevel, setCurrentVolume]); 

  useEffect(() => {
    console.log(`[AlarmEffect] Current State - noiseLevel: ${noiseLevel}, isMonitoring: ${isMonitoring}, isAlarmCurrentlyPlayingRef: ${isAlarmCurrentlyPlayingRef.current}, isPlayPendingRef: ${isPlayPendingRef.current}, alarmTriggerDelayMs: ${alarmTriggerDelayMs}`);
    
    let noisyTimerId: NodeJS.Timeout | null = null;
    let quietTimerId: NodeJS.Timeout | null = null;

    const clearAllTimers = () => {
        if (noisyTimerId) clearInterval(noisyTimerId);
        if (quietTimerId) clearInterval(quietTimerId);
        noisyTimerId = null;
        quietTimerId = null;
        console.log("[AlarmEffect] Cleared all timers.");
    };

    if (isMonitoring) {
        if (noiseLevel === 'Noisy') {
            console.log('[AlarmEffect] Noise level is Noisy.');
            clearAllTimers(); 
            quietStateStartTimeRef.current = null;

            if (noisyStateStartTimeRef.current === null) {
                noisyStateStartTimeRef.current = Date.now();
                console.log(`[AlarmEffect] Initialized noisyStateStartTimeRef: ${noisyStateStartTimeRef.current}. Delay for alarm: ${alarmTriggerDelayMs}ms`);
            }

            noisyTimerId = setInterval(() => {
                if (!isMonitoringRef.current || noiseLevel !== 'Noisy' || noisyStateStartTimeRef.current === null) {
                    console.log(`[AlarmEffect Noisy Interval] Condition no longer met (monitoring: ${isMonitoringRef.current}, level: ${noiseLevel}, noisyStart: ${noisyStateStartTimeRef.current}). Clearing interval.`);
                    clearAllTimers();
                    noisyStateStartTimeRef.current = null; 
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
            }, 250); 

        } else if (noiseLevel === 'Quiet' || noiseLevel === 'Medium') {
            console.log(`[AlarmEffect] Noise level is ${noiseLevel}.`);
            clearAllTimers(); 
            noisyStateStartTimeRef.current = null;

            if (isAlarmCurrentlyPlayingRef.current) { 
                if (quietStateStartTimeRef.current === null) {
                    quietStateStartTimeRef.current = Date.now();
                    console.log(`[AlarmEffect] Initialized quietStateStartTimeRef: ${quietStateStartTimeRef.current}. Sustain duration for stop: ${QUIET_STATE_SUSTAINED_DURATION_MS}ms`);
                }

                quietTimerId = setInterval(() => {
                     if (!isMonitoringRef.current || !(noiseLevel === 'Quiet' || noiseLevel === 'Medium') || quietStateStartTimeRef.current === null || !isAlarmCurrentlyPlayingRef.current) {
                        console.log(`[AlarmEffect Quiet/Medium Interval] Condition no longer met (monitoring: ${isMonitoringRef.current}, level: ${noiseLevel}, quietStart: ${quietStateStartTimeRef.current}, alarm: ${isAlarmCurrentlyPlayingRef.current}). Clearing interval.`);
                        clearAllTimers();
                        return;
                    }

                    const timeSpentQuietOrMedium = Date.now() - quietStateStartTimeRef.current;
                    console.log(`[AlarmEffect Quiet/Medium Interval] Checking. Time spent quiet/medium: ${timeSpentQuietOrMedium}ms / ${QUIET_STATE_SUSTAINED_DURATION_MS}ms`);
                    if (timeSpentQuietOrMedium >= QUIET_STATE_SUSTAINED_DURATION_MS) {
                        console.log(`[AlarmEffect Quiet/Medium Interval] Quiet/Medium duration met while alarm was playing. Stopping alarm.`);
                        stopAlarmSound();
                        quietStateStartTimeRef.current = null; 
                        clearAllTimers();
                    }
                }, 250); 
            } else {
                quietStateStartTimeRef.current = null;
            }
        } else { 
            console.log(`[AlarmEffect] Noise level is ${noiseLevel} (Idle, Initializing, or Error). Resetting all timers and stopping alarm if active.`);
            clearAllTimers();
            noisyStateStartTimeRef.current = null;
            quietStateStartTimeRef.current = null;
            if (isAlarmCurrentlyPlayingRef.current || isPlayPendingRef.current) {
                console.log(`[AlarmEffect] Alarm was active/pending. Stopping alarm due to ${noiseLevel} state.`);
                stopAlarmSound();
            }
        }
    } else { 
        console.log('[AlarmEffect] Not monitoring. Ensuring all timers are cleared and alarm is stopped.');
        clearAllTimers();
        noisyStateStartTimeRef.current = null;
        quietStateStartTimeRef.current = null;
        if (isAlarmCurrentlyPlayingRef.current || isPlayPendingRef.current) {
            console.log('[AlarmEffect] Monitoring stopped. Stopping alarm.');
            stopAlarmSound();
        }
    }

    return () => {
        console.log('[AlarmEffect Cleanup] Clearing all timers from useEffect return.');
        clearAllTimers();
    };
  }, [isMonitoring, noiseLevel, alarmTriggerDelayMs, playAlarmSound, stopAlarmSound]);


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
        if (event.key === ALARM_SOUND_URL_KEY && (isAlarmCurrentlyPlayingRef.current || isPlayPendingRef.current) ) {
            console.log("[Settings] Alarm sound URL changed while alarm playing/pending. Stopping current alarm.");
            stopAlarmSound(); 
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadSettingsFromLocalStorage, stopAlarmSound]);


  const startMonitoring = useCallback(async () => {
    console.log('[startMonitoring] Attempting to start monitoring.');
    
    if (isMonitoringRef.current || isPlayPendingRef.current) {
        console.log('[startMonitoring] Already monitoring or alarm play pending. Aborting.');
        return;
    }

    loadSettingsFromLocalStorage(); 

    setIsMonitoring(true); 
    isMonitoringRef.current = true; 
    setNoiseLevel('Initializing');
    setCurrentVolume(null);
    setError(null);
    setAlarmMessage(null); 

    console.log(`[startMonitoring] States set. isMonitoring (state): ${isMonitoringRef.current}, isMonitoringRef.current: ${isMonitoringRef.current}, noiseLevel state: Initializing`);


    try {
      console.log('[startMonitoring] Requesting microphone access.');
      const constraints = {
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        },
        video: false
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;
      console.log('[startMonitoring] Microphone access granted.');

      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        console.log('[startMonitoring] Creating new AudioContext.');
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      if (audioContextRef.current.state === 'suspended') {
        console.log('[startMonitoring] AudioContext is suspended. Attempting to resume.');
        await audioContextRef.current.resume();
      }
      console.log(`[startMonitoring] AudioContext state after resume attempt: ${audioContextRef.current.state}`);

      if (audioContextRef.current.state === 'running') {
        sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256; 
        analyserRef.current.smoothingTimeConstant = 0.3; 

        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);

        sourceRef.current.connect(analyserRef.current);
        console.log('[startMonitoring] Audio pipeline connected.');
        
        console.log(`[startMonitoring] About to schedule processAudio. Current isMonitoringRef.current: ${isMonitoringRef.current}, noiseLevel state: ${noiseLevel}`);
        animationFrameIdRef.current = requestAnimationFrame(processAudio);
        console.log('[startMonitoring] Started audio processing.');
      } else {
        console.error(`[startMonitoring] AudioContext is not running after attempt to resume. State: ${audioContextRef.current.state}. Stopping.`);
        setError("Could not start audio processing. AudioContext not running. Please check browser permissions or try restarting the browser.");
        stopLogic(); 
        setIsMonitoring(false);
        isMonitoringRef.current = false;
        setNoiseLevel('Error');
      }

    } catch (err) {
      console.error("[startMonitoring] Error accessing microphone or setting up audio:", err, (err instanceof Error ? err.stack : ''));
      let errorMessage = "Microphone access denied or an unknown error occurred.";
      if (err instanceof Error) {
        if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          errorMessage = "No microphone found. Please connect a microphone.";
        } else if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          errorMessage = "Microphone permission denied. Please allow access in your browser settings.";
        } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
            errorMessage = "Microphone is already in use or cannot be accessed. Please check other tabs/applications.";
        } else {
            errorMessage = `Microphone error: ${err.message}`;
        }
      }
      setError(errorMessage);
      stopLogic(); 
      setIsMonitoring(false);
      isMonitoringRef.current = false;
      setNoiseLevel('Error');
    }
  }, [loadSettingsFromLocalStorage, processAudio, stopLogic, noiseLevel]); 

  const stopMonitoring = useCallback(() => {
    console.log('[stopMonitoring] Attempting to stop monitoring.');
    stopLogic();
    setIsMonitoring(false); 
    isMonitoringRef.current = false; 
    setNoiseLevel('Idle');
    setError(null);
    setCurrentVolume(null);
    setAlarmMessage(null);
  }, [stopLogic]);

  useEffect(() => {
    return () => {
      console.log('[useNoiseLevel Unmount/Cleanup] Running cleanup for the entire hook.');
      stopLogic(); 
      if (alarmAudioRef.current) {
        console.log('[useNoiseLevel Unmount/Cleanup] Cleaning up alarmAudioRef.');
        alarmAudioRef.current.pause();
        if (alarmAudioRef.current.src && alarmAudioRef.current.src !== '') {
            alarmAudioRef.current.removeAttribute('src'); 
            alarmAudioRef.current.load(); 
        }
        alarmAudioRef.current.oncanplaythrough = null;
        alarmAudioRef.current.onloadeddata = null;
        alarmAudioRef.current.onended = null;
        alarmAudioRef.current.onerror = null;
        alarmAudioRef.current.loop = false;
        alarmAudioRef.current = null;
      }
      isAlarmCurrentlyPlayingRef.current = false;
      isPlayPendingRef.current = false;
    };
  }, [stopLogic]); 

  return {
    noiseLevel,
    currentVolume,
    error,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    alarmMessage,
    playAlarmSound, 
    stopAlarmSound  
  };
}

