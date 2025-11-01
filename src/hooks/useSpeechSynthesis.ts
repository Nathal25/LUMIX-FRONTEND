import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Configuration options for the speech synthesis hook.
 * 
 * @interface UseSpeechSynthesisOptions
 * @property {string} [lang] - BCP 47 language tag (e.g., 'es-ES', 'en-US'). Defaults to 'es-ES'.
 * @property {number} [pitch] - Voice pitch, range 0-2. Defaults to 1.
 * @property {number} [rate] - Speech rate, range 0.1-10. Defaults to 1.
 * @property {number} [volume] - Speech volume, range 0-1. Defaults to 1.
 */
interface UseSpeechSynthesisOptions {
  lang?: string;
  pitch?: number;
  rate?: number;
  volume?: number;
}

/**
 * Return type for the useSpeechSynthesis hook.
 * 
 * @interface UseSpeechSynthesisReturn
 * @property {function(string): void} speak - Speaks the provided text using configured voice settings.
 * @property {function(): void} pause - Pauses the current speech synthesis.
 * @property {function(): void} resume - Resumes paused speech synthesis.
 * @property {function(): void} cancel - Cancels and stops all speech synthesis.
 * @property {boolean} isSpeaking - Indicates if speech synthesis is currently active.
 * @property {boolean} isPaused - Indicates if speech synthesis is currently paused.
 * @property {boolean} isSupported - Indicates if the browser supports Web Speech API.
 * @property {SpeechSynthesisVoice[]} voices - Array of available speech synthesis voices.
 * @property {function(SpeechSynthesisVoice): void} setVoice - Sets the voice to use for speech synthesis.
 * @property {function(string): void} setLang - Updates the language for speech synthesis.
 * @property {function(number): void} setRate - Updates the speech rate (clamped between 0.1 and 10).
 * @property {function(number): void} setPitch - Updates the voice pitch (clamped between 0 and 2).
 * @property {function(number): void} setVolume - Updates the speech volume (clamped between 0 and 1).
 */
interface UseSpeechSynthesisReturn {
  speak: (text: string) => void;
  pause: () => void;
  resume: () => void;
  cancel: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  setVoice: (voice: SpeechSynthesisVoice) => void;
  setLang: (lang: string) => void;
  setRate: (rate: number) => void;
  setPitch: (pitch: number) => void;
  setVolume: (volume: number) => void;
}

/**
 * Custom React hook for text-to-speech functionality using the Web Speech API.
 * Provides full control over speech synthesis including voice selection, rate, pitch, and volume.
 * Automatically handles voice loading and selection, preferring Spanish voices by default.
 * 
 * @param {UseSpeechSynthesisOptions} [options={}] - Configuration options for speech synthesis
 * @returns {UseSpeechSynthesisReturn} Object containing speech control functions and state
 * 
 * @example
 * ```tsx
 * const { speak, pause, resume, cancel, isSpeaking, isSupported } = useSpeechSynthesis({
 *   lang: 'es-ES',
 *   rate: 1,
 *   pitch: 1,
 *   volume: 1
 * });
 * 
 * // Speak text
 * speak('Hello, world!');
 * 
 * // Control playback
 * pause();
 * resume();
 * cancel();
 * ```
 */
