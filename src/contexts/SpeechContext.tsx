import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

interface SpeechContextType {
  speak: (text: string) => void;
  cancel: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  isVoiceEnabled: boolean;
  setIsVoiceEnabled: (enabled: boolean) => void;
  toggleVoiceAssistance: () => void;
  handleSpeak: (text: string) => void;
}

const SpeechContext = createContext<SpeechContextType | undefined>(undefined);

interface SpeechProviderProps {
  children: ReactNode;
}

export const SpeechProvider: React.FC<SpeechProviderProps> = ({ children }) => {
  const { speak, cancel, isSpeaking, isPaused, isSupported } = useSpeechSynthesis({
    lang: 'es-ES',
    rate: 1,
    pitch: 1,
    volume: 1
  });

  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);

  const toggleVoiceAssistance = () => {
    if (isSpeaking) {
      cancel();
    }
    const newState = !isVoiceEnabled;
    setIsVoiceEnabled(newState);
    if (newState) {
      speak('Asistencia de voz activada. Pasa el cursor sobre los elementos para escuchar su descripción.');
    } else {
      speak('Asistencia de voz desactivada.');
    }
  };

  const handleSpeak = (text: string) => {
    if (isVoiceEnabled && text) {
      speak(text);
    }
  };

  return (
    <SpeechContext.Provider
      value={{
        speak,
        cancel,
        isSpeaking,
        isPaused,
        isSupported,
        isVoiceEnabled,
        setIsVoiceEnabled,
        toggleVoiceAssistance,
        handleSpeak,
      }}
    >
      {children}
    </SpeechContext.Provider>
  );
};

export const useSpeech = (): SpeechContextType => {
  const context = useContext(SpeechContext);
  if (!context) {
    throw new Error('useSpeech must be used within a SpeechProvider');
  }
  return context;
};