export const useSpeechSynthesis = (
  options: UseSpeechSynthesisOptions = {}
): UseSpeechSynthesisReturn => {
  const {
    lang = 'es-ES',
    pitch = 1,
    rate = 1,
    volume = 1,
  } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  
  const [currentLang, setCurrentLang] = useState(lang);
  const [currentRate, setCurrentRate] = useState(rate);
  const [currentPitch, setCurrentPitch] = useState(pitch);
  const [currentVolume, setCurrentVolume] = useState(volume);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  /**
   * Checks if the browser supports the Web Speech API (SpeechSynthesis).
   * @constant {boolean}
   */
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  /**
   * Effect hook to load and initialize available speech synthesis voices.
   * Automatically selects a Spanish voice if available.
   * Handles the voiceschanged event for browsers that load voices asynchronously.
   * 
   * @effect
   */
  useEffect(() => {
    if (!isSupported) return;

    /**
     * Loads available voices from the browser and automatically selects
     * a Spanish voice if available and no voice is currently selected.
     * 
     * @function loadVoices
     * @inner
     */
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      // Automatically select a Spanish voice if available
      const spanishVoice = availableVoices.find(
        (voice) => voice.lang.startsWith('es')
      );
      if (spanishVoice && !selectedVoice) {
        setSelectedVoice(spanishVoice);
      }
    };

    loadVoices();

    // Voices may not be available immediately, so listen for voiceschanged event
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [isSupported, selectedVoice]);

  /**
   * Speaks the provided text using the Web Speech API with current voice settings.
   * Cancels any ongoing speech before starting new synthesis.
   * Updates isSpeaking and isPaused states based on synthesis lifecycle events.
   * 
   * @function speak
   * @param {string} text - The text to be spoken
   * @returns {void}
   * 
   * @example
   * speak('Hello, this is a test message');
   */
  const speak = useCallback(
    (text: string) => {
      if (!isSupported || !text) return;

      // Cancel any ongoing speech synthesis
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = currentLang;
      utterance.pitch = currentPitch;
      utterance.rate = currentRate;
      utterance.volume = currentVolume;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utterance.onerror = (event) => {
        console.error('Error en Speech Synthesis:', event);
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utterance.onpause = () => {
        setIsPaused(true);
      };

      utterance.onresume = () => {
        setIsPaused(false);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, currentLang, currentPitch, currentRate, currentVolume, selectedVoice]
  );

  /**
   * Pauses the currently active speech synthesis.
   * Updates the isPaused state to true.
   * 
   * @function pause
   * @returns {void}
   */
  const pause = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [isSupported]);

  /**
   * Resumes paused speech synthesis.
   * Updates the isPaused state to false.
   * 
   * @function resume
   * @returns {void}
   */
  const resume = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, [isSupported]);

  /**
   * Cancels and stops all speech synthesis.
   * Resets isSpeaking and isPaused states to false.
   * 
   * @function cancel
   * @returns {void}
   */
  const cancel = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, [isSupported]);

  /**
   * Sets the voice to be used for speech synthesis.
   * 
   * @function setVoice
   * @param {SpeechSynthesisVoice} voice - The voice object to use
   * @returns {void}
   */
  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setSelectedVoice(voice);
  }, []);

  /**
   * Updates the language for speech synthesis.
   * 
   * @function setLang
   * @param {string} newLang - BCP 47 language tag (e.g., 'es-ES', 'en-US')
   * @returns {void}
   */
  const setLang = useCallback((newLang: string) => {
    setCurrentLang(newLang);
  }, []);

  /**
   * Updates the speech rate (speed).
   * Value is automatically clamped between 0.1 and 10.
   * 
   * @function setRate
   * @param {number} newRate - Speech rate (0.1 = very slow, 10 = very fast)
   * @returns {void}
   */
  const setRate = useCallback((newRate: number) => {
    setCurrentRate(Math.max(0.1, Math.min(10, newRate)));
  }, []);

  /**
   * Updates the voice pitch.
   * Value is automatically clamped between 0 and 2.
   * 
   * @function setPitch
   * @param {number} newPitch - Voice pitch (0 = lowest, 2 = highest)
   * @returns {void}
   */
  const setPitch = useCallback((newPitch: number) => {
    setCurrentPitch(Math.max(0, Math.min(2, newPitch)));
  }, []);

  /**
   * Updates the speech volume.
   * Value is automatically clamped between 0 and 1.
   * 
   * @function setVolume
   * @param {number} newVolume - Volume level (0 = muted, 1 = maximum)
   * @returns {void}
   */
  const setVolume = useCallback((newVolume: number) => {
    setCurrentVolume(Math.max(0, Math.min(1, newVolume)));
  }, []);

  /**
   * Cleanup effect that cancels all speech synthesis when the component unmounts.
   * Ensures no speech continues playing after the component is destroyed.
   * 
   * @effect
   */
  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  return {
    speak,
    pause,
    resume,
    cancel,
    isSpeaking,
    isPaused,
    isSupported,
    voices,
    setVoice,
    setLang,
    setRate,
    setPitch,
    setVolume,
  };
};
